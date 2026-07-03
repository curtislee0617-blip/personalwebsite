"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  calculateCompound,
  compounds,
  normalizeCompoundQuery,
  type Compound,
} from "@/lib/compound-properties";

type TemperatureUnit = "K" | "°C";
type PressureUnit = "bar" | "kPa" | "MPa" | "atm";
const pressureToBar: Record<PressureUnit, number> = { bar: 1, kPa: 0.01, MPa: 10, atm: 1.01325 };

function matches(compound: Compound, query: string) {
  const normalized = normalizeCompoundQuery(query);
  return normalizeCompoundQuery(compound.name).includes(normalized)
    || normalizeCompoundQuery(compound.formula).includes(normalized);
}

function number(value: number, digits = 4) {
  return Number(value.toPrecision(digits)).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function CompoundPropertiesCalculator() {
  const [selectedIndex, setSelectedIndex] = useState(() => compounds.findIndex((compound) => compound.formula === "CO2"));
  const [query, setQuery] = useState("Carbon dioxide");
  const [temperature, setTemperature] = useState("350");
  const [pressure, setPressure] = useState("20");
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("K");
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>("bar");
  const [catalogueQuery, setCatalogueQuery] = useState("");
  const [submittedState, setSubmittedState] = useState({ compoundIndex: selectedIndex, temperatureKelvin: 350, pressureBar: 20 });

  const selected = compounds[selectedIndex];
  const suggestions = useMemo(() => query.trim().length < 1
    ? []
    : compounds.filter((compound) => matches(compound, query)).slice(0, 7), [query]);
  const catalogue = useMemo(() => compounds.filter((compound) => matches(compound, catalogueQuery)), [catalogueQuery]);
  const temperatureKelvin = temperatureUnit === "K" ? Number(temperature) : Number(temperature) + 273.15;
  const pressureBar = Number(pressure) * pressureToBar[pressureUnit];
  const calculatedCompound = compounds[submittedState.compoundIndex];
  const result = useMemo(() => calculateCompound(
    calculatedCompound,
    submittedState.temperatureKelvin,
    submittedState.pressureBar,
  ), [calculatedCompound, submittedState]);

  function chooseCompound(compound: Compound) {
    setSelectedIndex(compounds.indexOf(compound));
    setQuery(compound.name);
  }

  function changeTemperatureUnit(unit: TemperatureUnit) {
    if (unit === temperatureUnit) return;
    const currentKelvin = temperatureUnit === "K" ? Number(temperature) : Number(temperature) + 273.15;
    setTemperature(unit === "K" ? number(currentKelvin, 7) : number(currentKelvin - 273.15, 7));
    setTemperatureUnit(unit);
  }

  function changePressureUnit(unit: PressureUnit) {
    if (unit === pressureUnit) return;
    const currentBar = Number(pressure) * pressureToBar[pressureUnit];
    setPressure(number(currentBar / pressureToBar[unit], 7));
    setPressureUnit(unit);
  }

  const outputs = result ? [
    ["Tᵣ", "Reduced temperature", result.reducedTemperature, "—"],
    ["Pᵣ", "Reduced pressure", result.reducedPressure, "—"],
    ["Z", "Compressibility factor", result.compressibility, "—"],
    ["V̄", "Molar volume", result.molarVolume, "m³/kmol"],
    ["ρ", "Density", result.density, "kg/m³"],
    ["φ", "Fugacity coefficient", result.fugacityCoefficient, "—"],
    ["f", "Fugacity", result.fugacity, "bar"],
    ["Hᴿ", "Enthalpy departure", result.enthalpyDeparture, "kJ/mol"],
    ["Sᴿ", "Entropy departure", result.entropyDeparture, "J/(mol·K)"],
  ] as const : [];

  return (
    <section className="compound-tool">
      <div className="compound-symbols">
        {[
          ["Tᶜ, Pᶜ", "critical constants"], ["ω", "acentric factor"],
          ["Pˢᵃᵗ", "vapour pressure"], ["Z", "compressibility"],
          ["φ, f", "fugacity"], ["Hᴿ, Sᴿ", "departure functions"],
        ].map(([symbol, label]) => <article key={symbol}><strong>{symbol}</strong><span>{label}</span></article>)}
        <article className="compound-formation-symbol">
          <strong>ΔH°<sub>f,298</sub> · ΔG°<sub>f,298</sub></strong>
          <span>Enthalpy and Gibbs energy of formation at 298 K and 1 bar</span>
        </article>
      </div>

      <div className="compound-workspace">
        <div className="compound-input-card">
          <p className="compound-kicker">Select a fluid</p>
          <h2>State and compound</h2>
          <div className="compound-search-wrap">
            <label htmlFor="compound-search">Name or chemical formula</label>
            <input
              autoComplete="off"
              id="compound-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. carbon dioxide or CO2"
              value={query}
            />
            {suggestions.length > 0 && query !== selected.name && (
              <div className="compound-suggestions">
                {suggestions.map((compound) => (
                  <button key={`${compound.formula}-${compound.name}`} onClick={() => chooseCompound(compound)} type="button">
                    <span>{compound.name}</span><strong>{compound.formula}</strong>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="compound-state-inputs">
            <label><span>Temperature</span><div><input inputMode="decimal" onChange={(event) => setTemperature(event.target.value)} type="number" value={temperature} /><select aria-label="Temperature unit" onChange={(event) => changeTemperatureUnit(event.target.value as TemperatureUnit)} value={temperatureUnit}><option>K</option><option>°C</option></select></div></label>
            <label><span>Pressure</span><div><input inputMode="decimal" onChange={(event) => setPressure(event.target.value)} type="number" value={pressure} /><select aria-label="Pressure unit" onChange={(event) => changePressureUnit(event.target.value as PressureUnit)} value={pressureUnit}><option>bar</option><option>kPa</option><option>MPa</option><option>atm</option></select></div></label>
          </div>
          <button className="steam-calculate" onClick={() => setSubmittedState({ compoundIndex: selectedIndex, temperatureKelvin, pressureBar })} type="button">Calculate properties</button>
          <p className="compound-range">Lee–Kesler is intended for non-polar/simple fluids. The calculator uses the vapour root and flags states outside the source table range.</p>
        </div>

        <div className="compound-results">
          <div className="compound-result-heading"><div><p>{calculatedCompound.formula}</p><h2>{calculatedCompound.name}</h2></div><span>{number(submittedState.temperatureKelvin)} K · {number(submittedState.pressureBar)} bar</span></div>
          {result ? (
            <>
              <div className="compound-output-grid">
                {outputs.map(([symbol, label, value, unit]) => <article key={symbol}><p>{symbol}<span>{label}</span></p><strong>{number(value, 5)}</strong><small>{unit}</small></article>)}
                <article><p>Pˢᵃᵗ<span>vapour pressure</span></p><strong>{result.saturationPressure === null ? "—" : number(result.saturationPressure, 5)}</strong><small>{result.saturationPressure === null ? `valid ${calculatedCompound.antoineMin}–${calculatedCompound.antoineMax} K` : "bar"}</small></article>
              </div>
              {(result.reducedTemperature < 0.3 || result.reducedTemperature > 5 || result.reducedPressure < 0.01 || result.reducedPressure > 10) && <p className="compound-warning">This state lies beyond the printed Lee–Kesler table range (Tᵣ 0.3–5, Pᵣ 0.01–10), so treat the result as an extrapolation.</p>}
            </>
          ) : <p className="compound-warning">Enter a positive absolute temperature and pressure within a sensible fluid range.</p>}
        </div>
      </div>

      <div className="compound-source-note">
        <p><strong>Method.</strong> Critical constants and Antoine coefficients come from Koretsky Appendix A. Lee–Kesler values are evaluated continuously from the simple- and reference-fluid equations; departure properties are obtained by numerical thermodynamic integration.</p>
        <div><Link href="/tools/compound-properties/lee-kesler-reference">Clear Lee–Kesler guide →</Link><a download href="/documents/koretsky-physical-properties.pdf">Appendix A PDF ↓</a></div>
      </div>

      <details className="compound-equations">
        <summary><span>Lee–Kesler equations at a glance</span><small>Show equations</small></summary>
        <div className="compound-equation-grid">
          <article><p>Reduced state</p><strong>Tᵣ = T / Tᶜ</strong><strong>Pᵣ = P / Pᶜ</strong></article>
          <article className="compound-equation-wide"><p>Lee–Kesler equation of state</p><strong>Pᵣ = (Tᵣ/Vᵣ) [1 + B/Vᵣ + C/Vᵣ² + D/Vᵣ⁵ + c₄(Tᵣ⁻³Vᵣ⁻²)(β + γ/Vᵣ²) exp(−γ/Vᵣ²)]</strong><span>B = b₁ − b₂/Tᵣ − b₃/Tᵣ² − b₄/Tᵣ³ · C = c₁ − c₂/Tᵣ + c₃/Tᵣ³ · D = d₁ + d₂/Tᵣ</span></article>
          <article><p>Acentric correction</p><strong>Z = Z⁽⁰⁾ + (ω/ωʳ)(Z⁽ʳ⁾ − Z⁽⁰⁾)</strong><span>ωʳ = 0.3978</span></article>
          <article><p>Fugacity</p><strong>ln φ = ∫₀ᴾ (Z − 1)dP/P</strong><strong>f = φP</strong></article>
          <article className="compound-equation-wide"><p>Departure properties</p><strong>Hᴿ/RT = −T ∫₀ᴾ (∂Z/∂T)ₚ dP/P</strong><strong>Sᴿ/R = Hᴿ/RT − ln φ</strong></article>
        </div>
        <p className="compound-equation-caption">Superscript (0) denotes the simple fluid and (r) the Lee–Kesler reference fluid. The calculator solves both continuously and applies the compound’s acentric factor.</p>
      </details>

      <section className="compound-catalogue">
        <div className="compound-catalogue-heading"><div><p>Source catalogue</p><h2>All physical-property values</h2></div><input aria-label="Filter compound catalogue" onChange={(event) => setCatalogueQuery(event.target.value)} placeholder="Filter by name or formula" value={catalogueQuery} /></div>
        <div className="compound-table-wrap"><table><thead><tr><th>Compound</th><th>Formula</th><th>MW<br /><small>g/mol</small></th><th>Tᶜ<br /><small>K</small></th><th>Pᶜ<br /><small>bar</small></th><th>ω</th><th>A</th><th>B</th><th>C</th><th>Antoine range<br /><small>K</small></th></tr></thead><tbody>
          {catalogue.map((compound) => <tr key={`${compound.formula}-${compound.name}`}><td><button onClick={() => { chooseCompound(compound); window.scrollTo({ top: 0, behavior: "smooth" }); }} type="button">{compound.name}</button></td><td>{compound.formula}</td><td>{compound.molecularWeight}</td><td>{compound.criticalTemperature}</td><td>{compound.criticalPressure}</td><td>{compound.acentricFactor}</td><td>{compound.antoineA}</td><td>{compound.antoineB}</td><td>{compound.antoineC}</td><td>{compound.antoineMin}–{compound.antoineMax}</td></tr>)}
        </tbody></table></div>
        <p className="compound-table-note">Antoine form: ln(Pˢᵃᵗ [bar]) = A − B/(T [K] + C). Values retain the precision printed in Koretsky.</p>
      </section>
    </section>
  );
}
