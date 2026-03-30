"use client";

import { AlertCircle, GripVertical, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import {
  type DragEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  buildDaylightSummary,
  buildFeelsLikeSummary,
  buildRainSummary,
  buildWindSummary,
  fetchApproximateLocation,
  fetchWeatherReport,
  reverseGeocodeLocation,
  searchLocations,
} from "@/lib/weather";
import type { GeocodedLocation, WeatherReport } from "@/lib/weather";
import { cn } from "@/lib/utils";

import { AirQualityCard } from "@/components/weather/air-quality-card";
import { AtmosphericBackdrop } from "@/components/weather/atmospheric-backdrop";
import { CurrentWeatherCard } from "@/components/weather/current-weather-card";
import { DailyForecast } from "@/components/weather/daily-forecast";
import { DashboardSkeleton } from "@/components/weather/dashboard-skeleton";
import { HourlyForecast } from "@/components/weather/hourly-forecast";
import { SearchInput } from "@/components/weather/search-input";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { TemperatureToggle } from "@/components/ui/temperature-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  type DashboardWidgetId,
  useWeatherPreferences,
} from "@/store/use-weather-preferences";

type GeolocationState = "idle" | "active" | "granted" | "denied" | "unavailable";

const FALLBACK_LOCATION: GeocodedLocation = {
  id: "fallback-le-kremlin-bicetre",
  name: "Le Kremlin-Bicetre",
  region: "Ile-de-France",
  country: "France",
  latitude: 48.8138,
  longitude: 2.3628,
  timezone: "Europe/Paris",
};

const BASE_WIDGET_ORDER: DashboardWidgetId[] = [
  "hourly",
  "daily",
  "insights",
  "air-quality",
  "saved",
];

function formatLocation(location: GeocodedLocation): string {
  const region = location.region ? `${location.region}, ` : "";
  return `${location.name}, ${region}${location.country}`;
}

function buildSearchAttempts(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const commaChunks = trimmed
    .split(",")
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);

  const candidates = [trimmed];

  if (commaChunks.length >= 1) {
    candidates.push(commaChunks[0]);
  }

  if (commaChunks.length >= 2) {
    candidates.push(`${commaChunks[0]}, ${commaChunks[1]}`);
  }

  return Array.from(new Set(candidates.filter((entry) => entry.length >= 2)));
}

function reorderWidgets(
  items: DashboardWidgetId[],
  draggedId: DashboardWidgetId,
  targetId: DashboardWidgetId,
): DashboardWidgetId[] {
  const sourceIndex = items.indexOf(draggedId);
  const targetIndex = items.indexOf(targetId);

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function WeatherDashboard() {
  const {
    activeLocation,
    recentLocations,
    savedLocations,
    temperatureUnit,
    widgetOrder,
    setActiveLocation,
    addRecentLocation,
    toggleSavedLocation,
    setTemperatureUnit,
    setWidgetOrder,
  } = useWeatherPreferences();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geoState, setGeoState] = useState<GeolocationState>("idle");
  const [locationHint, setLocationHint] = useState<string>(
    "Allow location access for precise weather.",
  );
  const [emptySuggestionLabel, setEmptySuggestionLabel] = useState<string>();
  const [draggingWidgetId, setDraggingWidgetId] =
    useState<DashboardWidgetId | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] =
    useState<DashboardWidgetId | null>(null);

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

  const resolveFallbackLocation = useCallback(async () => {
    const approximateLocation = await fetchApproximateLocation();
    return approximateLocation ?? FALLBACK_LOCATION;
  }, []);

  const requestCurrentLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("unavailable");
      setLocationHint("Device location is unavailable. Showing an approximate location.");
      const fallback = await resolveFallbackLocation();
      setQuery(formatLocation(fallback));
      await loadLocation(fallback);
      return;
    }

    setGeoState("active");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setGeoState("granted");
        setLocationHint("Using your current location.");

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

          setQuery(formatLocation(nextLocation));
          await loadLocation(nextLocation);
        } catch {
          const fallback = await resolveFallbackLocation();
          setQuery(formatLocation(fallback));
          await loadLocation(fallback);
        }
      },
      async () => {
        setGeoState("denied");
        setLocationHint(
          "Location permission is off. Showing an approximate location instead.",
        );
        const fallback = await resolveFallbackLocation();
        setQuery(formatLocation(fallback));
        await loadLocation(fallback);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 300000,
      },
    );
  }, [loadLocation, resolveFallbackLocation]);

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

    const normalizedQuery = query.trim();

    if (
      normalizedQuery.includes(",") &&
      normalizedQuery.split(",").filter((segment) => segment.trim().length > 0).length >= 2
    ) {
      setSuggestions([]);
      setEmptySuggestionLabel(undefined);
      return;
    }

    if (normalizedQuery.length < 2) {
      setSuggestions([]);
      setEmptySuggestionLabel(undefined);
      return;
    }

    const controller = new AbortController();
    const debounce = setTimeout(async () => {
      setIsSearching(true);

      try {
        const results = await searchLocations(normalizedQuery, {
          signal: controller.signal,
          count: 8,
        });

        setSuggestions(results);
        setEmptySuggestionLabel(
          results.length === 0
            ? "No instant match yet. Press Search for an exact lookup."
            : undefined,
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
    }, 260);

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
      setLocationHint("Location updated.");
      await loadLocation(location);
    },
    [loadLocation],
  );

  const submitSearch = useCallback(async () => {
    const normalized = query.trim();

    if (normalized.length < 2) {
      setError("Type at least two characters to search for a city.");
      return;
    }

    let candidate = suggestions[0];

    const exactCandidate = suggestions.find(
      (location) => formatLocation(location).toLowerCase() === normalized.toLowerCase(),
    );

    if (exactCandidate) {
      candidate = exactCandidate;
    }

    if (!candidate) {
      setIsSearching(true);
      try {
        const attempts = buildSearchAttempts(normalized);

        for (const attempt of attempts) {
          const fallbackResults = await searchLocations(attempt, { count: 6 });
          if (fallbackResults.length > 0) {
            candidate = fallbackResults[0];
            break;
          }
        }
      } catch {
        setError("Search is temporarily unavailable.");
      } finally {
        setIsSearching(false);
      }
    }

    if (!candidate) {
      setEmptySuggestionLabel("No reliable match yet. Try city name only, like Dhaka.");
      setError("We could not find that place. Try a nearby city name.");
      return;
    }

    setEmptySuggestionLabel(undefined);
    await selectLocation(candidate);
  }, [query, selectLocation, suggestions]);

  const visibleWidgetIds = useMemo(() => {
    if (!report) return [] as DashboardWidgetId[];

    return BASE_WIDGET_ORDER.filter((widgetId) => {
      if (widgetId === "saved") {
        return savedLocations.length > 0;
      }

      return true;
    });
  }, [report, savedLocations.length]);

  const orderedWidgetIds = useMemo(() => {
    const preferred = widgetOrder.filter((widgetId) =>
      visibleWidgetIds.includes(widgetId),
    );
    const missing = visibleWidgetIds.filter(
      (widgetId) => !preferred.includes(widgetId),
    );

    return [...preferred, ...missing];
  }, [visibleWidgetIds, widgetOrder]);

  const widgetContent = useMemo<Record<DashboardWidgetId, ReactNode>>(() => {
    return {
      hourly: report ? (
        <HourlyForecast
          hourly={report.hourly}
          timezone={report.location.timezone}
          temperatureUnit={temperatureUnit}
        />
      ) : null,
      daily: report ? (
        <DailyForecast
          daily={report.daily}
          timezone={report.location.timezone}
          temperatureUnit={temperatureUnit}
        />
      ) : null,
      insights: report ? (
        <GlassPanel as="aside">
          <SectionHeading
            title="Weather Insights"
            subtitle="A short human summary"
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
      ) : null,
      "air-quality": report ? <AirQualityCard airQuality={report.airQuality} /> : null,
      saved:
        report && savedLocations.length > 0 ? (
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
        ) : null,
    };
  }, [report, savedLocations, selectLocation, temperatureUnit]);

  const handleWidgetDrop = useCallback(
    (targetWidgetId: DashboardWidgetId) => {
      if (!draggingWidgetId) return;

      const nextOrder = reorderWidgets(
        orderedWidgetIds,
        draggingWidgetId,
        targetWidgetId,
      );

      setWidgetOrder(nextOrder);
      setDraggingWidgetId(null);
      setDragOverWidgetId(null);
    },
    [draggingWidgetId, orderedWidgetIds, setWidgetOrder],
  );

  const locationText = report ? formatLocation(report.location) : "Detecting location";

  return (
    <div className="relative min-h-screen overflow-x-hidden py-5 md:py-8">
      <AtmosphericBackdrop
        theme={report?.current.theme ?? "cloudy"}
        isDay={report?.current.isDay ?? true}
      />

      <div className="relative mx-auto flex w-full max-w-[1060px] min-w-0 flex-col gap-4 px-4 md:gap-5 md:px-6">
        <header className="glass rounded-[var(--radius-xl)] p-4 md:p-5">
          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-sm uppercase tracking-[0.2em] text-ink-muted">Atmoxis</p>
              <h1 className="display-type mt-1 text-2xl font-semibold text-ink md:text-3xl">
                The Minimalist Weather App
              </h1>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <p className="inline-flex min-w-0 max-w-full items-center gap-1.5 truncate text-sm text-ink-muted md:max-w-[320px]">
                <MapPin size={14} className="shrink-0" />
                <span className="truncate">{locationText}</span>
              </p>
              <TemperatureToggle
                unit={temperatureUnit}
                onChange={setTemperatureUnit}
              />
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
            {locationHint} {isLoading && report ? "Refreshing weather..." : ""}
            {!isLoading && !report ? ` Location status: ${geoState}.` : ""}
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
          <div className="grid grid-cols-1 gap-4 md:gap-5">
            <CurrentWeatherCard
              report={report}
              isSaved={isSaved}
              temperatureUnit={temperatureUnit}
              onToggleSave={() => toggleSavedLocation(report.location)}
            />

            <div className="rounded-xl border border-line/35 bg-card-elevated/45 px-3 py-2 text-xs text-ink-muted">
              Drag cards to arrange your dashboard in the order you like.
            </div>

            {orderedWidgetIds.map((widgetId, index) => {
              const content = widgetContent[widgetId];
              if (!content) return null;

              return (
                <motion.div
                  key={widgetId}
                  draggable
                  initial={{ opacity: 0, y: 12, scale: 0.992 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.34, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  onDragStartCapture={(event: DragEvent<HTMLDivElement>) => {
                    setDraggingWidgetId(widgetId);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOverCapture={(event: DragEvent<HTMLDivElement>) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setDragOverWidgetId(widgetId);
                  }}
                  onDropCapture={() => handleWidgetDrop(widgetId)}
                  onDragEndCapture={() => {
                    setDraggingWidgetId(null);
                    setDragOverWidgetId(null);
                  }}
                  className={cn(
                    "rounded-[var(--radius-xl)]",
                    dragOverWidgetId === widgetId &&
                      draggingWidgetId !== widgetId &&
                      "ring-2 ring-accent/35",
                  )}
                >
                  <div className="mb-1 flex justify-end">
                    <span className="inline-flex items-center gap-1 rounded-full border border-line/40 bg-card-elevated/60 px-2 py-1 text-[0.68rem] uppercase tracking-[0.12em] text-ink-muted">
                      <GripVertical size={12} /> Drag
                    </span>
                  </div>
                  {content}
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
