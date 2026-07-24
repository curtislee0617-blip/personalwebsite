"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { NmrSpectrumChart, type NmrCouplingMarker, type NmrInteractionMode, type NmrRegion } from "@/components/nmr-spectrum-chart";
import { Nmr2dChart } from "@/components/nmr-2d-chart";
import { stripLeadingZeros } from "@/lib/number-input";
import { couplingConstantHz, estimatePhaseCorrection, integrateNmrRegion, parseProcessingScript, parseSpinsolve1d, parseSpinsolve2d, parseSpinsolveParameters, pickNmr2dPeaks, pickNmrPeaks, processSpinsolve2d, processSpinsolveFid, solventReferenceOffset, spinsolvePhaseCorrection, type ComplexFid, type ComplexFid2d, type NmrPeak2d, type SpinsolveParameters } from "@/lib/nmr-spectrum";

type NmrNucleus = "1H" | "13C";
type CouplingMeasurement = { id: string; points: [number, number] };

const analysisStoragePrefix = "nmr-spectrum-analysis-v1:";

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

type StoredNmrAnalysis = {
  version: 1;
  solventId: (typeof solvents)[number]["id"];
  calibrationOffset: number;
  solventPeak?: number;
  regions: NmrRegion[];
  referenceRegionId: string;
  referenceValue: number;
  couplingMeasurements: CouplingMeasurement[];
  splittingLabels: Record<string, string>;
};

async function spectrumStorageKey(buffer: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const hexadecimal = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${analysisStoragePrefix}${hexadecimal}`;
}

function readStoredAnalysis(storageKey: string): StoredNmrAnalysis | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredNmrAnalysis>;
    if (parsed.version !== 1 || !Array.isArray(parsed.regions) || !Array.isArray(parsed.couplingMeasurements)) return null;
    const solvent = solvents.find((item) => item.id === parsed.solventId)?.id ?? "dmso";
    const regions = parsed.regions.filter((region): region is NmrRegion => typeof region?.id === "string" && Number.isFinite(region.low) && Number.isFinite(region.high));
    const couplingMeasurements = parsed.couplingMeasurements.filter((measurement): measurement is CouplingMeasurement =>
      typeof measurement?.id === "string"
      && Array.isArray(measurement.points)
      && measurement.points.length === 2
      && measurement.points.every(Number.isFinite));
    return {
      version: 1,
      solventId: solvent,
      calibrationOffset: Number.isFinite(parsed.calibrationOffset) ? parsed.calibrationOffset! : 0,
      solventPeak: Number.isFinite(parsed.solventPeak) ? parsed.solventPeak : undefined,
      regions,
      referenceRegionId: typeof parsed.referenceRegionId === "string" ? parsed.referenceRegionId : "",
      referenceValue: Number.isFinite(parsed.referenceValue) && parsed.referenceValue! > 0 ? parsed.referenceValue! : 1,
      couplingMeasurements,
      splittingLabels: parsed.splittingLabels && typeof parsed.splittingLabels === "object" ? parsed.splittingLabels : {},
    };
  } catch {
    return null;
  }
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
  const [phase1Degrees, setPhase1Degrees] = useState(0);
  const [lineBroadeningHz, setLineBroadeningHz] = useState(0.2);
  const [zeroFill, setZeroFill] = useState<1 | 2 | 4>(2);
  const [processingDefaults, setProcessingDefaults] = useState({ phase0Degrees: 0, phase1Degrees: 0, lineBroadeningHz: 0.2 });
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
  const [couplingDraft, setCouplingDraft] = useState<number[]>([]);
  const [couplingMeasurements, setCouplingMeasurements] = useState<CouplingMeasurement[]>([]);
  const [analysisStorageKey, setAnalysisStorageKey] = useState("");
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
    phase1Degrees,
    zeroFill,
    observationMHz: observation > 0 ? observation : undefined,
    carrierHz: Number.isFinite(carrier) ? carrier : 0,
  }) : [], [carrier, fid, lineBroadeningHz, observation, phase1Degrees, phaseDegrees, zeroFill]);
  const points = useMemo(() => rawPoints.map((point) => ({ ...point, shift: point.shift + calibrationOffset })), [calibrationOffset, rawPoints]);
  const peaks = useMemo(() => showPeakLabels ? pickNmrPeaks(points.filter((point) => point.shift >= Math.min(xMinimum, xMaximum) && point.shift <= Math.max(xMinimum, xMaximum)), peakProminence, 30, peakCount) : [], [peakCount, peakProminence, points, showPeakLabels, xMaximum, xMinimum]);
  const availableSolvents = solvents.filter((solvent) => nucleus === "1H" ? solvent.proton !== undefined : "carbon" in solvent && solvent.carbon !== undefined);
  const selectedSolvent = availableSolvents.find((solvent) => solvent.id === solventId) ?? availableSolvents[0];
  const selectedSolventShift = nucleus === "1H" ? selectedSolvent.proton : ("carbon" in selectedSolvent ? selectedSolvent.carbon : undefined);
  const regionAreas = useMemo(() => regions.map((region) => ({ ...region, area: integrateNmrRegion(points, region.low, region.high) })), [points, regions]);
  const referenceArea = regionAreas.find((region) => region.id === referenceRegionId)?.area ?? regionAreas[0]?.area ?? 0;
  const couplingValues = useMemo(() => couplingMeasurements.map((measurement) => ({
    ...measurement,
    hertz: couplingConstantHz(measurement.points[0], measurement.points[1], axis, observation),
  })), [axis, couplingMeasurements, observation]);
  const couplingMarkers = useMemo<NmrCouplingMarker[]>(() => [
    ...couplingMeasurements.flatMap((measurement, measurementIndex) => measurement.points.map((shift, pointIndex) => ({
      id: `${measurement.id}-${pointIndex}`,
      shift,
      label: `J${measurementIndex + 1}${pointIndex === 0 ? "a" : "b"}`,
    }))),
    ...couplingDraft.map((shift, pointIndex) => ({
      id: `draft-${pointIndex}`,
      shift,
      label: `J${couplingMeasurements.length + 1}a`,
    })),
  ], [couplingDraft, couplingMeasurements]);
  const spectrum2d = useMemo(() => fid2d ? processSpinsolve2d(fid2d, parameters) : null, [fid2d, parameters]);
  const peaks2d = useMemo(() => spectrum2d ? pickNmr2dPeaks(spectrum2d, contourThreshold, peak2dCount) : [], [contourThreshold, peak2dCount, spectrum2d]);

  useEffect(() => {
    if (!analysisStorageKey || !fid) return;
    const analysis: StoredNmrAnalysis = {
      version: 1,
      solventId,
      calibrationOffset,
      solventPeak,
      regions,
      referenceRegionId,
      referenceValue,
      couplingMeasurements,
      splittingLabels,
    };
    try {
      localStorage.setItem(analysisStorageKey, JSON.stringify(analysis));
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
      // Analysis remains usable for the current session in React state.
    }
  }, [analysisStorageKey, calibrationOffset, couplingMeasurements, fid, referenceRegionId, referenceValue, regions, solventId, solventPeak, splittingLabels]);

  async function loadFiles(files: FileList | null) {
    if (!files?.length) return;
    const selected = [...files];
    const dataFile = selected.find((file) => file.name.toLowerCase().endsWith(".1d"));
    const data2dFile = selected.find((file) => file.name.toLowerCase().endsWith(".2d"));
    if (!dataFile && !data2dFile) return setMessage("No .1d or .2d Spinsolve file was selected.");
    // Stop writes to the previously loaded acquisition while this asynchronous
    // file read is in progress.
    setAnalysisStorageKey("");
    try {
      const dataBuffer = dataFile ? await dataFile.arrayBuffer() : null;
      const nextFid = dataBuffer ? parseSpinsolve1d(dataBuffer) : null;
      const nextFid2d = data2dFile ? parseSpinsolve2d(await data2dFile.arrayBuffer()) : null;
      const acquFile = selected.find((file) => file.name.toLowerCase() === "acqu.par");
      const scriptFile = selected.find((file) => file.name.toLowerCase().endsWith("processing.script"));
      const nextParameters = acquFile ? parseSpinsolveParameters(await acquFile.text()) : {};
      const processing = scriptFile ? parseProcessingScript(await scriptFile.text()) : {};
      const nextLineBroadening = processing.lineBroadeningHz ?? 0.2;
      const instrumentCorrection = spinsolvePhaseCorrection(processing);
      const automaticCorrection = nextFid && !instrumentCorrection ? estimatePhaseCorrection(nextFid, nextLineBroadening) : null;
      const phaseCorrection = instrumentCorrection ?? automaticCorrection ?? { phase0Degrees: 0, phase1Degrees: 0 };
      const nextStorageKey = dataBuffer ? await spectrumStorageKey(dataBuffer) : "";
      const stored = nextStorageKey ? readStoredAnalysis(nextStorageKey) : null;
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
      const restoredSolvent = stored ? solvents.find((solvent) =>
        solvent.id === stored.solventId
        && (detectedNucleus === "1H" || ("carbon" in solvent && solvent.carbon !== undefined))) : undefined;
      setSolventId(restoredSolvent?.id ?? matchedSolvent?.id ?? "dmso");
      const restoredOffset = stored?.calibrationOffset ?? 0;
      setCalibrationOffset(restoredOffset);
      setSolventPeak(stored?.solventPeak);
      setRegions(stored?.regions ?? []);
      setReferenceRegionId(stored?.referenceRegionId ?? "");
      setReferenceValue(stored?.referenceValue ?? 1);
      setCouplingDraft([]);
      setCouplingMeasurements(stored?.couplingMeasurements ?? []);
      setSelected2dPeak(null);
      setSplittingLabels(stored?.splittingLabels ?? {});
      setPhaseDegrees(phaseCorrection.phase0Degrees);
      setPhase1Degrees(phaseCorrection.phase1Degrees);
      setLineBroadeningHz(nextLineBroadening);
      setProcessingDefaults({ ...phaseCorrection, lineBroadeningHz: nextLineBroadening });
      setZeroFill(2);
      if (nextParameters.observationMHz) setObservationMHz(String(nextParameters.observationMHz));
      else setObservationMHz("");
      if (nextParameters.lowestFrequencyHz !== undefined && nextParameters.bandwidthHz !== undefined) {
        const nextCarrier = nextParameters.lowestFrequencyHz + nextParameters.bandwidthHz / 2;
        setCarrierHz(String(nextCarrier));
        if (nextParameters.observationMHz) {
          const defaultRange = detectedNucleus === "13C" ? { low: 0, high: 220 } : { low: -10, high: 20 };
          setXMinimum(defaultRange.low + restoredOffset);
          setXMaximum(defaultRange.high + restoredOffset);
          setFullRange({ low: defaultRange.low + restoredOffset, high: defaultRange.high + restoredOffset });
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
      const phaseSource = instrumentCorrection ? "Instrument phase" : "Automatic phase";
      const restoredSummary = stored
        ? ` Restored ${stored.regions.length} integration region${stored.regions.length === 1 ? "" : "s"} and ${stored.couplingMeasurements.length} saved J measurement${stored.couplingMeasurements.length === 1 ? "" : "s"}.`
        : "";
      setMessage(`Read ${descriptions}${acquFile ? " with acquisition metadata" : ""}${nextFid ? `. ${phaseSource}: ${phaseCorrection.phase0Degrees.toFixed(1)}° (ϕ₀), ${phaseCorrection.phase1Degrees.toFixed(0)}° (ϕ₁).` : "."}${restoredSummary}`);
      setAnalysisStorageKey(nextStorageKey);
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
      setCouplingDraft([]);
      setCouplingMeasurements([]);
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
      const adjustment = solventReferenceOffset(shift, selectedSolventShift);
      setCalibrationOffset((current) => current + adjustment);
      setSolventPeak(selectedSolventShift);
      setXMinimum((current) => current + adjustment);
      setXMaximum((current) => current + adjustment);
      setFullRange((current) => ({ low: current.low + adjustment, high: current.high + adjustment }));
      setRegions((current) => current.map((region) => ({ ...region, low: region.low + adjustment, high: region.high + adjustment })));
      setCouplingDraft((current) => current.map((point) => point + adjustment));
      setCouplingMeasurements((current) => current.map((measurement): CouplingMeasurement => ({
        ...measurement,
        points: [measurement.points[0] + adjustment, measurement.points[1] + adjustment],
      })));
      setMessage(`Calibrated ${shift.toFixed(4)} ppm to ${selectedSolvent.label} at ${selectedSolventShift.toFixed(2)} ppm.`);
    } else if (mode === "coupling") {
      if (couplingDraft.length === 1) {
        setCouplingMeasurements((current) => [...current, { id: crypto.randomUUID(), points: [couplingDraft[0], shift] }]);
        setCouplingDraft([]);
      } else {
        setCouplingDraft([shift]);
      }
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
        <label><span>Observation frequency <small>MHz</small></span><input inputMode="decimal" onChange={(event) => changeObservationFrequency(stripLeadingZeros(event.target.value))} placeholder="Required for ppm" type="number" value={observationMHz} /></label>
        <label><span>Carrier offset <small>Hz</small></span><input inputMode="decimal" onChange={(event) => setCarrierHz(stripLeadingZeros(event.target.value))} type="number" value={carrierHz} /></label>
        <div className="nmr-phase-control"><label><span>Zero-order phase ϕ₀ <output>{phaseDegrees.toFixed(1)}°</output></span><input max="180" min="-180" onChange={(event) => setPhaseDegrees(Number(event.target.value))} step="0.1" type="range" value={phaseDegrees} /></label><label><span>First-order phase ϕ₁ <output>{phase1Degrees.toFixed(0)}°</output></span><input max="400" min="-400" onChange={(event) => setPhase1Degrees(Number(event.target.value))} step="1" type="range" value={phase1Degrees} /></label><button disabled={!fid} onClick={() => { if (!fid) return; const automatic = estimatePhaseCorrection(fid, lineBroadeningHz); setPhaseDegrees(automatic.phase0Degrees); setPhase1Degrees(automatic.phase1Degrees); setMessage(`Automatic phase set to ${automatic.phase0Degrees.toFixed(1)}° (ϕ₀) and ${automatic.phase1Degrees.toFixed(0)}° (ϕ₁); use the sliders for manual refinement.`); }} type="button">Auto phase</button></div>
        <label><span>Line broadening <small>Hz</small></span><input min="0" onChange={(event) => setLineBroadeningHz(Number(event.target.value))} step="0.1" type="number" value={lineBroadeningHz} /></label>
        <fieldset><legend>Zero filling</legend><div className="nmr-segmented">{([1, 2, 4] as const).map((value) => <button className={zeroFill === value ? "is-active" : ""} key={value} onClick={() => setZeroFill(value)} type="button">{value}×</button>)}</div></fieldset>
        <fieldset className="nmr-peak-settings"><legend>Peak labels <label><input checked={showPeakLabels} onChange={(event) => setShowPeakLabels(event.target.checked)} type="checkbox" /> Show</label></legend><label><span>Maximum labels <output>{peakCount}</output></span><input max="30" min="1" onChange={(event) => setPeakCount(Number(event.target.value))} type="range" value={peakCount} /></label><label><span>Minimum prominence</span><input min="0.001" onChange={(event) => setPeakProminence(Number(event.target.value))} step="0.005" type="number" value={peakProminence} /></label></fieldset>
        <fieldset><legend>Displayed {axis === "ppm" ? "chemical shift" : "frequency"}</legend><div className="nmr-range"><label><span>High</span><input onChange={(event) => setXMaximum(Number(event.target.value))} step="any" type="number" value={Number(xMaximum.toFixed(4))} /></label><label><span>Low</span><input onChange={(event) => setXMinimum(Number(event.target.value))} step="any" type="number" value={Number(xMinimum.toFixed(4))} /></label></div></fieldset>
        <button className="nmr-reset" onClick={() => { setLineBroadeningHz(processingDefaults.lineBroadeningHz); setZeroFill(2); setPhaseDegrees(processingDefaults.phase0Degrees); setPhase1Degrees(processingDefaults.phase1Degrees); }} type="button">Reset processing</button>
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
        <p className="nmr-mode-help">{mode === "zoom" ? "Drag across the spectrum to zoom into an exact range." : mode === "integrate" ? "Drag a box around a signal to add an integration region." : mode === "solvent" ? `Click the ${selectedSolvent.label} residual peak to set it to ${selectedSolventShift?.toFixed(2)} ppm.` : mode === "coupling" ? "Click two peak maxima to save a J measurement, then continue with another pair." : "Hover over the spectrum to inspect precise shift and intensity values."}</p>
        <NmrSpectrumChart axis={axis} couplingMarkers={couplingMarkers} mode={mode} onPeakSelect={handlePeakSelect} onRangeSelect={handleRangeSelect} peaks={peaks} points={points} regions={regions} solventPeak={solventPeak} xMaximum={xMaximum} xMinimum={xMinimum} />
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
        <p>Select <strong>Measure J</strong> and click two peak maxima. Every completed pair is retained and restored locally when you reopen this acquisition.</p>
        {couplingDraft.length === 1 && <div className="nmr-j-draft"><span>J{couplingMeasurements.length + 1} first peak</span><strong>{couplingDraft[0].toFixed(axis === "ppm" ? 4 : 1)} {axis}</strong></div>}
        {!couplingValues.length ? <div className="nmr-j-result"><span>{couplingDraft.length ? "Choose the second peak" : "Choose two peaks"}</span><strong>—</strong></div> : <div className="nmr-j-list">{couplingValues.map((measurement, index) => <article key={measurement.id}><span>J{index + 1}<small>{measurement.points.map((point) => point.toFixed(axis === "ppm" ? 4 : 1)).join(" ↔ ")} {axis}</small></span><strong>{measurement.hertz === null ? "—" : `${measurement.hertz.toFixed(2)} Hz`}</strong><button aria-label={`Remove J measurement ${index + 1}`} onClick={() => setCouplingMeasurements((current) => current.filter((item) => item.id !== measurement.id))} type="button">×</button></article>)}</div>}
        <button disabled={!couplingDraft.length && !couplingMeasurements.length} onClick={() => { setCouplingDraft([]); setCouplingMeasurements([]); }} type="button">Clear all J measurements</button>
      </section>}
    </div>}

    <section className="nmr-signal-table">
      <header><div><p>Assignments</p><h2>Identified signals</h2></div><span>{viewMode === "2d" ? `${peaks2d.length} cross-peaks` : `${peaks.length} labelled peaks`}</span></header>
      <div>{viewMode === "2d" ? <table><thead><tr><th>Signal</th><th>F2 ¹H shift</th><th>F1 {spectrum2d?.experiment === "hsqc" ? "¹³C" : "¹H"} shift</th><th>Type</th><th>Intensity</th></tr></thead><tbody>{peaks2d.map((peak, index) => <tr className={selected2dPeak?.xIndex === peak.xIndex && selected2dPeak?.yIndex === peak.yIndex ? "is-selected" : ""} key={`${peak.xIndex}-${peak.yIndex}`}><td>P{index + 1}</td><td>{peak.x.toFixed(3)} ppm</td><td>{peak.y.toFixed(3)} ppm</td><td>{spectrum2d?.experiment === "hsqc" ? "¹H–¹³C correlation" : "¹H–¹H correlation"}</td><td>{peak.intensity.toFixed(3)}</td></tr>)}</tbody></table> : <table><thead><tr><th>Signal</th><th>Chemical shift</th><th>Splitting</th><th>Integration</th><th>Coupling</th></tr></thead><tbody>{peaks.map((peak, index) => { const key = peak.shift.toFixed(3); const region = regionAreas.find((item) => peak.shift >= item.low && peak.shift <= item.high); const integral = region && referenceArea > 0 ? region.area / referenceArea * referenceValue : null; const signalCouplings = couplingValues.filter((measurement) => measurement.hertz !== null && measurement.points.some((point) => Math.abs(point - peak.shift) < 0.01)); return <tr key={key}><td>S{index + 1}</td><td>{peak.shift.toFixed(3)} ppm</td><td><select onChange={(event) => setSplittingLabels((current) => ({ ...current, [key]: event.target.value }))} value={splittingLabels[key] ?? "—"}>{["—", "s", "d", "t", "q", "m", "dd", "br"].map((label) => <option key={label}>{label}</option>)}</select></td><td>{nucleus === "1H" && integral !== null ? integral.toFixed(2) : "—"}</td><td>{nucleus === "1H" && signalCouplings.length ? signalCouplings.map((measurement) => measurement.hertz!.toFixed(2)).join(", ") + " Hz" : "—"}</td></tr>; })}</tbody></table>}</div>
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
