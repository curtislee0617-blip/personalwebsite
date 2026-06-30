import fs from "node:fs";
import { suggestRestaurantCategory } from "./restaurant-classification.mjs";

const inputPath = process.argv[2] ?? "imports/google-maps/staging/review-required.json";
const outputPath = process.argv[3] ?? "imports/google-maps/staging/review-required.csv";
const markdownPath = process.argv[4] ?? "imports/google-maps/staging/review-required.md";
const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));

function cell(value = "") {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const headers = [
  "Import ID", "Saved name", "Source lists", "Current category", "Suggested category", "Suggestion reason", "Reason",
  "Original Google Maps URL", "Latitude", "Longitude",
  "Candidate 1", "Candidate 1 address", "Candidate 1 type", "Candidate 1 score", "Candidate 1 Place ID",
  "Candidate 2", "Candidate 2 address", "Candidate 2 type", "Candidate 2 score", "Candidate 2 Place ID",
  "Candidate 3", "Candidate 3 address", "Candidate 3 type", "Candidate 3 score", "Candidate 3 Place ID",
  "Decision (accept/skip)", "Selected Place ID", "Correct category", "Review notes",
];

const rows = source.restaurants.map((item) => {
  const candidates = Array.from({ length: 3 }, (_, index) => item.matchCandidates?.[index] ?? {});
  const suggestion = suggestRestaurantCategory({
    name: item.name,
    primaryType: item.primaryType,
    placeTypes: item.placeTypes,
    sourceCategory: item.category,
  });
  return [
    item.importId, item.name, item.sourceLists?.join(" | "), item.category, suggestion.category, suggestion.reason, item.reviewReason,
    item.googleMapsUrl, item.position?.latitude ?? "", item.position?.longitude ?? "",
    ...candidates.flatMap((candidate) => [candidate.name, candidate.address, candidate.primaryType, candidate.score, candidate.placeId]),
    "", "", "", "",
  ];
});

fs.writeFileSync(outputPath, [headers, ...rows].map((row) => row.map(cell).join(",")).join("\n") + "\n");
const markdown = [
  "# Restaurant matches requiring review",
  "",
  "Edit this file directly in VS Code. For each place, change **Decision** to `accept` or `skip`. If accepting, copy the correct candidate Place ID and confirm or replace the suggested category.",
  "",
  "Allowed categories: Bars, Asian Fancy, Fine Dining, Western Nicer, Bakeries, Tacos, Burgers, Chicken, Ramen, Sushi, Dim Sum, Pizza, Pasta, Steakhouse, Bistro, Barbecue, Deli, Cafés, Desserts, South Asian, East Asian, Southeast Asian, Middle Eastern, African, Casual, Unclassified.",
  "",
  ...source.restaurants.flatMap((item, index) => [
    (() => {
      const suggestion = suggestRestaurantCategory({
        name: item.name,
        primaryType: item.primaryType,
        placeTypes: item.placeTypes,
        sourceCategory: item.category,
      });
      return `## ${index + 1}. ${item.name}\n\n- Source lists: ${item.sourceLists?.join(", ") || "Unknown"}\n- Current category: ${item.category}\n- Suggested category: **${suggestion.category}** (${suggestion.reason})\n- Review reason: ${item.reviewReason}`;
    })(),
    ...(item.matchCandidates?.length
      ? item.matchCandidates.map((candidate, candidateIndex) =>
          `- Candidate ${candidateIndex + 1}: **${candidate.name}** — ${candidate.address || "No address"} — ${candidate.primaryType || "Unknown type"} — score ${candidate.score} — Place ID \`${candidate.placeId}\``,
        )
      : ["- No Google Places candidate was found."]),
    `- Original Google Maps URL: ${item.googleMapsUrl || "Unavailable"}`,
    `- Recovered coordinates: ${item.position ? `${item.position.latitude}, ${item.position.longitude}` : "Unavailable"}`,
    "- Decision: ",
    "- Selected Place ID:",
    "- Correct category (use suggestion or replace it):",
    "- Notes:",
    "",
  ]),
].join("\n");
fs.writeFileSync(markdownPath, `${markdown}\n`);
console.log(`Wrote ${rows.length} review rows to ${outputPath} and ${markdownPath}`);
