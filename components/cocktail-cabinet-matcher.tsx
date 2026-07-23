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

type PantryUsage = {
  id: string;
  recipeId: string;
  title: string;
  bookTitle: string;
  usedAt: string;
  ingredients: string[];
};

type PantryProfile = {
  id: string;
  name: string;
  value: string;
  usage: PantryUsage[];
};

type PantryStore = {
  activeId: string;
  profiles: PantryProfile[];
};

type MatchedRecipe = CocktailMatcherRecipe & {
  required: string[];
  missing: string[];
};

const LEGACY_STORAGE_KEY = "curtis-cocktail-cabinet";
const STORAGE_KEY = "curtis-cocktail-cabinet-profiles-v1";
const STORAGE_EVENT = "curtis-cocktail-cabinet-change";
const DEFAULT_PROFILE_ID = "main-bar";
const DEFAULT_STORE: PantryStore = {
  activeId: DEFAULT_PROFILE_ID,
  profiles: [{ id: DEFAULT_PROFILE_ID, name: "Main bar", value: "", usage: [] }],
};
const DEFAULT_STORE_JSON = JSON.stringify(DEFAULT_STORE);
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

function readCabinetSnapshot() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved) return saved;
  const legacyValue = window.localStorage.getItem(LEGACY_STORAGE_KEY) ?? "";
  return JSON.stringify({
    ...DEFAULT_STORE,
    profiles: [{ ...DEFAULT_STORE.profiles[0], value: legacyValue }],
  });
}

function parseCabinetStore(snapshot: string): PantryStore {
  try {
    const parsed = JSON.parse(snapshot) as Partial<PantryStore>;
    const profiles = Array.isArray(parsed.profiles)
      ? parsed.profiles.flatMap((profile): PantryProfile[] => {
        if (!profile || typeof profile !== "object") return [];
        const candidate = profile as Partial<PantryProfile>;
        if (typeof candidate.id !== "string" || typeof candidate.name !== "string") return [];
        return [{
          id: candidate.id,
          name: candidate.name.trim() || "Untitled pantry",
          value: typeof candidate.value === "string" ? candidate.value : "",
          usage: Array.isArray(candidate.usage)
            ? candidate.usage.filter((entry): entry is PantryUsage => Boolean(
              entry
              && typeof entry.id === "string"
              && typeof entry.recipeId === "string"
              && typeof entry.title === "string"
              && typeof entry.bookTitle === "string"
              && typeof entry.usedAt === "string"
              && Array.isArray(entry.ingredients),
            ))
            : [],
        }];
      })
      : [];
    if (profiles.length === 0) return DEFAULT_STORE;
    const activeId = profiles.some((profile) => profile.id === parsed.activeId) ? parsed.activeId as string : profiles[0].id;
    return { activeId, profiles };
  } catch {
    return DEFAULT_STORE;
  }
}

function saveCabinetStore(store: PantryStore) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function pantryId() {
  return typeof window.crypto?.randomUUID === "function"
    ? `pantry-${window.crypto.randomUUID()}`
    : `pantry-${Date.now()}`;
}

function usageId() {
  return typeof window.crypto?.randomUUID === "function"
    ? `usage-${window.crypto.randomUUID()}`
    : `usage-${Date.now()}`;
}

function MatchCard({
  logged,
  onLog,
  recipe,
}: {
  logged: boolean;
  onLog: (recipe: MatchedRecipe) => void;
  recipe: MatchedRecipe;
}) {
  return (
    <article className="cocktail-cabinet-result-card">
      <Link href={recipe.href}>
        <strong>{recipe.title}</strong>
        <span>{recipe.bookTitle} · {recipe.section}</span>
        <small>{recipe.missing.length === 0 ? `All ${recipe.required.length} listed ingredients matched` : `Missing: ${recipe.missing.join(", ")}`}</small>
      </Link>
      <button onClick={() => onLog(recipe)} type="button">{logged ? "Log again" : "Log as made"}</button>
    </article>
  );
}

export function CocktailCabinetMatcher({ recipes }: { recipes: CocktailMatcherRecipe[] }) {
  const [active, setActive] = useState(false);
  const snapshot = useSyncExternalStore(subscribeToCabinet, readCabinetSnapshot, () => DEFAULT_STORE_JSON);
  const store = useMemo(() => parseCabinetStore(snapshot), [snapshot]);
  const activeProfile = store.profiles.find((profile) => profile.id === store.activeId) ?? store.profiles[0];
  const deferredValue = useDeferredValue(activeProfile.value);

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
  const loggedRecipeIds = useMemo(() => new Set(activeProfile.usage.map((entry) => entry.recipeId)), [activeProfile.usage]);
  const usedIngredients = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of activeProfile.usage) {
      for (const ingredient of entry.ingredients) counts.set(ingredient, (counts.get(ingredient) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [activeProfile.usage]);

  function updateActiveProfile(update: (profile: PantryProfile) => PantryProfile) {
    saveCabinetStore({
      ...store,
      profiles: store.profiles.map((profile) => profile.id === activeProfile.id ? update(profile) : profile),
    });
  }

  function addPantry() {
    const id = pantryId();
    const nextProfile: PantryProfile = {
      id,
      name: `Pantry ${store.profiles.length + 1}`,
      value: "",
      usage: [],
    };
    saveCabinetStore({ activeId: id, profiles: [...store.profiles, nextProfile] });
    setActive(false);
  }

  function removeActivePantry() {
    if (store.profiles.length <= 1) return;
    const profiles = store.profiles.filter((profile) => profile.id !== activeProfile.id);
    saveCabinetStore({ activeId: profiles[0].id, profiles });
    setActive(false);
  }

  function logRecipe(recipe: MatchedRecipe) {
    const usage: PantryUsage = {
      id: usageId(),
      recipeId: recipe.id,
      title: recipe.title,
      bookTitle: recipe.bookTitle,
      usedAt: new Date().toISOString(),
      ingredients: recipe.required,
    };
    updateActiveProfile((profile) => ({ ...profile, usage: [usage, ...profile.usage].slice(0, 250) }));
  }

  function removeUsage(id: string) {
    updateActiveProfile((profile) => ({ ...profile, usage: profile.usage.filter((entry) => entry.id !== id) }));
  }

  return (
    <section className="cocktail-cabinet-tool">
      <div className="cocktail-cabinet-intro">
        <p className="eyebrow">Admin tool</p>
        <h2>What can I make?</h2>
        <p>Keep separate saved bars or pantries, match their ingredients against the entire library, and log cocktails as you make them.</p>
      </div>

      <div className="cocktail-pantry-manager">
        <label htmlFor="cocktail-pantry-profile">Saved pantry</label>
        <select
          id="cocktail-pantry-profile"
          onChange={(event) => {
            saveCabinetStore({ ...store, activeId: event.currentTarget.value });
            setActive(false);
          }}
          value={activeProfile.id}
        >
          {store.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
        </select>
        <button onClick={addPantry} type="button">+ New</button>
        <button disabled={store.profiles.length <= 1} onClick={removeActivePantry} type="button">Delete</button>
        <label className="cocktail-pantry-name-label" htmlFor="cocktail-pantry-name">Pantry name</label>
        <input
          id="cocktail-pantry-name"
          maxLength={48}
          onChange={(event) => updateActiveProfile((profile) => ({ ...profile, name: event.currentTarget.value }))}
          type="text"
          value={activeProfile.name}
        />
      </div>

      <div className="cocktail-cabinet-form">
        <label htmlFor="cocktail-cabinet">Ingredients in {activeProfile.name}</label>
        <textarea
          id="cocktail-cabinet"
          onChange={(event) => {
            updateActiveProfile((profile) => ({ ...profile, value: event.currentTarget.value }));
            setActive(false);
          }}
          placeholder={"gin, bourbon, sweet vermouth\nCampari\nlemons, limes, simple syrup"}
          rows={7}
          value={activeProfile.value}
        />
        <div>
          <button disabled={inventory.length === 0} onClick={() => setActive(true)} type="button">Check {recipes.length} recipes</button>
          <button onClick={() => {
            updateActiveProfile((profile) => ({ ...profile, value: "" }));
            setActive(false);
          }} type="button">Clear ingredients</button>
          <small>{inventory.length} ingredients · {activeProfile.usage.length} drinks logged · saved on this device</small>
        </div>
      </div>

      {(activeProfile.usage.length > 0 || usedIngredients.length > 0) && (
        <details className="cocktail-pantry-usage" open>
          <summary>
            <span><strong>Usage log</strong><small>{activeProfile.usage.length} drinks made from {activeProfile.name}</small></span>
            <i aria-hidden="true">+</i>
          </summary>
          <div className="cocktail-pantry-usage-body">
            {usedIngredients.length > 0 && (
              <div className="cocktail-pantry-used-ingredients">
                <p className="eyebrow">Ingredients used</p>
                <div>{usedIngredients.slice(0, 30).map(([ingredient, count]) => <span key={ingredient}>{ingredient} <b>{count}</b></span>)}</div>
              </div>
            )}
            <div className="cocktail-pantry-history">
              {activeProfile.usage.map((entry) => (
                <article key={entry.id}>
                  <div>
                    <strong>{entry.title}</strong>
                    <span>{entry.bookTitle} · {new Date(entry.usedAt).toLocaleString()}</span>
                    <small>{entry.ingredients.join(" · ")}</small>
                  </div>
                  <button aria-label={`Remove ${entry.title} from usage log`} onClick={() => removeUsage(entry.id)} type="button">Remove</button>
                </article>
              ))}
            </div>
          </div>
        </details>
      )}

      {active && (
        <div className="cocktail-cabinet-results">
          <div>
            <h3>Can make now <span>{makeable.length}</span></h3>
            <div className="cocktail-cabinet-result-grid">
              {makeable.slice(0, 60).map((recipe) => (
                <MatchCard key={recipe.id} logged={loggedRecipeIds.has(recipe.id)} onLog={logRecipe} recipe={recipe} />
              ))}
              {makeable.length === 0 && <p>No exact matches yet. The closest recipes are listed below.</p>}
            </div>
          </div>
          <div>
            <h3>Closest recipes <span>{close.length}</span></h3>
            <div className="cocktail-cabinet-result-grid">
              {close.slice(0, 60).map((recipe) => (
                <MatchCard key={recipe.id} logged={loggedRecipeIds.has(recipe.id)} onLog={logRecipe} recipe={recipe} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
