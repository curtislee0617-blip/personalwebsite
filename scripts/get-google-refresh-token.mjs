#!/usr/bin/env node
/**
 * One-time: mint a Google refresh token for the command center.
 *
 *   node scripts/get-google-refresh-token.mjs
 *
 * Spins up a throwaway localhost listener, opens the consent screen, and prints
 * the refresh token. Nothing is written to disk — copy the value into Vercel
 * yourself. Run it once; refresh tokens don't expire unless you revoke them.
 *
 * Prereqs in Google Cloud Console:
 *   1. Create a project, enable "Google Calendar API" and "Google Drive API"
 *   2. OAuth consent screen → External → add yourself as a Test user
 *   3. Credentials → OAuth client ID → Web application
 *      Authorised redirect URI:  http://localhost:53682/callback
 *   4. Export the client id/secret before running:
 *      export GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=...
 */

import { createServer } from "node:http";
import { exec } from "node:child_process";

const PORT = 53682;
const REDIRECT = `http://localhost:${PORT}/callback`;
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
].join(" ");

const { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: id,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent", // force a refresh token even on repeat runs
  });

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== "/callback") return res.end();

  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400).end("No code returned.");
    return;
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: id,
      client_secret: secret,
      redirect_uri: REDIRECT,
      grant_type: "authorization_code",
    }),
  });

  const json = await tokenRes.json();
  res.writeHead(200, { "Content-Type": "text/plain" });

  if (json.refresh_token) {
    res.end("Done — check your terminal, then close this tab.");
    console.log("\n  GOOGLE_REFRESH_TOKEN=" + json.refresh_token + "\n");
    console.log("  Add that to Vercel → Settings → Environment Variables.\n");
  } else {
    res.end("No refresh token returned. Revoke prior access and retry.");
    console.error("\nNo refresh_token in response:", json, "\n");
  }
  server.close();
});

server.listen(PORT, () => {
  console.log("\nOpening Google consent screen…");
  console.log("If it doesn't open, visit:\n\n" + authUrl + "\n");
  const open =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  exec(`${open} "${authUrl}"`);
});
