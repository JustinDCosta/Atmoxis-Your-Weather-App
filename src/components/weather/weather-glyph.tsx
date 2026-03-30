"use client";

import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Moon,
  Sun,
} from "lucide-react";

import type { WeatherTheme } from "@/lib/weather";

type WeatherGlyphProps = {
  theme: WeatherTheme;
  isDay?: boolean;
  size?: number;
  className?: string;
};

export function WeatherGlyph({
  theme,
  isDay = true,
  size = 44,
  className,
}: WeatherGlyphProps) {

  const Icon = (() => {
    if (theme === "clear") return isDay ? Sun : Moon;
    if (theme === "cloudy") return Cloud;
    if (theme === "rain") return CloudRain;
    if (theme === "storm") return CloudLightning;
    if (theme === "snow") return CloudSnow;
    return CloudFog;
  })();

  return (
    <div
      aria-hidden
      className={`inline-flex rounded-xl border border-white/14 bg-white/8 p-2 text-accent ${className ?? ""}`}
    >
      <Icon size={size} strokeWidth={1.7} />
    </div>
  );
}
