# Atmoxis

Atmoxis is a production-quality weather web app focused on premium UX, atmospheric visuals, and practical weather intelligence.

## Highlights

- Current weather with feels-like, high/low, humidity, wind, pressure, visibility, UV, cloud cover, and sunrise/sunset
- City search with debounced autocomplete and invalid-location handling
- Geolocation with graceful fallback when permissions are denied or unavailable
- 24-hour forecast with animated temperature chart
- 7-day forecast with condition-aware visuals and precipitation/daylight details
- Air quality insights (US AQI + pollutant breakdown)
- Human-readable weather insights (feels-like, wind, rain chance, daylight)
- Dynamic atmospheric background based on weather condition and day/night
- Saved and recent locations persisted locally
- Accessible controls, responsive layout, and reduced-motion friendly behavior

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion
- Recharts
- Zustand (persisted local state)
- Open-Meteo APIs (forecast, geocoding, reverse geocoding, air quality)

## Free APIs Used

- Forecast: https://api.open-meteo.com/v1/forecast
- Geocoding: https://geocoding-api.open-meteo.com/v1/search
- Reverse geocoding: https://geocoding-api.open-meteo.com/v1/reverse
- Air quality: https://air-quality-api.open-meteo.com/v1/air-quality

No API key is required for the current integration.

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production Checks

```bash
npm run lint
npm run build
```

## Project Structure

- src/app: app router layout and page entry
- src/components/ui: shared UI primitives
- src/components/weather: weather feature modules
- src/lib/weather: typed API client, formatters, domain models
- src/store: persisted client-side preferences

## Notes

- The app is built to degrade gracefully when one data source fails (for example, AQI feed unavailable while forecast still loads).
- No secrets are exposed on the client; all integrations use free public endpoints.
