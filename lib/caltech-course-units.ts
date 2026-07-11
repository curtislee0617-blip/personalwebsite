import scheduleData from "@/data/caltech-course-units.json";

export type CaltechScheduleTerm = "Fall" | "Winter" | "Spring";

type ScheduleUnitData = Record<CaltechScheduleTerm, Record<string, number>>;

const unitData = scheduleData as unknown as ScheduleUnitData;
const termSuffix: Record<CaltechScheduleTerm, string> = {
  Fall: "A",
  Winter: "B",
  Spring: "C",
};

function normalizedCourseKey(subject: string, number: string, suffix = "") {
  const normalizedSubject = subject.replace(/[^a-z]/gi, "").toUpperCase();
  const normalizedNumber = String(Number(number));
  return `${normalizedSubject}${normalizedNumber}${suffix.toUpperCase()}`;
}

/**
 * Finds the first fixed-unit course code in a planner requirement label.
 * Variable-unit schedule entries use "+" and are intentionally absent so users can edit them.
 */
export function scheduledUnitsForCourseLabel(label: string, term: CaltechScheduleTerm) {
  const termUnits = unitData[term];
  const codePattern = /\b([A-Za-z]+(?:\/[A-Za-z]+)*)\s*0*(\d+)\s*([A-Za-z]*)/g;

  for (const match of label.matchAll(codePattern)) {
    const [, subjects, number, rawSuffix] = match;
    const suffix = rawSuffix.toUpperCase();
    const suffixes = new Set([suffix]);
    if (suffix.length > 1 && suffix.includes(termSuffix[term])) suffixes.add(termSuffix[term]);

    const subjectCandidates = subjects.includes("/") ? [subjects.replace(/\//g, ""), ...subjects.split("/")] : [subjects];
    for (const subject of subjectCandidates) {
      for (const candidateSuffix of suffixes) {
        const units = termUnits[normalizedCourseKey(subject, number, candidateSuffix)];
        if (units !== undefined) return units;
      }
    }
  }

  return undefined;
}
