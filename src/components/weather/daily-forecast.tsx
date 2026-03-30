"use client";

import {
  formatDaylightDuration,
  formatMonthDay,
  formatPrecipitation,
  formatPercent,
  formatTemperature,
  formatWeekday,
} from "@/lib/weather";
import type { DailyForecastEntry } from "@/lib/weather";

import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";

type DailyForecastProps = {
  daily: DailyForecastEntry[];
  timezone: string;
};

export function DailyForecast({ daily, timezone }: DailyForecastProps) {
  return (
    <GlassPanel as="section">
      <SectionHeading
        title="7-Day Forecast"
        subtitle="Understandable daily summary"
      />

      <div className="mt-3 hidden grid-cols-[1.2fr_1fr_auto_auto] items-center gap-3 px-1 text-[0.68rem] uppercase tracking-[0.14em] text-ink-muted md:grid">
        <p>Day</p>
        <p>Condition</p>
        <p className="text-right">Rain</p>
        <p className="text-right">Temp</p>
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
                    H {formatTemperature(day.high)}
                  </p>
                  <p className="text-xs text-ink-muted">L {formatTemperature(day.low)}</p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted md:hidden">
                <span className="rounded-full border border-line/40 bg-card-elevated/65 px-2 py-1 text-ink">
                  {day.condition}
                </span>
                <span>Rain {formatPercent(day.precipitationChance)}</span>
                <span>Precip {formatPrecipitation(day.precipitationTotal)}</span>
                <span>Daylight {formatDaylightDuration(day.daylightSeconds)}</span>
              </div>

              <div className="hidden grid-cols-[1.2fr_1fr_auto_auto] items-center gap-3 md:grid">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {formatWeekday(day.date, timezone)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatMonthDay(day.date, timezone)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="rounded-full border border-line/40 bg-card-elevated/65 px-2 py-1 text-xs text-ink">
                    {day.condition}
                  </span>
                </div>

                <div className="text-right text-xs text-ink-muted">
                  {formatPercent(day.precipitationChance)}
                </div>

                <div className="text-right text-sm font-semibold text-ink">
                  {formatTemperature(day.low)} - {formatTemperature(day.high)}
                </div>
              </div>

              <div className="mt-2 hidden items-center justify-between gap-3 border-t border-line/25 pt-2 text-xs text-ink-muted md:flex">
                <p>Precipitation total: {formatPrecipitation(day.precipitationTotal)}</p>
                <p>Daylight: {formatDaylightDuration(day.daylightSeconds)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </GlassPanel>
  );
}
