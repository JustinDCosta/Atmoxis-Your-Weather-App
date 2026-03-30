"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatHourLabel,
  formatPercent,
  formatPrecipitation,
  formatShortTime,
  formatTemperature,
  formatWind,
  type HourlyForecastEntry,
  type TemperatureUnit,
} from "@/lib/weather";

import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";

type HourlyForecastProps = {
  hourly: HourlyForecastEntry[];
  timezone: string;
  temperatureUnit: TemperatureUnit;
};

type HourlyPoint = {
  label: string;
  fullTime: string;
  temperature: number;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  uvIndex: number;
  condition: string;
  isCurrentHour: boolean;
};

type HourlyTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: HourlyPoint }>;
  temperatureUnit: TemperatureUnit;
};

function HourlyTooltip({
  active,
  payload,
  temperatureUnit,
}: HourlyTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="w-[196px] rounded-2xl border border-line/45 bg-card/95 px-3 py-2.5 text-xs text-ink shadow-[0_14px_28px_rgb(var(--shadow)/0.22)] backdrop-blur-xl">
      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-muted">
        {point.fullTime}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">
        {formatTemperature(point.temperature, temperatureUnit)}
      </p>
      <p className="mt-1 text-ink-muted">{point.condition}</p>
      <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[0.7rem] text-ink-muted">
        <span>Rain {formatPercent(point.precipitationProbability)}</span>
        <span>Precip {formatPrecipitation(point.precipitation)}</span>
        <span>Wind {formatWind(point.windSpeed)}</span>
        <span>UV {point.uvIndex.toFixed(1)}</span>
      </div>
    </div>
  );
}

export function HourlyForecast({
  hourly,
  timezone,
  temperatureUnit,
}: HourlyForecastProps) {
  const chartData: HourlyPoint[] = hourly.map((entry) => ({
    label: formatHourLabel(entry.time, timezone),
    fullTime: formatShortTime(entry.time, timezone),
    temperature: Math.round(entry.temperature),
    precipitationProbability: Math.round(entry.precipitationProbability),
    precipitation: entry.precipitation,
    windSpeed: entry.windSpeed,
    uvIndex: entry.uvIndex,
    condition: entry.condition,
    isCurrentHour: entry.isCurrentHour,
  }));

  return (
    <GlassPanel as="section">
      <SectionHeading
        title="Hourly Forecast"
        subtitle="Slide through the next 24 hours with richer detail"
      />

      <div className="mt-4 h-48 w-full min-w-0 rounded-2xl border border-line/35 bg-card-elevated/45 px-2 py-2 md:h-52">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
          <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="tempArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity={0.52} />
                <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="rgb(var(--line) / 0.2)"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgb(var(--ink-muted))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
            <Tooltip
              cursor={{ stroke: "rgb(var(--accent) / 0.45)", strokeWidth: 1 }}
              content={
                <HourlyTooltip temperatureUnit={temperatureUnit} />
              }
            />
            <Area
              dataKey="temperature"
              type="monotone"
              stroke="rgb(var(--accent))"
              strokeWidth={2}
              fill="url(#tempArea)"
              animationDuration={620}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "rgb(var(--card))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div
        className="clean-scroll -mx-2 mt-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-2 pb-2"
        aria-label="Hourly forecast slider"
      >
        {hourly.map((entry, index) => (
          <motion.article
            key={entry.time}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: index * 0.015 }}
            whileHover={{ y: -2 }}
            className="group relative min-w-[165px] snap-start overflow-hidden rounded-2xl border border-line/35 bg-gradient-to-b from-card/95 to-card-elevated/75 px-3.5 py-3 shadow-[0_10px_18px_rgb(var(--shadow)/0.1)] transition hover:border-line-strong/55"
          >
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-accent/65 to-transparent" />
            <p className="text-xs text-ink-muted">{formatHourLabel(entry.time, timezone)}</p>
            <p className="mt-2 flex items-center justify-between text-sm font-semibold text-ink">
              <span>{formatTemperature(entry.temperature, temperatureUnit)}</span>
              {entry.isCurrentHour ? (
                <span className="rounded-full border border-accent/30 bg-accent/12 px-1.5 py-0.5 text-[0.64rem] uppercase tracking-[0.11em] text-ink-muted">
                  Now
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-[0.72rem] text-ink-muted">
              {entry.condition}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[0.69rem] text-ink-muted">
              <p>Rain {formatPercent(entry.precipitationProbability)}</p>
              <p>Precip {formatPrecipitation(entry.precipitation)}</p>
              <p>Wind {formatWind(entry.windSpeed)}</p>
              <p>UV {entry.uvIndex.toFixed(1)}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </GlassPanel>
  );
}
