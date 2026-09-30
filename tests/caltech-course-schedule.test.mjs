import assert from "node:assert/strict";
import test from "node:test";
import schedule from "../data/caltech-fall-2026-schedule.json" with { type: "json" };
import { courseLoadLabel, courseScheduleIcs, findMeetingConflicts, formatMinutes } from "../lib/caltech-course-schedule.ts";

const course = (id, meetings) => ({ id, units: "3-0-6", unitParts: [3, 0, 6], totalUnits: 9, meetings });

test("course load label keeps all three Caltech workload values and their total", () => {
  assert.equal(courseLoadLabel(course("fluid", [])), "3-0-6 · 9 units");
  assert.equal(courseLoadLabel({ units: "+", unitParts: null, totalUnits: null }), "+ units");
});

test("conflicts detect only meetings that share both day and time", () => {
  const conflicts = findMeetingConflicts([
    course("fluid", [{ day: "M", start: 600, end: 655 }]),
    course("controls", [{ day: "M", start: 630, end: 710 }]),
    course("separate-day", [{ day: "W", start: 630, end: 710 }]),
    course("adjacent", [{ day: "M", start: 710, end: 770 }]),
  ]);
  assert.deepEqual(conflicts, [{ firstId: "fluid", secondId: "controls", day: "M", start: 630, end: 655 }]);
});

test("calendar times use familiar 12-hour labels", () => {
  assert.equal(formatMinutes(8 * 60), "8:00 AM");
  assert.equal(formatMinutes(12 * 60), "12:00 PM");
  assert.equal(formatMinutes(13 * 60 + 30), "1:30 PM");
});

test("Google Calendar export combines selected scheduled courses into one recurring calendar", () => {
  const calendar = courseScheduleIcs([
    {
      ...course("fluid", [{ day: "M", start: 600, end: 655 }, { day: "W", start: 600, end: 655 }, { day: "F", start: 600, end: 655 }]),
      code: "Ae 101A", section: "01", title: "Fluid Mechanics", instructor: "Bae, H", daysTime: "MWF 10:00 - 10:55", location: "133 GUG",
    },
    {
      ...course("ethics", [{ day: "T", start: 780, end: 830 }]),
      code: "Hum 101", section: "02", title: "Ethics", instructor: "Doe, J", daysTime: "T 1:00 - 1:50", location: "BAX 1",
    },
  ]);
  assert.match(calendar, /BEGIN:VCALENDAR/);
  assert.equal(calendar.match(/BEGIN:VEVENT/g)?.length, 2);
  assert.match(calendar, /DTSTART;TZID=America\/Los_Angeles:20260928T100000/);
  assert.match(calendar, /RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR/);
  assert.match(calendar, /SUMMARY:Hum 101 02: Ethics/);
});

test("a multi-day official meeting produces one calendar meeting for every listed day", () => {
  const fluidMechanics = schedule.offerings.find((course) => course.code === "Ae/APh/CE/ME 101A");
  assert.deepEqual(fluidMechanics?.meetings.map((meeting) => meeting.day), ["M", "W", "F"]);
});
