"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState, useSyncExternalStore } from "react";

export type CocktailMatcherRecipe = {
  id: string;
  title: string;
  bookId: string;
  bookTitle: string;
  section: string;
  href: string;
  ingredients: string[];
};

const STORAGE_KEY = "curtis-cocktail-cabinet";
const STORAGE_EVENT = "curtis-cocktail-cabinet-change";
const IGNORE = /\b(?:garnish|decorate|optional|ice cubes?|crushed ice|large rock|cold water|filtered water)\b/i;
const QUANTITY = /^(?:about\s+|approximately\s+|scant\s+)?(?:\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]|\d+[¼½¾⅓⅔⅛⅜⅝⅞])(?:\s*[–-]\s*\d+)?\s*/i;
const UNIT = /^(?:ounces?|oz\.?|measures?|teaspoons?|tablespoons?|barspoons?|dashes?|drops?|cups?|grams?|g|kg|ml|milliliters?|liters?|parts?|bottles?|cans?|pieces?|slices?|wedges?|sprigs?|leaves?|whole|large|small|medium|pinches?|handfuls?)\s+(?:of\s+)?/i;
const DESCRIPTORS = /\b(?:fresh|cold|chilled|strained|hulled|peeled|coarsely chopped|finely grated|thinly sliced|lightly crushed|expressed|dry)\b/g;

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9& -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ingredientName(line: string) {
  if (IGNORE.test(line)) return "";
  let value = normalize(line.replace(/^garnish:\s*/i, ""));
  value = value.replace(QUANTITY, "").replace(UNIT, "").replace(DESCRIPTORS, "");
  value = value.replace(/,.*$/, "").replace(/\bto taste\b.*$/, "").replace(/\s+/g, " ").trim();
  return value;
}

function matchesInventory(required: string, inventory: string[]) {
  return inventory.some((item) => required === item || required.includes(item) || item.includes(required));
}

function subscribeToCabinet(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function readCabinet() {
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

function saveCabinet(value: string) {
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function CocktailCabinetMatcher({ recipes }: { recipes: CocktailMatcherRecipe[] }) {
  const [active, setActive] = useState(false);
  const value = useSyncExternalStore(subscribeToCabinet, readCabinet, () => "");
  const deferredValue = useDeferredValue(value);

  const inventory = useMemo(
    () => Array.from(new Set(deferredValue.split(/[\n,;]+/).map(normalize).filter(Boolean))),
    [deferredValue],
  );
  const matches = useMemo(() => recipes.map((recipe) => {
    const required = Array.from(new Set(recipe.ingredients.map(ingredientName).filter(Boolean)));
    const missing = required.filter((ingredient) => !matchesInventory(ingredient, inventory));
    return { ...recipe, required, missing };
  }).sort((a, b) => a.missing.length - b.missing.length || a.title.localeCompare(b.title)), [inventory, recipes]);
  const visible = active ? matches.slice(0, 120) : [];
  const makeable = visible.filter((recipe) => recipe.missing.length === 0);
  const close = visible.filter((recipe) => recipe.missing.length > 0 && recipe.missing.length <= 2);

  return (
    <section className="cocktail-cabinet-tool">
      <div className="cocktail-cabinet-intro">
        <p className="eyebrow">Admin tool</p>
        <h2>What can I make?</h2>
        <p>List the bottles, mixers, fruit, syrups, and other ingredients you have. The library is sorted by the fewest missing ingredients.</p>
      </div>
      <div className="cocktail-cabinet-form">
        <label htmlFor="cocktail-cabinet">My bar and pantry</label>
        <textarea
          id="cocktail-cabinet"
          onChange={(event) => { saveCabinet(event.currentTarget.value); setActive(false); }}
          placeholder={"gin, bourbon, sweet vermouth\nCampari\nlemons, limes, simple syrup"}
          rows={7}
          value={value}
        />
        <div>
          <button disabled={inventory.length === 0} onClick={() => setActive(true)} type="button">Check {recipes.length} recipes</button>
          <button onClick={() => { saveCabinet(""); setActive(false); }} type="button">Clear</button>
          <small>{inventory.length} ingredients saved on this device</small>
        </div>
      </div>

      {active && (
        <div className="cocktail-cabinet-results">
          <div>
            <h3>Can make now <span>{makeable.length}</span></h3>
            <div className="cocktail-cabinet-result-grid">
              {makeable.slice(0, 60).map((recipe) => (
                <Link href={recipe.href} key={recipe.id}>
                  <strong>{recipe.title}</strong>
                  <span>{recipe.bookTitle} · {recipe.section}</span>
                  <small>All {recipe.required.length} listed ingredients matched</small>
                </Link>
              ))}
              {makeable.length === 0 && <p>No exact matches yet. The closest recipes are listed below.</p>}
            </div>
          </div>
          <div>
            <h3>Closest recipes <span>{close.length}</span></h3>
            <div className="cocktail-cabinet-result-grid">
              {close.slice(0, 60).map((recipe) => (
                <Link href={recipe.href} key={recipe.id}>
                  <strong>{recipe.title}</strong>
                  <span>{recipe.bookTitle} · {recipe.section}</span>
                  <small>Missing: {recipe.missing.join(", ")}</small>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
