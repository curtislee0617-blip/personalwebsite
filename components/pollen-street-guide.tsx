"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CookbookRecipeCardSummary } from "@/components/cookbook-recipe-card-summary";
import { CookbookRecipeRail } from "@/components/cookbook-recipe-rail";
import { CookbookSearch } from "@/components/cookbook-search";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import { normalizeNumericInputText } from "@/lib/numeric-input";
import {
  pollenStreetBasics,
  pollenStreetBasicsByCategory,
  pollenStreetBasicsBySlug,
  pollenStreetCategories,
  pollenStreetDishes,
  type PollenStreetBasic,
  type PollenStreetDish,
  type PollenStreetDishSection,
} from "@/lib/pollen-street";

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
  const value = raw.trim();
  const fraction = value.match(/[½¼¾⅓⅔⅛⅜⅝⅞]/);
  if (!fraction) return Number.parseFloat(value);
  const whole = value.replace(/[½¼¾⅓⅔⅛⅜⅝⅞]/, "").trim();
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
  const prefix = match[1] ?? "";
  const range = match[4] ? `${match[3]}${formatQuantity(quantityValue(match[4]) * factor)}` : "";
  return `${prefix}${formatQuantity(first * factor)}${range}${line.slice(match[0].length)}`;
}

type PollenDishTextReference = {
  end: number;
  start: number;
  target: PollenStreetDish;
};

function pollenDishTextReferences(text: string, currentDishSlug?: string) {
  const normalized = text.toLocaleLowerCase();
  const references: PollenDishTextReference[] = [];

  for (const target of [...pollenStreetDishes].sort((a, b) => b.title.length - a.title.length)) {
    if (target.slug === currentDishSlug || target.title.length < 7) continue;
    const title = target.title.toLocaleLowerCase();
    let start = normalized.indexOf(title);
    while (start >= 0) {
      references.push({ end: start + target.title.length, start, target });
      start = normalized.indexOf(title, start + title.length);
    }
  }

  return references
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .filter((reference, index, all) =>
      !all.slice(0, index).some((earlier) => reference.start < earlier.end)
    );
}

function LinkedPollenText({ currentDishSlug, text }: { currentDishSlug?: string; text: string }) {
  const references = pollenDishTextReferences(text, currentDishSlug);
  if (references.length === 0) return text;

  const result: ReactNode[] = [];
  let cursor = 0;
  references.forEach((reference, index) => {
    if (reference.start > cursor) result.push(text.slice(cursor, reference.start));
    result.push(
      <a
        className="font-semibold text-moss underline decoration-moss/25 underline-offset-2 transition hover:decoration-moss/70"
        href={`#dish-${reference.target.slug}`}
        key={`${reference.target.slug}-${reference.start}-${index}`}
        title={`Open ${reference.target.title}`}
      >
        {text.slice(reference.start, reference.end)}
      </a>,
    );
    cursor = reference.end;
  });
  if (cursor < text.length) result.push(text.slice(cursor));
  return result;
}

function Chevron({ open, small = false }: { open: boolean; small?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`${small ? "h-3 w-3" : "h-4 w-4"} shrink-0 text-ink/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IngredientList({ currentDishSlug, ingredients, factor }: { currentDishSlug?: string; ingredients: string[]; factor: number }) {
  return (
    <ul className="divide-y divide-ink/[0.07] border-y border-ink/[0.07]">
      {ingredients.map((ingredient, index) => (
        <li className="flex gap-2.5 py-2 text-[0.82rem] leading-5 text-ink/68" key={`${ingredient}-${index}`}>
          <span aria-hidden="true" className="mt-[0.46rem] h-1 w-1 shrink-0 rounded-full bg-moss/55" />
          <span><LinkedPollenText currentDishSlug={currentDishSlug} text={scaleIngredient(ingredient, factor)} /></span>
        </li>
      ))}
    </ul>
  );
}

function MethodList({ currentDishSlug, steps }: { currentDishSlug?: string; steps: string[] }) {
  return (
    <ol className="grid gap-3">
      {steps.map((step, index) => (
        <li className="flex gap-3 text-[0.82rem] leading-6 text-ink/65" key={`${step}-${index}`}>
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/15 text-[0.63rem] font-semibold text-ink/48">
            {index + 1}
          </span>
          <span><LinkedPollenText currentDishSlug={currentDishSlug} text={step} /></span>
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
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/45">
          Scale recipe ×
        </span>
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
      <div className="flex gap-1.5" aria-label="Scale presets">
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

function BasicRecipeContents({ recipe, factor }: { recipe: PollenStreetBasic; factor: number }) {
  return (
    <div className="grid gap-5">
      {recipe.yield && <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-moss">{recipe.yield}</p>}
      <div>
        <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/40">Ingredients</p>
        <IngredientList factor={factor} ingredients={recipe.ingredients} />
      </div>
      <div>
        <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/40">Method</p>
        <MethodList steps={recipe.method} />
      </div>
    </div>
  );
}

function BasicRecipeCard({ recipe, open, onToggle }: { recipe: PollenStreetBasic; open: boolean; onToggle: () => void }) {
  const [factorText, setFactorText] = useState("1");
  const parsed = Number.parseFloat(factorText);
  const factor = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  return (
    <article className="mb-3 break-inside-avoid overflow-hidden rounded-[1.25rem] border border-ink/10 bg-paper/70" id={`basic-${recipe.slug}`}>
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-surface/45"
        onClick={onToggle}
        type="button"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold tracking-tight">{recipe.name}</span>
          <span className="mt-0.5 block text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink/38">
            {recipe.ingredients.length} ingredients{recipe.yield ? ` · ${recipe.yield}` : ""}
          </span>
        </span>
        <Chevron open={open} small />
      </button>
      {open && (
        <div className="grid gap-4 border-t border-ink/[0.07] px-4 pb-4 pt-3">
          <ScaleControl onChange={setFactorText} value={factorText} />
          <BasicRecipeContents factor={factor} recipe={recipe} />
        </div>
      )}
    </article>
  );
}

function BasicsPanel({ query }: { query: string }) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(pollenStreetCategories.map((category) => [category.id, true])),
  );
  const [openRecipes, setOpenRecipes] = useState<Record<string, boolean>>({});
  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery = (recipe: PollenStreetBasic) => !normalizedQuery || `${recipe.name} ${recipe.yield ?? ""} ${recipe.ingredients.join(" ")}`.toLowerCase().includes(normalizedQuery);

  const setAll = (open: boolean) => {
    setOpenSections(Object.fromEntries(pollenStreetCategories.map((category) => [category.id, open])));
    setOpenRecipes(Object.fromEntries(pollenStreetBasics.map((recipe) => [recipe.slug, open])));
  };

  useEffect(() => {
    const openHashRecipe = () => {
      const hash = window.location.hash.slice(1);
      if (!hash.startsWith("basic-")) return;
      const slug = hash.slice("basic-".length);
      const recipe = pollenStreetBasicsBySlug.get(slug);
      if (!recipe) return;
      setOpenSections((current) => ({ ...current, [recipe.category]: true }));
      setOpenRecipes((current) => ({ ...current, [slug]: true }));
      window.requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    openHashRecipe();
    window.addEventListener("hashchange", openHashRecipe);
    return () => window.removeEventListener("hashchange", openHashRecipe);
  }, []);

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Pollen Street Basics categories" className="flex flex-wrap gap-2">
          {pollenStreetCategories.map((category) => (
            <a
              className="rounded-full border border-ink/12 bg-surface/60 px-3 py-1.5 text-xs font-semibold text-ink/58 transition hover:border-ink/25 hover:text-ink"
              href={`#pollen-${category.id}`}
              key={category.id}
            >
              {category.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 gap-2">
          <button className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/55" onClick={() => setAll(true)} type="button">
            Expand all
          </button>
          <button className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/55" onClick={() => setAll(false)} type="button">
            Collapse all
          </button>
        </div>
      </div>

      {pollenStreetCategories.map((category) => {
        const recipes = pollenStreetBasicsByCategory(category.id).filter(matchesQuery);
        const open = Boolean(openSections[category.id]);
        return (
          <section className="scroll-mt-24" id={`pollen-${category.id}`} key={category.id}>
            <button
              aria-expanded={open}
              className="flex w-full items-end justify-between gap-4 border-b border-ink/10 pb-3 text-left"
              onClick={() => setOpenSections((current) => ({ ...current, [category.id]: !current[category.id] }))}
              type="button"
            >
              <span>
                <span className="eyebrow">{recipes.length} recipes</span>
                <span className="mt-2 block text-2xl font-semibold tracking-tight">{category.label}</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="hidden max-w-xs text-right text-xs leading-5 text-ink/45 sm:block">{category.blurb}</span>
                <Chevron open={open} />
              </span>
            </button>
            {open && (
              <div className="mt-4 gap-3 sm:columns-2 xl:columns-3 [column-fill:balance]">
                {recipes.map((recipe) => (
                  <BasicRecipeCard
                    key={recipe.slug}
                    onToggle={() => setOpenRecipes((current) => ({ ...current, [recipe.slug]: !current[recipe.slug] }))}
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

function DishComponent({ currentDishSlug, section, factor }: { currentDishSlug: string; section: PollenStreetDishSection; factor: number }) {
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
          <span className="text-sm font-semibold tracking-tight">{section.name}</span>
          <span className="ml-2 text-[0.63rem] font-semibold uppercase tracking-[0.1em] text-ink/35">
            {section.ingredients.length} ingredients · {section.steps.length} steps
          </span>
        </span>
        <Chevron open={open} small />
      </button>
      {open && (
        <div className="grid gap-5 border-t border-ink/[0.07] px-4 py-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          {section.ingredients.length > 0 && (
            <div>
              <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/40">Ingredients</p>
              <IngredientList currentDishSlug={currentDishSlug} factor={factor} ingredients={section.ingredients} />
            </div>
          )}
          <div className={section.ingredients.length === 0 ? "md:col-span-2" : ""}>
            <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/40">Method</p>
            <MethodList currentDishSlug={currentDishSlug} steps={section.steps} />
          </div>
        </div>
      )}
    </section>
  );
}

function ReferencedBasics({ slugs, factor }: { slugs: string[]; factor: number }) {
  const recipes = slugs.flatMap((slug) => {
    const recipe = pollenStreetBasicsBySlug.get(slug);
    return recipe ? [recipe] : [];
  });
  if (recipes.length === 0) return null;

  return (
    <section className="rounded-[1.4rem] border border-moss/20 bg-lime/25 p-4 sm:p-5">
      <p className="eyebrow">Called-for basics</p>
      <h4 className="mt-2 text-lg font-semibold tracking-tight">Foundation recipes used in this dish</h4>
      <p className="mt-1 text-xs leading-5 text-ink/50">These quantities follow the dish&apos;s scale setting above.</p>
      <div className="mt-4 grid gap-2">
        {recipes.map((recipe) => (
          <details className="group overflow-hidden rounded-xl border border-ink/10 bg-paper/70" key={recipe.slug}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
              <span className="text-sm font-semibold">{recipe.name}</span>
              <span className="text-xs text-ink/35 transition group-open:rotate-45">+</span>
            </summary>
            <div className="border-t border-ink/[0.07] px-4 py-4">
              <BasicRecipeContents factor={factor} recipe={recipe} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function DishCard({ dish, index, open, onToggle }: { dish: PollenStreetDish; index: number; open: boolean; onToggle: () => void }) {
  const [factorText, setFactorText] = useState("1");
  const parsed = Number.parseFloat(factorText);
  const factor = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  const calledForDishes = [...new Map(
    dish.sections
      .flatMap((section) => [...section.ingredients, ...section.steps])
      .flatMap((text) => pollenDishTextReferences(text, dish.slug))
      .map((reference) => [reference.target.slug, reference.target]),
  ).values()];
  return (
    <article className="cookbook-rail-card recipe-card scroll-mt-24 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-surface/55 p-3 transition" id={`dish-${dish.slug}`}>
      <CookbookRecipeCardSummary description={dish.subtitle} fallbackMark="POLLEN STREET" image={dish.images[0] ?? null} imageAlt={`${dish.title}, plated dish`} index={index} meta={`${dish.sections.length} components`} onToggle={onToggle} open={open} title={dish.title} />

      {open && (
        <div className="mt-3 grid gap-5 border-t border-ink/[0.07] p-4 sm:p-5">
          {dish.images.length > 0 ? (
            <div className={`mx-auto grid w-full max-w-lg gap-2.5 overflow-hidden rounded-[1.15rem] ${dish.images.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {dish.images.map((source, imageIndex) => (
                <RecipeImageViewer
                  alt={`${dish.title}, plated dish${dish.images.length > 1 ? `, view ${imageIndex + 1}` : ""}`}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-paper"
                  key={source}
                  src={source}
                >
                  <Image
                    alt={`${dish.title}, plated dish${dish.images.length > 1 ? `, view ${imageIndex + 1}` : ""}`}
                    className="object-cover"
                    fill
                    sizes={dish.images.length > 1 ? "(max-width: 640px) 88vw, 16rem" : "(max-width: 640px) 88vw, 32rem"}
                    src={source}
                  />
                </RecipeImageViewer>
              ))}
            </div>
          ) : (
            <div className="grid min-h-44 place-items-center rounded-[1.3rem] border border-dashed border-ink/15 bg-gradient-to-br from-mist/35 to-lime/25 p-6 text-center">
              <div>
                <span className="text-2xl font-semibold tracking-[-0.08em] text-ink/28">PS</span>
                <p className="mt-2 text-xs leading-5 text-ink/43">No separate plated-dish photograph was present in the supplied sequence.</p>
              </div>
            </div>
          )}

          <header>
            <p className="eyebrow">{dish.yield ?? "Pollen Street recipe"}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{dish.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/55">{dish.subtitle}</p>
          </header>

          <ScaleControl onChange={setFactorText} value={factorText} />

          {calledForDishes.length > 0 && (
            <nav aria-label={`Recipes called for by ${dish.title}`} className="rounded-[1.2rem] border border-moss/20 bg-lime/25 p-4 sm:p-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-moss">Called-for recipes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {calledForDishes.map((target) => (
                  <a
                    className="rounded-full border border-moss/20 bg-paper/75 px-3 py-1.5 text-[0.72rem] font-semibold text-moss transition hover:border-moss/45"
                    href={`#dish-${target.slug}`}
                    key={target.slug}
                  >
                    {target.title}
                  </a>
                ))}
              </div>
            </nav>
          )}

          <div className="grid gap-3">
            {dish.sections.map((section) => (
              <DishComponent currentDishSlug={dish.slug} factor={factor} key={section.name} section={section} />
            ))}
          </div>

          <ReferencedBasics factor={factor} slugs={dish.basicReferences} />
        </div>
      )}
    </article>
  );
}

function DishesPanel({ query }: { query: string }) {
  const [openDishes, setOpenDishes] = useState<Record<string, boolean>>({});
  const [layout, setLayout] = useState<"categories" | "all">("categories");
  const filteredDishes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return pollenStreetDishes;
    return pollenStreetDishes.filter((dish) =>
      `${dish.title} ${dish.subtitle} ${dish.sections.map((section) => section.name).join(" ")}`.toLowerCase().includes(needle),
    );
  }, [query]);
  const groups = [
    { title: "Bites", start: 0, end: 2 },
    { title: "Seafood", start: 3, end: 12 },
    { title: "Meat", start: 13, end: 21 },
    { title: "Dessert", start: 22, end: 28 },
  ];

  useEffect(() => {
    const openHashDish = () => {
      const hash = window.location.hash.slice(1);
      if (!hash.startsWith("dish-")) return;
      const slug = hash.slice("dish-".length);
      if (!pollenStreetDishes.some((dish) => dish.slug === slug)) return;
      setOpenDishes((current) => ({ ...current, [slug]: true }));
      window.requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    openHashDish();
    window.addEventListener("hashchange", openHashDish);
    return () => window.removeEventListener("hashchange", openHashDish);
  }, []);

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm leading-6 text-ink/55">Ordered exactly as photographed, from the earliest image to the latest.</p>
          <p className="mt-1 text-xs text-ink/38">Open an image card for the plated dish, components, full method and any called-for Basics.</p>
        </div>
        <button aria-pressed={layout === "all"} className="hidden h-10 items-center rounded-full border border-ink/12 bg-surface/65 px-4 text-xs font-semibold text-ink/55 transition hover:border-ink/25 hover:text-ink sm:inline-flex" onClick={() => setLayout((current) => current === "categories" ? "all" : "categories")} type="button">{layout === "categories" ? "Expand all" : "Collapse all"}</button>
      </div>

      {layout === "categories" ? <div className="mt-7 grid gap-9">
        {groups.map((group) => {
          const dishes = filteredDishes.filter((dish) => {
            const index = pollenStreetDishes.indexOf(dish);
            return index >= group.start && index <= group.end;
          });
          return (
            <CookbookRecipeRail key={group.title} title={group.title}>
              {dishes.map((dish) => (
                <DishCard
                  dish={dish}
                  index={pollenStreetDishes.indexOf(dish)}
                  key={dish.slug}
                  onToggle={() => setOpenDishes((current) => ({ ...current, [dish.slug]: !current[dish.slug] }))}
                  open={Boolean(openDishes[dish.slug])}
                />
              ))}
            </CookbookRecipeRail>
          );
        })}
      </div> : <div className="mt-5 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDishes.map((dish) => <DishCard dish={dish} index={pollenStreetDishes.indexOf(dish)} key={dish.slug} onToggle={() => setOpenDishes((current) => ({ ...current, [dish.slug]: !current[dish.slug] }))} open={Boolean(openDishes[dish.slug])} />)}
      </div>}

      {filteredDishes.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/45">No recipes match that search.</div>
      )}
    </div>
  );
}

export function PollenStreetGuide() {
  const [view, setView] = useState<"basics" | "recipes">("basics");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const selectHashView = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#dish-")) setView("recipes");
      if (hash.startsWith("#basic-")) setView("basics");
    };
    selectHashView();
    window.addEventListener("hashchange", selectHashView);
    return () => window.removeEventListener("hashchange", selectHashView);
  }, []);

  return (
    <div className="grid gap-7">
      <CookbookSearch bookName="Pollen Street" onChange={setQuery} value={query} />
      <div className="rounded-[1.5rem] border border-ink/10 bg-surface/48 p-2">
        <div aria-label="Pollen Street collections" className="grid grid-cols-2 gap-2">
          <button
            aria-controls="pollen-basics-panel"
            aria-pressed={view === "basics"}
            className={`rounded-[1.1rem] px-4 py-3 text-left transition ${view === "basics" ? "bg-ink text-paper shadow-sm" : "text-ink/55 hover:bg-paper/60 hover:text-ink"}`}
            onClick={() => setView("basics")}
            type="button"
          >
            <span className="block text-sm font-semibold">Pollen Street Basics</span>
            <span className={`mt-0.5 block text-[0.64rem] ${view === "basics" ? "text-paper/60" : "text-ink/35"}`}>{pollenStreetBasics.length} foundation recipes</span>
          </button>
          <button
            aria-controls="pollen-recipes-panel"
            aria-pressed={view === "recipes"}
            className={`rounded-[1.1rem] px-4 py-3 text-left transition ${view === "recipes" ? "bg-ink text-paper shadow-sm" : "text-ink/55 hover:bg-paper/60 hover:text-ink"}`}
            onClick={() => setView("recipes")}
            type="button"
          >
            <span className="block text-sm font-semibold">Pollen Street recipes</span>
            <span className={`mt-0.5 block text-[0.64rem] ${view === "recipes" ? "text-paper/60" : "text-ink/35"}`}>{pollenStreetDishes.length} complete dishes</span>
          </button>
        </div>
      </div>

      {query.trim() ? <div className="grid gap-10"><section id="pollen-basics-panel"><p className="eyebrow mb-4">Basics matches</p><BasicsPanel query={query} /></section><section id="pollen-recipes-panel"><p className="eyebrow mb-4">Recipe matches</p><DishesPanel query={query} /></section></div> : <><div className="min-w-0" hidden={view !== "basics"} id="pollen-basics-panel">{view === "basics" && <BasicsPanel query={query} />}</div><div className="min-w-0" hidden={view !== "recipes"} id="pollen-recipes-panel">{view === "recipes" && <DishesPanel query={query} />}</div></>}
    </div>
  );
}
