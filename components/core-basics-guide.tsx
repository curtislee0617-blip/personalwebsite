"use client";

import { useEffect, useMemo, useState } from "react";
import { coreCategories, coreIntro, coreRecipes, coreRecipesByCategory, type CoreRecipe } from "@/lib/core-basics";
import { normalizeNumericInputText } from "@/lib/numeric-input";

function isSubheading(line: string) {
  return line.startsWith("§ ");
}

// ————————————————————————————— quantity scaling —————————————————————————————
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

const LEADING_QTY = /^(\d+\s*[½¼¾⅓⅔⅛⅜⅝⅞]|\d+(?:\.\d+)?|[½¼¾⅓⅔⅛⅜⅝⅞])/;

function quantityValue(raw: string) {
  const str = raw.trim();
  const fracMatch = str.match(/[½¼¾⅓⅔⅛⅜⅝⅞]/);
  if (fracMatch) {
    const whole = str.replace(/[½¼¾⅓⅔⅛⅜⅝⅞]/, "").trim();
    return (whole ? parseFloat(whole) : 0) + FRACTIONS[fracMatch[0]];
  }
  return parseFloat(str);
}

function formatQuantity(value: number) {
  const abs = Math.abs(value);
  if (abs >= 100) return String(Math.round(value));
  if (abs >= 10) return String(Math.round(value * 10) / 10);
  return String(Math.round(value * 100) / 100);
}

// Scales only a quantity that leads the line, so embedded measurements
// ("2 cm thick", "cooked for 12 minutes", "5-mm nozzle") are left untouched.
function scaleIngredient(line: string, factor: number) {
  if (factor === 1) return line;
  const match = line.match(LEADING_QTY);
  if (!match) return line;
  const value = quantityValue(match[0]);
  if (!Number.isFinite(value)) return line;
  return `${formatQuantity(value * factor)}${line.slice(match[0].length)}`;
}

// ————————————————————————————————— pieces —————————————————————————————————
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 text-ink/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IngredientList({ lines, factor }: { lines: string[]; factor: number }) {
  return (
    <ul className="grid gap-1.5">
      {lines.map((line, index) =>
        isSubheading(line) ? (
          <li className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink/45 first:mt-0" key={`${line}-${index}`}>
            {line.slice(2)}
          </li>
        ) : (
          <li className="flex gap-2 text-sm leading-6 text-ink/70" key={`${line}-${index}`}>
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
            <span>{scaleIngredient(line, factor)}</span>
          </li>
        ),
      )}
    </ul>
  );
}

function Method({ steps }: { steps: string[] }) {
  return (
    <ol className="grid gap-3">
      {steps.map((step, index) => {
        if (isSubheading(step)) {
          return (
            <li className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink/45" key={`${step}-${index}`}>
              {step.slice(2)}
            </li>
          );
        }

        const stepNumber = steps.slice(0, index + 1).filter((item) => !isSubheading(item)).length;

        return (
          <li className="flex gap-3 text-sm leading-6 text-ink/65" key={`${step}-${index}`}>
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/15 text-[0.65rem] font-semibold text-ink/50">
              {stepNumber}
            </span>
            <span>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

function ScaleCalculator({
  factorText,
  factor,
  onChange,
}: {
  factorText: string;
  factor: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[1rem] border border-ink/10 bg-surface/60 p-3">
      <label className="flex flex-wrap items-center gap-2">
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink/45">Scale ×</span>
        <input
          aria-label="Scale multiplier"
          className="h-8 w-24 rounded-lg border border-ink/15 bg-paper/70 px-2 text-sm outline-none transition focus:border-ink/35"
          inputMode="decimal"
          min={0}
          onChange={(event) => {
            const normalized = normalizeNumericInputText(event.currentTarget.value);
            event.currentTarget.value = normalized;
            onChange(normalized);
          }}
          onFocus={(event) => event.currentTarget.select()}
          step="any"
          type="number"
          value={factorText}
        />
      </label>
      {factor !== 1 && (
        <p className="mt-2 text-[0.7rem] leading-4 text-ink/45">
          Quantities below are multiplied by {formatQuantity(factor)}. Method text keeps the original amounts.
        </p>
      )}
    </div>
  );
}

function RecipeCard({ recipe, open, onToggle }: { recipe: CoreRecipe; open: boolean; onToggle: () => void }) {
  const [factorText, setFactorText] = useState("1");
  const parsed = parseFloat(factorText);
  const factor = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const ingredientCount = useMemo(
    () => recipe.ingredients.filter((line) => !isSubheading(line)).length,
    [recipe.ingredients],
  );

  return (
    <article
      className="mb-4 break-inside-avoid overflow-hidden rounded-[1.4rem] border border-ink/10 bg-paper/70"
      id={recipe.slug}
    >
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-surface/40"
        onClick={onToggle}
        type="button"
      >
        <span>
          <span className="text-base font-semibold tracking-tight sm:text-lg">{recipe.name}</span>
          <span className="mt-0.5 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink/40">
            {ingredientCount} {ingredientCount === 1 ? "ingredient" : "ingredients"}
          </span>
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="grid gap-4 px-5 pb-5">
          <ScaleCalculator factor={factor} factorText={factorText} onChange={setFactorText} />
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink/40">Ingredients</p>
            <div className="mt-3">
              <IngredientList factor={factor} lines={recipe.ingredients} />
            </div>
          </div>
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink/40">Method</p>
            <div className="mt-3">
              <Method steps={recipe.method} />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export function CoreBasicsGuide() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(coreCategories.map((category) => [category.id, true])),
  );
  const [openRecipes, setOpenRecipes] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleRecipe = (slug: string) => setOpenRecipes((prev) => ({ ...prev, [slug]: !prev[slug] }));
  const setAll = (value: boolean) => {
    setOpenSections(Object.fromEntries(coreCategories.map((category) => [category.id, value])));
    setOpenRecipes(Object.fromEntries(coreRecipes.map((recipe) => [recipe.slug, value])));
  };

  useEffect(() => {
    const openHashRecipe = () => {
      const slug = window.location.hash.slice(1);
      const recipe = coreRecipes.find((item) => item.slug === slug);
      if (!recipe) return;
      setOpenSections((current) => ({ ...current, [recipe.category]: true }));
      setOpenRecipes((current) => ({ ...current, [slug]: true }));
      window.requestAnimationFrame(() => document.getElementById(slug)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    openHashRecipe();
    window.addEventListener("hashchange", openHashRecipe);
    return () => window.removeEventListener("hashchange", openHashRecipe);
  }, []);

  return (
    <div className="grid gap-8 sm:gap-10">
      <div className="max-w-3xl">
        <p className="text-sm italic leading-7 text-ink/65 sm:text-base">{coreIntro}</p>
        <p className="mt-2 text-[0.68rem] font-medium uppercase tracking-[0.1em] text-ink/40">
          This passage is from <cite className="normal-case tracking-normal">Core</cite> by Clare Smyth.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Categories" className="flex flex-wrap gap-2">
          {coreCategories.map((category) => (
            <a
              className="rounded-full border border-ink/12 bg-surface/60 px-3.5 py-1.5 text-xs font-semibold text-ink/60 transition hover:border-ink/25 hover:text-ink"
              href={`#${category.id}`}
              key={category.id}
            >
              {category.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 gap-2">
          <button
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/55 transition hover:border-ink/30"
            onClick={() => setAll(true)}
            type="button"
          >
            Expand all
          </button>
          <button
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/55 transition hover:border-ink/30"
            onClick={() => setAll(false)}
            type="button"
          >
            Collapse all
          </button>
        </div>
      </div>

      {coreCategories.map((category) => {
        const recipes = coreRecipesByCategory(category.id);
        if (recipes.length === 0) return null;
        const open = openSections[category.id];

        return (
          <section className="scroll-mt-24" id={category.id} key={category.id}>
            <button
              aria-expanded={open}
              className="flex w-full items-end justify-between gap-3 border-b border-ink/10 pb-4 text-left"
              onClick={() => toggleSection(category.id)}
              type="button"
            >
              <span>
                <span className="eyebrow">{`${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"}`}</span>
                <span className="mt-2 block text-2xl font-semibold tracking-tight sm:text-3xl">{category.label}</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="hidden max-w-xs text-xs leading-5 text-ink/50 sm:block sm:text-sm">{category.blurb}</span>
                <Chevron open={open} />
              </span>
            </button>

            {open && (
              <div className="mt-5 gap-4 sm:columns-2 xl:columns-3 [column-fill:balance]">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.slug}
                    onToggle={() => toggleRecipe(recipe.slug)}
                    open={Boolean(openRecipes[recipe.slug])}
                    recipe={recipe}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
