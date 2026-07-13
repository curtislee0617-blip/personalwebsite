"use client";

import { type CSSProperties } from "react";
import { useContactCityNow } from "@/components/contact-city-art-cycle";
import { ContactCityPresence } from "@/components/contact-presence";

const cityTimeZones = {
  hongKong: "Asia/Hong_Kong",
  london: "Europe/London",
  losAngeles: "America/Los_Angeles",
} as const;

type ClockParts = {
  hour: number;
  minute: number;
  second: number;
};

type ClockStyle = CSSProperties & Record<"--clock-hour-turn" | "--clock-minute-turn", string>;

type DisplayTime = {
  hours: string;
  minutes: string;
  meridiem: string;
  label: string;
};

function getClockParts(now: Date | null, timeZone: string): ClockParts | null {
  if (!now) return null;

  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

function formatDisplayTime(now: Date | null, timeZone: string): DisplayTime {
  if (!now) {
    return {
      hours: "--",
      minutes: "--",
      meridiem: "--",
      label: "--:-- --",
    };
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone,
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const hours = value("hour") || "--";
  const minutes = value("minute") || "--";
  const meridiem = value("dayPeriod").toUpperCase() || "--";

  return {
    hours,
    minutes,
    meridiem,
    label: `${hours}:${minutes} ${meridiem}`,
  };
}

function analogClockStyle(parts: ClockParts | null): ClockStyle {
  if (!parts) {
    return {
      "--clock-hour-turn": "0turn",
      "--clock-minute-turn": "0turn",
    };
  }

  return {
    "--clock-hour-turn": `${((parts.hour % 12) + parts.minute / 60 + parts.second / 3600) / 12}turn`,
    "--clock-minute-turn": `${(parts.minute + parts.second / 60) / 60}turn`,
  };
}

export function ContactCityTimeRow() {
  const now = useContactCityNow();
  const hongKong = formatDisplayTime(now, cityTimeZones.hongKong);
  const londonParts = getClockParts(now, cityTimeZones.london);
  const londonTime = formatDisplayTime(now, cityTimeZones.london);
  const losAngelesTime = formatDisplayTime(now, cityTimeZones.losAngeles);

  return (
    <div className="contact-city-time-row" aria-label="Local time in each city">
      <article className="contact-city-clock contact-city-clock-la">
        <span className="contact-digital-clock" aria-label="Los Angeles local time">
          <span suppressHydrationWarning>{losAngelesTime.hours}</span>
          <i aria-hidden="true">:</i>
          <span suppressHydrationWarning>{losAngelesTime.minutes}</span>
          <b suppressHydrationWarning>{losAngelesTime.meridiem}</b>
        </span>
        <ContactCityPresence city="losAngeles" />
      </article>

      <article className="contact-city-clock contact-city-clock-london">
        <span className="contact-victorian-clock" style={analogClockStyle(londonParts)} aria-hidden="true">
          <span className="contact-clock-roman contact-clock-roman-xii">XII</span>
          <span className="contact-clock-roman contact-clock-roman-iii">III</span>
          <span className="contact-clock-roman contact-clock-roman-vi">VI</span>
          <span className="contact-clock-roman contact-clock-roman-ix">IX</span>
          <span className="contact-victorian-hand contact-victorian-hand-hour" />
          <span className="contact-victorian-hand contact-victorian-hand-minute" />
          <span className="contact-victorian-pin" />
        </span>
        <span className="contact-city-clock-copy">
          <strong suppressHydrationWarning>
            {londonTime.hours}:{londonTime.minutes}
            <span suppressHydrationWarning>{londonTime.meridiem}</span>
          </strong>
          <ContactCityPresence city="london" />
        </span>
      </article>

      <article className="contact-city-clock contact-city-clock-hk">
        <span className="contact-flip-clock" aria-label="Hong Kong local time">
          <span suppressHydrationWarning>{hongKong.hours}</span>
          <i aria-hidden="true">:</i>
          <span suppressHydrationWarning>{hongKong.minutes}</span>
          <b suppressHydrationWarning>{hongKong.meridiem}</b>
        </span>
        <ContactCityPresence city="hongKong" />
      </article>
    </div>
  );
}
