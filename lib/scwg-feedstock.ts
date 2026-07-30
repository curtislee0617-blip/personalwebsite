import type {
  BlendConstraint,
  CoFeedRow,
  CompositionRow,
  FeedstockProfile,
  HeteroatomFate,
  ProvinceRow,
  SolidsBudgetRow,
} from "@/lib/scwg-types";

// Section 1 of the technical report — feedstock characterization and blend
// design, drafted in full. Three feeds are specified together rather than
// sequentially, because alkali loading couples all three.

export const scwgFeedstockIntro =
  "Douzha, soybean straw and red mud are characterized here on a common basis, and the blend ratio is set by three independent constraints rather than optimized against any one of them. Every heteroatom entering the system is given a named destination and a responsible unit — in a process whose products are sold against ISCC and ISO 14067 claims, \"somewhere\" has to be documented rather than assumed.";

export const scwgFeedstockProfiles: FeedstockProfile[] = [
  {
    id: "douzha",
    name: "Douzha",
    subtitle: "A feed defined by its water",
    paragraphs: [
      "Douzha — 豆渣 in Chinese, okara in Japanese, biji in Korean — is the insoluble residue remaining after soybeans are ground, extracted and screened in soymilk and tofu manufacture. Roughly 1.1–1.2 kg arises per kg of soybeans processed into curd. Most is landfilled: the 70–85% moisture content makes it spoil within days and gives it negative value at the gate, which is precisely the favourable feedstock economics this project depends on.",
      "Supply is ample in aggregate and constrained locally. A 100 t/d wet-feed plant consumes 36,500 t/y, so national arisings could in principle support of order seventy such plants. The binding constraint is collection radius against spoilage rather than tonnage — and this is the quantitative form of the industrial-versus-fragmented distinction the siting analysis draws. A single large soy beverage plant plausibly yields 150–330 t/d and can therefore supply a plant of this scale on its own, whereas the same tonnage aggregated from tofu workshops requires hundreds of collection points inside a spoilage-limited radius.",
      "The defining physical property is water content. An independent characterization reports 46.3% dietary fibre, 17.8% protein, 5.9% lipid and 3.9% ash on a dry basis, which brackets the variability introduced by cultivar and extraction severity.",
    ],
    analyses: [
      { label: "Yield per kg soybean (curd)", value: "1.1–1.2 kg", indicative: true },
      { label: "China arisings", value: "~2.8 Mt/y", indicative: true },
      { label: "Japan / Korea arisings", value: "0.8 / 0.31 Mt/y", indicative: true },
      { label: "Large beverage plant output", value: "150–330 t/d", indicative: true },
      { label: "Moisture (wet basis)", value: "82.8 wt%", source: "Li-2012" },
      { label: "Protein (wet basis)", value: "6.34 wt%", source: "Li-2012" },
      { label: "Lipid (wet basis)", value: "0.86 wt%", source: "Li-2012" },
      { label: "Ash (wet basis)", value: "0.65 wt%", source: "Li-2012" },
      { label: "Protein (dry basis)", value: "≈27 wt%", source: "Li-2012" },
      { label: "Crude fat (dry basis)", value: "≈10 wt%", source: "Li-2012" },
      { label: "Soluble fibre (dry basis)", value: "≈14 wt%", source: "Li-2012" },
      { label: "Insoluble fibre (dry basis)", value: "≈42 wt%", source: "Li-2012" },
      { label: "Ash (dry basis)", value: "≈3 wt%", source: "Li-2012" },
      { label: "C/N ratio", value: "≈5.8", source: "Li-2012" },
      {
        label: "Organic sulfur (dry basis)",
        value: "low tenths of a percent",
        indicative: true,
      },
    ],
    consequences: [
      {
        title: "The moisture is an asset, not a penalty",
        body: "At 80–85 wt% water, douzha arrives at roughly the concentration a supercritical water gasifier wants. Any dry gasification route would spend more energy evaporating this water than the resulting gas contains — the standard argument for hydrothermal processing of wet feeds, and here it is decisive rather than marginal.",
      },
      {
        title: "Lignin is essentially absent",
        body: "Douzha's fibre is cellulosic and pectic rather than lignified. Lignin is the fraction most resistant to hydrothermal depolymerization and the dominant char precursor, so its absence predicts high carbon conversion and low char at comparatively mild severity.",
      },
      {
        title: "The national arisings figure needs a basis before it is used",
        body: "The ~2.8 Mt/y figure for China is reported without a stated basis and is most likely wet mass. It must be confirmed as wet or dry before it enters any capacity calculation, because the two differ by roughly fivefold.",
      },
      {
        title: "Nitrogen and sulfur are structural",
        body: "At roughly 27 wt% protein the C/N ratio is approximately 5.8, and the sulfur-bearing amino acids cysteine and methionine put organic sulfur into the feed. Both heteroatoms report to the aqueous and gas phases and both must be given a designed destination. A measured ultimate analysis of the specific douzha source is required.",
      },
    ],
  },
  {
    id: "straw",
    name: "Soybean straw",
    subtitle: "The dry-solids and carbon-density partner",
    paragraphs: [
      "Soybean straw is the field residue — stems, pods and petioles — left after grain harvest. It is lignocellulosic and carries a potassium- and silica-bearing ash typical of agricultural residues. Its C/N ratio is the mirror image of douzha's, which is the reason the two are blended rather than run separately.",
      "Soybean straw is a demonstrated supercritical water gasification substrate in its own right. Catalytic supercritical water gasification over Ni-based catalysts with varied supports and promoters has been reported, with ZrO₂ the most effective support for H₂ yield and selectivity among activated carbon, carbon nanotubes, ZrO₂, Al₂O₃, SiO₂ and Al₂O₃–SiO₂ at 10 wt% Ni loading. That work is the closest published analogue to the biomass half of this system.",
    ],
    analyses: [
      { label: "Moisture (as received)", value: "10–15 wt%", indicative: true },
      { label: "C/N ratio", value: "≈60–80", indicative: true },
      { label: "Ash character", value: "K- and Si-bearing", indicative: true },
      { label: "Best Ni support (H₂ yield)", value: "ZrO₂ at 10 wt% Ni", source: "Okolie-2021" },
    ],
  },
  {
    id: "red-mud",
    name: "Red mud",
    subtitle: "Composition, alkalinity and three latent functions",
    paragraphs: [
      "Bauxite residue from the Bayer process is generated at over 120 Mt per year globally and is overwhelmingly impounded rather than used. Its composition varies with the source bauxite but sits in well-established ranges.",
      "Leachate pH is 12.1–13.0, driven by the sodium content. This alkalinity is the primary reason the material is classified as hazardous and the primary barrier to its reuse — and it is what the gasifier is designed to remove.",
    ],
    analyses: [
      { label: "Global generation", value: ">120 Mt/y", source: "Wang-Liu-2012" },
      { label: "Leachate pH", value: "12.1–13.0", source: "Wang-Liu-2012" },
      { label: "Scandium content", value: "~84 ppm (16–230 ppm range)", source: "Zhang-2017" },
    ],
  },
];

/** The single strongest argument in the report — called out on its own. */
export const scwgDealkalizationSynergy = {
  title: "The dealkalization synergy — the strongest single argument",
  body: "Supercritical water treatment of red mud has been shown to give enhanced dealkalization performance, and — critically — the dealkalized residue exhibits improved SO₂ capture capacity. That single result closes the loop three ways. It removes the sodium that would otherwise foul the reactor. It detoxifies the residue, converting a hazardous impoundment liability into a saleable material. And it produces, as the treated solid, a sulfur sorbent — meaning the process generates part of its own desulfurization capacity and an external sorbent product besides.",
  consequence:
    "This is the load-bearing claim of the whole concept and must be verified experimentally first. If supercritical dealkalization does not proceed at the residence times required for biomass gasification, the economics revert to those of a conventional wet-biomass gasifier with a cheap iron catalyst — a much weaker proposition.",
  source: "Wang-2023",
};

export const scwgBlendIntro =
  "The blend ratio is not a free variable. Three independent constraints bound it, and the design point is the intersection rather than an optimization of any single one.";

export const scwgBlendConstraints: BlendConstraint[] = [
  {
    constraint: "Slurry pumpability",
    boundingVariable: "Total solids; particle size distribution",
    designWindow: "18–22 wt% total solids; straw milled to <0.5 mm",
    binding: "Yes — upper bound",
    indicative: true,
  },
  {
    constraint: "C/N ratio",
    boundingVariable: "Douzha : straw mass ratio (dry)",
    designWindow: "Combined C/N 15–25",
    binding: "Soft",
  },
  {
    constraint: "Alkali loading",
    boundingVariable: "Red mud dose + straw K",
    designWindow: "Set by salt separator duty",
    binding: "Yes — couples all three feeds",
  },
  {
    constraint: "Sulfur loading",
    boundingVariable: "Douzha protein fraction",
    designWindow: "Sets the sulfur train, not the blend",
    binding: "No",
  },
];

export const scwgBlendNotes = [
  "Constraint 1 — pumpability sets the upper bound on solids. Feeding solids into a 25 MPa reactor is the recurring practical failure of supercritical water gasification at scale. Douzha is the rheological advantage: its fine, hydrated fibre particles form a pumpable paste rather than a settling suspension, which is exactly the behaviour that corn starch paste was added to sewage sludge to create. Douzha can therefore act as the carrier medium for milled straw that would otherwise settle and bridge.",
  "Constraint 2 — C/N balance. Unlike anaerobic digestion, supercritical water gasification is not inhibited by ammonia in the way a methanogenic consortium is, so C/N is not a hard operating constraint. It matters for two downstream reasons: the ammonia concentration in the aqueous effluent determines whether nitrogen recovery is worthwhile, and the nitrogen loading determines the corrosivity and composition of the salt-separator brine. Blending to a combined C/N of 15–25 puts the brine into a directly fertilizer-compatible band.",
  "Constraint 3 — alkali loading. Red mud brings its own sodium; the straw brings potassium. Together these set the total alkali the salt separator must remove per unit of feed, and that duty scales the separator rather than the reactor. Alkali loading is the constraint that couples the biomass blend to the red mud dosing, and it is why the three feed streams have to be specified together rather than sequentially.",
];

export const scwgRedMudComposition: CompositionRow[] = [
  {
    component: "Fe₂O₃",
    typicalRange: "30–60",
    representative: "36.87",
    functionNote: "Oxygen carrier / redox mediator; water-gas shift and tar cracking activity",
  },
  {
    component: "Al₂O₃",
    typicalRange: "10–20",
    representative: "22.11",
    functionNote: "Structural support; contributes to sintering resistance",
  },
  {
    component: "SiO₂",
    typicalRange: "3–50",
    representative: "18.72",
    functionNote: "Inert diluent; forms iron silicates that deactivate the redox couple",
  },
  {
    component: "Na₂O",
    typicalRange: "2–10",
    representative: "11.70",
    functionNote: "Alkali reservoir — tar cracking and WGS promotion; also the source of salt plugging and the target of dealkalization",
  },
  {
    component: "TiO₂",
    typicalRange: "trace–10",
    representative: "3.14",
    functionNote: "Inert here; a recovery target in the residue valorization block",
  },
  {
    component: "CaO",
    typicalRange: "2–8",
    representative: "2.49",
    functionNote: "Native alkalinity; contributes to but does not substitute for a dedicated sulfur sorbent",
  },
  {
    component: "Sc",
    typicalRange: "16–230 ppm",
    representative: "~84 ppm",
    functionNote: "Recovery target — sets a secondary revenue line",
  },
];

export const scwgHeteroatomIntro =
  "Every heteroatom entering the system must leave it somewhere. The table assigns a destination to each element and names the unit responsible.";

export const scwgHeteroatomFates: HeteroatomFate[] = [
  {
    element: "N",
    source: "Douzha protein (dominant); straw (minor)",
    form: "NH₃, some N₂; ammonia is the stable intermediate under hydrothermal conditions",
    fate: "Aqueous phase → salt separator brine → fertilizer-grade N-K-P-S product, or ammonium sulfate via the sulfur train",
  },
  {
    element: "S",
    source: "Douzha cysteine / methionine",
    form: "Aqueous sulfide / sulfate under alkaline reducing conditions; balance as H₂S with traces of COS and thiophenes",
    fate: "Calcium-free three-stage train: bulk capture into the B3 brine as the S of N-K-P-S → dealkalized red mud polishing → ZnO guard to OXZEO specification",
  },
  {
    element: "Na",
    source: "Red mud (11.7 wt% as Na₂O)",
    form: "Dissolved Na⁺, precipitating as salts above the critical point",
    fate: "Salt separator — designed removal, not a loss. Simultaneously dealkalizes the residue",
  },
  {
    element: "K",
    source: "Soybean straw ash",
    form: "Dissolved K⁺, co-precipitating with Na",
    fate: "Salt separator brine — raises the fertilizer value of the brine",
  },
  {
    element: "Cl",
    source: "Both biomass streams; process water",
    form: "HCl / chloride",
    fate: "Corrosion driver, and competitor for red mud alkalinity in the polishing bed. Removing calcium eliminates the HCl-versus-Ca capacity problem but not the corrosion duty. Must be quantified before materials selection",
    dataGap: true,
  },
  {
    element: "P",
    source: "Douzha phytate",
    form: "Phosphate",
    fate: "Brine — completes the N-P-K fertilizer specification",
  },
  {
    element: "Fe",
    source: "Red mud",
    form: "Reduced oxide phases (Fe₃O₄ / FeO)",
    fate: "Retained in the solid; re-oxidized in the regeneration loop or recovered carbothermically",
  },
  {
    element: "Sc, Ti",
    source: "Red mud",
    form: "Unchanged oxides",
    fate: "Concentrated in the spent solid → leaching recovery as a secondary revenue line",
  },
];

export const scwgChlorideNote = {
  title: "Chloride deserves specific emphasis",
  body: "It is the element most often left out of this kind of table, and its role changed when calcium was removed. In a calcium-based train chloride is a direct capacity competitor: HCl reacts not only with fresh CaO and Ca(OH)₂ but also with spent sorbent containing calcium carbonate, oxide and hydroxide, and after calcining and slaking the spent material recovers essentially the reactivity of pure Ca(OH)₂ toward HCl — so chloride consumes calcium inventory across the whole sorbent life cycle, not only the fresh charge. Eliminating calcium removes that failure mode, which is one of the arguments for the decision. Chloride does not become harmless, though: it remains a corrosion driver in a supercritical, alkaline, sulfide-bearing environment where internals are already specified in nickel-base alloys, and it remains a competitor for alkalinity in the polishing bed by the same chemistry that made it compete for lime.",
  source: "Wang-Bjerle-1996",
};


// ── §1.6 The solids budget — the binding constraint on the whole design ───────

export const scwgSolidsBudget = {
  label: "The solids budget",
  title: "The binding constraint is pumpability, not moisture",
  intro: [
    "The blend constraints above were expressed as independent bounds. Closing the arithmetic shows they are not independent, and that the pumpability ceiling is far more restrictive than it first appears. This is the single most consequential finding in Section 1, and it propagates into every downstream block.",
    "Douzha arrives at approximately 17.2 wt% solids on an 82.8% moisture basis. That is already inside the 18–22 wt% design window with no dewatering whatsoever, which is a genuine argument for the feedstock and the reason no thickening step appears in B1. But it also means the solids budget is almost entirely consumed before any other component is added.",
    "Take 100 kg of wet douzha as received: 17.2 kg of solids, of which roughly 0.5 kg is ash and 16.7 kg organic. Now dose red mud. At only 5 kg of residue the slurry is at 22.2 kg solids in 105 kg total — 21.1 wt%, already at the ceiling, with no straw in the blend at all. Red mud is inorganic dead weight in this budget: it consumes pumpability headroom without contributing carbon or hydrogen.",
  ],
  rows: [
    {
      component: "Douzha (as received, 17.2 wt% solids)",
      contributesSolids: "Yes — 17.2 wt%",
      contributesCarbon: "Yes",
      effect: "Consumes ~78–96% of the available window on its own. Requires no dewatering.",
    },
    {
      component: "Red mud",
      contributesSolids: "Yes",
      contributesCarbon: "No",
      effect: "Dead weight. 5 kg per 100 kg douzha reaches the ceiling unaided.",
    },
    {
      component: "Soybean straw",
      contributesSolids: "Yes",
      contributesCarbon: "Yes",
      effect: "Competes directly with red mud for the remaining headroom.",
    },
    {
      component: "Dilution water",
      contributesSolids: "Reduces wt%",
      contributesCarbon: "No",
      effect: "Buys headroom, but must then be heated to 600 °C for no return.",
    },
  ] satisfies SolidsBudgetRow[],
  caption:
    "Table 1.4 — Red mud dosing and straw loading are in direct competition. The constraint chain is: douzha solids + straw + red mud ≤ ~22 wt%.",
  fourWayTrade:
    "Every route out of this is costly, and the four should be presented as a genuine trade rather than picking one silently. Diluting with water buys headroom but imposes a sensible-heat penalty on inert mass all the way to 600 °C. Cutting the red mud dose weakens both the catalytic function and the dealkalization duty — and dealkalization is the concept. Cutting straw sacrifices carbon density and the C/N benefit. Dewatering the douzha upstream is the obvious answer and the worst one: it is a hydrated gel that dewaters poorly, and mechanical dewatering is energy-intensive and incomplete.",
  correction:
    "This finding also corrects a framing error earlier in the work. Douzha was described as the slurry carrier that allows milled straw into the reactor. That remains true rheologically, but the headroom available for straw is much smaller than that framing implies, and in a red-mud-rich case it may approach zero. Section 5 must treat the douzha : straw : red mud : water split as a constrained optimization with the 22 wt% ceiling as an active constraint, not as four independently chosen dosing rates.",
} as const;

// ── §1.7 Slurry formulation ──────────────────────────────────────────────────

export const scwgSlurryFormulation = {
  label: "Slurry formulation",
  title: "Whether dispersants and stabilizers are required",
  paragraphs: [
    "Coal–water slurry practice reaches for dispersants — naphthalene sulfonate condensates, lignosulfonates, polycarboxylates — to solve two problems this system does not have: wetting a hydrophobic solid, and suppressing viscosity at 60–70 wt% loading. Douzha is hydrophilic, arrives fully hydrated, and the target loading is around 20 wt%. On the biomass fraction, no wetting agent is required.",
    "The feed additionally supplies its own surfactant. Residual soy protein and phospholipids are amphiphilic — soy lecithin is a commercial emulsifier derived from the same source material — so the organic fraction is substantially self-dispersing. This is a real and underused argument for the feedstock.",
    "The suspension problem that does exist is the red mud, not the biomass. Haematite has a density near 5.2 g/cm³ and the residue is finely divided, so it will settle out of a matrix that comfortably suspends its own fibre. Any additive requirement therefore arises from mineral suspension stability, not from organic wetting — a distinction that determines which additive class is even relevant.",
  ],
  trap: {
    title: "The additive trap: both standard choices inject the contaminant this flowsheet exists to remove",
    body: "Sodium carboxymethyl cellulose is the documented stabilizer for supercritical water gasification slurry feeding, and it works — one overview reports it reaching above 40% carbon gasification efficiency at 540 °C and 25 MPa, and it is noted as more consistent and cheaper than tragacanth, gum arabic, guar or xanthan. But it is the sodium salt, and block B3 exists to strip sodium from this system. Dosing sodium into the feed to fix rheology, then paying separation duty to remove it again, is self-defeating. Lignosulfonate, the other standard dispersant, injects organically bound sulfur directly into the acid gas removal duty a Rectisol unit has just been committed to handling.",
  },
  resolution:
    "If a stabilizer proves necessary, xanthan gum is the clean selection: no sodium, no sulfur, strongly shear-thinning, effective at low dose. The literature notes xanthan delivers the same function at higher cost and lower batch consistency — an acceptable premium here, because the cheap option carries a process penalty rather than merely a price.",
  firstQuestion:
    "The first question, though, is whether any additive is needed. Slurries at 30–50 wt% loading are reported as shear-thinning while 10–20 wt% loadings shear-thicken, so a ~20 wt% blend sits near an unfavourable rheological transition and its behaviour cannot be assumed. A recirculating feed loop with in-line static mixing and minimal residence between mixer and pump suction may remove the requirement entirely. No additive is always preferable to a clean additive.",
} as const;

// ── §1.8 Co-feeding other wet organic wastes ─────────────────────────────────

export const scwgCoFeedIntro = [
  "Supercritical water gasification is a credible route for a wide range of wet organic wastes, so whether to widen the feed slate beyond douzha and soybean straw deserves an explicit answer rather than silence. The chemistry is largely permissive. The commercial answer is much narrower, and for a reason specific to this flowsheet.",
  "The governing constraint is residue purity, not gas yield. The value case rests on selling dealkalized red mud as a supplementary cementitious material or sulfur sorbent, and on recovering iron, scandium and gallium from it. That is a materials-purity business. Any co-feed whose inorganic contaminants partition into the solid phase degrades the product the project depends on. Co-feeding therefore trades gas yield against residue saleability — and residue saleability is where the margin sits.",
];

export const scwgCoFeeds: CoFeedRow[] = [
  {
    feed: "Soybean straw",
    caseFor: "Same supply chain, no contaminant burden, complementary C/N",
    risk: "Competes only for the solids budget.",
    verdict: "design basis",
  },
  {
    feed: "Pig manure",
    caseFor:
      "Proven supercritical water gasification feed; abundant; genuinely co-located with straw in the Northeast; adds N/K/P to the brine product; supercritical water destroys veterinary antibiotics and antibiotic resistance genes, which is a regulatory asset rather than merely neutral",
    risk: "Moderate Cu and Zn from feed additives will report to the solid. Best reported gas figures are at ~6 wt% feed concentration, far below this design point.",
    verdict: "evaluate first",
  },
  {
    feed: "Food waste",
    caseFor: "High moisture and lipid content, energy-dense, abundant and urban",
    risk: "Chinese food waste carries high chloride from cooking salt, feeding directly into the corrosion and materials-selection problem already flagged.",
    verdict: "caution",
  },
  {
    feed: "Sewage sludge",
    caseFor:
      "The closest chemistry match in the literature, with an established red mud co-gasification precedent and a phosphorus recovery credit",
    risk: "Heavy metals — Cd, Pb, Cr, Cu, Zn — partition into the solid and foreclose the cementitious and sorbent product routes. Rejected on residue purity, not on chemistry.",
    verdict: "rejected",
  },
  {
    feed: "Human faeces / septage",
    caseFor: "Technically near-identical to sewage sludge",
    risk: "Certification and public-acceptance exposure. Compromises the ISCC claim and any fertilizer product derived from the brine.",
    verdict: "rejected",
  },
];

export const scwgCoFeedCaption =
  "Table 1.5 — Ranked by residue-purity risk rather than by gasification performance, because the residue is the product that carries the economics.";

// ── §1.9 Feedstock geography: the five red-mud-producing provinces ────────────

export const scwgProvinceIntro = [
  "Red mud arises from the Bayer process in alumina refining. Aluminium smelting consumes alumina electrolytically and generates no bauxite residue whatsoever — its wastes are spent pot lining, carbon anode residues and fluoride-bearing dust — so smelter locations are irrelevant to this feedstock and are excluded from the analysis entirely. The distinction matters because the two industries follow opposite siting logic: smelting chases cheap electricity, which is why provinces such as Xinjiang and Yunnan hold large aluminium capacity, whereas refining follows bauxite and caustic logistics.",
  "Chinese alumina refining is highly concentrated. Shandong, Shanxi, Henan, Guangxi and Guizhou together account for approximately 95% of national capacity, with Shandong, Shanxi and Guangxi alone exceeding 70%. Red mud is generated at every refinery in these five provinces, and they therefore constitute the complete candidate set for siting this plant.",
];

export const scwgProvinces: ProvinceRow[] = [
  {
    province: "Guangxi",
    centres: "Baise, Pingguo, Fangchenggang (~2.4 Mt/y)",
    assessment:
      "Strongest candidate. Roughly 400–700 km from Pearl River Delta industrial soy beverage plants, pairing real refining capacity with traceable point-source douzha.",
    rank: "strongest",
  },
  {
    province: "Henan",
    centres: "Zhengzhou, Sanmenxia, Jiaozuo",
    assessment:
      "Refining capacity plus very high population density, so fragmented tofu douzha is generated on top of the residue. No haul at all, but a self-declared supply chain that is the weakest control point in the project.",
    rank: "dark horse",
  },
  {
    province: "Shandong",
    centres: "Binzhou / Zouping (Weiqiao), Chiping (Xinfa), Zibo",
    assessment:
      "Largest provincial capacity and the largest red mud arising, but its soybean industry crushes imported beans for meal, which yields no douzha. Maximum residue, no local feedstock partner — an apparent match that is not one.",
    rank: "trap",
  },
  {
    province: "Shanxi",
    centres: "Jiaokou / Lüliang (Xinfa), Xiaoyi, Hejin",
    assessment: "Major capacity, deep inland, no significant soy food processing within a spoilage-limited radius.",
    rank: "weak",
  },
  {
    province: "Guizhou",
    centres: "Guiyang, Zunyi (Chinalco)",
    assessment: "Moderate capacity, no meaningful douzha supply nearby.",
    rank: "weak",
  },
];

export const scwgProvinceCaption =
  "Table 1.6 — The five red-mud-producing provinces, ranked by suitability rather than by capacity. Centres and capacities are approximate and flagged as unverified pending a primary source.";

export const scwgProvinceClosing =
  "The geography is unfavourable and the work states that plainly rather than presenting a synergy story. Douzha arises where soy foods are manufactured, soybean straw where soybeans are cultivated, and neither coincides with alumina refining. No province in the candidate set holds red mud and douzha at scale together. Which stream moves is therefore a live design decision, and it is constrained more tightly than any thermodynamic variable in the flowsheet: red mud is dense, cheap and travels badly; douzha is 80% water and spoils within days; straw is bulky and low in density. Section 9 must carry the Guangxi and Henan cases as distinct siting scenarios rather than assuming a single site.";
