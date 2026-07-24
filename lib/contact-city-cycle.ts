export const cityTimeZones = {
  hongKong: "Asia/Hong_Kong",
  london: "Europe/London",
  losAngeles: "America/Los_Angeles",
} as const;

export type CityKey = keyof typeof cityTimeZones;

const cityCoordinates: Record<CityKey, { latitude: number; longitude: number }> = {
  hongKong: { latitude: 22.3193, longitude: 114.1694 },
  london: { latitude: 51.5072, longitude: -0.1276 },
  losAngeles: { latitude: 34.0522, longitude: -118.2437 },
};

type CitySolarTimes = {
  hasNauticalNight: boolean;
  nauticalDawn: number;
  nauticalDusk: number;
  sunrise: number;
  sunset: number;
};

export type CityCycle = {
  blueHour: number;
  cityNight: number;
  dawn: number;
  daylight: number;
  goldenHour: number;
  moonOpacity: number;
  moonX: number;
  moonY: number;
  night: number;
  sunset: number;
  stars: number;
  sunOpacity: number;
  sunWarmth: number;
  sunX: number;
  sunY: number;
};

export type MoonPhase = {
  illumination: number;
  label:
    | "New Moon"
    | "Waxing Crescent"
    | "First Quarter"
    | "Waxing Gibbous"
    | "Full Moon"
    | "Waning Gibbous"
    | "Third Quarter"
    | "Waning Crescent";
  phase: number;
  visibility: number;
  waxing: boolean;
};

const astronomicalUnitInKilometres = 149_598_000;
const daysFromUnixEpochToJ2000 = 2_451_545;
const julianDateAtUnixEpoch = 2_440_588;
const millisecondsPerDay = 86_400_000;
const radians = Math.PI / 180;

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function smootherstep(value: number) {
  const progress = clamp(value);
  return progress ** 3 * (progress * (progress * 6 - 15) + 10);
}

function rightAscension(longitude: number, latitude: number) {
  const obliquity = radians * 23.4397;

  return Math.atan2(
    Math.sin(longitude) * Math.cos(obliquity)
      - Math.tan(latitude) * Math.sin(obliquity),
    Math.cos(longitude),
  );
}

function declination(longitude: number, latitude: number) {
  const obliquity = radians * 23.4397;

  return Math.asin(
    Math.sin(latitude) * Math.cos(obliquity)
      + Math.cos(latitude) * Math.sin(obliquity) * Math.sin(longitude),
  );
}

function getSunCoordinates(daysSinceJ2000: number) {
  const anomaly = radians * (357.5291 + 0.98560028 * daysSinceJ2000);
  const equationOfCentre = radians * (
    1.9148 * Math.sin(anomaly)
      + 0.02 * Math.sin(2 * anomaly)
      + 0.0003 * Math.sin(3 * anomaly)
  );
  const longitude = anomaly + equationOfCentre + radians * 102.9372 + Math.PI;

  return {
    declination: declination(longitude, 0),
    rightAscension: rightAscension(longitude, 0),
  };
}

function getMoonCoordinates(daysSinceJ2000: number) {
  const meanLongitude = radians * (218.316 + 13.176396 * daysSinceJ2000);
  const anomaly = radians * (134.963 + 13.064993 * daysSinceJ2000);
  const distanceFromNode = radians * (93.272 + 13.22935 * daysSinceJ2000);
  const longitude = meanLongitude + radians * 6.289 * Math.sin(anomaly);
  const latitude = radians * 5.128 * Math.sin(distanceFromNode);

  return {
    declination: declination(longitude, latitude),
    distance: 385_001 - 20_905 * Math.cos(anomaly),
    rightAscension: rightAscension(longitude, latitude),
  };
}

function getMoonPhaseLabel(phase: number): MoonPhase["label"] {
  if (phase < 0.02 || phase >= 0.98) return "New Moon";
  if (phase < 0.235) return "Waxing Crescent";
  if (phase < 0.265) return "First Quarter";
  if (phase < 0.48) return "Waxing Gibbous";
  if (phase < 0.52) return "Full Moon";
  if (phase < 0.735) return "Waning Gibbous";
  if (phase < 0.765) return "Third Quarter";
  return "Waning Crescent";
}

export function getMoonPhase(now: Date | null): MoonPhase {
  if (!now) {
    return {
      illumination: 1,
      label: "Full Moon",
      phase: 0.5,
      visibility: 1,
      waxing: true,
    };
  }

  const julianDate = now.valueOf() / millisecondsPerDay
    - 0.5
    + julianDateAtUnixEpoch;
  const daysSinceJ2000 = julianDate - daysFromUnixEpochToJ2000;
  const sun = getSunCoordinates(daysSinceJ2000);
  const moon = getMoonCoordinates(daysSinceJ2000);
  const angularDistance = Math.acos(clamp(
    Math.sin(sun.declination) * Math.sin(moon.declination)
      + Math.cos(sun.declination) * Math.cos(moon.declination)
      * Math.cos(sun.rightAscension - moon.rightAscension),
    -1,
    1,
  ));
  const incidence = Math.atan2(
    astronomicalUnitInKilometres * Math.sin(angularDistance),
    moon.distance - astronomicalUnitInKilometres * Math.cos(angularDistance),
  );
  const positionAngle = Math.atan2(
    Math.cos(sun.declination)
      * Math.sin(sun.rightAscension - moon.rightAscension),
    Math.sin(sun.declination) * Math.cos(moon.declination)
      - Math.cos(sun.declination) * Math.sin(moon.declination)
      * Math.cos(sun.rightAscension - moon.rightAscension),
  );
  const illumination = clamp((1 + Math.cos(incidence)) / 2);
  const phase = clamp(
    0.5 + 0.5 * incidence * (positionAngle < 0 ? -1 : 1) / Math.PI,
  );

  return {
    illumination,
    label: getMoonPhaseLabel(phase),
    phase,
    visibility: Math.sqrt(illumination),
    waxing: phase < 0.5,
  };
}

function ramp(minutes: number, start: number, end: number) {
  return smootherstep((minutes - start) / (end - start));
}

function band(minutes: number, riseStart: number, riseEnd: number, fallStart: number, fallEnd: number) {
  return ramp(minutes, riseStart, riseEnd) * (1 - ramp(minutes, fallStart, fallEnd));
}

function smoothUnion(...values: number[]) {
  return 1 - values.reduce(
    (remaining, value) => remaining * (1 - clamp(value)),
    1,
  );
}

function lingerNearMidday(progress: number) {
  const clampedProgress = clamp(progress);

  // Move briskly through the low sky, then slow near the apex without ever
  // reversing direction. This keeps the sun present over each city longer.
  return clamp(clampedProgress + 0.1 * Math.sin(2 * Math.PI * clampedProgress));
}

export function getZonedMinutes(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return value("hour") * 60 + value("minute") + value("second") / 60;
}

function getZonedDateKey(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function getSunAltitudeDegrees(now: Date, coordinates: { latitude: number; longitude: number }) {
  const daysSinceJ2000 = now.valueOf() / millisecondsPerDay - 0.5 + julianDateAtUnixEpoch - daysFromUnixEpochToJ2000;
  const sun = getSunCoordinates(daysSinceJ2000);
  const latitude = coordinates.latitude * radians;
  const longitudeWest = -coordinates.longitude * radians;
  const siderealTime = radians * (280.16 + 360.9856235 * daysSinceJ2000) - longitudeWest;
  const hourAngle = siderealTime - sun.rightAscension;

  return Math.asin(
    Math.sin(latitude) * Math.sin(sun.declination)
      + Math.cos(latitude) * Math.cos(sun.declination) * Math.cos(hourAngle),
  ) / radians;
}

function refineSolarCrossing(start: number, end: number, altitude: number, coordinates: { latitude: number; longitude: number }, rising: boolean) {
  let lower = start;
  let upper = end;
  for (let index = 0; index < 24; index += 1) {
    const midpoint = (lower + upper) / 2;
    const aboveTarget = getSunAltitudeDegrees(new Date(midpoint), coordinates) > altitude;
    if (aboveTarget === rising) upper = midpoint;
    else lower = midpoint;
  }
  return new Date((lower + upper) / 2);
}

function getSolarCrossings(now: Date, timeZone: string, coordinates: { latitude: number; longitude: number }, altitude: number) {
  const localDate = getZonedDateKey(now, timeZone);
  const step = 5 * 60 * 1000;
  const start = now.valueOf() - 30 * 60 * 60 * 1000;
  const end = now.valueOf() + 30 * 60 * 60 * 1000;
  let previousTime = start;
  let previousAltitude = getSunAltitudeDegrees(new Date(previousTime), coordinates);
  let rising: Date | null = null;
  let setting: Date | null = null;

  for (let time = start + step; time <= end; time += step) {
    const currentAltitude = getSunAltitudeDegrees(new Date(time), coordinates);
    const crossesUpward = previousAltitude <= altitude && currentAltitude > altitude;
    const crossesDownward = previousAltitude >= altitude && currentAltitude < altitude;

    if (crossesUpward || crossesDownward) {
      const event = refineSolarCrossing(previousTime, time, altitude, coordinates, crossesUpward);
      if (getZonedDateKey(event, timeZone) === localDate) {
        if (crossesUpward) rising = event;
        else setting = event;
      }
    }

    previousTime = time;
    previousAltitude = currentAltitude;
  }

  return { rising, setting };
}

const solarTimesCache = new Map<string, CitySolarTimes>();

function fallbackSolarTimes(city?: CityKey): CitySolarTimes {
  const sunrise = city === "losAngeles" ? 5.75 * 60 : 6 * 60;
  const sunset = 18.75 * 60;
  return {
    hasNauticalNight: false,
    nauticalDawn: sunrise - 80,
    nauticalDusk: sunset + 80,
    sunrise,
    sunset,
  };
}

function getCitySolarTimes(now: Date, timeZone: string, city?: CityKey): CitySolarTimes {
  if (!city) return fallbackSolarTimes();
  const cacheKey = `${city}:${getZonedDateKey(now, timeZone)}`;
  const cached = solarTimesCache.get(cacheKey);
  if (cached) return cached;

  const coordinates = cityCoordinates[city];
  // −0.833° approximates apparent sunrise/sunset (solar radius plus refraction).
  const apparent = getSolarCrossings(now, timeZone, coordinates, -0.833);
  // Nautical twilight (−12°) gives a naturally dark scene without stretching
  // the transition all the way to astronomical darkness at −18°.
  const nautical = getSolarCrossings(now, timeZone, coordinates, -12);
  const fallback = fallbackSolarTimes(city);
  const sunrise = apparent.rising ? getZonedMinutes(apparent.rising, timeZone) : fallback.sunrise;
  const sunset = apparent.setting ? getZonedMinutes(apparent.setting, timeZone) : fallback.sunset;
  const hasNauticalNight = Boolean(nautical.rising && nautical.setting);
  const result = {
    hasNauticalNight,
    nauticalDawn: nautical.rising ? getZonedMinutes(nautical.rising, timeZone) : sunrise - 80,
    nauticalDusk: nautical.setting ? getZonedMinutes(nautical.setting, timeZone) : sunset + 80,
    sunrise,
    sunset,
  };
  solarTimesCache.set(cacheKey, result);
  return result;
}

function getCityCycleFromSolarTimes(minutes: number, solar: CitySolarTimes): CityCycle {
  const morningTransition = ramp(minutes, solar.nauticalDawn, solar.sunrise);
  const eveningTransition = ramp(minutes, solar.sunset, solar.nauticalDusk);
  const daylight = morningTransition * (1 - eveningTransition);
  const cityNightBase = Math.max(1 - morningTransition, eveningTransition);
  // At exceptional latitudes where nautical dusk never occurs, retain a muted
  // twilight instead of showing a false full-night scene.
  const night = solar.hasNauticalNight ? cityNightBase : cityNightBase * 0.72;
  // Keep the pixel-art foreground crisp: use the day scene from sunrise until
  // sunset, then switch directly to the night scene instead of cross-fading.
  const cityNight = minutes < solar.sunrise || minutes >= solar.sunset ? 1 : 0;
  const dawnSpan = solar.sunrise - solar.nauticalDawn;
  const duskSpan = solar.nauticalDusk - solar.sunset;
  const dawn = band(minutes, solar.nauticalDawn, solar.sunrise - dawnSpan * 0.2, solar.sunrise + 15, solar.sunrise + 75);
  const morningGolden = band(minutes, solar.sunrise, solar.sunrise + 20, solar.sunrise + 85, solar.sunrise + 140);
  const eveningGolden = band(minutes, solar.sunset - 115, solar.sunset - 55, solar.sunset - 5, solar.sunset + 15);
  const goldenHour = smoothUnion(morningGolden, eveningGolden);
  const sunset = band(minutes, solar.sunset - 75, solar.sunset - 15, solar.sunset + 10, solar.nauticalDusk);
  const blueHour = clamp(
    band(minutes, solar.nauticalDawn, solar.nauticalDawn + dawnSpan * 0.6, solar.sunrise, solar.sunrise + 25)
      + band(minutes, solar.sunset - 25, solar.sunset, solar.nauticalDusk - duskSpan * 0.15, solar.nauticalDusk),
  ) * (1 - 0.72 * Math.max(dawn, sunset));
  const sunProgress = lingerNearMidday((minutes - solar.sunrise) / (solar.sunset - solar.sunrise));
  const stars = night;
  const moonDuration = solar.nauticalDawn + 24 * 60 - solar.nauticalDusk;
  const moonElapsed = (minutes - solar.nauticalDusk + 24 * 60) % (24 * 60);
  const moonProgress = lingerNearMidday(clamp(moonElapsed / moonDuration));
  const sunX = 97 - 94 * sunProgress;

  return {
    blueHour,
    cityNight,
    dawn,
    daylight,
    goldenHour,
    moonOpacity: stars,
    moonX: 92 - 84 * moonProgress,
    moonY: 50 - 27 * Math.sin(Math.PI * moonProgress) ** 0.86,
    night,
    sunset,
    stars,
    sunOpacity: ramp(minutes, solar.sunrise, solar.sunrise + 20)
      * (1 - ramp(minutes, solar.sunset - 20, solar.sunset)),
    sunWarmth: smoothUnion(dawn * 0.92, sunset, goldenHour * 0.42),
    sunX,
    sunY: 55 - 32 * Math.sin(Math.PI * sunProgress) ** 0.86,
  };
}

export function getCityCycleAtMinutes(minutes: number, city?: CityKey): CityCycle {
  return getCityCycleFromSolarTimes(minutes, fallbackSolarTimes(city));
}

export function getCityCycle(now: Date | null, timeZone: string, city?: CityKey) {
  if (!now) {
    return {
      blueHour: 0,
      cityNight: 0,
      dawn: 0,
      daylight: 1,
      goldenHour: 0,
      moonOpacity: 0,
      moonX: 3,
      moonY: 55,
      night: 0,
      sunset: 0,
      stars: 0,
      sunOpacity: 0,
      sunWarmth: 0,
      sunX: 3,
      sunY: 55,
    } satisfies CityCycle;
  }

  return getCityCycleFromSolarTimes(
    getZonedMinutes(now, timeZone),
    getCitySolarTimes(now, timeZone, city),
  );
}

type ContactCelestialCity = {
  cycle: CityCycle;
  key: "losAngeles" | "london" | "hongKong";
  left: number;
  width: number;
};

type ContactCelestialCandidate = {
  cityIndex: number;
  kind: "moon" | "sun";
  opacity: number;
  owner: ContactCelestialCity["key"];
  score: number;
  warmth: number;
  x: number;
  y: number;
};

export type ContactCelestial = Omit<ContactCelestialCandidate, "cityIndex" | "score">;

export function getContactCelestial(
  cities: ContactCelestialCity[],
  moonVisibility = 1,
  onlyKind?: ContactCelestialCandidate["kind"],
): ContactCelestial {
  const candidates = cities.flatMap(({ cycle, key, left, width }, cityIndex) => {
    const makeCandidate = (
      kind: ContactCelestialCandidate["kind"],
      opacity: number,
      localX: number,
      y: number,
    ): ContactCelestialCandidate => {
      const altitude = clamp((55 - y) / 48);

      return {
        cityIndex,
        kind,
        opacity,
        owner: key,
        score: opacity * (0.18 + 0.82 * altitude ** 2),
        warmth: kind === "sun" ? cycle.sunWarmth : 0,
        x: (left + width * localX / 100) * 100,
        y,
      };
    };

    return [
      makeCandidate("sun", cycle.sunOpacity, cycle.sunX, cycle.sunY),
      makeCandidate(
        "moon",
        cycle.moonOpacity
          * moonVisibility
          * smootherstep((55 - cycle.moonY) / 8),
        cycle.moonX,
        cycle.moonY,
      ),
    ];
  });
  const adjacentPairs = [[0, 1], [1, 2]] as const;
  const kinds: ContactCelestialCandidate["kind"][] = onlyKind
    ? [onlyKind]
    : ["sun", "moon"];
  const groups = kinds.flatMap((kind) =>
    adjacentPairs.map((pair) => {
      const members = candidates.filter(
        (candidate) => candidate.kind === kind
          && (candidate.cityIndex === pair[0] || candidate.cityIndex === pair[1]),
      );

      return {
        kind,
        members,
        score: members.reduce((total, candidate) => total + candidate.score, 0),
      };
    }),
  ).sort((first, second) => second.score - first.score);
  const winningGroup = groups[0];
  const competingGroup = onlyKind
    ? undefined
    : groups.find((group) => group.kind !== winningGroup.kind) ?? groups[1];
  const lead = [...winningGroup.members].sort(
    (first, second) => second.score - first.score,
  )[0];
  const totalWeight = winningGroup.members.reduce(
    (total, candidate) => total + candidate.score,
    0,
  );
  const weightedValue = (property: "opacity" | "warmth" | "x" | "y") =>
    totalWeight === 0
      ? lead[property]
      : winningGroup.members.reduce(
          (total, candidate) => total + candidate[property] * candidate.score,
          0,
        ) / totalWeight;
  const handoffMargin = !competingGroup || winningGroup.score === 0
    ? 0
    : (winningGroup.score - competingGroup.score) / winningGroup.score;
  const handoffOpacity = competingGroup
    ? smootherstep(handoffMargin / 0.035)
    : 1;

  return {
    kind: winningGroup.kind,
    opacity: weightedValue("opacity") * handoffOpacity,
    owner: lead.owner,
    warmth: weightedValue("warmth"),
    x: onlyKind === "moon" ? lead.x : weightedValue("x"),
    y: onlyKind === "moon" ? lead.y : weightedValue("y"),
  };
}
