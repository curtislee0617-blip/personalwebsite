"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent } from "react";
import { categoriesForMajors, majors, requirementCategories, requirementTemplates, templatesForMajors, type MajorId, type RequirementCategory, type RequirementTemplate } from "@/data/caltech-requirements";
import { buildAccountLoginKey, buildLegacyLoginKey, displayNameFor, fetchCoursePlan, loadStoredIdentity, saveCoursePlan, saveStoredIdentity, type StoredIdentity } from "@/lib/course-plan-sync";
import type { Json } from "@/lib/supabase/database.types";

const YEARS = [1, 2, 3, 4] as const;
const TERMS = ["Fall", "Winter", "Spring"] as const;
type Term = (typeof TERMS)[number];

// A "class" is one real course, placed in one term, that can satisfy several requirement
// tags at once (a lot of Caltech courses double- or triple-count). Requirements themselves
// are never placed — a requirement is "satisfied" once some class's requirementIds includes it.
type PlacedClass = { id: string; label: string; done: boolean; cell: string; requirementIds: string[] };
type SavedPlan = { classes: Record<string, PlacedClass>; customTemplates: RequirementTemplate[] };
type Selection = { type: "requirement" | "class"; id: string } | null;
type RequirementOwner = { classId: string; className: string };

const STORAGE_KEY = "caltech-course-planner-v2";
const CHEME_TRACK_IDS: MajorId[] = ["cheme-biomolecular", "cheme-sustainability", "cheme-process", "cheme-materials", "cheme-computational"];
const CHEME_TRACK_ID_SET = new Set<MajorId>(CHEME_TRACK_IDS);
const EE_TRACK_IDS: MajorId[] = ["ee-circuits", "ee-computer", "ee-intelligent", "ee-medical", "ee-photonics"];
const EE_TRACK_ID_SET = new Set<MajorId>(EE_TRACK_IDS);
const MAJOR_IDS = new Set<MajorId>([...CHEME_TRACK_IDS, ...EE_TRACK_IDS, "bem", "cs", "math", "physics", "chemistry", "bioengineering", "acm", "ee"]);
const MINOR_IDS = new Set<MajorId>(["cheme-minor", "bem-minor", "cs-minor", "math-minor", "chemistry-minor"]);
const SUBJECT_GROUPS: Array<{
  title: string;
  ids: MajorId[];
  sections: Array<{ title?: string; ids: MajorId[] }>;
}> = [
  {
    title: "Chemical Engineering",
    ids: [...CHEME_TRACK_IDS, "cheme-minor"],
    sections: [
      { title: "Tracks", ids: CHEME_TRACK_IDS },
      { title: "Minor", ids: ["cheme-minor"] },
    ],
  },
  { title: "BEM", ids: ["bem", "bem-minor"], sections: [{ ids: ["bem", "bem-minor"] }] },
  { title: "Computer Science", ids: ["cs", "cs-minor"], sections: [{ ids: ["cs", "cs-minor"] }] },
  { title: "Mathematics", ids: ["math", "math-minor"], sections: [{ ids: ["math", "math-minor"] }] },
  { title: "Physics", ids: ["physics"], sections: [{ ids: ["physics"] }] },
  { title: "Chemistry", ids: ["chemistry", "chemistry-minor"], sections: [{ ids: ["chemistry", "chemistry-minor"] }] },
  { title: "Bioengineering", ids: ["bioengineering"], sections: [{ ids: ["bioengineering"] }] },
  { title: "ACM", ids: ["acm"], sections: [{ ids: ["acm"] }] },
  {
    title: "Electrical Engineering",
    ids: EE_TRACK_IDS,
    sections: [{ title: "Tracks", ids: EE_TRACK_IDS }],
  },
];

function cellId(year: number, term: Term) {
  return `${year}-${term}`;
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

/** Drops any requirementIds that no longer resolve to a real template (stale major/catalog data). */
function sanitizePlan(templates: RequirementTemplate[], saved: Partial<SavedPlan> | null | undefined): SavedPlan {
  const customTemplates = saved?.customTemplates ?? [];
  const validIds = new Set([...templates, ...customTemplates].map((template) => template.id));
  const classes: Record<string, PlacedClass> = {};
  for (const [id, cls] of Object.entries(saved?.classes ?? {})) {
    if (!cls || typeof cls !== "object") continue;
    classes[id] = { id, label: cls.label ?? "New class", done: !!cls.done, cell: cls.cell, requirementIds: (cls.requirementIds ?? []).filter((rid) => validIds.has(rid)) };
  }
  return { classes, customTemplates };
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
  const otherLabels = majorIds
    .filter((id) => !CHEME_TRACK_ID_SET.has(id) && !EE_TRACK_ID_SET.has(id) && MAJOR_IDS.has(id))
    .map((id) => majors.find((major) => major.id === id)?.label ?? id);
  const minorLabels = majorIds
    .filter((id) => MINOR_IDS.has(id))
    .map((id) => majors.find((major) => major.id === id)?.label ?? id);

  return [
    chemeTracks.length ? `Chemical Engineering (${chemeTracks.join(", ")})` : null,
    eeTracks.length ? `Electrical Engineering (${eeTracks.join(", ")})` : null,
    ...otherLabels,
    ...minorLabels,
  ].filter(Boolean).join(", ");
}

function reconcileTakenClassesForMajors(plan: SavedPlan, nextTemplates: RequirementTemplate[]): SavedPlan {
  const validIds = new Set([...nextTemplates, ...plan.customTemplates].map((template) => template.id));
  const knownTemplates = new Map([...requirementTemplates, ...plan.customTemplates].map((template) => [template.id, template]));
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

  return { classes, customTemplates: plan.customTemplates };
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
  const [open, setOpen] = useState(selectedCount > 0);

  const countLabel = (count: number, singular: string, empty: string) => (
    count ? `${count} ${singular}${count === 1 ? "" : "s"}` : empty
  );

  return (
    <details className="min-w-64 rounded-2xl border border-ink/20 bg-surface text-xs text-ink/70" onToggle={(event) => setOpen(event.currentTarget.open)} open={open}>
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
              const label = CHEME_TRACK_ID_SET.has(id)
                ? chemETrackLabel(major.label)
                : EE_TRACK_ID_SET.has(id)
                  ? eeTrackLabel(major.label)
                  : major.label
                    .replace(/^Business, Economics & Management$/, "Major")
                    .replace(/^Business, Economics & Management \(minor\)$/, "Minor")
                    .replace(/^Computer Science$/, "Major")
                    .replace(/^Computer Science \(minor\)$/, "Minor")
                    .replace(/^Mathematics$/, "Major")
                    .replace(/^Mathematics \(minor\)$/, "Minor")
                    .replace(/^Physics$/, "Major")
                    .replace(/^Chemistry$/, "Major")
                    .replace(/^Chemistry \(minor\)$/, "Minor")
                    .replace(/^Bioengineering$/, "Major")
                    .replace(/^Applied and Computational Mathematics$/, "Requirements")
                    .replace(/^Chemical Engineering \(minor\)$/, "Minor");

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
    <div className="mt-1 flex flex-wrap items-start gap-2">
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
        <p className="mt-0.5 truncate text-[0.6rem] uppercase tracking-[0.1em] text-ink/40">{satisfied ? `via ${owner.className}` : category.shortLabel}</p>
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
    <div className="mt-2 max-h-56 space-y-2.5 overflow-y-auto rounded-lg border border-ink/10 bg-paper/70 p-2" onClick={(event) => event.stopPropagation()}>
      {categories.map((category) => {
        const items = templates.filter((template) => template.categoryId === category.id);
        if (items.length === 0) return null;
        return (
          <div key={category.id}>
            <p className="flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-ink/45">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.color }} />
              {category.shortLabel}
            </p>
            <div className="mt-1 space-y-0.5">
              {items.map((template) => {
                const owner = owners.get(template.id);
                const checked = currentIds.includes(template.id);
                const disabled = !!owner && owner.classId !== classId;
                return (
                  <label className={`flex items-center gap-1.5 rounded px-1 py-0.5 text-[0.68rem] ${disabled ? "text-ink/30" : "text-ink/75 hover:bg-ink/5"}`} key={template.id}>
                    <input checked={checked} className="h-3 w-3 shrink-0" disabled={disabled} onChange={() => onToggle(classId, template.id)} type="checkbox" />
                    <span className="min-w-0 flex-1 truncate">{template.label}</span>
                    {disabled && <span className="shrink-0 text-[0.55rem] italic text-ink/35">via {owner!.className}</span>}
                  </label>
                );
              })}
            </div>
          </div>
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
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onTogglePicker: (id: string) => void;
  onToggleRequirement: (classId: string, requirementId: string) => void;
};

function ClassCard({ cls, templateById, categories, allTemplates, owners, isPickerOpen, isSelected, onSelect, onToggleDone, onRename, onDelete, onDragStart, onDragEnd, onTogglePicker, onToggleRequirement }: ClassCardProps) {
  const needsReassignment = cls.done && cls.requirementIds.length === 0;

  return (
    <div
      className={`rounded-xl border px-2.5 py-2 text-left text-xs shadow-sm transition ${needsReassignment ? "border-clay/70 bg-clay/10" : "border-ink/15 bg-surface/70"} ${isSelected ? "ring-2 ring-moss ring-offset-1 ring-offset-paper" : ""}`}
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
      <div className="flex items-start gap-2">
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

      {cls.requirementIds.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1 pl-[1.375rem]">
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
        <p className="mt-1.5 pl-[1.375rem] text-[0.62rem] font-semibold leading-4 text-clay">
          Reassign this completed class to a current requirement.
        </p>
      )}

      <button
        className="mt-1.5 ml-[1.375rem] text-[0.62rem] font-semibold text-moss hover:text-ink"
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
  const [plan, setPlan] = useState<SavedPlan>({ classes: {}, customTemplates: [] });
  const [selection, setSelection] = useState<Selection>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [openPickerClassId, setOpenPickerClassId] = useState<string | null>(null);
  const [addCategory, setAddCategory] = useState(requirementCategories[requirementCategories.length - 1].id);
  const [addLabel, setAddLabel] = useState("");
  const [identity, setIdentity] = useState<StoredIdentity | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [loginFirstName, setLoginFirstName] = useState("");
  const [loginLastName, setLoginLastName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMajors, setLoginMajors] = useState<MajorId[]>([]);
  const { classes, customTemplates } = plan;
  const hasLoadedRef = useRef(false);

  // Everyone signed in sees only their major(s)' requirements (plus the shared institute core);
  // Signed-out visitors see the full default catalog, including every ChemE track.
  const baseTemplates = useMemo(() => (identity ? templatesForMajors(identity.majors) : requirementTemplates), [identity]);
  const baseCategories = useMemo(() => (identity ? categoriesForMajors(identity.majors) : requirementCategories), [identity]);
  const allTemplates = useMemo(() => [...baseTemplates, ...customTemplates], [baseTemplates, customTemplates]);
  const templateById = useMemo(() => new Map(allTemplates.map((template) => [template.id, template])), [allTemplates]);

  // Which class (if any) currently satisfies each requirement id. First class wins on
  // conflicting saved data; toggleClassRequirement prevents new conflicts going forward.
  const requirementOwners = useMemo(() => {
    const map = new Map<string, RequirementOwner>();
    for (const cls of Object.values(classes)) {
      for (const requirementId of cls.requirementIds) {
        if (!map.has(requirementId)) map.set(requirementId, { classId: cls.id, className: cls.label || "Untitled class" });
      }
    }
    return map;
  }, [classes]);

  // Hydrate any saved plan (and identity) from localStorage after mount, once, so the server-rendered
  // (all-unplaced) markup matches on hydration; a client-only external read, not derived render state.
  useEffect(() => {
    const storedIdentity = loadStoredIdentity();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedPlan>;
        const templates = storedIdentity ? templatesForMajors(storedIdentity.majors) : requirementTemplates;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, not a render-time derivation
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  // Debounce cloud saves so rapid edits (typing a rename, checking several boxes) coalesce into one write.
  useEffect(() => {
    if (!hasLoadedRef.current || !identity) return;
    const timeout = window.setTimeout(() => {
      setSyncStatus("saving");
      saveCoursePlan(identity, plan as unknown as Json)
        .then(() => setSyncStatus("saved"))
        .catch((error: unknown) => {
          console.error("Failed to save course plan", error);
          setSyncStatus("error");
          setSyncError("Couldn't save to the cloud (offline, or cloud save isn't set up yet) — your changes are still saved locally on this device.");
        });
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [plan, identity]);

  const signIn = useCallback(async () => {
    const firstName = loginFirstName.trim();
    const lastName = loginLastName.trim();
    const password = loginPassword.trim();
    if (!firstName || !lastName || !password || loginMajors.length === 0) return;
    const loginKey = buildAccountLoginKey(firstName, lastName, password);
    const displayName = displayNameFor(firstName, lastName);
    setSyncStatus("loading");
    setSyncError(null);
    try {
      const row = await fetchCoursePlan(loginKey);
      const templates = templatesForMajors(loginMajors);
      let nextPlan: SavedPlan;
      if (row) {
        const storedMajors = row.majors.filter((majorId): majorId is MajorId => majors.some((major) => major.id === majorId));
        const storedPlan = sanitizePlan(templatesForMajors(storedMajors.length ? storedMajors : loginMajors), row.plan as Partial<SavedPlan> | null);
        nextPlan = JSON.stringify(storedMajors.sort()) === JSON.stringify([...loginMajors].sort())
          ? sanitizePlan(templates, row.plan as Partial<SavedPlan> | null)
          : reconcileTakenClassesForMajors(storedPlan, templates);
      } else {
        const legacyRow = await fetchCoursePlan(buildLegacyLoginKey(firstName, loginMajors));
        nextPlan = legacyRow ? sanitizePlan(templates, legacyRow.plan as Partial<SavedPlan> | null) : { classes: {}, customTemplates: [] };
      }
      setPlan(nextPlan);
      const nextIdentity: StoredIdentity = { loginKey, displayName, firstName, lastName, majors: loginMajors };
      setIdentity(nextIdentity);
      saveStoredIdentity(nextIdentity);
      await saveCoursePlan(nextIdentity, nextPlan as unknown as Json);
      setSyncStatus("idle");
    } catch (error) {
      console.error("Sign-in failed", error);
      setSyncStatus("error");
      setSyncError("Couldn't reach the database (offline, or cloud save isn't set up yet). Your plan will stay local-only on this device for now.");
    }
  }, [loginFirstName, loginLastName, loginMajors, loginPassword]);

  const signOut = useCallback(() => {
    saveStoredIdentity(null);
    setIdentity(null);
    setSyncStatus("idle");
    setSyncError(null);
    setLoginFirstName("");
    setLoginLastName("");
    setLoginPassword("");
    setLoginMajors([]);
  }, []);

  const updateProfileMajors = useCallback(() => {
    if (!identity || loginMajors.length === 0) return;
    const nextTemplates = templatesForMajors(loginMajors);
    const nextIdentity = { ...identity, majors: loginMajors };
    setPlan((currentPlan) => reconcileTakenClassesForMajors(currentPlan, nextTemplates));
    setIdentity(nextIdentity);
    saveStoredIdentity(nextIdentity);
    setSyncStatus("saving");
  }, [identity, loginMajors]);

  const toggleLoginMajor = useCallback((majorId: MajorId) => {
    setLoginMajors((prev) => (prev.includes(majorId) ? prev.filter((id) => id !== majorId) : [...prev, majorId]));
  }, []);

  const updateClass = useCallback((id: string, update: (cls: PlacedClass) => PlacedClass) => {
    setPlan((prev) => (prev.classes[id] ? { ...prev, classes: { ...prev.classes, [id]: update(prev.classes[id]) } } : prev));
  }, []);

  const toggleClassDone = useCallback((id: string) => updateClass(id, (cls) => ({ ...cls, done: !cls.done })), [updateClass]);

  const renameClass = useCallback((id: string, label: string) => updateClass(id, (cls) => ({ ...cls, label })), [updateClass]);

  const moveClass = useCallback((id: string, cell: string) => {
    updateClass(id, (cls) => ({ ...cls, cell }));
    setSelection(null);
  }, [updateClass]);

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
      return { ...prev, classes: { ...prev.classes, [classId]: { ...cls, requirementIds } } };
    });
  }, []);

  const createClassFromRequirement = useCallback(
    (requirementId: string, cell: string) => {
      if (requirementOwners.has(requirementId)) return;
      const template = templateById.get(requirementId);
      if (!template) return;
      const id = newId("class");
      setPlan((prev) => ({ ...prev, classes: { ...prev.classes, [id]: { id, label: template.label, done: false, cell, requirementIds: [requirementId] } } }));
      setSelection(null);
    },
    [requirementOwners, templateById],
  );

  const addBlankClass = useCallback((cell: string) => {
    const id = newId("class");
    setPlan((prev) => ({ ...prev, classes: { ...prev.classes, [id]: { id, label: "New class", done: false, cell, requirementIds: [] } } }));
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
      return { classes, customTemplates: prev.customTemplates.filter((template) => template.id !== id) };
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
      const placed = ids.filter((id) => requirementOwners.has(id)).length;
      const done = ids.filter((id) => {
        const owner = requirementOwners.get(id);
        return owner ? classes[owner.classId]?.done : false;
      }).length;
      return { category, total: ids.length, placed, done };
    });
  }, [baseCategories, allTemplates, requirementOwners, classes]);

  const totals = useMemo(
    () => categoryStats.reduce(
      (acc, stat) => ({ total: acc.total + stat.total, placed: acc.placed + stat.placed, done: acc.done + stat.done }),
      { total: 0, placed: 0, done: 0 },
    ),
    [categoryStats],
  );

  return (
    <div className="space-y-10">
      <section className="rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5 sm:p-6">
        {identity ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Cloud save</p>
              <p className="mt-2 text-sm text-ink/60">
                Signed in as <span className="font-semibold text-ink">{identity.displayName}</span> · {formatMajorSummary(identity.majors)}
              </p>
              <p className="mt-1 text-xs text-ink/45">
                {syncStatus === "saving" && "Saving…"}
                {syncStatus === "saved" && "Saved to the cloud."}
                {syncStatus === "loading" && "Loading your saved plan…"}
                {syncStatus === "error" && syncError}
                {syncStatus === "idle" && "Synced with the cloud."}
              </p>
            </div>
            <button className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold transition hover:border-ink hover:bg-surface" onClick={signOut} type="button">
              Sign out
            </button>
            <div className="basis-full rounded-2xl border border-ink/10 bg-paper/45 p-3">
              <p className="text-xs font-semibold text-ink/55">Update majors / minors</p>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-ink/45">
                Changing these keeps checked-off classes, removes unchecked classes, and tries to retag completed classes against the new requirements.
              </p>
              <MajorSelector onToggleMajor={toggleLoginMajor} selectedMajors={loginMajors} />
              <button
                className="mt-3 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-40"
                disabled={loginMajors.length === 0 || JSON.stringify([...loginMajors].sort()) === JSON.stringify([...identity.majors].sort())}
                onClick={updateProfileMajors}
                type="button"
              >
                Update requirements
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="eyebrow">Cloud save</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
              You can use the planner without signing in; it will still save locally in this browser. Sign in only if you want cloud save and access from another device. Use your first name, last name, and a small password to reopen the same profile later. Chemical Engineering tracks, BEM, Computer Science, Mathematics, Physics, Chemistry, Bioengineering, ACM, and Electrical Engineering have requirement sets.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <label className="text-xs font-medium text-ink/55">
                First name
                <input className="mt-1 block w-40 rounded-full border border-ink/20 bg-surface px-3 py-1.5 text-sm text-ink" onChange={(event) => setLoginFirstName(event.target.value)} placeholder="First name" value={loginFirstName} />
              </label>
              <label className="text-xs font-medium text-ink/55">
                Last name
                <input className="mt-1 block w-40 rounded-full border border-ink/20 bg-surface px-3 py-1.5 text-sm text-ink" onChange={(event) => setLoginLastName(event.target.value)} placeholder="Last name" value={loginLastName} />
              </label>
              <label className="text-xs font-medium text-ink/55">
                Password
                <input className="mt-1 block w-36 rounded-full border border-ink/20 bg-surface px-3 py-1.5 text-sm text-ink" onChange={(event) => setLoginPassword(event.target.value)} placeholder="Password" type="password" value={loginPassword} />
              </label>
              <div className="text-xs font-medium text-ink/55">
                Major(s) / minor(s)
                <MajorSelector onToggleMajor={toggleLoginMajor} selectedMajors={loginMajors} />
              </div>
              <button
                className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!loginFirstName.trim() || !loginLastName.trim() || !loginPassword.trim() || loginMajors.length === 0 || syncStatus === "loading"}
                onClick={signIn}
                type="button"
              >
                {syncStatus === "loading" ? "Loading…" : "Sign in"}
              </button>
            </div>
            {syncStatus === "error" && <p className="mt-3 text-xs text-clay">{syncError}</p>}
          </div>
        )}
      </section>

      <section className="rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5 sm:p-6">
        <div>
          <p className="eyebrow">Progress</p>
          <p className="mt-2 text-sm text-ink/60">
            {totals.placed} / {totals.total} requirements satisfied by a class · {totals.done} / {totals.total} checked off as done
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoryStats.map(({ category, total, placed, done }) => (
            <div key={category.id}>
              <div className="flex items-center justify-between text-[0.68rem] font-medium text-ink/60">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                  {category.shortLabel}
                </span>
                <span>
                  {done}/{total}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/10" title={category.note}>
                <div className="h-full rounded-full transition-all" style={{ width: `${total ? (placed / total) * 100 : 0}%`, backgroundColor: tint(category.color, "55") }} />
                <div className="-mt-1.5 h-1.5 rounded-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%`, backgroundColor: category.color }} />
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
                      {satisfiedCount}/{items.length}
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
          <h2 className="section-title" id="grid-title">Four-year plan</h2>
          <div className="mt-5 overflow-x-auto pb-2">
            <div className="grid min-w-[46rem] gap-2" style={{ gridTemplateColumns: "5rem repeat(3, minmax(13rem, 1fr))" }}>
              <div />
              {TERMS.map((term) => (
                <div className="px-1 text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink/50" key={term}>{term}</div>
              ))}
              {YEARS.map((year) => (
                <Fragment key={year}>
                  <div className="flex items-center justify-end pr-2 text-sm font-semibold text-ink/60">Year {year}</div>
                  {TERMS.map((term) => {
                    const id = cellId(year, term);
                    const classesInCell = Object.values(classes).filter((cls) => cls.cell === id);
                    return (
                      <div
                        className={`min-h-[6rem] rounded-2xl border p-2 transition ${selection ? "border-moss/50 bg-lime/20" : "border-ink/10 bg-surface/40"}`}
                        key={id}
                        onClick={() => handleZoneClick(id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDrop(id, event)}
                      >
                        <div className="flex flex-col gap-1.5">
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
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
