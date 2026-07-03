"use client";

import { useMemo, useState } from "react";
import { compounds } from "@/lib/compound-properties";
import { generateVleDiagram, type DiagramType, type VleModel, type VleParameters } from "@/lib/vle";
import { VleChart } from "@/components/vle-chart";

const modelLabels: Record<VleModel, string> = {
  ideal: "Ideal Raoult",
  "van-laar": "Van Laar",
  nrtl: "NRTL",
  wilson: "Wilson",
  "peng-robinson": "Peng–Robinson",
};
const defaultParameters: VleParameters = { a12: 1, a21: 1, alpha: 0.3, lambda12: 1.25, lambda21: 0.8, kij: 0 };

type SimulatorState = {
  firstName: string;
  secondName: string;
  type: DiagramType;
  model: VleModel;
  fixedValue: number;
  parameters: VleParameters;
};

const presets = [
  { label: "Ethanol / water", first: "Ethanol", second: "Water", model: "nrtl" as VleModel, type: "txy" as DiagramType, value: 1.01325 },
  { label: "Benzene / toluene", first: "Benzene", second: "Toluene", model: "ideal" as VleModel, type: "txy" as DiagramType, value: 1.01325 },
  { label: "Acetone / chloroform", first: "Acetone", second: "Chloroform", model: "van-laar" as VleModel, type: "pxy" as DiagramType, value: 323.15 },
  { label: "Methane / ethane", first: "Methane", second: "Ethane", model: "peng-robinson" as VleModel, type: "pxy" as DiagramType, value: 173.15 },
  { label: "CO₂ / propane", first: "Carbon dioxide", second: "Propane", model: "peng-robinson" as VleModel, type: "pxy" as DiagramType, value: 273.15 },
  { label: "Methanol / water", first: "Methanol", second: "Water", model: "nrtl" as VleModel, type: "txy" as DiagramType, value: 1.01325 },
  { label: "Hexane / benzene", first: "n-Hexane", second: "Benzene", model: "ideal" as VleModel, type: "pxy" as DiagramType, value: 333.15 },
  { label: "Propane / butane", first: "Propane", second: "n-Butane", model: "peng-robinson" as VleModel, type: "pxy" as DiagramType, value: 298.15 },
  { label: "Nitrogen / oxygen", first: "Nitrogen", second: "Oxygen", model: "peng-robinson" as VleModel, type: "pxy" as DiagramType, value: 83.15 },
];

function compoundByName(name: string) {
  return compounds.find((compound) => compound.name === name) ?? compounds[0];
}

export function VleSimulator() {
  const [firstName, setFirstName] = useState("Ethanol");
  const [secondName, setSecondName] = useState("Water");
  const [type, setType] = useState<DiagramType>("txy");
  const [model, setModel] = useState<VleModel>("nrtl");
  const [fixedInput, setFixedInput] = useState("1.01325");
  const [parameters, setParameters] = useState(defaultParameters);
  const [submitted, setSubmitted] = useState<SimulatorState>({ firstName, secondName, type, model, fixedValue: 1.01325, parameters });

  const first = compoundByName(submitted.firstName);
  const second = compoundByName(submitted.secondName);
  const result = useMemo(() => generateVleDiagram(first, second, submitted.type, submitted.fixedValue, submitted.model, submitted.parameters), [first, second, submitted]);
  const isActivityModel = model !== "ideal" && model !== "peng-robinson";
  const validFirst = compounds.some((compound) => compound.name === firstName);
  const validSecond = compounds.some((compound) => compound.name === secondName);
  const validPair = validFirst && validSecond && firstName !== secondName;

  function switchDiagram(nextType: DiagramType) {
    setType(nextType);
    setFixedInput(nextType === "txy" ? "1.01325" : "78");
  }

  function setParameter(key: keyof VleParameters, value: string) {
    setParameters((current) => ({ ...current, [key]: Number(value) }));
  }

  function calculate() {
    if (!validPair) return;
    const value = Number(fixedInput);
    setSubmitted({
      firstName,
      secondName,
      type,
      model,
      fixedValue: type === "pxy" ? value + 273.15 : value,
      parameters: { ...parameters },
    });
  }

  function applyPreset(preset: typeof presets[number]) {
    setFirstName(preset.first);
    setSecondName(preset.second);
    setModel(preset.model);
    setType(preset.type);
    setFixedInput(preset.type === "pxy" ? (preset.value - 273.15).toString() : preset.value.toString());
    setSubmitted({ firstName: preset.first, secondName: preset.second, model: preset.model, type: preset.type, fixedValue: preset.value, parameters: { ...parameters } });
  }

  return (
    <section className="vle-tool">
      <div className="vle-presets" aria-label="Common mixture examples">
        <span>Examples</span>
        <div>{presets.map((preset) => <button key={preset.label} onClick={() => applyPreset(preset)} type="button">{preset.label}</button>)}</div>
      </div>

      <div className="vle-layout">
        <aside className="vle-controls">
          <div className="vle-control-heading"><p>Binary mixture · {compounds.length} compounds available</p><h2>Choose two compounds</h2></div>
          <div className="vle-compound-inputs">
            <label><span>Compound 1</span><input aria-invalid={!validFirst} list="vle-first-compounds" onChange={(event) => setFirstName(event.target.value)} placeholder="Type a name or formula" value={firstName} /><datalist id="vle-first-compounds">{compounds.filter((compound) => compound.name !== secondName).map((compound) => <option key={compound.name} value={compound.name}>{compound.formula}</option>)}</datalist></label>
            <button aria-label="Swap components" onClick={() => { setFirstName(secondName); setSecondName(firstName); }} type="button">⇄</button>
            <label><span>Compound 2</span><input aria-invalid={!validSecond} list="vle-second-compounds" onChange={(event) => setSecondName(event.target.value)} placeholder="Type a name or formula" value={secondName} /><datalist id="vle-second-compounds">{compounds.filter((compound) => compound.name !== firstName).map((compound) => <option key={compound.name} value={compound.name}>{compound.formula}</option>)}</datalist></label>
          </div>
          {!validPair && <p className="vle-selection-error">Choose two different compounds from the suggestions.</p>}

          <div className="vle-toggle" aria-label="Diagram type">
            <button className={type === "txy" ? "is-active" : ""} onClick={() => switchDiagram("txy")} type="button"><strong>T–x–y</strong><span>fixed pressure</span></button>
            <button className={type === "pxy" ? "is-active" : ""} onClick={() => switchDiagram("pxy")} type="button"><strong>P–x–y</strong><span>fixed temperature</span></button>
          </div>

          <label className="vle-fixed-input"><span>{type === "txy" ? "System pressure" : "System temperature"}</span><div><input inputMode="decimal" onChange={(event) => setFixedInput(event.target.value)} type="number" value={fixedInput} /><b>{type === "txy" ? "bar" : "°C"}</b></div></label>

          <label className="vle-model-select"><span>Thermodynamic model</span><select onChange={(event) => setModel(event.target.value as VleModel)} value={model}>{Object.entries(modelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>

          {isActivityModel && <div className="vle-parameters">
            <p>Model parameters <span>dimensionless</span></p>
            {model === "van-laar" && <><label>A₁₂<input inputMode="decimal" onChange={(event) => setParameter("a12", event.target.value)} type="number" value={parameters.a12} /></label><label>A₂₁<input inputMode="decimal" onChange={(event) => setParameter("a21", event.target.value)} type="number" value={parameters.a21} /></label></>}
            {model === "nrtl" && <><label>τ₁₂<input inputMode="decimal" onChange={(event) => setParameter("a12", event.target.value)} type="number" value={parameters.a12} /></label><label>τ₂₁<input inputMode="decimal" onChange={(event) => setParameter("a21", event.target.value)} type="number" value={parameters.a21} /></label><label>α<input inputMode="decimal" onChange={(event) => setParameter("alpha", event.target.value)} type="number" value={parameters.alpha} /></label></>}
            {model === "wilson" && <><label>Λ₁₂<input inputMode="decimal" onChange={(event) => setParameter("lambda12", event.target.value)} type="number" value={parameters.lambda12} /></label><label>Λ₂₁<input inputMode="decimal" onChange={(event) => setParameter("lambda21", event.target.value)} type="number" value={parameters.lambda21} /></label></>}
          </div>}
          {model === "peng-robinson" && <div className="vle-parameters"><p>Binary interaction</p><label>kᵢⱼ<input inputMode="decimal" onChange={(event) => setParameter("kij", event.target.value)} step="0.01" type="number" value={parameters.kij} /></label></div>}

          <button className="vle-calculate" disabled={!validPair || !Number.isFinite(Number(fixedInput))} onClick={calculate} type="button">Generate diagram</button>
          <p className="vle-model-note">{model === "peng-robinson" ? "Cubic EOS calculation using critical properties and acentric factors. Suitable for light gases and non-polar mixtures; fit kᵢⱼ when data are available." : model === "ideal" ? "Ideal modified Raoult law with γ₁ = γ₂ = 1. Best for chemically similar liquids at low pressure." : "Activity-coefficient model with constant illustrative parameters. Enter fitted binary parameters for quantitative design work."}</p>
        </aside>

        <div className="vle-output">
          <header><div><p>{modelLabels[submitted.model]}</p><h2>{first.name} + {second.name}</h2></div><span>{submitted.type === "txy" ? `${submitted.fixedValue} bar` : `${(submitted.fixedValue - 273.15).toFixed(2)} °C`}</span></header>
          <VleChart firstLabel={first.formula} points={result.points} type={submitted.type} />
          <div className="vle-status">
            <span>{result.points.length} equilibrium points</span>
            {result.extrapolated && <strong>Antoine extrapolation used</strong>}
            {result.failed > 0 && <strong>{result.failed} compositions did not converge</strong>}
          </div>
        </div>
      </div>

      <details className="compound-equations vle-equations">
        <summary><span>VLE equations at a glance</span><small>Show equations</small></summary>
        <div className="compound-equation-grid">
          <article><p>Phase equilibrium</p><strong>fᶫᵢ = fᵛᵢ</strong><strong>yᵢφᵛᵢP = xᵢγᵢPˢᵃᵗᵢ</strong><span>At low pressure, φᵛᵢ ≈ 1 and the Poynting correction is neglected.</span></article>
          <article className="compound-equation-wide"><p>Modified Raoult law</p><strong>P = Σ xᵢγᵢPˢᵃᵗᵢ</strong><strong>yᵢ = xᵢγᵢPˢᵃᵗᵢ / P</strong><span>Ideal Raoult law is recovered when γ₁ = γ₂ = 1.</span></article>
          <article><p>Ideal binary P–x–y</p><strong>Pᵇᵘᵇ = x₁Pˢᵃᵗ₁ + x₂Pˢᵃᵗ₂</strong><strong>1/Pᵈᵉʷ = y₁/Pˢᵃᵗ₁ + y₂/Pˢᵃᵗ₂</strong></article>
          <article><p>Antoine vapour pressure</p><strong>ln(Pˢᵃᵗ/bar) = A − B/(T + C)</strong><span>The valid temperature interval depends on the selected compound.</span></article>
          <article><p>Activity models</p><strong>Gᴱ/RT → ln γᵢ</strong><strong>γᵢ = f(x₁, x₂, model parameters)</strong><span>Van Laar, NRTL and Wilson describe liquid-phase non-ideality.</span></article>
          <article className="compound-equation-wide"><p>Peng–Robinson EOS</p><strong>P = RT/(V − b) − aα/[V(V + b) + b(V − b)]</strong><strong>Kᵢ = yᵢ/xᵢ = φᶫᵢ/φᵛᵢ</strong><span>aα and b use critical properties and acentric factors; mixture a includes the binary interaction parameter kᵢⱼ.</span></article>
        </div>
        <p className="compound-equation-caption">T–x–y holds pressure constant and solves the bubble temperature. P–x–y holds temperature constant and solves the bubble pressure. The plotted dew curve uses the corresponding equilibrium vapour composition y₁.</p>
      </details>

      <section className="vle-data">
        <div><p>Equilibrium data</p><h2>Calculated x–y points</h2><span>x₁ and y₁ are mole fractions of {first.name}.</span></div>
        <div className="vle-table-wrap"><table><thead><tr><th>x₁ liquid</th><th>y₁ vapour</th><th>{submitted.type === "txy" ? "Temperature (°C)" : "Pressure (bar)"}</th></tr></thead><tbody>{result.points.map((point) => <tr key={point.x}><td>{point.x.toFixed(3)}</td><td>{point.y.toFixed(4)}</td><td>{submitted.type === "txy" ? (point.value - 273.15).toFixed(3) : point.value.toFixed(4)}</td></tr>)}</tbody></table></div>
      </section>

      <div className="vle-method-note"><strong>Model boundary</strong><p>Raoult, Van Laar, NRTL and Wilson use the Koretsky Antoine coefficients and are intended for subcritical, low-pressure liquid mixtures. Peng–Robinson calculates both phase fugacities and is the better starting point for light gases or elevated pressure. These diagrams are educational simulations; validate interaction parameters and phase stability before process-design use.</p></div>
    </section>
  );
}
