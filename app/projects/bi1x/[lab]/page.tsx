import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bi1xNotebook } from "@/components/bi1x-notebook";
import { PageIntro } from "@/components/page-intro";
import { bi1xClass, bi1xProjects, getBi1xProject } from "@/lib/bi1x-projects";

type Props = { params: Promise<{ lab: string }> };

export function generateStaticParams() {
  return bi1xProjects.map(({ slug }) => ({ lab: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lab } = await params;
  const project = await getBi1xProject(lab);
  return project ? { title: project.title, description: project.description } : { title: "Bi 1x project" };
}

export default async function Bi1xProjectPage({ params }: Props) {
  const { lab } = await params;
  const project = await getBi1xProject(lab);
  if (!project) notFound();
  const currentIndex = bi1xProjects.findIndex(({ slug }) => slug === lab);
  const previous = bi1xProjects[currentIndex - 1];
  const next = bi1xProjects[currentIndex + 1];

  return <>
    <PageIntro eyebrow={`${project.eyebrow} · ${bi1xClass.dates}`} title={project.title} description={project.description} />
    <section className="page-section bi1x-report-page">
      <div className="bi1x-report-topline">
        <Link className="bi1x-back-link" href="/projects/bi1x">← {bi1xClass.title}</Link>
        <span>{bi1xClass.dates} · {project.topic}</span>
      </div>
      <nav aria-label="Sections in this report" className="bi1x-section-nav">
        {project.sections.map((section, index) => <a href={`#section-${index + 1}`} key={`${section.title}-${index}`}>{section.title}</a>)}
      </nav>
      <Bi1xNotebook project={project} />
      <nav aria-label="Other Bi 1x projects" className="bi1x-report-pagination">
        {previous ? <Link href={`/projects/bi1x/${previous.slug}`}>← {previous.title}</Link> : <span />}
        {next ? <Link href={`/projects/bi1x/${next.slug}`}>{next.title} →</Link> : <Link href="/projects/bi1x">All Bi1x reports →</Link>}
      </nav>
    </section>
  </>;
}
