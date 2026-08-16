# Command center setup

`/command-center` is a private, server-rendered morning dashboard: schedule,
trip map, recent Drive files and Vercel deployments. It is reachable from the
Schedule button on the home page, gated by HTTP Basic Auth, and installable to
an iOS home screen.

Everything below is server-side. No API key or OAuth token ever reaches the
browser.

## Where things live

| Path | Purpose |
|---|---|
| `app/command-center/page.tsx` | The page. Server component, `force-dynamic`. |
| `app/command-center/TripMap.tsx` | Client component: MapLibre basemap + deck.gl arcs. |
| `app/command-center/command-center.css` | Route styles. Prefixed `cc-`; see note below. |
| `app/api/tiles/[...tile]/route.ts` | Tile proxy, so the TomTom key stays server-side. |
| `lib/command-center/{google,vercel,tomtom,trip}.ts` | Connectors and trip logic. |
| `proxy.ts` | Basic Auth, merged alongside the existing cookbook rules. |
| `public/command-center.webmanifest` | PWA manifest. |
| `public/pwa/command-center-{192,512}.png` | Home-screen icons. |
| `scripts/get-google-refresh-token.mjs` | One-time refresh-token minting. |

Dependencies (`maplibre-gl`, `@deck.gl/core`, `@deck.gl/layers`,
`@deck.gl/mapbox`) are already in `package.json`. They are imported only from
the client component on this route, so the rest of the site's bundle is
untouched.

## Credentials

**Google** (Calendar + Drive, read-only)

1. [Cloud Console](https://console.cloud.google.com) → new project
2. Enable **Google Calendar API** and **Google Drive API**
3. OAuth consent screen → External → add yourself under **Test users**
4. Credentials → **OAuth client ID** → Web application.
   Authorised redirect URI: `http://localhost:53682/callback`
5. Mint the refresh token:

```bash
export GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=...
node scripts/get-google-refresh-token.mjs
```

It opens the consent screen and prints `GOOGLE_REFRESH_TOKEN=…`. One-time —
refresh tokens do not expire unless revoked.

> A consent screen left in **Testing** expires refresh tokens after 7 days.
> Publish the app — still private, since you are the only user — to avoid
> having to re-authorise every week.

**Vercel** — [account/tokens](https://vercel.com/account/tokens), read scope is
enough. The team ID is on your Vercel team settings page.

**TomTom** — [developer.tomtom.com](https://developer.tomtom.com). The free tier
covers a personal dashboard comfortably; one key serves search, routing and
tiles.

## Environment variables

Copy the command-center block from `.env.example` into **Vercel → Settings →
Environment Variables** for both Production and Preview, and into `.env.local`
for local work.

`CC_USER` and `CC_PASSWORD` gate the route. **If either is unset the route
returns 503 rather than serving a calendar publicly** — it fails closed on
purpose, so an unconfigured preview deployment exposes nothing.

## Install on the phone

Open `https://<your-domain>/command-center`, enter the password once (Safari
remembers it), then **Share → Add to Home Screen**. It launches standalone with
no browser chrome.

## Notes for future edits

- **The CSS is global, not a module.** Importing a plain `.css` file from a
  route makes it a global stylesheet, so every class is prefixed `cc-` and
  scoped under `.cc`. The names this shipped with — `.card`, `.pill`, `.grid` —
  collided with the site's own components.
- **Dark mode keys off the site's `.dark` class**, not `prefers-color-scheme`,
  so the dashboard matches the chrome around it rather than the OS.
- **`maplibre-gl` 6 has no default export.** `TripMap.tsx` uses named imports;
  `Map` is aliased to `MapLibreMap` because the global of that name is in scope.
- **Each section catches its own error** and renders it inline, so one dead
  connector cannot blank the page. With nothing configured you get a working
  page of "Couldn't load: Missing …" rows.
- **Auth is scoped** to `/command-center` and `/api/tiles` in the `proxy.ts`
  matcher. The rest of the site stays public — don't widen it by accident.
- **The icons live in `public/pwa/` for two reasons**, both easy to trip over
  again. `.gitignore` has `public/*.png`, so anything at the top level of
  `public/` is never committed; and anything under `/command-center/` is caught
  by the auth matcher, which returns 401 for the icons and breaks the install.
  They have to sit in a subdirectory that is not the protected one.
