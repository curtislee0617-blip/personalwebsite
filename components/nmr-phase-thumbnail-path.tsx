"use client";

import { useEffect, useRef } from "react";

type SpectrumPeak = {
  position: number;
  width: number;
  intensity: number;
};

// Experimental ethanol ¹H NMR peak list (89.56 MHz, CDCl₃), SDBS/HMDB.
const ETHANOL_PEAKS: SpectrumPeak[] = [
  { position: 3.811, width: 0.018, intensity: 7 },
  { position: 3.730, width: 0.018, intensity: 27 },
  { position: 3.652, width: 0.018, intensity: 30 },
  { position: 3.576, width: 0.018, intensity: 8 },
  { position: 2.607, width: 0.022, intensity: 11 },
  { position: 2.599, width: 0.022, intensity: 9 },
  { position: 1.303, width: 0.017, intensity: 23 },
  { position: 1.286, width: 0.017, intensity: 2 },
  { position: 1.226, width: 0.017, intensity: 53 },
  { position: 1.207, width: 0.017, intensity: 2 },
  { position: 1.199, width: 0.017, intensity: 2 },
  { position: 1.146, width: 0.017, intensity: 20 },
];

const PHASE_KEYFRAMES = [200, 250, 150, 60, 110, 30, 340, 0] as const;
const ANIMATION_DURATION_MS = 4100;
const SWEEP_PORTION = 0.62;

function spectrumPath(phaseDeg: number) {
  const phase = (phaseDeg * Math.PI) / 180;
  const samples = 220;

  return Array.from({ length: samples }, (_, index) => {
    const ratio = index / (samples - 1);
    const position = 6 - ratio * 6;
    const signal = ETHANOL_PEAKS.reduce((sum, peak) => {
      const scaled = (position - peak.position) / peak.width;
      const absorption = 1 / (1 + scaled * scaled);
      const dispersion = scaled * absorption;
      return sum + peak.intensity * (Math.cos(phase) * absorption + Math.sin(phase) * dispersion);
    }, 0);
    const x = 8 + ratio * 144;
    const y = Math.min(88, Math.max(12, 74 - signal));
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

function shortestAngleDelta(from: number, to: number) {
  return ((to - from + 540) % 360) - 180;
}

function phaseAt(progress: number) {
  if (progress >= SWEEP_PORTION) return 0;

  const sweepProgress = progress / SWEEP_PORTION;
  const segmentProgress = sweepProgress * (PHASE_KEYFRAMES.length - 1);
  const segment = Math.min(PHASE_KEYFRAMES.length - 2, Math.floor(segmentProgress));
  const linearProgress = segmentProgress - segment;
  const easedProgress = linearProgress * linearProgress * (3 - 2 * linearProgress);
  const from = PHASE_KEYFRAMES[segment];
  const to = PHASE_KEYFRAMES[segment + 1];

  return from + shortestAngleDelta(from, to) * easedProgress;
}

const CORRECTED_SPECTRUM_PATH = spectrumPath(0);

export function NmrPhaseThumbnailPath() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const card = path?.closest<HTMLElement>(".tool-card");
    if (!path || !card) return;

    const slot = path.closest<HTMLElement>(".mobile-snap-slot");
    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let startTime = 0;
    let isRunning = false;
    let isHovered = false;
    let isFocusedWithin = false;

    const drawFrame = (timestamp: number) => {
      if (!isRunning) return;
      if (startTime === 0) startTime = timestamp;
      const progress = ((timestamp - startTime) % ANIMATION_DURATION_MS) / ANIMATION_DURATION_MS;
      path.setAttribute("d", spectrumPath(phaseAt(progress)));
      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    const stop = () => {
      isRunning = false;
      startTime = 0;
      window.cancelAnimationFrame(animationFrame);
      path.setAttribute("d", CORRECTED_SPECTRUM_PATH);
    };

    const updatePlayback = () => {
      const isMobileFocus = mobileQuery.matches && slot?.classList.contains("is-focused");
      const shouldRun = !reducedMotionQuery.matches && (isHovered || isFocusedWithin || isMobileFocus);

      if (shouldRun && !isRunning) {
        isRunning = true;
        animationFrame = window.requestAnimationFrame(drawFrame);
      } else if (!shouldRun && isRunning) {
        stop();
      }
    };

    const handlePointerEnter = () => {
      isHovered = true;
      updatePlayback();
    };
    const handlePointerLeave = () => {
      isHovered = false;
      updatePlayback();
    };
    const handleFocusIn = () => {
      isFocusedWithin = true;
      updatePlayback();
    };
    const handleFocusOut = () => {
      isFocusedWithin = false;
      updatePlayback();
    };

    const slotObserver = slot ? new MutationObserver(updatePlayback) : null;
    if (slot && slotObserver) {
      slotObserver.observe(slot, { attributes: true, attributeFilter: ["class"] });
    }
    card.addEventListener("pointerenter", handlePointerEnter);
    card.addEventListener("pointerleave", handlePointerLeave);
    card.addEventListener("focusin", handleFocusIn);
    card.addEventListener("focusout", handleFocusOut);
    mobileQuery.addEventListener("change", updatePlayback);
    reducedMotionQuery.addEventListener("change", updatePlayback);
    updatePlayback();

    return () => {
      slotObserver?.disconnect();
      card.removeEventListener("pointerenter", handlePointerEnter);
      card.removeEventListener("pointerleave", handlePointerLeave);
      card.removeEventListener("focusin", handleFocusIn);
      card.removeEventListener("focusout", handleFocusOut);
      mobileQuery.removeEventListener("change", updatePlayback);
      reducedMotionQuery.removeEventListener("change", updatePlayback);
      stop();
    };
  }, []);

  return <path className="tool-chart-line tool-nmr-phase-sweep" d={CORRECTED_SPECTRUM_PATH} ref={pathRef} />;
}
