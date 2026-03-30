"use client";

import {
  formatDaylightDuration,
  formatMonthDay,
  formatPercent,
  formatTemperature,
  formatWeekday,
} from "@/lib/weather";
import type { DailyForecastEntry } from "@/lib/weather";

import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { WeatherGlyph } from "@/components/weather/weather-glyph";

type DailyForecastProps = {
  daily: DailyForecastEntry[];
  timezone: string;
};

export function DailyForecast({ daily, timezone }: DailyForecastProps) {
  const highs = daily.map((entry) => entry.high);
  const lows = daily.map((entry) => entry.low);
  const chartMin = Math.min(...lows);
  const chartMax = Math.max(...highs);
  const chartRange = Math.max(1, chartMax - chartMin);

  return (
    <GlassPanel as="section">
      <SectionHeading
        title="7-Day Forecast"
        subtitle="Daily highs, lows, and precipitation"
      />

      <div className="mt-4 space-y-2">
        {daily.map((day) => {
          const left = ((day.low - chartMin) / chartRange) * 100;
          const width = ((day.high - day.low) / chartRange) * 100;

          return (
            <article
              key={day.date}
              className="rounded-2xl border border-white/11 bg-white/6 px-3 py-2.5"
            >
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {formatWeekday(day.date, timezone)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatMonthDay(day.date, timezone)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <WeatherGlyph theme={day.theme} size={14} />
                  <span className="text-xs text-ink-muted">{day.condition}</span>
                </div>

                <div className="text-right text-sm font-semibold text-ink">
                  {formatTemperature(day.high)} / {formatTemperature(day.low)}
                </div>
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="relative h-2 rounded-full bg-white/10">
                  <div
                    className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-cyan-300/90 to-amber-200/90"
                    style={{
                      left: `${Math.max(0, Math.min(100, left))}%`,
                      width: `${Math.max(6, Math.min(100 - left, width))}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-ink-muted">
                  Rain {formatPercent(day.precipitationChance)}
                </p>

                <p className="text-xs text-ink-muted">
                  Daylight {formatDaylightDuration(day.daylightSeconds)}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </GlassPanel>
  );
}
