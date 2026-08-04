"use client";

import { useEffect, useRef } from "react";

export type CytoscapeNetworkNode = {
  id: string;
  label: string;
  parent?: string;
};

export type CytoscapeNetworkEdge = {
  id: string;
  label?: string;
  source: string;
  target: string;
};

export type CytoscapeNetworkProps = {
  ariaLabel: string;
  className?: string;
  edges: readonly CytoscapeNetworkEdge[];
  layout?: "breadthfirst" | "circle" | "cose" | "grid";
  nodes: readonly CytoscapeNetworkNode[];
};

/** Interactive graph adapter for lineages, pathways, and relationship maps. */
export function CytoscapeNetwork({
  ariaLabel,
  className = "",
  edges,
  layout = "cose",
  nodes,
}: CytoscapeNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let destroy: () => void = () => undefined;

    void import("cytoscape").then(({ default: cytoscape }) => {
      if (disposed) return;

      const graph = cytoscape({
        container,
        elements: [
          ...nodes.map((node) => ({ data: { ...node } })),
          ...edges.map((edge) => ({ data: { ...edge } })),
        ],
        layout: {
          animate: false,
          fit: true,
          name: layout,
          padding: 24,
        },
        maxZoom: 2.4,
        minZoom: 0.45,
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#466f53",
              color: "#17241c",
              "font-family": "ui-sans-serif, system-ui, sans-serif",
              "font-size": 10,
              label: "data(label)",
              "text-margin-y": -9,
              "text-wrap": "wrap",
              width: 18,
              height: 18,
            },
          },
          {
            selector: "edge",
            style: {
              "curve-style": "bezier",
              label: "data(label)",
              "line-color": "#a8b6aa",
              "target-arrow-color": "#a8b6aa",
              "target-arrow-shape": "triangle",
              width: 1.4,
            },
          },
          {
            selector: ":selected",
            style: { "background-color": "#c36a3f", "line-color": "#c36a3f" },
          },
        ],
      });

      destroy = () => graph.destroy();
    });

    return () => {
      disposed = true;
      destroy();
    };
  }, [edges, layout, nodes]);

  return (
    <div
      aria-label={ariaLabel}
      className={`interaction-cytoscape ${className}`.trim()}
      ref={containerRef}
      role="img"
    />
  );
}
