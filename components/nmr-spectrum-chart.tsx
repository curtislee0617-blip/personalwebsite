"use client";

import { useState, type PointerEvent } from "react";
import type { NmrPoint } from "@/lib/nmr-spectrum";

type NmrSpectrumChartProps = { points: NmrPoint[]; xMinimum: number; xMaximum: number; axis: "ppm" | "hz" };
const width = 960;
const height = 430;
const margin = { left: 58, right: 22, top: 28, bottom: 58 };

export function NmrSpectrumChart({ points, xMinimum, xMaximum, axis }: NmrSpectrumChartProps) {
  const [hover, setHover] = useState<NmrPoint | null>(null);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const low = Math.min(xMinimum, xMaximum);
  const high = Math.max(xMinimum, xMaximum);
  const span = Math.max(1e-9, high - low);
  const visible = points.filter((point) => point.shift >= low && point.shift <= high);
  const step = Math.max(1, Math.ceil(visible.length / 6000));
  const sampled = visible.filter((_, index) => index % step === 0 || index === visible.length - 1);
  const toX = (value: number) => margin.left + (high - value) / span * innerWidth;
  const toY = (value: number) => margin.top + (1.08 - value) / 2.16 * innerHeight;
  const path = sampled.map((point, index) => `${index ? "L" : "M"}${toX(point.shift).toFixed(2)},${toY(point.intensity).toFixed(2)}`).join(" ");
  const ticks = Array.from({ length: 9 }, (_, index) => high - span * index / 8);

  function inspect(event: PointerEvent<SVGSVGElement>) {
    if (!points.length || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const svgX = (event.clientX - bounds.left) / bounds.width * width;
    if (svgX < margin.left || svgX > width - margin.right) return setHover(null);
    const target = high - (svgX - margin.left) / innerWidth * span;
    let nearest = visible[0];
    for (const point of visible) if (Math.abs(point.shift - target) < Math.abs(nearest.shift - target)) nearest = point;
    setHover(nearest);
  }

  return <div className="nmr-chart">
    <svg aria-label="Processed one-dimensional NMR spectrum" onPointerLeave={() => setHover(null)} onPointerMove={inspect} role="img" viewBox={`0 0 ${width} ${height}`}>
      {[-1, -0.5, 0, 0.5, 1].map((tick) => <g key={tick}><line className="nmr-gridline" x1={margin.left} x2={width - margin.right} y1={toY(tick)} y2={toY(tick)} /><text className="nmr-tick" textAnchor="end" x={margin.left - 8} y={toY(tick) + 4}>{tick.toFixed(1)}</text></g>)}
      {ticks.map((tick) => <g key={tick}><line className="nmr-gridline" x1={toX(tick)} x2={toX(tick)} y1={margin.top} y2={height - margin.bottom} /><text className="nmr-tick" textAnchor="middle" x={toX(tick)} y={height - margin.bottom + 22}>{tick.toFixed(axis === "ppm" ? 2 : 0)}</text></g>)}
      <line className="nmr-axis" x1={margin.left} x2={width - margin.right} y1={toY(0)} y2={toY(0)} />
      <path className="nmr-spectrum-line" d={path} />
      <text className="nmr-axis-title" textAnchor="middle" x={margin.left + innerWidth / 2} y={height - 13}>{axis === "ppm" ? "Chemical shift (ppm)" : "Frequency offset (Hz)"}</text>
      {hover && <g className="nmr-hover"><line x1={toX(hover.shift)} x2={toX(hover.shift)} y1={margin.top} y2={height - margin.bottom} /><circle cx={toX(hover.shift)} cy={toY(hover.intensity)} r="4" /></g>}
    </svg>
    {hover && <div className="nmr-tooltip" style={{ left: `${Math.min(90, Math.max(10, toX(hover.shift) / width * 100))}%` }}><strong>{hover.shift.toFixed(axis === "ppm" ? 4 : 1)} {axis}</strong><span>Intensity {hover.intensity.toFixed(4)}</span></div>}
    {!points.length && <div className="nmr-chart-empty">Select a Spinsolve <strong>data.1d</strong> file to process the FID.</div>}
  </div>;
}
