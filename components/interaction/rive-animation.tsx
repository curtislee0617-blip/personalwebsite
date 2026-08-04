"use client";

import { useEffect } from "react";
import { useReducedMotion } from "motion/react";
import { useRive } from "@rive-app/react-webgl2";

export type RiveAnimationProps = {
  src: string;
  ariaLabel: string;
  animations?: string | string[];
  artboard?: string;
  autoplay?: boolean;
  className?: string;
  stateMachines?: string | string[];
};

/** Client-only Rive canvas with an automatic reduced-motion pause. */
export function RiveAnimation({
  src,
  ariaLabel,
  animations,
  artboard,
  autoplay = true,
  className = "",
  stateMachines,
}: RiveAnimationProps) {
  const shouldReduceMotion = useReducedMotion();
  const { RiveComponent, rive } = useRive({
    src,
    animations,
    artboard,
    autoplay: autoplay && !shouldReduceMotion,
    stateMachines,
  });

  useEffect(() => {
    if (!rive) return;
    if (shouldReduceMotion || !autoplay) rive.pause();
    else rive.play();
  }, [autoplay, rive, shouldReduceMotion]);

  return (
    <div aria-label={ariaLabel} className={`interaction-canvas ${className}`.trim()} role="img">
      <RiveComponent aria-hidden="true" className="h-full w-full" />
    </div>
  );
}
