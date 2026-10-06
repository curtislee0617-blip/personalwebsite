"use client";

import { useEffect, useState } from "react";

type ContentsSection = { id: string; title: string };

export function CocktailCodexContents({ sections }: { sections: ContentsSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    let frame = 0;
    const updateActiveSection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const activationLine = Math.max(100, window.innerHeight * 0.3);
        let nextActiveId = sections[0]?.id ?? "";
        for (const section of sections) {
          const element = document.getElementById(`cocktail-codex-reading-${section.id}`);
          if (!element) continue;
          if (element.getBoundingClientRect().top <= activationLine) nextActiveId = section.id;
          else break;
        }
        setActiveId((current) => current === nextActiveId ? current : nextActiveId);
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    window.addEventListener("hashchange", updateActiveSection);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      window.removeEventListener("hashchange", updateActiveSection);
    };
  }, [sections]);

  return (
    <aside className="cocktail-codex-article-contents">
      <p className="eyebrow">On this page</p>
      <ol>
        {sections.map((section, sectionIndex) => (
          <li key={section.id}>
            <a
              aria-current={section.id === activeId ? "location" : undefined}
              className={section.id === activeId ? "is-active" : undefined}
              href={`#cocktail-codex-reading-${section.id}`}
              onClick={() => setActiveId(section.id)}
            >
              <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
