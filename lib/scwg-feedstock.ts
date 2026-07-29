import type {
  BlendConstraint,
  CompositionRow,
  FeedstockProfile,
  HeteroatomFate,
} from "@/lib/scwg-types";

// Section 1 of the technical report — feedstock characterization and blend
// design, drafted in full. Three feeds are specified together rather than
// sequentially, because alkali loading couples all three.

export const scwgFeedstockIntro =
  "Okara, soybean straw and red mud are characterized here on a common basis, and the blend ratio is set by three independent constraints rather than optimized against any one of them. Every heteroatom entering the system is given a named destination and a responsible unit — in a process whose products are sold against ISCC and ISO 14067 claims, \"somewhere\" has to be documented rather than assumed.";

export const scwgFeedstockProfiles: FeedstockProfile[] = [
  {
    id: "okara",
    name: "Okara",
    subtitle: "A feed defined by its water",
    paragraphs: [
      "Okara is the insoluble residue remaining after soybeans are ground, extracted and screened in soymilk and tofu manufacture. It is produced in very large volume across East Asia and is disposed of at cost or fed to livestock at low value, both of which set a favourable gate price for a conversion process.",
      "The defining physical property is water content. An independent characterization reports 46.3% dietary fibre, 17.8% protein, 5.9% lipid and 3.9% ash on a dry basis, which brackets the variability introduced by cultivar and extraction severity.",
    ],
    analyses: [
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
        body: "At 80–85 wt% water, okara arrives at roughly the concentration a supercritical water gasifier wants. Any dry gasification route would spend more energy evaporating this water than the resulting gas contains — the standard argument for hydrothermal processing of wet feeds, and here it is decisive rather than marginal.",
      },
      {
        title: "Lignin is essentially absent",
        body: "Okara's fibre is cellulosic and pectic rather than lignified. Lignin is the fraction most resistant to hydrothermal depolymerization and the dominant char precursor, so its absence predicts high carbon conversion and low char at comparatively mild severity.",
      },
      {
        title: "Nitrogen and sulfur are structural",
        body: "At roughly 27 wt% protein the C/N ratio is approximately 5.8, and the sulfur-bearing amino acids cysteine and methionine put organic sulfur into the feed. Both heteroatoms report to the aqueous and gas phases and both must be given a designed destination. A measured ultimate analysis of the specific okara source is required.",
      },
    ],
  },
  {
    id: "straw",
    name: "Soybean straw",
    subtitle: "The dry-solids and carbon-density partner",
    paragraphs: [
      "Soybean straw is the field residue — stems, pods and petioles — left after grain harvest. It is lignocellulosic and carries a potassium- and silica-bearing ash typical of agricultural residues. Its C/N ratio is the mirror image of okara's, which is the reason the two are blended rather than run separately.",
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
    boundingVariable: "Okara : straw mass ratio (dry)",
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
    boundingVariable: "Okara protein fraction",
    designWindow: "Sets the sulfur train, not the blend",
    binding: "No",
  },
];

export const scwgBlendNotes = [
  "Constraint 1 — pumpability sets the upper bound on solids. Feeding solids into a 25 MPa reactor is the recurring practical failure of supercritical water gasification at scale. Okara is the rheological advantage: its fine, hydrated fibre particles form a pumpable paste rather than a settling suspension, which is exactly the behaviour that corn starch paste was added to sewage sludge to create. Okara can therefore act as the carrier medium for milled straw that would otherwise settle and bridge.",
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
    source: "Okara protein (dominant); straw (minor)",
    form: "NH₃, some N₂; ammonia is the stable intermediate under hydrothermal conditions",
    fate: "Aqueous phase → salt separator brine → fertilizer-grade N-K-P-S product, or ammonium sulfate via the sulfur train",
  },
  {
    element: "S",
    source: "Okara cysteine / methionine",
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
    source: "Okara phytate",
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
