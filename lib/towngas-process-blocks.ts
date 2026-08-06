import { towngasProcessStages, type TowngasProcessStageId } from "@/lib/towngas-case-study";
import type { BlockSymbol, ProcessBlock, StreamPhase, StreamRow } from "@/lib/scwg-types";

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

// Aspen-style topology for the report-current ten-train architecture. B1–B4
// describes one of ten identical dirty-service trains. Stream 9 enters the shared
// B5–B7 conversion island; solids leave through B8 rather than an indefinite recycle.
const topology: Record<TowngasProcessStageId, DiagramTopology> = {
  B1: {
    symbol: "mix-pump",
    summary: "B1 blend · 20.80 wt% solids · 25 MPa",
    inlet: [
      { tag: "1", name: "Douzha + wet co-feeds", phase: "slurry", components: "Douzha, cassava cake, pulp, and organic liquor" },
      { tag: "2", name: "Milled straw", phase: "solid", components: "Qualified fine fibre; D90 below 0.5 mm" },
      { tag: "3", name: "Bauxite residue", phase: "slurry", components: "Assayed mineral treatment feed" },
      { tag: "4", name: "Blend water", phase: "liquid", components: "Make-up or qualified recycle water" },
    ],
    outlet: [{ tag: "5", name: "Released HP slurry", phase: "slurry", components: "300 t/day carbon-controlled B1 feed" }],
  },
  B2: {
    symbol: "tubular-reactor",
    summary: "625 °C · 25 MPa · 30–90 s screen",
    inlet: [{ tag: "5", name: "Released HP slurry", phase: "slurry", components: "Wet organic and mineral feed" }],
    outlet: [{ tag: "6", name: "SCWG effluent", phase: "supercritical", components: "Methane-rich gas, water, salts, and mineral solids" }],
  },
  B3: {
    symbol: "cyclone",
    summary: "Twin lead/lag · continuous underflow",
    inlet: [{ tag: "6", name: "SCWG effluent", phase: "supercritical", components: "Gas, water, precipitating salts, and mineral solids" }],
    outlet: [
      { tag: "7", name: "Salt-depleted effluent", phase: "supercritical", components: "Gas/water/mineral stream to heat recovery" },
      { tag: "8", name: "B3 concentrate", phase: "mixed", components: "Na/K/P/S/Cl-bearing controlled product or purge" },
    ],
  },
  B4: {
    symbol: "flash-drum",
    summary: "555 GJ/d heat recovery · staged letdown",
    inlet: [{ tag: "7", name: "Salt-depleted effluent", phase: "supercritical", components: "Hot gas, water, and mineral solids" }],
    outlet: [
      { tag: "9", name: "Accepted wet raw gas", phase: "gas", components: "CH₄, CO₂, H₂, CO, and acid-gas traces" },
      { tag: "10", name: "Aqueous treatment stream", phase: "liquid", components: "Water, ammonia equivalent, organics, and ions" },
      { tag: "11", name: "Separated mineral solids", phase: "solid", components: "Conditioned solids routed to B8" },
    ],
  },
  B5: {
    symbol: "absorber-pair",
    summary: "Shared Rectisol · ZnO guard · <0.1 ppmv S screen",
    inlet: [{ tag: "9", name: "Ten-train raw-gas header", phase: "gas", components: "Accepted B4 gas only; up to 558 t/day screen" }],
    outlet: [
      { tag: "12", name: "Clean methane-rich gas", phase: "gas", components: "Sulfur-protected reformer feed" },
      { tag: "13", name: "Controlled CO₂ split", phase: "gas", components: "Bi-reformer ratio-control feed or export" },
      { tag: "14", name: "Recovered sulfur", phase: "solid", components: "Qualified sulfur outlet" },
    ],
  },
  B6: {
    symbol: "fired-reformer",
    summary: "≈850 °C · ≈2.8 MPa · strongly endothermic",
    inlet: [
      { tag: "12", name: "Clean methane-rich gas", phase: "gas", components: "Rectisol/ZnO-protected SCWG gas" },
      { tag: "13", name: "Controlled CO₂ split", phase: "gas", components: "Dry-reforming contribution" },
      { tag: "15", name: "Reforming steam", phase: "gas", components: "Recovered/generated steam" },
    ],
    outlet: [{ tag: "16", name: "Ratio-controlled syngas", phase: "gas", components: "CO and H₂ for OXZEO" }],
  },
  B7: {
    symbol: "fixed-bed",
    summary: "≈400 °C · 2–3 MPa · 42% current / 55% target",
    inlet: [
      { tag: "16", name: "Ratio-controlled syngas", phase: "gas", components: "Sulfur-free CO and H₂" },
      { tag: "17", name: "Qualified recycle gas", phase: "gas", components: "Unconverted synthesis-loop return" },
    ],
    outlet: [
      { tag: "18", name: "Light-olefin product", phase: "gas", components: "Recovered C₂–C₄ olefins" },
      { tag: "17", name: "Qualified recycle gas", phase: "gas", components: "Unconverted loop return" },
      { tag: "19", name: "Water, oxygenates, and purge", phase: "mixed", components: "Condensed coproducts and controlled fuel purge" },
    ],
  },
  B8: {
    symbol: "washer-conditioner",
    summary: "Wash · test · release or retreat",
    inlet: [{ tag: "11", name: "Separated mineral solids", phase: "solid", components: "B4 mineral phase" }],
    outlet: [
      { tag: "20", name: "Qualified residue", phase: "solid", components: "Destination-specific conditioned mineral product" },
      { tag: "21", name: "Off-spec retreatment", phase: "slurry", components: "Second wash or controlled treatment; no indefinite recycle" },
    ],
  },
};

const diagramLabels: Record<TowngasProcessStageId, string> = {
  B1: "Feed preparation + HP pumping",
  B2: "SCWG reactor",
  B3: "Purposeful hot-salt separation",
  B4: "Heat recovery + phase split",
  B5: "Rectisol + ZnO guard",
  B6: "Steam/CO₂ bi-reforming",
  B7: "OXZEO + product recovery",
  B8: "Residue qualification",
};

const newUseStages = new Set<TowngasProcessStageId>(["B1", "B2", "B3", "B7", "B8"]);

function toStreamRows(streams: DiagramStream[]): StreamRow[] {
  return streams.map((stream) => ({ ...stream }));
}

export const towngasCurrentProcessBlocks: ProcessBlock[] = towngasProcessStages.map((stage) => {
  const stageTopology = topology[stage.id];
  const isNewUse = newUseStages.has(stage.id);
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
    needsValidation: isNewUse,
    function: [stage.purpose, stage.mechanism, ...(isNewUse ? [`Testing focus: ${stage.validation}`] : [])],
    sourceNote: stage.source,
    inlet: toStreamRows(stageTopology.inlet),
    outlet: toStreamRows(stageTopology.outlet),
    flags: [
      { kind: "note", title: "Main equipment", body: stage.equipment.join("; ") },
      { kind: "warning", title: "Critical design risk", body: stage.risk },
    ],
  };
});
