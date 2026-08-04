"use client";

import { useGSAP } from "@gsap/react";
import { useGesture } from "@use-gesture/react";
import { useMachine } from "@xstate/react";
import { animate as animeAnimate } from "animejs";
import { select } from "d3-selection";
import "d3-transition";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useCallback, useMemo, useRef } from "react";
import { flushSync } from "react-dom";
import { assign, setup } from "xstate";
import { DotLottieAnimation } from "@/components/interaction/dotlottie-animation";
import { ScwgProcessDiagram } from "@/components/scwg-process-diagram";
import { ScwgProcessBlock } from "@/components/scwg-process-block";
import { scwgBoxes, scwgViewBoxFor } from "@/lib/scwg-diagram-layout";
import type { ProcessBlock } from "@/lib/scwg-types";
import { runViewTransition } from "@/lib/view-transitions";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MAX_INSPECTION_OFFSET = 120;
const MIN_INSPECTION_SCALE = 1;
const MAX_INSPECTION_SCALE = 2.4;

type ProcessInteractionContext = { activeId: string };
type ProcessInteractionInput = { initialActiveId: string };
type ProcessInteractionEvent =
  | { id: string; type: "STAGE.ACTIVATE" }
  | { type: "INSPECTION.TOGGLE" };

const processInteractionMachine = setup({
  actions: {
    setActiveStage: assign({
      activeId: ({ context, event }) => event.type === "STAGE.ACTIVATE" ? event.id : context.activeId,
    }),
  },
  types: {
    context: {} as ProcessInteractionContext,
    events: {} as ProcessInteractionEvent,
    input: {} as ProcessInteractionInput,
  },
}).createMachine({
  context: ({ input }) => ({ activeId: input.initialActiveId }),
  initial: "reading",
  on: {
    "STAGE.ACTIVATE": { actions: "setActiveStage" },
  },
  states: {
    inspecting: {
      on: { "INSPECTION.TOGGLE": "reading" },
    },
    reading: {
      on: { "INSPECTION.TOGGLE": "inspecting" },
    },
  },
});

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Scientific scrollytelling for the B1–B8 process definition.
 *
 * Ownership is deliberately separated: ScrollTrigger selects the active chapter,
 * D3 pans the SVG viewBox, Anime.js moves material along the selected streams,
 * Motion renders progress and inspection transforms, use-gesture supplies drag and
 * pinch input, and the View Transitions API handles deliberate stage jumps.
 */
export function ScwgProcessScroller({ blocks }: { blocks: ProcessBlock[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const readingColumnRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [interaction, send] = useMachine(processInteractionMachine, {
    input: { initialActiveId: blocks[0]?.id ?? "" },
  });
  const activeId = interaction.context.activeId;
  const inspectionEnabled = interaction.matches("inspecting");
  const reducedMotion = Boolean(useReducedMotion());
  const chapterProgress = useMotionValue(0);
  const inspectionX = useSpring(0, { damping: 28, stiffness: 360 });
  const inspectionY = useSpring(0, { damping: 28, stiffness: 360 });
  const inspectionScale = useSpring(1, { damping: 30, stiffness: 320 });

  const activeBlock = useMemo(
    () => blocks.find((block) => block.id === activeId) ?? blocks[0],
    [activeId, blocks],
  );

  const activateStage = useCallback((id: string) => {
    send({ id, type: "STAGE.ACTIVATE" });
  }, [send]);

  // ScrollTrigger owns chapter selection and the continuous progress value. The
  // latter is a MotionValue, so scroll updates do not cause React re-renders.
  useGSAP(() => {
    const readingColumn = readingColumnRef.current;
    const sections = sectionRefs.current.filter((section): section is HTMLElement => section !== null);
    if (!readingColumn || sections.length === 0) return;

    const chapterTriggers = sections.map((section, index) => {
      const block = blocks[index];
      if (!block) return null;

      if (!reducedMotion) {
        gsap.fromTo(section, {
          autoAlpha: 0.76,
          y: 18,
        }, {
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            end: "top 34%",
            scrub: 0.35,
            start: "top 78%",
            trigger: section,
          },
          y: 0,
        });
      }

      return ScrollTrigger.create({
        end: "bottom 46%",
        onEnter: () => activateStage(block.id),
        onEnterBack: () => activateStage(block.id),
        start: "top 54%",
        trigger: section,
      });
    });

    const progressTrigger = ScrollTrigger.create({
      end: "bottom center",
      onUpdate: ({ progress }) => chapterProgress.set(progress),
      start: "top center",
      trigger: readingColumn,
    });

    return () => {
      chapterTriggers.forEach((trigger) => trigger?.kill());
      progressTrigger.kill();
    };
  }, {
    dependencies: [activateStage, blocks, chapterProgress, reducedMotion],
    revertOnUpdate: true,
    scope: rootRef,
  });

  // D3 owns only the SVG viewBox. Its transition is independent from the CSS
  // transform Motion uses for optional user inspection.
  useGSAP(() => {
    const svg = svgRef.current;
    if (!svg || !activeId) return;
    const box = scwgBoxes(blocks).find((candidate) => candidate.id === activeId);
    const target = scwgViewBoxFor(box, blocks.length).join(" ");
    if (reducedMotion) {
      svg.setAttribute("viewBox", target);
      return;
    }
    const selection = select(svg);
    selection.transition().duration(560).attr("viewBox", target);
    return () => {
      selection.interrupt();
    };
  }, {
    dependencies: [activeId, blocks, reducedMotion],
    scope: rootRef,
  });

  // Anime.js owns the active connector dash offset. Each SVG path is authored
  // source-to-destination, so the negative offset follows the PFD arrowheads.
  useGSAP(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;
    const activeStreams = root.querySelectorAll<SVGPathElement>(".scwg-stream-active");
    if (activeStreams.length === 0) return;

    const flow = animeAnimate(activeStreams, {
      duration: 900,
      ease: "linear",
      loop: true,
      strokeDashoffset: { from: 0, to: -13 },
    });

    return () => {
      flow.cancel();
      activeStreams.forEach((path) => path.style.removeProperty("stroke-dashoffset"));
    };
  }, {
    dependencies: [activeId, reducedMotion],
    scope: rootRef,
  });

  const bindInspection = useGesture({
    onDrag: ({ offset: [x, y] }) => {
      inspectionX.set(clamp(x, -MAX_INSPECTION_OFFSET, MAX_INSPECTION_OFFSET));
      inspectionY.set(clamp(y, -MAX_INSPECTION_OFFSET, MAX_INSPECTION_OFFSET));
    },
    onPinch: ({ offset: [scale] }) => {
      inspectionScale.set(clamp(scale, MIN_INSPECTION_SCALE, MAX_INSPECTION_SCALE));
    },
  }, {
    drag: {
      bounds: {
        bottom: MAX_INSPECTION_OFFSET,
        left: -MAX_INSPECTION_OFFSET,
        right: MAX_INSPECTION_OFFSET,
        top: -MAX_INSPECTION_OFFSET,
      },
      enabled: inspectionEnabled && !reducedMotion,
      from: () => [inspectionX.get(), inspectionY.get()],
      rubberband: 0.12,
    },
    pinch: {
      enabled: inspectionEnabled && !reducedMotion,
      from: () => [inspectionScale.get(), 0],
      rubberband: true,
      scaleBounds: { max: MAX_INSPECTION_SCALE, min: MIN_INSPECTION_SCALE },
    },
  });

  const resetInspection = useCallback(() => {
    inspectionX.set(0);
    inspectionY.set(0);
    inspectionScale.set(1);
  }, [inspectionScale, inspectionX, inspectionY]);

  const setInspectionZoom = useCallback((delta: number) => {
    const nextScale = clamp(
      inspectionScale.get() + delta,
      MIN_INSPECTION_SCALE,
      MAX_INSPECTION_SCALE,
    );
    inspectionScale.set(nextScale);
    if (nextScale === 1) {
      inspectionX.set(0);
      inspectionY.set(0);
    }
  }, [inspectionScale, inspectionX, inspectionY]);

  const jumpToStage = useCallback((id: string, index: number) => {
    const section = sectionRefs.current[index];
    if (!section) return;

    void runViewTransition(() => {
      flushSync(() => send({ id, type: "STAGE.ACTIVATE" }));
      const targetTop = window.scrollY + section.getBoundingClientRect().top - window.innerHeight * 0.28;
      window.scrollTo({ behavior: "auto", top: targetTop });
    });
  }, [send]);

  return (
    <div
      className="scwg-process-scroller-layout mt-8 lg:grid lg:grid-cols-[minmax(0,34%)_minmax(0,66%)] lg:gap-10"
      ref={rootRef}
    >
      <div className="scwg-process-diagram-sticky sticky top-[3.25rem] z-20 mb-6 self-start lg:top-[3.25rem] lg:mb-0">
        <figure className="scwg-process-diagram-frame h-[44vh] overflow-hidden rounded-[2rem] border border-ink/10 bg-paper p-3 shadow-soft lg:h-[calc(100vh-4.5rem)] lg:bg-surface/40 lg:p-4 lg:shadow-none">
          <div className="scwg-process-instrument-bar">
            <div aria-live="polite" className="scwg-process-active-readout">
              <span>Active unit</span>
              <motion.strong
                animate={{ opacity: 1, y: 0 }}
                initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                key={activeBlock?.id}
                transition={{ duration: reducedMotion ? 0 : 0.18 }}
              >
                {activeBlock?.id} · {activeBlock?.diagramLabel ?? activeBlock?.name}
              </motion.strong>
            </div>

            <div aria-label="Process diagram inspection controls" className="scwg-process-inspection-controls" role="group">
              <button
                aria-pressed={inspectionEnabled}
                disabled={reducedMotion}
                onClick={() => {
                  if (inspectionEnabled) resetInspection();
                  send({ type: "INSPECTION.TOGGLE" });
                }}
                type="button"
              >
                {inspectionEnabled ? "Done" : "Inspect"}
              </button>
              <button aria-label="Zoom process diagram out" disabled={!inspectionEnabled || reducedMotion} onClick={() => setInspectionZoom(-0.25)} type="button">−</button>
              <button aria-label="Zoom process diagram in" disabled={!inspectionEnabled || reducedMotion} onClick={() => setInspectionZoom(0.25)} type="button">+</button>
              <button disabled={!inspectionEnabled || reducedMotion} onClick={resetInspection} type="button">Reset</button>
            </div>
          </div>

          <nav aria-label="Jump to process stage" className="scwg-process-stage-index">
            <span aria-hidden="true" className="scwg-process-stage-progress">
              <motion.span style={{ scaleX: chapterProgress }} />
            </span>
            <ol>
              {blocks.map((block, index) => {
                const isActive = block.id === activeId;
                return (
                  <li key={block.id}>
                    <button
                      aria-current={isActive ? "step" : undefined}
                      aria-label={`Jump to ${block.id}: ${block.name}`}
                      onClick={() => jumpToStage(block.id, index)}
                      type="button"
                    >
                      {isActive ? (
                        <motion.span
                          className="scwg-process-stage-marker"
                          layoutId="scwg-process-stage-marker"
                          style={{ viewTransitionName: "scwg-process-stage-marker" }}
                          transition={{ duration: reducedMotion ? 0 : 0.24 }}
                        />
                      ) : null}
                      <span>{block.id}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="scwg-process-diagram-viewport">
            <motion.div
              className="scwg-process-diagram-transform"
              data-inspection-enabled={inspectionEnabled ? "true" : undefined}
              style={{ scale: inspectionScale, x: inspectionX, y: inspectionY }}
            >
              <div
                {...bindInspection()}
                className="scwg-process-diagram-gesture-layer"
                style={{ touchAction: inspectionEnabled ? "none" : "pan-y" }}
              >
                <ScwgProcessDiagram activeId={activeId} blocks={blocks} ref={svgRef} reducedMotion={reducedMotion} />
              </div>
            </motion.div>
          </div>

          <figcaption className="scwg-process-flow-cue">
            <DotLottieAnimation
              ariaLabel="Material-flow activity indicator"
              className="scwg-process-flow-lottie"
              src="/animations/scwg-material-flow.json"
            />
            <span className="scwg-process-flow-cue-motion">Moving dashes show material direction</span>
            <span className="scwg-process-flow-cue-static">Arrowheads show material direction</span>
            <strong>{activeId}</strong>
          </figcaption>
        </figure>
      </div>

      <div className="scwg-process-reading-column space-y-8" ref={readingColumnRef}>
        {blocks.map((block, index) => (
          <div
            data-active={block.id === activeId ? "true" : undefined}
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
