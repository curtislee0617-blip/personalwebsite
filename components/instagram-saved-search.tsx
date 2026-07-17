"use client";

import { useMemo, useState } from "react";

type SearchEntry = { categories?: string[]; slug: string; title: string };

export function InstagramSavedSearch({ entries }: { entries: SearchEntry[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return entries.filter((entry) => `${entry.title} ${(entry.categories ?? []).join(" ")}`.toLowerCase().includes(normalized)).slice(0, 16);
  }, [entries, query]);

  return (
    <div className="instagram-saved-search">
      <label htmlFor="instagram-saved-query">Search saved posts</label>
      <input
        id="instagram-saved-query"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search dishes, ingredients, or categories"
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
