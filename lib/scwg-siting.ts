import type { SitingCandidate, SitingNarrative, SitingOverlay } from "@/lib/scwg-types";

// Act 2 — the siting problem. Narrative + overlay definitions + candidate presets.
// Coordinates and capacities live in data/scwg-map-sites.json, flagged unverified.
// This section makes a *problem*, not a synergy: the two wastes are not co-located.

export const scwgSitingOverlays: SitingOverlay[] = [
  {
    id: "redmud",
    label: "Bauxite waste (red mud)",
    mark: "circle",
    defaultOn: true,
    blurb:
      "Generated at alumina refineries. Shandong, Shanxi, Henan, Guangxi and Guizhou account for roughly 95% of Chinese alumina capacity; Shandong, Shanxi and Guangxi together exceed 70%. Large, few, permanently sited point sources with enormous per-site tonnage — the easy half of the problem to map.",
  },
  {
    id: "okara-industrial",
    label: "Okara, industrial (large soymilk plants)",
    mark: "square",
    defaultOn: true,
    blurb:
      "Okara is not a crushing by-product. China's soybean supply is sharply segmented: roughly 90% of imported GM soybean is crushed for oil and meal — producing no okara. Okara arises only from soymilk and tofu manufacture, which uses non-GM domestic beans. Industrial okara comes from a small number of large beverage plants — clean point sources with single-supplier traceability, which matters directly for the ISCC self-declaration weakness raised in Act 1.",
  },
  {
    id: "okara-fragmented",
    label: "Okara, fragmented (tofu manufacture)",
    mark: "shade",
    defaultOn: true,
    blurb:
      "Larger tonnage, harder supply chain. Tofu production is fragmented across thousands of small workshops sited close to consumption because the product is perishable, so this overlay follows urban population density rather than industrial capacity. This overlay is where the ISCC risk lives: fragmented, self-declaring, small waste sources are exactly the supply profile where feedstock integrity fails at audit.",
  },
  {
    id: "context",
    label: "Context layers (straw, non-GM origin)",
    mark: "triangle",
    defaultOn: false,
    blurb:
      "Secondary, off by default. Soybean straw is field residue following cultivation — Heilongjiang, Jilin, Liaoning, eastern Inner Mongolia. Non-GM food-grade soybean origin is Heilongjiang, a designated GMO-free planting region: the origin of the beans that eventually become okara, but not where the okara appears.",
  },
];

export const scwgSitingCandidates: SitingCandidate[] = [
  {
    id: "guangxi-guangdong",
    label: "Guangxi–Guangdong corridor",
    lon: 108.3,
    lat: 23.9,
    note: "Red mud at Guangxi refineries, industrial okara in the Pearl River Delta — by far the shortest credible link between the two wastes.",
  },
  {
    id: "henan",
    label: "Henan (Zhengzhou / Jiaozuo)",
    lon: 113.4,
    lat: 34.8,
    note: "Red mud and fragmented okara co-located — no haul at all, but a fragmented, hard-to-certify supply. Certification burden high.",
  },
  {
    id: "shandong",
    label: "Shandong (Binzhou/Zouping)",
    lon: 117.9,
    lat: 37.4,
    note: "Maximum red mud, but the soybean industry here crushes imported beans for meal, which yields no okara. Okara must be hauled or the feedstock reconsidered.",
  },
];

export const scwgSitingNarrative: SitingNarrative = {
  intro: [
    "This is not a decorative map, and it is not a synergy story. Two feedstocks, two completely different geographies. The analytical point is a problem, and the map exists to make that problem legible.",
    "Toggle the overlays. Red mud is a handful of huge inland point sources. Industrial okara is a handful of coastal beverage plants. Fragmented tofu okara follows people. The context layers sit a thousand kilometres further north again.",
  ],
  payload: [
    "Red mud sits inland and north — Shandong, Shanxi, Henan — plus Guangxi and Guizhou in the south. Industrial okara sits in the Pearl River Delta, Shanghai and Wuhan. Fragmented tofu okara follows population. Soybean straw is a thousand kilometres further north again, in Heilongjiang and Jilin. No province holds red mud and okara at scale together.",
    "Two pairings are worth examining rather than one. Guangxi (Baise, Pingguo, Fangchenggang) to Guangdong (Foshan, Dongguan, Shenzhen) is roughly 400–700 km and pairs real alumina capacity with three industrial soymilk plants — by far the shortest credible link between the two wastes. Henan is the dark horse: it has alumina refining at Zhengzhou, Sanmenxia and Jiaozuo and very high population density, so fragmented tofu okara is generated on top of the red mud — no haul at all, but a fragmented, hard-to-certify supply. The apparent Shandong option is a trap: its alumina capacity is the largest in China, but its soybean industry is crushing imported beans for meal, which yields no okara.",
    "Which stream moves is a live design decision. Red mud is dense, cheap and moves badly. Okara is 80% water and moves worse — and spoils. Straw is bulky and low-density. This constrains siting more than any thermodynamic consideration in the flowsheet.",
  ],
  candidatesIntro:
    "Pick a candidate site. The panel computes the great-circle distance from that site to the nearest source in each active overlay. Three pre-set candidates:",
};

/** Surfaced prominently in the UI: the whole dataset is unverified. */
export const scwgSitingDataCaveat =
  "Every coordinate and capacity below is flagged status: \"unverified\". These have not been confirmed against a primary source. The map says so rather than implying a precision it does not have.";
