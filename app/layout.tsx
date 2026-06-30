import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "My personal website",
    template: "%s — My personal website",
  },
  description: "School, work and life.",
  openGraph: {
    title: "My personal website",
    description: "School, work and life.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-ink/10">
            <div className="page-shell flex flex-col gap-4 py-8 text-sm text-ink/55 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} Curtis Lee.</p>
              <div className="flex gap-5">
                <Link className="hover:text-ink" href="/contact">Say hello</Link>
                <a className="hover:text-ink" href="#top">Back to top ↑</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
