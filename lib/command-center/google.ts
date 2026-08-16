/**
 * Google Calendar + Drive, server-side only.
 *
 * Auth model: a single stored refresh token (you are the only user), exchanged
 * for a short-lived access token on each request. No user-facing OAuth flow,
 * no tokens ever reach the browser. Run scripts/get-google-refresh-token.mjs
 * once to mint the refresh token.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";

let cached: { token: string; expires: number } | null = null;

async function accessToken(): Promise<string> {
  // Access tokens last an hour; reuse within a warm lambda.
  if (cached && Date.now() < cached.expires - 60_000) return cached.token;

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new Error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN");
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Google token refresh failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return cached.token;
}

async function google<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${await accessToken()}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type CalEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  colorId?: string;
  recurringEventId?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
};

export async function listEvents(fromISO: string, toISO: string, max = 250): Promise<CalEvent[]> {
  const qs = new URLSearchParams({
    timeMin: fromISO,
    timeMax: toISO,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: String(max),
  });
  const data = await google<{ items?: CalEvent[] }>(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${qs}`
  );
  return data.items ?? [];
}

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink?: string;
};

export async function listRecentFiles(pageSize = 12): Promise<DriveFile[]> {
  const qs = new URLSearchParams({
    orderBy: "modifiedTime desc",
    pageSize: String(pageSize),
    fields: "files(id,name,mimeType,modifiedTime,webViewLink)",
    q: "trashed = false",
  });
  const data = await google<{ files?: DriveFile[] }>(
    `https://www.googleapis.com/drive/v3/files?${qs}`
  );
  return data.files ?? [];
}
