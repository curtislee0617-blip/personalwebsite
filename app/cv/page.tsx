import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "CV" };

const roles = [
  { years: "2023 — Now", role: "Senior Product Designer", company: "Studio Placeholder", detail: "Leading product strategy and design across thoughtful digital experiences." },
  { years: "2020 — 2023", role: "Product Designer", company: "Good Company", detail: "Designed tools that helped teams turn complex workflows into simple decisions." },
  { years: "2018 — 2020", role: "Designer", company: "Early Days Co.", detail: "Worked across brand, web, and product for ambitious early-stage teams." },
];

export default function CvPage() {
  return (
    <>
      <PageIntro eyebrow="Curriculum vitae" title="Work shaped by curiosity and care." description="A placeholder overview of experience, skills, and the path so far. Replace it with your real story when you’re ready." />
      <section className="page-section grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
        <aside>
          <p className="eyebrow">Capabilities</p>
          <div className="mt-5 flex flex-wrap gap-2">{["Product design", "Strategy", "Research", "Prototyping", "Design systems", "Writing"].map((skill) => <span className="pill" key={skill}>{skill}</span>)}</div>
          <a className="mt-8 inline-block border-b border-ink pb-1 text-sm font-semibold" href="/placeholder-cv.pdf">Download CV ↘</a>
        </aside>
        <div>
          <h2 className="section-title">Experience</h2>
          <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            {roles.map((role) => (
              <article key={role.years} className="grid gap-3 py-8 sm:grid-cols-[9rem_1fr] sm:gap-8">
                <p className="text-sm text-ink/45">{role.years}</p>
                <div><h3 className="text-lg font-semibold">{role.role}</h3><p className="mt-1 text-sm text-moss">{role.company}</p><p className="mt-4 max-w-xl leading-7 text-ink/60">{role.detail}</p></div>
              </article>
            ))}
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2"><div><p className="eyebrow">Education</p><p className="mt-4 font-semibold">BA, A Relevant Subject</p><p className="mt-1 text-sm text-ink/50">University Name · 2018</p></div><div><p className="eyebrow">Languages</p><p className="mt-4 font-semibold">English, Cantonese</p><p className="mt-1 text-sm text-ink/50">Plus a little menu French</p></div></div>
        </div>
      </section>
    </>
  );
}
