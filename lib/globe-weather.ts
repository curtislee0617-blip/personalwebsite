export type GlobeForecast = {
  timezone: string;
  hourly?: {
    time?: number[];
    cloud_cover?: (number | null)[];
    temperature_2m?: (number | null)[];
    wind_speed_10m?: (number | null)[];
    precipitation_probability?: (number | null)[];
    weather_code?: (number | null)[];
  };
};

export const GLOBE_WEATHER_FIELDS = "cloud_cover,temperature_2m,wind_speed_10m,precipitation_probability,weather_code";

export function globeForecastUrl(latitude: number, longitude: number) {
  const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), hourly: GLOBE_WEATHER_FIELDS, timeformat: "unixtime", timezone: "auto", forecast_days: "7", temperature_unit: "celsius", wind_speed_unit: "kmh" });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}

export function weatherAt(forecast: GlobeForecast | null, instant: Date | null) {
  const times = forecast?.hourly?.time;
  if (!times?.length || !instant || !Number.isFinite(instant.getTime())) return null;
  const target = instant.getTime() / 1000;
  // Hourly buckets cover [timestamp, timestamp + 1 hour); never reuse a distant
  // forecast when the date slider moves outside the available forecast period.
  const index = times.findIndex(time => target >= time && target < time + 3600);
  if (index < 0) return null;
  const value = (field: keyof NonNullable<GlobeForecast["hourly"]>) => {
    const number = forecast?.hourly?.[field]?.[index];
    return typeof number === "number" && Number.isFinite(number) ? number : null;
  };
  return { cloud: value("cloud_cover"), temperature: value("temperature_2m"), wind: value("wind_speed_10m"), rain: value("precipitation_probability"), code: value("weather_code") };
}

export function weatherDescription(code: number | null) {
  if (code === 0) return "Clear";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code !== null && code >= 51 && code <= 57) return "Drizzle";
  if (code !== null && code >= 61 && code <= 67) return "Rain";
  if (code !== null && code >= 71 && code <= 77) return "Snow";
  if (code !== null && code >= 80 && code <= 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code === 95 || code === 96 || code === 99) return "Thunderstorms";
  return "Local weather";
}
