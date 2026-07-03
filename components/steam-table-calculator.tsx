"use client";

import { useState } from "react";
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
type TemperatureUnit = "°C" | "K";
type PressureUnit = "MPa" | "bar" | "atm" | "kPa" | "Pa";
const temperatureUnits: TemperatureUnit[] = ["°C", "K"];
const pressureUnits: PressureUnit[] = ["MPa", "bar", "atm", "kPa", "Pa"];
const pressureToMpa: Record<PressureUnit, number> = {
  MPa: 1,
  bar: 0.1,
  atm: 0.101325,
  kPa: 0.001,
  Pa: 0.000001,
};
const defaults: Record<WaterRegion, { first: PropertyKey; firstValue: string; second: PropertyKey; secondValue: string }> = {
  superheated: { first: "p", firstValue: "1", second: "t", secondValue: "300" },
  subcooled: { first: "p", firstValue: "10", second: "t", secondValue: "100" },
};

function toBaseValue(key: PropertyKey, value: number, temperatureUnit: TemperatureUnit, pressureUnit: PressureUnit) {
  if (key === "p") return value * pressureToMpa[pressureUnit];
  if (key === "t") return temperatureUnit === "K" ? value - 273.15 : value;
  return value;
}

function fromBaseValue(key: PropertyKey, value: number, temperatureUnit: TemperatureUnit, pressureUnit: PressureUnit) {
  if (key === "p") return value / pressureToMpa[pressureUnit];
  if (key === "t") return temperatureUnit === "K" ? value + 273.15 : value;
  return value;
}

function inputNumber(value: number, key: PropertyKey, pressureUnit: PressureUnit) {
  if (key === "p" && pressureUnit === "Pa") return value.toFixed(0);
  if (key === "p" && pressureUnit === "kPa") return Number(value.toFixed(3)).toString();
  return Number(value.toFixed(6)).toString();
}

function PropertyInput({
  label,
  property,
  value,
  excluded,
  onPropertyChange,
  onValueChange,
  unit,
}: {
  label: string;
  property: PropertyKey;
  value: string;
  excluded: PropertyKey;
  onPropertyChange: (property: PropertyKey) => void;
  onValueChange: (value: string) => void;
  unit: string;
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
        <span>{unit}</span>
        <input inputMode="decimal" onChange={(event) => onValueChange(event.target.value)} step="any" type="number" value={value} />
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
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("°C");
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>("MPa");

  function unitFor(key: PropertyKey) {
    if (key === "p") return pressureUnit;
    if (key === "t") return temperatureUnit;
    return propertyDetails[key].unit;
  }

  function displayValue(key: PropertyKey, value: number) {
    const converted = fromBaseValue(key, value, temperatureUnit, pressureUnit);
    if (key === "p") {
      if (pressureUnit === "Pa") return converted.toFixed(0);
      if (pressureUnit === "kPa") return converted.toFixed(1);
      return converted < 0.1 ? converted.toFixed(4) : converted.toFixed(3);
    }
    if (key === "t") return converted.toFixed(2);
    return formatProperty(key, converted);
  }

  const rangeNote = (() => {
    const enteredPressure = firstProperty === "p" ? Number(firstValue) : secondProperty === "p" ? Number(secondValue) : null;
    const pressure = enteredPressure === null ? null : toBaseValue("p", enteredPressure, temperatureUnit, pressureUnit);
    const pressureLimits = pressureRange(region);
    if (pressure !== null && Number.isFinite(pressure)) {
      const temperatures = temperatureRange(region, pressure);
      if (temperatures) {
        const minimum = fromBaseValue("t", temperatures.min, temperatureUnit, pressureUnit);
        const maximum = fromBaseValue("t", temperatures.max, temperatureUnit, pressureUnit);
        return `${enteredPressure} ${pressureUnit}: ${minimum.toFixed(2)}–${maximum.toFixed(0)} ${temperatureUnit} available`;
      }
    }
    return `${displayValue("p", pressureLimits.min)}–${displayValue("p", pressureLimits.max)} ${pressureUnit} available`;
  })();

  function changeTemperatureUnit(nextUnit: TemperatureUnit) {
    if (nextUnit === temperatureUnit) return;
    if (firstProperty === "t" && firstValue !== "") {
      const base = toBaseValue("t", Number(firstValue), temperatureUnit, pressureUnit);
      setFirstValue(inputNumber(fromBaseValue("t", base, nextUnit, pressureUnit), "t", pressureUnit));
    }
    if (secondProperty === "t" && secondValue !== "") {
      const base = toBaseValue("t", Number(secondValue), temperatureUnit, pressureUnit);
      setSecondValue(inputNumber(fromBaseValue("t", base, nextUnit, pressureUnit), "t", pressureUnit));
    }
    setTemperatureUnit(nextUnit);
  }

  function changePressureUnit(nextUnit: PressureUnit) {
    if (nextUnit === pressureUnit) return;
    if (firstProperty === "p" && firstValue !== "") {
      const base = toBaseValue("p", Number(firstValue), temperatureUnit, pressureUnit);
      setFirstValue(inputNumber(fromBaseValue("p", base, temperatureUnit, nextUnit), "p", nextUnit));
    }
    if (secondProperty === "p" && secondValue !== "") {
      const base = toBaseValue("p", Number(secondValue), temperatureUnit, pressureUnit);
      setSecondValue(inputNumber(fromBaseValue("p", base, temperatureUnit, nextUnit), "p", nextUnit));
    }
    setPressureUnit(nextUnit);
  }

  function changeRegion(nextRegion: WaterRegion) {
    const nextDefaults = defaults[nextRegion];
    setRegion(nextRegion);
    setFirstProperty(nextDefaults.first);
    setFirstValue(inputNumber(fromBaseValue(nextDefaults.first, Number(nextDefaults.firstValue), temperatureUnit, pressureUnit), nextDefaults.first, pressureUnit));
    setSecondProperty(nextDefaults.second);
    setSecondValue(inputNumber(fromBaseValue(nextDefaults.second, Number(nextDefaults.secondValue), temperatureUnit, pressureUnit), nextDefaults.second, pressureUnit));
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
      { key: firstProperty, value: toBaseValue(firstProperty, Number(firstValue), temperatureUnit, pressureUnit) },
      { key: secondProperty, value: toBaseValue(secondProperty, Number(secondValue), temperatureUnit, pressureUnit) },
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
            <small>{unitFor(key)}</small>
          </article>
        ))}
      </div>

      <div className="steam-unit-switches" aria-label="Display units">
        <div>
          <span>Temperature</span>
          <div className="steam-unit-scroller">
            {temperatureUnits.map((unit) => (
              <button aria-pressed={temperatureUnit === unit} className={temperatureUnit === unit ? "is-active" : ""} key={unit} onClick={() => changeTemperatureUnit(unit)} type="button">{unit}</button>
            ))}
          </div>
        </div>
        <div>
          <span>Pressure</span>
          <div className="steam-unit-scroller">
            {pressureUnits.map((unit) => (
              <button aria-pressed={pressureUnit === unit} className={pressureUnit === unit ? "is-active" : ""} key={unit} onClick={() => changePressureUnit(unit)} type="button">{unit}</button>
            ))}
          </div>
        </div>
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
            unit={unitFor(firstProperty)}
            value={firstValue}
          />
          <PropertyInput
            excluded={firstProperty}
            label="Property two"
            onPropertyChange={setSecondProperty}
            onValueChange={setSecondValue}
            property={secondProperty}
            unit={unitFor(secondProperty)}
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
            <span>Selected units</span>
          </div>
          <div className="steam-result-grid">
            {propertyKeys.map((key) => (
              <article className={key === firstProperty || key === secondProperty ? "is-input" : ""} key={key}>
                <p>{propertyDetails[key].symbol}</p>
                <strong>{state ? displayValue(key, state[key]) : "—"}</strong>
                <small>{unitFor(key)}</small>
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
