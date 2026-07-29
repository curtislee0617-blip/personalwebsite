// Why these two wastes. Sits between the compliance framing and the siting
// problem: before asking where the feeds are, the page has to justify why these
// two in particular, and what the pairing actually buys.

export const scwgRationaleIntro =
  "Two wastes, picked for each other rather than separately. Each one is awkward on its own in a way the other happens to fix, and the pairing is what makes a single reactor do two jobs at once. This section sets out why okara and bauxite residue, what each contributes, and what the combination can actually be turned into.";

/** Each feed's problem, and what the other feed does about it. */
export const scwgWhyPairs = [
  {
    id: "okara",
    feed: "Okara",
    problem: "Too wet to burn, too perishable to store",
    body: "Okara leaves a soymilk or tofu line at 80–85 wt% water. Every dry thermochemical route has to evaporate that water first, and doing so costs more energy than the resulting gas carries — which is why okara is normally fed to livestock at nominal value or paid to dispose of. It also spoils quickly, so it cannot be stockpiled or hauled far.",
    contribution:
      "In supercritical water the water stops being a cost and becomes the reaction medium. Okara arrives at almost exactly the concentration the gasifier wants. Its fine hydrated fibre also forms a pumpable paste rather than a settling suspension, which is what makes it possible to feed solids into a 25 MPa reactor at all — okara is the carrier that lets milled straw go in with it.",
  },
  {
    id: "red-mud",
    feed: "Bauxite residue",
    problem: "Alkaline, hazardous, and impounded rather than used",
    body: "Bayer-process residue is generated at over 120 Mt per year globally and is overwhelmingly stored behind dams rather than sold. Its leachate runs at pH 12–13, driven by residual sodium, and that alkalinity is both why it is classified as hazardous and why almost nobody will take it. Utilization sits in the low single-digit percent.",
    contribution:
      "It arrives with roughly 30–60 wt% Fe₂O₃, which is a credible low-cost redox mediator, and with the alkali that cracks tars and pushes water-gas shift toward hydrogen. It is, in effect, a free catalyst that a refinery currently pays to store.",
  },
];

export const scwgSynergyPoints = [
  {
    title: "The gasifier does two jobs in one pass",
    body: "The same conditions that gasify the biomass also strip sodium out of the red mud. Inorganic salt solubility collapses above the critical point, so the alkali that would otherwise foul the reactor leaves as a separable brine. One vessel is simultaneously a biomass converter and a bauxite residue treatment unit — and the treated residue comes out saleable, because dealkalization is exactly what was blocking its reuse.",
  },
  {
    title: "Each feed supplies what the other lacks",
    body: "Okara is nitrogen-rich at C/N ≈ 5.8 and carries almost no lignin, so it gasifies readily but is thin on carbon density. Straw is the mirror image at C/N ≈ 60–80. Red mud brings iron and alkali but no carbon at all. Blended, they hit a combined C/N of 15–25, which puts the recovered brine straight into a fertilizer-compatible band rather than making it an effluent problem.",
  },
  {
    title: "The catalyst is a waste, so the catalyst is free",
    body: "Red mud gives hydrogen yields comparable to commercial alkali catalysts, and a Ni–Cu bimetallic on a red mud support has reached 21.88 mmol/g H₂. Ordinarily a gasification catalyst is a purchased consumable; here it is a material with a negative gate price. That inverts the usual economics — the plant is paid to accept its own catalyst.",
  },
  {
    title: "The alkali problem and the sulfur problem partly cancel",
    body: "Sulfur from okara's cysteine and methionine partitions into the same alkaline brine as the sodium, so some of it leaves before the gas ever reaches the acid gas train. That is physics rather than a designed mechanism, and the downstream wash is deliberately sized without relying on it — but it is a real credit against the duty.",
  },
];

export const scwgProductPreviewIntro =
  "What the pairing can be turned into. The commercial case does not rest on olefins alone, and framing it that way understates it — four saleable streams and one avoided cost leave the battery limits.";

export const scwgProductPreview = [
  {
    stream: "C₂–C₄ light olefins",
    origin: "From the reformed syngas over an oxide–zeolite catalyst",
    value: "The bio-based premium over naphtha-cracker product, claimed by ISCC PLUS mass balance",
  },
  {
    stream: "N-K-P-S brine",
    origin: "The sodium, potassium and phosphate stripped out in the salt separator",
    value: "Compound fertilizer — but the real driver is the avoided nitrogen-removal cost on the effluent",
  },
  {
    stream: "Dealkalized residue",
    origin: "The treated red mud leaving the solids loop",
    value: "SO₂ sorbent, supplementary cementitious material or geopolymer precursor — and in every case it displaces landfill",
  },
  {
    stream: "Iron, scandium, titanium",
    origin: "Hydrometallurgy on the iron-depleted slag",
    value: "Iron units by volume; scandium at ~84 ppm is the value driver, though market depth caps it",
  },
  {
    stream: "Elemental sulfur",
    origin: "Liquid-redox recovery on the acid gas",
    value: "Modest revenue, but it replaces a spent-sorbent disposal stream with a commodity",
  },
];

export const scwgRationaleCaveat =
  "None of this is free. The pairing creates a genuine conflict — the alkali that makes red mud useful is the same alkali that plugs supercritical reactors — and the design resolves it by treating salt removal as a product step rather than a protective one. That decision, and the two others it sits alongside, are set out with the flowsheet.";
