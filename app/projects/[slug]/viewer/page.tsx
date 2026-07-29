import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HistoryBackButton } from "@/components/history-back-button";
import { ProjectViewer } from "@/components/project-viewer";
import { getProjectBySlug, projects } from "@/lib/projects";
import projectPages from "@/data/project-pages.json";

type ProjectViewerPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
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

export default async function ProjectViewerPage({ params, searchParams }: ProjectViewerPageProps) {
  const { slug } = await params;
  const { from } = await searchParams;
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
  const backHref = from === "about" ? `/projects/${slug}?from=about` : `/projects#${slug}`;

  return (
    <>
      {mode === "book" && (
        <div className="fixed left-3 top-4 z-50 text-ink sm:left-4 sm:top-4">
          <HistoryBackButton fallbackHref={backHref} />
        </div>
      )}
      <div className="pt-12 sm:pt-0">
        <ProjectViewer backHref={backHref} mode={mode} pages={pages} pdfHref={primaryDocument.href} title={project.title} />
      </div>
    </>
  );
}
