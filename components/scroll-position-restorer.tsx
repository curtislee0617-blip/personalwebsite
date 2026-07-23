"use client";

import { useEffect } from "react";

const RETURN_POSITION_PREFIX = "site-return-position:";
const RESTORE_DURATION_MS = 3200;
const RESTORE_DELAYS_MS = [0, 50, 150, 300, 600, 1000, 1600, 2400, 3200] as const;

type ReturnPosition = {
  pageKey: string;
  x: number;
  y: number;
};

function currentPageKey() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function destinationPageKey(destination: URL) {
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

function rememberInternalNavigation(destination: URL) {
  const returnPosition: ReturnPosition = {
    pageKey: currentPageKey(),
    x: window.scrollX,
    y: window.scrollY,
  };

  try {
    window.sessionStorage.setItem(
      `${RETURN_POSITION_PREFIX}${destinationPageKey(destination)}`,
      JSON.stringify(returnPosition),
    );
  } catch {
    // Navigation still works when private browsing prevents session storage.
  }
}

export function getCurrentPageReturnPosition(): ReturnPosition | null {
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(`${RETURN_POSITION_PREFIX}${currentPageKey()}`) ?? "null",
    ) as Partial<ReturnPosition> | null;

    if (
      !parsed
      || typeof parsed.pageKey !== "string"
      || !Number.isFinite(parsed.x)
      || !Number.isFinite(parsed.y)
    ) {
      return null;
    }

    return {
      pageKey: parsed.pageKey,
      x: Number(parsed.x),
      y: Number(parsed.y),
    };
  } catch {
    return null;
  }
}

export function restoreReturnPosition(position: ReturnPosition) {
  const timers: number[] = [];
  const root = document.documentElement;
  const previousInlineScrollBehavior = root.style.scrollBehavior;
  let instantScrollingEnabled = false;
  let cancelled = false;

  const restore = () => {
    if (cancelled || currentPageKey() !== position.pageKey) return;
    if (!instantScrollingEnabled) {
      root.style.scrollBehavior = "auto";
      instantScrollingEnabled = true;
    }

    const maximumX = Math.max(0, root.scrollWidth - window.innerWidth);
    const maximumY = Math.max(0, root.scrollHeight - window.innerHeight);
    window.scrollTo(
      Math.min(position.x, maximumX),
      Math.min(position.y, maximumY),
    );
  };

  const cleanup = () => {
    if (cancelled) return;
    cancelled = true;
    timers.forEach((timer) => window.clearTimeout(timer));
    window.removeEventListener("wheel", cancelForUserInput);
    window.removeEventListener("touchstart", cancelForUserInput);
    window.removeEventListener("pointerdown", cancelForUserInput);
    window.removeEventListener("keydown", cancelForUserInput);
    if (instantScrollingEnabled) root.style.scrollBehavior = previousInlineScrollBehavior;
  };

  const cancelForUserInput = () => cleanup();

  window.addEventListener("wheel", cancelForUserInput, { passive: true });
  window.addEventListener("touchstart", cancelForUserInput, { passive: true });
  window.addEventListener("pointerdown", cancelForUserInput, { passive: true });
  window.addEventListener("keydown", cancelForUserInput);

  RESTORE_DELAYS_MS.forEach((delay) => {
    timers.push(window.setTimeout(restore, delay));
  });
  timers.push(window.setTimeout(cleanup, RESTORE_DURATION_MS + 100));
}

export function ScrollPositionRestorer() {
  useEffect(() => {
    const saveBeforeInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin === window.location.origin) {
        rememberInternalNavigation(destination);
      }
    };

    document.addEventListener("click", saveBeforeInternalNavigation, true);
    return () => document.removeEventListener("click", saveBeforeInternalNavigation, true);
  }, []);

  return null;
}
