#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
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

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required in .env.local");
  process.exit(1);
}

const directory = path.join(process.cwd(), "public/mobile-page-backgrounds");
const files = fs.readdirSync(directory)
  .filter((file) => file.endsWith(".png"))
  .sort();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

for (const file of files) {
  const body = fs.readFileSync(path.join(directory, file));
  const { error } = await supabase.storage
    .from("site-media")
    .upload(`mobile-page-backgrounds/${file}`, body, {
      cacheControl: "31536000",
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    console.error(`Failed to upload ${file}: ${error.message}`);
    process.exitCode = 1;
  } else {
    console.log(`Uploaded ${file} (${body.byteLength} bytes)`);
  }
}
