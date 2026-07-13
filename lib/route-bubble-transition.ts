type RouterLike = {
  push: (href: string) => void;
  prefetch?: (href: string) => void;
};

type RouteBubbleTransitionOptions = {
  href: string;
  router: RouterLike;
  source: HTMLElement;
  mode?: "expand" | "contract";
  variant?: "bubble" | "menu";
  beforeNavigate?: () => void;
  fadeOut?: Array<HTMLElement | null | undefined>;
};

function transparentOrTooFaint(color: string) {
  if (!color || color === "transparent") return true;
  const rgba = color.match(/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)$/i);
  return rgba ? Number(rgba[1]) < 0.16 : false;
}

function themedPageBackground() {
  const rootStyle = window.getComputedStyle(document.documentElement);
  const paper = rootStyle.getPropertyValue("--color-paper").trim();
  if (paper) return `rgb(${paper})`;

  const bodyBackground = window.getComputedStyle(document.body).backgroundColor;
  if (!transparentOrTooFaint(bodyBackground)) return bodyBackground;

  return document.documentElement.classList.contains("dark") ? "rgb(27, 29, 24)" : "rgb(250, 249, 246)";
}

function prefetchRoute(router: RouterLike, href: string) {
  try {
    router.prefetch?.(href);
  } catch {
    // Prefetch is opportunistic; the click navigation still works if it fails.
  }
}

function waitForRoutePaint(href: string) {
  const target = new URL(href, window.location.href);
  const startedAt = performance.now();
  const matchesTarget = () =>
    window.location.pathname === target.pathname && window.location.search === target.search;

  return new Promise<void>((resolve) => {
    const finishAfterPaint = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    };

    const tick = () => {
      if (matchesTarget() || performance.now() - startedAt > 1100) {
        finishAfterPaint();
        return;
      }

      window.requestAnimationFrame(tick);
    };

    tick();
  });
}

function uniqueElements(elements: Array<HTMLElement | null | undefined>, source?: HTMLElement) {
  return Array.from(new Set(elements.filter((element): element is HTMLElement =>
    Boolean(element) && element !== source,
  )));
}

function animateNextPageReveal(centerX: number, centerY: number, startRadius: number) {
  const main = document.querySelector<HTMLElement>("main");
  if (!main) return Promise.resolve();

  const finalRadius = Math.hypot(
    Math.max(centerX, window.innerWidth - centerX),
    Math.max(centerY, window.innerHeight - centerY),
  ) * 1.08;
  const previousClipPath = main.style.clipPath;
  const previousOpacity = main.style.opacity;
  const previousTransform = main.style.transform;
  const previousWillChange = main.style.willChange;

  main.style.clipPath = `circle(${startRadius}px at ${centerX}px ${centerY}px)`;
  main.style.opacity = "0.96";
  main.style.transform = "scale(0.992)";
  main.style.willChange = "clip-path, opacity, transform";

  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      const revealAnimation = main.animate(
        [
          {
            clipPath: `circle(${startRadius}px at ${centerX}px ${centerY}px)`,
            opacity: 0.96,
            transform: "scale(0.992)",
          },
          {
            offset: 0.18,
            clipPath: `circle(${Math.max(startRadius * 1.35, startRadius + 34)}px at ${centerX}px ${centerY}px)`,
            opacity: 1,
            transform: "scale(0.996)",
          },
          {
            clipPath: `circle(${finalRadius}px at ${centerX}px ${centerY}px)`,
            opacity: 1,
            transform: "scale(1)",
          },
        ],
        {
          duration: 520,
          easing: "cubic-bezier(.18, .86, .22, 1)",
          fill: "forwards",
        },
      );

      void revealAnimation.finished.finally(() => {
        revealAnimation.cancel();
        if (main.isConnected) {
          main.style.clipPath = previousClipPath;
          main.style.opacity = previousOpacity;
          main.style.transform = previousTransform;
          main.style.willChange = previousWillChange;
        }
        resolve();
      });
    });
  });
}

async function runMenuRouteTransition({
  href,
  router,
  beforeNavigate,
  fadeOut,
}: Pick<RouteBubbleTransitionOptions, "href" | "router" | "beforeNavigate" | "fadeOut">) {
  const transitionBackground = themedPageBackground();
  const overlay = document.createElement("span");
  const fadeTargets = uniqueElements(fadeOut ?? []);

  overlay.className = "route-menu-transition-layer";
  overlay.style.backgroundColor = transitionBackground;
  document.body.append(overlay);

  const fadeAnimations = fadeTargets.map((element, index) =>
    element.animate(
      [
        { opacity: window.getComputedStyle(element).opacity, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(-0.28rem) scale(0.985)" },
      ],
      {
        duration: 240,
        delay: Math.min(index * 20, 70),
        easing: "cubic-bezier(.22, 1, .36, 1)",
        fill: "forwards",
      },
    ),
  );

  const overlayIn = overlay.animate(
    [
      { opacity: 0 },
      { offset: 0.18, opacity: 0 },
      { offset: 0.78, opacity: 0.98 },
      { opacity: 1 },
    ],
    {
      duration: 360,
      easing: "cubic-bezier(.3, 0, .18, 1)",
      fill: "forwards",
    },
  );

  const navigationReady = new Promise<void>((resolve) => {
    window.setTimeout(() => {
      beforeNavigate?.();
      router.push(href);
      void waitForRoutePaint(href).then(resolve);
    }, 120);
  });

  await Promise.all([
    overlayIn.finished.catch(() => undefined),
    navigationReady,
  ]);

  const main = document.querySelector<HTMLElement>("main");
  const pageReveal = main?.animate(
    [
      { opacity: 0.94, transform: "translateY(0.45rem) scale(0.996)", filter: "blur(1px)" },
      { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0)" },
    ],
    {
      duration: 520,
      easing: "cubic-bezier(.18, .86, .22, 1)",
      fill: "forwards",
    },
  );

  const currentOverlayOpacity = Number(window.getComputedStyle(overlay).opacity);
  const overlayOut = overlay.animate(
    [
      { opacity: Number.isFinite(currentOverlayOpacity) ? currentOverlayOpacity : 1 },
      { opacity: 0 },
    ],
    {
      duration: 460,
      easing: "cubic-bezier(.22, 1, .36, 1)",
      fill: "forwards",
    },
  );

  await Promise.all([
    overlayOut.finished.catch(() => undefined),
    pageReveal?.finished.catch(() => undefined) ?? Promise.resolve(),
    ...fadeAnimations.map((animation) => animation.finished.catch(() => undefined)),
  ]);

  overlay.remove();
  overlayIn.cancel();
  overlayOut.cancel();
  pageReveal?.cancel();
  fadeAnimations.forEach((animation) => animation.cancel());
}

export async function runRouteBubbleTransition({
  href,
  router,
  source,
  mode = "expand",
  variant = "bubble",
  beforeNavigate,
  fadeOut = [],
}: RouteBubbleTransitionOptions) {
  prefetchRoute(router, href);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    beforeNavigate?.();
    router.push(href);
    return;
  }

  if (variant === "menu" && mode === "expand") {
    await runMenuRouteTransition({ href, router, beforeNavigate, fadeOut });
    return;
  }

  const box = source.getBoundingClientRect();
  if (!box.width || !box.height) {
    beforeNavigate?.();
    router.push(href);
    return;
  }

  const style = window.getComputedStyle(source);
  const centerX = box.left + box.width / 2;
  const centerY = box.top + box.height / 2;
  const moveX = window.innerWidth / 2 - centerX;
  const moveY = window.innerHeight / 2 - centerY;
  const startRadius = Math.max(box.width, box.height) * 0.54;
  const farthestCorner = Math.hypot(
    Math.max(centerX, window.innerWidth - centerX),
    Math.max(centerY, window.innerHeight - centerY),
  );
  const coverScale = (farthestCorner * 2.44) / Math.max(1, Math.min(box.width, box.height));
  const uniqueFadeTargets = uniqueElements(fadeOut, source);

  const cancelFadeAnimations = (animations: Animation[]) => {
    animations.forEach((animation) => animation.cancel());
  };

  if (mode === "contract") {
    const main = document.querySelector<HTMLElement>("main");
    if (!main) {
      beforeNavigate?.();
      router.push(href);
      return;
    }

    const mainBox = main.getBoundingClientRect();
    const localX = centerX - mainBox.left;
    const localY = centerY - mainBox.top;
    const mainRadius = Math.hypot(
      Math.max(localX, mainBox.width - localX),
      Math.max(localY, mainBox.height - localY),
    );
    const endRadius = Math.max(box.width, box.height) * 0.36;
    const previousMainClipPath = main.style.clipPath;
    const previousMainWillChange = main.style.willChange;
    const previousMainPointerEvents = main.style.pointerEvents;

    main.style.willChange = "clip-path, opacity, transform";
    main.style.pointerEvents = "none";

    const fadeAnimations = uniqueFadeTargets.map((element, index) =>
      element.animate(
        [
          { opacity: window.getComputedStyle(element).opacity, transform: "scale(1)" },
          { opacity: 0, transform: "scale(0.97)" },
        ],
        {
          duration: 210,
          delay: Math.min(index * 20, 80),
          easing: "ease-out",
          fill: "forwards",
        },
      ),
    );

    const contractAnimation = main.animate(
      [
        {
          clipPath: `circle(${mainRadius}px at ${localX}px ${localY}px)`,
          opacity: 1,
          transform: "scale(1)",
        },
        {
          offset: 0.68,
          clipPath: `circle(${Math.max(endRadius * 2.2, 42)}px at ${localX}px ${localY}px)`,
          opacity: 0.88,
          transform: "scale(0.992)",
        },
        {
          clipPath: `circle(0px at ${localX}px ${localY}px)`,
          opacity: 0,
          transform: "scale(0.982)",
        },
      ],
      {
        duration: 560,
        easing: "cubic-bezier(.45, 0, .2, 1)",
        fill: "forwards",
      },
    );

    await Promise.all([
      contractAnimation.finished.catch(() => undefined),
      ...fadeAnimations.map((animation) => animation.finished.catch(() => undefined)),
    ]);

    beforeNavigate?.();
    router.push(href);

    const restoreMain = () => {
      contractAnimation.cancel();
      cancelFadeAnimations(fadeAnimations);
      if (!main.isConnected) return;
      main.style.clipPath = previousMainClipPath;
      main.style.willChange = previousMainWillChange;
      main.style.pointerEvents = previousMainPointerEvents;
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(restoreMain);
    });
    window.setTimeout(restoreMain, 180);
    return;
  }

  const transitionBackground = themedPageBackground();
  const floor = document.createElement("span");
  const expander = document.createElement("span");

  floor.className = "route-bubble-floor";
  floor.style.backgroundColor = transitionBackground;
  document.body.append(floor);

  expander.className = "route-bubble-expander";
  expander.style.left = `${box.left}px`;
  expander.style.top = `${box.top}px`;
  expander.style.width = `${box.width}px`;
  expander.style.height = `${box.height}px`;
  expander.style.borderRadius = style.borderRadius;
  expander.style.backgroundColor = transitionBackground;
  expander.style.borderColor = transitionBackground;
  expander.style.boxShadow = style.boxShadow;
  document.body.append(expander);

  const previousPointerEvents = source.style.pointerEvents;
  source.style.pointerEvents = "none";
  const sourceContent = Array.from(source.children).filter((element): element is HTMLElement =>
    element instanceof HTMLElement,
  );
  const contentAnimations = sourceContent.map((element) =>
    element.animate(
      [
        { opacity: window.getComputedStyle(element).opacity, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(-0.08rem) scale(0.96)" },
      ],
      {
        duration: 110,
        delay: 20,
        easing: "ease-out",
        fill: "forwards",
      },
    ),
  );

  const fadeAnimations = uniqueFadeTargets.map((element, index) =>
    element.animate(
      [
        { opacity: window.getComputedStyle(element).opacity, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.975)" },
      ],
      {
        duration: 240,
        delay: 35 + Math.min(index * 14, 70),
        easing: "ease-out",
        fill: "forwards",
      },
    ),
  );

  const finalExpanderTransform = `translate3d(${moveX}px, ${moveY}px, 0) scale(${coverScale * 1.08})`;
  const floorAnimation = floor.animate(
    [
      { opacity: 0 },
      { offset: 0.42, opacity: 0 },
      { offset: 0.82, opacity: 0.78 },
      { opacity: 1 },
    ],
    {
      duration: 760,
      easing: "cubic-bezier(.3, 0, .18, 1)",
      fill: "forwards",
    },
  );
  const expanderAnimation = expander.animate(
    [
      {
        opacity: 0.01,
        transform: "translate3d(0, 0, 0) scale(0.985)",
        borderRadius: style.borderRadius,
      },
      {
        offset: 0.09,
        opacity: 1,
        transform: "translate3d(0, 0, 0) scale(1)",
        borderRadius: style.borderRadius,
      },
      {
        offset: 0.24,
        opacity: 1,
        transform: `translate3d(${moveX * 0.06}px, ${moveY * 0.06}px, 0) scale(1.16)`,
        borderRadius: style.borderRadius,
      },
      {
        offset: 0.56,
        opacity: 1,
        transform: `translate3d(${moveX * 0.44}px, ${moveY * 0.44}px, 0) scale(${Math.max(2.1, coverScale * 0.24)})`,
        borderRadius: style.borderRadius,
      },
      {
        offset: 0.84,
        opacity: 1,
        transform: `translate3d(${moveX * 0.92}px, ${moveY * 0.92}px, 0) scale(${coverScale * 0.94})`,
        borderRadius: style.borderRadius,
      },
      {
        opacity: 1,
        transform: finalExpanderTransform,
        borderRadius: style.borderRadius,
      },
    ],
    {
      duration: 920,
      easing: "cubic-bezier(.18, .8, .18, 1)",
      fill: "forwards",
    },
  );

  const navigationReady = new Promise<void>((resolve) => {
    window.setTimeout(() => {
      beforeNavigate?.();
      router.push(href);
      void waitForRoutePaint(href).then(resolve);
    }, 260);
  });

  await Promise.all([
    expanderAnimation.finished.catch(() => undefined),
    navigationReady,
  ]);

  expander.style.opacity = "1";
  expander.style.transform = finalExpanderTransform;
  expander.style.borderRadius = style.borderRadius;
  expanderAnimation.cancel();

  const revealAnimation = animateNextPageReveal(centerX, centerY, startRadius);
  const currentFloorOpacity = Number(window.getComputedStyle(floor).opacity);
  const floorFade = floor.animate(
    [
      { opacity: Number.isFinite(currentFloorOpacity) ? currentFloorOpacity : 1 },
      { opacity: 0 },
    ],
    {
      duration: 320,
      easing: "cubic-bezier(.3, 0, .18, 1)",
      fill: "forwards",
    },
  );
  const expanderFade = expander.animate(
    [
      { opacity: 1, transform: finalExpanderTransform },
      { offset: 0.42, opacity: 0.92, transform: finalExpanderTransform },
      { opacity: 0, transform: finalExpanderTransform },
    ],
    {
      duration: 420,
      easing: "cubic-bezier(.3, 0, .18, 1)",
      fill: "forwards",
    },
  );

  await Promise.all([
    revealAnimation,
    floorFade.finished.catch(() => undefined),
    expanderFade.finished.catch(() => undefined),
    ...fadeAnimations.map((animation) => animation.finished.catch(() => undefined)),
    ...contentAnimations.map((animation) => animation.finished.catch(() => undefined)),
  ]);

  floor.remove();
  expander.remove();
  floorAnimation.cancel();
  floorFade.cancel();
  expanderFade.cancel();
  cancelFadeAnimations(fadeAnimations);
  cancelFadeAnimations(contentAnimations);
  if (source.isConnected) source.style.pointerEvents = previousPointerEvents;
}
