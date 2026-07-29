// Act 0 — hero content. Title, subtitle, abstract. Prose only; no rendering here.

export const scwgMeta = {
  eyebrow: "Process design concept",
  title: "Co-Valorization of Bauxite Residue and Soybean Processing Waste",
  subtitle:
    "Supercritical water gasification with a multifunctional red mud bed, conventional acid gas removal, and reforming-coupled OXZEO olefin synthesis",
  abstractParagraphs: [
    "Two waste streams that are individually awkward become tractable when co-processed. Okara — the residue from soymilk and tofu manufacture — is 80–85 wt% water, a liability for any dry thermochemical route but an asset for supercritical water gasification, where water is the reaction medium rather than a drying burden. Bauxite residue is alkaline, iron-rich, and impounded at roughly 170 Mt per year globally with under 3% utilization; its Fe₂O₃ content makes it a credible low-cost oxygen carrier and its residual sodium alkalinity makes it a tar cracker — but that same alkalinity is what makes it a liability and what must be removed before the residue can be sold.",
    "This work proposes that the supercritical water gasifier performs both duties at once: it gasifies the biomass using red mud as redox mediator and tar cracker, and in the same pass it dealkalizes the red mud, transferring sodium into a separable, saleable brine. The gasifier is simultaneously a biomass converter and a bauxite residue treatment unit.",
  ],
  /** Legend copy for the sticky placeholder-discipline header. */
  legend: {
    heading: "How to read the numbers",
    placeholder:
      "Placeholder — pending balance closure. The mass and energy balances are not yet written; these figures are structural placeholders, not results.",
    literature: "Literature — an anchor value from a cited source, resolving to the references.",
  },
} as const;
