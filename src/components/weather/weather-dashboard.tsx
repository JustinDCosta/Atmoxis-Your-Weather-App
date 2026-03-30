"use client";

import { AlertCircle, MapPin } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildDaylightSummary,
  buildFeelsLikeSummary,
  buildRainSummary,
  buildWindSummary,
  fetchWeatherReport,
  reverseGeocodeLocation,
  searchLocations,
} from "@/lib/weather";
import type { GeocodedLocation, WeatherReport } from "@/lib/weather";

import { AirQualityCard } from "@/components/weather/air-quality-card";
import { AtmosphericBackdrop } from "@/components/weather/atmospheric-backdrop";
import { CurrentWeatherCard } from "@/components/weather/current-weather-card";
import { DailyForecast } from "@/components/weather/daily-forecast";
import { DashboardSkeleton } from "@/components/weather/dashboard-skeleton";
import { HourlyForecast } from "@/components/weather/hourly-forecast";
import { SearchInput } from "@/components/weather/search-input";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
  const suppressQuerySearchRef = useRef(false);

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
    if (suppressQuerySearchRef.current) {
      suppressQuerySearchRef.current = false;
      return;
    }

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
      suppressQuerySearchRef.current = true;
      setQuery(formatLocation(location));
      setSuggestions([]);
      await loadLocation(location);
    },
    [loadLocation],
  );

  const submitSearch = useCallback(async () => {
    const normalized = query.trim();

    if (normalized.length < 2) {
      setError("Enter at least two characters to search for a city.");
      return;
    }

    let candidate = suggestions[0];

    if (!candidate) {
      setIsSearching(true);
      try {
        const fallbackResults = await searchLocations(normalized, { count: 1 });
        candidate = fallbackResults[0];
      } catch {
        setError("Search is temporarily unavailable.");
      } finally {
        setIsSearching(false);
      }
    }

    if (!candidate) {
      setError("No matching city found. Please refine your search.");
      return;
    }

    await selectLocation(candidate);
  }, [query, selectLocation, suggestions]);

  return (
    <div className="relative min-h-screen overflow-x-hidden py-5 md:py-8">
      <AtmosphericBackdrop
        theme={report?.current.theme ?? "cloudy"}
        isDay={report?.current.isDay ?? true}
      />

      <div className="relative mx-auto flex w-full max-w-[1060px] min-w-0 flex-col gap-4 px-4 md:gap-5 md:px-6">
        <header className="glass rounded-[var(--radius-xl)] p-4 md:p-5">
          <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-sm uppercase tracking-[0.2em] text-ink-muted">Atmoxis</p>
              <h1 className="display-type mt-1 text-2xl font-semibold text-ink md:text-3xl">
                Minimal weather, instantly readable
              </h1>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <p className="inline-flex min-w-0 max-w-full items-center gap-1.5 truncate text-sm text-ink-muted md:max-w-[320px]">
                <MapPin size={14} className="shrink-0" />
                <span className="truncate">
                  {report ? formatLocation(report.location) : "Detecting location"}
                </span>
              </p>
              <ThemeToggle />
            </div>
          </div>

          <SearchInput
            value={query}
            onValueChange={(nextValue) => {
              setQuery(nextValue);
              setError(null);
            }}
            onSubmit={submitSearch}
            onUseLocation={() => void requestCurrentLocation()}
            suggestions={suggestions}
            onSelectSuggestion={(location) => void selectLocation(location)}
            recentLocations={recentLocations}
            onSelectRecent={(location) => void selectLocation(location)}
            isSearching={isSearching}
            emptySuggestionLabel={emptySuggestionLabel}
          />

          <p className="mt-2 text-xs text-ink-muted">
            Geolocation status: {geoState}
            {isLoading && report ? " • refreshing weather" : ""}
          </p>
        </header>

        {isLoading && !report ? <DashboardSkeleton /> : null}

        {error ? (
          <GlassPanel
            as="section"
            className="border-red-400/40 bg-red-500/15"
            role="alert"
            aria-live="polite"
          >
            <p className="flex items-start gap-2 text-sm text-danger">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </p>
          </GlassPanel>
        ) : null}

        {report ? (
          <div className="grid gap-4 md:gap-5">
            <CurrentWeatherCard
              report={report}
              isSaved={isSaved}
              onToggleSave={() => toggleSavedLocation(report.location)}
            />

            <HourlyForecast hourly={report.hourly} timezone={report.location.timezone} />

            <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
              <DailyForecast daily={report.daily} timezone={report.location.timezone} />
              <div className="grid gap-4">
                <GlassPanel as="aside">
                  <SectionHeading
                    title="Weather Insights"
                    subtitle="Quick plain-language summary"
                  />
                  <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                    <li className="rounded-xl border border-line/35 bg-card-elevated/55 px-3 py-2.5">
                      {buildFeelsLikeSummary(report)}
                    </li>
                    <li className="rounded-xl border border-line/35 bg-card-elevated/55 px-3 py-2.5">
                      {buildWindSummary(report)}
                    </li>
                    <li className="rounded-xl border border-line/35 bg-card-elevated/55 px-3 py-2.5">
                      {buildRainSummary(report)}
                    </li>
                    <li className="rounded-xl border border-line/35 bg-card-elevated/55 px-3 py-2.5">
                      {buildDaylightSummary(report)}
                    </li>
                  </ul>
                </GlassPanel>

                <AirQualityCard airQuality={report.airQuality} />
              </div>
            </div>
          </div>
        ) : null}

        {report && savedLocations.length > 0 ? (
          <GlassPanel as="section">
            <SectionHeading title="Saved Locations" subtitle="Quick switch" />
            <div className="mt-3 flex flex-wrap gap-2">
              {savedLocations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => void selectLocation(location)}
                  className="rounded-full border border-line/40 bg-card-elevated/55 px-3 py-1.5 text-sm text-ink transition hover:bg-card-elevated/75"
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
