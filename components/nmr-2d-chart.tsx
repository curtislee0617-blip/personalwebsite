"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import type { NmrPeak2d, NmrSpectrum2d } from "@/lib/nmr-spectrum";

type Nmr2dChartProps = {
  spectrum: NmrSpectrum2d;
  peaks: NmrPeak2d[];
  xRange: { low: number; high: number };
  yRange: { low: number; high: number };
  contourThreshold: number;
  onSelectPeak: (peak: NmrPeak2d) => void;
};

const canvasWidth = 920;
const canvasHeight = 620;
const plot = { left: 72, right: 24, top: 25, bottom: 60 };
const plotWidth = canvasWidth - plot.left - plot.right;
const plotHeight = canvasHeight - plot.top - plot.bottom;

export function Nmr2dChart({ spectrum, peaks, xRange, yRange, contourThreshold, onSelectPeak }: Nmr2dChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<NmrPeak2d | null>(null);
  const xLow = Math.min(xRange.low, xRange.high);
  const xHigh = Math.max(xRange.low, xRange.high);
  const yLow = Math.min(yRange.low, yRange.high);
  const yHigh = Math.max(yRange.low, yRange.high);
  const toX = useCallback((value: number) => plot.left + (xHigh - value) / (xHigh - xLow) * plotWidth, [xHigh, xLow]);
  const toY = useCallback((value: number) => plot.top + (value - yLow) / (yHigh - yLow) * plotHeight, [yHigh, yLow]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = canvasWidth * ratio;
    canvas.height = canvasHeight * ratio;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = "rgba(255,255,255,.35)";
    context.fillRect(plot.left, plot.top, plotWidth, plotHeight);
    context.strokeStyle = "rgba(32,35,31,.08)";
    context.fillStyle = "rgba(32,35,31,.48)";
    context.font = "10px Arial";
    context.textAlign = "center";
    for (let index = 0; index <= 8; index += 1) {
      const x = plot.left + plotWidth * index / 8;
      const value = xHigh - (xHigh - xLow) * index / 8;
      context.beginPath(); context.moveTo(x, plot.top); context.lineTo(x, plot.top + plotHeight); context.stroke();
      context.fillText(value.toFixed(xHigh - xLow < 3 ? 3 : 1), x, plot.top + plotHeight + 21);
    }
    context.textAlign = "right";
    for (let index = 0; index <= 8; index += 1) {
      const y = plot.top + plotHeight * index / 8;
      const value = yLow + (yHigh - yLow) * index / 8;
      context.beginPath(); context.moveTo(plot.left, y); context.lineTo(plot.left + plotWidth, y); context.stroke();
      context.fillText(value.toFixed(yHigh - yLow < 3 ? 3 : 1), plot.left - 9, y + 3);
    }
    const cellWidth = Math.max(1, plotWidth / spectrum.width + 0.5);
    const cellHeight = Math.max(1, plotHeight / spectrum.height + 0.5);
    for (let row = 0; row < spectrum.height; row += 1) {
      const yShift = spectrum.yLow + (spectrum.yHigh - spectrum.yLow) * row / (spectrum.height - 1);
      if (yShift < yLow || yShift > yHigh) continue;
      for (let column = 0; column < spectrum.width; column += 1) {
        const xShift = spectrum.xHigh - (spectrum.xHigh - spectrum.xLow) * column / (spectrum.width - 1);
        if (xShift < xLow || xShift > xHigh) continue;
        const value = spectrum.intensity[row * spectrum.width + column];
        if (value < contourThreshold) continue;
        const strength = Math.min(1, (value - contourThreshold) / Math.max(0.001, 1 - contourThreshold));
        context.fillStyle = `rgba(79,108,73,${0.12 + Math.sqrt(strength) * 0.76})`;
        context.fillRect(toX(xShift) - cellWidth / 2, toY(yShift) - cellHeight / 2, cellWidth, cellHeight);
      }
    }
    context.strokeStyle = "rgba(32,35,31,.45)";
    context.strokeRect(plot.left, plot.top, plotWidth, plotHeight);
    context.fillStyle = "rgba(32,35,31,.65)";
    context.textAlign = "center";
    context.font = "700 11px Arial";
    context.fillText("F2 ¹H chemical shift (ppm)", plot.left + plotWidth / 2, canvasHeight - 12);
    context.save();
    context.translate(16, plot.top + plotHeight / 2);
    context.rotate(-Math.PI / 2);
    context.fillText(spectrum.experiment === "hsqc" ? "F1 ¹³C chemical shift (ppm)" : "F1 ¹H chemical shift (ppm)", 0, 0);
    context.restore();
    for (const [index, peak] of peaks.entries()) {
      if (peak.x < xLow || peak.x > xHigh || peak.y < yLow || peak.y > yHigh) continue;
      const x = toX(peak.x); const y = toY(peak.y);
      context.beginPath(); context.arc(x, y, 4, 0, Math.PI * 2); context.strokeStyle = "#b25c43"; context.lineWidth = 1.3; context.stroke();
      context.fillStyle = "rgba(248,247,242,.92)"; context.fillRect(x + 5, y - 12, 48, 14);
      context.fillStyle = "#8d4837"; context.textAlign = "left"; context.font = "700 8px Arial"; context.fillText(`P${index + 1}`, x + 9, y - 2);
    }
  }, [contourThreshold, peaks, spectrum, toX, toY, xHigh, xLow, yHigh, yLow]);

  function locate(event: MouseEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const xPixel = (event.clientX - bounds.left) / bounds.width * canvasWidth;
    const yPixel = (event.clientY - bounds.top) / bounds.height * canvasHeight;
    if (xPixel < plot.left || xPixel > canvasWidth - plot.right || yPixel < plot.top || yPixel > canvasHeight - plot.bottom) return null;
    const x = xHigh - (xPixel - plot.left) / plotWidth * (xHigh - xLow);
    const y = yLow + (yPixel - plot.top) / plotHeight * (yHigh - yLow);
    return peaks.reduce<NmrPeak2d | null>((nearest, peak) => {
      const distance = ((peak.x - x) / (xHigh - xLow)) ** 2 + ((peak.y - y) / (yHigh - yLow)) ** 2;
      if (!nearest) return peak;
      const nearestDistance = ((nearest.x - x) / (xHigh - xLow)) ** 2 + ((nearest.y - y) / (yHigh - yLow)) ** 2;
      return distance < nearestDistance ? peak : nearest;
    }, null);
  }

  return <div className="nmr-2d-chart">
    <canvas onClick={(event) => { const peak = locate(event); if (peak) onSelectPeak(peak); }} onMouseLeave={() => setHover(null)} onMouseMove={(event) => setHover(locate(event))} ref={canvasRef} />
    {hover && <div className="nmr-2d-tooltip"><strong>F2 {hover.x.toFixed(3)} ppm</strong><span>F1 {hover.y.toFixed(3)} ppm</span><span>Relative intensity {hover.intensity.toFixed(3)}</span></div>}
  </div>;
}
