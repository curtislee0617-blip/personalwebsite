import fs from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";
import { categoryEmojis, suggestRestaurantCategory } from "./restaurant-classification.mjs";

const inputPath = process.argv[2];
const outputPath = process.argv[3] ?? "imports/google-maps/staging/restaurants.json";

if (!inputPath) {
  console.error("Usage: npm run maps:import -- <takeout.zip> [output.json]");
  process.exit(1);
}

const excludedLists = new Set(["Music", "Science", "Screenshots"]);
function loadCsvFiles(source) {
  if (source.toLowerCase().endsWith(".zip")) {
    const zip = new AdmZip(source);
    return zip.getEntries()
      .filter((entry) => !entry.isDirectory && /\/Saved\/[^/]+\.csv$/i.test(entry.entryName))
      .map((entry) => ({ name: path.basename(entry.entryName, ".csv"), contents: entry.getData().toString("utf8") }));
  }

  return fs.readdirSync(source)
    .filter((name) => name.toLowerCase().endsWith(".csv"))
    .map((name) => ({ name: path.basename(name, ".csv"), contents: fs.readFileSync(path.join(source, name), "utf8") }));
}

function normalize(value) {
  return value?.trim() ?? "";
}

function dedupeKey(row) {
  const url = normalize(row.URL);
  return url || `title:${normalize(row.Title).toLocaleLowerCase("en")}`;
}

function classify(place) {
  const lists = new Set(place.sourceLists);

  const broadCategory = lists.has("Bars") || lists.has("Drinks")
    ? "Bars"
    : lists.has("Asian fancy") || (lists.has("Asian casual") && lists.has("Fine dining"))
      ? "Asian Fancy"
      : lists.has("Fine dining")
        ? "Fine Dining"
        : lists.has("Western nicer")
          ? "Western Nicer"
          : lists.has("Coffee")
            ? "Cafés"
            : lists.has("Dessert")
              ? "Desserts"
              : lists.has("Asian casual")
                ? "East Asian"
                : lists.has("Casual")
                  ? "Casual"
                  : "Unclassified";

  const suggestion = suggestRestaurantCategory({ name: place.name, sourceCategory: broadCategory });
  if (suggestion.confidence > 0) return [suggestion.category, suggestion.confidence, suggestion.reason];

  if (lists.has("Bars") || lists.has("Drinks")) return ["Bars", 0.99, "source list"];
  if (lists.has("Asian fancy") || (lists.has("Asian casual") && lists.has("Fine dining"))) return ["Asian Fancy", 0.98, "source list"];
  if (lists.has("Fine dining")) return ["Fine Dining", 0.96, "source list"];
  if (lists.has("Western nicer")) return ["Western Nicer", 0.96, "source list"];

  if (lists.has("Coffee")) return ["Cafés", 0.95, "source list"];
  if (lists.has("Dessert")) return ["Desserts", 0.95, "source list"];
  if (lists.has("Asian casual")) return ["East Asian", 0.55, "regional enrichment required"];
  if (lists.has("Casual")) return ["Casual", 0.82, "source list"];
  return ["Unclassified", 0.2, "place-type enrichment required"];
}

const csvFiles = loadCsvFiles(inputPath);
const places = new Map();
const excludedCounts = {};
let sourceRows = 0;
let invalidRows = 0;

for (const file of csvFiles) {
  const rows = parse(file.contents, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
  });

  sourceRows += rows.length;

  if (excludedLists.has(file.name)) {
    excludedCounts[file.name] = rows.length;
    continue;
  }

  for (const row of rows) {
    if (!normalize(row.Title) && !normalize(row.URL)) {
      invalidRows += 1;
      continue;
    }
    const key = dedupeKey(row);
    const existing = places.get(key);
    const tags = normalize(row.Tags).split(/[,;]\s*/).filter(Boolean);

    if (existing) {
      existing.sourceLists.add(file.name);
      tags.forEach((tag) => existing.sourceTags.add(tag));
      if (!existing.note) existing.note = normalize(row.Note);
      if (!existing.comment) existing.comment = normalize(row.Comment);
      continue;
    }

    places.set(key, {
      name: normalize(row.Title) || "Untitled place",
      googleMapsUrl: normalize(row.URL) || null,
      note: normalize(row.Note),
      comment: normalize(row.Comment),
      sourceLists: new Set([file.name]),
      sourceTags: new Set(tags),
    });
  }
}

const imported = Array.from(places.values()).map((place, index) => {
  const normalizedPlace = {
    ...place,
    sourceLists: Array.from(place.sourceLists).sort(),
    sourceTags: Array.from(place.sourceTags).sort(),
  };
  const [category, confidence, classificationReason] = classify(normalizedPlace);

  return {
    importId: `takeout-${String(index + 1).padStart(4, "0")}`,
    ...normalizedPlace,
    category,
    emoji: categoryEmojis[category],
    confidence,
    classificationReason,
    position: null,
    placeId: null,
    status: "needs_enrichment",
  };
});

const categoryCounts = imported.reduce((counts, place) => {
  counts[place.category] = (counts[place.category] ?? 0) + 1;
  return counts;
}, {});

const result = {
  generatedAt: new Date().toISOString(),
  source: path.basename(inputPath),
  summary: {
    csvFiles: csvFiles.length,
    sourceRows,
    excludedRows: Object.values(excludedCounts).reduce((total, count) => total + count, 0),
    invalidRows,
    uniqueCandidatePlaces: imported.length,
    duplicateRowsMerged: sourceRows - Object.values(excludedCounts).reduce((total, count) => total + count, 0) - invalidRows - imported.length,
    excludedLists: excludedCounts,
    categoryCounts,
  },
  restaurants: imported,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);

console.log(JSON.stringify(result.summary, null, 2));
console.log(`\nWrote ${imported.length} candidate places to ${outputPath}`);
