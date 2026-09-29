import assert from "node:assert/strict";
import test from "node:test";
import * as SunCalc from "suncalc";
import { dateInZone, getNightPlan } from "../lib/astronomical-darkness.ts";

test("sunset and astronomical dusk agree with the ephemeris", () => {
  const location = { latitude: 34.0522, longitude: -118.2437 };
  const plan = getNightPlan("2026-09-29", "America/Los_Angeles", location);
  const reference = SunCalc.getTimes(new Date("2026-09-29T19:00:00Z"), location.latitude, location.longitude);
  assert.ok(plan.sunset && reference.sunset);
  assert.ok(plan.astronomicalDusk && reference.night);
  assert.ok(Math.abs(plan.sunset - reference.sunset) < 3 * 60_000);
  assert.ok(Math.abs(plan.astronomicalDusk - reference.night) < 3 * 60_000);
  assert.equal(dateInZone(plan.intervalStart, "America/Los_Angeles"), "2026-09-29");
  assert.equal(dateInZone(plan.intervalEnd, "America/Los_Angeles"), "2026-09-30");
});

test("every reported dark window has both bodies below the horizon", () => {
  const location = { latitude: 34.0522, longitude: -118.2437 };
  const plan = getNightPlan("2026-09-29", "America/Los_Angeles", location);
  assert.ok(plan.windows.length > 0);
  for (const window of plan.windows) {
    const middle = new Date((window.start.getTime() + window.end.getTime()) / 2);
    assert.ok(SunCalc.getPosition(middle, location.latitude, location.longitude).altitude < -18);
    assert.ok(SunCalc.getMoonPosition(middle, location.latitude, location.longitude).altitude < 0);
    assert.ok(window.end > window.start);
  }
});

test("polar summer does not invent an astronomical darkness window", () => {
  const plan = getNightPlan("2026-06-21", "Europe/Oslo", { latitude: 69.6492, longitude: 18.9553 });
  assert.equal(plan.astronomicalMinutes, 0);
  assert.deepEqual(plan.windows, []);
  assert.equal(plan.astronomicalDusk, null);
});

test("night boundaries follow the selected location's calendar date", () => {
  const plan = getNightPlan("2026-12-21", "Asia/Tokyo", { latitude: 35.6762, longitude: 139.6503 });
  assert.equal(dateInZone(plan.intervalStart, "Asia/Tokyo"), "2026-12-21");
  assert.equal(dateInZone(plan.intervalEnd, "Asia/Tokyo"), "2026-12-22");
  assert.ok(plan.intervalEnd > plan.intervalStart);
});

test("night interval follows daylight-saving clock changes", () => {
  const location = { latitude: 34.0522, longitude: -118.2437 };
  const spring = getNightPlan("2026-03-07", "America/Los_Angeles", location);
  const autumn = getNightPlan("2026-10-31", "America/Los_Angeles", location);
  assert.equal((spring.intervalEnd - spring.intervalStart) / 3_600_000, 23);
  assert.equal((autumn.intervalEnd - autumn.intervalStart) / 3_600_000, 25);
});
