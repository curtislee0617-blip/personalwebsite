"use client";

import { useMemo, useRef, useState } from "react";
import { NmrSpectrumChart, type NmrInteractionMode, type NmrRegion } from "@/components/nmr-spectrum-chart";
import { parseProcessingScript, parseSpinsolve1d, parseSpinsolveParameters, processSpinsolveFid, type ComplexFid, type SpinsolveParameters } from "@/lib/nmr-spectrum";

const solvents = [
  { id: "cdcl3", label: "Chloroform-d (CDCl₃)", shift: 7.26 },
  { id: "dmso", label: "DMSO-d₆", shift: 2.50 },
  { id: "methanol", label: "Methanol-d₄ (CD₃OD)", shift: 3.31 },
  { id: "water", label: "D₂O / HOD", shift: 4.79 },
  { id: "acetone", label: "Acetone-d₆", shift: 2.05 },
  { id: "benzene", label: "Benzene-d₆", shift: 7.16 },
  { id: "acetonitrile", label: "Acetonitrile-d₃", shift: 1.94 },
  { id: "thf", label: "THF-d₈", shift: 3.58 },
  { id: "toluene", label: "Toluene-d₈", shift: 2.09 },
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
  const [fileName, setFileName] = useState("");
  const [parameters, setParameters] = useState<SpinsolveParameters>({});
  const [observationMHz, setObservationMHz] = useState("");
  const [carrierHz, setCarrierHz] = useState("0");
  const [phaseDegrees, setPhaseDegrees] = useState(0);
  const [lineBroadeningHz, setLineBroadeningHz] = useState(0.2);
  const [zeroFill, setZeroFill] = useState<1 | 2 | 4>(2);
  const [xMinimum, setXMinimum] = useState(-10);
  const [xMaximum, setXMaximum] = useState(15);
  const [fullRange, setFullRange] = useState({ low: -10, high: 15 });
  const [mode, setMode] = useState<NmrInteractionMode>("inspect");
  const [solventId, setSolventId] = useState<(typeof solvents)[number]["id"]>("dmso");
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [solventPeak, setSolventPeak] = useState<number>();
  const [regions, setRegions] = useState<NmrRegion[]>([]);
  const [referenceRegionId, setReferenceRegionId] = useState("");
  const [referenceValue, setReferenceValue] = useState(1);
  const [couplingPoints, setCouplingPoints] = useState<number[]>([]);
  const [message, setMessage] = useState("Select data.1d. For an accurate ppm axis, select acqu.par at the same time.");

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
  const selectedSolvent = solvents.find((solvent) => solvent.id === solventId) ?? solvents[0];
  const regionAreas = useMemo(() => regions.map((region) => ({ ...region, area: integrateRegion(points, region) })), [points, regions]);
  const referenceArea = regionAreas.find((region) => region.id === referenceRegionId)?.area ?? regionAreas[0]?.area ?? 0;
  const couplingHz = couplingPoints.length === 2 ? Math.abs(couplingPoints[0] - couplingPoints[1]) * (axis === "ppm" ? observation : 1) : null;

  async function loadFiles(files: FileList | null) {
    if (!files?.length) return;
    const selected = [...files];
    const dataFile = selected.find((file) => file.name.toLowerCase().endsWith(".1d"));
    if (!dataFile) return setMessage("No .1d file was selected.");
    try {
      const nextFid = parseSpinsolve1d(await dataFile.arrayBuffer());
      const acquFile = selected.find((file) => file.name.toLowerCase() === "acqu.par");
      const scriptFile = selected.find((file) => file.name.toLowerCase().endsWith("processing.script"));
      const nextParameters = acquFile ? parseSpinsolveParameters(await acquFile.text()) : {};
      setFid(nextFid);
      setFileName(dataFile.name);
      setParameters(nextParameters);
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
      setPhaseDegrees(0);
      setLineBroadeningHz(0.2);
      setZeroFill(2);
      if (nextParameters.observationMHz) setObservationMHz(String(nextParameters.observationMHz));
      else setObservationMHz("");
      if (nextParameters.lowestFrequencyHz !== undefined && nextParameters.bandwidthHz !== undefined) {
        const nextCarrier = nextParameters.lowestFrequencyHz + nextParameters.bandwidthHz / 2;
        setCarrierHz(String(nextCarrier));
        if (nextParameters.observationMHz) {
          setXMinimum(-10);
          setXMaximum(15);
          setFullRange({ low: -10, high: 15 });
        } else {
          const centre = nextCarrier;
          const width = nextParameters.bandwidthHz;
          setXMinimum(centre - width / 2);
          setXMaximum(centre + width / 2);
          setFullRange({ low: centre - width / 2, high: centre + width / 2 });
        }
      } else {
        const sweep = nextFid.dwellTime > 0 ? 1 / nextFid.dwellTime : 5000;
        setCarrierHz("0");
        setXMinimum(-sweep / 2);
        setXMaximum(sweep / 2);
        setFullRange({ low: -sweep / 2, high: sweep / 2 });
      }
      if (scriptFile) {
        const processing = parseProcessingScript(await scriptFile.text());
        if (processing.phaseDegrees !== undefined) setPhaseDegrees(processing.phaseDegrees);
        if (processing.lineBroadeningHz !== undefined) setLineBroadeningHz(processing.lineBroadeningHz);
      }
      setMessage(`Read ${nextFid.pointCount.toLocaleString()} complex FID points${acquFile ? " with acquisition metadata" : ""}. Processing remains in this browser.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The NMR file could not be read.");
    }
    if (inputRef.current) inputRef.current.value = "";
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
    if (mode === "solvent" && axis === "ppm") {
      const adjustment = selectedSolvent.shift - shift;
      setCalibrationOffset((current) => current + adjustment);
      setSolventPeak(selectedSolvent.shift);
      setXMinimum((current) => current + adjustment);
      setXMaximum((current) => current + adjustment);
      setFullRange((current) => ({ low: current.low + adjustment, high: current.high + adjustment }));
      setRegions((current) => current.map((region) => ({ ...region, low: region.low + adjustment, high: region.high + adjustment })));
      setCouplingPoints((current) => current.map((point) => point + adjustment));
      setMessage(`Calibrated ${shift.toFixed(4)} ppm to ${selectedSolvent.label} at ${selectedSolvent.shift.toFixed(2)} ppm.`);
    } else if (mode === "coupling") {
      setCouplingPoints((current) => current.length >= 2 ? [shift] : [...current, shift]);
    }
  }

  return <section className="nmr-tool">
    <div className="nmr-upload">
      <div><p>Magritek Spinsolve</p><h2>Load a 1D NMR acquisition</h2><span>Select <strong>data.1d</strong>, plus <strong>acqu.par</strong> and <strong>processing.script</strong> when available.</span></div>
      <input accept=".1d,.par,.script" className="sr-only" multiple onChange={(event) => void loadFiles(event.target.files)} ref={inputRef} type="file" />
      <button onClick={() => inputRef.current?.click()} type="button">Choose NMR files</button>
    </div>
    <p className="nmr-message" role="status">{message}</p>

    <div className="nmr-workspace">
      <aside className="nmr-controls">
        <header><p>{fileName || "No file loaded"}</p><h2>Processing controls</h2></header>
        <div className="nmr-metadata"><span>{parameters.nucleus || "Nucleus —"}</span><span>{parameters.solvent || "Solvent —"}</span><span>{parameters.sample || "Sample —"}</span></div>
        <label><span>Observation frequency <small>MHz</small></span><input inputMode="decimal" onChange={(event) => setObservationMHz(event.target.value)} placeholder="Required for ppm" type="number" value={observationMHz} /></label>
        <label><span>Carrier offset <small>Hz</small></span><input inputMode="decimal" onChange={(event) => setCarrierHz(event.target.value)} type="number" value={carrierHz} /></label>
        <label><span>Zero-order phase <output>{phaseDegrees.toFixed(1)}°</output></span><input max="180" min="-180" onChange={(event) => setPhaseDegrees(Number(event.target.value))} step="0.1" type="range" value={phaseDegrees} /></label>
        <label><span>Line broadening <small>Hz</small></span><input min="0" onChange={(event) => setLineBroadeningHz(Number(event.target.value))} step="0.1" type="number" value={lineBroadeningHz} /></label>
        <fieldset><legend>Zero filling</legend><div className="nmr-segmented">{([1, 2, 4] as const).map((value) => <button className={zeroFill === value ? "is-active" : ""} key={value} onClick={() => setZeroFill(value)} type="button">{value}×</button>)}</div></fieldset>
        <fieldset><legend>Displayed {axis === "ppm" ? "chemical shift" : "frequency"}</legend><div className="nmr-range"><label><span>High</span><input onChange={(event) => setXMaximum(Number(event.target.value))} step="any" type="number" value={Number(xMaximum.toFixed(4))} /></label><label><span>Low</span><input onChange={(event) => setXMinimum(Number(event.target.value))} step="any" type="number" value={Number(xMinimum.toFixed(4))} /></label></div></fieldset>
        <button className="nmr-reset" onClick={() => { setPhaseDegrees(0); setLineBroadeningHz(0.2); setZeroFill(2); }} type="button">Reset processing</button>
      </aside>

      <div className="nmr-output">
        <header><div><p>{axis === "ppm" ? "Chemical-shift spectrum" : "Frequency spectrum"}</p><h2>{parameters.sample || fileName || "1D NMR"}</h2></div><span>{fid ? `${fid.pointCount.toLocaleString()} → ${points.length.toLocaleString()} points` : "Awaiting data"}</span></header>
        <div className="nmr-analysis-toolbar" aria-label="Spectrum interaction mode">
          {(["inspect", "zoom", "integrate", "solvent", "coupling"] as const).map((value) => <button className={mode === value ? "is-active" : ""} disabled={value === "solvent" && axis !== "ppm"} key={value} onClick={() => setMode(value)} type="button">{value === "inspect" ? "Inspect" : value === "zoom" ? "Zoom box" : value === "integrate" ? "Integrate" : value === "solvent" ? "Set solvent" : "Measure J"}</button>)}
          <button onClick={() => { setXMinimum(fullRange.low); setXMaximum(fullRange.high); }} type="button">Reset zoom</button>
        </div>
        <p className="nmr-mode-help">{mode === "zoom" ? "Drag across the spectrum to zoom into an exact range." : mode === "integrate" ? "Drag a box around a signal to add an integration region." : mode === "solvent" ? `Click the ${selectedSolvent.label} residual peak to set it to ${selectedSolvent.shift.toFixed(2)} ppm.` : mode === "coupling" ? "Click two peak maxima; the frequency separation will be reported as J." : "Hover over the spectrum to inspect precise shift and intensity values."}</p>
        <NmrSpectrumChart axis={axis} couplingPoints={couplingPoints} mode={mode} onPeakSelect={handlePeakSelect} onRangeSelect={handleRangeSelect} points={points} regions={regions} solventPeak={solventPeak} xMaximum={xMaximum} xMinimum={xMinimum} />
      </div>
    </div>

    <div className="nmr-analysis-grid">
      <section className="nmr-analysis-card">
        <header><p>Calibration</p><h2>Reference the solvent</h2></header>
        <label><span>Deuterated solvent</span><select onChange={(event) => setSolventId(event.target.value as (typeof solvents)[number]["id"])} value={solventId}>{solvents.map((solvent) => <option key={solvent.id} value={solvent.id}>{solvent.label} · {solvent.shift.toFixed(2)} ppm</option>)}</select></label>
        <p>Select <strong>Set solvent</strong>, then click the residual solvent peak. The entire ppm axis will shift by the required offset.</p>
        <div><span>Applied offset</span><strong>{calibrationOffset >= 0 ? "+" : ""}{calibrationOffset.toFixed(4)} ppm</strong></div>
      </section>

      <section className="nmr-analysis-card">
        <header><p>Integration</p><h2>Relative peak areas</h2></header>
        {!regionAreas.length ? <p>Select <strong>Integrate</strong> and drag around a signal.</p> : <div className="nmr-integral-list">{regionAreas.map((region, index) => <article key={region.id}><input checked={(referenceRegionId || regionAreas[0]?.id) === region.id} name="nmr-reference" onChange={() => setReferenceRegionId(region.id)} type="radio" /><span>I{index + 1}<small>{region.high.toFixed(3)}–{region.low.toFixed(3)} ppm</small></span><strong>{referenceArea > 0 ? (region.area / referenceArea * referenceValue).toFixed(2) : "—"}</strong><button aria-label={`Remove integration ${index + 1}`} onClick={() => { setRegions((current) => current.filter((item) => item.id !== region.id)); if (referenceRegionId === region.id) setReferenceRegionId(""); }} type="button">×</button></article>)}</div>}
        <label><span>Reference integral</span><input min="0.01" onChange={(event) => setReferenceValue(Number(event.target.value))} step="0.01" type="number" value={referenceValue} /></label>
      </section>

      <section className="nmr-analysis-card">
        <header><p>Coupling</p><h2>Measure J</h2></header>
        <p>Select <strong>Measure J</strong> and click two peak maxima. A third click starts a new measurement.</p>
        <div className="nmr-j-result"><span>{couplingPoints.length ? couplingPoints.map((point) => point.toFixed(axis === "ppm" ? 4 : 1)).join(" ↔ ") : "Choose two peaks"}</span><strong>{couplingHz === null ? "—" : `${couplingHz.toFixed(2)} Hz`}</strong></div>
        <button onClick={() => setCouplingPoints([])} type="button">Clear measurement</button>
      </section>
    </div>

    <div className="nmr-method"><strong>Processing note</strong><p>Negative phased intensities are clipped at the baseline for display and integration. The reader targets Magritek Spinsolve time-domain <code>data.1d</code> files with the <code>SORPATAD1.1V</code> signature. Solvent referencing, integrations, zoom ranges, and J measurements are calculated locally and are not uploaded.</p></div>
  </section>;
}
