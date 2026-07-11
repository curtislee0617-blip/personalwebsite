"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from "react";

export type SectionRailItem = {
  id: string;
  label: string;
};

type SectionRailProps = {
  sections: readonly SectionRailItem[];
  ariaLabel?: string;
};

export function SectionRail({ sections, ariaLabel = "Page sections" }: SectionRailProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const [isScrolling, setIsScrolling] = useState(false);
  const activeIdRef = useRef(sections[0]?.id ?? "");
  const scrollEndTimer = useRef<number | null>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const dragRef = useRef({ active: false, moved: false, index: -1 });

  useEffect(() => {
    if (!sections.some((section) => section.id === activeIdRef.current)) {
      const firstId = sections[0]?.id ?? "";
      activeIdRef.current = firstId;
      setActiveId(firstId);
    }
  }, [sections]);

  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => section !== null);

    if (sectionElements.length === 0) return;

    let animationFrame = 0;

    const updateActiveSection = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        if (dragRef.current.active) return;

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

        if (closest.id !== activeIdRef.current) {
          activeIdRef.current = closest.id;
          setActiveId(closest.id);
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
  }, [sections]);

  const goToSection = useCallback((id: string, behavior: ScrollBehavior) => {
    const section = document.getElementById(id);
    if (!section) return;

    activeIdRef.current = id;
    setActiveId(id);
    const top = section.getBoundingClientRect().top + window.scrollY - Math.min(88, window.innerHeight * 0.1);
    window.scrollTo({ behavior, top: Math.max(0, top) });
  }, []);

  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }

    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    goToSection(id, behavior);
    window.history.replaceState(null, "", `#${id}`);
  };

  const selectFromPointer = useCallback((clientY: number) => {
    const track = trackRef.current;
    if (!track || sections.length === 0) return;

    const rect = track.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (clientY - rect.top) / Math.max(rect.height, 1)));
    const index = Math.min(sections.length - 1, Math.floor(progress * sections.length));

    if (index === dragRef.current.index) return;
    dragRef.current.index = index;
    dragRef.current.moved = true;
    goToSection(sections[index].id, "auto");
  }, [goToSection, sections]);

  const handlePointerDown = (event: PointerEvent<HTMLOListElement>) => {
    dragRef.current = { active: true, moved: false, index: -1 };
    event.currentTarget.setPointerCapture(event.pointerId);
    selectFromPointer(event.clientY);
  };

  const handlePointerMove = (event: PointerEvent<HTMLOListElement>) => {
    if (!dragRef.current.active) return;
    selectFromPointer(event.clientY);
  };

  const finishPointer = (event: PointerEvent<HTMLOListElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const currentId = activeIdRef.current;
    if (currentId) window.history.replaceState(null, "", `#${currentId}`);
  };

  if (sections.length < 2) return null;

  const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeId));

  return (
    <nav
      aria-label={ariaLabel}
      className={`section-rail${isScrolling ? " is-scrolling" : ""}`}
      data-active-section={activeId}
    >
      <ol
        className="section-rail__track"
        onPointerCancel={finishPointer}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        ref={trackRef}
      >
        {sections.map((section, index) => {
          const distance = Math.abs(index - activeIndex);
          const isActive = distance === 0;

          return (
            <li className="section-rail__step" key={section.id}>
              <a
                aria-current={isActive ? "location" : undefined}
                aria-label={`Go to ${section.label}`}
                className={`section-rail__item${isActive ? " is-active" : ""}${distance === 1 ? " is-near" : ""}`}
                data-distance={Math.min(distance, 3)}
                href={`#${section.id}`}
                onClick={(event) => handleSectionClick(event, section.id)}
                style={{ "--rail-distance": distance } as CSSProperties}
              >
                <span aria-hidden="true" className="section-rail__bar" />
                <span className="sr-only">{section.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
