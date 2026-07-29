"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { BackToTopButton } from "@/components/back-to-top-button";
import { FooterAdminLogin } from "@/components/footer-admin-login";
import { FooterFeedbackLink } from "@/components/footer-feedback-link";

// Routes that render standalone — no dashboard sidebar, no site header, no footer.
// These are immersive project pages that own the full viewport; each provides its
// own way back (a HistoryBackButton falling back to /projects).
const STANDALONE_ROUTES = ["/projects/supercritical-water-gasification"];

export function isStandaloneRoute(pathname: string | null) {
  return Boolean(pathname && STANDALONE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`)));
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isStandaloneRoute(pathname)) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <DashboardShell>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-ink/10">
          <div className="page-shell flex flex-col gap-4 py-8 text-sm text-ink/55 sm:flex-row sm:items-center sm:justify-between">
            <FooterAdminLogin />
            <nav aria-label="Footer" className="flex items-center gap-5">
              <Link className="footer-link" href="/contact">Say hello</Link>
              <FooterFeedbackLink />
              <BackToTopButton />
            </nav>
          </div>
        </footer>
      </div>
    </DashboardShell>
  );
}
