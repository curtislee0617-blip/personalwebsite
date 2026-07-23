"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CookbookRecipeCardSummary } from "@/components/cookbook-recipe-card-summary";
import { CookbookRecipeRail } from "@/components/cookbook-recipe-rail";
import { CookbookSearch } from "@/components/cookbook-search";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import { normalizeNumericInputText } from "@/lib/numeric-input";
import { operaBasics, operaBasicsBySlug, operaCategories, operaRecipes, type OperaBasic, type OperaComponent, type OperaRecipe } from "@/lib/opera";

const FRACTIONS: Record<string, number> = { "⅛": 0.125, "¼": 0.25, "⅓": 1 / 3, "⅜": 0.375, "½": 0.5, "⅝": 0.625, "⅔": 2 / 3, "¾": 0.75, "⅞": 0.875 };
const SCALABLE_QUANTITY = /(\d+\s*[⅛¼⅓⅜½⅝⅔¾⅞]|\d+(?:\.\d+)?|[⅛¼⅓⅜½⅝⅔¾⅞])(?=\s*(?:\(|kg|g|ml|liters?|cups?|tablespoons?|teaspoons?|cakes?|sticks?|ounces?|pounds?|large\b|eggs?\b|sheets?\b|beans?\b|apples?\b|peaches?\b|mangoes?\b|apricots?\b|raspberries?\b|blackberries?\b|lemons?\b|limes?\b|oranges?\b))/gi;

function quantityValue(raw: string) {
  const fraction = raw.match(/[⅛¼⅓⅜½⅝⅔¾⅞]/)?.[0];
  if (!fraction) return Number.parseFloat(raw);
  const whole = raw.replace(fraction, "").trim();
  return (whole ? Number.parseFloat(whole) : 0) + FRACTIONS[fraction];
}

function formatQuantity(value: number) {
  if (Math.abs(value) >= 100) return String(Math.round(value));
  if (Math.abs(value) >= 10) return String(Math.round(value * 10) / 10);
  return String(Math.round(value * 100) / 100);
}

function scaleIngredient(line: string, factor: number) {
  if (factor === 1) return line;
  return line.replace(SCALABLE_QUANTITY, (quantity) => formatQuantity(quantityValue(quantity) * factor));
}

function ScaleControl({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const factor = Number(value) > 0 ? Number(value) : 1;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-surface/55 p-3">
      <label className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/45">
        Scale recipe ×
        <input aria-label="Recipe scale multiplier" className="h-8 w-20 rounded-lg border border-ink/15 bg-paper/80 px-2 text-sm outline-none" inputMode="decimal" min={0} onChange={(event) => onChange(normalizeNumericInputText(event.currentTarget.value))} onFocus={(event) => event.currentTarget.select()} step="any" type="number" value={value} />
      </label>
      <div className="flex gap-1.5">
        {[0.5, 1, 2, 3].map((preset) => <button aria-pressed={factor === preset} className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold ${factor === preset ? "border-moss bg-moss text-paper" : "border-ink/12 text-ink/50"}`} key={preset} onClick={() => onChange(String(preset))} type="button">{preset}×</button>)}
      </div>
    </div>
  );
}

function Ingredients({ items, factor }: { items: string[]; factor: number }) {
  if (items.length === 0) return null;
  return <ul className="divide-y divide-ink/[0.07] border-y border-ink/[0.07]">{items.map((item, index) => <li className="py-2 text-[0.8rem] leading-5 text-ink/68" key={`${item}-${index}`}>{scaleIngredient(item, factor)}</li>)}</ul>;
}

function Steps({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return <ol className="grid gap-3">{items.map((item, index) => <li className="flex gap-3 text-[0.8rem] leading-6 text-ink/65" key={`${item}-${index}`}><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/15 text-[0.62rem] font-semibold text-ink/48">{index + 1}</span><span>{item}</span></li>)}</ol>;
}

const BASIC_REFERENCE_ALIASES: Record<string, string> = {
  "puff pastry brioche": "puff-pastry-brioche-dough",
  "puff pastry dough – kneaded butter (beurre manié)": "puff-pastry-dough",
  "simple syrup": "simple-syrup-30-baume",
};

function basicReferenceSlug(componentName: string) {
  const normalized = componentName.toLocaleLowerCase();
  const alias = BASIC_REFERENCE_ALIASES[normalized];
  if (alias) return alias;
  return operaBasics.find((basic) => basic.name.toLocaleLowerCase() === normalized)?.slug;
}

function SourceLinks({ sources, title }: { sources: string[]; title: string }) {
  return <div className="flex flex-wrap gap-2">{sources.map((source, index) => <RecipeImageViewer alt={`${title}, exact source page ${index + 1}`} className="inline-flex items-center rounded-full border border-moss/20 px-2.5 py-1.5 text-[0.68rem] font-semibold text-moss" key={source} src={source}>Source page {index + 1}</RecipeImageViewer>)}</div>;
}

function RecipeComponent({ component, factor }: { component: OperaComponent; factor: number }) {
  const basicSlug = basicReferenceSlug(component.name);
  return (
    <details className="overflow-hidden rounded-[1.05rem] border border-ink/10 bg-paper/65">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">{component.name}<span className="ml-2 text-[0.6rem] uppercase tracking-[0.1em] text-ink/35">{component.ingredients.length} ingredients · {component.steps.length} steps</span></summary>
      <div className="grid gap-4 border-t border-ink/[0.07] px-4 py-4">
        {basicSlug && <a className="w-fit rounded-full border border-moss/20 px-2.5 py-1.5 text-[0.68rem] font-semibold text-moss" href={`#opera-basic-${basicSlug}`}>Open basic recipe ↗</a>}
        <div className="grid gap-5 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]"><Ingredients factor={factor} items={component.ingredients} /><Steps items={component.steps} /></div>
      </div>
    </details>
  );
}

function RecipeCard({ recipe, index, open, onToggle }: { recipe: OperaRecipe; index: number; open: boolean; onToggle: () => void }) {
  const [scale, setScale] = useState("1");
  const factor = Number(scale) > 0 ? Number(scale) : 1;
  return (
    <article className="cookbook-rail-card recipe-card scroll-mt-24 overflow-hidden rounded-[1.4rem] border border-ink/10 bg-surface/55 p-3" id={`opera-${recipe.slug}`}>
      <CookbookRecipeCardSummary description={recipe.meta.join(" · ")} fallbackMark="OPÉRA" image={recipe.image} imageAlt={`${recipe.title}, finished pastry`} index={index} meta={`${recipe.components.length} components`} onToggle={onToggle} open={open} title={recipe.title} />
      {open && <div className="mt-3 grid gap-4 border-t border-ink/[0.07] p-4 sm:p-5">
        <RecipeImageViewer alt={`${recipe.title}, finished pastry`} className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-[1.05rem] bg-paper" src={recipe.image}><Image alt={`${recipe.title}, finished pastry`} className="object-cover" fill sizes="(max-width: 640px) 86vw, 28rem" src={recipe.image} unoptimized /></RecipeImageViewer>
        <header><p className="eyebrow">Opéra Pâtisserie · PDF page {recipe.pdfPage}</p><h3 className="mt-2 text-2xl font-semibold tracking-tight">{recipe.title}</h3><p className="mt-2 text-xs leading-5 text-ink/48">{recipe.meta.join(" · ")}</p></header>
        <ScaleControl onChange={setScale} value={scale} />
        <div className="grid gap-2">{recipe.components.map((component, componentIndex) => <RecipeComponent component={component} factor={factor} key={`${component.name}-${componentIndex}`} />)}</div>
        <SourceLinks sources={recipe.sourceImages} title={recipe.title} />
      </div>}
    </article>
  );
}

function BasicsPanel({ query }: { query: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [scales, setScales] = useState<Record<string, string>>({});
  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => needle ? operaBasics.filter((basic) => `${basic.name} ${basic.group} ${basic.ingredients.join(" ")}`.toLowerCase().includes(needle)) : operaBasics, [needle]);
  const allOpen = filtered.length > 0 && filtered.every((basic) => open[basic.slug]);

  useEffect(() => {
    const openHash = () => {
      const hash = window.location.hash;
      if (!hash.startsWith("#opera-basic-")) return;
      const slug = hash.slice("#opera-basic-".length);
      if (!operaBasicsBySlug.has(slug)) return;
      setOpen((current) => ({ ...current, [slug]: true }));
      window.requestAnimationFrame(() => document.getElementById(`opera-basic-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    openHash();
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);

  const toggleAll = () => setOpen(Object.fromEntries(filtered.map((basic) => [basic.slug, !allOpen])));
  return <div><div className="flex items-start justify-between gap-4"><p className="max-w-2xl text-sm leading-6 text-ink/55">Twenty-two reusable doughs, creams, pralines and finishing recipes from the annex, manually rejoined where the printed methods continue on later pages.</p><button className="hidden rounded-full border border-ink/12 px-4 py-2 text-xs font-semibold text-ink/55 sm:block" onClick={toggleAll} type="button">{allOpen ? "Collapse all" : "Expand all"}</button></div><div className="mt-6 grid gap-8">{(["Doughs", "Creams", "Pralines", "Others"] as OperaBasic["group"][]).map((group) => { const entries = filtered.filter((basic) => basic.group === group); if (!entries.length) return null; return <section key={group}><div className="mb-3 flex items-end justify-between"><h3 className="text-xl font-semibold">{group}</h3><span className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-ink/35">{entries.length} recipes</span></div><div className="gap-3 sm:columns-2 xl:columns-3">{entries.map((basic) => { const isOpen = Boolean(open[basic.slug]); const value = scales[basic.slug] ?? "1"; const factor = Number(value) > 0 ? Number(value) : 1; return <article className="mb-3 break-inside-avoid overflow-hidden rounded-[1.15rem] border border-ink/10 bg-paper/70" id={`opera-basic-${basic.slug}`} key={basic.slug}><button aria-expanded={isOpen} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setOpen((current) => ({ ...current, [basic.slug]: !isOpen }))} type="button"><span><span className="block text-sm font-semibold">{basic.name}</span><span className="mt-0.5 block text-[0.62rem] uppercase tracking-[0.1em] text-ink/35">{basic.ingredients.length} ingredients</span></span><span aria-hidden="true" className={`transition ${isOpen ? "rotate-45" : ""}`}>+</span></button>{isOpen && <div className="grid gap-4 border-t border-ink/[0.07] p-4"><ScaleControl onChange={(next) => setScales((current) => ({ ...current, [basic.slug]: next }))} value={value} /><Ingredients factor={factor} items={basic.ingredients} /><Steps items={basic.method} /><SourceLinks sources={basic.sourcePages} title={basic.name} /></div>}</article>; })}</div></section>; })}</div>{filtered.length === 0 && <p className="rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/45">No Opéra basics match that search.</p>}</div>;
}

function RecipesPanel({ query }: { query: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => needle ? operaRecipes.filter((recipe) => `${recipe.title} ${recipe.meta.join(" ")} ${recipe.components.flatMap((component) => [component.name, ...component.ingredients]).join(" ")}`.toLowerCase().includes(needle)) : operaRecipes, [needle]);
  const allOpen = filtered.length > 0 && filtered.every((recipe) => open[recipe.slug]);

  useEffect(() => {
    const openHash = () => {
      const hash = window.location.hash;
      if (!hash.startsWith("#opera-") || hash.startsWith("#opera-basic-")) return;
      const slug = hash.slice("#opera-".length);
      if (!operaRecipes.some((recipe) => recipe.slug === slug)) return;
      setOpen((current) => ({ ...current, [slug]: true }));
      window.requestAnimationFrame(() => document.getElementById(`opera-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    openHash();
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);

  const toggleAll = () => setOpen(Object.fromEntries(filtered.map((recipe) => [recipe.slug, !allOpen])));
  const renderRecipe = (recipe: OperaRecipe) => <RecipeCard index={operaRecipes.indexOf(recipe)} key={recipe.slug} onToggle={() => setOpen((current) => ({ ...current, [recipe.slug]: !current[recipe.slug] }))} open={Boolean(open[recipe.slug])} recipe={recipe} />;
  return <div className="min-w-0"><div className="flex items-start justify-between gap-4"><p className="max-w-2xl text-sm leading-6 text-ink/55">All 96 recipes, kept in the book&apos;s four time-of-day collections and paired with their finished pastry and exact printed source pages.</p><button className="hidden rounded-full border border-ink/12 px-4 py-2 text-xs font-semibold text-ink/55 sm:block" onClick={toggleAll} type="button">{allOpen ? "Collapse all" : "Expand all"}</button></div><div className="mt-6 grid gap-10">{operaCategories.map((category) => { const entries = filtered.filter((recipe) => recipe.category === category); return <CookbookRecipeRail key={category} title={category}>{entries.map(renderRecipe)}</CookbookRecipeRail>; })}</div>{filtered.length === 0 && <p className="rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/45">No Opéra recipes match that search.</p>}</div>;
}

export function OperaGuide() {
  const [view, setView] = useState<"basics" | "recipes">("recipes");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const chooseView = () => setView(window.location.hash.startsWith("#opera-basic-") ? "basics" : "recipes");
    chooseView();
    window.addEventListener("hashchange", chooseView);
    return () => window.removeEventListener("hashchange", chooseView);
  }, []);
  const searching = Boolean(query.trim());
  return <div className="grid gap-7"><CookbookSearch bookName="Opéra Pâtisserie" onChange={setQuery} value={query} /><div className="rounded-[1.5rem] border border-ink/10 bg-surface/48 p-2"><div aria-label="Opéra Pâtisserie collections" className="grid grid-cols-2 gap-2"><button aria-pressed={view === "basics"} className={`rounded-[1.1rem] px-4 py-3 text-left ${view === "basics" ? "bg-ink text-paper" : "text-ink/55 hover:bg-paper/60"}`} onClick={() => setView("basics")} type="button"><span className="block text-sm font-semibold">Basic recipes</span><span className={`mt-0.5 block text-[0.64rem] ${view === "basics" ? "text-paper/60" : "text-ink/35"}`}>{operaBasics.length} foundations</span></button><button aria-pressed={view === "recipes"} className={`rounded-[1.1rem] px-4 py-3 text-left ${view === "recipes" ? "bg-ink text-paper" : "text-ink/55 hover:bg-paper/60"}`} onClick={() => setView("recipes")} type="button"><span className="block text-sm font-semibold">Opéra recipes</span><span className={`mt-0.5 block text-[0.64rem] ${view === "recipes" ? "text-paper/60" : "text-ink/35"}`}>{operaRecipes.length} complete recipes</span></button></div></div>{searching ? <div className="grid gap-12"><section><p className="eyebrow mb-4">Basic recipe matches</p><BasicsPanel query={query} /></section><section><p className="eyebrow mb-4">Recipe matches</p><RecipesPanel query={query} /></section></div> : view === "basics" ? <BasicsPanel query="" /> : <RecipesPanel query="" />}</div>;
}
