"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

const orbitLinks = [
  { href: "/about", label: "About", detail: "The person" },
  { href: "/cv", label: "CV", detail: "The work" },
  { href: "/recipes", label: "Recipes", detail: "The kitchen" },
  { href: "/restaurants", label: "Restaurants", detail: "The table" },
  { href: "/tools", label: "Tools", detail: "The kit" },
  { href: "/contact", label: "Contact", detail: "Say hello" },
];

export default function HomePage() {
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
      {/* This quiet layer is ready to be replaced by the looping photo collage. */}
      <div className="home-collage" aria-hidden="true">
        <span className="collage-frame collage-frame-one" />
        <span className="collage-frame collage-frame-two" />
        <span className="collage-frame collage-frame-three" />
        <span className="collage-frame collage-frame-four" />
      </div>

      <span className="home-menu-glyph" aria-hidden="true">
        <i /><i /><i />
      </span>

      <div className="home-orbit-stage">
        <div className="home-profile">
          <p className="eyebrow">Welcome to my corner</p>
          <h1 className="home-name">Curtis Lee</h1>

          <div className="home-portrait" aria-label="Profile photo placeholder">
            <div className="home-portrait-inner">
              <span className="text-3xl font-light" aria-hidden="true">+</span>
              <span className="mt-2 text-xs font-semibold uppercase tracking-[0.18em]">Your photo</span>
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
