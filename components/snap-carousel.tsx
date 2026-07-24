"use client";

import { Children, cloneElement, isValidElement, useLayoutEffect, useRef, type ReactElement, type ReactNode } from "react";

function inertCopy(item: ReactNode) {
  if (!isValidElement(item)) return item;
  return cloneElement(item as ReactElement<{ id?: string; tabIndex?: number }>, { id: undefined, tabIndex: -1 });
}

type SnapCarouselProps = {
  children: ReactNode;
  className: string;
  repeatEdges?: boolean;
  onActiveIndexChange?: (index: number) => void;
};

export function SnapCarousel({ children, className, repeatEdges = true, onActiveIndexChange }: SnapCarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(-1);
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
      rail.style.removeProperty("--carousel-gutter");
    };

    const updateGutter = () => {
      const firstSlot = rail.querySelector<HTMLElement>('[data-carousel-original="0"]');
      if (!firstSlot || !mobileQuery.matches) return;
      const railGap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
      const gutter = Math.max(0, (rail.clientWidth - firstSlot.offsetWidth) / 2 - railGap);
      rail.style.setProperty("--carousel-gutter", `${gutter}px`);
    };

    const updateFocusedCard = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        if (!mobileQuery.matches) {
          clearDepthStyles();
          return;
        }

        if (rail.clientWidth === 0) return;
        const railCenter = rail.scrollLeft + rail.clientWidth / 2;
        const slots = Array.from(rail.querySelectorAll<HTMLElement>(".mobile-snap-slot:not(.is-clone)"));
        let closestSlotIndex = -1;
        let closestDistance = Number.POSITIVE_INFINITY;

        slots.forEach((slot, slotIndex) => {
          if (slot.offsetWidth === 0) return;
          const slotCenter = slot.offsetLeft + slot.offsetWidth / 2;
          const signedDistance = slotCenter - railCenter;
          const distance = Math.abs(signedDistance);
          const normalizedDistance = Math.max(-1, Math.min(1, signedDistance / (slot.offsetWidth * 1.15)));
          const progress = Math.max(0, 1 - Math.abs(normalizedDistance));
          const easedProgress = 1 - Math.pow(1 - progress, 2);
          const depth = slot.firstElementChild as HTMLElement | null;

          if (depth) {
            const opacity = 0.34 + easedProgress * 0.66;
            const scale = 0.76 + easedProgress * 0.24;
            const directionalFalloff = normalizedDistance * Math.abs(normalizedDistance);
            const shiftX = directionalFalloff * -18;
            const shiftY = (1 - easedProgress) * 18;
            const rotateY = directionalFalloff * -7;
            depth.style.opacity = opacity.toFixed(3);
            depth.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0) scale(${scale.toFixed(3)}) rotateY(${rotateY.toFixed(2)}deg)`;
            depth.style.zIndex = String(Math.round(easedProgress * 10));
          }

          if (distance < closestDistance) {
            closestSlotIndex = slotIndex;
            closestDistance = distance;
          }
        });

        slots.forEach((slot, slotIndex) => slot.classList.toggle("is-focused", slotIndex === closestSlotIndex));

        if (closestSlotIndex >= 0) {
          const activeIndex = Number(slots[closestSlotIndex]?.dataset.carouselOriginal);
          if (Number.isInteger(activeIndex) && activeIndex !== activeIndexRef.current) {
            activeIndexRef.current = activeIndex;
            onActiveIndexChange?.(activeIndex);
          }
        }
      });
    };

    const frame = window.requestAnimationFrame(() => {
      if (mobileQuery.matches) {
        updateGutter();
        const first = rail.querySelector<HTMLElement>('[data-carousel-original="0"]');
        if (first && rail.scrollLeft < 1) {
          const railRect = rail.getBoundingClientRect();
          const firstRect = first.getBoundingClientRect();
          rail.scrollLeft += firstRect.left + firstRect.width / 2 - (railRect.left + railRect.width / 2);
        }
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
  }, [items.length, loops, onActiveIndexChange]);

  return (
    <div className={className} ref={railRef}>
      <div aria-hidden="true" className="mobile-snap-spacer" />
      {loops && <div aria-hidden="true" className="mobile-snap-slot is-clone" inert><div className="mobile-snap-depth">{inertCopy(items[items.length - 1])}</div></div>}
      {items.map((item, index) => (
        <div className="mobile-snap-slot" data-carousel-original={index} key={index}>
          <div className="mobile-snap-depth">{item}</div>
        </div>
      ))}
      {loops && <div aria-hidden="true" className="mobile-snap-slot is-clone" inert><div className="mobile-snap-depth">{inertCopy(items[0])}</div></div>}
      <div aria-hidden="true" className="mobile-snap-spacer" />
    </div>
  );
}
