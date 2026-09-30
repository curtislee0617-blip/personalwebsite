"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RecipeCard } from "@/components/recipe-card";
import { SpringButton } from "@/components/spring-links";
import { recipeCategories } from "@/data/recipe-categories";
import type { RecipeCardEntry } from "@/lib/recipe-card-types";

const INITIAL_PAGE_SIZE = 12;
const SHOW_MORE_SIZE = 20;

export function RecipeCollection({ recipes, authenticated }: { recipes: RecipeCardEntry[]; authenticated: boolean }) {
  const [category, setCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);
  const [targetId, setTargetId] = useState<{ id: string } | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const byKey = useMemo(() => new Map(recipes.map((recipe) => [recipe.recipeKey, recipe])), [recipes]);
  const matches = (recipe: RecipeCardEntry, id: string) => recipe.category === id || recipe.categories?.includes(id);
  const filtered = category === "all" ? recipes : recipes.filter((recipe) => matches(recipe, category));

  useEffect(() => {
    const filters = filtersRef.current;
    const active = filters?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!filters || !active || filters.scrollWidth <= filters.clientWidth) return;
    const row = filters.getBoundingClientRect();
    const button = active.getBoundingClientRect();
    if (button.left < row.left) filters.scrollLeft -= row.left - button.left;
    else if (button.right > row.right) filters.scrollLeft += button.right - row.right;
  }, [category]);

  useEffect(() => {
    const followHash = (value = window.location.hash) => {
      let hash: string;
      try { hash = decodeURIComponent(value.slice(1)); } catch { return; }
      const categoryId = hash.replace(/^recipe-category-/, "");
      if (hash.startsWith("recipe-category-") && recipeCategories.some((item) => item.id === categoryId)) {
        setCategory(categoryId);
        setVisibleCount(INITIAL_PAGE_SIZE);
        setTargetId(null);
        return;
      }
      // Preserve existing search, sidebar and older "All recipes" links.
      const id = hash.replace(/^all-recipe-/, "recipe-");
      const index = recipes.findIndex((recipe) => `recipe-${recipe.slug}` === id);
      if (index < 0) return;
      setCategory("all");
      setVisibleCount(index < INITIAL_PAGE_SIZE
        ? INITIAL_PAGE_SIZE
        : INITIAL_PAGE_SIZE + Math.ceil((index + 1 - INITIAL_PAGE_SIZE) / SHOW_MORE_SIZE) * SHOW_MORE_SIZE);
      setTargetId({ id });
    };
    const onNavigation = () => followHash();
    const onLinkClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      const url = new URL(link.href);
      if (url.origin === location.origin && url.pathname === location.pathname && url.hash) followHash(url.hash);
    };
    followHash();
    window.addEventListener("hashchange", onNavigation);
    window.addEventListener("popstate", onNavigation);
    document.addEventListener("click", onLinkClick);
    return () => {
      window.removeEventListener("hashchange", onNavigation);
      window.removeEventListener("popstate", onNavigation);
      document.removeEventListener("click", onLinkClick);
    };
  }, [recipes]);

  useEffect(() => {
    if (!targetId) return;
    const frame = requestAnimationFrame(() => {
      const card = document.getElementById(targetId.id);
      if (card instanceof HTMLDetailsElement) {
        card.open = true;
        card.querySelector<HTMLElement>(":scope > summary")?.focus({ preventScroll: true });
        card.scrollIntoView({ block: "start" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [targetId, visibleCount, category]);

  return (
    <div className="recipe-browser">
      <div aria-label="Filter recipes by category" className="recipe-filter-list" ref={filtersRef} role="group">
        <SpringButton aria-pressed={category === "all"} onClick={() => { setCategory("all"); setVisibleCount(INITIAL_PAGE_SIZE); setTargetId(null); }}>All recipes <span>{recipes.length}</span></SpringButton>
        {recipeCategories.map((item) => {
          const count = recipes.filter((recipe) => matches(recipe, item.id)).length;
          return (
            <SpringButton aria-pressed={category === item.id} id={`recipe-category-${item.id}`} key={item.id} onClick={() => { setCategory(item.id); setVisibleCount(INITIAL_PAGE_SIZE); setTargetId(null); }}>
              {item.title} <span>{count}</span>
            </SpringButton>
          );
        })}
      </div>
      <p aria-live="polite" className="recipe-browser-count">{filtered.length} recipes · Newest first</p>
      <ul className="recipe-browser-grid">
        {filtered.slice(0, visibleCount).map((entry) => (
          <li key={entry.recipeKey}>
            <RecipeCard
              adminEditHref={authenticated ? `/recipes/admin/edit/${encodeURIComponent(entry.recipeKey)}` : undefined}
              entry={entry}
              linkedRecipes={(entry.linkedRecipeKeys ?? []).flatMap((key) => { const linked = byKey.get(key); return linked ? [linked] : []; })}
              variant="shelf"
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 && <p className="recipe-browser-empty">No recipes in this category yet.</p>}
      {visibleCount < filtered.length && (
        <SpringButton className="recipe-show-more" onClick={() => setVisibleCount((count) => count + SHOW_MORE_SIZE)}>
          Show more recipes <span>{filtered.length - visibleCount} remaining</span>
        </SpringButton>
      )}
    </div>
  );
}
