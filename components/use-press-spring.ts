"use client";

import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { useReducedMotion, useSpring, type AnimatedProps } from "@react-spring/web";

type PressStyle = AnimatedProps<{ style: CSSProperties & { "--press-scale": number; "--press-y": string } }>["style"];

/** Individual transform properties leave positioning and menu transforms alone. */
export function usePressSpring(lift = 2) {
  const reducedMotion = useReducedMotion();
  const hovered = useRef(false);
  const [style, api] = useSpring(() => ({
    scale: 1,
    y: 0,
    config: { mass: 0.65, tension: 360, friction: 24 },
  }));
  function move(pressed = false) {
    const reduce = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    void api.start({
      scale: reduce ? 1 : pressed ? 0.965 : hovered.current ? 1.025 : 1,
      y: reduce || pressed || !hovered.current ? 0 : -lift,
      immediate: Boolean(reduce),
    });
  }
  function reset() {
    hovered.current = false;
    api.set({ scale: 1, y: 0 });
  }
  return {
    style: { "--press-scale": style.scale, "--press-y": style.y.to((y) => `${y}px`) } as PressStyle,
    reset,
    handlers: {
      onPointerEnter: (event: PointerEvent<HTMLElement>) => {
        hovered.current = event.pointerType === "mouse";
        move();
      },
      onPointerLeave: () => { hovered.current = false; move(); },
      onPointerDown: (event: PointerEvent<HTMLElement>) => { if (event.button === 0) move(true); },
      onPointerUp: () => move(),
      onPointerCancel: () => { hovered.current = false; move(); },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (!event.repeat && (event.key === "Enter" || event.key === " ")) move(true);
      },
      onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "Enter" || event.key === " ") move();
      },
      onBlur: () => { hovered.current = false; move(); },
    },
  };
}
