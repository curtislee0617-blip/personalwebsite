import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type DashboardRouter = {
  push: (href: string) => void;
  prefetch?: (href: string) => void;
};

type DashboardBubbleDirection = "dock" | "undock";

type DashboardBubbleTransitionOptions = {
  direction: DashboardBubbleDirection;
  href: string;
  router: DashboardRouter;
};

type BubbleClone = {
  href: string;
  shell: HTMLElement;
  sourceLayer: HTMLElement;
  sourceSurface: HTMLElement;
  start: DOMRect;
};

export const DASHBOARD_FOLD_EVENT = "dashboard-navigation-folded";
export const DASHBOARD_LOADING_EVENT = "dashboard-navigation-loading";

const DASHBOARD_MEDIA_QUERY = "(min-width: 1200px) and (hover: hover) and (pointer: fine)";

gsap.registerPlugin(ScrollTrigger);

let navigationInProgress = false;

function nextPaint(frames = 2) {
  return new Promise<void>((resolve) => {
    const step = (remaining: number) => {
      window.requestAnimationFrame(() => {
        if (remaining <= 1) resolve();
        else step(remaining - 1);
      });
    };
    step(frames);
  });
}

function waitForRoutePaint(href: string, aborted: () => boolean, allowLoading = false) {
  const destination = new URL(href, window.location.href);
  const startedAt = performance.now();

  return new Promise<boolean>((resolve) => {
    const tick = () => {
      if (aborted()) { resolve(false); return; }
      const routeMatches = window.location.pathname === destination.pathname
        && window.location.search === destination.search;
      const homeMounted = Boolean(document.querySelector(".home-landing"));
      const contentReady = homeMounted === (destination.pathname === "/")
        && (allowLoading || !document.querySelector(".site-app-shell main .section-loading"));

      if (routeMatches && contentReady) {
        void nextPaint(2).then(() => resolve(!aborted()));
        return;
      }
      // Redirects and failed requests must also release the navigation lock.
      if (performance.now() - startedAt > 8000) {
        resolve(false);
        return;
      }

      window.requestAnimationFrame(tick);
    };

    tick();
  });
}

function homeButtons() {
  const entries = new Map<string, HTMLElement>();
  document.querySelectorAll<HTMLElement>(".home-dashboard-button[data-dashboard-href]").forEach((button) => {
    const href = button.dataset.dashboardHref;
    if (href) entries.set(href, button);
  });
  return entries;
}

function sidebarButtons() {
  const entries = new Map<string, HTMLElement>();
  document.querySelectorAll<HTMLElement>(".dashboard-sidebar-item[data-dashboard-href]").forEach((item) => {
    const href = item.dataset.dashboardHref;
    const button = item.querySelector<HTMLElement>(".dashboard-sidebar-row");
    if (href && button) entries.set(href, button);
  });
  return entries;
}

function removeInteractionAttributes(node: HTMLElement) {
  node.removeAttribute("href");
  node.removeAttribute("id");
  node.removeAttribute("data-spotlight");
  node.removeAttribute("data-spotlight-active");
  node.removeAttribute("tabindex");
  node.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
  node.querySelectorAll<HTMLElement>("a, button, input, select, textarea").forEach((element) => {
    element.removeAttribute("href");
    element.tabIndex = -1;
  });
}

const COPIED_STYLE_PROPERTIES = [
  "padding",
  "boxSizing",
  "flex",
  "alignItems",
  "background",
  "borderRadius",
  "color",
  "display",
  "flexDirection",
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "gap",
  "gridTemplateColumns",
  "gridTemplateRows",
  "height",
  "justifyContent",
  "letterSpacing",
  "lineHeight",
  "minHeight",
  "minWidth",
  "objectFit",
  "overflow",
  "placeItems",
  "textAlign",
  "textOverflow",
  "textTransform",
  "whiteSpace",
  "width",
] as const;

function copyDescendantStyles(source: HTMLElement, clone: HTMLElement) {
  const sourceNodes = [source, ...source.querySelectorAll<HTMLElement>("*")];
  const cloneNodes = [clone, ...clone.querySelectorAll<HTMLElement>("*")];

  sourceNodes.forEach((sourceNode, index) => {
    const cloneNode = cloneNodes[index];
    if (!cloneNode) return;
    const style = window.getComputedStyle(sourceNode);

    for (const property of COPIED_STYLE_PROPERTIES) {
      cloneNode.style[property] = style[property];
    }
  });
}

function createContentLayer(source: HTMLElement, role: "source" | "target") {
  const style = window.getComputedStyle(source);
  const layer = source.cloneNode(true) as HTMLElement;
  removeInteractionAttributes(layer);
  layer.className = `dashboard-transition-layer dashboard-transition-layer-${role}`;
  layer.setAttribute("aria-hidden", "true");
  copyDescendantStyles(source, layer);

  Object.assign(layer.style, {
    alignItems: style.alignItems,
    background: "transparent",
    border: "0",
    borderRadius: "0",
    boxShadow: "none",
    display: style.display,
    gap: style.gap,
    gridTemplateColumns: style.gridTemplateColumns,
    height: "100%",
    justifyContent: style.justifyContent,
    margin: "0",
    minHeight: "0",
    padding: style.padding,
    width: "100%",
    visibility: "visible",
  });

  return layer;
}

function createSurface(source: HTMLElement, role: "source" | "target") {
  const style = window.getComputedStyle(source);
  const surface = document.createElement("div");
  surface.className = `dashboard-transition-surface dashboard-transition-surface-${role}`;
  surface.setAttribute("aria-hidden", "true");
  Object.assign(surface.style, {
    background: style.background,
    border: style.border,
    borderRadius: style.borderRadius,
    boxShadow: style.boxShadow,
  });
  return surface;
}

function createBubbleClone(href: string, source: HTMLElement): BubbleClone | null {
  const start = source.getBoundingClientRect();
  if (!start.width || !start.height) return null;

  const shell = document.createElement("div");
  shell.className = "dashboard-transition-bubble";
  shell.dataset.dashboardHref = href;
  shell.setAttribute("aria-hidden", "true");
  shell.inert = true;
  Object.assign(shell.style, {
    height: `${start.height}px`,
    left: `${start.left}px`,
    top: `${start.top}px`,
    width: `${start.width}px`,
  });

  const sourceSurface = createSurface(source, "source");
  const sourceLayer = createContentLayer(source, "source");
  shell.append(sourceSurface, sourceLayer);


  return { href, shell, sourceLayer, sourceSurface, start };
}

// The surface may change aspect ratio, but typography must never stretch with
// it. Keep both content snapshots at their native size throughout the flight.
function positionBubble(
  shell: HTMLElement,
  layers: HTMLElement[],
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
) {
  shell.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scaleX}, ${scaleY})`;
  const inverse = `scale(${1 / scaleX}, ${1 / scaleY})`;
  layers.forEach((layer) => { layer.style.transform = inverse; });
}

export async function runDashboardBubbleTransition({ direction, href, router }: DashboardBubbleTransitionOptions) {
  if (navigationInProgress) return;
  window.dispatchEvent(new Event("site-navigation-start"));
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  try { router.prefetch?.(href); } catch { /* Prefetch is optional. */ }
  if (preference.matches) {
    router.push(href);
    return;
  }

  const compact = !window.matchMedia(DASHBOARD_MEDIA_QUERY).matches;
  const root = document.documentElement;
  const home = document.querySelector<HTMLElement>(".home-dashboard-panel");
  const sidebar = document.querySelector<HTMLElement>(".dashboard-sidebar");
  const menu = document.querySelector<HTMLElement>(".site-menu-panel");
  const source = direction === "dock" ? home : compact ? menu : sidebar;
  if (!source || !source.getBoundingClientRect().width) {
    router.push(href);
    return;
  }

  const saved = new Map<HTMLElement, string | null>();
  const remember = (element: HTMLElement) => {
    if (!saved.has(element)) saved.set(element, element.getAttribute("style"));
    return element;
  };
  const overlay = document.createElement("div");
  overlay.className = "navigation-motion-overlay";
  overlay.inert = true;
  overlay.setAttribute("aria-hidden", "true");
  const animation: { timeline: gsap.core.Timeline | null } = { timeline: null };
  let resolveMotion: (() => void) | undefined;
  let cancelled = false;
  let skipMotion = false;
  let routeRequested = false;
  let loadingTimer: number | undefined;
  const play = (build: (timeline: gsap.core.Timeline) => void) => new Promise<void>((resolve) => {
    if (cancelled) { resolve(); return; }
    resolveMotion = resolve;
    const timeline = gsap.timeline({ paused: true, onComplete: resolve });
    animation.timeline = timeline;
    build(timeline);
    if (skipMotion) timeline.progress(1);
    else timeline.play();
    if (!timeline.duration()) resolve();
  });
  const finishMotion = () => { skipMotion = true; animation.timeline?.progress(1); };
  const cancel = () => { cancelled = true; animation.timeline?.kill(); resolveMotion?.(); };
  const setPhase = (phase: string) => { root.dataset.navigationPhase = phase; };
  const requestRoute = () => {
    if (routeRequested || cancelled) return;
    routeRequested = true;
    router.push(href);
  };
  const clearLoading = () => {
    window.clearTimeout(loadingTimer);
    window.dispatchEvent(new CustomEvent(DASHBOARD_LOADING_EVENT, { detail: null }));
  };
  const waitForDestination = async (phase: "home-loading" | "route-loading", allowLoading = false) => {
    loadingTimer = window.setTimeout(() => {
      if (cancelled) return;
      setPhase(phase);
      window.dispatchEvent(new CustomEvent(DASHBOARD_LOADING_EVENT, { detail: href }));
    }, 150);
    try {
      return await waitForRoutePaint(href, () => cancelled, allowLoading);
    } finally {
      clearLoading();
    }
  };

  navigationInProgress = true;
  window.addEventListener("resize", finishMotion);
  preference.addEventListener("change", finishMotion);
  window.addEventListener("popstate", cancel);
  document.body.append(overlay);
  root.style.setProperty("--navigation-page-opacity", "1");
  root.classList.add("dashboard-liquid-transition");
  if (direction === "undock") root.classList.add("dashboard-undocking");
  else root.classList.add("dashboard-dock-staging");

  try {
    if (direction === "undock") {
      let returning: BubbleClone[] = [];
      const menuButton = compact ? document.querySelector<HTMLElement>(".site-menu-button") : null;
      const buttonRect = menuButton?.getBoundingClientRect();
      const corner = buttonRect
        ? { x: buttonRect.left + buttonRect.width / 2, y: buttonRect.top + buttonRect.height / 2 }
        : { x: window.innerWidth - 32, y: 32 };
      setPhase("fold");
      if (!compact) {
        const levels = [".dashboard-sidebar-tree-children", ".dashboard-sidebar-leaves", ".dashboard-sidebar-subtitle"];
        await play((tl) => levels.forEach((selector, depth) => {
          const opened = Array.from(source.querySelectorAll<HTMLElement>(`${selector}[data-expanded='true']`));
          opened.forEach((element) => {
            remember(element);
            const height = element.getBoundingClientRect().height;
            gsap.set(element, { height, overflow: "hidden", transition: "none" });
          });
          if (opened.length) tl.to(opened, { height: 0, opacity: 0, duration: 0.2, ease: "power2.inOut" }, depth * 0.035);
        }));
        if (cancelled) return;
        window.dispatchEvent(new Event(DASHBOARD_FOLD_EVENT));
        await nextPaint();
      }
      if (cancelled) return;
      if (compact) {
        remember(source);
        gsap.set(source, {
          transition: "none",
          pointerEvents: "none",
        });
        if (menuButton) remember(menuButton);
        setPhase("menu-close");
        await play((tl) => {
          // Preserve the origin already measured by the menu's spring, even
          // when Home is selected before that spring has finished opening.
          tl.to(source, { scale: 0.12, opacity: 0, duration: 0.24, ease: "power2.inOut" }, 0);
          // Finish closing the menu before handing the corner to the dashboard.
          tl.to(root, { "--navigation-page-opacity": 0, duration: 0.14 }, 0.24);
          if (menuButton) tl.to(menuButton, { opacity: 0, duration: 0.14 }, 0.24);
        });
      } else {
        setPhase("labels-lift");
        const rows = sidebarButtons();
        returning = Array.from(rows, ([key, element]) => createBubbleClone(key, element))
          .filter((clone): clone is BubbleClone => clone !== null);
        overlay.append(...returning.map(({ shell }) => shell));
        rows.forEach((element) => { remember(element).style.visibility = "hidden"; });
        remember(source);
        await play((tl) => {
          tl.to(source, { x: -source.getBoundingClientRect().width - 24, opacity: 0, duration: 0.24, ease: "power2.inOut" }, 0);
          tl.to(returning.map(({ shell }) => shell), { x: -16, opacity: 0, duration: 0.18, ease: "power2.inOut" }, 0);
          tl.to(root, { "--navigation-page-opacity": 0, duration: 0.18 }, 0);
          // Start loading as soon as the outgoing page is hidden. The labels
          // leave with the sidebar instead of hovering while Home is pending.
          tl.call(requestRoute, [], 0.18);
        });
      }
      if (cancelled) return;
      setPhase("route");
      requestRoute();
      if (!await waitForDestination("home-loading") || cancelled) return;
      const started = performance.now();
      while (!document.querySelector(".home-entry-settled") && performance.now() - started < 1500 && !cancelled) await nextPaint();
      if (cancelled) return;
      const destination = document.querySelector<HTMLElement>(".home-dashboard-panel");
      if (!compact && destination) {
        remember(destination);
        const rect = destination.getBoundingClientRect();
        const panelStyle = getComputedStyle(destination);
        const borderColor = panelStyle.borderColor;
        const radius = Number.parseFloat(panelStyle.borderTopLeftRadius);
        gsap.set(destination, {
          borderColor: "transparent", opacity: 0, animation: "none",
        });
        const outline = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        outline.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
        Object.assign(outline.style, {
          position: "fixed", left: `${rect.left}px`, top: `${rect.top}px`,
          width: `${rect.width}px`, height: `${rect.height}px`, overflow: "visible",
        });
        const border = document.createElementNS(outline.namespaceURI, "rect");
        Object.entries({ x: "0.5", y: "0.5", width: String(rect.width - 1), height: String(rect.height - 1), rx: String(radius), fill: "none", stroke: borderColor, "stroke-width": "1", pathLength: "1", "stroke-dasharray": "1", "stroke-dashoffset": "1" })
          .forEach(([key, value]) => border.setAttribute(key, value));
        outline.append(border);
        overlay.prepend(outline);
        const targets = homeButtons();
        targets.forEach((element) => { remember(element).style.visibility = "hidden"; });
        const art = destination.querySelector<HTMLElement>(".home-dashboard-pixel-art");
        const heading = destination.querySelector<HTMLElement>(".home-dashboard-heading > div:first-child");
        const labels = Array.from(destination.querySelectorAll<HTMLElement>(".home-dashboard-group > h2"));
        if (art) { remember(art); gsap.set(art, { opacity: 0, y: Math.min(28, art.offsetHeight * 0.2), scale: 0.98, transformOrigin: "50% 100%" }); }
        if (heading) { remember(heading); gsap.set(heading, { opacity: 0, y: 6 }); }
        labels.forEach((label) => { remember(label); gsap.set(label, { opacity: 0 }); });
        setPhase("dashboard-assemble");
        const dashboardCopyRevealStart = 0.26;
        const dashboardCopyRevealDuration = 0.58;
        await play((tl) => {
          tl.to(root, { "--navigation-page-opacity": 1, duration: 0.28 }, 0);
          tl.to(destination, { opacity: 1, duration: 0.4 }, 0);
          tl.to(border, { attr: { "stroke-dashoffset": 0 }, duration: 0.72, ease: "power1.inOut" }, 0.06);
          returning.forEach(({ href: key, shell, sourceLayer, sourceSurface, start }, index) => {
            const target = targets.get(key);
            if (!target) { tl.to(shell, { opacity: 0, duration: 0.2 }, 0); return; }
            const end = target.getBoundingClientRect();
            const targetLayer = createContentLayer(target, "target");
            const targetSurface = createSurface(target, "target");
            Object.assign(targetLayer.style, { width: `${end.width}px`, height: `${end.height}px`, opacity: "0" });
            targetSurface.style.opacity = "0";
            shell.append(targetSurface, targetLayer);
            const departure = { x: start.left, y: start.top };
            const control = {
              // Tools changes vertical order with Recipes and Restaurants.
              // Give it a separate curved lane so those labels never cross.
              x: (departure.x + end.left) / 2 + (key === "/tools" ? Math.min(180, window.innerWidth * 0.125) : 0),
              y: (departure.y + end.top) / 2 - Math.min(20, Math.abs(end.top - departure.y) * 0.1),
            };
            const duration = 0.7 + index * 0.018;
            const progress = { value: 0 };
            tl.to(shell, { opacity: 1, duration: 0.16, ease: "power1.out" }, 0);
            tl.to(progress, {
              value: 1, duration, ease: "power1.inOut",
              onUpdate: () => {
                const p = progress.value;
                const q = 1 - p;
                // Keep the compact label readable in flight; form the wider
                // dashboard card only as it reaches its own destination.
                const morph = Math.max(0, Math.min(1, (p - 0.5) * 2));
                const dimensions = morph * morph * (3 - 2 * morph);
                positionBubble(shell, [sourceLayer, targetLayer],
                  q * q * departure.x + 2 * q * p * control.x + p * p * end.left - start.left,
                  q * q * departure.y + 2 * q * p * control.y + p * p * end.top - start.top,
                  1 + (end.width / start.width - 1) * dimensions,
                  1 + (end.height / start.height - 1) * dimensions,
                );
              },
              onComplete: () => { target.style.visibility = "visible"; shell.style.display = "none"; },
            }, 0);
            tl.to(sourceLayer, { opacity: 0, duration: 0.16 }, duration - 0.2);
            tl.to(targetLayer, { opacity: 1, duration: 0.16 }, duration - 0.18);
            tl.to(sourceSurface, { opacity: 0, duration: 0.2 }, 0.1);
            tl.to(targetSurface, { opacity: 1, duration: 0.18 }, duration - 0.18);
          });
          tl.to(labels, { opacity: 1, duration: 0.3 }, 0.28);
          if (art) tl.to(art, {
            opacity: 1, y: 0, scale: 1,
            duration: dashboardCopyRevealDuration,
            ease: "power1.out",
          }, dashboardCopyRevealStart);
          if (heading) tl.to(heading, {
            opacity: 1, y: 0,
            duration: dashboardCopyRevealDuration,
            ease: "power1.out",
          }, dashboardCopyRevealStart);
        });
      } else {
        if (destination) {
          remember(destination);
          const rect = destination.getBoundingClientRect();
          gsap.set(destination, {
            opacity: 0, scale: 0.06, y: 0,
            transformOrigin: `${corner.x - rect.left}px ${corner.y - rect.top}px`,
            animation: "none",
          });
        }
        setPhase("corner-home-reveal");
        await play((tl) => {
          tl.to(root, { "--navigation-page-opacity": 1, duration: 0.3 }, 0);
          if (destination) tl.to(destination, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0);
        });
      }
    } else if (compact) {
      setPhase("corner-collapse");
      // Measure the same corner anchor used by SiteHeader, including safe areas.
      const anchor = document.createElement("div");
      anchor.className = "site-menu-shell navigation-corner-anchor";
      const button = document.createElement("div");
      button.className = "site-menu-button";
      anchor.append(button);
      overlay.append(anchor);
      const box = button.getBoundingClientRect();
      anchor.remove();
      const sourceRect = source.getBoundingClientRect();
      remember(source);
      gsap.set(source, {
        animation: "none",
        transition: "none",
        transformOrigin: `${box.left + box.width / 2 - sourceRect.left}px ${box.top + box.height / 2 - sourceRect.top}px`,
      });
      await play((tl) => {
        tl.to(source, { scale: 0.06, duration: 0.44, ease: "power2.inOut" }, 0);
        tl.to(source, { opacity: 0, duration: 0.14 }, 0.3);
        tl.to(root, { "--navigation-page-opacity": 0, duration: 0.16 }, 0.28);
      });
      if (cancelled) return;
      setPhase("route");
      requestRoute();
      // Reveal the real navigation and Next's fallback as soon as it commits;
      // waiting for all page data here leaves mobile users on a blank screen.
      if (!await waitForDestination("route-loading", true) || cancelled) return;
      const destination = document.querySelector<HTMLElement>(".site-menu-button");
      if (destination) { remember(destination); gsap.set(destination, { opacity: 0 }); }
      setPhase("menu-reveal");
      await play((tl) => {
        tl.to(root, { "--navigation-page-opacity": 1, duration: 0.28 }, 0);
        // The button's transform belongs to React Spring; avoid a second owner.
        if (destination) tl.to(destination, { opacity: 1, duration: 0.24, ease: "power2.out" }, 0.04);
      });
    } else {
      setPhase("lift");
      window.dispatchEvent(new Event(DASHBOARD_FOLD_EVENT));
      const sources = homeButtons();
      const clones = Array.from(sources, ([key, element]) => createBubbleClone(key, element))
        .filter((clone): clone is BubbleClone => clone !== null);
      overlay.append(...clones.map(({ shell }) => shell));
      sources.forEach((element) => { remember(element).style.visibility = "hidden"; });
      // The sidebar is persistent, so its folded targets can be measured on
      // the home route. Route latency must never delay the docking animation.
      await nextPaint();
      if (cancelled) return;
      if (!sidebar) { requestRoute(); return; }
      remember(sidebar);
      // Staging CSS makes the final, folded geometry measurable without flashing.
      gsap.set(sidebar, { x: 0, opacity: 1, visibility: "hidden", transition: "none" });
      const targets = sidebarButtons();
      const targetRects = new Map(Array.from(targets, ([key, element]) => [key, element.getBoundingClientRect()]));
      const hiddenParts = Array.from(sidebar.querySelectorAll<HTMLElement>(
        ".dashboard-sidebar-profile, .dashboard-sidebar-rule, .dashboard-sidebar-kicker, .dashboard-sidebar-item, .dashboard-sidebar-actions, .dashboard-sidebar-resizer",
      ));
      hiddenParts.forEach((element) => { remember(element).style.visibility = "hidden"; });
      const sidebarRect = sidebar.getBoundingClientRect();
      setPhase("taskbar-emerge");
      gsap.set(sidebar, { x: -sidebarRect.right - 24, scaleX: 0.96, visibility: "visible", transformOrigin: "0% 50%" });
      await play((tl) => {
        tl.to(root, { "--navigation-page-opacity": 0, duration: 0.24 }, 0);
        tl.call(requestRoute, [], 0.24);
        tl.to(sidebar, { x: 0, scaleX: 1, duration: 0.46, ease: "back.out(0.35)" }, 0);
        clones.forEach(({ href: key, shell, sourceLayer, sourceSurface, start }, index) => {
          const target = targets.get(key);
          const end = targetRects.get(key);
          if (!target || !end || !end.width) { tl.to(shell, { opacity: 0, duration: 0.2 }, 0); return; }
          const targetLayer = createContentLayer(target, "target");
          const targetSurface = createSurface(target, "target");
          Object.assign(targetLayer.style, { width: `${end.width}px`, height: `${end.height}px`, opacity: "0" });
          targetSurface.style.opacity = "0";
          shell.append(targetSurface, targetLayer);
          const progress = { value: 0 };
          const departure = {
            x: start.left + Number(gsap.getProperty(shell, "x")),
            y: start.top + Number(gsap.getProperty(shell, "y")),
            scale: Number(gsap.getProperty(shell, "scaleX")),
          };
          const control = {
            x: (departure.x + end.left) / 2 + (key === "/tools" ? Math.min(180, window.innerWidth * 0.125) : 0),
            y: Math.min(departure.y, end.top) - 24 - index * 2,
          };
          const duration = 0.72 + index * 0.018;
          tl.to(progress, {
            value: 1, duration, ease: "power1.out",
            onUpdate: () => {
              const p = progress.value;
              const q = 1 - p;
              positionBubble(shell, [sourceLayer, targetLayer],
                q * q * departure.x + 2 * q * p * control.x + p * p * end.left - start.left,
                q * q * departure.y + 2 * q * p * control.y + p * p * end.top - start.top,
                departure.scale + (end.width / start.width - departure.scale) * p,
                departure.scale + (end.height / start.height - departure.scale) * p,
              );
            },
            onComplete: () => {
              const item = target.closest<HTMLElement>(".dashboard-sidebar-item");
              if (item) item.style.visibility = "visible";
              shell.style.display = "none";
            },
          }, 0);
          tl.to(sourceLayer, { opacity: 0, duration: 0.16 }, 0.1);
          tl.to(targetLayer, { opacity: 1, duration: 0.16 }, 0.18);
          tl.to(sourceSurface, { opacity: 0, duration: 0.3 }, 0.1);
          tl.to(targetSurface, { opacity: 1, duration: 0.3 }, 0.1);
        });
        const finishing = hiddenParts.filter((element) => !element.classList.contains("dashboard-sidebar-item"));
        finishing.forEach((element) => {
          const profile = element.classList.contains("dashboard-sidebar-profile");
          tl.fromTo(element, { y: profile ? -24 : 0, opacity: 0 }, { visibility: "visible", y: 0, opacity: 1, duration: profile ? 0.4 : 0.2, ease: "power2.out" }, profile ? 0.83 : 0.72);
        });
      });
      if (cancelled) return;
      // If the route has not committed yet, fill the empty content area with
      // its loader. Once mounted, Next's page fallback can take over directly.
      const destination = new URL(href, window.location.href);
      if (window.location.pathname !== destination.pathname
        || window.location.search !== destination.search
        || document.querySelector(".home-landing")) {
        setPhase("dock-loading");
        window.dispatchEvent(new CustomEvent(DASHBOARD_LOADING_EVENT, { detail: href }));
        if (!await waitForRoutePaint(href, () => cancelled, true) || cancelled) return;
      }
      setPhase("page-reveal");
      window.dispatchEvent(new CustomEvent(DASHBOARD_LOADING_EVENT, { detail: null }));
      await play((tl) => {
        tl.to(root, { "--navigation-page-opacity": 1, duration: 0.28, ease: "power1.out" }, 0);
      });
    }
  } finally {
    clearLoading();
    animation.timeline?.kill();
    overlay.remove();
    for (const [element, style] of saved) {
      gsap.set(element, { clearProps: "all" });
      if (style === null) element.removeAttribute("style");
      else element.setAttribute("style", style);
    }
    root.classList.remove("dashboard-liquid-transition", "dashboard-dock-staging", "dashboard-undocking");
    root.style.removeProperty("--navigation-page-opacity");
    delete root.dataset.navigationPhase;
    window.removeEventListener("resize", finishMotion);
    window.removeEventListener("popstate", cancel);
    preference.removeEventListener("change", finishMotion);
    navigationInProgress = false;
  }
  // Measure only the settled layout, after removing staging and inline styles.
  if (!cancelled) {
    await nextPaint();
    if (!navigationInProgress) ScrollTrigger.refresh();
  }
}
