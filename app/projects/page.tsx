import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { ProjectCarousel } from "@/components/project-carousel";
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
        <ProjectCarousel projects={projects} />
      </section>
    </>
  );
}
