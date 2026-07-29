import type { ProcessBlock } from "@/lib/scwg-types";

// Act 3 — the plant. ALL process block content: prose, conditions, streams,
// duties, metrics, flags. The diagram, scroll sequence, navigation and stream
// tables all derive from this single array. Adding a ninth block should require
// editing ONLY this file.
//
// Every numeric quantity is a ProcessValue. The balances do not exist yet, so
// almost everything is status:"placeholder"; the few real numbers are cited
// literature anchors with a source marker resolving to scwg-references.ts.

export const scwgProcessIntro =
  "The plant, read top to bottom. The diagram on the left holds while the description scrolls; scroll position is process position. Every unit-operation symbol is drawn to Aspen / ISA-5.1 convention and chosen automatically from each block's type. Three blocks — B2, B3 and B6 — carry the load-bearing, unproven claims and are badged accordingly.";

export const scwgProcessBlocks: ProcessBlock[] = [
  {
    id: "B1",
    name: "Feed preparation and slurry make-up",
    symbol: "mix-pump",
    conditions: {
      pressure: { min: 0.1, max: 25, unit: "MPa", status: "literature", source: "SWG-feed" },
      summary: "Ambient → 25 MPa",
    },
    diagram: { col: 0, row: 0 },
    needsValidation: false,
    function: [
      "Straw is milled and blended into douzha to 18–22 wt% total solids; red mud is dosed; the slurry is pressurised by positive-displacement pump. Feed–effluent exchange recovers reactor outlet heat.",
      "Douzha is the rheological enabler: its fine hydrated fibre forms a pumpable paste rather than a settling suspension, letting it carry milled straw that would otherwise bridge and settle.",
    ],
    inlet: [
      { tag: "1", name: "Douzha", phase: "slurry", components: "80–85 wt% water, protein-derived organics" },
      { tag: "2", name: "Milled soybean straw", phase: "solid", components: "Lignocellulose" },
      { tag: "3", name: "Red mud (fresh make-up)", phase: "solid", components: "Fe₂O₃, Al₂O₃, SiO₂, Na alkalinity" },
      { tag: "21", name: "Regenerated red mud bed", phase: "solid", components: "Re-oxidised bed recycled from B8" },
    ],
    outlet: [
      { tag: "4", name: "Pressurised feed slurry", phase: "slurry", components: "18–22 wt% total solids + red mud" },
    ],
    duty: {
      label: "Specific pumping energy",
      signConvention: "positive = work input to the slurry",
      value: { value: 0, unit: "kWh/t slurry", status: "placeholder", note: "Set by the pump duty once the balance closes." },
    },
    contextValues: [
      { label: "Discharge pressure", value: { value: 25, unit: "MPa", status: "placeholder", note: "Nominal SCWG operating pressure; confirmed by the severity study." } },
    ],
    flags: [
      {
        kind: "note",
        title: "No conversion metric here",
        body: "This is a preparation block: report discharge pressure and specific pumping energy, not a conversion.",
      },
    ],
  },
  {
    id: "B2",
    name: "Supercritical water gasifier with red mud bed",
    symbol: "tubular-reactor",
    conditions: {
      temperature: { min: 600, max: 650, unit: "°C", status: "placeholder", note: "Set by the Section 3 severity study." },
      pressure: { min: 25, max: 25, unit: "MPa", status: "placeholder", note: "Set by the Section 3 severity study." },
      summary: "600–650 °C, 25 MPa (placeholder)",
    },
    diagram: { col: 1, row: 0 },
    needsValidation: true,
    function: [
      "Biomass gasifies to CH₄, CO₂ and H₂. Red mud plays three roles simultaneously, and the page is honest that they are not equally well supported.",
      "Concurrently the reactor dealkalizes the red mud — the same pass that gasifies the biomass begins the residue treatment that B3 completes.",
    ],
    roles: [
      {
        title: "Redox mediator",
        support: "requires-qualification",
        body: "Red mud is an established chemical-looping oxygen carrier (Fe₂O₃ typically >40 wt%), but that literature is atmospheric-pressure, high-temperature and dry. In supercritical water the oxidant is already present in vast excess, so lattice oxygen donation mediates the redox chemistry rather than supplying an oxygen deficit. Flagged as requiring qualification.",
      },
      {
        title: "Gasification catalyst",
        support: "best-supported",
        body: "The best-supported role. Red mud addition gives H₂ yields comparable to commercial alkali catalysts; a Ni–Cu bimetallic on a red mud support reached 21.88 mmol/g H₂, 6.7× unpromoted Ni. Direct precedent exists in co-gasification of spirit-based distillers' grains with sewage sludge over red mud.",
      },
      {
        title: "Alkali reservoir and tar cracker",
        support: "supported",
        body: "Real but self-limiting, because the alkali dissolves then precipitates. The tar-cracking benefit is genuine but decays as sodium leaves the solid.",
      },
    ],
    inlet: [
      { tag: "4", name: "Pressurised feed slurry", phase: "slurry", components: "Biomass + red mud, 25 MPa" },
    ],
    outlet: [
      { tag: "5", name: "Supercritical effluent", phase: "supercritical", components: "CH₄ + CO₂ + H₂ (CO ≈ 0), reduced Fe phases, precipitating Na/K salts → B3" },
    ],
    metrics: [
      {
        label: "Carbon gasification efficiency",
        definition: "Fraction of feed carbon converted to gas-phase carbon.",
        value: { value: 0, unit: "%", status: "placeholder", note: "Awaiting balance closure." },
      },
      {
        label: "H₂ anchor (Ni–Cu on red mud)",
        definition: "Reported H₂ yield for a Ni–Cu bimetallic on a red mud support — literature anchor, not this feed.",
        value: { value: 21.88, unit: "mmol/g", status: "literature", source: "NiCu-RM" },
      },
    ],
    contextValues: [
      { label: "CLE reference — gas yield", value: { value: 1.02, unit: "Nm³/kg", status: "literature", source: "CLE-dry" } },
      { label: "CLE reference — LHV", value: { value: 12.06, unit: "MJ/Nm³", status: "literature", source: "CLE-dry" } },
      { label: "CLE reference — cold gas efficiency", value: { value: 91.49, unit: "%", status: "literature", source: "CLE-dry" } },
      { label: "CLE reference — carbon conversion", value: { value: 82.65, unit: "%", status: "literature", source: "CLE-dry" } },
    ],
    flags: [
      {
        kind: "needs-validation",
        title: "Needs validation",
        body: "The three red-mud roles are not equally supported, and the redox role rests on dry, atmospheric literature applied to a wet, high-pressure medium.",
      },
      {
        kind: "note",
        title: "Reference values are not this process",
        body: "The chemical-looping figures (1.02 Nm³/kg, 12.06 MJ/Nm³, 91.49% CGE, 82.65% carbon conversion) are dry-process context only, clearly labelled as not-this-process.",
      },
    ],
  },
  {
    id: "B3",
    name: "Salt separator — a purposeful product unit",
    symbol: "cyclone",
    conditions: {
      summary: "Supercritical; cooled-wall or cyclonic",
    },
    diagram: { col: 2, row: 0 },
    needsValidation: true,
    function: [
      "Inorganic salt solubility collapses above the critical point, and salt deposition is the dominant plugging and corrosion failure mode of continuous supercritical water systems.",
      "Design decision: this block is a primary product unit, not a protective device. Sodium removal is deliberate and metered, because supercritical water treatment of red mud gives enhanced dealkalization and detoxifies the residue for sale. The salt load is intentionally large, and red mud dosing is co-determined by this separator's duty rather than by catalytic requirement alone.",
      "Two duties: dealkalization of the residue, and recovery of Na/K/P as a fertilizer-precursor brine. Sulfur partitions partly into the same brine as sulfide and sulfate — this is why the fertilizer product is N-K-P-S — but that is an incidental credit against the downstream acid gas removal duty, not a designed removal step, and B5 is sized without relying on it.",
    ],
    inlet: [
      { tag: "5", name: "Supercritical effluent", phase: "supercritical", components: "Gas + reduced Fe phases + dissolved/precipitating salts" },
    ],
    outlet: [
      { tag: "6", name: "Product gas", phase: "supercritical", components: "CH₄ + CO₂ + H₂ → B4" },
      { tag: "7", name: "N-K-P-S brine", phase: "liquid", components: "Na/K/P salts, partial sulfide/sulfate" },
      { tag: "8", name: "Dealkalized solid", phase: "solid", components: "Detoxified red mud → B4" },
    ],
    metrics: [
      {
        label: "Sodium removal fraction",
        definition: "Fraction of sodium removed from the solid residue into the brine.",
        value: { value: 0, unit: "%", status: "placeholder", note: "Load-bearing and unvalidated at biomass-gasification residence times." },
      },
      {
        label: "Brine concentration",
        definition: "Total dissolved salt concentration of the recovered brine.",
        value: { value: 0, unit: "wt%", status: "placeholder" },
      },
    ],
    flags: [
      {
        kind: "decision",
        title: "Decision: product unit, not protection",
        body: "B3 is sized as a primary product unit. Red mud dosing is co-determined by its dealkalization/brine duty, not by catalytic requirement alone.",
      },
      {
        kind: "needs-validation",
        title: "Needs validation — the load-bearing claim",
        body: "B3 remains the load-bearing claim of the concept and is unvalidated at biomass-gasification residence times.",
      },
    ],
  },
  {
    id: "B4",
    name: "Depressurization, phase separation, aqueous polishing",
    symbol: "flash-drum",
    conditions: {
      pressure: { min: 3, max: 25, unit: "MPa", status: "placeholder", note: "Let-down from reactor pressure to ~3 MPa." },
      summary: "25 MPa → ~3 MPa",
    },
    diagram: { col: 3, row: 0 },
    needsValidation: false,
    function: [
      "Gas/liquid/solid split across a let-down valve and flash drum. The ammonia-bearing aqueous phase goes to nitrogen recovery; spent red mud goes to B8.",
    ],
    inlet: [
      { tag: "6", name: "Product gas", phase: "supercritical", components: "CH₄ + CO₂ + H₂, ~25 MPa" },
      { tag: "8", name: "Dealkalized solid", phase: "solid", components: "Detoxified red mud" },
    ],
    outlet: [
      { tag: "9", name: "Raw syngas", phase: "gas", components: "CH₄ + CO₂ + H₂ + H₂S/COS → B5", quantity: { value: 3, unit: "MPa", status: "placeholder" } },
      { tag: "10", name: "Ammonia-bearing aqueous", phase: "liquid", components: "NH₃, dissolved organics → N recovery" },
      { tag: "11", name: "Spent red mud", phase: "solid", components: "Reduced Fe phases → B8" },
    ],
    metrics: [
      {
        label: "Separation efficiency (per phase)",
        definition: "Recovery of each phase (gas / liquid / solid) into its designated outlet.",
        value: { value: 0, unit: "%", status: "placeholder" },
      },
    ],
  },
  {
    id: "B5",
    name: "Acid gas removal (Rectisol) and ZnO guard",
    symbol: "absorber-pair",
    conditions: {
      temperature: { min: -60, max: -30, unit: "°C", status: "literature", source: "Rectisol" },
      pressure: { min: 3, max: 3, unit: "MPa", status: "placeholder" },
      summary: "−30 to −60 °C, ~3 MPa",
    },
    diagram: { col: 4, row: 0 },
    needsValidation: false,
    function: [
      "Two findings drive this block. First, the negative finding, because it is counterintuitive: in-bed calcium capture does not work in supercritical water. The hydrolysis CaS + 2H₂O ⇌ Ca(OH)₂ + H₂S is well established and is used deliberately as a CaS stabilization route; a supercritical water gasifier is close to an ideal reactor for running it. Lime dosed into B2 would capture sulfur and release it again. Moving calcium downstream into dry warm gas would function, but imports a consumable, creates a spent-sorbent disposal stream, and competes with HCl for capacity across the whole sorbent life cycle.",
      "Second, the decision: calcium has been removed from the flowsheet entirely and replaced with a commercially proven acid gas wash. This is deliberately the least novel block in the flowsheet — the one place the design buys a vendor guarantee instead of inventing something.",
      "Terminology note: \"wet desulfurization\" normally denotes limestone–gypsum wet flue gas desulfurization, which is an oxidising post-combustion SO₂ technology. The stream leaving B4 is a reducing syngas carrying H₂S and COS, so the correct standard analogues are the wet acid gas removal processes used in gasification and coal-to-chemicals practice — physical solvent or amine absorption — not WFGD.",
    ],
    roles: [
      {
        title: "S0 — aqueous credit",
        support: "supported",
        body: "Sulfide/sulfate leaving in the B3 brine. Physics, not a mechanism. Reduces the B5 duty; B5 is sized without it.",
      },
      {
        title: "S1 — primary wash: Rectisol chilled-methanol",
        support: "best-supported",
        body: "Purifies syngas to 0.1 ppm total sulfur including COS — exactly the OXZEO specification, in one guaranteed unit. COS matters specifically here: protein-derived sulfur in a CO₂-rich gas forms carbonyl sulfide, which amines handle poorly and Rectisol handles well. The decisive integration argument: this flowsheet needs CO₂ control independently of sulfur, since OXZEO co-produces CO₂ and B6 needs a metered CO₂ feed. Rectisol does acid gas removal and CO₂ separation in the same unit, collapsing two problems into one. At a 0.1 ppm H₂S target, reported CO₂ efficiency ranks Rectisol > Selexol > MDEA > sulfolane-MDEA. It is the incumbent technology in Chinese coal-to-chemicals.",
      },
      {
        title: "S1-alt — selective MDEA",
        support: "supported",
        body: "Near-ambient. A tertiary amine, fast with H₂S and slow with CO₂, reaching under 20 ppmv H₂S. Far cheaper, no refrigeration or methanol inventory — but misses the OXZEO spec alone, handles COS poorly, and gives no CO₂ control. Presented as a live technoeconomic alternative, not a rejected option.",
      },
      {
        title: "S2 — ZnO guard",
        support: "best-supported",
        body: "Non-regenerable, immediately upstream of B6/B7. Cheap insurance with Rectisol; mandatory with MDEA.",
      },
      {
        title: "S3 — sulfur recovery by liquid redox (LO-CAT type), not Claus",
        support: "supported",
        body: "Claus wants acid gas at 10–13 vol% H₂S or above; this sulfur load will very likely fall short. Liquid redox suits small duties and yields saleable elemental sulfur rather than a disposal problem.",
      },
    ],
    inlet: [
      { tag: "9", name: "Raw syngas", phase: "gas", components: "CH₄ + CO₂ + H₂ + H₂S/COS" },
    ],
    outlet: [
      { tag: "12", name: "Clean syngas", phase: "gas", components: "CH₄ + H₂ + metered CO₂, ≤0.1 ppm S → B6", quantity: { value: 0.1, unit: "ppm S", status: "literature", source: "Rectisol" } },
      { tag: "13", name: "CO₂ (separated)", phase: "gas", components: "Separated CO₂ → B6 feed (recycle / vent split)" },
      { tag: "14", name: "Elemental sulfur", phase: "solid", components: "From S3 liquid-redox recovery" },
    ],
    metrics: [
      {
        label: "Total sulfur at outlet",
        definition: "Total sulfur (incl. COS) in the cleaned syngas; target set by the OXZEO catalyst.",
        value: { value: 0.1, unit: "ppm", status: "literature", source: "Rectisol" },
      },
      {
        label: "CO₂ split (recycle vs vent)",
        definition: "Fraction of separated CO₂ routed to B6 as dry-reforming oxidant versus vented.",
        value: { value: 0, unit: "%", status: "placeholder" },
      },
    ],
    flags: [
      {
        kind: "decision",
        title: "Decision: calcium removed, Rectisol in",
        body: "In-bed calcium capture fails in supercritical water (CaS hydrolysis). Calcium is removed from the flowsheet and replaced with a commercially proven acid gas wash — the least novel block by design.",
      },
      {
        kind: "warning",
        title: "Terminology: not WFGD",
        body: "This is a reducing syngas with H₂S/COS. Do not call it 'wet desulfurization' — WFGD is oxidising post-combustion SO₂ control. The analogues are physical-solvent / amine acid gas removal.",
      },
      {
        kind: "note",
        title: "The cost of the decision",
        body: "Rectisol is capital-intensive, cryogenic, and brings methanol inventory into a plant that otherwise has none — likely the largest CAPEX item after the hydrothermal island.",
      },
    ],
  },
  {
    id: "B6",
    name: "Bi-reformer",
    symbol: "fired-reformer",
    conditions: {
      temperature: { min: 800, max: 900, unit: "°C", status: "placeholder" },
      pressure: { min: 1, max: 3, unit: "MPa", status: "placeholder" },
      summary: "800–900 °C, 1–3 MPa (placeholder)",
    },
    diagram: { col: 5, row: 0 },
    needsValidation: true,
    function: [
      "Supercritical water gasification produces essentially no CO — water-gas shift equilibrium in a medium that is overwhelmingly water sits hard on the product side. OXZEO consumes CO. The two blocks are chemically incompatible as directly coupled units, and this block exists to resolve that.",
      "Dry reforming alone (CH₄ + CO₂ → 2CO + 2H₂) gives H₂/CO ≈ 1, below the ratio the cited OXZEO systems run at; bi-reforming combines dry and steam reforming in one stage and delivers the target ratio without a separate adjustment step. Steam is free from the hydrothermal island, and steam co-feed is the principal coking mitigation, coking being the dominant Ni deactivation mode.",
    ],
    inlet: [
      { tag: "12", name: "Clean syngas", phase: "gas", components: "CH₄ + H₂" },
      { tag: "13", name: "CO₂ (from B5)", phase: "gas", components: "Dry-reforming oxidant" },
      { tag: "16", name: "CO₂-rich recycle (from B7)", phase: "gas", components: "OXZEO co-product CO₂" },
      { tag: "17", name: "Steam", phase: "gas", components: "Free from hydrothermal island; coking mitigation" },
    ],
    outlet: [
      { tag: "15", name: "Reformed syngas", phase: "gas", components: "CO + H₂ at OXZEO target ratio → B7" },
    ],
    duty: {
      label: "Reforming duty",
      signConvention: "positive = heat input (strongly endothermic)",
      value: { value: 0, unit: "MW", status: "placeholder", note: "Endothermic; 200–300 °C hotter than B2." },
    },
    metrics: [
      {
        label: "CH₄ conversion",
        definition: "Fraction of inlet methane converted in the reformer.",
        value: { value: 0, unit: "%", status: "placeholder" },
      },
      {
        label: "Outlet H₂/CO",
        definition: "Molar hydrogen-to-carbon-monoxide ratio delivered to B7.",
        value: { value: 0, unit: "mol/mol", status: "placeholder" },
      },
    ],
    flags: [
      {
        kind: "needs-validation",
        title: "Needs validation",
        body: "The reformer resolves the CO deficit, but its duty, ratio and coking behaviour on this specific gas are unquantified.",
      },
      {
        kind: "warning",
        title: "The energy objection, stated plainly",
        body: "Methanation in B2 is exothermic; reforming here is strongly endothermic and 200–300 °C hotter. The flowsheet spends energy making methane and more energy unmaking it. Heat integration limits how much of that round trip shows up as fuel; it does not remove it.",
      },
      {
        kind: "decision",
        title: "Decision: bi-reforming is the design basis",
        body: "The alternative — operating B2 hotter and shorter with a low-methanation bed so the downstream duty collapses to reverse water-gas shift — is evaluated and rejected: higher-severity hydrothermal service worsens every materials problem; salt precipitation becomes more aggressive, attacking the B3 block the concept depends on; and the case rests on a kinetic assumption with no supporting result in the red mud literature. The diagram shows one committed architecture — no dashed alternative path.",
      },
    ],
  },
  {
    id: "B7",
    name: "OXZEO olefin synthesis",
    symbol: "fixed-bed",
    conditions: {
      temperature: { min: 400, max: 400, unit: "°C", status: "literature", source: "OXZEO-1" },
      pressure: { min: 2.5, max: 4, unit: "MPa", status: "literature", source: "OXZEO-2" },
      summary: "~400 °C, 2.5–4 MPa",
    },
    diagram: { col: 6, row: 0 },
    needsValidation: false,
    function: [
      "Oxide–zeolite bifunctional conversion of syngas to C₂–C₄ olefins, exceeding the Anderson–Schulz–Flory selectivity limit. Unconverted syngas is recycled.",
      "Be honest about CO₂: the route co-produces substantial CO₂ via the CO-mediated pathway, and a published Comment in ACS Catalysis (2023) disputes 'low CO₂ emission' claims for direct syngas-to-olefins. In a standalone plant that CO₂ is a liability; here it recycles to B6 as dry-reforming oxidant. That integration is a genuine argument for this configuration — the recycle loop is shown prominently in the diagram.",
    ],
    inlet: [
      { tag: "15", name: "Reformed syngas", phase: "gas", components: "CO + H₂ at target ratio" },
      { tag: "18", name: "Recycled syngas", phase: "gas", components: "Unconverted CO + H₂" },
    ],
    outlet: [
      { tag: "19", name: "C₂–C₄ olefins", phase: "gas", components: "Light olefins → product slate" },
      { tag: "16", name: "CO₂-rich recycle", phase: "gas", components: "OXZEO co-product CO₂ → B6" },
      { tag: "18", name: "Unconverted syngas", phase: "gas", components: "CO + H₂ → recycle" },
    ],
    metrics: [
      {
        label: "Per-pass CO conversion",
        definition: "CO converted per pass through the reactor.",
        value: { value: 0, unit: "%", status: "placeholder", note: "Literature anchors: 17% (OXZEO-1), 64% (OXZEO-2)." },
      },
      {
        label: "Light-olefin selectivity",
        definition: "C₂–C₄ olefin selectivity among hydrocarbons.",
        value: { value: 80, unit: "%", status: "literature", source: "OXZEO-1" },
      },
      {
        label: "C₂/C₃ ratio",
        definition: "Ethylene-to-propylene molar ratio in the olefin product.",
        value: { value: 0, unit: "mol/mol", status: "placeholder" },
      },
    ],
    contextValues: [
      { label: "ZnCrOₓ–SAPO-34 CO conversion", value: { value: 17, unit: "%", status: "literature", source: "OXZEO-1" } },
      { label: "ZnCr₂O₄@ZnOₓ CO conversion", value: { value: 64, unit: "%", status: "literature", source: "OXZEO-2" } },
      { label: "ZnCr₂O₄@ZnOₓ light-olefin selectivity", value: { value: 75, unit: "%", status: "literature", source: "OXZEO-2" } },
    ],
    flags: [
      {
        kind: "note",
        title: "CO₂ honesty",
        body: "The CO-mediated pathway co-produces substantial CO₂ (disputed 'low-CO₂' claims, ACS Catalysis 2023). Here it is not vented — it recycles to B6, which is the integration argument for this configuration.",
      },
    ],
  },
  {
    id: "B8",
    name: "Red mud regeneration and residue valorization",
    symbol: "regenerator",
    conditions: {
      summary: "Air oxidation, then hydrometallurgy",
    },
    diagram: { col: 7, row: 0 },
    needsValidation: false,
    function: [
      "Reduced iron phases are re-oxidised with heat recovery; a bleed stream leaves as product.",
      "Note the synergy: B2 has already partially reduced Fe₂O₃ → Fe₃O₄/FeO using biomass-derived reductant, so the residue arrives at any ironmaking step pre-reduced at no marginal cost.",
    ],
    inlet: [
      { tag: "11", name: "Spent red mud", phase: "solid", components: "Reduced Fe phases (Fe₃O₄/FeO)" },
      { tag: "20", name: "Air", phase: "gas", components: "Oxidant for re-oxidation" },
    ],
    outlet: [
      { tag: "21", name: "Regenerated bed", phase: "solid", components: "Re-oxidised red mud → recycle to B1" },
      { tag: "22", name: "Residue bleed", phase: "solid", components: "Dealkalized residue → product slate (Tiers 1–3)" },
    ],
    duty: {
      label: "Oxidation heat recovery",
      signConvention: "negative = heat released (exothermic re-oxidation, recovered)",
      value: { value: 0, unit: "MW", status: "placeholder" },
    },
    metrics: [
      {
        label: "Iron re-oxidation extent",
        definition: "Fraction of reduced iron phases re-oxidised per cycle.",
        value: { value: 0, unit: "%", status: "placeholder" },
      },
      {
        label: "Bleed fraction",
        definition: "Fraction of the circulating residue leaving as product per cycle.",
        value: { value: 0, unit: "%", status: "placeholder" },
      },
      {
        label: "Cycles to attrition failure",
        definition: "Number of redox cycles before mechanical attrition retires the bed.",
        value: { value: 0, unit: "cycles", status: "placeholder" },
      },
    ],
    flags: [
      {
        kind: "note",
        title: "Pre-reduction synergy",
        body: "B2 has already partially reduced Fe₂O₃ using biomass-derived reductant, so residue destined for ironmaking arrives pre-reduced at no marginal cost.",
      },
    ],
  },
];
