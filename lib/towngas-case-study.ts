/**
 * Source-backed content for the redesigned Towngas engineering case study.
 *
 * Numerical content comes from
 * `Towngas_SCWG_OXZEO_Process_Design_FEED_Final_RMB_China.docx` (3 August
 * 2026), as extracted to `/tmp/towngas-report.txt`. The provenance label on
 * every quantitative record is intentional: this is a screening/pre-FEED
 * design, not a vendor guarantee or an investment-grade FEED package.
 */

export type TowngasEvidenceBasis =
  | "calculated result"
  | "published evidence"
  | "design basis"
  | "screening assumption"
  | "requires pilot validation"
  | "owner-supplied benchmark"
  | "official source"
  | "base-case exclusion";

export type TowngasSourcedValue = {
  readonly label: string;
  readonly value: number;
  readonly unit: string;
  readonly display?: string;
  readonly basis: TowngasEvidenceBasis;
  readonly source: string;
  readonly note?: string;
};

export type TowngasDesignMetric = TowngasSourcedValue & {
  readonly id: string;
};

export type TowngasFeedstock = {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly amount: TowngasSourcedValue;
  readonly characteristics: readonly string[];
  readonly sitingOrControlNote: string;
  readonly basis: TowngasEvidenceBasis;
  readonly source: string;
};

export type TowngasFeedAcceptanceItem = {
  readonly property: string;
  readonly acceptance: string;
  readonly response: string;
  readonly basis: TowngasEvidenceBasis;
  readonly source: string;
};

export type TowngasProcessStageId =
  | "B1"
  | "B2"
  | "B3"
  | "B4"
  | "B5"
  | "B6"
  | "B7"
  | "B8"
  | "R1";

export type TowngasStageCondition = {
  readonly label: string;
  readonly value: string;
  readonly basis: TowngasEvidenceBasis;
  readonly source: string;
};

export type TowngasProcessStage = {
  readonly id: TowngasProcessStageId;
  readonly order: number;
  readonly name: string;
  readonly purpose: string;
  readonly mechanism: string;
  readonly conditions: readonly TowngasStageCondition[];
  readonly equipment: readonly string[];
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly risk: string;
  readonly validation: string;
  readonly source: string;
};

export type TowngasBalanceRow = {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly unit: "t/day" | "t C/day";
  readonly sharePct?: number;
  readonly note?: string;
  readonly basis: TowngasEvidenceBasis;
  readonly source: string;
};

export type TowngasCostRow = {
  readonly id: string;
  readonly label: string;
  readonly valueRmbMillion: number;
  readonly sharePct?: number;
  readonly basis: TowngasEvidenceBasis;
  readonly source: string;
  readonly note?: string;
};

export type TowngasComparator = {
  readonly id: string;
  readonly name: string;
  readonly investmentRmbBillion: number;
  readonly capacityKtPerYear: number;
  readonly product: string;
  readonly year?: number;
  readonly basis: TowngasEvidenceBasis;
  readonly use: string;
  readonly source: string;
  readonly referenceId?: string;
};

export type TowngasReference = {
  readonly id: string;
  readonly title: string;
  readonly authorsOrPublisher: string;
  readonly year: number;
  readonly kind: "paper" | "standard" | "policy" | "price" | "wage" | "utility" | "capital comparator";
  readonly url: string;
};

export const towngasEvidenceLegend = [
  {
    basis: "calculated result",
    description: "Arithmetic reconciled from the stated design basis; not measured plant performance.",
  },
  {
    basis: "published evidence",
    description: "A literature result or physical property used as context, not a guarantee for this feed blend.",
  },
  {
    basis: "design basis",
    description: "A selected configuration or operating target that defines the screening model.",
  },
  {
    basis: "screening assumption",
    description: "An unquoted input used to close the model; it must be retired by testing, contracting, or vendor quotation.",
  },
  {
    basis: "requires pilot validation",
    description: "A target that cannot be presented as achieved until the named validation campaign passes.",
  },
  {
    basis: "owner-supplied benchmark",
    description: "A comparison supplied by the owner; scope and date still require confirmation.",
  },
  {
    basis: "official source",
    description: "A figure or rule taken from the cited public authority.",
  },
  {
    basis: "base-case exclusion",
    description: "No value is credited in the base economics without qualification, certification, or a contract.",
  },
] as const satisfies readonly {
  readonly basis: TowngasEvidenceBasis;
  readonly description: string;
}[];

export const towngasCaseStudyMeta = {
  eyebrow: "Towngas · screening / pre-FEED process design",
  title: "Co-processing wet soybean waste and bauxite residue",
  subtitle:
    "Supercritical water gasification, purposeful salt recovery, bi-reforming, and OXZEO light-olefin synthesis",
  summary:
    "An integrated screening/pre-FEED design for converting wet soybean-processing waste and bauxite residue into purified syngas, light olefins, recovered salts, and conditioned mineral products. The study closes one-train mass, carbon, and screening energy balances and tests the concept against China-specific RMB economics without hiding the negative base case.",
  status: "Screening/pre-FEED process design — not a completed commercial FEED package",
  reportDate: "3 August 2026",
  reportDownloads: {
    docx: "/downloads/Towngas_SCWG_OXZEO_Process_Design_FEED_Final_RMB_China.docx",
    pdf: "/downloads/Towngas_SCWG_OXZEO_Process_Design_FEED_Final_RMB_China.pdf",
  },
  processAnchor: "#process-design",
} as const;

export const towngasTechnologyLabels = [
  "Supercritical water gasification",
  "Bauxite residue",
  "Wet biomass",
  "Bi-reforming",
  "OXZEO",
  "Circular chemicals",
] as const;

export const towngasDesignMetrics = [
  {
    id: "hydrothermal-trains",
    label: "Modular hydrothermal trains",
    value: 5,
    unit: "trains",
    basis: "design basis",
    source: "Final report §4.1, Table 4.1",
    note: "Scale-out limits the common-mode consequence of salt plugging.",
  },
  {
    id: "slurry-per-train",
    label: "Slurry per train",
    value: 300,
    unit: "t/day",
    basis: "design basis",
    source: "Final report §4.1, Table 4.1",
  },
  {
    id: "combined-slurry",
    label: "Combined slurry throughput",
    value: 1500,
    unit: "t/day",
    display: "1,500",
    basis: "calculated result",
    source: "Final report §4.1, Table 4.1",
  },
  {
    id: "annual-slurry",
    label: "Annual slurry processed",
    value: 499500,
    unit: "t/year",
    display: "499,500",
    basis: "calculated result",
    source: "Final report §5.1, Table 5.1",
    note: "Five trains operating 333 days/year.",
  },
  {
    id: "total-solids",
    label: "Total slurry solids",
    value: 19.07,
    unit: "wt%",
    display: "≈19.1",
    basis: "calculated result",
    source: "Final report Appendix A, Table A.1",
    note: "Conditional on a full-scale pump-loop test.",
  },
  {
    id: "light-olefins",
    label: "Central light-olefin production",
    value: 19.33,
    unit: "kt/year",
    display: "≈19.33",
    basis: "screening assumption",
    source: "Final report §4.1 and §5.3",
    note: "Depends on assumed SCWG conversion and OXZEO performance; not a pilot result.",
  },
  {
    id: "scwg-temperature",
    label: "SCWG temperature",
    value: 625,
    unit: "°C",
    display: "≈625",
    basis: "requires pilot validation",
    source: "Final report §4.1, Table 4.1; assumption A04",
  },
  {
    id: "scwg-pressure",
    label: "SCWG pressure",
    value: 25,
    unit: "MPa",
    basis: "requires pilot validation",
    source: "Final report §4.1, Table 4.1; assumption A04",
  },
  {
    id: "operating-period",
    label: "Economic operating period",
    value: 20,
    unit: "years",
    basis: "design basis",
    source: "Final report §9.7 and Appendix B",
  },
] as const satisfies readonly TowngasDesignMetric[];

export const towngasEngineeringProposition = {
  summary:
    "The gasifier is designed to do two jobs in one pressure boundary: convert hydrated biomass and begin dealkalizing an iron-rich mineral residue.",
  arguments: [
    {
      id: "okara-water",
      challenge: "Wet okara is expensive to dry and spoils quickly.",
      evidence: "Published okara composition is approximately 80–85 wt% water; the report uses 82.8 wt% moisture for the balance.",
      proposal:
        "Use supercritical water as the reaction medium so feed moisture becomes process inventory rather than a drying load.",
      consequence:
        "Wet okara governs siting and collection radius, while its hydrated fibre helps carry milled straw through the high-pressure feed system.",
      basis: "published evidence",
      source: "Final report §1.1; Li, Qiao & Lu (2012)",
    },
    {
      id: "red-mud-alkalinity",
      challenge: "Bauxite residue is alkaline, iron-rich, and difficult to qualify for reuse.",
      evidence:
        "The report cites typical Fe₂O₃ of 30–60 wt%, Na₂O of 2–10 wt%, and leachate pH of 12.1–13.0; actual supply must be assayed.",
      proposal:
        "Use the iron phases as a redox mediator and the residual alkalinity for tar cracking while deliberately transferring sodium into B3 concentrate.",
      consequence:
        "Catalytic contribution and residue dealkalization become coupled, so red-mud dose is governed by both reactor chemistry and product qualification.",
      basis: "published evidence",
      source: "Final report §1.4; Wang & Liu (2012)",
    },
    {
      id: "co-processing",
      challenge: "The useful alkalinity is also the chemistry most likely to precipitate and plug a supercritical-water system.",
      evidence:
        "Salt precipitation is the best-documented continuous-operability risk in supercritical-water service.",
      proposal:
        "Treat B3 as a deliberate dealkalization and salt-product operation, rather than as passive reactor protection.",
      consequence:
        "The concept succeeds only if continuous salt withdrawal, stable pressure drop, and qualified residue can be demonstrated together.",
      basis: "published evidence",
      source: "Final report §2.3; Marrone et al. (2004); Schubert et al. (2010)",
    },
  ],
  technicalDetail:
    "The report conservatively treats red mud as a redox relay and catalytic mineral bed. B8 oxidation is not credited with restoring a stoichiometric oxygen-carrier capacity until phase and equilibrium evidence exists.",
} as const;

export const towngasFeedstocks = [
  {
    id: "wet-okara",
    name: "Wet okara",
    role: "Hydrated organic feed and slurry carrier",
    amount: {
      label: "One-train feed",
      value: 250,
      unit: "t/day",
      basis: "design basis",
      source: "Final report §5.1, Table 5.1",
    },
    characteristics: [
      "82.8 wt% water on the balance basis; supplier moisture must be measured.",
      "Fine hydrated fibre can aid pumpability, but spoilage and variable protein, ash, sulfur, and chloride require batch control.",
      "Provides 43.0 t/day dry solids and 207.0 t/day water on the one-train basis.",
    ],
    sitingOrControlNote:
      "Wet okara governs siting because it contains substantial water, spoils within days, and is costly to aggregate from fragmented producers.",
    basis: "screening assumption",
    source: "Final report §1.1 and §5.1",
  },
  {
    id: "soybean-straw",
    name: "Soybean straw",
    role: "Dry-solids and carbon-density partner",
    amount: {
      label: "One-train feed",
      value: 8,
      unit: "t/day",
      basis: "design basis",
      source: "Final report §5.1, Table 5.1",
    },
    characteristics: [
      "The balance assumes 7.2 t/day dry solids and 0.8 t/day water.",
      "Milled below 0.5 mm on the screening acceptance basis.",
      "Adds potassium- and silica-bearing ash and competes with red mud for the solids-loading headroom.",
    ],
    sitingOrControlNote:
      "Retained as the design-basis co-feed because it shares the soybean supply chain and adds no unusual contaminant burden.",
    basis: "screening assumption",
    source: "Final report §1.2, §1.8 and §5.1",
  },
  {
    id: "fresh-red-mud",
    name: "Fresh bauxite residue",
    role: "Iron-rich catalytic mineral feed and dealkalization target",
    amount: {
      label: "One-train fresh feed",
      value: 7,
      unit: "t/day",
      basis: "design basis",
      source: "Final report §5.1, Table 5.1",
    },
    characteristics: [
      "Alkalinity promotes tar cracking and water-gas shift but creates the B3 salt load.",
      "Actual Fe, Na, Cl, Ti, Si, trace-metal, phase, leach, and particle-size data are required.",
      "Dense mineral feed can tolerate a longer transport radius than wet okara.",
    ],
    sitingOrControlNote:
      "The Guangxi–Guangdong corridor is the shortest credible pairing identified in the siting screen; it is not a final site selection.",
    basis: "requires pilot validation",
    source: "Final report §1.4, §1.9 and §5.1",
  },
  {
    id: "recycled-red-mud",
    name: "Conditioned red-mud recycle (R1)",
    role: "Controlled solids inventory returned from B8 to B1",
    amount: {
      label: "Central internal recycle",
      value: 28,
      unit: "t/day",
      basis: "screening assumption",
      source: "Final report §5.7, Table 5.7",
      note: "Internal equipment-sizing flow at a 20% purge; it is not additional battery-limit feed.",
    },
    characteristics: [
      "Re-slurried and re-pressurised with fresh residue at B1.",
      "Recycle is limited by Na, Cl, trace metals, silica, surface loss, attrition, and catalytic performance.",
      "Progressive dealkalization may improve product quality while reducing catalytic alkalinity.",
    ],
    sitingOrControlNote:
      "The purge is controlled for inventory and product quality; recycle is not maximised.",
    basis: "screening assumption",
    source: "Final report §4.9 and §5.7",
  },
  {
    id: "slurry-water",
    name: "Make-up or recycled slurry water",
    role: "Solids adjustment and hydrothermal reaction medium",
    amount: {
      label: "One-train adjustment",
      value: 35,
      unit: "t/day",
      basis: "design basis",
      source: "Final report §5.1, Table 5.1",
    },
    characteristics: [
      "Adjusted to maintain the pumpable solids envelope.",
      "Recycle acceptance is governed by chloride and refractory total organic carbon, not a fixed return percentage.",
    ],
    sitingOrControlNote:
      "Dilution buys pumpability headroom but adds sensible-heating duty, so water adjustment is an operating trade rather than a free fix.",
    basis: "screening assumption",
    source: "Final report §1.6, §4.5 and §5.1",
  },
] as const satisfies readonly TowngasFeedstock[];

export const towngasCompatibleCoFeeds = [
  {
    id: "soybean-straw",
    name: "Soybean straw",
    verdict: "Design basis",
    caseFor: "Same supply chain, complementary carbon-to-nitrogen ratio, and no unusual contaminant burden.",
    constraint: "Competes directly with red mud for the slurry-solids headroom.",
  },
  {
    id: "pig-manure",
    name: "Pig manure",
    verdict: "Evaluate first",
    caseFor: "Demonstrated SCWG feed that could add nitrogen, potassium, and phosphorus to the recovered concentrate.",
    constraint: "Copper and zinc from feed additives can report to the mineral residue; published high gas yields used much more dilute feeds.",
  },
  {
    id: "food-waste",
    name: "Food waste",
    verdict: "Caution",
    caseFor: "Wet, energy-dense, and available near cities.",
    constraint: "Cooking salt can raise chloride loading in an already severe corrosion environment.",
  },
  {
    id: "sewage-sludge",
    name: "Sewage sludge",
    verdict: "Rejected for the residue-product case",
    caseFor: "Close chemistry match and a published red-mud co-gasification precedent.",
    constraint: "Heavy metals can partition to solids and foreclose sorbent and cementitious product routes.",
  },
  {
    id: "septage",
    name: "Human faeces or septage",
    verdict: "Rejected",
    caseFor: "Technically similar to sewage sludge.",
    constraint: "Certification, fertilizer, and public-acceptance exposure conflict with the proposed product slate.",
  },
] as const;

export const towngasFeedAcceptance = [
  {
    property: "Total solids",
    acceptance: "18–22 wt%",
    response: "Measure by inline density and laboratory oven; dilute or reduce straw/red mud when outside the envelope.",
    basis: "requires pilot validation",
    source: "Final report §4.2, Table 4.2",
  },
  {
    property: "Particle size",
    acceptance: "Organic D90 <0.5 mm; mineral D90 <0.15 mm",
    response: "Verify by inline imaging and sieve analysis; reject oversize material.",
    basis: "screening assumption",
    source: "Final report §4.2, Table 4.2",
  },
  {
    property: "Rheology and settling",
    acceptance: "No hard bed after 30 minutes; stable pump-loop operation",
    response: "Trend torque and differential pressure; adjust okara or water and avoid sodium- or sulfur-bearing additives where possible.",
    basis: "requires pilot validation",
    source: "Final report §4.2, Table 4.2",
  },
  {
    property: "Chloride",
    acceptance: "Source-specific alloy limit; no universal limit is assumed",
    response: "Measure by ion chromatography, segregate the batch, and control the B4 water purge.",
    basis: "requires pilot validation",
    source: "Final report §4.2, Table 4.2",
  },
  {
    property: "Spoilage and organic acids",
    acceptance: "First-in-first-out handling, chilled contingency, daily COD and pH",
    response: "Divert, sanitise, or blend down off-specification material.",
    basis: "design basis",
    source: "Final report §4.2, Table 4.2",
  },
  {
    property: "PFAS and metals",
    acceptance: "Product-route-specific hold-and-release limit",
    response: "Hold the batch and prohibit a fertilizer campaign until analytical release.",
    basis: "requires pilot validation",
    source: "Final report §4.2, Table 4.2",
  },
] as const satisfies readonly TowngasFeedAcceptanceItem[];

export const towngasProcessStages = [
  {
    id: "B1",
    order: 1,
    name: "Feed reception, milling, slurry preparation, and pumping",
    purpose: "Prepare a traceable, homogeneous slurry and deliver it reliably to reactor pressure.",
    mechanism:
      "High-shear blending uses hydrated okara as the carrier for milled straw and separately conditioned red mud; positive-displacement pumping raises the mixed slurry to pressure.",
    conditions: [
      { label: "Discharge pressure", value: "25 MPa", basis: "design basis", source: "Final report §4.2" },
      { label: "Total solids", value: "18–22 wt%", basis: "requires pilot validation", source: "Final report Table 4.2" },
      { label: "Nominal flow per train", value: "12.5 t/hour", basis: "calculated result", source: "Final report §4.2" },
    ],
    equipment: [
      "Enclosed agitated okara receiving tanks",
      "Magnetic cleaning and straw mill",
      "Loss-in-weight feeder and high-shear blending loop",
      "Separate red-mud slurry system and final surge tank",
      "Duty/standby positive-displacement pumps and feed–effluent exchanger",
    ],
    inputs: ["Wet okara", "Milled soybean straw", "Fresh red mud", "R1 conditioned residue", "Make-up/recycle water"],
    outputs: ["Traceable high-pressure slurry to B2"],
    risk: "Fibrous bridging, mineral settling, pump cavitation, erosion, and feed-heater pressure-drop growth.",
    validation: "A 24-hour cold loop followed by a hot feed-heater test; weight-percent solids alone is not acceptance evidence.",
    source: "Final report §4.2 and Table 4.2",
  },
  {
    id: "B2",
    order: 2,
    name: "Supercritical water gasification",
    purpose: "Convert biomass carbon while exposing bauxite residue to hydrothermal dealkalization chemistry.",
    mechanism:
      "Water above its critical region supports rapid hydrolysis and gasification toward methane, carbon dioxide, and hydrogen. Red-mud iron phases are treated as a redox relay; residual alkali promotes tar cracking but is progressively removed.",
    conditions: [
      { label: "Temperature", value: "625 °C", basis: "requires pilot validation", source: "Final report Table 4.1; assumption A04" },
      { label: "Pressure", value: "25 MPa", basis: "requires pilot validation", source: "Final report Table 4.1; assumption A04" },
      { label: "Hot residence", value: "60 seconds", basis: "requires pilot validation", source: "Final report Table 4.1; assumption A05" },
      { label: "Gross vessel volume", value: "2.3 m³ per train", basis: "screening assumption", source: "Final report §4.3, Table 4.3" },
    ],
    equipment: [
      "Vertical externally heated reactor with replaceable nickel-alloy wetted internals",
      "Dirty-service feed–effluent heat exchanger and trim heater",
      "Water-quench and closed blowdown system",
      "Online gas chromatograph plus liquid and solids sampling",
    ],
    inputs: ["High-pressure organic/mineral slurry from B1"],
    outputs: ["Hot gas/water/salt/mineral effluent to B3"],
    risk: "Salt deposition, wall overheating, corrosion, char formation, and an unverified red-mud catalytic contribution.",
    validation: "A 30–120 second severity sweep followed by a continuous 1,000-hour campaign with full gas, aqueous, and solids carbon closure.",
    source: "Final report §4.3 and Table 4.3",
  },
  {
    id: "B3",
    order: 3,
    name: "Purposeful hot-salt separation",
    purpose: "Withdraw precipitating inorganic salts continuously while producing a controlled dealkalized residue and segregated concentrate.",
    mechanism:
      "The collapse of inorganic salt solubility in supercritical water is used deliberately. Tangential flow plus a cooled or transpiring wall directs nucleation toward a removable dense underflow rather than the pressure boundary.",
    conditions: [
      { label: "Service", value: "Supercritical, upstream of heat recovery and letdown", basis: "design basis", source: "Final report §4.4" },
      { label: "Hot inventory", value: "Approximately 8.7 m³", basis: "screening assumption", source: "Final report §4.4" },
      { label: "Separator size", value: "Approximately 10 m³ gross each", basis: "screening assumption", source: "Final report §4.4" },
    ],
    equipment: [
      "Lead/lag cooled-wall or cyclonic separators",
      "Continuous underflow cooling and wear-resistant flash pot",
      "Filtration, product tank, quarantine tank, and online interface/density monitoring",
    ],
    inputs: ["Hot B2 effluent containing gas, water, mineral solids, and precipitating Na/K/P/S species"],
    outputs: ["Salt-depleted effluent to B4", "Segregated N-K-P-S-bearing concentrate", "Dealkalized mineral solids"],
    risk: "A salt bridge can force a reactor outage; apparent salt yield without pressure-drop recovery is not continuous operability.",
    validation: "A representative 1,000-hour underflow-and-flush campaign proving sodium recovery, wall-deposit control, and stable pressure drop together.",
    source: "Final report §4.4, §7.3 and Table 10.2",
  },
  {
    id: "B4",
    order: 4,
    name: "Heat recovery, depressurization, phase separation, and water polishing",
    purpose: "Recover sensible heat, reduce pressure safely, split gas/water/mineral phases, recover nitrogen, and manage water recycle.",
    mechanism:
      "Salt-depleted effluent heats the incoming slurry before staged letdown. Flashing and three-phase decanting separate raw gas, ammonia-bearing water, and conditioned solids; filtration and polishing control recycle quality.",
    conditions: [
      { label: "Pressure change", value: "25 MPa to approximately 3 MPa", basis: "design basis", source: "Final report §4.5" },
      { label: "Water destination", value: "230.42 t/day per train", basis: "calculated result", source: "Final report Table 5.2" },
    ],
    equipment: [
      "Dirty-service feed–effluent exchanger",
      "Staged wear-resistant pressure letdown and closed receiver",
      "High- and low-pressure flash vessels plus three-phase decanter",
      "Filtration, ammonia recovery, organic polishing, and chloride purge",
    ],
    inputs: ["Salt-depleted B3 effluent"],
    outputs: ["Raw wet gas to B5", "Polished recycle/effluent water", "Ammonia-rich stream", "Separated mineral solids to B8"],
    risk: "Flashing solids can erode letdown trims; chloride and refractory organics can accumulate silently in the recycle loop.",
    validation: "Flash/property simulation, erosion trials, water-quality campaigns, and closed chloride/TOC balances on real effluent.",
    source: "Final report §4.5",
  },
  {
    id: "B5",
    order: 5,
    name: "Rectisol acid-gas removal, ZnO guard, and sulfur recovery",
    purpose: "Remove hydrogen sulfide and carbonyl sulfide to catalyst-safe levels while separating carbon dioxide for controlled recycle or export.",
    mechanism:
      "Chilled methanol physically absorbs H₂S, COS, and CO₂. Flash regeneration separates sulfur-rich and CO₂-rich fractions; a non-regenerable ZnO bed polishes analytical breakthrough before reforming and synthesis.",
    conditions: [
      { label: "Rectisol temperature", value: "−30 to −60 °C", basis: "published evidence", source: "Final report §4.6" },
      { label: "Gas pressure", value: "Approximately 3 MPa", basis: "design basis", source: "Final report §4.6 and Table 5.6" },
      { label: "Total sulfur target", value: "Below 0.1 ppmv including COS", basis: "design basis", source: "Final report §4.6" },
    ],
    equipment: [
      "Licensed chilled-methanol absorber/regeneration package",
      "Refrigeration and methanol-recovery system",
      "Lead/lag ZnO guard beds with independent total-sulfur analysers",
      "Liquid-redox elemental-sulfur recovery",
    ],
    inputs: ["Wet raw gas from B4"],
    outputs: ["Clean methane/carbon-dioxide/hydrogen gas", "Metered CO₂ recycle/export", "Elemental sulfur", "Spent ZnO at replacement"],
    risk: "COS or H₂S breakthrough can irreversibly poison downstream catalyst; refrigeration and methanol inventory add utility and safety burdens.",
    validation: "Licensed real-gas absorber simulation, sulfur breakthrough curves, methanol carryover checks, and verified ZnO life.",
    source: "Final report §4.6 and Table 4.4",
  },
  {
    id: "B6",
    order: 6,
    name: "Combined steam and dry bi-reforming",
    purpose: "Create the carbon monoxide that hydrothermal equilibrium removes and set the hydrogen-to-carbon-monoxide ratio for OXZEO.",
    mechanism:
      "Combined dry and steam reforming follows the screening stoichiometry 3CH₄ + CO₂ + 2H₂O → 4CO + 8H₂. Steam suppresses coke while the CO₂ split trims the synthesis-gas ratio.",
    conditions: [
      { label: "Temperature", value: "Approximately 850 °C", basis: "design basis", source: "Final report §4.7 and Table 4.1" },
      { label: "Pressure", value: "Approximately 2.8 MPa", basis: "design basis", source: "Final report §4.7 and Table 4.1" },
      { label: "Heat input", value: "150 GJ/day per train equivalent", basis: "screening assumption", source: "Final report §4.7 and Table 6.1" },
    ],
    equipment: [
      "Fired tubular nickel-catalyst reformer",
      "Steam and CO₂ ratio-control system",
      "Sulfur-tolerant pre-reformer and decoking connections",
      "Waste-heat boiler and synthesis-gas compression",
    ],
    inputs: ["Clean methane-rich gas", "Metered captured CO₂", "Steam from the hydrothermal island"],
    outputs: ["CO-bearing synthesis gas at adjustable H₂/CO", "Recovered high-pressure steam"],
    risk: "Nickel-catalyst coking, tube hot spots, metal dusting, and the unavoidable energy penalty of making then reforming methane.",
    validation: "A 1,000-hour real-gas slipstream campaign closing methane conversion, carbon deposition, steam/carbon ratio, and H₂/CO control.",
    source: "Final report §4.7 and Table 10.1",
  },
  {
    id: "B7",
    order: 7,
    name: "OXZEO light-olefin synthesis and product recovery",
    purpose: "Convert clean synthesis gas into a C₂–C₄ light-olefin stream while controlling heat release, recycle, and purge.",
    mechanism:
      "A zinc-chromium oxide function activates CO and a CHA-type zeolite such as SAPO-34 confines carbon–carbon coupling. Unconverted synthesis gas recycles; water, oxygenates, CO₂, fuel gas, and olefins are separated downstream.",
    conditions: [
      { label: "Reactor temperature", value: "Approximately 400 °C", basis: "requires pilot validation", source: "Final report §4.8 and Table 4.1" },
      { label: "Pressure", value: "4 MPa", basis: "requires pilot validation", source: "Final report §4.8 and Table 4.1" },
      { label: "Single-pass CO conversion", value: "45%", basis: "screening assumption", source: "Final report §5.5, Table 5.5; assumption A08" },
      { label: "Olefin selectivity", value: "70% of converted carbon", basis: "screening assumption", source: "Final report §5.5, Table 5.5; assumption A09" },
    ],
    equipment: [
      "Cooled multibed or boiling-water OXZEO reactor",
      "Synthesis-gas recycle compressor and controlled purge",
      "Water/oxygenate condensation and CO₂ removal",
      "Fuel-gas and C₂–C₄ product separation matched to the offtake specification",
    ],
    inputs: ["Sulfur-free, ratio-controlled synthesis gas from B6"],
    outputs: ["Light-olefin product", "CO₂ recycle", "Unconverted synthesis-gas recycle", "Fuel purge", "Water and oxygenates"],
    risk: "Coke, sulfur, water, zinc migration, cycling, and reactor hot spots can reduce selectivity and catalyst life.",
    validation: "A 2,000-hour real-gas catalyst campaign measuring conversion, product slate, heat removal, regeneration cycle life, and sulfur/water upset response.",
    source: "Final report §4.8, §5.5 and Table 10.1",
  },
  {
    id: "B8",
    order: 8,
    name: "Red-mud washing, conditioning, optional recovery, and purge",
    purpose: "Remove soluble sodium, condition mineral phases, recover usable heat, and route a controlled fraction to qualified product or disposal.",
    mechanism:
      "Counter-current washing removes soluble salts; controlled oxidation stabilises phases and manages heat but is not credited as full oxygen-carrier regeneration. Physical or hydrometallurgical recovery remains optional.",
    conditions: [
      { label: "Central solids purge", value: "20% of the red-mud inventory leaving B8", basis: "screening assumption", source: "Final report §4.9 and §5.7" },
      { label: "Conditioned mineral outlet", value: "8.16 t/day per train", basis: "calculated result", source: "Final report Table 5.2" },
    ],
    equipment: [
      "Counter-current wash and solid/liquid separation",
      "Recovered-heat dryer and controlled oxidation step",
      "XRF/XRD, sodium-leach, particle, surface-area, and magnetic-response release testing",
      "Optional magnetic or hydrometallurgical Fe/Sc/Ti recovery circuit",
    ],
    inputs: ["Separated mineral solids from B4"],
    outputs: ["R1 recycle", "Qualified residue purge", "Quarantined or disposable residue", "Optional metals concentrate"],
    risk: "The material may fail sodium leach, environmental, strength, sorbent, or customer specifications; trace elements may accumulate in recycle.",
    validation: "Independent leach/performance qualification and customer trials; assay, recovery, reagent, impurity, and offtake evidence before metals revenue is credited.",
    source: "Final report §4.9 and Table 8.2",
  },
  {
    id: "R1",
    order: 9,
    name: "Controlled red-mud recycle from B8 to B1",
    purpose: "Close the solids inventory without allowing sodium, chloride, trace metals, or inactive mineral phases to accumulate indefinitely.",
    mechanism:
      "Conditioned active solids are returned to slurry make-up and re-pressurised with fresh red mud. The purge fraction exchanges catalytic inventory against product dealkalization and contaminant control.",
    conditions: [
      { label: "Fresh red mud", value: "7.0 t/day per train", basis: "design basis", source: "Final report §5.7" },
      { label: "Central R1 recycle", value: "28 t/day per train", basis: "screening assumption", source: "Final report Table 5.7" },
      { label: "Central purge fraction", value: "20%", basis: "screening assumption", source: "Final report Table 5.7" },
    ],
    equipment: ["Conditioned-solids storage", "Recycle slurry make-up", "Inventory and contaminant monitoring", "B1 high-pressure feed system"],
    inputs: ["B8 solids released for recycle", "Fresh red mud", "Slurry water"],
    outputs: ["Controlled mineral slurry to B1/B2", "Adjusted B8 product purge"],
    risk: "Slow bleed can accumulate contaminants and inactive inventory; fast bleed increases fresh-mud demand and may release under-conditioned product.",
    validation: "Long-duration campaigns tracking Fe, Na, Cl, Si, Ti, trace metals, surface area, attrition, catalytic activity, and product leach performance by pass number.",
    source: "Final report §4.9 and §5.7",
  },
] as const satisfies readonly TowngasProcessStage[];

export const towngasDesignConflicts = [
  {
    id: "alkali-versus-operability",
    conflict: "Red mud’s catalytic alkalinity also drives salt deposition.",
    decision: "Make B3 a purposeful salt-product and dealkalization unit, not passive reactor protection.",
    consequence:
      "Red-mud dose, salt-separator duty, residue quality, and availability become one coupled design problem; B3 is the concept’s load-bearing pilot test.",
    basis: "published evidence",
    source: "Final report introduction, Conflict 1; §2.3",
  },
  {
    id: "co-deficit",
    conflict: "SCWG produces methane- and carbon-dioxide-rich gas with almost no carbon monoxide, while OXZEO consumes CO.",
    decision: "Insert B6 combined steam/dry bi-reforming between cleanup and synthesis.",
    consequence:
      "OXZEO becomes chemically reachable, but the plant pays the thermodynamic penalty of making methane exothermically and unmaking it endothermically.",
    basis: "design basis",
    source: "Final report introduction, Conflict 2; §2.5",
  },
  {
    id: "calcium-instability",
    conflict: "Calcium sulfide is hydrolytically unstable in hot pressurised water and can release H₂S again.",
    decision: "Remove speculative in-bed calcium capture; use Rectisol, a ZnO guard, and liquid-redox sulfur recovery.",
    consequence:
      "The sulfur block can be vendor-guaranteed and also controls CO₂, at the cost of capital, refrigeration, and methanol inventory.",
    basis: "published evidence",
    source: "Final report introduction, Conflict 3; §2.4",
  },
] as const;

const MASS_BALANCE_SOURCE = "Final report §5.1–§5.2, Tables 5.1–5.2";
const CARBON_BALANCE_SOURCE = "Final report §5.3, Table 5.3";

export const towngasMassBalance = {
  basis: "One 300 t/day hydrothermal train; battery-limit inputs and outputs",
  inputs: [
    { id: "wet-okara", label: "Wet okara", value: 250, unit: "t/day", basis: "design basis", source: MASS_BALANCE_SOURCE },
    { id: "soybean-straw", label: "Soybean straw", value: 8, unit: "t/day", basis: "design basis", source: MASS_BALANCE_SOURCE },
    { id: "fresh-red-mud", label: "Fresh red mud", value: 7, unit: "t/day", basis: "design basis", source: MASS_BALANCE_SOURCE },
    { id: "water", label: "Make-up or recycled water adjustment", value: 35, unit: "t/day", basis: "design basis", source: MASS_BALANCE_SOURCE },
  ],
  outputs: [
    { id: "olefins", label: "Light C₂–C₄ olefins", value: 11.61, unit: "t/day", basis: "screening assumption", source: MASS_BALANCE_SOURCE },
    { id: "co2", label: "CO₂ purge or export", value: 33.04, unit: "t/day", basis: "calculated result", source: MASS_BALANCE_SOURCE },
    { id: "aqueous-organics", label: "Aqueous organics", value: 4.75, unit: "t/day", basis: "screening assumption", source: MASS_BALANCE_SOURCE },
    { id: "solid-carbon", label: "Solid carbon", value: 0.95, unit: "t/day", basis: "screening assumption", source: MASS_BALANCE_SOURCE },
    { id: "methane-purge", label: "Methane fuel purge", value: 0.95, unit: "t/day", basis: "screening assumption", source: MASS_BALANCE_SOURCE },
    { id: "co-purge", label: "Carbon monoxide purge", value: 2.75, unit: "t/day", basis: "screening assumption", source: MASS_BALANCE_SOURCE },
    { id: "hydrogen-purge", label: "Hydrogen purge", value: 1.95, unit: "t/day", basis: "screening assumption", source: MASS_BALANCE_SOURCE },
    { id: "ammonia", label: "Ammonia equivalent", value: 3.47, unit: "t/day", basis: "screening assumption", source: MASS_BALANCE_SOURCE },
    { id: "nitrogen", label: "Nitrogen and trace gas", value: 0.32, unit: "t/day", basis: "screening assumption", source: MASS_BALANCE_SOURCE },
    { id: "sulfur", label: "Sulfur equivalent", value: 0.13, unit: "t/day", basis: "screening assumption", source: MASS_BALANCE_SOURCE },
    { id: "mineral-residue", label: "Conditioned mineral residue", value: 8.16, unit: "t/day", basis: "calculated result", source: MASS_BALANCE_SOURCE },
    { id: "salt-concentrate", label: "Dry salt concentrate", value: 1.5, unit: "t/day", basis: "screening assumption", source: MASS_BALANCE_SOURCE },
    { id: "water-out", label: "Recycle or effluent water", value: 230.42, unit: "t/day", basis: "calculated result", source: MASS_BALANCE_SOURCE },
  ],
  closurePct: 100,
  closureBasis: "calculated result" as const,
  source: MASS_BALANCE_SOURCE,
  caveat:
    "This is a reconciled pseudo-component screening balance. Molecular gas composition, rigorous water H/O closure, salt speciation, and iron-oxide phase equilibrium require pilot analytics and a licensed property-package simulation before investment-grade FEED.",
} as const satisfies {
  readonly basis: string;
  readonly inputs: readonly TowngasBalanceRow[];
  readonly outputs: readonly TowngasBalanceRow[];
  readonly closurePct: number;
  readonly closureBasis: TowngasEvidenceBasis;
  readonly source: string;
  readonly caveat: string;
};

export const towngasCarbonBalance = {
  feedCarbon: {
    label: "Feed carbon",
    value: 23.7,
    unit: "t C/day",
    basis: "calculated result",
    source: CARBON_BALANCE_SOURCE,
  },
  destinations: [
    { id: "olefins", label: "Light olefins", value: 9.95, unit: "t C/day", sharePct: 42, basis: "screening assumption", source: CARBON_BALANCE_SOURCE },
    { id: "co2", label: "CO₂ purge or export", value: 9.01, unit: "t C/day", sharePct: 38, basis: "screening assumption", source: CARBON_BALANCE_SOURCE },
    { id: "aqueous", label: "Aqueous organics", value: 1.9, unit: "t C/day", sharePct: 8, basis: "screening assumption", source: CARBON_BALANCE_SOURCE },
    { id: "solid", label: "Solid carbon", value: 0.95, unit: "t C/day", sharePct: 4, basis: "screening assumption", source: CARBON_BALANCE_SOURCE },
    { id: "methane", label: "Methane fuel purge", value: 0.71, unit: "t C/day", sharePct: 3, basis: "screening assumption", source: CARBON_BALANCE_SOURCE },
    { id: "co", label: "Carbon monoxide purge", value: 1.18, unit: "t C/day", sharePct: 5, basis: "screening assumption", source: CARBON_BALANCE_SOURCE },
  ],
  closurePct: 100,
  olefinCarbonSharePct: 42,
  source: CARBON_BALANCE_SOURCE,
  caveat:
    "The 42% figure is battery-limit olefin-carbon efficiency, not reactor selectivity. It includes upstream aqueous/solid rejection and synthesis-loop purge losses and must be replaced by an integrated continuous carbon balance.",
} as const;

export const towngasEnergyCascade = {
  basis: "One 300 t/day train",
  steps: [
    { id: "sensible", label: "Feed sensible heating to 625 °C", valueGjPerDay: 796, signedGjPerDay: 796, kind: "demand", basis: "calculated result", source: "Final report Table 6.1 and Table 6.2" },
    { id: "pumping", label: "Pressurisation and slurry pumping", valueGjPerDay: 10, signedGjPerDay: 10, kind: "demand", basis: "calculated result", source: "Final report Table 6.1 and Table 6.2" },
    { id: "scwg", label: "SCWG reaction and thermal loss", valueGjPerDay: 35, signedGjPerDay: 35, kind: "demand", basis: "screening assumption", source: "Final report Table 6.1" },
    { id: "reforming", label: "Bi-reformer reaction and furnace loss", valueGjPerDay: 150, signedGjPerDay: 150, kind: "demand", basis: "screening assumption", source: "Final report Table 6.1" },
    { id: "compression", label: "Gas compression and OXZEO recycle", valueGjPerDay: 25, signedGjPerDay: 25, kind: "demand", basis: "screening assumption", source: "Final report Table 6.1" },
    { id: "rectisol", label: "Rectisol refrigeration and regeneration", valueGjPerDay: 18, signedGjPerDay: 18, kind: "demand", basis: "screening assumption", source: "Final report Table 6.1" },
    { id: "finishing", label: "Aqueous polishing and residue finishing", valueGjPerDay: 15, signedGjPerDay: 15, kind: "demand", basis: "screening assumption", source: "Final report Table 6.1" },
    { id: "gross", label: "Gross requirement before recovery", valueGjPerDay: 1049, signedGjPerDay: 1049, kind: "subtotal", basis: "calculated result", source: "Final report Table 6.1" },
    { id: "feed-effluent", label: "Feed–effluent heat recovery", valueGjPerDay: 637, signedGjPerDay: -637, kind: "recovery", basis: "screening assumption", source: "Final report Table 6.1; assumption A07", note: "Uses 80% dirty-service effectiveness." },
    { id: "reformer-oxzeo", label: "Reformer and OXZEO heat recovery", valueGjPerDay: 130, signedGjPerDay: -130, kind: "recovery", basis: "screening assumption", source: "Final report Table 6.1" },
    { id: "purge-fuel", label: "Internal methane/carbon-monoxide purge-fuel credit", valueGjPerDay: 75, signedGjPerDay: -75, kind: "credit", basis: "screening assumption", source: "Final report Table 6.1" },
    { id: "net", label: "Purchased-energy equivalent", valueGjPerDay: 207, signedGjPerDay: 207, kind: "net", basis: "calculated result", source: "Final report Table 6.1 and Table 6.2" },
  ],
  annualPurchasedGj: 344655,
  annualBasis: "calculated result" as const,
  centralMessage:
    "Heat integration removes most of the water-heating burden, but it cannot remove the methane round trip: B2 forms methane exothermically and B6 reforms it endothermically at a higher temperature.",
  source: "Final report §6.1–§6.5",
} as const;

export const towngasChinaEconomicInputs = [
  { label: "Electricity", value: 0.6, unit: "RMB/kWh", basis: "official source", source: "Guangxi investment guide; final report Table 9.2", referenceId: "guangxi-utilities" },
  { label: "Industrial gas", value: 3.86, unit: "RMB/Nm³", basis: "official source", source: "Guangxi investment guide; final report Table 9.2", referenceId: "guangxi-utilities" },
  { label: "Industrial water", value: 3.68, unit: "RMB/m³", basis: "official source", source: "Guangxi investment guide; final report Table 9.2", referenceId: "guangxi-utilities" },
  { label: "Burdened enterprise labour", value: 160000, unit: "RMB/FTE-year", basis: "screening assumption", source: "Final report Table 9.2 using 2025 NBS wages plus benefits, shifts, PPE, and training", referenceId: "nbs-wages" },
  { label: "Methanol reference price", value: 2423, unit: "RMB/t", basis: "official source", source: "NBS, early July 2026; final report Table 9.2", referenceId: "nbs-prices" },
  { label: "Light-olefin netback", value: 6800, unit: "RMB/t", basis: "screening assumption", source: "Final report Table 9.2", note: "Mixed-product screening value below cited polymer prices." },
] as const;

export const towngasCapex = {
  currency: "RMB",
  priceBasis: "2026 China screening / Class 4",
  totalRmbBillion: 1.9,
  rangeRmbBillion: { low: 1.4, high: 2.8 },
  totalBasis: "screening assumption" as const,
  areas: [
    { id: "b1", label: "B1 feed reception and slurry systems", valueRmbMillion: 75, sharePct: 3.9, basis: "screening assumption", source: "Final report Table 9.4" },
    { id: "b2", label: "B2 SCWG reactors, heaters, and high-pressure pumps", valueRmbMillion: 420, sharePct: 22.1, basis: "screening assumption", source: "Final report Table 9.4" },
    { id: "b3-b4", label: "B3/B4 salt separation, letdown, and water systems", valueRmbMillion: 130, sharePct: 6.8, basis: "screening assumption", source: "Final report Table 9.4" },
    { id: "b5", label: "B5 Rectisol, ZnO, and sulfur recovery", valueRmbMillion: 170, sharePct: 8.9, basis: "screening assumption", source: "Final report Table 9.4" },
    { id: "b6", label: "B6 bi-reformer and heat recovery", valueRmbMillion: 190, sharePct: 10, basis: "screening assumption", source: "Final report Table 9.4" },
    { id: "b7", label: "B7 OXZEO, recycle, and product separation", valueRmbMillion: 230, sharePct: 12.1, basis: "screening assumption", source: "Final report Table 9.4" },
    { id: "b8", label: "B8 residue washing and finishing", valueRmbMillion: 100, sharePct: 5.3, basis: "screening assumption", source: "Final report Table 9.4" },
    { id: "utilities", label: "Utilities, offsites, land, and buildings", valueRmbMillion: 240, sharePct: 12.6, basis: "screening assumption", source: "Final report Table 9.4" },
    { id: "epcm", label: "EPCM and owner’s cost", valueRmbMillion: 140, sharePct: 7.4, basis: "screening assumption", source: "Final report Table 9.4" },
    { id: "contingency", label: "Process contingency", valueRmbMillion: 185, sharePct: 9.7, basis: "screening assumption", source: "Final report Table 9.4" },
    { id: "startup", label: "Start-up and working capital", valueRmbMillion: 20, sharePct: 1.1, basis: "screening assumption", source: "Final report Table 9.4" },
  ],
  exclusions: [
    "Downstream polymerisation",
    "Financing during construction",
    "Recoverable VAT",
    "Material foreign-exchange escalation",
  ],
  source: "Final report §9.4, Table 9.4",
} as const satisfies {
  readonly currency: "RMB";
  readonly priceBasis: string;
  readonly totalRmbBillion: number;
  readonly rangeRmbBillion: { readonly low: number; readonly high: number };
  readonly totalBasis: TowngasEvidenceBasis;
  readonly areas: readonly TowngasCostRow[];
  readonly exclusions: readonly string[];
  readonly source: string;
};

export const towngasOpex = {
  currency: "RMB",
  totalRmbMillionPerYear: 160.2,
  basis: "screening assumption" as const,
  items: [
    { id: "labour", label: "Labour and plant support", valueRmbMillion: 22, basis: "screening assumption", source: "Final report Table 9.5", note: "Approximately 128 FTE on the burdened China wage basis." },
    { id: "maintenance", label: "Maintenance and turnarounds", valueRmbMillion: 46.5, basis: "screening assumption", source: "Final report Table 9.5" },
    { id: "electricity", label: "Electricity", valueRmbMillion: 24, basis: "calculated result", source: "Final report Table 9.5" },
    { id: "heat", label: "Pipeline gas or purchased heat", valueRmbMillion: 21.7, basis: "calculated result", source: "Final report Table 9.5" },
    { id: "chemicals", label: "Catalysts, ZnO, methanol, and treatment chemicals", valueRmbMillion: 13, basis: "screening assumption", source: "Final report Table 9.5" },
    { id: "logistics", label: "Feed logistics", valueRmbMillion: 15, basis: "screening assumption", source: "Final report Table 9.5" },
    { id: "water-waste", label: "Water, wastewater, and residue handling", valueRmbMillion: 8, basis: "screening assumption", source: "Final report Table 9.5" },
    { id: "admin", label: "Insurance, administration, and certification", valueRmbMillion: 10, basis: "screening assumption", source: "Final report Table 9.5" },
  ],
  intensity: {
    perTonneOlefinRmb: 8287,
    perTonneSlurryRmb: 321,
  },
  source: "Final report §9.5, Table 9.5",
} as const;

export const towngasMethanolComparators = [
  {
    id: "owner-inner-mongolia",
    name: "Owner-supplied Inner Mongolia methanol plant",
    investmentRmbBillion: 1.5,
    capacityKtPerYear: 300,
    product: "Methanol",
    basis: "owner-supplied benchmark",
    use: "Primary order-of-magnitude anchor; scope and date require verification. Not a direct scale factor.",
    source: "Final report §9.3 and §9.10",
  },
  {
    id: "wuhai-methanol",
    name: "Wuhai coke-gasification methanol project",
    investmentRmbBillion: 0.786,
    capacityKtPerYear: 300,
    product: "Methanol",
    year: 2017,
    basis: "official source",
    use: "Historical lower methanol comparator.",
    source: "Final report Table 9.3",
    referenceId: "wuhai-capital",
  },
  {
    id: "dafeng-green-methanol",
    name: "Dafeng green methanol project",
    investmentRmbBillion: 2.67,
    capacityKtPerYear: 300,
    product: "Green methanol",
    year: 2025,
    basis: "official source",
    use: "Recent upper methanol comparator for a renewable route.",
    source: "Final report Table 9.3",
    referenceId: "dafeng-capital",
  },
  {
    id: "guizhou-polyolefin",
    name: "Guizhou coal-to-polyolefin project",
    investmentRmbBillion: 16.77,
    capacityKtPerYear: 600,
    product: "Polyolefins",
    year: 2018,
    basis: "official source",
    use: "Full coal-gasification-to-polymer scope; explicitly not a scale factor for this project.",
    source: "Final report Table 9.3",
    referenceId: "guizhou-capital",
  },
  {
    id: "towngas-scwg-oxzeo",
    name: "SCWG–OXZEO five-train complex",
    investmentRmbBillion: 1.9,
    capacityKtPerYear: 19.33,
    product: "Light olefins plus waste-treatment service",
    year: 2026,
    basis: "screening assumption",
    use: "Central area-by-area China screening estimate.",
    source: "Final report Table 9.3",
  },
] as const satisfies readonly TowngasComparator[];

export const towngasMethanolBenchmarkExplanation = {
  headline: "An order-of-magnitude capital anchor, not a direct capacity scale factor",
  points: [
    "The owner benchmark is RMB 1.5 billion for 300 kt/year of methanol, equal to RMB 5,000 per annual tonne of capacity.",
    "The Towngas concept handles dilute wet wastes in five high-pressure hydrothermal trains and adds hot-salt handling, Rectisol, a reformer, OXZEO separation, and a mineral circuit.",
    "Applying the methanol factor to 19.33 kt/year of olefins would imply only RMB 97 million and omit nearly every load-bearing process area.",
    "The screening concept’s capital intensity is approximately RMB 98,000 per annual tonne of olefins because waste-treatment throughput, not product output, sizes much of the plant.",
  ],
  carbonLimit:
    "The five-train feed contains approximately 39.46 kt/year of carbon. Even the impossible limit of converting every carbon atom to methanol is about 105 kt/year; a 300 kt/year methanol plant would need roughly three to five times the available carbon or external syngas.",
  basis: "calculated result",
  source: "Final report §9.3 and §9.10",
} as const;

export const towngasRevenueCredits = [
  { id: "olefins", label: "Light olefins", valueRmbMillion: 131.4, basis: "screening assumption", source: "Final report Table 9.6", note: "19,330.7 t/year at a screening netback of RMB 6,800/t." },
  { id: "okara-gate", label: "Wet-okara gate fee", valueRmbMillion: 29.1, basis: "screening assumption", source: "Final report Table 9.6", note: "RMB 70/t; requires a negotiated waste-service contract." },
  { id: "red-mud-gate", label: "Red-mud gate fee", valueRmbMillion: 1.9, basis: "screening assumption", source: "Final report Table 9.6", note: "RMB 160/t; requires a negotiated waste-service contract." },
  { id: "residue", label: "Qualified residue", valueRmbMillion: 1.6, basis: "screening assumption", source: "Final report Table 9.6", note: "Only the qualified fraction at RMB 120/t; independent qualification and offtake required." },
  { id: "concentrate", label: "N-K-P-S concentrate", valueRmbMillion: 1.2, basis: "screening assumption", source: "Final report Table 9.6", note: "Conditional low value at RMB 500/t; fertilizer registration is not assumed complete." },
  { id: "sulfur", label: "Sulfur and minor products", valueRmbMillion: 0.2, basis: "screening assumption", source: "Final report Table 9.6" },
  { id: "carbon-premium", label: "Carbon credit or green premium", valueRmbMillion: 0, basis: "base-case exclusion", source: "Final report Table 9.6", note: "No approved methodology, verified reduction, contractual title, or certified premium is assumed." },
  { id: "scandium", label: "Scandium recovery", valueRmbMillion: 0, basis: "base-case exclusion", source: "Final report §9.6 and Appendix B", note: "Assay, recovery, reagent cost, impurity penalty, and offtake are unproven." },
] as const satisfies readonly TowngasCostRow[];

export const towngasEconomics = {
  currency: "RMB",
  basis: "Nominal, pre-tax, unlevered; 20 operating years after construction",
  projectLifeYears: 20,
  discountRatePct: 10,
  annuityFactor: 8.5136,
  totalCapitalRmbBillion: 1.9,
  revenueAndCreditsRmbMillionPerYear: 165.4,
  cashOpexRmbMillionPerYear: 160.2,
  ebitdaRmbMillionPerYear: 5.2,
  preTaxNpvRmbBillion: -1.856,
  irr: null,
  irrLabel: "No positive project IRR",
  simplePaybackYears: 365,
  npvZeroEbitdaRmbMillionPerYear: 223.2,
  calculatedBasis: "calculated result" as const,
  conclusion:
    "The central commodity-olefin case is not financeable. Commercial viability depends on contracted waste-treatment revenue, higher product netbacks, certified premiums, reduced capital cost, or selection of a simpler product route.",
  source: "Final report §9.7, Table 9.7 and Appendix A",
} as const;

export const towngasEconomicSensitivities = [
  {
    id: "olefin-netback",
    label: "Light-olefin netback",
    low: "RMB 5,500/t",
    base: "RMB 6,800/t",
    high: "RMB 8,500/t",
    interpretation: "The high case adds approximately RMB 33 million/year, still far below the standalone break-even gap.",
    basis: "screening assumption",
    source: "Final report Table 9.8",
  },
  {
    id: "gate-fees",
    label: "Combined waste gate fee",
    low: "RMB 30/t",
    base: "Weighted approximately RMB 70/t",
    high: "RMB 350/t",
    interpretation: "Largest controllable cash driver; the implied all-in NPV-zero average is about RMB 565/t.",
    basis: "screening assumption",
    source: "Final report §9.8, Table 9.8",
  },
  {
    id: "availability",
    label: "Plant availability",
    low: "70%",
    base: "91.3%",
    high: "92%",
    interpretation: "Salt-separator and slurry-system reliability control both production and variable operating cost.",
    basis: "screening assumption",
    source: "Final report Table 9.8 and Appendix B",
  },
  {
    id: "purchased-energy",
    label: "Purchased energy",
    low: "20% below China base",
    base: "China base",
    high: "30% above China base",
    interpretation: "The fired bi-reformer and Rectisol refrigeration expose the plant to energy-price movement.",
    basis: "screening assumption",
    source: "Final report Table 9.8",
  },
  {
    id: "total-capital",
    label: "Total capital",
    low: "RMB 1.4 billion",
    base: "RMB 1.9 billion",
    high: "RMB 2.8 billion",
    interpretation: "Dominates NPV but does not improve annual EBITDA.",
    basis: "screening assumption",
    source: "Final report Table 9.8",
  },
  {
    id: "residue-value",
    label: "Qualified residue value",
    low: "Disposal cost",
    base: "RMB 120/t",
    high: "RMB 400/t",
    interpretation: "Positive value requires end-of-waste qualification, leach/performance testing, and a customer trial.",
    basis: "screening assumption",
    source: "Final report Table 9.8",
  },
  {
    id: "certified-premium",
    label: "Certified product premium",
    low: "No premium",
    base: "No premium credited",
    high: "Contracted and independently certified only",
    interpretation: "The report does not assign an invented premium range; any upside requires ISCC PLUS evidence and a binding offtake term.",
    basis: "base-case exclusion",
    source: "Final report §8.2, §9.6 and Table 8.2",
  },
] as const;

export const towngasPolicyItems = [
  {
    id: "iso-14067",
    title: "ISO 14067 product carbon footprint",
    summary:
      "Prepare separate light-olefin and residue-product footprints. Report both waste cut-off and allocated-burden feed cases; track biogenic carbon without assumed neutrality and disclose co-product allocation and avoided-burden sensitivities separately.",
    commercialTreatment: "No footprint claim or premium is bankable until screening yields are replaced by metered balances and uncertainty ranges.",
    basis: "official source",
    source: "Final report §8.1, Table 8.1",
    referenceId: "iso-14067",
  },
  {
    id: "iscc-plus",
    title: "ISCC PLUS mass balance and chain of custody",
    summary:
      "Retain point-of-origin declarations, supplier identity, certified mass, sustainability characteristics, conversion factors, storage losses, outgoing claims, and period reconciliation. The system must support the 2026 transition to mandatory ISCC PLUS 203-2 from 1 January 2027.",
    commercialTreatment: "Bio-based or circular premium is excluded until the chain of custody and sales claim are independently auditable.",
    basis: "official source",
    source: "Final report §8.2",
    referenceId: "iscc-mass-balance",
  },
  {
    id: "cbam",
    title: "EU CBAM relevance and limitations",
    summary:
      "The definitive regime began on 1 January 2026. Light olefins are not automatically in current scope, but iron, aluminium, cementitious, fertilizer, or hydrogen co-products may require classification and embedded-emissions data.",
    commercialTreatment: "Check customs classification at the intended export point; do not imply a CBAM benefit for olefins.",
    basis: "official source",
    source: "Final report §8.3",
    referenceId: "eu-cbam",
  },
  {
    id: "china-carbon-markets",
    title: "China ETS and CCER",
    summary:
      "The report cites 2025 national averages of RMB 62.36/tCO₂ for allowances and RMB 70.76/tCO₂ for CCERs. These are market evidence, not automatic project revenue.",
    commercialTreatment: "Carbon-credit revenue is zero in the base case pending methodology, additionality, registration, verified reductions, and contractual title.",
    basis: "official source",
    source: "Final report §8.4",
    referenceId: "mee-carbon-market",
  },
  {
    id: "feed-traceability",
    title: "Feedstock traceability",
    summary:
      "Supplier contracts and the plant ledger must preserve waste status, source identity, incoming mass and composition, certification evidence, correction rights, and audit access for every batch.",
    commercialTreatment: "Fragmented small-producer okara supply is a certification and data-quality risk, not merely a logistics issue.",
    basis: "design basis",
    source: "Final report §4.2 and §8.2",
  },
  {
    id: "waste-status",
    title: "Waste status and end-of-waste qualification",
    summary:
      "Whether okara and red mud enter burden-free changes the product footprint materially. Each residue route also requires the relevant waste-to-product classification rather than an assumed sale.",
    commercialTreatment: "Retain a compliant disposal route until regulators and customers accept the qualified material.",
    basis: "requires pilot validation",
    source: "Final report §8.1 and §8.5",
  },
  {
    id: "fertilizer",
    title: "N-K-P-S concentrate registration",
    summary:
      "Release requires nutrient assay plus chloride, heavy-metal, pathogen, organic, and applicable product-registration evidence. Until then it is a segregated concentrate, not fertilizer.",
    commercialTreatment: "Only a low conditional screening value is used; an analytical hold and disposal route remain.",
    basis: "requires pilot validation",
    source: "Final report §4.4 and Table 8.2",
  },
  {
    id: "residue-qualification",
    title: "Residue leach and performance qualification",
    summary:
      "A sorbent or cementitious claim requires sodium/leach testing, mineral and trace-metal characterization, strength or SO₂-performance evidence, and an independent customer trial.",
    commercialTreatment: "Scandium, iron-concentrate, and unqualified-residue revenue are excluded or conditional in the base case.",
    basis: "requires pilot validation",
    source: "Final report §8.5, Table 8.2",
  },
] as const;

export const towngasRisks = [
  {
    rank: 1,
    id: "salt-plugging",
    risk: "Salt plugging",
    mechanism: "Sodium and potassium salts bridge B2/B3 and force shutdown.",
    retirementTest: "A 1,000-hour continuous underflow/flush campaign with representative red mud, including wall-deposit recovery and stable pressure drop.",
    basis: "requires pilot validation",
    source: "Final report Table 10.2",
  },
  {
    rank: 2,
    id: "slurry-reliability",
    risk: "Slurry pumpability",
    mechanism: "Straw and red mud settle, bridge, cavitate, or erode the high-pressure feed system.",
    retirementTest: "A 25 MPa loop and hot feed-heater pressure-drop map across representative solids, particle size, and residence time.",
    basis: "requires pilot validation",
    source: "Final report Table 10.2",
  },
  {
    rank: 3,
    id: "red-mud-claim",
    risk: "Unverified red-mud catalytic contribution",
    mechanism: "Dealkalization or gasification benefit is insufficient at the selected hydrothermal residence time.",
    retirementTest: "Factorial autoclave and continuous tests measuring sodium leach, mineral phases, gas yields, char, and full carbon closure.",
    basis: "requires pilot validation",
    source: "Final report Table 10.2",
  },
  {
    rank: 4,
    id: "reformer-coking",
    risk: "Bi-reformer coking",
    mechanism: "Real-gas impurities or low steam/carbon deactivate nickel and create tube hot spots.",
    retirementTest: "A 1,000-hour real-gas slipstream carbon balance with catalyst inspection and controlled upset tests.",
    basis: "requires pilot validation",
    source: "Final report Table 10.2",
  },
  {
    rank: 5,
    id: "oxzeo-durability",
    risk: "OXZEO durability",
    mechanism: "Sulfur, water, metals, coke, zinc migration, and cycling alter conversion or olefin selectivity.",
    retirementTest: "A guard-bed challenge plus a 2,000-hour catalyst campaign on cleaned real reformer gas.",
    basis: "requires pilot validation",
    source: "Final report Table 10.2",
  },
  {
    rank: 6,
    id: "residue-status",
    risk: "Residue product qualification",
    mechanism: "The material fails leach, strength, sorbent, registration, or customer specifications.",
    retirementTest: "Independent qualification and an offtake/customer trial; no assumed fertilizer, scandium, or residue revenue.",
    basis: "requires pilot validation",
    source: "Final report Table 10.2",
  },
  {
    rank: 7,
    id: "materials",
    risk: "Materials durability",
    mechanism: "Chloride/sulfide stress corrosion, salt attack, or slurry erosion defeats the pressure boundary or internals.",
    retirementTest: "Long-duration welded corrosion coupons, erosion testing, wall-loss mapping, and deposit analysis in representative chemistry.",
    basis: "requires pilot validation",
    source: "Final report Table 10.2",
  },
  {
    rank: 8,
    id: "commercial-terms",
    risk: "Economics and contracting",
    mechanism: "Gate fees or premiums are unavailable and capital exceeds the screening anchor.",
    retirementTest: "Binding supplier/offtake terms and China vendor-budget quotations before commercial FEED.",
    basis: "requires pilot validation",
    source: "Final report Table 10.2",
  },
] as const;

export const towngasStageGates = [
  {
    id: "G0",
    name: "Feedstock analytical campaign",
    scaleOrDuration: "Composite campaign and 12 months of supplier records",
    evidence: "Ultimate/proximate analysis, rheology, C/N/S/Cl, XRF/XRD, moisture, spoilage, logistics, and feed contracts.",
    decision: "Freeze the representative design feed.",
    source: "Final report §10.1 and §10.3",
  },
  {
    id: "G1",
    name: "Batch chemistry",
    scaleOrDuration: "Autoclave severity matrix",
    evidence: "Carbon conversion, gas speciation, char, sodium release, and red-mud phases.",
    decision: "Select the B2 operating window.",
    source: "Final report Table 10.1",
  },
  {
    id: "G2",
    name: "Pressurised feed and salt loop",
    scaleOrDuration: "100–500 hours",
    evidence: "Pumpability, feed-heater pressure drop, salt underflow, wall deposition, and flush recovery.",
    decision: "Select B1 and B3 equipment concepts.",
    source: "Final report Table 10.1",
  },
  {
    id: "G3",
    name: "Continuous hydrothermal pilot",
    scaleOrDuration: "1–5 t/day; 1,000 hours",
    evidence: "Closed balances, availability, corrosion, water recycle, salt control, and qualified residue batches.",
    decision: "Authorise an integrated pilot.",
    source: "Final report Table 10.1",
  },
  {
    id: "G4",
    name: "Real-gas cleanup and reforming pilot",
    scaleOrDuration: "Real-gas slipstream; 1,000 hours",
    evidence: "Rectisol/MDEA simulation, ZnO life, sulfur specification, reformer coke, and H₂/CO control.",
    decision: "Freeze B5 and B6.",
    source: "Final report Table 10.1",
  },
  {
    id: "G5",
    name: "OXZEO catalyst campaign",
    scaleOrDuration: "2,000 hours",
    evidence: "Conversion, C₂–C₄ selectivity, product slate, heat removal, cycle life, and sulfur/water challenge response.",
    decision: "Freeze B7 and select the licensor/catalyst architecture.",
    source: "Final report Table 10.1",
  },
  {
    id: "G6",
    name: "Demonstration plant",
    scaleOrDuration: "30 t/day; 7,000-hour/year-equivalent campaign",
    evidence: "Contracted feeds, product qualification, auditable carbon data, reliability, and vendor-backed cost basis.",
    decision: "Decide whether the project can enter commercial FEED.",
    source: "Final report Table 10.1",
  },
  {
    id: "G7",
    name: "Commercial FEED",
    scaleOrDuration: "Only after G0–G6 and binding commercial terms",
    evidence: "Passed salt availability, carbon closure, real-gas catalyst life, residue qualification, vendor quotations, gate-fee agreements, and product offtake.",
    decision: "Authorise investment-grade FEED or select a simpler methanol/renewable-methane route.",
    source: "Final report §10.3–§10.4",
  },
] as const;

export const towngasReferences = [
  {
    id: "okara-composition",
    title: "Composition, nutrition, and utilization of okara (soybean residue)",
    authorsOrPublisher: "Li, Qiao & Lu",
    year: 2012,
    kind: "paper",
    url: "https://doi.org/10.1080/87559129.2011.595023",
  },
  {
    id: "marrone-salt",
    title: "Salt precipitation and scale control in supercritical water oxidation — Part B",
    authorsOrPublisher: "Marrone, Hodes, Smith & Tester",
    year: 2004,
    kind: "paper",
    url: "https://doi.org/10.1016/S0896-8446(03)00092-5",
  },
  {
    id: "salt-resistant-reactor",
    title: "A novel concept reactor design for preventing salt deposition in supercritical water",
    authorsOrPublisher: "Schubert, Regler & Vogel",
    year: 2010,
    kind: "paper",
    url: "https://doi.org/10.1016/j.cherd.2010.03.003",
  },
  {
    id: "red-mud-properties",
    title: "Physical and chemical properties of sintering red mud and Bayer red mud",
    authorsOrPublisher: "Wang & Liu",
    year: 2012,
    kind: "paper",
    url: "https://doi.org/10.3390/ma5101800",
  },
  {
    id: "soybean-straw-scwg",
    title: "Catalytic supercritical water gasification of soybean straw",
    authorsOrPublisher: "Okolie et al.",
    year: 2021,
    kind: "paper",
    url: "https://doi.org/10.1021/acs.iecr.0c06177",
  },
  {
    id: "bi-reforming",
    title: "Catalytic bi-reforming of methane",
    authorsOrPublisher: "Kumar, Shojaee & Spivey",
    year: 2015,
    kind: "paper",
    url: "https://doi.org/10.1016/j.coche.2015.07.003",
  },
  {
    id: "oxzeo-2025",
    title: "ZnOₓ overlayer confined on ZnCr₂O₄ spinel for direct syngas conversion to light olefins",
    authorsOrPublisher: "Nature Communications",
    year: 2025,
    kind: "paper",
    url: "https://doi.org/10.1038/s41467-025-58951-8",
  },
  {
    id: "iso-14067",
    title: "ISO 14067:2018 — Greenhouse gases — Carbon footprint of products",
    authorsOrPublisher: "International Organization for Standardization",
    year: 2018,
    kind: "standard",
    url: "https://www.iso.org/standard/71206.html",
  },
  {
    id: "iscc-mass-balance",
    title: "Mass-balance requirements and ISCC PLUS 203-2 transition",
    authorsOrPublisher: "ISCC System",
    year: 2026,
    kind: "standard",
    url: "https://contact.iscc-system.org/support/solutions/articles/103000349237-where-do-i-find-information-on-the-requirements-related-to-mass-balance-",
  },
  {
    id: "eu-cbam",
    title: "CBAM definitive regime",
    authorsOrPublisher: "European Commission",
    year: 2026,
    kind: "policy",
    url: "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-definitive-regime_en",
  },
  {
    id: "mee-carbon-market",
    title: "2025 national carbon-market operation",
    authorsOrPublisher: "Ministry of Ecology and Environment, China",
    year: 2026,
    kind: "policy",
    url: "https://www.mee.gov.cn/ywgz/ydqhbh/wsqtkz/202601/t20260101_1139528.shtml",
  },
  {
    id: "nbs-prices",
    title: "Market prices of important means of production in circulation, early July 2026",
    authorsOrPublisher: "National Bureau of Statistics, China",
    year: 2026,
    kind: "price",
    url: "https://www.stats.gov.cn/sj/zxfbhjd/202607/t20260713_1964100.html",
  },
  {
    id: "nbs-wages",
    title: "Average annual wages of employees in urban units in 2025",
    authorsOrPublisher: "National Bureau of Statistics, China",
    year: 2026,
    kind: "wage",
    url: "https://www.stats.gov.cn/sj/zxfbhjd/202605/t20260515_1963707.html",
  },
  {
    id: "guangxi-utilities",
    title: "Guangxi investment project guide",
    authorsOrPublisher: "Guangxi investment authorities",
    year: 2024,
    kind: "utility",
    url: "https://tzcjj.gxzf.gov.cn/gzdt/P020240402426792897646.pdf",
  },
  {
    id: "wuhai-capital",
    title: "300 kt/year methanol project, RMB 786.12 million investment",
    authorsOrPublisher: "Wuhai Development and Reform Commission",
    year: 2017,
    kind: "capital comparator",
    url: "https://fgw.wuhai.gov.cn/fgw/507572/507579/619439/index.html",
  },
  {
    id: "dafeng-capital",
    title: "Dafeng 300 kt/year green methanol project, RMB 2.67 billion investment",
    authorsOrPublisher: "Yancheng Municipal Government",
    year: 2025,
    kind: "capital comparator",
    url: "https://www.yancheng.gov.cn/art/2025/9/22/art_34234_4368196.html",
  },
  {
    id: "guizhou-capital",
    title: "600 kt/year coal-to-polyolefin project, RMB 16.77 billion investment",
    authorsOrPublisher: "Guizhou Development and Reform Commission",
    year: 2018,
    kind: "capital comparator",
    url: "https://fgw.guizhou.gov.cn/fggz/ywdt/201807/t20180728_62004060.html",
  },
] as const satisfies readonly TowngasReference[];

/** A single import for page components that prefer a namespaced data object. */
export const towngasCaseStudy = {
  meta: towngasCaseStudyMeta,
  evidenceLegend: towngasEvidenceLegend,
  technologyLabels: towngasTechnologyLabels,
  designMetrics: towngasDesignMetrics,
  engineeringProposition: towngasEngineeringProposition,
  feedstocks: towngasFeedstocks,
  compatibleCoFeeds: towngasCompatibleCoFeeds,
  feedAcceptance: towngasFeedAcceptance,
  processStages: towngasProcessStages,
  designConflicts: towngasDesignConflicts,
  massBalance: towngasMassBalance,
  carbonBalance: towngasCarbonBalance,
  energyCascade: towngasEnergyCascade,
  chinaEconomicInputs: towngasChinaEconomicInputs,
  capex: towngasCapex,
  opex: towngasOpex,
  methanolComparators: towngasMethanolComparators,
  methanolBenchmarkExplanation: towngasMethanolBenchmarkExplanation,
  revenueCredits: towngasRevenueCredits,
  economics: towngasEconomics,
  economicSensitivities: towngasEconomicSensitivities,
  policyItems: towngasPolicyItems,
  risks: towngasRisks,
  stageGates: towngasStageGates,
  references: towngasReferences,
} as const;
