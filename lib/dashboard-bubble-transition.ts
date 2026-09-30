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

function waitForRoutePaint(href: string) {
  const destination = new URL(href, window.location.href);
  const startedAt = performance.now();

  return new Promise<boolean>((resolve) => {
    const tick = () => {
      const routeMatches = window.location.pathname === destination.pathname
        && window.location.search === destination.search;

      if (routeMatches || performance.now() - startedAt > 5000) {
        void nextPaint(2).then(() => resolve(routeMatches));
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
    const button = item.querySelector<HTMLElement>(".dashboard-sidebar-row > a");
    if (href && button) entries.set(href, button);
  });
  return entries;
}

function navigationButtons(compact: boolean) {
  if (!compact) return sidebarButtons();
  return new Map(Array.from(document.querySelectorAll<HTMLElement>(
    ".site-menu-link[data-dashboard-href]",
  ), (button) => [button.dataset.dashboardHref!, button]));
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
  const sourceNodes = [source, ...source.querySelectorAll<HTMLElement>("span, strong, small, img")];
  const cloneNodes = [clone, ...clone.querySelectorAll<HTMLElement>("span, strong, small, img")];

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

// Keep the outgoing page mounted until every bubble has disappeared. The
// route and its layout settle behind the same opacity curtain before reveal.
export async function runDashboardBubbleTransition({ direction, href, router }: DashboardBubbleTransitionOptions) {
  if (navigationInProgress) return;
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  try { router.prefetch?.(href); } catch { /* Prefetch is optional. */ }
  if (preference.matches) {
    router.push(href);
    return;
  }

  const compact = !window.matchMedia(DASHBOARD_MEDIA_QUERY).matches;
  const sources = direction === "dock" ? homeButtons() : navigationButtons(compact);
  const clones = Array.from(sources, ([key, source]) => createBubbleClone(key, source))
    .filter((clone): clone is BubbleClone => clone !== null);
  if (!clones.length) {
    router.push(href);
    return;
  }

  const root = document.documentElement;
  const visibility = Array.from(sources.values(), (element) => ({ element, value: element.style.visibility }));
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const animation: { timeline: gsap.core.Timeline | null } = { timeline: null };
  let resolveAnimation: (() => void) | null = null;
  let cancelled = false;
  let skipMotion = false;
  navigationInProgress = true;

  const finishMotion = () => {
    skipMotion = true;
    animation.timeline?.progress(1);
  };
  const cancel = () => {
    cancelled = true;
    animation.timeline?.kill();
    resolveAnimation?.();
  };
  window.addEventListener("resize", finishMotion);
  preference.addEventListener("change", finishMotion);
  window.addEventListener("popstate", cancel);

  try {
    document.body.append(...clones.map(({ shell }) => shell));
    visibility.forEach(({ element }) => { element.style.visibility = "hidden"; });
    root.style.setProperty("--dashboard-center-opacity", "1");
    root.classList.add("dashboard-center-transition");
    if (direction === "undock") root.classList.add("dashboard-undocking");

    await new Promise<void>((resolve) => {
      resolveAnimation = resolve;
      animation.timeline = gsap.timeline({ onComplete: resolve });
      for (const { shell, start } of clones) {
        gsap.set(shell, { transformOrigin: "50% 50%" });
        animation.timeline.to(shell, {
          x: center.x - start.left - start.width / 2,
          y: center.y - start.top - start.height / 2,
          scale: 0,
          duration: 0.46,
          ease: "power3.inOut",
        }, 0);
        // Fade before the tiny bubbles meet, preventing an overlapping pile.
        animation.timeline.to(shell, { opacity: 0, duration: 0.16, ease: "power1.in" }, 0.30);
      }
      animation.timeline.to(root, { "--dashboard-center-opacity": 0, duration: 0.22, ease: "power1.inOut" }, 0.24);
    });
    if (cancelled) return;
    clones.forEach(({ shell }) => shell.remove());
    router.push(href);
    if (!await waitForRoutePaint(href) || cancelled) return;

    if (direction === "undock") {
      // Wait for the home component's settled entry state, not just the URL.
      const started = performance.now();
      while (!document.querySelector(".home-entry-settled") && performance.now() - started < 1500 && !cancelled) {
        await nextPaint();
      }
    }
    if (cancelled) return;
    ScrollTrigger.refresh();
    await nextPaint();
    if (cancelled) return;
    visibility.forEach(({ element, value }) => { element.style.visibility = value; });
    if (!skipMotion) {
      await new Promise<void>((resolve) => {
        resolveAnimation = resolve;
        animation.timeline = gsap.timeline({ onComplete: resolve }).to(root, {
          "--dashboard-center-opacity": 1, duration: 0.18, ease: "power1.out",
        });
      });
    }
  } finally {
    animation.timeline?.kill();
    clones.forEach(({ shell }) => shell.remove());
    visibility.forEach(({ element, value }) => { element.style.visibility = value; });
    root.classList.remove("dashboard-center-transition", "dashboard-undocking");
    root.style.removeProperty("--dashboard-center-opacity");
    window.removeEventListener("resize", finishMotion);
    window.removeEventListener("popstate", cancel);
    preference.removeEventListener("change", finishMotion);
    navigationInProgress = false;
  }
}
