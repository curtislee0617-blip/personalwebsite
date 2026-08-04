"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { CanvasProps } from "@react-three/fiber";

const FiberCanvas = dynamic(
  () => import("@react-three/fiber").then((module) => module.Canvas),
  { ssr: false },
);

export type ThreeCanvasProps = {
  children: ReactNode;
  ariaLabel: string;
  camera?: CanvasProps["camera"];
  className?: string;
  dpr?: CanvasProps["dpr"];
  shadows?: CanvasProps["shadows"];
};

/** Lazily loaded React Three Fiber surface that idles under reduced motion. */
export function ThreeCanvas({
  children,
  ariaLabel,
  camera,
  className = "",
  dpr = [1, 1.75],
  shadows = false,
}: ThreeCanvasProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div aria-label={ariaLabel} className={`interaction-canvas ${className}`.trim()} role="img">
      <FiberCanvas
        aria-hidden="true"
        camera={camera}
        dpr={dpr}
        fallback={<span className="sr-only">WebGL is unavailable.</span>}
        frameloop={shouldReduceMotion ? "demand" : "always"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        shadows={shadows}
      >
        {children}
      </FiberCanvas>
    </div>
  );
}
