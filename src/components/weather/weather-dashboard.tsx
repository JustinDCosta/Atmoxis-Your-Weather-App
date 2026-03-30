"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, MapPin, Navigation } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildDaylightSummary,
  buildFeelsLikeSummary,
  buildWindSummary,
  fetchWeatherReport,
  reverseGeocodeLocation,
  searchLocations,
} from "@/lib/weather";
import type { GeocodedLocation, WeatherReport } from "@/lib/weather";

import { AtmosphericBackdrop } from "@/components/weather/atmospheric-backdrop";
import { CurrentWeatherCard } from "@/components/weather/current-weather-card";
import { DailyForecast } from "@/components/weather/daily-forecast";
import { DashboardSkeleton } from "@/components/weather/dashboard-skeleton";
import { HourlyForecast } from "@/components/weather/hourly-forecast";
import { SearchInput } from "@/components/weather/search-input";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useWeatherPreferences } from "@/store/use-weather-preferences";

type GeolocationState = "idle" | "active" | "granted" | "denied" | "unavailable";

const FALLBACK_LOCATION: GeocodedLocation = {
  id: "fallback-singapore",
  name: "Singapore",
  country: "Singapore",
  latitude: 1.2897,
  longitude: 103.8501,
  timezone: "Asia/Singapore",
};

function formatLocation(location: GeocodedLocation): string {
  const region = location.region ? `${location.region}, ` : "";
  return `${location.name}, ${region}${location.country}`;
}

export function WeatherDashboard() {
  const {
    activeLocation,
    recentLocations,
    savedLocations,
    setActiveLocation,
    addRecentLocation,
    toggleSavedLocation,
  } = useWeatherPreferences();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geoState, setGeoState] = useState<GeolocationState>("idle");
  const [emptySuggestionLabel, setEmptySuggestionLabel] = useState<string>();

  const requestRef = useRef<AbortController | null>(null);
  const hasBooted = useRef(false);

  const isSaved = useMemo(() => {
    if (!report) return false;

    return savedLocations.some(
      (location) =>
        Math.abs(location.latitude - report.location.latitude) < 0.0001 &&
        Math.abs(location.longitude - report.location.longitude) < 0.0001,
    );
  }, [report, savedLocations]);

  const loadLocation = useCallback(
    async (location: GeocodedLocation) => {
      requestRef.current?.abort();

      const controller = new AbortController();
      requestRef.current = controller;
      setIsLoading(true);
      setError(null);

      try {
        const nextReport = await fetchWeatherReport({
          location,
          signal: controller.signal,
        });

        setReport(nextReport);
        setActiveLocation(nextReport.location);
        addRecentLocation(nextReport.location);
      } catch (caught) {
        if (controller.signal.aborted) return;

        const message =
          caught instanceof Error ? caught.message : "Failed to load weather data.";

        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [addRecentLocation, setActiveLocation],
  );

  const requestCurrentLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("unavailable");
      setError("Geolocation is unavailable in this browser. Showing fallback city.");
      await loadLocation(activeLocation ?? FALLBACK_LOCATION);
      return;
    }

    setGeoState("active");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setGeoState("granted");

        try {
          const reverse = await reverseGeocodeLocation(
            coords.latitude,
            coords.longitude,
          );

          const nextLocation =
            reverse ?? {
              id: "current-device-location",
              name: "Current location",
              country: "Your area",
              latitude: coords.latitude,
              longitude: coords.longitude,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            };

          await loadLocation(nextLocation);
        } catch {
          await loadLocation({
            ...FALLBACK_LOCATION,
            latitude: coords.latitude,
            longitude: coords.longitude,
            name: "Current location",
          });
        }
      },
      async () => {
        setGeoState("denied");
        setError("Location permission denied. Showing fallback city.");
        await loadLocation(activeLocation ?? FALLBACK_LOCATION);
      },
      {
        enableHighAccuracy: false,
        timeout: 9000,
        maximumAge: 600000,
      },
    );
  }, [activeLocation, loadLocation]);

  useEffect(() => {
    if (hasBooted.current) return;
    hasBooted.current = true;

    if (activeLocation) {
      void loadLocation(activeLocation);
      setQuery(formatLocation(activeLocation));
      return;
    }

    void requestCurrentLocation();
  }, [activeLocation, loadLocation, requestCurrentLocation]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setEmptySuggestionLabel(undefined);
      return;
    }

    const controller = new AbortController();
    const debounce = setTimeout(async () => {
      setIsSearching(true);

      try {
        const results = await searchLocations(query, {
          signal: controller.signal,
          count: 8,
        });

        setSuggestions(results);
        setEmptySuggestionLabel(
          results.length === 0 ? "No city found for that search." : undefined,
        );
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setEmptySuggestionLabel("Search is temporarily unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 280);

    return () => {
      controller.abort();
      clearTimeout(debounce);
    };
  }, [query]);

  const selectLocation = useCallback(
    async (location: GeocodedLocation) => {
      setQuery(formatLocation(location));
      setSuggestions([]);
      await loadLocation(location);
    },
    [loadLocation],
  );

  const submitSearch = useCallback(async () => {
    if (suggestions.length > 0) {
      await selectLocation(suggestions[0]);
      return;
    }

    if (query.trim().length < 2) {
      setError("Enter at least two characters to search for a city.");
      return;
    }

    setError("No valid location selected. Choose a suggestion from the list.");
  }, [query, selectLocation, suggestions]);

  const showInsights = Boolean(report);

  return (
    <div className="relative min-h-screen overflow-x-clip px-4 py-5 md:px-8 md:py-8">
      <AtmosphericBackdrop
        theme={report?.current.theme ?? "cloudy"}
        isDay={report?.current.isDay ?? true}
      />
      <div className="bg-mesh" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-[1240px] flex-col gap-4 md:gap-5">
        <header className="glass rounded-[var(--radius-xl)] p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-ink-muted">Atmoxis</p>
              <h1 className="display-type mt-1 text-3xl font-semibold text-ink md:text-4xl">
                Weather intelligence with a calm, cinematic interface
              </h1>
            </div>

            <SearchInput
              value={query}
              onValueChange={setQuery}
              onSubmit={submitSearch}
              onUseLocation={() => void requestCurrentLocation()}
              suggestions={suggestions}
              onSelectSuggestion={(location) => void selectLocation(location)}
              recentLocations={recentLocations}
              onSelectRecent={(location) => void selectLocation(location)}
              isSearching={isSearching}
              emptySuggestionLabel={emptySuggestionLabel}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/7 px-2.5 py-1">
              <MapPin size={13} />
              {report ? formatLocation(report.location) : "Preparing location"}
            </p>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/7 px-2.5 py-1">
              <Navigation size={13} />
              Geolocation: {geoState}
            </p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {isLoading && !report ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <DashboardSkeleton />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {error ? (
          <GlassPanel as="section" className="border-red-300/35 bg-red-900/22">
            <p className="flex items-start gap-2 text-sm text-red-100">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </p>
          </GlassPanel>
        ) : null}

        {report ? (
          <div className="grid gap-4 md:gap-5">
            <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
              <CurrentWeatherCard
                report={report}
                isSaved={isSaved}
                onToggleSave={() => toggleSavedLocation(report.location)}
              />

              <GlassPanel as="aside" className="h-full">
                <SectionHeading
                  title="Quick Insights"
                  subtitle="Human-readable weather summary"
                />
                <div className="mt-4 space-y-2 text-sm text-ink-muted">
                  <p className="rounded-2xl border border-white/11 bg-white/6 px-3 py-2.5">
                    {buildFeelsLikeSummary(report)}
                  </p>
                  <p className="rounded-2xl border border-white/11 bg-white/6 px-3 py-2.5">
                    {buildWindSummary(report)}
                  </p>
                  <p className="rounded-2xl border border-white/11 bg-white/6 px-3 py-2.5">
                    {buildDaylightSummary(report)}
                  </p>
                </div>
              </GlassPanel>
            </div>

            <HourlyForecast
              hourly={report.hourly}
              timezone={report.location.timezone}
            />
            <DailyForecast daily={report.daily} timezone={report.location.timezone} />
          </div>
        ) : null}

        {showInsights && savedLocations.length > 0 ? (
          <GlassPanel as="section">
            <SectionHeading
              title="Saved Locations"
              subtitle="Quick switch"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {savedLocations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => void selectLocation(location)}
                  className="rounded-full border border-white/14 bg-white/8 px-3 py-1.5 text-sm text-ink transition hover:bg-white/15"
                >
                  {location.name}
                </button>
              ))}
            </div>
          </GlassPanel>
        ) : null}
      </div>
    </div>
  );
}
