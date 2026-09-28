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

type BubbleDestination = {
  layer: HTMLElement;
  surface: HTMLElement;
  end: DOMRect;
};

const DASHBOARD_MEDIA_QUERY = "(min-width: 1200px) and (hover: hover) and (pointer: fine)";
const BUBBLE_DURATION = 580;
const BUBBLE_STAGGER = 18;

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

      if (routeMatches || performance.now() - startedAt > 1800) {
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

function buttonsFor(direction: DashboardBubbleDirection, phase: "source" | "target", compact: boolean) {
  if ((direction === "dock") === (phase === "source")) return homeButtons();
  if (compact && phase === "target") {
    const button = document.querySelector<HTMLElement>(".site-menu-button");
    return button ? new Map(Array.from(navigationButtons(true).keys(), (href) => [href, button])) : new Map<string, HTMLElement>();
  }
  return navigationButtons(compact);
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

function addDestination(clone: BubbleClone, target: HTMLElement): BubbleDestination {
  const surface = createSurface(target, "target");
  const layer = createContentLayer(target, "target");
  const end = target.getBoundingClientRect();
  for (const element of [surface, layer]) {
    element.style.width = `${end.width}px`;
    element.style.height = `${end.height}px`;
    element.style.opacity = "0";
  }
  clone.shell.append(surface, layer);
  return { layer, surface, end };
}

function rectSignature(buttons: Map<string, HTMLElement>) {
  return Array.from(buttons, ([href, button]) => {
    const rect = button.getBoundingClientRect();
    return `${href}:${rect.left.toFixed(1)}:${rect.top.toFixed(1)}:${rect.width.toFixed(1)}:${rect.height.toFixed(1)}`;
  }).join("|");
}

function waitForStableTargets(direction: DashboardBubbleDirection, compact: boolean) {
  const startedAt = performance.now();
  let previousSignature = "";
  let stableFrames = 0;

  return new Promise<Map<string, HTMLElement>>((resolve) => {
    const tick = () => {
      const targets = buttonsFor(direction, "target", compact);
      const visible = targets.size === 6 && Array.from(targets.values()).every((target) => target.getBoundingClientRect().width > 0);
      const signature = visible ? rectSignature(targets) : "";

      if (signature && signature === previousSignature) stableFrames += 1;
      else stableFrames = 0;
      previousSignature = signature;

      if (stableFrames >= 2 || performance.now() - startedAt > 1200) {
        resolve(targets);
        return;
      }

      window.requestAnimationFrame(tick);
    };

    tick();
  });
}

function animateBubble(
  timeline: gsap.core.Timeline,
  clone: BubbleClone,
  destination: BubbleDestination,
  index: number,
) {
  const { end } = destination;
  const source = [clone.sourceLayer, clone.sourceSurface];
  const target = [destination.layer, destination.surface];
  const startAt = index * BUBBLE_STAGGER / 1000;
  const duration = BUBBLE_DURATION / 1000;
  // Both appearances retain their measured dimensions. Only transforms and
  // opacity change during flight, so text/layout is never recalculated per frame.
  gsap.set(target, { scaleX: clone.start.width / end.width, scaleY: clone.start.height / end.height });
  timeline
    .to(clone.shell, { x: end.left - clone.start.left, y: end.top - clone.start.top, duration, ease: "power3.inOut" }, startAt)
    .to(source, { scaleX: end.width / clone.start.width, scaleY: end.height / clone.start.height, duration, ease: "power3.inOut" }, startAt)
    .to(target, { scaleX: 1, scaleY: 1, duration, ease: "power3.inOut" }, startAt)
    .to(source, { opacity: 0, duration: duration * 0.45, ease: "sine.inOut" }, startAt + duration * 0.25)
    .to(target, { opacity: 1, duration: duration * 0.45, ease: "sine.inOut" }, startAt + duration * 0.25);
}

function cleanupTransition(root: HTMLElement, clones: BubbleClone[]) {
  clones.forEach(({ shell }) => shell.remove());
  root.classList.remove(
    "dashboard-navigation-animating",
    "dashboard-target-preview",
    "dashboard-docking",
    "dashboard-undocking",
    "dashboard-route-swapping",
    "dashboard-route-ready",
    "dashboard-transition-settled",
    "dashboard-compact-transition",
  );
  ScrollTrigger.refresh();
}

export async function runDashboardBubbleTransition({
  direction,
  href,
  router,
}: DashboardBubbleTransitionOptions) {
  if (navigationInProgress) return;
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedMotion = motionPreference.matches;
  const compact = !window.matchMedia(DASHBOARD_MEDIA_QUERY).matches;
  try {
    router.prefetch?.(href);
  } catch {
    // Navigation still works when prefetching is unavailable.
  }
  if (reducedMotion) {
    router.push(href);
    return;
  }

  const root = document.documentElement;
  const clones = Array.from(buttonsFor(direction, "source", compact), ([sectionHref, source]) =>
    createBubbleClone(sectionHref, source),
  ).filter((clone): clone is BubbleClone => clone !== null);
  if (clones.length !== 6) {
    router.push(href);
    return;
  }

  navigationInProgress = true;
  let timeline: gsap.core.Timeline | undefined;
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    timeline?.progress(1);
    cleanupTransition(root, clones);
  };
  window.addEventListener("resize", cancel, { once: true });
  window.addEventListener("popstate", cancel, { once: true });
  motionPreference.addEventListener("change", cancel, { once: true });
  try {
    document.body.append(...clones.map(({ shell }) => shell));
    root.classList.add("dashboard-navigation-animating", "dashboard-route-swapping",
      direction === "dock" ? "dashboard-docking" : "dashboard-undocking");
    if (compact) root.classList.add("dashboard-compact-transition");
    if (direction === "dock") root.classList.add("dashboard-target-preview");
    router.push(href);
    if (!await waitForRoutePaint(href) || cancelled) return;
    if (direction === "undock") root.classList.add("dashboard-home-route");
    const targets = await waitForStableTargets(direction, compact);
    if (targets.size !== 6 || cancelled || Array.from(targets.values()).some((target) => {
      const rect = target.getBoundingClientRect();
      return !rect.width || !rect.height;
    })) return;
    const prepared = clones.map((clone, index) => ({
      clone, destination: addDestination(clone, targets.get(clone.href)!), index,
    }));
    root.classList.add("dashboard-route-ready");
    await new Promise<void>((resolve) => {
      timeline = gsap.timeline({ onComplete: resolve, onInterrupt: resolve });
      prepared.forEach(({ clone, destination, index }) => animateBubble(timeline!, clone, destination, index));
      timeline.call(() => root.classList.add("dashboard-transition-settled"))
        .to(clones.map(({ shell }) => shell), { opacity: 0, duration: 0.1, ease: "none" });
    });
  } finally {
    timeline?.kill();
    window.removeEventListener("resize", cancel);
    window.removeEventListener("popstate", cancel);
    motionPreference.removeEventListener("change", cancel);
    cleanupTransition(root, clones);
    navigationInProgress = false;
  }
}
