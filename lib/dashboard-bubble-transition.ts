import { SpringValue } from "@react-spring/web";
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
  element: HTMLElement;
};

type ReturnDestination = {
  end: DOMRect;
  element: HTMLElement;
};

const DASHBOARD_MEDIA_QUERY = "(min-width: 1200px) and (hover: hover) and (pointer: fine)";
const BUBBLE_STAGGER = 0.026;

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

function createReturnIconClone(href: string, source: HTMLElement): BubbleClone | null {
  const sourceIcon = source.querySelector<HTMLImageElement>("img");
  if (!sourceIcon) return null;
  const iconRect = sourceIcon.getBoundingClientRect();
  if (!iconRect.width || !iconRect.height) return null;

  const size = 36;
  const start = new DOMRect(
    iconRect.left + iconRect.width / 2 - size / 2,
    iconRect.top + iconRect.height / 2 - size / 2,
    size,
    size,
  );
  const shell = document.createElement("div");
  shell.className = "dashboard-transition-bubble dashboard-transition-return-icon";
  shell.dataset.dashboardHref = href;
  shell.setAttribute("aria-hidden", "true");
  shell.inert = true;
  Object.assign(shell.style, {
    height: `${size}px`,
    left: `${start.left}px`,
    top: `${start.top}px`,
    width: `${size}px`,
  });

  const sourceSurface = document.createElement("div");
  sourceSurface.className = "dashboard-transition-surface";
  const sourceLayer = sourceIcon.cloneNode() as HTMLImageElement;
  sourceLayer.className = "dashboard-transition-return-image";
  sourceLayer.removeAttribute("id");
  sourceLayer.setAttribute("aria-hidden", "true");
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
  return { layer, surface, end, element: target };
}

function returnDestination(target: HTMLElement): ReturnDestination {
  const icon = target.querySelector<HTMLElement>(".home-dashboard-icon") ?? target;
  return { end: icon.getBoundingClientRect(), element: target };
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

function staggeredProgress(progress: number, index: number) {
  const offset = index * BUBBLE_STAGGER;
  return Math.max(0, Math.min(1, (progress - offset) / (1 - offset)));
}

function renderDockBubbles(prepared: Array<{ clone: BubbleClone; destination: BubbleDestination }>, progress: number) {
  document.documentElement.style.setProperty(
    "--dashboard-route-reveal",
    String(Math.max(0, Math.min(1, (progress - 0.72) / 0.22))),
  );
  prepared.forEach(({ clone, destination }, index) => {
    const p = staggeredProgress(progress, index);
    const { start } = clone;
    const { end } = destination;
    const sourceScaleX = 1 + (end.width / start.width - 1) * p;
    const sourceScaleY = 1 + (end.height / start.height - 1) * p;
    const targetScaleX = start.width / end.width + (1 - start.width / end.width) * p;
    const targetScaleY = start.height / end.height + (1 - start.height / end.height) * p;
    const blend = Math.max(0, Math.min(1, (p - 0.34) / 0.36));

    clone.shell.style.transform = `translate3d(${(end.left - start.left) * p}px, ${(end.top - start.top) * p}px, 0)`;
    clone.shell.style.opacity = String(Math.max(0, Math.min(1, (1 - p) / 0.09)));
    for (const element of [clone.sourceLayer, clone.sourceSurface]) {
      element.style.transform = `scale(${sourceScaleX}, ${sourceScaleY})`;
      element.style.opacity = String(1 - blend);
    }
    for (const element of [destination.layer, destination.surface]) {
      element.style.transform = `scale(${targetScaleX}, ${targetScaleY})`;
      element.style.opacity = String(blend);
    }
  });
}

function renderReturnBubbles(prepared: Array<{ clone: BubbleClone; destination: ReturnDestination }>, progress: number, compact: boolean) {
  prepared.forEach(({ clone, destination }, index) => {
    const p = staggeredProgress(progress, index);
    const { end, element } = destination;
    const x = end.left + end.width / 2 - (clone.start.left + clone.start.width / 2);
    const y = end.top + end.height / 2 - (clone.start.top + clone.start.height / 2);
    const arc = Math.sin(Math.PI * p) * (compact ? 8 : 14);
    clone.shell.style.transform = `translate3d(${x * p}px, ${y * p - arc}px, 0) scale(${1 - p * 0.04})`;
    clone.shell.style.opacity = String(Math.max(0, Math.min(1, (1 - p) / 0.11)));
    if (p > 0.89) element.setAttribute("data-bubble-landed", "");
  });
}

async function springFlight(render: (progress: number) => void, active: (motion: SpringValue<number> | null) => void) {
  const motion = new SpringValue(0);
  active(motion);
  render(0);
  try {
    const result = await motion.start({
      from: 0,
      to: 1,
      config: { mass: 0.9, tension: 320, friction: 35, clamp: true, precision: 0.002 },
      onChange: ({ value }) => render(value),
    });
    if (!result.cancelled) render(1);
  } finally {
    motion.stop();
    active(null);
  }
}

function cleanupTransition(root: HTMLElement, clones: BubbleClone[]) {
  clones.forEach(({ shell }) => shell.remove());
  document.querySelectorAll("[data-bubble-landed]").forEach((element) => element.removeAttribute("data-bubble-landed"));
  root.style.removeProperty("--dashboard-route-reveal");
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
  window.setTimeout(() => ScrollTrigger.refresh(), 250);
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
    direction === "undock"
      ? createReturnIconClone(sectionHref, source)
      : createBubbleClone(sectionHref, source),
  ).filter((clone): clone is BubbleClone => clone !== null);
  if (clones.length !== 6) {
    router.push(href);
    return;
  }

  navigationInProgress = true;
  let motion: SpringValue<number> | null = null;
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    motion?.stop();
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
    if (direction === "undock") {
      const prepared = clones.map((clone) => ({
        clone, destination: returnDestination(targets.get(clone.href)!),
      }));
      prepared.sort((a, b) => Math.abs(a.destination.end.top - b.destination.end.top) > 8
        ? a.destination.end.top - b.destination.end.top
        : a.destination.end.left - b.destination.end.left);
      root.classList.add("dashboard-route-ready");
      await springFlight((progress) => renderReturnBubbles(prepared, progress, compact), (current) => { motion = current; });
    } else {
      const prepared = clones.map((clone) => ({
        clone, destination: addDestination(clone, targets.get(clone.href)!),
      }));
      root.classList.add("dashboard-route-ready");
      await springFlight((progress) => renderDockBubbles(prepared, progress), (current) => { motion = current; });
      root.classList.add("dashboard-transition-settled");
    }
  } finally {
    window.removeEventListener("resize", cancel);
    window.removeEventListener("popstate", cancel);
    motionPreference.removeEventListener("change", cancel);
    cleanupTransition(root, clones);
    navigationInProgress = false;
  }
}
