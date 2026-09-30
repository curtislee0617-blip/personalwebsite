import type { Metadata } from "next";
import Image from "next/image";
import { AstronomyThumbnail } from "@/components/astronomy-thumbnail";
import { ContactCityTimeline } from "@/components/contact-city-timeline";
import { PageIntro } from "@/components/page-intro";
import { ProjectCarousel } from "@/components/project-carousel";
import { SpringLink } from "@/components/spring-links";
import { websiteInteractionTools } from "@/lib/interaction-toolkit";
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
            <article id="website-project" className="website-project-card creative-project-card project-card design-panel scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-ink/10 bg-surface/55" data-reveal data-spotlight>
              <div className="website-project-media">
                <Image
                  alt="The Curtis Lee website homepage"
                  className="object-contain"
                  fill
                  priority
                  sizes="(max-width: 899px) 94vw, 52vw"
                  src="/project-previews/website-homepage-20260824.jpg"
                />
              </div>
              <div className="website-project-copy creative-project-copy">
                <p className="eyebrow">Personal project</p>
                <h3>Website</h3>
                <p className="creative-project-description">
                  Over the summer of 2026, I launched this website. I wanted to build an internet presence beyond social media and combine everything I do in one place. Everything was designed and coded by me (with a significant amount of help from Codex). It was plenty of fun: I got to design my ideal website without being constrained by syntax, and I could be nitpicky about little details like my pixel-art map.
                </p>
                <ul className="website-project-facts">
                  <li>
                    <strong>Built with</strong>
                    <span>
                      Next.js 16, React 19, TypeScript, and Tailwind CSS form the core. D3.js powers the scientific maps and data graphics; Motion, React Spring, Anime.js, GSAP + ScrollTrigger, dotLottie, use-gesture, and the View Transitions API handle movement and continuity; XState coordinates explicit interface modes; and Matter.js runs the interactive coffee-bean physics.
                    </span>
                  </li>
                  <li><strong>Hosted on</strong><span>Vercel, connected to the GitHub repository. The main branch powers production, while other branches receive preview deployments.</span></li>
                  <li><strong>Database</strong><span>Supabase Postgres stores the restaurant directory, restaurant recommendations, website-error feedback, contact-page presence, synced course plans, and recipe-upload metadata.</span></li>
                  <li><strong>File storage</strong><span>Cloudflare R2 stores the original images uploaded through the recipe admin.</span></li>
                </ul>
                <div className="website-project-toolkit">
                  <div className="website-project-toolkit-heading">
                    <strong>Interaction toolkit</strong>
                    <span>Active foundations and client-only components, ready for experiments without changing the current visual language.</span>
                  </div>
                  <ul aria-label="Website animation and interaction technologies">
                    {websiteInteractionTools.map((tool) => (
                      <li data-status={tool.status.toLowerCase().replace(" ", "-")} key={tool.name} title={tool.capability}>
                        <span>{tool.name}</span>
                        <small>{tool.status}</small>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="website-project-actions">
                  <SpringLink className="back-link-bubble website-project-link" href="/">Visit the front page</SpringLink>
                  <SpringLink className="back-link-bubble website-project-link" href="/projects/website-toolkit">Explore the toolkit</SpringLink>
                </div>
                <div className="website-project-clicks">
                  <div>
                    <p className="eyebrow">UI/UX brainstorming</p>
                    <h4>Clicks</h4>
                    <p>One hundred interactive button directions to explore for future website updates.</p>
                  </div>
                  <SpringLink aria-label="Explore Clicks button ideas" href="/projects/clicks">Explore Clicks ↗</SpringLink>
                </div>
              </div>
            </article>
            <article className="fusion-project-bubble" data-reveal data-spotlight>
              <div>
                <p className="eyebrow">Creative tool</p>
                <h3>Autodesk Fusion</h3>
              </div>
              <p>Design work and experiments in CAD, collected here as they take shape.</p>
              <span aria-label="Project details coming soon">Coming soon</span>
            </article>
            <ContactCityTimeline />
            <article id="astronomical-darkness-project" className="astronomy-project-card creative-project-card project-card design-panel scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-ink/10 bg-surface/55" data-reveal data-spotlight>
              <div className="astronomy-project-media"><AstronomyThumbnail /></div>
              <div className="astronomy-project-copy creative-project-copy">
                <p className="eyebrow">Photography tool</p>
                <h3>Astronomical darkness</h3>
                <p>Follow the night line across Earth, then find moonless dark-sky windows, weather, and light-pollution conditions for an observing location.</p>
                <SpringLink className="back-link-bubble" href="/tools/astronomical-darkness">Open the darkness tracker</SpringLink>
              </div>
            </article>
          </div>
        </section>
      </section>
    </>
  );
}
