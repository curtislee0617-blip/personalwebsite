"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

const orbitLinks = [
  { href: "/about", label: "About", detail: "The person" },
  { href: "/projects", label: "Projects", detail: "The work" },
  { href: "/recipes", label: "Recipes", detail: "The kitchen" },
  { href: "/restaurants", label: "Restaurants", detail: "The table" },
  { href: "/tools", label: "Tools", detail: "The kit" },
  { href: "/contact", label: "Contact", detail: "Say hello" },
];

const placeholderColors = [
  ["#d8e4dc", "#94aa9c"], ["#ead8cb", "#c58f74"], ["#dce4ed", "#8fa7bd"],
  ["#e7dfbd", "#b7a86f"], ["#ded7e9", "#9f91b2"], ["#d7e5e8", "#7fa1a7"],
] as const;

const logoPhotos = ["/logos/caltech.webp", "/logos/uc-davis.webp"];

type LogoPlacement = { position: number; logoIndex: number };

function mixNumber(value: number) {
  let mixed = value + 0x6d2b79f5;
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
  return (mixed ^ (mixed >>> 14)) >>> 0;
}

function blockDistance(first: number, second: number, rows: number) {
  const firstRow = first % rows;
  const secondRow = second % rows;
  const firstColumn = Math.floor(first / rows);
  const secondColumn = Math.floor(second / rows);
  return Math.max(Math.abs(firstRow - secondRow), Math.abs(firstColumn - secondColumn));
}

function createLogoPlacements(itemCount: number) {
  const candidates = Array.from({ length: itemCount }, (_, index) => index).sort(
    (first, second) => mixNumber(first) - mixNumber(second),
  );
  const placements: LogoPlacement[] = [];
  const originalTargetCount = Math.ceil(itemCount / 13);
  const previouslyReducedCount = Math.ceil(originalTargetCount * (2 / 3));
  const targetCount = Math.ceil(previouslyReducedCount * (2 / 3));

  for (const position of candidates) {
    const preferredLogo = mixNumber(position + 97) % logoPhotos.length;
    const logoOptions = [preferredLogo, (preferredLogo + 1) % logoPhotos.length];

    for (const logoIndex of logoOptions) {
      const allowed = placements.every((existing) =>
        [10, 5].every((rows) => {
          const minimumDistance = existing.logoIndex === logoIndex ? 3 : 2;
          return blockDistance(position, existing.position, rows) > minimumDistance;
        }),
      );

      if (allowed) {
        placements.push({ position, logoIndex });
        break;
      }
    }

    if (placements.length >= targetCount) break;
  }

  const caltechPlacements = placements
    .filter((placement) => placement.logoIndex === 0)
    .sort((first, second) => mixNumber(first.position + 211) - mixNumber(second.position + 211));
  const retainedCaltechPositions = new Set(
    caltechPlacements.slice(0, Math.ceil(caltechPlacements.length * (2 / 3))).map((placement) => placement.position),
  );

  return placements.filter((placement) => placement.logoIndex !== 0 || retainedCaltechPositions.has(placement.position));
}

function PhotoGridBackground({ photos }: { photos: string[] }) {
  const itemCount = Math.max(300, photos.length);
  const items = Array.from({ length: itemCount }, (_, index) => ({
    photo: photos.length ? photos[index % photos.length] : null,
    isLogo: false,
  }));

  for (const { position, logoIndex } of createLogoPlacements(itemCount)) {
    items[position] = {
      photo: logoPhotos[logoIndex],
      isLogo: true,
    };
  }

  return (
    <div className="home-photo-grid" aria-hidden="true">
      <div className="photo-grid-rail">
        {[0, 1].map((copy) => (
          <div className="photo-grid-track" key={copy}>
            {items.map(({ photo, isLogo }, index) => {
              const shuffledIndex = (index * 47) % itemCount;
              const colors = placeholderColors[shuffledIndex % placeholderColors.length];
              const style = photo
                ? { backgroundImage: `url("${photo}")` }
                : { backgroundImage: `linear-gradient(145deg, ${colors[0]}, ${colors[1]})` };

              return (
                <span
                  className={`photo-grid-tile ${isLogo ? "is-logo" : ""} ${photo === logoPhotos[0] ? "is-caltech-logo" : ""}`}
                  key={`${copy}-${index}`}
                  style={style}
                >
                  {!photo && String(shuffledIndex + 1).padStart(3, "0")}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeOrbit({ photos, profilePhoto }: { photos: string[]; profilePhoto: string | null }) {
  const router = useRouter();
  const isLeaving = useRef(false);
  const [entryMode, setEntryMode] = useState<"pending" | "center" | "menu">("pending");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const cameFromMenu = window.sessionStorage.getItem("home-entry") === "menu";
      window.sessionStorage.removeItem("home-entry");
      setEntryMode(cameFromMenu ? "menu" : "center");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (entryMode !== "menu") return;

    const frame = window.requestAnimationFrame(() => {
      const source = { x: 44, y: 44 };
      const bubbles = document.querySelectorAll<HTMLElement>(".orbit-link");
      const menuGlyph = document.querySelector<HTMLElement>(".home-menu-glyph");

      // Read every position before starting any animation to avoid repeated layout work.
      const bubbleGeometry = Array.from(bubbles).map((bubble) => {
        const box = bubble.getBoundingClientRect();
        return {
          bubble,
          moveX: source.x - (box.left + box.width / 2),
          moveY: source.y - (box.top + box.height / 2),
        };
      });

      bubbleGeometry.forEach(({ bubble, moveX, moveY }, index) => {
        bubble.animate(
          [
            { translate: `${moveX}px ${moveY}px`, scale: "0", rotate: "-180deg", opacity: 0 },
            { offset: 0.2, opacity: 0.75 },
            { offset: 0.78, scale: "1.08", opacity: 1 },
            { translate: "0 0", scale: "1", rotate: "0deg", opacity: 1 },
          ],
          {
            duration: 880,
            delay: 120 + index * 42,
            easing: "cubic-bezier(.16, 1, .3, 1)",
            fill: "forwards",
          },
        );
      });

      menuGlyph?.animate(
        [
          { opacity: 1, scale: "1", rotate: "0deg" },
          { offset: 0.55, opacity: 1, scale: "0.9", rotate: "-5deg" },
          { opacity: 0, scale: "0.15", rotate: "25deg" },
        ],
        { duration: 440, delay: 80, easing: "cubic-bezier(.7, 0, .3, 1)", fill: "forwards" },
      );
    });

    return () => window.cancelAnimationFrame(frame);
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

    const target = { x: 44, y: 44 };
    const bubbles = document.querySelectorAll<HTMLElement>(".orbit-link");
    const profile = document.querySelector<HTMLElement>(".home-profile");
    const menuGlyph = document.querySelector<HTMLElement>(".home-menu-glyph");

    // Batch layout reads before animation writes so the browser calculates layout once.
    const bubbleGeometry = Array.from(bubbles).map((bubble) => {
      const box = bubble.getBoundingClientRect();
      return {
        bubble,
        moveX: target.x - (box.left + box.width / 2),
        moveY: target.y - (box.top + box.height / 2),
      };
    });

    const bubbleAnimations = bubbleGeometry.map(({ bubble, moveX, moveY }, index) => {
      return bubble.animate(
        [
          { translate: "0 0", scale: "1", opacity: 1 },
          { offset: 0.72, translate: `${moveX * 0.9}px ${moveY * 0.9}px`, scale: "0.28", opacity: 0.7 },
          { translate: `${moveX}px ${moveY}px`, scale: "0", opacity: 0 },
        ],
        { duration: 700, delay: index * 24, easing: "cubic-bezier(.76, 0, .24, 1)", fill: "forwards" },
      );
    });

    const profileAnimation = profile?.animate(
      [{ opacity: 1, scale: "1" }, { opacity: 0, scale: "0.9" }],
      { duration: 380, easing: "ease-in", fill: "forwards" },
    );

    const menuAnimation = menuGlyph?.animate(
      [
        { opacity: 0, scale: "0.2", rotate: "-35deg" },
        { offset: 0.65, opacity: 1, scale: "1.08", rotate: "2deg" },
        { opacity: 1, scale: "1", rotate: "0deg" },
      ],
      { duration: 360, delay: 570, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "forwards" },
    );

    const animations = [...bubbleAnimations, profileAnimation, menuAnimation].filter(
      (animation): animation is Animation => Boolean(animation),
    );

    await Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));
    await new Promise((resolve) => window.setTimeout(resolve, 90));
    router.push(href);
  }

  return (
    <section id="top" className={`home-orbit home-entry-${entryMode}`}>
      <PhotoGridBackground photos={photos} />

      <span className="home-menu-glyph" aria-hidden="true">
        <i /><i /><i />
      </span>

      <div className="home-orbit-stage">
        <div className="home-profile">
          <h1 className="home-name">Curtis Lee</h1>

          <div className="home-portrait" aria-label={profilePhoto ? "Curtis Lee profile photo" : "Profile photo placeholder"}>
            <div
              className={`home-portrait-inner ${profilePhoto ? "has-photo" : ""}`}
              style={profilePhoto ? { backgroundImage: `url("${profilePhoto}")` } : undefined}
            >
              {!profilePhoto && (
                <>
                  <span className="text-3xl font-light" aria-hidden="true">+</span>
                  <span className="mt-2 text-xs font-semibold uppercase tracking-[0.18em]">Your photo</span>
                </>
              )}
            </div>
          </div>

          <p className="home-intro">Work, food, useful things, and notes from along the way.</p>
        </div>

        <nav className="home-orbit-nav" aria-label="Explore the website">
          {orbitLinks.map((item) => (
            <Link className="orbit-link" href={item.href} key={item.href} onClick={(event) => leaveHome(event, item.href)}>
              <span className="orbit-link-detail">{item.detail}</span>
              <span className="orbit-link-label">{item.label}</span>
              <span className="orbit-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
