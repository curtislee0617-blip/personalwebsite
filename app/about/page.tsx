import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "About" };

type LogoMeta = {
  src?: string;
  alt: string;
  fallback: string;
  fitClassName?: string;
  alignClassName?: string;
  frameClassName?: string;
};

type TimelineItem = {
  dates: string;
  role: string;
  organisation: string;
  detail: string;
  logo?: LogoMeta;
};

type EducationItem = {
  dates: string;
  school: string;
  detail: string;
  logo?: LogoMeta;
};

function assetExists(publicPath?: string) {
  if (!publicPath) return false;
  const relativePath = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
  return fs.existsSync(path.join(process.cwd(), "public", relativePath));
}

function LogoBadge({ logo }: { logo?: LogoMeta }) {
  if (!logo) return null;

  const hasImage = assetExists(logo.src);

  return (
    <div className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-ink/10 bg-white/80 shadow-[0_12px_24px_rgba(32,35,31,0.06)] ${logo.frameClassName ?? ""}`}>
      {hasImage && logo.src ? (
        <div className="relative flex h-full w-full items-center justify-center">
          <Image
            alt={logo.alt}
            className={`object-contain mix-blend-multiply ${logo.alignClassName ?? "object-center"} ${logo.fitClassName ?? "h-9 w-9"}`}
            height={56}
            src={logo.src}
            width={56}
          />
        </div>
      ) : (
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{logo.fallback}</span>
      )}
    </div>
  );
}

const experience: TimelineItem[] = [
  {
    dates: "June 2026 - Present",
    role: "Engineering Summer Intern",
    organisation: "The Hong Kong and China Gas Company Limited (Towngas)",
    detail: "Interning with Towngas in the Green Fuels & Chemicals Division, supporting process design, safety review, and environmental analysis for the Foshan green fuels plant currently under construction. I will also work on operations at the company's Inner Mongolia green methanol plant, gaining exposure to large-scale renewable fuels production. Across the internship, I will research and evaluate the technical and commercial feasibility of producing synthetic natural gas from biomass-derived syngas.",
    logo: { src: "/logos/towngas.png", alt: "Towngas logo", fallback: "TG", fitClassName: "h-11 w-[3.25rem]", alignClassName: "object-center", frameClassName: "bg-white" },
  },
  {
    dates: "September 2024 - Present",
    role: "Teaching Assistant",
    organisation: "Caltech",
    detail: "Teaching Caltech students how to cook in Tom Mannion's cooking class.",
    logo: { src: "/logos/cal copy.jpg", alt: "Caltech logo", fallback: "CIT", fitClassName: "h-12 w-12" },
  },
  {
    dates: "July 2025 - August 2025",
    role: "Research Intern",
    organisation: "UC Davis Department of Viticulture and Enology",
    detail: "Working in the Integrative Center for Alternative Meat and Protein - iCAMP at UC Davis to research methods of producing sustainable and healthy meat via cell culturing. Over a five-week period, I primarily worked under Nick Johnson to develop scaffolds for cultivated meat. Using Texture Profile Analysis, I conducted many experiments with varying materials, cross-linkers, and preparation techniques to replicate textures comparable to meat.",
    logo: { src: "/logos/ucdaviswhite.png", alt: "UC Davis logo", fallback: "UCD", fitClassName: "h-11 w-11", alignClassName: "object-top", frameClassName: "bg-[#16345f]" },
  },
  {
    dates: "March 2024 - April 2024",
    role: "Intern",
    organisation: "NUS Institute for Functional Intelligent Materials (I-FIM)",
    detail: "Invited by Professor Konstantin Novoselov (2010 Nobel Prize in Physics) to intern under Dr Maxim Rybin to learn current methods of synthesizing graphene, specifically using CVD chemical vapour deposition onto copper foil. I learned the theory and process of using nitric acid etching and electrochemical polishing to smooth copper, as well as annealing to form larger monocrystals for better-quality graphene formation on the copper substrate. I then studied the heating and pressure conditions required for ideal deposition using methane as the precursor, and learned the transfer process of graphene onto a PMMA coat and then onto a silicon dioxide chip for analysis using optical microscopes and Raman spectroscopy.",
    logo: { src: "/logos/nus.png", alt: "National University of Singapore logo", fallback: "NUS", fitClassName: "h-10 w-12", alignClassName: "object-center" },
  },
  {
    dates: "September 2023 - March 2024",
    role: "Student Tutor",
    organisation: "The King's School, Canterbury",
    detail: "Helping younger students in school with iGCSE sciences and maths.",
    logo: { src: "/logos/kings-school.png", alt: "The King's School Canterbury logo", fallback: "KSC", fitClassName: "h-9 w-11" },
  },
  {
    dates: "November 2022 - April 2023",
    role: "General Manager",
    organisation: "cook.enterprise",
    detail: "Managed and led a team of 17 students competing in the Young Enterprise UK competition, winning the Kent Finals Prize. We created a student-centric cookbook inspired by works such as Modernist Cuisine, researching novel ways to prepare food quickly and microwave-cooking techniques suited to a busy student.",
    logo: { src: "/logos/cook.png", alt: "cook.enterprise logo", fallback: "COOK", fitClassName: "h-10 w-10" },
  },
  {
    dates: "July 2021 - Present",
    role: "Stage and Cook",
    organisation: "Michelin-starred restaurants",
    detail: "Worked in over a dozen Michelin-starred kitchens led by chefs holding over 42 Michelin stars combined, including The Fat Duck, Ecriture, The Clove Club, Core by Clare Smyth, Sushiyoshi, Muse by Tom Aikens, and Frog by Adam Handling.",
    logo: { src: "/logos/michelin.png", alt: "Michelin logo", fallback: "42★", fitClassName: "h-9 w-9" },
  },
];

const education: EducationItem[] = [
  {
    dates: "2024 - 2028",
    school: "California Institute of Technology",
    detail: "Chemical Engineering (process track, with electives in materials) and Business Economics and Management.",
    logo: { src: "/logos/cal copy.jpg", alt: "Caltech logo", fallback: "CIT", fitClassName: "h-12 w-12" },
  },
  {
    dates: "2019 - 2024",
    school: "The King's School, Canterbury",
    detail: "A-Levels in Mathematics, Further Mathematics, Physics and Chemistry.",
    logo: { src: "/logos/kings-school.png", alt: "The King's School Canterbury logo", fallback: "KSC", fitClassName: "h-9 w-11" },
  },
];

const featuredWork = [
  {
    href: "/projects/tonbridge-food-science",
    type: "Conference project",
    title: "The science of flavour",
    summary: "A Tonbridge Science Conference investigation into flavour compounds and retronasal olfaction.",
  },
  {
    href: "/projects/cook-enterprise",
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
        description="I am double-majoring in Chemical Engineering (process track, with electives in materials) and BEM (Business Economics and Management) at Caltech. I am a Michelin-trained chef, having trained under chefs and at restaurants with a combined 42 Michelin stars. My interests include food science, manufacturing, materials science, macroeconomics, and political economics."
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
            <h2 className="section-title">Education</h2>
            <div className="mt-7 divide-y divide-ink/10 border-y border-ink/10">
              {education.map((item) => (
                <article className="grid gap-4 py-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8" key={item.school}>
                  <p className="text-sm leading-6 text-ink/45">{item.dates}</p>
                  <div className="grid gap-4 sm:grid-cols-[4.25rem_minmax(0,1fr)] sm:items-start">
                    <LogoBadge logo={item.logo} />
                    <div>
                      <h3 className="text-lg font-semibold">{item.school}</h3>
                      <p className="mt-3 text-sm leading-7 text-ink/60">{item.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <h2 className="section-title mt-14">Experience</h2>
            <div className="mt-7 divide-y divide-ink/10 border-y border-ink/10">
              {experience.map((item) => (
                <article className="grid gap-4 py-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8" key={`${item.role}-${item.organisation}`}>
                  <p className="text-sm leading-6 text-ink/45">{item.dates}</p>
                  <div className="grid gap-4 sm:grid-cols-[4.25rem_minmax(0,1fr)] sm:items-start">
                    <LogoBadge logo={item.logo} />
                    <div>
                      <h3 className="text-lg font-semibold">{item.role}</h3>
                      <p className="mt-1 text-sm font-medium text-moss">{item.organisation}</p>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/60">{item.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-12">
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
