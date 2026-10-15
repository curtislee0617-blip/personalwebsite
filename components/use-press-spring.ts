"use client";

import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type PointerEvent } from "react";
import { useReducedMotion, useSpring, type AnimatedProps } from "@react-spring/web";

type PressStyle = AnimatedProps<{ style: CSSProperties & { "--press-scale": number; "--press-y": string } }>["style"];

/** Individual transform properties leave positioning and menu transforms alone. */
export function usePressSpring(lift = 2, disabled = false) {
  const reducedMotion = useReducedMotion();
  const hovered = useRef(false);
  const pressed = useRef(false);
  const [style, api] = useSpring(() => ({
    scale: 1,
    y: 0,
    config: { mass: 0.55, tension: 360, friction: 28, precision: 0.001 },
  }));

  useEffect(() => {
    if (!disabled && !reducedMotion) return;
    hovered.current = false;
    pressed.current = false;
    api.stop();
    api.set({ scale: 1, y: 0 });
  }, [api, disabled, reducedMotion]);

  function move() {
    const reduce = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    void api.start({
      scale: reduce || disabled ? 1 : pressed.current ? 0.98 : hovered.current ? 1.012 : 1,
      y: reduce || disabled || pressed.current || !hovered.current ? 0 : -lift,
      immediate: Boolean(reduce || disabled),
      config: pressed.current
        ? { mass: 0.45, tension: 430, friction: 28 }
        : { mass: 0.55, tension: 360, friction: 28 },
    });
  }
  function reset() {
    hovered.current = false;
    pressed.current = false;
    api.stop();
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
      onPointerLeave: () => { hovered.current = false; pressed.current = false; move(); },
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.button !== 0 || disabled) return;
        pressed.current = true;
        move();
      },
      onPointerUp: () => { pressed.current = false; move(); },
      onPointerCancel: () => { hovered.current = false; pressed.current = false; move(); },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (!event.repeat && !disabled && (event.key === "Enter" || event.key === " ")) {
          pressed.current = true;
          move();
        }
      },
      onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          pressed.current = false;
          move();
        }
      },
      onBlur: () => { hovered.current = false; pressed.current = false; move(); },
    },
  };
}

/** Preserve caller prefetch, focus, and keyboard behavior alongside the spring. */
export function composePressHandlers<T extends HTMLElement>(
  spring: ReturnType<typeof usePressSpring>["handlers"],
  props: HTMLAttributes<T>,
): HTMLAttributes<T> {
  return {
    onPointerEnter: (event) => { props.onPointerEnter?.(event); spring.onPointerEnter(event); },
    onPointerLeave: (event) => { props.onPointerLeave?.(event); spring.onPointerLeave(); },
    onPointerDown: (event) => { props.onPointerDown?.(event); if (!event.defaultPrevented) spring.onPointerDown(event); },
    onPointerUp: (event) => { props.onPointerUp?.(event); spring.onPointerUp(); },
    onPointerCancel: (event) => { props.onPointerCancel?.(event); spring.onPointerCancel(); },
    onKeyDown: (event) => { props.onKeyDown?.(event); if (!event.defaultPrevented) spring.onKeyDown(event); },
    onKeyUp: (event) => { props.onKeyUp?.(event); spring.onKeyUp(event); },
    onBlur: (event) => { props.onBlur?.(event); spring.onBlur(); },
  };
}
