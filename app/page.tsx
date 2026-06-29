"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

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

  function leaveHome(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }

    const target = { x: 44, y: 44 };
    const bubbles = document.querySelectorAll<HTMLElement>(".orbit-link");
    const profile = document.querySelector<HTMLElement>(".home-profile");
    const menuGlyph = document.querySelector<HTMLElement>(".home-menu-glyph");

    bubbles.forEach((bubble, index) => {
      const box = bubble.getBoundingClientRect();
      const moveX = target.x - (box.left + box.width / 2);
      const moveY = target.y - (box.top + box.height / 2);

      bubble.animate(
        [
          { translate: "0 0", scale: "1", opacity: 1 },
          { translate: `${moveX}px ${moveY}px`, scale: "0.16", opacity: 0.15 },
        ],
        { duration: 620, delay: index * 22, easing: "cubic-bezier(.7, 0, .2, 1)", fill: "forwards" },
      );
    });

    profile?.animate(
      [{ opacity: 1, scale: "1" }, { opacity: 0, scale: "0.9" }],
      { duration: 380, easing: "ease-in", fill: "forwards" },
    );

    menuGlyph?.animate(
      [{ opacity: 0, scale: "0.55" }, { opacity: 1, scale: "1" }],
      { duration: 220, delay: 470, easing: "ease-out", fill: "forwards" },
    );

    window.setTimeout(() => router.push(href), 720);
  }

  return (
    <section id="top" className="home-orbit">
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
