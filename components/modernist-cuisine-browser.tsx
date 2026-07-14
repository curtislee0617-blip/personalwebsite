"use client";

import Image from "next/image";
import { useState } from "react";
import contents from "@/imports/modernist-cuisine-volume-6/contents-index.json";
import { ModernistFacsimileScaleHelper, ModernistRecipeCalculator } from "@/components/modernist-recipe-calculator";

type ContentsEntry = {
  chapter: string;
  title: string;
  displayTitle?: string;
  page: number;
  yield?: string;
  ingredients: Array<{ name: string; quantity: string; heading?: boolean }>;
  steps: string[];
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

function SourceFigure({ entry, compact = false }: { entry: ContentsEntry; compact?: boolean }) {
  if (!entry.sourceImage) return null;
  const title = entry.displayTitle || entry.title;

  return (
    <figure className={`modernist-source-figure ${compact ? "is-compact" : ""}`}>
      <Image
        alt={`${title} as printed in Modernist Cuisine`}
        height={entry.sourceImageHeight || 900}
        sizes="(max-width: 768px) 90vw, 760px"
        src={entry.sourceImage}
        width={entry.sourceImageWidth || 1200}
      />
      <figcaption>
        Original page {entry.page} layout{entry.layoutReason ? ` · ${entry.layoutReason}` : ""}.
      </figcaption>
    </figure>
  );
}

function RecipeDetail({ entry }: { entry: ContentsEntry }) {
  const title = entry.displayTitle || entry.title;

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
          <ModernistRecipeCalculator ingredients={entry.ingredients} steps={entry.steps} />
          {entry.notes.length > 0 && (
            <div className="modernist-notes">
              {entry.notes.map((note, index) => <p key={`${entry.title}-note-${index}`}>{note}</p>)}
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
          {entry.isRecipe && <ModernistFacsimileScaleHelper />}
          <SourceFigure entry={entry} />
        </>
      ) : (
        <div className="modernist-reference">
          {entry.reference.map((line, index) => (
            <p key={`${entry.title}-reference-${index}`}>{line}</p>
          ))}
        </div>
      )}

      {entry.sourceKind !== "recipe" && entry.notes.length > 0 && (
        <div className="modernist-notes">
          {entry.notes.map((note, index) => <p key={`${entry.title}-note-${index}`}>{note}</p>)}
        </div>
      )}
    </div>
  );
}

export function ModernistCuisineBrowser() {
  const [openChapters, setOpenChapters] = useState<Set<string>>(() => new Set());
  const [openEntries, setOpenEntries] = useState<Set<string>>(() => new Set());

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
            onToggle={(event) => {
              const isOpen = event.currentTarget.open;
              setOpenChapters((current) => {
                const next = new Set(current);
                if (isOpen) next.add(chapter.id);
                else next.delete(chapter.id);
                return next;
              });
              if (!isOpen) setOpenEntries(new Set());
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
                  className="modernist-recipe group/recipe"
                  key={`${entry.title}-${entry.page}-${index}`}
                  onToggle={(event) => {
                    const entryKey = `${chapter.id}-${entry.page}-${index}`;
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
                  {openEntries.has(`${chapter.id}-${entry.page}-${index}`) && (
                    <div className="modernist-recipe-panel ml-6 border-b border-ink/5 px-2 pb-4 pt-2">
                      <RecipeDetail entry={entry} />
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
