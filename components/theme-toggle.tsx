"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";

type ViewTransition = { ready: Promise<void>; finished: Promise<void> };
type DocumentWithViewTransitions = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

const THEME_TRANSITION_MS = 760;
const FALLBACK_TRANSITION_MS = 560;
const THEME_TRANSITION_EASING = "cubic-bezier(.16, 1, .3, 1)";

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

export function ThemeToggle({ variant = "floating" }: { variant?: "floating" | "menu-row" | "dashboard" }) {
  const [state, setState] = useState({ mounted: false, isDark: false });
  const transitionInProgress = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the dark-mode class the pre-hydration theme-init script already set on <html>
    setState({ mounted: true, isDark: document.documentElement.classList.contains("dark") });
  }, []);

  const { mounted, isDark } = state;

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    if (transitionInProgress.current) return;

    const next = !isDark;
    const button = event.currentTarget;
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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      flip();
      return;
    }

    transitionInProgress.current = true;
    const root = document.documentElement;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    ) + 2;
    const animateIcon = () => button.querySelector("svg")?.animate(
      [
        { opacity: 0.72, transform: `rotate(${next ? -22 : 22}deg) scale(0.82)` },
        { opacity: 1, transform: "rotate(0deg) scale(1)" },
      ],
      {
        duration: 420,
        easing: THEME_TRANSITION_EASING,
      },
    );
    const cleanup = () => {
      delete button.dataset.themeAnimating;
      delete root.dataset.themeTransition;
      delete root.dataset.themeColorTransition;
      transitionInProgress.current = false;
    };

    button.dataset.themeAnimating = "true";
    const doc = document as DocumentWithViewTransitions;

    if (typeof doc.startViewTransition === "function") {
      root.dataset.themeTransition = "radial";

      let transition: ViewTransition;
      try {
        transition = doc.startViewTransition(flip);
      } catch {
        cleanup();
        flip();
        return;
      }

      const animations: Animation[] = [];
      transition.ready
        .then(() => {
          animations.push(root.animate(
            [
              { clipPath: `circle(0px at ${x}px ${y}px)` },
              { clipPath: `circle(${radius * 0.18}px at ${x}px ${y}px)`, offset: 0.22 },
              { clipPath: `circle(${radius * 0.58}px at ${x}px ${y}px)`, offset: 0.62 },
              { clipPath: `circle(${radius}px at ${x}px ${y}px)` },
            ],
            {
              duration: THEME_TRANSITION_MS,
              easing: THEME_TRANSITION_EASING,
              fill: "forwards",
              pseudoElement: "::view-transition-new(root)",
            },
          ));

          const iconAnimation = animateIcon();
          if (iconAnimation) animations.push(iconAnimation);
        })
        .catch(() => undefined);

      const finishTransition = () => {
        animations.forEach((animation) => animation.cancel());
        cleanup();
      };
      transition.finished.then(finishTransition, finishTransition);
      return;
    }

    root.dataset.themeColorTransition = "active";
    const halo = document.createElement("span");
    halo.className = "theme-transition-halo";
    halo.style.left = `${x}px`;
    halo.style.top = `${y}px`;
    document.body.append(halo);
    root.getBoundingClientRect();

    window.requestAnimationFrame(() => {
      flip();

      const haloScale = Math.max(1, radius / 24);
      const haloAnimation = halo.animate(
        [
          { opacity: 0.44, transform: "translate(-50%, -50%) scale(0.2)" },
          { offset: 0.5, opacity: 0.2, transform: `translate(-50%, -50%) scale(${haloScale * 0.56})` },
          { opacity: 0, transform: `translate(-50%, -50%) scale(${haloScale})` },
        ],
        {
          duration: FALLBACK_TRANSITION_MS,
          easing: THEME_TRANSITION_EASING,
          fill: "forwards",
        },
      );
      const iconAnimation = animateIcon();

      Promise.all([
        haloAnimation.finished.catch(() => undefined),
        iconAnimation?.finished.catch(() => undefined) ?? Promise.resolve(),
      ]).finally(() => {
        halo.remove();
        cleanup();
      });
    });
  }

  if (!mounted) return null;

  if (variant === "menu-row") {
    return (
      <button
        aria-label="Toggle dark mode"
        className="theme-toggle-menu-row site-menu-link site-menu-theme-toggle col-span-2 flex items-center justify-between rounded-2xl px-4 py-3 text-sm"
        onClick={toggle}
        type="button"
      >
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    );
  }

  if (variant === "dashboard") {
    return (
      <button
        aria-label="Toggle dark mode"
        className="theme-toggle dashboard-theme-toggle"
        onClick={toggle}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        type="button"
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    );
  }

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-toggle home-theme-toggle"
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      <span className="home-theme-toggle-label">{isDark ? "Light mode" : "Dark mode"}</span>
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
