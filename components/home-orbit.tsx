/* eslint-disable @next/next/no-img-element */

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

const logoPhoto = "/logos/caltech-collage-orange.png";

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

function createLogoPlacements(itemCount: number, rows: number) {
  const candidates = Array.from({ length: itemCount }, (_, index) => index).sort(
    (first, second) => mixNumber(first) - mixNumber(second),
  );
  const placements: number[] = [];
  const priorTargetCount = Math.max(
    1,
    Math.ceil(Math.ceil(Math.ceil(itemCount / 13) * (2 / 3)) * (2 / 3) * (2 / 3)),
  );
  const targetCount = Math.max(1, Math.floor(priorTargetCount * 0.65));
  const rowCounts = Array.from({ length: rows }, () => 0);
  const basePerRow = Math.floor(targetCount / rows);
  const extraRows = targetCount % rows;
  const rowPriority = Array.from({ length: rows }, (_, row) => row).sort(
    (first, second) => mixNumber(itemCount + first * 37) - mixNumber(itemCount + second * 37),
  );
  const rowTargets = Array.from({ length: rows }, () => basePerRow);

  for (let index = 0; index < extraRows; index += 1) {
    rowTargets[rowPriority[index]] += 1;
  }

  for (const position of candidates) {
    const row = position % rows;
    if (rowCounts[row] >= rowTargets[row]) continue;

    const allowed = placements.every((existingPosition) =>
      blockDistance(position, existingPosition, rows) > 3,
    );

    if (allowed) {
      placements.push(position);
      rowCounts[row] += 1;
    }

    if (placements.length >= targetCount) break;
  }

  if (placements.length < targetCount) {
    for (const position of candidates) {
      if (placements.includes(position)) continue;

      const allowed = placements.every((existingPosition) =>
        blockDistance(position, existingPosition, rows) > 3,
      );

      if (allowed) placements.push(position);

      if (placements.length >= targetCount) break;
    }
  }

  return placements.sort((first, second) => mixNumber(first + 211) - mixNumber(second + 211));
}

function PhotoGridBackground({ photos }: { photos: string[] }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [itemCount, setItemCount] = useState(220);
  const [rowCount, setRowCount] = useState(8);

  useEffect(() => {
    const updateDensity = () => {
      const mobile = window.matchMedia("(max-width: 639px)").matches;
      setIsMobile(mobile);
      const rows = mobile ? 5 : 8;
      const columnWidth = mobile
        ? Math.max(72, window.innerHeight * 0.15)
        : Math.max(46, (window.innerHeight - 73) * 0.075);
      const columns = Math.ceil(window.innerWidth / columnWidth) + (mobile ? 6 : 4);
      setRowCount(rows);
      setItemCount(rows * columns);
    };

    updateDensity();
    window.addEventListener("resize", updateDensity);
    return () => window.removeEventListener("resize", updateDensity);
  }, []);

  if (isMobile === null) return <div className="home-photo-grid" aria-hidden="true" />;

  if (isMobile) {
    return (
      <div className="home-photo-grid" aria-hidden="true">
        <div className="mobile-photo-collage" />
      </div>
    );
  }

  const items = Array.from({ length: itemCount }, (_, index) => ({
    photo: photos.length ? photos[index % photos.length] : null,
    isLogo: false,
  }));

  for (const position of createLogoPlacements(itemCount, rowCount)) {
    items[position] = {
      photo: logoPhoto,
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
                  className={`photo-grid-tile ${isLogo ? "is-logo" : ""} ${photo === logoPhoto ? "is-caltech-logo" : ""}`}
                  key={`${copy}-${index}`}
                >
                  {photo ? (
                    <img
                      alt=""
                      className="photo-grid-image"
                      decoding="async"
                      loading={copy === 0 && index < 18 ? "eager" : "lazy"}
                      src={photo}
                    />
                  ) : (
                    <span className="photo-grid-placeholder" style={style}>
                      {String(shuffledIndex + 1).padStart(3, "0")}
                    </span>
                  )}
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

  function menuAnchor() {
    return { x: window.innerWidth - 44, y: 44 };
  }

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
      const source = menuAnchor();
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

    const target = menuAnchor();
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

          <p className="home-intro">School, work and life</p>
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
