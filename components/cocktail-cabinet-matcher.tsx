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
  substitutions: IngredientSubstitution[];
};

type IngredientIdentity = {
  key: string;
  label: string;
};

type IngredientSubstitution = {
  have: string;
  needed: string;
};

type BookMatchGroup = {
  bookId: string;
  bookTitle: string;
  recipes: MatchedRecipe[];
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
const IGNORE = /\b(?:garnish|decorate|optional|ice cubes?|crushed ice|large rock|cold water|filtered water|boiling water|warm water)\b/i;
const QUANTITY = /^(?:about\s+|approximately\s+|scant\s+)?(?:\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]|\d+[¼½¾⅓⅔⅛⅜⅝⅞])(?:\s*[–-]\s*\d+)?\s*/i;
const UNIT = /^(?:ounces?|oz\.?|measures?|teaspoons?|tablespoons?|barspoons?|dashes?|drops?|cups?|grams?|g|kg|ml|milliliters?|liters?|parts?|bottles?|cans?|pieces?|slices?|wedges?|sprigs?|leaves?|whole|large|small|medium|pinches?|handfuls?)\s+(?:of\s+)?/i;
const DESCRIPTORS = /\b(?:fresh|cold|chilled|strained|hulled|peeled|coarsely chopped|finely grated|thinly sliced|lightly crushed|expressed)\b/g;

const INGREDIENT_IDENTITIES: Array<IngredientIdentity & { pattern: RegExp }> = [
  { key: "cointreau", label: "Cointreau", pattern: /\bcointreau\b/ },
  { key: "triple sec", label: "triple sec", pattern: /\btriple sec\b/ },
  { key: "orange curacao", label: "orange curaçao", pattern: /\b(?:orange curacao|curacao orange|dry curacao|pierre ferrand curacao)\b/ },
  { key: "orange liqueur", label: "orange liqueur", pattern: /\b(?:orange liqueur|royal combier|grand marnier)\b/ },
  { key: "cognac", label: "Cognac", pattern: /\bcognac\b/ },
  { key: "armagnac", label: "Armagnac", pattern: /\b(?:armagnac|bas armagnac)\b/ },
  { key: "calvados", label: "Calvados", pattern: /\bcalvados\b/ },
  { key: "applejack", label: "applejack", pattern: /\bapplejack\b/ },
  { key: "apple brandy", label: "apple brandy", pattern: /\b(?:apple brandy|laird s straight apple)\b/ },
  { key: "pear brandy", label: "pear brandy", pattern: /\bpear brandy\b/ },
  { key: "brandy", label: "brandy", pattern: /\bbrandy\b/ },
  { key: "bourbon", label: "bourbon", pattern: /\bbourbon\b/ },
  { key: "rye whiskey", label: "rye whiskey", pattern: /\b(?:rye whiskey|rye whisky|rye)\b/ },
  { key: "scotch", label: "Scotch", pattern: /\bscotch\b/ },
  { key: "irish whiskey", label: "Irish whiskey", pattern: /\birish whisk(?:e)?y\b/ },
  { key: "japanese whisky", label: "Japanese whisky", pattern: /\bjapanese whisk(?:e)?y\b/ },
  { key: "whiskey", label: "whiskey", pattern: /\bwhisk(?:e)?y\b/ },
  { key: "rhum agricole", label: "rhum agricole", pattern: /\brhum agricole\b/ },
  { key: "cachaca", label: "cachaça", pattern: /\bcachaca\b/ },
  { key: "rum", label: "rum", pattern: /\b(?:rum|rhum)\b/ },
  { key: "gin", label: "gin", pattern: /\bgin\b/ },
  { key: "vodka", label: "vodka", pattern: /\bvodka\b/ },
  { key: "tequila", label: "tequila", pattern: /\btequila\b/ },
  { key: "mezcal", label: "mezcal", pattern: /\bmezcal\b/ },
  { key: "pisco", label: "pisco", pattern: /\bpisco\b/ },
  { key: "aquavit", label: "aquavit", pattern: /\b(?:aquavit|akvavit)\b/ },
  { key: "sweet vermouth", label: "sweet vermouth", pattern: /\b(?:sweet vermouth|vermouth rosso|rosso vermouth|italian vermouth|carpano antica formula)\b/ },
  { key: "dry vermouth", label: "dry vermouth", pattern: /\b(?:dry vermouth|french vermouth)\b/ },
  { key: "blanc vermouth", label: "blanc vermouth", pattern: /\b(?:blanc vermouth|bianco vermouth)\b/ },
  { key: "vermouth", label: "vermouth", pattern: /\bvermouth\b/ },
  { key: "sherry", label: "sherry", pattern: /\b(?:sherry|fino|amontillado|oloroso|palo cortado|manzanilla)\b/ },
  { key: "madeira", label: "Madeira", pattern: /\bmadeira\b/ },
  { key: "port", label: "port", pattern: /\b(?:ruby port|tawny port|white port|port wine|port)\b/ },
  { key: "amaro", label: "amaro", pattern: /\b(?:amaro|ramazzotti|averna|meletti|nonino|montenegro|cio ciaro|ciociaro)\b/ },
  { key: "campari", label: "Campari", pattern: /\bcampari\b/ },
  { key: "aperol", label: "Aperol", pattern: /\baperol\b/ },
  { key: "benedictine", label: "Bénédictine", pattern: /\bbenedictine\b/ },
  { key: "green chartreuse", label: "green Chartreuse", pattern: /\bgreen chartreuse\b/ },
  { key: "yellow chartreuse", label: "yellow Chartreuse", pattern: /\byellow chartreuse\b/ },
  { key: "chartreuse", label: "Chartreuse", pattern: /\bchartreuse\b/ },
  { key: "maraschino liqueur", label: "maraschino liqueur", pattern: /\bmaraschino(?: liqueur)?\b/ },
  { key: "creme de cacao", label: "crème de cacao", pattern: /\bcreme de cacao\b/ },
  { key: "coffee liqueur", label: "coffee liqueur", pattern: /\b(?:coffee liqueur|kahlua)\b/ },
  { key: "elderflower liqueur", label: "elderflower liqueur", pattern: /\b(?:elderflower liqueur|st germain)\b/ },
  { key: "absinthe", label: "absinthe", pattern: /\babsinthe\b/ },
  { key: "pastis", label: "pastis", pattern: /\b(?:pastis|pernod)\b/ },
  { key: "aromatic bitters", label: "aromatic bitters", pattern: /\b(?:angostura bitters|aromatic bitters)\b/ },
  { key: "peychauds bitters", label: "Peychaud’s bitters", pattern: /\bpeychaud s bitters\b/ },
  { key: "orange bitters", label: "orange bitters", pattern: /\borange bitters\b/ },
  { key: "bitters", label: "bitters", pattern: /\bbitters\b/ },
  { key: "demerara syrup", label: "Demerara syrup", pattern: /\b(?:demerara gum syrup|demerara syrup)\b/ },
  { key: "gum syrup", label: "gum syrup", pattern: /\bgum syrup\b/ },
  { key: "simple syrup", label: "simple syrup", pattern: /\b(?:simple syrup|cane sugar syrup|sugar syrup)\b/ },
  { key: "honey syrup", label: "honey syrup", pattern: /\bhoney syrup\b/ },
  { key: "agave syrup", label: "agave syrup", pattern: /\b(?:agave syrup|agave nectar)\b/ },
  { key: "maple syrup", label: "maple syrup", pattern: /\bmaple syrup\b/ },
  { key: "sugar", label: "sugar", pattern: /\b(?:sugar cube|white sugar|cane sugar|caster sugar|granulated sugar|sugar)\b/ },
  { key: "lemon", label: "lemon", pattern: /\blemons?\b/ },
  { key: "lime", label: "lime", pattern: /\blimes?\b/ },
  { key: "grapefruit", label: "grapefruit", pattern: /\bgrapefruits?\b/ },
  { key: "orange", label: "orange", pattern: /\boranges?\b/ },
  { key: "pineapple", label: "pineapple", pattern: /\bpineapple\b/ },
  { key: "champagne", label: "Champagne", pattern: /\bchampagne\b/ },
  { key: "prosecco", label: "Prosecco", pattern: /\bprosecco\b/ },
  { key: "cava", label: "Cava", pattern: /\bcava\b/ },
  { key: "sparkling wine", label: "sparkling wine", pattern: /\bsparkling wine\b/ },
  { key: "soda water", label: "soda water", pattern: /\b(?:soda water|club soda|seltzer|sparkling water)\b/ },
  { key: "tonic water", label: "tonic water", pattern: /\btonic water\b/ },
  { key: "ginger beer", label: "ginger beer", pattern: /\bginger beer\b/ },
  { key: "ginger ale", label: "ginger ale", pattern: /\bginger ale\b/ },
  { key: "egg white", label: "egg white", pattern: /\begg whites?\b/ },
  { key: "aquafaba", label: "aquafaba", pattern: /\baquafaba\b/ },
];

const SUBSTITUTIONS: Record<string, string[]> = {
  "triple sec": ["cointreau", "orange liqueur", "orange curacao"],
  cointreau: ["triple sec", "orange liqueur", "orange curacao"],
  "orange liqueur": ["cointreau", "triple sec", "orange curacao"],
  "orange curacao": ["cointreau", "triple sec", "orange liqueur"],
  cognac: ["brandy", "armagnac"],
  brandy: ["cognac", "armagnac"],
  armagnac: ["cognac", "brandy"],
  calvados: ["apple brandy", "applejack"],
  "apple brandy": ["calvados", "applejack"],
  applejack: ["apple brandy", "calvados"],
  bourbon: ["rye whiskey", "whiskey"],
  "rye whiskey": ["bourbon", "whiskey"],
  whiskey: ["bourbon", "rye whiskey", "scotch", "irish whiskey", "japanese whisky"],
  scotch: ["whiskey"],
  "irish whiskey": ["whiskey"],
  "japanese whisky": ["whiskey"],
  "rhum agricole": ["rum"],
  rum: ["rhum agricole"],
  "sweet vermouth": ["vermouth"],
  "dry vermouth": ["blanc vermouth", "vermouth"],
  "blanc vermouth": ["dry vermouth", "vermouth"],
  vermouth: ["sweet vermouth", "dry vermouth", "blanc vermouth"],
  "green chartreuse": ["chartreuse"],
  "yellow chartreuse": ["chartreuse"],
  chartreuse: ["green chartreuse", "yellow chartreuse"],
  absinthe: ["pastis"],
  pastis: ["absinthe"],
  "demerara syrup": ["gum syrup", "simple syrup"],
  "gum syrup": ["demerara syrup", "simple syrup"],
  "simple syrup": ["demerara syrup", "gum syrup", "agave syrup", "sugar"],
  sugar: ["simple syrup", "demerara syrup", "gum syrup"],
  champagne: ["sparkling wine", "prosecco", "cava"],
  "sparkling wine": ["champagne", "prosecco", "cava"],
  prosecco: ["sparkling wine", "champagne", "cava"],
  cava: ["sparkling wine", "champagne", "prosecco"],
  "egg white": ["aquafaba"],
  aquafaba: ["egg white"],
};

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
  value = value
    .replace(/\b(?:this|following|previous) page\b/g, "")
    .replace(/,.*$/, "")
    .replace(/\bto taste\b.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return value;
}

function ingredientIdentity(value: string): IngredientIdentity {
  const normalized = ingredientName(value) || normalize(value);
  if (/\binfused\b/.test(normalized)) return { key: normalized, label: normalized };
  const identity = INGREDIENT_IDENTITIES.find((candidate) => candidate.pattern.test(normalized));
  return identity ? { key: identity.key, label: identity.label } : { key: normalized, label: normalized };
}

function matchIngredient(required: string, inventory: IngredientIdentity[]) {
  const requiredIdentity = ingredientIdentity(required);
  const exact = inventory.find((item) => item.key === requiredIdentity.key);
  if (exact) return { kind: "exact" as const, have: exact.label, required: requiredIdentity };

  const alternatives = SUBSTITUTIONS[requiredIdentity.key] ?? [];
  const substitute = inventory.find((item) => alternatives.includes(item.key));
  if (substitute) return { kind: "substitution" as const, have: substitute.label, required: requiredIdentity };

  return { kind: "missing" as const, required: requiredIdentity };
}

function groupByBook(recipes: MatchedRecipe[], bookOrder: string[]): BookMatchGroup[] {
  const groups = new Map<string, BookMatchGroup>();
  for (const recipe of recipes) {
    const existing = groups.get(recipe.bookId);
    if (existing) {
      existing.recipes.push(recipe);
    } else {
      groups.set(recipe.bookId, {
        bookId: recipe.bookId,
        bookTitle: recipe.bookTitle,
        recipes: [recipe],
      });
    }
  }
  return [...groups.values()].sort((a, b) => bookOrder.indexOf(a.bookId) - bookOrder.indexOf(b.bookId));
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
  const matchLabel = recipe.missing.length > 0
    ? "One ingredient away"
    : recipe.substitutions.length > 0
      ? `${recipe.substitutions.length} substitution${recipe.substitutions.length === 1 ? "" : "s"}`
      : "Exact match";

  return (
    <article className="cocktail-cabinet-result-card">
      <Link href={recipe.href}>
        <small className="cocktail-cabinet-match-label">{matchLabel}</small>
        <strong>{recipe.title}</strong>
        <span>{recipe.section}</span>
        {recipe.substitutions.length > 0 && (
          <small className="cocktail-cabinet-substitutions">
            {recipe.substitutions.map((item) => `${item.have} → ${item.needed}`).join(" · ")}
          </small>
        )}
        {recipe.missing.length > 0 ? (
          <small className="cocktail-cabinet-missing">Missing: {recipe.missing.join(", ")}</small>
        ) : (
          <small>{`All ${recipe.required.length} listed ingredients matched`}</small>
        )}
      </Link>
      {recipe.missing.length === 0 && (
        <button onClick={() => onLog(recipe)} type="button">{logged ? "Log again" : "Log as made"}</button>
      )}
    </article>
  );
}

function BookResultGroups({
  bookOrder,
  empty,
  loggedRecipeIds,
  mode,
  onLog,
  recipes,
}: {
  bookOrder: string[];
  empty: string;
  loggedRecipeIds: Set<string>;
  mode: "makeable" | "one-away";
  onLog: (recipe: MatchedRecipe) => void;
  recipes: MatchedRecipe[];
}) {
  const groups = groupByBook(recipes, bookOrder);
  if (groups.length === 0) return <p className="cocktail-cabinet-empty">{empty}</p>;

  return (
    <div className="cocktail-cabinet-book-groups">
      {groups.map((group) => {
        const exactCount = group.recipes.filter((recipe) => recipe.substitutions.length === 0).length;
        const substitutionCount = group.recipes.length - exactCount;
        return (
          <details className="cocktail-cabinet-book-group" key={group.bookId}>
            <summary>
              <span>
                <strong>{group.bookTitle}</strong>
                <small>
                  {group.recipes.length} recipe{group.recipes.length === 1 ? "" : "s"}
                  {exactCount > 0 ? ` · ${exactCount} ${mode === "makeable" ? "exact" : "without replacements"}` : ""}
                  {substitutionCount > 0 ? ` · ${substitutionCount} with replacements` : ""}
                </small>
              </span>
              <i aria-hidden="true">+</i>
            </summary>
            <div className="cocktail-cabinet-result-grid">
              {group.recipes.map((recipe) => (
                <MatchCard key={recipe.id} logged={loggedRecipeIds.has(recipe.id)} onLog={onLog} recipe={recipe} />
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}

export function CocktailCabinetMatcher({ recipes }: { recipes: CocktailMatcherRecipe[] }) {
  const [active, setActive] = useState(false);
  const snapshot = useSyncExternalStore(subscribeToCabinet, readCabinetSnapshot, () => DEFAULT_STORE_JSON);
  const store = useMemo(() => parseCabinetStore(snapshot), [snapshot]);
  const activeProfile = store.profiles.find((profile) => profile.id === store.activeId) ?? store.profiles[0];
  const deferredValue = useDeferredValue(activeProfile.value);
  const bookOrder = useMemo(() => Array.from(new Set(recipes.map((recipe) => recipe.bookId))), [recipes]);

  const inventory = useMemo(
    () => Array.from(
      new Map(
        deferredValue
          .split(/[\n,;]+/)
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => {
            const identity = ingredientIdentity(item);
            return [identity.key, { ...identity, label: item.trim() }] as const;
          }),
      ).values(),
    ),
    [deferredValue],
  );
  const matches = useMemo(() => recipes.map((recipe) => {
    const required = Array.from(new Set(recipe.ingredients.map(ingredientName).filter(Boolean)));
    const ingredientMatches = required.map((ingredient) => matchIngredient(ingredient, inventory));
    const missing = ingredientMatches
      .filter((match) => match.kind === "missing")
      .map((match) => match.required.label);
    const substitutions = ingredientMatches.flatMap((match): IngredientSubstitution[] => (
      match.kind === "substitution"
        ? [{ have: match.have, needed: match.required.label }]
        : []
    ));
    return { ...recipe, required, missing, substitutions };
  }).sort((a, b) => (
    a.missing.length - b.missing.length
    || a.substitutions.length - b.substitutions.length
    || a.title.localeCompare(b.title)
  )), [inventory, recipes]);
  const makeable = active ? matches.filter((recipe) => recipe.missing.length === 0) : [];
  const oneAway = active ? matches.filter((recipe) => recipe.missing.length === 1) : [];
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
        <p>Keep separate saved bars or pantries, match their ingredients against the entire library, and log cocktails as you make them. Exact builds appear first, followed by clearly labelled replacements.</p>
        <details className="cocktail-cabinet-substitution-notes">
          <summary>How ingredient families work</summary>
          <div>
            <p>Producer names and age statements do not split the same base spirit. Cognac therefore matches any Cognac recipe; another brandy is shown as a replacement. Cointreau can replace triple sec, and related sparkling wines are shown as replacements rather than silent exact matches.</p>
            <span>
              Sources:{" "}
              <a href="https://www.cointreau.com/us/en/discover-cointreau/cointreau-triple-sec" rel="noreferrer" target="_blank">Cointreau on triple sec</a>
              {" · "}
              <a href="https://www.cognac.fr/en/discover/a-unique-spirit/one-culture-une-histoire/" rel="noreferrer" target="_blank">Bureau National Interprofessionnel du Cognac</a>
              {" · "}
              <a href="https://www.champagne.fr/en/about-champagne/a-great-blended-wine/champagne-designation" rel="noreferrer" target="_blank">Comité Champagne</a>
            </span>
          </div>
        </details>
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
            <p className="cocktail-cabinet-results-note">Open a book to see its recipes. Exact matches are ranked before recipes using replacements.</p>
            <BookResultGroups
              bookOrder={bookOrder}
              empty="No complete matches yet. Recipes missing only one ingredient are listed below."
              loggedRecipeIds={loggedRecipeIds}
              mode="makeable"
              onLog={logRecipe}
              recipes={makeable}
            />
          </div>
          <div>
            <h3>One ingredient away <span>{oneAway.length}</span></h3>
            <p className="cocktail-cabinet-results-note">Each of these can be completed by adding the single missing ingredient shown on its card.</p>
            <BookResultGroups
              bookOrder={bookOrder}
              empty="No recipes are exactly one ingredient away with this pantry."
              loggedRecipeIds={loggedRecipeIds}
              mode="one-away"
              onLog={logRecipe}
              recipes={oneAway}
            />
          </div>
        </div>
      )}
    </section>
  );
}
