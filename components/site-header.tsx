"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
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
  const pathname = usePathname();
  const router = useRouter();
  const isProjectViewer = pathname.startsWith("/projects/");

  function prefetchRoute(href: string) {
    try {
      router.prefetch(href);
    } catch {
      // Prefetch is best-effort; normal navigation still handles failures.
    }
  }

  function navigateFromMenu(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    setOpen(false);
    if (pathname === href) event.preventDefault();
    // Let Next Link perform client navigation without a full-page blank overlay.
  }

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || shellRef.current?.contains(target)) return;
      setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (pathname === "/") return null;

  return (
    <header id="top" className={`site-menu-shell ${isProjectViewer ? "site-menu-shell-project-viewer" : ""}`} ref={shellRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`site-menu-button ${open ? "is-open" : ""}`}
        onClick={() => setOpen((current) => !current)}
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
          <ThemeToggle variant="menu-row" />
        </nav>
      </div>
    </header>
  );
}
