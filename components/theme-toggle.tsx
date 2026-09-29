"use client";

import { useSyncExternalStore, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { animated, useSpring } from "@react-spring/web";
import { usePressSpring } from "@/components/use-press-spring";

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};
type DocumentWithViewTransitions = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

const THEME_TRANSITION_MS = 1240;
const FALLBACK_TRANSITION_MS = 560;
const RADIAL_TRANSITION_EASING = "cubic-bezier(.22, .92, .25, 1)";

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

// Every mounted toggle reads the same theme, including the hidden desktop
// sidebar and mobile menu. Local component state drifted when switching layouts.
function subscribeTheme(onChange: () => void) {
  window.addEventListener("site-theme-change", onChange);
  return () => window.removeEventListener("site-theme-change", onChange);
}

function readTheme() {
  return document.documentElement.classList.contains("dark");
}

function readServerTheme() {
  return false;
}

function applyTheme(isDark: boolean) {
  flushSync(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.dispatchEvent(new Event("site-theme-change"));
  });
  try {
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch {
    // Blocked/full storage must not prevent switching themes this session.
  }
}

export function ThemeToggle({ variant = "floating" }: { variant?: "floating" | "menu-row" | "dashboard" }) {
  const spring = usePressSpring(1);
  const [iconSpring, iconApi] = useSpring(() => ({
    rotate: 0,
    scale: 1,
    opacity: 1,
    config: { mass: 0.65, tension: 330, friction: 25 },
  }));
  const isDark = useSyncExternalStore(subscribeTheme, readTheme, readServerTheme);
  const icon = (
    <animated.span
      className="theme-toggle-icon"
      style={{
        opacity: iconSpring.opacity,
        scale: iconSpring.scale,
        rotate: iconSpring.rotate.to((degrees) => `${degrees}deg`),
      }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </animated.span>
  );

  function settleIcon(next: boolean) {
    iconApi.set({ rotate: next ? -25 : 25, scale: 0.78, opacity: 0.72 });
    void iconApi.start({ rotate: 0, scale: 1, opacity: 1 });
  }

  async function toggle(event: MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    // A document can run only one theme transition, even with several toggles.
    if (root.dataset.themeTransition || root.dataset.themeColorTransition) return;

    spring.reset();
    const next = !readTheme();
    const button = event.currentTarget;
    // Menu rows are much wider than their icon. Anchor both directions to the
    // sun/moon itself, including keyboard activation and clicks on the label.
    const bounds = (button.querySelector("svg") ?? button).getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const flip = () => applyTheme(next);
    const doc = document as DocumentWithViewTransitions;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flip();
      iconApi.set({ rotate: 0, scale: 1, opacity: 1 });
      return;
    }

    if (typeof doc.startViewTransition !== "function") {
      root.dataset.themeColorTransition = "active";
      // Establish the fallback styles before changing the palette.
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      flip();
      settleIcon(next);
      window.setTimeout(() => delete root.dataset.themeColorTransition, FALLBACK_TRANSITION_MS);
      return;
    }

    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    ) + 2;
    const circle = (r: number) => `circle(${r}px at ${x}px ${y}px)`;
    let transition: ViewTransition | undefined;
    let animation: Animation | undefined;
    root.dataset.themeTransition = next ? "light-to-dark" : "dark-to-light";
    button.dataset.themeAnimating = "true";

    try {
      transition = doc.startViewTransition(flip);
      // Observe both promises immediately, including browsers that skip capture.
      const finished = transition.finished.catch(() => undefined);
      const updated = transition.updateCallbackDone.catch(() => undefined);
      await transition.ready;
      settleIcon(next);
      animation = root.animate(
        { clipPath: next ? [circle(radius), circle(0)] : [circle(0), circle(radius)] },
        {
          duration: THEME_TRANSITION_MS,
          easing: RADIAL_TRANSITION_EASING,
          fill: "both",
          pseudoElement: next ? "::view-transition-old(root)" : "::view-transition-new(root)",
        },
      );
      await Promise.all([finished, updated]);
    } catch {
      // Unsupported capture/animation should still apply exactly one theme flip.
      transition?.skipTransition();
      if (transition) await transition.updateCallbackDone.catch(() => undefined);
      if (readTheme() !== next) flip();
      settleIcon(next);
    } finally {
      animation?.cancel();
      delete button.dataset.themeAnimating;
      delete root.dataset.themeTransition;
    }
  }

  if (variant === "menu-row") {
    return (
      <animated.button
        {...spring.handlers}
        style={spring.style}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="spring-control theme-toggle-menu-row site-menu-link site-menu-theme-toggle col-span-2 flex items-center justify-between rounded-2xl px-4 py-3 text-sm"
        onClick={toggle}
        type="button"
      >
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
        {icon}
      </animated.button>
    );
  }

  if (variant === "dashboard") {
    return (
      <animated.button
        {...spring.handlers}
        style={spring.style}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="spring-control theme-toggle dashboard-theme-toggle"
        onClick={toggle}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        type="button"
      >
        {icon}
      </animated.button>
    );
  }

  return (
    <animated.button
        {...spring.handlers}
        style={spring.style}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="spring-control theme-toggle home-theme-toggle"
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      <span className="home-theme-toggle-label">{isDark ? "Light mode" : "Dark mode"}</span>
      {icon}
    </animated.button>
  );
}
