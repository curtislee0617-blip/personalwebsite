"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type GsapScrollSceneProps = {
  children: ReactNode;
  className?: string;
  end?: string;
  pin?: boolean;
  scrub?: boolean | number;
  start?: string;
};

/**
 * ScrollTrigger scene for descendants marked with `data-gsap-reveal`.
 * GSAP context handles teardown when the component unmounts or props change.
 */
export function GsapScrollScene({
  children,
  className = "",
  end = "bottom 35%",
  pin = false,
  scrub = false,
  start = "top 80%",
}: GsapScrollSceneProps) {
  const scope = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useGSAP(() => {
    const root = scope.current;
    if (!root) return;
    const targets = gsap.utils.toArray<HTMLElement>("[data-gsap-reveal]", root);
    if (targets.length === 0) return;

    if (shouldReduceMotion) {
      gsap.set(targets, { clearProps: "all" });
      return;
    }

    gsap.fromTo(targets, {
      autoAlpha: 0,
      y: 24,
    }, {
      autoAlpha: 1,
      duration: 0.72,
      ease: "power2.out",
      stagger: 0.08,
      y: 0,
      scrollTrigger: {
        end,
        once: !scrub,
        pin,
        scrub,
        start,
        trigger: root,
      },
    });
  }, {
    dependencies: [end, pin, scrub, shouldReduceMotion, start],
    revertOnUpdate: true,
    scope,
  });

  return <section className={className} ref={scope}>{children}</section>;
}
