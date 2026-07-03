"use client";

import { useState, type PointerEvent } from "react";
import type { NmrPoint } from "@/lib/nmr-spectrum";

export type NmrInteractionMode = "inspect" | "zoom" | "integrate" | "solvent" | "coupling";
export type NmrRegion = { id: string; low: number; high: number };

type NmrSpectrumChartProps = {
  points: NmrPoint[];
  xMinimum: number;
  xMaximum: number;
  axis: "ppm" | "hz";
  mode: NmrInteractionMode;
  regions: NmrRegion[];
  couplingPoints: number[];
  solventPeak?: number;
  onRangeSelect: (low: number, high: number) => void;
  onPeakSelect: (shift: number) => void;
};

const width = 960;
const height = 430;
const margin = { left: 58, right: 22, top: 28, bottom: 58 };

export function NmrSpectrumChart({ points, xMinimum, xMaximum, axis, mode, regions, couplingPoints, solventPeak, onRangeSelect, onPeakSelect }: NmrSpectrumChartProps) {
  const [hover, setHover] = useState<NmrPoint | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = useState<number | null>(null);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const low = Math.min(xMinimum, xMaximum);
  const high = Math.max(xMinimum, xMaximum);
  const span = Math.max(1e-9, high - low);
  const visible = points.filter((point) => point.shift >= low && point.shift <= high);
  const step = Math.max(1, Math.ceil(visible.length / 6000));
  const sampled = visible.filter((_, index) => index % step === 0 || index === visible.length - 1);
  const toX = (value: number) => margin.left + (high - value) / span * innerWidth;
  const toY = (value: number) => margin.top + (1.03 - value) / 1.03 * innerHeight;
  const path = sampled.map((point, index) => `${index ? "L" : "M"}${toX(point.shift).toFixed(2)},${toY(point.intensity).toFixed(2)}`).join(" ");
  const ticks = Array.from({ length: 9 }, (_, index) => high - span * index / 8);

  function pointerShift(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const svgX = (event.clientX - bounds.left) / bounds.width * width;
    if (svgX < margin.left || svgX > width - margin.right) return null;
    return high - (svgX - margin.left) / innerWidth * span;
  }

  function nearestPoint(target: number) {
    let nearest = visible[0];
    for (const point of visible) if (Math.abs(point.shift - target) < Math.abs(nearest.shift - target)) nearest = point;
    return nearest;
  }

  function nearestPeak(target: number) {
    const radius = Math.max(span * 0.012, axis === "ppm" ? 0.015 : 1);
    const nearby = visible.filter((point) => Math.abs(point.shift - target) <= radius);
    return nearby.reduce<NmrPoint | undefined>((best, point) => !best || point.intensity > best.intensity ? point : best, undefined) ?? nearestPoint(target);
  }

  function handleMove(event: PointerEvent<SVGSVGElement>) {
    const target = pointerShift(event);
    if (target === null || !visible.length) return setHover(null);
    setHover(nearestPoint(target));
    if (dragStart !== null) setDragCurrent(target);
  }

  function handleDown(event: PointerEvent<SVGSVGElement>) {
    const target = pointerShift(event);
    if (target === null || !points.length) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (mode === "zoom" || mode === "integrate") {
      setDragStart(target);
      setDragCurrent(target);
    }
  }

  function handleUp(event: PointerEvent<SVGSVGElement>) {
    const target = pointerShift(event);
    if (target === null || !visible.length) return;
    if (dragStart !== null && dragCurrent !== null) {
      if (Math.abs(toX(dragStart) - toX(dragCurrent)) > 5) onRangeSelect(Math.min(dragStart, dragCurrent), Math.max(dragStart, dragCurrent));
      setDragStart(null);
      setDragCurrent(null);
      return;
    }
    if (mode === "solvent" || mode === "coupling") onPeakSelect(nearestPeak(target).shift);
  }

  const selectionLow = dragStart === null || dragCurrent === null ? null : Math.min(dragStart, dragCurrent);
  const selectionHigh = dragStart === null || dragCurrent === null ? null : Math.max(dragStart, dragCurrent);

  return <div className={`nmr-chart is-${mode}`}>
    <svg aria-label="Processed one-dimensional NMR spectrum" onPointerDown={handleDown} onPointerLeave={() => { if (dragStart === null) setHover(null); }} onPointerMove={handleMove} onPointerUp={handleUp} role="img" viewBox={`0 0 ${width} ${height}`}>
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => <g key={tick}><line className="nmr-gridline" x1={margin.left} x2={width - margin.right} y1={toY(tick)} y2={toY(tick)} /><text className="nmr-tick" textAnchor="end" x={margin.left - 8} y={toY(tick) + 4}>{tick.toFixed(2)}</text></g>)}
      {ticks.map((tick) => <g key={tick}><line className="nmr-gridline" x1={toX(tick)} x2={toX(tick)} y1={margin.top} y2={height - margin.bottom} /><text className="nmr-tick" textAnchor="middle" x={toX(tick)} y={height - margin.bottom + 22}>{tick.toFixed(axis === "ppm" ? (span < 1 ? 3 : 2) : span < 100 ? 1 : 0)}</text></g>)}
      {regions.map((region, index) => <g className="nmr-region" key={region.id}><rect height={innerHeight} width={Math.abs(toX(region.low) - toX(region.high))} x={Math.min(toX(region.low), toX(region.high))} y={margin.top} /><text textAnchor="middle" x={(toX(region.low) + toX(region.high)) / 2} y={margin.top + 14}>I{index + 1}</text></g>)}
      <line className="nmr-axis" x1={margin.left} x2={width - margin.right} y1={toY(0)} y2={toY(0)} />
      <path className="nmr-spectrum-line" d={path} />
      {solventPeak !== undefined && solventPeak >= low && solventPeak <= high && <g className="nmr-solvent-marker"><line x1={toX(solventPeak)} x2={toX(solventPeak)} y1={margin.top} y2={height - margin.bottom} /><text textAnchor="middle" x={toX(solventPeak)} y={margin.top + 13}>solvent</text></g>}
      {couplingPoints.map((shift, index) => shift >= low && shift <= high && <g className="nmr-coupling-marker" key={`${shift}-${index}`}><line x1={toX(shift)} x2={toX(shift)} y1={margin.top} y2={height - margin.bottom} /><text textAnchor="middle" x={toX(shift)} y={margin.top + 13}>J{index + 1}</text></g>)}
      {selectionLow !== null && selectionHigh !== null && <rect className="nmr-drag-selection" height={innerHeight} width={Math.abs(toX(selectionLow) - toX(selectionHigh))} x={Math.min(toX(selectionLow), toX(selectionHigh))} y={margin.top} />}
      <text className="nmr-axis-title" textAnchor="middle" x={margin.left + innerWidth / 2} y={height - 13}>{axis === "ppm" ? "Chemical shift (ppm)" : "Frequency offset (Hz)"}</text>
      {hover && <g className="nmr-hover"><line x1={toX(hover.shift)} x2={toX(hover.shift)} y1={margin.top} y2={height - margin.bottom} /><circle cx={toX(hover.shift)} cy={toY(hover.intensity)} r="4" /></g>}
    </svg>
    {hover && <div className="nmr-tooltip" style={{ left: `${Math.min(90, Math.max(10, toX(hover.shift) / width * 100))}%` }}><strong>{hover.shift.toFixed(axis === "ppm" ? 4 : 1)} {axis}</strong><span>Intensity {hover.intensity.toFixed(4)}</span></div>}
    {!points.length && <div className="nmr-chart-empty">Select a Spinsolve <strong>data.1d</strong> file to process the FID.</div>}
  </div>;
}
