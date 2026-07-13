import type { Metadata } from "next";
import Image from "next/image";
import { ContactCityTimeRow } from "@/components/contact-city-clocks";
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

function PixelPassengerPlane({ className }: { className: string }) {
  return (
    <svg className={`contact-london-plane ${className}`} shapeRendering="crispEdges" viewBox="0 0 64 32">
      <path className="contact-plane-tail" d="M7 19V4h6v5h4v5h4v5Z" />
      <path className="contact-plane-tail-highlight" d="M10 6h3v5h4v5h3v3h-4v-3h-3v-5h-3Z" />
      <path className="contact-plane-wing-shadow" d="M20 21h30l7 5H39l-7 4H21l3-4H16Z" />
      <path className="contact-plane-wing" d="M22 20h28l5 4H38l-7 4H21l3-4H18Z" />
      <path className="contact-plane-engine" d="M25 24h11v6H25Zm20 0h10v6H45Z" />
      <path className="contact-plane-engine-highlight" d="M25 24h8v2h-8Zm20 0h7v2h-7Z" />
      <path className="contact-plane-engine-intake" d="M33 25h3v5h-3Zm19 0h3v5h-3Z" />
      <path className="contact-plane-outline" d="M6 16h44v1h6v2h4v2h3v4h-3v2H16l-5-3H6Z" />
      <path className="contact-plane-fuselage" d="M8 17h42v1h6v2h4v2h2v2h-3v1H16l-4-3H8Z" />
      <path className="contact-plane-belly" d="M6 22h56v3h-3v2H16l-5-3H6Z" />
      <path className="contact-plane-stripe" d="M9 21h50v2H9Z" />
      <path className="contact-plane-door" d="M14 18h3v5h-3Zm34 0h3v5h-3Z" />
      <path className="contact-plane-windows" d="M20 19h2v2h-2Zm5 0h2v2h-2Zm5 0h2v2h-2Zm5 0h2v2h-2Zm5 0h2v2h-2Zm5 0h2v2h-2Z" />
      <path className="contact-plane-cockpit" d="M53 19h3v2h-3Zm4 1h2v2h-2Z" />
      <rect className="contact-plane-nav-light contact-plane-nav-light-red" height="2" width="2" x="18" y="26" />
      <rect className="contact-plane-nav-light contact-plane-nav-light-green" height="2" width="2" x="55" y="24" />
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
          <div className="contact-cities-copy">
            <div>
              <p className="eyebrow">Across three cities</p>
              <h2>Hong Kong, London &amp; Los Angeles</h2>
              <p>I split my time between dense harbours, rainy streets, and sunny hills — and I am happy to connect wherever I happen to be.</p>
            </div>
            <div className="contact-city-chips" aria-label="Cities where Curtis is primarily located">
              <span><i aria-hidden="true">⛵</i> Hong Kong</span>
              <span><i aria-hidden="true">☂</i> London</span>
              <span><i aria-hidden="true">☀</i> Los Angeles</span>
            </div>
          </div>
          <div className="contact-cities-art">
            <div className="contact-cities-picture">
              <span className="contact-city-glow-field" aria-hidden="true" />
              <div className="contact-cities-scene-frame">
                <div className="contact-cities-scene">
                <Image
                  alt="Daytime pixel art of Hong Kong harbour, Big Ben and Westminster in London, and the Hollywood hills in Los Angeles"
                  className="contact-cities-art-image contact-cities-art-light"
                  fill
                  priority
                  sizes="(max-width: 639px) 21rem, (max-width: 899px) 30rem, 40rem"
                  src="/contact-cities-pixel-art-day-from-night-v1.png"
                />
                <Image
                  alt="Nighttime pixel art of Hong Kong harbour, Big Ben and Westminster in London, and the Hollywood hills in Los Angeles"
                  className="contact-cities-art-image contact-cities-art-dark"
                  fill
                  priority
                  sizes="(max-width: 639px) 21rem, (max-width: 899px) 30rem, 40rem"
                  src="/contact-cities-pixel-art-night-v2.png"
                />
                <span className="contact-london-balance-fill contact-london-balance-fill-light" aria-hidden="true" />
                <span className="contact-london-balance-fill contact-london-balance-fill-dark" aria-hidden="true" />
                <span className="contact-london-balanced contact-london-balanced-light" aria-hidden="true" />
                <span className="contact-london-balanced contact-london-balanced-dark" aria-hidden="true" />
                <span className="contact-hong-kong-night-lift" aria-hidden="true" />
                <span className="contact-harbour-clear contact-harbour-clear-light" aria-hidden="true" />
                <span className="contact-harbour-clear contact-harbour-clear-dark" aria-hidden="true" />
                <span className="contact-harbour-boat contact-harbour-boat-light" aria-hidden="true" />
                <span className="contact-harbour-boat contact-harbour-boat-dark" aria-hidden="true" />
                <div className="contact-london-planes" aria-hidden="true">
                  <PixelPassengerPlane className="contact-london-plane-one" />
                  <PixelPassengerPlane className="contact-london-plane-two" />
                </div>
                <div className="contact-hollywood-spotlights" aria-hidden="true">
                  <span className="contact-hollywood-beam contact-hollywood-beam-left" />
                  <span className="contact-hollywood-beam contact-hollywood-beam-right" />
                  <span className="contact-hollywood-beam contact-hollywood-beam-center" />
                  <span className="contact-hollywood-glow" />
                </div>
                  <ContactCityTimeRow />
                </div>
              </div>
            </div>
          </div>
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
