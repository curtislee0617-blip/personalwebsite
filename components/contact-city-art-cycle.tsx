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
  type CityCycle,
} from "@/lib/contact-city-cycle";

type ContactCycleStyle = CSSProperties & {
  [property: `--${string}`]: string | number;
};

type CityKey = keyof typeof cityTimeZones;
type PreviewMinutes = Partial<Record<CityKey, number>>;

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

function createMoonLitClipPath(phase: number) {
  const steps = 12;
  const waxing = phase < 0.5;
  const outerSide = waxing ? 1 : -1;
  const terminatorSide = waxing
    ? Math.cos(2 * Math.PI * phase)
    : -Math.cos(2 * Math.PI * phase);
  const point = (index: number, side: number) => {
    const progress = index / steps;
    const halfWidth = 50 * Math.sin(Math.PI * progress);
    const x = 50 + side * halfWidth;

    return `${x.toFixed(2)}% ${(progress * 100).toFixed(2)}%`;
  };
  const outer = Array.from(
    { length: steps + 1 },
    (_, index) => point(index, outerSide),
  );
  const terminator = Array.from(
    { length: steps + 1 },
    (_, index) => point(steps - index, terminatorSide),
  );

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

export function ContactCityArtCycle({ children }: PropsWithChildren) {
  const [timeState, setTimeState] = useState<{
    now: Date | null;
    previewMinutes: PreviewMinutes | null;
  }>({ now: null, previewMinutes: null });

  useEffect(() => {
    let previewMinutes: PreviewMinutes | null = null;
    let previewNow: Date | null = null;

    if (process.env.NODE_ENV === "development") {
      const search = new URLSearchParams(window.location.search);
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

    const update = () => setTimeState({
      now: previewNow ?? new Date(),
      previewMinutes,
    });

    update();
    if (previewMinutes || previewNow) return;

    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const cycleFor = (city: CityKey) => {
    const preview = timeState.previewMinutes?.[city];
    return preview === undefined
      ? getCityCycle(timeState.now, cityTimeZones[city])
      : getCityCycleAtMinutes(preview);
  };
  const hongKong = cycleFor("hongKong");
  const london = cycleFor("london");
  const losAngeles = cycleFor("losAngeles");
  const moonPhase = getMoonPhase(timeState.now);
  const sharedCelestial = getContactCelestial([
    { cycle: losAngeles, key: "losAngeles", left: 0, width: 0.307 },
    { cycle: london, key: "london", left: 0.307, width: 0.365 },
    { cycle: hongKong, key: "hongKong", left: 0.672, width: 0.328 },
  ], moonPhase.visibility);
  const edgeOverlap = Math.min(losAngeles.daylight, hongKong.daylight)
    * (1 - london.daylight);
  const dualEdgePhase = smoothReveal((edgeOverlap - 0.04) / 0.22);
  const sharedCelestialReveal = 1 - smoothReveal(dualEdgePhase * 2);
  const edgeSunReveal = smoothReveal(dualEdgePhase * 2 - 1);
  const hasDualEdgeSuns = edgeSunReveal > 0.0001;
  const celestial = hasDualEdgeSuns
    ? {
        kind: "sun" as const,
        opacity: losAngeles.sunOpacity * edgeSunReveal,
        owner: "losAngeles" as const,
        warmth: losAngeles.sunWarmth,
        x: 0.307 * losAngeles.sunX,
        y: losAngeles.sunY,
      }
    : {
        ...sharedCelestial,
        opacity: sharedCelestial.opacity * sharedCelestialReveal,
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
    "--celestial-color": celestial.kind === "moon"
      ? "rgb(31 45 66)"
      : blendRgb([255, 213, 103], [255, 116, 54], celestial.warmth),
    "--celestial-moon": celestial.kind === "moon" ? 1 : 0,
    "--celestial-opacity": celestial.opacity.toFixed(4),
    "--celestial-sun": celestial.kind === "sun" ? 1 : 0,
    "--celestial-x": `${celestial.x.toFixed(3)}%`,
    "--celestial-y": `${celestial.y.toFixed(3)}%`,
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
    <ContactCityNowContext.Provider value={timeState.now}>
      <div
        className="contact-cities-picture"
        data-celestial={celestial.kind}
        data-celestial-mode={hasDualEdgeSuns ? "dual-edge" : "single"}
        data-celestial-owner={celestial.owner}
        data-moon-phase={moonPhase.label.toLowerCase().replace(/ /g, "-")}
        data-moon-waxing={moonPhase.waxing}
        style={style}
      >
        {timeState.now ? (
          <span className="contact-moon-phase-label">
            Moon · {moonPhase.label}
          </span>
        ) : null}
        <div className="contact-cities-backdrop-frame" aria-hidden="true">
          <span className="contact-cities-night-backdrop">
            <span className="contact-cities-night-backdrop-fill contact-city-night-mask" />
          </span>
          <span className="contact-cities-dawn-backdrop" />
        </div>
        <span className="contact-city-glow-field" aria-hidden="true" />
        {children}
      </div>
    </ContactCityNowContext.Provider>
  );
}
