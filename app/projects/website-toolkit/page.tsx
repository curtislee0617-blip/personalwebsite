import type { Metadata } from "next";
import Link from "next/link";
import { toolkitChapters, toolkitChoices } from "@/lib/toolkit-journal";
import "./toolkit-journal.css";

export const metadata: Metadata = {
  title: "Interaction toolkit — field notes",
  description: "A journal about 19 tools for web animation, interactive graphics, maps, data visualisation and interface logic, with practical ideas for this website.",
};

export default function WebsiteToolkitPage() {
  return (
    <div className="toolkit-journal page-shell" id="toolkit-top">
      <header className="toolkit-journal-header">
        <Link className="toolkit-back" href="/projects#creative-projects-title">← Creative projects</Link>
        <div className="toolkit-masthead"><span>Website journal</span><span>Field notes / 01</span></div>
        <h1>Tools for a<br /><em>more expressive web.</em></h1>
        <p className="toolkit-deck">What these tools actually do, what you can make with them, and where they could take this website next.</p>
        <p className="toolkit-byline">19 tools <span aria-hidden="true">/</span> 5 chapters <span aria-hidden="true">/</span> Animation, graphics & interaction</p>
      </header>

      <div className="toolkit-journal-layout">
        <nav className="toolkit-contents" aria-label="Journal contents">
          <p>In this journal</p>
          <ol>
            {toolkitChapters.map((chapter, index) => <li key={chapter.id}><a href={`#${chapter.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{chapter.title}</a></li>)}
          </ol>
          <a className="toolkit-index-link" href="#choosing">Choosing a starting point ↓</a>
          <details>
            <summary>Find a tool</summary>
            <ul>{toolkitChapters.flatMap((chapter) => chapter.entries).map((entry) => <li key={entry.id}><a href={`#${entry.id}`}>{entry.name}</a></li>)}</ul>
          </details>
        </nav>

        <article className="toolkit-reading-column">
          <div className="toolkit-opening">
            <p>A website can feel like a document, an instrument, or a little world you can explore. The difference often comes from how it responds: a class settling into a timetable, a chart revealing a pattern, or daylight moving across a globe.</p>
            <p>This is a working guide to the tools that make those experiences possible. The capability notes draw on the linked official documentation. The ideas for this website are suggestions to explore, rather than a list of features already built.</p>
          </div>

          {toolkitChapters.map((chapter, chapterIndex) => (
            <section className="toolkit-chapter" id={chapter.id} key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
              <header className="toolkit-chapter-heading">
                <p>Chapter {String(chapterIndex + 1).padStart(2, "0")}</p>
                <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
                <p>{chapter.introduction}</p>
              </header>
              {chapter.entries.map((entry) => (
                <section className="toolkit-entry" id={entry.id} key={entry.id} aria-labelledby={`${entry.id}-title`}>
                  <h3 id={`${entry.id}-title`}>{entry.name}</h3>
                  <p className="toolkit-entry-summary">{entry.summary}</p>
                  <p>{entry.explanation}</p>
                  <p>{entry.possibilities}</p>
                  <p className="toolkit-source">Read further: <a href={entry.source.href} target="_blank" rel="noreferrer">{entry.source.label} <span aria-hidden="true">↗</span></a></p>
                  <div className="toolkit-margin-note">
                    <h4>An idea for this website</h4>
                    <p>{entry.idea}</p>
                  </div>
                  <p className="toolkit-fit"><strong>When to reach for it.</strong> {entry.consideration}</p>
                </section>
              ))}
            </section>
          ))}

          <section className="toolkit-chapter" id="choosing" aria-labelledby="choosing-title">
            <header className="toolkit-chapter-heading"><p>A practical shortlist</p><h2 id="choosing-title">Start with the experience.</h2></header>
            <p>Choose a tool for the interaction you want to make. Several of these libraries solve similar problems; a coherent result usually comes from giving each one a clear job.</p>
            <div className="toolkit-table-scroll" role="region" aria-label="Toolkit comparison" tabIndex={0}>
              <table><caption>A starting point for common ideas</caption><thead><tr><th scope="col">I want to build…</th><th scope="col">Start with</th><th scope="col">Why</th></tr></thead><tbody>
                {toolkitChoices.map((choice) => <tr key={choice.goal}><th scope="row">{choice.goal}</th><td>{choice.tools}</td><td>{choice.reason}</td></tr>)}
              </tbody></table>
            </div>
            <p className="toolkit-closing">For this site, the most useful next experiments would be connected recipe transitions, inspectable lab figures, and a prerequisite map for the planner. Each would help someone understand or use the content, while giving the interface a little more character.</p>
          </section>
          <footer className="toolkit-journal-footer"><span>End of field notes</span><a href="#toolkit-top">Back to the beginning ↑</a></footer>
        </article>
      </div>
    </div>
  );
}
