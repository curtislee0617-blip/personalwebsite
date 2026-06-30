import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Projects" };

const projects = [
  {
    id: "cultivated-meat-research",
    eyebrow: "Research · UC Davis iCAMP · 2025",
    title: "Cultivated meat research",
    description: "Investigated FBS-free media and scaffold materials for cultivated meat at the Robert Mondavi Institute for Wine and Food Science. Texture profile analysis helped evaluate how closely the resulting samples replicated the textures of conventional meat.",
    tags: ["Food science", "Cultivated meat", "Texture analysis"],
  },
  {
    id: "graphene-cvd",
    eyebrow: "Research · NUS I-FIM · 2024",
    title: "Graphene synthesis by chemical vapour deposition",
    description: "Worked under Dr Maxim Rybin at the Institute for Functional Intelligent Materials on graphene synthesis using chemical vapour deposition, following an invitation from Professor Konstantin Novoselov.",
    tags: ["Materials science", "Graphene", "CVD"],
  },
  {
    id: "tonbridge-food-science",
    eyebrow: "Conference project · Tonbridge Science Conference",
    title: "The science of flavour",
    description: "Researched flavour compounds, retronasal olfaction, and the chemistry behind why meat tastes good. The project also considered how plant-derived molecules might reproduce those sensory qualities in alternative foods.",
    tags: ["Flavour chemistry", "Retronasal olfaction", "Plant-based food"],
  },
  {
    id: "cook-enterprise",
    eyebrow: "Young Enterprise · 2022 - 2023",
    title: "cook.enterprise",
    description: "Led a team of 17 students to create a cookbook designed for students. The project won the Best Company Award at the Young Enterprise Kent Finals and combined product development, writing, marketing, and team leadership.",
    tags: ["Publishing", "Food", "Entrepreneurship"],
  },
];

export default function ProjectsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Projects"
        title="Research, experiments, and things made with food."
        description="A closer look at selected research and independent projects. This is also where future publications will live."
      />

      <section className="page-section pt-12 sm:pt-16">
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {projects.map((project, index) => (
            <article className="scroll-mt-24 py-10 sm:py-14" id={project.id} key={project.id}>
              <div className="grid gap-6 md:grid-cols-[5rem_minmax(0,1fr)] md:gap-10">
                <p className="text-sm font-semibold text-ink/30">{String(index + 1).padStart(2, "0")}</p>
                <div>
                  <p className="eyebrow">{project.eyebrow}</p>
                  <h2 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h2>
                  <p className="mt-5 max-w-3xl text-sm leading-7 text-ink/65 sm:text-base sm:leading-8">{project.description}</p>
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${project.title} topics`}>
                    {project.tags.map((tag) => (
                      <li className="rounded-full border border-ink/10 bg-white/45 px-3 py-1.5 text-xs text-ink/55" key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
