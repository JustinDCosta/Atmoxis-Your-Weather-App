import type { WeatherTheme } from "./types";

type WeatherCodeDescriptor = {
  label: string;
  shortLabel: string;
  theme: WeatherTheme;
};

const WEATHER_CODE_MAP: Record<number, WeatherCodeDescriptor> = {
  0: { label: "Clear sky", shortLabel: "Clear", theme: "clear" },
  1: { label: "Mainly clear", shortLabel: "Mostly clear", theme: "clear" },
  2: { label: "Partly cloudy", shortLabel: "Partly cloudy", theme: "cloudy" },
  3: { label: "Overcast", shortLabel: "Cloudy", theme: "cloudy" },
  45: { label: "Fog", shortLabel: "Fog", theme: "mist" },
  48: { label: "Depositing rime fog", shortLabel: "Rime fog", theme: "mist" },
  51: { label: "Light drizzle", shortLabel: "Drizzle", theme: "rain" },
  53: { label: "Moderate drizzle", shortLabel: "Drizzle", theme: "rain" },
  55: { label: "Dense drizzle", shortLabel: "Heavy drizzle", theme: "rain" },
  56: { label: "Light freezing drizzle", shortLabel: "Freezing drizzle", theme: "rain" },
  57: {
    label: "Dense freezing drizzle",
    shortLabel: "Freezing drizzle",
    theme: "rain",
  },
  61: { label: "Slight rain", shortLabel: "Light rain", theme: "rain" },
  63: { label: "Moderate rain", shortLabel: "Rain", theme: "rain" },
  65: { label: "Heavy rain", shortLabel: "Heavy rain", theme: "rain" },
  66: { label: "Light freezing rain", shortLabel: "Freezing rain", theme: "rain" },
  67: { label: "Heavy freezing rain", shortLabel: "Freezing rain", theme: "rain" },
  71: { label: "Slight snowfall", shortLabel: "Light snow", theme: "snow" },
  73: { label: "Moderate snowfall", shortLabel: "Snow", theme: "snow" },
  75: { label: "Heavy snowfall", shortLabel: "Heavy snow", theme: "snow" },
  77: { label: "Snow grains", shortLabel: "Snow grains", theme: "snow" },
  80: { label: "Slight rain showers", shortLabel: "Showers", theme: "rain" },
  81: { label: "Moderate rain showers", shortLabel: "Showers", theme: "rain" },
  82: { label: "Violent rain showers", shortLabel: "Heavy showers", theme: "rain" },
  85: { label: "Slight snow showers", shortLabel: "Snow showers", theme: "snow" },
  86: { label: "Heavy snow showers", shortLabel: "Snow showers", theme: "snow" },
  95: { label: "Thunderstorm", shortLabel: "Storm", theme: "storm" },
  96: {
    label: "Thunderstorm with slight hail",
    shortLabel: "Storm and hail",
    theme: "storm",
  },
  99: {
    label: "Thunderstorm with heavy hail",
    shortLabel: "Severe storm",
    theme: "storm",
  },
};

const FALLBACK_CODE: WeatherCodeDescriptor = {
  label: "Unknown conditions",
  shortLabel: "Unknown",
  theme: "cloudy",
};

export function getWeatherCodeDescriptor(code: number): WeatherCodeDescriptor {
  return WEATHER_CODE_MAP[code] ?? FALLBACK_CODE;
}
