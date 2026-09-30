import assert from "node:assert/strict";
import test from "node:test";
import { weatherAt, globeForecastUrl, weatherDescription } from "../lib/globe-weather.ts";

const start = Date.parse("2026-09-29T18:00:00Z");
const forecast = { timezone: "America/Los_Angeles", hourly: {
  time: [start / 1000, start / 1000 + 3600],
  cloud_cover: [20, 75], temperature_2m: [24, 22], wind_speed_10m: [10, 15],
  precipitation_probability: [0, 50], weather_code: [1, 61],
} };

test("weather follows the selected hour, including the exact hour boundary", () => {
  assert.equal(weatherAt(forecast, new Date(start + 3599999)).cloud, 20);
  assert.equal(weatherAt(forecast, new Date(start + 3600000)).cloud, 75);
  assert.equal(weatherAt(forecast, new Date(start + 3600000)).temperature, 22);
});

test("outside forecast dates and missing readings never become invented weather", () => {
  assert.equal(weatherAt(forecast, new Date(start - 1)), null);
  assert.equal(weatherAt(forecast, new Date(start + 7200000)), null);
  assert.equal(weatherAt(null, new Date(start)), null);
  assert.equal(weatherAt(forecast, new Date(NaN)), null);
  const missing = { ...forecast, hourly: { ...forecast.hourly, temperature_2m: [null], wind_speed_10m: [] } };
  assert.equal(weatherAt(missing, new Date(start)).temperature, null);
  assert.equal(weatherAt(missing, new Date(start)).wind, null);
});

test("weather request and labels use explicit units and WMO codes", () => {
  const url = new URL(globeForecastUrl(22.3193, 114.1694));
  assert.equal(url.searchParams.get("longitude"), "114.1694");
  assert.equal(url.searchParams.get("timeformat"), "unixtime");
  assert.equal(url.searchParams.get("temperature_unit"), "celsius");
  assert.equal(url.searchParams.get("wind_speed_unit"), "kmh");
  assert.equal(weatherDescription(61), "Rain");
  assert.equal(weatherDescription(null), "Local weather");
});
