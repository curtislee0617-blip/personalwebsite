# Build spec — Interactive process scrollytelling page

**Target route:** `/projects/supercritical-water-gasification`

This is a complete build specification. Follow it directly; it is written to be self-contained and
should not require asking the author for technical content.

---

## Role and goal

Build an interactive page presenting a process design concept: **co-valorization of bauxite residue
(red mud) and soybean processing waste via supercritical water gasification**, with conventional acid
gas removal and reforming-coupled OXZEO olefin synthesis.

The page is a **scrollytelling piece**. The reader should feel as though they are descending through a
process plant — entering with regulatory context, passing through a siting analysis, then travelling
down through each unit operation to the product slate. Scroll position *is* process position.

Audience: process engineers, sustainability leads, and people who will check the numbers. Tone is
precise, not promotional. No marketing language, no stock sustainability imagery.

---

## Repo conventions — read these files before writing anything

This repo is **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 3.4**, path alias `@/`.

Read these first and match their patterns:

- `app/projects/biodiesel-from-used-cooking-oil/page.tsx` — closest analogue; a chemical engineering
  project page. Note `PageIntro`, `HistoryBackButton`, `page-section`, `eyebrow`, and the
  `rounded-[2rem] border border-ink/10 bg-surface/55` card idiom.
- `lib/bem114-report.ts` — **the content pattern to follow.** Long-form prose lives in `lib/` as
  exported, typed const arrays, not in the component tree.
- `app/projects/page.tsx` and `data/project-pages.json` — how projects are registered and indexed.
- `tailwind.config.ts` and `app/globals.css` — the existing colour tokens (`ink`, `surface`, `paper`)
  and utility classes. **Use these; do not introduce a parallel design system.**

If anything below conflicts with an established repo convention, follow the repo and tell the author
what you changed and why.

---

## Architecture: this must stay editable

The author will make large changes over time — adding process blocks, rewriting sections, swapping in
real balance data once it exists, changing the product slate. A single 2,000-line `page.tsx` with
content interleaved into JSX is an explicit failure of this brief, even if it renders correctly.

### File layout

```
app/projects/supercritical-water-gasification/
    page.tsx                    Server component. Metadata, PageIntro, section assembly. Thin.

lib/
    scwg-types.ts               Shared types. The placeholder-discipline types live here.
    scwg-meta.ts                Title, subtitle, abstract
    scwg-regulatory.ts          Act 1 panels
    scwg-siting.ts              Act 2 narrative + candidate-site definitions
    scwg-process.ts             Act 3 — ALL block data: prose, conditions, streams, duties, flags
    scwg-products.ts            Act 4
    scwg-open-questions.ts      Act 5 checklist
    scwg-references.ts          Bibliography with verification status

data/
    scwg-map-sites.json         Facility coordinates, capacities, overlay membership, source status
    scwg-china-provinces.json   TopoJSON, vendored locally

components/
    scwg-regulatory-timeline.tsx
    scwg-siting-map.tsx         "use client"
    scwg-process-diagram.tsx    "use client" — the sticky SVG
    scwg-process-scroller.tsx   "use client" — IntersectionObserver + active-block state
    scwg-stream-table.tsx       Server component; renders inlet/outlet tables from block data
    scwg-value.tsx              Renders a single ProcessValue with placeholder/literature styling
    scwg-product-tiers.tsx
```

Keep client components as small as possible and as low in the tree as possible. Prose and tables
should render on the server; only the diagram, scroller and map need `"use client"`.

### Acceptance criteria

Do not consider the build done until all of these pass. **State explicitly in your final message
whether each one passes.**

1. **Adding a ninth process block requires editing `lib/scwg-process.ts` only.** No changes to any
   `.tsx` file. Diagram, scroll sequence, navigation and stream tables all derive from that array.
   Demonstrate by actually adding a dummy block, confirming it renders end to end, then removing it.
2. **Rewriting any prose requires editing one `lib/scwg-*.ts` file and nothing else.** No user-facing
   sentence lives in a `.tsx` file.
3. **Styling uses existing Tailwind tokens.** No new hex colours, no arbitrary values that duplicate an
   existing token. If a genuinely new token is needed, add it to `tailwind.config.ts` and say so.
4. **`npm run lint` passes and the project type-checks** with no new errors.
5. **No component file exceeds ~250 lines.** Split if it does.
6. **A short `## Editing this page

The page is assembled so that content changes never require touching a component. Prose lives in
`lib/scwg-*.ts`, map data in `data/`, and geometry in `lib/scwg-diagram-*.ts`.

| I want to change… | Edit this |
|---|---|
| **Add / remove / reorder a process block** | `lib/scwg-process.ts` only. Append (or splice) a `ProcessBlock` in `scwgProcessBlocks`. Order in the array *is* the order down the flowsheet and the scroll sequence — there is no position field. The diagram, stream routing, scroll observers and stream tables all derive from it. Give it a `symbol` from the `BlockSymbol` union so it draws the right unit-operation glyph. |
| **Change balance numbers, duties, or KPIs** | `lib/scwg-process.ts` — the `duty`, `metrics` and `contextValues` fields. Every number is a `ProcessValue`: `status: "placeholder"` while the balance is open, `status: "literature"` with a `source` marker that exists in `lib/scwg-references.ts`, or `status: "indicative"` with a mandatory `note` for figures not yet traceable to a primary source. A bare number, a literature value with no source, or an indicative value with no note is a compile error. |
| **Change how a stream is routed in the diagram** | `lib/scwg-process.ts` — the `inlet` / `outlet` `tag` values. Routing is derived by matching an outlet tag to an inlet tag: same tag on a later block draws the spine, on an earlier block draws a recycle, on the same block draws a self-loop; an unmatched inlet is a feed stub and an unmatched outlet is a product stub. One tag = one stream = one name at both ends. Never hand-place a line. |
| **Change block spacing, box size, or zoom level** | `lib/scwg-diagram-layout.ts` (pitch, box size, channels, `scwgViewBoxFor` zoom). Change connector path shapes in `lib/scwg-diagram-connectors.ts`. |
| **Draw a new kind of unit-operation symbol** | Add a case to the `BlockSymbol` union in `lib/scwg-types.ts`, then a glyph component + `GLYPHS` entry in `components/scwg-diagram-symbols.tsx`. |
| **Add or move a map site** | `data/scwg-map-sites.json` → `sites[]`. Set `overlay` to an existing overlay id, and keep `status: "unverified"` until confirmed against a primary source. `capacity` drives pin radius; `null` renders a hollow pin. |
| **Change province shading (fragmented douzha)** | `data/scwg-map-sites.json` → `fragmentedShading`, province name → intensity `0–1`. |
| **Add, rename, or toggle a map overlay** | `lib/scwg-siting.ts` → `scwgSitingOverlays` (label, `mark` shape, `defaultOn`, blurb). Give it a colour in `OVERLAY_COLOR` in `components/scwg-map-mark.tsx`. Keep shape *and* colour distinct — colour is never the sole cue. |
| **Change the map framing / zoom** | `components/scwg-siting-map.tsx` → `MAINLAND_FOCUS` (a `frameGrid(west, south, east, north)` box) and the `W`/`H` canvas constants. The frame is a MultiPoint grid, not a polygon — d3 reads a bare polygon as its own inverse. |
| **Change the haul-distance candidate sites** | `lib/scwg-siting.ts` → `scwgSitingCandidates`. |
| **Replace the base map** | `data/scwg-china-provinces.json` (object `provinces`, `name` per feature); neighbours in `data/scwg-neighbours.json` (object `neighbours`). Verify ring winding: if `geoBounds` on any feature returns the whole globe, reverse every ring before converting (the DataV source needs this). |
| **Rewrite the hero (title / subtitle / abstract / legend / affiliation)** | `lib/scwg-meta.ts`. Act eyebrows and every UI label also live there, in `scwgUi`. |
| **Rewrite Act 1 (regulatory panels)** | `lib/scwg-regulatory.ts` |
| **Rewrite Act 2 (why these two wastes)** | `lib/scwg-rationale.ts` |
| **Rewrite Act 3 (siting narrative, overlay blurbs, payload)** | `lib/scwg-siting.ts` |
| **Rewrite Act 4 (feedstock characterization, blend design, heteroatom fates)** | `lib/scwg-feedstock.ts` |
| **Rewrite Act 5 (block prose, roles, flags)** | `lib/scwg-process.ts` |
| **Rewrite Act 6 (waste treatment, discharge standards)** | `lib/scwg-waste-treatment.ts` |
| **Rewrite Act 7 (product slate, tiers, tables, callouts)** | `lib/scwg-products.ts` |
| **Rewrite Act 8 (decisions taken, open questions, report structure)** | `lib/scwg-open-questions.ts` and `lib/scwg-report-structure.ts` |
| **Add or verify a reference** | `lib/scwg-references.ts`. The `marker` is what a `ProcessValue.source` points at; set `status` to `"verified"` (✓) or `"unverified"` (°). |
| **Restyle** | The page runs the VENEX-derived palette, scoped under `.scwg-page` in `app/globals.css` (`moss` → VENEX green, `clay` → warm warning, `--scwg-navy` for section headings), and is light-only — `.dark:has(.scwg-page)` pins the whole document to the light tokens. Card idiom is `rounded-[2rem] border border-ink/10 bg-surface/55`. Placeholder/indicative/literature styling lives in one place: `components/scwg-value.tsx`. Stream-dash animation, the hero backdrop, and the three map hues (`--color-map-industrial`, `--color-map-context`, `--color-map-port`) are in `app/globals.css`. |
| **Change the hero photo** | Replace `photos/scwg-hero.webp` (page backdrop) and `photos/scwg-hero-card.webp` (projects-index card) in the `site-media` bucket — `/photos/*` is proxied to Supabase storage, so `public/photos/` is not what production serves. |
| **Make the page full-bleed (or restore site chrome)** | `components/site-chrome.tsx` → `STANDALONE_ROUTES`. |
| **Change the projects-index card** | `lib/projects.ts` → the `supercritical-water-gasification` entry. |
