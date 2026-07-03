"use client";

import { useMemo, useState, type PointerEvent } from "react";
import type { SpectrumMode, SpectrumPeak, SpectrumPoint } from "@/lib/ir-spectrum";

export type ChartSpectrum = {
  id: string;
  title: string;
  color: string;
  points: SpectrumPoint[];
  peaks: SpectrumPeak[];
};

type IrSpectrumChartProps = {
  spectra: ChartSpectrum[];
  mode: SpectrumMode;
  xMinimum: number;
  xMaximum: number;
  yMinimum: number;
  yMaximum: number;
};

const width = 960;
const height = 520;
const plot = { left: 74, right: 24, top: 35, bottom: 64 };

export function IrSpectrumChart({ spectra, mode, xMinimum, xMaximum, yMinimum, yMaximum }: IrSpectrumChartProps) {
  const [hover, setHover] = useState<{ spectrum: ChartSpectrum; point: SpectrumPoint; peak?: SpectrumPeak; x: number; y: number } | null>(null);
  const innerWidth = width - plot.left - plot.right;
  const innerHeight = height - plot.top - plot.bottom;
  const xSpan = Math.max(1, xMaximum - xMinimum);
  const ySpan = Math.max(0.0001, yMaximum - yMinimum);
  const toX = (value: number) => plot.left + ((xMaximum - value) / xSpan) * innerWidth;
  const toY = (value: number) => plot.top + ((yMaximum - value) / ySpan) * innerHeight;
  const xTicks = useMemo(() => Array.from({ length: 10 }, (_, index) => xMaximum - (xSpan * index) / 9), [xMaximum, xSpan]);
  const yTicks = useMemo(() => Array.from({ length: 6 }, (_, index) => yMinimum + (ySpan * index) / 5), [yMinimum, ySpan]);

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!spectra.length || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - bounds.left) / bounds.width) * width;
    const svgY = ((event.clientY - bounds.top) / bounds.height) * height;
    const wave = xMaximum - ((svgX - plot.left) / innerWidth) * xSpan;
    let nearest: { spectrum: ChartSpectrum; point: SpectrumPoint; distance: number } | null = null;
    for (const spectrum of spectra) {
      for (const point of spectrum.points) {
        if (point.wavenumber < xMinimum || point.wavenumber > xMaximum) continue;
        const distance = Math.abs(point.wavenumber - wave);
        if (!nearest || distance < nearest.distance) nearest = { spectrum, point, distance };
      }
    }
    if (!nearest || svgX < plot.left || svgX > width - plot.right || svgY < plot.top || svgY > height - plot.bottom) return setHover(null);
    const peak = nearest.spectrum.peaks.find((item) => item.wavenumber === nearest!.point.wavenumber);
    setHover({ spectrum: nearest.spectrum, point: nearest.point, peak, x: toX(nearest.point.wavenumber), y: toY(nearest.point.value) });
  }

  return (
    <div className="ir-chart">
      <svg aria-label="Interactive infrared spectrum chart" onPointerLeave={() => setHover(null)} onPointerMove={handlePointerMove} role="img" viewBox={`0 0 ${width} ${height}`}>
        <defs><clipPath id="ir-plot-clip"><rect height={innerHeight} width={innerWidth} x={plot.left} y={plot.top} /></clipPath></defs>
        <rect className="ir-chart-background" height={innerHeight} width={innerWidth} x={plot.left} y={plot.top} />
        {yTicks.map((tick) => <g key={tick}><line className="ir-gridline" x1={plot.left} x2={width - plot.right} y1={toY(tick)} y2={toY(tick)} /><text className="ir-tick" textAnchor="end" x={plot.left - 10} y={toY(tick) + 4}>{tick.toFixed(mode === "absorbance" ? 2 : 0)}</text></g>)}
        {xTicks.map((tick) => <g key={tick}><line className="ir-gridline" x1={toX(tick)} x2={toX(tick)} y1={plot.top} y2={height - plot.bottom} /><text className="ir-tick" textAnchor="middle" x={toX(tick)} y={height - plot.bottom + 23}>{Math.round(tick)}</text></g>)}
        <line className="ir-axis" x1={plot.left} x2={width - plot.right} y1={height - plot.bottom} y2={height - plot.bottom} />
        <line className="ir-axis" x1={plot.left} x2={plot.left} y1={plot.top} y2={height - plot.bottom} />
        <text className="ir-axis-title" textAnchor="middle" x={plot.left + innerWidth / 2} y={height - 16}>Wavenumber (cm⁻¹)</text>
        <text className="ir-axis-title" textAnchor="middle" transform={`rotate(-90 19 ${plot.top + innerHeight / 2})`} x={19} y={plot.top + innerHeight / 2}>{mode === "transmittance" ? "Transmittance (%)" : "Absorbance"}</text>
        {spectra.map((spectrum) => {
          const visible = spectrum.points.filter((point) => point.wavenumber >= xMinimum && point.wavenumber <= xMaximum && Number.isFinite(point.value));
          const path = visible.map((point, index) => `${index ? "L" : "M"}${toX(point.wavenumber).toFixed(2)},${toY(point.value).toFixed(2)}`).join(" ");
          return <g key={spectrum.id}><path clipPath="url(#ir-plot-clip)" d={path} fill="none" stroke={spectrum.color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />{spectrum.peaks.filter((peak) => peak.value >= yMinimum && peak.value <= yMaximum).map((peak, index) => <g key={`${peak.index}-${index}`}><circle cx={toX(peak.wavenumber)} cy={toY(peak.value)} fill={spectrum.color} r="3.2" /><line className="ir-peak-stem" x1={toX(peak.wavenumber)} x2={toX(peak.wavenumber)} y1={toY(peak.value) - 4} y2={Math.max(plot.top + 15, toY(peak.value) - 25 - (index % 2) * 12)} /><text className="ir-peak-label" fill={spectrum.color} textAnchor="middle" x={toX(peak.wavenumber)} y={Math.max(plot.top + 11, toY(peak.value) - 29 - (index % 2) * 12)}>{Math.round(peak.wavenumber)}</text></g>)}</g>;
        })}
        {hover && <g className="ir-hover"><line x1={hover.x} x2={hover.x} y1={plot.top} y2={height - plot.bottom} /><circle cx={hover.x} cy={hover.y} fill={hover.spectrum.color} r="5" /></g>}
      </svg>
      {hover && <div className="ir-tooltip" style={{ left: `${Math.min(82, Math.max(8, (hover.x / width) * 100))}%`, top: `${Math.max(4, (hover.y / height) * 100 - 12)}%` }}><strong>{hover.spectrum.title}</strong><span>{hover.point.wavenumber.toFixed(2)} cm⁻¹</span><span>{hover.point.value.toFixed(mode === "absorbance" ? 4 : 2)} {mode === "transmittance" ? "%T" : "A"}</span><span>Prominence {hover.peak ? hover.peak.prominence.toFixed(mode === "absorbance" ? 4 : 2) : "—"}</span></div>}
      {!spectra.length && <div className="ir-chart-empty"><strong>Your spectrum will appear here</strong><span>Upload a CSV, TXT, or XLSX file with wavenumber in the first column and measurement in the second.</span></div>}
    </div>
  );
}
