"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Two lightweight, progressive-enhancement interactions shared across pages:
//
//  1. Scroll reveal — elements marked with `data-reveal` fade and lift into
//     place the first time they enter the viewport. The animation never changes
//     the rendered HTML or hides content in CSS, so streamed pages remain
//     readable before hydration and under unreliable network conditions.
//  2. Pointer spotlight — cards marked with `data-spotlight` track the pointer
//     with a soft highlight by exposing `--spotlight-x` / `--spotlight-y`.
export function SiteInteractions() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (
      reduceMotion
      || typeof IntersectionObserver === "undefined"
      || typeof Element.prototype.animate !== "function"
    ) return;

    const registeredTargets = new WeakSet<HTMLElement>();
    const animations = new Set<Animation>();

    const animateTarget = (target: HTMLElement) => {
      const delay = Number.parseFloat(
        getComputedStyle(target).getPropertyValue("--reveal-delay"),
      ) || 0;
      const animation = target.animate(
        [
          { opacity: 0, transform: "translateY(16px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          delay,
          duration: 620,
          easing: "cubic-bezier(.22, 1, .36, 1)",
        },
      );
      animations.add(animation);
      void animation.finished
        .catch(() => undefined)
        .finally(() => animations.delete(animation));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // Elements taller than the viewport can never reach the 12% ratio,
          // so reveal them as soon as any part scrolls into view.
          const tall = entry.boundingClientRect.height > window.innerHeight * 0.8;
          if (entry.intersectionRatio < 0.12 && !tall) return;
          animateTarget(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: [0, 0.12] },
    );

    const registerTarget = (target: HTMLElement) => {
      if (registeredTargets.has(target)) return;
      registeredTargets.add(target);

      // Elements already on screen at load should reveal immediately so nothing
      // sits blank above the fold.
      if (target.getBoundingClientRect().top < window.innerHeight * 0.9) {
        animateTarget(target);
      } else {
        observer.observe(target);
      }
    };

    const registerTree = (node: Node) => {
      if (!(node instanceof Element)) return;
      if (node.matches("[data-reveal]")) registerTarget(node as HTMLElement);
      node.querySelectorAll<HTMLElement>("[data-reveal]").forEach(registerTarget);
    };

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(registerTarget);

    // App Router responses can stream into the document after this effect has
    // mounted on slow connections. Register those late nodes as they arrive so
    // the reveal enhancement can never leave real page content transparent.
    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(registerTree));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      animations.forEach((animation) => animation.cancel());
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
