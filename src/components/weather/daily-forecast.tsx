"use client";

import {
  formatMonthDay,
  formatPrecipitation,
  formatPercent,
  formatTemperature,
  formatWeekday,
  type TemperatureUnit,
} from "@/lib/weather";
import type { DailyForecastEntry } from "@/lib/weather";

import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";

type DailyForecastProps = {
  daily: DailyForecastEntry[];
  timezone: string;
  temperatureUnit: TemperatureUnit;
};

export function DailyForecast({
  daily,
  timezone,
  temperatureUnit,
}: DailyForecastProps) {
  return (
    <GlassPanel as="section">
      <SectionHeading
        title="7-Day Forecast"
        subtitle="A clean view of the week ahead"
      />

      <div className="mt-3 hidden grid-cols-[1.2fr_1.5fr_auto_auto] items-center gap-3 px-1 text-[0.68rem] uppercase tracking-[0.14em] text-ink-muted md:grid">
        <p>Day</p>
        <p>Condition</p>
        <p className="text-right">Rain</p>
        <p className="text-right">Low / High</p>
      </div>

      <div className="mt-2 space-y-2">
        {daily.map((day) => {
          return (
            <article
              key={day.date}
              className="rounded-xl border border-line/35 bg-card-elevated/55 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-3 md:hidden">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {formatWeekday(day.date, timezone)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatMonthDay(day.date, timezone)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-ink">
                    H {formatTemperature(day.high, temperatureUnit)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    L {formatTemperature(day.low, temperatureUnit)}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted md:hidden">
                <span className="rounded-full border border-line/40 bg-card-elevated/65 px-2 py-1 text-ink">
                  {day.condition}
                </span>
                <span>Rain {formatPercent(day.precipitationChance)}</span>
                <span>Precip {formatPrecipitation(day.precipitationTotal)}</span>
              </div>

              <div className="hidden grid-cols-[1.2fr_1.5fr_auto_auto] items-center gap-3 md:grid">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {formatWeekday(day.date, timezone)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatMonthDay(day.date, timezone)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block max-w-[220px] truncate rounded-full border border-line/40 bg-card-elevated/65 px-2 py-1 text-xs text-ink">
                    {day.condition}
                  </span>
                </div>

                <div className="text-right text-xs text-ink-muted">
                  {formatPercent(day.precipitationChance)}
                </div>

                <div className="text-right text-sm font-semibold text-ink">
                  {formatTemperature(day.low, temperatureUnit)} -{" "}
                  {formatTemperature(day.high, temperatureUnit)}
                </div>
              </div>

              <div className="mt-2 hidden items-center justify-between gap-3 border-t border-line/25 pt-2 text-xs text-ink-muted md:flex">
                <p>Expected precipitation: {formatPrecipitation(day.precipitationTotal)}</p>
                <p>{day.condition}</p>
              </div>
            </article>
          );
        })}
      </div>
    </GlassPanel>
  );
}
