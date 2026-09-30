import { getMoonIllumination, getMoonPosition, getPosition } from "suncalc";

export type Coordinates = { latitude: number; longitude: number };
export type DarkWindow = { start: Date; end: Date; minutes: number };
type Crossing = { at: Date; direction: "rising" | "setting" };

export type NightPlan = {
  intervalStart: Date;
  intervalEnd: Date;
  sunset: Date | null;
  civilDusk: Date | null;
  nauticalDusk: Date | null;
  astronomicalDusk: Date | null;
  astronomicalDawn: Date | null;
  sunrise: Date | null;
  moonrise: Date | null;
  moonset: Date | null;
  moonPhase: string;
  moonIllumination: number;
  sunBelowHorizonWindows: DarkWindow[];
  astronomicalMinutes: number;
  astronomicalWindows: DarkWindow[];
  windows: DarkWindow[];
};

const minute = 60_000;

function zonedParts(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const value = (kind: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === kind)?.value ?? 0);
  return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour"), minute: value("minute") };
}

export function dateInZone(instant: Date, timeZone: string) {
  const { year, month, day } = zonedParts(instant, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function localTime(date: string, timeZone: string, hour = 12) {
  const [year, month, day] = date.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day, hour);
  let guess = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const local = zonedParts(new Date(guess), timeZone);
    const represented = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute);
    guess += target - represented;
  }
  return new Date(guess);
}

function nextDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1, 12)).toISOString().slice(0, 10);
}

export function getDayInterval(date: string, timeZone: string) {
  return { start: localTime(date, timeZone, 0), end: localTime(nextDate(date), timeZone, 0) };
}

function altitude(instant: Date, location: Coordinates, body: "sun" | "moon") {
  const { latitude, longitude } = location;
  return body === "sun"
    ? getPosition(instant, latitude, longitude).altitude
    : getMoonPosition(instant, latitude, longitude).altitude;
}

function crossings(start: Date, end: Date, location: Coordinates, body: "sun" | "moon", threshold: number) {
  const events: Crossing[] = [];
  const step = 5 * minute;
  let previousAt = start.getTime();
  let previous = altitude(start, location, body) - threshold;

  for (let time = previousAt + step; time <= end.getTime(); time += step) {
    const current = altitude(new Date(time), location, body) - threshold;
    if ((previous < 0 && current >= 0) || (previous >= 0 && current < 0)) {
      let low = previousAt;
      let high = time;
      for (let attempt = 0; attempt < 18; attempt += 1) {
        const middle = (low + high) / 2;
        const middleValue = altitude(new Date(middle), location, body) - threshold;
        if ((middleValue >= 0) === (previous >= 0)) low = middle;
        else high = middle;
      }
      events.push({ at: new Date((low + high) / 2), direction: current >= 0 ? "rising" : "setting" });
    }
    previousAt = time;
    previous = current;
  }
  return events;
}

function first(events: Crossing[], direction: Crossing["direction"]) {
  return events.find((event) => event.direction === direction)?.at ?? null;
}

function phaseName(phase: number) {
  if (phase < 0.035 || phase >= 0.965) return "New Moon";
  if (phase < 0.215) return "Waxing crescent";
  if (phase < 0.285) return "First quarter";
  if (phase < 0.465) return "Waxing gibbous";
  if (phase < 0.535) return "Full Moon";
  if (phase < 0.715) return "Waning gibbous";
  if (phase < 0.785) return "Last quarter";
  return "Waning crescent";
}

export function getNightPlan(date: string, timeZone: string, location: Coordinates): NightPlan {
  const start = localTime(date, timeZone);
  const end = localTime(nextDate(date), timeZone);
  const solar = {
    horizon: crossings(start, end, location, "sun", -0.833),
    civil: crossings(start, end, location, "sun", -6),
    nautical: crossings(start, end, location, "sun", -12),
    astronomical: crossings(start, end, location, "sun", -18),
  };
  const lunar = crossings(start, end, location, "moon", 0);
  const boundaries = [start.getTime(), end.getTime(),
    ...solar.horizon.map((event) => event.at.getTime()),
    ...solar.astronomical.map((event) => event.at.getTime()),
    ...lunar.map((event) => event.at.getTime())].sort((a, b) => a - b);
  const windows: DarkWindow[] = [];
  const sunBelowHorizonWindows: DarkWindow[] = [];
  const astronomicalWindows: DarkWindow[] = [];
  let astronomicalMinutes = 0;

  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const from = boundaries[index];
    const to = boundaries[index + 1];
    if (to <= from) continue;
    const middle = new Date((from + to) / 2);
    const sunAltitude = altitude(middle, location, "sun");
    if (sunAltitude < -0.833) {
      const previous = sunBelowHorizonWindows[sunBelowHorizonWindows.length - 1];
      if (previous && Math.abs(previous.end.getTime() - from) < 1000) {
        previous.end = new Date(to);
        previous.minutes = (to - previous.start.getTime()) / minute;
      } else {
        sunBelowHorizonWindows.push({ start: new Date(from), end: new Date(to), minutes: (to - from) / minute });
      }
    }
    if (sunAltitude >= -18) continue;
    astronomicalMinutes += (to - from) / minute;
    const lastAstronomical = astronomicalWindows[astronomicalWindows.length - 1];
    if (lastAstronomical && Math.abs(lastAstronomical.end.getTime() - from) < 1000) {
      lastAstronomical.end = new Date(to);
      lastAstronomical.minutes = (to - lastAstronomical.start.getTime()) / minute;
    } else {
      astronomicalWindows.push({ start: new Date(from), end: new Date(to), minutes: (to - from) / minute });
    }
    if (altitude(middle, location, "moon") >= 0) continue;
    const previous = windows[windows.length - 1];
    if (previous && Math.abs(previous.end.getTime() - from) < 1000) {
      previous.end = new Date(to);
      previous.minutes = (to - previous.start.getTime()) / minute;
    } else {
      windows.push({ start: new Date(from), end: new Date(to), minutes: (to - from) / minute });
    }
  }

  const illumination = getMoonIllumination(new Date((start.getTime() + end.getTime()) / 2));
  return {
    intervalStart: start,
    intervalEnd: end,
    sunset: first(solar.horizon, "setting"),
    civilDusk: first(solar.civil, "setting"),
    nauticalDusk: first(solar.nautical, "setting"),
    astronomicalDusk: first(solar.astronomical, "setting"),
    astronomicalDawn: first(solar.astronomical, "rising"),
    sunrise: first(solar.horizon, "rising"),
    moonrise: first(lunar, "rising"),
    moonset: first(lunar, "setting"),
    moonPhase: phaseName(illumination.phase),
    moonIllumination: illumination.fraction,
    sunBelowHorizonWindows,
    astronomicalMinutes,
    astronomicalWindows,
    windows,
  };
}

export function getCurrentSky(instant: Date, location: Coordinates) {
  return {
    sunAltitude: altitude(instant, location, "sun"),
    moonAltitude: altitude(instant, location, "moon"),
  };
}
