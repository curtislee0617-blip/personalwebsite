export type ComplexFid = {
  time: Float32Array;
  real: Float64Array;
  imaginary: Float64Array;
  pointCount: number;
  dwellTime: number;
};

export type SpinsolveParameters = {
  observationMHz?: number;
  observation2MHz?: number;
  bandwidthHz?: number;
  bandwidth2Hz?: number;
  lowestFrequencyHz?: number;
  lowestFrequency2Hz?: number;
  nucleus?: string;
  nucleus2?: string;
  solvent?: string;
  sample?: string;
  experiment?: string;
};

export type NmrPoint = { shift: number; intensity: number };
export type NmrPeak = NmrPoint & { index: number; prominence: number };
export type ComplexFid2d = { width: number; height: number; real: Float64Array; imaginary: Float64Array };
export type NmrSpectrum2d = { width: number; height: number; intensity: Float32Array; xLow: number; xHigh: number; yLow: number; yHigh: number; experiment: "cosy" | "hsqc" };
export type NmrPeak2d = { x: number; y: number; intensity: number; xIndex: number; yIndex: number };
export type NmrProcessingScript = {
  phase0Degrees?: number;
  phase1Degrees?: number;
  lineBroadeningHz?: number;
};

const SPINSOLVE_MAGIC = "SORPATAD1.1V";

export function parseSpinsolve1d(buffer: ArrayBuffer): ComplexFid {
  if (buffer.byteLength < 44) throw new Error("The .1d file is too small to contain Spinsolve data.");
  const bytes = new Uint8Array(buffer, 0, 12);
  const magic = String.fromCharCode(...bytes);
  if (magic !== SPINSOLVE_MAGIC) throw new Error("This .1d file is not a supported Magritek Spinsolve binary file.");
  const view = new DataView(buffer);
  const pointCount = view.getUint32(16, true);
  const floatCount = (buffer.byteLength - 32) / 4;
  if (!Number.isInteger(floatCount) || floatCount !== pointCount * 3) throw new Error("The Spinsolve point count does not match the binary payload.");
  const values = new Float32Array(buffer, 32);
  const time = values.slice(0, pointCount);
  const real = new Float64Array(pointCount);
  const imaginary = new Float64Array(pointCount);
  for (let index = 0; index < pointCount; index += 1) {
    real[index] = values[pointCount + index * 2];
    imaginary[index] = values[pointCount + index * 2 + 1];
  }
  const dwellTime = pointCount > 1 ? time[1] - time[0] : 0;
  return { time, real, imaginary, pointCount, dwellTime };
}

export function parseSpinsolve2d(buffer: ArrayBuffer): ComplexFid2d {
  if (buffer.byteLength < 40) throw new Error("The .2d file is too small to contain Spinsolve data.");
  const magic = String.fromCharCode(...new Uint8Array(buffer, 0, 12));
  if (magic !== SPINSOLVE_MAGIC) throw new Error("This .2d file is not a supported Magritek Spinsolve binary file.");
  const view = new DataView(buffer);
  const width = view.getUint32(16, true);
  const floatCount = (buffer.byteLength - 32) / 4;
  const complexCount = floatCount / 2;
  const height = complexCount / width;
  if (!Number.isInteger(floatCount) || !Number.isInteger(height) || width < 2 || height < 2) throw new Error("The Spinsolve 2D matrix dimensions do not match the binary payload.");
  const values = new Float32Array(buffer, 32);
  const real = new Float64Array(complexCount);
  const imaginary = new Float64Array(complexCount);
  for (let index = 0; index < complexCount; index += 1) {
    real[index] = values[index * 2];
    imaginary[index] = values[index * 2 + 1];
  }
  return { width, height, real, imaginary };
}

export function parseSpinsolveParameters(text: string): SpinsolveParameters {
  const entries = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const separator = line.indexOf("=");
    if (separator < 0) continue;
    entries.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^"|"$/g, ""));
  }
  const numeric = (key: string) => {
    const value = Number(entries.get(key));
    return Number.isFinite(value) ? value : undefined;
  };
  const bandwidth = numeric("bandwidth");
  return {
    observationMHz: numeric("b1Freq"),
    observation2MHz: numeric("b1Freq2"),
    bandwidthHz: bandwidth === undefined ? undefined : bandwidth * 1000,
    bandwidth2Hz: numeric("bandwidth2") === undefined ? undefined : numeric("bandwidth2")! * 1000,
    lowestFrequencyHz: numeric("lowestFrequency"),
    lowestFrequency2Hz: numeric("lowestFrequency2"),
    nucleus: entries.get("rxChannel"),
    nucleus2: entries.get("rxChannel2"),
    solvent: entries.get("Solvent"),
    sample: entries.get("Sample"),
    experiment: entries.get("experiment"),
  };
}

export function parseProcessingScript(text: string): NmrProcessingScript {
  const number = String.raw`[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?`;
  const phase = new RegExp(String.raw`Phase\(\s*(${number})(?:\s*,\s*(${number}))?`, "i").exec(text);
  const broadening = new RegExp(String.raw`LineBroaden\(\s*(${number})`, "i").exec(text);
  return {
    phase0Degrees: phase ? Number(phase[1]) : undefined,
    phase1Degrees: phase?.[2] === undefined ? undefined : Number(phase[2]),
    lineBroadeningHz: broadening ? Number(broadening[1]) : undefined,
  };
}

export function normalizePhaseDegrees(value: number) {
  if (!Number.isFinite(value)) return 0;
  return ((value + 180) % 360 + 360) % 360 - 180;
}

// Spinsolve's processing script rotates the instrument spectrum using the
// opposite complex-sign convention from processSpinsolveFid's FFT. Negating
// the stored phase reproduces the vendor-processed spectrum; normalising ϕ₀
// keeps the equivalent angle inside the UI slider's range.
export function spinsolvePhaseCorrection(processing: NmrProcessingScript) {
  if (processing.phase0Degrees === undefined || !Number.isFinite(processing.phase0Degrees)) return null;
  return {
    phase0Degrees: normalizePhaseDegrees(-processing.phase0Degrees),
    phase1Degrees: Number.isFinite(processing.phase1Degrees) ? -(processing.phase1Degrees ?? 0) : 0,
  };
}

export function integrateNmrRegion(points: NmrPoint[], low: number, high: number) {
  if (points.length < 2 || !Number.isFinite(low) || !Number.isFinite(high)) return 0;
  const lower = Math.min(low, high);
  const upper = Math.max(low, high);
  const ordered = [...points].sort((first, second) => first.shift - second.shift);
  let area = 0;

  // Clip every line segment to the requested limits and linearly interpolate
  // its two boundary intensities. This integrates exactly to the user's drag
  // limits even when an edge falls between acquired points.
  for (let index = 1; index < ordered.length; index += 1) {
    const first = ordered[index - 1];
    const second = ordered[index];
    if (second.shift <= lower || first.shift >= upper || second.shift === first.shift) continue;
    const segmentLow = Math.max(lower, first.shift);
    const segmentHigh = Math.min(upper, second.shift);
    if (segmentHigh <= segmentLow) continue;
    const fractionLow = (segmentLow - first.shift) / (second.shift - first.shift);
    const fractionHigh = (segmentHigh - first.shift) / (second.shift - first.shift);
    const intensityLow = first.intensity + (second.intensity - first.intensity) * fractionLow;
    const intensityHigh = first.intensity + (second.intensity - first.intensity) * fractionHigh;
    area += (segmentHigh - segmentLow) * (intensityLow + intensityHigh) / 2;
  }
  return area;
}

export function couplingConstantHz(first: number, second: number, axis: "ppm" | "hz", observationMHz: number) {
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
  if (axis === "ppm" && !(observationMHz > 0)) return null;
  return Math.abs(first - second) * (axis === "ppm" ? observationMHz : 1);
}

export function solventReferenceOffset(measuredShift: number, knownShift: number) {
  if (!Number.isFinite(measuredShift) || !Number.isFinite(knownShift)) return 0;
  return knownShift - measuredShift;
}

function fft(real: Float64Array, imaginary: Float64Array) {
  const size = real.length;
  for (let index = 1, reverse = 0; index < size; index += 1) {
    let bit = size >> 1;
    for (; reverse & bit; bit >>= 1) reverse ^= bit;
    reverse ^= bit;
    if (index < reverse) {
      [real[index], real[reverse]] = [real[reverse], real[index]];
      [imaginary[index], imaginary[reverse]] = [imaginary[reverse], imaginary[index]];
    }
  }
  for (let length = 2; length <= size; length <<= 1) {
    const angle = -2 * Math.PI / length;
    const stepReal = Math.cos(angle);
    const stepImaginary = Math.sin(angle);
    for (let offset = 0; offset < size; offset += length) {
      let wReal = 1;
      let wImaginary = 0;
      for (let index = 0; index < length / 2; index += 1) {
        const even = offset + index;
        const odd = even + length / 2;
        const oddReal = real[odd] * wReal - imaginary[odd] * wImaginary;
        const oddImaginary = real[odd] * wImaginary + imaginary[odd] * wReal;
        real[odd] = real[even] - oddReal;
        imaginary[odd] = imaginary[even] - oddImaginary;
        real[even] += oddReal;
        imaginary[even] += oddImaginary;
        const nextReal = wReal * stepReal - wImaginary * stepImaginary;
        wImaginary = wReal * stepImaginary + wImaginary * stepReal;
        wReal = nextReal;
      }
    }
  }
}

function transformFid(fid: ComplexFid, lineBroadeningHz: number, zeroFill: 1 | 2 | 4) {
  const size = fid.pointCount * zeroFill;
  const real = new Float64Array(size);
  const imaginary = new Float64Array(size);
  for (let index = 0; index < fid.pointCount; index += 1) {
    const window = Math.exp(-Math.PI * Math.max(0, lineBroadeningHz) * fid.time[index]);
    real[index] = fid.real[index] * window;
    imaginary[index] = fid.imaginary[index] * window;
  }
  fft(real, imaginary);
  return { real, imaginary, size };
}

// Frequency ordering used everywhere the spectrum is walked left→right, so the
// phase-fraction here matches processSpinsolveFid's displayed axis exactly.
function displayFraction(displayIndex: number, size: number) {
  return size > 1 ? displayIndex / (size - 1) : 0;
}

// Phase-correction quality: fraction of signed energy that is positive
// (absorptive/upright) among significant points, for a given zero- and
// first-order phase. phase1 is the total roll across the whole spectrum.
function phaseScore(
  real: Float64Array,
  imaginary: Float64Array,
  size: number,
  threshold: number,
  phase0Deg: number,
  phase1Deg: number,
) {
  const phase0 = phase0Deg * Math.PI / 180;
  const phase1 = phase1Deg * Math.PI / 180;
  let signedEnergy = 0;
  let totalEnergy = 0;
  for (let displayIndex = 0; displayIndex < size; displayIndex += 1) {
    const source = (displayIndex + size / 2) % size;
    if (Math.hypot(real[source], imaginary[source]) < threshold) continue;
    const angle = phase0 + phase1 * displayFraction(displayIndex, size);
    const value = real[source] * Math.cos(angle) - imaginary[source] * Math.sin(angle);
    const square = value * value;
    signedEnergy += value >= 0 ? square : -square;
    totalEnergy += square;
  }
  return totalEnergy > 0 ? signedEnergy / totalEnergy : -Infinity;
}

function refineZeroOrder(
  real: Float64Array,
  imaginary: Float64Array,
  size: number,
  threshold: number,
  phase1Deg: number,
) {
  let bestPhase = 0;
  let bestScore = -Infinity;
  for (let phase = -180; phase <= 180; phase += 1) {
    const candidate = phaseScore(real, imaginary, size, threshold, phase, phase1Deg);
    if (candidate > bestScore) { bestPhase = phase; bestScore = candidate; }
  }
  const refinementCentre = bestPhase;
  for (let phase = refinementCentre - 1; phase <= refinementCentre + 1; phase += 0.1) {
    const candidate = phaseScore(real, imaginary, size, threshold, phase, phase1Deg);
    if (candidate > bestScore) { bestPhase = phase; bestScore = candidate; }
  }
  return { phase: Math.round(bestPhase * 10) / 10, score: bestScore };
}

export function estimateZeroOrderPhase(fid: ComplexFid, lineBroadeningHz = 0.2) {
  return estimatePhaseCorrection(fid, lineBroadeningHz).phase0Degrees;
}

// Auto-phase both orders. A frequency-dependent (first-order) phase roll —
// common on benchtop spectrometers from digital-filter group delay — leaves
// peaks far from the carrier inverted no matter the zero-order value, which is
// the usual source of stubborn negative peaks. Stage the search: solve the
// zero-order phase, sweep the first-order roll, then re-refine the zero order.
export function estimatePhaseCorrection(fid: ComplexFid, lineBroadeningHz = 0.2) {
  const { real, imaginary, size } = transformFid(fid, lineBroadeningHz, 1);
  let magnitudeMaximum = 0;
  for (let index = 0; index < size; index += 1) magnitudeMaximum = Math.max(magnitudeMaximum, Math.hypot(real[index], imaginary[index]));
  const threshold = magnitudeMaximum * 0.025;

  let phase0 = refineZeroOrder(real, imaginary, size, threshold, 0).phase;

  let bestPhase1 = 0;
  let bestScore = phaseScore(real, imaginary, size, threshold, phase0, 0);
  for (let phase1 = -360; phase1 <= 360; phase1 += 10) {
    const zeroOrder = refineZeroOrder(real, imaginary, size, threshold, phase1);
    if (zeroOrder.score > bestScore) { bestScore = zeroOrder.score; bestPhase1 = phase1; phase0 = zeroOrder.phase; }
  }
  const phase1RefinementCentre = bestPhase1;
  for (let phase1 = phase1RefinementCentre - 10; phase1 <= phase1RefinementCentre + 10; phase1 += 2) {
    const zeroOrder = refineZeroOrder(real, imaginary, size, threshold, phase1);
    if (zeroOrder.score > bestScore) { bestScore = zeroOrder.score; bestPhase1 = phase1; phase0 = zeroOrder.phase; }
  }

  // Anchor upright on the tallest signal so a dispersive local optimum can't
  // leave the whole spectrum inverted.
  let tallestSource = 0;
  let tallestMagnitude = 0;
  for (let index = 0; index < size; index += 1) {
    const magnitude = Math.hypot(real[index], imaginary[index]);
    if (magnitude > tallestMagnitude) { tallestMagnitude = magnitude; tallestSource = index; }
  }
  const tallestDisplay = (tallestSource + size / 2) % size;
  const tallestAngle = (phase0 + bestPhase1 * displayFraction(tallestDisplay, size)) * Math.PI / 180;
  const tallestValue = real[tallestSource] * Math.cos(tallestAngle) - imaginary[tallestSource] * Math.sin(tallestAngle);
  if (tallestValue < 0) phase0 += phase0 > 0 ? -180 : 180;

  return { phase0Degrees: Math.round(normalizePhaseDegrees(phase0) * 10) / 10, phase1Degrees: Math.round(bestPhase1) };
}

export function processSpinsolveFid(
  fid: ComplexFid,
  options: { lineBroadeningHz: number; phaseDegrees: number; phase1Degrees?: number; zeroFill: 1 | 2 | 4; observationMHz?: number; carrierHz?: number },
) {
  const { real, imaginary, size } = transformFid(fid, options.lineBroadeningHz, options.zeroFill);
  const phase0 = options.phaseDegrees * Math.PI / 180;
  const phase1 = (options.phase1Degrees ?? 0) * Math.PI / 180;
  const sweepWidth = fid.dwellTime > 0 ? 1 / fid.dwellTime : 1;
  const carrier = options.carrierHz ?? 0;
  const points: NmrPoint[] = new Array(size);
  // Normalize by the largest absolute excursion, not the largest signed value.
  // A spectrum phased ~180° off has no positive peak, so a signed maximum stays
  // 0, the old code skipped normalization, and raw negative intensities leaked
  // straight to the chart. Absolute scaling always normalizes; the baseline
  // clip below then removes the residual dispersive negatives for display.
  let scale = 0;
  for (let index = 0; index < size; index += 1) {
    const shifted = (index + size / 2) % size;
    // Frequency-dependent phase: zero-order plus the first-order roll evaluated
    // at this point's position along the displayed axis.
    const angle = phase0 + phase1 * displayFraction(index, size);
    const phased = real[shifted] * Math.cos(angle) - imaginary[shifted] * Math.sin(angle);
    const frequency = carrier - sweepWidth / 2 + sweepWidth * (size - 1 - index) / size;
    const shift = options.observationMHz ? frequency / options.observationMHz : frequency;
    scale = Math.max(scale, Math.abs(phased));
    points[index] = { shift, intensity: phased };
  }
  if (scale > 0) for (const point of points) point.intensity = Math.max(0, point.intensity / scale);
  return points;
}

export function pickNmrPeaks(points: NmrPoint[], minimumProminence: number, minimumDistance: number, limit: number) {
  const candidates: NmrPeak[] = [];
  const window = Math.max(4, Math.round(minimumDistance / 2));
  for (let index = 1; index < points.length - 1; index += 1) {
    const value = points[index].intensity;
    if (value <= points[index - 1].intensity || value < points[index + 1].intensity) continue;
    let leftMinimum = value;
    let rightMinimum = value;
    for (let cursor = Math.max(0, index - window); cursor < index; cursor += 1) leftMinimum = Math.min(leftMinimum, points[cursor].intensity);
    for (let cursor = index + 1; cursor <= Math.min(points.length - 1, index + window); cursor += 1) rightMinimum = Math.min(rightMinimum, points[cursor].intensity);
    const prominence = value - Math.max(leftMinimum, rightMinimum);
    if (prominence >= minimumProminence) candidates.push({ ...points[index], index, prominence });
  }
  candidates.sort((a, b) => b.prominence - a.prominence);
  const selected: NmrPeak[] = [];
  for (const candidate of candidates) {
    if (selected.every((peak) => Math.abs(peak.index - candidate.index) >= minimumDistance)) selected.push(candidate);
    if (selected.length >= limit) break;
  }
  return selected.sort((a, b) => b.shift - a.shift);
}

export function processSpinsolve2d(fid: ComplexFid2d, parameters: SpinsolveParameters): NmrSpectrum2d {
  const { width, height } = fid;
  const real = fid.real.slice();
  const imaginary = fid.imaginary.slice();
  for (let row = 0; row < height; row += 1) {
    const rowReal = real.slice(row * width, (row + 1) * width);
    const rowImaginary = imaginary.slice(row * width, (row + 1) * width);
    fft(rowReal, rowImaginary);
    real.set(rowReal, row * width);
    imaginary.set(rowImaginary, row * width);
  }
  const columnReal = new Float64Array(height);
  const columnImaginary = new Float64Array(height);
  for (let column = 0; column < width; column += 1) {
    for (let row = 0; row < height; row += 1) {
      columnReal[row] = real[row * width + column];
      columnImaginary[row] = imaginary[row * width + column];
    }
    fft(columnReal, columnImaginary);
    for (let row = 0; row < height; row += 1) {
      real[row * width + column] = columnReal[row];
      imaginary[row * width + column] = columnImaginary[row];
    }
  }
  const intensity = new Float32Array(width * height);
  let maximum = 0;
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const sourceRow = (row + height / 2) % height;
      const sourceColumn = (column + width / 2) % width;
      const source = sourceRow * width + sourceColumn;
      const value = Math.hypot(real[source], imaginary[source]);
      intensity[row * width + column] = value;
      maximum = Math.max(maximum, value);
    }
  }
  if (maximum > 0) for (let index = 0; index < intensity.length; index += 1) intensity[index] /= maximum;
  const xObservation = parameters.observationMHz ?? 1;
  const yObservation = parameters.observation2MHz ?? parameters.observationMHz ?? 1;
  const xLow = (parameters.lowestFrequencyHz ?? -(parameters.bandwidthHz ?? 1) / 2) / xObservation;
  const xHigh = ((parameters.lowestFrequencyHz ?? -(parameters.bandwidthHz ?? 1) / 2) + (parameters.bandwidthHz ?? 1)) / xObservation;
  const yLow = (parameters.lowestFrequency2Hz ?? -(parameters.bandwidth2Hz ?? 1) / 2) / yObservation;
  const yHigh = ((parameters.lowestFrequency2Hz ?? -(parameters.bandwidth2Hz ?? 1) / 2) + (parameters.bandwidth2Hz ?? 1)) / yObservation;
  return { width, height, intensity, xLow, xHigh, yLow, yHigh, experiment: parameters.experiment?.toLowerCase().includes("hsqc") ? "hsqc" : "cosy" };
}

export function pickNmr2dPeaks(spectrum: NmrSpectrum2d, threshold: number, limit: number) {
  const candidates: NmrPeak2d[] = [];
  const { width, height, intensity } = spectrum;
  for (let row = 1; row < height - 1; row += 1) {
    for (let column = 1; column < width - 1; column += 1) {
      const value = intensity[row * width + column];
      if (value < threshold) continue;
      let isMaximum = true;
      for (let dy = -1; dy <= 1 && isMaximum; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
        if ((dx || dy) && intensity[(row + dy) * width + column + dx] > value) { isMaximum = false; break; }
      }
      if (!isMaximum) continue;
      const x = spectrum.xHigh - (spectrum.xHigh - spectrum.xLow) * column / (width - 1);
      const y = spectrum.yLow + (spectrum.yHigh - spectrum.yLow) * row / (height - 1);
      if (spectrum.experiment === "cosy" && Math.abs(x - y) < 0.06) continue;
      candidates.push({ x, y, intensity: value, xIndex: column, yIndex: row });
    }
  }
  candidates.sort((a, b) => b.intensity - a.intensity);
  const selected: NmrPeak2d[] = [];
  for (const candidate of candidates) {
    if (selected.every((peak) => Math.abs(peak.xIndex - candidate.xIndex) > 10 || Math.abs(peak.yIndex - candidate.yIndex) > 3)) selected.push(candidate);
    if (selected.length >= limit) break;
  }
  return selected;
}
