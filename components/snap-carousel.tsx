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
    if (!rail || !loops || !window.matchMedia("(max-width: 639px)").matches) return;

    const frame = window.requestAnimationFrame(() => {
      const first = rail.querySelector<HTMLElement>('[data-carousel-original="0"]');
      if (!first) return;
      rail.scrollLeft = first.offsetLeft - (rail.clientWidth - first.offsetWidth) / 2;
    });

    return () => window.cancelAnimationFrame(frame);
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
