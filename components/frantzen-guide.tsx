"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CookbookRecipeCardSummary } from "@/components/cookbook-recipe-card-summary";
import { CookbookRecipeRail } from "@/components/cookbook-recipe-rail";
import { CookbookSearch } from "@/components/cookbook-search";
import { RecipeImageViewer } from "@/components/recipe-image-viewer";
import { normalizeNumericInputText } from "@/lib/numeric-input";
import { frantzenBasics, frantzenBasicsBySlug, frantzenPetitFours, frantzenRecipes, frantzenRecipeSequence, frantzenTranscribedRecipeCount, type FrantzenComponent, type FrantzenRecipe } from "@/lib/frantzen";

function scaleLine(line: string, factor: number) {
  return line.replace(/^(Step \d+ — )?(\d+(?:\.\d+)?)(?=\s)/, (_, prefix = "", quantity: string) => {
    const scaled = Number(quantity) * factor;
    const formatted = scaled >= 100 ? String(Math.round(scaled)) : String(Math.round(scaled * 100) / 100);
    return `${prefix}${formatted} g`;
  });
}

function ScaleControl({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const factor = Number(value) > 0 ? Number(value) : 1;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-surface/55 p-3">
      <label className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/45">
        Scale recipe ×
        <input aria-label="Recipe scale multiplier" className="h-8 w-20 rounded-lg border border-ink/15 bg-paper/80 px-2 text-sm outline-none" inputMode="decimal" min={0} onChange={(event) => onChange(normalizeNumericInputText(event.currentTarget.value))} onFocus={(event) => event.currentTarget.select()} step="any" type="number" value={value} />
      </label>
      <div className="flex gap-1.5">{[0.5, 1, 2, 3].map((preset) => <button aria-pressed={factor === preset} className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold ${factor === preset ? "border-moss bg-moss text-paper" : "border-ink/12 text-ink/50"}`} key={preset} onClick={() => onChange(String(preset))} type="button">{preset}×</button>)}</div>
    </div>
  );
}

function Ingredients({ items, factor }: { items: string[]; factor: number }) {
  return <ul className="divide-y divide-ink/[0.07] border-y border-ink/[0.07]">{items.map((item, index) => <li className="py-2 text-[0.82rem] leading-5 text-ink/68" key={`${item}-${index}`}>{scaleLine(item, factor)}</li>)}</ul>;
}

function Steps({ items }: { items: string[] }) {
  return <ol className="grid gap-3">{items.map((item, index) => <li className="flex gap-3 text-[0.82rem] leading-6 text-ink/65" key={`${item}-${index}`}><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/15 text-[0.63rem] font-semibold text-ink/48">{index + 1}</span><span>{item}</span></li>)}</ol>;
}

function SourceLink({ href, label }: { href: string; label: string }) {
  return <RecipeImageViewer alt={`Frantzén exact source, ${label}`} className="inline-flex items-center gap-1 text-xs font-semibold text-moss underline decoration-moss/25 underline-offset-4" src={href}>View exact source · {label}</RecipeImageViewer>;
}

function BasicsPanel({ query }: { query: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [scales, setScales] = useState<Record<string, string>>({});
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? frantzenBasics.filter((recipe) => `${recipe.name} ${recipe.ingredients.join(" ")}`.toLowerCase().includes(needle)) : frantzenBasics;
  }, [query]);
  useEffect(() => {
    const openHash = () => {
      const slug = window.location.hash.replace("#frantzen-basic-", "");
      if (!window.location.hash.startsWith("#frantzen-basic-") || !frantzenBasicsBySlug.has(slug)) return;
      setOpen((current) => ({ ...current, [slug]: true }));
      window.requestAnimationFrame(() => document.getElementById(`frantzen-basic-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    openHash();
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);

  return (
    <div>
      <p className="max-w-2xl text-sm leading-6 text-ink/55">All supplied Basics pages 301–308, with cross-page recipes joined and the book&apos;s ratio quantities preserved.</p>
      <div className="mt-6 gap-3 sm:columns-2 xl:columns-3">{filtered.map((recipe) => {
        const isOpen = Boolean(open[recipe.slug]);
        const value = scales[recipe.slug] ?? "1";
        const factor = Number(value) > 0 ? Number(value) : 1;
        return <article className="mb-3 break-inside-avoid overflow-hidden rounded-[1.25rem] border border-ink/10 bg-paper/70" id={`frantzen-basic-${recipe.slug}`} key={recipe.slug}><button aria-expanded={isOpen} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setOpen((current) => ({ ...current, [recipe.slug]: !isOpen }))} type="button"><span><span className="block text-sm font-semibold">{recipe.name}</span><span className="mt-0.5 block text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink/38">Page {recipe.page} · {recipe.ingredients.length} ingredients</span></span><span aria-hidden="true" className={`text-ink/35 transition ${isOpen ? "rotate-45" : ""}`}>+</span></button>{isOpen && <div className="grid gap-4 border-t border-ink/[0.07] px-4 py-4"><ScaleControl onChange={(next) => setScales((current) => ({ ...current, [recipe.slug]: next }))} value={value} /><Ingredients factor={factor} items={recipe.ingredients} /><Steps items={recipe.method} /><SourceLink href={recipe.sourceImage} label={`page ${recipe.page}`} /></div>}</article>;
      })}</div>
    </div>
  );
}

function Component({ component, factor }: { component: FrantzenComponent; factor: number }) {
  return <details className="overflow-hidden rounded-[1.15rem] border border-ink/10 bg-paper/65" open><summary className="cursor-pointer px-4 py-3 text-sm font-semibold">{component.name}</summary><div className="grid gap-5 border-t border-ink/[0.07] px-4 py-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><div>{component.ingredients.length > 0 && <Ingredients factor={factor} items={component.ingredients} />}</div><Steps items={component.steps} /></div></details>;
}

function RecipeCard({ recipe, index, open, onToggle, compact = false }: { recipe: FrantzenRecipe; index: number; open: boolean; onToggle: () => void; compact?: boolean }) {
  const [scale, setScale] = useState("1");
  const factor = Number(scale) > 0 ? Number(scale) : 1;
  const pending = recipe.components.length === 0;
  const basics = recipe.basicReferences.flatMap((slug) => { const basic = frantzenBasicsBySlug.get(slug); return basic ? [basic] : []; });
  return (
    <article
      className={`cookbook-rail-card recipe-card scroll-mt-24 overflow-hidden border border-ink/10 bg-surface/55 ${compact ? "frantzen-petit-four rounded-[1.15rem] p-2" : "rounded-[1.5rem] p-3"}`}
      id={`frantzen-${recipe.slug}`}
    >
      {compact ? (
        <button aria-expanded={open} className="flex min-h-32 w-full flex-col rounded-[0.9rem] p-3 text-left" onClick={onToggle} type="button">
          <div className="flex w-full items-center justify-between gap-2">
            <p className="eyebrow">Petit Four {String(index + 1).padStart(2, "0")}</p>
            <span aria-hidden="true" className={`text-sm text-ink/35 transition ${open ? "rotate-45" : ""}`}>+</span>
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-snug tracking-tight">{recipe.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-[0.68rem] leading-4 text-ink/48">{recipe.description}</p>
          <span className="mt-auto pt-3 text-[0.65rem] font-semibold text-moss">{open ? "Close" : "Open recipe"}</span>
        </button>
      ) : (
        <CookbookRecipeCardSummary
          description={recipe.description}
          fallbackMark={pending ? "SOURCE PENDING" : "FRANTZÉN"}
          image={recipe.image}
          imageAlt={`${recipe.title}, plated dish`}
          imageFilter="brightness(0.78)"
          imagePosition={recipe.imagePosition}
          imageRotation={recipe.imageRotation}
          index={index}
          meta={pending ? "Source pending" : `${recipe.components.length} components`}
          onToggle={onToggle}
          open={open}
          title={recipe.title}
        />
      )}
      {open && (
        <div className="mt-3 grid gap-5 border-t border-ink/[0.07] p-4 sm:p-5">
          {recipe.image && (
            <RecipeImageViewer
              alt={`${recipe.title}, plated dish`}
              className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-[1.15rem] bg-paper"
              src={recipe.image}
              viewerImageStyle={{ filter: "brightness(0.78)", transform: recipe.imageRotation ? `rotate(${recipe.imageRotation}deg)` : undefined }}
            >
              <Image
                alt={`${recipe.title}, plated dish`}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 88vw, 32rem"
                src={recipe.image}
                style={{
                  filter: "brightness(0.78)",
                  objectPosition: recipe.imagePosition ?? "50% 50%",
                  transform: recipe.imageRotation ? `rotate(${recipe.imageRotation}deg) scale(1.35)` : undefined,
                }}
              />
            </RecipeImageViewer>
          )}
          <header>
            <p className="eyebrow">{compact ? "Frantzén Petit Four" : "Frantzén recipe"}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{recipe.title}</h3>
            <p className="mt-2 max-w-3xl text-sm italic leading-6 text-ink/55">{recipe.description}</p>
          </header>
          {recipe.sourceNote && <p className="rounded-2xl border border-amber-700/15 bg-amber-100/35 px-4 py-3 text-sm leading-6 text-ink/60">{recipe.sourceNote}</p>}
          {!pending && (
            <>
              <ScaleControl onChange={setScale} value={scale} />
              <div className="grid gap-3">{recipe.components.map((component) => <Component component={component} factor={factor} key={component.name} />)}</div>
            </>
          )}
          {basics.length > 0 && (
            <section className="rounded-[1.4rem] border border-moss/20 bg-lime/25 p-4">
              <p className="eyebrow">Called-for Basics</p>
              <div className="mt-3 grid gap-2">{basics.map((basic) => <details className="rounded-xl border border-ink/10 bg-paper/70 p-3" key={basic.slug}><summary className="cursor-pointer text-sm font-semibold">{basic.name}</summary><div className="mt-3 grid gap-4"><Ingredients factor={factor} items={basic.ingredients} /><Steps items={basic.method} /></div></details>)}</div>
            </section>
          )}
          {recipe.sourceImages && recipe.sourceImages.length > 0 ? <div className="flex flex-wrap gap-x-4 gap-y-2">{recipe.sourceImages.map((source) => <SourceLink href={source.href} key={source.href} label={source.label} />)}</div> : recipe.sourceImage && <SourceLink href={recipe.sourceImage} label={recipe.sourceLabel} />}
        </div>
      )}
    </article>
  );
}

function RecipesPanel({ query }: { query: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [layout, setLayout] = useState<"categories" | "all">("categories");
  const needle = query.trim().toLowerCase();
  const filterRecipes = (recipes: FrantzenRecipe[]) => {
    return needle ? recipes.filter((recipe) => `${recipe.title} ${recipe.description} ${recipe.components.flatMap((item) => [item.name, ...item.ingredients]).join(" ")}`.toLowerCase().includes(needle)) : recipes;
  };
  const dishes = filterRecipes(frantzenRecipes);
  const petitFours = filterRecipes(frantzenPetitFours);
  const bitesNumbers = new Set([1, 2, 3, 4, 13, 14, 15, 16, 27, 28, 29, 30, 41, 42, 43]);
  const starterNumbers = new Set([5, 6, 17, 18, 19, 31, 32, 33, 44, 45, 47, 48]);
  const seafoodNumbers = new Set([7, 8, 10, 20, 22, 23, 34, 36, 46, 49, 50]);
  const vegetableNumbers = new Set([9, 21, 35]);
  const meatNumbers = new Set([11, 12, 24, 37, 38, 51, 52]);
  const bites = dishes.filter((recipe) => bitesNumbers.has(frantzenRecipes.indexOf(recipe) + 1));
  const starters = dishes.filter((recipe) => starterNumbers.has(frantzenRecipes.indexOf(recipe) + 1));
  const seafood = dishes.filter((recipe) => seafoodNumbers.has(frantzenRecipes.indexOf(recipe) + 1));
  const vegetables = dishes.filter((recipe) => vegetableNumbers.has(frantzenRecipes.indexOf(recipe) + 1));
  const meat = dishes.filter((recipe) => meatNumbers.has(frantzenRecipes.indexOf(recipe) + 1));
  const dessert = dishes.filter((recipe) => {
    const number = frantzenRecipes.indexOf(recipe) + 1;
    return !bitesNumbers.has(number) && !starterNumbers.has(number) && !seafoodNumbers.has(number) && !vegetableNumbers.has(number) && !meatNumbers.has(number);
  });
  const categorizedRecipes = [...bites, ...starters, ...seafood, ...vegetables, ...meat, ...dessert];
  useEffect(() => {
    const openHash = () => {
      const hash = window.location.hash;
      if (!hash.startsWith("#frantzen-") || hash.startsWith("#frantzen-basic-")) return;
      const slug = hash.replace("#frantzen-", "");
      if (![...frantzenRecipes, ...frantzenPetitFours].some((recipe) => recipe.slug === slug)) return;
      setOpen((current) => ({ ...current, [slug]: true }));
      window.requestAnimationFrame(() => document.getElementById(`frantzen-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    openHash();
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);
  const renderRecipe = (recipe: FrantzenRecipe, index: number, compact = false) => <RecipeCard compact={compact} index={index} key={recipe.slug} onToggle={() => setOpen((current) => ({ ...current, [recipe.slug]: !current[recipe.slug] }))} open={Boolean(open[recipe.slug])} recipe={recipe} />;
  return <div className="min-w-0"><p className="mb-4 rounded-2xl border border-ink/10 bg-paper/65 px-4 py-3 text-sm leading-6 text-ink/58"><strong className="font-semibold text-ink/72">Source coverage:</strong> all {frantzenTranscribedRecipeCount} of {frantzenRecipeSequence.length} confirmed dishes are transcribed and paired with their plated photograph and exact supplied source page.</p><div className="flex justify-end"><button aria-pressed={layout === "all"} className="hidden h-10 items-center rounded-full border border-ink/12 bg-surface/65 px-4 text-xs font-semibold text-ink/55 transition hover:border-ink/25 hover:text-ink sm:inline-flex" onClick={() => setLayout((current) => current === "categories" ? "all" : "categories")} type="button">{layout === "categories" ? "Expand all" : "Collapse all"}</button></div>{layout === "categories" ? <div className="mt-5 grid gap-9"><CookbookRecipeRail title="Bites / Canapes / Amuse">{bites.map((recipe) => renderRecipe(recipe, frantzenRecipes.indexOf(recipe)))}</CookbookRecipeRail><CookbookRecipeRail title="Starters">{starters.map((recipe) => renderRecipe(recipe, frantzenRecipes.indexOf(recipe)))}</CookbookRecipeRail><CookbookRecipeRail title="Seafood">{seafood.map((recipe) => renderRecipe(recipe, frantzenRecipes.indexOf(recipe)))}</CookbookRecipeRail><CookbookRecipeRail title="Vegetables">{vegetables.map((recipe) => renderRecipe(recipe, frantzenRecipes.indexOf(recipe)))}</CookbookRecipeRail><CookbookRecipeRail title="Meat">{meat.map((recipe) => renderRecipe(recipe, frantzenRecipes.indexOf(recipe)))}</CookbookRecipeRail><CookbookRecipeRail title="Dessert">{dessert.map((recipe) => renderRecipe(recipe, frantzenRecipes.indexOf(recipe)))}</CookbookRecipeRail></div> : <div className="mt-5 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{categorizedRecipes.map((recipe) => renderRecipe(recipe, frantzenRecipes.indexOf(recipe)))}</div>}<div className="mt-9"><CookbookRecipeRail compact title="Petit Fours">{petitFours.map((recipe) => renderRecipe(recipe, frantzenPetitFours.indexOf(recipe), true))}</CookbookRecipeRail></div>{dishes.length === 0 && petitFours.length === 0 && <p className="mt-5 rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/45">No Frantzén recipes match that search.</p>}</div>;
}

export function FrantzenGuide() {
  const [view, setView] = useState<"basics" | "recipes">("basics");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const chooseView = () => setView(window.location.hash.startsWith("#frantzen-") && !window.location.hash.startsWith("#frantzen-basic-") ? "recipes" : "basics");
    chooseView();
    window.addEventListener("hashchange", chooseView);
    return () => window.removeEventListener("hashchange", chooseView);
  }, []);
  return <div className="grid gap-7"><CookbookSearch bookName="Frantzén" onChange={setQuery} value={query} /><div className="rounded-[1.5rem] border border-ink/10 bg-surface/48 p-2"><div aria-label="Frantzén collections" className="grid grid-cols-2 gap-2">{(["basics", "recipes"] as const).map((option) => <button aria-pressed={view === option} className={`rounded-[1.1rem] px-4 py-3 text-left transition ${view === option ? "bg-ink text-paper shadow-sm" : "text-ink/55 hover:bg-paper/60 hover:text-ink"}`} key={option} onClick={() => setView(option)} type="button"><span className="block text-sm font-semibold">{option === "basics" ? "Frantzén Basics" : "Frantzén recipes"}</span><span className={`mt-0.5 block text-[0.64rem] ${view === option ? "text-paper/60" : "text-ink/35"}`}>{option === "basics" ? `${frantzenBasics.length} foundation recipes` : `${frantzenRecipes.length} dishes + ${frantzenPetitFours.length} Petit Fours`}</span></button>)}</div></div>{query.trim() ? <div className="grid gap-10"><section><p className="eyebrow mb-4">Basics matches</p><BasicsPanel query={query} /></section><section><p className="eyebrow mb-4">Recipe matches</p><RecipesPanel query={query} /></section></div> : view === "basics" ? <BasicsPanel query={query} /> : <RecipesPanel query={query} />}</div>;
}
