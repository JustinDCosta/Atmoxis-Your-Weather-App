import {
  aqiBandFromValue,
  formatDaylightDuration,
  toCompassDirection,
} from "./formatters";
import type {
  AirQualitySnapshot,
  GeocodedLocation,
  HourlyForecastEntry,
  WeatherReport,
} from "./types";
import { getWeatherCodeDescriptor } from "./weather-codes";

type GeocodeApiResponse = {
  results?: Array<{
    id?: number;
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }>;
};

type ForecastApiResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    cloud_cover: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    surface_pressure: number;
    visibility: number;
    uv_index: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
    precipitation: number[];
    uv_index: number[];
    wind_speed_10m: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_probability_max: number[];
    precipitation_sum: number[];
    daylight_duration: number[];
  };
};

type AirQualityApiResponse = {
  hourly?: {
    time: string[];
    us_aqi: number[];
    pm2_5: number[];
    pm10: number[];
    ozone: number[];
    nitrogen_dioxide: number[];
    sulphur_dioxide: number[];
    carbon_monoxide: number[];
  };
};

const GEO_SEARCH_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const GEO_REVERSE_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/reverse";
const WEATHER_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_ENDPOINT = "https://air-quality-api.open-meteo.com/v1/air-quality";

type SearchLocationOptions = {
  signal?: AbortSignal;
  count?: number;
};

type WeatherRequest = {
  location: GeocodedLocation;
  signal?: AbortSignal;
};

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

function toLocation(result: {
  id?: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}): GeocodedLocation {
  const keyBase = result.id
    ? String(result.id)
    : `${result.name}-${result.latitude}-${result.longitude}`;

  return {
    id: keyBase,
    name: result.name,
    country: result.country,
    region: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone ?? "auto",
  };
}

function findCurrentHourIndex(hourlyTimes: string[], currentTime: string): number {
  const exactIndex = hourlyTimes.indexOf(currentTime);
  if (exactIndex >= 0) return exactIndex;

  const target = new Date(currentTime).getTime();
  const firstAfter = hourlyTimes.findIndex((time) => new Date(time).getTime() >= target);
  if (firstAfter >= 0) return firstAfter;

  return 0;
}

function buildHourlyForecast(
  forecast: ForecastApiResponse,
  startIndex: number,
): HourlyForecastEntry[] {
  const entries: HourlyForecastEntry[] = [];
  const end = Math.min(startIndex + 24, forecast.hourly.time.length);

  for (let index = startIndex; index < end; index += 1) {
    const code = forecast.hourly.weather_code[index] ?? 0;
    const descriptor = getWeatherCodeDescriptor(code);

    entries.push({
      time: forecast.hourly.time[index],
      temperature: forecast.hourly.temperature_2m[index] ?? 0,
      conditionCode: code,
      condition: descriptor.shortLabel,
      theme: descriptor.theme,
      precipitationProbability: forecast.hourly.precipitation_probability[index] ?? 0,
      precipitation: forecast.hourly.precipitation[index] ?? 0,
      windSpeed: forecast.hourly.wind_speed_10m[index] ?? 0,
      uvIndex: forecast.hourly.uv_index[index] ?? 0,
      isCurrentHour: index === startIndex,
    });
  }

  return entries;
}

function mapAirQuality(
  airQuality: AirQualityApiResponse | undefined,
  targetTime: string,
): AirQualitySnapshot | undefined {
  if (!airQuality?.hourly?.time?.length || !airQuality.hourly.us_aqi?.length) {
    return undefined;
  }

  const target = new Date(targetTime).getTime();
  let index = airQuality.hourly.time.findIndex(
    (time) => new Date(time).getTime() >= target,
  );

  if (index < 0) {
    index = airQuality.hourly.time.length - 1;
  }

  const aqiValue = airQuality.hourly.us_aqi[index];
  if (!Number.isFinite(aqiValue)) {
    return undefined;
  }

  return {
    usAqi: Math.round(aqiValue),
    band: aqiBandFromValue(aqiValue),
    pm2_5: airQuality.hourly.pm2_5[index] ?? 0,
    pm10: airQuality.hourly.pm10[index] ?? 0,
    ozone: airQuality.hourly.ozone[index] ?? 0,
    nitrogenDioxide: airQuality.hourly.nitrogen_dioxide[index] ?? 0,
    sulphurDioxide: airQuality.hourly.sulphur_dioxide[index] ?? 0,
    carbonMonoxide: airQuality.hourly.carbon_monoxide[index] ?? 0,
  };
}

export async function searchLocations(
  query: string,
  options?: SearchLocationOptions,
): Promise<GeocodedLocation[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    name: query.trim(),
    count: String(options?.count ?? 7),
    language: "en",
    format: "json",
  });

  const payload = await fetchJson<GeocodeApiResponse>(
    `${GEO_SEARCH_ENDPOINT}?${params.toString()}`,
    options?.signal,
  );

  return (payload.results ?? []).map(toLocation);
}

export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<GeocodedLocation | null> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    language: "en",
    format: "json",
  });

  const payload = await fetchJson<GeocodeApiResponse>(
    `${GEO_REVERSE_ENDPOINT}?${params.toString()}`,
    signal,
  );

  const first = payload.results?.[0];
  return first ? toLocation(first) : null;
}

export async function fetchWeatherReport({
  location,
  signal,
}: WeatherRequest): Promise<WeatherReport> {
  const weatherParams = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: "auto",
    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "is_day",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
      "surface_pressure",
      "visibility",
      "uv_index",
    ].join(","),
    hourly: [
      "temperature_2m",
      "weather_code",
      "precipitation_probability",
      "precipitation",
      "uv_index",
      "wind_speed_10m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "precipitation_probability_max",
      "precipitation_sum",
      "daylight_duration",
    ].join(","),
    forecast_days: "7",
  });

  const airParams = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: "auto",
    hourly: [
      "us_aqi",
      "pm2_5",
      "pm10",
      "ozone",
      "nitrogen_dioxide",
      "sulphur_dioxide",
      "carbon_monoxide",
    ].join(","),
  });

  const [forecastResult, airResult] = await Promise.allSettled([
    fetchJson<ForecastApiResponse>(`${WEATHER_ENDPOINT}?${weatherParams.toString()}`, signal),
    fetchJson<AirQualityApiResponse>(`${AIR_QUALITY_ENDPOINT}?${airParams.toString()}`, signal),
  ]);

  if (forecastResult.status !== "fulfilled") {
    throw forecastResult.reason instanceof Error
      ? forecastResult.reason
      : new Error("Weather forecast request failed");
  }

  const forecast = forecastResult.value;
  const weatherDescriptor = getWeatherCodeDescriptor(forecast.current.weather_code);
  const currentHourIndex = findCurrentHourIndex(
    forecast.hourly.time,
    forecast.current.time,
  );

  const daily = forecast.daily.time.slice(0, 7).map((date, index) => {
    const code = forecast.daily.weather_code[index] ?? 0;
    const descriptor = getWeatherCodeDescriptor(code);

    return {
      date,
      high: forecast.daily.temperature_2m_max[index] ?? 0,
      low: forecast.daily.temperature_2m_min[index] ?? 0,
      conditionCode: code,
      condition: descriptor.shortLabel,
      theme: descriptor.theme,
      precipitationChance: forecast.daily.precipitation_probability_max[index] ?? 0,
      precipitationTotal: forecast.daily.precipitation_sum[index] ?? 0,
      sunrise: forecast.daily.sunrise[index],
      sunset: forecast.daily.sunset[index],
      daylightSeconds: forecast.daily.daylight_duration[index] ?? 0,
    };
  });

  const airQuality =
    airResult.status === "fulfilled"
      ? mapAirQuality(airResult.value, forecast.current.time)
      : undefined;

  return {
    location: {
      ...location,
      timezone: forecast.timezone,
    },
    current: {
      time: forecast.current.time,
      temperature: forecast.current.temperature_2m,
      feelsLike: forecast.current.apparent_temperature,
      high: daily[0]?.high ?? forecast.current.temperature_2m,
      low: daily[0]?.low ?? forecast.current.temperature_2m,
      conditionCode: forecast.current.weather_code,
      condition: weatherDescriptor.label,
      theme: weatherDescriptor.theme,
      isDay: forecast.current.is_day === 1,
      humidity: forecast.current.relative_humidity_2m,
      windSpeed: forecast.current.wind_speed_10m,
      windDirection: forecast.current.wind_direction_10m,
      pressure: forecast.current.surface_pressure,
      visibilityKm: (forecast.current.visibility ?? 0) / 1000,
      uvIndex: forecast.current.uv_index,
      cloudCover: forecast.current.cloud_cover,
      precipitation: forecast.current.precipitation,
      sunrise: daily[0]?.sunrise ?? forecast.current.time,
      sunset: daily[0]?.sunset ?? forecast.current.time,
    },
    hourly: buildHourlyForecast(forecast, currentHourIndex),
    daily,
    airQuality,
    updatedAt: forecast.current.time,
  };
}

export function buildFeelsLikeSummary(report: WeatherReport): string {
  const delta = report.current.feelsLike - report.current.temperature;

  if (Math.abs(delta) < 1.5) {
    return "The air feels close to the actual temperature right now.";
  }

  if (delta > 0) {
    return `It feels warmer than measured due to humidity near ${Math.round(report.current.humidity)}%.`;
  }

  if (report.current.windSpeed > 15) {
    return `Wind around ${Math.round(report.current.windSpeed)} km/h is making it feel cooler.`;
  }

  return "Dry air is making the temperature feel slightly cooler than reported.";
}

export function buildWindSummary(report: WeatherReport): string {
  const direction = toCompassDirection(report.current.windDirection);
  const speed = Math.round(report.current.windSpeed);

  if (speed < 10) {
    return `Light ${direction} wind at ${speed} km/h.`;
  }

  if (speed < 25) {
    return `Steady ${direction} wind around ${speed} km/h.`;
  }

  return `Strong ${direction} wind near ${speed} km/h. Secure loose outdoor items.`;
}

export function buildRainSummary(report: WeatherReport): string {
  const nextHours = report.hourly.slice(0, 6);
  if (nextHours.length === 0) {
    return "Short-term rain probability is currently unavailable.";
  }

  const peakChance = Math.max(
    ...nextHours.map((entry) => entry.precipitationProbability),
  );
  const averagePrecipitation =
    nextHours.reduce((sum, entry) => sum + entry.precipitation, 0) /
    nextHours.length;

  if (peakChance < 20) {
    return "Low rain risk over the next few hours.";
  }

  if (peakChance < 50) {
    return `There is a moderate rain chance, peaking near ${Math.round(peakChance)}%.`;
  }

  if (averagePrecipitation > 0.7) {
    return `Rain is likely soon with peak probability around ${Math.round(peakChance)}%.`;
  }

  return `Rain chance climbs to about ${Math.round(peakChance)}% in the next hours.`;
}

export function buildDaylightSummary(report: WeatherReport): string {
  const today = report.daily[0];
  if (!today) {
    return "Daylight details are currently unavailable.";
  }

  return `Daylight lasts about ${formatDaylightDuration(today.daylightSeconds)} today.`;
}
