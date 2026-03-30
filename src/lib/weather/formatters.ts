import type { AirQualityBand } from "./types";

export type TemperatureUnit = "c" | "f";

const COMPASS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
] as const;

export function toCompassDirection(degrees: number): string {
  if (!Number.isFinite(degrees)) return "N";

  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return COMPASS[index];
}

export function formatShortTime(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatHourLabel(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatWeekday(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatMonthDay(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatVisibility(distanceKm: number): string {
  return `${distanceKm.toFixed(1)} km`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function toTemperatureUnit(valueInCelsius: number, unit: TemperatureUnit): number {
  if (unit === "f") {
    return (valueInCelsius * 9) / 5 + 32;
  }

  return valueInCelsius;
}

export function formatTemperature(
  valueInCelsius: number,
  unit: TemperatureUnit = "c",
): string {
  const converted = toTemperatureUnit(valueInCelsius, unit);
  return `${Math.round(converted)}°${unit.toUpperCase()}`;
}

export function formatWind(value: number): string {
  return `${Math.round(value)} km/h`;
}

export function formatPressure(value: number): string {
  return `${Math.round(value)} hPa`;
}

export function formatPrecipitation(value: number): string {
  return `${value.toFixed(1)} mm`;
}

export function formatDaylightDuration(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function aqiBandFromValue(value: number): AirQualityBand {
  if (value <= 50) return "good";
  if (value <= 100) return "moderate";
  if (value <= 150) return "unhealthy-sensitive";
  if (value <= 200) return "unhealthy";
  if (value <= 300) return "very-unhealthy";
  return "hazardous";
}

export function aqiBandLabel(band: AirQualityBand): string {
  switch (band) {
    case "good":
      return "Good";
    case "moderate":
      return "Moderate";
    case "unhealthy-sensitive":
      return "Unhealthy for Sensitive Groups";
    case "unhealthy":
      return "Unhealthy";
    case "very-unhealthy":
      return "Very Unhealthy";
    case "hazardous":
      return "Hazardous";
    default:
      return "Unknown";
  }
}
