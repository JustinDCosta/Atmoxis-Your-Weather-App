"use client";

import { Star } from "lucide-react";

import {
  formatPercent,
  formatPressure,
  formatShortTime,
  formatTemperature,
  formatVisibility,
  formatWind,
  toCompassDirection,
} from "@/lib/weather";
import type { WeatherReport } from "@/lib/weather";

import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { WeatherGlyph } from "@/components/weather/weather-glyph";

type CurrentWeatherCardProps = {
  report: WeatherReport;
  isSaved: boolean;
  onToggleSave: () => void;
};

export function CurrentWeatherCard({
  report,
  isSaved,
  onToggleSave,
}: CurrentWeatherCardProps) {
  const current = report.current;

  const metrics = [
    { label: "Feels like", value: formatTemperature(current.feelsLike) },
    {
      label: "Wind",
      value: `${formatWind(current.windSpeed)} ${toCompassDirection(current.windDirection)}`,
    },
    { label: "Humidity", value: formatPercent(current.humidity) },
    { label: "Pressure", value: formatPressure(current.pressure) },
    { label: "Visibility", value: formatVisibility(current.visibilityKm) },
    { label: "UV index", value: current.uvIndex.toFixed(1) },
    { label: "Cloud cover", value: formatPercent(current.cloudCover) },
    { label: "Precip", value: `${current.precipitation.toFixed(1)} mm` },
    {
      label: "Sunrise",
      value: formatShortTime(current.sunrise, report.location.timezone),
    },
    {
      label: "Sunset",
      value: formatShortTime(current.sunset, report.location.timezone),
    },
  ];

  return (
    <GlassPanel as="section" className="h-full">
      <SectionHeading
        title={report.location.name}
        subtitle={`${report.location.region ? `${report.location.region}, ` : ""}${report.location.country}`}
        action={
          <button
            type="button"
            onClick={onToggleSave}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/14 bg-white/8 px-3 text-xs font-semibold text-ink transition hover:bg-white/14 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            aria-pressed={isSaved}
          >
            <Star
              size={14}
              className={isSaved ? "fill-amber-300 text-amber-300" : "text-ink-muted"}
            />
            {isSaved ? "Saved" : "Save"}
          </button>
        }
      />

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <WeatherGlyph theme={current.theme} isDay={current.isDay} size={42} />
          <div>
            <p className="display-type text-5xl font-semibold text-ink md:text-6xl">
              {formatTemperature(current.temperature)}
            </p>
            <p className="mt-1 text-base text-ink-muted">{current.condition}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/12 bg-white/7 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">Today</p>
          <p className="mt-1 text-lg font-semibold text-ink">
            H {formatTemperature(current.high)} / L {formatTemperature(current.low)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5"
          >
            <p className="text-[0.73rem] uppercase tracking-[0.14em] text-ink-muted">
              {metric.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{metric.value}</p>
          </article>
        ))}
      </div>
    </GlassPanel>
  );
}
