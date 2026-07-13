import type { Metadata } from "next";
import { ContactCityTimeline } from "@/components/contact-city-timeline";
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

        <section aria-labelledby="creative-projects-title" className="creative-projects-section">
          <div className="creative-projects-heading">
            <p className="eyebrow">Experiments in design and code</p>
            <h2 className="section-title" id="creative-projects-title">Creative projects</h2>
          </div>
          <ContactCityTimeline />
        </section>
      </section>
    </>
  );
}
