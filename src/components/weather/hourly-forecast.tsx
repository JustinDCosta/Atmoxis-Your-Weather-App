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

      <div className="mt-4 h-48 w-full md:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="tempArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity={0.66} />
                <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              contentStyle={{
                borderRadius: 14,
                border: "1px solid rgb(var(--line) / 0.35)",
                background: "rgb(var(--card) / 0.95)",
                color: "rgb(var(--ink))",
                fontSize: "12px",
              }}
              formatter={(value, name) => {
                const numericValue = typeof value === "number" ? value : Number(value ?? 0);

                if (String(name) === "temperature") {
                  return [formatTemperature(numericValue), "Temperature"];
                }

                return [formatPercent(numericValue), "Rain chance"];
              }}
            />
            <Area
              dataKey="temperature"
              type="monotone"
              stroke="rgb(var(--accent))"
              strokeWidth={2}
              fill="url(#tempArea)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {hourly.slice(0, 12).map((entry) => (
          <article
            key={entry.time}
            className="min-w-[96px] rounded-xl border border-line/35 bg-card-elevated/55 px-2.5 py-2.5"
          >
            <p className="text-xs text-ink-muted">{formatHourLabel(entry.time, timezone)}</p>
            <p className="mt-2 text-sm font-semibold text-ink">
              {formatTemperature(entry.temperature)}
            </p>
            <p className="mt-1 text-[0.72rem] text-ink-muted">
              {entry.condition}
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
