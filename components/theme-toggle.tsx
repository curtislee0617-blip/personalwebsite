"use client";

import { useEffect, useState, type MouseEvent } from "react";

type ViewTransition = { ready: Promise<void>; finished: Promise<void> };
type DocumentWithViewTransitions = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the dark-mode class the pre-hydration theme-init script already set on <html>
    setState({ mounted: true, isDark: document.documentElement.classList.contains("dark") });
  }, []);

  const { mounted, isDark } = state;

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const next = !isDark;
    const { clientX: x, clientY: y } = event;
    const flip = () => {
      applyTheme(next);
      setState((prev) => ({ ...prev, isDark: next }));
    };

    const doc = document as DocumentWithViewTransitions;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof doc.startViewTransition !== "function" || reducedMotion) {
      flip();
      return;
    }

    const transition = doc.startViewTransition(flip);
    transition.ready
      .then(() => {
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        // Ease-out (fast start, gentle settle) over a longer duration reads much smoother than a
        // symmetric ease-in-out, and a small opacity fade softens the leading edge of the reveal.
        const options: KeyframeAnimationOptions = {
          duration: 760,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        };
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
            opacity: [0.35, 1],
          },
          options,
        );
      })
      .catch(() => undefined);
  }

  if (!mounted) return null;

  if (variant === "menu-row") {
    return (
      <button
        aria-label="Toggle dark mode"
        className="col-span-2 flex items-center justify-between rounded-2xl bg-ink/[0.04] px-4 py-3 text-sm text-ink/65 transition hover:bg-ink/[0.08] hover:text-ink"
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
      className="fixed bottom-5 right-5 z-20 grid h-12 w-12 place-items-center rounded-full bg-ink text-paper shadow-[0_12px_30px_rgba(32,35,31,0.2)] transition hover:scale-105"
      onClick={toggle}
      type="button"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
