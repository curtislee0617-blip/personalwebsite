"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";

type ViewTransition = { ready: Promise<void>; finished: Promise<void> };
type DocumentWithViewTransitions = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

const DARK_TO_LIGHT_MS = 1450;
const LAPTOP_DARK_TO_LIGHT_MS = 1120;
const LIGHT_TO_DARK_MS = 1240;
const EXPAND_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const LAPTOP_EXPAND_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const CONTRACT_EASING = "cubic-bezier(0.45, 0, 0.2, 1)";
const FALLBACK_TRANSITION_MS = 760;

function SunIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.15 5.85l-2.1 2.1M7.95 16.05l-2.1 2.1M18.15 18.15l-2.1-2.1M7.95 7.95l-2.1-2.1" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.4 14.7A8.6 8.6 0 0 1 9.3 3.6a8.6 8.6 0 1 0 11.1 11.1Z" />
    </svg>
  );
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  window.localStorage.setItem("theme", isDark ? "dark" : "light");
}

export function ThemeToggle({ variant = "floating" }: { variant?: "floating" | "menu-row" }) {
  const [state, setState] = useState({ mounted: false, isDark: false });
  const transitionInProgress = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the dark-mode class the pre-hydration theme-init script already set on <html>
    setState({ mounted: true, isDark: document.documentElement.classList.contains("dark") });
  }, []);

  const { mounted, isDark } = state;

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const next = !isDark;
    const bounds = event.currentTarget.getBoundingClientRect();
    const iconBounds = event.currentTarget.querySelector("svg")?.getBoundingClientRect();
    const x = iconBounds ? iconBounds.left + iconBounds.width / 2 : bounds.left + bounds.width / 2;
    const y = iconBounds ? iconBounds.top + iconBounds.height / 2 : bounds.top + bounds.height / 2;
    const flip = () => {
      applyTheme(next);
      flushSync(() => {
        setState((prev) => ({ ...prev, isDark: next }));
      });
    };

    const doc = document as DocumentWithViewTransitions;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      flip();
      return;
    }

    if (transitionInProgress.current) return;
    transitionInProgress.current = true;

    if (typeof doc.startViewTransition !== "function") {
      document.documentElement.dataset.themeColorTransition = "true";
      document.documentElement.getBoundingClientRect();
      flip();
      window.setTimeout(() => {
        delete document.documentElement.dataset.themeColorTransition;
        transitionInProgress.current = false;
      }, FALLBACK_TRANSITION_MS);
      return;
    }

    document.documentElement.dataset.themeTransition = next ? "light-to-dark" : "dark-to-light";
    const transition = doc.startViewTransition(flip);
    transition.ready
      .then(() => {
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        const buttonRadius = Math.max(iconBounds?.width ?? bounds.width, iconBounds?.height ?? bounds.height) / 2;
        const isLightToDark = next;
        const isMobileTransition = window.matchMedia("(max-width: 899px), (pointer: coarse)").matches;
        const moss = window.getComputedStyle(document.documentElement).getPropertyValue("--color-moss").trim();
        const edgeColor = `rgb(${moss} / 0.42)`;
        const opacity = (desktopOpacity: number) => isMobileTransition ? 1 : desktopOpacity;
        const edge = (desktopBlur: number) => `drop-shadow(0 0 ${isMobileTransition ? Math.min(desktopBlur, 4) : desktopBlur}px ${edgeColor})`;
        const expandKeyframes: Keyframe[] = isMobileTransition
          ? [
              { clipPath: `circle(${buttonRadius}px at ${x}px ${y}px)`, filter: edge(5), opacity: 1 },
              { clipPath: `circle(${radius * 0.28}px at ${x}px ${y}px)`, filter: edge(13), offset: 0.28, opacity: 1 },
              { clipPath: `circle(${radius * 0.72}px at ${x}px ${y}px)`, filter: edge(9), offset: 0.68, opacity: 1 },
              { clipPath: `circle(${radius}px at ${x}px ${y}px)`, filter: edge(0), opacity: 1 },
            ]
          : [
              { clipPath: `circle(${buttonRadius}px at ${x}px ${y}px)`, filter: edge(3), opacity: 1 },
              { clipPath: `circle(${radius * 0.18}px at ${x}px ${y}px)`, filter: edge(6), offset: 0.2, opacity: 1 },
              { clipPath: `circle(${radius * 0.48}px at ${x}px ${y}px)`, filter: edge(8), offset: 0.5, opacity: 1 },
              { clipPath: `circle(${radius * 0.78}px at ${x}px ${y}px)`, filter: edge(5), offset: 0.8, opacity: 1 },
              { clipPath: `circle(${radius}px at ${x}px ${y}px)`, filter: edge(0), opacity: 1 },
            ];
        const keyframes: Keyframe[] = isLightToDark
          ? [
              { clipPath: `circle(${radius}px at ${x}px ${y}px)`, filter: edge(0), opacity: 1 },
              { clipPath: `circle(${radius * 0.42}px at ${x}px ${y}px)`, filter: edge(12), offset: 0.64, opacity: opacity(0.92) },
              { clipPath: `circle(${buttonRadius * 1.8}px at ${x}px ${y}px)`, filter: edge(7), offset: 0.9, opacity: opacity(0.56) },
              { clipPath: `circle(0px at ${x}px ${y}px)`, filter: edge(0), opacity: opacity(0) },
            ]
          : expandKeyframes;
        document.documentElement.animate(
          keyframes,
          {
            duration: isLightToDark ? LIGHT_TO_DARK_MS : isMobileTransition ? DARK_TO_LIGHT_MS : LAPTOP_DARK_TO_LIGHT_MS,
            easing: isLightToDark ? CONTRACT_EASING : isMobileTransition ? EXPAND_EASING : LAPTOP_EXPAND_EASING,
            fill: "forwards",
            pseudoElement: isLightToDark ? "::view-transition-old(root)" : "::view-transition-new(root)",
          },
        );
      })
      .catch(() => undefined)
      .finally(() => {
        transition.finished.finally(() => {
          delete document.documentElement.dataset.themeTransition;
          transitionInProgress.current = false;
        });
      });
  }

  if (!mounted) return null;

  if (variant === "menu-row") {
    return (
      <button
        aria-label="Toggle dark mode"
        className="theme-toggle-menu-row col-span-2 flex items-center justify-between rounded-2xl bg-ink/[0.04] px-4 py-3 text-sm text-ink/65 transition hover:bg-ink/[0.08] hover:text-ink"
        onClick={toggle}
        type="button"
      >
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    );
  }

  return (
    <button
      aria-label="Toggle dark mode"
      className="theme-toggle fixed bottom-5 right-5 z-20 grid h-12 w-12 place-items-center rounded-full bg-ink text-paper shadow-[0_12px_30px_rgba(32,35,31,0.2)] transition hover:scale-105"
      onClick={toggle}
      type="button"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
