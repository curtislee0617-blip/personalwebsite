"use client";

import { useEffect, useRef, useState } from "react";
import { select } from "d3-selection";
import "d3-transition";
import type { ProcessBlock } from "@/lib/scwg-types";
import { ScwgProcessDiagram } from "@/components/scwg-process-diagram";
import { ScwgProcessBlock } from "@/components/scwg-process-block";
import { scwgBoxes, scwgViewBoxFor } from "@/lib/scwg-diagram-layout";

// Act 3 interaction. The diagram is sticky on the left and holds while the block
// descriptions scroll on the right. An IntersectionObserver marks the block at the
// vertical centre of the viewport active; the diagram's viewBox is then panned and
// zoomed to centre it via a d3 attribute transition (no per-scroll-event work, no
// scroll-jacking). Reduced motion disables the pan/zoom and the stream dashes.

export function ScwgProcessScroller({ blocks }: { blocks: ProcessBlock[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeId, setActiveId] = useState(blocks[0]?.id);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  // Active-block state machine — fires on centre crossings, not on every scroll tick.
  useEffect(() => {
    const sections = sectionRefs.current.filter((s): s is HTMLElement => s !== null);
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target.getAttribute("data-scwg-block");
        if (id) setActiveId(id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [blocks]);

  // Pan/zoom the viewBox to the active block via a d3 attribute transition.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !activeId) return;
    const box = scwgBoxes(blocks).find((b) => b.id === activeId);
    const target = scwgViewBoxFor(box, blocks.length).join(" ");
    if (reducedMotion) {
      svg.setAttribute("viewBox", target);
      return;
    }
    select(svg).transition().duration(560).attr("viewBox", target);
  }, [activeId, blocks, reducedMotion]);

  return (
    <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,55%)_minmax(0,45%)] lg:gap-8">
      <div className="sticky top-16 z-10 mb-6 self-start lg:mb-0 lg:h-[calc(100vh-6rem)]">
        <div className="h-[40vh] overflow-hidden rounded-[2rem] border border-ink/10 bg-surface/40 p-3 lg:h-full lg:p-5">
          <ScwgProcessDiagram activeId={activeId} blocks={blocks} ref={svgRef} reducedMotion={reducedMotion} />
        </div>
      </div>

      <div className="space-y-8">
        {blocks.map((block, index) => (
          <div
            data-scwg-block={block.id}
            key={block.id}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
          >
            <ScwgProcessBlock block={block} />
          </div>
        ))}
      </div>
    </div>
  );
}
