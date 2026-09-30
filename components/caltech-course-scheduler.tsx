"use client";

import { useMemo, useState, type CSSProperties, type DragEvent } from "react";
import fallSchedule from "@/data/caltech-fall-2026-schedule.json";
import { requirementCategories } from "@/data/caltech-requirements";
import { courseLoadLabel, courseMatchesSearch, courseScheduleIcs, findMeetingConflicts, formatMinutes, WEEKDAY_ORDER, type ScheduledOffering } from "@/lib/caltech-course-schedule";

const schedule = fallSchedule as { term: string; source: string; offerings: ScheduledOffering[] };
const CALENDAR_START = 8 * 60;
const CALENDAR_END = 19 * 60;
const SLOT_MINUTES = 15;

const planTerms = [
  { value: "1-Fall", label: "Year 1 · Fall" },
  { value: "1-Winter", label: "Year 1 · Winter" },
  { value: "1-Spring", label: "Year 1 · Spring" },
  { value: "2-Fall", label: "Year 2 · Fall" },
  { value: "2-Winter", label: "Year 2 · Winter" },
  { value: "2-Spring", label: "Year 2 · Spring" },
  { value: "3-Fall", label: "Year 3 · Fall" },
  { value: "3-Winter", label: "Year 3 · Winter" },
  { value: "3-Spring", label: "Year 3 · Spring" },
  { value: "4-Fall", label: "Year 4 · Fall" },
  { value: "4-Winter", label: "Year 4 · Winter" },
  { value: "4-Spring", label: "Year 4 · Spring" },
];

function calendarRow(minutes: number) {
  return Math.max(0, Math.floor((Math.max(CALENDAR_START, minutes) - CALENDAR_START) / SLOT_MINUTES)) + 2;
}

function calendarSpan(start: number, end: number) {
  const clippedStart = Math.max(CALENDAR_START, start);
  const clippedEnd = Math.min(CALENDAR_END, end);
  return Math.max(1, Math.ceil((clippedEnd - clippedStart) / SLOT_MINUTES));
}

function offeringName(course: ScheduledOffering) {
  return `${course.code}${course.section ? ` · ${course.section}` : ""} — ${course.title}`;
}

const subjectCategoryIds: Record<string, string> = {
  ACM: "acm", Ae: "ae-minor", APh: "aph", Ay: "ay", BE: "bioengineering", BEM: "bem", Bi: "biology", BMB: "biology", CDS: "cds-minor", Ch: "chemistry", ChE: "cheme", CMS: "math", CNS: "cns", CS: "cs", E: "eas", Ec: "economics", EE: "ee", En: "english", ESE: "ese", Ge: "gps", H: "history", HPS: "hps", IDS: "ids", Ma: "math", ME: "mechanical-engineering", MedE: "bioengineering", MS: "materials-science", NB: "biology", Ph: "physics", Pl: "philosophy", PS: "political-science", SS: "social-science", VC: "visual-culture-minor",
};
const categoryColors = new Map<string, string>(requirementCategories.map((category) => [category.id, category.color]));

function scheduleColor(course: ScheduledOffering) {
  const categoryId = subjectCategoryIds[course.subject] ?? (course.subject === "PE" ? "pe" : ["Hum", "L", "Mu", "PVA", "Wr"].includes(course.subject) ? "humanities" : "core-science");
  return categoryColors.get(categoryId) ?? categoryColors.get("core-science") ?? "#1baf7a";
}

export function CaltechCourseScheduler() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [showScheduledOnly, setShowScheduledOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [planTerm, setPlanTerm] = useState("1-Fall");
  const [movedTerms, setMovedTerms] = useState<Record<string, string>>({});

  const subjects = useMemo(
    () => [...new Set(schedule.offerings.map((course) => course.subject))].sort((a, b) => a.localeCompare(b)),
    [],
  );
  const selectedCourses = useMemo(
    () => selectedIds.map((id) => schedule.offerings.find((course) => course.id === id)).filter((course): course is ScheduledOffering => Boolean(course)),
    [selectedIds],
  );
  const scheduledCourses = useMemo(
    () => selectedCourses.filter((course) => course.meetings.some((meeting) => WEEKDAY_ORDER.includes(meeting.day as (typeof WEEKDAY_ORDER)[number]))),
    [selectedCourses],
  );
  const filteredCourses = useMemo(() => schedule.offerings.filter((course) => (
    (subject === "all" || course.subject === subject)
    && (!showScheduledOnly || course.meetings.length > 0)
    && courseMatchesSearch(course, query)
  )), [query, showScheduledOnly, subject]);
  const conflicts = useMemo(() => findMeetingConflicts(selectedCourses), [selectedCourses]);
  const conflictingIds = useMemo(() => new Set(conflicts.flatMap((conflict) => [conflict.firstId, conflict.secondId])), [conflicts]);
  const fixedUnitTotal = selectedCourses.reduce((total, course) => total + (course.totalUnits ?? 0), 0);
  const variableUnitCount = selectedCourses.filter((course) => course.totalUnits === null).length;

  const addCourse = (id: string) => setSelectedIds((current) => current.includes(id) ? current : [...current, id]);
  const removeCourse = (id: string) => setSelectedIds((current) => current.filter((courseId) => courseId !== id));

  const coursesToMove = selectedCourses.filter((course) => movedTerms[course.id] !== planTerm);
  const selectedTermLabel = planTerms.find((term) => term.value === planTerm)?.label ?? "four-year plan";

  const moveSelectedCourses = () => {
    coursesToMove.forEach((course) => {
      window.dispatchEvent(new CustomEvent("caltech-course-schedule-add", {
        detail: {
          label: `${course.code}${course.section ? ` ${course.section}` : ""}: ${course.title}`,
          units: course.totalUnits ?? 0,
          cell: planTerm,
        },
      }));
    });
    setMovedTerms((current) => ({ ...current, ...Object.fromEntries(coursesToMove.map((course) => [course.id, planTerm])) }));
  };

  const exportSelectedCourses = () => {
    const calendar = courseScheduleIcs(scheduledCourses);
    if (!calendar) return;
    const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
    const download = document.createElement("a");
    download.href = url;
    download.download = "caltech-fall-2026-schedule.ics";
    download.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const onCatalogDragStart = (event: DragEvent<HTMLElement>, id: string) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/caltech-course", id);
  };
  const onCalendarDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/caltech-course");
    if (schedule.offerings.some((course) => course.id === id)) addCourse(id);
  };

  const catalogPanel = (
    <aside className="course-schedule-catalog" aria-labelledby="course-catalog-heading">
      <div className="course-schedule-catalog-heading">
        <p className="course-schedule-eyebrow">{schedule.offerings.length} courses</p>
        <h3 id="course-catalog-heading">Course list</h3>
      </div>
      <div className="course-schedule-filters">
        <label><span>Search courses</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Course or code…" type="search" /></label>
        <label><span>Subject</span><select value={subject} onChange={(event) => setSubject(event.target.value)}><option value="all">All subjects</option>{subjects.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="course-schedule-meeting-filter"><input checked={showScheduledOnly} onChange={(event) => setShowScheduledOnly(event.target.checked)} type="checkbox" /> <span>Meeting times only</span></label>
      </div>
      <p className="course-schedule-result-count">{filteredCourses.length} matching courses</p>
      <div className="course-schedule-table-wrap">
        <table>
          <thead><tr><th>Course</th><th>Meeting</th><th><span className="sr-only">Add to calendar</span></th></tr></thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr draggable onDragStart={(event) => onCatalogDragStart(event, course.id)} key={course.id}>
                <td><strong>{course.code}{course.section && ` · ${course.section}`}</strong><span>{course.title} · {courseLoadLabel(course)}</span></td>
                <td><strong>{course.daysTime}</strong><span>{course.location || "Arranged"}</span></td>
                <td><button className="course-schedule-add-button" disabled={selectedIds.includes(course.id)} onClick={() => addCourse(course.id)} type="button">{selectedIds.includes(course.id) ? "Added" : "Add"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </aside>
  );

  return (
    <section className="course-schedule-shell" aria-labelledby="fall-schedule-heading">
      <div className="course-schedule-heading">
        <div>
          <h2 id="fall-schedule-heading">Weekly Course Scheduler</h2>
          <p>
            Currently for 2026-2027 schedule
          </p>
        </div>
        <a className="course-schedule-source" href={schedule.source} target="_blank" rel="noreferrer">Fall 2026–27 source <span aria-hidden="true">↗</span></a>
      </div>

      <div className="course-schedule-summary" aria-live="polite">
        <span><strong>{selectedCourses.length}</strong> selected</span>
        <span><strong>{fixedUnitTotal}</strong> fixed units{variableUnitCount ? ` + ${variableUnitCount} variable` : ""}</span>
        <span className={conflicts.length ? "course-schedule-conflict-count" : ""}><strong>{conflicts.length}</strong> overlap{conflicts.length === 1 ? "" : "s"}</span>
      </div>

      <div className="course-schedule-workspace">
        {catalogPanel}
        <div className="course-schedule-calendar-wrap">
          <div className="course-schedule-calendar-actions" aria-live="polite">
            <label className="course-schedule-plan-target">
              <span>Move selected courses to</span>
              <select value={planTerm} onChange={(event) => setPlanTerm(event.target.value)}>
                {planTerms.map((term) => <option key={term.value} value={term.value}>{term.label}</option>)}
              </select>
            </label>
            <div className="course-schedule-action-list">
              <button className="course-schedule-move-button" disabled={!coursesToMove.length} onClick={moveSelectedCourses} type="button">
                {selectedCourses.length === 0 ? "Move selected courses to four-year plan" : coursesToMove.length === 0 ? `Added to ${selectedTermLabel} ✓` : `Move ${coursesToMove.length} selected course${coursesToMove.length === 1 ? "" : "s"} to four-year plan`}
              </button>
              <button className="course-schedule-calendar-export" disabled={!scheduledCourses.length} onClick={exportSelectedCourses} type="button">
                {scheduledCourses.length === 0 ? "Export selected courses to Google Calendar" : `Export ${scheduledCourses.length} scheduled course${scheduledCourses.length === 1 ? "" : "s"} to Google Calendar`}
              </button>
            </div>
            {conflicts.length > 0 && <p className="course-schedule-conflict-note">Overlaps stay on the calendar and are highlighted in coral.</p>}
          </div>
          <div
            className="course-schedule-calendar"
            onDragOver={(event) => event.preventDefault()}
            onDrop={onCalendarDrop}
            aria-label="Weekly course calendar. Drop a course here to add it."
          >
            <span className="course-schedule-calendar-label">Time</span>
            {WEEKDAY_ORDER.map((day) => <span className="course-schedule-day" key={day}>{({ M: "Mon", T: "Tue", W: "Wed", R: "Thu", F: "Fri" } as Record<string, string>)[day]}</span>)}
            {Array.from({ length: (CALENDAR_END - CALENDAR_START) / 60 + 1 }, (_, index) => {
              const minutes = CALENDAR_START + index * 60;
              return <span className="course-schedule-time" key={minutes} style={{ gridRow: calendarRow(minutes) }}>{formatMinutes(minutes)}</span>;
            })}
            {WEEKDAY_ORDER.map((day) => <span aria-hidden="true" className="course-schedule-day-lane" key={day} style={{ gridColumn: WEEKDAY_ORDER.indexOf(day) + 2, gridRow: "2 / -1" }} />)}
            {selectedCourses.flatMap((course) => course.meetings
              .filter((meeting) => WEEKDAY_ORDER.includes(meeting.day as (typeof WEEKDAY_ORDER)[number]))
              .map((meeting, index) => (
                <article
                  className={`course-schedule-event${conflictingIds.has(course.id) ? " is-conflicting" : ""}`}
                  data-course-id={course.id}
                  key={`${course.id}-${meeting.day}-${meeting.start}-${index}`}
                  style={{
                    gridColumn: WEEKDAY_ORDER.indexOf(meeting.day as (typeof WEEKDAY_ORDER)[number]) + 2,
                    gridRow: `${calendarRow(meeting.start)} / span ${calendarSpan(meeting.start, meeting.end)}`,
                    borderColor: conflictingIds.has(course.id) ? undefined : `${scheduleColor(course)}a6`,
                    backgroundColor: conflictingIds.has(course.id) ? undefined : `${scheduleColor(course)}26`,
                    "--course-color": scheduleColor(course),
                  } as CSSProperties}
                >
                  <button onClick={() => removeCourse(course.id)} type="button" aria-label={`Remove ${offeringName(course)} from the weekly calendar`}>
                    <strong>{course.code}</strong>
                    <span>{course.section && `${course.section} · `}{formatMinutes(meeting.start).replace(" ", "")}–{formatMinutes(meeting.end).replace(" ", "")}</span>
                    <small>{course.title}</small>
                  </button>
                </article>
              ))) }
          </div>
          <p className="course-schedule-drop-hint">Drag a course from the timetable onto this calendar, or use its Add button. Select a block to remove it.</p>
        </div>
      </div>
    </section>
  );
}
