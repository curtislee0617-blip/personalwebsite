"use client";

import { useEffect, useRef } from "react";

export type ObservablePlotDatum = {
  series?: string;
  x: number | string;
  y: number;
};

export type ObservablePlotProps = {
  ariaLabel: string;
  className?: string;
  data: readonly ObservablePlotDatum[];
  height?: number;
  xLabel?: string;
  yLabel?: string;
};

/** Small, replace-on-update Observable Plot figure for scientific datasets. */
export function ObservablePlot({
  ariaLabel,
  className = "",
  data,
  height = 320,
  xLabel,
  yLabel,
}: ObservablePlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let figure: HTMLElement | SVGSVGElement | null = null;

    void import("@observablehq/plot").then((Plot) => {
      if (disposed) return;
      const hasSeries = data.some((datum) => datum.series);
      figure = Plot.plot({
        color: hasSeries ? { legend: true } : undefined,
        height,
        marks: [
          Plot.ruleY([0]),
          Plot.lineY(data, { stroke: hasSeries ? "series" : "#466f53", x: "x", y: "y" }),
          Plot.dot(data, { fill: hasSeries ? "series" : "#466f53", r: 3.2, x: "x", y: "y" }),
        ],
        marginLeft: 52,
        style: { background: "transparent", color: "currentColor", fontSize: "12px" },
        width: Math.max(280, container.clientWidth),
        x: { label: xLabel },
        y: { grid: true, label: yLabel },
      });
      container.append(figure);
    });

    return () => {
      disposed = true;
      figure?.remove();
    };
  }, [data, height, xLabel, yLabel]);

  return (
    <div
      aria-label={ariaLabel}
      className={`interaction-observable-plot ${className}`.trim()}
      ref={containerRef}
      role="img"
    />
  );
}
