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
  target: HTMLElement;
};

const DASHBOARD_MEDIA_QUERY = "(min-width: 1200px) and (hover: hover) and (pointer: fine)";
const TRANSITION_EASING = "cubic-bezier(.22, .76, .28, 1)";
const BUBBLE_DURATION = 580;
const BUBBLE_STAGGER = 18;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

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

  return new Promise<void>((resolve) => {
    const tick = () => {
      const routeMatches = window.location.pathname === destination.pathname
        && window.location.search === destination.search;

      if (routeMatches || performance.now() - startedAt > 1800) {
        void nextPaint(2).then(resolve);
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

function buttonsFor(direction: DashboardBubbleDirection, phase: "source" | "target") {
  if (phase === "source") return direction === "dock" ? homeButtons() : sidebarButtons();
  return direction === "dock" ? sidebarButtons() : homeButtons();
}

function removeInteractionAttributes(node: HTMLElement) {
  node.removeAttribute("href");
  node.removeAttribute("id");
  node.removeAttribute("data-spotlight");
  node.removeAttribute("data-spotlight-active");
  node.removeAttribute("tabindex");
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
  Object.assign(shell.style, {
    height: `${start.height}px`,
    left: `${start.left}px`,
    top: `${start.top}px`,
    width: `${start.width}px`,
  });

  const sourceSurface = createSurface(source, "source");
  const sourceLayer = createContentLayer(source, "source");
  shell.append(sourceSurface, sourceLayer);
  document.body.append(shell);

  return { href, shell, sourceLayer, sourceSurface, start };
}

function addDestination(clone: BubbleClone, target: HTMLElement): BubbleDestination {
  const surface = createSurface(target, "target");
  const layer = createContentLayer(target, "target");
  surface.style.opacity = "0";
  layer.style.opacity = "0";
  clone.shell.append(surface, layer);
  return { layer, surface, target };
}

function rectSignature(buttons: Map<string, HTMLElement>) {
  return Array.from(buttons, ([href, button]) => {
    const rect = button.getBoundingClientRect();
    return `${href}:${rect.left.toFixed(1)}:${rect.top.toFixed(1)}:${rect.width.toFixed(1)}:${rect.height.toFixed(1)}`;
  }).join("|");
}

function waitForStableTargets(direction: DashboardBubbleDirection) {
  const startedAt = performance.now();
  let previousSignature = "";
  let stableFrames = 0;

  return new Promise<Map<string, HTMLElement>>((resolve) => {
    const tick = () => {
      const targets = buttonsFor(direction, "target");
      const signature = targets.size === 6 ? rectSignature(targets) : "";

      if (signature && signature === previousSignature) stableFrames += 1;
      else stableFrames = 0;
      previousSignature = signature;

      if (stableFrames >= 3 || performance.now() - startedAt > 1200) {
        resolve(targets);
        return;
      }

      window.requestAnimationFrame(tick);
    };

    tick();
  });
}

function finished(animation: Animation) {
  return animation.finished.catch(() => undefined);
}

function switchToDestination(clone: BubbleClone, destination: BubbleDestination) {
  const timing = { duration: 110, easing: "ease-out", fill: "forwards" as const };
  return Promise.all([
    finished(clone.sourceLayer.animate([{ opacity: 1 }, { opacity: 0 }], timing)),
    finished(clone.sourceSurface.animate([{ opacity: 1 }, { opacity: 0 }], timing)),
    finished(destination.layer.animate([{ opacity: 0 }, { opacity: 1 }], timing)),
    finished(destination.surface.animate([{ opacity: 0 }, { opacity: 1 }], timing)),
  ]);
}

function animateBubble(
  clone: BubbleClone,
  destination: BubbleDestination,
  index: number,
) {
  const end = destination.target.getBoundingClientRect();
  const delay = index * BUBBLE_STAGGER;
  const translateX = end.left - clone.start.left;
  const translateY = end.top - clone.start.top;
  const endRadius = window.getComputedStyle(destination.target).borderRadius;

  const shellAnimation = clone.shell.animate(
    [
      {
        borderRadius: window.getComputedStyle(clone.sourceSurface).borderRadius,
        height: `${clone.start.height}px`,
        transform: "translate3d(0, 0, 0)",
        width: `${clone.start.width}px`,
      },
      {
        borderRadius: endRadius,
        height: `${end.height}px`,
        transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
        width: `${end.width}px`,
      },
    ],
    {
      delay,
      duration: BUBBLE_DURATION,
      easing: TRANSITION_EASING,
      fill: "forwards",
    },
  );

  return finished(shellAnimation);
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
  );
}

export async function runDashboardBubbleTransition({
  direction,
  href,
  router,
}: DashboardBubbleTransitionOptions) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktopDashboard = window.matchMedia(DASHBOARD_MEDIA_QUERY).matches;

  try {
    router.prefetch?.(href);
  } catch {
    // Navigation still works when prefetching is unavailable.
  }

  if (reducedMotion || !isDesktopDashboard) {
    router.push(href);
    return;
  }

  const root = document.documentElement;
  const sourceButtons = buttonsFor(direction, "source");
  const clones = Array.from(sourceButtons, ([sectionHref, source]) =>
    createBubbleClone(sectionHref, source),
  ).filter((clone): clone is BubbleClone => clone !== null);

  if (clones.length !== 6) {
    clones.forEach(({ shell }) => shell.remove());
    router.push(href);
    return;
  }

  root.classList.add(
    "dashboard-navigation-animating",
    "dashboard-route-swapping",
    direction === "dock" ? "dashboard-docking" : "dashboard-undocking",
  );
  if (direction === "dock") root.classList.add("dashboard-target-preview");

  await nextPaint(1);
  router.push(href);
  await waitForRoutePaint(href);
  if (direction === "undock") root.classList.add("dashboard-home-route");

  const targets = await waitForStableTargets(direction);
  if (targets.size !== 6) {
    cleanupTransition(root, clones);
    return;
  }

  const prepared = clones.flatMap((clone, index) => {
    const target = targets.get(clone.href);
    if (!target) return [];
    return [{ clone, destination: addDestination(clone, target), index }];
  });

  root.classList.add("dashboard-route-ready");
  await nextPaint(1);
  await Promise.all(prepared.map(({ clone, destination }) => switchToDestination(clone, destination)));
  await wait(35);

  const animations = prepared.map(({ clone, destination, index }) =>
    animateBubble(clone, destination, index),
  );

  await Promise.all(animations);
  root.classList.add("dashboard-transition-settled");
  await wait(80);
  cleanupTransition(root, clones);
}
