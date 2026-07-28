/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent, type UIEvent } from "react";
import { ContactCityArtwork } from "@/components/contact-city-artwork";
import { ContactPresenceProvider } from "@/components/contact-presence";
import { dashboardSections } from "@/components/dashboard-shell";
import { ScrollingPhotoBackground } from "@/components/scrolling-photo-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { cursorCss, navIconForPath, pageCursors } from "@/lib/page-cursors";
import { runRouteBubbleTransition } from "@/lib/route-bubble-transition";

const homeLinks = [
  { href: "/about", label: "CV" },
  { href: "/projects", label: "Projects" },
  { href: "/recipes", label: "Recipes" },
  { href: "/restaurants", label: "Restaurants" },
  { href: "/tools", label: "Tools" },
  { href: "/contact", label: "Contact" },
];

const mobileHomeLinks = [
  homeLinks[0],
  homeLinks[1],
  homeLinks[5],
  homeLinks[2],
  homeLinks[4],
  homeLinks[3],
];

const mobileInitialIndex = 2;
const showHomePhotoGrid = true;
const mobileBackgroundPages = ["about", "projects", "recipes", "tools", "restaurants"] as const;

const quickAccessGroups = [
  { label: "Personal", sections: [dashboardSections[3], dashboardSections[4], dashboardSections[2]] },
  { label: "Professional", sections: [dashboardSections[0], dashboardSections[1], dashboardSections[5]] },
] as const;

function positionMobileCarousel(scroller: HTMLElement) {
  const center = scroller.scrollTop + scroller.clientHeight / 2;
  const items = Array.from(scroller.querySelectorAll<HTMLElement>("[data-mobile-home-item]"));
  const itemStep = items.length > 1 ? Math.max(1, items[1].offsetTop - items[0].offsetTop) : 68;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  items.forEach((item, index) => {
    const distanceInPixels = Math.abs(item.offsetTop + item.offsetHeight / 2 - center);
    const distance = distanceInPixels / itemStep;
    const arcOffset = (Math.max(0, Math.cos(Math.min(distance, 3) * Math.PI / 6)) - 1) * 4.4;
    const scale = Math.max(0.86, 1 - distance * 0.06);
    const opacity = Math.max(0.7, 1 - distance * 0.1);
    const blur = Math.min(0.38, distance * 0.1);
    const link = item.querySelector<HTMLElement>(".home-mobile-link");

    link?.style.setProperty("--mobile-arc-x", `${arcOffset}rem`);
    link?.style.setProperty("--mobile-bubble-blur", `${blur}px`);
    link?.style.setProperty("--mobile-bubble-opacity", String(opacity));
    link?.style.setProperty("--mobile-bubble-scale", String(scale));

    if (distanceInPixels < closestDistance) {
      closestDistance = distanceInPixels;
      closestIndex = index;
    }
  });

  return closestIndex;
}

export function HomeLanding({ photos }: { photos: string[] }) {
  const router = useRouter();
  const isLeaving = useRef(false);
  const mobileNavRef = useRef<HTMLElement>(null);
  const mobileScrollFrame = useRef(0);
  const [entryMode, setEntryMode] = useState<"pending" | "center" | "mobile-return">("pending");
  const [mobileActiveIndex, setMobileActiveIndex] = useState(mobileInitialIndex);
  const [isDark, setIsDark] = useState(false);
  const linkCursors = useMemo(() => new Map(homeLinks.map((item) => {
    const match = pageCursors.find((entry) => entry.match(item.href));
    return [item.href, match ? cursorCss(match, isDark) : undefined];
  })), [isDark]);

  function prefetchRoute(href: string) {
    try {
      router.prefetch(href);
    } catch {
      // Prefetch is best-effort; normal navigation still handles failures.
    }
  }

  function updateMobileCarousel(event: UIEvent<HTMLElement>) {
    const scroller = event.currentTarget;
    window.cancelAnimationFrame(mobileScrollFrame.current);
    mobileScrollFrame.current = window.requestAnimationFrame(() => {
      const closestIndex = positionMobileCarousel(scroller);
      setMobileActiveIndex((current) => current === closestIndex ? current : closestIndex);
    });
  }

  useEffect(() => () => window.cancelAnimationFrame(mobileScrollFrame.current), []);

  useEffect(() => {
    const el = document.documentElement;
    const syncTheme = () => setIsDark(el.classList.contains("dark"));
    const observer = new MutationObserver(syncTheme);
    syncTheme();
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 639px)").matches) return;

    const preload = () => {
      const theme = isDark ? "dark" : "light";
      mobileBackgroundPages.forEach((page) => {
        const image = new window.Image();
        image.decoding = "async";
        image.src = `/mobile-page-backgrounds/${page}-${theme}.png?v=20260727`;
      });
    };

    if ("requestIdleCallback" in window) {
      const idle = window.requestIdleCallback(preload, { timeout: 1600 });
      return () => window.cancelIdleCallback(idle);
    }

    const timer = setTimeout(preload, 750);
    return () => clearTimeout(timer);
  }, [isDark]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const returnFromMenu = window.sessionStorage.getItem("home-entry") === "mobile-return"
        && window.matchMedia("(max-width: 639px)").matches;
      window.sessionStorage.removeItem("home-entry");
      setEntryMode(returnFromMenu ? "mobile-return" : "center");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (entryMode === "pending") return;

    const mobileQuery = window.matchMedia("(max-width: 639px)");
    let firstFrame = 0;
    let secondFrame = 0;
    let settleTimer = 0;

    const centerAbout = () => {
      if (!mobileQuery.matches) return;
      window.clearTimeout(settleTimer);

      const alignAbout = () => {
        const scroller = mobileNavRef.current;
        const about = scroller?.querySelectorAll<HTMLElement>("[data-mobile-home-item]")[mobileInitialIndex];
        if (!scroller || !about) return;

        scroller.scrollTop = about.offsetTop + about.offsetHeight / 2 - scroller.clientHeight / 2;
        setMobileActiveIndex(positionMobileCarousel(scroller));
      };

      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          alignAbout();
          settleTimer = window.setTimeout(alignAbout, 160);
        });
      });
    };

    centerAbout();
    mobileQuery.addEventListener("change", centerAbout);
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(settleTimer);
      mobileQuery.removeEventListener("change", centerAbout);
    };
  }, [entryMode]);

  useEffect(() => {
    if (entryMode !== "mobile-return") return;

    let firstFrame = 0;
    let secondFrame = 0;
    const animations: Animation[] = [];

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const bubbles = Array.from(document.querySelectorAll<HTMLElement>(".home-mobile-nav-list li"));

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          bubbles.forEach((element) => { element.style.opacity = "1"; });
          return;
        }

        const corner = { x: window.innerWidth - 18, y: 14 };
        bubbles.forEach((element, index) => {
          const box = element.getBoundingClientRect();
          const moveX = corner.x - (box.left + box.width / 2);
          const moveY = corner.y - (box.top + box.height / 2);

          animations.push(element.animate(
            [
              {
                opacity: 0,
                transform: `translate3d(${moveX}px, ${moveY}px, 0) scale(0.18) rotate(-12deg)`,
              },
              {
                offset: 0.68,
                opacity: 1,
                transform: "translate3d(-10px, 5px, 0) scale(1.035) rotate(1.5deg)",
              },
              { opacity: 1, transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
            ],
            {
              duration: 660,
              delay: 70 + index * 58,
              easing: "cubic-bezier(.16, 1, .3, 1)",
              fill: "both",
            },
          ));
        });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      animations.forEach((animation) => animation.cancel());
    };
  }, [entryMode]);

  async function leaveHome(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    if (isLeaving.current) return;
    isLeaving.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }

    const selectedLink = event.currentTarget;
    const links = Array.from(document.querySelectorAll<HTMLElement>(".home-mobile-link"))
      .filter((link) => link.offsetParent !== null);
    const photoGrid = document.querySelector<HTMLElement>(".home-photo-grid");
    const themeToggle = document.querySelector<HTMLElement>(".theme-toggle");

    await runRouteBubbleTransition({
      href,
      router,
      source: selectedLink,
      fadeOut: [
        ...links.filter((link) => link !== selectedLink),
        photoGrid,
        themeToggle,
      ],
    });
  }

  return (
    <section id="top" className={`home-landing home-entry-${entryMode} home-mobile-focus-${mobileHomeLinks[mobileActiveIndex]?.href.slice(1) ?? "contact"}`}>
      {showHomePhotoGrid && <ScrollingPhotoBackground photos={photos} />}

      <div className="home-mobile-stage">
        <nav className="home-mobile-nav" aria-label="Explore the website" onScroll={updateMobileCarousel} ref={mobileNavRef}>
          <h1 className="sr-only">Curtis Lee</h1>
          <ol className="home-mobile-nav-list">
            {mobileHomeLinks.map((item, index) => {
              const icon = navIconForPath(item.href);

              return (
                <li data-mobile-home-item key={item.href}>
                  <Link
                    className="home-mobile-link"
                    data-active={index === mobileActiveIndex ? "true" : "false"}
                    href={item.href}
                    onClick={(event) => leaveHome(event, item.href)}
                    onFocus={(event) => {
                      setMobileActiveIndex(index);
                      event.currentTarget.parentElement?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    onPointerEnter={() => prefetchRoute(item.href)}
                    style={{ cursor: linkCursors.get(item.href) }}
                  >
                    {icon && <img alt="" aria-hidden="true" className="home-mobile-link-icon" src={icon} />}
                    <span className="home-mobile-link-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="home-dashboard-panel">
        <div className="home-dashboard-heading">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Quick access</h1>
          </div>
          <div className="home-dashboard-pixel-art">
            <ContactPresenceProvider readOnly>
              <ContactCityArtwork className="home-dashboard-pixel-artwork" />
            </ContactPresenceProvider>
          </div>
        </div>
        <nav aria-label="Dashboard quick access" className="home-dashboard-groups">
          {quickAccessGroups.map((group) => (
            <div className="home-dashboard-group" key={group.label}>
              <h2>{group.label}</h2>
              <div className="home-dashboard-grid">
                {group.sections.map((section) => {
                  const icon = navIconForPath(section.href);
                  return (
                    <Link data-spotlight href={section.href} key={section.href}>
                      <span className="home-dashboard-icon">{icon && <img alt="" aria-hidden="true" src={icon} />}</span>
                      <span><strong>{section.label}</strong><small>{section.subtitle}</small></span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <ThemeToggle />
    </section>
  );
}
