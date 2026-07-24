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

function inputStep(amount: number) {
  return amount < 1 ? 0.01 : amount < 10 ? 0.1 : 1;
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

  const updateFromIngredient = (baseAmount: number, nextValue: number) => {
    if (!Number.isFinite(nextValue) || baseAmount <= 0) return;
    setTargetValue(Math.max(step, Math.min(max, Number((baseValue * nextValue / baseAmount).toFixed(2)))));
  };

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
                const baseAmount = item.amount;

                if (baseAmount === undefined) {
                  return (
                    <li key={`${group.title}-${item.ingredient}`}>
                      <span>{item.fixedAmount ?? "as needed"}</span>
                      {item.ingredient}
                    </li>
                  );
                }

                const quantity = baseAmount * multiplier;

                return (
                  <li key={`${group.title}-${item.ingredient}`}>
                    <label className="viennoiserie-scaled-amount">
                      <input
                        aria-label={`${item.ingredient} amount`}
                        inputMode="decimal"
                        min={0}
                        step={inputStep(baseAmount)}
                        type="number"
                        value={Number(quantity.toFixed(2))}
                        onChange={(event) => updateFromIngredient(baseAmount, Number(event.target.value))}
                      />
                      {item.unit ? <span>{item.unit}</span> : null}
                    </label>
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
