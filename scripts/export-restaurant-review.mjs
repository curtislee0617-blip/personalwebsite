import fs from "node:fs";

const inputPath = process.argv[2] ?? "imports/google-maps/staging/review-required.json";
const outputPath = process.argv[3] ?? "imports/google-maps/staging/review-required.csv";
const markdownPath = process.argv[4] ?? "imports/google-maps/staging/review-required.md";
const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));

function cell(value = "") {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const headers = [
  "Import ID", "Saved name", "Source lists", "Current category", "Reason",
  "Candidate 1", "Candidate 1 address", "Candidate 1 type", "Candidate 1 score", "Candidate 1 Place ID",
  "Candidate 2", "Candidate 2 address", "Candidate 2 type", "Candidate 2 score", "Candidate 2 Place ID",
  "Candidate 3", "Candidate 3 address", "Candidate 3 type", "Candidate 3 score", "Candidate 3 Place ID",
  "Decision (accept/skip)", "Selected Place ID", "Correct category", "Review notes",
];

const rows = source.restaurants.map((item) => {
  const candidates = Array.from({ length: 3 }, (_, index) => item.matchCandidates?.[index] ?? {});
  return [
    item.importId, item.name, item.sourceLists?.join(" | "), item.category, item.reviewReason,
    ...candidates.flatMap((candidate) => [candidate.name, candidate.address, candidate.primaryType, candidate.score, candidate.placeId]),
    "", "", "", "",
  ];
});

fs.writeFileSync(outputPath, [headers, ...rows].map((row) => row.map(cell).join(",")).join("\n") + "\n");
const markdown = [
  "# Restaurant matches requiring review",
  "",
  "For each place, write `accept` or `skip` beside **Decision**. If accepting, copy the correct candidate Place ID and adjust the category if needed.",
  "",
  ...source.restaurants.flatMap((item, index) => [
    `## ${index + 1}. ${item.name}`,
    "",
    `- Source lists: ${item.sourceLists?.join(", ") || "Unknown"}`,
    `- Current category: ${item.category}`,
    `- Review reason: ${item.reviewReason}`,
    ...(item.matchCandidates?.length
      ? item.matchCandidates.map((candidate, candidateIndex) =>
          `- Candidate ${candidateIndex + 1}: **${candidate.name}** — ${candidate.address || "No address"} — ${candidate.primaryType || "Unknown type"} — score ${candidate.score} — Place ID \`${candidate.placeId}\``,
        )
      : ["- No Google Places candidate was found."]),
    "- Decision:",
    "- Selected Place ID:",
    "- Correct category:",
    "- Notes:",
    "",
  ]),
].join("\n");
fs.writeFileSync(markdownPath, `${markdown}\n`);
console.log(`Wrote ${rows.length} review rows to ${outputPath} and ${markdownPath}`);
