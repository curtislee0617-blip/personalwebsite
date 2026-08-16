"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SectionLoading, type SectionLoadingVariant } from "@/components/section-loading";
import { recipeCategories } from "@/data/recipe-categories";
import { navIconForPath } from "@/lib/page-cursors";
import { isUnpublishedGuideHref, UNPUBLISHED_GUIDE_LABEL } from "@/lib/unpublished-guides";

type DashboardTreeNode = {
  href: string;
  label: string;
  children?: DashboardTreeNode[];
};

type DashboardGroupItem = {
  href: string;
  label: string;
  items?: readonly DashboardGroupItem[];
  dynamicChildren?: "recipe-categories";
};

type DashboardGroup = {
  href: string;
  label: string;
  items: readonly DashboardGroupItem[];
  cookbookAccessOnly?: boolean;
  dynamicItems?: "recipe-categories";
};

type DashboardSection = {
  href: string;
  label: string;
  subtitle: string;
  groups: readonly DashboardGroup[];
};

type DashboardRecipeItem = {
  title: string;
  href: string;
  categories: string[];
};

type DashboardRouteLoading = {
  fromPath: string;
  title: string;
  variant: SectionLoadingVariant;
};

export const dashboardSections: readonly DashboardSection[] = [
  {
    href: "/about", label: "CV", subtitle: "Education, experience, interests, and life beyond the lab.",
    groups: [
      { href: "/about#about-education", label: "Background", items: [{ href: "/about#about-education", label: "Education" }, { href: "/about#about-experience", label: "Experience" }] },
      { href: "/about#about-awards", label: "Profile", items: [{ href: "/about#about-awards", label: "Awards" }, { href: "/about#about-beyond", label: "Beyond the lab" }, { href: "/about#about-languages", label: "Languages" }, { href: "/about#about-skills", label: "Skills" }] },
      { href: "/about#about-projects", label: "Featured work", items: [{ href: "/about#about-projects", label: "Projects & publications" }] },
    ],
  },
  {
    href: "/projects", label: "Projects", subtitle: "Engineering, research, writing, and creative work.",
    groups: [
      { href: "/projects", label: "Research & coursework", items: [{ href: "/projects/supercritical-water-gasification", label: "SCWG-OXZEO gasification" }, { href: "/projects/biodiesel-from-used-cooking-oil", label: "Biodiesel project" }, { href: "/projects/bem-114-report", label: "Earnings-call NLP" }, { href: "/projects/tonbridge-food-science", label: "The science of flavour" }] },
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
      {
        href: "/recipes#recipe-guides",
        label: "Guides",
        items: [
          { href: "/recipes/pasta-guide", label: "Pasta guide" },
          { href: "/recipes/coffee-guide", label: "Coffee guide" },
          { href: "/recipes/wine-guide", label: "Wine guide" },
          { href: "/recipes/sushi-guide", label: "Sushi guide" },
          { href: "/recipes/viennoiserie-guide", label: "Viennoiserie guide" },
          { href: "/recipes/sourdough-guide", label: "Sourdough guide" },
          { href: "/projects/cook-enterprise?from=recipes", label: "cook.enterprise cookbook" },
        ],
      },
      {
        href: "/recipes#recipe-collection",
        label: "Recipes",
        dynamicItems: "recipe-categories",
        items: [],
      },
      {
        href: "/recipes#recipe-media-saved",
        label: "Media saved",
        items: [
          { href: "/recipes/instagram-saved", label: "Instagram" },
          { href: "/recipes/youtube-saved", label: "YouTube" },
        ],
      },
      { href: "/recipes#recipe-wishlist", label: "Wishlist", items: [] },
      {
        href: "/recipes#recipe-books",
        label: "Recipe books",
        cookbookAccessOnly: true,
        items: [
          {
            href: "/recipes#recipe-books",
            label: "Fine dining",
            items: [
              { href: "/recipes/core-basics", label: "Core" },
              { href: "/recipes/frantzen", label: "Frantzén" },
              { href: "/recipes/modernist-cuisine", label: "Modernist Cuisine" },
              { href: "/recipes/pollen-street", label: "Pollen Street" },
              { href: "/recipes/benu", label: "Benu" },
              { href: "/recipes/the-french-laundry-cookbook", label: "The French Laundry Cookbook" },
            ],
          },
          {
            href: "/recipes#recipe-books",
            label: "Cuisines",
            items: [
              { href: "/recipes/everyday-lebanese", label: "Everyday Lebanese" },
              { href: "/recipes/japan-the-cookbook", label: "Japan: The Cookbook" },
              { href: "/recipes/anatolia", label: "Anatolia" },
              { href: "/recipes/thailand-the-cookbook", label: "Thailand: The Cookbook" },
              { href: "/recipes/breakfast-the-cookbook", label: "Breakfast: The Cookbook" },
              { href: "/recipes/tu-casa-mi-casa", label: "Tu Casa Mi Casa" },
              { href: "/recipes/the-silver-spoon", label: "The Silver Spoon" },
              { href: "/recipes/the-essential-new-york-times-cookbook", label: "The Essential New York Times Cookbook" },
              { href: "/recipes/complete-book-of-pasta-sauces", label: "The Complete Book of Pasta Sauces" },
              { href: "/recipes/spain-the-cookbook", label: "Spain: The Cookbook" },
              { href: "/recipes/science-of-spice", label: "The Science of Spice" },
              { href: "/recipes/sauces-reconsidered", label: "Sauces Reconsidered" },
              { href: "/recipes/bao-the-cookbook", label: "BAO: The Cookbook" },
            ],
          },
          {
            href: "/recipes#recipe-books",
            label: "Baking",
            items: [
              { href: "/recipes/modernist-pizza", label: "Modernist Pizza" },
              { href: "/recipes/opera", label: "Opéra Pâtisserie" },
              { href: "/recipes/bachour", label: "Bachour" },
              { href: "/recipes/secrets-of-open-crumb", label: "Secrets of Open Crumb" },
              { href: "/recipes/larousse-patisserie-and-baking", label: "Larousse Patisserie and Baking" },
              { href: "/recipes/crumb-richard-bertinet", label: "Crumb" },
              { href: "/recipes/advanced-professional-pastry-chef", label: "The Advanced Professional Pastry Chef" },
            ],
          },
          {
            href: "/recipes/cocktail-books",
            label: "Cocktails",
            items: [
              { href: "/recipes/cocktail-books", label: "Cocktail books" },
            ],
          },
        ],
      },
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
];

const DEFAULT_SIDEBAR_WIDTH = 322;
const MIN_SIDEBAR_WIDTH = 220;
const MAX_SIDEBAR_WIDTH = 480;
const SIDEBAR_WIDTH_KEY = "dashboard-sidebar-width";
const SIDEBAR_WIDTH_SCALE_KEY = "dashboard-sidebar-width-scale";
const SIDEBAR_WIDTH_SCALE_VERSION = "1.15";
const DASHBOARD_MEDIA_QUERY = "(min-width: 1200px) and (hover: hover) and (pointer: fine)";

function clampSidebarWidth(width: number) {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(width)));
}

function applySidebarWidth(width: number) {
  document.documentElement.style.setProperty("--dashboard-sidebar-width", `${width}px`);
}

export function useDashboardMode() {
  const [isDashboard, setIsDashboard] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia(DASHBOARD_MEDIA_QUERY);
    const sync = () => setIsDashboard(desktop.matches);

    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, []);

  return isDashboard;
}

function hrefPath(href: string) {
  return href.split(/[?#]/)[0] || "/";
}

function dashboardTreeNodeForItem(
  item: DashboardGroupItem,
  recipeCategoryNodes: DashboardTreeNode[],
): DashboardTreeNode {
  const children = item.dynamicChildren === "recipe-categories"
    ? recipeCategoryNodes
    : item.items?.map((child) => dashboardTreeNodeForItem(child, recipeCategoryNodes));

  return { href: item.href, label: item.label, children };
}

function dashboardTreeNodeMatchesPath(node: DashboardTreeNode, pathname: string, sectionHref: string): boolean {
  const nodePath = hrefPath(node.href);
  const nodeMatches = (pathname === nodePath && !node.href.includes("#"))
    || (nodePath !== sectionHref && pathname.startsWith(`${nodePath}/`));

  return nodeMatches || (node.children?.some((child) => dashboardTreeNodeMatchesPath(child, pathname, sectionHref)) ?? false);
}

function loadingDetailsForPath(path: string): Pick<DashboardRouteLoading, "title" | "variant"> {
  if (path === "/") return { title: "Warming up the homepage", variant: "home" };
  if (path.startsWith("/about")) return { title: "Waking up…", variant: "about" };
  if (path.startsWith("/projects")) return { title: "Writing...", variant: "projects" };
  if (path.startsWith("/recipes")) return { title: "Preheating", variant: "recipes" };
  if (path.startsWith("/restaurants")) return { title: "Setting the table", variant: "restaurants" };
  if (path.startsWith("/tools")) return { title: "Adding final touches", variant: "tools" };
  if (path.startsWith("/contact")) return { title: "Opening contact", variant: "contact" };
  if (path.startsWith("/cv")) return { title: "Opening the CV", variant: "cv" };
  return { title: "Loading", variant: "home" };
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isDashboard, setIsDashboard] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [dashboardRecipes, setDashboardRecipes] = useState<DashboardRecipeItem[]>([]);
  const [hasCookbookAccess, setHasCookbookAccess] = useState(false);
  const [isRecipeAdmin, setIsRecipeAdmin] = useState(false);
  const [routeLoading, setRouteLoading] = useState<DashboardRouteLoading | null>(null);
  const routeLoadingStartedRef = useRef(0);
  const sidebarWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);
  const sidebarResizerRef = useRef<HTMLDivElement>(null);
  const resizingPointerRef = useRef<number | null>(null);

  useEffect(() => {
    const desktop = window.matchMedia(DASHBOARD_MEDIA_QUERY);
    const storedWidth = Number.parseInt(window.localStorage.getItem(SIDEBAR_WIDTH_KEY) ?? "", 10);
    const hasStoredWidth = Number.isFinite(storedWidth);
    const needsWidthScale = window.localStorage.getItem(SIDEBAR_WIDTH_SCALE_KEY) !== SIDEBAR_WIDTH_SCALE_VERSION;
    const initialWidth = clampSidebarWidth(
      hasStoredWidth && needsWidthScale
        ? storedWidth * 1.15
        : hasStoredWidth
          ? storedWidth
          : DEFAULT_SIDEBAR_WIDTH,
    );
    if (needsWidthScale) {
      window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(initialWidth));
      window.localStorage.setItem(SIDEBAR_WIDTH_SCALE_KEY, SIDEBAR_WIDTH_SCALE_VERSION);
    }
    sidebarWidthRef.current = initialWidth;
    applySidebarWidth(initialWidth);
    sidebarResizerRef.current?.setAttribute("aria-valuenow", String(initialWidth));
    const sync = () => {
      const enabled = desktop.matches;
      document.documentElement.classList.toggle("dashboard-mode", enabled);
      setIsDashboard(enabled);
    };

    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!routeLoading || routeLoading.fromPath === pathname) return;

    const elapsed = performance.now() - routeLoadingStartedRef.current;
    const timer = window.setTimeout(() => setRouteLoading(null), Math.max(0, 180 - elapsed));
    return () => window.clearTimeout(timer);
  }, [pathname, routeLoading]);

  useEffect(() => {
    if (!routeLoading) return;

    const timer = window.setTimeout(() => setRouteLoading(null), 8000);
    return () => window.clearTimeout(timer);
  }, [routeLoading]);

  useEffect(() => {
    if (!isDashboard) return;

    const controller = new AbortController();
    void fetch("/api/recipe-search", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json() as Promise<unknown>)
      .then((result) => {
        if (!Array.isArray(result)) return;
        const recipes = result.flatMap((item): DashboardRecipeItem[] => {
          if (!item || typeof item !== "object") return [];
          const candidate = item as Record<string, unknown>;
          if (candidate.kind !== "Recipe" || candidate.context !== "Personal recipe") return [];
          if (typeof candidate.title !== "string" || typeof candidate.href !== "string") return [];
          return [{
            title: candidate.title,
            href: candidate.href,
            categories: Array.isArray(candidate.categories)
              ? candidate.categories.filter((category): category is string => typeof category === "string")
              : [],
          }];
        });
        setDashboardRecipes(recipes);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [isDashboard]);

  useEffect(() => {
    const controller = new AbortController();
    const syncCookbookSession = () => {
      void fetch("/api/cookbook-access/session", { cache: "no-store", signal: controller.signal })
        .then((response) => response.json() as Promise<{ authenticated?: boolean }>)
        .then((result) => setHasCookbookAccess(result.authenticated === true))
        .catch(() => undefined);
    };

    syncCookbookSession();
    window.addEventListener("cookbook-access-session-changed", syncCookbookSession);
    return () => {
      controller.abort();
      window.removeEventListener("cookbook-access-session-changed", syncCookbookSession);
    };
  }, []);

  // Unfinished guides stay listed but inert unless the admin is signed in. The
  // check is client-side on purpose: reading the cookie in the root layout would
  // opt every route on the site out of static rendering.
  useEffect(() => {
    const controller = new AbortController();
    const syncAdminSession = () => {
      void fetch("/api/recipe-admin/session", { cache: "no-store", signal: controller.signal })
        .then((response) => response.json() as Promise<{ authenticated?: boolean }>)
        .then((result) => setIsRecipeAdmin(result.authenticated === true))
        .catch(() => undefined);
    };

    syncAdminSession();
    window.addEventListener("recipe-admin-session-changed", syncAdminSession);
    return () => {
      controller.abort();
      window.removeEventListener("recipe-admin-session-changed", syncAdminSession);
    };
  }, []);

  const recipeCategoryNodes = useMemo<DashboardTreeNode[]>(() => recipeCategories.flatMap((category) => {
    const dishes = dashboardRecipes
      .filter((recipe) => recipe.categories.includes(category.id))
      .map((recipe) => ({ href: recipe.href, label: recipe.title }));

    return dishes.length > 0
      ? [{ href: `/recipes#recipe-category-${category.id}`, label: category.title, children: dishes }]
      : [];
  }), [dashboardRecipes]);

  const activeHref = useMemo(() => {
    return dashboardSections.find((section) => pathname === section.href || pathname.startsWith(`${section.href}/`))?.href;
  }, [pathname]);

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

  function scrollDashboardNavigation(event: ReactWheelEvent<HTMLElement>) {
    const navigation = event.currentTarget.querySelector<HTMLElement>(".dashboard-sidebar-nav");
    if (!navigation || event.deltaY === 0) return;

    event.preventDefault();
    navigation.scrollBy({ top: event.deltaY, behavior: "auto" });
  }

  function beginDashboardNavigation(event: ReactMouseEvent<HTMLElement>) {
    if (
      event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor || anchor.target || anchor.hasAttribute("download")) return;

    const destination = new URL(anchor.href, window.location.href);
    if (destination.origin !== window.location.origin || destination.pathname === pathname) return;

    routeLoadingStartedRef.current = performance.now();
    setRouteLoading({
      fromPath: pathname,
      ...loadingDetailsForPath(destination.pathname),
    });
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

  function renderDashboardNode(node: DashboardTreeNode, nodeKey: string): ReactNode {
    const children = node.children ?? [];
    const nodePath = hrefPath(node.href);
    const isActive = pathname === nodePath && !node.href.includes("#");

    if (children.length === 0) {
      // A draft guide keeps its place in the tree but stops being a link, so
      // there is nothing to click and nothing to tab onto.
      if (isUnpublishedGuideHref(node.href) && !isRecipeAdmin) {
        return (
          <span className="dashboard-sidebar-unpublished" key={nodeKey}>
            <span className="dashboard-sidebar-unpublished-label">{node.label}</span>
            <span className="dashboard-sidebar-unpublished-badge">{UNPUBLISHED_GUIDE_LABEL}</span>
          </span>
        );
      }

      return (
        <Link
          className={isActive ? "is-active" : ""}
          href={node.href}
          key={nodeKey}
          onClick={(event) => followDashboardLink(event, node.href)}
        >
          {node.label}
        </Link>
      );
    }

    const isExpanded = expandedNodes[nodeKey] ?? false;
    return (
      <div className="dashboard-sidebar-tree-node" key={nodeKey}>
        <div className="dashboard-sidebar-tree-row">
          <Link className={isActive ? "is-active" : ""} href={node.href} onClick={(event) => followDashboardLink(event, node.href)}>{node.label}</Link>
          <button
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Hide" : "Show"} ${node.label}`}
            onClick={() => setExpandedNodes((current) => ({ ...current, [nodeKey]: !isExpanded }))}
            type="button"
          >
            <i aria-hidden="true">⌄</i>
          </button>
        </div>
        <div aria-hidden={!isExpanded} className="dashboard-sidebar-tree-children" data-expanded={isExpanded ? "true" : "false"}>
          <div>
            {children.map((child, index) => renderDashboardNode(child, `${nodeKey}:${child.href}:${index}`))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <aside
        aria-hidden={!isDashboard}
        className="dashboard-sidebar"
        onClickCapture={beginDashboardNavigation}
        onWheel={scrollDashboardNavigation}
      >
        <div className="dashboard-sidebar-profile">
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
            const canExpand = !["/about", "/restaurants", "/contact"].includes(section.href);
            const visibleGroups = section.groups.filter((group) => hasCookbookAccess || !group.cookbookAccessOnly);

            return (
              <div className={`dashboard-sidebar-item ${isActive ? "is-active" : ""}`} data-dashboard-href={section.href} key={section.href}>
                <div className={`dashboard-sidebar-row ${canExpand ? "" : "is-link-only"}`}>
                  <Link href={section.href}>
                    {icon && <img alt="" aria-hidden="true" src={icon} />}
                    <span>{section.label}</span>
                  </Link>
                  {canExpand && (
                    <button
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? "Hide" : "Show"} ${section.label} description`}
                      onClick={() => setExpanded((current) => ({ ...current, [section.href]: !isExpanded }))}
                      type="button"
                    >
                      <span aria-hidden="true">⌄</span>
                    </button>
                  )}
                </div>
                {canExpand && <div aria-hidden={!isExpanded} className="dashboard-sidebar-subtitle" data-expanded={isExpanded ? "true" : "false"}>
                  <div className="dashboard-sidebar-subtitle-inner">
                    <p>{section.subtitle}</p>
                    <div className="dashboard-sidebar-groups">
                      {visibleGroups.map((group) => {
                        const groupKey = `${section.href}:${group.label}`;
                        const groupNodes = [
                          ...group.items.map((item) => dashboardTreeNodeForItem(item, recipeCategoryNodes)),
                          ...(group.dynamicItems === "recipe-categories" ? recipeCategoryNodes : []),
                        ];
                        const groupHasItems = groupNodes.length > 0;
                        const groupIsActive = groupNodes.some((node) => dashboardTreeNodeMatchesPath(node, pathname, section.href));
                        const groupOpensWithSection = section.href === "/projects" && group.label === "Research & coursework";
                        const groupIsExpanded = expandedGroups[groupKey] ?? (groupIsActive || groupOpensWithSection);

                        return (
                          <div className="dashboard-sidebar-group" key={groupKey}>
                            <div className={`dashboard-sidebar-group-row ${groupHasItems ? "" : "is-link-only"}`}>
                              <Link href={group.href} onClick={(event) => followDashboardLink(event, group.href)}>{group.label}</Link>
                              {groupHasItems && (
                                <button
                                  aria-expanded={groupIsExpanded}
                                  aria-label={`${groupIsExpanded ? "Hide" : "Show"} ${group.label} links`}
                                  onClick={() => setExpandedGroups((current) => ({ ...current, [groupKey]: !groupIsExpanded }))}
                                  type="button"
                                >
                                  <i aria-hidden="true">⌄</i>
                                </button>
                              )}
                            </div>
                            {groupHasItems && (
                              <div aria-hidden={!groupIsExpanded} className="dashboard-sidebar-leaves" data-expanded={groupIsExpanded ? "true" : "false"}>
                                <div>
                                  {groupNodes.map((node) => renderDashboardNode(
                                    node,
                                    `${groupKey}:${node.label}`,
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>}
              </div>
            );
          })}
        </nav>

        <div className="dashboard-sidebar-actions">
          <ThemeToggle variant="dashboard" />
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

      {routeLoading && (
        <div className="dashboard-route-loading">
          <SectionLoading
            compact
            description=""
            title={routeLoading.title}
            variant={routeLoading.variant}
          />
        </div>
      )}

      <div className="site-app-shell">{children}</div>
    </>
  );
}
