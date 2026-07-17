import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AboutSectionRail } from "@/components/about-section-rail";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "CV" };

type LogoMeta = {
  src?: string;
  alt: string;
  fallback: string;
  fitClassName?: string;
  alignClassName?: string;
  frameClassName?: string;
  imageClassName?: string;
};

type TimelineItem = {
  dates: string;
  role: string;
  organisation: string;
  detail: string;
  logo?: LogoMeta;
  organisationWordmarkSrc?: string;
};

type EducationItem = {
  dates: string;
  school: string;
  detail: string;
  logo?: LogoMeta;
};

function LogoBadge({ logo }: { logo?: LogoMeta }) {
  if (!logo) return null;

  return (
    <div className={`about-logo-badge flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-ink/10 shadow-[0_12px_24px_rgba(32,35,31,0.06)] ${logo.frameClassName ?? "bg-white/90"}`}>
      {logo.src ? (
        <div className="relative flex h-full w-full items-center justify-center">
          <Image
            alt={logo.alt}
            className={`object-contain ${logo.imageClassName ?? "mix-blend-multiply"} ${logo.alignClassName ?? "object-center"} ${logo.fitClassName ?? "h-9 w-9"}`}
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

function OrganisationWordmark({ src, alt, fallback }: { src?: string; alt: string; fallback: string }) {
  if (!src) {
    return <>{fallback}</>;
  }

  return (
    <span className="relative mx-[0.04em] inline-flex h-[0.95em] w-[3.95em] translate-y-[0.06em] align-baseline">
      <Image alt={alt} className="object-contain object-left" fill sizes="74px" src={src} />
    </span>
  );
}

const experience: TimelineItem[] = [
  {
    dates: "June 2026 - Present",
    role: "Process Engineering Intern",
    organisation: "The Hong Kong and China Gas Company Limited (Towngas)",
    detail: "Interning with Towngas's Green Fuels & Chemicals division across Foshan, Guangdong and Ordos, Inner Mongolia. Working on process design and safety and environmental analysis for a new green-fuels plant in Foshan, while supporting daily operations at an operating green-methanol plant in Inner Mongolia. Also investigating the feasibility of producing synthetic natural gas from biomass-derived syngas.",
    logo: { src: "/logos/towngas.png", alt: "Towngas logo", fallback: "TG", fitClassName: "h-11 w-[3.25rem]", alignClassName: "object-center", frameClassName: "bg-white" },
  },
  {
    dates: "September 2024 - Present",
    role: "Teaching Assistant",
    organisation: "Caltech",
    detail: "Teaching Caltech students how to cook in Tom Mannion's cooking class.",
    logo: { src: "/logos/caltechname.png", alt: "Caltech logo", fallback: "CIT", fitClassName: "h-9 w-12", frameClassName: "bg-white/90", imageClassName: "mix-blend-normal" },
  },
  {
    dates: "July 2025 - August 2025",
    role: "Cultivated Meat Research Intern",
    organisation: "UC Davis Robert Mondavi Institute, iCAMP (Alternative Meat & Protein)",
    detail: "Working in the Integrative Center for Alternative Meat and Protein - iCAMP at UC Davis to research methods of producing sustainable and healthy meat via cell culturing. Over a five-week period, I primarily worked under Nick Johnson. I built and tested 32 scaffold combinations, using Texture Profile Analysis to judge how closely each reproduced real meat texture.",
    logo: { src: "/logos/ucdaviswhite.png", alt: "UC Davis logo", fallback: "UCD", fitClassName: "h-11 w-11", alignClassName: "object-[center_58%]", frameClassName: "bg-white/90" },
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
    detail: "Managed and led a team of 17 students competing in the Young Enterprise UK competition, winning the Kent Finals Best Company award. We created a student-centric cookbook inspired by works such as Modernist Cuisine, researching novel ways to prepare food quickly and microwave-cooking techniques suited to a busy student, earning £5,850 in revenue.",
    logo: { src: "/logos/cook.png", alt: "cook.enterprise logo", fallback: "COOK", fitClassName: "h-10 w-10" },
  },
  {
    dates: "July 2021 - Present",
    role: "Stage and Cook",
    organisation: "Michelin-starred restaurants",
    detail: "Ran full service in high-pressure, zero-error kitchens across over a dozen Michelin-starred restaurants and chefs holding over 42 Michelin stars combined, including The Fat Duck, Ecriture, The Clove Club, Core by Clare Smyth, Sushiyoshi, Muse by Tom Aikens, and Frog by Adam Handling.",
    logo: { src: "/logos/michelin.png", alt: "Michelin logo", fallback: "42★", fitClassName: "h-9 w-9" },
  },
];

const education: EducationItem[] = [
  {
    dates: "2024 - 2028",
    school: "California Institute of Technology",
    detail: "Chemical Engineering (process track, with electives in materials) and Business Economics and Management. GPA: 3.8 / 4.0.",
    logo: { src: "/logos/caltechname.png", alt: "Caltech logo", fallback: "CIT", fitClassName: "h-9 w-12", frameClassName: "bg-white/90", imageClassName: "mix-blend-normal" },
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
    href: "/projects/biodiesel-from-used-cooking-oil",
    type: "Chemical engineering coursework",
    title: "Biodiesel from used cooking oil",
    summary: "A two-part June 2026 ChemE project spanning plant design and biodiesel synthesis routes.",
  },
  {
    href: "/projects/bem-114-report",
    type: "Final project",
    title: "Earnings Call NLP-Based Long-Short Strategy",
    summary: "A June 2026 BEM 114 report on using earnings-call language to build a long-short equity signal.",
  },
  {
    href: "/projects/tonbridge-food-science",
    type: "Conference project",
    title: "The science of flavour",
    summary: "A February 2023 Tonbridge Science Conference project on flavour compounds and retronasal olfaction.",
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
    <div className="about-page">
      <PageIntro
        eyebrow="CV"
        title="Chemical engineering, food science, and kitchens."
        description={
          <>
            I am double-majoring in Chemical Engineering (process track, with electives in materials) and BEM (Business Economics and Management) at{" "}
            <OrganisationWordmark alt="Caltech" fallback="Caltech" src="/logos/caltechname-cropped.png" />.
            {" "}I am a Michelin-trained cook, having trained under chefs and at restaurants with a combined 42 Michelin stars. My interests include food science, manufacturing, materials science, macroeconomics, and political economics.
          </>
        }
      />

      <AboutSectionRail />

      <section className="about-page__content page-section pt-10 sm:pt-12 lg:pt-14">
        <div className="about-resume-actions flex flex-wrap gap-3 border-b border-ink/10 pb-10">
          <a className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-moss" download href="/curtis-lee-resume.pdf">
            Download résumé ↓
          </a>
          <a className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold transition hover:border-ink hover:bg-surface" href="https://www.linkedin.com/in/curtislee0617" rel="noreferrer" target="_blank">
            LinkedIn ↗
          </a>
        </div>

        <div className="about-main-grid mt-12 grid gap-14 lg:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)] lg:gap-20">
          <div className="about-primary">
            <section className="about-section about-section--education scroll-mt-24" id="about-education">
            <h2 className="about-section-heading section-title">Education</h2>
            <div className="about-list mt-7 divide-y divide-ink/10 border-y border-ink/10">
              {education.map((item) => (
                <article className="about-entry grid gap-4 py-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8" key={item.school}>
                  <p className="about-entry-dates text-sm leading-6 text-ink/45">{item.dates}</p>
                  <div className="about-entry-main grid gap-4 sm:grid-cols-[4.25rem_minmax(0,1fr)] sm:items-start">
                    <LogoBadge logo={item.logo} />
                    <div className="about-entry-copy">
                      <h3 className="about-entry-title text-lg font-semibold">{item.school}</h3>
                      <p className="about-entry-description mt-3 text-sm leading-7 text-ink/60">{item.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            </section>

            <section className="about-section about-section--experience mt-14 scroll-mt-24" id="about-experience">
            <h2 className="about-section-heading section-title">Experience</h2>
            <div className="about-list mt-7 divide-y divide-ink/10 border-y border-ink/10">
              {experience.map((item) => (
                <article className="about-entry grid gap-4 py-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8" key={`${item.role}-${item.organisation}`}>
                  <p className="about-entry-dates text-sm leading-6 text-ink/45">{item.dates}</p>
                  <div className="about-entry-main grid gap-4 sm:grid-cols-[4.25rem_minmax(0,1fr)] sm:items-start">
                    <LogoBadge logo={item.logo} />
                    <div className="about-entry-copy">
                      <h3 className="about-entry-title text-lg font-semibold">{item.role}</h3>
                      <p className="about-entry-organisation mt-1 text-sm font-medium text-moss">
                        {item.organisationWordmarkSrc ? (
                          <OrganisationWordmark alt={item.organisation} fallback={item.organisation} src={item.organisationWordmarkSrc} />
                        ) : (
                          item.organisation
                        )}
                      </p>
                      <p className="about-entry-description mt-4 max-w-2xl text-sm leading-7 text-ink/60">{item.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            </section>
          </div>

          <aside className="about-aside space-y-12">
            <section className="about-section about-section--awards scroll-mt-24" id="about-awards">
              <h2 className="about-section-heading eyebrow">Awards</h2>
              <ul className="about-aside-list mt-5 space-y-3 text-sm leading-6 text-ink/60">
                <li>RSC UK Chemistry Olympiad - Gold Award, 2024</li>
                <li>Cambridge Chemistry Challenge - Gold Award, 2023</li>
                <li>BPhO Senior Physics Challenge - Gold Award, 2023</li>
                <li>Young Enterprise Kent Finals - Best Company</li>
              </ul>
            </section>

            <section className="about-section about-section--beyond scroll-mt-24" id="about-beyond">
              <h2 className="about-section-heading eyebrow">Beyond the lab</h2>
              <p className="about-aside-copy mt-5 text-sm leading-6 text-ink/60">ChemE Car, chamber singing, a cappella, glee club, violin and cooking. Grade 8 in singing and violin, and a PADI Advanced Open Water Diver.</p>
            </section>

            <section className="about-section about-section--languages scroll-mt-24" id="about-languages">
              <h2 className="about-section-heading eyebrow">Languages</h2>
              <p className="about-aside-copy mt-5 text-sm leading-6 text-ink/60">English, Cantonese and Mandarin (native); French (elementary).</p>
            </section>

            <section className="about-section about-section--skills scroll-mt-24" id="about-skills">
              <h2 className="about-section-heading eyebrow">Technical skills</h2>
              <p className="about-aside-copy mt-5 text-sm leading-6 text-ink/60">Python, process modelling, NMR, IR, mass spectrometry; basic DWSIM.</p>
            </section>
          </aside>
        </div>

        <section className="about-featured-work about-section about-section--projects mt-20 scroll-mt-24 border-t border-ink/10 pt-12" aria-labelledby="projects-publications-title" id="about-projects">
          <div className="about-featured-heading flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2 className="section-title mt-3" id="projects-publications-title">Projects &amp; publications</h2>
            </div>
            <Link className="text-sm font-semibold text-moss hover:text-ink" href="/projects">View all projects →</Link>
          </div>
          <div className="about-featured-grid mt-7 grid gap-3 sm:grid-cols-2">
            {featuredWork.map((item) => (
              <Link className="about-featured-card design-card group rounded-3xl border border-ink/10 bg-surface/45 p-6" href={`${item.href}?from=about`} key={item.href}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">{item.type}</p>
                <h3 className="mt-3 text-lg font-semibold group-hover:text-moss">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/60">{item.summary}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="about-contact-cta mt-20 border-t border-ink/10 pt-12" aria-labelledby="cv-contact-title">
          <div className="design-panel flex flex-col gap-6 rounded-[2rem] border border-ink/10 bg-surface/45 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="eyebrow">Contact</p>
              <h2 className="section-title mt-3" id="cv-contact-title">Want to get in touch?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">
                Visit the contact page to send me a message, find my links, or see where I am.
              </p>
            </div>
            <Link className="shrink-0 self-start rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-moss sm:self-auto" href="/contact">
              Go to contact →
            </Link>
          </div>
        </section>
      </section>
    </div>
  );
}
