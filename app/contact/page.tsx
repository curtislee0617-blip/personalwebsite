import type { Metadata } from "next";
import Image from "next/image";
import { ContactCityArtwork } from "@/components/contact-city-artwork";
import {
  ContactPresenceControls,
  ContactPresenceProvider,
} from "@/components/contact-presence";
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
        <Image alt="" className="h-full w-full scale-[1.04] object-contain object-center p-[0.18rem]" height={56} src="/logos/caltechname.png" width={56} />
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

function CityChipIcon({ city }: { city: "hongKong" | "london" | "losAngeles" }) {
  if (city === "losAngeles") {
    return (
      <svg className="contact-city-chip-icon contact-city-chip-icon-sun" fill="none" viewBox="0 0 20 20">
        <g stroke="#f4bd2e" strokeLinecap="square" strokeWidth="1.7">
          <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.6 3.6 5 5M15 15l1.4 1.4M16.4 3.6 15 5M5 15l-1.4 1.4" />
        </g>
        <circle cx="10" cy="10" fill="#ffd243" r="4.6" stroke="#e6a91f" strokeWidth="1" />
      </svg>
    );
  }

  if (city === "london") {
    return (
      <svg className="contact-city-chip-icon contact-city-chip-icon-umbrella" fill="none" viewBox="0 0 24 20">
        <path d="M3 9.2C3.7 4.9 7.2 2 12 2s8.3 2.9 9 7.2c-1.4-1.1-3.1-1.1-4.5 0-1.4-1.1-3.1-1.1-4.5 0-1.4-1.1-3.1-1.1-4.5 0-1.4-1.1-3.1-1.1-4.5 0Z" fill="#161616" />
        <path d="M12 8.5v6.2c0 2.1 3.1 2.1 3.1 0" stroke="#161616" strokeLinecap="round" strokeWidth="1.7" />
        <path d="m4.8 12.1-.9 1.5h1.8l-.9-1.5Zm15-1.3-.9 1.5h1.8l-.9-1.5Zm-1.6 4.1-1 1.7h2l-1-1.7Z" fill="#3d9de8" />
      </svg>
    );
  }

  return (
    <svg className="contact-city-chip-icon contact-city-chip-icon-junk" shapeRendering="crispEdges" viewBox="0 0 28 20">
      <path d="M13 1h2v14h-2z" fill="#4c2d16" />
      <path d="M12 3h-2v2H8v2H6v3H4v3h8z" fill="#d72927" />
      <path d="M16 2h2v2h2v2h2v2h2v5h-8z" fill="#e43b32" />
      <path d="M8 11h12v4H8z" fill="#f3b842" />
      <path d="M4 13h21v2h-2v2H8v-1H6v-1H4z" fill="#5a3219" />
      <path d="M8 15h15v2H8z" fill="#2f1b10" />
      <path d="M2 18h24v1H2z" fill="#45a9d8" />
      <path d="M1 19h8v1H1zm14 0h12v1H15z" fill="#8ed3ec" />
    </svg>
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
        <div className="contact-cities design-panel mb-8 overflow-hidden rounded-[1.75rem] border border-ink/10 bg-surface/55">
          <ContactPresenceProvider>
            <div className="contact-cities-copy">
              <ContactPresenceControls />
              <div>
                <p className="eyebrow">Across three cities</p>
                <h2>Los Angeles, London &amp; Hong Kong</h2>
                <p>I split my time between sunny hills, rainy streets, and dense harbours — and I am happy to connect wherever I happen to be.</p>
              </div>
              <div className="contact-city-chips" aria-label="Cities where Curtis is primarily located">
                <span><i aria-hidden="true"><CityChipIcon city="losAngeles" /></i> Los Angeles</span>
                <span><i aria-hidden="true"><CityChipIcon city="london" /></i> London</span>
                <span><i aria-hidden="true"><CityChipIcon city="hongKong" /></i> Hong Kong</span>
              </div>
            </div>
            <ContactCityArtwork editable />
          </ContactPresenceProvider>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {contactLinks.map((contact) => (
            <a
              className="design-card group flex min-h-56 flex-col justify-between rounded-[1.75rem] border border-ink/10 bg-surface/45 p-6 sm:p-8"
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
