import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) return nextResolve(specifier, context);
    const unresolved = path.join(repositoryRoot, specifier.slice(2));
    const resolved = path.extname(unresolved) ? unresolved : `${unresolved}.ts`;
    return { shortCircuit: true, url: pathToFileURL(resolved).href };
  },
});

const {
  isRestaurantOpenAtDateTime,
  isRestaurantOpenNow,
  restaurantLocalNow,
} = await import("../lib/restaurant-hours.ts");

function restaurantWithHours(openingHours) {
  return {
    id: "test",
    name: "Test restaurant",
    category: "Casual",
    tags: [],
    emoji: "🍴",
    area: "Test",
    city: "Test",
    country: "Test",
    address: "Test",
    description: "",
    priceLevel: 2,
    googleMapsUrl: null,
    businessStatus: "OPERATIONAL",
    openingHours,
    position: { lat: 0, lng: 0 },
  };
}

test("specific date and time checks use the selected local weekday and time", () => {
  const restaurant = restaurantWithHours({
    openNow: false,
    weekdayDescriptions: [],
    periods: [{
      open: { day: 2, hour: 11, minute: 30 },
      close: { day: 2, hour: 14, minute: 0 },
    }],
    utcOffsetMinutes: 480,
    updatedAt: "",
  });

  assert.equal(isRestaurantOpenAtDateTime(restaurant, new Date(2026, 6, 28, 12, 0)), true);
  assert.equal(isRestaurantOpenAtDateTime(restaurant, new Date(2026, 6, 28, 14, 0)), false);
});

test("overnight schedules stay open after midnight and close at the exact end time", () => {
  const restaurant = restaurantWithHours({
    openNow: false,
    weekdayDescriptions: [],
    periods: [{
      open: { day: 5, hour: 18, minute: 0 },
      close: { day: 6, hour: 2, minute: 0 },
    }],
    utcOffsetMinutes: 0,
    updatedAt: "",
  });

  assert.equal(isRestaurantOpenAtDateTime(restaurant, new Date(2026, 6, 31, 23, 30)), true);
  assert.equal(isRestaurantOpenAtDateTime(restaurant, new Date(2026, 7, 1, 1, 30)), true);
  assert.equal(isRestaurantOpenAtDateTime(restaurant, new Date(2026, 7, 1, 2, 0)), false);
});

test("open now uses the restaurant timezone rather than the visitor timezone", () => {
  const restaurant = restaurantWithHours({
    openNow: false,
    weekdayDescriptions: [],
    periods: [{
      open: { day: 3, hour: 0, minute: 0 },
      close: { day: 3, hour: 1, minute: 0 },
    }],
    utcOffsetMinutes: 480,
    updatedAt: "",
  });
  const instant = new Date("2026-07-28T16:30:00.000Z");
  const localNow = restaurantLocalNow(restaurant, instant);

  assert.equal(localNow.getDay(), 3);
  assert.equal(localNow.getHours(), 0);
  assert.equal(localNow.getMinutes(), 30);
  assert.equal(isRestaurantOpenNow(restaurant, instant), true);
});

test("open now falls back to Google's current flag when no weekly schedule is available", () => {
  const restaurant = restaurantWithHours({
    openNow: true,
    weekdayDescriptions: [],
    periods: [],
    utcOffsetMinutes: 480,
    updatedAt: "",
  });

  assert.equal(isRestaurantOpenNow(restaurant, new Date("2026-07-28T16:30:00.000Z")), true);
});
