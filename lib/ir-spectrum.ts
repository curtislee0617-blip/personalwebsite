export type SpectrumMode = "transmittance" | "absorbance";

export type SpectrumPoint = {
  wavenumber: number;
  value: number;
};

export type SpectrumPeak = SpectrumPoint & {
  index: number;
  prominence: number;
};

export function convertSpectrumValue(value: number, from: SpectrumMode, to: SpectrumMode) {
  if (from === to) return value;
  if (from === "transmittance") return -Math.log10(Math.max(value, 0.0001) / 100);
  return 100 * 10 ** -value;
}

export function guessSpectrumMode(points: SpectrumPoint[]): SpectrumMode {
  if (!points.length) return "transmittance";
  const sample = points.slice(0, 500).map((point) => point.value).sort((a, b) => a - b);
  const median = sample[Math.floor(sample.length / 2)];
  return median >= 0 && median <= 4 && sample[sample.length - 1] <= 8 ? "absorbance" : "transmittance";
}

export function normaliseSpectrumRows(rows: unknown[][]): SpectrumPoint[] {
  const points = rows.flatMap((row) => {
    const values = row.map((cell) => typeof cell === "number" ? cell : Number(String(cell).trim())).filter(Number.isFinite);
    return values.length >= 2 ? [{ wavenumber: values[0], value: values[1] }] : [];
  });

  const deduplicated = new Map<number, number>();
  for (const point of points) deduplicated.set(point.wavenumber, point.value);
  return [...deduplicated].map(([wavenumber, value]) => ({ wavenumber, value })).sort((a, b) => a.wavenumber - b.wavenumber);
}

export function parseDelimitedSpectrum(text: string): SpectrumPoint[] {
  const rows = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const delimiter = line.includes("\t") ? /\t+/ : line.includes(";") ? /\s*;\s*/ : line.includes(",") ? /\s*,\s*/ : /\s+/;
    return line.split(delimiter);
  });
  return normaliseSpectrumRows(rows);
}

function localProminence(signal: number[], index: number) {
  const height = signal[index];
  let leftMinimum = height;
  let rightMinimum = height;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (signal[cursor] > height) break;
    leftMinimum = Math.min(leftMinimum, signal[cursor]);
  }
  for (let cursor = index + 1; cursor < signal.length; cursor += 1) {
    if (signal[cursor] > height) break;
    rightMinimum = Math.min(rightMinimum, signal[cursor]);
  }
  return height - Math.max(leftMinimum, rightMinimum);
}

export function detectSpectrumPeaks(
  points: SpectrumPoint[],
  mode: SpectrumMode,
  minimumProminence: number,
  minimumDistance: number,
  limit: number,
) {
  if (points.length < 3) return [];
  const signal = points.map((point) => mode === "transmittance" ? -point.value : point.value);
  const candidates: SpectrumPeak[] = [];
  for (let index = 1; index < signal.length - 1; index += 1) {
    if (signal[index] <= signal[index - 1] || signal[index] < signal[index + 1]) continue;
    const prominence = localProminence(signal, index);
    if (prominence >= minimumProminence) candidates.push({ ...points[index], index, prominence });
  }
  candidates.sort((a, b) => b.prominence - a.prominence);
  const selected: SpectrumPeak[] = [];
  for (const candidate of candidates) {
    if (selected.every((peak) => Math.abs(peak.index - candidate.index) >= minimumDistance)) selected.push(candidate);
    if (selected.length >= limit) break;
  }
  return selected.sort((a, b) => b.wavenumber - a.wavenumber);
}
