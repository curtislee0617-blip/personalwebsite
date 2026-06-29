import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Curtis Lee — Notes, work & good things",
    template: "%s — Curtis Lee",
  },
  description:
    "A personal corner of the internet for work, food, useful tools, and things worth sharing.",
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
              <p>© {new Date().getFullYear()} Curtis Lee. Made with care.</p>
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
