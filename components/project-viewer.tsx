/* eslint-disable @next/next/no-img-element */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ProjectViewerProps =
  | {
      mode: "poster";
      title: string;
      pages: string[];
      pdfHref: string;
    }
  | {
      mode: "book";
      title: string;
      pages: string[];
      pdfHref: string;
    };

export function ProjectViewer(props: ProjectViewerProps) {
  if (props.mode === "poster") {
    return <PosterViewer pages={props.pages} pdfHref={props.pdfHref} title={props.title} />;
  }

  return <BookViewer pages={props.pages} pdfHref={props.pdfHref} title={props.title} />;
}

function PosterViewer({ pages, pdfHref, title }: { pages: string[]; pdfHref: string; title: string }) {
  const [zoom, setZoom] = useState(1);
  const page = pages[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Poster viewer</p>
          <h1 className="mt-2 text-lg font-semibold sm:text-2xl">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/45 hover:bg-white/10"
            download
            href={pdfHref}
          >
            Download PDF
          </a>
          <button
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/45 hover:bg-white/10"
            onClick={() => setZoom((current) => Math.max(0.7, Number((current - 0.15).toFixed(2))))}
            type="button"
          >
            Zoom out
          </button>
          <button
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/45 hover:bg-white/10"
            onClick={() => setZoom(1)}
            type="button"
          >
            Reset
          </button>
          <button
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/45 hover:bg-white/10"
            onClick={() => setZoom((current) => Math.min(3, Number((current + 0.2).toFixed(2))))}
            type="button"
          >
            Zoom in
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-6.5rem)] overflow-auto px-4 pb-10 sm:px-6">
        <div className="mx-auto flex h-full w-full items-center justify-center">
          <img
            alt={title}
            className="h-auto max-h-full w-auto max-w-full origin-center rounded-[1.25rem] object-contain shadow-[0_24px_80px_rgba(0,0,0,0.55)] transition-transform duration-200"
            src={page}
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
      </div>
    </div>
  );
}

function BookViewer({ pages, pdfHref, title }: { pages: string[]; pdfHref: string; title: string }) {
  const [isMobile, setIsMobile] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const gestureStartX = useRef<number | null>(null);
  const gestureDeltaX = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateViewport = () => {
      setIsMobile(mediaQuery.matches);
      setPageIndex((current) => {
        if (mediaQuery.matches) return current;
        return current % 2 === 0 ? current : Math.max(0, current - 1);
      });
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const step = isMobile ? 1 : 2;
  const spreadCount = Math.max(1, Math.ceil(pages.length / step));
  const activeSpread = Math.floor(pageIndex / step);
  const visiblePages = useMemo(() => (
    isMobile ? [pages[pageIndex]].filter(Boolean) : [pages[pageIndex], pages[pageIndex + 1]].filter(Boolean)
  ), [isMobile, pageIndex, pages]);

  const goPrevious = useCallback(() => {
    setPageIndex((current) => Math.max(0, current - step));
  }, [step]);

  const goNext = useCallback(() => {
    setPageIndex((current) => Math.min(Math.max(0, pages.length - step), current + step));
  }, [pages.length, step]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrevious]);

  const slider = (
    <div className="rounded-[1.5rem] border border-ink/10 bg-white/70 px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-4 text-[0.72rem] uppercase tracking-[0.18em] text-ink/45">
        <span>Flip through pages</span>
        <span>{activeSpread + 1} / {spreadCount}</span>
      </div>
      <input
        aria-label="Cookbook page slider"
        className="mt-3 block w-full accent-[#7a6a58]"
        max={spreadCount - 1}
        min={0}
        onChange={(event) => {
          const nextSpread = Number(event.currentTarget.value);
          setPageIndex(Math.min(Math.max(0, pages.length - step), nextSpread * step));
        }}
        step={1}
        type="range"
        value={activeSpread}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4efe6] text-ink">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Book viewer</p>
            <h1 className="mt-2 text-xl font-semibold sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm text-ink/55">
              {isMobile
                ? `Page ${pageIndex + 1} of ${pages.length}`
                : `Pages ${pageIndex + 1}${visiblePages[1] ? ` - ${pageIndex + visiblePages.length}` : ""} of ${pages.length}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              className="rounded-full border border-ink/15 bg-white/80 px-4 py-2 text-sm font-semibold transition hover:border-ink/30 hover:bg-white"
              download
              href={pdfHref}
            >
              Download PDF
            </a>
            <button
              className="rounded-full border border-ink/15 bg-white/80 px-4 py-2 text-sm font-semibold transition hover:border-ink/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={pageIndex === 0}
              onClick={goPrevious}
              type="button"
            >
              Previous
            </button>
            <button
              className="rounded-full border border-ink/15 bg-white/80 px-4 py-2 text-sm font-semibold transition hover:border-ink/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={pageIndex >= pages.length - step}
              onClick={goNext}
              type="button"
            >
              Next
            </button>
          </div>
        </div>

        {!isMobile && slider}

        <div
          className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}
          onPointerDown={(event) => {
            gestureStartX.current = event.clientX;
            gestureDeltaX.current = 0;
          }}
          onPointerMove={(event) => {
            if (gestureStartX.current === null) return;
            gestureDeltaX.current = event.clientX - gestureStartX.current;
          }}
          onPointerUp={() => {
            if (gestureDeltaX.current <= -45) goNext();
            if (gestureDeltaX.current >= 45) goPrevious();
            gestureStartX.current = null;
            gestureDeltaX.current = 0;
          }}
          onPointerCancel={() => {
            gestureStartX.current = null;
            gestureDeltaX.current = 0;
          }}
        >
          {visiblePages.map((page, index) => (
            <div
              className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white shadow-[0_20px_45px_rgba(32,35,31,0.08)] transition-all duration-300 ease-out"
              key={page}
            >
              <img
                alt={`${title} page ${pageIndex + index + 1}`}
                className="block h-auto w-full transition-transform duration-300 ease-out"
                loading={index === 0 ? "eager" : "lazy"}
                src={page}
              />
            </div>
          ))}
        </div>

        {isMobile && slider}
      </div>
    </div>
  );
}
