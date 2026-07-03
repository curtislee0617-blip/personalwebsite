import tableData from "@/data/koretsky-steam-tables.json";

export type WaterRegion = "superheated" | "subcooled";
export type PropertyKey = "p" | "t" | "v" | "u" | "h" | "s";
export type WaterState = Record<PropertyKey, number>;

type TablePoint = Omit<WaterState, "p">;
type PressureSlice = { p: number; points: TablePoint[] };

export const propertyDetails: Record<PropertyKey, { symbol: string; name: string; unit: string }> = {
  p: { symbol: "P", name: "Pressure", unit: "MPa" },
  t: { symbol: "T", name: "Temperature", unit: "°C" },
  v: { symbol: "v̂", name: "Specific volume", unit: "m³/kg" },
  u: { symbol: "û", name: "Specific internal energy", unit: "kJ/kg" },
  h: { symbol: "ĥ", name: "Specific enthalpy", unit: "kJ/kg" },
  s: { symbol: "ŝ", name: "Specific entropy", unit: "kJ/(kg·K)" },
};

const grids: Record<WaterRegion, PressureSlice[]> = {
  superheated: tableData.superheated,
  subcooled: tableData.subcooled,
};

function mix(left: number, right: number, fraction: number) {
  return left + (right - left) * fraction;
}

function bracket<T>(items: T[], value: number, getValue: (item: T) => number): [T, T] | null {
  if (!items.length || value < getValue(items[0]) || value > getValue(items[items.length - 1])) return null;
  const exact = items.find((item) => Math.abs(getValue(item) - value) < 1e-10);
  if (exact) return [exact, exact];

  for (let index = 0; index < items.length - 1; index += 1) {
    if (getValue(items[index]) <= value && value <= getValue(items[index + 1])) {
      return [items[index], items[index + 1]];
    }
  }
  return null;
}

function interpolateTemperature(slice: PressureSlice, temperature: number): WaterState | null {
  const pair = bracket(slice.points, temperature, (point) => point.t);
  if (!pair) return null;
  const [lower, upper] = pair;
  const fraction = lower === upper ? 0 : (temperature - lower.t) / (upper.t - lower.t);

  return {
    p: slice.p,
    t: temperature,
    v: mix(lower.v, upper.v, fraction),
    u: mix(lower.u, upper.u, fraction),
    h: mix(lower.h, upper.h, fraction),
    s: mix(lower.s, upper.s, fraction),
  };
}

export function pressureRange(region: WaterRegion) {
  const slices = grids[region];
  return { min: slices[0].p, max: slices[slices.length - 1].p };
}

export function temperatureRange(region: WaterRegion, pressure: number) {
  const pair = bracket(grids[region], pressure, (slice) => slice.p);
  if (!pair) return null;
  const [lower, upper] = pair;
  return {
    min: Math.max(lower.points[0].t, upper.points[0].t),
    max: Math.min(lower.points[lower.points.length - 1].t, upper.points[upper.points.length - 1].t),
  };
}

export function evaluateState(region: WaterRegion, pressure: number, temperature: number): WaterState | null {
  const pair = bracket(grids[region], pressure, (slice) => slice.p);
  if (!pair) return null;
  const [lower, upper] = pair;
  const lowerState = interpolateTemperature(lower, temperature);
  const upperState = interpolateTemperature(upper, temperature);
  if (!lowerState || !upperState) return null;
  const fraction = lower === upper ? 0 : (pressure - lower.p) / (upper.p - lower.p);

  return {
    p: pressure,
    t: temperature,
    v: mix(lowerState.v, upperState.v, fraction),
    u: mix(lowerState.u, upperState.u, fraction),
    h: mix(lowerState.h, upperState.h, fraction),
    s: mix(lowerState.s, upperState.s, fraction),
  };
}

function scaleFor(key: PropertyKey, target: number) {
  const floors: Record<PropertyKey, number> = { p: 0.1, t: 10, v: 0.001, u: 100, h: 100, s: 1 };
  return Math.max(Math.abs(target), floors[key]);
}

function stateError(state: WaterState, inputs: Array<{ key: PropertyKey; value: number }>) {
  return Math.sqrt(inputs.reduce((sum, input) => {
    const difference = (state[input.key] - input.value) / scaleFor(input.key, input.value);
    return sum + difference * difference;
  }, 0));
}

function pressureCandidates(region: WaterRegion, subdivisions = 8) {
  const slices = grids[region];
  const result: number[] = [];
  for (let index = 0; index < slices.length - 1; index += 1) {
    const left = slices[index].p;
    const right = slices[index + 1].p;
    for (let step = 0; step < subdivisions; step += 1) {
      result.push(mix(left, right, step / subdivisions));
    }
  }
  result.push(slices[slices.length - 1].p);
  return result;
}

export type SolveResult = {
  state: WaterState | null;
  error?: string;
  residual?: number;
  approximate?: boolean;
};

export function solveState(
  region: WaterRegion,
  first: { key: PropertyKey; value: number },
  second: { key: PropertyKey; value: number },
): SolveResult {
  if (first.key === second.key) return { state: null, error: "Choose two different independent properties." };
  if (![first.value, second.value].every(Number.isFinite)) return { state: null, error: "Enter two valid numerical values." };
  const inputs = [first, second];
  const pressureInput = inputs.find((input) => input.key === "p");
  const temperatureInput = inputs.find((input) => input.key === "t");

  if (pressureInput && temperatureInput) {
    const state = evaluateState(region, pressureInput.value, temperatureInput.value);
    if (!state) {
      const range = temperatureRange(region, pressureInput.value);
      const pressureLimits = pressureRange(region);
      const detail = range
        ? `At ${pressureInput.value} MPa, use ${range.min.toFixed(2)} to ${range.max.toFixed(0)} °C.`
        : `Pressure must be between ${pressureLimits.min} and ${pressureLimits.max} MPa.`;
      return { state: null, error: `That state is outside the selected Koretsky table. ${detail}` };
    }
    return { state, residual: 0, approximate: false };
  }

  let bestState: WaterState | null = null;
  let bestError = Number.POSITIVE_INFINITY;
  const pressureValues = pressureInput ? [pressureInput.value] : pressureCandidates(region, 10);

  for (const pressure of pressureValues) {
    const range = temperatureRange(region, pressure);
    if (!range) continue;
    const temperatureValues = temperatureInput
      ? [temperatureInput.value]
      : Array.from({ length: 61 }, (_, index) => mix(range.min, range.max, index / 60));

    for (const temperature of temperatureValues) {
      const state = evaluateState(region, pressure, temperature);
      if (!state) continue;
      const error = stateError(state, inputs);
      if (error < bestError) {
        bestError = error;
        bestState = state;
      }
    }
  }

  if (!bestState) return { state: null, error: "No state in this table matches those inputs." };

  let pressureStep = Math.max(bestState.p * 0.08, region === "subcooled" ? 0.5 : 0.005);
  let temperatureStep = 12;
  for (let iteration = 0; iteration < 16; iteration += 1) {
    const pressures = pressureInput
      ? [pressureInput.value]
      : [bestState.p - pressureStep, bestState.p, bestState.p + pressureStep];
    const temperatures = temperatureInput
      ? [temperatureInput.value]
      : [bestState.t - temperatureStep, bestState.t, bestState.t + temperatureStep];

    for (const pressure of pressures) {
      for (const temperature of temperatures) {
        const state = evaluateState(region, pressure, temperature);
        if (!state) continue;
        const error = stateError(state, inputs);
        if (error < bestError) {
          bestError = error;
          bestState = state;
        }
      }
    }
    pressureStep /= 2;
    temperatureStep /= 2;
  }

  if (bestError > 0.03) {
    return { state: null, error: "Those values do not describe a consistent state within the selected table range." };
  }
  return { state: bestState, residual: bestError, approximate: bestError > 0.0005 };
}

export function formatProperty(key: PropertyKey, value: number) {
  if (key === "v") return value < 0.01 ? value.toFixed(7) : value.toFixed(5);
  if (key === "s") return value.toFixed(4);
  if (key === "p") return value < 0.1 ? value.toFixed(4) : value.toFixed(3);
  if (key === "t") return value.toFixed(2);
  return value.toFixed(1);
}

