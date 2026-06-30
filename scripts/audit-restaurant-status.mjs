import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const applyChanges = args.includes("--apply");
const concurrency = Math.max(1, Math.min(10, Number(args.find((arg) => arg.startsWith("--concurrency="))?.split("=")[1] ?? 6)));
const outputPath = args.find((arg) => arg.startsWith("--output="))?.split("=").slice(1).join("=")
  ?? "imports/google-maps/staging/business-status-audit.json";
const retryUnavailablePath = args.find((arg) => arg.startsWith("--retry-unavailable="))?.split("=").slice(1).join("=");

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator), line.slice(separator + 1)];
  }),
);

if (!env.GOOGLE_PLACES_API_KEY || !env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
  console.error("GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required");
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const restaurants = retryUnavailablePath
  ? JSON.parse(fs.readFileSync(retryUnavailablePath, "utf8")).unavailable.map(({ id, place_id, name, address }) => ({ id, place_id, name, address }))
  : [];
if (!retryUnavailablePath) {
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase
      .from("restaurants")
      .select("id,place_id,name,address")
      .eq("is_published", true)
      .range(start, start + 999);
    if (error) throw new Error(`Unable to load published restaurants: ${error.message}`);
    restaurants.push(...data.filter((row) => row.place_id));
    if (data.length < 1000) break;
  }
}

async function fetchStatus(restaurant) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(restaurant.place_id)}`, {
      headers: {
        "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "id,displayName,businessStatus",
      },
      signal: AbortSignal.timeout(30000),
    });
    const body = await response.json();
    if (response.ok) {
      return {
        ...restaurant,
        currentName: body.displayName?.text ?? restaurant.name,
        businessStatus: body.businessStatus ?? "UNKNOWN",
      };
    }
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 4) {
      return { ...restaurant, businessStatus: "UNAVAILABLE", error: body.error?.message ?? `Places API returned ${response.status}` };
    }
    await new Promise((resolve) => setTimeout(resolve, 1250 * (attempt + 1)));
  }
}

const results = new Array(restaurants.length);
let nextIndex = 0;
let completed = 0;

async function worker() {
  while (nextIndex < restaurants.length) {
    const index = nextIndex++;
    results[index] = await fetchStatus(restaurants[index]);
    completed += 1;
    if (completed % 100 === 0 || completed === restaurants.length) {
      console.log(`Checked ${completed}/${restaurants.length}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const closed = results.filter((item) => ["CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY"].includes(item.businessStatus));
const temporarilyClosed = results.filter((item) => item.businessStatus === "CLOSED_TEMPORARILY");
const permanentlyClosed = results.filter((item) => item.businessStatus === "CLOSED_PERMANENTLY");
const unavailable = results.filter((item) => item.businessStatus === "UNAVAILABLE");
let unpublished = 0;
let publishedTemporaryClosures = 0;
let deletedSeaTheSea = 0;

if (applyChanges) {
  for (let start = 0; start < permanentlyClosed.length; start += 100) {
    const ids = permanentlyClosed.slice(start, start + 100).map((item) => item.id);
    const { error } = await supabase
      .from("restaurants")
      .update({ business_status: "CLOSED_PERMANENTLY", is_published: false, updated_at: new Date().toISOString() })
      .in("id", ids);
    if (error) throw new Error(`Unable to unpublish closed restaurants: ${error.message}`);
    unpublished += ids.length;
  }

  for (let start = 0; start < temporarilyClosed.length; start += 100) {
    const ids = temporarilyClosed.slice(start, start + 100).map((item) => item.id);
    const { error } = await supabase
      .from("restaurants")
      .update({ business_status: "CLOSED_TEMPORARILY", is_published: true, updated_at: new Date().toISOString() })
      .in("id", ids);
    if (error) throw new Error(`Unable to publish temporary closures: ${error.message}`);
    publishedTemporaryClosures += ids.length;
  }

  const { data, error } = await supabase
    .from("restaurants")
    .delete()
    .eq("name", "The Sea, The Sea")
    .select("id");
  if (error) throw new Error(`Unable to delete The Sea, The Sea: ${error.message}`);
  deletedSeaTheSea = data.length;
}

const summary = {
  checked: results.length,
  operational: results.filter((item) => item.businessStatus === "OPERATIONAL").length,
  temporarilyClosed: temporarilyClosed.length,
  permanentlyClosed: permanentlyClosed.length,
  unavailable: unavailable.length,
  unpublished,
  publishedTemporaryClosures,
  deletedSeaTheSea,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, closed, unavailable }, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
console.log(`Wrote ${outputPath}`);
