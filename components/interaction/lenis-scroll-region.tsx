"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

export type LenisScrollRegionProps = {
  children: ReactNode;
  className?: string;
  options?: ComponentProps<typeof ReactLenis>["options"];
};

/**
 * Opt-in smooth-scroll region. It intentionally does not mount Lenis at the
 * document root and falls back to native scrolling for reduced motion.
 */
export function LenisScrollRegion({ children, className = "", options }: LenisScrollRegionProps) {
  const reducedMotion = Boolean(useReducedMotion());

  if (reducedMotion) return <div className={className}>{children}</div>;

  return (
    <ReactLenis
      className={className}
      options={{
        anchors: true,
        autoRaf: true,
        lerp: 0.1,
        overscroll: true,
        smoothWheel: true,
        ...options,
      }}
      root={false}
    >
      {children}
    </ReactLenis>
  );
}
