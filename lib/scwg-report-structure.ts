import type { ReportSection } from "@/lib/scwg-types";

// Table A.1 of the technical report — the ten sections, the argument each has to
// carry, and how far each has actually been written. Shown on the page so a
// reader can see the true state of the work rather than inferring it.

export const scwgReportMeta = {
  kind: "Technical report — working draft",
  deliverableStatus: "Full report outline, with Sections 1 and 2 drafted in full",
  date: "27 July 2026",
  feedstockCase: "Okara + soybean straw co-slurry",
  redMudRole: "Oxygen carrier, gasification catalyst, alkali reservoir / tar cracker",
  complianceFrame: "ISO 14067 · EU CBAM · ISCC PLUS · RED III · China ETS / CCER",
} as const;

export const scwgProvenanceConvention = {
  title: "Provenance convention",
  body: "Values traceable to a specific source carry a citation resolving to the reference list. Values drawn from general engineering knowledge and not yet verified against a primary source are marked indicative, and must not survive into a final version without a citation. Open questions that change the design rather than merely the numbers are listed separately.",
} as const;

export const scwgReportStructureIntro =
  "The report is ten sections. Two are written; eight are specified but not yet drafted. This table is the honest state of the work — the argument each section has to carry, and whether it exists yet.";

export const scwgReportSections: ReportSection[] = [
  {
    number: 1,
    title: "Feedstock characterization and blend design",
    argument:
      "Okara, soybean straw and red mud characterized on a common basis; blend ratio set by three independent constraints — slurry pumpability, C/N, and alkali loading. Contaminant inventory (S, N, Cl, K, Na, P) with a designated fate for each element.",
    status: "drafted",
  },
  {
    number: 2,
    title: "Process concept and block architecture",
    argument:
      "Eight-block flowsheet. Red mud's three roles defined and their conflicts stated. The three design decisions: purposeful salt separator, bi-reforming stage, calcium-free sulfur train. Product slate and by-product dispositions.",
    status: "drafted",
  },
  {
    number: 3,
    title: "Thermodynamic and kinetic basis",
    argument:
      "Why supercritical water gasification yields CH₄/CO₂/H₂ and not CO: water-gas shift equilibrium in large water excess. Ionic versus free-radical regime transition near the critical point and what it means for the protein and lignin fractions. Sulfur and nitrogen speciation between aqueous and gas phases — now a primary result, since the sulfur train depends on it. High-severity methanation suppression recorded as evaluated and rejected, with reasoning.",
    status: "outlined",
  },
  {
    number: 4,
    title: "Red mud redox behaviour, catalysis and deactivation",
    argument:
      "Fe₂O₃ → Fe₃O₄ → FeO/Fe reduction sequence and which couple is accessible at 600–650 °C in supercritical water. Oxygen transport capacity versus the oxygen already available from water. Tar cracking by AAEM species. Sintering, Na loss, iron–silica interaction, and cycles to failure. Air regeneration and the heat it liberates.",
    status: "outlined",
  },
  {
    number: 5,
    title: "Mass and energy balance",
    argument:
      "Basis 100 t/d wet blend. Closed elemental balance on C/H/O/N/S/Na/K/Ca/Fe. Pumping and pressurization duty, feed–effluent heat recovery, reformer endotherm, compression to OXZEO pressure. Net energy ratio and the explicit cost of the make-methane-then-unmake-methane loop.",
    status: "outlined",
  },
  {
    number: 6,
    title: "Heteroatom management: S, N, Cl, alkali",
    argument:
      "The calcium-free sulfur train: aqueous partitioning in B3, dealkalized red mud polishing, ZnO guard sized for upstream underperformance. The CaS hydrolysis argument recorded as the reason calcium was removed. Nitrogen to NH₃ and its recovery route. Chloride as corrosion driver and competitor for red mud alkalinity. Sodium and potassium into the brine product.",
    status: "outlined",
  },
  {
    number: 7,
    title: "Reforming and OXZEO integration",
    argument:
      "Bi-reforming duty and catalyst selection; coking mitigation by steam co-feed. H₂/CO adjustment to the OXZEO optimum. Per-pass conversion, olefin selectivity, recycle architecture, and the CO₂ that OXZEO itself co-produces. Product separation and the propylene/ethylene ratio as a market variable.",
    status: "outlined",
  },
  {
    number: 8,
    title: "Regulatory and certification architecture",
    argument:
      "ISO 14067 boundary and allocation choices — the decisive one being whether red mud enters burden-free. CBAM scope reality check for 2026 versus the 2028 downstream extension. ISCC PLUS mass balance for bio-based olefins. RED III thresholds where gas is sold as fuel. China ETS and CCER interaction.",
    status: "outlined",
  },
  {
    number: 9,
    title: "Technoeconomics and market positioning",
    argument:
      "CAPEX for high-pressure hydrothermal service; avoided-cost framing for red mud and okara disposal as the primary value drivers; olefin, brine-fertilizer, sorbent and scandium revenue lines; sensitivity to the reforming energy penalty.",
    status: "outlined",
  },
  {
    number: 10,
    title: "Risk register and experimental programme",
    argument:
      "Ranked kill-risks with the bench experiment that retires each. Salt plugging, red mud attrition, sulfur breakthrough, reformer coking and OXZEO deactivation as the top five. Staged validation from batch autoclave to continuous bench.",
    status: "outlined",
  },
];
