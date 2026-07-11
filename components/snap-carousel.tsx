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
        const railRect = rail.getBoundingClientRect();
        const railCenter = railRect.left + railRect.width / 2;
        const slots = Array.from(rail.querySelectorAll<HTMLElement>(".mobile-snap-slot:not(.is-clone)"));
        let closest: HTMLElement | null = null;
        let closestDistance = Number.POSITIVE_INFINITY;

        slots.forEach((slot) => {
          const slotRect = slot.getBoundingClientRect();
          const slotCenter = slotRect.left + slotRect.width / 2;
          const distance = Math.abs(slotCenter - railCenter);
          const progress = Math.max(0, 1 - distance / (slotRect.width * 1.15));
          const easedProgress = 1 - Math.pow(1 - progress, 2);
          const card = slot.querySelector<HTMLElement>(".mobile-snap-card");

          if (card) {
            const opacity = 0.42 + easedProgress * 0.58;
            const blur = (1 - easedProgress) * 2.4;
            const scale = 0.8 + easedProgress * 0.2;
            const shift = (1 - easedProgress) * 14;
            card.style.opacity = opacity.toFixed(3);
            card.style.filter = `blur(${blur.toFixed(2)}px)`;
            card.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
            card.style.zIndex = String(Math.round(easedProgress * 10));
          }

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
