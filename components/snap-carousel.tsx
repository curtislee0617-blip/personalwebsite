"use client";

import { Children, cloneElement, isValidElement, useLayoutEffect, useRef, type ReactElement, type ReactNode } from "react";

function inertCopy(item: ReactNode) {
  if (!isValidElement(item)) return item;
  return cloneElement(item as ReactElement<{ id?: string; tabIndex?: number }>, { id: undefined, tabIndex: -1 });
}

export function SnapCarousel({ children, className, repeatEdges = true }: { children: ReactNode; className: string; repeatEdges?: boolean }) {
  const railRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const loops = repeatEdges && items.length > 1;

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail || !window.matchMedia("(max-width: 639px)").matches) return;

    let animationFrame = 0;

    const updateFocusedCard = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const railCenter = rail.scrollLeft + rail.clientWidth / 2;
        const slots = Array.from(rail.querySelectorAll<HTMLElement>(".mobile-snap-slot:not(.is-clone)"));
        let closest: HTMLElement | null = null;
        let closestDistance = Number.POSITIVE_INFINITY;

        slots.forEach((slot) => {
          const distance = Math.abs(slot.offsetLeft + slot.offsetWidth / 2 - railCenter);
          if (distance < closestDistance) {
            closest = slot;
            closestDistance = distance;
          }
        });

        slots.forEach((slot) => slot.classList.toggle("is-focused", slot === closest));
      });
    };

    const frame = window.requestAnimationFrame(() => {
      if (loops) {
        const first = rail.querySelector<HTMLElement>('[data-carousel-original="0"]');
        if (first) rail.scrollLeft = first.offsetLeft - (rail.clientWidth - first.offsetWidth) / 2;
      }
      updateFocusedCard();
    });

    rail.addEventListener("scroll", updateFocusedCard, { passive: true });

    return () => {
      rail.removeEventListener("scroll", updateFocusedCard);
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [items.length, loops]);

  return (
    <div className={className} ref={railRef}>
      {loops && <div aria-hidden="true" className="mobile-snap-slot is-clone" inert>{inertCopy(items[items.length - 1])}</div>}
      {items.map((item, index) => (
        <div className="mobile-snap-slot" data-carousel-original={index} key={index}>
          {item}
        </div>
      ))}
      {loops && <div aria-hidden="true" className="mobile-snap-slot is-clone" inert>{inertCopy(items[0])}</div>}
    </div>
  );
}
