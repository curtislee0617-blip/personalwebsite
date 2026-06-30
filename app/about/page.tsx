import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "About" };

const experience = [
  {
    dates: "July 2025 - August 2025",
    role: "Research Intern",
    organisation: "UC Davis Robert Mondavi Institute for Wine and Food Science - iCAMP",
    detail: "Researched cultivated meat using FBS-free media and scaffold materials, with texture profile analysis to evaluate replicated textures.",
  },
  {
    dates: "September 2024 - Present",
    role: "Cooking Class Teaching Assistant",
    organisation: "California Institute of Technology",
    detail: "Teaching assistant for Caltech's cooking class under Tom Mannion.",
  },
  {
    dates: "March 2024 - April 2024",
    role: "Research Intern",
    organisation: "National University of Singapore - Institute for Functional Intelligent Materials",
    detail: "Worked with Dr Maxim Rybin on graphene synthesis using chemical vapour deposition.",
  },
  {
    dates: "July 2021 - Present",
    role: "Stage and Shadow",
    organisation: "Michelin-starred restaurants",
    detail: "Trained in kitchens including The Fat Duck, Ecriture, The Clove Club and Core by Clare Smyth.",
  },
];

const featuredWork = [
  {
    href: "/projects#cultivated-meat-research",
    type: "Research project",
    title: "Cultivated meat research",
    summary: "FBS-free growth media, scaffold materials, and texture profile analysis at UC Davis iCAMP.",
  },
  {
    href: "/projects#graphene-cvd",
    type: "Research project",
    title: "Graphene synthesis by CVD",
    summary: "Chemical vapour deposition research at the National University of Singapore.",
  },
  {
    href: "/projects#tonbridge-food-science",
    type: "Conference project",
    title: "The science of flavour",
    summary: "A Tonbridge Science Conference investigation into flavour compounds and retronasal olfaction.",
  },
  {
    href: "/projects#cook-enterprise",
    type: "Young Enterprise project",
    title: "cook.enterprise",
    summary: "A student-focused cookbook and the Kent Finals Best Company winner.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About"
        title="Chemical engineering, food science, and kitchens."
        description="I am a Caltech undergraduate double-majoring in Chemical Engineering (materials and process track) and Business Economics and Management. My work sits where materials, food science, research, and cooking overlap."
      />

      <section className="page-section pt-10 sm:pt-12 lg:pt-14">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 pb-10">
          <a className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-moss" download href="/curtis-lee-resume.pdf">
            Download résumé ↓
          </a>
          <a className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold transition hover:border-ink hover:bg-white" href="https://www.linkedin.com/in/curtislee0617" rel="noreferrer" target="_blank">
            LinkedIn ↗
          </a>
        </div>

        <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)] lg:gap-20">
          <div>
            <h2 className="section-title">Experience</h2>
            <div className="mt-7 divide-y divide-ink/10 border-y border-ink/10">
              {experience.map((item) => (
                <article className="grid gap-3 py-7 sm:grid-cols-[10rem_1fr] sm:gap-8" key={`${item.role}-${item.organisation}`}>
                  <p className="text-sm leading-6 text-ink/45">{item.dates}</p>
                  <div>
                    <h3 className="text-lg font-semibold">{item.role}</h3>
                    <p className="mt-1 text-sm font-medium text-moss">{item.organisation}</p>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/60">{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-12">
            <section>
              <p className="eyebrow">Education</p>
              <div className="mt-5 space-y-6">
                <article>
                  <h2 className="font-semibold">California Institute of Technology</h2>
                  <p className="mt-1 text-xs text-ink/45">2024 - 2028</p>
                  <p className="mt-3 text-sm leading-6 text-ink/60">Chemical Engineering (materials and process track) and Business Economics and Management.</p>
                </article>
                <article>
                  <h2 className="font-semibold">The King&apos;s School, Canterbury</h2>
                  <p className="mt-1 text-xs text-ink/45">2019 - 2024</p>
                  <p className="mt-3 text-sm leading-6 text-ink/60">A-Levels in Mathematics, Further Mathematics, Physics and Chemistry.</p>
                </article>
              </div>
            </section>

            <section>
              <p className="eyebrow">Awards</p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-ink/60">
                <li>RSC UK Chemistry Olympiad - Gold Award, 2024</li>
                <li>Cambridge Chemistry Challenge - Gold Award, 2023</li>
                <li>BPhO Senior Physics Challenge - Gold Award, 2023</li>
                <li>Young Enterprise Kent Finals - Best Company</li>
              </ul>
            </section>

            <section>
              <p className="eyebrow">Beyond the lab</p>
              <p className="mt-5 text-sm leading-6 text-ink/60">ChemE Car, chamber singing, a cappella, glee club, violin and cooking. Grade 8 in singing and violin, and a PADI Advanced Open Water Diver.</p>
            </section>

            <section>
              <p className="eyebrow">Languages</p>
              <p className="mt-5 text-sm leading-6 text-ink/60">English, Cantonese and Mandarin (native); French (elementary).</p>
            </section>
          </aside>
        </div>

        <section className="mt-20 border-t border-ink/10 pt-12" aria-labelledby="projects-publications-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2 className="section-title mt-3" id="projects-publications-title">Projects &amp; publications</h2>
            </div>
            <Link className="text-sm font-semibold text-moss hover:text-ink" href="/projects">View all projects →</Link>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {featuredWork.map((item) => (
              <Link className="group rounded-3xl border border-ink/10 bg-white/45 p-6 transition hover:-translate-y-0.5 hover:border-ink/25 hover:bg-white" href={item.href} key={item.href}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">{item.type}</p>
                <h3 className="mt-3 text-lg font-semibold group-hover:text-moss">{item.title} ↗</h3>
                <p className="mt-3 text-sm leading-6 text-ink/60">{item.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}
