"use client";

import { useEffect, useState } from "react";

type Chapter = { href: string; title: string; sections: readonly { href: string; label: string }[] };
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function WineEncyclopediaIndex({ chapters }: { chapters: readonly Chapter[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(chapters[0]?.href);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        let next = chapters[0]?.href;
        for (const chapter of chapters) {
          const section = document.getElementById(chapter.href.slice(1));
          if (section && section.getBoundingClientRect().top <= 180) next = chapter.href;
        }
        setActive(next);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [chapters]);
  const term = normalize(query.trim());
  const matching = chapters.map(chapter => ({ ...chapter, sections: chapter.sections.filter(section => !term || normalize(`${chapter.title} ${section.label}`).includes(term)) })).filter(chapter => chapter.sections.length);
  return (
    <>
      <nav className="wine-chapter-rail" aria-label="Wine encyclopedia chapters">
        {chapters.map((chapter, index) => <a key={chapter.href} href={chapter.href} aria-current={active === chapter.href ? "location" : undefined}><span>{String(index + 1).padStart(2, "0")}</span>{chapter.title}</a>)}
      </nav>
      <nav className="wine-reference-index" aria-labelledby="wine-reference-index-title">
        <header><div><p className="eyebrow">Reference index</p><h2 id="wine-reference-index-title">Explore the encyclopedia</h2></div><label><span>Find a topic</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Fermentation, climate, Sherry…" /></label></header>
        <ol>{matching.map(chapter => <li key={chapter.href}><a href={chapter.href}>{chapter.title}</a><ul>{chapter.sections.map(section => <li key={section.href}><a href={section.href}>{section.label}<span aria-hidden="true">↗</span></a></li>)}</ul></li>)}</ol>
        {!matching.length && <p role="status">No topics match “{query}”. Try a broader term.</p>}
      </nav>
    </>
  );
}
