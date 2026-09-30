"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { COURSE_PLAN_STORAGE_KEY, fetchCoursePlan, loadStoredIdentity } from "@/lib/course-plan-sync";

// Use the planner palette for compact, staggered stacks of course chips.
const dropColors = ["#42a727", "#0c9b70", "#2a78d6", "#eb6834", "#7a4fc8", "#b96b00"];

// A populated example shows the animation when there is no saved plan.
const exampleTerms = [
  ["Ch 1a", "Ma 1a"], ["Ch 1b", "Ph 1b"], ["Ma 1c", "Ph 1c"],
  ["ChE 63a", "Ch 21a"], ["ChE 63b", "Ch 21b"], ["ChE 64", "Ch 21c"],
  ["ChE 103a", "BEM 103"], ["ChE 103b", "BEM 104"], ["ChE 130", "Hum elective"],
  ["ChE 126", "ChE elective"], ["BEM 105", "Hum elective"], ["ChE elective", "SS elective"],
];
const fallbackClasses: ThumbnailClass[] = exampleTerms.flatMap((labels, cellIndex) =>
  labels.map((label, index) => ({
    id: `example-${cellIndex}-${index}`,
    label,
    units: 9,
    done: false,
    cell: `${Math.floor(cellIndex / 3) + 1}-${["Fall", "Winter", "Spring"][cellIndex % 3]}`,
  })),
);

type ThumbnailClass = {
  id: string;
  label: string;
  units: number;
  done: boolean;
  cell: string;
};

const YEARS = [1, 2, 3, 4] as const;
const TERMS = ["Fall", "Winter", "Spring"] as const;

function classesFromPlan(value: unknown): ThumbnailClass[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const classes = (value as { classes?: unknown }).classes;
  if (!classes || typeof classes !== "object" || Array.isArray(classes)) return [];

  return Object.entries(classes).flatMap(([id, rawClass]) => {
    if (!rawClass || typeof rawClass !== "object" || Array.isArray(rawClass)) return [];
    const entry = rawClass as Record<string, unknown>;
    const units = Number(entry.units);
    const label = typeof entry.label === "string" ? entry.label.trim() : "";
    const cell = typeof entry.cell === "string" ? entry.cell : "";
    // Zero/blank units mean the course is still only a placeholder.
    if (!label || !Number.isFinite(units) || units <= 0 || !/^\d-(?:Fall|Winter|Spring)$/.test(cell)) return [];
    return [{ id, label, units, done: entry.done === true, cell }];
  });
}

function readLocalClasses() {
  try {
    const raw = window.localStorage.getItem(COURSE_PLAN_STORAGE_KEY);
    return raw ? classesFromPlan(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function CoursePlannerThumbnail() {
  const [classes, setClasses] = useState<ThumbnailClass[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate the user's local-only planner preview after mount
    setClasses(readLocalClasses());

    const identity = loadStoredIdentity();
    if (identity) {
      fetchCoursePlan(identity.loginKey)
        .then((row) => {
          const cloudClasses = classesFromPlan(row?.plan);
          if (cloudClasses.length > 0) setClasses(cloudClasses);
        })
        .catch(() => {
          // The local preview remains available when cloud save is offline.
        });
    }

    const refresh = () => setClasses(readLocalClasses());
    window.addEventListener("storage", refresh);
    window.addEventListener("caltech-course-plan-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("caltech-course-plan-updated", refresh);
    };
  }, []);

  // Use the viewer's saved schedule when present; otherwise the fallback demo
  // so the drag-in animation is always visible.
  const displayClasses = classes.length > 0 ? classes : fallbackClasses;
  const classesByCell = useMemo(() => {
    const grouped = new Map<string, ThumbnailClass[]>();
    for (const entry of displayClasses) grouped.set(entry.cell, [...(grouped.get(entry.cell) ?? []), entry]);
    return grouped;
  }, [displayClasses]);
  const totalUnits = classes.reduce((sum, entry) => sum + entry.units, 0);

  return (
    <div className="tool-thumbnail swipe-bubble-media tool-thumbnail-planner" aria-hidden="true">
      <div className="tool-planner-heading">
        <span>My 4-year plan</span>
        <small>{classes.length > 0 ? `${classes.length} classes · ${totalUnits} units` : "Example schedule"}</small>
      </div>
      <div className="tool-planner-term-headings"><i /><span>Fall</span><span>Winter</span><span>Spring</span></div>
      <div className="tool-planner-grid">
        {YEARS.map((year) => (
          <div className="tool-planner-row" key={year}>
            <strong>Year {year}</strong>
            {TERMS.map((term) => {
              const cellClasses = (classesByCell.get(`${year}-${term}`) ?? []).slice(0, 3);
              const cellIndex = (year - 1) * TERMS.length + TERMS.indexOf(term);
              return (
                <span key={term}>
                  {cellClasses.map((entry, index) => {
                    const color = dropColors[(cellIndex + index) % dropColors.length];
                    return (
                      <i
                        key={entry.id}
                        className="tool-planner-demo-chip"
                        style={{ "--demo-chip-bg": `${color}2b`, "--demo-chip-fg": color, "--demo-index": cellIndex + index * 12 } as CSSProperties}
                      >{entry.label}</i>
                    );
                  })}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
