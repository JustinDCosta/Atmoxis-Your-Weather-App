"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { WeatherTheme } from "@/lib/weather";

type AtmosphericBackdropProps = {
  theme: WeatherTheme;
  isDay: boolean;
};

type Palette = {
  primary: string;
  secondary: string;
  accent: string;
  bottom: string;
};

const DAY_THEMES: Record<WeatherTheme, Palette> = {
  clear: {
    primary: "rgb(78 161 214 / 0.55)",
    secondary: "rgb(127 207 255 / 0.34)",
    accent: "rgb(255 200 116 / 0.3)",
    bottom: "rgb(7 18 34)",
  },
  cloudy: {
    primary: "rgb(73 116 158 / 0.5)",
    secondary: "rgb(138 170 195 / 0.24)",
    accent: "rgb(186 224 255 / 0.2)",
    bottom: "rgb(8 19 36)",
  },
  rain: {
    primary: "rgb(33 96 142 / 0.48)",
    secondary: "rgb(37 79 124 / 0.46)",
    accent: "rgb(106 188 240 / 0.18)",
    bottom: "rgb(4 15 28)",
  },
  storm: {
    primary: "rgb(32 62 99 / 0.58)",
    secondary: "rgb(64 88 140 / 0.38)",
    accent: "rgb(151 183 255 / 0.24)",
    bottom: "rgb(3 10 20)",
  },
  snow: {
    primary: "rgb(120 162 191 / 0.46)",
    secondary: "rgb(202 229 245 / 0.18)",
    accent: "rgb(237 247 255 / 0.2)",
    bottom: "rgb(10 23 39)",
  },
  mist: {
    primary: "rgb(89 121 152 / 0.5)",
    secondary: "rgb(112 156 196 / 0.22)",
    accent: "rgb(193 222 244 / 0.16)",
    bottom: "rgb(5 15 29)",
  },
};

const NIGHT_THEMES: Record<WeatherTheme, Palette> = {
  clear: {
    primary: "rgb(38 74 142 / 0.5)",
    secondary: "rgb(43 88 167 / 0.28)",
    accent: "rgb(174 213 255 / 0.22)",
    bottom: "rgb(2 8 18)",
  },
  cloudy: {
    primary: "rgb(47 68 105 / 0.5)",
    secondary: "rgb(61 92 132 / 0.3)",
    accent: "rgb(138 184 228 / 0.14)",
    bottom: "rgb(3 10 21)",
  },
  rain: {
    primary: "rgb(24 57 94 / 0.58)",
    secondary: "rgb(23 70 111 / 0.35)",
    accent: "rgb(88 156 218 / 0.16)",
    bottom: "rgb(1 8 17)",
  },
  storm: {
    primary: "rgb(16 33 63 / 0.68)",
    secondary: "rgb(49 63 122 / 0.34)",
    accent: "rgb(132 149 255 / 0.2)",
    bottom: "rgb(1 5 14)",
  },
  snow: {
    primary: "rgb(56 87 122 / 0.56)",
    secondary: "rgb(124 171 206 / 0.2)",
    accent: "rgb(215 236 255 / 0.16)",
    bottom: "rgb(2 10 20)",
  },
  mist: {
    primary: "rgb(48 77 113 / 0.56)",
    secondary: "rgb(89 130 173 / 0.24)",
    accent: "rgb(171 208 239 / 0.12)",
    bottom: "rgb(2 9 18)",
  },
};

export function AtmosphericBackdrop({ theme, isDay }: AtmosphericBackdropProps) {
  const reduceMotion = useReducedMotion();
  const palette = isDay ? DAY_THEMES[theme] : NIGHT_THEMES[theme];
  const key = `${theme}-${isDay ? "day" : "night"}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        className="pointer-events-none absolute inset-0 -z-10"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.4 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(88% 64% at 4% 8%, ${palette.primary}, transparent 46%), radial-gradient(72% 58% at 92% 3%, ${palette.secondary}, transparent 56%), radial-gradient(98% 118% at 50% 104%, ${palette.bottom}, rgb(3 10 19) 58%)`,
          }}
        />

        <motion.div
          className="absolute -top-14 left-[9%] h-72 w-72 rounded-full blur-[110px]"
          style={{ backgroundColor: palette.accent }}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [-8, 20, -8],
                  x: [0, 16, 0],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 16,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
          }
        />

        <motion.div
          className="absolute right-[8%] top-10 h-80 w-80 rounded-full blur-[124px]"
          style={{ backgroundColor: palette.secondary }}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, 30, 0],
                  x: [0, -22, 0],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 18,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
          }
        />
      </motion.div>
    </AnimatePresence>
  );
}
