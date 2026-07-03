"use client";

import { useMemo, useRef, useState } from "react";
import { IrSpectrumChart, type ChartSpectrum } from "@/components/ir-spectrum-chart";
import { convertSpectrumValue, detectSpectrumPeaks, guessSpectrumMode, normaliseSpectrumRows, parseDelimitedSpectrum, type SpectrumMode, type SpectrumPoint } from "@/lib/ir-spectrum";
import { suggestIrAssignments } from "@/lib/ir-assignments";

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
    return { ...spectrum, title: spectrum.title.trim() || spectrum.fileName.replace(/\.[^.]+$/, ""), points, peaks: detectSpectrumPeaks(visible, mode, prominence, peakDistance, peakCount) };
  }), [mode, peakCount, peakDistance, prominence, spectra, xMaximum, xMinimum]);
  const assignmentRows = useMemo(() => chartSpectra.flatMap((spectrum) => spectrum.peaks.map((peak) => ({ spectrum: spectrum.title, color: spectrum.color, peak, suggestions: suggestIrAssignments(peak.wavenumber) }))), [chartSpectra]);

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
        <div className="ir-file-identity"><strong>{spectrum.fileName}</strong><span>{spectrum.points.length.toLocaleString()} points</span></div>
        <label className="ir-spectrum-name"><span>Spectrum name <small>shown in legend</small></span><input onChange={(event) => updateSpectrum(spectrum.id, { title: event.target.value })} placeholder="Enter a legend name" value={spectrum.title} /></label>
        <label><span>Source values</span><select onChange={(event) => updateSpectrum(spectrum.id, { sourceMode: event.target.value as SpectrumMode })} value={spectrum.sourceMode}><option value="transmittance">Transmittance (%T)</option><option value="absorbance">Absorbance</option></select></label>
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

      {!!assignmentRows.length && <section className="ir-assignment-table">
        <header><div><p>Automated interpretation</p><h2>Possible peak assignments</h2></div><span>{assignmentRows.length} detected peaks</span></header>
        <div><table><thead><tr><th>Spectrum</th><th>Peak</th><th>Region</th><th>Possible assignment</th><th>Interpretation</th></tr></thead><tbody>{assignmentRows.map((row, index) => <tr key={`${row.spectrum}-${row.peak.index}-${index}`}><td><span className="ir-assignment-spectrum"><i style={{ background: row.color }} />{row.spectrum}</span></td><td><strong>{row.peak.wavenumber.toFixed(1)} cm⁻¹</strong><small>prom. {row.peak.prominence.toFixed(mode === "absorbance" ? 3 : 1)}</small></td><td>{row.suggestions[0]?.region ?? "Unassigned"}</td><td>{row.suggestions.length ? <div className="ir-assignment-options">{row.suggestions.map((suggestion) => <span className={`is-${suggestion.reliability}`} key={`${suggestion.assignment}-${suggestion.vibration}-${suggestion.low}`}>{suggestion.assignment} <small>{suggestion.vibration}</small></span>)}</div> : "No listed reference range"}</td><td>{row.suggestions[0]?.note ?? "This peak may require comparison with a broader reference library or a known spectrum."}</td></tr>)}</tbody></table></div>
        <p>These are range-based suggestions from the supplied IR reference, not structural proof. Band shape, intensity, companion bands, sample state and the rest of the spectrum must agree before accepting an assignment.</p>
      </section>}

      <div className="ir-method-note"><strong>How it works</strong><p>The browser reproduces the plotting and peak-selection workflow from the supplied Python notebook: spectra are ordered by wavenumber, %T minima or absorbance maxima are detected, and the strongest peaks are selected by prominence and point spacing. Absorbance conversion uses A = −log₁₀(T/100). Hover inspection is available with a mouse or trackpad.</p></div>

      <section className="ir-interpretation-guide">
        <header><p>Reference guide</p><h2>How to read the IR regions</h2><span>Based on pages 1–2 of the supplied IR ranges document.</span></header>
        <div className="ir-region-grid">
          <article><strong>4000–2500 cm⁻¹</strong><h3>3 μ / X-H region</h3><p>Best for O-H, N-H and C-H stretching. Shape matters: free O-H and N-H tend to be sharper, while hydrogen bonding broadens and lowers them. Very weak bands can be overtones.</p></article>
          <article><strong>2500–1800 cm⁻¹</strong><h3>Triple-bond region</h3><p>Use for C≡N, C≡C, cumulative double bonds and some overtones. Nitriles and isocyanates are often diagnostic; symmetrical alkynes may be weak or absent.</p></article>
          <article><strong>1800–1500 cm⁻¹</strong><h3>6 μ / double-bond region</h3><p>Usually the most useful area for C=O, C=C and C=N stretching. Carbonyl position shifts predictably with conjugation, ring strain and nearby electronegative atoms.</p></article>
          <article><strong>1500–650 cm⁻¹</strong><h3>Fingerprint region</h3><p>Contains single-bond stretches, bends and complex coupled vibrations. Assign only stronger diagnostic bands; use the overall pattern to compare identity with a known spectrum.</p></article>
        </div>
        <div className="ir-equation-grid">
          <article><p>Wavenumber</p><strong>ν̄ = 1/λ = ν/c</strong><span>Higher wavenumber means higher vibrational frequency and energy.</span></article>
          <article><p>Transmittance</p><strong>T = I/I₀</strong><strong>%T = 100T</strong><span>Compares transmitted intensity with the incident beam.</span></article>
          <article><p>Absorbance</p><strong>A = −log₁₀(T)</strong><span>Converts transmission dips into upward peaks and is proportional to concentration in the linear regime.</span></article>
          <article><p>Beer–Lambert law</p><strong>A = εbc</strong><span>Relates absorbance to molar absorptivity ε, path length b and concentration c.</span></article>
          <article><p>Harmonic oscillator</p><strong>ν̄ = [1/(2πc)]√(k/μ)</strong><span>Stronger bonds have larger force constants k and absorb at higher wavenumber.</span></article>
          <article><p>Reduced mass</p><strong>μ = m₁m₂/(m₁ + m₂)</strong><span>Heavier bonded atoms lower the vibrational frequency; isotopic substitution therefore shifts bands.</span></article>
          <article><p>Vibrational levels</p><strong>Eᵥ = (v + ½)hν</strong><span>IR absorption promotes a molecule between quantized vibrational states.</span></article>
          <article><p>Selection rule</p><strong>Δv = ±1</strong><strong>∂μdipole/∂Q ≠ 0</strong><span>A fundamental vibration must change molecular dipole moment to be IR-active.</span></article>
        </div>
        <p className="ir-guide-note"><strong>Practical rule:</strong> assign the interpretable high-wavenumber, triple-bond and double-bond regions first. Then use only selected medium or strong fingerprint peaks and confirm them through companion bands or comparison with a known spectrum. Complete assignment of every band is rarely justified.</p>
      </section>
    </section>
  );
}
