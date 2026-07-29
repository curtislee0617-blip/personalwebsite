"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { SnapCarousel } from "@/components/snap-carousel";
import type { ProjectEntry } from "@/lib/projects";

type ProjectCarouselProps = {
  projects: ProjectEntry[];
};

export function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProject = projects[activeIndex] ?? projects[0];

  if (!activeProject) return null;

  const activePreview = activeProject.previews[1] ?? activeProject.previews[0];

  return (
    <div className="project-carousel-shell">
      <SnapCarousel
        className="project-card-carousel mobile-snap-carousel -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 pt-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3"
        onActiveIndexChange={setActiveIndex}
        repeatEdges={false}
      >
        {projects.map((project, index) => {
          const preview = project.previews[0];

          return (
            <Link
              className="project-card swipe-bubble-card group overflow-hidden rounded-[1.65rem] border border-ink/10 bg-surface/55 transition hover:border-ink/20 hover:bg-surface hover:shadow-soft sm:w-auto"
              data-reveal
              data-spotlight
              href={`/projects/${project.slug}`}
              id={project.slug}
              key={project.slug}
              style={{ "--reveal-delay": `${Math.min(index, 5) * 70}ms` } as CSSProperties}
            >
              <div className="project-card-media swipe-bubble-media relative aspect-[16/10] overflow-hidden bg-mist">
                {preview ? (
                  <Image
                    alt={preview.alt}
                    className="object-cover transition duration-500 group-hover:scale-[1.025]"
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw"
                    src={preview.src}
                  />
                ) : (
                  <span className="grid h-full place-items-center text-xs font-semibold uppercase tracking-[0.16em] text-ink/35">Preview soon</span>
                )}
                <span className="project-card-number">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="project-card-copy swipe-bubble-copy">
                <p className="eyebrow">{project.eyebrow} · {project.year}</p>
                <div className="mt-3">
                  <h2>{project.title}</h2>
                </div>
                <p className="project-card-description">{project.description}</p>
              </div>
            </Link>
          );
        })}
      </SnapCarousel>

      <div aria-atomic="true" aria-live="polite" className="project-focus-panel" key={activeProject.slug}>
        <div className="project-focus-copy">
          <p className="project-focus-eyebrow">{activeProject.year} · {activeProject.eyebrow}</p>
          <p className="project-focus-description">{activeProject.description}</p>
        </div>
        <Link aria-label={`Open ${activeProject.title}`} className="project-focus-preview" href={`/projects/${activeProject.slug}`}>
          <span className="project-focus-preview-media">
            {activePreview ? (
              <Image alt="" fill sizes="4rem" src={activePreview.src} />
            ) : (
              <span aria-hidden="true" />
            )}
          </span>
          <span className="project-focus-preview-copy">
            <small>View project</small>
            <strong>{activeProject.shortTitle ?? activeProject.title}</strong>
          </span>
        </Link>
      </div>
    </div>
  );
}
