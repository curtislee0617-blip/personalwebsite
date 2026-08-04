"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  DotLottieReact,
  type DotLottie,
  type DotLottieReactProps,
} from "@lottiefiles/dotlottie-react";

export type DotLottieAnimationProps = {
  src: string;
  ariaLabel: string;
  autoplay?: boolean;
  className?: string;
  loop?: boolean;
  mode?: DotLottieReactProps["mode"];
  speed?: number;
};

/** Canvas-based .lottie/JSON player that pauses for reduced-motion users. */
export function DotLottieAnimation({
  src,
  ariaLabel,
  autoplay = true,
  className = "",
  loop = true,
  mode = "forward",
  speed = 1,
}: DotLottieAnimationProps) {
  const shouldReduceMotion = useReducedMotion();
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);

  useEffect(() => {
    if (!dotLottie) return;
    if (shouldReduceMotion || !autoplay) dotLottie.pause();
    else dotLottie.play();
  }, [autoplay, dotLottie, shouldReduceMotion]);

  return (
    <div aria-label={ariaLabel} className={`interaction-canvas ${className}`.trim()} role="img">
      <DotLottieReact
        aria-hidden="true"
        autoplay={autoplay && !shouldReduceMotion}
        className="h-full w-full"
        dotLottieRefCallback={setDotLottie}
        loop={loop}
        mode={mode}
        speed={speed}
        src={src}
      />
    </div>
  );
}
