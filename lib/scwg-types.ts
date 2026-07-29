// Shared types for the supercritical water gasification page.
//
// The placeholder-discipline types are the enforcement mechanism described in the
// spec: a bare `number` where a `ProcessValue` is expected is a compile error, and
// a `"literature"` value with no `source` is a compile error. Do not weaken this
// with optional fields or `any` — that is the whole point of the type.

/**
 * A quantity rendered on the page. Every numeric quantity that appears in the
 * process content must be a ProcessValue so the placeholder/literature status
 * travels with the number and is rendered consistently by `scwg-value.tsx`.
 */
export type ProcessValue =
  | { value: number; unit: string; status: "placeholder"; note?: string }
  | { value: number; unit: string; status: "literature"; source: string };

/** A range placeholder — two endpoints share one status. Used for T/P windows. */
export type ProcessRange =
  | { min: number; max: number; unit: string; status: "placeholder"; note?: string }
  | { min: number; max: number; unit: string; status: "literature"; source: string };

// ── Act 1 — regulatory ──────────────────────────────────────────────────────

export type RegulatoryPanel = {
  id: string;
  eyebrow: string;
  title: string;
  /** Paragraphs of body prose, ~120–180 words total. */
  paragraphs: string[];
  /** A single sentence pulled out for visual emphasis, e.g. the CBAM by-product point. */
  emphasis?: string;
};

// ── Act 2 — siting ──────────────────────────────────────────────────────────

export type SitingOverlayId = "redmud" | "okara-industrial" | "okara-fragmented" | "ports" | "context";

export type SitingOverlay = {
  id: SitingOverlayId;
  label: string;
  /** Distinct SVG mark shape per overlay — never colour alone. */
  mark: "circle" | "square" | "triangle" | "diamond" | "shade";
  /** Off by default for the secondary context layers. */
  defaultOn: boolean;
  blurb: string;
};

export type SitingCandidate = {
  id: string;
  label: string;
  lon: number;
  lat: number;
  note: string;
};

export type SitingNarrative = {
  intro: string[];
  /** The analytical-payload side panel, verbatim from the spec. */
  payload: string[];
  candidatesIntro: string;
};

// ── Act 3 — process ─────────────────────────────────────────────────────────

/**
 * Unit-operation symbol type. The diagram selects an ISA-5.1 / Aspen-convention
 * symbol from this field, so a new block with a known type gets the right symbol
 * automatically.
 */
export type BlockSymbol =
  | "mix-pump" // B1 — slurry mix tank + positive-displacement pump
  | "tubular-reactor" // B2 — vertical tubular packed-bed reactor
  | "cyclone" // B3 — cyclone/separator with tangential inlet
  | "flash-drum" // B4 — let-down valve + horizontal flash drum
  | "absorber-pair" // B5 — packed absorber + regenerator column pair
  | "fired-reformer" // B6 — fired tubular reformer, radiant box
  | "fixed-bed" // B7 — fixed-bed catalytic reactor
  | "regenerator"; // B8 — rotary/fluid-bed regenerator + leach train

export type StreamPhase = "solid" | "liquid" | "gas" | "slurry" | "supercritical" | "mixed";

export type StreamRow = {
  /** Numbered stream tag shown in the diagram callout. */
  tag: string;
  name: string;
  phase: StreamPhase;
  components: string;
  /** Optional quantitative descriptor; ProcessValue so status is enforced. */
  quantity?: ProcessValue;
};

export type BlockFlag = {
  kind: "needs-validation" | "note" | "decision" | "warning";
  title: string;
  body: string;
};

/** One paragraph or sub-claim, optionally with its own support qualifier. */
export type BlockRole = {
  title: string;
  body: string;
  /** How well supported this specific claim is — surfaced in the UI. */
  support: "best-supported" | "supported" | "requires-qualification" | "unvalidated";
};

export type ConversionMetric = {
  label: string;
  /** Explicit definition of the KPI, per the spec. */
  definition: string;
  value: ProcessValue;
};

export type EnergyDuty = {
  label: string;
  /** Stated sign convention, e.g. "positive = heat input". */
  signConvention: string;
  value: ProcessValue;
};

export type ProcessBlock = {
  id: string; // "B1" … "B8" (or a dummy id when testing extensibility)
  name: string;
  symbol: BlockSymbol;
  /** Operating conditions shown as tags on the diagram and in the header. */
  conditions: {
    temperature?: ProcessRange;
    pressure?: ProcessRange;
    /** Free-text condition line when a range does not fit, e.g. "Ambient → 25 MPa". */
    summary: string;
  };
  /** Position of this block on the diagram grid, 0-indexed left→right / top→bottom. */
  diagram: { col: number; row: number };
  needsValidation: boolean;
  /** Function prose — the block description. */
  function: string[];
  /** Optional multi-role breakdown (B2's three red-mud roles, B5's stages). */
  roles?: BlockRole[];
  inlet: StreamRow[];
  outlet: StreamRow[];
  duty?: EnergyDuty;
  /** Conversion/KPI metrics. Some blocks report several (B5, B7, B8). */
  metrics?: ConversionMetric[];
  flags?: BlockFlag[];
  /** Extra labelled context values, e.g. B2's dry chemical-looping reference set. */
  contextValues?: { label: string; value: ProcessValue }[];
};

// ── Act 4 — products ────────────────────────────────────────────────────────

export type ProductGroup = {
  id: string;
  title: string;
  intro?: string;
  items: ProductItem[];
};

export type ProductItem = {
  name: string;
  summary: string;
  /** Expanded detail shown on click. */
  detail: string[];
  /** Optional callout, e.g. the scandium market-depth caveat. */
  callout?: { title: string; body: string };
  /** Optional sortable table (Tier 3 critical metals). */
  table?: { columns: string[]; rows: string[][] };
  tier?: number;
};

// ── Act 5 — open questions + references ──────────────────────────────────────

export type DecisionTaken = {
  conflict: string;
  decision: string;
};

export type OpenQuestion = {
  title: string;
  body: string;
};

export type Reference = {
  id: string;
  /** Superscript marker resolves here from scwg-value / prose. */
  marker: string;
  citation: string;
  /** ✓ verified against a primary source; ° attribution unverified. */
  status: "verified" | "unverified";
};
