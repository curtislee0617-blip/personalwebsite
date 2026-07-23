"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CookbookRecipeCardSummary } from "@/components/cookbook-recipe-card-summary";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import { CookbookRecipeRail } from "@/components/cookbook-recipe-rail";
import { CookbookSearch } from "@/components/cookbook-search";
import { bachourPastryCategories, bachourPastryRecipes, bachourRecipes, type BachourPastryRecipe, type BachourRecipe, type BachourRecipeComponent } from "@/lib/bachour";
import { normalizeNumericInputText } from "@/lib/numeric-input";

const FRACTIONS: Record<string, number> = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875 };
const QUANTITY = String.raw`(?:\d+\s*[½¼¾⅓⅔⅛⅜⅝⅞]|\d+(?:\.\d+)?|[½¼¾⅓⅔⅛⅜⅝⅞])`;
const SCALABLE_QUANTITY = new RegExp(String.raw`(${QUANTITY})(?=\s*(?:\(|kg|g|ml|liters?|cups?|tablespoons?|teaspoons?|ounces?|pounds?|sticks?|large\b|eggs?\b|sheets?\b|beans?\b|apples?\b|croissants?\b|tarts?\b|pieces?\b))`, "gi");

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
  return line.replace(SCALABLE_QUANTITY, (quantity) => {
    const value = quantityValue(quantity);
    return Number.isFinite(value) ? formatQuantity(value * factor) : quantity;
  });
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" className={`h-3 w-3 shrink-0 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
          <button aria-pressed={factor === preset} className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold transition ${factor === preset ? "border-moss bg-moss text-paper" : "border-ink/12 text-ink/50 hover:border-ink/25"}`} key={preset} onClick={() => onChange(String(preset))} type="button">
            {preset}×
          </button>
        ))}
      </div>
    </div>
  );
}

function RecipeComponent({ component, factor }: { component: BachourRecipeComponent; factor: number }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="overflow-hidden rounded-[1.15rem] border border-ink/10 bg-paper/65">
      <button aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setOpen((current) => !current)} type="button">
        <span>
          <span className="text-sm font-semibold tracking-tight">{component.name}</span>
          <span className="ml-2 text-[0.63rem] font-semibold uppercase tracking-[0.1em] text-ink/35">{component.ingredients.length} ingredients · {component.steps.length} {component.steps.length === 1 ? "step" : "steps"}</span>
        </span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="grid gap-5 border-t border-ink/[0.07] px-4 py-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/40">Ingredients</p>
            <ul className="divide-y divide-ink/[0.07] border-y border-ink/[0.07]">
              {component.ingredients.map((ingredient, index) => (
                <li className="flex gap-2.5 py-2 text-[0.82rem] leading-5 text-ink/68" key={`${ingredient}-${index}`}>
                  <span aria-hidden="true" className="mt-[0.46rem] h-1 w-1 shrink-0 rounded-full bg-moss/55" />
                  <span>{scaleIngredient(ingredient, factor)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/40">Method</p>
            <ol className="grid gap-3">
              {component.steps.map((step, index) => (
                <li className="flex gap-3 text-[0.82rem] leading-6 text-ink/65" key={`${step}-${index}`}>
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/15 text-[0.63rem] font-semibold text-ink/48">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}

function SourceLinks({ recipe }: { recipe: BachourPastryRecipe }) {
  return (
    <details className="group rounded-[1.05rem] border border-ink/10 bg-paper/65">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/48">Exact source pages</span>
        <span className="text-xs text-ink/35 transition group-open:rotate-45">+</span>
      </summary>
      <div className="flex flex-wrap gap-2 border-t border-ink/[0.07] p-4">
        {recipe.sourceImages.map((source, index) => (
          <RecipeImageViewer alt={`${recipe.title}, source PDF page ${recipe.sourcePages[index]}`} className="inline-flex items-center rounded-full border border-moss/20 px-2.5 py-1.5 text-[0.68rem] font-semibold text-moss" key={source} src={source}>
            PDF page {recipe.sourcePages[index]}
          </RecipeImageViewer>
        ))}
      </div>
    </details>
  );
}

function RecipeCard({ recipe, index, open, onToggle, collection = "original" }: { recipe: BachourRecipe | BachourPastryRecipe; index: number; open: boolean; onToggle: () => void; collection?: "original" | "baker" }) {
  const [factorText, setFactorText] = useState("1");
  const parsed = Number.parseFloat(factorText);
  const factor = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  const isBaker = collection === "baker";
  const cardId = `${isBaker ? "bachour-baker" : "bachour"}-${recipe.slug}`;
  return (
    <article className="cookbook-rail-card recipe-card scroll-mt-24 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-surface/55 p-3 transition" id={cardId}>
      <CookbookRecipeCardSummary description={`Yield: ${recipe.yield}`} fallbackMark="BACHOUR" image={recipe.image} imageAlt={`${recipe.title}, finished pastry`} imagePosition={recipe.imagePosition} index={index} meta={`${recipe.components.length} components`} onToggle={onToggle} open={open} title={recipe.title} />

      {open && (
        <div className="mt-3 grid gap-5 border-t border-ink/[0.07] p-4 sm:p-5">
          {recipe.image && (
            <RecipeImageViewer alt={`${recipe.title}, finished pastry`} className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-[1.15rem] bg-paper" src={recipe.image}>
              <Image alt={`${recipe.title}, finished pastry`} className="object-cover" fill sizes="(max-width: 640px) 88vw, 32rem" src={recipe.image} style={{ objectPosition: recipe.imagePosition ?? "50% 50%" }} unoptimized />
            </RecipeImageViewer>
          )}
          <header>
            <p className="eyebrow">{isBaker ? `Bachour the Baker · PDF page ${(recipe as BachourPastryRecipe).pdfPage}` : "Antonio Bachour recipe"}</p>
            <h3 className="mt-2 max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl">{recipe.title}</h3>
            <p className="mt-2 text-sm text-ink/50">Original yield: {recipe.yield}</p>
          </header>
          {recipe.sourceNote && <div className="rounded-2xl border border-amber-700/15 bg-amber-100/35 px-4 py-3 text-sm leading-6 text-ink/60">{recipe.sourceNote}</div>}
          <ScaleControl onChange={setFactorText} value={factorText} />
          <div className="grid gap-3">
            {recipe.components.map((component, componentIndex) => <RecipeComponent component={component} factor={factor} key={`${component.name}-${componentIndex}`} />)}
          </div>
          {isBaker && <SourceLinks recipe={recipe as BachourPastryRecipe} />}
        </div>
      )}
    </article>
  );
}

export function BachourGuide() {
  const [view, setView] = useState<"original" | "baker">("original");
  const [query, setQuery] = useState("");
  const [openRecipes, setOpenRecipes] = useState<Record<string, boolean>>({});
  const matches = useCallback((recipe: BachourRecipe) => {
    const needle = query.trim().toLocaleLowerCase();
    return !needle || [recipe.title, recipe.yield, ...recipe.components.flatMap((component) => [component.name, ...component.ingredients])].join(" ").toLocaleLowerCase().includes(needle);
  }, [query]);
  const filteredOriginal = useMemo(() => bachourRecipes.filter(matches), [matches]);
  const filteredBaker = useMemo(() => bachourPastryRecipes.filter(matches), [matches]);
  const searching = Boolean(query.trim());

  useEffect(() => {
    const openHashRecipe = () => {
      const hash = window.location.hash.slice(1);
      const isBaker = hash.startsWith("bachour-baker-");
      const prefix = isBaker ? "bachour-baker-" : "bachour-";
      if (!hash.startsWith(prefix)) return;
      const slug = hash.slice(prefix.length);
      const recipes = isBaker ? bachourPastryRecipes : bachourRecipes;
      if (!recipes.some((recipe) => recipe.slug === slug)) return;
      setQuery("");
      setView(isBaker ? "baker" : "original");
      setOpenRecipes((current) => ({ ...current, [`${isBaker ? "baker" : "original"}-${slug}`]: true }));
      window.requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    openHashRecipe();
    window.addEventListener("hashchange", openHashRecipe);
    return () => window.removeEventListener("hashchange", openHashRecipe);
  }, []);

  const recipeKey = (recipe: BachourRecipe, collection: "original" | "baker") => `${collection}-${recipe.slug}`;
  const renderOriginal = (recipe: BachourRecipe) => {
    const key = recipeKey(recipe, "original");
    return <RecipeCard index={bachourRecipes.indexOf(recipe)} key={key} onToggle={() => setOpenRecipes((current) => ({ ...current, [key]: !current[key] }))} open={Boolean(openRecipes[key])} recipe={recipe} />;
  };
  const renderBaker = (recipe: BachourPastryRecipe) => {
    const key = recipeKey(recipe, "baker");
    return <RecipeCard collection="baker" index={bachourPastryRecipes.indexOf(recipe)} key={key} onToggle={() => setOpenRecipes((current) => ({ ...current, [key]: !current[key] }))} open={Boolean(openRecipes[key])} recipe={recipe} />;
  };

  const displayed = searching ? [...filteredOriginal.map((recipe) => recipeKey(recipe, "original")), ...filteredBaker.map((recipe) => recipeKey(recipe, "baker"))] : view === "original" ? filteredOriginal.map((recipe) => recipeKey(recipe, "original")) : filteredBaker.map((recipe) => recipeKey(recipe, "baker"));
  const allOpen = displayed.length > 0 && displayed.every((key) => openRecipes[key]);
  const toggleAll = () => setOpenRecipes((current) => ({ ...current, ...Object.fromEntries(displayed.map((key) => [key, !allOpen])) }));

  const originalPanel = (
    <section>
      <div className="flex items-start justify-between gap-4">
        <p className="max-w-2xl text-sm leading-6 text-ink/55">The original supplied collection of entremets, tarts, choux and plated pastries.</p>
        {!searching && <button className="hidden rounded-full border border-ink/12 px-4 py-2 text-xs font-semibold text-ink/55 sm:block" onClick={toggleAll} type="button">{allOpen ? "Collapse all" : "Expand all"}</button>}
      </div>
      <CookbookRecipeRail title="Antonio Bachour recipes">{filteredOriginal.map(renderOriginal)}</CookbookRecipeRail>
    </section>
  );

  const bakerPanel = (
    <section>
      <div className="flex items-start justify-between gap-4">
        <p className="max-w-2xl text-sm leading-6 text-ink/55">All 67 pastry recipes and foundations from <em>Bachour the Baker</em>, grouped by pastry family and paired with their exact PDF pages.</p>
        {!searching && <button className="hidden rounded-full border border-ink/12 px-4 py-2 text-xs font-semibold text-ink/55 sm:block" onClick={toggleAll} type="button">{allOpen ? "Collapse all" : "Expand all"}</button>}
      </div>
      <div className="mt-6 grid gap-10">
        {bachourPastryCategories.map((category) => {
          const recipes = filteredBaker.filter((recipe) => recipe.category === category);
          return <CookbookRecipeRail key={category} title={category}>{recipes.map(renderBaker)}</CookbookRecipeRail>;
        })}
      </div>
    </section>
  );

  return (
    <div className="grid min-w-0 gap-7">
      <CookbookSearch bookName="Bachour" onChange={setQuery} value={query} />
      <div className="rounded-[1.5rem] border border-ink/10 bg-surface/48 p-2">
        <div aria-label="Bachour collections" className="grid grid-cols-2 gap-2">
          <button aria-pressed={view === "original"} className={`rounded-[1.1rem] px-4 py-3 text-left ${view === "original" ? "bg-ink text-paper" : "text-ink/55 hover:bg-paper/60"}`} onClick={() => setView("original")} type="button"><span className="block text-sm font-semibold">Bachour recipes</span><span className={`mt-0.5 block text-[0.64rem] ${view === "original" ? "text-paper/60" : "text-ink/35"}`}>{bachourRecipes.length} supplied pastries</span></button>
          <button aria-pressed={view === "baker"} className={`rounded-[1.1rem] px-4 py-3 text-left ${view === "baker" ? "bg-ink text-paper" : "text-ink/55 hover:bg-paper/60"}`} onClick={() => setView("baker")} type="button"><span className="block text-sm font-semibold">Bachour the Baker · Pastries</span><span className={`mt-0.5 block text-[0.64rem] ${view === "baker" ? "text-paper/60" : "text-ink/35"}`}>{bachourPastryRecipes.length} recipes and foundations</span></button>
        </div>
      </div>
      {searching ? <div className="grid gap-12"><div><p className="eyebrow mb-4">Original collection matches</p>{originalPanel}</div><div><p className="eyebrow mb-4">Bachour the Baker matches</p>{bakerPanel}</div></div> : view === "original" ? originalPanel : bakerPanel}
      {filteredOriginal.length === 0 && filteredBaker.length === 0 && <div className="rounded-2xl border border-dashed border-ink/15 px-5 py-8 text-center text-sm text-ink/45">No Bachour recipes match “{query}”.</div>}
    </div>
  );
}
