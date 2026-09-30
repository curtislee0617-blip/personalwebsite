"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SpringValue } from "@react-spring/web";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { SpringButton } from "@/components/spring-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { runDashboardBubbleTransition } from "@/lib/dashboard-bubble-transition";
import { CORNER_SPRING } from "@/lib/corner-bubble-motion";
import { navIconForPath } from "@/lib/page-cursors";

const links = [
  ["/", "Home"], ["/about", "CV"], ["/projects", "Projects"],
  ["/recipes", "Recipes"], ["/restaurants", "Restaurants"],
  ["/tools", "Tools"], ["/contact", "Contact"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const shellRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigatingRef = useRef(false);
  const openingMenuRef = useRef<{ animate: (show: boolean) => void; stop: () => void } | null>(null);
  const menuTargetRef = useRef(true);
  const pathname = usePathname();
  const router = useRouter();
  const isProjectViewer = pathname.startsWith("/projects/");

  const closeMenu = useCallback(() => {
    if (!open) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOpen(false);
      return;
    }

    const animation = openingMenuRef.current;
    if (animation) animation.animate(false);
    else setOpen(false);
  }, [open]);

  function toggleMenu() {
    if (navigatingRef.current) return;
    if (open) {
      if (!menuTargetRef.current) openingMenuRef.current?.animate(true);
      else closeMenu();
      return;
    }
    setOpen(true);
  }

  useLayoutEffect(() => {
    if (!open) return;
    menuTargetRef.current = true;

    const panel = document.getElementById("site-menu-panel");
    const button = buttonRef.current;
    if (!panel || !button) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;

    // Measure once at full size. Only transform and opacity change during motion.
    panel.style.transform = "none";
    panel.dataset.menuAnimating = "true";
    const buttonRect = button.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const origin = { x: buttonRect.left + buttonRect.width / 2, y: buttonRect.top + buttonRect.height / 2 };
    panel.style.transformOrigin = `${origin.x - panelRect.left}px ${origin.y - panelRect.top}px`;
    const motion = new SpringValue(0);
    let disposed = false;
    let revision = 0;
    const clearAnimationStyles = () => {
      delete panel.dataset.menuAnimating;
      panel.style.removeProperty("transform-origin");
      panel.style.removeProperty("pointer-events");
    };
    const render = (progress: number) => {
      panel.style.transform = `scale(${0.12 + 0.88 * progress})`;
      panel.style.opacity = String(progress);
      panel.style.pointerEvents = progress >= 1 ? "auto" : "none";
    };
    const animate = (show: boolean) => {
      menuTargetRef.current = show;
      panel.dataset.menuAnimating = "true";
      const currentRevision = ++revision;
      void motion.start({ to: show ? 1 : 0, config: CORNER_SPRING, onChange: ({ value }) => render(value) })
        .then((result) => {
          if (disposed || result.cancelled || revision !== currentRevision) return;
          if (show) clearAnimationStyles();
          else setOpen(false);
        });
    };
    openingMenuRef.current = { animate, stop: () => { ++revision; motion.stop(true); } };
    render(0);
    animate(true);
    const settle = () => setOpen(false);
    window.addEventListener("resize", settle);
    preference.addEventListener("change", settle);
    return () => {
      disposed = true;
      motion.stop(true);
      openingMenuRef.current = null;
      window.removeEventListener("resize", settle);
      preference.removeEventListener("change", settle);
      clearAnimationStyles();
      panel.style.removeProperty("opacity");
      panel.style.removeProperty("transform");
    };
  }, [open]);

  function prefetchRoute(href: string) {
    try {
      router.prefetch(href);
    } catch {
      // Prefetch is best-effort; normal navigation still handles failures.
    }
  }

  async function navigateFromMenu(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    if (href === "/" && pathname !== "/") {
      event.preventDefault();
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      // Let the navigation director close the menu before revealing Home.
      openingMenuRef.current?.stop();
      try {
        await runDashboardBubbleTransition({ direction: "undock", href, router });
      } finally {
        setOpen(false);
        navigatingRef.current = false;
      }
      return;
    }
    closeMenu();
    if (pathname === href) event.preventDefault();
    // Let Next Link perform client navigation without a full-page blank overlay.
  }

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || shellRef.current?.contains(target)) return;
      closeMenu();
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      closeMenu();
      buttonRef.current?.focus({ preventScroll: true });
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, closeMenu]);

  if (pathname === "/") return null;

  return (
    <header id="top" className={`site-menu-shell ${isProjectViewer ? "site-menu-shell-project-viewer" : ""}`} ref={shellRef}>
      <SpringButton
        ref={buttonRef}
        type="button"
        className={`site-menu-button ${open ? "is-open" : ""}`}
        onClick={toggleMenu}
        aria-expanded={open}
        aria-controls="site-menu-panel"
        aria-label={open ? "Close navigation" : "Open navigation"}
      >
        <span /><span /><span />
      </SpringButton>

      <div id="site-menu-panel" className={`site-menu-panel ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open}>
        <div className="site-menu-titlebar mb-5 flex items-center justify-between border-b border-ink/10 pb-4">
          <Link
            href="/"
            className="font-serif text-xl"
            onClick={(event) => navigateFromMenu(event, "/")}
            onFocus={() => prefetchRoute("/")}
            onPointerEnter={() => prefetchRoute("/")}
          >
            Curtis Lee
          </Link>
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink/40">Explore</span>
        </div>
        <nav className="site-menu-nav grid grid-cols-2 gap-2" aria-label="Primary navigation">
          {links.map(([href, label]) => {
            const icon = navIconForPath(href);
            return (
              <Link
                key={href}
                href={href}
                data-dashboard-href={href === "/" ? undefined : href}
                onClick={(event) => navigateFromMenu(event, href)}
                onFocus={() => prefetchRoute(href)}
                onPointerEnter={() => prefetchRoute(href)}
                tabIndex={open ? 0 : -1}
                className={`site-menu-link flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${pathname === href ? "is-active" : ""}`}
              >
                {icon && <img alt="" aria-hidden="true" className="h-4 w-4 shrink-0 object-contain" src={icon} />}
                {label}
              </Link>
            );
          })}
          <div className="site-menu-theme-control col-span-2">
            <ThemeToggle variant="menu-row" />
          </div>
        </nav>
      </div>
    </header>
  );
}
