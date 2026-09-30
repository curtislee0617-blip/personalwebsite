import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SpringLink } from "@/components/spring-links";
import { bi1xClass, bi1xProjects } from "@/lib/bi1x-projects";

export const metadata: Metadata = {
  title: bi1xClass.title,
  description: "Bi1x laboratory reports at Caltech, April–June 2025. Written answers, Python analysis, and experimental figures from six labs.",
};

export default function Bi1xClassPage() {
  return <>
    <PageIntro eyebrow={`Caltech · ${bi1xClass.dates}`} title={bi1xClass.title} description="Six experiments, from DNA restriction digests to bacterial growth and antibiotic resistance. Explore the written answers, figures, and original Python analysis in each report." />
    <section className="page-section bi1x-class-page">
      <div className="bi1x-report-topline"><Link className="bi1x-back-link" href="/projects">← All projects</Link><span>Caltech · {bi1xClass.dates}</span></div>
      <nav aria-label="Bi1x laboratory reports" className="bi1x-report-list">
        {bi1xProjects.map((project, index) => <SpringLink className="bi1x-report-row" href={`/projects/bi1x/${project.slug}`} key={project.slug}>
          <span className="bi1x-report-number">LAB {String(index + 1).padStart(2, "0")}</span>
          <div><h2>{project.title}</h2><p>{project.description}</p><span>{project.topic}</span></div>
          <span aria-hidden="true">↗</span>
        </SpringLink>)}
      </nav>
    </section>
  </>;
}
