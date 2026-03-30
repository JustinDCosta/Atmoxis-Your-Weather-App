"use client";

import { aqiBandLabel } from "@/lib/weather";
import type { AirQualitySnapshot } from "@/lib/weather";

import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";

type AirQualityCardProps = {
  airQuality?: AirQualitySnapshot;
};

function bandToneClass(value: NonNullable<AirQualitySnapshot["band"]>): string {
  switch (value) {
    case "good":
      return "text-emerald-200 border-emerald-200/35 bg-emerald-300/12";
    case "moderate":
      return "text-amber-100 border-amber-200/35 bg-amber-300/10";
    case "unhealthy-sensitive":
      return "text-orange-100 border-orange-200/35 bg-orange-300/12";
    case "unhealthy":
      return "text-rose-100 border-rose-200/35 bg-rose-300/12";
    case "very-unhealthy":
      return "text-fuchsia-100 border-fuchsia-200/35 bg-fuchsia-300/14";
    case "hazardous":
      return "text-red-100 border-red-200/35 bg-red-300/16";
    default:
      return "text-ink border-white/14 bg-white/8";
  }
}

export function AirQualityCard({ airQuality }: AirQualityCardProps) {
  if (!airQuality) {
    return (
      <GlassPanel as="section">
        <SectionHeading title="Air Quality" subtitle="Unavailable for this location right now" />
        <p className="mt-4 rounded-2xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-ink-muted">
          Air quality feed is temporarily unavailable. Weather data continues to update.
        </p>
      </GlassPanel>
    );
  }

  const metrics = [
    { label: "PM2.5", value: `${airQuality.pm2_5.toFixed(1)} ug/m3` },
    { label: "PM10", value: `${airQuality.pm10.toFixed(1)} ug/m3` },
    { label: "Ozone", value: `${airQuality.ozone.toFixed(1)} ug/m3` },
    { label: "NO2", value: `${airQuality.nitrogenDioxide.toFixed(1)} ug/m3` },
  ];

  return (
    <GlassPanel as="section">
      <SectionHeading title="Air Quality" subtitle="US AQI scale" />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="display-type text-4xl font-semibold text-ink md:text-5xl">
            {airQuality.usAqi}
          </p>
          <p className="mt-1 text-sm text-ink-muted">Current AQI</p>
        </div>
        <p
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${bandToneClass(
            airQuality.band,
          )}`}
        >
          {aqiBandLabel(airQuality.band)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-white/11 bg-white/6 px-3 py-2.5"
          >
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-ink-muted">
              {metric.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{metric.value}</p>
          </article>
        ))}
      </div>
    </GlassPanel>
  );
}
