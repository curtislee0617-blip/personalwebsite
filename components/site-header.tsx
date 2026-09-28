"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { runDashboardBubbleTransition } from "@/lib/dashboard-bubble-transition";
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
  const openingMenuRef = useRef<gsap.core.Timeline | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isProjectViewer = pathname.startsWith("/projects/");

  const closeMenu = useCallback(() => {
    if (!open) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOpen(false);
      return;
    }

    const timeline = openingMenuRef.current;
    if (timeline) timeline.timeScale(1.35).reverse();
    else setOpen(false);
  }, [open]);

  function toggleMenu() {
    if (navigatingRef.current) return;
    if (open) {
      if (openingMenuRef.current?.reversed()) openingMenuRef.current.timeScale(1).play();
      else closeMenu();
      return;
    }
    setOpen(true);
  }

  useLayoutEffect(() => {
    if (!open) return;

    const panel = document.getElementById("site-menu-panel");
    if (!panel) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(panel, { clearProps: "all" });
      return;
    }

    const items = gsap.utils.toArray<HTMLElement>(
      "#site-menu-panel .site-menu-titlebar, #site-menu-panel .site-menu-link:not(.site-menu-theme-toggle), #site-menu-panel .site-menu-theme-control",
    );
    const timeline = gsap.timeline({ onReverseComplete: () => setOpen(false) });
    openingMenuRef.current = timeline;
    gsap.set(items, { autoAlpha: 0, y: 10 });
    timeline
      .fromTo(panel, { autoAlpha: 0, scale: 0.84 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power3.out" })
      .to(items, { autoAlpha: 1, y: 0, duration: 0.24, stagger: 0.025, ease: "power2.out" }, 0.08);

    return () => {
      timeline.kill();
      openingMenuRef.current = null;
      gsap.set([panel, ...items], { clearProps: "opacity,visibility,transform" });
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
      // Preserve the menu's final arrangement until the shared transition clones it.
      openingMenuRef.current?.progress(1).kill();
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
      <button
        ref={buttonRef}
        type="button"
        className={`site-menu-button ${open ? "is-open" : ""}`}
        onClick={toggleMenu}
        aria-expanded={open}
        aria-controls="site-menu-panel"
        aria-label={open ? "Close navigation" : "Open navigation"}
      >
        <span /><span /><span />
      </button>

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
