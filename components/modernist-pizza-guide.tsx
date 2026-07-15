"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CookbookRecipeCardSummary } from "@/components/cookbook-recipe-card-summary";
import { CookbookRecipeRail } from "@/components/cookbook-recipe-rail";
import { CookbookSearch } from "@/components/cookbook-search";
import {
  modernistPizzaEntries,
  modernistPizzaHighlights,
  modernistPizzaKnowledge,
  modernistPizzaKnowledgeCategories,
  modernistPizzaRecipeCategories,
  modernistPizzaRecipes,
  type ModernistPizzaEntry,
  type ModernistPizzaHighlight,
} from "@/lib/modernist-pizza";

function SourceLinks({ pages, returnId, title }: { pages: number[]; returnId: string; title: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {pages.map((page) => {
        const href = {
          pathname: "/recipes/modernist-pizza/viewer",
          query: {
            from: `/recipes/modernist-pizza#${returnId}`,
            pages: pages.join(","),
            title,
          },
          hash: `page-${page}`,
        };

        return (
          <Link className="inline-flex items-center gap-1.5 rounded-full border border-moss/20 bg-moss/[0.04] px-3 py-2 text-[0.68rem] font-semibold text-moss transition hover:border-moss/40 hover:bg-moss/[0.09]" href={href} key={page} prefetch={false}>
            Open PDF page {page} in viewer <span aria-hidden="true">↗</span>
          </Link>
        );
      })}
    </div>
  );
}

function EntryCard({ entry, index, open, onToggle }: { entry: ModernistPizzaEntry; index: number; open: boolean; onToggle: () => void }) {
  const id = `modernist-pizza-${entry.kind}-${entry.slug}`;
  const image = entry.sourceImages[0] ?? "/modernist-pizza/cover.webp";
  return (
    <article className="cookbook-rail-card recipe-card scroll-mt-24 overflow-hidden rounded-[1.4rem] border border-ink/10 bg-surface/55 p-3" id={id}>
      <CookbookRecipeCardSummary
        description={`${entry.category} · Printed page ${entry.printedPage}`}
        fallbackMark="MP"
        image={image}
        imageAlt={`${entry.title}, source page`}
        imagePosition="50% 14%"
        index={index}
        meta={`${entry.label ?? (entry.kind === "recipe" ? "Recipe" : "Reference")} · p. ${entry.printedPage}`}
        onToggle={onToggle}
        open={open}
        title={entry.title}
      />
      {open && (
        <div className="mt-3 grid gap-4 border-t border-ink/[0.07] p-4 sm:p-5">
          <header>
            <p className="eyebrow">Modernist Pizza · printed page {entry.printedPage}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{entry.title}</h3>
          </header>
          <div className="rounded-2xl border border-amber-700/15 bg-amber-100/30 px-4 py-3 text-xs leading-5 text-ink/55">This layout-heavy entry is preserved as an exact source spread. Scaling is intentionally disabled for source-page cutouts.</div>
          <SourceLinks pages={entry.sourcePages} returnId={id} title={entry.title} />
        </div>
      )}
    </article>
  );
}

function HighlightCard({ highlight }: { highlight: ModernistPizzaHighlight }) {
  const id = `modernist-pizza-highlight-${highlight.slug}`;
  return (
    <article className="break-inside-avoid rounded-[1.25rem] border border-ink/10 bg-paper/65 p-4 sm:p-5" id={id}>
      <p className="eyebrow">{highlight.category}</p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight">{highlight.title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/55">{highlight.summary}</p>
      <ul className="mt-4 grid gap-2 border-t border-ink/[0.07] pt-3">
        {highlight.points.map((point) => <li className="flex gap-2.5 text-[0.8rem] leading-5 text-ink/62" key={point}><span aria-hidden="true" className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-moss/60" /><span>{point}</span></li>)}
      </ul>
      <div className="mt-4"><SourceLinks pages={highlight.sourcePages} returnId={id} title={highlight.title} /></div>
    </article>
  );
}

function entryMatches(entry: ModernistPizzaEntry, query: string) {
  const needle = query.trim().toLocaleLowerCase();
  return !needle || `${entry.title} ${entry.category} ${entry.label ?? ""} ${entry.summary} ${entry.aliases.join(" ")} ${entry.searchText}`.toLocaleLowerCase().includes(needle);
}

function highlightMatches(highlight: ModernistPizzaHighlight, query: string) {
  const needle = query.trim().toLocaleLowerCase();
  return !needle || `${highlight.title} ${highlight.category} ${highlight.summary} ${highlight.points.join(" ")}`.toLocaleLowerCase().includes(needle);
}

export function ModernistPizzaGuide() {
  const [view, setView] = useState<"recipes" | "knowledge">("recipes");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const searching = Boolean(query.trim());
  const filteredRecipes = useMemo(() => modernistPizzaRecipes.filter((entry) => entryMatches(entry, query)), [query]);
  const filteredKnowledge = useMemo(() => modernistPizzaKnowledge.filter((entry) => entryMatches(entry, query)), [query]);
  const filteredHighlights = useMemo(() => modernistPizzaHighlights.filter((highlight) => highlightMatches(highlight, query)), [query]);

  useEffect(() => {
    const openHash = () => {
      const hash = window.location.hash.slice(1);
      const kind = hash.startsWith("modernist-pizza-knowledge-") ? "knowledge" : hash.startsWith("modernist-pizza-recipe-") ? "recipe" : null;
      if (!kind) return;
      const slug = hash.slice(`modernist-pizza-${kind}-`.length);
      if (!modernistPizzaEntries.some((entry) => entry.kind === kind && entry.slug === slug)) return;
      setView(kind === "recipe" ? "recipes" : "knowledge");
      setQuery("");
      setOpen((current) => ({ ...current, [`${kind}-${slug}`]: true }));
      window.requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    openHash();
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);

  const renderEntry = (entry: ModernistPizzaEntry) => {
    const key = `${entry.kind}-${entry.slug}`;
    const collection = entry.kind === "recipe" ? modernistPizzaRecipes : modernistPizzaKnowledge;
    return <EntryCard entry={entry} index={collection.indexOf(entry)} key={key} onToggle={() => setOpen((current) => ({ ...current, [key]: !current[key] }))} open={Boolean(open[key])} />;
  };

  const displayedEntries = searching ? [...filteredRecipes, ...filteredKnowledge] : view === "recipes" ? filteredRecipes : filteredKnowledge;
  const displayedKeys = displayedEntries.map((entry) => `${entry.kind}-${entry.slug}`);
  const allOpen = displayedKeys.length > 0 && displayedKeys.every((key) => open[key]);
  const toggleAll = () => setOpen((current) => ({ ...current, ...Object.fromEntries(displayedKeys.map((key) => [key, !allOpen])) }));

  const recipesPanel = (
    <section>
      <div className="flex items-start justify-between gap-4">
        <p className="max-w-3xl text-sm leading-6 text-ink/55">The full kitchen-manual recipe index, including doughs, sauces, cheeses, preparations, iconic pizzas, and flavor-theme pizzas. Complex tables and multi-recipe spreads open as exact source pages.</p>
        {!searching && <button className="hidden shrink-0 rounded-full border border-ink/12 px-4 py-2 text-xs font-semibold text-ink/55 sm:block" onClick={toggleAll} type="button">{allOpen ? "Collapse all" : "Expand all"}</button>}
      </div>
      <div className="mt-6 grid gap-10">{modernistPizzaRecipeCategories.map((category) => <CookbookRecipeRail key={category} title={category}>{filteredRecipes.filter((entry) => entry.category === category).map(renderEntry)}</CookbookRecipeRail>)}</div>
    </section>
  );

  const knowledgePanel = (
    <section className="grid gap-12">
      {filteredHighlights.length > 0 && <div><div className="mb-5"><p className="eyebrow">Remade for the website</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Practical field guide</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-ink/55">The most reusable ideas have been condensed into native text while keeping direct access to the exact supporting pages.</p></div><div className="gap-4 sm:columns-2 xl:columns-3">{filteredHighlights.map((highlight) => <div className="mb-4" key={highlight.slug}><HighlightCard highlight={highlight} /></div>)}</div></div>}
      <div>
        <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Complete index</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Techniques, tables & reference</h2></div>{!searching && <button className="hidden shrink-0 rounded-full border border-ink/12 px-4 py-2 text-xs font-semibold text-ink/55 sm:block" onClick={toggleAll} type="button">{allOpen ? "Collapse all" : "Expand all"}</button>}</div>
        <div className="mt-6 grid gap-10">{modernistPizzaKnowledgeCategories.map((category) => <CookbookRecipeRail compact key={category} title={category}>{filteredKnowledge.filter((entry) => entry.category === category).map(renderEntry)}</CookbookRecipeRail>)}</div>
      </div>
    </section>
  );

  return (
    <div className="grid min-w-0 gap-7">
      <CookbookSearch bookName="Modernist Pizza" onChange={setQuery} scope="recipes, techniques and reference" value={query} />
      <div className="rounded-[1.5rem] border border-ink/10 bg-surface/48 p-2"><div aria-label="Modernist Pizza sections" className="grid grid-cols-2 gap-2"><button aria-pressed={view === "recipes"} className={`rounded-[1.1rem] px-4 py-3 text-left ${view === "recipes" ? "bg-ink text-paper" : "text-ink/55 hover:bg-paper/60"}`} onClick={() => setView("recipes")} type="button"><span className="block text-sm font-semibold">Recipes</span><span className={`mt-0.5 block text-[0.64rem] ${view === "recipes" ? "text-paper/60" : "text-ink/35"}`}>{modernistPizzaRecipes.length} recipes and preparations</span></button><button aria-pressed={view === "knowledge"} className={`rounded-[1.1rem] px-4 py-3 text-left ${view === "knowledge" ? "bg-ink text-paper" : "text-ink/55 hover:bg-paper/60"}`} onClick={() => setView("knowledge")} type="button"><span className="block text-sm font-semibold">Techniques & knowledge</span><span className={`mt-0.5 block text-[0.64rem] ${view === "knowledge" ? "text-paper/60" : "text-ink/35"}`}>{modernistPizzaKnowledge.length} reference entries · {modernistPizzaHighlights.length} remade guides</span></button></div></div>
      {searching ? <div className="grid gap-14"><div><p className="eyebrow mb-4">Recipe matches</p>{recipesPanel}</div><div><p className="eyebrow mb-4">Technique & knowledge matches</p>{knowledgePanel}</div></div> : view === "recipes" ? recipesPanel : knowledgePanel}
      {filteredRecipes.length === 0 && filteredKnowledge.length === 0 && filteredHighlights.length === 0 && <p className="rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/45">No Modernist Pizza entries match “{query}”.</p>}
    </div>
  );
}
