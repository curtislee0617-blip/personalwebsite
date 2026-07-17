"use client";

import { useMemo, useState } from "react";
import { CookbookRecipeRail } from "@/components/cookbook-recipe-rail";
import { CookbookSearch } from "@/components/cookbook-search";

export type ImportedCookbookRecipe = {
  category: string;
  id: string;
  sourcePages: number[];
  title: string;
  transcription: string;
};

export type ImportedCookbook = {
  author: string;
  categories: string[];
  description: string;
  id: string;
  recipeCountLabel: string;
  recipes: ImportedCookbookRecipe[];
  title: string;
};

function RecipeCard({ cookbook, open, onToggle, recipe }: { cookbook: ImportedCookbook; open: boolean; onToggle: () => void; recipe: ImportedCookbookRecipe }) {
  const sourceLabel = recipe.sourcePages.length === 1 ? `PDF page ${recipe.sourcePages[0]}` : `PDF pages ${recipe.sourcePages.join(", ")}`;

  return (
    <article className="cookbook-rail-card scroll-mt-24 overflow-hidden rounded-[1.25rem] border border-ink/10 bg-surface/55 p-3" id={`${cookbook.id}-${recipe.id}`}>
      <button aria-expanded={open} className="flex w-full min-w-0 flex-col text-left" onClick={onToggle} type="button">
        <p className="eyebrow">{sourceLabel}</p>
        <h3 className="mt-2 break-words text-lg font-semibold leading-tight tracking-tight">{recipe.title}</h3>
        <span className="mt-4 text-xs font-semibold text-moss">{open ? "Close recipe" : "Open recipe"} <span aria-hidden="true">{open ? "↑" : "↓"}</span></span>
      </button>
      {open && (
        <div className="mt-3 border-t border-ink/[0.08] pt-3">
          <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink/38">Source transcription · {sourceLabel}</p>
          <div className="max-h-[34rem] overflow-y-auto rounded-xl bg-paper/60 p-3.5 text-xs leading-5 text-ink/72 whitespace-pre-wrap sm:p-4">
            {recipe.transcription}
          </div>
        </div>
      )}
    </article>
  );
}

export function ImportedCookbookGuide({ cookbook }: { cookbook: ImportedCookbook }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return cookbook.recipes;
    return cookbook.recipes.filter((recipe) => `${recipe.title} ${recipe.category} ${recipe.transcription}`.toLocaleLowerCase().includes(needle));
  }, [cookbook.recipes, query]);
  const recipeIds = filtered.map((recipe) => recipe.id);
  const allOpen = recipeIds.length > 0 && recipeIds.every((id) => open[id]);

  return (
    <div className="grid min-w-0 gap-7">
      <CookbookSearch bookName={cookbook.title} onChange={setQuery} scope="recipe names and full source transcriptions" value={query} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-3xl text-sm leading-6 text-ink/55">{cookbook.description} Each card keeps its original PDF-page reference; the extracted wording remains available within the card while detailed ingredient/component formatting is checked against the page layout.</p>
        <button className="hidden shrink-0 rounded-full border border-ink/12 px-4 py-2 text-xs font-semibold text-ink/55 sm:block" onClick={() => setOpen((current) => ({ ...current, ...Object.fromEntries(recipeIds.map((id) => [id, !allOpen])) }))} type="button">
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <div className="grid gap-10">
        {cookbook.categories.map((category) => {
          const recipes = filtered.filter((recipe) => recipe.category === category);
          if (recipes.length === 0) return null;
          return <CookbookRecipeRail key={category} title={category}>{recipes.map((recipe) => <RecipeCard cookbook={cookbook} key={recipe.id} onToggle={() => setOpen((current) => ({ ...current, [recipe.id]: !current[recipe.id] }))} open={Boolean(open[recipe.id])} recipe={recipe} />)}</CookbookRecipeRail>;
        })}
      </div>
      {filtered.length === 0 && <p className="rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/45">No recipes match “{query}”.</p>}
    </div>
  );
}
