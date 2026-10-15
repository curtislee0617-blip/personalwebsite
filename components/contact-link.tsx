"use client";

import { animated } from "@react-spring/web";
import type { ComponentPropsWithoutRef } from "react";
import { composePressHandlers, usePressSpring } from "@/components/use-press-spring";

export function ContactLink(props: ComponentPropsWithoutRef<"a">) {
  const spring = usePressSpring(3);
  return <animated.a {...props} {...composePressHandlers(spring.handlers, props)} className="contact-link-card design-card spring-control" data-spotlight style={spring.style} />;
}
