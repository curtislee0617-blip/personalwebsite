# Build spec — Interactive process scrollytelling page

**Target route:** `/projects/supercritical-water-gasification`

This is a complete build specification. Follow it directly; it is written to be self-contained and should not
require asking the author for technical content.

A companion Word report with the full technical argument sits at `docs/RedMud_Soybean_SCWG_Report_Draft.docx`.
Read it if you need more depth than this spec carries, but this spec is authoritative for the page.

---

## Role and goal

Build an interactive page presenting a process design concept: **co-valorization of bauxite residue (red mud)
and soybean processing waste via supercritical water gasification**, with conventional acid gas removal and
reforming-coupled OXZEO olefin synthesis.

The page is a **scrollytelling piece**. The reader should feel as though they are descending through a process
plant — entering with regulatory context, passing through a siting analysis, then travelling down through each
unit operation to the product slate. Scroll position *is* process position.

Audience: process engineers, sustainability leads, and people who will check the numbers. Tone is precise, not
promotional. No marketing language, no stock sustainability imagery.

---

## Repo conventions — read these files before writing anything

This repo is **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 3.4**, path alias `@/`.

Read these first and match their patterns:

- `app/projects/biodiesel-from-used-cooking-oil/page.tsx` — closest analogue; a chemical engineering project
  page. Note `PageIntro`, `HistoryBackButton`, `page-section`, `eyebrow`, and the
  `rounded-[2rem] border border-ink/10 bg-surface/55` card idiom.
- `lib/bem114-report.ts` — **the content pattern to follow.** Long-form prose lives in `lib/` as exported,
  typed const arrays, not in the component tree.
- `app/projects/page.tsx` and `data/project-pages.json` — how projects are registered and indexed.
- `tailwind.config.ts` and `app/globals.css` — the existing colour tokens (`ink`, `surface`, `paper`) and
  utility classes. **Use these; do not introduce a parallel design system.**

If anything below conflicts with an established repo convention, follow the repo and tell the author what you
changed and why.

---

## Architecture: this must stay editable

The author will make large changes over time — adding process blocks, rewriting sections, swapping in real
balance data once it exists, changing the product slate. A single 2,000-line `page.tsx` with content
interleaved into JSX is an explicit failure of this brief, even if it renders correctly.

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

Keep client components as small and as low in the tree as possible. Prose and tables render on the server;
only the diagram, scroller and map need `"use client"`.

### Acceptance criteria

Do not consider the build done until all of these pass. **State explicitly in your final message whether each
one passes.**

1. **Adding a ninth process block requires editing `lib/scwg-process.ts` only.** No changes to any `.tsx` file.
   Diagram, scroll sequence, navigation and stream tables all derive from that array. Demonstrate by actually
   adding a dummy block, confirming it renders end to end, then removing it.
2. **Rewriting any prose requires editing one `lib/scwg-*.ts` file and nothing else.** No user-facing sentence
   lives in a `.tsx` file.
3. **Styling uses existing Tailwind tokens.** No new hex colours, no arbitrary values duplicating an existing
   token. If a genuinely new token is needed, add it to `tailwind.config.ts` and say so.
4. **`npm run lint` passes and the project type-checks** with no new errors.
5. **No component file exceeds ~250 lines.** Split if it does.
6. **A `## Editing this page` section is appended to this spec** with a task-to-file table — "I want to change
   X → edit Y" — covering: add/remove/reorder a block, change balance numbers, add a map site, change an
   overlay, rewrite a section, add a reference, restyle.

### Dependencies

Add only `d3-geo`, `d3-selection`, `d3-transition` and `topojson-client` (plus `@types/`), not the full `d3`
bundle. Vendor the China TopoJSON into `data/` so the page has no runtime external fetch.

The repo already has `@googlemaps/js-api-loader` for the restaurants page. **Do not use it here** — this is an
analytical choropleth with overlay toggles, not a place map, and it should not depend on an API key or network.

---

## Non-negotiable: placeholder data discipline

**The mass and energy balances do not exist yet.** Do not invent plausible-looking numbers.

Use TypeScript to make this structurally impossible rather than merely discouraged. In `scwg-types.ts`:

```ts
export type ProcessValue =
  | { value: number; unit: string; status: "placeholder"; note?: string }
  | { value: number; unit: string; status: "literature"; source: string };
```

A bare `number` where a `ProcessValue` is expected becomes a compile error, and a `"literature"` value without
a `source` becomes a compile error. This is the enforcement mechanism — do not weaken it with optional fields
or `any`.

Rendering rules, implemented once in `components/scwg-value.tsx`:

- **Placeholder** — muted colour, dotted underline, small `est.` marker. Hover/focus reveals "Placeholder —
  pending balance closure."
- **Literature** — normal weight, superscript citation marker resolving to `scwg-references.ts`.
- A **legend** in a sticky page-level header, visible while Act 3 is in view.
- Colour is never the sole carrier of the distinction — the dotted underline and `est.` marker do that work.

This is the most important instruction in this document. A polished page with fabricated numbers on it,
published under the author's own name, is worse than no page.

---

## Page structure — five acts

### Act 0 — Hero

Use the existing `PageIntro` component, then a full-width abstract card in the `rounded-[2rem]` idiom. Content
from `lib/scwg-meta.ts`. Include `HistoryBackButton` with `fallbackHref="/projects"`.

**Title:** Co-Valorization of Bauxite Residue and Soybean Processing Waste via Supercritical Water Gasification

**Subtitle:** A multifunctional red mud bed, conventional acid gas removal, and reforming-coupled OXZEO olefin
synthesis

**Abstract:** Okara (douzha) and bauxite residue are individually awkward wastes that become tractable when
co-processed. Okara is 80–85 wt% water, a liability for any dry thermochemical route but an asset for
supercritical water gasification, where water is the reaction medium rather than a drying burden. Bauxite
residue is alkaline and iron-rich, impounded at roughly 170 Mt per year globally with under 3% utilization; its
Fe₂O₃ content makes it a credible redox mediator and its residual sodium alkalinity a tar cracker, yet that
same alkalinity is what makes it hazardous and unsaleable. This work proposes a flowsheet in which the
supercritical water gasifier performs both duties at once: it gasifies the biomass over a multifunctional red
mud bed and, in the same pass, dealkalizes the residue, transferring sodium into a separable N-K-P-S brine.
Three design conflicts are identified and resolved by decision. Mass and energy balances are not yet closed.

### Act 1 — Why this is being built: the compliance landscape

Four scroll-linked panels, ~120–180 words each, from `lib/scwg-regulatory.ts`. A timeline rail runs down the
left; each framework reveals as the reader passes it. (Check `components/about-section-rail.tsx` — a similar
rail may already exist and should be reused.)

**Panel 1 — The problem statement.** Industrial decarbonisation has moved from voluntary target-setting to
enforceable trade and disclosure instruments. A process concept in 2026 is evaluated not only on yield and cost
but on whether its carbon claim survives third-party audit and border adjustment. That changes engineering
decisions upstream — it determines which allocation method may be used, which determines whether a waste
feedstock enters the boundary burden-free.

**Panel 2 — ISO 14067.** The product carbon footprint standard. Its decisive feature here is the allocation
hierarchy: avoid allocation by system subdivision, then allocate by physical relationship, then by economic
value — documenting the choice. The cut-off (zero-burden) method lets waste material enter a system
burden-free. For the same physical product, cut-off, 50/50 and substitution methods can produce footprints
differing by more than 20%. ISO 14067 requires the allocation choice and rationale to be transparently
documented; a footprint that does not disclose the method is non-compliant. **Whether red mud enters this
system burden-free as a waste, or carries allocated Bayer-process burden as an aluminium co-product, is the
largest single lever on the result.**

**Panel 3 — CBAM.** The EU Carbon Border Adjustment Mechanism entered its definitive period on 1 January 2026,
phasing in through 2034 alongside withdrawal of free EU ETS allowances. Annex I scope remains aluminium,
cement, electricity, fertilisers, hydrogen, and iron and steel. Chemicals and polymers are not in scope for
2026; the Commission has proposed extending coverage from 1 January 2028 to roughly 180 downstream products
with high steel or aluminium content, and plans a 2027 report evaluating extension to indirect emissions and
further sectors including chemicals. **The counterintuitive implication: the olefins face no CBAM liability
today, but recovered iron units entering a steel chain and brine-derived fertilizer sit inside existing Annex I
categories. The exposure is on the by-products, not the main product.** Give this its own visual emphasis.

**Panel 4 — ISCC PLUS, RED III, and China's carbon market.** ISCC PLUS is the operative certification for
bio-based chemicals and polymers outside RED-regulated fuel applications; it permits certified feedstock to be
tracked through shared assets by mass balance rather than physical segregation. Its Mass Balance Guidance
Document 1.0 went through public consultation with a final version expected mid-2026 — the credit-transfer
rules are being rewritten on the same timeline as this design. RED III thresholds apply where product gas is
sold as fuel rather than feedstock. Domestically, China's national ETS is expanding to steel, cement and
aluminium with absolute caps by 2027, and CCER has relaunched.

**Be explicit about the structural weaknesses, they are not incidental.** Mass balance permits physical mixing
of sustainable and non-sustainable material with bookkeeping-only segregation, which is inherently exposed to
falsified documentation and multiple claiming. There is no downstream laboratory test that distinguishes a
waste-derived feedstock from a virgin one once processed — the China–EU used cooking oil mislabelling crisis is
the precedent, and okara and soybean straw are exactly as indistinguishable from virgin soy processing streams.
Point-of-origin verification rests on self-declaration, and most individual waste sources are too small to
trigger mandatory physical audit. And certification bodies are paid by the producers they audit. Act 2 shows
why the third of these decides the feedstock strategy.

### Act 2 — The siting problem: where the two wastes actually are

**Not a decorative map.** This section makes a specific analytical point, and the point is a *problem*, not a
synergy. Two feedstocks, two completely different geographies.

`components/scwg-siting-map.tsx`, driven entirely by `data/scwg-map-sites.json`.

#### Overlay A — Bauxite waste (red mud): alumina REFINERIES only

**Critical: map refineries, not smelters.** Red mud comes from the Bayer process in alumina *refining*.
Aluminium *smelting* consumes alumina electrolytically and produces **no bauxite residue at all** — its wastes
are spent pot lining, carbon anode residues and fluoride dust. The two industries follow opposite siting logic:
smelting chases cheap power, refining follows bauxite and caustic logistics. **Do not plot smelters anywhere on
this map, and do not include Xinjiang, Inner Mongolia, Yunnan or Qinghai as red mud sources.** They carry large
aluminium output and no meaningful residue arisings.

Refining is concentrated in exactly five provinces — approximately 95% of national capacity, with Shandong,
Shanxi and Guangxi alone above 70%. These five are the **complete** candidate set. Order pins by suitability,
not capacity, and surface that ranking in the UI (approximate; flag `status: "unverified"`):

- **Guangxi** — Baise, Pingguo, Fangchenggang (Xinfa, ~2.4 Mt/y). *Strongest candidate*: 400–700 km from Pearl
  River Delta industrial soymilk plants.
- **Henan** — Zhengzhou, Sanmenxia, Jiaozuo. *Dark horse*: co-located fragmented tofu okara, zero haul, but the
  hardest supply chain to certify.
- **Shandong** — Binzhou/Zouping (Weiqiao), Chiping (Xinfa), Zibo. Largest capacity, but **a trap** — its
  soybean industry crushes imported beans for meal, which yields no okara. Mark it visually as an apparent
  match that is not one.
- **Shanxi** — Jiaokou/Lüliang (Xinfa), Xiaoyi, Hejin. Deep inland, no soy food processing nearby.
- **Guizhou** — Guiyang, Zunyi (Chinalco). Moderate capacity, no okara supply in radius.

#### Overlay B — Okara, industrial (large soymilk plants)

**The critical distinction this map must teach: okara is not a crushing by-product.** Roughly 90% of imported
GM soybean is crushed for oil and meal — that produces *no okara*. Okara arises only from soymilk and tofu
manufacture, which uses non-GM domestic beans; over 60% of domestic non-GM soybean goes to food use. So the
large coastal crushing complexes at Rizhao, Qingdao, Nantong, Zhangjiagang, Dongguan and Zhanjiang — which
dominate any map of "soybean processing" and represent ~85% of national crushing capacity — are **irrelevant to
this feedstock.** If you plot them at all, plot them as a deliberately greyed-out "not a source" layer to make
the point; never as an okara supply.

Industrial okara comes from a small number of large beverage plants — clean point sources with single-supplier
traceability, which matters directly for the self-declaration weakness in Act 1.

- **Vitasoy** — five mainland plants: Shanghai; Wuhan (Hubei, opened 2016, ~105,000 m², largest); Shenzhen,
  **Foshan** (opened 2011) and Dongguan in Guangdong
- Add placeholder entries for other major soy beverage producers (Joyoung, Dali/Doubendou, Weiwei) marked
  `status: "unverified"`

A single large soy beverage plant plausibly yields 150–330 t/d of okara, enough to supply a plant of this scale
on its own. National arisings are ~2.8 Mt/y (Japan 0.8, Korea 0.31) at 1.1–1.2 kg okara per kg beans processed.
Flag that the 2.8 Mt basis (wet vs dry) is unconfirmed and differs roughly fivefold.

#### Overlay C — Okara, fragmented (tofu manufacture)

Larger tonnage, harder supply chain. Tofu production is fragmented across thousands of small workshops sited
close to consumption because the product is perishable, so this overlay follows urban population density rather
than industrial capacity. Render as **graduated province shading, not pins** — the visual contrast with Overlay
B is the point.

**This overlay is where the certification risk lives.** Fragmented, self-declaring, small waste sources are
exactly the profile where feedstock integrity fails at audit. Say so, and link back to Act 1.

#### Overlay D — Context layers (secondary, off by default)

- **Soybean straw** — field residue, follows cultivation: Heilongjiang, Jilin, Liaoning, eastern Inner Mongolia
- **Non-GM food-grade soybean origin** — Heilongjiang, a designated GMO-free planting region with segregation
  requirements. Origin of the beans that become okara, but not where the okara appears.

#### The analytical payload

A side panel updates as overlays toggle:

> Red mud sits in five refining provinces: Shandong, Shanxi, Henan, Guangxi and Guizhou. Industrial okara sits
> in the Pearl River Delta, Shanghai and Wuhan. Fragmented tofu okara follows population. Soybean straw is a
> thousand kilometres further north, in Heilongjiang and Jilin. **No province holds red mud and okara at scale
> together.**
>
> **Guangxi to Guangdong** is roughly 400–700 km and pairs real alumina capacity with three industrial soymilk
> plants — the shortest credible link between the two wastes. **Henan** offers genuine co-location, since its
> refineries sit under very high population density, but the fragmented okara supply is the hardest to certify.
> **Shandong** is a trap: the largest alumina capacity in China, but its soybean industry crushes imported beans
> for meal and yields no okara.
>
> Which stream moves is a live design decision. Red mud is dense, cheap and moves badly. Okara is 80% water,
> moves worse, and spoils within days. Straw is bulky and low-density. This constrains siting more than any
> thermodynamic consideration in the flowsheet.

Include a **haul-distance calculator**: reader picks a candidate site, panel computes great-circle distance to
the nearest source in each active overlay. Three pre-set candidates: Guangxi–Guangdong corridor, Henan, Shandong.

#### Implementation notes

`d3-geo` with `geoConicEqualArea`, parallels ≈ 25°/47°, rotate ≈ `[-105, 0]`. Pin radius encodes capacity where
known; hollow pins where unverified. Distinct mark shapes per overlay, not colour alone. **Flag the entire
dataset `status: "unverified"` and surface that in the UI** — these coordinates have not been confirmed against
a primary source.

### Act 3 — The plant: scroll-driven process diagram

The core of the page. All content from `lib/scwg-process.ts`.

**Layout.** Two columns.

- **Left, sticky, full viewport height (~55%):** the process flow diagram, which does not scroll away. As the
  reader scrolls it pans and zooms to centre the active block. Active block highlights; upstream blocks dim to a
  completed state; downstream blocks stay ghosted. Streams entering and leaving the active block animate with a
  slow directional dash.
- **Right, scrolling (~45%):** one section per block — description, inlet/outlet stream tables, energy duty,
  conversion metric.

Below the `lg` breakpoint, collapse to one column: diagram as a sticky band at the top (max 45vh), text
scrolling beneath.

**Diagram style — Aspen Plus / ISA-5.1 PFD convention.** Not generic rounded rectangles with icons. Draw
recognisable unit-operation symbols as inline SVG, selected from a `type` field on each block:

- Slurry mix tank + positive-displacement pump (circle with triangle) — B1
- Vertical tubular high-pressure reactor, packed-bed hatch — B2
- Cyclone/separator body with tangential inlet — B3
- Let-down valve + horizontal flash drum — B4
- Packed absorber + regenerator column pair (Rectisol), plus a small guard vessel — B5
- Fired tubular reformer, radiant box with vertical tubes — B6
- Fixed-bed catalytic reactor with internal bed indication — B7
- Rotary/fluid-bed regenerator + leach train — B8

Streams as directional lines with numbered tags in diamond/circle callouts, T/P condition tags at key points.
Engineering-drawing restraint: near-black linework on the existing paper/surface background, one accent for the
active block, one warning colour reserved for flagged items. Monospace, tabular figures for all numerals.

**Two recycle streams must be drawn and made prominent:**

- **CO₂ recycle, B7 → B6** — OXZEO co-produced CO₂ returning as dry-reforming oxidant
- **R1, red mud recycle, B8 → B1** — closes the solids loop. It must enter at **B1 (slurry make-up), not at the
  reactor**, because the solid leaves B8 hot, oxidised and near-atmospheric and has to be re-slurried and
  re-pressurised to 25 MPa.

Blocks **B2, B3 and B6 carry a "needs validation" badge** — the load-bearing, unproven claims.

#### The eight blocks — content payload

**B1 — Feed preparation and slurry make-up.** Ambient → 25 MPa.
Straw is milled and blended into okara to 18–22 wt% total solids; red mud is dosed; the slurry is pressurised by
positive-displacement pump. Feed–effluent exchange recovers reactor outlet heat. Okara is the rheological
enabler: its fine hydrated fibre forms a pumpable paste rather than a settling suspension.
*Literature anchor for the solids ceiling:* 30 wt% glucose solution, 18 wt% corn cob and 24 wt% coal–water
slurry have been fed to supercritical reactors; twin piston pumps have delivered 15% solids biomass slurry to
27 MPa; dewatered sewage sludge at 7.69 wt% solids required corn starch paste and a cement pump to be
deliverable at all.

**Give this block an interactive solids-budget widget — it is the binding constraint on the whole design.**
Okara arrives at ~17.2 wt% solids (82.8% moisture), already inside the 18–22 wt% window with no dewatering.
But take 100 kg wet okara: 17.2 kg solids (~0.5 kg ash, ~16.7 kg organic). Dose just 5 kg of red mud and the
slurry is at 22.2 kg solids in 105 kg — **21.1 wt%, at the ceiling, with no straw at all.** Red mud is
inorganic dead weight in this budget: it consumes pumpability headroom without contributing carbon. Let the
reader move sliders for okara / straw / red mud / dilution water and watch the 22 wt% ceiling bind. The four
ways out are all costly: dilute (heat inert mass to 600 °C), cut red mud (weakens the dealkalization duty that
*is* the concept), cut straw (loses carbon density), or dewater okara (a hydrated gel that dewaters badly).

**Also cover slurry formulation, because the obvious additives are traps.** No wetting agent is needed — okara
is hydrophilic and arrives hydrated, and its residual soy protein and phospholipids are amphiphilic, so the
organic fraction is self-dispersing. The suspension problem is the red mud (haematite ~5.2 g/cm³, finely
divided, will settle). But **Na-CMC**, the documented SCWG slurry stabilizer, is the *sodium* salt — and B3
exists to strip sodium. **Lignosulfonate**, the other standard dispersant, injects sulfur straight into the
acid gas removal duty. If a stabilizer is needed, **xanthan gum** is the clean choice: no Na, no S. First
establish whether one is needed at all — slurries at 30–50 wt% are shear-thinning while 10–20 wt% shear-thicken,
so a ~20 wt% blend sits near an unfavourable transition.

**B2 — Supercritical water gasifier with red mud bed.** 600–650 °C, 25 MPa *(placeholder)*.
Biomass gasifies to CH₄, CO₂ and H₂. Red mud plays three roles, and they are not equally well supported:
- *Redox mediator* — an established chemical-looping oxygen carrier (Fe₂O₃ typically >40 wt%), but that
  literature is atmospheric, high-temperature and dry. In supercritical water the oxidant is already present in
  vast excess, so lattice oxygen donation *mediates* the redox chemistry rather than supplying an oxygen
  deficit. Flag as requiring qualification.
- *Gasification catalyst* — the best-supported role. Red mud gives H₂ yields comparable to commercial alkali
  catalysts; a Ni-Cu bimetallic on a red mud support reached 21.88 mmol/g H₂, 6.7× unpromoted Ni. Direct
  precedent exists in co-gasification of spirit-based distillers' grains with sewage sludge over red mud.
- *Alkali reservoir and tar cracker* — real but self-limiting, because the alkali dissolves then precipitates.

Concurrently the reactor **dealkalizes the red mud**.

**Include a calibration warning, prominently.** Dry chemical-looping reference values (1.02 Nm³/kg, 12.06
MJ/Nm³, 91.49% cold gas efficiency, 82.65% carbon conversion) establish only that red mud works as a carrier;
they are **not achievable targets here** and must not anchor the reader. SCWG efficiency falls as feed
concentration rises, and headline results come from low loading — pig manure at 87.59% gasification efficiency
was at **6 wt% feed** with K₂CO₃, against ~20 wt% here. The one figure obtained under conditions resembling a
real slurry feed is **above 40% carbon gasification efficiency** at 540 °C, 25 MPa with a Na-CMC slurry. There
is a three-way conflict: pumpability wants high solids, the energy balance wants high solids, gasification
efficiency wants low solids. Planning basis: 40–60% carbon gasification efficiency, flagged as an estimate.

**B3 — Salt separator, a purposeful product unit.** Supercritical; cooled-wall or cyclonic.
Inorganic salt solubility collapses above the critical point, and salt deposition is the dominant plugging and
corrosion failure mode of continuous supercritical water systems. **Design decision: this is a primary product
unit, not a protective device.** Sodium removal is deliberate and metered, because supercritical water
treatment of red mud gives enhanced dealkalization and detoxifies the residue for sale. The salt load is
intentionally large, and red mud dosing is co-determined by this separator's duty rather than by catalytic
requirement alone. Two duties: dealkalization, and recovery of Na/K/P as a fertilizer-precursor brine. Sulfur
partitions partly into the same brine — hence N-K-P-S — but as an incidental credit against the downstream acid
gas duty, **not** a designed removal step; B5 is sized without relying on it. Potassium from straw joins the
sodium load here, which is where the classical K-silicate fouling problem of dry fluidised-bed gasification
reappears in this flowsheet. **B3 remains the load-bearing claim of the concept and is unvalidated at
biomass-gasification residence times.**

**B4 — Depressurization, phase separation, aqueous polishing.** 25 MPa → ~3 MPa.
Gas/liquid/solid split. Ammonia-bearing aqueous phase to nitrogen recovery; spent red mud to B8.

**B5 — Acid gas removal (Rectisol) and ZnO guard.** −30 to −60 °C, ~3 MPa.
Two findings drive this block; present both.

*First, the negative finding, because it is counterintuitive:* **in-bed calcium capture does not work in
supercritical water.** The hydrolysis CaS + 2H₂O ⇌ Ca(OH)₂ + H₂S is well established and is used deliberately
as a CaS stabilization route; a supercritical water gasifier is close to an ideal reactor for running it. Lime
dosed into B2 would capture sulfur and release it again. Moving calcium downstream into dry warm gas would
function, but imports a consumable, creates a spent-sorbent disposal stream, and competes with HCl for capacity
across the whole sorbent life cycle.

*Second, the decision:* **calcium has been removed from the flowsheet entirely and replaced with a commercially
proven acid gas wash.** This is deliberately the least novel block — the one place the design buys a vendor
guarantee instead of inventing something.

Include a **terminology note**: "wet desulfurization" normally denotes limestone–gypsum wet flue gas
desulfurization, an *oxidising post-combustion SO₂* technology. The stream leaving B4 is a *reducing syngas
carrying H₂S and COS*, so the correct standard analogues are the wet acid gas removal processes of gasification
practice — physical solvent or amine absorption — not WFGD.

Stages:
- *S0 — aqueous credit.* Sulfide/sulfate in the B3 brine. Physics, not a mechanism.
- *S1 — Rectisol chilled-methanol wash.* **0.1 ppm total sulfur including COS** — exactly the OXZEO
  specification, in one guaranteed unit. COS matters: protein-derived sulfur in a CO₂-rich gas forms carbonyl
  sulfide, which amines handle poorly and Rectisol handles well. **Decisive integration argument:** this
  flowsheet needs CO₂ control independently, since OXZEO co-produces CO₂ and B6 needs a metered CO₂ feed.
  Rectisol does acid gas removal and CO₂ separation in the same unit. At a 0.1 ppm H₂S target, reported CO₂
  efficiency ranks Rectisol > Selexol > MDEA > sulfolane-MDEA. Incumbent technology in Chinese
  coal-to-chemicals.
- *S1-alt — selective MDEA,* near-ambient. Fast with H₂S, slow with CO₂, reaching under 20 ppmv H₂S. Far
  cheaper, no refrigeration or methanol inventory — but misses the OXZEO spec alone, handles COS poorly, gives
  no CO₂ control. A live alternative, not a rejected one.
- *S2 — ZnO guard,* non-regenerable. Cheap insurance with Rectisol; mandatory with MDEA.
- *S3 — liquid redox (LO-CAT type), not Claus.* Claus wants acid gas at 10–13 vol% H₂S or above; this sulfur
  load will likely fall short. Liquid redox suits small duties and yields saleable elemental sulfur.

**B6 — Bi-reformer.** 800–900 °C, 1–3 MPa *(placeholder)*.
Supercritical water gasification produces essentially no CO — water-gas shift equilibrium in a medium that is
overwhelmingly water sits hard on the product side. OXZEO consumes CO. This block resolves that. Dry reforming
alone (CH₄ + CO₂ → 2CO + 2H₂) gives H₂/CO ≈ 1, below the ratio the cited OXZEO systems run at; bi-reforming
combines dry and steam reforming in one stage and delivers the target ratio without a separate adjustment step.
Steam is free from the hydrothermal island, and steam co-feed is the principal coking mitigation.

**Design decision: bi-reforming is the design basis.** The alternative — operating B2 above ~700 °C and shorter
with a bed selected for low methanation activity, collapsing the downstream duty to reverse water-gas shift —
has been **evaluated and rejected** on three grounds, worth a short expandable note: higher-severity
hydrothermal service worsens every materials problem; salt precipitation becomes more aggressive, attacking the
B3 block the concept depends on; and it rests on a kinetic assumption (low methanation activity with retained
gasification activity) for which no supporting result exists in the red mud literature. **Do not draw a dashed
alternative path.** The diagram shows one committed architecture.

**On the energy penalty, be precise rather than dramatic.** An earlier framing overstated this. Thermal
excursions here are large but mostly *recoverable* — the gasifier effluent, reformer feed and reformer product
all present high-grade sensible heat against streams needing heat, so a feed–effluent exchanger network
recovers the majority. Two items survive heat integration and should be reported on their own lines: the
Rectisol refrigeration duty is **compressor shaft work**, which no exchanger returns; and the methane round
trip (exothermic methanation, then endothermic reforming) is **reaction enthalpy**, which heat integration
cannot recover at all because the loss is chemical, not thermal. So Rectisol vs MDEA is primarily a capital and
shaft-work comparison, not a heat-recovery one.

**B7 — OXZEO olefin synthesis.** ~400 °C, 2.5–4 MPa.
Oxide–zeolite bifunctional conversion of syngas to C₂–C₄ olefins, exceeding the Anderson–Schulz–Flory limit.
Literature anchors: 80% light olefin selectivity among hydrocarbons at 17% CO conversion over ZnCrOₓ–SAPO-34 at
400 °C, 2.5 MPa; 64% CO conversion at 75% light olefin selectivity over ZnCr₂O₄@ZnOₓ + SAPO-34 at 4.0 MPa,
400 °C on a 68% H₂ / 27% CO feed. Unconverted syngas recycled.
**Be honest about CO₂:** the route co-produces substantial CO₂ via the CO-mediated pathway, and a published
Comment in *ACS Catalysis* (2023) disputes "low CO₂ emission" claims for direct syngas-to-olefins. In a
standalone plant that CO₂ is a liability; here it recycles to B6. Show the loop prominently.

There is **no methanation reactor in this flowsheet**, so the exotherm-runaway and TREMP-staging problem of dry
BtSNG does not arise — methane forms in situ where supercritical water's thermal mass buffers the exotherm.
Worth a one-line note, since readers from a dry-gasification background will expect that hazard.

**B8 — Red mud regeneration and residue valorization.** Air oxidation, then hydrometallurgy.
Reduced iron phases re-oxidised with heat recovery; a bleed leaves as product; the balance recycles as R1.
B2 has already partially reduced Fe₂O₃ → Fe₃O₄/FeO using biomass-derived reductant, so the residue arrives at
any ironmaking step pre-reduced at no marginal cost.

**Make the bleed fraction a headline interactive, not a placeholder.** The recycle competes with the product:
B3 strips the sodium that made red mud catalytically useful, so recycled solid is progressively less active
each pass. This inverts normal chemical-looping logic — here the deactivation *is* the product being
manufactured. Fast bleed keeps the inventory active but may eject residue before it meets a saleable
dealkalization spec; slow bleed yields fully dealkalized saleable residue but circulates catalytically depleted
solid. Let the reader move the bleed fraction and see both consequences.

Also flag an open question: in supercritical water at 600–650 °C, steam re-oxidises iron directly
(3Fe + 4H₂O → Fe₃O₄ + 4H₂), so the reactor may hold iron at a magnetite-like steady state unaided. If so, B8's
air oxidation is doing heat recovery and metals conditioning, not restoring oxygen capacity — different duties,
different sizing basis.

### Act 4 — Product slate

Sticky diagram releases; layout returns to full width. Interactive tiered card grid from `lib/scwg-products.ts`.

**Carbon-derived**
- *C₂–C₄ olefins* — polyolefins, ethylene oxide/glycol, propylene oxide, acrylonitrile, butadiene precursor.
  Bio-attributed under ISCC PLUS mass balance; the premium sits here.
- *CO₂ from OXZEO* — large, contested, and here it has a home: recycle to B6.
- *C₅+ and paraffin tail* — internal fuel, best fired into the reformer endotherm.
- *Bio-SNG* — only under the rejected fork. The base case the olefin route must beat.

**Heteroatom**
- *N-K-P-S brine* → compound fertilizer. Value driver is avoided nitrogen-removal cost on the effluent.
- *Ammonia* → ammonium sulfate, or urea if you also want to consume CO₂.
- *Elemental sulfur* → from liquid-redox recovery. Modest revenue, but a saleable commodity rather than a spent
  sorbent disposal stream — one of the arguments for removing calcium.

**Bauxite-derived — three tiers, inverse mass and value.** Give this the most interactive depth.

*Tier 1 — sell the dealkalized solid as-is.* Highest volume, lowest margin, and the tier this process uniquely
enables, since dealkalization is what makes the residue saleable at all.
- SO₂/H₂S sorbent — FGD, sinter plant
- Supplementary cementitious material — 10–20% clinker replacement in blended cements, 25–30% demonstrated;
  co-calcination with kaolinite gives 30% replacement at 88% of reference 28-day strength; 3–5% into clinker
  raw meal
- Geopolymer precursor — Na-silicate-activated systems reach comparable or better compressive strength, and red
  mud supplies its own sodium
- Heavyweight aggregate and radiation shielding; soil amendment; mine remediation
- Context: ~170 Mt/y produced globally, utilization below 3%. The ceiling is alkalinity, not demand.

*Tier 2 — iron.*
- Reduction roasting + magnetic separation: 97.69% metallization, 81.40% recovery
- Smelting reduction (1500–1600 °C, lime/dolomite flux): pig iron Fe >90%, 90–95% recovery; recent work reports
  98.14–98.36% Fe recovery meeting the steelmaking pig iron standard
- Residual slag is Al₂O₃–SiO₂–CaO–TiO₂ — building-material feed, so no new waste
- CBAM: iron units entering a steel chain are Annex I goods. The olefins are not.

*Tier 3 — critical metals from the iron-depleted slag.* Smelt first: it concentrates these roughly twofold.

| Element | Grade | Price | Use |
|---|---|---|---|
| Sc | 16–230 ppm typical (~84 ppm Chinese sample); 100–800 ppm reported | Sc₂O₃ $3,000–5,000/kg | Al-Sc aerospace alloys, ScSZ fuel-cell electrolytes |
| REE | China 400–1,200 ppm; ~2× enriched over bauxite | varies | magnets, catalysts |
| Ga | 50–100 ppm | $150–300/kg | GaAs/GaN, LEDs; strategically sensitive |
| V | — | V₂O₅ $8–15/kg | steel microalloying, redox flow batteries |
| Ti | 3–10 wt% | low | grade too poor for pigment without upgrading |

Acid leaching dissolves Sc/REE/V/Ga while leaving iron in the solid, so the routes are complementary.

**Scandium caveat as a prominent callout, because the arithmetic is seductive:** 100 kt/y of residue at 84 ppm
contains ~8.4 t Sc ≈ 13 t Sc₂O₃; at 60% recovery and $3,000/kg that is ~$23M/y. But global Sc₂O₃ demand is only
of order tens of tonnes per year — a single plant this size could saturate the market and collapse the price.
**The binding constraint on scandium is market depth, not resource.** Mark the global demand figure as
requiring verification against a USGS commodity summary.

**Avoided disposal** — gate fees on okara and red mud. Not revenue in the accounting sense, but likely the
largest single contributor in the Chinese context, and it determines whether the feedstocks are wastes, which
determines zero-burden entry under ISO 14067.

**Co-feed evaluation card.** Widening the feed slate is chemically permissive and commercially dangerous *here*,
because the value case rests on residue purity. Rank by residue-purity risk, not gas yield: **soybean straw**
(best — no contaminant burden, competes only for the solids budget); **pig manure** (credible second — proven
SCWG feed, co-located with straw in the Northeast, adds N/K/P to the brine, and supercritical water destroys
veterinary antibiotics and resistance genes, a regulatory asset); **food waste** (high chloride from cooking
salt, feeds the corrosion problem); **sewage sludge** (best chemistry match and a phosphorus credit, but heavy
metals partition into the solid and foreclose the cementitious and sorbent routes); **human faeces/septage**
(certification and acceptance poison). The last two are rejected on residue purity, not chemistry.

### Act 5 — Open questions and references

Precede the checklist with a short **"Decisions taken"** block so a reader sees what is settled first: the salt
separator is a purposeful product unit; bi-reforming is the design basis and upstream methanation suppression
is rejected; calcium is removed in favour of a conventional acid gas wash. Then:

1. **Rectisol versus MDEA is undecided.** Rectisol meets the OXZEO spec outright and handles CO₂ in the same
   unit; MDEA is far cheaper, near-ambient, and needs the guard bed. The largest open capital question.
2. **Measured ultimate analyses are missing** for the specific okara and straw sources, including sulfur and
   chloride. Sulfur sets the acid gas removal duty; chloride sets materials selection.
3. **Supercritical dealkalization is unvalidated** at biomass-gasification residence times. If it fails, the
   concept reverts to a conventional wet-biomass gasifier with a cheap iron catalyst.
4. **The bleed fraction is unset**, and it is the exchange rate between catalytic performance and residue
   product quality.
5. **Whether B8 air regeneration does anything** given steam-iron chemistry in B2.
6. **The ISO 14067 waste classification pathway** for bauxite residue is unconfirmed, and it decides which of
   two very different value propositions this project is.
7. **Feedstock geography is unresolved** — no province holds red mud and okara at scale, and Guangxi versus
   Henan is undecided.

Then references from `lib/scwg-references.ts`, marking verified sources ✓ and unverified-attribution sources °.

---

## Interaction and visual specification

**Scroll mechanics.** `IntersectionObserver` with a root margin triggering when a section reaches the vertical
centre of the viewport. Do not hijack scroll. Do not use scroll-jacking libraries. Do not animate on every
scroll event. Block transitions 400–600 ms, ease-out.

**Diagram transitions.** Pan/zoom the SVG viewBox with a d3 transition. Build the diagram once, then animate
attributes; never re-render on scroll.

**Typography.** Body at 65–75 character measure. Monospace with tabular figures for all numerals, stream tags
and units. Use the repo's existing type scale.

**Accessibility.** Server-rendered, so all prose is in the initial HTML — preserve that by keeping text in
server components. Respect `prefers-reduced-motion`: disable pan/zoom and stream dashes, instant state changes.
All controls keyboard-reachable with visible focus.

**Performance.** Keep the client bundle small. The diagram, scroller and map are the only client components. Do
not pull the full `d3` package.

---

## What not to do

- Do not invent mass balance numbers, energy duties or conversion rates. Flagged placeholders only.
- Do not put user-facing prose in `.tsx` files. It belongs in `lib/scwg-*.ts`.
- Do not introduce a parallel design system. Use the repo's Tailwind tokens.
- Do not smooth over the three design conflicts — the CO deficit, CaS hydrolysis, and the incompatibility of red
  mud's three assigned roles. All three are *resolved by decision*, but the conflict and the reasoning are the
  most interesting content on the page. Present each as problem → decision → what it cost.
- Do not present any of the three as still open. They are settled; open items are in Act 5.
- Do not plot aluminium smelters as red mud sources, and do not include Xinjiang, Inner Mongolia, Yunnan or
  Qinghai in Overlay A. Refineries only.
- Do not map soybean crushing plants as okara sources. Crushing yields meal and oil, not okara.
- Do not present the siting map as a synergy story. The feedstocks are not co-located.
- Do not describe the sulfur block as "wet desulfurization" without the terminology note.
- Do not overstate the heat-integration penalty. Separate recoverable sensible heat from irrecoverable shaft
  work and reaction enthalpy.
- Do not use scroll-jacking, autoplaying media, or per-tick animation.
- Do not claim the process is proven. It is a concept with three unvalidated load-bearing assumptions.

---

## Build order

1. **Read the repo conventions listed at the top.** Report back how you plan to fit this page into the existing
   structure, and confirm the route slug, before writing code.
2. **Types and content modules first.** `scwg-types.ts`, then every `lib/scwg-*.ts` with the full real text.
3. `scwg-value.tsx` and `scwg-stream-table.tsx` — the primitives that enforce placeholder discipline.
4. `page.tsx` with all acts rendering as plain server-side sections, no interaction. Verify it reads correctly
   top to bottom.
5. The SVG process diagram, static, all eight blocks, both recycle streams, correct Aspen-convention symbols
   generated from block `type`.
6. **Stop here and show a screenshot of the diagram before wiring interaction.** Stream topology and symbol
   correctness matter more than the scroll effect and are far cheaper to fix now.
7. `scwg-process-scroller.tsx` — observers and the active-block state machine.
8. The B1 solids-budget widget and the B8 bleed-fraction widget.
9. `scwg-siting-map.tsx` — last, since it needs the vendored TopoJSON.
10. Responsive collapse, `prefers-reduced-motion`, keyboard navigation.
11. Register the page in the projects index. Run `npm run lint`, type-check, then report pass/fail on each of
    the six acceptance criteria.

---

## Editing this page

Content changes never require touching a component. Prose lives in `lib/scwg-*.ts`, map data in `data/`, and
geometry in `lib/scwg-diagram-*.ts` and `lib/scwg-map-frame.ts`.

**Note on structure.** The brief above describes five acts. The page as built runs **nine**, because the
author asked for the rationale, feedstock, chemistry and waste-treatment material to be given their own
sections as the underlying report grew. The act numbering below is what the page actually renders.

| I want to change… | Edit this |
|---|---|
| **Add / remove / reorder a process block** | `lib/scwg-process.ts` only. Append or splice a `ProcessBlock` in `scwgProcessBlocks`. Array order *is* the order down the flowsheet and the scroll sequence — there is no position field. Diagram, stream routing, scroll observers and stream tables all derive from it. Give it a `symbol` from the `BlockSymbol` union. |
| **Change balance numbers, duties, or KPIs** | `lib/scwg-process.ts` — `duty`, `metrics`, `contextValues`. Every number is a `ProcessValue`: `"placeholder"` while the balance is open, `"literature"` with a `source` marker that exists in `lib/scwg-references.ts`, or `"indicative"` with a mandatory `note`. A bare number, a literature value with no source, or an indicative value with no note is a compile error. |
| **Change how a stream is routed** | `lib/scwg-process.ts` — the `inlet` / `outlet` `tag` values. Routing derives from matching an outlet tag to an inlet tag: same tag on a later block draws the spine, on an earlier block a recycle, on the same block a self-loop; an unmatched inlet is a feed stub and an unmatched outlet a product stub. One tag = one stream = one name at both ends. Never hand-place a line. |
| **Change block spacing, box size, or zoom** | `lib/scwg-diagram-layout.ts`; connector path shapes in `lib/scwg-diagram-connectors.ts`. |
| **Draw a new unit-operation symbol** | Add a case to `BlockSymbol` in `lib/scwg-types.ts`, then a glyph + `GLYPHS` entry in `components/scwg-diagram-symbols.tsx`. |
| **Add or move a map site** | `data/scwg-map-sites.json` → `sites[]`. Use an existing overlay id; keep `status: "unverified"` until confirmed. `capacity` drives pin radius; `null` renders hollow. |
| **Change province shading** | `data/scwg-map-sites.json` → `fragmentedShading`, province name → intensity `0–1`. |
| **Add, rename, or toggle a map overlay** | `lib/scwg-siting.ts` → `scwgSitingOverlays`. Give it a colour in `OVERLAY_COLOR` in `components/scwg-map-mark.tsx`. Keep shape *and* colour distinct — colour is never the sole cue. |
| **Change the map framing / zoom** | `lib/scwg-map-frame.ts` → `MAINLAND_FOCUS` and the `MAP_W` / `MAP_H` constants. The frame is a MultiPoint grid, not a polygon: d3 reads a bare polygon as its own inverse and collapses the scale. |
| **Replace the base map** | `data/scwg-china-provinces.json` (object `provinces`, `name` per feature); neighbours in `data/scwg-neighbours.json` (object `neighbours`). Verify ring winding: if `geoBounds` on any feature returns the whole globe, reverse every ring before converting. |
| **Rewrite the hero** | `lib/scwg-meta.ts` — title, subtitle, abstract, legend, affiliation. Act eyebrows and every UI label live there too, in `scwgUi`. Report metadata is in `lib/scwg-report-structure.ts`. |
| **Rewrite Act 1 (regulatory panels)** | `lib/scwg-regulatory.ts` |
| **Rewrite Act 2 (why these two wastes)** | `lib/scwg-rationale.ts` |
| **Rewrite Act 3 (siting narrative, overlay blurbs, payload)** | `lib/scwg-siting.ts` |
| **Rewrite Act 4 (feedstock, blend design, solids budget, slurry formulation, co-feeds, provinces)** | `lib/scwg-feedstock.ts` |
| **Rewrite Act 5 (block prose, roles, flags)** | `lib/scwg-process.ts` |
| **Rewrite Act 6 (thermodynamic and kinetic basis)** | `lib/scwg-chemistry.ts` — water properties, reaction tables, iron buffering, salt physics, bi-reforming stoichiometry, OXZEO mechanism, contradictions. |
| **Rewrite Act 7 (waste treatment, discharge standards)** | `lib/scwg-waste-treatment.ts` |
| **Rewrite Act 8 (product slate, tiers, tables, callouts)** | `lib/scwg-products.ts` |
| **Rewrite Act 9 (decisions, open questions, review disposition, report structure)** | `lib/scwg-open-questions.ts`, `lib/scwg-review.ts`, `lib/scwg-report-structure.ts` |
| **Change the solids-budget widget** | `components/scwg-solids-budget.tsx` for behaviour; its copy is in `scwgUi.feedstock` and the surrounding prose in `lib/scwg-feedstock.ts`. |
| **Add or verify a reference** | `lib/scwg-references.ts`. The `marker` is what a `ProcessValue.source` points at; set `status` to `"verified"` (✓) or `"unverified"` (°). |
| **Restyle** | The page runs a VENEX-derived palette scoped under `.scwg-page` in `app/globals.css` (`moss` → VENEX green, `clay` → warm warning, `--scwg-navy` for section headings), and is light-only: `.dark:has(.scwg-page)` pins the document to the light tokens. Card idiom is `rounded-[2rem] border border-ink/10 bg-surface/55`. Placeholder / indicative / literature styling lives in `components/scwg-value.tsx`. |
| **Change the hero photo** | Replace `photos/scwg-hero.webp` (backdrop) and `photos/scwg-hero-card.webp` (index card) in the `site-media` bucket — `/photos/*` is proxied to Supabase, so `public/photos/` is not what production serves. |
| **Make the page full-bleed** | `components/site-chrome.tsx` → `STANDALONE_ROUTES`. |
| **Change the projects-index card** | `lib/projects.ts` → the `supercritical-water-gasification` entry. |
