"use client";

import { forwardRef, useMemo } from "react";
import type { ProcessBlock } from "@/lib/scwg-types";
import { BlockGlyph } from "@/components/scwg-diagram-symbols";
import { SCWG_VIEW_W, scwgBoxes, scwgViewHeight } from "@/lib/scwg-diagram-layout";
import { buildScwgConnectors } from "@/lib/scwg-diagram-connectors";
import { scwgUi } from "@/lib/scwg-meta";

// Wrap a block name to at most two lines of ~ maxChars, so long names fit the box.
function wrapName(name: string, maxChars = 22): string[] {
  const words = name.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  if (lines.length > 2) return [lines[0], `${lines.slice(1).join(" ").slice(0, maxChars - 1)}…`];
  return lines;
}

// The process flow diagram. Renders Aspen-convention symbols (chosen from each
// block's `symbol`) and stream connectors DERIVED from inlet/outlet tag matching,
// so topology follows the data. Static when `activeId` is undefined. The scroller
// forwards a ref to the <svg> and animates the viewBox attribute imperatively with
// d3 (build once, animate attributes); `activeId` drives highlight on block change.
//
// The initial viewBox is a stable full-view string so React never rewrites the
// attribute on an activeId re-render — d3 keeps ownership of the live viewBox.

type Props = {
  blocks: ProcessBlock[];
  activeId?: string;
  reducedMotion?: boolean;
};

export const ScwgProcessDiagram = forwardRef<SVGSVGElement, Props>(function ScwgProcessDiagram(
  { blocks, activeId, reducedMotion },
  ref,
) {
  const boxes = useMemo(() => scwgBoxes(blocks), [blocks]);
  const connectors = useMemo(() => buildScwgConnectors(blocks, boxes), [blocks, boxes]);
  const boxById = useMemo(() => new Map(boxes.map((b) => [b.id, b])), [boxes]);
  const activeIndex = activeId ? blocks.findIndex((b) => b.id === activeId) : -1;
  const viewH = scwgViewHeight(blocks.length);

  return (
    <svg
      aria-label={scwgUi.process.diagramAriaLabel}
      className="h-full w-full text-ink"
      preserveAspectRatio="xMidYMid meet"
      ref={ref}
      role="img"
      viewBox={`0 0 ${SCWG_VIEW_W} ${viewH}`}
    >
      <defs>
        <marker id="scwg-arrow" markerHeight="7" markerWidth="8" orient="auto" refX="6" refY="3.5" viewBox="0 0 8 7">
          <path d="M0 0 L8 3.5 L0 7 Z" fill="currentColor" />
        </marker>
      </defs>

      {/* streams */}
      <g>
        {connectors.map((c) => {
          const isActive =
            activeId !== undefined && (c.from === activeId || c.to === activeId);
          const isFlagged = c.kind === "recycle" || c.kind === "self";
          const color = isActive ? "text-moss" : isFlagged ? "text-clay/70" : "text-ink/55";
          return (
            <g className={color} key={c.key}>
              <path
                className={isActive && !reducedMotion ? "scwg-stream-active" : undefined}
                d={c.d}
                fill="none"
                markerEnd="url(#scwg-arrow)"
                stroke="currentColor"
                strokeWidth={isActive ? 2.2 : 1.4}
              />
              <g transform={`translate(${c.label[0]}, ${c.label[1]})`}>
                <rect
                  fill="rgb(var(--color-paper))"
                  height="15"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1"
                  transform="rotate(45)"
                  width="15"
                  x="-7.5"
                  y="-7.5"
                />
                <text
                  className="font-mono"
                  dominantBaseline="central"
                  fill="rgb(var(--color-ink))"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {c.tag}
                </text>
              </g>
            </g>
          );
        })}
      </g>

      {/* blocks */}
      <g>
        {blocks.map((block, index) => {
          const box = boxById.get(block.id);
          if (!box) return null;
          const isActive = block.id === activeId;
          const isCompleted = activeIndex >= 0 && index < activeIndex;
          const opacity = activeId === undefined ? 1 : isActive ? 1 : isCompleted ? 0.55 : 0.32;
          const border = isActive ? "text-moss" : "text-ink";
          const textX = box.x + 118;
          const nameLines = wrapName(block.diagramLabel ?? block.name);
          return (
            <g key={block.id} opacity={opacity}>
              <rect
                className={border}
                fill="rgb(var(--color-surface))"
                height={box.h}
                rx="12"
                stroke="currentColor"
                strokeWidth={isActive ? 2.6 : 1.4}
                width={box.w}
                x={box.x}
                y={box.y}
              />
              {block.needsValidation ? (
                <circle cx={box.x + box.w - 15} cy={box.y + 15} fill="rgb(var(--color-clay))" r="5" />
              ) : null}
              {/* glyph on the left */}
              <g className="text-ink" transform={`translate(${box.x + 8}, ${box.y + 18})`}>
                <BlockGlyph h={84} symbol={block.symbol} w={96} />
              </g>
              {/* text block on the right */}
              <text className="font-mono" fill="rgb(var(--color-moss))" fontSize="14" fontWeight="700" x={textX} y={box.y + 28}>
                {block.id}
              </text>
              {nameLines.map((line, li) => (
                <text
                  fill="rgb(var(--color-ink))"
                  fontSize="13"
                  fontWeight="600"
                  key={li}
                  x={textX}
                  y={box.y + 50 + li * 17}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </g>
    </svg>
  );
});
