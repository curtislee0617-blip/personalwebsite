"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import type { RecipeSearchItem } from "@/lib/recipe-search";

function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resultScore(item: RecipeSearchItem, query: string, tokens: string[]) {
  const title = normalizeSearchText(item.title);
  const haystack = normalizeSearchText(`${item.title} ${item.context} ${item.searchText}`);
  if (!tokens.every((token) => haystack.includes(token))) return -1;

  let score = tokens.reduce((total, token) => {
    if (title === token) return total + 80;
    if (title.startsWith(token)) return total + 35;
    if (title.includes(token)) return total + 18;
    return total + 2;
  }, 0);

  if (title === query) score += 160;
  else if (title.startsWith(query)) score += 90;
  else if (title.includes(query)) score += 45;
  return score;
}

function mergeSearchItems(current: RecipeSearchItem[], incoming: RecipeSearchItem[]) {
  return [...new Map([...current, ...incoming].map((item) => [`${item.href}|${item.title}`, item])).values()];
}

export function RecipeLibrarySearch({ initialItems }: { initialItems: RecipeSearchItem[] }) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(initialItems);
  const [libraryState, setLibraryState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const requestRef = useRef<Promise<void> | null>(null);
  const normalizedQuery = normalizeSearchText(query);
  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    const tokens = normalizedQuery.split(" ").filter(Boolean);
    return items
      .map((item) => ({ item, score: resultScore(item, normalizedQuery, tokens) }))
      .filter((result) => result.score >= 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .slice(0, 12)
      .map((result) => result.item);
  }, [items, normalizedQuery]);

  const loadFullLibrary = () => {
    if (requestRef.current || libraryState === "loaded") return;
    setLibraryState("loading");
    requestRef.current = fetch("/api/recipe-search", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Recipe search index could not be loaded");
        return response.json() as Promise<RecipeSearchItem[]>;
      })
      .then((incoming) => {
        setItems((current) => mergeSearchItems(current, incoming));
        setLibraryState("loaded");
      })
      .catch(() => {
        requestRef.current = null;
        setLibraryState("error");
      });
  };

  return (
    <div className="recipe-library-search">
      <div className="recipe-library-search-control">
        <span aria-hidden="true" className="recipe-library-search-icon">⌕</span>
        <label className="sr-only" htmlFor={inputId}>Search recipes and guides</label>
        <input
          autoComplete="off"
          id={inputId}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            if (event.currentTarget.value.trim()) loadFullLibrary();
          }}
          onFocus={loadFullLibrary}
          onKeyDown={(event) => {
            if (event.key === "Escape") setQuery("");
          }}
          placeholder="Search the entire recipe library"
          type="search"
          value={query}
        />
        {query && (
          <button aria-label="Clear recipe search" onClick={() => setQuery("")} type="button">×</button>
        )}
      </div>

      {normalizedQuery && (
        <div aria-live="polite" className="recipe-library-search-results">
          <div className="recipe-library-search-status">
            {libraryState === "loading"
              ? "Loading the full cookbook index…"
              : results.length > 0
                ? `Top ${results.length} matches`
                : "No matches found"}
            <span>{libraryState === "error" ? "Library unavailable" : `${items.length} indexed entries`}</span>
          </div>
          {results.length > 0 && (
            <ul aria-label="Recipe search results" className="recipe-library-search-list">
              {results.map((item) => (
                <li key={`${item.kind}-${item.href}-${item.title}`}>
                  <Link
                    className="recipe-library-search-result"
                    href={item.href}
                    onClick={() => setQuery("")}
                  >
                    <span className="recipe-library-search-copy">
                      <strong>{item.title}</strong>
                      <small>{item.context}</small>
                    </span>
                    <span className="recipe-library-search-kind">{item.kind}</span>
                    <span aria-hidden="true" className="recipe-library-search-arrow">↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
