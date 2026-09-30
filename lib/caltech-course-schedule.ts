export const WEEKDAY_ORDER = ["M", "T", "W", "R", "F"] as const;

export type ScheduleDay = (typeof WEEKDAY_ORDER)[number];

export type CourseMeeting = {
  day: string;
  start: number;
  end: number;
};

export type ScheduledOffering = {
  id: string;
  subject: string;
  code: string;
  title: string;
  section: string;
  units: string;
  unitParts: number[] | null;
  totalUnits: number | null;
  instructor: string;
  daysTime: string;
  location: string;
  grade: string;
  meetings: CourseMeeting[];
};

export function courseLoadLabel(course: Pick<ScheduledOffering, "unitParts" | "totalUnits" | "units">) {
  if (!course.unitParts || course.totalUnits === null) return `${course.units} units`;
  return `${course.unitParts.join("-")} · ${course.totalUnits} units`;
}

export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;
  return `${normalizedHour}:${remainder.toString().padStart(2, "0")} ${suffix}`;
}

export type MeetingConflict = {
  firstId: string;
  secondId: string;
  day: string;
  start: number;
  end: number;
};

export function findMeetingConflicts(courses: ScheduledOffering[]) {
  const blocks = courses.flatMap((course) => course.meetings.map((meeting) => ({ ...meeting, id: course.id })));
  const conflicts: MeetingConflict[] = [];
  for (let first = 0; first < blocks.length; first += 1) {
    for (let second = first + 1; second < blocks.length; second += 1) {
      const a = blocks[first];
      const b = blocks[second];
      if (a.id === b.id || a.day !== b.day || a.start >= b.end || b.start >= a.end) continue;
      conflicts.push({
        firstId: a.id,
        secondId: b.id,
        day: a.day,
        start: Math.max(a.start, b.start),
        end: Math.min(a.end, b.end),
      });
    }
  }
  return conflicts;
}

export function courseMatchesSearch(course: ScheduledOffering, query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;
  return [course.code, course.title, course.subject, course.instructor, course.location, course.daysTime]
    .join(" ")
    .toLocaleLowerCase()
    .includes(normalized);
}

function fall2026Date(day: ScheduleDay, minutes: number) {
  const dayOffset: Record<ScheduleDay, number> = { M: 0, T: 1, W: 2, R: 3, F: 4 };
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const remaining = (minutes % 60).toString().padStart(2, "0");
  return `202609${(28 + dayOffset[day]).toString().padStart(2, "0")}T${hours}${remaining}00`;
}

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Creates one importable calendar containing every scheduled meeting in the selected courses. */
export function courseScheduleIcs(courses: ScheduledOffering[]) {
  const events = courses.flatMap((course) => {
    const byTime = new Map<string, Array<{ day: ScheduleDay; start: number; end: number }>>();
    course.meetings.forEach((meeting) => {
      if (!WEEKDAY_ORDER.includes(meeting.day as ScheduleDay)) return;
      const normalized = { day: meeting.day as ScheduleDay, start: meeting.start, end: meeting.end };
      const key = `${normalized.start}-${normalized.end}`;
      byTime.set(key, [...(byTime.get(key) ?? []), normalized]);
    });

    return [...byTime.values()].map((meetings, index) => {
      const first = meetings[0];
      const days = [...new Set(meetings.map((meeting) => meeting.day))]
        .map((day) => ({ M: "MO", T: "TU", W: "WE", R: "TH", F: "FR" })[day])
        .join(",");
      const summary = `${course.code}${course.section ? ` ${course.section}` : ""}: ${course.title}`;
      const details = `Caltech Fall 2026–27 course schedule. ${course.daysTime}${course.instructor ? ` · ${course.instructor}` : ""}`;
      return [
        "BEGIN:VEVENT",
        `UID:${course.id.replace(/[^a-z0-9]/gi, "-")}-${index}@weekly-course-scheduler`,
        "DTSTAMP:20260928T000000Z",
        `DTSTART;TZID=America/Los_Angeles:${fall2026Date(first.day, first.start)}`,
        `DTEND;TZID=America/Los_Angeles:${fall2026Date(first.day, first.end)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${days};UNTIL=20261205T075959Z`,
        `SUMMARY:${escapeIcsText(summary)}`,
        `DESCRIPTION:${escapeIcsText(details)}`,
        `LOCATION:${escapeIcsText(course.location || "Caltech")}`,
        "END:VEVENT",
      ];
    });
  });

  if (!events.length) return null;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Curtis Lee//Weekly Course Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Caltech Fall 2026–27 schedule",
    "X-WR-TIMEZONE:America/Los_Angeles",
    ...events.flat(),
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
