"use client";

import { Clock3, LoaderCircle, LocateFixed, Search } from "lucide-react";
import { type FocusEvent, useState } from "react";

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

  function handleContainerBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsFocused(false);
    }
  }

  return (
    <div
      className="relative flex w-full max-w-[620px] min-w-0 flex-col gap-2"
      onFocus={() => setIsFocused(true)}
      onBlur={handleContainerBlur}
    >
      <div className="glass flex min-h-12 items-center gap-2 rounded-2xl px-2.5 py-2 sm:h-12 sm:flex-nowrap sm:rounded-full sm:px-3.5 sm:py-0">
        <Search size={16} className="shrink-0 text-ink-muted" />
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
          className="h-8 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/80 md:text-[0.95rem]"
        />
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-line/45 bg-card-elevated/70 px-3 text-xs font-semibold text-ink transition hover:bg-card-elevated/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
        >
          Search
        </button>
        <button
          type="button"
          onClick={onUseLocation}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-line/40 bg-card-elevated/60 px-2.5 text-xs font-semibold text-ink transition hover:bg-card-elevated/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:px-3"
        >
          <LocateFixed size={14} className="sm:mr-1" />
          <span className="hidden sm:inline">Locate me</span>
        </button>
      </div>

      {showDropdown ? (
        <div className="glass absolute inset-x-0 top-[calc(100%+0.3rem)] z-20 w-auto rounded-2xl p-2.5 sm:rounded-3xl">
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
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-ink transition hover:bg-card-elevated/70"
                    >
                      <span className="truncate pr-2">{locationLabel(location)}</span>
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
                        className="w-full rounded-xl px-3 py-2 text-left text-sm text-ink transition hover:bg-card-elevated/70"
                      >
                        <span className="block truncate">{locationLabel(location)}</span>
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
