import { writeFile } from "node:fs/promises";

const source = "https://schedules.caltech.edu/FA2026-27.html";
const destination = new URL("../data/caltech-fall-2026-schedule.json", import.meta.url);

function decodeHtml(value) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function parseUnits(value) {
  const match = value.match(/^(\d+)-(\d+)-(\d+)$/);
  if (!match) return { parts: null, total: null };
  const parts = match.slice(1).map(Number);
  return { parts, total: parts.reduce((sum, part) => sum + part, 0) };
}

function parseTime(value) {
  const match = value.match(/^([MTWRFSU]+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (!match) return [];
  const days = match[1].split("");
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  return days.map((day) => ({ day, start: toMinutes(match[2]), end: toMinutes(match[3]) }));
}

function isCourseCode(value) {
  return /^(?:[A-Za-z]{1,8}(?:\s*\/\s*[A-Za-z]{1,8})*\s*)\d{1,3}[A-Za-z]?(?:\/[A-Za-z0-9]+)?$/.test(value);
}

function isSection(value) {
  return /^\d{2}[A-Za-z]?$/.test(value);
}

function subjectFor(code) {
  return code.match(/^[A-Za-z]+/)?.[0] ?? code;
}

const response = await fetch(source);
if (!response.ok) throw new Error(`Could not download the schedule (${response.status}).`);
const html = await response.text();
const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)].map((match) => match[1]);
const offerings = [];

for (const table of tables) {
  const values = [...table.matchAll(/<font\b[^>]*>([\s\S]*?)<\/font>/gi)]
    .map((match) => decodeHtml(match[1]))
    .filter(Boolean);
  const codeIndex = values.findIndex(isCourseCode);
  if (codeIndex === -1) continue;

  const code = values[codeIndex];
  const units = values[codeIndex + 1] ?? "";
  if (!/^(?:\d+-\d+-\d+|\+)$/.test(units)) continue;
  const title = values[codeIndex + 2] ?? "Untitled course";
  const { parts, total } = parseUnits(units);
  const sectionIndex = values.findIndex((value, index) => index > codeIndex + 2 && isSection(value));
  const section = sectionIndex === -1 ? "" : values[sectionIndex];
  const details = sectionIndex === -1 ? [] : values.slice(sectionIndex + 1);
  const timeIndex = details.findIndex((value) => /^(M|T|W|R|F|S|U)+\s+\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(value));
  const instructor = timeIndex > 0 ? details.slice(0, timeIndex).join("; ") : details[0] ?? "";
  const daysTime = timeIndex === -1 ? "Arranged / no listed meeting" : details[timeIndex];
  const location = timeIndex === -1 ? "" : details[timeIndex + 1] ?? "";
  const grade = timeIndex === -1 ? "" : details[timeIndex + 2] ?? "";
  offerings.push({
    id: `${code.replace(/\s+/g, "-")}-${section || "arranged"}-${offerings.length + 1}`.toLowerCase(),
    subject: subjectFor(code),
    code,
    title,
    section,
    units,
    unitParts: parts,
    totalUnits: total,
    instructor,
    daysTime,
    location,
    grade,
    meetings: parseTime(daysTime),
  });
}

if (offerings.length < 500) throw new Error(`Only parsed ${offerings.length} course schedule rows; schedule markup may have changed.`);

// The public schedule repeats a cross-listed offering under each relevant subject.
// Keep one calendar item for that single real section while retaining every distinct time.
const uniqueOfferings = [...new Map(offerings.map((course) => [
  [course.code, course.section, course.daysTime, course.instructor, course.location].join("|"),
  course,
])).values()];

await writeFile(destination, `${JSON.stringify({ term: "Fall 2026–27", source, sourceEntries: offerings.length, offerings: uniqueOfferings }, null, 2)}\n`);
console.log(`Imported ${uniqueOfferings.length} unique Fall 2026–27 offerings from ${offerings.length} schedule rows.`);
