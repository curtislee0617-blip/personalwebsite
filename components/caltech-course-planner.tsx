"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent } from "react";
import { categoriesForMajors, integratedCoreRequirementTemplates, majors, requirementCategories, requirementTemplates, templatesForMajors, type MajorId, type RequirementCategory, type RequirementTemplate } from "@/data/caltech-requirements";
import { scheduledUnitsForCourseLabel } from "@/lib/caltech-course-units";
import { buildAccountLoginKey, COURSE_PLAN_STORAGE_KEY, displayNameFor, fetchCoursePlan, loadStoredIdentity, saveCoursePlan, saveStoredIdentity, type StoredIdentity } from "@/lib/course-plan-sync";
import { normalizeNumericInputText } from "@/lib/numeric-input";
import type { Json } from "@/lib/supabase/database.types";

const YEARS = [1, 2, 3, 4] as const;
const TERMS = ["Fall", "Winter", "Spring"] as const;
type Term = (typeof TERMS)[number];

// A "class" is one real course, placed in one term, that can satisfy several requirement
// tags at once (a lot of Caltech courses double- or triple-count). Requirements themselves
// are never placed — a requirement is "satisfied" once some class's requirementIds includes it.
type PlacedClass = { id: string; label: string; units: number; unitsEdited: boolean; done: boolean; cell: string; requirementIds: string[] };
type CoreScheduleMode = "normal" | "integrated";
type SavedPlan = { classes: Record<string, PlacedClass>; customTemplates: RequirementTemplate[]; coreScheduleMode: CoreScheduleMode };
type Selection = { type: "requirement" | "class"; id: string } | null;
type RequirementOwner = { classId: string; className: string; units: number };

const LOCAL_MAJORS_STORAGE_KEY = "caltech-course-planner-local-majors-v1";
const DEFAULT_CLASS_UNITS = 9;
const DEFAULT_CORE_SCHEDULE_MODE: CoreScheduleMode = "normal";
const MAX_PROFILE_PROGRAMS = 6;
const CHEME_TRACK_IDS: MajorId[] = ["cheme-biomolecular", "cheme-sustainability", "cheme-process", "cheme-materials", "cheme-computational"];
const CHEME_TRACK_ID_SET = new Set<MajorId>(CHEME_TRACK_IDS);
const EE_TRACK_IDS: MajorId[] = ["ee-circuits", "ee-computer", "ee-intelligent", "ee-medical", "ee-photonics"];
const EE_TRACK_ID_SET = new Set<MajorId>(EE_TRACK_IDS);
const GPS_TRACK_IDS: MajorId[] = ["gps-geology", "gps-geobiology", "gps-geochemistry", "gps-geophysics", "gps-planetary"];
const GPS_TRACK_ID_SET = new Set<MajorId>(GPS_TRACK_IDS);
const MAJOR_IDS = new Set<MajorId>([
  ...CHEME_TRACK_IDS,
  ...EE_TRACK_IDS,
  ...GPS_TRACK_IDS,
  "bem", "cs", "math", "physics", "chemistry", "bioengineering", "acm", "aph", "ay", "biology", "cns", "economics", "eas", "english", "ese",
  "history", "hps", "ids", "isp", "materials-science", "mechanical-engineering", "philosophy", "political-science",
]);
const MINOR_IDS = new Set<MajorId>([
  "cheme-minor", "bem-minor", "cs-minor", "math-minor", "chemistry-minor", "ae-minor", "ay-minor", "cds-minor", "english-minor", "ese-minor",
  "history-minor", "hps-minor", "neurobiology-minor", "philosophy-minor", "robotics-minor", "structural-mechanics-minor", "visual-culture-minor",
]);
const SUBJECT_GROUPS: Array<{
  title: string;
  ids: MajorId[];
  sections: Array<{ title?: string; ids: MajorId[] }>;
}> = [
  {
    title: "BBE",
    ids: ["bioengineering", "biology", "cns", "neurobiology-minor"],
    sections: [
      { title: "Bioengineering", ids: ["bioengineering"] },
      { title: "Biology", ids: ["biology"] },
      { title: "Computation & Neural Systems", ids: ["cns"] },
      { title: "Minors", ids: ["neurobiology-minor"] },
    ],
  },
  {
    title: "CCE",
    ids: [...CHEME_TRACK_IDS, "cheme-minor", "chemistry", "chemistry-minor", "ese", "ese-minor"],
    sections: [
      { title: "Chemical Engineering tracks", ids: CHEME_TRACK_IDS },
      { title: "Chemistry", ids: ["chemistry", "chemistry-minor"] },
      { title: "Environmental Science & Engineering", ids: ["ese", "ese-minor"] },
      { title: "Minors", ids: ["cheme-minor"] },
    ],
  },
  {
    title: "EAS",
    ids: ["ae-minor", "aph", "cs", "cs-minor", ...EE_TRACK_IDS, "eas", "ids", "materials-science", "mechanical-engineering", "cds-minor", "robotics-minor", "structural-mechanics-minor"],
    sections: [
      { title: "Applied Physics", ids: ["aph"] },
      { title: "Computer Science", ids: ["cs", "cs-minor"] },
      { title: "Electrical Engineering tracks", ids: EE_TRACK_IDS },
      { title: "Engineering & Applied Science", ids: ["eas"] },
      { title: "Information & Data Sciences", ids: ["ids"] },
      { title: "Materials / Mechanical", ids: ["materials-science", "mechanical-engineering"] },
      { title: "Minors", ids: ["ae-minor", "cds-minor", "robotics-minor", "structural-mechanics-minor"] },
    ],
  },
  {
    title: "GPS",
    ids: [...GPS_TRACK_IDS, "ay", "ay-minor"],
    sections: [
      { title: "GPS tracks", ids: GPS_TRACK_IDS },
      { title: "Astrophysics", ids: ["ay", "ay-minor"] },
    ],
  },
  {
    title: "HSS",
    ids: ["bem", "bem-minor", "economics", "english", "english-minor", "history", "history-minor", "hps", "hps-minor", "philosophy", "philosophy-minor", "political-science", "visual-culture-minor"],
    sections: [
      { title: "Business / Economics / Politics", ids: ["bem", "bem-minor", "economics", "political-science"] },
      { title: "Humanities", ids: ["english", "english-minor", "history", "history-minor", "hps", "hps-minor", "philosophy", "philosophy-minor", "visual-culture-minor"] },
    ],
  },
  {
    title: "PMA",
    ids: ["acm", "math", "math-minor", "physics"],
    sections: [
      { title: "Applied & Computational Mathematics", ids: ["acm"] },
      { title: "Mathematics", ids: ["math", "math-minor"] },
      { title: "Physics", ids: ["physics"] },
    ],
  },
  {
    title: "Other",
    ids: ["isp"],
    sections: [{ title: "Interdisciplinary", ids: ["isp"] }],
  },
];

function cellId(year: number, term: Term) {
  return `${year}-${term}`;
}

function termFromCell(cell: string): Term | null {
  const term = cell.split("-")[1];
  return TERMS.includes(term as Term) ? term as Term : null;
}

function categoryOf(id: string) {
  return requirementCategories.find((category) => category.id === id) ?? requirementCategories[requirementCategories.length - 1];
}

function tint(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function sanitizeUnits(value: unknown, fallback = DEFAULT_CLASS_UNITS) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(99, Math.max(0, Math.round(numeric * 10) / 10));
}

function normalizeCoreScheduleMode(value: unknown): CoreScheduleMode {
  return value === "integrated" ? "integrated" : DEFAULT_CORE_SCHEDULE_MODE;
}

function templatesForCoreScheduleMode(templates: RequirementTemplate[], coreScheduleMode: CoreScheduleMode) {
  if (coreScheduleMode === "normal") return templates;
  return [
    ...templates.filter((template) => template.categoryId !== "core-science"),
    ...integratedCoreRequirementTemplates,
  ];
}

function defaultUnitsForClass(label: string, cell: string, requirementIds: string[], templates: Map<string, RequirementTemplate>) {
  const template = requirementIds.map((id) => templates.get(id)).find(Boolean);
  if (template?.categoryId === "pe") return 3;
  const term = termFromCell(cell);
  return term ? scheduledUnitsForCourseLabel(template?.label ?? label, term) ?? DEFAULT_CLASS_UNITS : DEFAULT_CLASS_UNITS;
}

/** Counts each class once, even when it is tagged to multiple requirements in the category. */
function unitsMatchingRequirements(classes: Record<string, PlacedClass>, requirementIds: Iterable<string>, doneOnly = false) {
  const idSet = new Set(requirementIds);
  return Object.values(classes).reduce((sum, cls) => {
    if (doneOnly && !cls.done) return sum;
    return cls.requirementIds.some((id) => idSet.has(id)) ? sum + cls.units : sum;
  }, 0);
}

/** Drops any requirementIds that no longer resolve to a real template (stale major/catalog data). */
function sanitizePlan(templates: RequirementTemplate[], saved: Partial<SavedPlan> | null | undefined): SavedPlan {
  const coreScheduleMode = normalizeCoreScheduleMode(saved?.coreScheduleMode);
  const customTemplates = (saved?.customTemplates ?? []).filter((template) => template.categoryId !== "elective");
  const availableTemplates = [...templatesForCoreScheduleMode(templates, coreScheduleMode), ...customTemplates];
  const templateById = new Map(availableTemplates.map((template) => [template.id, template]));
  const validIds = new Set(templateById.keys());
  const classes: Record<string, PlacedClass> = {};
  for (const [id, cls] of Object.entries(saved?.classes ?? {})) {
    if (!cls || typeof cls !== "object") continue;
    const requirementIds = (cls.requirementIds ?? []).filter((rid) => validIds.has(rid));
    const defaultUnits = defaultUnitsForClass(cls.label ?? "New class", cls.cell, requirementIds, templateById);
    const unitsEdited = cls.unitsEdited === true;
    classes[id] = {
      id,
      label: cls.label ?? "New class",
      units: unitsEdited ? sanitizeUnits(cls.units, defaultUnits) : defaultUnits,
      unitsEdited,
      done: !!cls.done,
      cell: cls.cell,
      requirementIds,
    };
  }
  return { classes, customTemplates, coreScheduleMode };
}

function normalizedTemplateLabel(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function chemETrackLabel(label: string) {
  return label.replace(/^Chemical Engineering \(/, "").replace(/\)$/, "");
}

function eeTrackLabel(label: string) {
  return label.replace(/^Electrical Engineering \(/, "").replace(/\)$/, "");
}

function gpsTrackLabel(label: string) {
  return label.replace(/^Geological and Planetary Sciences \(/, "").replace(/\)$/, "");
}

function compactMajorLabel(id: MajorId, label: string) {
  if (CHEME_TRACK_ID_SET.has(id)) return chemETrackLabel(label);
  if (EE_TRACK_ID_SET.has(id)) return eeTrackLabel(label);
  if (GPS_TRACK_ID_SET.has(id)) return gpsTrackLabel(label);

  return label
    .replace(/^Business, Economics & Management$/, "BEM major")
    .replace(/^Business, Economics & Management \(minor\)$/, "BEM minor")
    .replace(/^Computer Science$/, "CS major")
    .replace(/^Computer Science \(minor\)$/, "CS minor")
    .replace(/^Mathematics$/, "Math major")
    .replace(/^Mathematics \(minor\)$/, "Math minor")
    .replace(/^Physics$/, "Physics")
    .replace(/^Chemistry$/, "Chemistry major")
    .replace(/^Chemistry \(minor\)$/, "Chemistry minor")
    .replace(/^Bioengineering$/, "Bioengineering")
    .replace(/^Applied and Computational Mathematics$/, "ACM")
    .replace(/^Chemical Engineering \(minor\)$/, "ChE minor")
    .replace(/^Environmental Science and Engineering$/, "ESE major")
    .replace(/^Environmental Science and Engineering \(minor\)$/, "ESE minor")
    .replace(/^Engineering and Applied Science$/, "EAS")
    .replace(/^Information and Data Sciences$/, "IDS")
    .replace(/^Materials Science$/, "Materials Science")
    .replace(/^Mechanical Engineering$/, "Mechanical Engineering")
    .replace(/^Computation and Neural Systems$/, "CNS")
    .replace(/^Control and Dynamical Systems \(minor\)$/, "CDS minor")
    .replace(/^Neurobiology \(minor\)$/, "Neurobiology minor")
    .replace(/^Structural Mechanics \(minor\)$/, "SM minor")
    .replace(/^Visual Culture \(minor\)$/, "VC minor");
}

function formatMajorSummary(majorIds: MajorId[]) {
  const chemeTracks = majorIds
    .filter((id) => CHEME_TRACK_ID_SET.has(id))
    .map((id) => majors.find((major) => major.id === id)?.label)
    .filter((label): label is string => Boolean(label))
    .map(chemETrackLabel);
  const eeTracks = majorIds
    .filter((id) => EE_TRACK_ID_SET.has(id))
    .map((id) => majors.find((major) => major.id === id)?.label)
    .filter((label): label is string => Boolean(label))
    .map(eeTrackLabel);
  const gpsTracks = majorIds
    .filter((id) => GPS_TRACK_ID_SET.has(id))
    .map((id) => majors.find((major) => major.id === id)?.label)
    .filter((label): label is string => Boolean(label))
    .map(gpsTrackLabel);
  const otherLabels = majorIds
    .filter((id) => !CHEME_TRACK_ID_SET.has(id) && !EE_TRACK_ID_SET.has(id) && !GPS_TRACK_ID_SET.has(id) && MAJOR_IDS.has(id))
    .map((id) => majors.find((major) => major.id === id)?.label ?? id);
  const minorLabels = majorIds
    .filter((id) => MINOR_IDS.has(id))
    .map((id) => majors.find((major) => major.id === id)?.label ?? id);

  return [
    chemeTracks.length ? `Chemical Engineering (${chemeTracks.join(", ")})` : null,
    eeTracks.length ? `Electrical Engineering (${eeTracks.join(", ")})` : null,
    gpsTracks.length ? `GPS (${gpsTracks.join(", ")})` : null,
    ...otherLabels,
    ...minorLabels,
  ].filter(Boolean).join(", ");
}

function reconcileTakenClassesForMajors(plan: SavedPlan, nextTemplates: RequirementTemplate[]): SavedPlan {
  const validIds = new Set([...nextTemplates, ...plan.customTemplates].map((template) => template.id));
  const knownTemplates = new Map([...requirementTemplates, ...integratedCoreRequirementTemplates, ...plan.customTemplates].map((template) => [template.id, template]));
  const targetByLabel = new Map([...nextTemplates, ...plan.customTemplates].map((template) => [normalizedTemplateLabel(template.label), template.id]));
  const classes: Record<string, PlacedClass> = {};

  for (const [id, cls] of Object.entries(plan.classes)) {
    if (!cls.done) continue;
    const mappedIds = new Set<string>();
    for (const requirementId of cls.requirementIds) {
      if (validIds.has(requirementId)) {
        mappedIds.add(requirementId);
        continue;
      }

      const previousTemplate = knownTemplates.get(requirementId);
      const mappedId = previousTemplate ? targetByLabel.get(normalizedTemplateLabel(previousTemplate.label)) : null;
      if (mappedId) mappedIds.add(mappedId);
    }

    const classLabelMatch = targetByLabel.get(normalizedTemplateLabel(cls.label));
    if (classLabelMatch) mappedIds.add(classLabelMatch);

    classes[id] = { ...cls, requirementIds: Array.from(mappedIds) };
  }

  return { classes, customTemplates: plan.customTemplates, coreScheduleMode: plan.coreScheduleMode };
}

function reconcilePlanForCoreScheduleMode(plan: SavedPlan, nextMode: CoreScheduleMode, selectedMajorIds: MajorId[]): SavedPlan {
  const nextTemplates = templatesForCoreScheduleMode(templatesForMajors(selectedMajorIds), nextMode);
  const validIds = new Set([...nextTemplates, ...plan.customTemplates].map((template) => template.id));
  const knownTemplates = new Map([...requirementTemplates, ...integratedCoreRequirementTemplates, ...plan.customTemplates].map((template) => [template.id, template]));
  const targetByLabel = new Map([...nextTemplates, ...plan.customTemplates].map((template) => [normalizedTemplateLabel(template.label), template.id]));
  const classes: Record<string, PlacedClass> = {};

  for (const [id, cls] of Object.entries(plan.classes)) {
    const mappedIds = new Set<string>();
    for (const requirementId of cls.requirementIds) {
      if (validIds.has(requirementId)) {
        mappedIds.add(requirementId);
        continue;
      }

      const previousTemplate = knownTemplates.get(requirementId);
      const mappedId = previousTemplate ? targetByLabel.get(normalizedTemplateLabel(previousTemplate.label)) : null;
      if (mappedId) mappedIds.add(mappedId);
    }
    classes[id] = { ...cls, requirementIds: Array.from(mappedIds) };
  }

  return { classes, customTemplates: plan.customTemplates, coreScheduleMode: nextMode };
}

// A single-field label editor that wraps onto multiple lines and grows to fit,
// so long default names never get silently clipped like a fixed-width <input> would.
function AutoGrowLabel({ value, done, onChange, onClick }: { value: string; done: boolean; onChange: (value: string) => void; onClick: (event: MouseEvent) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      className={`block w-full resize-none overflow-hidden bg-transparent text-xs font-medium leading-4 outline-none ${done ? "text-ink/40 line-through" : "text-ink/85"}`}
      onChange={(event) => onChange(event.target.value)}
      onClick={onClick}
      ref={ref}
      rows={1}
      value={value}
    />
  );
}

type MajorSelectorProps = {
  selectedMajors: MajorId[];
  onToggleMajor: (majorId: MajorId) => void;
};

type SubjectSelectorGroup = (typeof SUBJECT_GROUPS)[number];

function SubjectDropdown({ group, selectedMajors, onToggleMajor }: MajorSelectorProps & { group: SubjectSelectorGroup }) {
  const selectedCount = group.ids.filter((id) => selectedMajors.includes(id)).length;
  // Keep every subject group compact on entry, including when a returning
  // user's saved selections are restored. The user can open only what they need.
  const [open, setOpen] = useState(false);

  const countLabel = (count: number, singular: string, empty: string) => (
    count ? `${count} ${singular}${count === 1 ? "" : "s"}` : empty
  );

  return (
    <details className="course-major-group min-w-64 rounded-2xl border border-ink/20 bg-surface text-xs text-ink/70" onToggle={(event) => setOpen(event.currentTarget.open)} open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-1.5 font-medium marker:hidden">
        <span>{group.title}</span>
        <span className="text-[0.62rem] font-semibold text-ink/40">{countLabel(selectedCount, "selected", "choose")}</span>
      </summary>
      <div className="grid gap-2 border-t border-ink/10 px-3 py-2">
        {group.sections.map((section, sectionIndex) => (
          <div className="grid gap-1.5" key={section.title ?? sectionIndex}>
            {section.title && <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink/35">{section.title}</p>}
            {section.ids.map((id) => {
              const major = majors.find((item) => item.id === id);
              if (!major) return null;
              const label = compactMajorLabel(id, major.label);

              return (
                <label className="flex items-center gap-1.5 text-xs text-ink/70" key={id}>
                  <input checked={selectedMajors.includes(id)} onChange={() => onToggleMajor(id)} type="checkbox" />
                  {label}
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </details>
  );
}

function MajorSelector({ selectedMajors, onToggleMajor }: MajorSelectorProps) {
  return (
    <div className="course-major-selector mt-1 flex flex-wrap items-start gap-2">
      {SUBJECT_GROUPS.map((group) => (
        <SubjectDropdown group={group} key={group.title} onToggleMajor={onToggleMajor} selectedMajors={selectedMajors} />
      ))}
    </div>
  );
}

type RequirementRowProps = {
  template: RequirementTemplate;
  category: RequirementCategory;
  owner: RequirementOwner | undefined;
  isSelected: boolean;
  isCustom: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDeleteCustom: (id: string) => void;
};

function RequirementRow({ template, category, owner, isSelected, isCustom, onSelect, onDragStart, onDragEnd, onDeleteCustom }: RequirementRowProps) {
  const satisfied = !!owner;

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border px-2.5 py-2 text-left text-xs transition ${satisfied ? "" : "cursor-grab"} ${isSelected ? "ring-2 ring-offset-1 ring-offset-paper" : ""}`}
      draggable={!satisfied}
      onClick={() => !satisfied && onSelect(template.id)}
      onDragEnd={onDragEnd}
      onDragStart={(event) => {
        if (satisfied) return;
        event.dataTransfer.setData("text/plain", `requirement:${template.id}`);
        onDragStart(template.id);
      }}
      role={satisfied ? undefined : "button"}
      style={{
        borderColor: tint(category.color, "55"),
        backgroundColor: tint(category.color, satisfied ? "0c" : "14"),
        ...(isSelected ? ({ "--tw-ring-color": category.color } as CSSProperties) : {}),
      }}
      tabIndex={satisfied ? undefined : 0}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[0.55rem] font-bold text-white"
        style={{ borderColor: category.color, backgroundColor: satisfied ? category.color : "transparent" }}
      >
        {satisfied ? "✓" : ""}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-medium leading-4 ${satisfied ? "text-ink/45 line-through" : "text-ink/85"}`}>{template.label}</p>
        <p className="mt-0.5 truncate text-[0.6rem] uppercase tracking-[0.1em] text-ink/40">{satisfied ? `via ${owner.className} · ${owner.units} units` : category.shortLabel}</p>
      </div>
      {isCustom && (
        <button
          aria-label="Delete custom requirement"
          className="shrink-0 text-[0.65rem] leading-none text-ink/35 hover:text-clay"
          onClick={(event) => {
            event.stopPropagation();
            onDeleteCustom(template.id);
          }}
          title="Delete custom requirement"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}

type RequirementPickerProps = {
  classId: string;
  categories: RequirementCategory[];
  templates: RequirementTemplate[];
  currentIds: string[];
  owners: Map<string, RequirementOwner>;
  onToggle: (classId: string, requirementId: string) => void;
};

function RequirementPicker({ classId, categories, templates, currentIds, owners, onToggle }: RequirementPickerProps) {
  return (
    <div className="course-requirement-picker mt-2 space-y-1.5 rounded-lg border border-ink/10 bg-paper/70 p-1.5" onClick={(event) => event.stopPropagation()}>
      {categories.map((category) => {
        const items = templates.filter((template) => template.categoryId === category.id);
        if (items.length === 0) return null;
        const selectedCount = items.filter((template) => currentIds.includes(template.id)).length;
        return (
          <details className="course-requirement-picker-category overflow-hidden rounded-md border border-ink/10 bg-surface/40" key={category.id}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-2 py-1.5 marker:hidden">
              <span className="flex min-w-0 items-center gap-1.5 text-[0.6rem] font-semibold text-ink/60">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="truncate">{category.shortLabel}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-[0.55rem] text-ink/40">
                {selectedCount ? `${selectedCount} tagged` : `${items.length}`}
                <span className="course-requirement-picker-arrow">▾</span>
              </span>
            </summary>
            <div className="max-h-44 space-y-0.5 overflow-y-auto border-t border-ink/10 px-1.5 py-1.5">
              {items.map((template) => {
                const owner = owners.get(template.id);
                const checked = currentIds.includes(template.id);
                const disabled = !!owner && owner.classId !== classId;
                return (
                  <label className={`flex items-center gap-1.5 rounded px-1 py-0.5 text-[0.68rem] ${disabled ? "text-ink/30" : "text-ink/75 hover:bg-ink/5"}`} key={template.id}>
                    <input checked={checked} className="h-3 w-3 shrink-0" disabled={disabled} onChange={() => onToggle(classId, template.id)} type="checkbox" />
                    <span className="min-w-0 flex-1">{template.label}</span>
                    {disabled && <span className="shrink-0 text-[0.55rem] italic text-ink/35">via {owner!.className}</span>}
                  </label>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}

type ClassCardProps = {
  cls: PlacedClass;
  templateById: Map<string, RequirementTemplate>;
  categories: RequirementCategory[];
  allTemplates: RequirementTemplate[];
  owners: Map<string, RequirementOwner>;
  isPickerOpen: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleDone: (id: string) => void;
  onRename: (id: string, label: string) => void;
  onUnitsChange: (id: string, units: number) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onTogglePicker: (id: string) => void;
  onToggleRequirement: (classId: string, requirementId: string) => void;
};

function ClassCard({ cls, templateById, categories, allTemplates, owners, isPickerOpen, isSelected, onSelect, onToggleDone, onRename, onUnitsChange, onDelete, onDragStart, onDragEnd, onTogglePicker, onToggleRequirement }: ClassCardProps) {
  const needsReassignment = cls.done && cls.requirementIds.length === 0;

  return (
    <div
      className={`course-plan-class-card rounded-xl border px-2.5 py-2 text-left text-xs shadow-sm transition ${needsReassignment ? "border-clay/70 bg-clay/10" : "border-ink/15 bg-surface/70"} ${isSelected ? "ring-2 ring-moss ring-offset-1 ring-offset-paper" : ""}`}
      draggable
      onClick={() => onSelect(cls.id)}
      onDragEnd={onDragEnd}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", `class:${cls.id}`);
        onDragStart(cls.id);
      }}
      role="button"
      tabIndex={0}
    >
      <div className="course-class-main flex items-start gap-2">
        <input checked={cls.done} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-moss" onChange={() => onToggleDone(cls.id)} onClick={(event) => event.stopPropagation()} type="checkbox" />
        <div className="min-w-0 flex-1">
          <AutoGrowLabel done={cls.done} onChange={(label) => onRename(cls.id, label)} onClick={(event) => event.stopPropagation()} value={cls.label} />
        </div>
        <button
          aria-label="Delete class"
          className="shrink-0 text-[0.65rem] leading-none text-ink/35 hover:text-clay"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(cls.id);
          }}
          title="Delete class"
          type="button"
        >
          ✕
        </button>
      </div>

      <label className="course-class-units" onClick={(event) => event.stopPropagation()}>
        <input
          aria-label={`Units for ${cls.label || "this class"}`}
          inputMode="decimal"
          max={99}
          min={0}
          onChange={(event) => {
            const normalized = normalizeNumericInputText(event.currentTarget.value);
            event.currentTarget.value = normalized;
            onUnitsChange(cls.id, Number(normalized));
          }}
          onFocus={(event) => event.currentTarget.select()}
          step={1}
          type="number"
          value={cls.units}
        />
        <span>units</span>
      </label>

      {cls.requirementIds.length > 0 && (
        <div className="course-class-requirement-tags mt-1.5 flex flex-wrap gap-1 pl-[1.375rem]">
          {cls.requirementIds.map((rid) => {
            const template = templateById.get(rid);
            if (!template) return null;
            const category = categoryOf(template.categoryId);
            return (
              <span
                className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.55rem] font-semibold"
                key={rid}
                style={{ backgroundColor: tint(category.color, "22"), color: category.color }}
                title={template.label}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                {category.shortLabel}
              </span>
            );
          })}
        </div>
      )}

      {needsReassignment && (
        <p className="course-class-reassignment mt-1.5 pl-[1.375rem] text-[0.62rem] font-semibold leading-4 text-clay">
          Reassign this completed class to a current requirement.
        </p>
      )}

      <button
        className="course-class-tag-toggle mt-1.5 ml-[1.375rem] text-[0.62rem] font-semibold text-moss hover:text-ink"
        onClick={(event) => {
          event.stopPropagation();
          onTogglePicker(cls.id);
        }}
        type="button"
      >
        {isPickerOpen ? "Done tagging ▴" : cls.requirementIds.length ? "Edit requirements ▾" : "+ Tag requirements ▾"}
      </button>

      {isPickerOpen && <RequirementPicker categories={categories} classId={cls.id} currentIds={cls.requirementIds} onToggle={onToggleRequirement} owners={owners} templates={allTemplates} />}
    </div>
  );
}

export function CaltechCoursePlanner() {
  const [plan, setPlan] = useState<SavedPlan>({ classes: {}, customTemplates: [], coreScheduleMode: DEFAULT_CORE_SCHEDULE_MODE });
  const [selection, setSelection] = useState<Selection>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [collapsedYears, setCollapsedYears] = useState<Record<number, boolean>>({ 2: true, 3: true, 4: true });
  const [openPickerClassId, setOpenPickerClassId] = useState<string | null>(null);
  const [addCategory, setAddCategory] = useState<RequirementCategory["id"]>("core-science");
  const [addLabel, setAddLabel] = useState("");
  const [identity, setIdentity] = useState<StoredIdentity | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [loginFirstName, setLoginFirstName] = useState("");
  const [loginLastName, setLoginLastName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMajors, setLoginMajors] = useState<MajorId[]>([]);
  const { classes, customTemplates, coreScheduleMode } = plan;
  const hasLoadedRef = useRef(false);

  // Program choices drive the planner immediately. Signing in only changes where
  // those choices and the plan are saved; it is not required to view requirements.
  const selectedMajorIds = loginMajors;
  const pendingMajorLabels = useMemo(
    () => (!identity ? loginMajors.map((id) => majors.find((major) => major.id === id)?.label ?? id) : []),
    [identity, loginMajors],
  );
  const baseTemplates = useMemo(() => templatesForCoreScheduleMode(templatesForMajors(selectedMajorIds), coreScheduleMode), [selectedMajorIds, coreScheduleMode]);
  const baseCategories = useMemo(() => categoriesForMajors(selectedMajorIds), [selectedMajorIds]);
  const allTemplates = useMemo(() => [...baseTemplates, ...customTemplates], [baseTemplates, customTemplates]);
  const templateById = useMemo(() => new Map(allTemplates.map((template) => [template.id, template])), [allTemplates]);

  // Which class (if any) currently satisfies each requirement id. First class wins on
  // conflicting saved data; toggleClassRequirement prevents new conflicts going forward.
  const requirementOwners = useMemo(() => {
    const map = new Map<string, RequirementOwner>();
    for (const cls of Object.values(classes)) {
      for (const requirementId of cls.requirementIds) {
        if (!map.has(requirementId)) map.set(requirementId, { classId: cls.id, className: cls.label || "Untitled class", units: cls.units });
      }
    }
    return map;
  }, [classes]);

  // Hydrate any saved plan (and identity) from localStorage after mount, once, so the server-rendered
  // (all-unplaced) markup matches on hydration; a client-only external read, not derived render state.
  useEffect(() => {
    const storedIdentity = loadStoredIdentity();
    let storedLocalMajors: MajorId[] | null = null;
    if (!storedIdentity) {
      try {
        const rawMajors = window.localStorage.getItem(LOCAL_MAJORS_STORAGE_KEY);
        if (rawMajors) {
          const parsedMajors = JSON.parse(rawMajors) as unknown;
          if (Array.isArray(parsedMajors)) {
            storedLocalMajors = parsedMajors.filter((majorId): majorId is MajorId =>
              typeof majorId === "string" && majors.some((major) => major.id === majorId),
            );
            // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
            setLoginMajors(storedLocalMajors);
          }
        }
      } catch {
        // ignore malformed local program selections
      }
    }
    try {
      const raw = window.localStorage.getItem(COURSE_PLAN_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedPlan>;
        const templates = storedIdentity
          ? templatesForMajors(storedIdentity.majors)
          : storedLocalMajors !== null
            ? templatesForMajors(storedLocalMajors)
            : requirementTemplates;
        setPlan(sanitizePlan(templates, parsed));
      }
    } catch {
      // ignore malformed local storage
    }
    if (storedIdentity) {
      setIdentity(storedIdentity);
      setLoginFirstName(storedIdentity.firstName);
      setLoginLastName(storedIdentity.lastName);
      setLoginMajors(storedIdentity.majors);
      fetchCoursePlan(storedIdentity.loginKey)
        .then((row) => {
          if (row) setPlan(sanitizePlan(templatesForMajors(storedIdentity.majors), row.plan as Partial<SavedPlan> | null));
        })
        .catch((error: unknown) => {
          console.error("Failed to load saved course plan", error);
          setSyncStatus("error");
          setSyncError("Couldn't reach your saved plan (offline, or cloud save isn't set up yet) — showing your local copy.");
        });
    }
    hasLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    window.localStorage.setItem(COURSE_PLAN_STORAGE_KEY, JSON.stringify(plan));
    window.dispatchEvent(new CustomEvent("caltech-course-plan-updated"));
  }, [plan]);

  useEffect(() => {
    if (!hasLoadedRef.current || identity) return;
    window.localStorage.setItem(LOCAL_MAJORS_STORAGE_KEY, JSON.stringify(loginMajors));
  }, [identity, loginMajors]);

  // Debounce cloud saves so rapid edits (typing a rename, checking several boxes) coalesce into one write.
  useEffect(() => {
    if (!hasLoadedRef.current || !identity || loginMajors.length === 0) return;
    const timeout = window.setTimeout(() => {
      setSyncStatus("saving");
      saveCoursePlan({ ...identity, majors: loginMajors }, plan as unknown as Json)
        .then(() => setSyncStatus("saved"))
        .catch((error: unknown) => {
          console.error("Failed to save course plan", error);
          setSyncStatus("error");
          setSyncError("Couldn't save to the cloud (offline, or cloud save isn't set up yet) — your changes are still saved locally on this device.");
        });
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [plan, identity, loginMajors]);

  const signIn = useCallback(async () => {
    const firstName = loginFirstName.trim();
    const lastName = loginLastName.trim();
    const password = loginPassword.trim();
    if (!firstName || !lastName || !password) return;
    const loginKey = buildAccountLoginKey(firstName, lastName, password);
    const displayName = displayNameFor(firstName, lastName);
    setSyncStatus("loading");
    setSyncError(null);
    try {
      const row = await fetchCoursePlan(loginKey);
      // Returning profiles restore their saved selections. A name/password
      // combination with no row is a new account and uses the choices below.
      let nextMajors: MajorId[];
      let nextPlan: SavedPlan;
      if (row) {
        nextMajors = row.majors.filter((majorId): majorId is MajorId => majors.some((major) => major.id === majorId));
        nextPlan = sanitizePlan(templatesForMajors(nextMajors), row.plan as Partial<SavedPlan> | null);
      } else {
        if (loginMajors.length === 0) {
          setSyncStatus("error");
          setSyncError("Choose at least one major, track, or minor to create a new cloud account.");
          return;
        }
        nextMajors = loginMajors;
        // Creating cloud save should preserve work already made locally.
        nextPlan = sanitizePlan(templatesForMajors(nextMajors), plan);
      }

      const nextIdentity: StoredIdentity = { loginKey, displayName, firstName, lastName, majors: nextMajors };
      // Finish the cloud write before persisting the identity locally, so a
      // rejected write cannot leave behind a half-created signed-in profile.
      await saveCoursePlan(nextIdentity, nextPlan as unknown as Json);
      setPlan(nextPlan);
      setIdentity(nextIdentity);
      setLoginMajors(nextMajors);
      saveStoredIdentity(nextIdentity);
      setSyncStatus("idle");
    } catch (error) {
      console.error("Sign-in failed", error);
      setSyncStatus("error");
      setSyncError("Couldn't reach the database (offline, or cloud save isn't set up yet). Your plan will stay local-only on this device for now.");
    }
  }, [loginFirstName, loginLastName, loginMajors, loginPassword, plan]);

  const signOut = useCallback(() => {
    saveStoredIdentity(null);
    window.localStorage.removeItem(COURSE_PLAN_STORAGE_KEY);
    window.localStorage.removeItem(LOCAL_MAJORS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("caltech-course-plan-updated"));
    window.location.reload();
  }, []);

  const updateProfileMajors = useCallback((nextMajors: MajorId[]) => {
    if (!identity || nextMajors.length === 0) return;
    const nextTemplates = templatesForCoreScheduleMode(templatesForMajors(nextMajors), coreScheduleMode);
    const nextIdentity = { ...identity, majors: nextMajors };
    setPlan((currentPlan) => reconcileTakenClassesForMajors(currentPlan, nextTemplates));
    setIdentity(nextIdentity);
    saveStoredIdentity(nextIdentity);
    setSyncStatus("saving");
  }, [coreScheduleMode, identity]);

  const toggleLoginMajor = useCallback((majorId: MajorId) => {
    const nextMajors = loginMajors.includes(majorId)
      ? loginMajors.filter((id) => id !== majorId)
      : loginMajors.length < MAX_PROFILE_PROGRAMS
        ? [...loginMajors, majorId]
        : loginMajors;
    if (nextMajors === loginMajors) return;
    setLoginMajors(nextMajors);
    if (identity && nextMajors.length > 0) updateProfileMajors(nextMajors);
  }, [identity, loginMajors, updateProfileMajors]);

  const switchCoreScheduleMode = useCallback((mode: CoreScheduleMode) => {
    setPlan((prev) => {
      if (prev.coreScheduleMode === mode) return prev;
      return reconcilePlanForCoreScheduleMode(prev, mode, selectedMajorIds);
    });
    setOpenCategories((prev) => ({ ...prev, "core-science": true }));
  }, [selectedMajorIds]);

  const updateClass = useCallback((id: string, update: (cls: PlacedClass) => PlacedClass) => {
    setPlan((prev) => (prev.classes[id] ? { ...prev, classes: { ...prev.classes, [id]: update(prev.classes[id]) } } : prev));
  }, []);

  const toggleClassDone = useCallback((id: string) => updateClass(id, (cls) => ({ ...cls, done: !cls.done })), [updateClass]);

  const renameClass = useCallback((id: string, label: string) => updateClass(id, (cls) => ({
    ...cls,
    label,
    units: cls.unitsEdited ? cls.units : defaultUnitsForClass(label, cls.cell, cls.requirementIds, templateById),
  })), [templateById, updateClass]);

  const updateClassUnits = useCallback((id: string, units: number) => {
    updateClass(id, (cls) => ({ ...cls, units: sanitizeUnits(units, cls.units), unitsEdited: true }));
  }, [updateClass]);

  const moveClass = useCallback((id: string, cell: string) => {
    updateClass(id, (cls) => ({
      ...cls,
      cell,
      units: cls.unitsEdited ? cls.units : defaultUnitsForClass(cls.label, cell, cls.requirementIds, templateById),
    }));
    setSelection(null);
  }, [templateById, updateClass]);

  const deleteClass = useCallback((id: string) => {
    setPlan((prev) => {
      const next = { ...prev.classes };
      delete next[id];
      return { ...prev, classes: next };
    });
    setOpenPickerClassId((prev) => (prev === id ? null : prev));
    setSelection((prev) => (prev?.type === "class" && prev.id === id ? null : prev));
  }, []);

  const toggleClassRequirement = useCallback((classId: string, requirementId: string) => {
    setPlan((prev) => {
      const cls = prev.classes[classId];
      if (!cls) return prev;
      const ownedByOther = Object.values(prev.classes).some((other) => other.id !== classId && other.requirementIds.includes(requirementId));
      if (ownedByOther) return prev;
      const has = cls.requirementIds.includes(requirementId);
      const requirementIds = has ? cls.requirementIds.filter((id) => id !== requirementId) : [...cls.requirementIds, requirementId];
      const shouldRefreshUnits = !has && cls.requirementIds.length === 0 && !cls.unitsEdited;
      const units = shouldRefreshUnits ? defaultUnitsForClass(cls.label, cls.cell, requirementIds, templateById) : cls.units;
      return { ...prev, classes: { ...prev.classes, [classId]: { ...cls, units, requirementIds } } };
    });
  }, [templateById]);

  const createClassFromRequirement = useCallback(
    (requirementId: string, cell: string) => {
      if (requirementOwners.has(requirementId)) return;
      const template = templateById.get(requirementId);
      if (!template) return;
      const id = newId("class");
      const units = defaultUnitsForClass(template.label, cell, [requirementId], templateById);
      setPlan((prev) => ({ ...prev, classes: { ...prev.classes, [id]: { id, label: template.label, units, unitsEdited: false, done: false, cell, requirementIds: [requirementId] } } }));
      setSelection(null);
    },
    [requirementOwners, templateById],
  );

  const addBlankClass = useCallback((cell: string) => {
    const id = newId("class");
    setPlan((prev) => ({ ...prev, classes: { ...prev.classes, [id]: { id, label: "New class", units: DEFAULT_CLASS_UNITS, unitsEdited: false, done: false, cell, requirementIds: [] } } }));
  }, []);

  const addCustomRequirement = useCallback(() => {
    const label = addLabel.trim();
    if (!label) return;
    const id = newId("custom");
    setPlan((prev) => ({ ...prev, customTemplates: [...prev.customTemplates, { id, categoryId: addCategory, label }] }));
    setAddLabel("");
  }, [addCategory, addLabel]);

  const removeCustomRequirement = useCallback((id: string) => {
    setPlan((prev) => {
      const classes: Record<string, PlacedClass> = {};
      for (const [classId, cls] of Object.entries(prev.classes)) classes[classId] = { ...cls, requirementIds: cls.requirementIds.filter((rid) => rid !== id) };
      return { ...prev, classes, customTemplates: prev.customTemplates.filter((template) => template.id !== id) };
    });
  }, []);

  const handleDrop = useCallback(
    (targetCell: string, event: DragEvent) => {
      event.preventDefault();
      const payload = event.dataTransfer.getData("text/plain") || draggingKey || "";
      const [kind, id] = payload.split(":");
      if (kind === "requirement" && id) createClassFromRequirement(id, targetCell);
      else if (kind === "class" && id) moveClass(id, targetCell);
      setDraggingKey(null);
    },
    [draggingKey, createClassFromRequirement, moveClass],
  );

  const handleZoneClick = useCallback(
    (targetCell: string) => {
      if (!selection) return;
      if (selection.type === "requirement") createClassFromRequirement(selection.id, targetCell);
      else moveClass(selection.id, targetCell);
    },
    [selection, createClassFromRequirement, moveClass],
  );

  const selectRequirement = useCallback((id: string) => setSelection((current) => (current?.type === "requirement" && current.id === id ? null : { type: "requirement", id })), []);
  const selectClass = useCallback((id: string) => setSelection((current) => (current?.type === "class" && current.id === id ? null : { type: "class", id })), []);
  const togglePicker = useCallback((id: string) => setOpenPickerClassId((current) => (current === id ? null : id)), []);

  const categoryStats = useMemo(() => {
    return baseCategories.map((category) => {
      const ids = allTemplates.filter((template) => template.categoryId === category.id).map((template) => template.id);
      if (category.requiredUnits) {
        const placed = unitsMatchingRequirements(classes, ids);
        const done = unitsMatchingRequirements(classes, ids, true);
        return { category, total: category.requiredUnits, placed, done, metric: "units" as const };
      }
      const placed = ids.filter((id) => requirementOwners.has(id)).length;
      const done = ids.filter((id) => {
        const owner = requirementOwners.get(id);
        return owner ? classes[owner.classId]?.done : false;
      }).length;
      return { category, total: ids.length, placed, done, metric: "requirements" as const };
    });
  }, [baseCategories, allTemplates, requirementOwners, classes]);

  const totals = useMemo(
    () => categoryStats.filter((stat) => stat.metric === "requirements").reduce(
      (acc, stat) => ({ total: acc.total + stat.total, placed: acc.placed + stat.placed, done: acc.done + stat.done }),
      { total: 0, placed: 0, done: 0 },
    ),
    [categoryStats],
  );
  const scheduledUnits = Object.values(classes).reduce((sum, cls) => sum + cls.units, 0);
  const takenUnits = Object.values(classes).filter((cls) => cls.done).reduce((sum, cls) => sum + cls.units, 0);

  const renderPlanCell = (year: number, term: Term, compact = false) => {
    const id = cellId(year, term);
    const classesInCell = Object.values(classes).filter((cls) => cls.cell === id);
    const termUnits = classesInCell.reduce((sum, cls) => sum + cls.units, 0);

    return (
      <div
        className={`${compact ? "course-plan-mobile-cell min-h-[4.5rem] rounded-xl p-1.5" : "min-h-[6rem] rounded-2xl p-2"} border transition ${selection ? "border-moss/50 bg-lime/20" : "border-ink/10 bg-surface/40"}`}
        key={id}
        onClick={() => handleZoneClick(id)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => handleDrop(id, event)}
      >
        <div className="flex flex-col gap-1.5">
          <p aria-label={`${termUnits} units planned for ${term}, year ${year}`} className="course-term-units">
            <strong>{termUnits}</strong> units
          </p>
          {classesInCell.map((cls) => (
            <ClassCard
              allTemplates={allTemplates}
              categories={baseCategories}
              cls={cls}
              isPickerOpen={openPickerClassId === cls.id}
              isSelected={selection?.type === "class" && selection.id === cls.id}
              key={cls.id}
              onDelete={deleteClass}
              onDragEnd={() => setDraggingKey(null)}
              onDragStart={(clsId) => setDraggingKey(`class:${clsId}`)}
              onRename={renameClass}
              onSelect={selectClass}
              onToggleDone={toggleClassDone}
              onTogglePicker={togglePicker}
              onToggleRequirement={toggleClassRequirement}
              onUnitsChange={updateClassUnits}
              owners={requirementOwners}
              templateById={templateById}
            />
          ))}
          <button
            className="w-full rounded-lg border border-dashed border-ink/20 py-1 text-[0.65rem] text-ink/40 transition hover:border-ink/40 hover:text-ink/70"
            onClick={(event) => {
              event.stopPropagation();
              addBlankClass(id);
            }}
            type="button"
          >
            + Add class
          </button>
        </div>
      </div>
    );
  };

  const renderCoreScheduleToggle = () => (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-ink/55">Core schedule</p>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-ink/45">
          Integrated core swaps the normal Institute core checklist for the IC sequence. Placed classes stay editable.
        </p>
      </div>
      <div className="inline-flex rounded-full border border-ink/15 bg-paper/55 p-1 text-xs font-semibold text-ink/55" role="group" aria-label="Core schedule path">
        {([
          ["normal", "Normal"],
          ["integrated", "Integrated core"],
        ] as const).map(([mode, label]) => (
          <button
            aria-pressed={coreScheduleMode === mode}
            className={`rounded-full px-3 py-1.5 transition ${coreScheduleMode === mode ? "bg-ink text-paper shadow-sm" : "hover:bg-ink/5 hover:text-ink"}`}
            key={mode}
            onClick={() => switchCoreScheduleMode(mode)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="course-planner-shell space-y-8">
      <section className="course-planner-setup-card rounded-[1.5rem] border border-ink/10 bg-surface/55 p-4 sm:p-5">
        {identity ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Cloud save</p>
              <p className="mt-2 text-sm text-ink/60">
                Signed in as <span className="font-semibold text-ink">{identity.displayName}</span> · {loginMajors.length ? formatMajorSummary(loginMajors) : "choose a major, track, or minor"}
              </p>
              <p className="mt-1 text-xs text-ink/45">
                {loginMajors.length === 0 ? "Cloud sync is paused until you choose at least one program." : (
                  <>
                    {syncStatus === "saving" && "Saving…"}
                    {syncStatus === "saved" && "Saved to the cloud."}
                    {syncStatus === "loading" && "Loading your saved plan…"}
                    {syncStatus === "error" && syncError}
                    {syncStatus === "idle" && "Synced with the cloud."}
                  </>
                )}
              </p>
            </div>
            <button className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold transition hover:border-ink hover:bg-surface" onClick={signOut} type="button">
              Sign out
            </button>
            <div className="basis-full rounded-2xl border border-ink/10 bg-paper/45 p-3">
              <p className="text-xs font-semibold text-ink/55">Update majors / minors</p>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-ink/45">
                Changes apply immediately and save to the cloud automatically. Checked-off classes are kept and retagged where possible; unchecked classes outside the new requirements are removed.
              </p>
              <div className="course-planner-core-block mt-3">
                {renderCoreScheduleToggle()}
              </div>
              <div className="course-planner-major-block mt-3 border-t border-ink/10 pt-3">
                <MajorSelector onToggleMajor={toggleLoginMajor} selectedMajors={loginMajors} />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="eyebrow">Planner setup</p>
            <p className="course-planner-setup-description mt-2 max-w-2xl text-sm leading-6 text-ink/60">
              Choose majors, tracks, or minors to load their requirements into the planner immediately. No account is required, and your choices and plan stay saved in this browser. Cloud save is optional if you want to use the same plan on another device.
            </p>
            <p className="course-planner-privacy mt-2 text-xs leading-5 text-ink/45">
              Names and schedules are only used for this course scheduler. <a className="font-semibold text-moss hover:text-ink" href="/privacy">Privacy policy</a>
            </p>
            <div className="course-planner-setup-grid mt-5 grid gap-4">
              <div className="course-planner-core-block rounded-2xl border border-ink/10 bg-paper/45 p-3">
                {renderCoreScheduleToggle()}
              </div>

              <div className="rounded-2xl border border-ink/10 bg-paper/45 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-ink/55">Major(s) / minor(s)</p>
                  <p className="text-[0.62rem] font-medium text-ink/35">
                    {loginMajors.length ? `${loginMajors.length} selected` : "Choose to show requirements"} · up to {MAX_PROFILE_PROGRAMS}
                  </p>
                </div>
                <MajorSelector onToggleMajor={toggleLoginMajor} selectedMajors={loginMajors} />
                {pendingMajorLabels.length > 0 && (
                  <div className="mt-3 rounded-2xl border border-ink/10 bg-surface/55 px-3 py-2 text-[0.68rem] leading-5 text-ink/45">
                    <span className="font-semibold text-ink/55">Active locally:</span>{" "}
                    {pendingMajorLabels.join(", ")}. Their requirements are now shown below.
                  </div>
                )}
              </div>

              <div className="border-t border-ink/10 pt-4">
                <p className="text-xs font-semibold text-ink/55">Optional cloud save</p>
                <p className="mt-1 text-xs leading-5 text-ink/45">Enter the same details to reopen an account. A new combination creates a new account with the selections above.</p>
                <div className="course-planner-cloud-fields mt-3 grid gap-3 md:grid-cols-[minmax(0,10rem)_minmax(0,10rem)_minmax(0,13rem)]">
                  <label className="text-xs font-medium text-ink/55">
                    First name
                    <input className="mt-1 block h-10 w-full rounded-full border border-ink/20 bg-surface px-3 text-sm text-ink" onChange={(event) => setLoginFirstName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && signIn()} placeholder="First name" value={loginFirstName} />
                  </label>
                  <label className="text-xs font-medium text-ink/55">
                    Last name
                    <input className="mt-1 block h-10 w-full rounded-full border border-ink/20 bg-surface px-3 text-sm text-ink" onChange={(event) => setLoginLastName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && signIn()} placeholder="Last name" value={loginLastName} />
                  </label>
                  <label className="text-xs font-medium text-ink/55">
                    Password
                    <input className="mt-1 block h-10 w-full rounded-full border border-ink/20 bg-surface px-3 text-sm text-ink" onChange={(event) => setLoginPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && signIn()} placeholder="Password" type="password" value={loginPassword} />
                    <span className="mt-1 block text-[0.62rem] leading-4 text-ink/40">Just separates profiles with the same name.</span>
                  </label>
                </div>
                <div className="course-planner-cloud-submit mt-4 flex justify-end">
                  <button
                    className="h-10 rounded-full bg-ink px-5 text-xs font-semibold text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!loginFirstName.trim() || !loginLastName.trim() || !loginPassword.trim() || syncStatus === "loading"}
                    onClick={signIn}
                    type="button"
                  >
                    {syncStatus === "loading" ? "Loading…" : "Sign in / create account"}
                  </button>
                </div>
              </div>
            </div>
            {syncStatus === "error" && <p className="mt-3 text-xs text-clay">{syncError}</p>}
          </div>
        )}
      </section>

      <section className="rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5 sm:p-6">
        <div>
          <p className="eyebrow">Progress</p>
          <p className="mt-2 text-sm text-ink/60">
            {totals.placed} / {totals.total} course requirements satisfied · {totals.done} / {totals.total} checked off as done. Unit-based requirements count each physical class once within a category, even when that class carries several requirement tags.
          </p>
        </div>

        <div className="mt-4 grid max-w-sm grid-cols-2 gap-2">
          <div className="rounded-xl border border-ink/10 bg-paper/55 px-3 py-2.5">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-ink/40">Scheduled</p>
            <p className="mt-1 text-lg font-semibold tracking-tight"><span className="text-moss">{scheduledUnits}</span> <small className="text-[0.62rem] font-semibold text-ink/40">units</small></p>
          </div>
          <div className="rounded-xl border border-ink/10 bg-paper/55 px-3 py-2.5">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-ink/40">Taken</p>
            <p className="mt-1 text-lg font-semibold tracking-tight"><span className="text-moss">{takenUnits}</span> <small className="text-[0.62rem] font-semibold text-ink/40">units</small></p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoryStats.map(({ category, total, placed, done, metric }) => (
            <div key={category.id}>
              <div className="flex items-center justify-between text-[0.68rem] font-medium text-ink/60">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                  {category.shortLabel}
                </span>
                <span>
                  {done}/{total}{metric === "units" ? " units" : ""}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/10" title={category.note}>
                <div className="h-full rounded-full transition-all" style={{ width: `${total ? Math.min(100, (placed / total) * 100) : 0}%`, backgroundColor: tint(category.color, "55") }} />
                <div className="-mt-1.5 h-1.5 rounded-full transition-all" style={{ width: `${total ? Math.min(100, (done / total) * 100) : 0}%`, backgroundColor: category.color }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="unplaced-title" className="min-w-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1">
          <h2 className="section-title" id="unplaced-title">Requirements</h2>
          <p className="mt-2 text-xs text-ink/50">
            {selection ? "Tap a term on the plan to place it there." : "Drag a requirement onto a term to create a class for it, or tap it then tap a term. One class can satisfy several requirements — tag the rest from its card."}
          </p>

          <div className="mt-4 space-y-2">
            {baseCategories.map((category) => {
              const items = allTemplates.filter((template) => template.categoryId === category.id);
              const satisfiedCount = items.filter((template) => requirementOwners.has(template.id)).length;
              const placedUnits = category.requiredUnits
                ? unitsMatchingRequirements(classes, items.map((template) => template.id))
                : 0;
              const isOpen = !!openCategories[category.id];
              return (
                <div className="rounded-2xl border border-ink/10 bg-surface/40" key={category.id}>
                  <button
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
                    onClick={() => setOpenCategories((prev) => ({ ...prev, [category.id]: !prev[category.id] }))}
                    type="button"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.label}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink/45">
                      {category.requiredUnits ? `${placedUnits}/${category.requiredUnits} units` : `${satisfiedCount}/${items.length}`}
                      <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="max-h-72 space-y-2 overflow-y-auto border-t border-ink/10 px-3.5 py-3.5">
                      {items.map((template) => (
                        <RequirementRow
                          category={category}
                          isCustom={template.id.startsWith("custom-")}
                          isSelected={selection?.type === "requirement" && selection.id === template.id}
                          key={template.id}
                          onDeleteCustom={removeCustomRequirement}
                          onDragEnd={() => setDraggingKey(null)}
                          onDragStart={(id) => setDraggingKey(`requirement:${id}`)}
                          onSelect={selectRequirement}
                          owner={requirementOwners.get(template.id)}
                          template={template}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 space-y-2 rounded-2xl border border-dashed border-ink/20 px-3.5 py-3.5">
            <label className="block text-xs font-medium text-ink/55" htmlFor="add-category">Add a requirement</label>
            <div className="flex flex-wrap gap-2">
              <select className="rounded-full border border-ink/20 bg-surface px-3 py-1.5 text-xs" id="add-category" onChange={(event) => setAddCategory(event.target.value as typeof addCategory)} value={addCategory}>
                {baseCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.shortLabel}</option>
                ))}
              </select>
              <input
                className="min-w-[9rem] flex-1 rounded-full border border-ink/20 bg-surface px-3 py-1.5 text-xs"
                onChange={(event) => setAddLabel(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && addCustomRequirement()}
                placeholder="e.g. Ma 108"
                value={addLabel}
              />
              <button className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-paper transition hover:bg-moss" onClick={addCustomRequirement} type="button">
                Add
              </button>
            </div>
          </div>
        </section>

        <section aria-labelledby="grid-title" className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title" id="grid-title">Four-year plan</h2>
            <div className="flex gap-1.5 sm:hidden">
              <button
                className="rounded-full border border-ink/15 px-2.5 py-1 text-[0.62rem] font-semibold text-ink/50"
                onClick={() => setCollapsedYears({})}
                type="button"
              >
                Expand all
              </button>
              <button
                className="rounded-full border border-ink/15 px-2.5 py-1 text-[0.62rem] font-semibold text-ink/50"
                onClick={() => setCollapsedYears({ 1: true, 2: true, 3: true, 4: true })}
                type="button"
              >
                Collapse all
              </button>
            </div>
          </div>

          <div className="course-plan-mobile mt-3 space-y-1.5 sm:hidden">
            {YEARS.map((year) => {
              const isCollapsed = !!collapsedYears[year];
              const classCount = Object.values(classes).filter((cls) => cls.cell.startsWith(`${year}-`)).length;

              return (
                <section className="overflow-hidden rounded-xl border border-ink/10 bg-surface/35" key={year}>
                  <button
                    aria-expanded={!isCollapsed}
                    className="flex w-full items-center justify-between gap-3 px-2.5 py-1.5 text-left"
                    onClick={() => setCollapsedYears((current) => ({ ...current, [year]: !current[year] }))}
                    type="button"
                  >
                    <span className="text-xs font-semibold">Year {year}</span>
                    <span className="flex items-center gap-2 text-[0.6rem] text-ink/45">
                      {classCount} {classCount === 1 ? "class" : "classes"}
                      <span className={`transition-transform ${isCollapsed ? "" : "rotate-180"}`}>▾</span>
                    </span>
                  </button>
                  {!isCollapsed && (
                    <div className="course-plan-mobile-terms border-t border-ink/10">
                      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 pb-2 pt-2">
                        {TERMS.map((term) => (
                          <div className="w-[62vw] max-w-[14rem] shrink-0 snap-start" key={term}>
                            <p className="mb-1.5 px-1 text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-ink/45">{term}</p>
                            {renderPlanCell(year, term, true)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <div className="mt-5 hidden overflow-x-auto pb-2 sm:block">
            <div className="grid min-w-[46rem] gap-2" style={{ gridTemplateColumns: "5rem repeat(3, minmax(13rem, 1fr))" }}>
              <div />
              {TERMS.map((term) => (
                <div className="px-1 text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink/50" key={term}>{term}</div>
              ))}
              {YEARS.map((year) => (
                <Fragment key={year}>
                  <div className="flex items-center justify-end pr-2 text-sm font-semibold text-ink/60">Year {year}</div>
                  {TERMS.map((term) => renderPlanCell(year, term))}
                </Fragment>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
