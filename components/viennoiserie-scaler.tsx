"use client";

import { useMemo, useState } from "react";

export type ViennoiserieScaleItem = {
  amount?: number;
  unit?: string;
  ingredient: string;
  fixedAmount?: string;
};

export type ViennoiserieScaleGroup = {
  title: string;
  items: readonly ViennoiserieScaleItem[];
};

type ViennoiserieScalerProps = {
  id: string;
  baseValue: number;
  inputLabel: string;
  inputUnit: string;
  groups: readonly ViennoiserieScaleGroup[];
  note?: string;
  step?: number;
  max?: number;
};

function formatAmount(amount: number) {
  const absoluteAmount = Math.abs(amount);
  const maximumFractionDigits = absoluteAmount < 1 ? 2 : absoluteAmount < 10 ? 1 : 0;

  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function ViennoiserieScaler({
  id,
  baseValue,
  inputLabel,
  inputUnit,
  groups,
  note,
  step = 1,
  max = 10000,
}: ViennoiserieScalerProps) {
  const [targetValue, setTargetValue] = useState(baseValue);
  const multiplier = useMemo(() => targetValue / baseValue, [baseValue, targetValue]);
  const titleId = `${id}-scaler-title`;

  return (
    <section className="viennoiserie-scaler" aria-labelledby={titleId}>
      <div className="viennoiserie-scaler-heading">
        <div>
          <p className="eyebrow">Recipe scaler</p>
          <h3 id={titleId}>Scale this formula</h3>
        </div>
        <div className="viennoiserie-scale-controls">
          <label>
            {inputLabel}
            <span className="viennoiserie-scale-input">
              <input
                aria-label={`${inputLabel} in ${inputUnit}`}
                inputMode="decimal"
                min={step}
                max={max}
                step={step}
                type="number"
                value={targetValue}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  setTargetValue(Math.max(step, Math.min(max, Number.isFinite(nextValue) ? nextValue : baseValue)));
                }}
              />
              <span>{inputUnit}</span>
            </span>
          </label>
          <div className="viennoiserie-scale-presets" aria-label="Batch scale presets">
            {[0.5, 1, 1.5, 2].map((preset) => (
              <button
                className={Math.abs(multiplier - preset) < 0.001 ? "is-active" : ""}
                key={preset}
                type="button"
                onClick={() => setTargetValue(Number((baseValue * preset).toFixed(2)))}
              >
                {preset}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {note ? <p className="viennoiserie-scaler-note">{note}</p> : null}

      <div className="viennoiserie-scaled-groups">
        {groups.map((group) => (
          <div key={group.title}>
            <h4>{group.title}</h4>
            <ul>
              {group.items.map((item) => {
                const quantity = item.amount === undefined
                  ? item.fixedAmount ?? "as needed"
                  : `${formatAmount(item.amount * multiplier)}${item.unit ? ` ${item.unit}` : ""}`;

                return (
                  <li key={`${group.title}-${item.ingredient}`}>
                    <span>{quantity}</span>
                    {item.ingredient}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
