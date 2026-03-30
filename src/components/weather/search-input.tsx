"use client";

import { Clock3, LoaderCircle, LocateFixed, Search } from "lucide-react";
import { useState } from "react";

import type { GeocodedLocation } from "@/lib/weather";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onUseLocation: () => void;
  suggestions: GeocodedLocation[];
  onSelectSuggestion: (location: GeocodedLocation) => void;
  recentLocations: GeocodedLocation[];
  onSelectRecent: (location: GeocodedLocation) => void;
  isSearching: boolean;
  emptySuggestionLabel?: string;
};

function locationLabel(location: GeocodedLocation): string {
  const region = location.region ? `${location.region}, ` : "";
  return `${location.name}, ${region}${location.country}`;
}

export function SearchInput({
  value,
  onValueChange,
  onSubmit,
  onUseLocation,
  suggestions,
  onSelectSuggestion,
  recentLocations,
  onSelectRecent,
  isSearching,
  emptySuggestionLabel,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const showRecent = value.trim().length < 2 && recentLocations.length > 0;
  const showSuggestions = value.trim().length >= 2;
  const showDropdown = isFocused && (showSuggestions || showRecent);

  return (
    <div
      className="relative flex w-full max-w-[620px] flex-col gap-2"
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        window.setTimeout(() => setIsFocused(false), 90);
      }}
    >
      <div className="glass flex h-12 items-center gap-2 rounded-full px-3.5">
        <Search size={16} className="text-ink-muted" />
        <input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Search by city"
          aria-label="Search city"
          className="h-full flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/80 md:text-[0.95rem]"
        />
        <button
          type="button"
          onClick={onUseLocation}
          className="inline-flex h-8 items-center justify-center rounded-full border border-white/14 bg-white/8 px-3 text-xs font-semibold text-ink transition hover:bg-white/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
        >
          <LocateFixed size={14} className="mr-1" />
          Locate me
        </button>
      </div>

      {showDropdown ? (
        <div className="glass absolute top-[calc(100%+0.3rem)] z-20 w-full rounded-3xl p-2.5">
          {showRecent ? (
            <div>
              <p className="px-2 pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Recent
              </p>
              <ul className="space-y-1">
                {recentLocations.map((location) => (
                  <li key={`${location.id}-recent`}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onSelectRecent(location)}
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-ink transition hover:bg-white/10"
                    >
                      <span>{locationLabel(location)}</span>
                      <Clock3 size={14} className="text-ink-muted" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {showSuggestions ? (
            <div className={cn(showRecent ? "mt-1 border-t border-white/12 pt-2" : "")}>
              <p className="px-2 pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Suggestions
              </p>
              {isSearching ? (
                <p className="flex items-center gap-2 px-3 py-2 text-sm text-ink-muted">
                  <LoaderCircle size={14} className="animate-spin" />
                  Searching...
                </p>
              ) : suggestions.length > 0 ? (
                <ul className="space-y-1">
                  {suggestions.map((location) => (
                    <li key={location.id}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onSelectSuggestion(location)}
                        className="w-full rounded-2xl px-3 py-2 text-left text-sm text-ink transition hover:bg-white/10"
                      >
                        {locationLabel(location)}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-2 text-sm text-ink-muted">
                  {emptySuggestionLabel ?? "No matching places found."}
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
