"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Two lightweight, progressive-enhancement interactions shared across pages:
//
//  1. Scroll reveal — offscreen elements marked with `data-reveal` fade and
//     lift as they approach the viewport. Already visible content stays settled,
//     so hydration and streamed responses never hide something the user saw.
//  2. Pointer spotlight — cards marked with `data-spotlight` track the pointer
//     with a soft highlight by exposing `--spotlight-x` / `--spotlight-y`.
export function SiteInteractions() {
  const pathname = usePathname();

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (
      preference.matches
      || typeof IntersectionObserver === "undefined"
      || typeof Element.prototype.animate !== "function"
    ) return;

    const registeredTargets = new WeakSet<HTMLElement>();
    const animations = new Set<Animation>();
    let disposed = false;

    const animateTarget = (target: HTMLElement) => {
      if (
        disposed
        || preference.matches
        || !target.isConnected
        || document.documentElement.classList.contains("dashboard-liquid-transition")
        // Fast scrolling can already have exposed the card before the callback.
        || target.getBoundingClientRect().top < window.innerHeight - 24
      ) return;

      const style = getComputedStyle(target);
      const delay = Math.min(80, Math.max(0, Number.parseFloat(style.getPropertyValue("--reveal-delay")) || 0));
      // Press springs own their transforms and individual translate property.
      // A fade can run alongside them without cancelling an active interaction.
      const canLift = !target.classList.contains("spring-control")
        && CSS.supports("translate", "0 10px")
        && (!style.translate || style.translate === "none");
      const animation = target.animate(
        canLift
          ? [{ opacity: 0, translate: "0 10px" }, { opacity: style.opacity, translate: "0 0" }]
          : [{ opacity: 0 }, { opacity: style.opacity }],
        {
          delay,
          duration: 420,
          easing: "cubic-bezier(.22, 1, .36, 1)",
          fill: "backwards",
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
          animateTarget(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px 64px 0px", threshold: 0 },
    );

    const registerTarget = (target: HTMLElement) => {
      if (disposed || registeredTargets.has(target)) return;
      registeredTargets.add(target);

      // Avoid replaying an entrance over already-painted or streamed content,
      // including hidden accordions and horizontally scrolling carousel cards.
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.top < window.innerHeight + 24) return;
      observer.observe(target);
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

    const stopReveals = () => {
      disposed = true;
      observer.disconnect();
      mutationObserver.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
    const syncPreference = () => {
      if (preference.matches) stopReveals();
    };
    preference.addEventListener("change", syncPreference);

    return () => {
      stopReveals();
      preference.removeEventListener("change", syncPreference);
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
