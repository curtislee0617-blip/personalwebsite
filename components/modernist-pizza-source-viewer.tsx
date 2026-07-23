"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Zoom = "fit" | 1.25 | 1.5;

type ModernistPizzaSourceViewerProps = {
  backHref: string;
  pages: number[];
  title: string;
};

const PAGE_WIDTH = 1085;
const PAGE_HEIGHT = 1474;

export function ModernistPizzaSourceViewer({ backHref, pages, title }: ModernistPizzaSourceViewerProps) {
  const [zoom, setZoom] = useState<Zoom>("fit");

  return (
    <div className="min-h-screen bg-[rgb(16_18_20)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgb(16_18_20/0.92)] py-3 pl-3 pr-16 backdrop-blur-xl sm:pl-5 sm:pr-20">
        <div className="mx-auto flex max-w-[110rem] flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link className="inline-flex shrink-0 items-center rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.12]" href={backHref}>
              ← Back to recipe
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold sm:text-base">{title}</p>
              <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.12em] text-white/45">Modernist Pizza · {pages.length} source {pages.length === 1 ? "page" : "pages"}</p>
            </div>
          </div>
          <div aria-label="Page zoom" className="flex items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1">
            {(["fit", 1.25, 1.5] as Zoom[]).map((option) => (
              <button
                aria-pressed={zoom === option}
                className={`rounded-full px-3 py-1.5 text-[0.68rem] font-semibold transition ${zoom === option ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
                key={option}
                onClick={() => setZoom(option)}
                type="button"
              >
                {option === "fit" ? "Fit" : `${Math.round(option * 100)}%`}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[110rem] gap-8 px-2 py-5 sm:px-5 sm:py-8">
        {pages.map((page, index) => {
          const source = `/modernist-pizza/pages/page-${String(page).padStart(3, "0")}.webp`;
          const width = zoom === "fit" ? PAGE_WIDTH : Math.round(PAGE_WIDTH * zoom);

          return (
            <section className="scroll-mt-24" id={`page-${page}`} key={page}>
              <div className="mb-2 flex items-center justify-between px-1 text-xs text-white/50">
                <span>PDF page {page}</span>
                <span>{index + 1} / {pages.length}</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/35 p-1.5 shadow-2xl sm:rounded-2xl sm:p-3">
                <Image
                  alt={`${title}, exact source PDF page ${page}`}
                  className="mx-auto h-auto rounded-lg bg-white shadow-[0_20px_65px_rgba(0,0,0,0.45)]"
                  height={PAGE_HEIGHT}
                  priority={index === 0}
                  sizes={zoom === "fit" ? "(max-width: 1120px) 96vw, 1085px" : `${width}px`}
                  src={source}
                  style={{ maxWidth: zoom === "fit" ? "100%" : "none", width }}
                  unoptimized
                  width={PAGE_WIDTH}
                />
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
