"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { COURSE_PLAN_STORAGE_KEY, fetchCoursePlan, loadStoredIdentity } from "@/lib/course-plan-sync";

// Sample classes that loop a drag-and-drop demo into empty cells, styled as
// the planner page's colored requirement bubbles; cells already holding real
// plan entries are left alone. `wave` groups classes that drop together, so
// several land at once and the whole plan fills quickly.
const demoDrops: Record<string, { label: string; wave: number; color: string }> = {
  "1-Fall": { label: "Ma 1a", wave: 0, color: "rgb(122 148 198 / 0.42)" },
  "1-Winter": { label: "ChE 63a", wave: 0, color: "rgb(var(--color-moss) / 0.38)" },
  "2-Spring": { label: "ACM 95a", wave: 1, color: "rgb(var(--color-clay) / 0.42)" },
  "3-Fall": { label: "ChE 103a", wave: 1, color: "rgb(var(--color-moss) / 0.38)" },
  "4-Fall": { label: "ChE 126", wave: 2, color: "rgb(122 148 198 / 0.42)" },
  "4-Winter": { label: "BEM 103", wave: 2, color: "rgb(var(--color-clay) / 0.42)" },
};

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

  const classesByCell = useMemo(() => {
    const grouped = new Map<string, ThumbnailClass[]>();
    for (const entry of classes) grouped.set(entry.cell, [...(grouped.get(entry.cell) ?? []), entry]);
    return grouped;
  }, [classes]);
  const totalUnits = classes.reduce((sum, entry) => sum + entry.units, 0);

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
              const demo = termClasses.length === 0 ? demoDrops[`${year}-${term}`] : undefined;
              return (
                <span className={termClasses.length > 0 ? termClasses.every((entry) => entry.done) ? "is-accent" : "is-filled" : ""} key={term}>
                  {shownClasses.map((entry) => <i key={entry.id}>{entry.label}</i>)}
                  {termClasses.length > shownClasses.length && <i>+{termClasses.length - shownClasses.length}</i>}
                  {demo && (
                    <i className="tool-planner-demo-chip" style={{ "--demo-chip-bg": demo.color, "--demo-index": demo.wave } as CSSProperties}>
                      {demo.label}
                    </i>
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
