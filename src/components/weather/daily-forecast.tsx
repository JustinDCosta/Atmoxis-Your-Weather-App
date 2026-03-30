"use client";

import { motion } from "framer-motion";

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
        subtitle="A cleaner look at rain and temperature shifts"
      />

      <div className="mt-4 hidden grid-cols-[minmax(110px,1.05fr)_minmax(155px,1.35fr)_minmax(116px,0.88fr)_minmax(130px,0.95fr)] items-center gap-4 px-2 text-[0.67rem] uppercase tracking-[0.14em] text-ink-muted md:grid">
        <p>Day</p>
        <p>Condition</p>
        <p className="text-right">Rain / Precip</p>
        <p className="text-right">Low / High Temp</p>
      </div>

      <div className="mt-3 space-y-2.5">
        {daily.map((day, index) => {
          return (
            <motion.article
              key={day.date}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: index * 0.04 }}
              className="rounded-2xl border border-line/35 bg-gradient-to-b from-card/96 to-card-elevated/72 px-3.5 py-3 md:px-4"
            >
              <div className="space-y-2 md:hidden">
                <div className="flex items-start justify-between gap-3">
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

                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                  <span className="max-w-full truncate rounded-full border border-line/40 bg-card-elevated/75 px-2 py-1 text-ink">
                    {day.condition}
                  </span>
                  <span>Rain {formatPercent(day.precipitationChance)}</span>
                  <span>Precip {formatPrecipitation(day.precipitationTotal)}</span>
                </div>
              </div>

              <div className="hidden grid-cols-[minmax(110px,1.05fr)_minmax(155px,1.35fr)_minmax(116px,0.88fr)_minmax(130px,0.95fr)] items-center gap-4 md:grid">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {formatWeekday(day.date, timezone)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatMonthDay(day.date, timezone)}
                  </p>
                </div>

                <p className="truncate text-sm text-ink" title={day.condition}>
                  {day.condition}
                </p>

                <div className="text-right text-sm text-ink-muted">
                  {formatPercent(day.precipitationChance)} /{" "}
                  {formatPrecipitation(day.precipitationTotal)}
                </div>

                <div className="flex justify-end gap-1.5 text-sm font-semibold text-ink">
                  <span className="rounded-full border border-line/40 bg-card-elevated/75 px-2 py-1">
                    L {formatTemperature(day.low, temperatureUnit)}
                  </span>
                  <span className="rounded-full border border-line/40 bg-card-elevated/85 px-2 py-1">
                    H {formatTemperature(day.high, temperatureUnit)}
                  </span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </GlassPanel>
  );
}
