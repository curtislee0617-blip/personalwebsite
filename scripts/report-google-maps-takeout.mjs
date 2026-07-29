#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const inputPath = args.find((arg) => !arg.startsWith("--"))
  ?? "imports/google-maps/staging/resolved-pins.json";
const outputDirectory = args.find((arg) => arg.startsWith("--output-dir="))
  ?.split("=").slice(1).join("=")
  ?? "docs/restaurant-imports";
const dateLabel = args.find((arg) => arg.startsWith("--date="))
  ?.split("=").slice(1).join("=")
  ?? new Date().toISOString().slice(0, 10);

function readEnv() {
  if (!fs.existsSync(".env.local")) return {};
  return Object.fromEntries(
    fs.readFileSync(".env.local", "utf8").split(/\r?\n/).flatMap((rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) return [];
      const separator = line.indexOf("=");
      if (separator < 1) return [];
      const key = line.slice(0, separator).trim().replace(/^export\s+/, "");
      const rawValue = line.slice(separator + 1).trim();
      const value = (
        (rawValue.startsWith("\"") && rawValue.endsWith("\""))
        || (rawValue.startsWith("'") && rawValue.endsWith("'"))
      )
        ? rawValue.slice(1, -1)
        : rawValue;
      return [[key, value]];
    }),
  );
}

function markdownCell(value) {
  return String(value ?? "—")
    .replaceAll("|", "\\|")
    .replace(/\s+/g, " ")
    .trim() || "—";
}

function csvCell(value) {
  const text = String(value ?? "").replace(/\r?\n/g, " ").trim();
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function priceLabel(level) {
  const numeric = Number(level);
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 4
    ? "$".repeat(numeric)
    : "Not available";
}

function areaLabel(item) {
  return [item.area, item.city, item.country].filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index)
    .join(", ");
}

function mapsLink(item) {
  return item.googleMapsUrl || item.google_maps_url || "";
}

function sortedByName(items) {
  return [...items].sort((a, b) =>
    String(a.name ?? "").localeCompare(String(b.name ?? ""), "en", { sensitivity: "base" }));
}

if (!fs.existsSync(inputPath)) {
  console.error(`Resolved Takeout dataset does not exist: ${inputPath}`);
  process.exit(1);
}

const env = readEnv();
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required in .env.local");
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const sourceRestaurants = source.restaurants ?? [];
const readyCandidates = sourceRestaurants.filter((item) =>
  item.status === "ready"
  && item.placeId
  && item.position
  && !["CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY"].includes(item.businessStatus));
const readyById = new Map();
for (const item of readyCandidates) {
  const existing = readyById.get(item.placeId);
  if (!existing) {
    readyById.set(item.placeId, {
      ...item,
      sourceLists: [...(item.sourceLists ?? [])],
      sourceTags: [...(item.sourceTags ?? [])],
    });
    continue;
  }
  existing.sourceLists = [...new Set([...(existing.sourceLists ?? []), ...(item.sourceLists ?? [])])];
  existing.sourceTags = [...new Set([...(existing.sourceTags ?? []), ...(item.sourceTags ?? [])])];
}
const ready = [...readyById.values()];
const closed = sourceRestaurants.filter((item) => item.status === "excluded_closed");
const permanentlyClosed = closed.filter((item) => item.businessStatus === "CLOSED_PERMANENTLY");
const temporarilyClosed = closed.filter((item) => item.businessStatus === "CLOSED_TEMPORARILY");
const nonFood = sourceRestaurants.filter((item) => item.status === "excluded_non_food");
const unresolved = sourceRestaurants.filter((item) => item.status === "needs_review");

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const published = [];
for (let start = 0; ; start += 1000) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("place_id,name,category,tags,area,city,country,address,price_level,price_level_source,primary_type,place_types,business_status,google_maps_url,source_lists,is_published")
    .eq("is_published", true)
    .range(start, start + 999);
  if (error) throw new Error(`Unable to load current published restaurants: ${error.message}`);
  published.push(...data);
  if (data.length < 1000) break;
}

const readyByPlaceId = new Map(ready.map((item) => [item.placeId, item]));
const publishedByPlaceId = new Map(published.map((item) => [item.place_id, item]));
const additions = ready.filter((item) => !publishedByPlaceId.has(item.placeId));
const retained = ready.filter((item) => publishedByPlaceId.has(item.placeId));
const removals = published.filter((item) => !readyByPlaceId.has(item.place_id));

const categoryGroups = new Map();
for (const item of ready) {
  const category = item.category || "Unclassified";
  if (!categoryGroups.has(category)) categoryGroups.set(category, []);
  categoryGroups.get(category).push(item);
}

const categoryNames = [...categoryGroups.keys()].sort((a, b) => a.localeCompare(b));
const generatedAt = new Date().toISOString();
const closedMarkdownPath = path.join(outputDirectory, `permanently-closed-restaurants-${dateLabel}.md`);
const allMarkdownPath = path.join(outputDirectory, `all-restaurants-and-categories-${dateLabel}.md`);
const closedCsvPath = path.join(outputDirectory, `permanently-closed-restaurants-${dateLabel}.csv`);
const allCsvPath = path.join(outputDirectory, `all-restaurants-and-categories-${dateLabel}.csv`);
const reconciliationPath = "imports/google-maps/staging/takeout-reconciliation.json";

const closedLines = [
  `# Permanently closed restaurants — Google Maps Takeout ${dateLabel}`,
  "",
  `Generated ${generatedAt}. This report lists saved food/drink venues that Google Places reported as permanently closed. They are excluded from the published restaurant map.`,
  "",
  `- Permanently closed: ${permanentlyClosed.length}`,
  `- Temporarily closed and excluded from publication, but not listed below: ${temporarilyClosed.length}`,
  "",
  "| Restaurant | Status | Category | Location | Saved lists | Google Maps |",
  "|---|---|---|---|---|---|",
  ...sortedByName(permanentlyClosed).map((item) => {
    const link = mapsLink(item);
    return `| ${markdownCell(item.name)} | ${markdownCell(item.businessStatus)} | ${markdownCell(item.category)} | ${markdownCell(areaLabel(item))} | ${markdownCell((item.sourceLists ?? []).join(", "))} | ${link ? `[Open](${link})` : "—"} |`;
  }),
  "",
];

const allLines = [
  `# Restaurants and categories — Google Maps Takeout ${dateLabel}`,
  "",
  `Generated ${generatedAt}. This is the verified, operational food-and-drink set prepared for the website. Google price levels are used where available; otherwise the price is an explicit category-based estimate.`,
  "",
  `- Restaurants: ${ready.length}`,
  `- Categories: ${categoryNames.length}`,
  `- Retained from the existing map: ${retained.length}`,
  `- New additions: ${additions.length}`,
  `- Existing pins absent from this Takeout and scheduled for removal: ${removals.length}`,
  `- Non-food places filtered out: ${nonFood.length}`,
  `- Unresolved places held back for review: ${unresolved.length}`,
  "",
  "## Category summary",
  "",
  "| Category | Count |",
  "|---|---:|",
  ...categoryNames.map((category) =>
    `| ${markdownCell(category)} | ${categoryGroups.get(category).length} |`),
  "",
  ...categoryNames.flatMap((category) => [
    `## ${category}`,
    "",
    "| Restaurant | Price | Location | Google type | Saved lists | Google Maps |",
    "|---|---|---|---|---|---|",
    ...sortedByName(categoryGroups.get(category)).map((item) => {
      const link = mapsLink(item);
      return `| ${markdownCell(item.name)} | ${priceLabel(item.priceLevel)} | ${markdownCell(areaLabel(item))} | ${markdownCell(item.primaryType)} | ${markdownCell((item.sourceLists ?? []).join(", "))} | ${link ? `[Open](${link})` : "—"} |`;
    }),
    "",
  ]),
  ...(unresolved.length > 0 ? [
    "## Manual review required",
    "",
    "These Takeout entries could not be identified reliably, so they were not published or guessed.",
    "",
    "| Saved name | Reason | Saved lists | Google Maps |",
    "|---|---|---|---|",
    ...sortedByName(unresolved).map((item) => {
      const link = mapsLink(item);
      return `| ${markdownCell(item.name)} | ${markdownCell(item.reviewReason)} | ${markdownCell((item.sourceLists ?? []).join(", "))} | ${link ? `[Open](${link})` : "—"} |`;
    }),
    "",
  ] : []),
];

const closedCsv = [
  ["name", "status", "category", "location", "source_lists", "google_maps_url"],
  ...sortedByName(permanentlyClosed).map((item) => [
    item.name,
    item.businessStatus,
    item.category,
    areaLabel(item),
    (item.sourceLists ?? []).join("; "),
    mapsLink(item),
  ]),
].map((row) => row.map(csvCell).join(",")).join("\n");

const allCsv = [
  ["name", "status", "category", "price_level", "price_label", "price_source", "location", "primary_type", "source_lists", "google_maps_url", "review_reason"],
  ...categoryNames.flatMap((category) =>
    sortedByName(categoryGroups.get(category)).map((item) => [
      item.name,
      "ready",
      category,
      item.priceLevel,
      priceLabel(item.priceLevel),
      item.priceLevelSource,
      areaLabel(item),
      item.primaryType,
      (item.sourceLists ?? []).join("; "),
      mapsLink(item),
      "",
    ])),
  ...sortedByName(unresolved).map((item) => [
    item.name,
    "needs_review",
    "Manual review required",
    "",
    "Not available",
    "",
    areaLabel(item),
    item.primaryType,
    (item.sourceLists ?? []).join("; "),
    mapsLink(item),
    item.reviewReason,
  ]),
].map((row) => row.map(csvCell).join(",")).join("\n");

fs.mkdirSync(outputDirectory, { recursive: true });
fs.mkdirSync(path.dirname(reconciliationPath), { recursive: true });
fs.writeFileSync(closedMarkdownPath, `${closedLines.join("\n")}\n`);
fs.writeFileSync(allMarkdownPath, `${allLines.join("\n")}\n`);
fs.writeFileSync(closedCsvPath, `${closedCsv}\n`);
fs.writeFileSync(allCsvPath, `${allCsv}\n`);
fs.writeFileSync(reconciliationPath, `${JSON.stringify({
  generatedAt,
  source: path.basename(inputPath),
  summary: {
    sourceCandidates: sourceRestaurants.length,
    readyCandidateRows: readyCandidates.length,
    duplicateReadyRowsMerged: readyCandidates.length - ready.length,
    currentPublished: published.length,
    ready: ready.length,
    retained: retained.length,
    additions: additions.length,
    removals: removals.length,
    closed: closed.length,
    permanentlyClosed: permanentlyClosed.length,
    temporarilyClosed: temporarilyClosed.length,
    nonFood: nonFood.length,
    unresolved: unresolved.length,
  },
  additions: additions.map((item) => ({
    placeId: item.placeId,
    name: item.name,
    category: item.category,
    priceLevel: item.priceLevel,
  })),
  removals: removals.map((item) => ({
    placeId: item.place_id,
    name: item.name,
    category: item.category,
    businessStatus: item.business_status,
  })),
  closed: closed.map((item) => ({
    placeId: item.placeId,
    name: item.name,
    category: item.category,
    businessStatus: item.businessStatus,
  })),
  unresolved: unresolved.map((item) => ({
    importId: item.importId,
    name: item.name,
    reason: item.reviewReason,
  })),
}, null, 2)}\n`);

console.log(JSON.stringify({
  sourceCandidates: sourceRestaurants.length,
  readyCandidateRows: readyCandidates.length,
  duplicateReadyRowsMerged: readyCandidates.length - ready.length,
  currentPublished: published.length,
  ready: ready.length,
  retained: retained.length,
  additions: additions.length,
  removals: removals.length,
  closed: closed.length,
  permanentlyClosed: permanentlyClosed.length,
  temporarilyClosed: temporarilyClosed.length,
  nonFood: nonFood.length,
  unresolved: unresolved.length,
}, null, 2));
console.log(`Wrote ${closedMarkdownPath}`);
console.log(`Wrote ${allMarkdownPath}`);
console.log(`Wrote ${closedCsvPath}`);
console.log(`Wrote ${allCsvPath}`);
