import type { RegulatoryPanel } from "@/lib/scwg-types";

// Act 1 — the compliance landscape. Four scroll-linked panels, ~120–180 words each.

export const scwgRegulatoryIntro =
  "Why this is being built. A process concept in 2026 is judged not only on yield and cost but on whether its carbon claim survives third-party audit and border adjustment — and that verdict reaches back up the flowsheet into engineering decisions taken long before any gas is made.";

export const scwgRegulatoryPanels: RegulatoryPanel[] = [
  {
    id: "problem-statement",
    eyebrow: "Panel 1",
    title: "The problem statement",
    paragraphs: [
      "Industrial decarbonisation has moved from voluntary target-setting to enforceable trade and disclosure instruments. A process concept in 2026 is evaluated not only on yield and cost but on whether its carbon claim survives third-party audit and border adjustment.",
      "That changes engineering decisions upstream — it determines which allocation method may be used, which determines whether a waste feedstock enters the boundary burden-free.",
    ],
  },
  {
    id: "iso-14067",
    eyebrow: "Panel 2",
    title: "ISO 14067",
    paragraphs: [
      "The product carbon footprint standard. Its decisive feature here is the allocation hierarchy: avoid allocation by system subdivision, then allocate by physical relationship, then by economic value — documenting the choice. The cut-off (zero-burden) method lets waste material enter a system burden-free.",
      "For the same physical product, cut-off, 50/50 and substitution methods can produce footprints differing by more than 20%. ISO 14067 requires the allocation choice and rationale to be transparently documented; a footprint that does not disclose the method is non-compliant.",
    ],
    emphasis:
      "Whether red mud enters this system burden-free as a waste, or carries allocated Bayer-process burden as an aluminium co-product, is the largest single lever on the result.",
  },
  {
    id: "cbam",
    eyebrow: "Panel 3",
    title: "CBAM",
    paragraphs: [
      "The EU Carbon Border Adjustment Mechanism entered its definitive period on 1 January 2026, phasing in through 2034 alongside withdrawal of free EU ETS allowances. Annex I scope remains aluminium, cement, electricity, fertilisers, hydrogen, and iron and steel.",
      "Chemicals and polymers are not in scope for 2026; the Commission has proposed extending coverage from 1 January 2028 to roughly 180 downstream products with high steel or aluminium content, and plans a 2027 report evaluating extension to indirect emissions and further sectors including chemicals.",
    ],
    emphasis:
      "The counterintuitive implication: the olefins face no CBAM liability today, but recovered iron units entering a steel chain and brine-derived fertilizer sit inside existing Annex I categories. The exposure is on the by-products, not the main product.",
  },
  {
    id: "iscc-red-iii",
    eyebrow: "Panel 4",
    title: "ISCC PLUS, RED III, and China's carbon market",
    paragraphs: [
      "ISCC PLUS is the operative certification for bio-based chemicals and polymers outside RED-regulated fuel applications; it permits certified feedstock to be tracked through shared assets by mass balance rather than physical segregation. Its Mass Balance Guidance Document 1.0 went through public consultation with a final version expected mid-2026 — the credit-transfer rules are being rewritten on the same timeline as this design.",
      "RED III thresholds apply where product gas is sold as fuel rather than feedstock. Domestically, China's national ETS is expanding to steel, cement and aluminium with absolute caps by 2027, and CCER has relaunched.",
      "Note honestly that ISCC feedstock integrity at the self-declaration stage is a known weak point — and Act 2 shows exactly why that matters here.",
    ],
  },
];
