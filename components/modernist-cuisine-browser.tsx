"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import contents from "@/imports/modernist-cuisine-volume-6/contents-index.json";
import { ModernistRecipeCalculator } from "@/components/modernist-recipe-calculator";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import type { ModernistRecipeComponent } from "@/components/modernist-recipe-calculator";
import { modernistEntryId } from "@/lib/modernist-navigation";

type ContentsEntry = {
  chapter: string;
  title: string;
  displayTitle?: string;
  page: number;
  yield?: string;
  ingredients: Array<{ name: string; quantity: string; heading?: boolean }>;
  steps: string[];
  components?: ModernistRecipeComponent[];
  notes: string[];
  reference: string[];
  sourceKind?: "recipe" | "reference";
  isRecipe?: boolean;
  layoutKind?: "structured" | "facsimile";
  layoutReason?: string;
  sourceImage?: string;
  sourceImageWidth?: number;
  sourceImageHeight?: number;
};

const chapterLabels: Record<string, string> = {
  "chapter-08": "Chapter 8 — Cooking in Modern Ovens",
  "chapter-10": "Chapter 10 — The Modernist Kitchen",
  "chapter-11": "Chapter 11 — Meat and Seafood",
  "chapter-12": "Chapter 12 — Plant Foods",
  "chapter-13": "Chapter 13 — Thickeners",
  "chapter-14": "Chapter 14 — Gels",
  "chapter-15": "Chapter 15 — Emulsions",
  "chapter-16": "Chapter 16 — Foams",
  "chapter-18": "Chapter 18 — Coffee",
  "reference-tables": "Reference Tables",
};

const chapters = Object.keys(chapterLabels).map((id) => ({
  id,
  title: chapterLabels[id],
  entries: (contents as ContentsEntry[]).filter((entry) => entry.chapter === id),
}));

const entryCount = chapters.reduce((total, chapter) => total + chapter.entries.length, 0);
const structuredCount = chapters.reduce(
  (total, chapter) => total + chapter.entries.filter((entry) => entry.sourceKind === "recipe").length,
  0,
);

type EntryTarget = {
  chapterId: string;
  entry: ContentsEntry;
  id: string;
};

const entryTargets: EntryTarget[] = chapters.flatMap((chapter) =>
  chapter.entries.map((entry) => ({
    chapterId: chapter.id,
    entry,
    id: modernistEntryId(entry),
  })),
);
const entryTargetsById = new Map(entryTargets.map((target) => [target.id, target]));
const entryTargetsByPage = new Map<number, EntryTarget[]>();

for (const target of entryTargets) {
  const pageTargets = entryTargetsByPage.get(target.entry.page) ?? [];
  pageTargets.push(target);
  entryTargetsByPage.set(target.entry.page, pageTargets);
}

const REFERENCE_STOP_WORDS = new Set([
  "a", "and", "as", "at", "by", "details", "for", "from", "in", "make", "of", "on", "or", "page", "see", "the", "to", "use", "with",
]);
const SAME_VOLUME_PAGE_REFERENCE = /\b(?:(?:see|on|from) page|page)\s+(\d{1,3})(?!\s*[·.\-]\s*\d)/gi;

function normalizedTokens(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 1 && !REFERENCE_STOP_WORDS.has(token));
}

function resolvePageReference(page: number, sourceText: string) {
  const candidates = entryTargetsByPage.get(page);
  if (!candidates?.length) return null;
  if (candidates.length === 1) return candidates[0];

  const sourceTokens = new Set(normalizedTokens(sourceText));
  return [...candidates]
    .map((target, index) => {
      const title = target.entry.displayTitle || target.entry.title;
      const titleTokens = normalizedTokens(title);
      const overlap = titleTokens.filter((token) => sourceTokens.has(token)).length;
      const normalizedSource = [...sourceTokens].join(" ");
      const normalizedTitle = titleTokens.join(" ");
      const phraseBonus = normalizedTitle && normalizedSource.includes(normalizedTitle) ? 100 : 0;
      return { index, overlap, phraseBonus, target };
    })
    .sort((a, b) => b.phraseBonus - a.phraseBonus || b.overlap - a.overlap || a.index - b.index)[0].target;
}

function pageReferences(text: string) {
  const references: Array<{ end: number; start: number; target: EntryTarget }> = [];
  SAME_VOLUME_PAGE_REFERENCE.lastIndex = 0;
  let match = SAME_VOLUME_PAGE_REFERENCE.exec(text);
  while (match) {
    const target = resolvePageReference(Number(match[1]), text);
    if (target) references.push({ start: match.index, end: match.index + match[0].length, target });
    match = SAME_VOLUME_PAGE_REFERENCE.exec(text);
  }
  return references;
}

function linkedText(text: string, onNavigate: (target: EntryTarget) => void): ReactNode {
  const references = pageReferences(text);
  if (references.length === 0) return text;

  const result: ReactNode[] = [];
  let cursor = 0;
  references.forEach((reference, index) => {
    if (reference.start > cursor) result.push(text.slice(cursor, reference.start));
    const label = text.slice(reference.start, reference.end);
    const targetTitle = reference.target.entry.displayTitle || reference.target.entry.title;
    result.push(
      <a
        className="modernist-reference-link"
        href={`#${reference.target.id}`}
        key={`${reference.target.id}-${reference.start}-${index}`}
        onClick={(event) => {
          event.preventDefault();
          onNavigate(reference.target);
        }}
        title={`Open ${targetTitle}`}
      >
        {label}
      </a>,
    );
    cursor = reference.end;
  });
  if (cursor < text.length) result.push(text.slice(cursor));
  return result;
}

function referencedEntries(entry: ContentsEntry) {
  const texts = [
    ...entry.ingredients.map((ingredient) => ingredient.name),
    ...entry.steps,
    ...entry.notes,
    ...entry.reference,
    ...(entry.components?.flatMap((component) => [
      component.name,
      ...component.ingredients.map((ingredient) => ingredient.name),
      ...component.steps.map((step) => step.text),
    ]) ?? []),
  ];
  const targets = texts.flatMap((text) => pageReferences(text).map((reference) => reference.target));
  return [...new Map(targets.map((target) => [target.id, target])).values()];
}

function SourceFigure({ entry, compact = false }: { entry: ContentsEntry; compact?: boolean }) {
  if (!entry.sourceImage) return null;
  const title = entry.displayTitle || entry.title;

  return (
    <figure className={`modernist-source-figure ${compact ? "is-compact" : ""}`}>
      <RecipeImageViewer alt={`${title} as printed in Modernist Cuisine`} className="w-full" src={entry.sourceImage}>
        <Image
          alt={`${title} as printed in Modernist Cuisine`}
          height={entry.sourceImageHeight || 900}
          sizes="(max-width: 768px) 90vw, 760px"
          src={entry.sourceImage}
          width={entry.sourceImageWidth || 1200}
        />
      </RecipeImageViewer>
      <figcaption>
        Original page {entry.page} layout{entry.layoutReason ? ` · ${entry.layoutReason}` : ""}.
      </figcaption>
    </figure>
  );
}

function RecipeDetail({ entry, onNavigate }: { entry: ContentsEntry; onNavigate: (target: EntryTarget) => void }) {
  const title = entry.displayTitle || entry.title;
  const linkedEntries = entry.sourceKind === "recipe" ? [] : referencedEntries(entry);

  return (
    <div className="modernist-sheet">
      <div className="modernist-sheet-head">
        <div>
          <p className="eyebrow">Kitchen Manual · page {entry.page}</p>
          <h4>{title}</h4>
        </div>
        {entry.yield && <span className="modernist-yield">Yields {entry.yield}</span>}
      </div>

      {entry.sourceKind === "recipe" ? (
        <>
          <ModernistRecipeCalculator
            components={entry.components}
            ingredients={entry.ingredients}
            renderText={(text) => linkedText(text, onNavigate)}
            steps={entry.steps}
          />
          {entry.notes.length > 0 && (
            <div className="modernist-notes">
              {entry.notes.map((note, index) => <p key={`${entry.title}-note-${index}`}>{linkedText(note, onNavigate)}</p>)}
            </div>
          )}
          <details className="modernist-original-layout">
            <summary>
              <span aria-hidden="true">›</span>
              View the original page layout
            </summary>
            <SourceFigure compact entry={entry} />
          </details>
        </>
      ) : entry.sourceImage ? (
        <>
          <SourceFigure entry={entry} />
          {linkedEntries.length > 0 && (
            <nav aria-label="Recipes referenced on this page" className="modernist-linked-entries">
              <span>Referenced in this page</span>
              <div>
                {linkedEntries.map((target) => (
                  <a
                    href={`#${target.id}`}
                    key={target.id}
                    onClick={(event) => {
                      event.preventDefault();
                      onNavigate(target);
                    }}
                  >
                    {target.entry.displayTitle || target.entry.title}
                    <small>p. {target.entry.page}</small>
                  </a>
                ))}
              </div>
            </nav>
          )}
        </>
      ) : (
        <div className="modernist-reference">
          {entry.reference.map((line, index) => (
            <p key={`${entry.title}-reference-${index}`}>{linkedText(line, onNavigate)}</p>
          ))}
        </div>
      )}

      {entry.sourceKind !== "recipe" && entry.notes.length > 0 && (
        <div className="modernist-notes">
          {entry.notes.map((note, index) => <p key={`${entry.title}-note-${index}`}>{linkedText(note, onNavigate)}</p>)}
        </div>
      )}
    </div>
  );
}

export function ModernistCuisineBrowser() {
  const [openChapters, setOpenChapters] = useState<Set<string>>(() => new Set());
  const [openEntries, setOpenEntries] = useState<Set<string>>(() => new Set());
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  const openTarget = useCallback((target: EntryTarget, updateHash = true) => {
    setOpenChapters((current) => new Set(current).add(target.chapterId));
    setOpenEntries((current) => new Set(current).add(target.id));
    setPendingScroll(target.id);
    if (updateHash && window.location.hash !== `#${target.id}`) {
      window.history.pushState(null, "", `#${target.id}`);
    }
  }, []);

  useEffect(() => {
    const openHashTarget = () => {
      const id = window.location.hash.slice(1);
      const target = entryTargetsById.get(id);
      if (target) openTarget(target, false);
    };
    openHashTarget();
    window.addEventListener("hashchange", openHashTarget);
    return () => window.removeEventListener("hashchange", openHashTarget);
  }, [openTarget]);

  useEffect(() => {
    if (!pendingScroll || !openEntries.has(pendingScroll)) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(pendingScroll)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingScroll(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [openChapters, openEntries, pendingScroll]);

  return (
    <div id="modernist-cuisine">
      <div className="design-panel rounded-[2rem] border border-ink/10 bg-surface/45 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Kitchen Manual index</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Recipes, techniques and reference charts</h2>
            <p className="mt-2 text-sm leading-6 text-ink/50">
              {entryCount} entries · {structuredCount} transcribed grids · {entryCount - structuredCount} original complex layouts
            </p>
          </div>
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/10 bg-paper/80 text-lg text-ink/45">↗</span>
        </div>

        <div className="mt-6 space-y-2">
          {chapters.map((chapter) => (
            <details
              className="modernist-chapter group rounded-2xl border border-ink/10 bg-surface/45"
              key={chapter.id}
              open={openChapters.has(chapter.id)}
              onToggle={(event) => {
                const isOpen = event.currentTarget.open;
                setOpenChapters((current) => {
                  const next = new Set(current);
                  if (isOpen) next.add(chapter.id);
                  else next.delete(chapter.id);
                  return next;
                });
                if (!isOpen) {
                  const chapterEntryIds = new Set(chapter.entries.map((entry) => modernistEntryId(entry)));
                  setOpenEntries((current) => new Set([...current].filter((id) => !chapterEntryIds.has(id))));
                }
              }}
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 marker:hidden sm:px-5">
                <span aria-hidden="true" className="modernist-chevron shrink-0 text-xs text-ink/45">›</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink/80">{chapter.title}</span>
                <span className="font-mono text-[0.65rem] text-ink/35">{chapter.entries.length}</span>
              </summary>
              {openChapters.has(chapter.id) && <div className="border-t border-ink/10 px-2 py-2 sm:px-3">
                {chapter.entries.map((entry, index) => (
                  <details
                    className="modernist-recipe group/recipe scroll-mt-24"
                    id={modernistEntryId(entry)}
                    key={`${entry.title}-${entry.page}-${index}`}
                    open={openEntries.has(modernistEntryId(entry))}
                    onToggle={(event) => {
                      const entryKey = modernistEntryId(entry);
                      const isOpen = event.currentTarget.open;
                      setOpenEntries((current) => {
                        const next = new Set(current);
                        if (isOpen) next.add(entryKey);
                        else next.delete(entryKey);
                        return next;
                      });
                    }}
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-2 border-b border-ink/5 px-2 py-1.5 marker:hidden last:border-b-0">
                      <span aria-hidden="true" className="modernist-row-arrow shrink-0 text-[0.7rem] text-ink/35">›</span>
                      <span className="min-w-0 flex-1 truncate text-[0.72rem] leading-5 text-ink/70">{entry.displayTitle || entry.title}</span>
                      <span className="modernist-entry-kind">{entry.sourceKind === "recipe" ? "recipe" : entry.isRecipe ? "page" : "chart"}</span>
                      <span className="shrink-0 font-mono text-[0.6rem] text-ink/30">{entry.page}</span>
                    </summary>
                    {openEntries.has(modernistEntryId(entry)) && (
                      <div className="modernist-recipe-panel ml-6 border-b border-ink/5 px-2 pb-4 pt-2">
                        <RecipeDetail entry={entry} onNavigate={openTarget} />
                      </div>
                    )}
                  </details>
                ))}
              </div>}
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
