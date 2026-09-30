export type PantryUsage = {
  id: string;
  recipeId: string;
  title: string;
  bookTitle: string;
  usedAt: string;
  ingredients: string[];
};

export type PantryProfile = { id: string; name: string; value: string; usage: PantryUsage[] };
export type PantryStore = { activeId: string; profiles: PantryProfile[] };
type PantryStorage = Pick<Storage, "getItem" | "setItem">;

export const PANTRY_KEYS = {
  current: "curtis-cocktail-cabinet-profiles-v1",
  saved: "curtis-cocktail-cabinet-saved-v1",
  backup: "curtis-cocktail-cabinet-backup-v1",
  legacy: "curtis-cocktail-cabinet",
  damaged: "curtis-cocktail-cabinet-recovery-raw-v1",
} as const;
export const EMPTY_PANTRY: PantryStore = {
  activeId: "main-bar",
  profiles: [{ id: "main-bar", name: "Main bar", value: "", usage: [] }],
};

export type PantryRecovery = { source: "saved" | "backup" | "legacy"; label: string; store: PantryStore };
export type PantryStorageState = {
  store: PantryStore;
  source: "current" | PantryRecovery["source"] | "empty" | "unavailable";
  recovery: PantryRecovery[];
};

export function parsePantryStore(raw: string | null): PantryStore | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("profiles" in parsed) || !Array.isArray(parsed.profiles)) return null;
    const profiles: PantryProfile[] = [];
    for (const candidate of parsed.profiles) {
      if (!candidate || typeof candidate !== "object" || typeof candidate.id !== "string" || !candidate.id
        || typeof candidate.name !== "string" || typeof candidate.value !== "string"
        || profiles.some((profile) => profile.id === candidate.id)) return null;
      profiles.push({
        id: candidate.id,
        name: candidate.name || "Untitled pantry",
        value: candidate.value,
        usage: Array.isArray(candidate.usage) ? candidate.usage.filter((entry: unknown): entry is PantryUsage => {
          if (!entry || typeof entry !== "object") return false;
          const item = entry as Partial<PantryUsage>;
          return [item.id, item.recipeId, item.title, item.bookTitle, item.usedAt].every((value) => typeof value === "string")
            && Array.isArray(item.ingredients) && item.ingredients.every((value) => typeof value === "string");
        }) : [],
      });
    }
    if (!profiles.length) return null;
    const activeId = "activeId" in parsed && profiles.some((profile) => profile.id === parsed.activeId)
      ? parsed.activeId as string : profiles[0].id;
    return { activeId, profiles };
  } catch {
    return null;
  }
}

function hasIngredients(store: PantryStore | null): store is PantryStore {
  return Boolean(store?.profiles.some((profile) => profile.value.trim() || profile.usage.length));
}

export function readPantryStorage(storage: PantryStorage): PantryStorageState {
  const current = parsePantryStore(storage.getItem(PANTRY_KEYS.current));
  const saved = parsePantryStore(storage.getItem(PANTRY_KEYS.saved));
  const backup = parsePantryStore(storage.getItem(PANTRY_KEYS.backup));
  const legacyValue = storage.getItem(PANTRY_KEYS.legacy);
  const legacy: PantryStore | null = legacyValue?.trim()
    ? { ...EMPTY_PANTRY, profiles: [{ ...EMPTY_PANTRY.profiles[0], value: legacyValue }] } : null;
  const recovery: PantryRecovery[] = [];
  for (const item of [
    { source: "saved", label: "Last explicitly saved list", store: saved },
    { source: "backup", label: "Previous list", store: backup },
    { source: "legacy", label: "Earlier bar list", store: legacy },
  ] as const) {
    if (hasIngredients(item.store)) recovery.push({ ...item, store: item.store });
  }
  if (current) return { store: current, source: "current", recovery };
  if (recovery.length) return { store: recovery[0].store, source: recovery[0].source, recovery };
  return { store: EMPTY_PANTRY, source: "empty", recovery };
}

/** Keep a complete list before a clear/delete, and never discard the older storage format. */
export function writePantryStorage(storage: PantryStorage, store: PantryStore, checkpoint = false): void {
  const previous = readPantryStorage(storage).store;
  const rawPrevious = storage.getItem(PANTRY_KEYS.current);
  const serialized = JSON.stringify(store);
  const removedIngredients = previous.profiles.some((profile) =>
    profile.value.trim() && !store.profiles.find((next) => next.id === profile.id)?.value.trim());
  const previousSaved = parsePantryStore(storage.getItem(PANTRY_KEYS.saved));
  if (removedIngredients || (!storage.getItem(PANTRY_KEYS.backup) && hasIngredients(previous))) {
    storage.setItem(PANTRY_KEYS.backup, JSON.stringify(previous));
  } else if (checkpoint && hasIngredients(previousSaved) && JSON.stringify(previousSaved) !== serialized) {
    storage.setItem(PANTRY_KEYS.backup, JSON.stringify(previousSaved));
  }
  if (rawPrevious && !parsePantryStore(rawPrevious)) storage.setItem(PANTRY_KEYS.damaged, rawPrevious);
  storage.setItem(PANTRY_KEYS.current, serialized);
  if (storage.getItem(PANTRY_KEYS.current) !== serialized) throw new Error("Pantry storage did not retain the list.");
  if (checkpoint) {
    // An empty save must not erase the last complete recovery copy.
    if (hasIngredients(store) || !hasIngredients(previousSaved)) storage.setItem(PANTRY_KEYS.saved, serialized);
    if (hasIngredients(store) && storage.getItem(PANTRY_KEYS.saved) !== serialized) throw new Error("Pantry recovery copy was not saved.");
  }
}

/** Restore into separate profiles when the current list differs. */
export function mergeRecoveredPantries(current: PantryStore, recovered: PantryStore): PantryStore {
  const profiles = current.profiles.length === 1 && current.profiles[0].id === "main-bar"
    && current.profiles[0].name === "Main bar" && !hasIngredients(current) ? [] : [...current.profiles];
  let activeId = current.activeId;
  for (const profile of recovered.profiles) {
    const existing = profiles.find((item) => item.name === profile.name && item.value === profile.value
      && JSON.stringify(item.usage) === JSON.stringify(profile.usage));
    if (existing) {
      if (profile.id === recovered.activeId) activeId = existing.id;
      continue;
    }
    let id = profile.id;
    let suffix = 1;
    while (profiles.some((item) => item.id === id)) id = `${profile.id}-recovered-${suffix++}`;
    profiles.push({ ...profile, id, name: id === profile.id ? profile.name : `${profile.name} (recovered)` });
    if (profile.id === recovered.activeId) activeId = id;
  }
  return { activeId, profiles };
}
