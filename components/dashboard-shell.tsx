"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { navIconForPath } from "@/lib/page-cursors";

export const dashboardSections = [
  {
    href: "/about", label: "About", subtitle: "Education, experience, interests, and life beyond the lab.",
    groups: [
      { href: "/about#about-education", label: "Background", items: [{ href: "/about#about-education", label: "Education" }, { href: "/about#about-experience", label: "Experience" }] },
      { href: "/about#about-awards", label: "Profile", items: [{ href: "/about#about-awards", label: "Awards" }, { href: "/about#about-beyond", label: "Beyond the lab" }, { href: "/about#about-languages", label: "Languages" }, { href: "/about#about-skills", label: "Skills" }] },
      { href: "/about#about-projects", label: "Featured work", items: [{ href: "/about#about-projects", label: "Projects & publications" }] },
    ],
  },
  {
    href: "/projects", label: "Projects", subtitle: "Engineering, research, writing, and creative work.",
    groups: [
      { href: "/projects", label: "Research & coursework", items: [{ href: "/projects/biodiesel-from-used-cooking-oil", label: "Biodiesel project" }, { href: "/projects/bem-114-report", label: "Earnings-call NLP" }, { href: "/projects/tonbridge-food-science", label: "The science of flavour" }] },
      { href: "/projects#creative-projects-title", label: "Creative & enterprise", items: [{ href: "/projects/cook-enterprise", label: "cook.enterprise" }, { href: "/projects#creative-projects-title", label: "Website" }, { href: "/projects#pixel-art-cities", label: "Pixel-art cities" }] },
    ],
  },
  {
    href: "/tools", label: "Tools", subtitle: "Calculators and utilities for school—and perhaps more later.",
    groups: [
      { href: "/tools", label: "Planning", items: [{ href: "/tools/course-planner", label: "Course planner" }] },
      { href: "/tools", label: "Chemistry", items: [{ href: "/tools/ir-spectrum", label: "IR spectrum plotter" }, { href: "/tools/nmr-spectrum", label: "NMR spectrum processor" }] },
      { href: "/tools", label: "Thermodynamics", items: [{ href: "/tools/water-properties", label: "Water properties" }, { href: "/tools/compound-properties", label: "Compound properties" }, { href: "/tools/vle", label: "VLE simulator" }] },
    ],
  },
  {
    href: "/recipes", label: "Recipes", subtitle: "Personal recipes, detailed guides, and transcribed cookbooks.",
    groups: [
      { href: "/recipes#recipe-guides", label: "Guides", items: [{ href: "/recipes/pasta-guide", label: "Pasta" }, { href: "/recipes/sushi-guide", label: "Sushi" }, { href: "/recipes/viennoiserie-guide", label: "Viennoiserie" }, { href: "/recipes/sourdough-guide", label: "Sourdough" }, { href: "/projects/cook-enterprise?from=recipes", label: "Cookbook" }] },
      { href: "/recipes#recipe-collection", label: "Collections", items: [{ href: "/recipes#recipe-collection", label: "Recipes" }, { href: "/recipes#recipe-wishlist", label: "Wishlist" }, { href: "/recipes#recipe-books", label: "Recipe books" }] },
      { href: "/recipes#recipe-books", label: "Cookbooks", items: [{ href: "/recipes/core-basics", label: "Core" }, { href: "/recipes/frantzen", label: "Frantzén" }, { href: "/recipes/modernist-cuisine", label: "Modernist Cuisine" }, { href: "/recipes/pollen-street", label: "Pollen Street" }, { href: "/recipes/opera", label: "Opéra" }, { href: "/recipes/bachour", label: "Bachour" }, { href: "/recipes/benu", label: "Benu" }] },
    ],
  },
  {
    href: "/restaurants", label: "Restaurants", subtitle: "Places I have visited, saved, and would recommend.",
    groups: [
      { href: "/restaurants#restaurant-map", label: "Explore", items: [{ href: "/restaurants#restaurant-map", label: "Saved-places map" }, { href: "/restaurants#restaurant-recommendations", label: "Send a recommendation" }] },
    ],
  },
  {
    href: "/contact", label: "Contact", subtitle: "Say hello, send feedback, or see where I am.",
    groups: [
      { href: "/contact#contact-cities", label: "Where I am", items: [{ href: "/contact#contact-cities", label: "Cities & local time" }] },
      { href: "/contact#contact-links", label: "Reach me", items: [{ href: "/contact#contact-links", label: "Email & social links" }, { href: "/recipes/feedback", label: "Website feedback" }] },
    ],
  },
] as const;

type DashboardModeContextValue = {
  isDashboard: boolean;
  enableDashboard: () => void;
  disableDashboard: () => void;
};

const DashboardModeContext = createContext<DashboardModeContextValue>({
  isDashboard: false,
  enableDashboard: () => undefined,
  disableDashboard: () => undefined,
});

const DEFAULT_SIDEBAR_WIDTH = 280;
const MIN_SIDEBAR_WIDTH = 220;
const MAX_SIDEBAR_WIDTH = 420;
const SIDEBAR_WIDTH_KEY = "dashboard-sidebar-width";

function clampSidebarWidth(width: number) {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(width)));
}

function applySidebarWidth(width: number) {
  document.documentElement.style.setProperty("--dashboard-sidebar-width", `${width}px`);
}

function applyDashboardMode(enabled: boolean) {
  document.documentElement.classList.toggle("dashboard-mode", enabled);
  window.localStorage.setItem("site-layout", enabled ? "dashboard" : "bubbles");
}

function hrefPath(href: string) {
  return href.split(/[?#]/)[0] || "/";
}

export function useDashboardMode() {
  return useContext(DashboardModeContext);
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isDashboard, setIsDashboard] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const sidebarWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);
  const sidebarResizerRef = useRef<HTMLDivElement>(null);
  const resizingPointerRef = useRef<number | null>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const storedWidth = Number.parseInt(window.localStorage.getItem(SIDEBAR_WIDTH_KEY) ?? "", 10);
    const initialWidth = clampSidebarWidth(Number.isFinite(storedWidth) ? storedWidth : DEFAULT_SIDEBAR_WIDTH);
    sidebarWidthRef.current = initialWidth;
    applySidebarWidth(initialWidth);
    sidebarResizerRef.current?.setAttribute("aria-valuenow", String(initialWidth));
    const sync = () => {
      const enabled = desktop.matches && window.localStorage.getItem("site-layout") === "dashboard";
      document.documentElement.classList.toggle("dashboard-mode", enabled);
      setIsDashboard(enabled);
    };

    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, []);

  const activeHref = useMemo(() => {
    return dashboardSections.find((section) => pathname === section.href || pathname.startsWith(`${section.href}/`))?.href;
  }, [pathname]);

  function enableDashboard() {
    applyDashboardMode(true);
    setIsDashboard(true);
  }

  function disableDashboard() {
    const change = () => {
      applyDashboardMode(false);
      setIsDashboard(false);
    };
    const doc = document as Document & { startViewTransition?: (callback: () => void) => { finished: Promise<void> } };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof doc.startViewTransition !== "function") {
      change();
      return;
    }

    doc.startViewTransition(change);
  }

  function updateSidebarWidth(width: number, persist = false) {
    const nextWidth = clampSidebarWidth(width);
    sidebarWidthRef.current = nextWidth;
    applySidebarWidth(nextWidth);
    sidebarResizerRef.current?.setAttribute("aria-valuenow", String(nextWidth));
    if (persist) window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(nextWidth));
  }

  function beginSidebarResize(event: ReactPointerEvent<HTMLDivElement>) {
    resizingPointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    document.documentElement.classList.add("dashboard-resizing");
    event.preventDefault();
  }

  function moveSidebarResize(event: ReactPointerEvent<HTMLDivElement>) {
    if (resizingPointerRef.current !== event.pointerId) return;
    const nextWidth = clampSidebarWidth(event.clientX);
    sidebarWidthRef.current = nextWidth;
    applySidebarWidth(nextWidth);
    event.currentTarget.setAttribute("aria-valuenow", String(nextWidth));
  }

  function finishSidebarResize(event: ReactPointerEvent<HTMLDivElement>) {
    if (resizingPointerRef.current !== event.pointerId) return;
    resizingPointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    document.documentElement.classList.remove("dashboard-resizing");
    updateSidebarWidth(sidebarWidthRef.current, true);
  }

  function resizeSidebarWithKeyboard(event: ReactKeyboardEvent<HTMLDivElement>) {
    let nextWidth = sidebarWidthRef.current;
    if (event.key === "ArrowLeft") nextWidth -= 16;
    else if (event.key === "ArrowRight") nextWidth += 16;
    else if (event.key === "Home") nextWidth = MIN_SIDEBAR_WIDTH;
    else if (event.key === "End") nextWidth = MAX_SIDEBAR_WIDTH;
    else return;
    event.preventDefault();
    updateSidebarWidth(nextWidth, true);
  }

  function followDashboardLink(event: ReactMouseEvent<HTMLAnchorElement>, href: string) {
    const [destination, hash] = href.split("#");
    if (!hash || hrefPath(destination) !== pathname) return;

    const target = document.getElementById(hash);
    if (!target) return;

    event.preventDefault();
    window.history.pushState(null, "", href);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

    if (hash === "pixel-art-cities") {
      window.scrollTo({ behavior, top: document.documentElement.scrollHeight });
      return;
    }

    target.scrollIntoView({ behavior, block: "start" });
  }

  return (
    <DashboardModeContext.Provider value={{ disableDashboard, enableDashboard, isDashboard }}>
      <aside aria-hidden={!isDashboard} className="dashboard-sidebar">
        <div className="dashboard-sidebar-profile">
          <Link aria-label="Go to dashboard home" className="dashboard-sidebar-portrait" href="/">
            <img alt="Curtis Lee" src="/profile.webp" />
          </Link>
          <div>
            <Link className="dashboard-sidebar-name" href="/">Curtis Lee</Link>
            <p>School, work and life</p>
          </div>
        </div>

        <div className="dashboard-sidebar-rule" />
        <p className="dashboard-sidebar-kicker">Sections</p>

        <nav aria-label="Dashboard navigation" className="dashboard-sidebar-nav">
          {dashboardSections.map((section) => {
            const icon = navIconForPath(section.href);
            const isActive = activeHref === section.href;
            const isExpanded = expanded[section.href] ?? isActive;

            return (
              <div className={`dashboard-sidebar-item ${isActive ? "is-active" : ""}`} data-dashboard-href={section.href} key={section.href}>
                <div className="dashboard-sidebar-row">
                  <Link href={section.href}>
                    {icon && <img alt="" aria-hidden="true" src={icon} />}
                    <span>{section.label}</span>
                  </Link>
                  <button
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? "Hide" : "Show"} ${section.label} description`}
                    onClick={() => setExpanded((current) => ({ ...current, [section.href]: !isExpanded }))}
                    type="button"
                  >
                    <span aria-hidden="true">⌄</span>
                  </button>
                </div>
                <div aria-hidden={!isExpanded} className="dashboard-sidebar-subtitle" data-expanded={isExpanded ? "true" : "false"}>
                  <div className="dashboard-sidebar-subtitle-inner">
                    <p>{section.subtitle}</p>
                    <div className="dashboard-sidebar-groups">
                      {section.groups.map((group) => {
                        const groupKey = `${section.href}:${group.label}`;
                        const groupIsActive = group.items.some((item) => {
                          const itemPath = hrefPath(item.href);
                          return pathname === itemPath || (itemPath !== section.href && pathname.startsWith(`${itemPath}/`));
                        });
                        const groupIsExpanded = expandedGroups[groupKey] ?? groupIsActive;

                        return (
                          <div className="dashboard-sidebar-group" key={groupKey}>
                            <div className="dashboard-sidebar-group-row">
                              <Link href={group.href} onClick={(event) => followDashboardLink(event, group.href)}>{group.label}</Link>
                              <button
                                aria-expanded={groupIsExpanded}
                                aria-label={`${groupIsExpanded ? "Hide" : "Show"} ${group.label} links`}
                                onClick={() => setExpandedGroups((current) => ({ ...current, [groupKey]: !groupIsExpanded }))}
                                type="button"
                              >
                                <i aria-hidden="true">⌄</i>
                              </button>
                            </div>
                            <div aria-hidden={!groupIsExpanded} className="dashboard-sidebar-leaves" data-expanded={groupIsExpanded ? "true" : "false"}>
                              <div>
                                {group.items.map((item) => {
                                  const itemPath = hrefPath(item.href);
                                  const itemIsActive = pathname === itemPath || (itemPath !== section.href && pathname.startsWith(`${itemPath}/`));
                                  return <Link className={itemIsActive ? "is-active" : ""} href={item.href} key={`${groupKey}:${item.label}`} onClick={(event) => followDashboardLink(event, item.href)}>{item.label}</Link>;
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="dashboard-sidebar-actions">
          <ThemeToggle variant="dashboard" />
          <button className="dashboard-bubbles-mode" onClick={disableDashboard} type="button">
            <span aria-hidden="true" className="dashboard-bubbles-icon"><i /><i /><i /></span>
            <span><strong>Bubbles mode</strong><small>Return to the original layout</small></span>
          </button>
        </div>
        <div
          aria-label="Resize dashboard sidebar"
          aria-orientation="vertical"
          aria-valuemax={MAX_SIDEBAR_WIDTH}
          aria-valuemin={MIN_SIDEBAR_WIDTH}
          aria-valuenow={DEFAULT_SIDEBAR_WIDTH}
          className="dashboard-sidebar-resizer"
          onDoubleClick={() => updateSidebarWidth(DEFAULT_SIDEBAR_WIDTH, true)}
          onKeyDown={resizeSidebarWithKeyboard}
          onPointerCancel={finishSidebarResize}
          onPointerDown={beginSidebarResize}
          onPointerMove={moveSidebarResize}
          onPointerUp={finishSidebarResize}
          role="separator"
          ref={sidebarResizerRef}
          tabIndex={0}
          title="Drag to resize · double-click to reset"
        >
          <span aria-hidden="true" />
        </div>
      </aside>

      <div className="site-app-shell">{children}</div>
    </DashboardModeContext.Provider>
  );
}
