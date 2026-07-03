"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent } from "react";
import { requirementCategories, requirementTemplates, type RequirementCategoryId, type RequirementTemplate } from "@/data/caltech-requirements";

const YEARS = [1, 2, 3, 4] as const;
const TERMS = ["Fall", "Winter", "Spring"] as const;
type Term = (typeof TERMS)[number];

type ChipState = { label: string; done: boolean; cell: string | null };
type PlannerState = Record<string, ChipState>;

const STORAGE_KEY = "caltech-course-planner-v1";

function cellId(year: number, term: Term) {
  return `${year}-${term}`;
}

function defaultChips(templates: RequirementTemplate[]): PlannerState {
  const state: PlannerState = {};
  for (const template of templates) state[template.id] = { label: template.label, done: false, cell: null };
  return state;
}

function categoryOf(id: RequirementCategoryId) {
  return requirementCategories.find((category) => category.id === id)!;
}

function tint(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

// A single-field label editor that wraps onto multiple lines and grows to fit,
// so long default requirement names never get silently clipped like a fixed-width <input> would.
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

type ChipProps = {
  id: string;
  chip: ChipState;
  template: RequirementTemplate;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleDone: (id: string) => void;
  onRename: (id: string, label: string) => void;
  onResetLabel: (id: string) => void;
  onRemoveCustom: (id: string) => void;
  onSendBack: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
};

function Chip({ id, chip, template, isSelected, onSelect, onToggleDone, onRename, onResetLabel, onRemoveCustom, onSendBack, onDragStart, onDragEnd }: ChipProps) {
  const category = categoryOf(template.categoryId);
  const isCustom = id.startsWith("custom-");
  const isRenamed = chip.label !== template.label;

  return (
    <div
      className={`group flex items-start gap-2 rounded-xl border px-2.5 py-2 text-left text-xs shadow-sm transition ${isSelected ? "ring-2 ring-offset-1 ring-offset-paper" : ""}`}
      draggable
      onClick={() => onSelect(id)}
      onDragEnd={onDragEnd}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", id);
        onDragStart(id);
      }}
      role="button"
      style={{
        borderColor: tint(category.color, "55"),
        backgroundColor: tint(category.color, "14"),
        ...(isSelected ? ({ "--tw-ring-color": category.color } as CSSProperties) : {}),
      }}
      tabIndex={0}
    >
      <input
        checked={chip.done}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--chip-accent)]"
        onChange={() => onToggleDone(id)}
        onClick={(event) => event.stopPropagation()}
        style={{ "--chip-accent": category.color } as CSSProperties}
        type="checkbox"
      />
      <div className="min-w-0 flex-1">
        <AutoGrowLabel done={chip.done} onChange={(label) => onRename(id, label)} onClick={(event) => event.stopPropagation()} value={chip.label} />
        <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.1em] text-ink/40">{category.shortLabel}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {isRenamed && (
          <button
            aria-label="Reset label"
            className="text-[0.65rem] leading-none text-ink/35 hover:text-ink"
            onClick={(event) => {
              event.stopPropagation();
              onResetLabel(id);
            }}
            title="Reset to catalog label"
            type="button"
          >
            ↺
          </button>
        )}
        {isCustom && (
          <button
            aria-label="Delete custom requirement"
            className="text-[0.65rem] leading-none text-ink/35 hover:text-clay"
            onClick={(event) => {
              event.stopPropagation();
              onRemoveCustom(id);
            }}
            title="Delete custom requirement"
            type="button"
          >
            ✕
          </button>
        )}
        {chip.cell && (
          <button
            aria-label="Send back to unplaced"
            className="text-[0.65rem] leading-none text-ink/35 hover:text-ink"
            onClick={(event) => {
              event.stopPropagation();
              onSendBack(id);
            }}
            title="Send back to unplaced"
            type="button"
          >
            ⤺
          </button>
        )}
      </div>
    </div>
  );
}

type SavedPlan = { chips: PlannerState; customTemplates: RequirementTemplate[] };

export function CaltechCoursePlanner() {
  const [plan, setPlan] = useState<SavedPlan>(() => ({ chips: defaultChips(requirementTemplates), customTemplates: [] }));
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [addCategory, setAddCategory] = useState<RequirementCategoryId>("elective");
  const [addLabel, setAddLabel] = useState("");
  const { chips, customTemplates } = plan;
  const hasLoadedRef = useRef(false);

  const allTemplates = useMemo(() => [...requirementTemplates, ...customTemplates], [customTemplates]);
  const templateById = useMemo(() => new Map(allTemplates.map((template) => [template.id, template])), [allTemplates]);

  // Hydrate any saved plan from localStorage after mount, once, so the server-rendered
  // (all-unplaced) markup matches on hydration; a client-only external store, not derived render state.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedPlan>;
        const restoredCustom = parsed.customTemplates ?? [];
        const merged = defaultChips([...requirementTemplates, ...restoredCustom]);
        for (const [id, value] of Object.entries(parsed.chips ?? {})) {
          if (merged[id]) merged[id] = value;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, not a render-time derivation
        setPlan({ chips: merged, customTemplates: restoredCustom });
      }
    } catch {
      // ignore malformed local storage
    }
    hasLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  const updateChip = useCallback((id: string, update: (chip: ChipState) => ChipState) => {
    setPlan((prev) => (prev.chips[id] ? { ...prev, chips: { ...prev.chips, [id]: update(prev.chips[id]) } } : prev));
  }, []);

  const moveChip = useCallback(
    (id: string, cell: string | null) => {
      updateChip(id, (chip) => ({ ...chip, cell }));
      setSelectedChip(null);
    },
    [updateChip],
  );

  const toggleDone = useCallback((id: string) => updateChip(id, (chip) => ({ ...chip, done: !chip.done })), [updateChip]);

  const renameChip = useCallback((id: string, label: string) => updateChip(id, (chip) => ({ ...chip, label })), [updateChip]);

  const resetLabel = useCallback(
    (id: string) => {
      const template = templateById.get(id);
      if (!template) return;
      updateChip(id, (chip) => ({ ...chip, label: template.label }));
    },
    [templateById, updateChip],
  );

  const addCustomRequirement = useCallback(() => {
    const label = addLabel.trim();
    if (!label) return;
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setPlan((prev) => ({
      customTemplates: [...prev.customTemplates, { id, categoryId: addCategory, label }],
      chips: { ...prev.chips, [id]: { label, done: false, cell: null } },
    }));
    setAddLabel("");
  }, [addCategory, addLabel]);

  const removeCustomRequirement = useCallback((id: string) => {
    setPlan((prev) => {
      const chips = { ...prev.chips };
      delete chips[id];
      return { chips, customTemplates: prev.customTemplates.filter((template) => template.id !== id) };
    });
  }, []);

  const resetAll = useCallback(() => {
    if (!window.confirm("Reset the planner? This clears every placement, checkbox, renamed label, and custom requirement.")) return;
    setPlan({ chips: defaultChips(requirementTemplates), customTemplates: [] });
    setSelectedChip(null);
  }, []);

  const handleDrop = useCallback(
    (targetCell: string | null, event: DragEvent) => {
      event.preventDefault();
      const id = event.dataTransfer.getData("text/plain") || draggingId;
      if (id) moveChip(id, targetCell);
      setDraggingId(null);
    },
    [draggingId, moveChip],
  );

  const handleZoneClick = useCallback(
    (targetCell: string | null) => {
      if (!selectedChip) return;
      moveChip(selectedChip, targetCell);
    },
    [selectedChip, moveChip],
  );

  const selectChip = useCallback((id: string) => setSelectedChip((current) => (current === id ? null : id)), []);

  const categoryStats = useMemo(() => {
    return requirementCategories.map((category) => {
      const ids = allTemplates.filter((template) => template.categoryId === category.id).map((template) => template.id);
      const placed = ids.filter((id) => chips[id]?.cell).length;
      const done = ids.filter((id) => chips[id]?.done).length;
      return { category, total: ids.length, placed, done };
    });
  }, [allTemplates, chips]);

  const totals = useMemo(
    () => categoryStats.reduce(
      (acc, stat) => ({ total: acc.total + stat.total, placed: acc.placed + stat.placed, done: acc.done + stat.done }),
      { total: 0, placed: 0, done: 0 },
    ),
    [categoryStats],
  );

  function renderChip(id: string) {
    const chip = chips[id];
    const template = templateById.get(id);
    if (!chip || !template) return null;
    return (
      <Chip
        chip={chip}
        id={id}
        isSelected={selectedChip === id}
        key={id}
        onDragEnd={() => setDraggingId(null)}
        onDragStart={setDraggingId}
        onRemoveCustom={removeCustomRequirement}
        onRename={renameChip}
        onResetLabel={resetLabel}
        onSelect={selectChip}
        onSendBack={(chipId) => moveChip(chipId, null)}
        onToggleDone={toggleDone}
        template={template}
      />
    );
  }

  return (
    <div className="space-y-10">
      <section className="rounded-[1.5rem] border border-ink/10 bg-white/55 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Progress</p>
            <p className="mt-2 text-sm text-ink/60">
              {totals.placed} / {totals.total} requirements placed on the grid · {totals.done} / {totals.total} checked off
            </p>
          </div>
          <button className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold transition hover:border-ink hover:bg-white" onClick={resetAll} type="button">
            Reset planner
          </button>
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
          <p className="mt-2 text-xs text-ink/50">{selectedChip ? "Tap a term (or “Unplaced”) to place the selected tag." : "Tap a menu to open it, drag a tag onto the plan, or tap a tag then tap a term."}</p>

          <div className="mt-4 space-y-2">
            {requirementCategories.map((category) => {
              const ids = allTemplates.filter((template) => template.categoryId === category.id && !chips[template.id]?.cell).map((template) => template.id);
              const totalInCategory = allTemplates.filter((template) => template.categoryId === category.id).length;
              const isOpen = !!openCategories[category.id];
              return (
                <div className="rounded-2xl border border-ink/10 bg-white/40" key={category.id} onClick={() => handleZoneClick(null)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(null, event)}>
                  <button
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenCategories((prev) => ({ ...prev, [category.id]: !prev[category.id] }));
                    }}
                    type="button"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.label}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink/45">
                      {ids.length}/{totalInCategory}
                      <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="max-h-72 space-y-2 overflow-y-auto border-t border-ink/10 px-3.5 py-3.5">
                      {ids.length === 0 ? <p className="text-xs italic text-ink/40">All placed on the plan.</p> : ids.map((id) => renderChip(id))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 space-y-2 rounded-2xl border border-dashed border-ink/20 px-3.5 py-3.5">
            <label className="block text-xs font-medium text-ink/55" htmlFor="add-category">Add a requirement</label>
            <div className="flex flex-wrap gap-2">
              <select className="rounded-full border border-ink/20 bg-white px-3 py-1.5 text-xs" id="add-category" onChange={(event) => setAddCategory(event.target.value as RequirementCategoryId)} value={addCategory}>
                {requirementCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.shortLabel}</option>
                ))}
              </select>
              <input
                className="min-w-[9rem] flex-1 rounded-full border border-ink/20 bg-white px-3 py-1.5 text-xs"
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
                    const ids = allTemplates.filter((template) => chips[template.id]?.cell === id).map((template) => template.id);
                    return (
                      <div
                        className={`min-h-[6rem] rounded-2xl border p-2 transition ${selectedChip ? "border-moss/50 bg-lime/20" : "border-ink/10 bg-white/40"}`}
                        key={id}
                        onClick={() => handleZoneClick(id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDrop(id, event)}
                      >
                        <div className="flex flex-col gap-1.5">
                          {ids.map((chipId) => renderChip(chipId))}
                          {ids.length === 0 && <p className="p-1 text-[0.65rem] italic text-ink/30">Drop here</p>}
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
