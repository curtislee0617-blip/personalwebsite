"use client";

import { useMemo, useRef, useState } from "react";
import { IrSpectrumChart, type ChartSpectrum } from "@/components/ir-spectrum-chart";
import { convertSpectrumValue, detectSpectrumPeaks, guessSpectrumMode, normaliseSpectrumRows, parseDelimitedSpectrum, type SpectrumMode, type SpectrumPoint } from "@/lib/ir-spectrum";

type UploadedSpectrum = {
  id: string;
  fileName: string;
  title: string;
  color: string;
  sourceMode: SpectrumMode;
  points: SpectrumPoint[];
};

const colors = ["#486f87", "#b95746", "#558054", "#a36c20", "#735a91", "#27827d", "#c0527a", "#75624a", "#4d60a4", "#98733d"];

function numberValue(value: string, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

async function readSpectrum(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "xlsx") {
    const { readSheet } = await import("read-excel-file/browser");
    return normaliseSpectrumRows(await readSheet(file) as unknown[][]);
  }
  return parseDelimitedSpectrum(await file.text());
}

export function IrSpectrumTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [spectra, setSpectra] = useState<UploadedSpectrum[]>([]);
  const [mode, setMode] = useState<SpectrumMode>("transmittance");
  const [xMinimum, setXMinimum] = useState(400);
  const [xMaximum, setXMaximum] = useState(4000);
  const [yMinimum, setYMinimum] = useState(0);
  const [yMaximum, setYMaximum] = useState(100);
  const [peakCount, setPeakCount] = useState(10);
  const [prominence, setProminence] = useState(2);
  const [peakDistance, setPeakDistance] = useState(20);
  const [message, setMessage] = useState("Files stay in your browser and are not uploaded to a server.");

  const chartSpectra = useMemo<ChartSpectrum[]>(() => spectra.map((spectrum) => {
    const points = spectrum.points.map((point) => ({ ...point, value: convertSpectrumValue(point.value, spectrum.sourceMode, mode) }));
    const visible = points.filter((point) => point.wavenumber >= Math.min(xMinimum, xMaximum) && point.wavenumber <= Math.max(xMinimum, xMaximum));
    return { ...spectrum, points, peaks: detectSpectrumPeaks(visible, mode, prominence, peakDistance, peakCount) };
  }), [mode, peakCount, peakDistance, prominence, spectra, xMaximum, xMinimum]);

  function switchMode(nextMode: SpectrumMode) {
    setMode(nextMode);
    if (nextMode === "transmittance") {
      setYMinimum(0);
      setYMaximum(100);
      setProminence(2);
    } else {
      setYMinimum(0);
      setYMaximum(2.5);
      setProminence(0.02);
    }
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const available = Math.max(0, 10 - spectra.length);
    const selected = [...files].slice(0, available);
    const loaded: UploadedSpectrum[] = [];
    const failed: string[] = [];
    for (const [index, file] of selected.entries()) {
      try {
        const points = await readSpectrum(file);
        if (points.length < 3) throw new Error("Not enough numeric rows");
        loaded.push({ id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`, fileName: file.name, title: file.name.replace(/\.[^.]+$/, ""), color: colors[(spectra.length + index) % colors.length], sourceMode: guessSpectrumMode(points), points });
      } catch {
        failed.push(file.name);
      }
    }
    setSpectra((current) => [...current, ...loaded].slice(0, 10));
    setMessage(failed.length ? `Could not read ${failed.join(", ")}. Check that the first two numeric columns contain wavenumber and measurement.` : `${loaded.length} spectrum${loaded.length === 1 ? "" : "a"} loaded locally.`);
    if (inputRef.current) inputRef.current.value = "";
  }

  function updateSpectrum(id: string, update: Partial<UploadedSpectrum>) {
    setSpectra((current) => current.map((spectrum) => spectrum.id === id ? { ...spectrum, ...update } : spectrum));
  }

  return (
    <section className="ir-tool">
      <div className="ir-upload-row">
        <div><p>IR workspace</p><h2>Upload up to 10 spectra</h2><span>First numeric column: wavenumber · second numeric column: %T or absorbance</span></div>
        <input accept=".csv,.txt,.tsv,.xlsx" className="sr-only" multiple onChange={(event) => void addFiles(event.target.files)} ref={inputRef} type="file" />
        <button disabled={spectra.length >= 10} onClick={() => inputRef.current?.click()} type="button">＋ Add spectra <small>{spectra.length}/10</small></button>
      </div>
      <p className="ir-file-message" role="status">{message}</p>

      {!!spectra.length && <div className="ir-file-list">{spectra.map((spectrum) => <article key={spectrum.id}>
        <input aria-label={`Line colour for ${spectrum.title}`} onChange={(event) => updateSpectrum(spectrum.id, { color: event.target.value })} type="color" value={spectrum.color} />
        <label><span>Legend title</span><input onChange={(event) => updateSpectrum(spectrum.id, { title: event.target.value })} value={spectrum.title} /></label>
        <label><span>Source values</span><select onChange={(event) => updateSpectrum(spectrum.id, { sourceMode: event.target.value as SpectrumMode })} value={spectrum.sourceMode}><option value="transmittance">Transmittance (%T)</option><option value="absorbance">Absorbance</option></select></label>
        <span>{spectrum.points.length.toLocaleString()} points</span>
        <button aria-label={`Remove ${spectrum.title}`} onClick={() => setSpectra((current) => current.filter((item) => item.id !== spectrum.id))} type="button">×</button>
      </article>)}</div>}

      <div className="ir-workspace">
        <aside className="ir-controls">
          <div className="ir-toggle" aria-label="Display measurement">
            <button className={mode === "transmittance" ? "is-active" : ""} onClick={() => switchMode("transmittance")} type="button">% Transmittance</button>
            <button className={mode === "absorbance" ? "is-active" : ""} onClick={() => switchMode("absorbance")} type="button">Absorbance</button>
          </div>
          <fieldset><legend>Wavenumber range <small>cm⁻¹</small></legend><div className="ir-paired-inputs"><label><span>Low</span><input inputMode="decimal" onChange={(event) => setXMinimum(numberValue(event.target.value, 400))} type="number" value={xMinimum} /></label><label><span>High</span><input inputMode="decimal" onChange={(event) => setXMaximum(numberValue(event.target.value, 4000))} type="number" value={xMaximum} /></label></div></fieldset>
          <fieldset><legend>{mode === "transmittance" ? "Transmittance" : "Absorbance"} range</legend><div className="ir-paired-inputs"><label><span>Low</span><input inputMode="decimal" onChange={(event) => setYMinimum(numberValue(event.target.value, 0))} step="any" type="number" value={yMinimum} /></label><label><span>High</span><input inputMode="decimal" onChange={(event) => setYMaximum(numberValue(event.target.value, 100))} step="any" type="number" value={yMaximum} /></label></div></fieldset>
          <fieldset className="ir-peak-controls"><legend>Peak labels</legend><label><span>Maximum labels</span><output>{peakCount}</output><input max="30" min="1" onChange={(event) => setPeakCount(Number(event.target.value))} type="range" value={peakCount} /></label><label><span>Minimum prominence</span><input min="0" onChange={(event) => setProminence(numberValue(event.target.value, 0))} step={mode === "transmittance" ? "0.1" : "0.005"} type="number" value={prominence} /></label><label><span>Minimum distance</span><div><input min="1" onChange={(event) => setPeakDistance(Math.max(1, numberValue(event.target.value, 1)))} type="number" value={peakDistance} /><b>points</b></div></label></fieldset>
          <button className="ir-reset" onClick={() => { setXMinimum(400); setXMaximum(4000); switchMode(mode); }} type="button">Reset plot ranges</button>
        </aside>
        <div className="ir-output">
          <header><div><p>Infrared spectrum</p><h2>{spectra.length > 1 ? `${spectra.length} spectra comparison` : spectra[0]?.title ?? "No data loaded"}</h2></div><span>4000 → 400 cm⁻¹</span></header>
          <IrSpectrumChart mode={mode} spectra={chartSpectra} xMaximum={Math.max(xMinimum, xMaximum)} xMinimum={Math.min(xMinimum, xMaximum)} yMaximum={Math.max(yMinimum, yMaximum)} yMinimum={Math.min(yMinimum, yMaximum)} />
          {!!chartSpectra.length && <div className="ir-legend" aria-label="Spectrum legend">{chartSpectra.map((spectrum) => <span key={spectrum.id}><i style={{ background: spectrum.color }} />{spectrum.title}</span>)}</div>}
        </div>
      </div>

      {!!chartSpectra.length && <section className="ir-peak-table"><div><p>Detected peaks</p><h2>Strongest features</h2><span>Prominence is calculated in the displayed unit. Distance is measured in recorded data points.</span></div><div>{chartSpectra.map((spectrum) => <article key={spectrum.id}><h3><i style={{ background: spectrum.color }} />{spectrum.title}</h3><p>{spectrum.peaks.length ? spectrum.peaks.map((peak) => `${peak.wavenumber.toFixed(1)} (${peak.prominence.toFixed(mode === "absorbance" ? 3 : 1)})`).join(" · ") : "No peaks meet the current settings."}</p></article>)}</div></section>}

      <div className="ir-method-note"><strong>How it works</strong><p>The browser reproduces the plotting and peak-selection workflow from the supplied Python notebook: spectra are ordered by wavenumber, %T minima or absorbance maxima are detected, and the strongest peaks are selected by prominence and point spacing. Absorbance conversion uses A = −log₁₀(T/100). Hover inspection is available with a mouse or trackpad.</p></div>
    </section>
  );
}
