"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CookbookRecipeCardSummary } from "@/components/cookbook-recipe-card-summary";
import { CookbookRecipeRail } from "@/components/cookbook-recipe-rail";
import { CookbookSearch } from "@/components/cookbook-search";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import { normalizeNumericInputText } from "@/lib/numeric-input";

export type ImportedIngredientGroup = {
  heading: string;
  lines: string[];
};

export type ImportedMethodGroup = {
  heading: string;
  steps: string[];
};

export type ImportedCookbookRecipe = {
  category: string;
  cookTime?: string | null;
  id: string;
  image?: string | null;
  ingredientGroups: ImportedIngredientGroup[];
  methodGroups: ImportedMethodGroup[];
  prepTime?: string | null;
  searchText: string;
  sourcePages: number[];
  subtitle?: string;
  title: string;
  yield?: string | null;
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

const FRACTIONS: Record<string, number> = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};
const QUANTITY = /^(about\s+|approximately\s+|scant\s+)?(\d+\s*[¼½¾⅓⅔⅛⅜⅝⅞]|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])/i;

function quantityValue(raw: string) {
  const fraction = raw.match(/[¼½¾⅓⅔⅛⅜⅝⅞]/)?.[0];
  const whole = Number.parseFloat(raw.replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/, "").trim()) || 0;
  return whole + (fraction ? FRACTIONS[fraction] : 0);
}

function displayQuantity(value: number) {
  if (Math.abs(value) >= 100) return String(Math.round(value));
  if (Math.abs(value) >= 10) return String(Math.round(value * 10) / 10);
  return String(Math.round(value * 100) / 100);
}

function scaleLine(text: string, factor: number) {
  if (factor === 1) return text;
  const match = text.match(QUANTITY);
  if (!match) return text;
  return `${match[1] ?? ""}${displayQuantity(quantityValue(match[2]) * factor)}${text.slice(match[0].length)}`;
}

function ScaleControl({ onChange, value }: { onChange: (value: string) => void; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-surface/55 p-3">
      <label className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/45">
        Scale recipe ×
        <input
          className="h-8 w-20 rounded-lg border border-ink/15 bg-paper/80 px-2 text-sm normal-case tracking-normal outline-none focus:border-ink/35"
          inputMode="decimal"
          min={0}
          onChange={(event) => onChange(normalizeNumericInputText(event.currentTarget.value))}
          onFocus={(event) => event.currentTarget.select()}
          step="any"
          type="number"
          value={value}
        />
      </label>
      <div className="flex gap-1.5">
        {[0.5, 1, 2, 3].map((preset) => (
          <button
            className="rounded-full border border-ink/12 px-2.5 py-1 text-[0.68rem] font-semibold text-ink/50 hover:border-ink/25"
            key={preset}
            onClick={() => onChange(String(preset))}
            type="button"
          >
            {preset}×
          </button>
        ))}
      </div>
    </div>
  );
}

function RecipeCard({
  cookbook,
  index,
  onToggle,
  open,
  recipe,
}: {
  cookbook: ImportedCookbook;
  index: number;
  onToggle: () => void;
  open: boolean;
  recipe: ImportedCookbookRecipe;
}) {
  const [factorText, setFactorText] = useState("1");
  const parsedFactor = Number.parseFloat(factorText);
  const factor = Number.isFinite(parsedFactor) && parsedFactor > 0 ? parsedFactor : 1;
  const sourceLabel = recipe.sourcePages.length === 1
    ? `PDF page ${recipe.sourcePages[0]}`
    : `PDF pages ${recipe.sourcePages.join(", ")}`;
  const timing = [
    recipe.prepTime ? `Prep ${recipe.prepTime}` : null,
    recipe.cookTime ? `Cook ${recipe.cookTime}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <article
      className={`cookbook-rail-card recipe-card scroll-mt-24 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-surface/55 p-3 transition ${open ? "cookbook-rail-card--open" : ""}`}
      data-open={open}
      id={`${cookbook.id}-${recipe.id}`}
    >
      <CookbookRecipeCardSummary
        description={recipe.subtitle ?? ""}
        fallbackMark={cookbook.title.slice(0, 3).toUpperCase()}
        image={recipe.image ?? null}
        imageAlt={`${recipe.title}, from ${cookbook.title}`}
        index={index}
        meta={recipe.yield ?? (timing || sourceLabel)}
        onToggle={onToggle}
        open={open}
        title={recipe.title}
        zoomImage={Boolean(recipe.image)}
      />
      {open && (
        <div className="mt-3 grid gap-5 border-t border-ink/[0.07] p-4 sm:p-5">
          {recipe.image && (
            <RecipeImageViewer
              alt={`${recipe.title}, from ${cookbook.title}`}
              className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-[1rem] bg-mist/25"
              src={recipe.image}
            >
              <Image
                alt={`${recipe.title}, from ${cookbook.title}`}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 88vw, 28rem"
                src={recipe.image}
              />
            </RecipeImageViewer>
          )}

          <header>
            <p className="eyebrow">{recipe.yield ?? sourceLabel}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{recipe.title}</h3>
            {recipe.subtitle && <p className="mt-2 text-sm leading-6 text-ink/55">{recipe.subtitle}</p>}
            {timing && <p className="mt-2 text-xs font-semibold text-ink/42">{timing}</p>}
          </header>

          <ScaleControl onChange={setFactorText} value={factorText} />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <section className="rounded-[1.2rem] border border-ink/10 bg-surface/35 p-4 sm:p-5">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-moss">Ingredients</p>
              <div className="grid gap-5">
                {recipe.ingredientGroups.map((group, groupIndex) => (
                  <div key={`${group.heading}-${groupIndex}`}>
                    {recipe.ingredientGroups.length > 1 && (
                      <h4 className="mb-1 text-[0.66rem] font-semibold uppercase tracking-[0.11em] text-ink/48">
                        {group.heading}
                      </h4>
                    )}
                    {group.lines.map((line, lineIndex) => (
                      <p
                        className="border-b border-ink/[0.06] py-1.5 text-[0.76rem] leading-5 text-ink/65"
                        key={`${line}-${lineIndex}`}
                      >
                        {scaleLine(line, factor)}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.2rem] border border-ink/10 bg-surface/35 p-4 sm:p-5">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-moss">Method</p>
              <div className="grid gap-5">
                {recipe.methodGroups.map((group, groupIndex) => (
                  <div key={`${group.heading}-${groupIndex}`}>
                    {recipe.methodGroups.length > 1 && (
                      <h4 className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.11em] text-ink/48">
                        {group.heading}
                      </h4>
                    )}
                    <ol className="grid gap-3">
                      {group.steps.map((step, stepIndex) => (
                        <li className="grid grid-cols-[1.45rem_minmax(0,1fr)] gap-2 text-[0.8rem] leading-6 text-ink/64" key={`${step}-${stepIndex}`}>
                          <span className="font-semibold text-moss/75">{stepIndex + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <p className="border-t border-ink/[0.07] pt-3 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-ink/35">
            Source · {sourceLabel}
          </p>
        </div>
      )}
    </article>
  );
}

export function ImportedCookbookGuide({ cookbook }: { cookbook: ImportedCookbook }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [layout, setLayout] = useState<"categories" | "all">("categories");
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return cookbook.recipes;
    return cookbook.recipes.filter((recipe) =>
      `${recipe.title} ${recipe.subtitle ?? ""} ${recipe.category} ${recipe.searchText}`.toLocaleLowerCase().includes(needle)
    );
  }, [cookbook.recipes, query]);

  useEffect(() => {
    const openHash = () => {
      const prefix = `#${cookbook.id}-`;
      if (!window.location.hash.startsWith(prefix)) return;
      const id = window.location.hash.slice(prefix.length);
      if (!cookbook.recipes.some((recipe) => recipe.id === id)) return;
      setOpen((current) => ({ ...current, [id]: true }));
      window.requestAnimationFrame(() =>
        document.getElementById(`${cookbook.id}-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    };
    openHash();
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, [cookbook.id, cookbook.recipes]);

  const recipeIds = filtered.map((recipe) => recipe.id);
  const allOpen = recipeIds.length > 0 && recipeIds.every((id) => open[id]);
  const renderRecipe = (recipe: ImportedCookbookRecipe) => (
    <RecipeCard
      cookbook={cookbook}
      index={cookbook.recipes.indexOf(recipe)}
      key={recipe.id}
      onToggle={() => setOpen((current) => ({ ...current, [recipe.id]: !current[recipe.id] }))}
      open={Boolean(open[recipe.id])}
      recipe={recipe}
    />
  );

  return (
    <div className="grid min-w-0 gap-7">
      <CookbookSearch bookName={cookbook.title} onChange={setQuery} scope="recipe titles, ingredients and methods" value={query} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-3xl text-sm leading-6 text-ink/55">{cookbook.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            aria-pressed={layout === "all"}
            className="rounded-full border border-ink/12 px-4 py-2 text-xs font-semibold text-ink/55"
            onClick={() => setLayout((current) => current === "categories" ? "all" : "categories")}
            type="button"
          >
            {layout === "categories" ? "All recipe cards" : "Category rows"}
          </button>
          <button
            className="rounded-full border border-ink/12 px-4 py-2 text-xs font-semibold text-ink/55"
            onClick={() => setOpen((current) => ({
              ...current,
              ...Object.fromEntries(recipeIds.map((id) => [id, !allOpen])),
            }))}
            type="button"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
      </div>

      {layout === "categories" ? (
        <div className="grid gap-10">
          {cookbook.categories.map((category) => {
            const recipes = filtered.filter((recipe) => recipe.category === category);
            if (recipes.length === 0) return null;
            return (
              <CookbookRecipeRail key={category} title={category}>
                {recipes.map(renderRecipe)}
              </CookbookRecipeRail>
            );
          })}
        </div>
      ) : (
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(renderRecipe)}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/45">
          No recipes match “{query}”.
        </p>
      )}
    </div>
  );
}
