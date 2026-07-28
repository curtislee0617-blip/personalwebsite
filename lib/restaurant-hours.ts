import type { Restaurant } from "@/data/restaurants";

function parseTimeLabel(timeLabel: string) {
  const normalized = timeLabel.replace(/\u202f/g, " ").trim();
  const amPmMatch = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (amPmMatch) {
    const rawHour = Number(amPmMatch[1]);
    const minute = Number(amPmMatch[2] ?? "0");
    const meridiem = amPmMatch[3].toUpperCase();
    let hour = rawHour % 12;
    if (meridiem === "PM") hour += 12;
    return hour * 60 + minute;
  }

  const twentyFourHourMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2] ?? "0");
    if (hour >= 0 && hour <= 24 && minute >= 0 && minute < 60) {
      return (hour % 24) * 60 + minute;
    }
  }

  return null;
}

function parseTimeLabelWithFallback(timeLabel: string, fallbackMeridiem: "AM" | "PM" | null) {
  const direct = parseTimeLabel(timeLabel);
  if (direct !== null) return direct;

  if (!fallbackMeridiem) return null;
  return parseTimeLabel(`${timeLabel} ${fallbackMeridiem}`);
}

function extractMeridiem(timeLabel: string) {
  const match = timeLabel.replace(/\u202f/g, " ").trim().match(/\b(AM|PM)\b/i);
  if (!match) return null;
  return match[1].toUpperCase() as "AM" | "PM";
}

function parseTimeRange(segment: string) {
  const normalized = segment.replace(/\u2009/g, " ").replace(/\u202f/g, " ").trim();
  if (/open 24 hours/i.test(normalized)) return { start: 0, end: 0 };
  const parts = normalized.split(/–|-/).map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 2) return null;
  const fallbackMeridiem = extractMeridiem(parts[1]);
  const start = parseTimeLabelWithFallback(parts[0], fallbackMeridiem);
  const end = parseTimeLabel(parts[1]);
  if (start === null || end === null) return null;
  return { start, end };
}

function isOpenFromStructuredPeriods(restaurant: Restaurant, targetDateTime: Date) {
  const periods = restaurant.openingHours?.periods ?? [];
  if (!periods.length) return null;

  const targetDay = targetDateTime.getDay();
  const targetMinutes = targetDateTime.getHours() * 60 + targetDateTime.getMinutes();
  const targetAbsoluteMinutes = targetDay * 1440 + targetMinutes;

  return periods.some((period) => {
    const open = period.open;
    const close = period.close;
    const openAbsoluteMinutes = open.day * 1440 + open.hour * 60 + open.minute;

    // Google represents an always-open venue as one opening period without a
    // closing value. It applies to the whole week, not just the opening day.
    if (!close) return true;

    let closeAbsoluteMinutes = close.day * 1440 + close.hour * 60 + close.minute;
    if (closeAbsoluteMinutes <= openAbsoluteMinutes) closeAbsoluteMinutes += 7 * 1440;

    const normalizedTargetMinutes = targetAbsoluteMinutes < openAbsoluteMinutes
      ? targetAbsoluteMinutes + 7 * 1440
      : targetAbsoluteMinutes;

    return normalizedTargetMinutes >= openAbsoluteMinutes && normalizedTargetMinutes < closeAbsoluteMinutes;
  });
}

export function isRestaurantOpenAtDateTime(restaurant: Restaurant, targetDateTime: Date) {
  const structuredMatch = isOpenFromStructuredPeriods(restaurant, targetDateTime);
  if (structuredMatch !== null) return structuredMatch;

  const weekdayDescriptions = restaurant.openingHours?.weekdayDescriptions ?? [];
  if (!weekdayDescriptions.length) return false;

  const targetMinutes = targetDateTime.getHours() * 60 + targetDateTime.getMinutes();
  const weekdayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(targetDateTime);
  const previousDay = new Date(targetDateTime);
  previousDay.setDate(previousDay.getDate() - 1);
  const previousWeekdayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(previousDay);

  function rangesForDay(dayName: string) {
    const matchingDay = weekdayDescriptions.find((line) =>
      line.toLocaleLowerCase("en").startsWith(dayName.toLocaleLowerCase("en"))
    );
    if (!matchingDay || /closed/i.test(matchingDay)) return [];
    const schedule = matchingDay.split(":").slice(1).join(":").trim();
    if (!schedule) return [];
    return schedule
      .split(",")
      .map((segment) => parseTimeRange(segment.trim()))
      .filter((range): range is { start: number; end: number } => Boolean(range));
  }

  const todayMatch = rangesForDay(weekdayName).some(({ start, end }) => {
    if (start === end) return true;
    if (start < end) return targetMinutes >= start && targetMinutes < end;
    return targetMinutes >= start || targetMinutes < end;
  });

  if (todayMatch) return true;

  return rangesForDay(previousWeekdayName).some(({ start, end }) =>
    start > end && targetMinutes < end
  );
}

export function restaurantLocalNow(restaurant: Restaurant, now = new Date()) {
  const restaurantOffset = restaurant.openingHours?.utcOffsetMinutes;
  if (typeof restaurantOffset !== "number") return now;

  // Date getters use the browser timezone. Shift the instant so those getters
  // expose the restaurant's current local wall-clock day and time instead.
  const browserOffset = -now.getTimezoneOffset();
  return new Date(now.getTime() + (restaurantOffset - browserOffset) * 60_000);
}

export function isRestaurantOpenNow(restaurant: Restaurant, now = new Date()) {
  const openingHours = restaurant.openingHours;
  if (!openingHours) return false;

  const hasSchedule = Boolean(openingHours.periods?.length || openingHours.weekdayDescriptions.length);
  if (!hasSchedule) return openingHours.openNow;

  return isRestaurantOpenAtDateTime(restaurant, restaurantLocalNow(restaurant, now));
}
