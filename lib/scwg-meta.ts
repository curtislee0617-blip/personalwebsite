// Act 0 — hero content. Title, subtitle, abstract. Prose only; no rendering here.

export const scwgMeta = {
  eyebrow: "Process design concept",
  title: "Co-Valorization of Bauxite Residue and Soybean Processing Waste via Supercritical Water Gasification",
  subtitle:
    "A multifunctional red mud bed, conventional acid gas removal, and reforming-coupled OXZEO olefin synthesis",
  abstractParagraphs: [
    "Douzha (okara) and bauxite residue are individually awkward wastes that become tractable when co-processed. Douzha is 80–85 wt% water, a liability for any dry thermochemical route but an asset for supercritical water gasification, where water is the reaction medium rather than a drying burden. Bauxite residue is alkaline and iron-rich, impounded at over 120 Mt per year globally with under 3% utilization; its Fe₂O₃ content makes it a credible redox mediator and its residual sodium alkalinity a tar cracker, yet that same alkalinity is what makes it hazardous and unsaleable. This study proposes a flowsheet in which the supercritical water gasifier performs both duties at once: it gasifies the biomass over a multifunctional red mud bed and, in the same pass, dealkalizes the residue, transferring sodium into a separable N-K-P-S brine.",
    "Three design conflicts are identified and resolved by decision. The salt separator is committed as a purposeful product unit rather than a protective device, because deliberate alkali removal is what converts a disposal liability into a saleable sorbent and cementitious feed. The absence of CO in hydrothermal product gas, which forecloses direct OXZEO coupling, is resolved by an intermediate bi-reforming stage; the alternative of suppressing methanation at higher gasifier severity is evaluated and rejected. Calcium-based desulfurization is removed entirely, on the grounds that CaS hydrolyses back to Ca(OH)₂ and H₂S in hot pressurized water, and is replaced by a conventional Rectisol acid gas wash reaching 0.1 ppm total sulfur including COS, with CO₂ separation in the same unit.",
    "Analysis of the solids budget shows the binding constraint on the design is not moisture but pumpability: douzha arrives at approximately 17.2 wt% solids, already within the 18–22 wt% window, so red mud dosing and straw loading compete directly for the remaining headroom. Product slate spans light olefins, an N-K-P-S fertilizer brine, elemental sulfur, and a tiered set of bauxite-derived materials from dealkalized residue through iron recovery to scandium and gallium. Feedstock geography is found to be unfavourable: no Chinese province holds red mud and douzha at scale together, and the Guangxi–Guangdong corridor is identified as the shortest credible pairing.",
    "Mass and energy balances are not yet closed. All numerical process data in this draft is flagged as placeholder, indicative or literature accordingly.",
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
    chemistry: { eyebrow: "Act 6", title: "Why it works" },
    waste: { eyebrow: "Act 7", title: "What must not leave" },
    products: { eyebrow: "Act 8", title: "Product slate" },
    openQuestions: { eyebrow: "Act 9", title: "State of the work" },
  },
  chemistry: {
    solventLabel: "The solvent: one property change",
    gasifierLabel: "Reaction network in the gasifier",
    ironLabel: "Iron redox and the alkali cycle",
    saltLabel: "Salt nucleation and deposition",
    reformerLabel: "Bi-reforming stoichiometry",
    oxzeoLabel: "OXZEO: how the ASF limit is beaten",
    contradictionsLabel: "Where the chemistry contradicts the flowsheet",
  },
  review: {
    label: "Disposition of external review comments",
    appliesColumn: "Applies here?",
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
    solidsBudgetLabel: "The solids budget",
    slurryLabel: "Slurry formulation",
    coFeedLabel: "Co-feeding other wet organic wastes",
    provinceLabel: "The five red-mud-producing provinces",
    widgetLabel: "Move the sliders — the ceiling binds fast",
    widgetHelp:
      "Douzha arrives at 17.2 wt% solids as received, so it consumes most of the 18–22 wt% window before anything else is added. Red mud buys no carbon; it only spends headroom.",
    widgetOverCeiling: "Above the pumpability ceiling — this slurry cannot be fed to a 25 MPa reactor.",
    widgetBelowFloor: "Below the design window — the inert water still has to be heated to 600 °C for no return.",
    widgetInWindow: "Inside the 18–22 wt% design window.",
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
      "Process flow diagram: eight unit operations from feed preparation to mineral conditioning, flowing top to bottom",
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
