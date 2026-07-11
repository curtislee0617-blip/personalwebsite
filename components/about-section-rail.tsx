"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

const sections = [
  { id: "about-education", label: "Education" },
  { id: "about-experience", label: "Experience" },
  { id: "about-awards", label: "Awards" },
  { id: "about-beyond", label: "Beyond the lab" },
  { id: "about-languages", label: "Languages" },
  { id: "about-skills", label: "Skills" },
  { id: "about-projects", label: "Projects" },
] as const;

type SectionId = (typeof sections)[number]["id"];

export function AboutSectionRail() {
  const [activeId, setActiveId] = useState<SectionId>(sections[0].id);
  const [isScrolling, setIsScrolling] = useState(false);
  const activeIdRef = useRef<SectionId>(sections[0].id);
  const scrollEndTimer = useRef<number | null>(null);

  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => section !== null);

    if (sectionElements.length === 0) return;

    let animationFrame = 0;

    const updateActiveSection = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const marker = window.innerHeight * 0.34;
        let closest = sectionElements[0];
        let closestDistance = Number.POSITIVE_INFINITY;

        sectionElements.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const distance = marker < rect.top
            ? rect.top - marker
            : marker > rect.bottom
              ? marker - rect.bottom
              : 0;

          if (distance < closestDistance || (distance === closestDistance && rect.top <= marker)) {
            closest = section;
            closestDistance = distance;
          }
        });

        const nextId = closest.id as SectionId;
        if (nextId !== activeIdRef.current) {
          activeIdRef.current = nextId;
          setActiveId(nextId);
        }
      });
    };

    const handleScroll = () => {
      setIsScrolling(true);
      updateActiveSection();

      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
      scrollEndTimer.current = window.setTimeout(() => setIsScrolling(false), 180);
    };

    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateActiveSection, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateActiveSection);
      window.cancelAnimationFrame(animationFrame);
      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
    };
  }, []);

  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    const section = document.getElementById(id);
    if (!section) return;

    event.preventDefault();
    activeIdRef.current = id;
    setActiveId(id);
    section.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${id}`);
  };

  const activeIndex = sections.findIndex((section) => section.id === activeId);
  const activeLabel = sections[activeIndex]?.label ?? sections[0].label;

  return (
    <nav
      aria-label="About page sections"
      className={`about-section-rail sm:hidden${isScrolling ? " is-scrolling" : ""}`}
      data-active-section={activeId}
    >
      <p aria-live="polite" className="about-section-rail__label">{activeLabel}</p>
      <ol className="about-section-rail__track">
        {sections.map((section, index) => {
          const distance = Math.abs(index - activeIndex);
          const isActive = distance === 0;

          return (
            <li className="about-section-rail__step" key={section.id}>
              <a
                aria-current={isActive ? "location" : undefined}
                aria-label={`Go to ${section.label}`}
                className={`about-section-rail__item${isActive ? " is-active" : ""}${distance === 1 ? " is-near" : ""}`}
                data-distance={Math.min(distance, 3)}
                href={`#${section.id}`}
                onClick={(event) => handleSectionClick(event, section.id)}
                style={{ "--rail-distance": distance } as CSSProperties}
              >
                <span aria-hidden="true" className="about-section-rail__dot" />
                <span className="sr-only">{section.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
