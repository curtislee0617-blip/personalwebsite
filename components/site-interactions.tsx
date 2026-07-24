"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Two lightweight, progressive-enhancement interactions shared across pages:
//
//  1. Scroll reveal — elements marked with `data-reveal` fade and lift into
//     place the first time they enter the viewport. Content is fully visible
//     without JavaScript (the CSS only hides it once `js-reveal-ready` is set),
//     and the effect is skipped entirely under `prefers-reduced-motion`.
//  2. Pointer spotlight — cards marked with `data-spotlight` track the pointer
//     with a soft highlight by exposing `--spotlight-x` / `--spotlight-y`.
export function SiteInteractions() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("js-reveal-ready");

    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      revealTargets.forEach((target) => target.classList.add("is-revealed"));
      return () => root.classList.remove("js-reveal-ready");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // Elements taller than the viewport can never reach the 12% ratio,
          // so reveal them as soon as any part scrolls into view.
          const tall = entry.boundingClientRect.height > window.innerHeight * 0.8;
          if (entry.intersectionRatio < 0.12 && !tall) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: [0, 0.12] },
    );

    revealTargets.forEach((target) => {
      // Elements already on screen at load should reveal immediately so nothing
      // sits blank above the fold.
      if (target.getBoundingClientRect().top < window.innerHeight * 0.9) {
        target.classList.add("is-revealed");
      } else {
        observer.observe(target);
      }
    });

    return () => {
      observer.disconnect();
      root.classList.remove("js-reveal-ready");
    };
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let frame = 0;
    let pending: { card: HTMLElement; x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      if (!pending) return;
      const { card, x, y } = pending;
      card.style.setProperty("--spotlight-x", `${x}%`);
      card.style.setProperty("--spotlight-y", `${y}%`);
    };

    const handleMove = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>("[data-spotlight]");
      if (!card) return;

      const rect = card.getBoundingClientRect();
      pending = {
        card,
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };
      card.dataset.spotlightActive = "true";
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const handleOut = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>("[data-spotlight]");
      if (card && !card.contains(event.relatedTarget as Node | null)) {
        delete card.dataset.spotlightActive;
      }
    };

    document.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerout", handleOut, { passive: true });
    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerout", handleOut);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
