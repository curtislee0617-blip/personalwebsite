import type { Reference } from "@/lib/scwg-types";

// Bibliography, carried over from the technical report's reference list.
//
// ✓ "verified" — author, year and journal confirmed against the publisher record.
// ° "unverified" — located by title and URL only; the author-year attribution
//   must be confirmed against the full text before final issue.
//
// The `marker` is what a ProcessValue's `source` field points at and what a
// superscript citation in prose resolves to. Keep markers short and stable.

export const scwgReferencesNote =
  "Sources consulted for the working draft. Full texts should in all cases be retrieved through institutional access before final citation.";

export const scwgReferences: Reference[] = [
  {
    id: "ref-marrone-2004b",
    marker: "Marrone-2004",
    citation:
      "Marrone, P. A., Hodes, M., Smith, K. A. & Tester, J. W. (2004). Salt precipitation and scale control in supercritical water oxidation — Part B: commercial/full-scale applications. Journal of Supercritical Fluids, 29, 289–312. doi:10.1016/S0896-8446(03)00092-5",
    status: "verified",
  },
  {
    id: "ref-hodes-2004a",
    marker: "Hodes-2004",
    citation:
      "Hodes, M., Marrone, P. A., Hong, G. T., Smith, K. A. & Tester, J. W. (2004). Salt precipitation and scale control in supercritical water oxidation — Part A: fundamentals and research. Journal of Supercritical Fluids.",
    status: "verified",
  },
  {
    id: "ref-wang-bjerle-1996",
    marker: "Wang-Bjerle-1996",
    citation:
      "Wang, W., Ye, Z. & Bjerle, I. (1996). The kinetics of the reaction of hydrogen chloride with fresh and spent Ca-based desulfurization sorbents. Fuel, 75(2), 207–212. doi:10.1016/0016-2361(95)00242-1",
    status: "verified",
  },
  {
    id: "ref-wang-liu-2012",
    marker: "Wang-Liu-2012",
    citation:
      "Wang, P. & Liu, D.-Y. (2012). Physical and chemical properties of sintering red mud and Bayer red mud and the implications for beneficial utilization. Materials, 5(10), 1800–1810. doi:10.3390/ma5101800",
    status: "verified",
  },
  {
    id: "ref-okolie-2021",
    marker: "Okolie-2021",
    citation:
      "Okolie, J. A. & Dalai, A. K. et al. (2021). Catalytic supercritical water gasification of soybean straw: effects of catalyst supports and promoters. Industrial & Engineering Chemistry Research, 60(16), 5770–5782. doi:10.1021/acs.iecr.0c06177",
    status: "verified",
  },
  {
    id: "ref-cheah-2010",
    marker: "Cheah-2010",
    citation:
      "Cheah, S., Carpenter, D. L. & Magrini-Bair, K. A. (2010). In-bed and downstream hot gas desulphurization during solid fuel gasification: a review. Fuel Processing Technology.",
    status: "unverified",
  },
  {
    id: "ref-li-2012",
    marker: "Li-2012",
    citation:
      "Li, B., Qiao, M. & Lu, F. (2012). Composition, nutrition, and utilization of okara (soybean residue). Food Reviews International.",
    status: "unverified",
  },
  {
    id: "ref-liu-2020",
    marker: "Liu-2020",
    citation:
      "Liu, W. et al. (2020). Bauxite waste with low Fe₂O₃ and high Na concentration as a promising oxygen carrier in chemical looping combustion. International Journal of Energy Research.",
    status: "unverified",
  },
  {
    id: "ref-marrone-2019",
    marker: "Marrone-2019",
    citation:
      "Marrone, P. A. (2019). Supercritical water gasification: practical design strategies and operational challenges for lab-scale, continuous flow reactors.",
    status: "unverified",
  },
  {
    id: "ref-olah-2015",
    marker: "Olah-2015",
    citation:
      "Olah, G. A., Goeppert, A., Czaun, M., Mathew, T., May, R. B. & Prakash, G. K. S. (2015). Catalytic bi-reforming of methane: from greenhouse gases to syngas.",
    status: "unverified",
  },
  {
    id: "ref-chein-2020",
    marker: "Chein-2020",
    citation:
      "Chein, R.-Y. & Wang, C.-C. (2020). Renewable methanol synthesis through single-step bi-reforming of biogas. Industrial & Engineering Chemistry Research. doi:10.1021/acs.iecr.0c00755",
    status: "unverified",
  },
  {
    id: "ref-schubert-2010",
    marker: "Schubert-2010",
    citation:
      "Schubert, M., Regler, J. W. & Vogel, F. (2010). A novel concept reactor design for preventing salt deposition in supercritical water. Chemical Engineering Research and Design.",
    status: "unverified",
  },
  {
    id: "ref-wang-2023",
    marker: "Wang-2023",
    citation:
      "Wang, X. et al. (2023). Red mud with enhanced dealkalization performance by supercritical water technology for efficient SO₂ capture. Journal of Environmental Management.",
    status: "unverified",
  },
  {
    id: "ref-zhang-2016",
    marker: "Zhang-2016",
    citation:
      "Zhang, N. et al. (2016). Recovery of scandium from bauxite residue — red mud: a review. Rare Metals.",
    status: "unverified",
  },
  {
    id: "ref-zhang-2017",
    marker: "Zhang-2017",
    citation:
      "Zhang, N. et al. (2017). Electron probe microanalysis for revealing occurrence mode of scandium in Bayer red mud. Rare Metals.",
    status: "unverified",
  },
  {
    id: "ref-zhang-2024",
    marker: "Zhang-2024",
    citation:
      "Zhang, Y. et al. (2024). Synergistic catalytic mechanism of red mud in the co-gasification of spirit-based distillers' grains and sewage sludge.",
    status: "unverified",
  },
  {
    id: "ref-processes-2025",
    marker: "CLE-dry",
    citation:
      "Boosting agroforestry waste valorization: red mud oxygen carriers with tailored oxygen release for enhanced chemical looping gasification (2025). Processes, 13, 1716. doi:10.3390/pr13061716 — source of the dry chemical-looping reference set (1.02 Nm³/kg, 12.06 MJ/Nm³, 91.49% cold gas efficiency, 82.65% carbon conversion).",
    status: "unverified",
  },
  {
    id: "ref-bcb-2023",
    marker: "BCB-2023",
    citation:
      "Optimizing the gasification performance of biomass chemical looping gasification: enhancing syngas quality and tar reduction through red mud oxygen carrier (2023). Biomass Conversion and Biorefinery.",
    status: "unverified",
  },
  {
    id: "ref-nicu-rm",
    marker: "NiCu-RM",
    citation:
      "Red mud supported Ni-Cu bimetallic material for hydrothermal production of hydrogen from biomass (2024). Applied Catalysis A — 21.88 mmol/g H₂, 6.7× unpromoted Ni.",
    status: "unverified",
  },
  {
    id: "ref-natcomm-2025",
    marker: "OXZEO-2",
    citation:
      "ZnOₓ overlayer confined on ZnCr₂O₄ spinel for direct syngas conversion to light olefins (2025). Nature Communications — 64% CO conversion at 75% light-olefin selectivity, 4.0 MPa, 400 °C, 68% H₂ / 27% CO feed.",
    status: "unverified",
  },
  {
    id: "ref-acsomega-oxzeo",
    marker: "OXZEO-1",
    citation:
      "Direct conversion of syngas to light olefins over a ZnCrOₓ + H-SSZ-13 bifunctional catalyst. ACS Omega — 80% light-olefin selectivity at 17% CO conversion, 400 °C, 2.5 MPa.",
    status: "unverified",
  },
  {
    id: "ref-salt-2024",
    marker: "Salt-2024",
    citation:
      "Investigating salt precipitation in continuous supercritical water gasification of biomass (2024). Processes, 12, 935.",
    status: "unverified",
  },
  {
    id: "ref-isw-oc-2024",
    marker: "ISW-OC-2024",
    citation:
      "Industrial solid waste as oxygen carrier in chemical looping gasification technology: a review (2024).",
    status: "unverified",
  },
  {
    id: "ref-cas-patents",
    marker: "CaS-hyd",
    citation:
      "US Patent 4,321,242 — Low sulfur content hot reducing gas production using calcium oxide desulfurization with water recycle; and US 4,686,090 — Desulfurizing of reducing gas stream using a recycle calcium oxide system. The specific patent carrying the CaS hydrolysis teaching must be confirmed before final issue.",
    status: "unverified",
  },
  {
    id: "ref-rectisol",
    marker: "Rectisol",
    citation:
      "Air Liquide / Lurgi. Rectisol process description — syngas purification to 0.1 ppm total sulfur including H₂S and COS; see also NETL Gasifipedia, Rectisol.",
    status: "unverified",
  },
  {
    id: "ref-agr-ranking",
    marker: "AGR-rank",
    citation:
      "Reconfiguration of acid gas removal process matching the integration of coal chemical industry with green hydrogen (2024). Separation and Purification Technology — source for the CO₂-efficiency ranking Rectisol > Selexol > MDEA > sulfolane-MDEA at a 0.1 ppm H₂S target.",
    status: "unverified",
  },
  {
    id: "ref-bullin-mdea",
    marker: "MDEA",
    citation:
      "Bullin, J. A. et al. Selective absorption using amines. Bryan Research & Engineering — basis for MDEA selective H₂S removal behaviour and the sub-20 ppmv outlet figure. See also Moioli, S. et al., Assessment of MDEA absorption process for sequential H₂S removal, Politecnico di Milano.",
    status: "unverified",
  },
  {
    id: "ref-swg-feed",
    marker: "SWG-feed",
    citation:
      "Supercritical reactor feed precedents (Marrone, 2019, and references therein): 30 wt% glucose, 18 wt% corn cob, 24 wt% coal–water slurry; twin piston pumps delivering 15% solids biomass slurry to 27 MPa; dewatered sewage sludge at 7.69 wt% solids requiring corn-starch paste and a cement pump.",
    status: "unverified",
  },
  {
    id: "ref-iso14067",
    marker: "ISO 14067",
    citation:
      "ISO 14067:2018 — Greenhouse gases: Carbon footprint of products. Allocation hierarchy and disclosure requirements.",
    status: "verified",
  },
  {
    id: "ref-cbam",
    marker: "CBAM",
    citation:
      "Regulation (EU) 2023/956 establishing a Carbon Border Adjustment Mechanism; definitive period from 1 January 2026, Annex I scope. 2025 Commission proposal on downstream extension.",
    status: "verified",
  },
  {
    id: "ref-iscc",
    marker: "ISCC PLUS",
    citation:
      "ISCC PLUS certification scheme; Mass Balance Guidance Document 1.0 (public consultation, final version expected June 2026).",
    status: "verified",
  },
  {
    id: "ref-china-ets",
    marker: "CN-ETS",
    citation:
      "China national ETS expansion to steel, cement and aluminium with absolute caps by 2027; CCER relaunch.",
    status: "verified",
  },
  {
    id: "ref-sc-grade",
    marker: "Sc-grade",
    citation:
      "Scandium in red mud: 16–230 ppm typical (~84 ppm Chinese sample); Sc₂O₃ price $3,000–5,000/kg. Global Sc₂O₃ demand of order tens of t/y — verify against a USGS commodity summary.",
    status: "unverified",
  },
  {
    id: "ref-fe-rec",
    marker: "Fe-rec",
    citation:
      "Red mud iron recovery: reduction roasting + magnetic separation 97.69% metallization, 81.40% recovery; smelting reduction pig iron Fe >90%, 90–95% recovery, recent work 98.14–98.36% Fe recovery.",
    status: "unverified",
  },
  {
    id: "ref-scm",
    marker: "RM-SCM",
    citation:
      "Red mud as supplementary cementitious material: 10–20% clinker replacement (25–30% demonstrated); co-calcination with kaolinite 30% replacement at 88% of reference 28-day strength.",
    status: "unverified",
  },
  {
    id: "ref-redmud-oc",
    marker: "RM-OC",
    citation:
      "Red mud as a chemical-looping oxygen carrier: Fe₂O₃ content above roughly 40 wt% gives adequate oxygen transport capacity together with useful heat-carrying properties (Liu et al., 2020; industrial solid waste oxygen carrier review, 2024).",
    status: "unverified",
  },
];

export function scwgReferenceByMarker(marker: string) {
  return scwgReferences.find((reference) => reference.marker === marker);
}
