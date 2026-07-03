"use client";

import { useMemo, useRef, useState } from "react";
import { NmrSpectrumChart } from "@/components/nmr-spectrum-chart";
import { parseProcessingScript, parseSpinsolve1d, parseSpinsolveParameters, processSpinsolveFid, type ComplexFid, type SpinsolveParameters } from "@/lib/nmr-spectrum";

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
  const [xMinimum, setXMinimum] = useState(-5);
  const [xMaximum, setXMaximum] = useState(15);
  const [message, setMessage] = useState("Select data.1d. For an accurate ppm axis, select acqu.par at the same time.");

  const observation = Number(observationMHz);
  const carrier = Number(carrierHz);
  const axis = observation > 0 ? "ppm" as const : "hz" as const;
  const points = useMemo(() => fid ? processSpinsolveFid(fid, {
    lineBroadeningHz,
    phaseDegrees,
    zeroFill,
    observationMHz: observation > 0 ? observation : undefined,
    carrierHz: Number.isFinite(carrier) ? carrier : 0,
  }) : [], [carrier, fid, lineBroadeningHz, observation, phaseDegrees, zeroFill]);

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
      if (nextParameters.observationMHz) setObservationMHz(String(nextParameters.observationMHz));
      else setObservationMHz("");
      if (nextParameters.lowestFrequencyHz !== undefined && nextParameters.bandwidthHz !== undefined) {
        const nextCarrier = nextParameters.lowestFrequencyHz + nextParameters.bandwidthHz / 2;
        setCarrierHz(String(nextCarrier));
        const centre = nextParameters.observationMHz ? nextCarrier / nextParameters.observationMHz : nextCarrier;
        const width = nextParameters.observationMHz ? nextParameters.bandwidthHz / nextParameters.observationMHz : nextParameters.bandwidthHz;
        setXMinimum(centre - width / 2);
        setXMaximum(centre + width / 2);
      } else {
        const sweep = nextFid.dwellTime > 0 ? 1 / nextFid.dwellTime : 5000;
        setCarrierHz("0");
        setXMinimum(-sweep / 2);
        setXMaximum(sweep / 2);
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
        <fieldset><legend>Displayed {axis === "ppm" ? "chemical shift" : "frequency"}</legend><div className="nmr-range"><label><span>Low</span><input onChange={(event) => setXMinimum(Number(event.target.value))} step="any" type="number" value={Number(xMinimum.toFixed(4))} /></label><label><span>High</span><input onChange={(event) => setXMaximum(Number(event.target.value))} step="any" type="number" value={Number(xMaximum.toFixed(4))} /></label></div></fieldset>
        <button className="nmr-reset" onClick={() => { setPhaseDegrees(0); setLineBroadeningHz(0.2); setZeroFill(2); }} type="button">Reset processing</button>
      </aside>

      <div className="nmr-output">
        <header><div><p>{axis === "ppm" ? "Chemical-shift spectrum" : "Frequency spectrum"}</p><h2>{parameters.sample || fileName || "1D NMR"}</h2></div><span>{fid ? `${fid.pointCount.toLocaleString()} → ${points.length.toLocaleString()} points` : "Awaiting data"}</span></header>
        <NmrSpectrumChart axis={axis} points={points} xMaximum={xMaximum} xMinimum={xMinimum} />
      </div>
    </div>

    <div className="nmr-method"><strong>Supported format</strong><p>This reader currently targets Magritek Spinsolve time-domain <code>data.1d</code> files with the <code>SORPATAD1.1V</code> signature. It decodes interleaved complex FID values, applies exponential apodization and zero-order phase correction, zero-fills, and performs a radix-2 Fourier transform locally. Uploading <code>acqu.par</code> supplies the spectrometer frequency and carrier needed for a calibrated ppm axis.</p></div>
  </section>;
}
