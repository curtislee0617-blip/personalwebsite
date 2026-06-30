import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { getProjectBySlug, projects } from "@/lib/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

function assetExists(publicPath: string) {
  const relativePath = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
  return fs.existsSync(path.join(process.cwd(), "public", relativePath));
}

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "Project" };
  }

  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const availablePreviews = project.previews.filter((preview) => assetExists(preview.src));
  const availableDocuments = (project.documents ?? []).filter((document) => assetExists(document.href));
  const primaryDocument = availableDocuments[0];

  return (
    <>
      <PageIntro eyebrow={project.eyebrow} title={project.title} description={project.description} />

      <section className="page-section pt-12 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.95fr)] lg:gap-16">
          <div>
            <div className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 sm:p-8">
              <p className="eyebrow">Overview</p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-ink/65 sm:text-base sm:leading-8">
                {project.detail.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-ink/10 bg-white/55 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Preview</p>
                  <h2 className="mt-3 text-xl font-semibold sm:text-2xl">Project gallery</h2>
                </div>
                <Link className="text-sm font-semibold text-moss hover:text-ink" href="/projects">
                  Back to projects
                </Link>
              </div>

              {availablePreviews.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {availablePreviews.map((preview) => (
                    <Link className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-paper transition hover:-translate-y-0.5 hover:border-ink/20" href={`/projects/${project.slug}/viewer`} key={preview.src}>
                      <div className="relative aspect-[4/3]">
                        <Image alt={preview.alt} className="object-cover" fill sizes="(max-width: 640px) 100vw, 50vw" src={preview.src} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-ink/15 bg-paper/70 p-6 text-sm leading-7 text-ink/55">
                  Preview images are ready to be wired here.
                  <br />
                  Add images inside <span className="font-semibold text-ink">public/project-previews/{project.slug}/</span> and they will appear automatically.
                </div>
              )}
            </div>

          </div>

          <aside className="space-y-8">
            <div className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 sm:p-8">
              <p className="eyebrow">Details</p>
              <dl className="mt-5 space-y-5 text-sm leading-6 text-ink/60">
                <div>
                  <dt className="font-semibold text-ink">Year</dt>
                  <dd className="mt-1">{project.year}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">Topics</dt>
                  <dd className="mt-3 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span className="rounded-full border border-ink/10 bg-paper/85 px-3 py-1.5 text-xs text-ink/60" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[2rem] border border-ink/10 bg-white/55 p-6 sm:p-8">
              <p className="eyebrow">Document</p>
              {primaryDocument ? (
                <div className="mt-5">
                  <h3 className="text-lg font-semibold text-ink">
                    {project.slug === "tonbridge-food-science" ? "Poster viewer" : "Book viewer"}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ink/60">
                    {project.slug === "tonbridge-food-science"
                      ? "Open the full-screen poster viewer or download the original PDF."
                      : "Open the page-by-page book viewer or download the full PDF."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      className="inline-flex rounded-full border border-ink/15 bg-paper/80 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/25 hover:bg-white"
                      href={`/projects/${project.slug}/viewer`}
                    >
                      Open viewer ↗
                    </Link>
                    <a
                      className="inline-flex rounded-full border border-ink/15 bg-paper/80 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/25 hover:bg-white"
                      download
                      href={primaryDocument.href}
                    >
                      Download PDF
                    </a>
                  </div>
                  <p className="mt-4 text-sm text-ink/55">{primaryDocument.description}</p>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-ink/15 bg-paper/70 p-5 text-sm leading-7 text-ink/55">
                  No PDF has been added yet.
                  <br />
                  Add it in <span className="font-semibold text-ink">public/project-documents/{project.slug}/</span>.
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
