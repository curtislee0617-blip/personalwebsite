import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { projects } from "@/lib/projects";

export const metadata: Metadata = { title: "Projects" };

function assetExists(publicPath: string) {
  const relativePath = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
  return fs.existsSync(path.join(process.cwd(), "public", relativePath));
}

export default function ProjectsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Projects"
        title="Research, Projects & Publications"
        description="A closer look at selected research and independent projects. This is also where future publications will live."
      />

      <section className="page-section pt-12 sm:pt-16">
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {projects.map((project, index) => (
            <article className="scroll-mt-24 py-10 sm:py-14" id={project.slug} key={project.slug}>
              <div className="grid gap-6 md:grid-cols-[5rem_minmax(0,1fr)] md:gap-10">
                <p className="text-sm font-semibold text-ink/30">{String(index + 1).padStart(2, "0")}</p>
                <div>
                  <p className="eyebrow">{project.eyebrow}</p>
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h2>
                    <Link className="text-sm font-semibold text-moss hover:text-ink" href={`/projects/${project.slug}`}>
                      View project ↗
                    </Link>
                  </div>
                  <p className="mt-5 max-w-3xl text-sm leading-7 text-ink/65 sm:text-base sm:leading-8">{project.description}</p>
                  {project.previews.length > 0 && (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {project.previews.map((preview, previewIndex) => {
                        const hasAsset = assetExists(preview.src);

                        return (
                          <Link
                            className="group overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white/55 transition hover:-translate-y-0.5 hover:border-ink/20"
                            href={`/projects/${project.slug}/viewer`}
                            key={preview.src}
                          >
                            {hasAsset ? (
                              <div className="relative aspect-[4/3]">
                                <Image
                                  alt={preview.alt}
                                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                                  fill
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  src={preview.src}
                                />
                              </div>
                            ) : (
                              <div className="flex aspect-[4/3] items-end rounded-[1.5rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(219,210,191,0.42))] p-4">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
                                    Preview {previewIndex + 1}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-ink/60">
                                    Add an image in public/project-previews/{project.slug}/
                                  </p>
                                </div>
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${project.title} topics`}>
                    {project.tags.map((tag) => (
                      <li className="rounded-full border border-ink/10 bg-white/45 px-3 py-1.5 text-xs text-ink/55" key={tag}>{tag}</li>
                    ))}
                  </ul>
                  {project.documents?.some((document) => assetExists(document.href)) ? (
                    <div className="mt-6">
                      {project.documents
                        .filter((document) => assetExists(document.href))
                        .map((document) => (
                          <a
                            className="inline-flex rounded-full border border-ink/15 bg-paper/80 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/25 hover:bg-white"
                            href={`/projects/${project.slug}/viewer`}
                            key={document.href}
                          >
                            {document.label} ↗
                          </a>
                        ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
