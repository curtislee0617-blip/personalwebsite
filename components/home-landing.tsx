"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ContactCityArtwork } from "@/components/contact-city-artwork";
import { ContactPresenceProvider } from "@/components/contact-presence";
import { dashboardSections } from "@/components/dashboard-shell";
import { ScrollingPhotoBackground } from "@/components/scrolling-photo-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { navIconForPath } from "@/lib/page-cursors";
import { runRouteBubbleTransition } from "@/lib/route-bubble-transition";

const quickAccessGroups = [
  { label: "Personal", sections: [dashboardSections[3], dashboardSections[4], dashboardSections[2]] },
  { label: "Professional", sections: [dashboardSections[0], dashboardSections[1], dashboardSections[5]] },
] as const;

export function HomeLanding({ photos }: { photos: string[] }) {
  const router = useRouter();
  const isLeaving = useRef(false);
  const [entryMode, setEntryMode] = useState<"pending" | "center">("pending");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.sessionStorage.removeItem("home-entry");
      setEntryMode("center");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function leaveHome(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    if (isLeaving.current) return;
    isLeaving.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }

    const selectedLink = event.currentTarget;
    const links = Array.from(document.querySelectorAll<HTMLElement>(".home-dashboard-button"))
      .filter((link) => link.offsetParent !== null);
    const photoGrid = document.querySelector<HTMLElement>(".home-photo-grid");
    const themeToggle = document.querySelector<HTMLElement>(".theme-toggle");

    await runRouteBubbleTransition({
      href,
      router,
      source: selectedLink,
      fadeOut: [
        ...links.filter((link) => link !== selectedLink),
        photoGrid,
        themeToggle,
      ],
    });
  }

  return (
    <section id="top" className={`home-landing home-entry-${entryMode}`}>
      <ScrollingPhotoBackground photos={photos} />

      <div className="home-dashboard-panel">
        <div className="home-dashboard-heading">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Quick access</h1>
          </div>
          <div className="home-dashboard-pixel-art">
            <ContactPresenceProvider readOnly>
              <ContactCityArtwork className="home-dashboard-pixel-artwork" />
            </ContactPresenceProvider>
          </div>
        </div>
        <nav aria-label="Dashboard quick access" className="home-dashboard-groups">
          {quickAccessGroups.map((group) => (
            <div className="home-dashboard-group" key={group.label}>
              <h2>{group.label}</h2>
              <div className="home-dashboard-grid">
                {group.sections.map((section) => {
                  const icon = navIconForPath(section.href);
                  return (
                    <Link
                      className="home-dashboard-button"
                      data-spotlight
                      href={section.href}
                      key={section.href}
                      onClick={(event) => leaveHome(event, section.href)}
                    >
                      <span className="home-dashboard-icon">
                        {icon && <img alt="" aria-hidden="true" src={icon} />}
                      </span>
                      <span>
                        <strong>{section.label}</strong>
                        <small>{section.subtitle}</small>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <ThemeToggle />
    </section>
  );
}
