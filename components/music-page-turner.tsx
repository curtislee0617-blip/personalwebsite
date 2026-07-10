"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

type ScoreFile = {
  name: string;
  type: "image" | "pdf";
  url: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function MusicPageTurner() {
  const [scoreFiles, setScoreFiles] = useState<ScoreFile[]>([]);
  const [pdfPageCount, setPdfPageCount] = useState(1);
  const [bpm, setBpm] = useState(92);
  const [defaultBeats, setDefaultBeats] = useState(32);
  const [pageBeats, setPageBeats] = useState<number[]>([32]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pageStartedAt, setPageStartedAt] = useState<number | null>(null);
  const [elapsedOnPage, setElapsedOnPage] = useState(0);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const previousUrlsRef = useRef<string[]>([]);

  const isPdf = scoreFiles.length === 1 && scoreFiles[0]?.type === "pdf";
  const pageCount = isPdf ? pdfPageCount : Math.max(scoreFiles.length, 1);

  const pageDurations = useMemo(
    () => Array.from({ length: pageCount }, (_, index) => ((pageBeats[index] ?? defaultBeats) / bpm) * 60),
    [bpm, defaultBeats, pageBeats, pageCount],
  );
  const currentDuration = pageDurations[currentPage] ?? ((defaultBeats / bpm) * 60);
  const totalDuration = pageDurations.reduce((sum, duration) => sum + duration, 0);
  const progress = currentDuration > 0 ? clamp(elapsedOnPage / currentDuration, 0, 1) : 0;

  useEffect(() => {
    return () => {
      previousUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || pageStartedAt === null) return;

    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - pageStartedAt) / 1000;
      setElapsedOnPage(elapsed);

      if (elapsed >= currentDuration) {
        setCurrentPage((page) => {
          const next = page + 1;
          if (next >= pageCount) {
            setIsPlaying(false);
            setPageStartedAt(null);
            return page;
          }
          setElapsedOnPage(0);
          setPageStartedAt(performance.now());
          return next;
        });
      }
    }, 120);

    return () => window.clearInterval(timer);
  }, [currentDuration, isPlaying, pageCount, pageStartedAt]);

  function loadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    previousUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));

    const nextFiles = files
      .filter((file) => file.type.startsWith("image/") || file.type === "application/pdf")
      .map((file): ScoreFile => ({
        name: file.name,
        type: file.type === "application/pdf" ? "pdf" : "image",
        url: URL.createObjectURL(file),
      }));

    previousUrlsRef.current = nextFiles.map((file) => file.url);
    setScoreFiles(nextFiles);
    setPdfPageCount(1);
    setPageBeats([defaultBeats]);
    setCurrentPage(0);
    setIsPlaying(false);
    setElapsedOnPage(0);
    setPageStartedAt(null);
    event.target.value = "";
  }

  function setPageBeat(index: number, value: number) {
    setPageBeats((previous) => {
      const next = [...previous];
      next[index] = clamp(value, 1, 512);
      return next;
    });
  }

  function start() {
    if (scoreFiles.length === 0) return;
    setIsPlaying(true);
    setElapsedOnPage(0);
    setPageStartedAt(performance.now());
  }

  function pause() {
    setIsPlaying(false);
    setPageStartedAt(null);
  }

  function goToPage(page: number) {
    const nextStartedAt = isPlaying ? window.performance.now() : null;
    setCurrentPage(clamp(page, 0, pageCount - 1));
    setElapsedOnPage(0);
    if (isPlaying) setPageStartedAt(nextStartedAt);
  }

  function updatePdfPageCount(value: number) {
    const nextPageCount = clamp(value, 1, 200);
    setPdfPageCount(nextPageCount);
    setCurrentPage((page) => clamp(page, 0, nextPageCount - 1));
  }

  function tapTempo() {
    const now = performance.now();
    const recent = [...tapTimes.filter((time) => now - time < 5000), now].slice(-6);
    setTapTimes(recent);
    if (recent.length >= 2) {
      const gaps = recent.slice(1).map((time, index) => time - recent[index]);
      const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
      setBpm(clamp(Math.round(60000 / averageGap), 30, 260));
    }
  }

  const displayedPdfUrl = isPdf && scoreFiles[0] ? `${scoreFiles[0].url}#page=${currentPage + 1}&view=FitH` : "";
  const displayedImage = !isPdf ? scoreFiles[currentPage] : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <aside className="space-y-4">
        <section className="rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5">
          <p className="eyebrow">Sheet music</p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">Upload score</h2>
          <p className="mt-2 text-sm leading-6 text-ink/55">Use image pages for the smoothest flipping. PDFs use the browser viewer, so page jumps depend on browser support.</p>
          <label className="mt-5 flex cursor-pointer items-center justify-center rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-moss">
            Choose files
            <input accept="application/pdf,image/*" className="hidden" multiple onChange={loadFiles} type="file" />
          </label>
          {scoreFiles.length > 0 && <p className="mt-3 text-xs leading-5 text-ink/45">{isPdf ? scoreFiles[0].name : `${scoreFiles.length} image page${scoreFiles.length === 1 ? "" : "s"} loaded`}</p>}
        </section>

        <section className="rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5">
          <p className="eyebrow">Tempo</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">{bpm}</h2>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">BPM</p>
            </div>
            <button className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold text-ink/60 transition hover:border-ink/35 hover:text-ink" onClick={tapTempo} type="button">
              Tap tempo
            </button>
          </div>
          <input className="mt-5 w-full accent-moss" max={220} min={40} onChange={(event) => setBpm(Number(event.target.value))} step={1} type="range" value={bpm} />
          <input className="mt-3 w-full rounded-2xl border border-ink/15 bg-paper/80 px-4 py-2 text-sm" max={260} min={30} onChange={(event) => setBpm(clamp(Number(event.target.value), 30, 260))} type="number" value={bpm} />
        </section>

        <section className="rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5">
          <p className="eyebrow">Flip timing</p>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/45" htmlFor="default-beats">Default beats per page</label>
          <input
            className="mt-2 w-full rounded-2xl border border-ink/15 bg-paper/80 px-4 py-2 text-sm"
            id="default-beats"
            min={1}
            onChange={(event) => setDefaultBeats(clamp(Number(event.target.value), 1, 512))}
            type="number"
            value={defaultBeats}
          />
          {isPdf && (
            <>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/45" htmlFor="pdf-pages">PDF pages</label>
              <input
                className="mt-2 w-full rounded-2xl border border-ink/15 bg-paper/80 px-4 py-2 text-sm"
                id="pdf-pages"
                min={1}
                onChange={(event) => updatePdfPageCount(Number(event.target.value))}
                type="number"
                value={pdfPageCount}
              />
            </>
          )}
          <p className="mt-4 text-xs leading-5 text-ink/45">Estimated total: {formatTime(totalDuration)}. Adjust individual page counts below if a page has more or fewer bars.</p>
        </section>

        <section className="rounded-[1.5rem] border border-ink/10 bg-surface/55 p-5">
          <p className="eyebrow">Pages</p>
          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                className={`grid w-full grid-cols-[1fr_5rem] items-center gap-3 rounded-2xl border px-3 py-2 text-left text-sm transition ${index === currentPage ? "border-moss bg-lime/35 text-ink" : "border-ink/10 bg-paper/55 text-ink/60 hover:border-ink/25"}`}
                key={index}
                onClick={() => goToPage(index)}
                type="button"
              >
                <span className="font-semibold">Page {index + 1}</span>
                <input
                  aria-label={`Beats on page ${index + 1}`}
                  className="w-full rounded-xl border border-ink/10 bg-surface px-2 py-1 text-right text-xs"
                  min={1}
                  onChange={(event) => setPageBeat(index, Number(event.target.value))}
                  onClick={(event) => event.stopPropagation()}
                  type="number"
                  value={pageBeats[index] ?? defaultBeats}
                />
              </button>
            ))}
          </div>
        </section>
      </aside>

      <section className="min-w-0 rounded-[1.75rem] border border-ink/10 bg-surface/55 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
          <div>
            <p className="eyebrow">Page {currentPage + 1} of {pageCount}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{scoreFiles.length > 0 ? (isPdf ? scoreFiles[0].name : displayedImage?.name) : "No score loaded"}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-ink/15 px-3 py-2 text-xs font-semibold text-ink/60 transition hover:border-ink/35 hover:text-ink" disabled={currentPage === 0} onClick={() => goToPage(currentPage - 1)} type="button">
              Previous
            </button>
            {isPlaying ? (
              <button className="rounded-full bg-clay px-4 py-2 text-xs font-semibold text-paper transition hover:bg-ink" onClick={pause} type="button">Pause</button>
            ) : (
              <button className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition hover:bg-moss disabled:opacity-40" disabled={scoreFiles.length === 0} onClick={start} type="button">Start</button>
            )}
            <button className="rounded-full border border-ink/15 px-3 py-2 text-xs font-semibold text-ink/60 transition hover:border-ink/35 hover:text-ink" disabled={currentPage >= pageCount - 1} onClick={() => goToPage(currentPage + 1)} type="button">
              Next
            </button>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-moss transition-[width]" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs font-semibold uppercase tracking-[0.12em] text-ink/40">
          <span>{formatTime(elapsedOnPage)}</span>
          <span>{formatTime(currentDuration)}</span>
        </div>

        <div className="mt-5 grid min-h-[32rem] place-items-center overflow-hidden rounded-[1.25rem] border border-ink/10 bg-paper/70">
          {displayedImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={`Uploaded sheet music page ${currentPage + 1}`} className="max-h-[72vh] w-full object-contain" src={displayedImage.url} />
          ) : isPdf ? (
            <iframe className="h-[72vh] w-full bg-white" key={displayedPdfUrl} src={displayedPdfUrl} title="Uploaded sheet music PDF" />
          ) : (
            <div className="px-6 text-center text-sm leading-7 text-ink/45">
              Upload image pages or a PDF score, set the BPM, then press Start. The tool will flip based on the beat counts you set for each page.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
