// Waste treatment and discharge compliance. Sits after the flowsheet: having
// described what the plant makes, this covers what it must not release.
//
// PROVENANCE WARNING. The standard numbers and titles below are stated because
// they are the governing instruments; the numeric limit values are deliberately
// NOT reproduced here, because the applicable limit depends on the category the
// plant is permitted under, the receiving water body, and whether the site falls
// in a "key control area" with tightened special limits. Every entry is marked
// for verification against the standard text before any of it is relied on.

export const scwgWasteIntro =
  "A process that turns two waste streams into products still has to answer for what it releases. China regulates discharge by industry category and by receiving environment, and the applicable limit is often set by a special-limit regime rather than the headline national figure. This section names the instruments that would govern this plant and how the flowsheet is positioned against each — not the permit numbers, which cannot be set until the category and the site are fixed.";

export const scwgWasteCaveat =
  "Standard designations below are named because they are the governing instruments. Specific numeric limits are deliberately not reproduced: the binding value depends on the permitted industry category, the receiving water body, and whether the site sits inside a key control area subject to tightened special limits. All of it requires verification against the current standard text and the local ecology and environment bureau before use.";

export type WasteStandard = {
  code: string;
  title: string;
  relevance: string;
  status: "verify";
};

export const scwgWaterStandards: WasteStandard[] = [
  {
    code: "GB 8978-1996",
    title: "Integrated Wastewater Discharge Standard",
    relevance:
      "The default national instrument where no industry-specific standard applies. Sets tiered limits by discharge grade and by the receiving water body's protection class, and distinguishes first-class pollutants — which must be controlled at the workshop outlet rather than the site boundary — from second-class pollutants measured at the plant outlet.",
    status: "verify",
  },
  {
    code: "GB 31571-2015",
    title: "Emission standard of pollutants for petroleum chemistry industry",
    relevance:
      "The most likely governing standard if the plant is permitted as petrochemical rather than as a waste treatment facility. Carries a special-limit regime for key control areas that is materially tighter than the base limits, and is the standard against which an olefins train would normally be assessed.",
    status: "verify",
  },
  {
    code: "GB 18918-2002",
    title: "Discharge standard of pollutants for municipal wastewater treatment plant",
    relevance:
      "Applies if the aqueous effluent is discharged to, and co-treated by, a municipal works rather than released directly. Relevant because the ammonia-bearing stream from the phase separator is the obvious candidate for indirect discharge.",
    status: "verify",
  },
];

export const scwgAirStandards: WasteStandard[] = [
  {
    code: "GB 16297-1996",
    title: "Integrated emission standard of air pollutants",
    relevance:
      "The default instrument for stack and fugitive emissions where no sector standard governs. Sets both concentration limits and rate limits tied to stack height, and separately regulates unorganized (fugitive) emissions at the site boundary.",
    status: "verify",
  },
  {
    code: "GB 37822-2019",
    title: "Standard for fugitive emission of volatile organic compounds",
    relevance:
      "Governs unorganized VOC release — equipment leaks, storage tanks, loading, and open liquid surfaces. Directly relevant because the acid gas train brings a methanol inventory into a plant that would otherwise have none, and methanol handling is exactly the activity this standard targets.",
    status: "verify",
  },
  {
    code: "GB 31570-2015",
    title: "Emission standard of pollutants for petroleum refining industry",
    relevance:
      "Relevant to the fired reformer and to sulfur recovery tail gas. Together with GB 31571 it also carries the special-limit regime applied in key control areas.",
    status: "verify",
  },
];

export type WasteStream = {
  stream: string;
  origin: string;
  contaminants: string;
  route: string;
  residualRisk: string;
};

export const scwgWasteStreams: WasteStream[] = [
  {
    stream: "Aqueous effluent",
    origin: "Phase separation after let-down (B4)",
    contaminants: "Ammonia, dissolved organics, residual COD, trace phenolics",
    route:
      "Nitrogen recovery first, which is the point: ammonia is stripped and sold as fertilizer value rather than destroyed. The polished remainder carries a much lower nitrogen load into whatever biological or advanced-oxidation step follows.",
    residualRisk:
      "COD and residual organics after nitrogen recovery are unquantified until the balance closes. Whether a biological step alone suffices, or advanced oxidation is required, is unresolved.",
  },
  {
    stream: "Salt brine",
    origin: "Salt separator (B3)",
    contaminants: "Na, K, phosphate, sulfide and sulfate",
    route:
      "Sold as a fertilizer precursor rather than discharged. This is the single largest reason the flowsheet does not have a conventional brine disposal problem — the salt is a designed product, not an effluent.",
    residualRisk:
      "Only works if the brine meets fertilizer product specification. If heavy metals from the residue partition into it, the stream reverts from product to hazardous waste and the economics change materially. Requires analysis.",
  },
  {
    stream: "Acid gas",
    origin: "Acid gas removal (B5)",
    contaminants: "H₂S, COS, CO₂",
    route:
      "Liquid-redox recovery to elemental sulfur, chosen over Claus precisely because the sulfur load is expected to fall below the 10–13 vol% H₂S that Claus needs. Yields a saleable commodity rather than a spent-sorbent disposal stream.",
    residualRisk:
      "Tail gas from the redox unit still requires treatment, and its sulfur slip sets whether a further polishing step is needed.",
  },
  {
    stream: "CO₂",
    origin: "Separated in the acid gas wash; co-produced by olefin synthesis",
    contaminants: "CO₂ with trace sulfur",
    route:
      "Recycled to the reformer as dry-reforming oxidant rather than vented. This is the integration argument for the whole configuration: the CO₂ that makes the olefin route look bad in a standalone plant has a use here.",
    residualRisk:
      "The recycle cannot absorb all of it. The vented fraction is the number that decides the carbon claim, and it is not yet quantified.",
  },
  {
    stream: "Spent solids",
    origin: "Red mud bleed from the regeneration loop (B8)",
    contaminants: "Iron oxides, alumina, silica, titania, trace heavy metals",
    route:
      "Sold as SO₂ sorbent, cementitious material or metal recovery feed. Dealkalization is what makes this legal and commercial rather than a landfill line item.",
    residualRisk:
      "Reclassification from hazardous waste to product is a regulatory determination, not a technical one, and it is the gating question for the entire residue value chain.",
  },
  {
    stream: "Fugitive VOC",
    origin: "Methanol inventory in the chilled solvent wash",
    contaminants: "Methanol vapour",
    route:
      "Closed-loop solvent handling with leak detection and repair, which is the control regime GB 37822 is written around.",
    residualRisk:
      "This is a liability the flowsheet imports by choosing a physical solvent wash. The cheaper amine alternative would avoid the methanol inventory entirely — one more input to that open capital decision.",
  },
];

export const scwgWasteClosing =
  "The pattern is deliberate: almost every stream that would ordinarily be an effluent has been given a product destination instead. That is what makes the concept coherent — but it also means the environmental case and the commercial case stand or fall together. If the brine cannot be sold, it becomes a disposal cost; if the residue cannot be reclassified, it goes back to the impoundment. The discharge standards are therefore not a compliance afterthought but a constraint on whether the product slate exists at all.";
