export const cityTimeZones = {
  hongKong: "Asia/Hong_Kong",
  london: "Europe/London",
  losAngeles: "America/Los_Angeles",
} as const;

export const cityLightSchedule = {
  sunriseStartsAt: 5 * 60,
  daylightStartsAt: 7 * 60,
  sunsetStartsAt: 18 * 60,
  nightStartsAt: 19.5 * 60,
} as const;

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

export function getCityCycleAtMinutes(minutes: number): CityCycle {
  const { sunriseStartsAt, daylightStartsAt, sunsetStartsAt, nightStartsAt } = cityLightSchedule;
  const daylight = ramp(minutes, sunriseStartsAt, daylightStartsAt)
    * (1 - ramp(minutes, sunsetStartsAt, nightStartsAt));
  const night = 1 - daylight;
  const dawn = band(minutes, sunriseStartsAt, 6 * 60, 6.25 * 60, daylightStartsAt);
  const morningGolden = band(minutes, 5.25 * 60, 6.25 * 60, 6.75 * 60, 8.25 * 60);
  const eveningGolden = band(minutes, 16.5 * 60, 17.75 * 60, 18.25 * 60, nightStartsAt);
  const goldenHour = smoothUnion(morningGolden, eveningGolden);
  const sunset = band(minutes, sunsetStartsAt, 18.75 * 60, 18.83 * 60, nightStartsAt);
  const blueHour = clamp(
    band(minutes, 4 * 60, sunriseStartsAt, 5.5 * 60, 6.5 * 60)
      + band(minutes, 18.67 * 60, nightStartsAt, 20.25 * 60, 21.25 * 60),
  );
  const sunProgress = lingerNearMidday(
    (minutes - sunriseStartsAt) / (nightStartsAt - sunriseStartsAt),
  );
  const stars = minutes < 12 * 60
    ? 1 - ramp(minutes, 4.5 * 60, 5.75 * 60)
    : ramp(minutes, 18.75 * 60, nightStartsAt);
  const moonRiseStartsAt = 18.75 * 60;
  const moonSetEndsAt = 5.75 * 60;
  const moonDuration = moonSetEndsAt + 24 * 60 - moonRiseStartsAt;
  const moonElapsed = (minutes - moonRiseStartsAt + 24 * 60) % (24 * 60);
  const moonProgress = lingerNearMidday(clamp(moonElapsed / moonDuration));

  return {
    blueHour,
    cityNight: night,
    dawn,
    daylight,
    goldenHour,
    moonOpacity: stars,
    moonX: 3 + 94 * moonProgress,
    moonY: 55 - 48 * Math.sin(Math.PI * moonProgress) ** 0.86,
    night,
    sunset,
    stars,
    sunOpacity: ramp(minutes, sunriseStartsAt, 5.67 * 60)
      * (1 - ramp(minutes, 18.83 * 60, nightStartsAt)),
    sunWarmth: smoothUnion(dawn * 0.92, sunset, goldenHour * 0.42),
    sunX: 3 + 94 * sunProgress,
    sunY: 55 - 48 * Math.sin(Math.PI * sunProgress) ** 0.86,
  };
}

export function getCityCycle(now: Date | null, timeZone: string) {
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

  return getCityCycleAtMinutes(getZonedMinutes(now, timeZone));
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
        cycle.moonOpacity * moonVisibility,
        cycle.moonX,
        cycle.moonY,
      ),
    ];
  });
  const adjacentPairs = [[0, 1], [1, 2]] as const;
  const groups = (["sun", "moon"] as const).flatMap((kind) =>
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
  const competingGroup = groups.find((group) => group.kind !== winningGroup.kind) ?? groups[1];
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
  const handoffMargin = winningGroup.score === 0
    ? 0
    : (winningGroup.score - competingGroup.score) / winningGroup.score;
  const handoffOpacity = smootherstep(handoffMargin / 0.035);

  return {
    kind: winningGroup.kind,
    opacity: weightedValue("opacity") * handoffOpacity,
    owner: lead.owner,
    warmth: weightedValue("warmth"),
    x: weightedValue("x"),
    y: weightedValue("y"),
  };
}
