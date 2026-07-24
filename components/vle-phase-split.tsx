"use client";

import type { DiagramType } from "@/lib/vle";
import type { VlePhaseSplit } from "@/lib/vle-split";

type VlePhaseSplitPanelProps = {
  type: DiagramType;
  split: VlePhaseSplit | null;
  z: number;
  level: number;
  levelRange: { min: number; max: number };
  firstLabel: string;
  secondLabel: string;
  onChangeZ: (value: number) => void;
  onChangeLevel: (value: number) => void;
};

// Component 1 reads as moss, component 2 as clay; a phase's fill is the mix at
// its own composition, so a liquid rich in component 1 looks green and a
// component-2-rich vapour looks warm.
function mixColor(fractionOfFirst: number) {
  const clamped = Math.min(1, Math.max(0, fractionOfFirst));
  const first = [82, 107, 70];
  const second = [199, 124, 84];
  const channels = first.map((value, index) => Math.round(value * clamped + second[index] * (1 - clamped)));
  return `rgb(${channels.join(" ")})`;
}

function formatLevel(type: DiagramType, value: number) {
  return type === "txy" ? `${(value - 273.15).toFixed(1)} °C` : `${value.toFixed(3)} bar`;
}

function Bars({ title, labels, values, colors }: { title: string; labels: string[]; values: number[]; colors: string[] }) {
  return (
    <div className="vle-split-bars">
      <p>{title}</p>
      <div className="vle-split-bar-grid">
        {values.map((value, index) => (
          <div className="vle-split-bar" key={labels[index]}>
            <span className="vle-split-bar-track"><span style={{ background: colors[index], height: `${Math.min(100, Math.max(0, value * 100))}%` }} /></span>
            <strong>{value.toFixed(3)}</strong>
            <small>{labels[index]}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VlePhaseSplitPanel({ type, split, z, level, levelRange, firstLabel, secondLabel, onChangeZ, onChangeLevel, }: VlePhaseSplitPanelProps) {
  const phase = split?.phase ?? "two-phase";
  const beta = split?.beta ?? 0;
  const liquidFraction = phase === "vapour" ? 0 : phase === "two-phase" ? 1 - beta : 1;
  const vapourFraction = phase === "liquid" ? 0 : phase === "two-phase" ? beta : 1;
  const xFirst = phase === "vapour" ? z : split?.xStar ?? z;
  const yFirst = phase === "liquid" ? z : split?.yStar ?? z;

  const vesselTop = 16;
  const vesselHeight = 208;
  const liquidHeight = vesselHeight * liquidFraction;
  const vapourHeight = vesselHeight * vapourFraction;
  const liquidY = vesselTop + (vesselHeight - liquidHeight);

  const phaseLabel = phase === "two-phase" ? "Two phases" : phase === "liquid" ? "Subcooled liquid" : "Superheated vapour";
  const step = type === "txy" ? 0.1 : (levelRange.max - levelRange.min) / 400;

  return (
    <section className="vle-split">
      <header>
        <div><p>Lever rule · phase amounts</p><h2>Flash at a chosen state</h2></div>
        <span className={`vle-split-phase is-${phase}`}>{phaseLabel}</span>
      </header>

      <div className="vle-split-controls">
        <label>
          <span>Overall composition z₁ <output>{z.toFixed(3)}</output></span>
          <input max={1} min={0} onChange={(event) => onChangeZ(Number(event.target.value))} step={0.005} type="range" value={z} />
        </label>
        <label>
          <span>{type === "txy" ? "System temperature" : "System pressure"} <output>{formatLevel(type, level)}</output></span>
          <input max={levelRange.max} min={levelRange.min} onChange={(event) => onChangeLevel(Number(event.target.value))} step={step} type="range" value={level} />
        </label>
      </div>

      <div className="vle-split-body">
        <div className="vle-split-vessel">
          <svg viewBox="0 0 150 240" role="img" aria-label="Phase split vessel">
            <rect className="vle-vessel-frame" x="34" y="12" width="82" height="216" rx="14" />
            {vapourFraction > 0 && <rect x="36" y={vesselTop} width="78" height={Math.max(0, vapourHeight)} rx="10" fill={mixColor(yFirst)} opacity="0.62" />}
            {liquidFraction > 0 && <rect x="36" y={liquidY} width="78" height={Math.max(0, liquidHeight)} rx="10" fill={mixColor(xFirst)} opacity="0.92" />}
            {phase === "two-phase" && <line className="vle-vessel-separator" x1="36" x2="114" y1={liquidY} y2={liquidY} />}
            {vapourFraction > 0 && <text className="vle-vessel-tag" x="75" y={vesselTop + 14} textAnchor="middle">V {(vapourFraction * 100).toFixed(0)}%</text>}
            {liquidFraction > 0 && <text className="vle-vessel-tag" x="75" y={vesselTop + vesselHeight - 8} textAnchor="middle">L {(liquidFraction * 100).toFixed(0)}%</text>}
          </svg>
        </div>

        <div className="vle-split-readout">
          <Bars title="Liquid" labels={[`x·${firstLabel}`, `x·${secondLabel}`, "L amount"]} values={[xFirst, 1 - xFirst, liquidFraction]} colors={[mixColor(1), mixColor(0), "rgb(var(--color-ink) / 0.32)"]} />
          <Bars title="Vapour" labels={[`y·${firstLabel}`, `y·${secondLabel}`, "V amount"]} values={[yFirst, 1 - yFirst, vapourFraction]} colors={[mixColor(1), mixColor(0), "rgb(var(--color-ink) / 0.32)"]} />
        </div>
      </div>

      <dl className="vle-split-facts">
        <div><dt>Bubble {type === "txy" ? "T" : "P"}</dt><dd>{split?.bubbleLevel != null ? formatLevel(type, split.bubbleLevel) : "—"}</dd></div>
        <div><dt>Dew {type === "txy" ? "T" : "P"}</dt><dd>{split?.dewLevel != null ? formatLevel(type, split.dewLevel) : "—"}</dd></div>
        <div><dt>x₁ (liquid)</dt><dd>{phase === "vapour" ? "—" : xFirst.toFixed(4)}</dd></div>
        <div><dt>y₁ (vapour)</dt><dd>{phase === "liquid" ? "—" : yFirst.toFixed(4)}</dd></div>
        <div><dt>Vapour fraction β</dt><dd>{phase === "two-phase" ? beta.toFixed(4) : phase === "vapour" ? "1.0000" : "0.0000"}</dd></div>
      </dl>
    </section>
  );
}
