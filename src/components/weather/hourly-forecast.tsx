"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatHourLabel, formatPercent, formatTemperature } from "@/lib/weather";
import type { HourlyForecastEntry } from "@/lib/weather";

import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { WeatherGlyph } from "@/components/weather/weather-glyph";

type HourlyForecastProps = {
  hourly: HourlyForecastEntry[];
  timezone: string;
};

type HourlyPoint = {
  label: string;
  temperature: number;
  precipitationProbability: number;
  condition: string;
};

export function HourlyForecast({ hourly, timezone }: HourlyForecastProps) {
  const chartData: HourlyPoint[] = hourly.map((entry) => ({
    label: formatHourLabel(entry.time, timezone),
    temperature: Math.round(entry.temperature),
    precipitationProbability: Math.round(entry.precipitationProbability),
    condition: entry.condition,
  }));

  return (
    <GlassPanel as="section">
      <SectionHeading
        title="Hourly Forecast"
        subtitle="Next 24 hours"
      />

      <div className="mt-4 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="tempArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(117 226 255)" stopOpacity={0.66} />
                <stop offset="100%" stopColor="rgb(117 226 255)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: "rgb(179 204 229)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
            <Tooltip
              cursor={{ stroke: "rgb(117 226 255 / 0.4)", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 14,
                border: "1px solid rgb(255 255 255 / 0.2)",
                background: "rgb(13 34 58 / 0.95)",
                color: "rgb(237 245 255)",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "temperature") return [formatTemperature(value), "Temperature"];
                return [formatPercent(value), "Rain chance"];
              }}
            />
            <Area
              dataKey="temperature"
              type="monotone"
              stroke="rgb(117 226 255)"
              strokeWidth={2}
              fill="url(#tempArea)"
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {hourly.map((entry) => (
          <article
            key={entry.time}
            className="min-w-[95px] rounded-2xl border border-white/12 bg-white/6 px-2.5 py-3"
          >
            <p className="text-xs text-ink-muted">{formatHourLabel(entry.time, timezone)}</p>
            <div className="my-2 inline-flex">
              <WeatherGlyph theme={entry.theme} size={16} />
            </div>
            <p className="text-sm font-semibold text-ink">
              {formatTemperature(entry.temperature)}
            </p>
            <p className="text-[0.72rem] text-ink-muted">
              {formatPercent(entry.precipitationProbability)} rain
            </p>
          </article>
        ))}
      </div>
    </GlassPanel>
  );
}
