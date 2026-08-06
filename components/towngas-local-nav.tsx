"use client";

import { motion, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";

const sections = [
  { href: "#reasoning", label: "Design reasoning" },
  { href: "#feed-platform", label: "Feed platform" },
  { href: "#siting", label: "South China" },
  { href: "#process-design", label: "Process architecture" },
  { href: "#balances", label: "Mass + energy" },
  { href: "#certification", label: "Certification" },
  { href: "#economics", label: "RMB economics" },
  { href: "#decision", label: "Final position" },
  { href: "#report", label: "V3 report" },
] as const;

export function TowngasLocalNav() {
  const navRef = useRef<HTMLElement>(null);
  const [activeHref, setActiveHref] = useState<(typeof sections)[number]["href"]>(sections[0].href);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const hash = window.location.hash;
    let hashFrame = 0;
    if (sections.some((section) => section.href === hash)) {
      hashFrame = window.requestAnimationFrame(() => {
        setActiveHref(hash as (typeof sections)[number]["href"]);
      });
    }

    const visibleSections = new Set<string>();
    const elements = sections
      .map((section) => document.getElementById(section.href.slice(1)))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0 || typeof IntersectionObserver === "undefined") {
      return () => window.cancelAnimationFrame(hashFrame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.add(entry.target.id);
          else visibleSections.delete(entry.target.id);
        });

        const nextSection = sections.find((section) => visibleSections.has(section.href.slice(1)));
        if (nextSection) setActiveHref(nextSection.href);
      },
      { rootMargin: "-18% 0px -72% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => {
      window.cancelAnimationFrame(hashFrame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const scroller = navRef.current?.querySelector<HTMLElement>(".towngas-shell");
    const activeLink = scroller?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!scroller || !activeLink) return;

    const targetLeft = activeLink.offsetLeft - (scroller.clientWidth - activeLink.clientWidth) / 2;
    scroller.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [activeHref, shouldReduceMotion]);

  return (
    <nav aria-label="Case study sections" className="towngas-local-nav" ref={navRef}>
      <motion.span
        aria-hidden="true"
        className="towngas-local-nav-progress"
        style={{ scaleX: shouldReduceMotion ? 0 : scrollYProgress }}
      />
      <div className="towngas-shell">
        <p className="towngas-local-nav-label">Contents</p>
        {sections.map(({ href, label }, index) => {
          const isActive = activeHref === href;
          return (
            <a
              aria-current={isActive ? "location" : undefined}
              href={href}
              key={href}
              onClick={() => setActiveHref(href)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {label}
              {isActive ? (
                <motion.i
                  aria-hidden="true"
                  className="towngas-local-nav-indicator"
                  layoutId="towngas-local-nav-indicator"
                  transition={shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 38 }}
                />
              ) : null}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
