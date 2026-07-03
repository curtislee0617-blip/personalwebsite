import type { Compound } from "@/lib/compound-properties";

export type VleModel = "ideal" | "van-laar" | "nrtl" | "wilson" | "peng-robinson";
export type DiagramType = "txy" | "pxy";
export type VleParameters = {
  a12: number;
  a21: number;
  alpha: number;
  lambda12: number;
  lambda21: number;
  kij: number;
};
export type VlePoint = { x: number; y: number; value: number };
export type VleResult = { points: VlePoint[]; failed: number; extrapolated: boolean };

const R = 0.08314462618; // L bar mol-1 K-1

function saturationPressure(compound: Compound, temperature: number) {
  return Math.exp(compound.antoineA - compound.antoineB / (temperature + compound.antoineC));
}

function activityCoefficients(model: VleModel, x1: number, parameters: VleParameters): [number, number] {
  const x2 = 1 - x1;
  const tiny = 1e-12;
  if (model === "ideal") return [1, 1];
  if (model === "van-laar") {
    const denominator = parameters.a12 * x1 + parameters.a21 * x2 || tiny;
    return [
      Math.exp(parameters.a12 * (parameters.a21 * x2 / denominator) ** 2),
      Math.exp(parameters.a21 * (parameters.a12 * x1 / denominator) ** 2),
    ];
  }
  if (model === "nrtl") {
    const g12 = Math.exp(-parameters.alpha * parameters.a12);
    const g21 = Math.exp(-parameters.alpha * parameters.a21);
    const lnGamma1 = x2 ** 2 * (
      parameters.a21 * (g21 / (x1 + x2 * g21 + tiny)) ** 2
      + parameters.a12 * g12 / (x2 + x1 * g12 + tiny) ** 2
    );
    const lnGamma2 = x1 ** 2 * (
      parameters.a12 * (g12 / (x2 + x1 * g12 + tiny)) ** 2
      + parameters.a21 * g21 / (x1 + x2 * g21 + tiny) ** 2
    );
    return [Math.exp(lnGamma1), Math.exp(lnGamma2)];
  }
  const denominator1 = x1 + parameters.lambda12 * x2 || tiny;
  const denominator2 = x2 + parameters.lambda21 * x1 || tiny;
  const correction = parameters.lambda12 / denominator1 - parameters.lambda21 / denominator2;
  return [
    Math.exp(-Math.log(denominator1) + x2 * correction),
    Math.exp(-Math.log(denominator2) - x1 * correction),
  ];
}

function modifiedRaoultPoint(
  first: Compound,
  second: Compound,
  temperature: number,
  x: number,
  model: VleModel,
  parameters: VleParameters,
) {
  const [gamma1, gamma2] = activityCoefficients(model, x, parameters);
  const firstContribution = x * gamma1 * saturationPressure(first, temperature);
  const secondContribution = (1 - x) * gamma2 * saturationPressure(second, temperature);
  const pressure = firstContribution + secondContribution;
  return { pressure, y: pressure > 0 ? firstContribution / pressure : x };
}

type PrPure = { a: number; b: number };

function prPure(compound: Compound, temperature: number): PrPure {
  const tr = temperature / compound.criticalTemperature;
  const kappa = 0.37464 + 1.54226 * compound.acentricFactor - 0.26992 * compound.acentricFactor ** 2;
  const alpha = (1 + kappa * (1 - Math.sqrt(tr))) ** 2;
  return {
    a: 0.45724 * R ** 2 * compound.criticalTemperature ** 2 / compound.criticalPressure * alpha,
    b: 0.0778 * R * compound.criticalTemperature / compound.criticalPressure,
  };
}

function cubicRoots(a: number, b: number, c: number) {
  const p = b - a ** 2 / 3;
  const q = 2 * a ** 3 / 27 - a * b / 3 + c;
  const discriminant = q ** 2 / 4 + p ** 3 / 27;
  if (discriminant >= 0) {
    const u = Math.cbrt(-q / 2 + Math.sqrt(discriminant));
    const v = Math.cbrt(-q / 2 - Math.sqrt(discriminant));
    return [u + v - a / 3];
  }
  const radius = 2 * Math.sqrt(-p / 3);
  const theta = Math.acos((3 * q / (2 * p)) * Math.sqrt(-3 / p));
  return [0, 1, 2].map((index) => radius * Math.cos((theta + 2 * Math.PI * index) / 3) - a / 3).sort((x, y) => x - y);
}

function prPhi(
  compounds: [Compound, Compound],
  temperature: number,
  pressure: number,
  composition: [number, number],
  phase: "liquid" | "vapour",
  kij: number,
) {
  const pure = compounds.map((compound) => prPure(compound, temperature)) as [PrPure, PrPure];
  const a12 = Math.sqrt(pure[0].a * pure[1].a) * (1 - kij);
  const matrix = [[pure[0].a, a12], [a12, pure[1].a]];
  const aMix = composition.reduce((sum, zi, i) => sum + composition.reduce((inner, zj, j) => inner + zi * zj * matrix[i][j], 0), 0);
  const bMix = composition[0] * pure[0].b + composition[1] * pure[1].b;
  const A = aMix * pressure / (R ** 2 * temperature ** 2);
  const B = bMix * pressure / (R * temperature);
  const roots = cubicRoots(-(1 - B), A - 3 * B ** 2 - 2 * B, -(A * B - B ** 2 - B ** 3)).filter((root) => root > B);
  // A single real root represents a homogeneous state. Treating that same
  // root as both liquid and vapour would create a false Kᵢ = 1 equilibrium.
  if (roots.length < 2 || !(aMix > 0) || !(bMix > 0)) return null;
  const z = phase === "liquid" ? roots[0] : roots[roots.length - 1];
  const logarithm = Math.log((z + (1 + Math.SQRT2) * B) / (z + (1 - Math.SQRT2) * B));
  return compounds.map((_, i) => {
    const sumAij = composition[0] * matrix[i][0] + composition[1] * matrix[i][1];
    const lnPhi = pure[i].b / bMix * (z - 1) - Math.log(z - B)
      - A / (2 * Math.SQRT2 * B) * (2 * sumAij / aMix - pure[i].b / bMix) * logarithm;
    return Math.exp(lnPhi);
  }) as [number, number];
}

function wilsonK(compound: Compound, temperature: number, pressure: number) {
  return compound.criticalPressure / pressure
    * Math.exp(5.373 * (1 + compound.acentricFactor) * (1 - compound.criticalTemperature / temperature));
}

function prAtTemperaturePressure(
  compounds: [Compound, Compound],
  temperature: number,
  pressure: number,
  x: number,
  kij: number,
) {
  const liquid: [number, number] = [x, 1 - x];
  let k: [number, number] = [wilsonK(compounds[0], temperature, pressure), wilsonK(compounds[1], temperature, pressure)];
  let vapour: [number, number] = [x, 1 - x];
  for (let iteration = 0; iteration < 45; iteration += 1) {
    const total = liquid[0] * k[0] + liquid[1] * k[1];
    vapour = [liquid[0] * k[0] / total, liquid[1] * k[1] / total];
    const phiLiquid = prPhi(compounds, temperature, pressure, liquid, "liquid", kij);
    const phiVapour = prPhi(compounds, temperature, pressure, vapour, "vapour", kij);
    if (!phiLiquid || !phiVapour) return null;
    const next: [number, number] = [phiLiquid[0] / phiVapour[0], phiLiquid[1] / phiVapour[1]];
    if (Math.max(Math.abs(next[0] - k[0]), Math.abs(next[1] - k[1])) < 1e-8) { k = next; break; }
    k = [Math.sqrt(k[0] * next[0]), Math.sqrt(k[1] * next[1])];
  }
  return { sum: liquid[0] * k[0] + liquid[1] * k[1], y: vapour[0] };
}

function prBubblePressure(compounds: [Compound, Compound], temperature: number, x: number, kij: number) {
  const minimum = 0.0001;
  const maximum = Math.max(compounds[0].criticalPressure, compounds[1].criticalPressure) * 2;
  let previous: { pressure: number; residual: number } | null = null;
  let best: { pressure: number; residual: number; y: number } | null = null;
  for (let index = 0; index <= 180; index += 1) {
    const pressure = minimum * (maximum / minimum) ** (index / 180);
    const state = prAtTemperaturePressure(compounds, temperature, pressure, x, kij);
    if (!state) continue;
    const residual = state.sum - 1;
    if (!best || Math.abs(residual) < Math.abs(best.residual)) best = { pressure, residual, y: state.y };
    if (previous && previous.residual * residual <= 0) {
      let low = previous.pressure;
      let high = pressure;
      let lowResidual = previous.residual;
      let finalState = state;
      for (let iteration = 0; iteration < 55; iteration += 1) {
        const middle = Math.sqrt(low * high);
        const middleState = prAtTemperaturePressure(compounds, temperature, middle, x, kij);
        if (!middleState) { low = middle; continue; }
        const middleResidual = middleState.sum - 1;
        finalState = middleState;
        if (lowResidual * middleResidual <= 0) high = middle;
        else { low = middle; lowResidual = middleResidual; }
      }
      return { pressure: Math.sqrt(low * high), y: finalState.y };
    }
    previous = { pressure, residual };
  }
  return best && Math.abs(best.residual) < 0.02 ? { pressure: best.pressure, y: best.y } : null;
}

function findTemperature(residual: (temperature: number) => number | null, minimum: number, maximum: number) {
  let previousT = minimum;
  let previous = residual(previousT);
  for (let index = 1; index <= 100; index += 1) {
    const temperature = minimum + (maximum - minimum) * index / 100;
    const value = residual(temperature);
    if (previous !== null && value !== null && previous * value <= 0) {
      let low = previousT;
      let high = temperature;
      let lowValue = previous;
      for (let iteration = 0; iteration < 55; iteration += 1) {
        const middle = (low + high) / 2;
        const middleValue = residual(middle);
        if (middleValue === null) return null;
        if (lowValue * middleValue <= 0) high = middle;
        else { low = middle; lowValue = middleValue; }
      }
      return (low + high) / 2;
    }
    if (value !== null) { previousT = temperature; previous = value; }
  }
  return null;
}

export function generateVleDiagram(
  first: Compound,
  second: Compound,
  type: DiagramType,
  fixedValue: number,
  model: VleModel,
  parameters: VleParameters,
): VleResult {
  const points: VlePoint[] = [];
  let failed = 0;
  const compounds: [Compound, Compound] = [first, second];
  for (let index = 0; index <= 40; index += 1) {
    const x = index / 40;
    if (type === "pxy") {
      const temperature = fixedValue;
      const point = model === "peng-robinson"
        ? prBubblePressure(compounds, temperature, x, parameters.kij)
        : modifiedRaoultPoint(first, second, temperature, x, model, parameters);
      if (point && Number.isFinite(point.pressure) && Number.isFinite(point.y)) points.push({ x, y: point.y, value: point.pressure });
      else failed += 1;
    } else {
      const pressure = fixedValue;
      const minimum = Math.max(25, Math.min(first.antoineMin, second.antoineMin, first.criticalTemperature * 0.35, second.criticalTemperature * 0.35));
      const maximum = Math.max(first.criticalTemperature, second.criticalTemperature) * 1.15;
      const residual = (temperature: number) => {
        if (model === "peng-robinson") {
          const state = prAtTemperaturePressure(compounds, temperature, pressure, x, parameters.kij);
          return state ? state.sum - 1 : null;
        }
        return modifiedRaoultPoint(first, second, temperature, x, model, parameters).pressure - pressure;
      };
      const temperature = findTemperature(residual, minimum, maximum);
      if (temperature !== null) {
        const point = model === "peng-robinson"
          ? prAtTemperaturePressure(compounds, temperature, pressure, x, parameters.kij)
          : modifiedRaoultPoint(first, second, temperature, x, model, parameters);
        if (point) points.push({ x, y: point.y, value: temperature });
        else failed += 1;
      } else failed += 1;
    }
  }
  const extrapolated = model !== "peng-robinson" && points.some((point) => {
    const temperature = type === "txy" ? point.value : fixedValue;
    return temperature < first.antoineMin || temperature > first.antoineMax || temperature < second.antoineMin || temperature > second.antoineMax;
  });
  return { points, failed, extrapolated };
}
