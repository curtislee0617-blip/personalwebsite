"use client";

import { useState, type PointerEvent } from "react";
import type { DiagramType, VlePoint } from "@/lib/vle";
import type { VlePhaseSplit } from "@/lib/vle-split";

type VleChartProps = {
  points: VlePoint[];
  type: DiagramType;
  firstLabel: string;
  analysis?: { z: number; level: number; split: VlePhaseSplit | null } | null;
};

function pathFor(points: VlePoint[], xKey: "x" | "y", xScale: (value: number) => number, yScale: (value: number) => number) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${xScale(point[xKey]).toFixed(2)},${yScale(point.value).toFixed(2)}`).join(" ");
}

function phaseEnvelope(points: VlePoint[], xScale: (value: number) => number, yScale: (value: number) => number) {
  const liquid = points.map((point, index) => `${index === 0 ? "M" : "L"}${xScale(point.x).toFixed(2)},${yScale(point.value).toFixed(2)}`).join(" ");
  const vapour = [...points].reverse().map((point) => `L${xScale(point.y).toFixed(2)},${yScale(point.value).toFixed(2)}`).join(" ");
  return `${liquid} ${vapour} Z`;
}

type HoverState = {
  svgX: number;
  svgY: number;
  fraction: number;
  value: number;
  nearest: VlePoint;
  nearestCurve: "bubble" | "dew";
};

export function VleChart({ points, type, firstLabel, analysis }: VleChartProps) {
  const [hover, setHover] = useState<HoverState | null>(null);
  if (points.length < 2) return <div className="vle-chart-empty">No continuous two-phase curve was found for this state and model.</div>;
  const values = points.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * 0.1, type === "txy" ? 2 : 0.05);
  const minimum = rawMin - padding;
  const maximum = rawMax + padding;
  const left = 62;
  const right = 18;
  const top = 22;
  const bottom = 52;
  const width = 720;
  const height = 390;
  const xScale = (value: number) => left + value * (width - left - right);
  const yScale = (value: number) => top + (maximum - value) / (maximum - minimum) * (height - top - bottom);
  const yTicks = Array.from({ length: 6 }, (_, index) => minimum + (maximum - minimum) * index / 5);
  const xTicks = Array.from({ length: 6 }, (_, index) => index / 5);
  const displayValue = (value: number) => type === "txy" ? `${(value - 273.15).toFixed(1)}` : `${Number(value.toPrecision(4))}`;
  const displayHoverValue = (value: number) => type === "txy" ? `${(value - 273.15).toFixed(2)} °C` : `${Number(value.toPrecision(5))} bar`;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  const tooltipX = hover ? Math.min(width - 184, Math.max(left + 8, hover.svgX + 14)) : 0;
  const tooltipY = hover ? Math.min(height - bottom - 88, Math.max(top + 8, hover.svgY - 94)) : 0;

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - bounds.left) / bounds.width) * width;
    const svgY = ((event.clientY - bounds.top) / bounds.height) * height;

    if (svgX < left || svgX > width - right || svgY < top || svgY > height - bottom) {
      setHover(null);
      return;
    }

    const fraction = (svgX - left) / innerWidth;
    const value = maximum - ((svgY - top) / innerHeight) * (maximum - minimum);
    let nearest = points[0];
    let nearestCurve: HoverState["nearestCurve"] = "bubble";
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const point of points) {
      const liquidDistance = Math.hypot(svgX - xScale(point.x), svgY - yScale(point.value));
      if (liquidDistance < nearestDistance) {
        nearest = point;
        nearestCurve = "bubble";
        nearestDistance = liquidDistance;
      }

      const vapourDistance = Math.hypot(svgX - xScale(point.y), svgY - yScale(point.value));
      if (vapourDistance < nearestDistance) {
        nearest = point;
        nearestCurve = "dew";
        nearestDistance = vapourDistance;
      }
    }

    setHover({ svgX, svgY, fraction, value, nearest, nearestCurve });
  }

  return (
    <div className="vle-chart-wrap">
      <svg aria-label={`${type === "txy" ? "Temperature" : "Pressure"} composition diagram for ${firstLabel}`} onPointerLeave={() => setHover(null)} onPointerMove={handlePointerMove} role="img" viewBox={`0 0 ${width} ${height}`}>
        {yTicks.map((tick) => <g key={tick}><line className="vle-gridline" x1={left} x2={width - right} y1={yScale(tick)} y2={yScale(tick)} /><text className="vle-axis-label" textAnchor="end" x={left - 9} y={yScale(tick) + 4}>{displayValue(tick)}</text></g>)}
        {xTicks.map((tick) => <g key={tick}><line className="vle-gridline" x1={xScale(tick)} x2={xScale(tick)} y1={top} y2={height - bottom} /><text className="vle-axis-label" textAnchor="middle" x={xScale(tick)} y={height - bottom + 20}>{tick.toFixed(1)}</text></g>)}
        <line className="vle-axis" x1={left} x2={left} y1={top} y2={height - bottom} />
        <line className="vle-axis" x1={left} x2={width - right} y1={height - bottom} y2={height - bottom} />
        <path className="vle-two-phase-region" d={phaseEnvelope(points, xScale, yScale)} />
        <text className="vle-region-label" textAnchor="middle" x={xScale(0.5)} y={top + 18}>{type === "txy" ? "Vapour / gas" : "Liquid"}</text>
        <text className="vle-region-label is-two-phase" textAnchor="middle" x={xScale(0.5)} y={yScale((rawMin + rawMax) / 2)}>Liquid + vapour</text>
        <text className="vle-region-label" textAnchor="middle" x={xScale(0.5)} y={height - bottom - 10}>{type === "txy" ? "Liquid" : "Vapour / gas"}</text>
        <path className="vle-liquid-curve" d={pathFor(points, "x", xScale, yScale)} />
        <path className="vle-vapour-curve" d={pathFor(points, "y", xScale, yScale)} />
        {points.filter((_, index) => index % 4 === 0).map((point) => <circle className="vle-liquid-point" cx={xScale(point.x)} cy={yScale(point.value)} key={`x-${point.x}`} r="2.3" />)}
        {points.filter((_, index) => index % 4 === 0).map((point) => <circle className="vle-vapour-point" cx={xScale(point.y)} cy={yScale(point.value)} key={`y-${point.x}`} r="2.3" />)}
        {analysis && analysis.split && (() => {
          const { z, level, split } = analysis;
          const levelY = yScale(level);
          return <g className="vle-analysis">
            {split.phase === "two-phase" && split.xStar !== null && split.yStar !== null && <>
              <line className="vle-analysis-tie" x1={xScale(Math.min(split.xStar, split.yStar))} x2={xScale(Math.max(split.xStar, split.yStar))} y1={levelY} y2={levelY} />
              <circle className="vle-analysis-endpoint is-liquid" cx={xScale(split.xStar)} cy={levelY} r="4" />
              <circle className="vle-analysis-endpoint is-vapour" cx={xScale(split.yStar)} cy={levelY} r="4" />
            </>}
            <line className="vle-analysis-z" x1={xScale(z)} x2={xScale(z)} y1={top} y2={height - bottom} />
            <circle className="vle-analysis-overall" cx={xScale(z)} cy={levelY} r="4.5" />
          </g>;
        })()}
        {hover && (
          <g className="vle-hover">
            <line x1={hover.svgX} x2={hover.svgX} y1={top} y2={height - bottom} />
            <line x1={left} x2={width - right} y1={hover.svgY} y2={hover.svgY} />
            <circle cx={hover.svgX} cy={hover.svgY} r="4" />
            <circle className={hover.nearestCurve === "bubble" ? "is-liquid" : "is-vapour"} cx={xScale(hover.nearestCurve === "bubble" ? hover.nearest.x : hover.nearest.y)} cy={yScale(hover.nearest.value)} r="5" />
            <g className="vle-hover-label" transform={`translate(${tooltipX} ${tooltipY})`}>
              <rect height="82" rx="9" width="170" />
              <text x="10" y="18">Cursor</text>
              <text x="10" y="34">z = {hover.fraction.toFixed(4)}</text>
              <text x="10" y="50">{type === "txy" ? "T" : "P"} = {displayHoverValue(hover.value)}</text>
              <text x="10" y="66">nearest {hover.nearestCurve}: x = {hover.nearest.x.toFixed(4)}, y = {hover.nearest.y.toFixed(4)}</text>
            </g>
          </g>
        )}
        <text className="vle-axis-title" textAnchor="middle" x={(left + width - right) / 2} y={height - 10}>Mole fraction of {firstLabel}</text>
        <text className="vle-axis-title" textAnchor="middle" transform={`rotate(-90 16 ${(top + height - bottom) / 2})`} x="16" y={(top + height - bottom) / 2}>{type === "txy" ? "Temperature (°C)" : "Pressure (bar)"}</text>
      </svg>
      <div className="vle-legend"><span><i className="is-liquid" />Bubble line · liquid composition x₁</span><span><i className="is-vapour" />Dew line · vapour composition y₁</span></div>
    </div>
  );
}
