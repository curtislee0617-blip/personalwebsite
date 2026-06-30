import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const reportPaths = process.argv.slice(2);
if (!reportPaths.length) {
  console.error("Usage: node scripts/sync-restaurant-business-status.mjs <audit-report.json> [...more reports]");
  process.exit(1);
}

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator), line.slice(separator + 1)];
  }),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const closedById = new Map();
for (const reportPath of reportPaths) {
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  for (const item of report.closed ?? []) closedById.set(item.id, item);
}

const temporaryIds = [...closedById.values()].filter((item) => item.businessStatus === "CLOSED_TEMPORARILY").map((item) => item.id);
const permanentIds = [...closedById.values()].filter((item) => item.businessStatus === "CLOSED_PERMANENTLY").map((item) => item.id);

async function updateBatches(ids, values) {
  for (let start = 0; start < ids.length; start += 100) {
    const { error } = await supabase
      .from("restaurants")
      .update({ ...values, updated_at: new Date().toISOString() })
      .in("id", ids.slice(start, start + 100));
    if (error) throw new Error(error.message);
  }
}

await updateBatches(temporaryIds, { business_status: "CLOSED_TEMPORARILY", is_published: true });
await updateBatches(permanentIds, { business_status: "CLOSED_PERMANENTLY", is_published: false });

console.log(JSON.stringify({ publishedTemporaryClosures: temporaryIds.length, unpublishedPermanentClosures: permanentIds.length }, null, 2));
