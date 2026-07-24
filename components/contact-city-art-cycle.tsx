"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type PropsWithChildren,
} from "react";
import {
  cityTimeZones,
  getContactCelestial,
  getCityCycle,
  getCityCycleAtMinutes,
  getMoonPhase,
  type CityKey,
  type CityCycle,
} from "@/lib/contact-city-cycle";

type ContactCycleStyle = CSSProperties & {
  [property: `--${string}`]: string | number;
};

type PreviewMinutes = Partial<Record<CityKey, number>>;

export type ContactCityTimeSource =
  | { kind: "live" }
  | { kind: "preview"; now: Date | null; scrubbing?: boolean };

type ContactCityArtCycleProps = PropsWithChildren<{
  timeSource?: ContactCityTimeSource;
}>;

const liveTimeSource: ContactCityTimeSource = { kind: "live" };

const ContactCityNowContext = createContext<Date | null>(null);

function blendRgb(day: readonly number[], night: readonly number[], amount: number) {
  const channels = day.map((channel, index) =>
    Math.round(channel + (night[index] - channel) * amount),
  );

  return `rgb(${channels.join(" ")})`;
}

function smoothReveal(value: number) {
  const progress = Math.min(1, Math.max(0, value));
  return progress ** 3 * (progress * (progress * 6 - 15) + 10);
}

// The moon disc is clipped in CSS to a 20-cell midpoint pixel circle. The lit
// shape is built of whole cells on that same grid: each row's outer edge sits
// exactly on the silhouette's row extent, and the terminator column is the
// real phase position snapped to the grid — pixel-perfect, still accurate.
const MOON_GRID = 20;

const moonRowExtents = Array.from({ length: MOON_GRID }, (_, row) => {
  const offset = row + 0.5 - MOON_GRID / 2;
  const halfWidth = Math.sqrt((MOON_GRID / 2) ** 2 - offset ** 2);
  return {
    start: Math.round(MOON_GRID / 2 - halfWidth),
    end: Math.round(MOON_GRID / 2 + halfWidth),
    halfWidth,
  };
});

function createMoonLitClipPath(phase: number) {
  const waxing = phase < 0.5;
  const outerSide = waxing ? 1 : -1;
  const rawTerminatorSide = waxing
    ? Math.cos(2 * Math.PI * phase)
    : -Math.cos(2 * Math.PI * phase);
  const terminatorSide = outerSide * rawTerminatorSide > 0.65
    ? outerSide * 0.65
    : rawTerminatorSide;
  const cell = 100 / MOON_GRID;
  const point = (column: number, gridY: number) =>
    `${(column * cell).toFixed(2)}% ${(gridY * cell).toFixed(2)}%`;
  const outer: string[] = [];
  const terminator: string[] = [];

  moonRowExtents.forEach(({ start, end, halfWidth }, row) => {
    const outerColumn = outerSide > 0 ? end : start;
    const rawColumn = MOON_GRID / 2 + terminatorSide * halfWidth;
    const terminatorColumn = Math.min(end, Math.max(start, Math.round(rawColumn)));

    outer.push(point(outerColumn, row), point(outerColumn, row + 1));
    terminator.unshift(point(terminatorColumn, row + 1), point(terminatorColumn, row));
  });

  return `polygon(${[...outer, ...terminator].join(", ")})`;
}

function parsePreviewTime(value: string | null) {
  const match = value?.match(/^(\d{1,2}):(\d{2})$/);
  const hours = Number(match?.[1]);
  const minutes = Number(match?.[2]);

  return match && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60
    ? hours * 60 + minutes
    : null;
}

function parsePreviewDate(value: string | null) {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function cycleVariables(prefix: "hk" | "london" | "la", cycle: CityCycle) {
  return {
    [`--${prefix}-blue-hour`]: cycle.blueHour.toFixed(4),
    [`--${prefix}-city-night`]: cycle.cityNight.toFixed(4),
    [`--${prefix}-dawn`]: cycle.dawn.toFixed(4),
    [`--${prefix}-daylight`]: cycle.daylight.toFixed(4),
    [`--${prefix}-golden`]: cycle.goldenHour.toFixed(4),
    [`--${prefix}-night`]: cycle.night.toFixed(4),
    [`--${prefix}-sunset`]: cycle.sunset.toFixed(4),
    [`--${prefix}-stars`]: cycle.stars.toFixed(4),
    [`--${prefix}-sun-opacity`]: cycle.sunOpacity.toFixed(4),
    [`--${prefix}-sun-color`]: blendRgb([255, 210, 93], [255, 116, 54], cycle.sunWarmth),
    [`--${prefix}-sun-x`]: `${cycle.sunX.toFixed(3)}%`,
    [`--${prefix}-sun-y`]: `${cycle.sunY.toFixed(3)}%`,
  };
}

export function useContactCityNow() {
  return useContext(ContactCityNowContext);
}

export function ContactCityArtCycle({
  children,
  timeSource = liveTimeSource,
}: ContactCityArtCycleProps) {
  const [timeState, setTimeState] = useState<{
    now: Date | null;
    previewMinutes: PreviewMinutes | null;
  }>({ now: null, previewMinutes: null });
  const timeSourceKind = timeSource.kind;

  useEffect(() => {
    if (timeSourceKind === "preview") return;

    let previewMinutes: PreviewMinutes | null = null;
    let previewNow: Date | null = null;

    if (process.env.NODE_ENV === "development") {
      const search = new URLSearchParams(window.location.search);
      if (search.get("debugArtTime") === "1") {
        previewNow = parsePreviewDate(search.get("moonDate"));
        const shared = parsePreviewTime(search.get("artTime"));
        const preview: PreviewMinutes = shared === null
          ? {
              hongKong: parsePreviewTime(search.get("hkTime")) ?? undefined,
              london: parsePreviewTime(search.get("londonTime")) ?? undefined,
              losAngeles: parsePreviewTime(search.get("laTime")) ?? undefined,
            }
          : { hongKong: shared, london: shared, losAngeles: shared };

        if (Object.values(preview).some((value) => value !== undefined)) {
          previewMinutes = preview;
        }
      }
    }

    const update = () => setTimeState({
      now: previewNow ?? new Date(),
      previewMinutes,
    });

    update();
    if (previewMinutes || previewNow) return;

    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [timeSourceKind]);

  const now = timeSource.kind === "preview" ? timeSource.now : timeState.now;
  const previewMinutes = timeSource.kind === "live"
    ? timeState.previewMinutes
    : null;

  const cycleFor = (city: CityKey) => {
    const preview = previewMinutes?.[city];
    return preview === undefined
      ? getCityCycle(now, cityTimeZones[city], city)
      : getCityCycleAtMinutes(preview, city);
  };
  const hongKong = cycleFor("hongKong");
  const london = cycleFor("london");
  const losAngeles = cycleFor("losAngeles");
  const moonPhase = getMoonPhase(now);
  const dailyMoonPhase = getMoonPhase(now
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : null);
  const moonIllumination = Math.round(dailyMoonPhase.illumination * 100);
  const celestialCities = [
    { cycle: losAngeles, key: "losAngeles", left: 0, width: 0.307 },
    { cycle: london, key: "london", left: 0.307, width: 0.365 },
    { cycle: hongKong, key: "hongKong", left: 0.672, width: 0.328 },
  ] satisfies Parameters<typeof getContactCelestial>[0];
  const sharedSun = getContactCelestial(celestialCities, 0, "sun");
  const sharedMoon = getContactCelestial(celestialCities, 1, "moon");
  const edgeOverlap = Math.min(losAngeles.daylight, hongKong.daylight)
    * (1 - london.daylight);
  const dualEdgePhase = smoothReveal((edgeOverlap - 0.04) / 0.22);
  const sharedCelestialReveal = 1 - smoothReveal(dualEdgePhase * 2);
  const edgeSunReveal = smoothReveal(dualEdgePhase * 2 - 1);
  const hasDualEdgeSuns = edgeSunReveal > 0.0001;
  const primarySun = hasDualEdgeSuns
    ? {
        kind: "sun" as const,
        opacity: losAngeles.sunOpacity * edgeSunReveal,
        owner: "losAngeles" as const,
        warmth: losAngeles.sunWarmth,
        x: 0.307 * losAngeles.sunX,
        y: losAngeles.sunY,
      }
    : {
        ...sharedSun,
        opacity: sharedSun.opacity * sharedCelestialReveal,
      };
  const style: ContactCycleStyle = {
    ...cycleVariables("hk", hongKong),
    ...cycleVariables("london", london),
    ...cycleVariables("la", losAngeles),
    "--hk-clock-color": blendRgb([54, 51, 44], [229, 242, 255], hongKong.night),
    "--hk-clock-muted": blendRgb([105, 99, 86], [196, 218, 242], hongKong.night),
    "--london-clock-color": blendRgb([54, 51, 44], [229, 242, 255], london.night),
    "--london-clock-muted": blendRgb([105, 99, 86], [196, 218, 242], london.night),
    "--moon-lit-shape": createMoonLitClipPath(moonPhase.phase),
    "--moon-phase-label-color": blendRgb(
      [82, 74, 59],
      [218, 231, 248],
      losAngeles.night,
    ),
    "--moon-phase-label-shadow": blendRgb(
      [255, 251, 239],
      [0, 14, 38],
      losAngeles.night,
    ),
    "--travelling-label-color": blendRgb(
      [82, 74, 59],
      [218, 231, 248],
      hongKong.night,
    ),
    "--travelling-label-shadow": blendRgb(
      [255, 251, 239],
      [0, 14, 38],
      hongKong.night,
    ),
    "--celestial-color": blendRgb(
      [255, 213, 103],
      [255, 116, 54],
      primarySun.warmth,
    ),
    "--celestial-moon": 0,
    "--celestial-opacity": primarySun.opacity.toFixed(4),
    "--celestial-sun": 1,
    "--celestial-x": `${primarySun.x.toFixed(3)}%`,
    "--celestial-y": `${primarySun.y.toFixed(3)}%`,
    "--moon-celestial-opacity": sharedMoon.opacity.toFixed(4),
    "--moon-celestial-x": `${sharedMoon.x.toFixed(3)}%`,
    "--moon-celestial-y": `${sharedMoon.y.toFixed(3)}%`,
    "--secondary-celestial-color": blendRgb(
      [255, 213, 103],
      [255, 116, 54],
      hongKong.sunWarmth,
    ),
    "--secondary-celestial-opacity": hasDualEdgeSuns
      ? (hongKong.sunOpacity * edgeSunReveal).toFixed(4)
      : 0,
    "--secondary-celestial-x": `${(67.2 + 0.328 * hongKong.sunX).toFixed(3)}%`,
    "--secondary-celestial-y": `${hongKong.sunY.toFixed(3)}%`,
  };

  return (
    <ContactCityNowContext.Provider value={now}>
      <div
        className="contact-cities-picture"
        data-celestial="sun"
        data-celestial-mode={hasDualEdgeSuns ? "dual-edge" : "single"}
        data-celestial-owner={primarySun.owner}
        data-light-direction={sharedSun.x < 50 ? "left" : "right"}
        data-moon-owner={sharedMoon.owner}
        data-moon-phase={moonPhase.label.toLowerCase().replace(/ /g, "-")}
        data-moon-waxing={moonPhase.waxing}
        data-scrubbing={timeSource.kind === "preview" && timeSource.scrubbing ? "true" : "false"}
        data-time-source={timeSource.kind}
        style={style}
      >
        {now ? (
          <span className="contact-moon-phase-label">
            Moon · {moonPhase.label} · {moonIllumination}% illuminated
          </span>
        ) : null}
        <div className="contact-cities-backdrop-frame" aria-hidden="true">
          <span className="contact-cities-night-backdrop">
            <span className="contact-cities-night-backdrop-fill contact-city-night-mask" />
          </span>
        </div>
        <span className="contact-city-glow-field" aria-hidden="true" />
        {children}
      </div>
    </ContactCityNowContext.Provider>
  );
}
