"use client";

import { motion, useReducedMotion } from "framer-motion";
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
};

export function WeatherGlyph({ theme, isDay = true, size = 44 }: WeatherGlyphProps) {
  const reduceMotion = useReducedMotion();

  const Icon = (() => {
    if (theme === "clear") return isDay ? Sun : Moon;
    if (theme === "cloudy") return Cloud;
    if (theme === "rain") return CloudRain;
    if (theme === "storm") return CloudLightning;
    if (theme === "snow") return CloudSnow;
    return CloudFog;
  })();

  return (
    <motion.div
      aria-hidden
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, -4, 0],
              scale: [1, 1.03, 1],
            }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              duration: 3.4,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            }
      }
      className="inline-flex rounded-2xl border border-white/14 bg-white/8 p-3 text-cyan-100"
    >
      <Icon size={size} strokeWidth={1.7} />
    </motion.div>
  );
}
