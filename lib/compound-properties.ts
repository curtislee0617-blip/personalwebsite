import rows from "@/data/koretsky-compounds.json";

export type Compound = {
  formula: string;
  name: string;
  molecularWeight: number;
  criticalTemperature: number;
  criticalPressure: number;
  acentricFactor: number;
  antoineA: number;
  antoineB: number;
  antoineC: number;
  antoineMin: number;
  antoineMax: number;
};

export const compounds: Compound[] = (rows as (string | number)[][]).map((row) => ({
  formula: row[0] as string,
  name: row[1] as string,
  molecularWeight: row[2] as number,
  criticalTemperature: row[3] as number,
  criticalPressure: row[4] as number,
  acentricFactor: row[5] as number,
  antoineA: row[6] as number,
  antoineB: row[7] as number,
  antoineC: row[8] as number,
  antoineMin: row[9] as number,
  antoineMax: row[10] as number,
}));

type FluidConstants = {
  b1: number; b2: number; b3: number; b4: number;
  c1: number; c2: number; c3: number; c4: number;
  d1: number; d2: number; beta: number; gamma: number;
};

const simple: FluidConstants = {
  b1: 0.1181193, b2: 0.265728, b3: 0.15479, b4: 0.030323,
  c1: 0.0236744, c2: 0.0186984, c3: 0, c4: 0.042724,
  d1: 0.0000155488, d2: 0.0000623689, beta: 0.65392, gamma: 0.060167,
};
const reference: FluidConstants = {
  b1: 0.2026579, b2: 0.331511, b3: 0.027655, b4: 0.203488,
  c1: 0.0313385, c2: 0.0503618, c3: 0.016901, c4: 0.041577,
  d1: 0.000048736, d2: 0.00000740336, beta: 1.226, gamma: 0.03754,
};
const referenceOmega = 0.3978;
const gasConstant = 8.314462618;

function reducedPressure(tr: number, vr: number, c: FluidConstants) {
  const b = c.b1 - c.b2 / tr - c.b3 / tr ** 2 - c.b4 / tr ** 3;
  const cc = c.c1 - c.c2 / tr + c.c3 / tr ** 3;
  const d = c.d1 + c.d2 / tr;
  const exponential = c.c4 / (tr ** 3 * vr ** 2)
    * (c.beta + c.gamma / vr ** 2) * Math.exp(-c.gamma / vr ** 2);
  return tr / vr * (1 + b / vr + cc / vr ** 2 + d / vr ** 5 + exponential);
}

function solveReducedVolume(tr: number, pr: number, constants: FluidConstants) {
  // Scan logarithmically and retain the largest root: the vapour root used by
  // the Lee–Kesler tables and the most stable choice above the critical point.
  const roots: number[] = [];
  let previousV = 0.015;
  let previousF = reducedPressure(tr, previousV, constants) - pr;
  for (let index = 1; index <= 400; index += 1) {
    const volume = 0.015 * (25000 / 0.015) ** (index / 400);
    const value = reducedPressure(tr, volume, constants) - pr;
    if (Number.isFinite(value) && previousF * value <= 0) {
      let low = previousV;
      let high = volume;
      let lowValue = previousF;
      for (let iteration = 0; iteration < 70; iteration += 1) {
        const middle = (low + high) / 2;
        const middleValue = reducedPressure(tr, middle, constants) - pr;
        if (lowValue * middleValue <= 0) high = middle;
        else { low = middle; lowValue = middleValue; }
      }
      roots.push((low + high) / 2);
    }
    previousV = volume;
    previousF = value;
  }
  return roots.length > 0 ? roots[roots.length - 1] : null;
}

function compressibility(tr: number, pr: number, omega: number) {
  if (pr <= 0) return 1;
  const v0 = solveReducedVolume(tr, pr, simple);
  const vr = solveReducedVolume(tr, pr, reference);
  if (v0 === null || vr === null) return null;
  const z0 = pr * v0 / tr;
  const zReference = pr * vr / tr;
  return z0 + omega / referenceOmega * (zReference - z0);
}

function integrateLogPressure(fn: (pressure: number) => number, upper: number) {
  const lower = Math.min(1e-6, upper / 10000);
  const steps = 80;
  const start = Math.log(lower);
  const end = Math.log(upper);
  let sum = 0;
  for (let index = 0; index <= steps; index += 1) {
    const pressure = Math.exp(start + (end - start) * index / steps);
    const weight = index === 0 || index === steps ? 1 : index % 2 === 0 ? 2 : 4;
    sum += weight * fn(pressure);
  }
  return sum * (end - start) / (3 * steps);
}

export type CompoundCalculation = {
  reducedTemperature: number;
  reducedPressure: number;
  compressibility: number;
  molarVolume: number;
  density: number;
  fugacityCoefficient: number;
  fugacity: number;
  enthalpyDeparture: number;
  entropyDeparture: number;
  saturationPressure: number | null;
  saturationInRange: boolean;
};

export function calculateCompound(compound: Compound, temperature: number, pressureBar: number): CompoundCalculation | null {
  if (!(temperature > 0) || !(pressureBar > 0)) return null;
  const tr = temperature / compound.criticalTemperature;
  const pr = pressureBar / compound.criticalPressure;
  const z = compressibility(tr, pr, compound.acentricFactor);
  if (z === null) return null;

  const lnPhi = integrateLogPressure((p) => (compressibility(tr, p, compound.acentricFactor) ?? 1) - 1, pr);
  const delta = Math.max(0.0002, tr * 0.001);
  const dIntegralDTr = (
    integrateLogPressure((p) => (compressibility(tr + delta, p, compound.acentricFactor) ?? 1) - 1, pr)
    - integrateLogPressure((p) => (compressibility(Math.max(0.08, tr - delta), p, compound.acentricFactor) ?? 1) - 1, pr)
  ) / (2 * delta);
  const hResidualOverRt = -tr * dIntegralDTr;
  const sResidualOverR = hResidualOverRt - lnPhi;
  const saturationInRange = temperature >= compound.antoineMin && temperature <= compound.antoineMax;
  const saturationPressure = saturationInRange
    ? Math.exp(compound.antoineA - compound.antoineB / (temperature + compound.antoineC))
    : null;

  return {
    reducedTemperature: tr,
    reducedPressure: pr,
    compressibility: z,
    molarVolume: z * gasConstant * temperature / (pressureBar * 100),
    density: compound.molecularWeight / (z * gasConstant * temperature / (pressureBar * 100)),
    fugacityCoefficient: Math.exp(lnPhi),
    fugacity: pressureBar * Math.exp(lnPhi),
    enthalpyDeparture: hResidualOverRt * gasConstant * temperature / 1000,
    entropyDeparture: sResidualOverR * gasConstant,
    saturationPressure,
    saturationInRange,
  };
}

export function normalizeCompoundQuery(value: string) {
  return value.toLowerCase().replace(/[\s₀₁₂₃₄₅₆₇₈₉₋-]/g, (character) => ({
    "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5",
    "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₋": "", "-": "", " ": "",
  }[character] ?? character));
}
