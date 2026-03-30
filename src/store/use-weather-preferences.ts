"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { GeocodedLocation } from "@/lib/weather";
import type { TemperatureUnit } from "@/lib/weather";

export type DashboardWidgetId =
  | "hourly"
  | "daily"
  | "insights"
  | "air-quality"
  | "saved";

const DEFAULT_WIDGET_ORDER: DashboardWidgetId[] = [
  "hourly",
  "daily",
  "insights",
  "air-quality",
  "saved",
];

type WeatherPreferencesState = {
  activeLocation: GeocodedLocation | null;
  recentLocations: GeocodedLocation[];
  savedLocations: GeocodedLocation[];
  temperatureUnit: TemperatureUnit;
  widgetOrder: DashboardWidgetId[];
  setActiveLocation: (location: GeocodedLocation) => void;
  addRecentLocation: (location: GeocodedLocation) => void;
  toggleSavedLocation: (location: GeocodedLocation) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setWidgetOrder: (order: DashboardWidgetId[]) => void;
};

const MAX_RECENT = 6;
const MAX_SAVED = 8;

function sameLocation(a: GeocodedLocation, b: GeocodedLocation): boolean {
  return (
    a.name.toLowerCase() === b.name.toLowerCase() &&
    a.country.toLowerCase() === b.country.toLowerCase() &&
    Math.abs(a.latitude - b.latitude) < 0.0001 &&
    Math.abs(a.longitude - b.longitude) < 0.0001
  );
}

function dedupeLocations(
  list: GeocodedLocation[],
  next: GeocodedLocation,
  limit: number,
): GeocodedLocation[] {
  const withoutDuplicate = list.filter((item) => !sameLocation(item, next));
  return [next, ...withoutDuplicate].slice(0, limit);
}

function sanitizeWidgetOrder(order: DashboardWidgetId[]): DashboardWidgetId[] {
  const filtered = order.filter((item, index) => order.indexOf(item) === index);
  const known = DEFAULT_WIDGET_ORDER.filter((item) => filtered.includes(item));
  const missing = DEFAULT_WIDGET_ORDER.filter((item) => !known.includes(item));

  return [...known, ...missing];
}

export const useWeatherPreferences = create<WeatherPreferencesState>()(
  persist(
    (set, get) => ({
      activeLocation: null,
      recentLocations: [],
      savedLocations: [],
      temperatureUnit: "c",
      widgetOrder: DEFAULT_WIDGET_ORDER,
      setActiveLocation: (location) => set({ activeLocation: location }),
      addRecentLocation: (location) =>
        set({
          recentLocations: dedupeLocations(
            get().recentLocations,
            location,
            MAX_RECENT,
          ),
        }),
      toggleSavedLocation: (location) => {
        const alreadySaved = get().savedLocations.some((item) =>
          sameLocation(item, location),
        );

        if (alreadySaved) {
          set({
            savedLocations: get().savedLocations.filter(
              (item) => !sameLocation(item, location),
            ),
          });
          return;
        }

        set({
          savedLocations: dedupeLocations(
            get().savedLocations,
            location,
            MAX_SAVED,
          ),
        });
      },
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
      setWidgetOrder: (order) =>
        set({
          widgetOrder: sanitizeWidgetOrder(order),
        }),
    }),
    {
      name: "atmoxis-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeLocation: state.activeLocation,
        recentLocations: state.recentLocations,
        savedLocations: state.savedLocations,
        temperatureUnit: state.temperatureUnit,
        widgetOrder: state.widgetOrder,
      }),
    },
  ),
);
