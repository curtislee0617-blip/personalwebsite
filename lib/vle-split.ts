import type { DiagramType, VlePoint } from "@/lib/vle";

// Flash/lever-rule state analysis over an already-generated VLE diagram.
// Works purely from the computed curve points, so it supports every model
// the simulator offers (including azeotropic activity-model curves).

export type VlePhaseSplit = {
  phase: "liquid" | "two-phase" | "vapour";
  level: number;
  z: number;
  /** Tie-line liquid composition (two-phase only). */
  xStar: number | null;
  /** Tie-line vapour composition (two-phase only). */
  yStar: number | null;
  /** Vapour mole fraction of the overall mixture. */
  beta: number;
  /** Bubble value (T or P) at composition z. */
  bubbleLevel: number | null;
  /** Dew value (T or P) at composition z. */
  dewLevel: number | null;
};

function bubbleLevelAt(points: VlePoint[], z: number): number | null {
  // The bubble curve is parameterised by x, which the generator sweeps
  // monotonically, so direct interpolation is safe.
  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index];
    const b = points[index + 1];
    if ((z >= a.x && z <= b.x) || (z >= b.x && z <= a.x)) {
      const t = b.x === a.x ? 0 : (z - a.x) / (b.x - a.x);
      return a.value + (b.value - a.value) * t;
    }
  }
  return null;
}

function dewLevelAt(points: VlePoint[], type: DiagramType, z: number): number | null {
  // The dew curve (y, value) is not monotonic in y for azeotropic systems,
  // so collect every crossing and keep the outermost phase boundary.
  const candidates: number[] = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index];
    const b = points[index + 1];
    if ((a.y - z) * (b.y - z) <= 0 && a.y !== b.y) {
      const t = (z - a.y) / (b.y - a.y);
      candidates.push(a.value + (b.value - a.value) * t);
    }
  }
  if (candidates.length === 0) return null;
  return type === "txy" ? Math.max(...candidates) : Math.min(...candidates);
}

export function computeVlePhaseSplit(
  points: VlePoint[],
  type: DiagramType,
  z: number,
  level: number,
): VlePhaseSplit | null {
  if (points.length < 2) return null;

  const bubbleLevel = bubbleLevelAt(points, z);
  const dewLevel = dewLevelAt(points, type, z);

  let phase: VlePhaseSplit["phase"] = "two-phase";
  if (type === "txy") {
    if (bubbleLevel !== null && level <= bubbleLevel) phase = "liquid";
    else if (dewLevel !== null && level >= dewLevel) phase = "vapour";
  } else {
    if (bubbleLevel !== null && level >= bubbleLevel) phase = "liquid";
    else if (dewLevel !== null && level <= dewLevel) phase = "vapour";
  }

  if (phase !== "two-phase") {
    return {
      phase,
      level,
      z,
      xStar: null,
      yStar: null,
      beta: phase === "vapour" ? 1 : 0,
      bubbleLevel,
      dewLevel,
    };
  }

  // Tie-line endpoints: every composition where each curve crosses this
  // level, then the bubble/dew pair that brackets z (this picks the correct
  // lobe on azeotropic diagrams).
  type Crossing = { pos: number; curve: "bubble" | "dew" };
  const all: Crossing[] = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index];
    const b = points[index + 1];
    if ((a.value - level) * (b.value - level) <= 0 && a.value !== b.value) {
      const t = (level - a.value) / (b.value - a.value);
      all.push({ curve: "bubble", pos: a.x + (b.x - a.x) * t });
      all.push({ curve: "dew", pos: a.y + (b.y - a.y) * t });
    }
  }
  all.sort((first, second) => first.pos - second.pos);

  let xStar: number | null = null;
  let yStar: number | null = null;
  for (let index = 0; index < all.length - 1; index += 1) {
    const lower = all[index];
    const upper = all[index + 1];
    if (z >= lower.pos && z <= upper.pos && lower.curve !== upper.curve) {
      xStar = (lower.curve === "bubble" ? lower : upper).pos;
      yStar = (lower.curve === "dew" ? lower : upper).pos;
      break;
    }
  }
  if (xStar === null || yStar === null) {
    const bubbles = all.filter((crossing) => crossing.curve === "bubble");
    const dews = all.filter((crossing) => crossing.curve === "dew");
    if (bubbles.length === 0 || dews.length === 0) {
      return { phase, level, z, xStar: null, yStar: null, beta: 0.5, bubbleLevel, dewLevel };
    }
    xStar = bubbles.reduce((best, c) => Math.abs(c.pos - z) < Math.abs(best.pos - z) ? c : best).pos;
    yStar = dews.reduce((best, c) => Math.abs(c.pos - z) < Math.abs(best.pos - z) ? c : best).pos;
  }

  const denom = yStar - xStar;
  const beta = Math.abs(denom) < 1e-9
    ? 0.5
    : Math.min(1, Math.max(0, (z - xStar) / denom));

  return { phase, level, z, xStar, yStar, beta, bubbleLevel, dewLevel };
}
