"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";

type ButtonIdea = { style: string; name: string; toggle?: boolean };

const buttonIdeas: readonly ButtonIdea[] = [
  { style: "lift", name: "Lift" },
  { style: "liquid-glass", name: "Liquid glass" },
  { style: "soft", name: "Soft relief" },
  { style: "inset", name: "Inset" },
  { style: "wipe", name: "Colour wipe" },
  { style: "split", name: "Split layer" },
  { style: "spotlight", name: "Pointer spotlight" },
  { style: "magnetic", name: "Magnetic label" },
  { style: "pixel", name: "Pixel" },
  { style: "paper", name: "Folded paper" },
  { style: "brackets", name: "Closing brackets" },
  { style: "orbit", name: "Orbit" },
  { style: "underline", name: "Underline" },
  { style: "gradient-edge", name: "Gradient edge" },
  { style: "chromatic", name: "Chromatic shadow" },
  { style: "blob", name: "Morphing blob" },
  { style: "stitched", name: "Stitched" },
  { style: "tab", name: "Folder tab" },
  { style: "spring", name: "Spring capsule" },
  { style: "echo", name: "Echo rings" },
  { style: "slide-switch", name: "Slide switch", toggle: true },
  { style: "segmented-switch", name: "Segmented switch", toggle: true },
  { style: "traffic-switch", name: "Traffic-light switch", toggle: true },
  { style: "day-night", name: "Day and night switch", toggle: true },
  { style: "check-pop", name: "Pop checkbox", toggle: true },
  { style: "radio-wave", name: "Radio pulse", toggle: true },
  { style: "bubble-pop", name: "Bubble pop" },
  { style: "bubble-cluster", name: "Bubble cluster", toggle: true },
  { style: "jelly", name: "Jelly" },
  { style: "balloon", name: "Balloon", toggle: true },
  { style: "capsule-track", name: "Capsule track", toggle: true },
  { style: "dial", name: "Rotary dial", toggle: true },
  { style: "flip-switch", name: "Flip switch", toggle: true },
  { style: "rocker", name: "Rocker switch", toggle: true },
  { style: "power", name: "Power switch", toggle: true },
  { style: "morph-toggle", name: "Shape morph", toggle: true },
  { style: "expanding-border", name: "Expanding border" },
  { style: "neon", name: "Neon" },
  { style: "terminal", name: "Terminal" },
  { style: "brushed-metal", name: "Brushed metal" },
  { style: "prism-glass", name: "Prismatic glass" },
  { style: "bubble-glass", name: "Glass bubble" },
  { style: "dot-matrix", name: "Dot matrix" },
  { style: "marquee", name: "Marquee" },
  { style: "arrow-reveal", name: "Arrow reveal" },
  { style: "parentheses", name: "Parentheses" },
  { style: "cut-corner", name: "Cut corner" },
  { style: "price-tag", name: "Swinging tag" },
  { style: "stacked", name: "Stacked layers" },
  { style: "cube-flip", name: "Cube flip" },
  { style: "ring-pulse", name: "Pulse ring" },
  { style: "mesh", name: "Gradient mesh" },
  { style: "grain", name: "Paper grain" },
  { style: "wave-fill", name: "Wave fill", toggle: true },
  { style: "sheen", name: "Sheen sweep" },
  { style: "gooey-toggle", name: "Gooey switch", toggle: true },
  { style: "elastic-outline", name: "Elastic outline" },
  { style: "card-switch", name: "Card switch", toggle: true },
  { style: "status-toggle", name: "Status switch", toggle: true },
  { style: "aperture-toggle", name: "Aperture switch", toggle: true },
  { style: "lever-switch", name: "Mechanical lever", toggle: true },
  { style: "cassette-switch", name: "Cassette switch", toggle: true },
  { style: "piano-key", name: "Piano key", toggle: true },
  { style: "pull-cord", name: "Pull cord", toggle: true },
  { style: "fuse-switch", name: "Fuse switch", toggle: true },
  { style: "analog-meter", name: "Analog meter", toggle: true },
  { style: "zipper-switch", name: "Zipper switch", toggle: true },
  { style: "lock-toggle", name: "Padlock toggle", toggle: true },
  { style: "sliding-door", name: "Sliding doors", toggle: true },
  { style: "domino-toggle", name: "Domino toggle", toggle: true },
  { style: "liquid-capsule", name: "Liquid capsule" },
  { style: "concentric", name: "Concentric rings" },
  { style: "flower", name: "Flower" },
  { style: "sunburst", name: "Sunburst" },
  { style: "scalloped-stamp", name: "Scalloped stamp" },
  { style: "ticket-stub", name: "Ticket stub" },
  { style: "wax-seal", name: "Wax seal" },
  { style: "pebble", name: "Pebble" },
  { style: "cushion", name: "Cushion" },
  { style: "gel-key", name: "Gel key" },
  { style: "keycap", name: "Keyboard key" },
  { style: "typewriter", name: "Typewriter key" },
  { style: "arcade", name: "Arcade button" },
  { style: "gamepad", name: "Gamepad button" },
  { style: "hazard", name: "Hazard stripe" },
  { style: "holographic", name: "Holographic" },
  { style: "iridescent-pill", name: "Iridescent pill" },
  { style: "paperclip", name: "Paperclip" },
  { style: "postage-stamp", name: "Postage stamp" },
  { style: "torn-paper", name: "Torn paper" },
  { style: "draw-border", name: "Drawn border" },
  { style: "corner-focus", name: "Corner focus" },
  { style: "crosshair", name: "Crosshair" },
  { style: "radar", name: "Radar scan" },
  { style: "sonar-toggle", name: "Sonar switch", toggle: true },
  { style: "compass-toggle", name: "Compass switch", toggle: true },
  { style: "constellation", name: "Constellation" },
  { style: "particle-dots", name: "Particle burst" },
  { style: "ripple-pool", name: "Ripple pool" },
  { style: "black-hole", name: "Black hole" },
];

function trackPointer(event: ReactPointerEvent<HTMLButtonElement>) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  event.currentTarget.style.cssText = [
    `--pointer-x:${x}px`,
    `--pointer-y:${y}px`,
    `--magnet-x:${((x / bounds.width) - 0.5) * 8}px`,
    `--magnet-y:${((y / bounds.height) - 0.5) * 6}px`,
  ].join(";");
}

export function ButtonIdeas() {
  const [activeIdeas, setActiveIdeas] = useState<ReadonlySet<string>>(() => new Set());

  function toggleIdea(style: string) {
    setActiveIdeas((current) => {
      const next = new Set(current);
      if (next.has(style)) next.delete(style);
      else next.add(style);
      return next;
    });
  }

  return (
    <div className="button-ideas-grid" aria-label="One hundred button and switch design ideas">
      {buttonIdeas.map((idea, index) => (
        <div className="button-idea-stage" data-index={String(index + 1).padStart(2, "0")} key={idea.style}>
          <button
            aria-checked={idea.toggle ? activeIdeas.has(idea.style) : undefined}
            aria-label={`${idea.name}, design ${index + 1}`}
            className={`button-idea is-${idea.style}${activeIdeas.has(idea.style) ? " is-on" : ""}`}
            onClick={idea.toggle ? () => toggleIdea(idea.style) : undefined}
            onPointerMove={trackPointer}
            role={idea.toggle ? "switch" : undefined}
            title={`${index + 1}. ${idea.name}`}
            type="button"
          >
            <i aria-hidden="true" />
            <span>Button</span>
          </button>
        </div>
      ))}
    </div>
  );
}
