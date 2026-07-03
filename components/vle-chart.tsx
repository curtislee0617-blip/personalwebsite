import type { DiagramType, VlePoint } from "@/lib/vle";

type VleChartProps = {
  points: VlePoint[];
  type: DiagramType;
  firstLabel: string;
};

function pathFor(points: VlePoint[], xKey: "x" | "y", xScale: (value: number) => number, yScale: (value: number) => number) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${xScale(point[xKey]).toFixed(2)},${yScale(point.value).toFixed(2)}`).join(" ");
}

function phaseEnvelope(points: VlePoint[], xScale: (value: number) => number, yScale: (value: number) => number) {
  const liquid = points.map((point, index) => `${index === 0 ? "M" : "L"}${xScale(point.x).toFixed(2)},${yScale(point.value).toFixed(2)}`).join(" ");
  const vapour = [...points].reverse().map((point) => `L${xScale(point.y).toFixed(2)},${yScale(point.value).toFixed(2)}`).join(" ");
  return `${liquid} ${vapour} Z`;
}

export function VleChart({ points, type, firstLabel }: VleChartProps) {
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

  return (
    <div className="vle-chart-wrap">
      <svg aria-label={`${type === "txy" ? "Temperature" : "Pressure"} composition diagram for ${firstLabel}`} role="img" viewBox={`0 0 ${width} ${height}`}>
        {yTicks.map((tick) => <g key={tick}><line className="vle-gridline" x1={left} x2={width - right} y1={yScale(tick)} y2={yScale(tick)} /><text className="vle-axis-label" textAnchor="end" x={left - 9} y={yScale(tick) + 4}>{displayValue(tick)}</text></g>)}
        {xTicks.map((tick) => <g key={tick}><line className="vle-gridline" x1={xScale(tick)} x2={xScale(tick)} y1={top} y2={height - bottom} /><text className="vle-axis-label" textAnchor="middle" x={xScale(tick)} y={height - bottom + 20}>{tick.toFixed(1)}</text></g>)}
        <line className="vle-axis" x1={left} x2={left} y1={top} y2={height - bottom} />
        <line className="vle-axis" x1={left} x2={width - right} y1={height - bottom} y2={height - bottom} />
        <path className="vle-two-phase-region" d={phaseEnvelope(points, xScale, yScale)} />
        <path className="vle-liquid-curve" d={pathFor(points, "x", xScale, yScale)} />
        <path className="vle-vapour-curve" d={pathFor(points, "y", xScale, yScale)} />
        {points.filter((_, index) => index % 4 === 0).map((point) => <circle className="vle-liquid-point" cx={xScale(point.x)} cy={yScale(point.value)} key={`x-${point.x}`} r="2.3" />)}
        {points.filter((_, index) => index % 4 === 0).map((point) => <circle className="vle-vapour-point" cx={xScale(point.y)} cy={yScale(point.value)} key={`y-${point.x}`} r="2.3" />)}
        <text className="vle-axis-title" textAnchor="middle" x={(left + width - right) / 2} y={height - 10}>Mole fraction of {firstLabel}</text>
        <text className="vle-axis-title" textAnchor="middle" transform={`rotate(-90 16 ${(top + height - bottom) / 2})`} x="16" y={(top + height - bottom) / 2}>{type === "txy" ? "Temperature (°C)" : "Pressure (bar)"}</text>
      </svg>
      <div className="vle-legend"><span><i className="is-liquid" />Liquid composition, x₁</span><span><i className="is-vapour" />Vapour composition, y₁</span></div>
    </div>
  );
}
