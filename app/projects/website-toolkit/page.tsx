import type { Metadata } from "next";
import Link from "next/link";
import {
  allToolkitChapters as toolkitChapters,
  toolkitChoices,
  toolkitNewChapters,
  toolkitDiscoveryCount,
  toolkitEntryCount,
  toolkitProjects,
} from "@/lib/toolkit-journal";
import "./toolkit-journal.css";

const toolkitEntryNames = Object.fromEntries(
  toolkitChapters.flatMap((chapter) => chapter.entries.map((entry) => [entry.id, entry.name])),
);

export const metadata: Metadata = {
  title: "Website toolkit — field notes",
  description: `A journal about ${toolkitEntryCount} tools for design, animation, science, food and photography, with individual ideas and ${toolkitProjects.length} projects combining tools.`,
};

export default function WebsiteToolkitPage() {
  return (
    <div className="toolkit-journal page-shell" id="toolkit-top">
      <header className="toolkit-journal-header">
        <Link className="toolkit-back" href="/projects#creative-projects-title">← Creative projects</Link>
        <div className="toolkit-masthead"><span>Website journal</span><span>Field notes / 01</span></div>
        <h1>Tools for a<br /><em>more curious web.</em></h1>
        <p className="toolkit-deck">What these tools actually do, what you can make with them, and where they could take this website next.</p>
        <p className="toolkit-byline">{toolkitEntryCount} tools <span aria-hidden="true">/</span> {toolkitChapters.length} chapters <span aria-hidden="true">/</span> Interaction, science, food & photography</p>
        <aside className="toolkit-new-notes" aria-label="New journal entries">
          <p>{toolkitDiscoveryCount} additions to the journal</p>
          <span>Explore the latest notes on </span>
          {toolkitNewChapters.map((chapter, index) => (
            <span key={chapter.id}>
              {index > 0 && <span aria-hidden="true"> · </span>}
              <a href={`#${chapter.id}`}>{chapter.shortTitle ?? chapter.title}</a>
            </span>
          ))}
        </aside>
      </header>

      <div className="toolkit-journal-layout">
        <nav className="toolkit-contents" aria-label="Journal contents">
          <p>In this journal</p>
          <ol>
            {toolkitChapters.map((chapter, index) => <li key={chapter.id}><a href={`#${chapter.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{chapter.title}</a></li>)}
          </ol>
          <a className="toolkit-index-link" href="#creative-workflow">A first design project ↓</a>
          <a className="toolkit-index-link" href="#choosing">Choosing a starting point ↓</a>
          <a className="toolkit-index-link" href="#project-collection">{toolkitProjects.length} projects that combine tools ↓</a>
          <details>
            <summary>Find a tool</summary>
            <ul>{toolkitChapters.flatMap((chapter) => chapter.entries).map((entry) => <li key={entry.id}><a href={`#${entry.id}`}>{entry.name}</a></li>)}</ul>
          </details>
        </nav>

        <article className="toolkit-reading-column">
          <div className="toolkit-opening">
            <p>A website can feel like a document, an instrument, or a little world you can explore. The difference often comes from how it responds: a class settling into a timetable, a chart revealing a pattern, or daylight moving across a globe.</p>
            <p>This is a working guide to the tools that make those experiences possible. The capability notes draw on the linked official documentation and project repositories. Each idea is a possible future feature; inclusion in this journal does not mean a tool is installed or that its suggested feature is already built.</p>
            <p>The new chapters explore practical UI/UX improvements, scientific experiments, recipe workflows, photography and 3D creation. Some tools run inside a page; others help design the experience or make the assets before they are published. Each entry explains where it fits.</p>
            <p>Every tool has suggested projects and a small first step. For ideas that bring several of them together, jump to the <a href="#project-collection">project collection at the end</a>: {toolkitProjects.length} possible builds, with a role for each tool and a manageable first version.</p>
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
                  {entry.format && <p className="toolkit-entry-format">{entry.format}</p>}
                  <p>{entry.explanation}</p>
                  <p>{entry.possibilities}</p>
                  <p className="toolkit-source">
                    Read further: <a href={entry.source.href} target="_blank" rel="noreferrer">{entry.source.label} <span aria-hidden="true">↗</span></a>
                    {entry.repository && entry.repository !== entry.source.href && <><span aria-hidden="true"> · </span><a href={entry.repository} target="_blank" rel="noreferrer" aria-label={`${entry.name} on GitHub`}>GitHub <span aria-hidden="true">↗</span></a></>}
                  </p>
                  <div className="toolkit-margin-note">
                    <h4>Projects to try</h4>
                    <p>{entry.idea}</p>
                  </div>
                  <p className="toolkit-fit"><strong>When to reach for it.</strong> {entry.consideration}</p>
                </section>
              ))}
            </section>
          ))}

          <section className="toolkit-chapter" id="creative-workflow" aria-labelledby="creative-workflow-title">
            <header className="toolkit-chapter-heading"><p>A suggested first project</p><h2 id="creative-workflow-title">Make one small scene, from sketch to screen.</h2></header>
            <p>A chemistry tool thumbnail is a manageable first experiment: a flask with a short liquid-level animation, a clear title and a button that opens the tool. It connects design and 3D work while keeping the finished asset small enough to tune for mobile.</p>
            <ol className="toolkit-workflow">
              <li><strong>Design the frame in <a href="#penpot">Penpot</a>.</strong> Draw the thumbnail at desktop and mobile sizes. Decide how the artwork, title and button fit together in both themes, including the still state.</li>
              <li><strong>Make the asset in <a href="#blender">Blender</a>.</strong> Model a simple flask and animate a short sequence. Export a compact GLB for interaction, or render a short video loop when playback is enough.</li>
              <li><strong>Connect it with <a href="#three-js">Three.js</a>.</strong> For the interactive version, load the model when the card becomes visible and play its animation on hover, focus or a deliberate tap. Pause it off screen and respect reduced motion.</li>
              <li><strong>Try the interaction in <a href="#quant-ux">Quant-UX</a>.</strong> Build a prototype of the card and its destination. Ask participants to find and open the chemistry tool, then use their feedback and interaction paths to refine the design. Check actual animation performance in the website separately.</li>
            </ol>
            <p><a href="#dust3d">Dust3D</a> could supply a small character for a later experiment. <a href="#godot">Godot</a> becomes useful if that character grows into a playable lab with stations, controls and progress. Those are natural follow-on projects once the first asset and interaction feel right.</p>
          </section>

          <section className="toolkit-chapter" id="choosing" aria-labelledby="choosing-title">
            <header className="toolkit-chapter-heading"><p>A practical shortlist</p><h2 id="choosing-title">Start with the experience.</h2></header>
            <p>Choose a tool for the interaction you want to make. Several of these libraries solve similar problems; a coherent result usually comes from giving each one a clear job.</p>
            <div className="toolkit-table-scroll" role="region" aria-label="Toolkit comparison" tabIndex={0}>
              <table><caption>A starting point for common ideas</caption><thead><tr><th scope="col">I want to build…</th><th scope="col">Start with</th><th scope="col">Why</th></tr></thead><tbody>
                {toolkitChoices.map((choice) => <tr key={choice.goal}><th scope="row">{choice.goal}</th><td>{choice.tools}</td><td>{choice.reason}</td></tr>)}
              </tbody></table>
            </div>
            <p className="toolkit-closing">My first experiments for this site would be a faster course list with TanStack Virtual, a PhotoSwipe gallery, and one Bi1x analysis that readers can rerun with Pyodide. Structured recipe quantities would be another useful step, making portion adjustments and shopping lists possible after the data has been reviewed.</p>
          </section>
          <section className="toolkit-chapter toolkit-project-collection" id="project-collection" aria-labelledby="project-collection-title">
            <header className="toolkit-chapter-heading">
              <p>{toolkitProjects.length} possible next projects</p>
              <h2 id="project-collection-title">Put the tools together.</h2>
              <p>These are project proposals for this website. Each combines tools with distinct jobs, from making an asset to presenting data or testing an interaction. Start with the first version described, then add complexity when the result earns it.</p>
            </header>
            <nav className="toolkit-project-index" aria-label="Suggested projects">
              <ol>
                {toolkitProjects.map((project, index) => (
                  <li key={project.id}>
                    <a href={`#project-${project.id}`}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{project.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
            {toolkitProjects.map((project, index) => (
              <section className="toolkit-project" id={`project-${project.id}`} key={project.id} aria-labelledby={`project-${project.id}-title`}>
                <p className="toolkit-project-meta"><span>{String(index + 1).padStart(2, "0")} / {project.category}</span><span>{project.scope}</span></p>
                <h3 id={`project-${project.id}-title`}>{project.title}</h3>
                <p>{project.description}</p>
                <h4>How the tools work together</h4>
                <ul className="toolkit-project-tools">
                  {project.tools.map((tool) => (
                    <li key={tool.id}><a href={`#${tool.id}`}>{toolkitEntryNames[tool.id]}</a><span>{tool.role}</span></li>
                  ))}
                </ul>
                <p className="toolkit-project-first"><strong>A first version.</strong> {project.firstVersion}</p>
              </section>
            ))}
            <p className="toolkit-closing">For a first design and animation project, I would start with the chemistry thumbnail: Penpot for its layout, Blender for the asset and Three.js for the interaction. For a useful addition to an existing page, the rerunnable Bi1x figure or the photography gallery would make a focused next experiment.</p>
          </section>
          <footer className="toolkit-journal-footer"><span>End of field notes</span><a href="#toolkit-top">Back to the beginning ↑</a></footer>
        </article>
      </div>
    </div>
  );
}
