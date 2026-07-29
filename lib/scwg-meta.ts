// Act 0 — hero content. Title, subtitle, abstract. Prose only; no rendering here.

export const scwgMeta = {
  eyebrow: "Process design concept",
  title: "Co-Valorization of Bauxite Residue and Soybean Processing Waste",
  subtitle:
    "Supercritical water gasification with a multifunctional red mud bed, conventional acid gas removal, and reforming-coupled OXZEO olefin synthesis",
  abstractParagraphs: [
    "Two waste streams that are individually awkward become tractable when co-processed. Douzha — the residue from soymilk and tofu manufacture — is 80–85 wt% water, a liability for any dry thermochemical route but an asset for supercritical water gasification, where water is the reaction medium rather than a drying burden. Bauxite residue is alkaline, iron-rich, and impounded at over 120 Mt per year globally with under 3% utilization; its Fe₂O₃ content makes it a credible low-cost oxygen carrier and its residual sodium alkalinity makes it a tar cracker — but that same alkalinity is what makes it a liability and what must be removed before the residue can be sold.",
    "This work proposes that the supercritical water gasifier performs both duties at once: it gasifies the biomass using red mud as redox mediator and tar cracker, and in the same pass it dealkalizes the red mud, transferring sodium into a separable, saleable brine. The gasifier is simultaneously a biomass converter and a bauxite residue treatment unit.",
  ],
  /** Legend copy for the sticky placeholder-discipline header. */
  legend: {
    heading: "How to read the numbers",
    placeholder:
      "Placeholder — pending balance closure. The mass and energy balances are not yet written; these figures are structural placeholders, not results.",
    literature: "Literature — an anchor value from a cited source, resolving to the references.",
    indicative:
      "Indicative — a real figure drawn from general engineering knowledge, not yet traceable to a primary source. Carried over from the report's own provenance convention; it must not survive into a final version without a citation.",
  },
} as const;

/**
 * Where the work sits. This concept came out of the Towngas Green Fuels &
 * Chemicals internship; VENEX is that division's green-methanol venture.
 *
 * The logos are taken from the VENEX site and are deliberately page-specific
 * (`scwg-` prefix) so they are independent of the Towngas logo the CV uses —
 * changing one must never change the other. `/logos/*` is proxied to Supabase
 * storage, so these files also have to exist in the `site-media` bucket.
 */
export const scwgAffiliation = {
  eyebrow: "Affiliation",
  note: "Developed during a process engineering internship with the Green Fuels & Chemicals division of The Hong Kong and China Gas Company (Towngas), and its green-methanol venture VENEX, across Foshan, Guangdong and Jungar Banner, Inner Mongolia.",
  disclaimer:
    "A personal study. The analysis, the design decisions and any errors are the author's own, and it is not a Towngas or VENEX publication.",
  // `heightClass` optically matches the two marks. The Towngas PNG carries more
  // internal padding than the VENEX one, so an identical box height renders it
  // visibly smaller; it is scaled up to compensate.
  logos: [
    {
      src: "/logos/scwg-towngas.png",
      alt: "Towngas logo",
      width: 244,
      height: 70,
      heightClass: "h-11 sm:h-[3.4rem]",
    },
    {
      src: "/logos/scwg-venex.png",
      alt: "VENEX logo",
      width: 568,
      height: 129,
      heightClass: "h-8 sm:h-10",
    },
  ],
} as const;

/**
 * Section headings and UI labels. These live here, not in the .tsx files, so
 * that rewriting any user-facing text means editing a lib/scwg-* file only.
 */
export const scwgUi = {
  abstractLabel: "Abstract",
  legendPlaceholderLabel: "Placeholder.",
  legendIndicativeLabel: "Indicative.",
  legendLiteratureLabel: "Literature.",
  acts: {
    regulatory: { eyebrow: "Act 1", title: "Why this is being built" },
    rationale: { eyebrow: "Act 2", title: "Why these two wastes" },
    siting: { eyebrow: "Act 3", title: "Where the two wastes actually are" },
    feedstock: { eyebrow: "Act 4", title: "What goes in" },
    process: { eyebrow: "Act 5", title: "The plant" },
    waste: { eyebrow: "Act 6", title: "What must not leave" },
    products: { eyebrow: "Act 7", title: "Product slate" },
    openQuestions: { eyebrow: "Act 8", title: "State of the work" },
  },
  rationale: {
    contributionLabel: "What it brings",
    synergyLabel: "Why the pairing works",
    productsLabel: "What can be made",
  },
  waste: {
    waterLabel: "Water discharge",
    airLabel: "Air emissions",
    streamsLabel: "Stream-by-stream disposition",
    verifyBadge: "verify",
  },
  feedstock: {
    synergyLabel: "The load-bearing claim",
    compositionLabel: "Red mud composition and assigned function",
    compositionCaption:
      "Ranges from Wang & Liu (2012); representative Chinese Bayer residue analysis and scandium content from Zhang et al. (2016, 2017).",
    blendLabel: "Blend design constraints",
    heteroatomLabel: "Contaminant inventory and assigned fate",
    dataGapBadge: "data gap",
  },
  reportStructure: {
    label: "Report structure",
    statusDrafted: "Drafted",
    statusOutlined: "Outlined",
    columnSection: "Section",
    columnArgument: "Argument it must carry",
    columnStatus: "Status",
  },
  siting: {
    overlaysLabel: "Overlays",
    payloadLabel: "The analytical payload",
    haulLabel: "Haul-distance calculator",
    haulHelp: "Great-circle distance to the nearest source in each active overlay.",
    noOverlays: "No point-source overlays active.",
    mapAriaLabel: "Choropleth of China: red mud and douzha sources by province",
    markLegendLabel: "Reading the marks",
    markFilled:
      "Filled, sized by capacity. Only Fangchenggang (~2.4 Mt/y) has one — hence the single large mark.",
    markHollow: "Hollow — capacity unverified, i.e. every other site.",
    markDotted: "Dotted — neighbours and Taiwan, context only.",
  },
  process: {
    diagramAriaLabel:
      "Process flow diagram: eight unit operations from feed preparation to red mud regeneration, flowing top to bottom",
    inletLabel: "Inlet streams",
    outletLabel: "Outlet streams",
    contextValuesLabel: "Context values",
    needsValidationBadge: "Needs validation",
  },
  references: {
    heading: "References",
    key: "verified against a primary source",
    keyUnverified: "unverified attribution",
  },
  products: { detailsOpen: "Show less", detailsClosed: "Details" },
  /** Callout kind → heading, keyed by BlockFlag["kind"]. */
  flagLabels: {
    "needs-validation": "Needs validation",
    warning: "Warning",
    decision: "Decision",
    note: "Note",
  },
  /** How well supported a sub-claim is, keyed by BlockRole["support"]. */
  supportLabels: {
    "best-supported": "Best supported",
    supported: "Supported",
    "requires-qualification": "Requires qualification",
    unvalidated: "Unvalidated",
  },
} as const;
