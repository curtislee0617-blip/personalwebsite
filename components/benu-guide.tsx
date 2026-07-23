"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CookbookRecipeCardSummary } from "@/components/cookbook-recipe-card-summary";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import { CookbookRecipeRail } from "@/components/cookbook-recipe-rail";
import { benuRecipes, type BenuRecipe, type BenuRecipeComponent } from "@/lib/benu";
import { normalizeNumericInputText } from "@/lib/numeric-input";

const FRACTIONS: Record<string, number> = {
  "½": 0.5,
  "¼": 0.25,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

const QUANTITY_SOURCE = String.raw`(?:\d+\s*[½¼¾⅓⅔⅛⅜⅝⅞]|\d+(?:\.\d+)?|[½¼¾⅓⅔⅛⅜⅝⅞])`;
const LEADING_QUANTITY = new RegExp(
  String.raw`^((?:about|around|approximately|scant)\s+)?(${QUANTITY_SOURCE})(?:\s*([–-])\s*(${QUANTITY_SOURCE}))?`,
  "i",
);

function quantityValue(raw: string) {
  const fraction = raw.match(/[½¼¾⅓⅔⅛⅜⅝⅞]/);
  if (!fraction) return Number.parseFloat(raw);
  const whole = raw.replace(/[½¼¾⅓⅔⅛⅜⅝⅞]/, "").trim();
  return (whole ? Number.parseFloat(whole) : 0) + FRACTIONS[fraction[0]];
}

function formatQuantity(value: number) {
  const absolute = Math.abs(value);
  if (absolute >= 100) return String(Math.round(value));
  if (absolute >= 10) return String(Math.round(value * 10) / 10);
  return String(Math.round(value * 100) / 100);
}

function scaleIngredient(line: string, factor: number) {
  if (factor === 1) return line;
  const match = line.match(LEADING_QUANTITY);
  if (!match) return line;
  const first = quantityValue(match[2]);
  if (!Number.isFinite(first)) return line;
  const range = match[4] ? `${match[3]}${formatQuantity(quantityValue(match[4]) * factor)}` : "";
  return `${match[1] ?? ""}${formatQuantity(first * factor)}${range}${line.slice(match[0].length)}`;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-3 w-3 shrink-0 text-ink/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkedIngredient({ line }: { line: string }) {
  const phrase = "shellfish stock consommé";
  const start = line.toLocaleLowerCase().indexOf(phrase);
  if (start < 0) return line;

  return (
    <>
      {line.slice(0, start)}
      <a className="font-semibold text-moss underline decoration-moss/30 underline-offset-2" href="#benu-shellfish-consomme-and-raft">
        {line.slice(start, start + phrase.length)}
      </a>
      {line.slice(start + phrase.length)}
    </>
  );
}

function IngredientList({ ingredients, factor }: { ingredients: string[]; factor: number }) {
  return (
    <ul className="divide-y divide-ink/[0.07] border-y border-ink/[0.07]">
      {ingredients.map((ingredient, index) => {
        const line = scaleIngredient(ingredient, factor);
        return (
          <li className="flex gap-2.5 py-2 text-[0.82rem] leading-5 text-ink/68" key={`${ingredient}-${index}`}>
            <span aria-hidden="true" className="mt-[0.46rem] h-1 w-1 shrink-0 rounded-full bg-moss/55" />
            <span><LinkedIngredient line={line} /></span>
          </li>
        );
      })}
    </ul>
  );
}

function MethodList({ steps }: { steps: string[] }) {
  return (
    <ol className="grid gap-3">
      {steps.map((step, index) => (
        <li className="flex gap-3 text-[0.82rem] leading-6 text-ink/65" key={`${step}-${index}`}>
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/15 text-[0.63rem] font-semibold text-ink/48">
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function ScaleControl({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const parsed = Number.parseFloat(value);
  const factor = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-surface/55 p-3">
      <div className="flex items-center gap-2">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/45">Scale recipe ×</span>
        <input
          aria-label="Recipe scale multiplier"
          className="h-8 w-20 rounded-lg border border-ink/15 bg-paper/80 px-2 text-sm outline-none transition focus:border-ink/35"
          inputMode="decimal"
          min={0}
          onChange={(event) => onChange(normalizeNumericInputText(event.currentTarget.value))}
          onFocus={(event) => event.currentTarget.select()}
          step="any"
          type="number"
          value={value}
        />
      </div>
      <div aria-label="Scale presets" className="flex gap-1.5">
        {[0.5, 1, 2, 3].map((preset) => (
          <button
            aria-pressed={factor === preset}
            className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold transition ${factor === preset ? "border-moss bg-moss text-paper" : "border-ink/12 text-ink/50 hover:border-ink/25"}`}
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

function RecipeComponent({ component, factor }: { component: BenuRecipeComponent; factor: number }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="overflow-hidden rounded-[1.15rem] border border-ink/10 bg-paper/65">
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>
          <span className="text-sm font-semibold tracking-tight">{component.name}</span>
          <span className="ml-2 text-[0.63rem] font-semibold uppercase tracking-[0.1em] text-ink/35">
            {component.ingredients.length} ingredients · {component.steps.length} {component.steps.length === 1 ? "step" : "steps"}
          </span>
        </span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="grid gap-5 border-t border-ink/[0.07] px-4 py-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          {component.ingredients.length > 0 && (
            <div>
              <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/40">Ingredients</p>
              <IngredientList factor={factor} ingredients={component.ingredients} />
            </div>
          )}
          <div className={component.ingredients.length === 0 ? "md:col-span-2" : ""}>
            <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/40">Method</p>
            <MethodList steps={component.steps} />
          </div>
        </div>
      )}
    </section>
  );
}

function RecipeCard({ recipe, index, open, onToggle }: { recipe: BenuRecipe; index: number; open: boolean; onToggle: () => void }) {
  const [factorText, setFactorText] = useState("1");
  const parsed = Number.parseFloat(factorText);
  const factor = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  const ingredientCount = recipe.components.reduce((total, component) => total + component.ingredients.length, 0);

  return (
    <article className="cookbook-rail-card recipe-card scroll-mt-24 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-surface/55 p-3 transition" id={`benu-${recipe.slug}`}>
      <CookbookRecipeCardSummary description={recipe.sourceNote ?? `${ingredientCount} ingredients across ${recipe.components.length} components`} fallbackMark="BENU" image={recipe.image} imageAlt={`${recipe.title}, plated dish`} imagePosition={recipe.imagePosition} index={index} meta={`${recipe.components.length} components`} onToggle={onToggle} open={open} title={recipe.title} />

      {open && (
        <div className="mt-3 grid gap-5 border-t border-ink/[0.07] p-4 sm:p-5">
          {recipe.image ? (
            <RecipeImageViewer alt={`${recipe.title}, plated dish`} className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-[1.15rem] bg-paper" src={recipe.image}>
              <Image
                alt={`${recipe.title}, plated dish`}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 88vw, 32rem"
                src={recipe.image}
                style={{ objectPosition: recipe.imagePosition ?? "50% 50%" }}
                unoptimized
              />
            </RecipeImageViewer>
          ) : (
            <div className="mx-auto grid min-h-36 w-full max-w-lg place-items-center rounded-[1.15rem] border border-dashed border-ink/15 bg-gradient-to-br from-mist/35 to-lime/25 p-5 text-center">
              <div>
                <span className="text-xl font-semibold tracking-[-0.08em] text-ink/28">BENU</span>
                <p className="mt-2 text-xs leading-5 text-ink/43">No plated-dish photograph was included.</p>
              </div>
            </div>
          )}

          <header>
            <p className="eyebrow">Benu recipe</p>
            <h3 className="mt-2 max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl">{recipe.title}</h3>
          </header>

          {recipe.sourceNote && (
            <div className="rounded-2xl border border-amber-700/15 bg-amber-100/35 px-4 py-3 text-sm leading-6 text-ink/60">
              {recipe.sourceNote}
            </div>
          )}

          {recipe.components.length > 0 && <ScaleControl onChange={setFactorText} value={factorText} />}

          <div className="grid gap-3">
            {recipe.components.map((component) => (
              <RecipeComponent component={component} factor={factor} key={component.name} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export function BenuGuide() {
  const [query, setQuery] = useState("");
  const [openRecipes, setOpenRecipes] = useState<Record<string, boolean>>({});
  const filteredRecipes = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return benuRecipes;
    return benuRecipes.filter((recipe) =>
      [
        recipe.title,
        ...recipe.components.flatMap((component) => [component.name, ...component.ingredients]),
      ].join(" ").toLocaleLowerCase().includes(needle),
    );
  }, [query]);

  useEffect(() => {
    const openHashRecipe = () => {
      const hash = window.location.hash.slice(1);
      if (!hash.startsWith("benu-")) return;
      const slug = hash.slice("benu-".length);
      if (!benuRecipes.some((recipe) => recipe.slug === slug)) return;
      setQuery("");
      setOpenRecipes((current) => ({ ...current, [slug]: true }));
      window.requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    openHashRecipe();
    window.addEventListener("hashchange", openHashRecipe);
    return () => window.removeEventListener("hashchange", openHashRecipe);
  }, []);

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm leading-6 text-ink/55">Ordered from the earliest supplied photograph to the latest.</p>
          <p className="mt-1 text-xs text-ink/38">Open an image card for component-by-component ingredients, the full method and scaling.</p>
        </div>
        <label className="relative block sm:w-72">
          <span className="sr-only">Search Benu recipes</span>
          <input
            className="h-10 w-full rounded-full border border-ink/12 bg-surface/65 px-4 pr-10 text-sm outline-none transition placeholder:text-ink/35 focus:border-ink/30"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search dishes or components"
            type="search"
            value={query}
          />
          <span aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink/35">⌕</span>
        </label>
      </div>

      <CookbookRecipeRail title="Benu recipes">
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            index={benuRecipes.indexOf(recipe)}
            key={recipe.slug}
            onToggle={() => setOpenRecipes((current) => ({ ...current, [recipe.slug]: !current[recipe.slug] }))}
            open={Boolean(openRecipes[recipe.slug])}
            recipe={recipe}
          />
        ))}
      </CookbookRecipeRail>

      {filteredRecipes.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/45">No Benu recipes match that search.</div>
      )}
    </div>
  );
}
