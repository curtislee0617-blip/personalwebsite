import type {
  ChemistryContradiction,
  ChemistryTopic,
  ReactionRow,
  WaterPropertyRow,
} from "@/lib/scwg-types";

// Report Section 3 — thermodynamic and kinetic basis. Newly drafted in the
// current proposal, and organised so the unifying argument comes first: almost
// everything distinctive about this flowsheet follows from one property change
// in the solvent.

export const scwgChemistryIntro =
  "Why the flowsheet is shaped the way it is. Almost everything distinctive here — why the biomass dissolves and reacts, why the product gas contains no CO, why the salts crash out, and why the red mud behaves as it does — follows from a single property change in the solvent. This section supplies that chemistry, and ends by listing three findings that contradict the flowsheet as drawn.";

// ── §3.1 Supercritical water as a reaction medium ─────────────────────────────

export const scwgWaterIntro =
  "Water has a critical point at 373.95 °C and 22.064 MPa, with a critical density of 322 kg/m³. Crossing it does not merely remove the phase boundary; it dismantles the hydrogen-bond network that gives liquid water its solvent character. Three consequences follow, and they are not independent — all three are expressions of the same structural collapse.";

export const scwgWaterProperties: WaterPropertyRow[] = [
  {
    property: "Density (kg/m³)",
    ambient: "997",
    nearCritical: "~167",
    operating: "~71",
    consequence: "Gas-like transport, liquid-like collision frequency",
  },
  {
    property: "Static dielectric constant ε",
    ambient: "78.4",
    nearCritical: "~2",
    operating: "~1.2–1.5",
    consequence: "Water becomes a non-polar solvent — behaves like hexane, not like water",
    indicative: true,
  },
  {
    property: "Ionic product K_w",
    ambient: "10⁻¹⁴",
    nearCritical: "≈10⁻¹⁹ to 10⁻²¹",
    operating: "≈10⁻²³",
    consequence: "Acid/base catalysis switched off; free-radical chemistry takes over",
    indicative: true,
  },
  {
    property: "Organic miscibility",
    ambient: "Poor",
    nearCritical: "Complete",
    operating: "Complete",
    consequence: "Single-phase reaction — no interphase mass transfer resistance",
  },
  {
    property: "Inorganic salt solubility",
    ambient: "High",
    nearCritical: "Very low",
    operating: "Negligible",
    consequence: "Salts precipitate — the B3 duty and the plugging hazard",
  },
];

export const scwgWaterCaption =
  "Table 3.1 — Water properties across the operating range. Densities from steam tables at 25 MPa; dielectric and ionic-product values from the hydrothermal literature, with the 600 °C entries flagged as extrapolated and requiring a cited source before final issue.";

export const scwgUnifyingInsight = {
  title: "One property change, two opposite consequences",
  body: "The dielectric constant falling from 78 to roughly 2 is a single physical change with two opposite consequences, and the entire flowsheet architecture is a response to both at once. Because ε collapses, water can no longer stabilise ions by solvation. Non-polar organics therefore become fully miscible — which is why biomass depolymerises and reacts in a single homogeneous phase with no interphase resistance, and why the moisture that would cripple a dry gasifier becomes an asset. But the same loss of solvation power means dissolved inorganic salts have nothing holding them in solution, so they crash out — which is why sodium separation is available as a designed product operation and why plugging is the dominant failure mode.",
  consequence:
    "The gasifier and the salt separator are therefore not two independent units that happen to sit in series. They are two faces of one solvent property, exploited in the same vessel train. That is the strongest physical argument for the concept.",
};

export const scwgRegimeNote =
  "The ionic-product collapse sets the reaction regime. Where K_w exceeds roughly 10⁻¹⁴, hydronium and hydroxide concentrations are high enough for acid- and base-catalysed ionic chemistry to dominate; where K_w falls far below that, homolytic free-radical pathways take over. K_w passes through a maximum near 250–300 °C, so a feed heated from ambient to 600 °C traverses an ionic regime on the way up and finishes in a radical regime. This is not a nuisance — it is the reason a single reactor can perform both hydrolytic depolymerisation and reforming, and the feed preheat profile is therefore a design variable rather than a utility calculation.";

// ── §3.2 Reaction network in the gasifier ────────────────────────────────────

export const scwgGasifierReactions: ReactionRow[] = [
  {
    name: "Steam reforming of fragments",
    stoichiometry: "CₙHₘOₖ + H₂O → CO + H₂",
    enthalpy: "endothermic",
    role: "Primary gas-forming step",
  },
  {
    name: "Water-gas shift",
    stoichiometry: "CO + H₂O ⇌ CO₂ + H₂",
    enthalpy: "−41",
    role: "Drives CO to near zero",
  },
  {
    name: "CO methanation",
    stoichiometry: "CO + 3H₂ ⇌ CH₄ + H₂O",
    enthalpy: "−206",
    role: "Exothermic; buffered by the water inventory",
  },
  {
    name: "CO₂ methanation",
    stoichiometry: "CO₂ + 4H₂ ⇌ CH₄ + 2H₂O",
    enthalpy: "−165",
    role: "Consumes the H₂ that shift produced",
  },
  {
    name: "Steam–carbon (char gasification)",
    stoichiometry: "C + H₂O → CO + H₂",
    enthalpy: "+131",
    role: "Consumes char; favoured at high severity",
  },
  {
    name: "Boudouard (reverse)",
    stoichiometry: "2CO ⇌ C + CO₂",
    enthalpy: "−172",
    role: "Coke route; suppressed by low CO here",
  },
  {
    name: "Methane cracking",
    stoichiometry: "CH₄ ⇌ C + 2H₂",
    enthalpy: "+75",
    role: "Negligible at 600–650 °C; matters in B6",
  },
];

export const scwgGasifierReactionsCaption =
  "Table 3.2 — Principal gas-phase reactions in the gasifier, ΔH°₂₉₈ in kJ/mol, endothermic positive. Standard values used for direction and relative magnitude only; Section 5 must use temperature-corrected values at operating conditions.";

export const scwgGasifierTopics: ChemistryTopic[] = [
  {
    id: "stage-1",
    title: "Stage 1 — ionic hydrolysis during preheat, 200–370 °C",
    paragraphs: [
      "In the near-critical region K_w is at or above its ambient value and water is simultaneously a strong acid and a strong base. Glycosidic bonds in douzha's cellulose and pectin, and in straw hemicellulose, hydrolyse to oligosaccharides and monosaccharides. Peptide bonds hydrolyse to free amino acids. Triglycerides hydrolyse to free fatty acids and glycerol. Because douzha carries essentially no lignin, the most hydrolysis-resistant and char-prone biopolymer is absent, and depolymerisation is close to complete before the critical point is reached — the central kinetic advantage of this feedstock.",
      "Sugars entering this window are not stable in it. Retro-aldol cleavage, dehydration and isomerisation produce glyceraldehyde, pyruvaldehyde, glycolaldehyde, furfural and 5-hydroxymethylfurfural, together with organic acids — chiefly formic, acetic and lactic. Formic acid matters out of proportion to its concentration because it decomposes by two competing routes, dehydrogenation to CO₂ and H₂ or dehydration to CO and H₂O, and the branching ratio between them is one of the levers on early gas composition.",
    ],
  },
  {
    id: "stage-2",
    title: "Stage 2 — free-radical gasification above the critical point",
    paragraphs: [
      "Beyond roughly 400 °C the ionic route is suppressed and homolytic bond scission dominates. Fragments undergo steam reforming, water-gas shift and methanation on their way to a gas that is close to thermodynamic equilibrium.",
    ],
  },
  {
    id: "no-co",
    title: "Why the product gas contains essentially no CO",
    paragraphs: [
      "This is the single most consequential result in the section, and it is a thermodynamic certainty rather than a catalyst artefact. Water-gas shift is mildly exothermic, so its equilibrium constant falls with temperature — but the equilibrium position depends on the water-to-carbon ratio as strongly as on temperature, and in supercritical water gasification that ratio is enormous. At 20 wt% solids the molar ratio of water to feed carbon is of order 15–25 to one, against roughly 3 to one in a conventional steam reformer. Le Chatelier applied to CO + H₂O ⇌ CO₂ + H₂ with water in vast excess drives the reaction essentially to completion, leaving CO at trace level.",
    ],
    callout: {
      kind: "consequence",
      title: "The consequence is structural, not incidental",
      body: "No adjustment of catalyst, temperature or residence time within the hydrothermal window recovers CO, because the water excess that makes the process work is the same thing that destroys CO. Any CO-consuming downstream chemistry — Fischer–Tropsch, classical methanol synthesis, OXZEO — is therefore foreclosed on a directly coupled basis. This is the origin of the second design conflict and the justification for block B6.",
    },
  },
  {
    id: "heteroatoms",
    title: "Nitrogen and sulfur speciation from a protein-rich feed",
    paragraphs: [
      "Douzha at roughly 27 wt% protein makes heteroatom chemistry a primary rather than a trace concern. Amino acids released by peptide hydrolysis follow two competing routes: deamination, which liberates ammonia and leaves a carboxylic acid, and decarboxylation, which liberates CO₂ and leaves an amine. Deamination dominates at hydrothermal severity, so nitrogen reports overwhelmingly as NH₃ rather than as N₂ or NOₓ. Because ammonia is highly soluble in the dense aqueous phase and is a base, it partitions strongly into the water and leaves with the B3 brine — which is why nitrogen recovery is an aqueous-phase operation in this flowsheet and not a gas-cleaning one.",
      "Sulfur arrives almost entirely as cysteine and methionine. Thermolysis of cysteine gives H₂S directly; methionine gives methanethiol and dimethyl sulfide, which hydrolyse and reform toward H₂S under hydrothermal conditions. Two secondary species matter disproportionately downstream. Carbonyl sulfide forms readily from H₂S in a CO₂-rich environment by H₂S + CO₂ ⇌ COS + H₂O, and thiophenic sulfur can form by condensation of sulfide with carbonyl-bearing fragments. COS is the reason the design selects a physical solvent wash over an amine — amines remove COS poorly, and COS passes through to poison the OXZEO catalyst.",
    ],
  },
  {
    id: "melanoidin",
    title: "Char and coke: the specific risk douzha introduces",
    paragraphs: [
      "The absence of lignin removes the classical char precursor, but protein and reducing sugars together introduce a different one. Maillard condensation between amino groups and carbonyl carbons produces melanoidins — nitrogen-containing, highly conjugated, thermally robust polymers — and the near-critical preheat zone is close to ideal for forming them. Because they resist both hydrolysis and steam gasification, melanoidin formation converts feed carbon into a residue that reports to the solid phase and contaminates the red mud product.",
    ],
    callout: {
      kind: "warning",
      title: "An under-recognised risk, with a specific countermeasure",
      body: "This argues for minimising residence time in the 200–300 °C window where Maillard kinetics peak, by using rapid direct mixing of the cold slurry with recycled supercritical effluent rather than slow indirect preheat. That is a heat-exchanger network decision made on chemical grounds. No quantitative melanoidin yield data exists for douzha under hydrothermal gasification conditions; it must be measured before the char balance can be closed.",
    },
  },
];

// ── §3.3 Red mud redox thermodynamics ────────────────────────────────────────

export const scwgIronBuffering: ChemistryTopic = {
  id: "iron-buffering",
  title: "Red mud redox thermodynamics, and what buffers the iron",
  paragraphs: [
    "Iron oxide reduces in a defined sequence, Fe₂O₃ → Fe₃O₄ → FeO → Fe, and each step is governed not by absolute temperature but by the reducing potential of the gas, expressed as the H₂/H₂O ratio. Two constraints bear on this system. First, wüstite (FeO) is thermodynamically unstable below approximately 570 °C, disproportionating to metallic iron and magnetite, so at the lower end of the proposed 600–650 °C window FeO is only marginally accessible. Second, and decisively, the steam–iron equilibria run in reverse when water is in excess: 3Fe + 4H₂O ⇌ Fe₃O₄ + 4H₂ and 3FeO + H₂O ⇌ Fe₃O₄ + H₂ both proceed to the right when H₂/H₂O is small.",
    "In supercritical water gasification H₂/H₂O is very small by construction — water is 80 wt% of the feed and hydrogen is a dilute product. The iron is therefore buffered at magnetite, not progressively reduced.",
  ],
  callout: {
    kind: "consequence",
    title: "This resolves the open question on B8",
    body: "If no lattice oxygen is lost across a pass, B8's air oxidation is not restoring oxygen transport capacity, because none was lost. Its real duties are heat recovery and conditioning the solid for metals recovery, and it should be sized against those. It also means the Fe³⁺/Fe²⁺ couple functions as a redox relay in the shift and reforming steps — a mediating role — rather than as a stoichiometric oxidant. The argument is qualitative and must be confirmed by a Gibbs-minimisation calculation over the Fe–O–H₂O system at 25 MPa before it is relied on.",
  },
};

export const scwgFormateCycle = {
  title: "The alkali contribution: a formate-mediated shift cycle",
  intro:
    "The alkali in red mud is not a generic promoter. Sodium carbonate and hydroxide participate in a stoichiometric formate cycle that constitutes a genuine homogeneous water-gas shift pathway, distinct from the surface redox mechanism operating on the iron:",
  steps: [
    "Na₂CO₃ + H₂O → NaHCO₃ + NaOH",
    "NaOH + CO → HCOONa",
    "HCOONa + H₂O → NaHCO₃ + H₂",
    "2NaHCO₃ → Na₂CO₃ + H₂O + CO₂",
  ],
  closing:
    "The cycle closes on sodium carbonate, so alkali is formally a catalyst — but only while it remains in contact with the reacting fluid. Because salts precipitate under these conditions, the alkali is continuously being removed from the reaction zone into the B3 brine. The formate pathway therefore has a finite life set by sodium residence in the solid, which is the mechanistic statement of the first design conflict: the same chemistry that promotes shift is the chemistry that dealkalizes the residue, and the two cannot be optimised independently.",
};

// ── §3.4 Salt nucleation, growth and deposition ──────────────────────────────

export const scwgSaltPhysics: ChemistryTopic = {
  id: "salt-physics",
  title: "Salt nucleation, growth and deposition",
  paragraphs: [
    "Salt behaviour in supercritical water divides into two classes, and the distinction determines separator design. Type 1 salts, of which sodium chloride is the archetype, retain appreciable solubility and form a dense brine that separates as a fluid phase. Type 2 salts, of which sodium sulfate and sodium carbonate are the relevant examples here, have very low solubility and precipitate directly as solids. Sodium sulfate is markedly less soluble than sodium chloride and correspondingly more prone to deposition.",
    "This flowsheet is dominated by Type 2 behaviour, which is the harder case. The sodium arriving from red mud is present as carbonate, hydroxide and aluminosilicate-bound alkali; the sulfur partitioning into the aqueous phase appears as sulfide and sulfate; the potassium from straw ash accompanies it. The separator is therefore handling a mixed Na–K sulfate/carbonate system that precipitates as a solid rather than draining as a brine, and it must be designed to remove solids continuously.",
    "The precipitation sequence is well characterised. Homogeneous nucleation initiates from a highly supersaturated solution, followed by mass-transfer-limited particle growth; molecular dynamics work resolves the early stages into ion pairs, then small ionic clusters, then large clusters, with nucleation complete within tens of picoseconds. Sodium sulfate particles are finer and more strongly aggregated than sodium chloride crystals, with primary particles of roughly 1–3 μm agglomerating into clusters up to about 20 μm.",
  ],
  callout: {
    kind: "insight",
    title: "Why a cooled wall is mechanism, not vendor preference",
    body: "Hot surfaces present additional adsorption sites and therefore promote heterogeneous nucleation preferentially on high-temperature walls, where the resulting particles adhere. Deposition is thus not a random fouling process but a directed one, driven toward the hottest surface available. A cooled-wall separator inverts that gradient deliberately: by making the wall the coldest surface in the vessel, nucleation is driven into the bulk and onto a cold collection surface from which solids can be removed, rather than onto the process boundary.",
  },
};

// ── §3.5 Bi-reforming stoichiometry ──────────────────────────────────────────

export const scwgReformerReactions: ReactionRow[] = [
  { name: "Steam methane reforming", stoichiometry: "CH₄ + H₂O ⇌ CO + 3H₂", enthalpy: "+206", role: "H₂/CO = 3" },
  { name: "Dry (CO₂) reforming", stoichiometry: "CH₄ + CO₂ ⇌ 2CO + 2H₂", enthalpy: "+247", role: "H₂/CO = 1" },
  {
    name: "Bi-reforming (Olah stoichiometry)",
    stoichiometry: "3CH₄ + 2H₂O + CO₂ ⇌ 4CO + 8H₂",
    enthalpy: "+659",
    role: "H₂/CO = 2 exactly",
  },
  { name: "Reverse water-gas shift", stoichiometry: "CO₂ + H₂ ⇌ CO + H₂O", enthalpy: "+41", role: "—" },
  { name: "Methane cracking (coke)", stoichiometry: "CH₄ ⇌ C + 2H₂", enthalpy: "+75", role: "—" },
  { name: "Boudouard (coke)", stoichiometry: "2CO ⇌ C + CO₂", enthalpy: "−172", role: "—" },
  { name: "Carbon gasification (coke removal)", stoichiometry: "C + H₂O → CO + H₂", enthalpy: "+131", role: "—" },
];

export const scwgReformerReactionsCaption =
  "Table 3.3 — Reformer reaction set, ΔH°₂₉₈ in kJ/mol. Bi-reforming is the combination 2×SMR + 1×DRM, and its H₂/CO ratio of exactly 2 is the reason it is preferred here.";

export const scwgRatioArgument = {
  title: "Why H₂/CO = 2 is the correct target, and why dry reforming alone would waste half the carbon",
  intro:
    "Olefin synthesis from syngas must reject the oxygen that arrives bound to carbon monoxide. There are only two ways to do it, and they differ enormously in carbon efficiency:",
  routes: [
    {
      label: "Hydrogen-rich rejection as water",
      stoichiometry: "CO + 2H₂ → (–CH₂–) + H₂O",
      requirement: "Requires H₂/CO = 2 exactly",
      efficiency: "Carbon efficiency 100% — every carbon atom fed reaches the product",
    },
    {
      label: "Carbon-rich rejection as CO₂",
      stoichiometry: "2CO + H₂ → (–CH₂–) + CO₂",
      requirement: "Operates at H₂/CO = 0.5",
      efficiency: "Carbon efficiency 50% — half the carbon fed leaves as carbon dioxide",
    },
  ],
  closing:
    "Dry reforming alone delivers H₂/CO = 1, which sits between these limits and forces a substantial fraction of carbon out as CO₂ regardless of catalyst. Bi-reforming delivers H₂/CO = 2, which is precisely the stoichiometric requirement for water rejection with no CO₂ co-production. The match is exact and it is not a coincidence of convenience: it is the reason bi-reforming rather than dry reforming is the correct unit operation here, and it is a stronger argument than ratio-adjustment convenience. It also reframes the CO₂ selectivity problem in the OXZEO block as primarily a feed-ratio question rather than a catalyst question.",
};

export const scwgCokingNote: ChemistryTopic = {
  id: "coking",
  title: "Carbon deposition and the thermodynamic carbon boundary",
  paragraphs: [
    "Coking is the dominant deactivation mechanism for nickel reforming catalysts and it proceeds by two routes with opposite temperature dependence. Methane cracking is endothermic and therefore worsens as temperature rises; the Boudouard reaction is exothermic and worsens as temperature falls. Between them they leave a window rather than a monotonic trend, and the practical consequence is that a reformer cannot be made coke-free by temperature alone.",
    "The controlling variable is instead the oxidant-to-carbon ratio. Carbon deposition is suppressed thermodynamically when sufficient H₂O and CO₂ are present to gasify deposited carbon as fast as it forms. This is the mechanistic reason steam co-feed is the standard coking mitigation, and it is why bi-reforming is more robust than dry reforming in practice as well as more favourable stoichiometrically: the steam component both sets the H₂/CO ratio and suppresses carbon.",
  ],
  callout: {
    kind: "insight",
    title: "A genuine and unearned advantage",
    body: "Steam is available at essentially zero marginal cost, because the hydrothermal island is already a water-dominated system. A conventional dry reforming installation must justify every mole of steam against its energy cost. Here the steam is a by-product of the process configuration, so the coke-suppressing oxidant-to-carbon ratio can be set generously without an economic penalty. Section 5 should quantify how far this offsets the reformer endotherm.",
  },
};

// ── §3.6 OXZEO mechanism ─────────────────────────────────────────────────────

export const scwgOxzeoTopics: ChemistryTopic[] = [
  {
    id: "asf",
    title: "Why Fischer–Tropsch cannot reach these selectivities and OXZEO can",
    paragraphs: [
      "Classical Fischer–Tropsch synthesis builds hydrocarbons by successive CH₂ insertion on a single metal surface. Because each chain-growth step has the same probability, the product distribution follows Anderson–Schulz–Flory statistics and the achievable C₂–C₄ fraction is capped near 58% irrespective of catalyst optimisation. The oxide–zeolite approach evades that ceiling by physically separating the two functions: CO activation occurs on the oxide, and carbon–carbon coupling occurs inside the zeolite, where pore geometry rather than surface statistics governs chain length.",
    ],
  },
  {
    id: "vacancy",
    title: "CO activation at oxygen vacancies on the oxide",
    paragraphs: [
      "The active site on the oxide component is the surface oxygen vacancy. Spinel ZnCr₂O₄ is reduced by CO or H₂ under reaction conditions to generate vacancies, and both CO and H adsorption strengthen markedly as vacancy concentration rises; two-coordinate oxygen vacancy sites have been identified as the active centres for CO activation and subsequent hydrogenation, generating a sequence of CHO, CH₂O, CH₂ and CH₂CO surface intermediates. Recent work confines a ZnOₓ overlayer on the ZnCr₂O₄ spinel specifically to control this vacancy population.",
    ],
    callout: {
      kind: "warning",
      title: "A direct and unwelcome implication for the sulfur specification",
      body: "If the active site is a reduced-oxide oxygen vacancy, then sulfide chemisorption competes for exactly the coordination position the mechanism depends on — and zinc has a high affinity for sulfur. The same affinity that makes ZnO an effective guard bed sorbent makes the ZnCrOₓ component vulnerable. Deactivation should therefore be expected to be effectively irreversible rather than merely inhibitory, which is the mechanistic justification for the sub-ppm outlet specification and for choosing a wash that removes COS as well as H₂S. The sub-0.1 ppm figure remains an inference from this argument plus the Rectisol capability, not a cited deactivation study; a poisoning threshold measurement is required.",
    },
  },
  {
    id: "ketene",
    title: "Ketene as the coupling intermediate, and the role of proximity",
    paragraphs: [
      "The species that crosses from oxide to zeolite has been identified as ketene, CH₂CO. Mechanistic work combining neural-network potentials with microkinetic simulation over ZnCrOₓ|SAPO-34 attributes ketene formation to two competing routes with strongly unequal weight: approximately 86% arises from methanol carbonylation at neighbouring zeolite acid sites, and approximately 14% from direct CHO*–CO* coupling on the oxide.",
    ],
    callout: {
      kind: "consequence",
      title: "Bed architecture is a primary design variable, not a preparation detail",
      body: "The dominant pathway requires the two functions to be close enough for a methanol-derived intermediate to reach a zeolite acid site before it is over-hydrogenated. Granule stacking versus intimate powder mixing versus a core–shell arrangement therefore has to be specified. If the oxide and zeolite are too far apart the system reverts toward methanol synthesis; if they are too intimate, the zeolite acid sites can over-hydrogenate intermediates to paraffins and the olefin-to-paraffin ratio collapses.",
    },
  },
  {
    id: "cha",
    title: "Shape selectivity in the CHA cage, and where the CO₂ comes from",
    paragraphs: [
      "SAPO-34 has the chabazite topology: large cages of roughly 0.94 nm connected through eight-membered-ring windows of approximately 0.38 nm. Coupling occurs inside the cages, but only species small enough to pass the windows can leave, which excludes branched and heavier products and delivers the light olefin cut directly. Selectivity is therefore a geometric property of the framework rather than a kinetic accident, which is why it is robust across the operating window while conversion is not.",
      "The CO₂ co-production that the product slate flags as contested follows from the oxygen-rejection stoichiometry. Carbon monoxide brings one oxygen atom per carbon, and that oxygen must leave either as water, consuming hydrogen, or as carbon dioxide, consuming a second CO. The observed CO₂ selectivity is therefore primarily a statement about the H₂/CO ratio at the reactor inlet, and only secondarily about the catalyst. Feeding at H₂/CO ≈ 2 pushes rejection toward water and suppresses CO₂; feeding CO-rich forces the carbon-consuming route. This is the quantitative link between the reformer specification and the disputed carbon efficiency claim, and it is the strongest available response to the published criticism of low-CO₂ claims for direct syngas-to-olefins.",
    ],
  },
  {
    id: "deactivation",
    title: "Deactivation modes",
    paragraphs: [
      "Three mechanisms belong in the risk register. Coke accumulation inside the CHA cages is the familiar methanol-to-olefins failure mode and is addressed by the same remedy — periodic oxidative regeneration, which requires a swing reactor arrangement. Zinc migration and volatilisation degrades the oxide component and sets an upper temperature limit independent of selectivity considerations. Sulfur poisoning at the oxygen vacancy is effectively terminal, which is why the guard bed is retained even when the primary wash is specified to 0.1 ppm.",
    ],
  },
];

// ── §3.7 Where the chemistry contradicts the flowsheet as drawn ──────────────

export const scwgContradictionsIntro =
  "Three findings in this section are not consistent with the block architecture as drawn, and the work is more useful for listing them plainly than for reconciling them prematurely.";

export const scwgContradictions: ChemistryContradiction[] = [
  {
    title: "The B8 air regeneration has no oxygen-capacity justification",
    body: "The iron is buffered at magnetite by the steam–iron equilibrium in excess water, so no lattice oxygen is lost per pass. B8 should be re-scoped around heat recovery and metals conditioning, and the R1 recycle sized accordingly.",
  },
  {
    title: "The Maillard route is an unquantified carbon sink specific to this feedstock",
    body: "Melanoidin formation in the preheat zone is a char pathway that the lignin-free framing had implicitly dismissed. It argues for rapid direct-contact preheat, which is a change to the B1 heat exchanger network.",
  },
  {
    title: "The catalyst bed architecture in B7 is unspecified but decisive",
    body: "The dominant ketene route depends on oxide–zeolite proximity, so B7 cannot be treated as a generic fixed bed. The arrangement, and the olefin-to-paraffin consequence of getting it wrong, must be specified.",
  },
];
