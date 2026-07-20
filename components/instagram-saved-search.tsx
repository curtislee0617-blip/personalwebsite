"use client";

import { useMemo, useState } from "react";

type SearchEntry = { categories?: string[]; slug: string; title: string };

export function InstagramSavedSearch({
  entries,
  idPrefix = "instagram",
  label = "Search saved posts",
  placeholder = "Search dishes, ingredients, or categories",
}: {
  entries: SearchEntry[];
  idPrefix?: string;
  label?: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return entries.filter((entry) => `${entry.title} ${(entry.categories ?? []).join(" ")}`.toLowerCase().includes(normalized)).slice(0, 16);
  }, [entries, query]);
  const inputId = `${idPrefix}-saved-query`;

  return (
    <div className="instagram-saved-search">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={query}
      />
      {query.trim() && (
        <div className="instagram-saved-search-results">
          {results.length > 0 ? results.map((entry) => (
            <a href={`#recipe-${entry.slug}`} key={entry.slug}>{entry.title}</a>
          )) : <p>No matching saved posts.</p>}
        </div>
      )}
    </div>
  );
}
