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

function waitForRoutePaint(href: string, aborted: () => boolean) {
  const destination = new URL(href, window.location.href);
  const startedAt = performance.now();

  return new Promise<boolean>((resolve) => {
    const tick = () => {
      if (aborted()) { resolve(false); return; }
      const routeMatches = window.location.pathname === destination.pathname
        && window.location.search === destination.search;
      const homeMounted = Boolean(document.querySelector(".home-landing"));
      const contentReady = homeMounted === (destination.pathname === "/")
        && !document.querySelector(".site-app-shell main .section-loading");

      if ((routeMatches && contentReady) || performance.now() - startedAt > 5000) {
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

type Point = { x: number; y: number };

// Equal-size paths let GSAP interpolate a rounded panel into a stretched drop
// without a filter, canvas texture, or an extra animation dependency.
function liquidPath(center: Point, width: number, height: number, power = 2, angle = 0, taper = 0) {
  const points = Array.from({ length: 32 }, (_, index) => {
    const theta = index / 32 * Math.PI * 2;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const x = Math.sign(cos) * Math.abs(cos) ** (2 / power) * width / 2;
    const y = Math.sign(sin) * Math.abs(sin) ** (2 / power) * height / 2 * (1 - taper * (1 - cos) / 2);
    return { x: center.x + x * Math.cos(angle) - y * Math.sin(angle), y: center.y + x * Math.sin(angle) + y * Math.cos(angle) };
  });
  const at = (i: number) => points[(i + points.length) % points.length];
  return `M${at(0).x},${at(0).y} ` + points.map((point, i) => {
    const previous = at(i - 1);
    const next = at(i + 1);
    const after = at(i + 2);
    return `C${point.x + (next.x - previous.x) / 6},${point.y + (next.y - previous.y) / 6} ${next.x - (after.x - point.x) / 6},${next.y - (after.y - point.y) / 6} ${next.x},${next.y}`;
  }).join(" ") + " Z";
}

function panelSnapshot(source: HTMLElement, overlay: HTMLElement) {
  const rect = source.getBoundingClientRect();
  const copy = source.cloneNode(true) as HTMLElement;
  removeInteractionAttributes(copy);
  copy.classList.add("navigation-panel-snapshot");
  copy.setAttribute("aria-hidden", "true");
  copy.inert = true;
  Object.assign(copy.style, {
    position: "fixed", inset: "auto", left: `${rect.left}px`, top: `${rect.top}px`,
    width: `${rect.width}px`, height: `${rect.height}px`, margin: "0", maxWidth: "none",
    visibility: "visible", opacity: "1", transform: "none", scale: "none", translate: "none",
    animation: "none", transition: "none", backdropFilter: "none", webkitBackdropFilter: "none",
    pointerEvents: "none", transformOrigin: "50% 50%",
  });
  overlay.append(copy);
  return { copy, rect };
}

export async function runDashboardBubbleTransition({ direction, href, router }: DashboardBubbleTransitionOptions) {
  if (navigationInProgress) return;
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
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const animation: { timeline: gsap.core.Timeline | null } = { timeline: null };
  let resolveMotion: (() => void) | undefined;
  let cancelled = false;
  let skipMotion = false;
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

  // The silhouette carries the elastic deformation; the single content layer
  // follows it and fades before the neck becomes too narrow to read.
  const absorb = async (surface: HTMLElement, destination: Point) => {
    const { copy, rect } = panelSnapshot(surface, overlay);
    Object.assign(copy.style, { background: "transparent", borderColor: "transparent", boxShadow: "none" });
    remember(surface).style.visibility = "hidden";
    const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const dx = destination.x - origin.x;
    const dy = destination.y - origin.y;
    const distance = Math.hypot(dx, dy);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
    svg.classList.add("navigation-liquid-surface");
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", liquidPath(origin, rect.width, rect.height, 16));
    svg.append(path);
    overlay.prepend(svg);
    const pull = { x: origin.x + dx * 0.55, y: origin.y + dy * 0.55 };
    const angle = Math.atan2(dy, dx);
    await play((tl) => {
      tl.to(path, { attr: { d: liquidPath(pull, Math.max(80, distance * 0.9), Math.min(rect.height * 0.32, 150), 2, angle, 0.82) }, duration: 0.42, ease: "power2.inOut" }, 0);
      tl.to(path, { attr: { d: liquidPath(destination, 16, 16) }, duration: 0.23, ease: "power3.in" }, 0.4);
      tl.to(svg, { opacity: 0, duration: 0.1 }, 0.57);
      tl.to(copy, { x: dx * 0.55, y: dy * 0.55, scaleX: Math.max(80, distance * 0.9) / rect.width, scaleY: Math.min(rect.height * 0.32, 150) / rect.height, rotation: angle * 180 / Math.PI, duration: 0.42, ease: "power2.inOut" }, 0);
      tl.to(copy, { opacity: 0, duration: 0.2 }, 0.1);
      tl.to(root, { "--navigation-page-opacity": 0, duration: 0.3, ease: "power1.inOut" }, 0.12);
    });
    copy.remove();
    svg.remove();
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
          if (opened.length) tl.to(opened, { height: 0, opacity: 0, duration: 0.28, ease: "power2.inOut" }, depth * 0.07);
        }));
        if (cancelled) return;
        window.dispatchEvent(new Event(DASHBOARD_FOLD_EVENT));
        await nextPaint();
      }
      if (cancelled) return;
      setPhase("absorb");
      const menuButton = compact ? document.querySelector<HTMLElement>(".site-menu-button") : null;
      if (menuButton) remember(menuButton).style.visibility = "hidden";
      await absorb(source, center);
      if (cancelled) return;
      setPhase("route");
      router.push(href);
      if (!await waitForRoutePaint(href, () => cancelled) || cancelled) return;
      const started = performance.now();
      while (!document.querySelector(".home-entry-settled") && performance.now() - started < 1500 && !cancelled) await nextPaint();
      if (cancelled) return;
      const destination = document.querySelector<HTMLElement>(".home-dashboard-panel");
      if (destination) {
        remember(destination);
        gsap.set(destination, { opacity: 0, scale: 0.72, y: 18, transformOrigin: "50% 50%", animation: "none" });
      }
      setPhase("home-reveal");
      await play((tl) => {
        tl.to(root, { "--navigation-page-opacity": 1, duration: 0.3 }, 0);
        if (destination) tl.to(destination, { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: "back.out(1.15)" }, 0);
      });
    } else if (compact) {
      setPhase("corner-absorb");
      // Measure the same corner anchor used by SiteHeader, including safe areas.
      const anchor = document.createElement("div");
      anchor.className = "site-menu-shell navigation-corner-anchor";
      const button = document.createElement("div");
      button.className = "site-menu-button";
      anchor.append(button);
      overlay.append(anchor);
      const box = button.getBoundingClientRect();
      anchor.remove();
      await absorb(source, { x: box.left + box.width / 2, y: box.top + box.height / 2 });
      if (cancelled) return;
      setPhase("route");
      router.push(href);
      if (!await waitForRoutePaint(href, () => cancelled) || cancelled) return;
      const destination = document.querySelector<HTMLElement>(".site-menu-button");
      if (destination) { remember(destination); gsap.set(destination, { scale: 0.35, opacity: 0 }); }
      setPhase("menu-reveal");
      await play((tl) => {
        tl.to(root, { "--navigation-page-opacity": 1, duration: 0.28 }, 0);
        if (destination) tl.to(destination, { scale: 1, opacity: 1, duration: 0.6, ease: "elastic.out(1, 0.65)" }, 0);
      });
    } else {
      setPhase("lift");
      window.dispatchEvent(new Event(DASHBOARD_FOLD_EVENT));
      const sources = homeButtons();
      const clones = Array.from(sources, ([key, element]) => createBubbleClone(key, element))
        .filter((clone): clone is BubbleClone => clone !== null);
      overlay.append(...clones.map(({ shell }) => shell));
      sources.forEach((element) => { remember(element).style.visibility = "hidden"; });
      await play((tl) => {
        tl.to(root, { "--navigation-page-opacity": 0, duration: 0.24 }, 0);
        tl.to(clones.map(({ shell }) => shell), { y: -10, scale: 0.97, duration: 0.24, ease: "power2.out" }, 0);
      });
      if (cancelled) return;
      setPhase("route");
      router.push(href);
      if (!await waitForRoutePaint(href, () => cancelled) || cancelled || !sidebar) return;
      await nextPaint();
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
      gsap.set(sidebar, { x: window.innerWidth - sidebarRect.left + 24, scaleX: 0.82, visibility: "visible", transformOrigin: "100% 50%" });
      setPhase("taskbar-emerge");
      await play((tl) => {
        tl.to(sidebar, { x: 0, scaleX: 1, duration: 0.85, ease: "back.out(0.7)" }, 0);
        tl.to(root, { "--navigation-page-opacity": 1, duration: 0.35 }, 1.3);
        clones.forEach(({ href: key, shell, sourceLayer, sourceSurface, start }, index) => {
          const target = targets.get(key);
          const end = targetRects.get(key);
          if (!target || !end || !end.width) { tl.to(shell, { opacity: 0, duration: 0.2 }, 0); return; }
          const targetLayer = createContentLayer(target, "target");
          const targetSurface = createSurface(target, "target");
          Object.assign(targetLayer.style, { width: `${end.width}px`, height: `${end.height}px`, transform: `scale(${start.width / end.width}, ${start.height / end.height})`, opacity: "0" });
          targetSurface.style.opacity = "0";
          shell.append(targetSurface, targetLayer);
          const progress = { value: 0 };
          const control = { x: (start.left + end.left) / 2 + 45, y: Math.min(start.top, end.top) - 65 - index * 8 };
          const at = 0.42 + index * 0.07;
          tl.to(progress, {
            value: 1, duration: 0.76, ease: "power2.inOut",
            onUpdate: () => {
              const p = progress.value;
              const q = 1 - p;
              gsap.set(shell, {
                x: q * q * start.left + 2 * q * p * control.x + p * p * end.left - start.left,
                y: q * q * (start.top - 10) + 2 * q * p * control.y + p * p * end.top - start.top,
                scaleX: 0.97 + (end.width / start.width - 0.97) * p,
                scaleY: 0.97 + (end.height / start.height - 0.97) * p,
                rotation: Math.sin(p * Math.PI) * (index % 2 ? 3 : -3),
              });
            },
            onComplete: () => {
              const item = target.closest<HTMLElement>(".dashboard-sidebar-item");
              if (item) item.style.visibility = "visible";
              shell.style.visibility = "hidden";
            },
          }, at);
          tl.to([sourceLayer, sourceSurface], { opacity: 0, duration: 0.22 }, at + 0.19);
          tl.to([targetLayer, targetSurface], { opacity: 1, duration: 0.22 }, at + 0.4);
        });
        const finishing = hiddenParts.filter((element) => !element.classList.contains("dashboard-sidebar-item"));
        finishing.forEach((element) => {
          const profile = element.classList.contains("dashboard-sidebar-profile");
          tl.fromTo(element, { y: profile ? -75 : 0, opacity: 0 }, { visibility: "visible", y: 0, opacity: 1, duration: profile ? 0.6 : 0.25, ease: profile ? "bounce.out" : "power1.out" }, profile ? 1.55 : 1.42);
        });
      });
    }
    if (!cancelled) ScrollTrigger.refresh();
  } finally {
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
}
