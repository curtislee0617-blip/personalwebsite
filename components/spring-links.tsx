"use client";

import Link from "next/link";
import { animated } from "@react-spring/web";
import type { ComponentProps } from "react";
import { usePressSpring } from "@/components/use-press-spring";

const AnimatedLink = animated(Link);

type SpringLinkProps = ComponentProps<typeof Link> & { lift?: number };
type SpringAnchorProps = ComponentProps<"a"> & { lift?: number };

export function SpringLink({ lift = 2, className = "", style, ...props }: SpringLinkProps) {
  const spring = usePressSpring(lift);
  return (
    <AnimatedLink
      {...props}
      {...spring.handlers}
      className={`spring-control ${className}`.trim()}
      style={{ ...style, ...spring.style }}
    />
  );
}

export function SpringAnchor({ lift = 2, className = "", style, ...props }: SpringAnchorProps) {
  const spring = usePressSpring(lift);
  return (
    <animated.a
      {...props}
      {...spring.handlers}
      className={`spring-control ${className}`.trim()}
      style={{ ...style, ...spring.style }}
    />
  );
}
