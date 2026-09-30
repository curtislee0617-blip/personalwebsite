export type TranscriptTextItem = { text: string; x: number; y: number; page: number };

export type TranscriptCourse = {
  id: string;
  code: string;
  units: number;
  cell: string;
};

type TranscriptTerm = { label: string; x: number; y: number; page: number };

const TERM_PATTERN = /^(FA|WI|SP)\s+(\d{4})-\d{2}$/;
const COURSE_PATTERN = /^([A-Za-z]{1,8}(?:\/[A-Za-z]{1,8})?)\s*(\d{3})([A-Za-z]?)$/;

function courseCode(text: string) {
  const match = text.trim().match(COURSE_PATTERN);
  if (!match) return null;
  return `${match[1]} ${match[2]}${match[3]}`;
}

function termToCell(label: string, firstAcademicYear: number) {
  const match = label.match(TERM_PATTERN);
  if (!match) return "1-Fall";
  const term = match[1];
  const year = Math.max(1, Math.min(4, Number(match[2]) - firstAcademicYear + 1));
  return `${year}-${term === "FA" ? "Fall" : term === "WI" ? "Winter" : "Spring"}`;
}

function closestTerm(course: TranscriptTextItem, terms: TranscriptTerm[]) {
  const sameColumn = terms.filter((term) => term.page === course.page && term.x > course.x + 70 && term.x < course.x + 230);
  const candidates = sameColumn.length ? sameColumn : terms.filter((term) => term.page === course.page);
  return candidates.sort((first, second) => {
    const firstDistance = first.y >= course.y ? first.y - course.y : Math.abs(first.y - course.y) + 1000;
    const secondDistance = second.y >= course.y ? second.y - course.y : Math.abs(second.y - course.y) + 1000;
    return firstDistance - secondDistance;
  })[0] ?? null;
}

function closestUnits(course: TranscriptTextItem, items: TranscriptTextItem[]) {
  const candidates = items.filter((item) => (
    item.page === course.page
    && /^\d{1,2}$/.test(item.text.trim())
    && item.x > course.x + 90
    && item.x < course.x + 360
    && Math.abs(item.y - course.y) < 3
  ));
  const unit = candidates.sort((first, second) => first.x - second.x)[0];
  const value = Number(unit?.text.trim());
  return Number.isFinite(value) && value >= 0 && value <= 36 ? value : 0;
}

/**
 * Extract the course-column data Caltech's unofficial transcript layout exposes.
 * A missing term or unit becomes a safe editable default rather than blocking import.
 */
export function parseTranscriptCourses(items: TranscriptTextItem[]) {
  const terms: TranscriptTerm[] = items.flatMap((item) => {
    const label = item.text.trim();
    return TERM_PATTERN.test(label) ? [{ label, x: item.x, y: item.y, page: item.page }] : [];
  });
  const academicYears = terms.map((term) => Number(term.label.match(TERM_PATTERN)?.[2])).filter(Number.isFinite);
  const firstAcademicYear = academicYears.length ? Math.min(...academicYears) : new Date().getFullYear();
  const seen = new Set<string>();

  return items.flatMap((item, index): TranscriptCourse[] => {
    const code = courseCode(item.text);
    if (!code) return [];
    const key = `${item.page}:${item.x.toFixed(1)}:${item.y.toFixed(1)}:${code}`;
    if (seen.has(key)) return [];
    seen.add(key);
    const term = closestTerm(item, terms);
    return [{
      id: `transcript-${index}-${code.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`,
      code,
      units: closestUnits(item, items),
      cell: term ? termToCell(term.label, firstAcademicYear) : "1-Fall",
    }];
  });
}
