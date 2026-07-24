"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { COURSE_PLAN_STORAGE_KEY, fetchCoursePlan, loadStoredIdentity } from "@/lib/course-plan-sync";

// The drag-in animation uses the viewer's own saved schedule: one real class
// per term (the first in each populated cell) drops into place as a colored
// requirement bubble, staggered in waves so several land together. Terms with
// no class are skipped entirely.
// Requirement colours from the real planner (data/caltech-requirements), used
// the same way the planner styles a chip: a low-opacity tint of the colour
// behind text in the full colour.
const dropColors = ["#42a727", "#0c9b70", "#2a78d6", "#eb6834", "#7a4fc8", "#b96b00"];

// When no saved plan has loaded (fresh browser / signed out), the animation
// falls back to a representative Caltech ChemE + BEM schedule so the drag-in
// demo never disappears. One class per listed term.
const fallbackClasses: ThumbnailClass[] = [
  { id: "f1", label: "Ch 1a", units: 9, done: true, cell: "1-Fall" },
  { id: "f2", label: "Ph 1a", units: 9, done: true, cell: "1-Spring" },
  { id: "f3", label: "ChE 63a", units: 9, done: true, cell: "2-Fall" },
  { id: "f4", label: "ChE 63b", units: 9, done: false, cell: "2-Winter" },
  { id: "f5", label: "ChE 103a", units: 9, done: false, cell: "3-Fall" },
  { id: "f6", label: "ChE 130", units: 9, done: false, cell: "3-Spring" },
  { id: "f7", label: "ChE 126", units: 9, done: false, cell: "4-Fall" },
  { id: "f8", label: "BEM 103", units: 9, done: false, cell: "4-Winter" },
];

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

  // Assign each populated term a drop order (two per wave) and a bubble colour,
  // walking the grid in reading order. Empty terms take no slot.
  const dropByCell = useMemo(() => {
    const map = new Map<string, { wave: number; color: string }>();
    let index = 0;
    for (const year of YEARS) {
      for (const term of TERMS) {
        const cell = `${year}-${term}`;
        if ((classesByCell.get(cell)?.length ?? 0) > 0) {
          map.set(cell, { wave: Math.floor(index / 2), color: dropColors[index % dropColors.length] });
          index += 1;
        }
      }
    }
    return map;
  }, [classesByCell]);

  return (
    <div className="tool-thumbnail swipe-bubble-media tool-thumbnail-planner" aria-hidden="true">
      <div className="tool-planner-heading">
        <span>My 4-year plan</span>
        <small>{classes.length > 0 ? `${classes.length} classes · ${totalUnits} units` : "Your saved schedule"}</small>
      </div>
      <div className="tool-planner-term-headings"><i /><span>Fall</span><span>Winter</span><span>Spring</span></div>
      <div className="tool-planner-grid">
        {YEARS.map((year) => (
          <div className="tool-planner-row" key={year}>
            <strong>Year {year}</strong>
            {TERMS.map((term) => {
              const termClasses = classesByCell.get(`${year}-${term}`) ?? [];
              const shownClasses = termClasses.slice(0, 2);
              const drop = dropByCell.get(`${year}-${term}`);
              return (
                <span className={termClasses.length > 0 ? termClasses.every((entry) => entry.done) ? "is-accent" : "is-filled" : ""} key={term}>
                  {shownClasses.map((entry, index) => index === 0 && drop ? (
                    <i className="tool-planner-demo-chip" key={entry.id} style={{ "--demo-chip-bg": `${drop.color}2b`, "--demo-chip-fg": drop.color, "--demo-index": drop.wave } as CSSProperties}>{entry.label}</i>
                  ) : (
                    <i key={entry.id}>{entry.label}</i>
                  ))}
                  {termClasses.length > shownClasses.length && <i>+{termClasses.length - shownClasses.length}</i>}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
