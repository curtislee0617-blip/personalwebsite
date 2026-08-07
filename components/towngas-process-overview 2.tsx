"use client";

import { createScope, createTimeline, stagger, type Timeline } from "animejs";
import { useEffect, useRef, useState } from "react";

const mainStages = [
  ["B1", "Feed preparation", "Slurry · 25 MPa"],
  ["B2", "SCWG", "625 °C · 25 MPa"],
  ["B3", "Salt separation", "Continuous underflow"],
  ["B4", "Depressurization + separation", "Heat recovery · water recycle"],
  ["B5", "Rectisol + ZnO", "Acid-gas removal"],
  ["B6", "Bi-reforming", "CO + H₂ ratio control"],
  ["B7", "OXZEO + recovery", "Light olefins"],
] as const;

const sideStreams = [
  { label: "Salt concentrate", route: "B3 → product / disposal", tone: "salt" },
  { label: "Water recycle", route: "B4 → B1", tone: "water" },
  { label: "Sulfur recovery", route: "B5 → sulfur product", tone: "sulfur" },
  { label: "CO₂ recycle", route: "B5 / B7 → B6", tone: "carbon" },
] as const;

export function TowngasProcessOverview() {
  const rootRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<Timeline | null>(null);
  const [canAnimate, setCanAnimate] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sequenceLabel, setSequenceLabel] = useState("Ready to trace B1–B8");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    const scope = createScope({
      root: rootRef,
      mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" },
    }).add((self) => {
      const reducedMotion = self?.matches.reduceMotion ?? false;
      const observerSupported = typeof IntersectionObserver !== "undefined";
      const animationSupported = !reducedMotion && observerSupported;

      timelineRef.current = null;
      setCanAnimate(animationSupported);
      if (!animationSupported) return;

      const timeline = createTimeline({
        autoplay: false,
        onBegin: () => {
          if (disposed) return;
          setHasPlayed(false);
          setIsPlaying(true);
        },
        onComplete: () => {
          if (disposed) return;
          setHasPlayed(true);
          setIsPlaying(false);
          setSequenceLabel("Trace complete · products and recycle resolved");
        },
      })
        .add("[data-flow-stage]", {
          opacity: [0.3, 1],
          y: [8, 0],
          duration: 360,
          delay: stagger(180),
          ease: "out(3)",
        }, 0)
        .add("[data-flow-branch]", {
          opacity: [0.24, 1],
          y: [7, 0],
          duration: 340,
          delay: stagger(120),
          ease: "out(3)",
        }, 1280)
        .add("[data-flow-output]", {
          opacity: [0.18, 1],
          y: [5, 0],
          duration: 280,
          delay: stagger(80),
          ease: "out(3)",
        }, 1820)
        .call(() => {
          if (!disposed) setSequenceLabel("Hydrothermal trains · B1–B4");
        }, 0)
        .call(() => {
          if (!disposed) setSequenceLabel("Gas conditioning + olefins · B5–B7");
        }, 760)
        .call(() => {
          if (!disposed) setSequenceLabel("Residue conditioning + recycle · B8 / R1");
        }, 1420)
        .call(() => {
          if (!disposed) setSequenceLabel("Recovered streams + products");
        }, 1940);

      timeline.seek(0, true);
      timelineRef.current = timeline;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting || entry.intersectionRatio < 0.28) return;
          observer.disconnect();
          timeline.restart();
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.28 },
      );
      observer.observe(root);

      return () => {
        observer.disconnect();
        if (timelineRef.current === timeline) timelineRef.current = null;
      };
    });

    return () => {
      disposed = true;
      scope.revert();
    };
  }, []);

  function playSequence() {
    const timeline = timelineRef.current;
    if (!timeline) return;
    timeline.restart();
  }

  return (
    <figure className="towngas-flow-figure" aria-labelledby="towngas-flow-title" ref={rootRef}>
      <div className="towngas-flow-heading">
        <div>
          <p className="eyebrow">Battery-limit architecture</p>
          <h3 id="towngas-flow-title">From wet waste to conditioned products</h3>
        </div>
        <div className="towngas-flow-heading-side">
          <p>Five B1–B4 hydrothermal trains feed one shared B5–B8 upgrading island.</p>
          <div className="towngas-flow-controls">
            <span aria-live="polite">{sequenceLabel}</span>
            <button disabled={!canAnimate || isPlaying} onClick={playSequence} type="button">
              <i aria-hidden="true" />
              {isPlaying ? "Tracing…" : hasPlayed ? "Replay trace" : "Trace process"}
            </button>
          </div>
        </div>
      </div>

      <ol className="towngas-flow-main" aria-label="Main process sequence">
        {mainStages.map(([id, title, detail], index) => (
          <li className="towngas-flow-stage" data-flow-stage key={id}>
            <span className="towngas-flow-id">{id}</span>
            <strong>{title}</strong>
            <small>{detail}</small>
            {index < mainStages.length - 1 ? <span aria-hidden="true" className="towngas-flow-arrow">→</span> : null}
          </li>
        ))}
      </ol>

      <div className="towngas-flow-lower" aria-label="Residue conditioning and recycle">
        <div className="towngas-flow-branch" data-flow-branch>
          <p className="towngas-flow-route"><strong>B4 solids</strong><span aria-hidden="true">→</span></p>
          <span className="towngas-flow-id">B8</span>
          <div>
            <strong>Red-mud conditioning</strong>
            <small>Wash · qualify · controlled purge</small>
          </div>
        </div>
        <div className="towngas-flow-recycle" data-flow-branch>
          <span className="towngas-flow-id">R1</span>
          <p><strong>B8 → R1 → B1 controlled mineral recycle</strong>, governed by iron inventory and contaminant accumulation.</p>
        </div>
        <div className="towngas-flow-product" data-flow-branch>
          <span aria-hidden="true">↗</span>
          <p><strong>Mineral residue purge</strong><br />Only qualified material leaves as product.</p>
        </div>
      </div>

      <ul className="towngas-flow-streams" aria-label="Recovered and recycled side streams">
        {sideStreams.map((stream) => (
          <li className={`towngas-flow-stream towngas-flow-stream--${stream.tone}`} data-flow-output key={stream.label}>
            <span>{stream.route}</span>
            <strong>{stream.label}</strong>
          </li>
        ))}
        <li className="towngas-flow-stream towngas-flow-stream--product" data-flow-output>
          <span>B7 → product recovery</span>
          <strong>Light-olefin product</strong>
        </li>
      </ul>

      <figcaption>
        Figure 2. Screening process-flow definition. Recycle and product arrows show intended routing, not piping-and-instrumentation detail; relief, isolation, drains, and sampling remain vendor-design work.
      </figcaption>
    </figure>
  );
}
