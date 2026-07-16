import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
            <h2 className="section-title" id="creative-projects-title">Creative projects</h2>
          </div>
          <div className="creative-projects-list">
            <article className="website-project-card creative-project-card project-card design-panel overflow-hidden rounded-[1.75rem] border border-ink/10 bg-surface/55">
              <div className="website-project-media">
                <Image
                  alt="The Curtis Lee website homepage"
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 899px) 94vw, 52vw"
                  src="/project-previews/website-homepage.jpg"
                />
              </div>
              <div className="website-project-copy creative-project-copy">
                <p className="eyebrow">Personal project</p>
                <h3>Website</h3>
                <p className="creative-project-description">
                  Over the summer of 2026, I launched this website. I wanted to build an internet presence beyond social media and combine everything I do in one place. Everything was designed and coded by me (with a significant amount of help from Codex). It was plenty of fun: I got to design my ideal website without being constrained by syntax, and I could be nitpicky about little details like my pixel-art map.
                </p>
                <ul className="website-project-facts">
                  <li><strong>Built with</strong><span>Next.js 16, React 19, TypeScript, Tailwind CSS, and a lot of deliberate details built in CSS for artwork, transitions, and responsive layouts.</span></li>
                  <li><strong>Hosted on</strong><span>Vercel, connected to the GitHub repository. The main branch powers production, while other branches receive preview deployments.</span></li>
                  <li><strong>Database</strong><span>Supabase Postgres stores the restaurant directory, restaurant recommendations, website-error feedback, contact-page presence, synced course plans, and recipe-upload metadata.</span></li>
                  <li><strong>File storage</strong><span>Cloudflare R2 stores the original images uploaded through the recipe admin.</span></li>
                </ul>
                <Link className="back-link-bubble website-project-link" href="/">Visit the front page</Link>
              </div>
            </article>
            <ContactCityTimeline />
          </div>
        </section>
      </section>
    </>
  );
}
