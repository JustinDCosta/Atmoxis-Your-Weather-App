export type WeatherTheme =
  | "clear"
  | "cloudy"
  | "rain"
  | "storm"
  | "snow"
  | "mist";

export type GeocodedLocation = {
  id: string;
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type CurrentWeather = {
  time: string;
  temperature: number;
  feelsLike: number;
  high: number;
  low: number;
  conditionCode: number;
  condition: string;
  theme: WeatherTheme;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibilityKm: number;
  uvIndex: number;
  cloudCover: number;
  precipitation: number;
  sunrise: string;
  sunset: string;
};

export type HourlyForecastEntry = {
  time: string;
  temperature: number;
  conditionCode: number;
  condition: string;
  theme: WeatherTheme;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  uvIndex: number;
  isCurrentHour: boolean;
};

export type DailyForecastEntry = {
  date: string;
  high: number;
  low: number;
  conditionCode: number;
  condition: string;
  theme: WeatherTheme;
  precipitationChance: number;
  precipitationTotal: number;
  sunrise: string;
  sunset: string;
  daylightSeconds: number;
};

export type AirQualityBand =
  | "good"
  | "moderate"
  | "unhealthy-sensitive"
  | "unhealthy"
  | "very-unhealthy"
  | "hazardous";

export type AirQualitySnapshot = {
  usAqi: number;
  band: AirQualityBand;
  pm2_5: number;
  pm10: number;
  ozone: number;
  nitrogenDioxide: number;
  sulphurDioxide: number;
  carbonMonoxide: number;
};

export type WeatherReport = {
  location: GeocodedLocation;
  current: CurrentWeather;
  hourly: HourlyForecastEntry[];
  daily: DailyForecastEntry[];
  airQuality?: AirQualitySnapshot;
  updatedAt: string;
};
