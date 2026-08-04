"use client";

import { useDrag } from "@use-gesture/react";
import { motion, useReducedMotion, useSpring } from "motion/react";
import type { ReactNode } from "react";

export type GestureSurfaceProps = {
  children: ReactNode;
  ariaLabel?: string;
  axis?: "both" | "x" | "y";
  className?: string;
  maxDistance?: number;
};

function clamp(value: number, limit: number) {
  return Math.min(limit, Math.max(-limit, value));
}

/** Drag surface that composes use-gesture input with Motion spring values. */
export function GestureSurface({
  children,
  ariaLabel,
  axis = "both",
  className = "",
  maxDistance = 96,
}: GestureSurfaceProps) {
  const shouldReduceMotion = useReducedMotion();
  const x = useSpring(0, { damping: 24, stiffness: 340 });
  const y = useSpring(0, { damping: 24, stiffness: 340 });
  const bind = useDrag(({ active, movement: [movementX, movementY] }) => {
    if (shouldReduceMotion) return;
    x.set(active && axis !== "y" ? clamp(movementX, maxDistance) : 0);
    y.set(active && axis !== "x" ? clamp(movementY, maxDistance) : 0);
  }, {
    axis: axis === "both" ? undefined : axis,
    enabled: !shouldReduceMotion,
    filterTaps: true,
    rubberband: 0.14,
  });
  const touchAction = axis === "x" ? "pan-y" : axis === "y" ? "pan-x" : "none";

  return (
    <motion.div
      aria-label={ariaLabel}
      className={className}
      style={{ x, y }}
    >
      <div {...bind()} style={{ touchAction }}>
        {children}
      </div>
    </motion.div>
  );
}
