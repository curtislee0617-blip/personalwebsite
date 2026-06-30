import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectViewer } from "@/components/project-viewer";
import { getProjectBySlug, projects } from "@/lib/projects";

type ProjectViewerPageProps = {
  params: Promise<{ slug: string }>;
};

function getRenderedPages(slug: string) {
  const directory = path.join(process.cwd(), "public", "project-pages", slug);

  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".jpg"))
    .sort((first, second) => first.localeCompare(second, undefined, { numeric: true }))
    .map((file) => `/project-pages/${slug}/${file}`);
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
      <div className={`fixed left-4 top-[5.25rem] z-50 ${mode === "poster" ? "text-white" : "text-ink"}`}>
        <Link
          className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition ${
            mode === "poster"
              ? "border-white/20 bg-black/35 hover:border-white/50 hover:bg-black/55"
              : "border-ink/15 bg-white/85 hover:border-ink/30 hover:bg-white"
          }`}
          href={`/projects#${slug}`}
        >
          Back to projects
        </Link>
      </div>
      <ProjectViewer mode={mode} pages={pages} pdfHref={primaryDocument.href} title={project.title} />
    </>
  );
}
