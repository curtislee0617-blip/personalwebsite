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
6. **A short `## Editing this page` section is appended to this spec file** with a task-to-file table —
   "I want to change X → edit Y" — covering: add/remove/reorder a block, change balance numbers, add a
   map site, change an overlay, rewrite a section, add a reference, restyle.

### Dependencies

Add only `d3-geo`, `d3-selection`, `d3-transition` and `topojson-client` (plus their `@types/`), not
the full `d3` bundle. Vendor the China TopoJSON into `data/` so the page has no runtime external fetch.

The repo already has `@googlemaps/js-api-loader` for the restaurants page. **Do not use it here** — this
is an analytical choropleth with overlay toggles, not a place map, and it should not depend on an API
key or network availability.

---

## Non-negotiable: placeholder data discipline

**The mass and energy balances do not exist yet.** The underlying report's balance section is unwritten.
Do not invent plausible-looking numbers.

Use TypeScript to make this structurally impossible rather than merely discouraged. In `scwg-types.ts`:

```ts
export type ProcessValue =
  | { value: number; unit: string; status: "placeholder"; note?: string }
  | { value: number; unit: string; status: "literature"; source: string };
```

A bare `number` where a `ProcessValue` is expected becomes a compile error, and a `"literature"` value
without a `source` becomes a compile error. This is the enforcement mechanism — do not weaken it with
optional fields or `any`.

Rendering rules, implemented once in `components/scwg-value.tsx`:

- **Placeholder** — muted colour, dotted underline, small `est.` marker. Hover/focus reveals
  "Placeholder — pending balance closure."
- **Literature** — normal weight, superscript citation marker resolving to `scwg-references.ts`.
- A **legend** appears in a sticky page-level header, always visible while Act 3 is in view.
- Colour is never the sole carrier of the distinction — the dotted underline and `est.` marker do that
  work for colour-blind and high-contrast readers.

This is the most important instruction in this document. A polished page with fabricated numbers on it,
published under the author's own name, is worse than no page.

---

## Page structure — five acts

### Act 0 — Hero

Use the existing `PageIntro` component for consistency with other project pages, then a full-width
abstract card in the established `rounded-[2rem]` idiom. Content from `lib/scwg-meta.ts`.

**Title:** Co-Valorization of Bauxite Residue and Soybean Processing Waste

**Subtitle:** Supercritical water gasification with a multifunctional red mud bed, conventional acid gas
removal, and reforming-coupled OXZEO olefin synthesis

**Abstract:** Two waste streams that are individually awkward become tractable when co-processed. Okara —
the residue from soymilk and tofu manufacture — is 80–85 wt% water, a liability for any dry thermochemical
route but an asset for supercritical water gasification, where water is the reaction medium rather than a
drying burden. Bauxite residue is alkaline, iron-rich, and impounded at roughly 170 Mt per year globally
with under 3% utilization; its Fe₂O₃ content makes it a credible low-cost oxygen carrier and its residual
sodium alkalinity makes it a tar cracker — but that same alkalinity is what makes it a liability and what
must be removed before the residue can be sold. This work proposes that the supercritical water gasifier
performs both duties at once: it gasifies the biomass using red mud as redox mediator and tar cracker, and
in the same pass it dealkalizes the red mud, transferring sodium into a separable, saleable brine. The
gasifier is simultaneously a biomass converter and a bauxite residue treatment unit.

Include `HistoryBackButton` with `fallbackHref="/projects"`, matching the biodiesel page.

### Act 1 — Why this is being built: the compliance landscape

Four scroll-linked panels, ~120–180 words each, from `lib/scwg-regulatory.ts`. A timeline rail runs down
the left; each framework reveals as the reader passes it. (See `components/about-section-rail.tsx` — a
similar rail pattern may already exist and should be reused if so.)

**Panel 1 — The problem statement.** Industrial decarbonisation has moved from voluntary target-setting to
enforceable trade and disclosure instruments. A process concept in 2026 is evaluated not only on yield and
cost but on whether its carbon claim survives third-party audit and border adjustment. That changes
engineering decisions upstream — it determines which allocation method may be used, which determines
whether a waste feedstock enters the boundary burden-free.

**Panel 2 — ISO 14067.** The product carbon footprint standard. Its decisive feature here is the allocation
hierarchy: avoid allocation by system subdivision, then allocate by physical relationship, then by economic
value — documenting the choice. The cut-off (zero-burden) method lets waste material enter a system
burden-free. For the same physical product, cut-off, 50/50 and substitution methods can produce footprints
differing by more than 20%. ISO 14067 requires the allocation choice and rationale to be transparently
documented; a footprint that does not disclose the method is non-compliant. **Whether red mud enters this
system burden-free as a waste, or carries allocated Bayer-process burden as an aluminium co-product, is the
largest single lever on the result.**

**Panel 3 — CBAM.** The EU Carbon Border Adjustment Mechanism entered its definitive period on 1 January
2026, phasing in through 2034 alongside withdrawal of free EU ETS allowances. Annex I scope remains
aluminium, cement, electricity, fertilisers, hydrogen, and iron and steel. Chemicals and polymers are not in
scope for 2026; the Commission has proposed extending coverage from 1 January 2028 to roughly 180 downstream
products with high steel or aluminium content, and plans a 2027 report evaluating extension to indirect
emissions and further sectors including chemicals. **The counterintuitive implication: the olefins face no
CBAM liability today, but recovered iron units entering a steel chain and brine-derived fertilizer sit inside
existing Annex I categories. The exposure is on the by-products, not the main product.** Give this its own
visual emphasis.

**Panel 4 — ISCC PLUS, RED III, and China's carbon market.** ISCC PLUS is the operative certification for
bio-based chemicals and polymers outside RED-regulated fuel applications; it permits certified feedstock to
be tracked through shared assets by mass balance rather than physical segregation. Its Mass Balance Guidance
Document 1.0 went through public consultation with a final version expected mid-2026 — the credit-transfer
rules are being rewritten on the same timeline as this design. RED III thresholds apply where product gas is
sold as fuel rather than feedstock. Domestically, China's national ETS is expanding to steel, cement and
aluminium with absolute caps by 2027, and CCER has relaunched. Note honestly that ISCC feedstock integrity at
the self-declaration stage is a known weak point — and Act 2 shows exactly why that matters here.

### Act 2 — The siting problem: where the two wastes actually are

**Not a decorative map.** This section makes a specific analytical point, and the point is a *problem*, not a
synergy. Two feedstocks, two completely different geographies.

`components/scwg-siting-map.tsx`, driven entirely by `data/scwg-map-sites.json`.

#### Overlay A — Bauxite waste (red mud)

Generated at alumina refineries. Shandong, Shanxi, Henan, Guangxi and Guizhou account for roughly 95% of
Chinese alumina capacity; Shandong, Shanxi and Guangxi together exceed 70%. Large, few, permanently sited
point sources with enormous per-site tonnage — the easy half of the problem to map.

Seed sites (approximate; flag `status: "unverified"`):

- **Shandong** — Binzhou/Zouping (Weiqiao), Chiping (Xinfa), Zibo. Largest provincial capacity.
- **Shanxi** — Jiaokou/Lüliang (Xinfa), Xiaoyi, Hejin
- **Henan** — Zhengzhou, Sanmenxia, Jiaozuo
- **Guangxi** — Baise, Pingguo, Fangchenggang (Xinfa, ~2.4 Mt/y)
- **Guizhou** — Guiyang, Zunyi (Chinalco)

#### Overlay B — Okara, industrial (large soymilk plants)

**The critical distinction this map must teach: okara is not a crushing by-product.** China's soybean supply
is sharply segmented. Roughly 90% of imported GM soybean is crushed for oil and meal — that produces *no
okara*. Okara arises only from soymilk and tofu manufacture, which uses non-GM domestic beans; over 60% of
domestic non-GM soybean goes to food use. So the large coastal crushing complexes at Rizhao, Nantong and
Dongguan, which dominate any map of "soybean processing," are irrelevant to this feedstock.

Industrial okara comes from a small number of large beverage plants — clean point sources with
single-supplier traceability, which matters directly for the ISCC self-declaration weakness raised in Act 1.

- **Vitasoy** — five mainland plants: Shanghai; Wuhan (Hubei, opened 2016, ~105,000 m², largest); Shenzhen,
  **Foshan** (opened 2011) and Dongguan in Guangdong
- Add placeholder entries for other major soy beverage producers (Joyoung, Dali/Doubendou, Weiwei) marked
  `status: "unverified"` for the author to complete

#### Overlay C — Okara, fragmented (tofu manufacture)

Larger tonnage, harder supply chain. Tofu production is fragmented across thousands of small workshops sited
close to consumption because the product is perishable, so this overlay follows urban population density
rather than industrial capacity. Render as **graduated province shading, not pins** — the visual contrast
with Overlay B is the point.

**This overlay is where the ISCC risk lives.** Fragmented, self-declaring, small waste sources are exactly
the supply profile where feedstock integrity fails at audit. Say so on the panel, and link back to Act 1.

#### Overlay D — Context layers (secondary, off by default)

- **Soybean straw** — field residue, follows cultivation: Heilongjiang, Jilin, Liaoning, eastern Inner
  Mongolia (Northeast spring-sowing region)
- **Non-GM food-grade soybean origin** — Heilongjiang, a designated GMO-free planting region with segregation
  requirements for crushers handling both domestic and imported beans. Origin of the beans that eventually
  become okara, but not where the okara appears.

#### The analytical payload

A side panel updates as overlays toggle:

> Red mud sits inland and north — Shandong, Shanxi, Henan — plus Guangxi and Guizhou in the south. Industrial
> okara sits in the Pearl River Delta, Shanghai and Wuhan. Fragmented tofu okara follows population. Soybean
> straw is a thousand kilometres further north again, in Heilongjiang and Jilin. **No province holds red mud
> and okara at scale together.**
>
> Two pairings are worth examining rather than one. **Guangxi (Baise, Pingguo, Fangchenggang) to Guangdong
> (Foshan, Dongguan, Shenzhen)** is roughly 400–700 km and pairs real alumina capacity with three industrial
> soymilk plants — by far the shortest credible link between the two wastes. **Henan** is the dark horse: it
> has alumina refining at Zhengzhou, Sanmenxia and Jiaozuo *and* very high population density, so fragmented
> tofu okara is generated on top of the red mud — no haul at all, but a fragmented, hard-to-certify supply.
> The apparent Shandong option is a trap: its alumina capacity is the largest in China, but its soybean
> industry is crushing imported beans for meal, which yields no okara.
>
> Which stream moves is a live design decision. Red mud is dense, cheap and moves badly. Okara is 80% water
> and moves worse — and spoils. Straw is bulky and low-density. This constrains siting more than any
> thermodynamic consideration in the flowsheet.

Include a **haul-distance calculator**: reader picks a candidate site, panel computes great-circle distance
to the nearest source in each active overlay. Three pre-set candidates, labelled as such:

- **Guangxi–Guangdong corridor** — red mud at Guangxi refineries, industrial okara in the Pearl River Delta
- **Henan (Zhengzhou / Jiaozuo)** — red mud and fragmented okara co-located, certification burden high
- **Shandong (Binzhou/Zouping)** — maximum red mud, okara must be hauled or the feedstock reconsidered

#### Implementation notes

`d3-geo` with `geoConicEqualArea`, parallels ≈ 25°/47°, rotate ≈ `[-105, 0]`. Pin radius encodes capacity
where known; hollow pins where capacity is unverified. Distinct mark shapes per overlay, not colour alone.

**Flag the entire dataset `status: "unverified"` and surface that in the UI.** These coordinates and
capacities have not been confirmed against a primary source, and the page must say so rather than implying
precision it does not have.

### Act 3 — The plant: scroll-driven process diagram

The core of the page; most of its length. All content from `lib/scwg-process.ts`.

**Layout.** Two columns.

- **Left, sticky, full viewport height (~55%):** the process flow diagram, which does not scroll away. As the
  reader scrolls, it pans and zooms to centre the active block. Active block highlights; upstream blocks dim
  to a completed state; downstream blocks stay ghosted. Streams entering and leaving the active block animate
  with a slow directional dash.
- **Right, scrolling (~45%):** one section per block — description, inlet/outlet stream tables, energy duty,
  conversion metric.

Below the `lg` breakpoint, collapse to one column: diagram as a sticky band at the top (max 45vh), text
scrolling beneath.

**Diagram style — Aspen Plus / ISA-5.1 PFD convention.** Not generic rounded rectangles with icons. Draw
recognisable unit-operation symbols as inline SVG, selected from a `type` field on each block so new blocks
get correct symbols automatically:

- Slurry mix tank + positive-displacement pump (circle with triangle) — B1
- Vertical tubular high-pressure reactor, packed-bed hatch — B2
- Cyclone/separator body with tangential inlet — B3
- Let-down valve + horizontal flash drum — B4
- Packed absorber + regenerator column pair (Rectisol), plus a small guard vessel — B5
- Fired tubular reformer, radiant box with vertical tubes — B6
- Fixed-bed catalytic reactor with internal bed indication — B7
- Rotary/fluid-bed regenerator + leach train — B8

Streams as directional lines with numbered tags in standard diamond/circle callouts, and T/P condition tags
at key points. Engineering-drawing restraint: near-black linework on the existing paper/surface background,
one accent for the active block, one warning colour reserved for flagged items. Monospace, tabular figures
for all numerals.

**Right-column content per block**, rendered generically: block ID and name; conditions; function (prose);
inlet stream table; outlet stream table; energy duty with stated sign convention; conversion/KPI with
explicit definition; flags as callouts.

Blocks **B2, B3 and B6 carry a "needs validation" badge** — these are the load-bearing, unproven claims.

#### The eight blocks — content payload

**B1 — Feed preparation and slurry make-up.** Ambient → 25 MPa.
Straw is milled and blended into okara to 18–22 wt% total solids; red mud is dosed; the slurry is pressurised
by positive-displacement pump. Feed–effluent exchange recovers reactor outlet heat. Okara is the rheological
enabler: its fine hydrated fibre forms a pumpable paste rather than a settling suspension, letting it carry
milled straw that would otherwise bridge and settle.
*Literature anchor for the solids ceiling:* 30 wt% glucose solution, 18 wt% corn cob and 24 wt% coal–water
slurry have been fed to supercritical reactors; twin piston pumps have delivered 15% solids biomass slurry to
27 MPa; dewatered sewage sludge at 7.69 wt% solids required corn starch paste and a cement pump to be
deliverable at all. No conversion metric — report discharge pressure and specific pumping energy.

**B2 — Supercritical water gasifier with red mud bed.** 600–650 °C, 25 MPa *(placeholder — set by the
Section 3 severity study)*.
Biomass gasifies to CH₄, CO₂ and H₂. Red mud plays three roles simultaneously, and the page should be honest
that they are not equally well supported:
- *Redox mediator* — red mud is an established chemical-looping oxygen carrier (Fe₂O₃ typically >40 wt%), but
  that literature is atmospheric-pressure, high-temperature and dry. In supercritical water the oxidant is
  already present in vast excess, so lattice oxygen donation mediates the redox chemistry rather than
  supplying an oxygen deficit. Flag as requiring qualification.
- *Gasification catalyst* — the best-supported role. Red mud addition gives H₂ yields comparable to commercial
  alkali catalysts; a Ni-Cu bimetallic on a red mud support reached 21.88 mmol/g H₂, 6.7× unpromoted Ni.
  Direct precedent exists in co-gasification of spirit-based distillers' grains with sewage sludge over red mud.
- *Alkali reservoir and tar cracker* — real but self-limiting, because the alkali dissolves then precipitates.
Concurrently the reactor **dealkalizes the red mud**. Conversion metric: carbon gasification efficiency
(placeholder); also report CH₄/CO₂/H₂ split and CO ≈ 0.
*Dry chemical-looping reference values, for context only and clearly labelled as not-this-process:*
1.02 Nm³/kg, 12.06 MJ/Nm³ LHV, 91.49% cold gas efficiency, 82.65% carbon conversion.

**B3 — Salt separator, a purposeful product unit.** Supercritical; cooled-wall or cyclonic.
Inorganic salt solubility collapses above the critical point, and salt deposition is the dominant plugging and
corrosion failure mode of continuous supercritical water systems. **Design decision: this block is a primary
product unit, not a protective device.** Sodium removal is deliberate and metered, because supercritical water
treatment of red mud gives enhanced dealkalization and detoxifies the residue for sale. The salt load is
intentionally large, and red mud dosing is co-determined by this separator's duty rather than by catalytic
requirement alone. Two duties: dealkalization of the residue, and recovery of Na/K/P as a fertilizer-precursor
brine. Sulfur partitions partly into the same brine as sulfide and sulfate — this is why the fertilizer product
is N-K-P-S — but that is an incidental credit against the downstream acid gas removal duty, **not** a designed
removal step, and B5 is sized without relying on it. **B3 remains the load-bearing claim of the concept and is
unvalidated at biomass-gasification residence times.** Conversion metric: sodium removal fraction from the
solid, and brine concentration (both placeholder).

**B4 — Depressurization, phase separation, aqueous polishing.** 25 MPa → ~3 MPa.
Gas/liquid/solid split. Ammonia-bearing aqueous phase to nitrogen recovery; spent red mud to B8. Report
separation efficiency per phase.

**B5 — Acid gas removal (Rectisol) and ZnO guard.** −30 to −60 °C, ~3 MPa.
Two findings drive this block, and the page should present both.

*First, the negative finding, because it is counterintuitive:* **in-bed calcium capture does not work in
supercritical water.** The hydrolysis CaS + 2H₂O ⇌ Ca(OH)₂ + H₂S is well established and is used deliberately
as a CaS stabilization route; a supercritical water gasifier is close to an ideal reactor for running it. Lime
dosed into B2 would capture sulfur and release it again. Moving calcium downstream into dry warm gas would
function, but imports a consumable, creates a spent-sorbent disposal stream, and competes with HCl for capacity
across the whole sorbent life cycle.

*Second, the decision:* **calcium has been removed from the flowsheet entirely and replaced with a
commercially proven acid gas wash.** This is deliberately the least novel block in the flowsheet — the one
place the design buys a vendor guarantee instead of inventing something.

Include a **terminology note on the page**, because it is a common confusion: "wet desulfurization" normally
denotes limestone–gypsum wet flue gas desulfurization, which is an *oxidising post-combustion SO₂* technology.
The stream leaving B4 is a *reducing syngas carrying H₂S and COS*, so the correct standard analogues are the
wet acid gas removal processes used in gasification and coal-to-chemicals practice — physical solvent or amine
absorption — not WFGD.

Stages:
- *S0 — aqueous credit.* Sulfide/sulfate leaving in the B3 brine. Physics, not a mechanism. Reduces the B5
  duty; B5 is sized without it.
- *S1 — primary wash: Rectisol chilled-methanol.* Purifies syngas to **0.1 ppm total sulfur including COS** —
  exactly the OXZEO specification, in one guaranteed unit. COS matters specifically here: protein-derived
  sulfur in a CO₂-rich gas forms carbonyl sulfide, which amines handle poorly and Rectisol handles well.
  **The decisive integration argument:** this flowsheet needs CO₂ control independently of sulfur, since OXZEO
  co-produces CO₂ and B6 needs a metered CO₂ feed. Rectisol does acid gas removal and CO₂ separation in the
  same unit, collapsing two problems into one. At a 0.1 ppm H₂S target, reported CO₂ efficiency ranks
  Rectisol > Selexol > MDEA > sulfolane-MDEA. It is the incumbent technology in Chinese coal-to-chemicals.
- *S1-alt — selective MDEA,* near-ambient. A tertiary amine, fast with H₂S and slow with CO₂, reaching under
  20 ppmv H₂S. Far cheaper, no refrigeration or methanol inventory — but misses the OXZEO spec alone, handles
  COS poorly, and gives no CO₂ control. Present as a live technoeconomic alternative, not a rejected option.
- *S2 — ZnO guard,* non-regenerable, immediately upstream of B6/B7. Cheap insurance with Rectisol; mandatory
  with MDEA.
- *S3 — sulfur recovery by liquid redox (LO-CAT type), not Claus.* Claus wants acid gas at 10–13 vol% H₂S or
  above; this sulfur load will very likely fall short. Liquid redox suits small duties and yields saleable
  elemental sulfur rather than a disposal problem.

Show the **cost of this decision** as well as the benefit: Rectisol is capital-intensive, cryogenic, and brings
methanol inventory into a plant that otherwise has none. It is likely the largest CAPEX item after the
hydrothermal island. Conversion metric: total sulfur at outlet, and CO₂ split between recycle and vent.

**B6 — Bi-reformer.** 800–900 °C, 1–3 MPa *(placeholder)*.
Supercritical water gasification produces essentially no CO — water-gas shift equilibrium in a medium that is
overwhelmingly water sits hard on the product side. OXZEO consumes CO. The two blocks are chemically
incompatible as directly coupled units, and this block exists to resolve that. Dry reforming alone
(CH₄ + CO₂ → 2CO + 2H₂) gives H₂/CO ≈ 1, below the ratio the cited OXZEO systems run at; bi-reforming combines
dry and steam reforming in one stage and delivers the target ratio without a separate adjustment step. Steam
is free from the hydrothermal island, and steam co-feed is the principal coking mitigation, coking being the
dominant Ni deactivation mode.
**State the energy objection plainly on the page:** methanation in B2 is exothermic; reforming here is strongly
endothermic and 200–300 °C hotter. The flowsheet spends energy making methane and more energy unmaking it.
Heat integration limits how much of that round trip shows up as fuel; it does not remove it.
Conversion metric: CH₄ conversion and outlet H₂/CO (placeholder).
**Design decision: bi-reforming is the design basis.** The alternative — operating B2 above ~700 °C and shorter
with a bed selected for low methanation activity, shifting product toward H₂ and CO₂ so the downstream duty
collapses to reverse water-gas shift — has been **evaluated and rejected**, on three grounds worth showing as a
short expandable note rather than a dashed branch in the diagram: higher-severity hydrothermal service worsens
every materials problem the design already has; salt precipitation becomes more aggressive, attacking the B3
block the whole concept depends on; and the case rests on a kinetic assumption (low methanation activity with
retained gasification activity) for which no supporting result exists in the red mud literature.
**Do not draw a dashed alternative path in the flowsheet.** The diagram shows one committed architecture.

**B7 — OXZEO olefin synthesis.** ~400 °C, 2.5–4 MPa.
Oxide–zeolite bifunctional conversion of syngas to C₂–C₄ olefins, exceeding the Anderson–Schulz–Flory
selectivity limit. Literature anchors: 80% light olefin selectivity among hydrocarbons at 17% CO conversion
over ZnCrOₓ–SAPO-34 at 400 °C, 2.5 MPa; 64% CO conversion at 75% light olefin selectivity over
ZnCr₂O₄@ZnOₓ + SAPO-34 at 4.0 MPa, 400 °C on a 68% H₂ / 27% CO feed. Unconverted syngas recycled.
**Be honest about CO₂:** the route co-produces substantial CO₂ via the CO-mediated pathway, and a published
Comment in *ACS Catalysis* (2023) disputes "low CO₂ emission" claims for direct syngas-to-olefins. In a
standalone plant that CO₂ is a liability; here it recycles to B6 as dry-reforming oxidant. That integration is
a genuine argument for this configuration — show the recycle loop prominently in the diagram.
Conversion metric: per-pass CO conversion, light olefin selectivity, C₂/C₃ ratio.

**B8 — Red mud regeneration and residue valorization.** Air oxidation, then hydrometallurgy.
Reduced iron phases re-oxidised with heat recovery; a bleed stream leaves as product. Note the synergy: B2 has
already partially reduced Fe₂O₃ → Fe₃O₄/FeO using biomass-derived reductant, so the residue arrives at any
ironmaking step pre-reduced at no marginal cost. Conversion metric: iron re-oxidation extent, bleed fraction,
cycles to attrition failure (all placeholder).

### Act 4 — Product slate

After the last block the sticky diagram releases and layout returns to full width. Interactive tiered card
grid from `lib/scwg-products.ts`, expanding on click, using the existing card idiom.

**Carbon-derived**
- *C₂–C₄ olefins* — polyolefins, ethylene oxide/glycol, propylene oxide, acrylonitrile, butadiene precursor.
  Bio-attributed under ISCC PLUS mass balance; the premium sits here.
- *CO₂ from OXZEO* — large, contested, and here it has a home: recycle to B6.
- *C₅+ and paraffin tail* — internal fuel, best fired into the reformer endotherm.
- *Bio-SNG* — only under the alternative fork. The base case the olefin route must beat.

**Heteroatom**
- *N-K-P-S brine* → compound fertilizer. Value driver is avoided nitrogen-removal cost on the effluent, not
  fertilizer price.
- *Ammonia* → ammonium sulfate, or urea if you also want to consume CO₂.
- *Elemental sulfur* → from liquid-redox recovery on the B5 acid gas. Modest revenue, but the point is that it
  is a saleable commodity rather than a spent-sorbent disposal stream — one of the arguments for removing
  calcium.

**Bauxite-derived — three tiers, inverse mass and value.** Give this the most interactive depth.

*Tier 1 — sell the dealkalized solid as-is.* Highest volume, lowest margin, and the tier this process uniquely
enables, since dealkalization is what makes the residue saleable at all.
- SO₂/H₂S sorbent — FGD, sinter plant, or fed back to the S3 bed
- Supplementary cementitious material — 10–20% clinker replacement in blended cements, 25–30% demonstrated;
  co-calcination with kaolinite gives 30% replacement at 88% of reference 28-day strength; 3–5% into clinker
  raw meal
- Geopolymer precursor — Na-silicate-activated systems reach comparable or better compressive strength than
  conventional binders, and red mud supplies its own sodium
- Heavyweight aggregate and radiation shielding; soil amendment; mine remediation
- Context: ~170 Mt/y produced globally, utilization below 3%. The ceiling is alkalinity, not demand.

*Tier 2 — iron.*
- Reduction roasting + magnetic separation: 97.69% metallization, 81.40% recovery
- Smelting reduction (1500–1600 °C, lime/dolomite flux): pig iron Fe >90%, 90–95% recovery; recent work reports
  98.14–98.36% Fe recovery meeting the steelmaking pig iron standard
- Residual slag is Al₂O₃–SiO₂–CaO–TiO₂ — building-material feed, so the route creates no new waste
- CBAM: iron units entering a steel chain are Annex I goods. The olefins are not.

*Tier 3 — critical metals from the iron-depleted slag.* Smelt first: it concentrates these roughly twofold.
Sortable table.

| Element | Grade | Price | Use |
|---|---|---|---|
| Sc | 16–230 ppm typical (~84 ppm Chinese sample); 100–800 ppm reported | Sc₂O₃ $3,000–5,000/kg | Al-Sc aerospace alloys, ScSZ fuel-cell electrolytes |
| REE | China 400–1,200 ppm; ~2× enriched over bauxite | varies | magnets, catalysts |
| Ga | 50–100 ppm | $150–300/kg | GaAs/GaN, LEDs; strategically sensitive |
| V | — | V₂O₅ $8–15/kg | steel microalloying, redox flow batteries |
| Ti | 3–10 wt% | low | grade too poor for pigment without upgrading |

Acid leaching dissolves Sc/REE/V/Ga while leaving iron in the solid, so the two routes are complementary.

**Scandium caveat as a prominent callout, because the arithmetic is seductive:** 100 kt/y of residue at 84 ppm
contains ~8.4 t Sc ≈ 13 t Sc₂O₃; at 60% recovery and $3,000/kg that is ~$23M/y. But global Sc₂O₃ demand is only
of order tens of tonnes per year — a single plant this size could saturate the market and collapse the price.
**The binding constraint on scandium is market depth, not resource.** An option contingent on Al-Sc alloy demand
growth, not a bankable revenue line. Mark the global demand figure as requiring verification against a USGS
commodity summary.

**Avoided disposal** — gate fees on okara and red mud. Not revenue in the accounting sense, but likely the
largest single contributor in the Chinese context, and it determines whether the feedstocks are wastes, which
determines zero-burden entry under ISO 14067.

### Act 5 — Open questions and references

Honest state of the work, as a checklist from `lib/scwg-open-questions.ts`.

Precede it with a short **"Decisions taken"** block, so a reader sees what is settled before what is not:
the salt separator is a purposeful product unit (Conflict 1); bi-reforming is the design basis and upstream
methanation suppression is rejected (Conflict 2); calcium is removed in favour of a conventional acid gas wash
(Conflict 3). Then the remaining open items:

1. **Rectisol versus MDEA is undecided.** Rectisol meets the OXZEO specification outright and handles CO₂ in the
   same unit; MDEA is far cheaper but needs the guard bed and gives no CO₂ control. This is the largest open
   capital question.
2. **Measured ultimate analyses are missing** for the specific okara and straw sources, including sulfur and
   chloride. Sulfur now sets the acid gas removal duty and the liquid-redox unit size; chloride sets materials
   selection.
3. **Supercritical dealkalization is unvalidated** at biomass-gasification residence times. If it fails, the
   concept reverts to a conventional wet-biomass gasifier with a cheap iron catalyst.
4. **The ISO 14067 waste classification pathway** for bauxite residue is unconfirmed, and it decides which of
   two very different value propositions this project is.
5. **Feedstock geography is unresolved** — no site holds red mud and okara together at scale, and the
   Guangxi–Guangdong versus Henan trade-off is undecided.

Then references from `lib/scwg-references.ts`, marking verified sources ✓ and unverified-attribution sources °.

---

## Interaction and visual specification

**Scroll mechanics.** `IntersectionObserver` with a root margin triggering when a section reaches the vertical
centre of the viewport. Do not hijack scroll. Do not use scroll-jacking libraries. Do not animate on every
scroll event. Native scroll behaviour throughout. Block transitions 400–600 ms, ease-out.

**Diagram transitions.** Pan/zoom the SVG viewBox with a d3 transition. Build the diagram once, then animate
attributes; never re-render the whole thing on scroll.

**Typography.** Body text at 65–75 character measure. Monospace with tabular figures for all numerals, stream
tags and units. Use the repo's existing type scale.

**Accessibility.** Because this is server-rendered, all prose is in the initial HTML — preserve that by keeping
text in server components. Respect `prefers-reduced-motion`: disable pan/zoom and stream dashes, instant state
changes. All controls keyboard-reachable with visible focus.

**Performance.** Keep the client bundle small — the diagram, scroller and map are the only client components.
Do not pull the full `d3` package.

---

## What not to do

- Do not invent mass balance numbers, energy duties or conversion rates. Flagged placeholders only.
- Do not put user-facing prose in `.tsx` files. It belongs in `lib/scwg-*.ts`.
- Do not introduce a parallel design system. Use the repo's Tailwind tokens.
- Do not smooth over the three design conflicts — the CO deficit, CaS hydrolysis, and the incompatibility of
  red mud's three assigned roles. All three are now *resolved by decision*, but the conflict and the reasoning
  are the most interesting content on the page. Present each as problem → decision → what it cost.
- Do not present any of the three as still open. They are settled; the open items are listed in Act 5.
- Do not describe the sulfur block as "wet desulfurization" without the terminology note. WFGD is a
  post-combustion SO₂ technology and this is a reducing syngas.
- Do not map soybean crushing plants as okara sources. Crushing yields meal and oil, not okara.
- Do not present the siting map as a synergy story. The feedstocks are not co-located.
- Do not use scroll-jacking, autoplaying media, or per-tick animation.
- Do not claim the process is proven. It is a concept with three unvalidated load-bearing assumptions.

---

## Build order

1. **Read the repo conventions listed at the top.** Report back how you plan to fit this page into the existing
   structure, and confirm the route slug, before writing code.
2. **Types and content modules first.** `scwg-types.ts`, then every `lib/scwg-*.ts` with the full real text.
   Get the data model right before any rendering.
3. `scwg-value.tsx` and `scwg-stream-table.tsx` — the primitives that enforce placeholder discipline.
4. `page.tsx` with all acts rendering as plain server-side sections, no interaction. Verify it reads correctly
   top to bottom.
5. The SVG process diagram, static, all eight blocks and streams, correct Aspen-convention symbols generated
   from block `type`.
6. **Stop here and show a screenshot of the diagram before wiring interaction.** Stream topology and symbol
   correctness matter more than the scroll effect and are far cheaper to fix now.
7. `scwg-process-scroller.tsx` — observers and the active-block state machine.
8. `scwg-siting-map.tsx` — last, since it needs the vendored TopoJSON.
9. Responsive collapse, `prefers-reduced-motion`, keyboard navigation.
10. Register the page in the projects index. Run `npm run lint`, type-check, then report pass/fail on each of
    the six acceptance criteria.
