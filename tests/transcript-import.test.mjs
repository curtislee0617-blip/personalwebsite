import assert from "node:assert/strict";
import test from "node:test";
import { parseTranscriptCourses } from "../lib/transcript-import.ts";

test("extracts course codes, units, and Caltech term locations from transcript columns", () => {
  const courses = parseTranscriptCourses([
    { text: "FA 2024-25", x: 160, y: 380, page: 1 },
    { text: "WI 2024-25", x: 160, y: 230, page: 1 },
    { text: "ChE010", x: 17, y: 330, page: 1 },
    { text: "1", x: 266, y: 330, page: 1 },
    { text: "Ma 001B", x: 17, y: 190, page: 1 },
    { text: "9", x: 266, y: 190, page: 1 },
  ]);
  assert.deepEqual(courses.map(({ code, units, cell }) => ({ code, units, cell })), [
    { code: "ChE 010", units: 1, cell: "1-Fall" },
    { code: "Ma 001B", units: 9, cell: "1-Winter" },
  ]);
});

test("falls back to an editable first-term placement when no transcript term header is readable", () => {
  const courses = parseTranscriptCourses([{ text: "CS 001", x: 17, y: 320, page: 1 }]);
  assert.deepEqual(courses.map(({ code, units, cell }) => ({ code, units, cell })), [{ code: "CS 001", units: 0, cell: "1-Fall" }]);
});
