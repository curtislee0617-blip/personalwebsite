import type { ProductGroup } from "@/lib/scwg-types";

// Act 4 — product slate. Tiered card content, expanding on click.

export const scwgProductsIntro =
  "After the last block the sticky diagram releases and the layout returns to full width. The slate spans three families — carbon-derived, heteroatom, and bauxite-derived — plus avoided disposal, which in the Chinese context is likely the largest single contributor and the thing that decides whether the feedstocks are wastes at all.";

export const scwgProductGroups: ProductGroup[] = [
  {
    id: "carbon-derived",
    title: "Carbon-derived",
    items: [
      {
        name: "C₂–C₄ olefins",
        summary: "Polyolefins, ethylene oxide/glycol, propylene oxide, acrylonitrile, butadiene precursor.",
        detail: [
          "The main product. Bio-attributed under ISCC PLUS mass balance; the premium sits here.",
          "Downstream: polyolefins, ethylene oxide and glycol, propylene oxide, acrylonitrile, and butadiene precursors.",
        ],
      },
      {
        name: "CO₂ from OXZEO",
        summary: "Large, contested, and here it has a home: recycle to B6.",
        detail: [
          "The OXZEO route co-produces substantial CO₂. In a standalone plant that is a liability; here it recycles to B6 as dry-reforming oxidant, which is a genuine argument for this configuration.",
        ],
      },
      {
        name: "C₅+ and paraffin tail",
        summary: "Internal fuel, best fired into the reformer endotherm.",
        detail: [
          "Not sold. Best fired into the B6 reformer endotherm, where the plant already needs heat.",
        ],
      },
      {
        name: "Bio-SNG",
        summary: "Only under the alternative fork — the base case the olefin route must beat.",
        detail: [
          "Bio-substitute natural gas is the product of the rejected alternative architecture (methanation-favouring B2, no reforming). It is the base case the olefin route must beat, not a co-product of the committed design.",
        ],
      },
    ],
  },
  {
    id: "heteroatom",
    title: "Heteroatom",
    items: [
      {
        name: "N-K-P-S brine → compound fertilizer",
        summary: "Value driver is avoided nitrogen-removal cost on the effluent, not fertilizer price.",
        detail: [
          "The recovered brine carries Na/K/P plus partitioned sulfur. Its value driver is the avoided nitrogen-removal cost on the effluent, not the fertilizer sale price.",
        ],
      },
      {
        name: "Ammonia → ammonium sulfate or urea",
        summary: "Ammonium sulfate, or urea if you also want to consume CO₂.",
        detail: [
          "The ammonia-bearing aqueous phase from B4 feeds nitrogen recovery. Convert to ammonium sulfate, or to urea if consuming additional CO₂ is desirable.",
        ],
      },
      {
        name: "Elemental sulfur",
        summary: "From liquid-redox recovery on the B5 acid gas. A commodity, not a disposal stream.",
        detail: [
          "From the S3 liquid-redox unit. Modest revenue, but the point is that it is a saleable commodity rather than a spent-sorbent disposal stream — one of the arguments for removing calcium.",
        ],
      },
    ],
  },
  {
    id: "bauxite-derived",
    title: "Bauxite-derived — three tiers, inverse mass and value",
    intro:
      "Give this the most interactive depth. Volume falls and value rises as you descend the tiers.",
    items: [
      {
        name: "Tier 1 — sell the dealkalized solid as-is",
        tier: 1,
        summary: "Highest volume, lowest margin, and the tier this process uniquely enables.",
        detail: [
          "Dealkalization is what makes the residue saleable at all, so this is the tier the concept uniquely unlocks.",
          "SO₂/H₂S sorbent — FGD, sinter plant, or fed back to the S3 bed.",
          "Supplementary cementitious material — 10–20% clinker replacement in blended cements, 25–30% demonstrated; co-calcination with kaolinite gives 30% replacement at 88% of reference 28-day strength; 3–5% into clinker raw meal.",
          "Geopolymer precursor — Na-silicate-activated systems reach comparable or better compressive strength than conventional binders, and red mud supplies its own sodium.",
          "Heavyweight aggregate and radiation shielding; soil amendment; mine remediation.",
        ],
        callout: {
          title: "The ceiling is alkalinity, not demand",
          body: "Over 120 Mt/y produced globally, utilization below 3%. The uses exist; the alkalinity is what blocks them — which is exactly what this process removes.",
        },
      },
      {
        name: "Tier 2 — iron",
        tier: 2,
        summary: "Reduction roasting or smelting reduction; residual slag is building-material feed.",
        detail: [
          "Reduction roasting + magnetic separation: 97.69% metallization, 81.40% recovery.",
          "Smelting reduction (1500–1600 °C, lime/dolomite flux): pig iron Fe >90%, 90–95% recovery; recent work reports 98.14–98.36% Fe recovery meeting the steelmaking pig iron standard.",
          "Residual slag is Al₂O₃–SiO₂–CaO–TiO₂ — building-material feed, so the route creates no new waste.",
        ],
        callout: {
          title: "CBAM sits on the iron, not the olefins",
          body: "Iron units entering a steel chain are Annex I goods. The olefins are not. The by-product carries the border-adjustment exposure.",
        },
      },
      {
        name: "Tier 3 — critical metals from the iron-depleted slag",
        tier: 3,
        summary: "Smelt first: it concentrates these roughly twofold. Acid leaching is complementary to iron recovery.",
        detail: [
          "Smelt first — it concentrates these roughly twofold. Acid leaching dissolves Sc/REE/V/Ga while leaving iron in the solid, so the two routes are complementary.",
        ],
        table: {
          columns: ["Element", "Grade", "Price", "Use"],
          rows: [
            ["Sc", "16–230 ppm typical (~84 ppm Chinese sample); 100–800 ppm reported", "Sc₂O₃ $3,000–5,000/kg", "Al-Sc aerospace alloys, ScSZ fuel-cell electrolytes"],
            ["REE", "China 400–1,200 ppm; ~2× enriched over bauxite", "varies", "magnets, catalysts"],
            ["Ga", "50–100 ppm", "$150–300/kg", "GaAs/GaN, LEDs; strategically sensitive"],
            ["V", "—", "V₂O₅ $8–15/kg", "steel microalloying, redox flow batteries"],
            ["Ti", "3–10 wt%", "low", "grade too poor for pigment without upgrading"],
          ],
        },
        callout: {
          title: "Scandium: the binding constraint is market depth, not resource",
          body: "100 kt/y of residue at 84 ppm contains ~8.4 t Sc ≈ 13 t Sc₂O₃; at 60% recovery and $3,000/kg that is ~$23M/y. But global Sc₂O₃ demand is only of order tens of tonnes per year — a single plant this size could saturate the market and collapse the price. An option contingent on Al-Sc alloy demand growth, not a bankable revenue line. Verify the global demand figure against a USGS commodity summary.",
        },
      },
    ],
  },
  {
    id: "avoided-disposal",
    title: "Avoided disposal",
    items: [
      {
        name: "Gate fees on douzha and red mud",
        summary: "Not revenue in the accounting sense, but likely the largest single contributor in the Chinese context.",
        detail: [
          "Not revenue in the accounting sense, but likely the largest single contributor in the Chinese context.",
          "It also determines whether the feedstocks are wastes — which determines zero-burden entry under ISO 14067, the largest single lever on the carbon result.",
        ],
      },
    ],
  },
];
