"use client";

import { useState } from "react";
import { scwgSolidsBudget } from "@/lib/scwg-feedstock";
import { scwgUi } from "@/lib/scwg-meta";

// Interactive solids budget for B1 — the binding constraint on the whole design.
//
// Move douzha / straw / red mud / dilution water and watch the ~22 wt% ceiling
// bind. The arithmetic is the report's: douzha carries 17.2 wt% solids as
// received, so it consumes most of the window before anything else is added,
// and red mud is inorganic dead weight that buys no carbon.

const DOUZHA_SOLIDS_FRACTION = 0.172;
const CEILING = 22;
const FLOOR = 18;

export function ScwgSolidsBudget() {
  const [douzha, setDouzha] = useState(100);
  const [straw, setStraw] = useState(0);
  const [redMud, setRedMud] = useState(5);
  const [water, setWater] = useState(0);

  const douzhaSolids = douzha * DOUZHA_SOLIDS_FRACTION;
  const solids = douzhaSolids + straw + redMud;
  const total = douzha + straw + redMud + water;
  const wt = total > 0 ? (solids / total) * 100 : 0;

  const overCeiling = wt > CEILING;
  const belowFloor = wt < FLOOR;
  // Carbon-bearing solids only: red mud contributes none.
  const carbonSolids = douzhaSolids + straw;
  const carbonShare = solids > 0 ? (carbonSolids / solids) * 100 : 0;

  const sliders = [
    { id: "douzha", label: "Douzha (as received)", value: douzha, set: setDouzha, max: 150, unit: "kg" },
    { id: "straw", label: "Soybean straw (dry)", value: straw, set: setStraw, max: 20, unit: "kg" },
    { id: "redmud", label: "Red mud (dry)", value: redMud, set: setRedMud, max: 20, unit: "kg" },
    { id: "water", label: "Dilution water", value: water, set: setWater, max: 60, unit: "kg" },
  ];

  return (
    <div className="rounded-[1.25rem] border border-ink/10 bg-paper/60 p-4 sm:p-5">
      <p className="eyebrow mb-1">{scwgUi.feedstock.widgetLabel}</p>
      <p className="text-xs leading-5 text-ink/55">{scwgUi.feedstock.widgetHelp}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="space-y-3">
          {sliders.map((slider) => (
            <div key={slider.id}>
              <label className="flex items-baseline justify-between gap-3 text-sm" htmlFor={`scwg-slider-${slider.id}`}>
                <span className="text-ink/70">{slider.label}</span>
                <span className="font-mono tabular-nums text-ink/85">
                  {slider.value} {slider.unit}
                </span>
              </label>
              <input
                className="mt-1 w-full accent-[rgb(var(--color-moss))]"
                id={`scwg-slider-${slider.id}`}
                max={slider.max}
                min={0}
                onChange={(event) => slider.set(Number(event.target.value))}
                step={1}
                type="range"
                value={slider.value}
              />
            </div>
          ))}
        </div>

        <div
          aria-live="polite"
          className={`rounded-[1rem] border p-4 ${
            overCeiling ? "border-clay/50 bg-clay/10" : belowFloor ? "border-ink/15 bg-ink/5" : "border-moss/40 bg-moss/10"
          }`}
        >
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink/50">Total solids</p>
          <p className={`mt-1 font-mono text-3xl tabular-nums ${overCeiling ? "text-clay" : "text-ink/85"}`}>
            {wt.toFixed(1)}
            <span className="ml-1 text-base">wt%</span>
          </p>
          <p className="mt-1 text-xs leading-5 text-ink/60">
            {overCeiling
              ? scwgUi.feedstock.widgetOverCeiling
              : belowFloor
                ? scwgUi.feedstock.widgetBelowFloor
                : scwgUi.feedstock.widgetInWindow}
          </p>

          <dl className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-xs">
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-ink/55">Solids</dt>
              <dd className="font-mono tabular-nums text-ink/75">{solids.toFixed(1)} kg</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-ink/55">Total mass</dt>
              <dd className="font-mono tabular-nums text-ink/75">{total.toFixed(0)} kg</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-ink/55">Carbon-bearing share</dt>
              <dd className="font-mono tabular-nums text-ink/75">{carbonShare.toFixed(0)}%</dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="mt-4 text-xs leading-6 text-ink/55">{scwgSolidsBudget.fourWayTrade}</p>
    </div>
  );
}
