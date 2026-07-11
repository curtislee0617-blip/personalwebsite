import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SnapCarousel } from "@/components/snap-carousel";
import { projects } from "@/lib/projects";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Projects"
        title="Research, Projects & Publications"
        description="A closer look at selected research and independent projects. This is also where future publications will live."
      />

      <section className="page-section pt-6 sm:pt-7">
        <SnapCarousel className="project-card-carousel mobile-snap-carousel -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 pt-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3" repeatEdges={false}>
          {projects.map((project, index) => {
            const preview = project.previews[0];
            return (
              <Link className="project-card swipe-bubble-card group overflow-hidden rounded-[1.65rem] border border-ink/10 bg-surface/55 transition hover:-translate-y-1 hover:border-ink/20 hover:bg-surface hover:shadow-soft sm:w-auto" href={`/projects/${project.slug}`} id={project.slug} key={project.slug}>
                <div className="project-card-media swipe-bubble-media relative aspect-[16/10] overflow-hidden bg-mist">
                  {preview ? (
                    <Image alt={preview.alt} className="object-cover transition duration-500 group-hover:scale-[1.025]" fill loading={index === 0 ? "eager" : "lazy"} sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw" src={preview.src} />
                  ) : (
                    <span className="grid h-full place-items-center text-xs font-semibold uppercase tracking-[0.16em] text-ink/35">Preview soon</span>
                  )}
                  <span className="project-card-number">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="project-card-copy swipe-bubble-copy">
                  <p className="eyebrow">{project.eyebrow}</p>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <h2>{project.title}</h2>
                    <span aria-hidden="true">↗</span>
                  </div>
                  <p className="project-card-description">{project.description}</p>
                  <div className="project-card-tags">
                    {project.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                </div>
              </Link>
            );
          })}
        </SnapCarousel>
      </section>
    </>
  );
}
