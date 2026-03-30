"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { GeocodedLocation } from "@/lib/weather";

type WeatherPreferencesState = {
  activeLocation: GeocodedLocation | null;
  recentLocations: GeocodedLocation[];
  savedLocations: GeocodedLocation[];
  setActiveLocation: (location: GeocodedLocation) => void;
  addRecentLocation: (location: GeocodedLocation) => void;
  toggleSavedLocation: (location: GeocodedLocation) => void;
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

export const useWeatherPreferences = create<WeatherPreferencesState>()(
  persist(
    (set, get) => ({
      activeLocation: null,
      recentLocations: [],
      savedLocations: [],
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
    }),
    {
      name: "atmoxis-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeLocation: state.activeLocation,
        recentLocations: state.recentLocations,
        savedLocations: state.savedLocations,
      }),
    },
  ),
);
