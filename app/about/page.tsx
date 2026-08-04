import type { Metadata } from "next";
import type { CSSProperties } from "react";
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
  /** Optional project page produced during this role. */
  projectHref?: string;
  projectLabel?: string;
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
    dates: "Summer 2026",
    role: "Process Engineering Intern",
    organisation: "The Hong Kong and China Gas Company (Towngas) - Green Fuels & Chemicals",
    detail: "Authored a ten-section screening/pre-FEED design converting bauxite residue and soybean-processing waste into light olefins through supercritical water gasification, bi-reforming and OXZEO synthesis. I closed mass and carbon balances to 100% on a 300 t/d train and sized a five-train, 19.3 kt/y complex; built its 20-year techno-economic model (RMB 1.9 billion capital and RMB 160 million/year operating cost), which identified waste gate fees as the decisive commercial lever after commodity olefin value produced no positive IRR; and designed heat integration recovering 637 GJ/d per train, cutting net purchased energy to 207 GJ/d. I also specified a Rectisol wash for 0.1 ppm sulfur and supported engineering work on a new US$30 million green-fuels plant in Foshan, using the operating Jungar Banner green-methanol plant as a reference case.",
    logo: { src: "/logos/towngas.png", alt: "Towngas logo", fallback: "TG", fitClassName: "h-11 w-[3.25rem]", alignClassName: "object-center", frameClassName: "bg-white" },
    projectHref: "/projects/supercritical-water-gasification",
    projectLabel: "Read the Towngas SCWG-OXZEO case study",
  },
  {
    dates: "September 2024 - Present",
    role: "Teaching Assistant",
    organisation: "Caltech",
    detail: "Teach Caltech students through practical cooking and food-science demonstrations in Tom Mannion's cooking class.",
    logo: { src: "/logos/caltechname.png", alt: "Caltech logo", fallback: "CIT", fitClassName: "h-9 w-12", frameClassName: "bg-white/90", imageClassName: "mix-blend-normal" },
  },
  {
    dates: "July 2025 - August 2025",
    role: "Cultivated Meat Research Intern",
    organisation: "UC Davis Robert Mondavi Institute, iCAMP (Alternative Meat & Protein)",
    detail: "Screened fetal-bovine-serum-free growth media to reduce the cost and animal dependence of cultivated-meat culture. I also built and tested 32 scaffold combinations, using Texture Profile Analysis to judge how closely each reproduced real meat texture.",
    logo: { src: "/logos/ucdaviswhite.png", alt: "UC Davis logo", fallback: "UCD", fitClassName: "h-11 w-11", alignClassName: "object-[center_58%]", frameClassName: "bg-white" },
  },
  {
    dates: "March 2024 - April 2024",
    role: "Research Intern",
    organisation: "NUS Institute for Functional Intelligent Materials (I-FIM)",
    detail: "Invited by Professor Konstantin Novoselov (2010 Nobel Laureate in Physics) to work under Dr Maxim Rybin. I grew graphene by Chemical Vapour Deposition, tuned the growth conditions and characterized the resulting films.",
    logo: { src: "/logos/nus.png", alt: "National University of Singapore logo", fallback: "NUS", fitClassName: "h-10 w-12", alignClassName: "object-center", frameClassName: "bg-white" },
  },
  {
    dates: "September 2023 - March 2024",
    role: "Student Tutor",
    organisation: "The King's School, Canterbury",
    detail: "Helping younger students in school with iGCSE sciences and maths.",
    logo: { src: "/logos/kings-school.png", alt: "The King's School Canterbury logo", fallback: "KSC", fitClassName: "h-9 w-11", frameClassName: "bg-white" },
  },
  {
    dates: "November 2022 - April 2023",
    role: "General Manager",
    organisation: "cook.enterprise",
    detail: "Managed and led a team of 17 students competing in the Young Enterprise UK competition, winning the Kent Finals Best Company award. We created a student-centric cookbook inspired by works such as Modernist Cuisine, researching novel ways to prepare food quickly and microwave-cooking techniques suited to a busy student, earning £5,850 in revenue.",
    logo: { src: "/logos/cook.png", alt: "cook.enterprise logo", fallback: "COOK", fitClassName: "h-10 w-10", frameClassName: "bg-white" },
    projectHref: "/projects/cook-enterprise",
    projectLabel: "Open the cook.enterprise cookbook",
  },
  {
    dates: "July 2021 - Present",
    role: "Stage and Cook",
    organisation: "Michelin-starred restaurants",
    detail: "Ran full service in high-pressure, zero-error kitchens across over a dozen Michelin-starred restaurants and chefs holding over 42 Michelin stars combined, including The Fat Duck, Ecriture, The Clove Club, Core by Clare Smyth, Sushiyoshi, Muse by Tom Aikens, and Frog by Adam Handling.",
    logo: { src: "/logos/michelin.png", alt: "Michelin logo", fallback: "42★", fitClassName: "h-9 w-9", frameClassName: "bg-white" },
  },
];

const education: EducationItem[] = [
  {
    dates: "2024 - 2028",
    school: "California Institute of Technology",
    detail: "B.S., dual major in Chemical Engineering (process track) and Business Economics & Management (BEM). GPA: 3.8 / 4.0. Relevant coursework includes Econometrics (EC 122) and Hedge Funds (BEM 114). Current and past campus activities include Caltech Chamber Singers, chamber music, Glee Club, and Out of Context a cappella.",
    logo: { src: "/logos/caltechname.png", alt: "Caltech logo", fallback: "CIT", fitClassName: "h-9 w-12", frameClassName: "bg-white/90", imageClassName: "mix-blend-normal" },
  },
  {
    dates: "2019 - 2024",
    school: "The King's School, Canterbury",
    detail: "A-Levels in Mathematics, Further Mathematics, Physics and Chemistry. Served as a School Monitor and Admissions Ambassador, received the Science Communication Award, composed for and conducted a 50-person choir, and was deputy concertmaster of the orchestra.",
    logo: { src: "/logos/kings-school.png", alt: "The King's School Canterbury logo", fallback: "KSC", fitClassName: "h-9 w-11", frameClassName: "bg-white" },
  },
];

const featuredWork = [
  {
    href: "/projects/supercritical-water-gasification",
    type: "Process engineering",
    title: "Towngas SCWG-OXZEO waste-to-olefins study",
    summary: "A ten-section screening/pre-FEED design with closed mass, carbon and energy balances, five-train scale-up and China-specific techno-economics.",
  },
  {
    href: "/projects/biodiesel-from-used-cooking-oil",
    type: "Chemical Engineering",
    title: "Biodiesel from used cooking oil",
    summary: "Tested ethanol as a substitute for methanol across acid- and base-catalysed biodiesel routes using waste cooking oil, reaching more than 75% conversion.",
  },
  {
    href: "/projects/bem-114-report",
    type: "Finance & NLP",
    title: "Earnings Call NLP-Based Long-Short Strategy",
    summary: "A market-neutral FinBERT strategy using earnings-call sentiment, with near-zero beta and a statistically significant 1.18% monthly alpha in the study period.",
  },
  {
    href: "/projects/cook-enterprise",
    type: "Young Enterprise",
    title: "cook.enterprise",
    summary: "A student-focused cookbook and the Kent Finals Best Company winner.",
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <PageIntro
        eyebrow="CV"
        title="Engineering, commercial thinking, and hands-on leadership."
        description={
          <>
            I am pursuing a dual B.S. major in Chemical Engineering (process track) and BEM (Business Economics & Management) at{" "}
            <OrganisationWordmark alt="Caltech" fallback="Caltech" src="/logos/caltechname-cropped.png" />.
            {" "}I am also a Michelin-trained cook, having trained under chefs and at restaurants with a combined 42 Michelin stars. Across engineering, research, teaching, and entrepreneurship, I enjoy turning ambiguous problems into evidence-backed decisions and helping teams deliver them.
          </>
        }
        actions={
          <div className="about-resume-actions flex flex-wrap gap-3">
            <a className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-moss" download href="/downloads/curtis-lee-resume.pdf">
              Download résumé ↓
            </a>
            <a className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold transition hover:border-ink hover:bg-surface" href="https://www.linkedin.com/in/curtislee0617" rel="noreferrer" target="_blank">
              LinkedIn ↗
            </a>
          </div>
        }
      />

      <AboutSectionRail />

      <section className="about-page__content page-section pt-10 sm:pt-12 lg:pt-14">
        <div className="about-main-grid mt-12 grid gap-14 lg:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)] lg:gap-20">
          <div className="about-primary">
            <section className="about-section about-section--education scroll-mt-24" id="about-education">
            <h2 className="about-section-heading section-title">Education</h2>
            <div className="about-list mt-7 divide-y divide-ink/10 border-y border-ink/10">
              {education.map((item, index) => (
                <article className="about-entry grid gap-4 py-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8" data-reveal key={item.school} style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}>
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
              {experience.map((item, index) => (
                <article className="about-entry grid gap-4 py-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8" data-reveal key={`${item.role}-${item.organisation}`} style={{ "--reveal-delay": `${Math.min(index, 4) * 60}ms` } as CSSProperties}>
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
                      {item.projectHref ? (
                        <Link
                          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-moss transition hover:text-ink"
                          href={`${item.projectHref}?from=about`}
                        >
                          {item.projectLabel ?? "View the project"} <span aria-hidden="true">→</span>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            </section>
          </div>

          <aside className="about-aside space-y-12">
            <section className="about-section about-section--awards scroll-mt-24" data-reveal id="about-awards">
              <h2 className="about-section-heading eyebrow">Awards</h2>
              <ul className="about-aside-list mt-5 space-y-3 text-sm leading-6 text-ink/60">
                <li>RSC UK Chemistry Olympiad - Gold Award, 2024</li>
                <li>Cambridge Chemistry Challenge - Gold Award, 2023</li>
                <li>BPhO Senior Physics Challenge - Gold Award, 2023</li>
                <li>The King&apos;s School, Canterbury - Science Communication Award</li>
                <li>Young Enterprise Kent Finals - Best Company</li>
              </ul>
            </section>

            <section className="about-section about-section--leadership scroll-mt-24" data-reveal style={{ "--reveal-delay": "80ms" } as CSSProperties}>
              <h2 className="about-section-heading eyebrow">Leadership experience</h2>
              <ul className="about-aside-list mt-5 space-y-4 text-sm leading-6 text-ink/60">
                <li><strong className="font-semibold text-ink">Built and led a 17-person venture</strong> to a Kent-wide Best Company award and £5,850 in revenue.</li>
                <li><strong className="font-semibold text-ink">Teach and mentor students</strong> through practical science, mathematics, and cooking.</li>
                <li><strong className="font-semibold text-ink">Held school-wide and musical leadership roles at The King&apos;s School, Canterbury</strong>, serving as a School Monitor, Admissions Ambassador, and deputy concertmaster, and composing for and conducting a 50-person choir.</li>
                <li><strong className="font-semibold text-ink">Adapt across technical and operational teams</strong>, from multidisciplinary engineering work to Michelin-starred kitchen service.</li>
              </ul>
            </section>

            <section className="about-section about-section--beyond scroll-mt-24" data-reveal id="about-beyond" style={{ "--reveal-delay": "160ms" } as CSSProperties}>
              <h2 className="about-section-heading eyebrow">Beyond the lab</h2>
              <p className="about-aside-copy mt-5 text-sm leading-6 text-ink/60">ChemE Car, chamber singing, a cappella, glee club, violin and cooking. Grade 8 in singing and violin, and a PADI Advanced Open Water Diver.</p>
            </section>

            <section className="about-section about-section--languages scroll-mt-24" data-reveal id="about-languages" style={{ "--reveal-delay": "240ms" } as CSSProperties}>
              <h2 className="about-section-heading eyebrow">Languages</h2>
              <p className="about-aside-copy mt-5 text-sm leading-6 text-ink/60">English, Cantonese and Mandarin (native); French (elementary).</p>
            </section>

            <section className="about-section about-section--skills scroll-mt-24" data-reveal id="about-skills" style={{ "--reveal-delay": "320ms" } as CSSProperties}>
              <h2 className="about-section-heading eyebrow">Consulting &amp; technical skills</h2>
              <dl className="about-aside-copy mt-5 space-y-4 text-sm leading-6 text-ink/60">
                <div>
                  <dt className="font-semibold text-ink">Leadership &amp; delivery</dt>
                  <dd>Team leadership, mentoring, project ownership and cross-functional collaboration.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">Strategy &amp; analysis</dt>
                  <dd>Structured problem-solving, commercial analysis, econometrics, financial and techno-economic modelling.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">Engineering &amp; data</dt>
                  <dd>Python, process modelling, DWSIM and experimental design.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">Laboratory</dt>
                  <dd>NMR, IR and mass spectrometry.</dd>
                </div>
              </dl>
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
            {featuredWork.map((item, index) => (
              <Link className="about-featured-card design-card group rounded-3xl border border-ink/10 bg-surface/45 p-6" data-reveal data-spotlight href={`${item.href}?from=about`} key={item.href} style={{ "--reveal-delay": `${index * 80}ms` } as CSSProperties}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">{item.type}</p>
                <h3 className="mt-3 text-lg font-semibold group-hover:text-moss">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/60">{item.summary}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="about-contact-cta mt-20 border-t border-ink/10 pt-12" aria-labelledby="cv-contact-title">
          <div className="design-panel flex flex-col gap-6 rounded-[2rem] border border-ink/10 bg-surface/45 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8" data-reveal data-spotlight>
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
