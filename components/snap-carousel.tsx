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
    if (!rail) return;

    let animationFrame = 0;
    const mobileQuery = window.matchMedia("(max-width: 639px)");

    const clearDepthStyles = () => {
      rail.querySelectorAll<HTMLElement>(".mobile-snap-depth").forEach((depth) => {
        depth.removeAttribute("style");
      });
    };

    const updateFocusedCard = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        if (!mobileQuery.matches) {
          clearDepthStyles();
          return;
        }

        const railRect = rail.getBoundingClientRect();
        if (railRect.width === 0) return;
        const railCenter = railRect.left + railRect.width / 2;
        const slots = Array.from(rail.querySelectorAll<HTMLElement>(".mobile-snap-slot:not(.is-clone)"));
        let closest: HTMLElement | null = null;
        let closestDistance = Number.POSITIVE_INFINITY;

        slots.forEach((slot) => {
          const slotRect = slot.getBoundingClientRect();
          if (slotRect.width === 0) return;
          const slotCenter = slotRect.left + slotRect.width / 2;
          const signedDistance = slotCenter - railCenter;
          const distance = Math.abs(signedDistance);
          const progress = Math.max(0, 1 - distance / (slotRect.width * 1.15));
          const easedProgress = 1 - Math.pow(1 - progress, 2);
          const depth = slot.firstElementChild as HTMLElement | null;

          if (depth) {
            const direction = Math.sign(signedDistance);
            const opacity = 0.34 + easedProgress * 0.66;
            const blur = (1 - easedProgress) * 3.2;
            const scale = 0.76 + easedProgress * 0.24;
            const shiftX = direction * (1 - easedProgress) * -18;
            const shiftY = (1 - easedProgress) * 18;
            const rotateY = direction * (1 - easedProgress) * -7;
            depth.style.opacity = opacity.toFixed(3);
            depth.style.filter = `blur(${blur.toFixed(2)}px)`;
            depth.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0) scale(${scale.toFixed(3)}) rotateY(${rotateY.toFixed(2)}deg)`;
            depth.style.zIndex = String(Math.round(easedProgress * 10));
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
      if (loops && mobileQuery.matches) {
        const first = rail.querySelector<HTMLElement>('[data-carousel-original="0"]');
        if (first) rail.scrollLeft = first.offsetLeft - (rail.clientWidth - first.offsetWidth) / 2;
      }
      updateFocusedCard();
    });

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateFocusedCard);
    resizeObserver?.observe(rail);
    const parentDetails = rail.closest("details");
    rail.addEventListener("scroll", updateFocusedCard, { passive: true });
    parentDetails?.addEventListener("toggle", updateFocusedCard);
    mobileQuery.addEventListener("change", updateFocusedCard);
    window.addEventListener("resize", updateFocusedCard, { passive: true });

    return () => {
      rail.removeEventListener("scroll", updateFocusedCard);
      parentDetails?.removeEventListener("toggle", updateFocusedCard);
      mobileQuery.removeEventListener("change", updateFocusedCard);
      window.removeEventListener("resize", updateFocusedCard);
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(animationFrame);
      clearDepthStyles();
    };
  }, [items.length, loops]);

  return (
    <div className={className} ref={railRef}>
      {loops && <div aria-hidden="true" className="mobile-snap-slot is-clone" inert><div className="mobile-snap-depth">{inertCopy(items[items.length - 1])}</div></div>}
      {items.map((item, index) => (
        <div className="mobile-snap-slot" data-carousel-original={index} key={index}>
          <div className="mobile-snap-depth">{item}</div>
        </div>
      ))}
      {loops && <div aria-hidden="true" className="mobile-snap-slot is-clone" inert><div className="mobile-snap-depth">{inertCopy(items[0])}</div></div>}
    </div>
  );
}
