import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Contact" };

const contactLinks = [
  {
    eyebrow: "School",
    title: "Caltech email",
    detail: "For university, research, and academic conversations.",
    label: "hcclee@caltech.edu",
    href: "mailto:hcclee@caltech.edu",
    external: false,
    icon: "caltech",
  },
  {
    eyebrow: "Work",
    title: "Personal email",
    detail: "For professional opportunities, collaborations, and everything else.",
    label: "curtislee0000@gmail.com",
    href: "mailto:curtislee0000@gmail.com",
    external: false,
    icon: "email",
  },
  {
    eyebrow: "Social",
    title: "Instagram",
    detail: "Food, travel, kitchens, and other bits of life.",
    label: "@curtislee0617",
    href: "https://www.instagram.com/curtislee0617/",
    external: true,
    icon: "instagram",
  },
  {
    eyebrow: "Professional",
    title: "LinkedIn",
    detail: "Research, education, experience, and professional updates.",
    label: "curtislee0617",
    href: "https://www.linkedin.com/in/curtislee0617",
    external: true,
    icon: "linkedin",
  },
] as const;

function ContactIcon({ icon }: { icon: (typeof contactLinks)[number]["icon"] }) {
  if (icon === "caltech") {
    return (
      <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border border-ink/10 bg-white" aria-hidden="true">
        <Image alt="" className="h-full w-full scale-[1.38] object-cover object-center" height={56} src="/logos/caltech.webp" width={56} />
      </span>
    );
  }

  if (icon === "instagram") {
    return (
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white" aria-hidden="true">
        <svg className="size-7" fill="none" viewBox="0 0 24 24">
          <rect height="17" rx="5" stroke="currentColor" strokeWidth="1.8" width="17" x="3.5" y="3.5" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.5" cy="6.7" fill="currentColor" r="1" />
        </svg>
      </span>
    );
  }

  if (icon === "linkedin") {
    return (
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#0a66c2] text-white" aria-hidden="true">
        <svg className="size-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.3 8.1H2.7V21h3.6V8.1ZM4.5 2.7a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2ZM21.3 13.6c0-3.9-2.1-5.8-4.9-5.8-2.3 0-3.3 1.3-3.9 2.1V8.1H8.9V21h3.6v-6.4c0-1.7.3-3.4 2.5-3.4 2.1 0 2.2 2 2.2 3.5V21h3.6l.5-7.4Z" />
        </svg>
      </span>
    );
  }

  return (
    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-ink text-paper" aria-hidden="true">
      <svg className="size-7" fill="none" viewBox="0 0 24 24">
        <rect height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" width="19" x="2.5" y="4.5" />
        <path d="m4 7 8 6 8-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    </span>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="Let&apos;s keep in touch."
      />

      <section className="page-section pt-12 sm:pt-16">
        <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-ink/10 pb-8 text-sm text-ink/60">
          <span className="grid size-9 place-items-center rounded-full bg-mist" aria-hidden="true">⌖</span>
          <p>Primarily located in <strong className="font-semibold text-ink">Los Angeles, London, and Hong Kong</strong>.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {contactLinks.map((contact) => (
            <a
              className="group flex min-h-56 flex-col justify-between rounded-[1.75rem] border border-ink/10 bg-white/45 p-6 transition duration-300 hover:-translate-y-1 hover:border-ink/25 hover:bg-white hover:shadow-soft sm:p-8"
              href={contact.href}
              key={contact.title}
              rel={contact.external ? "noreferrer" : undefined}
              target={contact.external ? "_blank" : undefined}
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="eyebrow">{contact.eyebrow}</p>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight">{contact.title}</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-ink/55">{contact.detail}</p>
                </div>
                <ContactIcon icon={contact.icon} />
              </div>
              <p className="mt-8 break-all text-sm font-semibold text-moss group-hover:text-ink sm:text-base">{contact.label} ↗</p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
