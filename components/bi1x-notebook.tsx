import Image from "next/image";
import imageDimensions from "@/public/bi1x/image-dimensions.json";
import type { Bi1xBlock, Bi1xProject } from "@/lib/bi1x-projects";
import { highlightPython } from "@/lib/python-highlight";

function dimensions(src: string) {
  return (imageDimensions as Record<string, { width: number; height: number }>)[src] ?? { width: 960, height: 640 };
}

async function PythonCode({ code }: { code: string }) {
  const html = await highlightPython(code);
  // Shiki escapes the source before producing this server-rendered markup.
  return <details className="bi1x-code-disclosure"><summary>Show code <span>Python</span></summary><div className="bi1x-python" dangerouslySetInnerHTML={{ __html: html }} /></details>;
}

function NotebookImage({ src, alt, width, height }: { src: string; alt: string; width?: number; height?: number }) {
  const size = dimensions(src);
  const caption = alt === "alt text" ? "Image from the original lab report" : alt;
  return <figure className="bi1x-figure">
    <a className="bi1x-image-link" href={src} rel="noreferrer" target="_blank" aria-label={`Open full-size image: ${caption}`}>
      <Image alt={caption} className="bi1x-figure-image" height={height ?? size.height} src={src} unoptimized width={width ?? size.width} />
    </a>
    <figcaption>{caption}<a href={src} rel="noreferrer" target="_blank">Open full size ↗</a></figcaption>
  </figure>;
}

function inline(text: string) {
  const tokens = /(\!\[[^\]]*\]\([^)]*\)|\[[^\]]*\]\([^)]*\)|\*\*[^*]+\*\*|`[^`]+`|(?<!\*)\*[^*]+\*(?!\*))/g;
  return text.split(tokens).filter(Boolean).map((part, index) => {
    const image = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) return <Image alt={image[1]} className="bi1x-inline-image" {...dimensions(image[2])} key={index} src={image[2]} unoptimized />;
    const link = part.match(/^\[([^\]]*)\]\(([^)]+)\)$/);
    if (link) {
      const safeUrl = /^(https?:\/\/|mailto:|\/|#)/i.test(link[2]);
      return safeUrl
        ? <a className="bi1x-markdown-link" href={link[2]} key={index} rel={link[2].startsWith("http") ? "noreferrer" : undefined} target={link[2].startsWith("http") ? "_blank" : undefined}>{link[1]}</a>
        : link[1];
    }
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\\\n/g, "\n").replace(/<br\s*\/?>/gi, "\n").split("\n");
  const nodes: React.ReactNode[] = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }
    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) { nodes.push(<NotebookImage alt={image[1]} key={index} src={image[2]} />); index += 1; continue; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const Tag = `h${Math.min(heading[1].length + 2, 6)}` as "h2" | "h3" | "h4" | "h5" | "h6";
      nodes.push(<Tag className="bi1x-answer-heading" key={index}>{inline(heading[2])}</Tag>);
      index += 1; continue;
    }
    if (/^\s*\|/.test(line) && index + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[index + 1].trim())) {
      const rows: string[][] = [];
      let rowIndex = 0;
      while (index < lines.length && /^\s*\|/.test(lines[index])) {
        if (rowIndex !== 1) {
          rows.push(lines[index].trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
        }
        rowIndex += 1;
        index += 1;
      }
      const headers = rows.shift() ?? [];
      nodes.push(<div className="bi1x-table-wrap" key={`table-${index}`}><table><thead><tr>{headers.map((cell, i) => <th key={i}>{inline(cell)}</th>)}</tr></thead><tbody>{rows.map((row, ri) => <tr key={ri}>{headers.map((_, ci) => <td key={ci}>{inline(row[ci] ?? "")}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) items.push(lines[index++].trim().replace(/^[-*+]\s+/, ""));
      nodes.push(<ul className="bi1x-answer-list" key={`ul-${index}`}>{items.map((item, i) => <li key={i}>{inline(item)}</li>)}</ul>);
      continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) items.push(lines[index++].trim().replace(/^\d+[.)]\s+/, ""));
      nodes.push(<ol className="bi1x-answer-list" key={`ol-${index}`}>{items.map((item, i) => <li key={i}>{inline(item)}</li>)}</ol>);
      continue;
    }
    if (/^---+$/.test(line)) { nodes.push(<hr key={index} />); index += 1; continue; }
    const paragraph = [line]; index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,6}\s|!\[|[-*+]\s|\d+[.)]\s|\s*\||---+$)/.test(lines[index].trim())) paragraph.push(lines[index++].trim());
    nodes.push(<p key={`p-${index}`}>{inline(paragraph.join(" "))}</p>);
  }
  return <div className="bi1x-answer-copy">{nodes}</div>;
}

function NotebookBlock({ block }: { block: Bi1xBlock }) {
  if (block.type === "markdown") return <Markdown text={block.text} />;
  if (block.type === "image") return <div className="bi1x-figure-group">
    {block.code && <PythonCode code={block.code} />}
    <NotebookImage {...block} />
  </div>;
  if (block.type === "output") return <details className="bi1x-code-disclosure"><summary>Show output</summary><pre><code>{block.text}</code></pre></details>;
  return <PythonCode code={block.code} />;
}

export function Bi1xNotebook({ project }: { project: Bi1xProject }) {
  return <div className="bi1x-notebook-sections">
    {project.sections.map((section, sectionIndex) => {
      const codeCount = section.blocks.filter((block) => block.type === "code").length;
      return <section className="bi1x-notebook-section design-panel" id={`section-${sectionIndex + 1}`} key={`${section.title}-${sectionIndex}`}>
        <div className="bi1x-section-heading"><span>SECTION {String(sectionIndex + 1).padStart(2, "0")}</span><h2>{section.title}</h2></div>
        {section.blocks.map((block, blockIndex) => {
          // A figure's code lives directly above it, even when one cell emitted
          // several plots. Keep standalone analysis cells in notebook order.
          if (block.type === "code" && section.blocks.slice(blockIndex + 1).some((next, index, following) =>
            next.type === "image" && (next.displayCode ?? next.code) === block.code && !following.slice(0, index).some(item => item.type === "code" || item.type === "markdown")
          )) return null;
          return <NotebookBlock block={block} key={`${sectionIndex}-${blockIndex}`} />;
        })}
        {codeCount > 0 && <p className="bi1x-code-note">{codeCount} code {codeCount === 1 ? "cell" : "cells"} from the original notebook.</p>}
      </section>;
    })}
  </div>;
}
