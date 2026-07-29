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
      "Alumina refineries. Shandong, Shanxi, Henan, Guangxi and Guizhou hold roughly 95% of Chinese capacity. Large, few, permanently sited point sources — the easy half of the problem.",
  },
  {
    id: "douzha-industrial",
    label: "Douzha, industrial (large soymilk plants)",
    mark: "square",
    defaultOn: true,
    blurb:
      "Douzha is not a crushing by-product: ~90% of imported GM soybean is crushed for oil and meal, producing none. It arises only from soymilk and tofu manufacture on non-GM domestic beans. A few large beverage plants — clean point sources with single-supplier traceability.",
  },
  {
    id: "douzha-fragmented",
    label: "Douzha, fragmented (tofu manufacture)",
    mark: "shade",
    defaultOn: true,
    blurb:
      "Larger tonnage, harder supply chain. Thousands of small workshops sited close to consumption, so this follows population rather than capacity. This is where the ISCC risk lives — fragmented, self-declaring sources are exactly where feedstock integrity fails at audit.",
  },
  {
    id: "ports",
    label: "Major ports",
    mark: "diamond",
    defaultOn: true,
    blurb:
      "China refines alumina largely from imported bauxite, which is why capacity clusters behind the northern terminals — Yantai, Longkou, Rizhao, Qingdao — and behind Fangchenggang. The same terminals land the imported soybean crushed at Rizhao, Nantong and Dongguan. The ports are where the bauxite arrives, and where the wrong soybean arrives.",
  },
  {
    id: "context",
    label: "Context layers (straw, non-GM origin)",
    mark: "triangle",
    defaultOn: false,
    blurb:
      "Off by default. Soybean straw follows cultivation — Heilongjiang, Jilin, Liaoning. Heilongjiang is also the non-GM food-grade origin: where the beans start, not where the douzha appears.",
  },
];

export const scwgSitingCandidates: SitingCandidate[] = [
  {
    id: "guangxi-guangdong",
    label: "Guangxi–Guangdong corridor",
    lon: 108.3,
    lat: 23.9,
    note: "Red mud at Guangxi refineries, industrial douzha in the Pearl River Delta — by far the shortest credible link between the two wastes.",
  },
  {
    id: "henan",
    label: "Henan (Zhengzhou / Jiaozuo)",
    lon: 113.4,
    lat: 34.8,
    note: "Red mud and fragmented douzha co-located — no haul at all, but a fragmented, hard-to-certify supply. Certification burden high.",
  },
  {
    id: "shandong",
    label: "Shandong (Binzhou/Zouping)",
    lon: 117.9,
    lat: 37.4,
    note: "Maximum red mud, but the soybean industry here crushes imported beans for meal, which yields no douzha. Douzha must be hauled or the feedstock reconsidered.",
  },
];

export const scwgSitingNarrative: SitingNarrative = {
  intro: [
    "Not a synergy story. Two feedstocks, two completely different geographies — red mud is a handful of huge inland point sources, industrial douzha a handful of coastal beverage plants, fragmented tofu douzha follows people. Toggle the overlays; the point is the mismatch.",
  ],
  payload: [
    "No province holds red mud and douzha at scale together. Red mud sits inland and north — Shandong, Shanxi, Henan — plus Guangxi and Guizhou. Industrial douzha sits in the Pearl River Delta, Shanghai and Wuhan. Straw is a thousand kilometres further north again.",
    "Two pairings are worth examining. Guangxi to Guangdong is roughly 400–700 km and pairs real alumina capacity with three industrial soymilk plants — the shortest credible link. Henan is the dark horse: alumina refining and very high population density, so fragmented tofu douzha is generated on top of the red mud — no haul, but a hard-to-certify supply. Shandong is a trap: the largest alumina capacity in China, but its soybean industry crushes imported beans for meal, which yields no douzha.",
    "Which stream moves is a live design decision. Red mud is dense, cheap and moves badly. Douzha is 80% water, moves worse, and spoils. This constrains siting more than any thermodynamic consideration in the flowsheet.",
  ],

  candidatesIntro: "Three pre-set candidates.",
};

/** Surfaced prominently in the UI: the whole dataset is unverified. */
export const scwgSitingDataCaveat =
  "Every coordinate and capacity is flagged unverified — none confirmed against a primary source.";
