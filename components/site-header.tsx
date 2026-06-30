"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  ["/", "Home"], ["/about", "About"], ["/projects", "Projects"],
  ["/recipes", "Recipes"], ["/restaurants", "Restaurants"],
  ["/tools", "Tools"], ["/contact", "Contact"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isProjectViewer = pathname.startsWith("/projects/");

  useEffect(() => {
    if (pathname !== "/") window.sessionStorage.setItem("home-entry", "menu");
  }, [pathname]);

  if (pathname === "/") return null;

  return (
    <header id="top" className={`site-menu-shell ${isProjectViewer ? "site-menu-shell-project-viewer" : ""}`}>
      <button
        className={`site-menu-button ${open ? "is-open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="site-menu-panel"
        aria-label={open ? "Close navigation" : "Open navigation"}
      >
        <span /><span /><span />
      </button>

      <div id="site-menu-panel" className={`site-menu-panel ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="mb-5 flex items-center justify-between border-b border-ink/10 pb-4">
          <Link href="/" className="font-serif text-xl" onClick={() => setOpen(false)}>Curtis Lee</Link>
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink/40">Explore</span>
        </div>
        <nav className="grid grid-cols-2 gap-2" aria-label="Primary navigation">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className={`rounded-2xl px-4 py-3 text-sm transition ${pathname === href ? "bg-ink text-paper" : "bg-ink/[0.04] text-ink/65 hover:bg-ink/[0.08] hover:text-ink"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
