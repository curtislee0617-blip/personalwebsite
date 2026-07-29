import type { Reference } from "@/lib/scwg-types";

// Act 5 — bibliography with verification status.
// ✓ verified against a primary source; ° attribution unverified (values quoted
// from the underlying report's notes but not independently re-checked here).
//
// The `marker` is what a ProcessValue's `source` field points at and what a
// superscript citation in prose resolves to. Keep markers short and stable.

export const scwgReferences: Reference[] = [
  {
    id: "ref-iso14067",
    marker: "ISO 14067",
    citation:
      "ISO 14067:2018 — Greenhouse gases: Carbon footprint of products. Allocation hierarchy and disclosure requirements.",
    status: "verified",
  },
  {
    id: "ref-cbam",
    marker: "CBAM",
    citation:
      "Regulation (EU) 2023/956 establishing a Carbon Border Adjustment Mechanism; definitive period from 1 January 2026, Annex I scope. 2025 Commission proposal on downstream extension.",
    status: "verified",
  },
  {
    id: "ref-iscc",
    marker: "ISCC PLUS",
    citation:
      "ISCC PLUS certification scheme; Mass Balance Guidance Document 1.0 (public consultation, final expected mid-2026).",
    status: "verified",
  },
  {
    id: "ref-redmud-oc",
    marker: "RM-OC",
    citation:
      "Red mud as a chemical-looping oxygen carrier: Fe₂O₃ typically >40 wt%. Atmospheric-pressure, high-temperature, dry chemical-looping literature.",
    status: "unverified",
  },
  {
    id: "ref-nicu-rm",
    marker: "NiCu-RM",
    citation:
      "Ni–Cu bimetallic on a red mud support in supercritical water gasification: 21.88 mmol/g H₂, 6.7× unpromoted Ni.",
    status: "unverified",
  },
  {
    id: "ref-cle-dry",
    marker: "CLE-dry",
    citation:
      "Dry chemical-looping reference set (NOT this process): 1.02 Nm³/kg gas yield, 12.06 MJ/Nm³ LHV, 91.49% cold gas efficiency, 82.65% carbon conversion.",
    status: "unverified",
  },
  {
    id: "ref-solids-ceiling",
    marker: "SWG-feed",
    citation:
      "Supercritical reactor feed precedents: 30 wt% glucose, 18 wt% corn cob, 24 wt% coal–water slurry; twin piston pumps delivering 15% solids biomass slurry to 27 MPa; dewatered sewage sludge at 7.69 wt% solids requiring corn-starch paste and a cement pump.",
    status: "unverified",
  },
  {
    id: "ref-rectisol",
    marker: "Rectisol",
    citation:
      "Rectisol chilled-methanol acid gas removal: purification to 0.1 ppm total sulfur incl. COS; CO₂ efficiency ranking Rectisol > Selexol > MDEA > sulfolane-MDEA at 0.1 ppm H₂S target; incumbent in Chinese coal-to-chemicals.",
    status: "verified",
  },
  {
    id: "ref-cas-hydrolysis",
    marker: "CaS-hyd",
    citation:
      "CaS + 2H₂O ⇌ Ca(OH)₂ + H₂S hydrolysis, used deliberately as a CaS stabilization route; the basis for the negative in-bed calcium-capture finding.",
    status: "unverified",
  },
  {
    id: "ref-oxzeo-zncr",
    marker: "OXZEO-1",
    citation:
      "ZnCrOₓ–SAPO-34, 400 °C, 2.5 MPa: 80% light-olefin selectivity among hydrocarbons at 17% CO conversion (Jiao et al., Science 2016 and related).",
    status: "unverified",
  },
  {
    id: "ref-oxzeo-znc2o4",
    marker: "OXZEO-2",
    citation:
      "ZnCr₂O₄@ZnOₓ + SAPO-34, 4.0 MPa, 400 °C, 68% H₂ / 27% CO feed: 64% CO conversion at 75% light-olefin selectivity.",
    status: "unverified",
  },
  {
    id: "ref-oxzeo-co2",
    marker: "ACS-2023",
    citation:
      "Comment in ACS Catalysis (2023) disputing 'low CO₂ emission' claims for direct syngas-to-olefins via the CO-mediated pathway.",
    status: "unverified",
  },
  {
    id: "ref-iron-recovery",
    marker: "Fe-rec",
    citation:
      "Red mud iron recovery: reduction roasting + magnetic separation 97.69% metallization, 81.40% recovery; smelting reduction pig iron Fe >90%, 90–95% recovery, recent work 98.14–98.36% Fe recovery.",
    status: "unverified",
  },
  {
    id: "ref-scm",
    marker: "RM-SCM",
    citation:
      "Red mud as supplementary cementitious material: 10–20% clinker replacement (25–30% demonstrated); co-calcination with kaolinite 30% replacement at 88% of reference 28-day strength.",
    status: "unverified",
  },
  {
    id: "ref-sc-grade",
    marker: "Sc-grade",
    citation:
      "Scandium in red mud: 16–230 ppm typical (~84 ppm Chinese sample), 100–800 ppm reported; Sc₂O₃ price $3,000–5,000/kg. Global Sc₂O₃ demand of order tens of t/y — verify against USGS commodity summary.",
    status: "unverified",
  },
  {
    id: "ref-china-ets",
    marker: "CN-ETS",
    citation:
      "China national ETS expansion to steel, cement and aluminium with absolute caps by 2027; CCER relaunch.",
    status: "verified",
  },
];

export function scwgReferenceByMarker(marker: string) {
  return scwgReferences.find((reference) => reference.marker === marker);
}
