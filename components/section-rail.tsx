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

type WavePoint = { x: number; y: number };

function pathNumber(value: number) {
  return Number(value.toFixed(4));
}

function waveXAt(y: number, activeY: number) {
  const distance = (y - activeY) / 100;
  const roundedCrest = 17 * Math.exp(-0.5 * (distance / 0.065) ** 2);
  const rightRailX = Math.min(44, Math.max(22, 42 - roundedCrest));

  return 48 - rightRailX;
}

function createSmoothPath(points: WavePoint[]) {
  return points.slice(0, -1).reduce((path, point, index) => {
    const previous = points[Math.max(0, index - 1)];
    const next = points[index + 1];
    const afterNext = points[Math.min(points.length - 1, index + 2)];
    const controlOneX = point.x + (next.x - previous.x) / 6;
    const controlOneY = point.y + (next.y - previous.y) / 6;
    const controlTwoX = next.x - (afterNext.x - point.x) / 6;
    const controlTwoY = next.y - (afterNext.y - point.y) / 6;

    return `${path} C ${pathNumber(controlOneX)} ${pathNumber(controlOneY)}, ${pathNumber(controlTwoX)} ${pathNumber(controlTwoY)}, ${pathNumber(next.x)} ${pathNumber(next.y)}`;
  }, `M ${pathNumber(points[0].x)} ${pathNumber(points[0].y)}`);
}

function createWaveGeometry(sectionCount: number, wavePosition: number) {
  const activeY = ((wavePosition + 0.5) / sectionCount) * 100;
  const sampleYs = Array.from({ length: 71 }, (_, index) => -20 + index * 2);
  const points = sampleYs.map((y) => ({ x: waveXAt(y, activeY), y }));

  return createSmoothPath(points);
}

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
  const [isScrollIdle, setIsScrollIdle] = useState(true);
  const [wavePosition, setWavePosition] = useState(0);
  const activeIdRef = useRef(sections[0]?.id ?? "");
  const wavePositionRef = useRef(0);
  const scrollEndTimer = useRef<number | null>(null);
  const scrollIdleTimer = useRef<number | null>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const dragRef = useRef({ active: false, moved: false, index: -1, startY: 0 });

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

        const marker = Math.min(88, window.innerHeight * 0.1) + 4;
        const markerDocumentPosition = window.scrollY + marker;
        const sectionAnchors = sectionElements.map((section) => section.getBoundingClientRect().top + window.scrollY);
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

        let nextWavePosition = 0;
        if (markerDocumentPosition >= sectionAnchors[sectionAnchors.length - 1]) {
          nextWavePosition = sectionAnchors.length - 1;
        } else if (markerDocumentPosition > sectionAnchors[0]) {
          const lowerIndex = sectionAnchors.findIndex((anchor, index) => (
            index < sectionAnchors.length - 1
            && markerDocumentPosition >= anchor
            && markerDocumentPosition < sectionAnchors[index + 1]
          ));

          if (lowerIndex >= 0) {
            const span = Math.max(1, sectionAnchors[lowerIndex + 1] - sectionAnchors[lowerIndex]);
            nextWavePosition = lowerIndex + (markerDocumentPosition - sectionAnchors[lowerIndex]) / span;
          }
        }

        if (Math.abs(nextWavePosition - wavePositionRef.current) > 0.004) {
          wavePositionRef.current = nextWavePosition;
          setWavePosition(nextWavePosition);
        }

        if (closest.id !== activeIdRef.current) {
          activeIdRef.current = closest.id;
          setActiveId(closest.id);
        }
      });
    };

    const handleScroll = () => {
      if (dragRef.current.active && !dragRef.current.moved) {
        dragRef.current.active = false;
      }
      const scrollEndDelay = window.matchMedia("(max-width: 639px)").matches ? 420 : 180;
      setIsScrolling(true);
      setIsScrollIdle(false);
      updateActiveSection();

      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
      scrollEndTimer.current = window.setTimeout(() => setIsScrolling(false), scrollEndDelay);
      if (scrollIdleTimer.current) window.clearTimeout(scrollIdleTimer.current);
      scrollIdleTimer.current = window.setTimeout(() => setIsScrollIdle(true), 1500);
    };

    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateActiveSection, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateActiveSection);
      window.cancelAnimationFrame(animationFrame);
      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
      if (scrollIdleTimer.current) window.clearTimeout(scrollIdleTimer.current);
    };
  }, [sections]);

  const goToSection = useCallback((id: string, behavior: ScrollBehavior) => {
    const section = document.getElementById(id);
    if (!section) return;

    const sectionIndex = sections.findIndex((item) => item.id === id);
    activeIdRef.current = id;
    setActiveId(id);
    if (sectionIndex >= 0) {
      wavePositionRef.current = sectionIndex;
      setWavePosition(sectionIndex);
    }
    const top = section.getBoundingClientRect().top + window.scrollY - Math.min(88, window.innerHeight * 0.1);
    window.scrollTo({ behavior, top: Math.max(0, top) });
  }, [sections]);

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
    goToSection(sections[index].id, "auto");
  }, [goToSection, sections]);

  const handlePointerDown = (event: PointerEvent<HTMLOListElement>) => {
    setIsScrolling(true);
    dragRef.current = { active: true, moved: false, index: -1, startY: event.clientY };
  };

  const handlePointerMove = (event: PointerEvent<HTMLOListElement>) => {
    if (!dragRef.current.active) return;

    if (!dragRef.current.moved) {
      if (Math.abs(event.clientY - dragRef.current.startY) < 4) return;
      dragRef.current.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    selectFromPointer(event.clientY);
  };

  const finishPointer = (event: PointerEvent<HTMLOListElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (dragRef.current.moved) {
      const currentId = activeIdRef.current;
      if (currentId) window.history.replaceState(null, "", `#${currentId}`);
    }
    if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = window.setTimeout(() => setIsScrolling(false), 360);
    if (scrollIdleTimer.current) window.clearTimeout(scrollIdleTimer.current);
    scrollIdleTimer.current = window.setTimeout(() => setIsScrollIdle(true), 1500);
  };

  if (sections.length < 2) return null;

  const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeId));
  const activeLabel = sections[activeIndex]?.label ?? sections[0].label;
  const wavePath = createWaveGeometry(sections.length, wavePosition);

  return (
    <nav
      aria-label={ariaLabel}
      className={`section-rail${isScrolling ? " is-scrolling" : ""}${isScrollIdle ? " is-scroll-idle" : ""}`}
      data-active-section={activeId}
      data-wave-position={wavePosition.toFixed(3)}
    >
      <p aria-live="polite" className="sr-only">{activeLabel}</p>
      <ol
        className="section-rail__track"
        onPointerCancel={finishPointer}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        ref={trackRef}
        style={{ "--rail-sections": sections.length } as CSSProperties}
      >
        <svg aria-hidden="true" className="section-rail__wave" preserveAspectRatio="none" viewBox="0 0 48 100">
          <path className="section-rail__wave-shadow" d={wavePath} />
          <path className="section-rail__wave-line" d={wavePath} />
        </svg>
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
                <span aria-hidden="true" className="section-rail__label">{section.label}</span>
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
