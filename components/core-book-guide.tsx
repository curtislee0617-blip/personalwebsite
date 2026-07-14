"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CookbookRecipeCardSummary } from "@/components/cookbook-recipe-card-summary";
import { CookbookRecipeRail } from "@/components/cookbook-recipe-rail";
import { CoreBasicsGuide } from "@/components/core-basics-guide";
import { coreRecipes } from "@/lib/core-basics";
import { coreDishes, type CoreDish, type CoreIngredientLine } from "@/lib/core-dishes";
import { normalizeNumericInputText } from "@/lib/numeric-input";

const FRACTIONS: Record<string, number> = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875 };
const QUANTITY = /^(about\s+|approximately\s+|scant\s+)?(\d+\s*[½¼¾⅓⅔⅛⅜⅝⅞]|\d+(?:\.\d+)?|[½¼¾⅓⅔⅛⅜⅝⅞])/i;

function numberValue(raw: string) {
  const fraction = raw.match(/[½¼¾⅓⅔⅛⅜⅝⅞]/)?.[0];
  const whole = Number.parseFloat(raw.replace(/[½¼¾⅓⅔⅛⅜⅝⅞]/, "").trim()) || 0;
  return whole + (fraction ? FRACTIONS[fraction] : 0);
}

function displayNumber(value: number) {
  if (Math.abs(value) >= 100) return String(Math.round(value));
  if (Math.abs(value) >= 10) return String(Math.round(value * 10) / 10);
  return String(Math.round(value * 100) / 100);
}

function scaleLine(text: string, factor: number) {
  if (factor === 1) return text;
  const match = text.match(QUANTITY);
  if (!match) return text;
  return `${match[1] ?? ""}${displayNumber(numberValue(match[2]) * factor)}${text.slice(match[0].length)}`;
}

function ScaleControl({ value, onChange }: { value: string; onChange: (value: string) => void }) {
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
          <button className="rounded-full border border-ink/12 px-2.5 py-1 text-[0.68rem] font-semibold text-ink/50 hover:border-ink/25" key={preset} onClick={() => onChange(String(preset))} type="button">
            {preset}×
          </button>
        ))}
      </div>
    </div>
  );
}

function linkedIngredient(text: string): ReactNode {
  const normalized = text.toLowerCase();
  const referenced = coreRecipes.find((recipe) => normalized.includes(recipe.name.toLowerCase()));
  if (!referenced) return text;
  const start = normalized.indexOf(referenced.name.toLowerCase());
  return <>{text.slice(0, start)}<Link className="font-semibold text-moss underline decoration-moss/25 underline-offset-2" href={`#${referenced.slug}`}>{text.slice(start, start + referenced.name.length)}</Link>{text.slice(start + referenced.name.length)}</>;
}

function IngredientColumn({ lines, factor }: { lines: CoreIngredientLine[]; factor: number }) {
  return (
    <div className="min-w-0">
      {lines.map((line, index) => line.heading ? (
        <p className="mb-1 mt-3 text-[0.63rem] font-semibold uppercase tracking-[0.12em] text-ink/48 first:mt-0" key={`${line.text}-${index}`}>{line.text}</p>
      ) : (
        <p className="border-b border-ink/[0.06] py-1.5 text-[0.76rem] leading-5 text-ink/65" key={`${line.text}-${index}`}>{linkedIngredient(scaleLine(line.text, factor))}</p>
      ))}
    </div>
  );
}

function TranscribedPage({ dish, pageIndex, factor }: { dish: CoreDish; pageIndex: number; factor: number }) {
  const page = dish.pages[pageIndex];
  return (
    <section className="rounded-[1.25rem] border border-ink/10 bg-surface/35 p-4 sm:p-5">
      {dish.pages.length > 1 && <p className="mb-4 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink/35">Recipe page {pageIndex + 1}</p>}
      {page.ingredientColumns.length > 0 && (
        <div>
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-moss">Ingredients</p>
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">{page.ingredientColumns.map((column, index) => <IngredientColumn factor={factor} key={index} lines={column} />)}</div>
        </div>
      )}
      <div className={page.ingredientColumns.length ? "mt-6 border-t border-ink/10 pt-5" : ""}>
        <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-moss">Method</p>
        <div className="grid gap-6 lg:grid-cols-2">
          {page.methodColumns.map((column, columnIndex) => (
            <div className="grid content-start gap-4" key={columnIndex}>
              {column.map((section, sectionIndex) => (
                <section key={`${section.heading}-${sectionIndex}`}>
                  {section.heading !== "Continuation" && <h5 className="text-[0.7rem] font-semibold uppercase tracking-[0.11em] text-ink/55">{section.heading}</h5>}
                  <div className={section.heading === "Continuation" ? "" : "mt-1.5"}>{section.paragraphs.map((paragraph, index) => <p className="mt-2 first:mt-0 text-[0.8rem] leading-6 text-ink/64" key={index}>{paragraph}</p>)}</div>
                </section>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DishCard({ dish, index, open, onToggle }: { dish: CoreDish; index: number; open: boolean; onToggle: () => void }) {
  const [factorText, setFactorText] = useState("1");
  const parsed = Number.parseFloat(factorText);
  const factor = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  return (
    <article className={`cookbook-rail-card recipe-card scroll-mt-24 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-surface/55 p-3 transition ${open ? "col-span-full" : ""}`} id={`core-dish-${dish.slug}`}>
      <CookbookRecipeCardSummary description={dish.subtitle} fallbackMark="CORE" image={dish.images[0] ?? null} imageAlt={`${dish.title}, plated dish`} index={index} meta={`${dish.pages.length} ${dish.pages.length === 1 ? "page" : "pages"}`} onToggle={onToggle} open={open} title={dish.title} zoomImage />
      {open && (
        <div className="mt-3 grid gap-5 border-t border-ink/[0.07] p-4 sm:p-5">
          {dish.images.length > 0 ? (
            <div className={`mx-auto grid w-full max-w-md gap-2 overflow-hidden rounded-[1rem] ${dish.images.length > 1 ? "grid-cols-2" : ""}`}>
              {dish.images.map((source, imageIndex) => <div className="relative aspect-[4/3] overflow-hidden bg-mist/25" key={source}><Image alt={`${dish.title}, plated dish${dish.images.length > 1 ? `, view ${imageIndex + 1}` : ""}`} className="object-cover" fill sizes="(max-width: 640px) 88vw, 28rem" src={source} /></div>)}
            </div>
          ) : (
            <div className="mx-auto grid min-h-28 w-full max-w-md place-items-center rounded-[1rem] border border-dashed border-ink/15 bg-surface/35 px-5 text-center text-xs leading-5 text-ink/42">
              No separate plated-dish image appears in the supplied book pages.
            </div>
          )}
          <header><p className="eyebrow">{dish.yield ?? "Core recipe"}</p><h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{dish.title}</h3><p className="mt-2 text-sm leading-6 text-ink/55">{dish.subtitle}</p></header>
          <ScaleControl onChange={setFactorText} value={factorText} />
          <div className="grid gap-4">{dish.pages.map((_, pageIndex) => <TranscribedPage dish={dish} factor={factor} key={pageIndex} pageIndex={pageIndex} />)}</div>
          <details className="group overflow-hidden rounded-xl border border-ink/10 bg-paper/70">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden"><span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/48">Exact source pages</span><span className="text-xs text-ink/35 transition group-open:rotate-45">+</span></summary>
            <div className="grid gap-3 border-t border-ink/[0.07] p-3">{dish.sourceScans.map((source, sourceIndex) => <Image alt={`${dish.title} source recipe page ${sourceIndex + 1}`} className="h-auto w-full rounded-lg" height={1942} key={source} sizes="(max-width: 900px) 94vw, 60rem" src={source} width={1500} />)}</div>
          </details>
        </div>
      )}
    </article>
  );
}

function DishesPanel() {
  const [query, setQuery] = useState("");
  const [openDishes, setOpenDishes] = useState<Record<string, boolean>>({});
  const [layout, setLayout] = useState<"categories" | "all">("categories");
  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); return needle ? coreDishes.filter((dish) => `${dish.title} ${dish.subtitle} ${dish.searchText}`.toLowerCase().includes(needle)) : coreDishes; }, [query]);
  useEffect(() => {
    const openHash = () => { const slug = window.location.hash.replace("#core-dish-", ""); if (!coreDishes.some((dish) => dish.slug === slug)) return; setQuery(""); setOpenDishes((current) => ({ ...current, [slug]: true })); window.requestAnimationFrame(() => document.getElementById(`core-dish-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" })); };
    openHash(); window.addEventListener("hashchange", openHash); return () => window.removeEventListener("hashchange", openHash);
  }, []);
  const groups = [
    { title: "Canapes / Amuse", start: 0, end: 9 },
    { title: "Starters", start: 10, end: 22 },
    { title: "Fish", start: 23, end: 27 },
    { title: "Meat", start: 28, end: 33 },
    { title: "Dessert", start: 34, end: 42 },
    { title: "Petit fours", start: 43, end: 44 },
    { title: "Bread", start: 45, end: 50 },
  ];
  const renderDish = (dish: CoreDish) => <DishCard dish={dish} index={coreDishes.indexOf(dish)} key={dish.slug} onToggle={() => setOpenDishes((current) => ({ ...current, [dish.slug]: !current[dish.slug] }))} open={Boolean(openDishes[dish.slug])} />;
  return <div className="min-w-0"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-2xl text-sm leading-6 text-ink/55">Complete dishes in supplied book order, arranged into scrollable collections. Open an image card for the scalable ingredient grid, methods, and exact page reference.</p><div className="flex items-center gap-2"><button aria-pressed={layout === "all"} className="hidden h-10 items-center rounded-full border border-ink/12 bg-surface/65 px-4 text-xs font-semibold text-ink/55 transition hover:border-ink/25 hover:text-ink sm:inline-flex" onClick={() => setLayout((current) => current === "categories" ? "all" : "categories")} type="button">{layout === "categories" ? "Show all recipes" : "Show categories"}</button><input aria-label="Search Core recipes" className="h-10 min-w-0 flex-1 rounded-full border border-ink/12 bg-surface/65 px-4 text-sm outline-none placeholder:text-ink/35 focus:border-ink/30 sm:w-72 sm:flex-none" onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search dishes or ingredients" type="search" value={query} /></div></div>{layout === "categories" ? <div className="mt-7 grid gap-9">{groups.map((group) => { const dishes = filtered.filter((dish) => { const index = coreDishes.indexOf(dish); return index >= group.start && index <= group.end; }); return <CookbookRecipeRail key={group.title} title={group.title}>{dishes.map(renderDish)}</CookbookRecipeRail>; })}</div> : <div className="mt-5 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map(renderDish)}</div>}{filtered.length === 0 && <p className="mt-5 rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/45">No Core recipes match that search.</p>}</div>;
}

export function CoreBookGuide() {
  const [view, setView] = useState<"basics" | "recipes">("basics");
  useEffect(() => { const choose = () => setView(window.location.hash.startsWith("#core-dish-") ? "recipes" : "basics"); choose(); window.addEventListener("hashchange", choose); return () => window.removeEventListener("hashchange", choose); }, []);
  return <div className="grid gap-7"><div className="rounded-[1.5rem] border border-ink/10 bg-surface/48 p-2"><div aria-label="Core collections" className="grid grid-cols-2 gap-2">{(["basics", "recipes"] as const).map((option) => <button aria-pressed={view === option} className={`rounded-[1.1rem] px-4 py-3 text-left transition ${view === option ? "bg-ink text-paper shadow-sm" : "text-ink/55 hover:bg-paper/60 hover:text-ink"}`} key={option} onClick={() => setView(option)} type="button"><span className="block text-sm font-semibold">{option === "basics" ? "Core Basics" : "Core recipes"}</span><span className={`mt-0.5 block text-[0.64rem] ${view === option ? "text-paper/60" : "text-ink/35"}`}>{option === "basics" ? `${coreRecipes.length} foundation recipes` : `${coreDishes.length} complete dish groups`}</span></button>)}</div></div>{view === "basics" ? <CoreBasicsGuide /> : <DishesPanel />}</div>;
}
