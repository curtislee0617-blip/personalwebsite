import {
  towngasProcessStages,
  type TowngasProcessStageId,
} from "@/lib/towngas-case-study";
import type {
  BlockSymbol,
  ProcessBlock,
  StreamPhase,
  StreamRow,
} from "@/lib/scwg-types";

type DiagramStageId = Exclude<TowngasProcessStageId, "R1">;

type DiagramStream = {
  tag: string;
  name: string;
  phase: StreamPhase;
  components: string;
};

type DiagramTopology = {
  symbol: BlockSymbol;
  summary: string;
  inlet: DiagramStream[];
  outlet: DiagramStream[];
};

// Aspen-style PFD topology for the report-current B1–B8 process. Stream tags are
// intentionally short and stable: the connector builder matches identical outlet
// and inlet tags, so the same data generates the numbered diamonds, feed/product
// stubs, the B4→B8 solids jump, the B7→B6 gas recycle, and the R1 solids recycle.
const topology: Record<DiagramStageId, DiagramTopology> = {
  B1: {
    symbol: "mix-pump",
    summary: "18–22 wt% solids · 25 MPa",
    inlet: [
      { tag: "1", name: "Wet biomass", phase: "slurry", components: "Okara and make-up/recycle water" },
      { tag: "2", name: "Milled straw", phase: "solid", components: "Prepared soybean straw" },
      { tag: "3", name: "Fresh red mud", phase: "slurry", components: "Conditioned bauxite residue" },
      { tag: "10", name: "Polished water recycle", phase: "liquid", components: "B4 water accepted for B1 make-up" },
      { tag: "R1", name: "Conditioned mineral recycle", phase: "slurry", components: "Controlled B8 return" },
    ],
    outlet: [
      { tag: "4", name: "Pressurised feed slurry", phase: "slurry", components: "Organic and mineral feed at reactor pressure" },
    ],
  },
  B2: {
    symbol: "tubular-reactor",
    summary: "625 °C · 25 MPa · 60 s",
    inlet: [
      { tag: "4", name: "Pressurised feed slurry", phase: "slurry", components: "Organic and mineral feed" },
    ],
    outlet: [
      { tag: "5", name: "SCWG effluent", phase: "supercritical", components: "Gas, water, salts, and mineral solids" },
    ],
  },
  B3: {
    symbol: "cyclone",
    summary: "Supercritical · continuous underflow",
    inlet: [
      { tag: "5", name: "SCWG effluent", phase: "supercritical", components: "Gas, water, salts, and mineral solids" },
    ],
    outlet: [
      { tag: "6", name: "Salt-depleted effluent", phase: "supercritical", components: "Gas and water with entrained mineral solids" },
      { tag: "7", name: "Salt concentrate", phase: "mixed", components: "Segregated N-K-P-S-bearing concentrate" },
      { tag: "8", name: "Dealkalised mineral solids", phase: "solid", components: "Conditioned red-mud fraction" },
    ],
  },
  B4: {
    symbol: "flash-drum",
    summary: "25 MPa → approximately 3 MPa",
    inlet: [
      { tag: "6", name: "Salt-depleted effluent", phase: "supercritical", components: "Gas and water" },
      { tag: "8", name: "Dealkalised mineral solids", phase: "solid", components: "Entrained mineral phase" },
    ],
    outlet: [
      { tag: "9", name: "Wet raw gas", phase: "gas", components: "CH₄, CO₂, H₂, H₂S, and COS" },
      { tag: "10", name: "Polished water", phase: "liquid", components: "Recycle water, ammonia-rich cut, and purge" },
      { tag: "11", name: "Separated mineral solids", phase: "solid", components: "Mineral phase routed to B8" },
    ],
  },
  B5: {
    symbol: "absorber-pair",
    summary: "approximately 3 MPa · below 0.1 ppmv S",
    inlet: [
      { tag: "9", name: "Wet raw gas", phase: "gas", components: "CH₄, CO₂, H₂, H₂S, and COS" },
    ],
    outlet: [
      { tag: "12", name: "Clean methane-rich gas", phase: "gas", components: "Sulfur-free reformer feed" },
      { tag: "13", name: "Metered carbon dioxide", phase: "gas", components: "Controlled reformer feed or export" },
      { tag: "14", name: "Recovered sulfur", phase: "solid", components: "Elemental sulfur product" },
    ],
  },
  B6: {
    symbol: "fired-reformer",
    summary: "approximately 850 °C · approximately 2.8 MPa",
    inlet: [
      { tag: "12", name: "Clean methane-rich gas", phase: "gas", components: "Sulfur-free B5 gas" },
      { tag: "13", name: "Metered carbon dioxide", phase: "gas", components: "Ratio-control feed from B5" },
      { tag: "17", name: "Carbon-dioxide recycle", phase: "gas", components: "Controlled B7 carbon-dioxide return" },
      { tag: "20", name: "Reforming steam", phase: "gas", components: "Recovered or generated hydrothermal-island steam" },
    ],
    outlet: [
      { tag: "15", name: "Ratio-controlled synthesis gas", phase: "gas", components: "CO and H₂ for OXZEO" },
    ],
  },
  B7: {
    symbol: "fixed-bed",
    summary: "approximately 400 °C · 4 MPa",
    inlet: [
      { tag: "15", name: "Ratio-controlled synthesis gas", phase: "gas", components: "Sulfur-free CO and H₂" },
      { tag: "18", name: "Unconverted synthesis-gas recycle", phase: "gas", components: "Internal OXZEO-loop return" },
    ],
    outlet: [
      { tag: "16", name: "Light-olefin product", phase: "gas", components: "Recovered C₂–C₄ olefins" },
      { tag: "17", name: "Carbon-dioxide recycle", phase: "gas", components: "Separated CO₂ returned to B6" },
      { tag: "18", name: "Unconverted synthesis-gas recycle", phase: "gas", components: "Internal return to the B7 feed" },
      { tag: "21", name: "Water, oxygenates, and purge", phase: "mixed", components: "Condensed coproducts and controlled fuel purge" },
    ],
  },
  B8: {
    symbol: "washer-conditioner",
    summary: "Wash · qualify · controlled purge",
    inlet: [
      { tag: "11", name: "Separated mineral solids", phase: "solid", components: "Conditioned solids from B4" },
    ],
    outlet: [
      { tag: "R1", name: "Conditioned mineral recycle", phase: "slurry", components: "Controlled return to B1" },
      { tag: "19", name: "Qualified mineral purge", phase: "solid", components: "Released product or managed disposal" },
    ],
  },
};

const diagramLabels: Record<DiagramStageId, string> = {
  B1: "Feed preparation + pumping",
  B2: "SCWG reactor",
  B3: "Hot-salt separation",
  B4: "Heat recovery + phase split",
  B5: "Rectisol + ZnO guard",
  B6: "Bi-reforming",
  B7: "OXZEO + recovery",
  B8: "Mineral conditioning",
};

const qualificationStages = new Set<DiagramStageId>(["B1", "B2", "B3", "B6", "B7", "B8"]);

function toStreamRows(streams: DiagramStream[]): StreamRow[] {
  return streams.map((stream) => ({ ...stream }));
}

export const towngasCurrentProcessBlocks: ProcessBlock[] = towngasProcessStages
  .filter((stage) => stage.id !== "R1")
  .map((stage) => {
    const stageTopology = topology[stage.id];

    return {
      id: stage.id,
      name: stage.name,
      diagramLabel: diagramLabels[stage.id],
      symbol: stageTopology.symbol,
      conditions: { summary: stageTopology.summary },
      conditionDetails: stage.conditions.map((condition) => ({
        label: condition.label,
        value: condition.value,
        basis: condition.basis,
      })),
      needsValidation: qualificationStages.has(stage.id),
      function: [stage.purpose, stage.mechanism],
      sourceNote: stage.source,
      inlet: toStreamRows(stageTopology.inlet),
      outlet: toStreamRows(stageTopology.outlet),
      flags: [
        {
          kind: "note",
          title: "Main equipment",
          body: stage.equipment.join("; "),
        },
        {
          kind: "warning",
          title: "Critical design risk",
          body: stage.risk,
        },
        {
          kind: "needs-validation",
          title: "Evidence required to retire it",
          body: stage.validation,
        },
      ],
    };
  });

export const towngasRecycleStage = towngasProcessStages.find((stage) => stage.id === "R1");
