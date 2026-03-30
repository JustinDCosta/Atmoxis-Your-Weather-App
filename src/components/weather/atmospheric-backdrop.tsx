"use client";

import { useEffect, useState } from "react";

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

const LIGHT_DAY_THEMES: Record<WeatherTheme, Palette> = {
  clear: {
    primary: "rgb(157 215 255 / 0.42)",
    secondary: "rgb(196 230 255 / 0.28)",
    accent: "rgb(255 214 150 / 0.22)",
    bottom: "rgb(224 238 251)",
  },
  cloudy: {
    primary: "rgb(171 203 228 / 0.36)",
    secondary: "rgb(201 221 240 / 0.24)",
    accent: "rgb(227 238 248 / 0.22)",
    bottom: "rgb(228 239 251)",
  },
  rain: {
    primary: "rgb(137 183 219 / 0.38)",
    secondary: "rgb(165 200 226 / 0.28)",
    accent: "rgb(180 215 238 / 0.2)",
    bottom: "rgb(220 234 247)",
  },
  storm: {
    primary: "rgb(131 166 200 / 0.4)",
    secondary: "rgb(160 186 220 / 0.3)",
    accent: "rgb(193 212 239 / 0.2)",
    bottom: "rgb(214 229 244)",
  },
  snow: {
    primary: "rgb(188 217 237 / 0.34)",
    secondary: "rgb(216 234 248 / 0.24)",
    accent: "rgb(239 246 252 / 0.2)",
    bottom: "rgb(231 241 251)",
  },
  mist: {
    primary: "rgb(170 198 224 / 0.34)",
    secondary: "rgb(200 219 238 / 0.24)",
    accent: "rgb(227 236 246 / 0.2)",
    bottom: "rgb(225 237 249)",
  },
};

const LIGHT_NIGHT_THEMES: Record<WeatherTheme, Palette> = {
  clear: {
    primary: "rgb(138 186 228 / 0.36)",
    secondary: "rgb(175 206 235 / 0.26)",
    accent: "rgb(210 227 248 / 0.2)",
    bottom: "rgb(218 232 246)",
  },
  cloudy: {
    primary: "rgb(145 178 208 / 0.34)",
    secondary: "rgb(174 198 222 / 0.24)",
    accent: "rgb(203 220 238 / 0.2)",
    bottom: "rgb(214 228 242)",
  },
  rain: {
    primary: "rgb(132 170 201 / 0.36)",
    secondary: "rgb(161 192 219 / 0.25)",
    accent: "rgb(192 213 233 / 0.2)",
    bottom: "rgb(212 226 240)",
  },
  storm: {
    primary: "rgb(123 154 188 / 0.38)",
    secondary: "rgb(147 178 211 / 0.26)",
    accent: "rgb(183 202 228 / 0.2)",
    bottom: "rgb(206 221 236)",
  },
  snow: {
    primary: "rgb(173 201 222 / 0.34)",
    secondary: "rgb(201 223 239 / 0.24)",
    accent: "rgb(229 239 248 / 0.2)",
    bottom: "rgb(218 232 244)",
  },
  mist: {
    primary: "rgb(155 185 212 / 0.34)",
    secondary: "rgb(184 208 230 / 0.24)",
    accent: "rgb(215 228 242 / 0.2)",
    bottom: "rgb(215 230 244)",
  },
};

export function AtmosphericBackdrop({ theme, isDay }: AtmosphericBackdropProps) {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const updateMode = () => {
      setMode(
        document.documentElement.getAttribute("data-theme") === "light"
          ? "light"
          : "dark",
      );
    };

    updateMode();

    const observer = new MutationObserver(updateMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const paletteSet =
    mode === "light"
      ? isDay
        ? LIGHT_DAY_THEMES
        : LIGHT_NIGHT_THEMES
      : isDay
        ? DAY_THEMES
        : NIGHT_THEMES;

  const palette = paletteSet[theme];

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(88% 64% at 4% 8%, ${palette.primary}, transparent 46%), radial-gradient(72% 58% at 92% 3%, ${palette.secondary}, transparent 56%), radial-gradient(98% 118% at 50% 104%, ${palette.bottom}, rgb(3 10 19) 58%)`,
        }}
      />
      <div
        className="absolute -top-16 left-[10%] h-64 w-64 rounded-full blur-[96px]"
        style={{ backgroundColor: palette.accent }}
      />
    </div>
  );
}
