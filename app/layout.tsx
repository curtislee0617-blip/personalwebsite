import type { Metadata } from "next";
import Script from "next/script";
import { SiteChrome } from "@/components/site-chrome";
import { PageCursor } from "@/components/page-cursor";
import { ScrollPositionRestorer } from "@/components/scroll-position-restorer";
import { SiteInteractions } from "@/components/site-interactions";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/700.css";
import "./globals.css";

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(dark)document.documentElement.classList.add("dark");}catch(e){}})();`;
const DASHBOARD_INIT_SCRIPT = `(function(){try{var w=parseInt(localStorage.getItem("dashboard-sidebar-width")||"",10);if(Number.isFinite(w))document.documentElement.style.setProperty("--dashboard-sidebar-width",Math.min(420,Math.max(220,w))+"px");if(window.matchMedia("(min-width:1200px) and (hover:hover) and (pointer:fine)").matches){document.documentElement.classList.add("dashboard-mode");if(location.pathname==="/")document.documentElement.classList.add("dashboard-home-route");}}catch(e){}})();`;
const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Curtis Lee",
  title: {
    default: "My personal website",
    template: "%s — My personal website",
  },
  description: "School, work and life.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Curtis Lee",
  },
  openGraph: {
    title: "My personal website",
    description: "School, work and life.",
    type: "website",
    url: "/",
    images: [{ url: "/og-dashboard-v2.png", width: 1200, height: 630, alt: "Curtis Lee's six-button dashboard with Personal and Professional sections." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "My personal website",
    description: "School, work and life.",
    images: ["/og-dashboard-v2.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">{THEME_INIT_SCRIPT}</Script>
        <Script id="dashboard-init" strategy="beforeInteractive">{DASHBOARD_INIT_SCRIPT}</Script>
        <ScrollPositionRestorer />
        <SiteInteractions />
        <PageCursor />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
