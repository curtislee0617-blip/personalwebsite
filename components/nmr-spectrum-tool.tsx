"use client";

import { useMemo, useRef, useState } from "react";
import { NmrSpectrumChart, type NmrInteractionMode, type NmrRegion } from "@/components/nmr-spectrum-chart";
import { Nmr2dChart } from "@/components/nmr-2d-chart";
import { estimateZeroOrderPhase, parseProcessingScript, parseSpinsolve1d, parseSpinsolve2d, parseSpinsolveParameters, pickNmr2dPeaks, pickNmrPeaks, processSpinsolve2d, processSpinsolveFid, type ComplexFid, type ComplexFid2d, type NmrPeak2d, type SpinsolveParameters } from "@/lib/nmr-spectrum";

type NmrNucleus = "1H" | "13C";

const solvents = [
  { id: "cdcl3", label: "Chloroform-d (CDCl₃)", proton: 7.26, carbon: 77.16 },
  { id: "dmso", label: "DMSO-d₆", proton: 2.50, carbon: 39.52 },
  { id: "methanol", label: "Methanol-d₄ (CD₃OD)", proton: 3.31, carbon: 49.00 },
  { id: "water", label: "D₂O / HOD", proton: 4.79 },
  { id: "acetone", label: "Acetone-d₆", proton: 2.05, carbon: 29.84 },
  { id: "benzene", label: "Benzene-d₆", proton: 7.16, carbon: 128.06 },
  { id: "acetonitrile", label: "Acetonitrile-d₃", proton: 1.94, carbon: 1.32 },
  { id: "thf", label: "THF-d₈", proton: 3.58, carbon: 25.37 },
  { id: "toluene", label: "Toluene-d₈", proton: 2.09, carbon: 20.43 },
] as const;

function integrateRegion(points: { shift: number; intensity: number }[], region: NmrRegion) {
  const selected = points.filter((point) => point.shift >= region.low && point.shift <= region.high);
  let area = 0;
  for (let index = 1; index < selected.length; index += 1) {
    area += Math.abs(selected[index].shift - selected[index - 1].shift) * (selected[index].intensity + selected[index - 1].intensity) / 2;
  }
  return area;
}

export function NmrSpectrumTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fid, setFid] = useState<ComplexFid | null>(null);
  const [fid2d, setFid2d] = useState<ComplexFid2d | null>(null);
  const [viewMode, setViewMode] = useState<"1d" | "2d">("1d");
  const [fileName, setFileName] = useState("");
  const [parameters, setParameters] = useState<SpinsolveParameters>({});
  const [observationMHz, setObservationMHz] = useState("");
  const [carrierHz, setCarrierHz] = useState("0");
  const [phaseDegrees, setPhaseDegrees] = useState(0);
  const [lineBroadeningHz, setLineBroadeningHz] = useState(0.2);
  const [zeroFill, setZeroFill] = useState<1 | 2 | 4>(2);
  const [nucleus, setNucleus] = useState<NmrNucleus>("1H");
  const [xMinimum, setXMinimum] = useState(-10);
  const [xMaximum, setXMaximum] = useState(20);
  const [fullRange, setFullRange] = useState({ low: -10, high: 20 });
  const [mode, setMode] = useState<NmrInteractionMode>("inspect");
  const [solventId, setSolventId] = useState<(typeof solvents)[number]["id"]>("dmso");
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [solventPeak, setSolventPeak] = useState<number>();
  const [regions, setRegions] = useState<NmrRegion[]>([]);
  const [referenceRegionId, setReferenceRegionId] = useState("");
  const [referenceValue, setReferenceValue] = useState(1);
  const [couplingPoints, setCouplingPoints] = useState<number[]>([]);
  const [showPeakLabels, setShowPeakLabels] = useState(true);
  const [peakCount, setPeakCount] = useState(12);
  const [peakProminence, setPeakProminence] = useState(0.025);
  const [message, setMessage] = useState("Select data.1d. For an accurate ppm axis, select acqu.par at the same time.");
  const [contourThreshold, setContourThreshold] = useState(0.1);
  const [peak2dCount, setPeak2dCount] = useState(16);
  const [x2dRange, setX2dRange] = useState({ low: -10, high: 20 });
  const [y2dRange, setY2dRange] = useState({ low: -10, high: 20 });
  const [selected2dPeak, setSelected2dPeak] = useState<NmrPeak2d | null>(null);
  const [splittingLabels, setSplittingLabels] = useState<Record<string, string>>({});

  const observation = Number(observationMHz);
  const carrier = Number(carrierHz);
  const axis = observation > 0 ? "ppm" as const : "hz" as const;
  const rawPoints = useMemo(() => fid ? processSpinsolveFid(fid, {
    lineBroadeningHz,
    phaseDegrees,
    zeroFill,
    observationMHz: observation > 0 ? observation : undefined,
    carrierHz: Number.isFinite(carrier) ? carrier : 0,
  }) : [], [carrier, fid, lineBroadeningHz, observation, phaseDegrees, zeroFill]);
  const points = useMemo(() => rawPoints.map((point) => ({ ...point, shift: point.shift + calibrationOffset })), [calibrationOffset, rawPoints]);
  const peaks = useMemo(() => showPeakLabels ? pickNmrPeaks(points.filter((point) => point.shift >= Math.min(xMinimum, xMaximum) && point.shift <= Math.max(xMinimum, xMaximum)), peakProminence, 30, peakCount) : [], [peakCount, peakProminence, points, showPeakLabels, xMaximum, xMinimum]);
  const availableSolvents = solvents.filter((solvent) => nucleus === "1H" ? solvent.proton !== undefined : "carbon" in solvent && solvent.carbon !== undefined);
  const selectedSolvent = availableSolvents.find((solvent) => solvent.id === solventId) ?? availableSolvents[0];
  const selectedSolventShift = nucleus === "1H" ? selectedSolvent.proton : ("carbon" in selectedSolvent ? selectedSolvent.carbon : undefined);
  const regionAreas = useMemo(() => regions.map((region) => ({ ...region, area: integrateRegion(points, region) })), [points, regions]);
  const referenceArea = regionAreas.find((region) => region.id === referenceRegionId)?.area ?? regionAreas[0]?.area ?? 0;
  const couplingHz = couplingPoints.length === 2 ? Math.abs(couplingPoints[0] - couplingPoints[1]) * (axis === "ppm" ? observation : 1) : null;
  const spectrum2d = useMemo(() => fid2d ? processSpinsolve2d(fid2d, parameters) : null, [fid2d, parameters]);
  const peaks2d = useMemo(() => spectrum2d ? pickNmr2dPeaks(spectrum2d, contourThreshold, peak2dCount) : [], [contourThreshold, peak2dCount, spectrum2d]);

  async function loadFiles(files: FileList | null) {
    if (!files?.length) return;
    const selected = [...files];
    const dataFile = selected.find((file) => file.name.toLowerCase().endsWith(".1d"));
    const data2dFile = selected.find((file) => file.name.toLowerCase().endsWith(".2d"));
    if (!dataFile && !data2dFile) return setMessage("No .1d or .2d Spinsolve file was selected.");
    try {
      const nextFid = dataFile ? parseSpinsolve1d(await dataFile.arrayBuffer()) : null;
      const nextFid2d = data2dFile ? parseSpinsolve2d(await data2dFile.arrayBuffer()) : null;
      const acquFile = selected.find((file) => file.name.toLowerCase() === "acqu.par");
      const scriptFile = selected.find((file) => file.name.toLowerCase().endsWith("processing.script"));
      const nextParameters = acquFile ? parseSpinsolveParameters(await acquFile.text()) : {};
      const processing = scriptFile ? parseProcessingScript(await scriptFile.text()) : { phaseDegrees: undefined, lineBroadeningHz: undefined };
      const nextLineBroadening = processing.lineBroadeningHz ?? 0.2;
      const automaticPhase = nextFid ? estimateZeroOrderPhase(nextFid, nextLineBroadening) : 0;
      const detectedNucleus: NmrNucleus = nextParameters.nucleus?.toUpperCase().includes("13C") ? "13C" : "1H";
      setFid(nextFid);
      setFid2d(nextFid2d);
      setViewMode(nextFid2d ? "2d" : "1d");
      setFileName(data2dFile?.name ?? dataFile?.name ?? "");
      setParameters(nextParameters);
      setNucleus(detectedNucleus);
      const reportedSolvent = nextParameters.solvent?.toLowerCase() ?? "";
      const matchedSolvent = solvents.find((solvent) => reportedSolvent.includes(solvent.id)
        || (solvent.id === "cdcl3" && reportedSolvent.includes("chloroform"))
        || (solvent.id === "methanol" && reportedSolvent.includes("meoh"))
        || (solvent.id === "water" && reportedSolvent.includes("d2o")));
      if (matchedSolvent) setSolventId(matchedSolvent.id);
      setCalibrationOffset(0);
      setSolventPeak(undefined);
      setRegions([]);
      setReferenceRegionId("");
      setCouplingPoints([]);
      setSelected2dPeak(null);
      setSplittingLabels({});
      setPhaseDegrees(automaticPhase);
      setLineBroadeningHz(nextLineBroadening);
      setZeroFill(2);
      if (nextParameters.observationMHz) setObservationMHz(String(nextParameters.observationMHz));
      else setObservationMHz("");
      if (nextParameters.lowestFrequencyHz !== undefined && nextParameters.bandwidthHz !== undefined) {
        const nextCarrier = nextParameters.lowestFrequencyHz + nextParameters.bandwidthHz / 2;
        setCarrierHz(String(nextCarrier));
        if (nextParameters.observationMHz) {
          const defaultRange = detectedNucleus === "13C" ? { low: 0, high: 220 } : { low: -10, high: 20 };
          setXMinimum(defaultRange.low);
          setXMaximum(defaultRange.high);
          setFullRange(defaultRange);
        } else {
          const centre = nextCarrier;
          const width = nextParameters.bandwidthHz;
          setXMinimum(centre - width / 2);
          setXMaximum(centre + width / 2);
          setFullRange({ low: centre - width / 2, high: centre + width / 2 });
        }
      } else {
        const sweep = nextFid && nextFid.dwellTime > 0 ? 1 / nextFid.dwellTime : 5000;
        setCarrierHz("0");
        setXMinimum(-sweep / 2);
        setXMaximum(sweep / 2);
        setFullRange({ low: -sweep / 2, high: sweep / 2 });
      }
      const experiment2d = nextParameters.experiment?.toLowerCase().includes("hsqc") ? "hsqc" : "cosy";
      if (nextFid2d) {
        setX2dRange({ low: -10, high: 20 });
        setY2dRange(experiment2d === "hsqc" ? { low: 0, high: 220 } : { low: -10, high: 20 });
      }
      const descriptions = [nextFid ? `${nextFid.pointCount.toLocaleString()} 1D points` : "", nextFid2d ? `${nextFid2d.width} × ${nextFid2d.height} 2D matrix` : ""].filter(Boolean).join(" and ");
      setMessage(`Read ${descriptions}${acquFile ? " with acquisition metadata" : ""}${nextFid ? `. Automatic phase: ${automaticPhase.toFixed(1)}°.` : "."}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The NMR file could not be read.");
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function changeNucleus(next: NmrNucleus) {
    setNucleus(next);
    const defaultRange = next === "13C" ? { low: 0, high: 220 } : { low: -10, high: 20 };
    setXMinimum(defaultRange.low);
    setXMaximum(defaultRange.high);
    setFullRange(defaultRange);
    setCalibrationOffset(0);
    setSolventPeak(undefined);
    if (next === "13C") {
      setMode("inspect");
      setRegions([]);
      setReferenceRegionId("");
      setCouplingPoints([]);
      if (solventId === "water") setSolventId("dmso");
    }
  }

  function changeObservationFrequency(value: string) {
    const wasFrequencyOnly = !(Number(observationMHz) > 0);
    setObservationMHz(value);
    if (wasFrequencyOnly && Number(value) > 0) {
      const defaultRange = nucleus === "13C" ? { low: 0, high: 220 } : { low: -10, high: 20 };
      setXMinimum(defaultRange.low);
      setXMaximum(defaultRange.high);
      setFullRange(defaultRange);
    }
  }

  function handleRangeSelect(low: number, high: number) {
    if (mode === "zoom") {
      setXMinimum(low);
      setXMaximum(high);
    } else if (mode === "integrate") {
      const region = { id: crypto.randomUUID(), low, high };
      setRegions((current) => [...current, region]);
      if (!referenceRegionId) setReferenceRegionId(region.id);
    }
  }

  function handlePeakSelect(shift: number) {
    if (mode === "solvent" && axis === "ppm" && selectedSolventShift !== undefined) {
      const adjustment = selectedSolventShift - shift;
      setCalibrationOffset((current) => current + adjustment);
      setSolventPeak(selectedSolventShift);
      setXMinimum((current) => current + adjustment);
      setXMaximum((current) => current + adjustment);
      setFullRange((current) => ({ low: current.low + adjustment, high: current.high + adjustment }));
      setRegions((current) => current.map((region) => ({ ...region, low: region.low + adjustment, high: region.high + adjustment })));
      setCouplingPoints((current) => current.map((point) => point + adjustment));
      setMessage(`Calibrated ${shift.toFixed(4)} ppm to ${selectedSolvent.label} at ${selectedSolventShift.toFixed(2)} ppm.`);
    } else if (mode === "coupling") {
      setCouplingPoints((current) => current.length >= 2 ? [shift] : [...current, shift]);
    }
  }

  return <section className="nmr-tool">
    <div className="nmr-upload">
      <div><p>Magritek Spinsolve</p><h2>Load a 1D or 2D NMR acquisition</h2><span>Select <strong>data.1d</strong> and/or <strong>data.2d</strong>, plus <strong>acqu.par</strong> when available.</span></div>
      <input accept=".1d,.2d,.par,.script" className="sr-only" multiple onChange={(event) => void loadFiles(event.target.files)} ref={inputRef} type="file" />
      <button onClick={() => inputRef.current?.click()} type="button">Choose NMR files</button>
    </div>
    <p className="nmr-message" role="status">{message}</p>
    {fid2d && <div className="nmr-view-switch" aria-label="Spectrum dimensionality"><button className={viewMode === "1d" ? "is-active" : ""} disabled={!fid} onClick={() => setViewMode("1d")} type="button">1D spectrum</button><button className={viewMode === "2d" ? "is-active" : ""} onClick={() => setViewMode("2d")} type="button">2D {spectrum2d?.experiment === "hsqc" ? "g-HSQC" : "COSY"}</button></div>}

    <div className="nmr-workspace">
      <aside className="nmr-controls">
        <header><p>{fileName || "No file loaded"}</p><h2>Processing controls</h2></header>
        {viewMode === "1d" ? <>
        <div className="nmr-nucleus-toggle" aria-label="NMR nucleus"><button className={nucleus === "1H" ? "is-active" : ""} onClick={() => changeNucleus("1H")} type="button">¹H NMR</button><button className={nucleus === "13C" ? "is-active" : ""} onClick={() => changeNucleus("13C")} type="button">¹³C NMR</button></div>
        <label><span>Observation frequency <small>MHz</small></span><input inputMode="decimal" onChange={(event) => changeObservationFrequency(event.target.value)} placeholder="Required for ppm" type="number" value={observationMHz} /></label>
        <label><span>Carrier offset <small>Hz</small></span><input inputMode="decimal" onChange={(event) => setCarrierHz(event.target.value)} type="number" value={carrierHz} /></label>
        <div className="nmr-phase-control"><label><span>Zero-order phase <output>{phaseDegrees.toFixed(1)}°</output></span><input max="180" min="-180" onChange={(event) => setPhaseDegrees(Number(event.target.value))} step="0.1" type="range" value={phaseDegrees} /></label><button disabled={!fid} onClick={() => { if (!fid) return; const automatic = estimateZeroOrderPhase(fid, lineBroadeningHz); setPhaseDegrees(automatic); setMessage(`Automatic zero-order phase set to ${automatic.toFixed(1)}°; use the slider for manual refinement.`); }} type="button">Auto phase</button></div>
        <label><span>Line broadening <small>Hz</small></span><input min="0" onChange={(event) => setLineBroadeningHz(Number(event.target.value))} step="0.1" type="number" value={lineBroadeningHz} /></label>
        <fieldset><legend>Zero filling</legend><div className="nmr-segmented">{([1, 2, 4] as const).map((value) => <button className={zeroFill === value ? "is-active" : ""} key={value} onClick={() => setZeroFill(value)} type="button">{value}×</button>)}</div></fieldset>
        <fieldset className="nmr-peak-settings"><legend>Peak labels <label><input checked={showPeakLabels} onChange={(event) => setShowPeakLabels(event.target.checked)} type="checkbox" /> Show</label></legend><label><span>Maximum labels <output>{peakCount}</output></span><input max="30" min="1" onChange={(event) => setPeakCount(Number(event.target.value))} type="range" value={peakCount} /></label><label><span>Minimum prominence</span><input min="0.001" onChange={(event) => setPeakProminence(Number(event.target.value))} step="0.005" type="number" value={peakProminence} /></label></fieldset>
        <fieldset><legend>Displayed {axis === "ppm" ? "chemical shift" : "frequency"}</legend><div className="nmr-range"><label><span>High</span><input onChange={(event) => setXMaximum(Number(event.target.value))} step="any" type="number" value={Number(xMaximum.toFixed(4))} /></label><label><span>Low</span><input onChange={(event) => setXMinimum(Number(event.target.value))} step="any" type="number" value={Number(xMinimum.toFixed(4))} /></label></div></fieldset>
        <button className="nmr-reset" onClick={() => { setLineBroadeningHz(0.2); setZeroFill(2); setPhaseDegrees(fid ? estimateZeroOrderPhase(fid, 0.2) : 0); }} type="button">Reset processing</button>
        </> : <>
          <div className="nmr-2d-kind"><span>{spectrum2d?.experiment === "hsqc" ? "g-HSQC · ¹H / ¹³C" : "COSY · ¹H / ¹H"}</span><strong>{fid2d?.width} × {fid2d?.height}</strong></div>
          <label><span>Contour threshold <output>{Math.round(contourThreshold * 100)}%</output></span><input max="0.8" min="0.01" onChange={(event) => setContourThreshold(Number(event.target.value))} step="0.01" type="range" value={contourThreshold} /></label>
          <label><span>Maximum cross-peaks <output>{peak2dCount}</output></span><input max="40" min="4" onChange={(event) => setPeak2dCount(Number(event.target.value))} type="range" value={peak2dCount} /></label>
          <fieldset><legend>F2 ¹H range <small>ppm</small></legend><div className="nmr-range"><label><span>High</span><input onChange={(event) => setX2dRange((current) => ({ ...current, high: Number(event.target.value) }))} step="any" type="number" value={x2dRange.high} /></label><label><span>Low</span><input onChange={(event) => setX2dRange((current) => ({ ...current, low: Number(event.target.value) }))} step="any" type="number" value={x2dRange.low} /></label></div></fieldset>
          <fieldset><legend>F1 {spectrum2d?.experiment === "hsqc" ? "¹³C" : "¹H"} range <small>ppm</small></legend><div className="nmr-range"><label><span>High</span><input onChange={(event) => setY2dRange((current) => ({ ...current, high: Number(event.target.value) }))} step="any" type="number" value={y2dRange.high} /></label><label><span>Low</span><input onChange={(event) => setY2dRange((current) => ({ ...current, low: Number(event.target.value) }))} step="any" type="number" value={y2dRange.low} /></label></div></fieldset>
          <button className="nmr-reset" onClick={() => { setX2dRange({ low: -10, high: 20 }); setY2dRange(spectrum2d?.experiment === "hsqc" ? { low: 0, high: 220 } : { low: -10, high: 20 }); }} type="button">Reset 2D ranges</button>
        </>}
      </aside>

      <div className="nmr-output">
        <header><div><p>{viewMode === "2d" ? `${spectrum2d?.experiment === "hsqc" ? "g-HSQC" : "COSY"} correlation spectrum` : axis === "ppm" ? "Chemical-shift spectrum" : "Frequency spectrum"}</p><h2>{parameters.sample || fileName || "NMR spectrum"}</h2></div><span>{viewMode === "2d" ? `${fid2d?.width} × ${fid2d?.height}` : fid ? `${fid.pointCount.toLocaleString()} → ${points.length.toLocaleString()} points` : "Awaiting data"}</span></header>
        {viewMode === "1d" ? <>
        <div className="nmr-analysis-toolbar" aria-label="Spectrum interaction mode">
          {(["inspect", "zoom", ...(nucleus === "1H" ? ["integrate"] as const : []), "solvent", ...(nucleus === "1H" ? ["coupling"] as const : [])] as NmrInteractionMode[]).map((value) => <button className={mode === value ? "is-active" : ""} disabled={value === "solvent" && axis !== "ppm"} key={value} onClick={() => setMode(value)} type="button">{value === "inspect" ? "Inspect" : value === "zoom" ? "Zoom box" : value === "integrate" ? "Integrate" : value === "solvent" ? "Set solvent" : "Measure J"}</button>)}
          <button onClick={() => { setXMinimum(fullRange.low); setXMaximum(fullRange.high); }} type="button">Reset zoom</button>
        </div>
        <p className="nmr-mode-help">{mode === "zoom" ? "Drag across the spectrum to zoom into an exact range." : mode === "integrate" ? "Drag a box around a signal to add an integration region." : mode === "solvent" ? `Click the ${selectedSolvent.label} residual peak to set it to ${selectedSolventShift?.toFixed(2)} ppm.` : mode === "coupling" ? "Click two peak maxima; the frequency separation will be reported as J." : "Hover over the spectrum to inspect precise shift and intensity values."}</p>
        <NmrSpectrumChart axis={axis} couplingPoints={couplingPoints} mode={mode} onPeakSelect={handlePeakSelect} onRangeSelect={handleRangeSelect} peaks={peaks} points={points} regions={regions} solventPeak={solventPeak} xMaximum={xMaximum} xMinimum={xMinimum} />
        </> : spectrum2d ? <><p className="nmr-mode-help">Hover to inspect a correlation and click a cross-peak to pin it in the signal table.</p><Nmr2dChart contourThreshold={contourThreshold} onSelectPeak={setSelected2dPeak} peaks={peaks2d} spectrum={spectrum2d} xRange={x2dRange} yRange={y2dRange} /></> : <div className="nmr-chart-empty">Select a Spinsolve data.2d file.</div>}
      </div>
    </div>

    {viewMode === "1d" && <div className={`nmr-analysis-grid ${nucleus === "13C" ? "is-carbon" : ""}`}>
      <section className="nmr-analysis-card">
        <header><p>Calibration</p><h2>Reference the solvent</h2></header>
        <label><span>Deuterated solvent</span><select onChange={(event) => setSolventId(event.target.value as (typeof solvents)[number]["id"])} value={selectedSolvent.id}>{availableSolvents.map((solvent) => { const shift = nucleus === "1H" ? solvent.proton : ("carbon" in solvent ? solvent.carbon : undefined); return <option key={solvent.id} value={solvent.id}>{solvent.label} · {shift?.toFixed(2)} ppm</option>; })}</select></label>
        <p>Select <strong>Set solvent</strong>, then click the residual solvent peak. The entire ppm axis will shift by the required offset.</p>
        <div><span>Applied offset</span><strong>{calibrationOffset >= 0 ? "+" : ""}{calibrationOffset.toFixed(4)} ppm</strong></div>
      </section>

      {nucleus === "1H" && <section className="nmr-analysis-card">
        <header><p>Integration</p><h2>Relative peak areas</h2></header>
        {!regionAreas.length ? <p>Select <strong>Integrate</strong> and drag around a signal.</p> : <div className="nmr-integral-list">{regionAreas.map((region, index) => <article key={region.id}><input checked={(referenceRegionId || regionAreas[0]?.id) === region.id} name="nmr-reference" onChange={() => setReferenceRegionId(region.id)} type="radio" /><span>I{index + 1}<small>{region.high.toFixed(3)}–{region.low.toFixed(3)} ppm</small></span><strong>{referenceArea > 0 ? (region.area / referenceArea * referenceValue).toFixed(2) : "—"}</strong><button aria-label={`Remove integration ${index + 1}`} onClick={() => { setRegions((current) => current.filter((item) => item.id !== region.id)); if (referenceRegionId === region.id) setReferenceRegionId(""); }} type="button">×</button></article>)}</div>}
        <label><span>Reference integral</span><input min="0.01" onChange={(event) => setReferenceValue(Number(event.target.value))} step="0.01" type="number" value={referenceValue} /></label>
      </section>}

      {nucleus === "1H" && <section className="nmr-analysis-card">
        <header><p>Coupling</p><h2>Measure J</h2></header>
        <p>Select <strong>Measure J</strong> and click two peak maxima. A third click starts a new measurement.</p>
        <div className="nmr-j-result"><span>{couplingPoints.length ? couplingPoints.map((point) => point.toFixed(axis === "ppm" ? 4 : 1)).join(" ↔ ") : "Choose two peaks"}</span><strong>{couplingHz === null ? "—" : `${couplingHz.toFixed(2)} Hz`}</strong></div>
        <button onClick={() => setCouplingPoints([])} type="button">Clear measurement</button>
      </section>}
    </div>}

    <section className="nmr-signal-table">
      <header><div><p>Assignments</p><h2>Identified signals</h2></div><span>{viewMode === "2d" ? `${peaks2d.length} cross-peaks` : `${peaks.length} labelled peaks`}</span></header>
      <div>{viewMode === "2d" ? <table><thead><tr><th>Signal</th><th>F2 ¹H shift</th><th>F1 {spectrum2d?.experiment === "hsqc" ? "¹³C" : "¹H"} shift</th><th>Type</th><th>Intensity</th></tr></thead><tbody>{peaks2d.map((peak, index) => <tr className={selected2dPeak?.xIndex === peak.xIndex && selected2dPeak?.yIndex === peak.yIndex ? "is-selected" : ""} key={`${peak.xIndex}-${peak.yIndex}`}><td>P{index + 1}</td><td>{peak.x.toFixed(3)} ppm</td><td>{peak.y.toFixed(3)} ppm</td><td>{spectrum2d?.experiment === "hsqc" ? "¹H–¹³C correlation" : "¹H–¹H correlation"}</td><td>{peak.intensity.toFixed(3)}</td></tr>)}</tbody></table> : <table><thead><tr><th>Signal</th><th>Chemical shift</th><th>Splitting</th><th>Integration</th><th>Coupling</th></tr></thead><tbody>{peaks.map((peak, index) => { const key = peak.shift.toFixed(3); const region = regionAreas.find((item) => peak.shift >= item.low && peak.shift <= item.high); const integral = region && referenceArea > 0 ? region.area / referenceArea * referenceValue : null; const carriesJ = couplingHz !== null && couplingPoints.some((point) => Math.abs(point - peak.shift) < 0.01); return <tr key={key}><td>S{index + 1}</td><td>{peak.shift.toFixed(3)} ppm</td><td><select onChange={(event) => setSplittingLabels((current) => ({ ...current, [key]: event.target.value }))} value={splittingLabels[key] ?? "—"}>{["—", "s", "d", "t", "q", "m", "dd", "br"].map((label) => <option key={label}>{label}</option>)}</select></td><td>{nucleus === "1H" && integral !== null ? integral.toFixed(2) : "—"}</td><td>{nucleus === "1H" && carriesJ ? `${couplingHz?.toFixed(2)} Hz` : "—"}</td></tr>; })}</tbody></table>}</div>
      <p>{viewMode === "2d" ? "Cross-peaks are automatically selected by relative contour intensity. Integration and multiplicity belong to the corresponding 1D spectrum, so they are not inferred from COSY or HSQC contours." : "Splitting labels are editable. Integrals and J values appear when the corresponding 1D analysis regions or peak pair have been selected."}</p>
    </section>

    <details className="nmr-equations">
      <summary><span>NMR equations at a glance</span><small>Show equations</small></summary>
      <div className="nmr-equation-grid">
        <article><p>Larmor frequency</p><strong>ω₀ = −γB₀</strong><span>ν₀ = |γ|B₀/(2π)</span></article>
        <article><p>Chemical shift</p><strong>δ = (ν − νref)/ν₀ × 10⁶</strong><span>δ is reported in ppm and is field-independent.</span></article>
        <article><p>Time-domain signal</p><strong>s(t) = Σ Aₖe⁻ᵗ⁄ᵀ²*ₖeⁱ⁽²πνₖt+φₖ⁾</strong><span>The measured FID is a sum of damped complex sinusoids.</span></article>
        <article><p>Fourier transform</p><strong>S(ν) = ∫ s(t)e⁻ⁱ²πνᵗ dt</strong><span>Converts the FID from time to frequency domain.</span></article>
        <article><p>Exponential apodization</p><strong>sLB(t) = s(t)e⁻π·LB·t</strong><span>LB broadens lines while improving apparent signal-to-noise.</span></article>
        <article><p>Zero-order phase</p><strong>Sφ(ν) = S(ν)eⁱφ⁰</strong><span>The same phase rotation is applied across the spectrum.</span></article>
        <article><p>Solvent referencing</p><strong>δcorrected = δmeasured + (δknown − δsolvent)</strong><span>Aligns the selected residual-solvent peak to its accepted shift.</span></article>
        <article><p>Signal integration</p><strong>I = ∫ S(δ)dδ ∝ N</strong><span>For quantitative ¹H NMR, area is proportional to contributing nuclei under suitable acquisition conditions.</span></article>
        <article><p>Scalar coupling</p><strong>J = |δ₁ − δ₂|ν₀</strong><span>Δδ in ppm multiplied by observation frequency in MHz gives J in Hz.</span></article>
        <article><p>Digital resolution</p><strong>Δν = SW/NFFT</strong><span>Zero filling decreases plotted point spacing but does not create new physical resolution.</span></article>
        <article><p>Relaxation linewidth</p><strong>Δν½ ≈ 1/(πT₂*)</strong><span>Shorter effective transverse relaxation produces broader resonances.</span></article>
        <article><p>Signal-to-noise</p><strong>SNR ∝ √Nscans</strong><span>Doubling SNR ideally requires four times as many scans.</span></article>
        <article><p>COSY correlation</p><strong>Icross ∝ sin(πJHHτ)</strong><span>Off-diagonal peaks connect scalar-coupled proton environments.</span></article>
        <article><p>HSQC transfer</p><strong>τ ≈ 1/(4·¹JCH)</strong><span>Coherence transfer correlates each observed proton with its directly bonded carbon.</span></article>
      </div>
      <p>In routine broadband-decoupled ¹³C spectra, carbon–proton splittings are intentionally collapsed and peak areas are generally not directly quantitative; integration and J tools are therefore hidden in ¹³C mode.</p>
    </details>

    <div className="nmr-method"><strong>Processing note</strong><p>Negative phased 1D intensities are clipped at the baseline for display and integration. The reader targets Magritek Spinsolve <code>data.1d</code> and <code>data.2d</code> files with the <code>SORPATAD1.1V</code> signature. COSY and g-HSQC matrices are transformed in both dimensions and displayed as normalized magnitude contours. All processing and assignments remain local to the browser.</p></div>
  </section>;
}
