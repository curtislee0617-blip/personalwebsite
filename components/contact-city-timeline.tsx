"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ContactCityArtwork } from "@/components/contact-city-artwork";
import { ContactPresenceProvider } from "@/components/contact-presence";
import type { ContactPresenceStatus } from "@/lib/contact-presence";

const minutesInDay = 24 * 60;
const timelineMinutes = 48 * 60;
const creativePresenceFallback: ContactPresenceStatus = {
  city: "hongKong",
  isTravelling: false,
  message: "",
  updatedAt: null,
};

const cityTimeZones = [
  ["Los Angeles", "America/Los_Angeles"],
  ["London", "Europe/London"],
  ["Hong Kong", "Asia/Hong_Kong"],
] as const;

function formatOffset(minutes: number) {
  if (minutes === 0) return "Now";

  const sign = minutes < 0 ? "−" : "+";
  const absoluteMinutes = Math.abs(minutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const remainder = absoluteMinutes % 60;

  return `${sign}${hours}h${remainder ? ` ${remainder}m` : ""}`;
}

function formatOffsetForAssistiveTechnology(minutes: number) {
  if (minutes === 0) return "Now";

  const direction = minutes < 0 ? "before" : "after";
  const absoluteMinutes = Math.abs(minutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const remainder = absoluteMinutes % 60;
  const parts = [
    hours ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "",
    remainder ? `${remainder} minutes` : "",
  ].filter(Boolean);

  return `${parts.join(" and ")} ${direction} now`;
}

function formatPreviewDate(date: Date | null) {
  if (!date) return "Preparing the timeline…";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    weekday: "short",
  }).format(date);
}

function formatCityTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone,
  }).format(date);
}

function createAriaValueText(date: Date | null, offsetMinutes: number) {
  if (!date) return "Preparing the 48 hour preview";

  const cityTimes = cityTimeZones
    .map(([city, timeZone]) => `${city} ${formatCityTime(date, timeZone)}`)
    .join(", ");

  return `${formatOffsetForAssistiveTechnology(offsetMinutes)}; ${cityTimes}`;
}

export function ContactCityTimeline() {
  const sliderId = useId();
  const descriptionId = useId();
  const [anchorMs, setAnchorMs] = useState<number | null>(null);
  const [sliderMinutes, setSliderMinutes] = useState(minutesInDay);
  const [scrubbing, setScrubbing] = useState(false);
  const offsetMinutes = sliderMinutes - minutesInDay;
  const previewDate = useMemo(
    () => anchorMs === null ? null : new Date(anchorMs + offsetMinutes * 60_000),
    [anchorMs, offsetMinutes],
  );
  const timeSource = useMemo(
    () => ({ kind: "preview" as const, now: previewDate, scrubbing }),
    [previewDate, scrubbing],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const now = Date.now();
      setAnchorMs(now - (now % 60_000));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <article className="contact-cities creative-project-card project-card design-panel overflow-hidden rounded-[1.75rem] border border-ink/10 bg-surface/55">
      <div className="contact-cities-copy creative-project-copy">
        <p className="creative-project-description" id={descriptionId}>
          For my Contact page, I wanted to create a map of the places I frequent—one that keeps track of the local time, where I am, the moon phase and illumination, and whether each city is in daylight or darkness. I also update it with a small figure to show where I am at the moment.
        </p>

        <div className="contact-city-timeline-control">
          <div className="contact-city-timeline-heading">
            <label htmlFor={sliderId}>Explore 48 hours</label>
            <output htmlFor={sliderId}>{formatOffset(offsetMinutes)}</output>
          </div>
          <p className="contact-city-timeline-date">{formatPreviewDate(previewDate)}</p>
          <input
            aria-describedby={descriptionId}
            aria-valuetext={createAriaValueText(previewDate, offsetMinutes)}
            disabled={anchorMs === null}
            id={sliderId}
            max={timelineMinutes}
            min={0}
            onBlur={() => setScrubbing(false)}
            onChange={(event) => setSliderMinutes(Number(event.currentTarget.value))}
            onPointerCancel={() => setScrubbing(false)}
            onPointerDown={() => setScrubbing(true)}
            onPointerUp={() => setScrubbing(false)}
            step={5}
            type="range"
            value={sliderMinutes}
          />
          <div aria-hidden="true" className="contact-city-timeline-ticks">
            <span>−24h</span>
            <span>Now</span>
            <span>+24h</span>
          </div>
        </div>
      </div>

      <ContactPresenceProvider fallbackStatus={creativePresenceFallback} readOnly>
        <ContactCityArtwork
          className="creative-project-art"
          timeSource={timeSource}
        />
      </ContactPresenceProvider>
    </article>
  );
}
