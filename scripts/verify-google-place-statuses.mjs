#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const inputPath = args.find((arg) => !arg.startsWith("--"))
  ?? "imports/google-maps/staging/resolved-pins.json";
const outputPath = args.find((arg) => arg.startsWith("--output="))
  ?.split("=").slice(1).join("=")
  ?? inputPath;
const auditPath = args.find((arg) => arg.startsWith("--audit="))
  ?.split("=").slice(1).join("=")
  ?? "imports/google-maps/staging/official-status-audit.json";
const keyFile = args.find((arg) => arg.startsWith("--key-file="))
  ?.split("=").slice(1).join("=");
const referer = args.find((arg) => arg.startsWith("--referer="))
  ?.split("=").slice(1).join("=");
const concurrency = Math.max(
  1,
  Math.min(8, Number(args.find((arg) => arg.startsWith("--concurrency="))?.split("=")[1] ?? 4)),
);

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

function toPriceLevel(value) {
  switch (value) {
    case "PRICE_LEVEL_INEXPENSIVE":
      return 1;
    case "PRICE_LEVEL_MODERATE":
      return 2;
    case "PRICE_LEVEL_EXPENSIVE":
      return 3;
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return 4;
    default:
      return null;
  }
}

const env = readEnv();
const apiKey = keyFile && fs.existsSync(keyFile)
  ? fs.readFileSync(keyFile, "utf8").trim()
  : env.GOOGLE_PLACES_API_KEY?.trim() || env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
if (!apiKey) {
  console.error("A Places API key is required via --key-file, GOOGLE_PLACES_API_KEY, or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const candidates = (source.restaurants ?? []).filter((item) =>
  item.placeId
  && item.status === "excluded_closed"
  && ["CLOSED_UNVERIFIED", "CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY"].includes(item.businessStatus));

async function fetchDetails(item) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(item.placeId)}`, {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id,displayName,businessStatus,priceLevel,primaryType,types",
          ...(referer ? { Referer: referer } : {}),
        },
        signal: AbortSignal.timeout(30000),
      });
      const body = await response.json();
      if (response.ok) return body;
      throw new Error(body.error?.message ?? `Places API returned ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw lastError;
}

const verifiedByPlaceId = new Map();
const audit = new Array(candidates.length);
let nextIndex = 0;
let completed = 0;

async function worker() {
  while (nextIndex < candidates.length) {
    const index = nextIndex++;
    const item = candidates[index];
    try {
      const place = await fetchDetails(item);
      const businessStatus = place.businessStatus ?? "UNKNOWN";
      const priceLevel = toPriceLevel(place.priceLevel);
      verifiedByPlaceId.set(item.placeId, {
        businessStatus,
        priceLevel,
        primaryType: place.primaryType,
        placeTypes: place.types,
      });
      audit[index] = {
        importId: item.importId,
        placeId: item.placeId,
        name: place.displayName?.text ?? item.name,
        provisionalStatus: item.businessStatus,
        businessStatus,
        priceLevel,
      };
    } catch (error) {
      audit[index] = {
        importId: item.importId,
        placeId: item.placeId,
        name: item.name,
        provisionalStatus: item.businessStatus,
        error: error instanceof Error ? error.message : String(error),
      };
    }
    completed += 1;
    if (completed % 20 === 0 || completed === candidates.length) {
      console.log(`Verified ${completed}/${candidates.length}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const restaurants = source.restaurants.map((item) => {
  const verified = verifiedByPlaceId.get(item.placeId);
  if (!verified) return item;
  const closed = ["CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY"].includes(verified.businessStatus);
  return {
    ...item,
    businessStatus: verified.businessStatus,
    primaryType: verified.primaryType ?? item.primaryType,
    placeTypes: verified.placeTypes ?? item.placeTypes,
    priceLevel: verified.priceLevel ?? item.priceLevel,
    priceLevelSource: verified.priceLevel ? "Google Places" : item.priceLevelSource,
    status: closed ? "excluded_closed" : "ready",
    reviewReason: closed ? `Google Places reports ${verified.businessStatus}` : null,
    closureVerificationSource: "Google Places API",
    closureVerifiedAt: new Date().toISOString(),
  };
});

const failed = audit.filter((item) => item?.error);
const permanentlyClosed = audit.filter((item) => item?.businessStatus === "CLOSED_PERMANENTLY");
const temporarilyClosed = audit.filter((item) => item?.businessStatus === "CLOSED_TEMPORARILY");
const operational = audit.filter((item) => item?.businessStatus === "OPERATIONAL");
const summary = {
  checked: candidates.length,
  operational: operational.length,
  temporarilyClosed: temporarilyClosed.length,
  permanentlyClosed: permanentlyClosed.length,
  failed: failed.length,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.mkdirSync(path.dirname(auditPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({
  ...source,
  generatedAt: new Date().toISOString(),
  summary: {
    processed: restaurants.length,
    ready: restaurants.filter((item) => item.status === "ready").length,
    needsReview: restaurants.filter((item) => item.status === "needs_review").length,
    excludedNonFood: restaurants.filter((item) => item.status === "excluded_non_food").length,
    excludedClosed: restaurants.filter((item) => item.status === "excluded_closed").length,
    excludedManual: restaurants.filter((item) => item.status === "excluded_manual").length,
  },
  restaurants,
}, null, 2)}\n`);
fs.writeFileSync(auditPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  summary,
  permanentlyClosed,
  temporarilyClosed,
  operational,
  failed,
}, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${auditPath}`);
