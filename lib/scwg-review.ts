import type { ReviewObjection } from "@/lib/scwg-types";

// Disposition of external review comments. An external evaluation of the wider
// bio-SNG and methanol programme raised technical and certification risks.
// Recording which apply, which are structurally voided by the hydrothermal
// architecture, and which are conceded prevents the work from either ignoring
// the review or absorbing objections its own design already answers.

export const scwgReviewIntro =
  "An external evaluation of the wider bio-SNG and methanol programme raised a set of technical and certification risks. Several are decisive for dry gasification with downstream methanation and are structurally absent from this flowsheet; several apply in transformed form; and the certification critique applies with full force. Recording which is which prevents the work from either ignoring the review or absorbing objections its own architecture already answers.";

export const scwgReviewObjections: ReviewObjection[] = [
  {
    objection: "High moisture destroys the energy balance, because vaporising feed water consumes chemical energy",
    applies: "inverted",
    disposition:
      "This is the objection supercritical water gasification exists to answer. Water is the reaction medium, never vaporised across a phase boundary, and there is no latent heat penalty. Douzha's 80–85% moisture is the reason the feedstock was selected. The correct residual concern is not moisture but the solids ceiling and the sensible heat of pressurised water.",
  },
  {
    objection: "K- and Cl-rich Chinese straws form molten K-silicates, defluidising beds and fouling surfaces",
    applies: "transformed",
    disposition:
      "There is no fluidised bed and no sand inventory to agglomerate, so the classical failure mode is absent. But the underlying chemistry reappears as salt precipitation in B3 — potassium from straw joins sodium from red mud in the separator duty. The problem is not eliminated; it is relocated into the block already designated to handle it, and it is one more reason B3 is the critical unit.",
  },
  {
    objection: "Cooling raw syngas from ~850 °C for cleaning then reheating for methanation is a severe thermodynamic penalty",
    applies: "overstated",
    disposition:
      "Largely recoverable, and previously overstated in this work. Sensible-heat excursions are what feed–effluent exchanger trains are for. Two residues are not recoverable by exchange and should be reported separately: the Rectisol refrigeration duty is compressor shaft work, not heat, and no exchanger returns it; and the methane round trip is reaction enthalpy, which heat integration cannot touch at all.",
  },
  {
    objection: "Methanation exotherm creates runaway risk requiring TREMP-style staging and intercooling",
    applies: "no",
    disposition:
      "There is no methanation reactor. Methane forms in situ in the aqueous phase, where the enormous thermal mass and heat capacity of supercritical water buffer the exotherm — an underappreciated safety advantage of the hydrothermal route. The equivalent exotherm management problem sits in B7, where OXZEO synthesis is exothermic, and in B8 air regeneration.",
  },
  {
    objection: "ISCC mass balance permits physical mixing with bookkeeping-only segregation, enabling multiple claiming",
    applies: "yes",
    disposition:
      "Applies in full. Mass balance must be treated as a control weakness to be mitigated contractually, not as a compliance box.",
  },
  {
    objection: "No laboratory test distinguishes UCO from virgin oil post-processing; a China–EU mislabelling crisis has followed",
    applies: "yes",
    disposition:
      "The direct analogue is acute. Douzha and soybean straw are as analytically indistinguishable from virgin soy processing streams as used cooking oil is from virgin palm oil, and the fraud incentive runs the same way. No downstream assay can defend this claim; integrity therefore rests entirely on chain-of-custody documentation.",
  },
  {
    objection: "Point-of-origin verification rests on self-declaration; small sources escape mandatory physical audit",
    applies: "yes",
    disposition:
      "This is the sharpest applicable objection and it is decisive for feedstock strategy. It is the certification argument for sourcing industrial douzha from a small number of large soy beverage plants rather than aggregating from tofu workshops, and it should be elevated from a note to a stated procurement principle.",
  },
  {
    objection: "Certification bodies are paid by the producers they audit",
    applies: "unmitigable",
    disposition:
      "A structural feature of the scheme that no project-level action removes. It should be acknowledged as residual risk borne by the offtaker rather than presented as managed.",
  },
];

export const scwgReviewCaption =
  "Two objections are structurally voided by the hydrothermal architecture, one is relocated, one is conceded as worse than in the case criticised, and the entire certification critique applies.";

export const scwgHeatVsWork = {
  title: "Separating recoverable heat from irrecoverable work",
  paragraphs: [
    "The thermal excursions in this flowsheet are large but mostly recoverable, and an earlier draft overstated them by treating temperature swing as though it were energy loss. It is not. The gasifier effluent, the reformer feed and the reformer product all present high-grade sensible heat against streams that need heating, so a feed–effluent exchanger network recovers the majority of it. Pinch analysis should target that recovery explicitly rather than accepting the swing as a fixed debt.",
    "Two items survive heat integration and should be reported on their own lines. The Rectisol refrigeration duty is compressor shaft work at −30 to −60 °C; no exchanger returns shaft work, and its cost is set by coefficient of performance rather than by approach temperature. The methane round trip is reaction enthalpy — exothermic methanation followed by endothermic reforming — and heat integration cannot recover it at all, because the loss is chemical rather than thermal.",
    "The practical consequence is a narrower and more useful framing of the Rectisol-versus-MDEA question. It is primarily a capital and shaft-work comparison, not a heat-recovery one: MDEA removes the refrigeration work entirely but forgoes CO₂ separation and requires the ZnO guard. Both cases should be carried on a shaft-work basis as well as a capital one.",
  ],
};
