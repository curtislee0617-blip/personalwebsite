"use client";

import { useMemo, useState } from "react";
import {
  formatProperty,
  pressureRange,
  propertyDetails,
  solveState,
  temperatureRange,
  type PropertyKey,
  type WaterRegion,
  type WaterState,
} from "@/lib/steam-tables";

const propertyKeys = Object.keys(propertyDetails) as PropertyKey[];
const defaults: Record<WaterRegion, { first: PropertyKey; firstValue: string; second: PropertyKey; secondValue: string }> = {
  superheated: { first: "p", firstValue: "1", second: "t", secondValue: "300" },
  subcooled: { first: "p", firstValue: "10", second: "t", secondValue: "100" },
};

function PropertyInput({
  label,
  property,
  value,
  excluded,
  onPropertyChange,
  onValueChange,
}: {
  label: string;
  property: PropertyKey;
  value: string;
  excluded: PropertyKey;
  onPropertyChange: (property: PropertyKey) => void;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="steam-input-group">
      <label>
        <span>{label}</span>
        <select onChange={(event) => onPropertyChange(event.target.value as PropertyKey)} value={property}>
          {propertyKeys.map((key) => (
            <option disabled={key === excluded} key={key} value={key}>
              {propertyDetails[key].symbol} — {propertyDetails[key].name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{propertyDetails[property].unit}</span>
        <input inputMode="decimal" onChange={(event) => onValueChange(event.target.value)} type="number" value={value} />
      </label>
    </div>
  );
}

export function SteamTableCalculator() {
  const [region, setRegion] = useState<WaterRegion>("superheated");
  const [firstProperty, setFirstProperty] = useState<PropertyKey>(defaults.superheated.first);
  const [secondProperty, setSecondProperty] = useState<PropertyKey>(defaults.superheated.second);
  const [firstValue, setFirstValue] = useState(defaults.superheated.firstValue);
  const [secondValue, setSecondValue] = useState(defaults.superheated.secondValue);
  const [state, setState] = useState<WaterState | null>(() => solveState(
    "superheated",
    { key: "p", value: 1 },
    { key: "t", value: 300 },
  ).state);
  const [message, setMessage] = useState("");
  const [approximate, setApproximate] = useState(false);

  const rangeNote = useMemo(() => {
    const pressure = firstProperty === "p" ? Number(firstValue) : secondProperty === "p" ? Number(secondValue) : null;
    const pressureLimits = pressureRange(region);
    if (pressure !== null && Number.isFinite(pressure)) {
      const temperatures = temperatureRange(region, pressure);
      if (temperatures) return `${pressure} MPa: ${temperatures.min.toFixed(2)}–${temperatures.max.toFixed(0)} °C available`;
    }
    return `${pressureLimits.min}–${pressureLimits.max} MPa available`;
  }, [firstProperty, firstValue, region, secondProperty, secondValue]);

  function changeRegion(nextRegion: WaterRegion) {
    const nextDefaults = defaults[nextRegion];
    setRegion(nextRegion);
    setFirstProperty(nextDefaults.first);
    setFirstValue(nextDefaults.firstValue);
    setSecondProperty(nextDefaults.second);
    setSecondValue(nextDefaults.secondValue);
    const result = solveState(
      nextRegion,
      { key: nextDefaults.first, value: Number(nextDefaults.firstValue) },
      { key: nextDefaults.second, value: Number(nextDefaults.secondValue) },
    );
    setState(result.state);
    setMessage("");
    setApproximate(false);
  }

  function calculate() {
    const result = solveState(
      region,
      { key: firstProperty, value: Number(firstValue) },
      { key: secondProperty, value: Number(secondValue) },
    );
    setState(result.state);
    setMessage(result.error ?? "");
    setApproximate(Boolean(result.approximate));
  }

  return (
    <section className="steam-tool" aria-label="Koretsky water property calculator">
      <div className="steam-symbols" aria-label="Property symbols">
        {propertyKeys.map((key) => (
          <article key={key}>
            <strong>{propertyDetails[key].symbol}</strong>
            <span>{propertyDetails[key].name}</span>
            <small>{propertyDetails[key].unit}</small>
          </article>
        ))}
      </div>

      <div className="steam-region-switch" aria-label="Select water region">
        <button className={region === "superheated" ? "is-active" : ""} onClick={() => changeRegion("superheated")} type="button">
          <span>Superheated</span>
          <small>Water vapour · Table B.4</small>
        </button>
        <button className={region === "subcooled" ? "is-active" : ""} onClick={() => changeRegion("subcooled")} type="button">
          <span>Subcooled</span>
          <small>Liquid water · Table B.5</small>
        </button>
      </div>

      <div className="steam-workspace">
        <div className="steam-input-card">
          <div className="steam-card-heading">
            <div>
              <p>Define the state</p>
              <h2>Enter two properties</h2>
            </div>
            <span>{rangeNote}</span>
          </div>

          <PropertyInput
            excluded={secondProperty}
            label="Property one"
            onPropertyChange={setFirstProperty}
            onValueChange={setFirstValue}
            property={firstProperty}
            value={firstValue}
          />
          <PropertyInput
            excluded={firstProperty}
            label="Property two"
            onPropertyChange={setSecondProperty}
            onValueChange={setSecondValue}
            property={secondProperty}
            value={secondValue}
          />

          <button className="steam-calculate" onClick={calculate} type="button">Calculate state →</button>
          {message ? <p className="steam-error" role="alert">{message}</p> : null}
          {!message && approximate ? <p className="steam-notice">Numerical inverse match; displayed values are interpolated estimates.</p> : null}
        </div>

        <div className="steam-results" aria-live="polite">
          <div className="steam-card-heading">
            <div>
              <p>Calculated state</p>
              <h2>{region === "superheated" ? "Superheated water vapour" : "Subcooled liquid water"}</h2>
            </div>
            <span>SI units</span>
          </div>
          <div className="steam-result-grid">
            {propertyKeys.map((key) => (
              <article className={key === firstProperty || key === secondProperty ? "is-input" : ""} key={key}>
                <p>{propertyDetails[key].symbol}</p>
                <strong>{state ? formatProperty(key, state[key]) : "—"}</strong>
                <small>{propertyDetails[key].unit}</small>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="steam-method-note">
        <p><strong>Method.</strong> Forward values use linear interpolation in temperature and pressure between the surrounding Koretsky entries. Other property pairs are solved numerically on the same continuous interpolated surface. Do not use this tool for saturated liquid-vapour mixtures.</p>
        <p><strong>Reference.</strong> Milo D. Koretsky, <em>Engineering and Chemical Thermodynamics</em>, Appendix B, Tables B.4 and B.5. The clear 7 MPa, 450 °C internal-energy printing error is corrected to 2977.9 kJ/kg using ĥ = û + Pv̂.</p>
      </div>
    </section>
  );
}

