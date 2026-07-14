"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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

// The supplied photographs include generous page space below the plated dish.
// Translate each image by the requested proportion of its card height so the
// food sits naturally within the clipped frame on every screen size.
const DISH_IMAGE_Y_OFFSET_CLASSES: Record<string, readonly string[]> = {
  "isle-of-mull-langoustine": ["translate-y-[20%]"],
  "raw-orkney-scallop": ["translate-y-[20%]"],
  "st-austell-bay-lobster": ["translate-y-[20%]"],
  "poached-day-netted-south-coast-sea-bass": ["translate-y-[50%]"],
  "looe-day-boat-turbot": ["translate-y-[20%]"],
  "poached-south-coast-john-dory": ["translate-y-[20%]"],
  "brixham-day-boat-brill": ["translate-y-[10%]"],
  "newlyn-line-caught-sea-bass": ["translate-y-[15%]", "translate-y-[15%]"],
  "cumbrian-suckling-pig": ["translate-y-[15%]"],
  "braised-west-country-ox-cheek": ["translate-y-[10%]"],
  "40-day-dry-aged-lake-district-beef-fillet": ["translate-y-[10%]"],
  "roasted-squab-pigeon": ["translate-y-[50%]"],
  "ribble-valley-chicken": ["translate-y-[15%]", "translate-y-[15%]"],
  "game-pithivier": ["translate-y-[30%]"],
  "salad-of-wild-duck": ["translate-y-[50%]", "translate-y-[50%]"],
  "soy-glazed-norfolk-quail": ["translate-y-[25%]"],
  "pistachio-souffle": ["translate-y-[20%]"],
  "brogdale-pear": ["translate-y-[50%]"],
  "bitter-chocolate-pave": ["translate-y-[20%]"],
  "wild-strawberries": ["translate-y-[20%]"],
  "clementine-almond-macarons": ["translate-y-[60%]"],
};

function dishImageYOffsetClass(slug: string, imageIndex: number) {
  const offsets = DISH_IMAGE_Y_OFFSET_CLASSES[slug];
  return offsets?.[imageIndex] ?? offsets?.[0] ?? "translate-y-0";
}

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

function IngredientList({ ingredients, factor }: { ingredients: string[]; factor: number }) {
  return (
    <ul className="divide-y divide-ink/[0.07] border-y border-ink/[0.07]">
      {ingredients.map((ingredient, index) => (
        <li className="flex gap-2.5 py-2 text-[0.82rem] leading-5 text-ink/68" key={`${ingredient}-${index}`}>
          <span aria-hidden="true" className="mt-[0.46rem] h-1 w-1 shrink-0 rounded-full bg-moss/55" />
          <span>{scaleIngredient(ingredient, factor)}</span>
        </li>
      ))}
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

function BasicsPanel() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(pollenStreetCategories.map((category) => [category.id, true])),
  );
  const [openRecipes, setOpenRecipes] = useState<Record<string, boolean>>({});

  const setAll = (open: boolean) => {
    setOpenSections(Object.fromEntries(pollenStreetCategories.map((category) => [category.id, open])));
    setOpenRecipes(Object.fromEntries(pollenStreetBasics.map((recipe) => [recipe.slug, open])));
  };

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
        const recipes = pollenStreetBasicsByCategory(category.id);
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

function DishComponent({ section, factor }: { section: PollenStreetDishSection; factor: number }) {
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
              <IngredientList factor={factor} ingredients={section.ingredients} />
            </div>
          )}
          <div className={section.ingredients.length === 0 ? "md:col-span-2" : ""}>
            <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/40">Method</p>
            <MethodList steps={section.steps} />
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
  const ingredientCount = dish.sections.reduce((total, section) => total + section.ingredients.length, 0);

  return (
    <article className="overflow-hidden rounded-[1.45rem] border border-ink/10 bg-paper/72" id={`dish-${dish.slug}`}>
      <button
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface/45 sm:px-5"
        onClick={onToggle}
        type="button"
      >
        <span className="w-6 shrink-0 font-mono text-[0.62rem] text-ink/30">{String(index + 1).padStart(2, "0")}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold tracking-tight sm:text-[0.95rem]">{dish.title}</span>
          <span className="mt-0.5 hidden truncate text-[0.68rem] text-ink/43 sm:block">{dish.subtitle}</span>
        </span>
        <span className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-ink/35 sm:block">
          {dish.sections.length} {dish.sections.length === 1 ? "component" : "components"} · {ingredientCount} ingredients
        </span>
        <Chevron open={open} small />
      </button>

      {open && (
        <div className="grid gap-5 border-t border-ink/[0.07] p-4 sm:p-5">
          {dish.images.length > 0 ? (
            <div className={`mx-auto grid w-full max-w-3xl gap-3 overflow-hidden rounded-[1.3rem] ${dish.images.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {dish.images.map((source, imageIndex) => (
                <div className="relative aspect-[4/3] overflow-hidden bg-paper" key={source}>
                  <Image
                    alt={`${dish.title}, plated dish${dish.images.length > 1 ? `, view ${imageIndex + 1}` : ""}`}
                    className={`object-cover ${dishImageYOffsetClass(dish.slug, imageIndex)}`}
                    fill
                    sizes={dish.images.length > 1 ? "(max-width: 640px) 92vw, 24rem" : "(max-width: 1024px) 92vw, 48rem"}
                    src={source}
                  />
                </div>
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

          <div className="grid gap-3">
            {dish.sections.map((section) => (
              <DishComponent factor={factor} key={section.name} section={section} />
            ))}
          </div>

          <ReferencedBasics factor={factor} slugs={dish.basicReferences} />
        </div>
      )}
    </article>
  );
}

function DishesPanel() {
  const [query, setQuery] = useState("");
  const [openDishes, setOpenDishes] = useState<Record<string, boolean>>({});
  const filteredDishes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return pollenStreetDishes;
    return pollenStreetDishes.filter((dish) =>
      `${dish.title} ${dish.subtitle} ${dish.sections.map((section) => section.name).join(" ")}`.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm leading-6 text-ink/55">Ordered exactly as photographed, from the earliest image to the latest.</p>
          <p className="mt-1 text-xs text-ink/38">Open a compact row for the plated dish, components, full method and any called-for Basics.</p>
        </div>
        <label className="relative block sm:w-72">
          <span className="sr-only">Search Pollen Street recipes</span>
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

      <div className="mt-5 grid gap-2">
        {filteredDishes.map((dish) => (
          <DishCard
            dish={dish}
            index={pollenStreetDishes.indexOf(dish)}
            key={dish.slug}
            onToggle={() => setOpenDishes((current) => ({ ...current, [dish.slug]: !current[dish.slug] }))}
            open={Boolean(openDishes[dish.slug])}
          />
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/45">No recipes match that search.</div>
      )}
    </div>
  );
}

export function PollenStreetGuide() {
  const [view, setView] = useState<"basics" | "recipes">("basics");

  return (
    <div className="grid gap-7">
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

      <div
        hidden={view !== "basics"}
        id="pollen-basics-panel"
      >
        {view === "basics" && <BasicsPanel />}
      </div>
      <div
        hidden={view !== "recipes"}
        id="pollen-recipes-panel"
      >
        {view === "recipes" && <DishesPanel />}
      </div>
    </div>
  );
}
