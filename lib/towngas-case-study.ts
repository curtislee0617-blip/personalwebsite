// Website data follows the August 2026 public project report. Its published
// technical and commercial planning values are intentionally available on the
// public page. Only the private methanol comparator breakdown and the source
// identities behind references 36–46 remain outside this file.
// The page intentionally follows the report's decision sequence: wastes → feed
// envelope → siting → architecture → balances → claims → commercial decision.

export type TowngasEvidenceBasis =
  | "design basis"
  | "calculated result"
  | "screening assumption"
  | "requires pilot validation"
  | "contractual requirement"
  | "base-case exclusion";

export type TowngasProcessStageId =
  | "B1"
  | "B2"
  | "B3"
  | "B4"
  | "B5"
  | "B6"
  | "B7"
  | "B8";

export type TowngasStageCondition = {
  label: string;
  value: string;
  basis: TowngasEvidenceBasis;
  source: string;
};

export type TowngasProcessStage = {
  id: TowngasProcessStageId;
  order: number;
  name: string;
  purpose: string;
  mechanism: string;
  conditions: TowngasStageCondition[];
  equipment: string[];
  inputs: string[];
  outputs: string[];
  risk: string;
  validation: string;
  source: string;
};

export const towngasEvidenceLegend = [
  { basis: "design basis", description: "Selected engineering basis for this screening design; not a vendor guarantee." },
  { basis: "calculated result", description: "Arithmetic derived from the report's stated recipes, conversions, or economic assumptions." },
  { basis: "screening assumption", description: "A value suitable for comparing routes, but not yet demonstrated by continuous operation." },
  { basis: "requires pilot validation", description: "A load-bearing claim that must be retired with representative feed, equipment, or product testing." },
  { basis: "contractual requirement", description: "Value exists only when supplier, certification, or offtake terms are binding." },
  { basis: "base-case exclusion", description: "No revenue or performance credit is taken until the claim is qualified." },
] as const satisfies readonly { basis: TowngasEvidenceBasis; description: string }[];

export const towngasCaseStudyMeta = {
  eyebrow: "Towngas · Public project synthesis",
  title: "Two waste problems, one integrated process",
  subtitle: "Supercritical-water gasification and OXZEO light-olefin synthesis from a douzha-led regional feed portfolio and deliberately conditioned bauxite residue",
  summary: "The design starts with the wastes rather than the reactor. Douzha supplies wet renewable carbon; bauxite residue is an alkaline treatment feed that must leave through controlled dealkalization and qualification. Ten isolatable hydrothermal trains merge only accepted gas into shared Rectisol, bi-reforming, and OXZEO units. The physical design basis is stable, while the corrected China utility basis strengthens the economics: current conversion remains fragile after ramp-up, but sustained 55% carbon efficiency plus contracted service value produces a materially stronger case.",
  status: "Screening / pre-FEED synthesis — public project report",
  reportDate: "August 2026",
  reportVersion: "Current design",
  publicationNote: "The public website may reproduce every technical and commercial planning value stated in the downloadable public report. Only the private reference-plant methanol cost breakdown and the underlying identities and detailed descriptions of References 36–46 remain available through the dedicated Towngas project login.",
  publicReportHref: "/downloads/Towngas-SCWG-OXZEO-Public-Project-Report.pdf",
  privateReportHref: "/api/towngas-report/private",
  processAnchor: "#process-design",
} as const;

export const towngasTechnologyLabels = [
  "SCWG",
  "Douzha",
  "Bauxite-residue conditioning",
  "Purposeful salt separation",
  "Bi-reforming",
  "OXZEO",
  "ISCC PLUS",
] as const;

export const towngasDesignMetrics = [
  { id: "trains", label: "Hydrothermal architecture", value: "10 × 300", unit: "t/day trains", basis: "design basis", note: "Each B1–B4 train is independently isolatable." },
  { id: "throughput", label: "Commercial throughput", value: "3,000", unit: "t/day gross slurry", basis: "calculated result", note: "999,000 t/year at 333 operating days." },
  { id: "feed", label: "Central blend", value: "B1", unit: "balanced regional feed", basis: "design basis", note: "20.80 wt% solids and 25.947 t C/day per train." },
  { id: "product", label: "Light-olefin envelope", value: "42.35–55.45", unit: "kt/year", basis: "screening assumption", note: "42% current case to 55% financeability target." },
  { id: "capital", label: "China Class 4 TCI", value: "≈2.8", unit: "RMB billion", basis: "screening assumption", note: "Screening range approximately RMB 2.2–4.0 billion." },
  { id: "energy", label: "Purchased-energy equivalent", value: "260", unit: "GJ/day per train", basis: "calculated result", note: "After internal heat recovery and purge-fuel credit." },
] as const satisfies readonly { id: string; label: string; value: string; unit: string; basis: TowngasEvidenceBasis; note: string }[];

export const towngasReasoning = [
  { id: "wastes", question: "What is the real starting problem?", finding: "Wet douzha is costly to dry and spoils quickly; bauxite residue is alkaline, mineral-rich, and difficult to release safely.", decision: "Design one system around two engineered outlets: renewable-carbon conversion and residue conditioning." },
  { id: "platform", question: "Which conversion platform fits wet, variable feeds?", finding: "SCWG uses the feed water as reaction medium and can accept qualified wet organics without a separate drying train.", decision: "Select SCWG, but make pumpability, salt destination, and carbon closure—not nominal feed names—the acceptance criteria." },
  { id: "recipe", question: "What blend is both regional and operable?", finding: "The B1 recipe reaches 20.80 wt% solids and 8.649 wt% slurry carbon while keeping nitrogen and ash inside a controllable envelope.", decision: "Use douzha as anchor; let cassava cake, clean pulp, liquor, and limited straw adjust carbon. Keep manure separate." },
  { id: "location", question: "Where can that recipe exist at scale?", finding: "Wet feed economics are dominated by moving water and spoilage risk; denser carbon and mineral feeds tolerate longer hauls.", decision: "Screen the Qinzhou–Beihai–Fangchenggang corridor, then select a site from supplier-level annual delivered-cost data." },
  { id: "architecture", question: "How is common-mode failure contained?", finding: "Salt, fibrous slurry, and dirty heat recovery are train-specific risks; Rectisol, reforming, and OXZEO gain scale when shared.", decision: "Build ten complete B1–B4 trains and merge only accepted raw gas into common B5–B7 facilities." },
  { id: "commercial", question: "What makes the project financeable?", finding: "Nearly one million tonnes per year of watery slurry support only 42–55 thousand tonnes per year of olefins.", decision: "Treat the project as waste service plus certified carbon; require improved conversion, contracted fees, availability, and disciplined capital." },
] as const;

export const towngasWastePair = [
  { id: "douzha", number: "150", unit: "t/day per train", name: "Douzha", role: "Renewable carbon + reaction water", problem: "Approximately 82.8 wt% water on the report basis, protein-rich, variable, and perishable.", use: "The hydrated anchor matrix carries approved carbon co-feeds into the high-pressure system without a dedicated dryer.", release: "Carbon is closed across gas, water, solids, purge, and olefin product." },
  { id: "bauxite", number: "7", unit: "t/day per train", name: "Bauxite residue", role: "Treatment feed + process aid", problem: "Alkaline and mineral-rich; sodium, chloride, leaching, and destination performance govern release.", use: "Iron and alkali surfaces may aid conversion while hydrothermal processing, B3 salt withdrawal, and B8 washing condition the residue.", release: "Qualified product only; off-spec material receives a second wash or controlled retreatment." },
] as const;

export const towngasCentralRecipe = [
  { name: "Douzha", value: 150, role: "Anchor wet matrix" },
  { name: "Cassava cake", value: 60, role: "Starch-rich carbon" },
  { name: "Fruit + vegetable pulp", value: 20, role: "Flexible wet carbon" },
  { name: "Organic liquor", value: 10, role: "Dissolved carbon trim" },
  { name: "Milled straw", value: 12, role: "Dry carbon + C/N trim" },
  { name: "Bauxite residue", value: 7, role: "Mineral treatment feed" },
  { name: "Water", value: 41, role: "Rheology adjustment" },
] as const;

export const towngasBlendCases = [
  { id: "B0", name: "Douzha control", solids: 57.2, solidsPct: 19.07, carbon: 23.688, carbonPct: 7.896, ash: 8.652, cn: 6.82, product42: 38.66, product55: 50.62, purpose: "Reference recipe" },
  { id: "B1", name: "Balanced regional", solids: 62.4, solidsPct: 20.8, carbon: 25.947, carbonPct: 8.649, ash: 9.147, cn: 10.97, product42: 42.35, product55: 55.45, purpose: "Central commercial basis" },
  { id: "B2", name: "High carbon", solids: 66.16, solidsPct: 22.05, carbon: 27.864, carbonPct: 9.288, ash: 9.498, cn: 17.74, product42: 45.47, product55: 59.55, purpose: "Upper pumpability screen" },
  { id: "B3", name: "Manure campaign", solids: 65.66, solidsPct: 21.89, carbon: 26.848, carbonPct: 8.949, ash: 11.771, cn: 13.9, product42: 43.82, product55: 57.38, purpose: "Separate gate-fee trial" },
] as const;

export const towngasCompatibleCoFeeds = [
  { name: "Douzha", dose: "150 t/day B1", function: "Anchor wet carbon and slurry matrix", constraint: "Nitrogen, spoilage, variable moisture" },
  { name: "Cassava cake", dose: "60 t/day B1", function: "Carbon-density control", constraint: "Cyanogenic residues, sand, seasonality, gelation" },
  { name: "Fruit + vegetable pulp", dose: "20 t/day B1", function: "Flexible sugar/pectin/cellulose feed", constraint: "Packaging, grit, chloride, rapid acidification" },
  { name: "Organic liquor", dose: "10 t/day B1", function: "Dissolved carbon replacing dilution water", constraint: "Cleaning chemicals, conductivity, sulfur, refractory COD" },
  { name: "Milled straw", dose: "12 t/day B1", function: "Dry carbon and C/N trim", constraint: "Rheology, bridging, char, erosion" },
  { name: "Bagasse or cane trash", dose: "Alternate dry-fibre lane", function: "Regional lignocellulosic carbon after milling", constraint: "Silica, seasonal storage, fibrous rheology" },
  { name: "Brewery / distillery residues", dose: "Alternate liquor or wet-pulp lane", function: "Wet carbohydrate and soluble-organic carbon", constraint: "Sulfate, cleaning chemicals, variable alcohol or acid" },
  { name: "Manure cake", dose: "B3 only", function: "Potential treatment-service revenue", constraint: "Separate qualification for N, P, ash, chloride, pathogens" },
] as const;

export const towngasFeedAcceptance = [
  { property: "Total solids", target: "18–22 wt%", response: "Recalculate water and dry-fibre dose; hold batch if rheology remains outside the curve." },
  { property: "Particle size", target: "Fibre D90 <0.5 mm; no hard grit >1 mm", response: "Remill, screen, or reject; never rely on the high-pressure pump to comminute." },
  { property: "Yield stress / restart", target: "Inside the qualified pump-loop envelope after 12 h hold", response: "Reduce fibre or starch, add water, and repeat the restart test." },
  { property: "Feed carbon", target: "8.5–9.5 wt% gross slurry for B1/B2", response: "Adjust with qualified cassava, fibre, or liquor rather than adding uncontrolled wet tonnes." },
  { property: "Nitrogen, sulfur, ash, salts", target: "Inside campaign-specific B4/B5/product limits", response: "Segregate feed, adjust blend, increase purge, or move to a qualified campaign." },
  { property: "Chloride", target: "Supplier, B1, B3, and recycle-water limits", response: "Reject, prewash, segregate, or purge; do not recycle chloride indefinitely." },
] as const;

export const towngasSitingLogic = [
  { label: "Wet feed", value: "≈75 km", note: "A practical first screen because haulage is mostly water and residence time affects spoilage." },
  { label: "Dry / dense feed", value: "150 km+", note: "Cassava solids, milled fibre, and mineral residue can tolerate a wider sourcing radius if delivered cost works." },
  { label: "Decision variable", value: "RMB/year", note: "Minimise annual wet-water haul + dry-carbon haul + mineral transport + utilities + product logistics." },
] as const;

export const towngasProcessStages: TowngasProcessStage[] = [
  {
    id: "B1", order: 1, name: "Receiving, blend preparation, and high-pressure feed",
    purpose: "Make a traceable, carbon-controlled slurry that can restart after settling and reach reactor pressure without bridging or excessive wear.",
    mechanism: "Segregated receipt, fine milling, high-shear blending, batch release, and two 100% positive-displacement pumps per train.",
    conditions: [
      { label: "Normal feed", value: "300 t/day · 12.5 t/hour", basis: "design basis", source: "§5.1 and Appendix D.1" },
      { label: "Total solids", value: "20.80 wt% B1 · 18–22 wt% envelope", basis: "requires pilot validation", source: "Table 2.4 and Appendix D.1" },
      { label: "Discharge", value: "25 MPa plus line losses", basis: "design basis", source: "Appendix D.1" },
    ],
    equipment: ["Segregated shared receiving and train day tanks", "Fibre mill and grit removal", "High-shear blend/restart loop", "20 total P-101 A/B high-pressure pumps"],
    inputs: ["Douzha", "Approved wet co-feeds", "Milled straw", "Bauxite residue", "Water"],
    outputs: ["Released high-pressure B1 slurry"],
    risk: "Fibre bridging, starch gelation, grit wear, mineral settling, and a failed restart after hold.",
    validation: "Full-scale cold and hot pump/restart loop using seasonal supplier blends.",
    source: "§5.1, Tables 2.3–2.4, Appendix D.1",
  },
  {
    id: "B2", order: 2, name: "Supercritical-water gasification",
    purpose: "Convert wet organic carbon to methane-rich raw gas while exposing bauxite residue to hydrothermal conditioning.",
    mechanism: "Rapid near-critical heat-up and 30–90 second residence promote hydrolysis and gasification. Methane suppression remains an optimisation—not a basis for deleting B6.",
    conditions: [
      { label: "Temperature", value: "625 °C", basis: "requires pilot validation", source: "Table 1.1" },
      { label: "Pressure", value: "25 MPa", basis: "requires pilot validation", source: "Table 1.1" },
      { label: "Residence screen", value: "30–90 seconds", basis: "requires pilot validation", source: "§5.2" },
    ],
    equipment: ["R-201 externally heated reactor", "H-101 dirty-service feed/effluent exchanger", "Trim heater and water quench", "Online gas analysis and full liquid/solid sampling"],
    inputs: ["High-pressure B1 slurry"], outputs: ["Gas, supercritical water, salts, and mineral solids"],
    risk: "Char, wall deposition, corrosion, heat-flux excursions, and uncertain mixed-feed carbon-to-gas efficiency.",
    validation: "Continuous carbon closure across gas, water, and solids, followed by an integrated 1,000-hour mixed-feed campaign.",
    source: "§5.2 and Appendix D.1",
  },
  {
    id: "B3", order: 3, name: "Purposeful hot-salt precipitation and separation",
    purpose: "Make salts leave through a controlled underflow instead of attaching to the reactor, heat exchanger, or pressure boundary.",
    mechanism: "Twin lead/lag hot separators use controlled nucleation, continuous dense-underflow withdrawal, switch-over, and flush recovery.",
    conditions: [
      { label: "Configuration", value: "Twin lead/lag per train", basis: "design basis", source: "§5.3" },
      { label: "Service", value: "Hot, high-pressure, before H-101", basis: "design basis", source: "Figure 4.1" },
      { label: "Annual concentrate", value: "10,656 t/year site", basis: "calculated result", source: "Table 6.7" },
    ],
    equipment: ["Twin continuous hot separators", "Underflow cooling and flash", "Flush and switch-over system", "Concentrate quarantine and release tanks"],
    inputs: ["B2 effluent with precipitating Na/K/P/S/Cl species"], outputs: ["Salt-depleted effluent", "Controlled B3 concentrate"],
    risk: "A salt bridge or ineffective underflow forces a train outage and erodes the commercial availability case.",
    validation: "Mixed-feed hot loop proving underflow mass, wall deposition, pressure-drop recovery, and repeated separator switching.",
    source: "§5.3, Table 5.2 and Appendix B-03",
  },
  {
    id: "B4", order: 4, name: "Heat recovery, letdown, and three-phase separation",
    purpose: "Recover sensible heat, reduce pressure safely, and separate accepted gas from aqueous and mineral outlets before trains merge.",
    mechanism: "H-101 transfers heat to incoming slurry, staged sacrificial trims reduce pressure, then primary/secondary vessels split gas, water, and solids. Ammonia recovery and controlled purge prevent indefinite nitrogen and chloride recycle.",
    conditions: [
      { label: "Heat recovery", value: "555 GJ/day per train", basis: "screening assumption", source: "Tables 7.1–7.2" },
      { label: "Raw gas", value: "55.80 t/day per train", basis: "calculated result", source: "Table 6.2" },
      { label: "Aqueous stream", value: "233.75 t/day per train", basis: "calculated result", source: "Table 6.2" },
    ],
    equipment: ["Modular H-101 exchanger", "Staged hard-faced letdown trims", "Primary and secondary separators", "Ammonia recovery, water polishing, and chloride purge"],
    inputs: ["Salt-depleted B3 effluent"], outputs: ["Accepted wet raw gas to the common header", "Aqueous treatment stream", "Washed-solids route to B8"],
    risk: "Residual fines can foul H-101; two-phase letdown can erode trims; liquid carryover can contaminate the common gas island.",
    validation: "Demonstrate clean train isolation, H-101 cleanability, letdown wear life, and gas-header acceptance through transients.",
    source: "§5.4 and Tables 6.2, 7.1–7.2",
  },
  {
    id: "B5", order: 5, name: "Shared acid-gas removal and catalyst protection",
    purpose: "Remove sulfur and control carbon-dioxide routing before reforming and OXZEO synthesis.",
    mechanism: "A shared Rectisol system removes bulk acid gas and water; hydrolysis/COS management and a ZnO guard protect downstream catalysts.",
    conditions: [
      { label: "Feed", value: "Up to 558 t/day wet raw-gas screen", basis: "screening assumption", source: "Appendix D.2" },
      { label: "Sulfur guard target", value: "<0.1 ppmv total S screen", basis: "screening assumption", source: "Appendix D.2" },
      { label: "Architecture", value: "Shared · N+1 critical auxiliaries", basis: "design basis", source: "§4.3" },
    ],
    equipment: ["Common gas header with train acceptance", "Rectisol absorption/regeneration", "COS hydrolysis as required", "Duty/standby ZnO guard beds"],
    inputs: ["Accepted B4 raw gas from ten trains"], outputs: ["Clean methane-rich gas", "Controlled CO2 split", "Recovered sulfur stream"],
    risk: "One wet or sulfur-rich train can contaminate the shared conversion island.",
    validation: "Licensed real-gas design with train-acceptance limits, solvent balance, refrigeration duty, and ZnO breakthrough guarantee.",
    source: "§5.5 and Appendix D.2",
  },
  {
    id: "B6", order: 6, name: "Shared steam/CO₂ bi-reforming",
    purpose: "Convert methane-rich SCWG gas into the CO/H₂ ratio required by the OXZEO island.",
    mechanism: "Steam and dry reforming are combined in a fired tubular reactor. The step is strongly endothermic and remains necessary because the B2 gas is methane-rich.",
    conditions: [
      { label: "Outlet screen", value: "≈850 °C", basis: "screening assumption", source: "Table 1.1" },
      { label: "Pressure", value: "≈2.8 MPa", basis: "design basis", source: "Table 1.1" },
      { label: "Duty", value: "290 GJ/day per train equivalent", basis: "screening assumption", source: "Tables 7.1 and D.2" },
    ],
    equipment: ["Fired tubular bi-reformer", "Steam and CO2 ratio control", "Syngas waste-heat boiler", "Flue-gas heat recovery"],
    inputs: ["Clean methane-rich gas", "Steam", "Controlled CO2"], outputs: ["Ratio-controlled CO/H2 synthesis gas"],
    risk: "The methane round-trip consumes high-grade heat and exposes tubes/catalyst to real-gas impurities and carbon formation.",
    validation: "Vendor equilibrium, tube-life, fuel/steam balance, catalyst-life, and turndown guarantees on representative clean gas.",
    source: "§5.6, §7.3 and Appendix D.2",
  },
  {
    id: "B7", order: 7, name: "Shared OXZEO synthesis and product recovery",
    purpose: "Convert conditioned synthesis gas into C₂–C₄ light olefins and separate product, recycle, and purge.",
    mechanism: "Oxygenate synthesis and zeolite conversion are represented as cooled fixed beds with recycle and staged condensation/fractionation; website chemistry is intentionally simplified.",
    conditions: [
      { label: "Temperature screen", value: "≈400 °C", basis: "requires pilot validation", source: "Table 1.1" },
      { label: "Pressure", value: "2–3 MPa", basis: "design basis", source: "Table 1.1" },
      { label: "Carbon efficiency", value: "42% current · 55% target", basis: "requires pilot validation", source: "Tables 6.3 and 10.5" },
    ],
    equipment: ["Cooled OXZEO reactor beds", "Interstage heat removal", "Recycle compressor and purge", "Condensation and C2–C4 product separation"],
    inputs: ["B6 ratio-controlled synthesis gas", "Qualified recycle"], outputs: ["Light olefins", "Recycle gas", "Water/oxygenates", "Controlled purge fuel"],
    risk: "Real-gas catalyst life, hot spots, selectivity, and product-recovery losses directly control financeability.",
    validation: "Licensed real-gas conversion, selectivity, life, regeneration, turndown, and product-separation guarantees.",
    source: "§5.7, Tables 6.3–6.4 and 10.5",
  },
  {
    id: "B8", order: 8, name: "Residue washing, qualification, and retreatment",
    purpose: "Create a defensible outlet for the mineral phase without claiming that one pass always makes a saleable product.",
    mechanism: "Counter-current washing lowers soluble alkali and chloride. Each batch is released to a destination specification or sent to a second wash/controlled retreatment.",
    conditions: [
      { label: "Annual wet-screen solids", value: "24,143 t/year", basis: "calculated result", source: "Tables 6.7 and D.3" },
      { label: "Release basis", value: "Destination-specific Na/Cl, leaching, XRF/XRD", basis: "contractual requirement", source: "Appendix D.3" },
      { label: "Recycle policy", value: "No indefinite mineral recycle", basis: "design basis", source: "§5.8" },
    ],
    equipment: ["Counter-current wash/filtration", "Product and quarantine storage", "XRF/XRD and leach testing", "Second-wash/retreatment route"],
    inputs: ["Separated mineral solids from B4"], outputs: ["Qualified conditioned residue", "Off-spec material to retreatment", "Wash water to controlled treatment"],
    risk: "Residue composition is source-dependent; overclaiming product status creates environmental and commercial liability.",
    validation: "Representative B8 wash trials plus buyer-specific performance, Na/Cl, leaching, phase, and legal-status qualification.",
    source: "§5.8, Appendix B-04 and Appendix D.3",
  },
];

export const towngasChemistry = [
  { step: "01", label: "SCWG", reaction: "Wet organic carbon → CH₄-rich gas + CO₂ + H₂", note: "B2 converts the wet feed; methane formation is expected on the central basis." },
  { step: "02", label: "Bi-reforming", reaction: "CH₄ + H₂O/CO₂ + heat → CO + H₂", note: "B6 spends high-grade heat to create the synthesis-gas ratio OXZEO needs." },
  { step: "03", label: "OXZEO", reaction: "CO + H₂ → oxygenate intermediate → C₂–C₄ olefins", note: "B7 performance is expressed as integrated feed-carbon-to-olefin efficiency." },
] as const;

export const towngasOperatingTransitions = [
  {
    id: "startup",
    title: "Start on clean water",
    action: "Establish pump pressure, heat the circuit through the critical region, and prove both B3 separator paths before introducing organics, residue, or dry fibre.",
    release: "Train gas stays outside the shared header until B4 carryover, B5 inlet composition, and sulfur are within specification.",
  },
  {
    id: "recipe",
    title: "Move recipes at constant gross flow",
    action: "Correct wet-feed variability with trim water first, then adjust qualified carbon co-feed only inside solids, rheology, nitrogen, ash, salt, and chloride limits.",
    release: "A complete batch certificate prevents alternating supplier slugs from reaching B2.",
  },
  {
    id: "separator",
    title: "Recover a fouling separator without losing the train",
    action: "Increase B3 underflow, reduce organic/mineral feed while maintaining water, pressure-match the standby vessel, then isolate and flush the fouled separator.",
    release: "Restart requires recovered baseline differential pressure and a confirmed open underflow—not completion of a timed wash.",
  },
  {
    id: "shutdown",
    title: "Remove feed before heat and pressure",
    action: "Isolate B7 fresh syngas, cool on recycle, retain B6 steam, then remove bauxite residue, fibre, and wet organics in that order while clean water sweeps the train.",
    release: "Unverified transient gas never enters the common OXZEO loop.",
  },
] as const;

export const towngasAvailability = {
  target: "≈9 active train-equivalents",
  basis: "Ten independent hydrothermal modules averaging 90% uncorrelated availability; the shared back end must remain stable at eight-train turndown.",
  warning: "Supplier, recycle-water, or shared-control failures can correlate outages. Segregated feed tanks, traceable water, and independent permissives are economic safeguards.",
} as const;

export const towngasMassBalance = {
  basis: "One B1 train · 300 t/day",
  input: [
    { label: "Dry solids", value: 62.4 },
    { label: "Water", value: 237.6 },
    { label: "Feed carbon (within solids)", value: 25.947 },
  ],
  outputs: [
    { label: "Raw gas to B5", value: 55.8, note: "Contains 90% of feed carbon on the screen" },
    { label: "B3 salt concentrate", value: 3.2, note: "Controlled salt product or purge" },
    { label: "B8 washed solids", value: 7.25, note: "Qualified destination or retreatment" },
    { label: "B4 aqueous stream", value: 233.75, note: "Nitrogen recovery, polishing, recycle, and purge" },
  ],
  annual: [
    { label: "Gross slurry", value: "999,000 t/year" },
    { label: "Wet raw gas", value: "185,814 t/year" },
    { label: "Salt concentrate", value: "10,656 t/year" },
    { label: "B8 wet-screen residue", value: "24,143 t/year" },
    { label: "Aqueous stream", value: "778,388 t/year" },
  ],
} as const;

export const towngasCarbonCases = [
  { id: "current", label: "Current performance", efficiency: 42, olefinCarbon: 10.898, purgeCarbon: 7.398, production: 42.35 },
  { id: "target", label: "Financeability target", efficiency: 55, olefinCarbon: 14.271, purgeCarbon: 4.024, production: 55.45 },
] as const;

export const towngasCarbonEfficiencyBridge = {
  feedCarbon: 25.947,
  rows: [
    { destination: "Olefin product", current: 10.898, target: 14.271, change: 3.373, role: "value" },
    { destination: "Synthesis-loop purge", current: 7.398, target: 4.024, change: -3.374, role: "lever" },
    { destination: "Aqueous organic loss", current: 1.297, target: 1.297, change: 0, role: "fixed" },
    { destination: "Solid / char loss", current: 1.297, target: 1.297, change: 0, role: "fixed" },
    { destination: "CO₂ loss", current: 5.057, target: 5.057, change: 0, role: "fixed" },
  ],
  areas: [
    { stage: "B7", priority: "Primary lever", title: "OXZEO conversion, recycle, and recovery", action: "Increase single-pass conversion and olefin selectivity, recover more unconverted CO/H₂, separate recycle gas more cleanly, and reduce the minimum stable purge without accumulating inerts." },
    { stage: "B6", priority: "Primary lever", title: "Bi-reformer conversion and ratio control", action: "Convert more methane, reduce CH₄ slip, and hold the CO/H₂ ratio inside the B7 catalyst window so carbon reaches the synthesis loop in a usable form." },
    { stage: "B2", priority: "Secondary opportunity", title: "SCWG gas yield", action: "Reduce char and aqueous-organic formation while maintaining 90% carbon transfer to raw gas. This could improve beyond the report's 55% case, which holds upstream losses constant." },
    { stage: "B4–B5", priority: "Carbon protection", title: "Separation and clean-gas recovery", action: "Limit hydrocarbon carry-under into water, liquid carryover, Rectisol co-absorption losses, and off-spec gas rejection while still protecting the reformer and OXZEO catalysts." },
    { stage: "B1–B3", priority: "Operability enabler", title: "Stable feed and salt management", action: "Keep carbon density, pumpability, residence time, and separator availability stable. These sections protect achieved efficiency but do not create the modelled 42%→55% increase directly." },
  ],
  conclusion: "In the report's economic bridge, the entire 13-point efficiency gain is modelled as carbon moving from synthesis purge to olefin product. B6 and B7 therefore carry the direct performance burden.",
  testing: "The 55% value is a financeability target, not measured performance. Confirm it with real-gas reformer/OXZEO trials, catalyst-life and recycle-loop modelling, product-recovery tests, and a continuous full-plant carbon balance.",
} as const;

export const towngasEnergyCascade = {
  gross: [
    { label: "Slurry heating", value: 690 },
    { label: "SCWG reaction + loss", value: 55 },
    { label: "B6 reforming + furnace", value: 290 },
    { label: "B4/B5 regeneration", value: 25 },
  ],
  recovery: [
    { label: "H-101 feed/effluent", value: 555 },
    { label: "Reformer + flue gas", value: 150 },
    { label: "OXZEO heat", value: 45 },
    { label: "Hot water + solids", value: 25 },
    { label: "Purge-fuel credit", value: 60 },
  ],
  purchased: { thermal: 205, shaft: 55, total: 260 },
  site: [
    { label: "Purchased thermal", value: "682,650 GJ/year · ≈23.7 MW" },
    { label: "Electricity", value: "≈50.9 GWh/year · ≈6.36 MW" },
    { label: "Potential ammonium sulfate", value: "Up to ≈27.9 kt/year after qualification" },
  ],
} as const;

export const towngasPublicPlanningInputs = [
  { input: "Electricity", quantity: "≈50.9 GWh/year", basis: "RMB 0.40/kWh", annual: "RMB 20.4m/year" },
  { input: "Biomass thermal energy", quantity: "≈682,650 GJ/year", basis: "RMB 650/t pellets · 16.5 GJ/t LHV · 80% useful heat", annual: "RMB 33.6m/year" },
  { input: "Purchased water", quantity: "Closed by the site water balance", basis: "RMB 20/t", annual: "Included in the water OPEX line" },
  { input: "Provisional operating tax", quantity: "Saleable light-olefin output", basis: "RMB 35/t product", annual: "RMB 1.9m/year at 55% conversion" },
] as const;

export const towngasMajorEquipment = [
  { area: "B1 receiving trains", quantity: "Shared receipt + train day tanks", duty: "3,000 t/day complex", confirmation: "Supplier variability, storage, odour and metering" },
  { area: "P-101 A/B high-pressure pumps", quantity: "20 total", duty: "12.5 t/hour per duty pump", confirmation: "Wear, check-valve life and restart on the B1 slurry" },
  { area: "H-101 feed / effluent recovery", quantity: "10 modular train systems", duty: "555 GJ/day per train", confirmation: "Deposit control, thermal stress, cleanability and tube-failure isolation" },
  { area: "R-201 SCWG reactors", quantity: "10", duty: "≈2.3 m³ gross per train screen", confirmation: "Residence time, heat flux, alloy, fatigue and char behaviour" },
  { area: "V-301 A/B hot-salt separators", quantity: "20", duty: "≈10 m³ gross each screen", confirmation: "Mixed-salt settling, wall adhesion and continuous underflow" },
  { area: "B5 Rectisol / ZnO", quantity: "1 shared train with spared pumps and beds", duty: "558 t/day wet raw-gas screen", confirmation: "Gas load, refrigeration and sulfur speciation" },
  { area: "B6 reformer", quantity: "1 shared system in multiple boxes", duty: "≈2,900 GJ/day gross equivalent", confirmation: "Tube metallurgy, catalyst, firing and decoking" },
  { area: "B7 OXZEO", quantity: "Licensed multi-bed system", duty: "42–55 kt/year olefin envelope", confirmation: "Real-gas performance, catalyst life and product specification" },
  { area: "B8 + nitrogen recovery", quantity: "Shared and source-traceable", duty: "72.5 t/day solids · 2,337.5 t/day aqueous", confirmation: "Product quality and water / chloride closure" },
] as const;

export const towngasChlorideControls = [
  { location: "Supplier unloading", measurement: "Chloride, conductivity, Na/K and source history", response: "Reject, segregate or allocate prewash" },
  { location: "B1 final blend", measurement: "Batch chloride and conductivity", response: "Prevent high-pressure-feed release above the campaign limit" },
  { location: "B3 underflow", measurement: "Chloride mass and mineral / salt phase", response: "Confirm that the intended salt-removal route is working" },
  { location: "B4 recycle water", measurement: "Continuous conductivity plus frequent ion chromatography", response: "Increase controlled purge or stop recycle" },
  { location: "B8 product and wash", measurement: "Soluble and total chloride", response: "Second wash or alternate destination" },
  { location: "Corrosion coupons", measurement: "Metal loss, pitting and cracking evidence", response: "Revise the chemistry limit, alloy or inspection interval" },
] as const;

export const towngasHazop = [
  { deviation: "Low B1 flow with heat", consequence: "Wall overheating, char and a pressure / temperature excursion", safeguard: "Independent flow trip cuts firing and organics, maintains water and uses local blowdown" },
  { deviation: "High B3 differential pressure", consequence: "Reactor backpressure and a blocked outlet", safeguard: "Twin-separator switch, feed reduction, water flush and independent relief" },
  { deviation: "Letdown erosion or failure", consequence: "Loss of containment or downstream high level", safeguard: "Staged sacrificial trims, condition monitoring and a closed receiver" },
  { deviation: "Liquid carryover to the gas header", consequence: "Rectisol / reformer upset and common-mode contamination", safeguard: "Independent high-high level closes double block; knockout and coalescer remain in service" },
  { deviation: "Sulfur breakthrough", consequence: "B6 / B7 catalyst poisoning", safeguard: "Lead / lag beds, analyser voting and immediate off-spec diversion" },
  { deviation: "Low B6 steam-to-carbon ratio", consequence: "Reformer coking and tube overheating", safeguard: "Hard permissive, feed cut, steam purge and decoking provision" },
  { deviation: "High B7 temperature", consequence: "Selectivity loss, catalyst damage and pressure rise", safeguard: "Multipoint temperature trip, fresh-gas cut and recycle / inert cooling" },
  { deviation: "Methanol release", consequence: "Fire, toxicity and environmental release", safeguard: "Closed drains, detection, bunding, classified equipment and remote isolation" },
  { deviation: "High chloride inventory", consequence: "Pitting, stress-corrosion cracking and off-spec residue", safeguard: "Inventory alarm, stop recycle, increase purge and quarantine the source" },
] as const;

export const towngasAnalyticalPlan = [
  { location: "Supplier + B1", online: "Mass, density, pH, conductivity and tank temperature", laboratory: "Total solids, rheology, particle size, CHNS, ash, ions, metals and excluded contaminants" },
  { location: "B2 outlet", online: "Temperature, pressure, flow and H₂ / CH₄ / CO / CO₂ GC", laboratory: "Aqueous TOC, solid carbon and full C / N / S / mineral closure" },
  { location: "B3", online: "Differential pressure, underflow flow / density and wall temperature", laboratory: "Ion balance, crystal / mineral phase, organics and leachability" },
  { location: "B4", online: "Levels, water carryover, conductivity and ammonia proxy", laboratory: "NH₃ / NH₄⁺, TOC / COD, ions, metals and purge / recycle release" },
  { location: "B5 + B6", online: "Total sulfur, H₂S / COS, water, gas composition and tube skin", laboratory: "Methanol carryover, catalyst poisons and carbon deposition" },
  { location: "B7", online: "Bed temperature / pressure drop, conversion, selectivity and recycle flow", laboratory: "Full product specification, oxygenates, catalyst deposition and activity trend" },
  { location: "B8", online: "Moisture and process pH", laboratory: "XRF / XRD, Na / Cl, carbon, metals, leachability and destination performance" },
] as const;

export const towngasCertification = [
  { id: "pcf", title: "ISO 14067 product carbon footprint", claim: "Meter utilities, logistics, conversion losses, gas, water, solids, and product by accounting period.", limit: "Waste status does not automatically create a zero footprint.", basis: "contractual requirement" },
  { id: "iscc", title: "ISCC PLUS chain of custody", claim: "Track supplier, point of origin, wet/dry mass, eligible category, conversion factor, losses, and outgoing attribution.", limit: "Mass balance does not mean every product molecule is physically traced to one waste batch.", basis: "contractual requirement" },
  { id: "premium", title: "EU product premium", claim: "A certified circular/bio attribution and lower verified footprint may support differentiated offtake.", limit: "The 20% premium is a scenario only; it must be written into price and volume terms.", basis: "contractual requirement" },
  { id: "cbam", title: "EU CBAM and China carbon value", claim: "Track policy interfaces separately from product qualification and waste-treatment performance.", limit: "Light olefins are not currently treated as CBAM goods, and no China ETS/CCER value is credited in the base case.", basis: "base-case exclusion" },
] as const satisfies readonly { id: string; title: string; claim: string; limit: string; basis: TowngasEvidenceBasis }[];

export const towngasCapex = [
  { label: "B1 feed preparation", value: 140 },
  { label: "B2 ten-train SCWG island", value: 880 },
  { label: "B3/B4 salt, heat, letdown + water", value: 330 },
  { label: "B5 Rectisol + sulfur protection", value: 250 },
  { label: "B6 bi-reforming", value: 260 },
  { label: "B7 OXZEO + recovery", value: 390 },
  { label: "B8 residue finishing", value: 150 },
  { label: "Utilities + offsites", value: 260 },
  { label: "Buildings / EPCM / owner", value: 154 },
] as const;

export const towngasOpexDrivers = [
  { label: "Electricity", value: 20.4, display: "RMB 20.4m/y", note: "≈50.9 GWh/year at the public RMB 0.40/kWh planning assumption." },
  { label: "Biomass thermal energy", value: 33.6, display: "RMB 33.6m/y", note: "≈682,650 GJ/year at RMB 650/t pellets, 16.5 GJ/t LHV and 80% useful heat." },
  { label: "Maintenance and inspection", value: 70, display: "RMB 70.0m/y", note: "Public Towngas allowance for the high-pressure, salt, cold and reformer systems." },
  { label: "Labour and site services", value: 32, display: "RMB 32.0m/y", note: "Public project headcount and site-service allowance." },
  { label: "Catalysts, ZnO, methanol and chemicals", value: 32, display: "RMB 32.0m/y", note: "Public project allowance pending vendor guarantees." },
  { label: "Water, purge treatment and disposal", value: 15, display: "RMB 15.0m/y", note: "Purchased water, treatment and concentrate-disposal allowance." },
  { label: "Insurance, administration and certification", value: 15, display: "RMB 15.0m/y", note: "Owner cost, assurance and routine audits." },
  { label: "Operating tax at 55% product case", value: 1.9, display: "RMB 1.9m/y", note: "Public-model provisional allowance of RMB 35/t product." },
] as const;

export const towngasEconomicScenarios = [
  {
    id: "current",
    name: "Current-performance commodity",
    question: "Can the present technical case work as an ordinary commodity-olefin plant?",
    changes: "Nothing is upgraded. This is the reference case against which the other three scenarios are compared.",
    assumptions: "42% feed-carbon-to-olefin efficiency; 42.35 kt/year product; RMB 7,500/t commodity netback; base waste-service fees; no certified EU premium.",
    interpretation: "The plant produces positive annual EBITDA, but not enough to repay the roughly RMB 2.8bn capital base within the project horizon. This is the report's clearest evidence that commodity olefins alone are not the business model.",
    production: 42.35,
    revenue: 406.2,
    opex: 219.5,
    ebitda: 186.8,
    npv: -1223.8,
    rampNpv: -1331.8,
    irr: "2.9%",
    payback: "15.1 y",
    tone: "negative",
  },
  {
    id: "current-premium",
    name: "Current performance + EU 20%",
    question: "Can stronger service contracts and a 20% EU premium rescue current conversion performance?",
    changes: "Technical performance stays at 42%; annual service fees increase from the base to the contracted portfolio, and the model adds a certified 20% price premium plus its export/compliance allowance.",
    assumptions: "42.35 kt/year product; contracted circular-service fees of RMB 203.5m/year; RMB 9,000/t netback; source-aligned utilities; no benefit from reaching the 55% target.",
    interpretation: "The level annual case crosses zero, but its NPV becomes slightly negative after a 70%/90% two-year ramp. Commercial rescue at current conversion is therefore possible only narrowly, with little tolerance for capital overrun or lost availability.",
    production: 42.35,
    revenue: 589.6,
    opex: 241.5,
    ebitda: 348.2,
    npv: 150.2,
    rampNpv: -15.1,
    irr: "10.8%",
    payback: "8.1 y",
    tone: "caution",
  },
  {
    id: "improved",
    name: "Improved conversion + contracts",
    question: "Can better carbon conversion and contracted waste-service income work without a green premium?",
    changes: "Carbon efficiency rises from 42% to 55%, while eligible waste streams move onto contracted circular-service fees. Product remains at the commodity netback.",
    assumptions: "55.45 kt/year product; RMB 7,500/t netback; improved integrated conversion; contracted circular fees; no EU premium or speculative carbon/scandium credit.",
    interpretation: "This is a more robust commercial bridge than Scenario B. It remains positive after the two-year ramp and shows that sustained carbon recovery plus binding supplier contracts matter more than premium marketing alone.",
    production: 55.45,
    revenue: 624.4,
    opex: 219.9,
    ebitda: 404.5,
    npv: 629.8,
    rampNpv: 444.4,
    irr: "13.2%",
    payback: "7.0 y",
    tone: "positive",
  },
  {
    id: "improved-premium",
    name: "Improved + EU 20%",
    question: "What is the upside if technical, contractual, and certified-market improvements all arrive together?",
    changes: "Scenario 3's 55% conversion and contracted service fees are retained, then the model adds the 20% certified EU premium and its associated allowance.",
    assumptions: "55.45 kt/year product; improved conversion and availability; contracted circular fees; certified 20% premium; no China carbon-market, CBAM, or scandium value.",
    interpretation: "This is the strongest central upside case, not the base forecast. It offers the best return, but only if the plant, suppliers, certifier, and product buyer all deliver their respective parts of the value stack.",
    production: 55.45,
    revenue: 707.6,
    opex: 241.9,
    ebitda: 465.7,
    npv: 1150.6,
    rampNpv: 943.5,
    irr: "15.6%",
    payback: "6.0 y",
    tone: "positive",
  },
] as const;

export const towngasBreakEven = [
  { premium: "0%", netback: "7,500", product: 45.54, efficiency: 45.2, npv55: 630 },
  { premium: "10%", netback: "8,250", product: 43.82, efficiency: 43.5, npv55: 814 },
  { premium: "20%", netback: "9,000", product: 40.38, efficiency: 40.0, npv55: 1151 },
  { premium: "30%", netback: "9,750", product: 37.57, efficiency: 37.3, npv55: 1479 },
] as const;

export const towngasEconomicRisks = [
  { change: "TCI rises to RMB 4.0bn", impact: "−RMB 1.186bn NPV", meaning: "Destroys the improved + premium case." },
  { change: "Availability falls 10%", impact: "≈−RMB 0.5–0.7bn NPV", meaning: "Salt separation and train turnaround are commercial variables." },
  { change: "Netback falls RMB 1,000/t", impact: "≈−RMB 472m NPV", meaning: "Offtake quality and market positioning matter at 55.45 kt/year." },
  { change: "Waste fee falls RMB 100/t", impact: "≈−RMB 680m NPV", meaning: "The waste-service contract is more valuable than a cosmetic by-product credit." },
  { change: "Qualified ammonium sulfate adds RMB 30m/y net", impact: "+RMB 255m NPV", meaning: "Useful upside after product qualification, but insufficient to rescue the 42% commodity case alone." },
] as const;

export const towngasRouteAlternatives = [
  {
    id: "oxzeo",
    route: "OXZEO light olefins",
    configuration: "Retain B1–B6 and the full B7 synthesis, recycle, and C₂–C₄ recovery island.",
    scale: "55.45 kt/year at the 55% feed-carbon target",
    strength: "Highest screened product value and strongest differentiation for certified chemical markets.",
    weakness: "Highest catalyst, scale-up, reformer-duty, and product-separation risk.",
  },
  {
    id: "methanol",
    route: "Renewable methanol",
    configuration: "Retain B1–B6, replace OXZEO and deep olefin fractionation with a mature methanol loop and distillation.",
    scale: "138.2 kt/year screen at 60% carbon efficiency on the same B1 feed",
    strength: "Mature synthesis, liquid storage, and established chemical/marine logistics.",
    weakness: "Lower value density; B6 usually remains because B2 gas is methane-rich. Vendor battery-limit economics are still required.",
  },
  {
    id: "methane",
    route: "Renewable methane",
    configuration: "Retain B1–B5, then replace most of B6/B7 with CO₂ removal, drying, compression, and grid or LNG conditioning.",
    scale: "Capacity depends on measured B2 gas composition and methane recovery",
    strength: "Lowest downstream complexity and avoids the endothermic methane round-trip.",
    weakness: "Requires a firm gas offtake or premium; methane slip becomes a critical greenhouse-gas control.",
  },
] as const;

export const towngasDecisionLedger = [
  { topic: "Feed", position: "Douzha remains the anchor. Cassava, clean pulp/liquor, and controlled straw adjust carbon; manure is a separate qualified campaign." },
  { topic: "Location", position: "The Guangxi–Guangdong / Beibu Gulf corridor is an opportunity, not a selected site. Decide from supplier-level delivered-cost data." },
  { topic: "Scale", position: "Ten 300 t/day B1–B4 trains merge after B4 into shared B5–B7 units; common critical equipment uses N+1 redundancy." },
  { topic: "Salt", position: "Salt precipitation is desired at B3 and is the principal availability risk; prove twin continuous withdrawal, switching, and flush recovery." },
  { topic: "Residue", position: "Target one-pass conditioning with a second-wash/retreatment fallback. Do not claim guaranteed product status or indefinite recycle." },
  { topic: "Nitrogen + chloride", position: "Recover ammonia after qualification and maintain explicit supplier limits, wash, recycle-water monitoring, and controlled purge." },
  { topic: "Bi-reforming", position: "Retain B6 because central SCWG gas is methane-rich. Treat methane suppression as an optimisation rather than a design assumption." },
  { topic: "Certification", position: "Keep PCF, ISCC, waste treatment, and product claims separate. Treat EU premium as contractual and take no CBAM credit." },
  { topic: "Economics", position: "The 42% commodity case remains negative. At current conversion, contracts plus a 20% premium are only marginally positive after ramp-up; 55% conversion with contracted service value is materially more robust." },
  { topic: "Fallback route", position: "If salt availability, carbon conversion, or offtake cannot be demonstrated, compare complete methanol and renewable-methane packages on the same feed and contract basis rather than adding more slurry capacity." },
] as const;

export const towngasOpenEvidence = [
  { id: "B-01", claim: "B1 is pumpable and restartable at 20.8 wt% solids.", evidence: "Full-scale cold and hot pump/restart loop on seasonal supplier blends." },
  { id: "B-02", claim: "90% of feed carbon reaches B4 raw gas.", evidence: "Continuous carbon closure including gas, water, solids, and purge." },
  { id: "B-03", claim: "B3 withdraws salt continuously.", evidence: "Representative mixed-feed hot loop with underflow, wall-deposition, switch, and flush recovery." },
  { id: "B-04", claim: "B8 residue meets a destination specification.", evidence: "Wash trials, XRF/XRD, Na/Cl, leaching, legal status, and customer performance." },
  { id: "B-05", claim: "B4 can recover 75% of feed nitrogen.", evidence: "Real-liquor removal, acid demand, impurity profile, and ammonium-sulfate product registration." },
  { id: "B-06", claim: "B5 can hold total sulfur below 0.1 ppmv.", evidence: "Rectisol/ZnO licensor guarantee across start-up, train switching, and off-spec transients." },
  { id: "B-07", claim: "B6 can meet the 290 GJ/day-per-train-equivalent duty screen.", evidence: "Rigorous real-gas equilibrium plus vendor furnace, tube-life, steam, and decoking balance." },
  { id: "B-08", claim: "The integrated plant can sustain 42–55% feed-carbon efficiency.", evidence: "Long-duration B7 real-gas balance including recycle, purge, catalyst cycle, and product recovery." },
  { id: "B-09", claim: "Total capital can remain near RMB 2.8 billion.", evidence: "Chinese vendor budget quotations and project-specific construction and contingency factors." },
  { id: "B-10", claim: "The contracted organic service-fee case is available.", evidence: "Binding supplier terms after logistics, moisture/carbon adjustment, contamination liability, and competing-use review." },
  { id: "B-11", claim: "A certified 10–30% product premium is bankable.", evidence: "Binding certified-volume offtake and delivered-cost schedule." },
  { id: "B-12", claim: "The twenty-year operating convention is realistic.", evidence: "Ramp-up, catalyst cycle, major-turnaround, correlated-outage, and asset-life plan." },
] as const;

export const towngasReferences = [
  { id: "report", title: "Towngas SCWG–OXZEO Process Design — public project report", detail: "Authoritative disclosure boundary for this public website; August 2026" },
  { id: "operations", title: "Operating windows and train management", detail: "§5.10 and Table 5.6" },
  { id: "mass", title: "Closed mass, carbon, and production balances", detail: "§6 and Tables 6.1–6.8" },
  { id: "energy", title: "Energy balance and heat recovery", detail: "§7 and Tables 7.1–7.4" },
  { id: "assurance", title: "Equipment, materials, chloride control, safety, and analysis", detail: "§8 and Tables 8.1–8.6" },
  { id: "cert", title: "Certification and market positioning", detail: "§9 and public claim-control ledger" },
  { id: "economics", title: "China CAPEX, OPEX, route comparisons, and 20-year evaluation", detail: "§10 and Tables 10.1–10.12; private methanol component breakdown omitted" },
] as const;

export const towngasPublicRestrictedSources = Array.from({ length: 11 }, (_, index) => ({
  id: String(index + 36),
  title: index === 0 ? "Restricted commercial benchmark" : `Industrial technical reference ${String.fromCharCode(96 + index)}`,
  detail: "Source identity, original document title, facility attribution, and detailed source description are withheld from the public edition. Technical values are reproduced only where authorised.",
})) as readonly { id: string; title: string; detail: string }[];

export const towngasCaseStudy = {
  meta: towngasCaseStudyMeta,
  technologyLabels: towngasTechnologyLabels,
  evidenceLegend: towngasEvidenceLegend,
  designMetrics: towngasDesignMetrics,
  reasoning: towngasReasoning,
  wastePair: towngasWastePair,
  centralRecipe: towngasCentralRecipe,
  blendCases: towngasBlendCases,
  compatibleCoFeeds: towngasCompatibleCoFeeds,
  feedAcceptance: towngasFeedAcceptance,
  sitingLogic: towngasSitingLogic,
  processStages: towngasProcessStages,
  chemistry: towngasChemistry,
  operatingTransitions: towngasOperatingTransitions,
  availability: towngasAvailability,
  massBalance: towngasMassBalance,
  carbonCases: towngasCarbonCases,
  carbonEfficiencyBridge: towngasCarbonEfficiencyBridge,
  energyCascade: towngasEnergyCascade,
  publicPlanningInputs: towngasPublicPlanningInputs,
  majorEquipment: towngasMajorEquipment,
  chlorideControls: towngasChlorideControls,
  hazop: towngasHazop,
  analyticalPlan: towngasAnalyticalPlan,
  certification: towngasCertification,
  capex: towngasCapex,
  opexDrivers: towngasOpexDrivers,
  economicScenarios: towngasEconomicScenarios,
  breakEven: towngasBreakEven,
  economicRisks: towngasEconomicRisks,
  routeAlternatives: towngasRouteAlternatives,
  decisions: towngasDecisionLedger,
  openEvidence: towngasOpenEvidence,
  references: towngasReferences,
  publicRestrictedSources: towngasPublicRestrictedSources,
} as const;
