import assert from "node:assert/strict";
import test from "node:test";
import {
  EMPTY_PANTRY, PANTRY_KEYS, mergeRecoveredPantries, parsePantryStore, readPantryStorage, writePantryStorage,
} from "../lib/cocktail-pantry-storage.ts";

function memoryStorage(values = {}) {
  const entries = new Map(Object.entries(values));
  return { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
}
function pantry(value, name = "Main bar") {
  return { activeId: "main-bar", profiles: [{ id: "main-bar", name, value, usage: [] }] };
}

test("missing storage is not reported as a saved list", () => {
  assert.equal(readPantryStorage(memoryStorage()).source, "empty");
});

test("earlier single-list storage survives migration and saving", () => {
  const storage = memoryStorage({ [PANTRY_KEYS.legacy]: "gin\nCampari\nsweet vermouth" });
  const migrated = readPantryStorage(storage);
  assert.equal(migrated.source, "legacy");
  writePantryStorage(storage, migrated.store, true);
  assert.equal(readPantryStorage(storage).source, "current");
  assert.equal(storage.getItem(PANTRY_KEYS.legacy), "gin\nCampari\nsweet vermouth");
  assert.deepEqual(parsePantryStore(storage.getItem(PANTRY_KEYS.saved)), migrated.store);
});

test("explicit saving retains all named pantries and usage across a reload", () => {
  const store = pantry("gin\nlemon");
  store.profiles.push({ id: "london", name: "London bar", value: "rum\nlime", usage: [
    { id: "made-1", recipeId: "daiquiri", title: "Daiquiri", bookTitle: "Cocktail Codex", usedAt: "2026-09-29T00:00:00Z", ingredients: ["rum", "lime"] },
  ] });
  store.activeId = "london";
  const storage = memoryStorage();
  writePantryStorage(storage, store, true);
  assert.deepEqual(readPantryStorage(storage).store, store);
  assert.deepEqual(parsePantryStore(storage.getItem(PANTRY_KEYS.saved)), store);
});

test("a damaged current record falls back to the saved list and preserves the raw record", () => {
  const store = pantry("bourbon\naromatic bitters");
  const storage = memoryStorage({ [PANTRY_KEYS.current]: "{damaged", [PANTRY_KEYS.saved]: JSON.stringify(store) });
  const recovered = readPantryStorage(storage);
  assert.equal(recovered.source, "saved");
  assert.deepEqual(recovered.store, store);
  writePantryStorage(storage, recovered.store, true);
  assert.equal(storage.getItem(PANTRY_KEYS.damaged), "{damaged");
});

test("clearing and saving an empty pantry does not erase the full recovery copy", () => {
  const storage = memoryStorage();
  const full = pantry("gin\nCampari\nsweet vermouth");
  writePantryStorage(storage, full, true);
  writePantryStorage(storage, EMPTY_PANTRY);
  writePantryStorage(storage, EMPTY_PANTRY, true);
  assert.equal(readPantryStorage(storage).store.profiles[0].value, "");
  assert.deepEqual(parsePantryStore(storage.getItem(PANTRY_KEYS.saved)), full);
  assert.deepEqual(parsePantryStore(storage.getItem(PANTRY_KEYS.backup)), full);
});

test("deleting a populated profile keeps it in the previous-list backup", () => {
  const original = pantry("gin");
  original.profiles.push({ id: "holiday", name: "Holiday bar", value: "mezcal", usage: [] });
  const storage = memoryStorage({ [PANTRY_KEYS.current]: JSON.stringify(original) });
  writePantryStorage(storage, pantry("gin"));
  assert.deepEqual(parsePantryStore(storage.getItem(PANTRY_KEYS.backup)), original);
});

test("an earlier list remains recoverable even when the current record is blank", () => {
  const storage = memoryStorage({ [PANTRY_KEYS.current]: JSON.stringify(EMPTY_PANTRY), [PANTRY_KEYS.legacy]: "rum\nlime" });
  const state = readPantryStorage(storage);
  assert.equal(state.source, "current");
  assert.equal(state.store.profiles[0].value, "");
  assert.equal(state.recovery[0].source, "legacy");
  assert.equal(state.recovery[0].store.profiles[0].value, "rum\nlime");
});

test("restoring/importing does not overwrite a different current list", () => {
  const current = pantry("vodka");
  const recovered = pantry("rum\nlime");
  const merged = mergeRecoveredPantries(current, recovered);
  assert.equal(merged.profiles.length, 2);
  assert.equal(merged.profiles[0].value, "vodka");
  assert.equal(merged.profiles.find((profile) => profile.id === merged.activeId).value, "rum\nlime");
  assert.deepEqual(current, pantry("vodka"));
  assert.deepEqual(mergeRecoveredPantries(EMPTY_PANTRY, recovered), recovered);
  assert.deepEqual(mergeRecoveredPantries(current, current), current);
});

test("storage write failures and silent no-op writes never report success", () => {
  const full = pantry("gin");
  assert.throws(() => writePantryStorage({ getItem: () => null, setItem: () => { throw new Error("quota"); } }, full, true), /quota/);
  assert.throws(() => writePantryStorage({ getItem: () => null, setItem: () => {} }, full, true), /did not retain/);
});

test("malformed backups are rejected instead of replacing a valid pantry with an empty list", () => {
  for (const raw of ["null", "[]", "{}", '{"profiles":[]}', '{"profiles":[{"id":"x","name":"bar"}]}']) {
    assert.equal(parsePantryStore(raw), null);
  }
});
