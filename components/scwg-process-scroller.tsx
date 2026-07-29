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

  // Active-block state machine. A block counts as active while it crosses a thin
  // band at the vertical centre of the viewport. Blocks are much taller than that
  // band, so intersectionRatio is meaningless here — instead we keep a set of the
  // blocks currently touching the band and take the first in document order. The
  // observer only fires on band crossings, never per scroll event.
  useEffect(() => {
    const sections = sectionRefs.current.filter((s): s is HTMLElement => s !== null);
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-scwg-block");
          if (!id) return;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        });

        const ordered = blocks.find((block) => visible.has(block.id));
        if (ordered) setActiveId(ordered.id);
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
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

  // The diagram is a reference figure, not the payload — the reading column gets
  // the majority of the width.
  return (
    <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,34%)_minmax(0,66%)] lg:gap-10">
      {/* Sticky below the legend bar. Opaque background: the text column scrolls
          underneath it on narrow screens, so it must not be see-through. */}
      <div className="sticky top-[3.25rem] z-20 mb-6 self-start lg:top-[3.25rem] lg:mb-0">
        <div className="h-[40vh] overflow-hidden rounded-[2rem] border border-ink/10 bg-paper p-3 shadow-soft lg:h-[calc(100vh-5rem)] lg:bg-surface/40 lg:p-4 lg:shadow-none">
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
