import { weatherAt, weatherDescription, type GlobeForecast } from "@/lib/globe-weather";

export function GlobeWeather({ forecast, instant, compact = false }: { forecast: GlobeForecast | null; instant: Date | null; compact?: boolean }) {
  const weather = weatherAt(forecast, instant);
  const number = (value: number | null, unit: string) => value === null ? "—" : `${Math.round(value)}${unit}`;
  if (compact) return <small className="tool-earth-weather">{weather ? `${weatherDescription(weather.code)} · ${number(weather.temperature, "°C")} · Wind ${number(weather.wind, " km/h")}` : "Local forecast unavailable"}</small>;
  return <div className="astro-earth-weather">
    <span className="astro-earth-kicker">Weather at selected hour</span>
    {weather ? <><p>{weatherDescription(weather.code)} <strong>{number(weather.temperature, "°C")}</strong></p><dl>
      <div><dt>Cloud cover</dt><dd>{number(weather.cloud, "%")}</dd></div>
      <div><dt>Wind</dt><dd>{number(weather.wind, " km/h")}</dd></div>
      <div><dt>Rain chance</dt><dd>{number(weather.rain, "%")}</dd></div>
    </dl></> : <p>Forecast unavailable for this hour.</p>}
    <small>Hourly forecast · Open-Meteo</small>
  </div>;
}
