"use client";

import type { TemperatureUnit } from "@/lib/weather";
import { cn } from "@/lib/utils";

type TemperatureToggleProps = {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
};

export function TemperatureToggle({ unit, onChange }: TemperatureToggleProps) {
  return (
    <div
      className="inline-flex h-9 items-center rounded-full border border-line/40 bg-card-elevated/60 p-1"
      role="group"
      aria-label="Temperature unit"
    >
      <button
        type="button"
        onClick={() => onChange("c")}
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold transition",
          unit === "c"
            ? "bg-accent/18 text-ink"
            : "text-ink-muted hover:text-ink",
        )}
        aria-pressed={unit === "c"}
      >
        C
      </button>
      <button
        type="button"
        onClick={() => onChange("f")}
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold transition",
          unit === "f"
            ? "bg-accent/18 text-ink"
            : "text-ink-muted hover:text-ink",
        )}
        aria-pressed={unit === "f"}
      >
        F
      </button>
    </div>
  );
}
