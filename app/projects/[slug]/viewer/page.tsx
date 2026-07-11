import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectViewer } from "@/components/project-viewer";
import { getProjectBySlug, projects } from "@/lib/projects";
import projectPages from "@/data/project-pages.json";

type ProjectViewerPageProps = {
  params: Promise<{ slug: string }>;
};

function getRenderedPages(slug: string) {
  return projectPages[slug as keyof typeof projectPages] ?? [];
}

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectViewerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "Viewer" };
  }

  return {
    title: `${project.title} viewer`,
    description: `Viewer for ${project.title}`,
  };
}

export default async function ProjectViewerPage({ params }: ProjectViewerPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const pages = getRenderedPages(slug);
  const primaryDocument = project.documents?.[0];

  if (pages.length === 0 || !primaryDocument) {
    notFound();
  }

  const mode = slug === "tonbridge-food-science" ? "poster" : "book";

  return (
    <>
      <div className={`fixed left-3 top-4 z-50 sm:left-4 sm:top-4 ${mode === "poster" ? "text-white" : "text-ink"}`}>
        <Link className="back-link-bubble" href={`/projects#${slug}`}>
          Back to projects
        </Link>
      </div>
      <div className="pt-12 sm:pt-0">
        <ProjectViewer mode={mode} pages={pages} pdfHref={primaryDocument.href} title={project.title} />
      </div>
    </>
  );
}
