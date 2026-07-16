/* eslint-disable @next/next/no-img-element */

"use client";

import { useMemo, useState } from "react";

type RecipeLinkOption = {
  key: string;
  title: string;
  description: string;
  thumbnail?: string;
};

export function RecipeLinkPicker({ options, selectedKeys }: { options: RecipeLinkOption[]; selectedKeys: string[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Set(selectedKeys));
  const visibleOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => `${option.title} ${option.description}`.toLowerCase().includes(normalized));
  }, [options, query]);

  function toggle(key: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="recipe-link-picker">
      {[...selected].map((key) => <input key={key} name="linked_recipes" type="hidden" value={key} />)}
      <div className="recipe-link-picker-search">
        <label htmlFor="linked-recipe-search">Find a recipe</label>
        <input
          id="linked-recipe-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles or descriptions"
          type="search"
          value={query}
        />
        <span>{selected.size} linked</span>
      </div>
      <div className="recipe-link-picker-options">
        {visibleOptions.map((option) => (
          <label className={selected.has(option.key) ? "is-selected" : ""} key={option.key}>
            {option.thumbnail ? <img alt="" src={option.thumbnail} /> : <span aria-hidden="true" className="recipe-link-picker-placeholder">R</span>}
            <span>
              <strong>{option.title}</strong>
              <small>{option.description}</small>
            </span>
            <input
              checked={selected.has(option.key)}
              onChange={() => toggle(option.key)}
              type="checkbox"
            />
          </label>
        ))}
        {visibleOptions.length === 0 && <p>No recipes match that search.</p>}
      </div>
    </div>
  );
}
