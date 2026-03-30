import type { AirQualityBand } from "./types";

export type TemperatureUnit = "c" | "f";

type ParsedIso = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  hasTime: boolean;
};

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

function parseIso(iso: string): ParsedIso | null {
  const trimmed = iso.trim();
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/,
  );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hasTime = match[4] !== undefined;
  const hour = hasTime ? Number(match[4]) : 12;
  const minute = hasTime ? Number(match[5]) : 0;

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  return {
    year,
    month,
    day,
    hour,
    minute,
    hasTime,
  };
}

function formatClock(hour24: number, minute: number, withMinute: boolean): string {
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  if (!withMinute) {
    return `${hour12} ${suffix}`;
  }

  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function toUtcDate(iso: string): Date | null {
  const parsed = parseIso(iso);
  if (!parsed) {
    return null;
  }

  return new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute),
  );
}

export function toCompassDirection(degrees: number): string {
  if (!Number.isFinite(degrees)) return "N";

  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return COMPASS[index];
}

export function formatShortTime(iso: string, timezone: string): string {
  const parsed = parseIso(iso);
  if (parsed?.hasTime) {
    return formatClock(parsed.hour, parsed.minute, true);
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatHourLabel(iso: string, timezone: string): string {
  const parsed = parseIso(iso);
  if (parsed?.hasTime) {
    return formatClock(parsed.hour, parsed.minute, false);
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatWeekday(iso: string, timezone: string): string {
  const date = toUtcDate(iso);
  if (date) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: "UTC",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatMonthDay(iso: string, timezone: string): string {
  const date = toUtcDate(iso);
  if (date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

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
