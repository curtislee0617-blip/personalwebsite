"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { parseTranscriptCourses, type TranscriptCourse, type TranscriptTextItem } from "@/lib/transcript-import";

type PdfTextItem = { str?: string; transform?: number[] };

export function TranscriptImporter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [courses, setCourses] = useState<TranscriptCourse[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "reading" | "error" | "ready" | "imported">("idle");
  const [message, setMessage] = useState("");

  const readTranscript = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("error");
      setMessage("Choose a PDF transcript.");
      return;
    }
    setStatus("reading");
    setMessage("");
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();
      const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const items: TranscriptTextItem[] = [];
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const text = await page.getTextContent();
        for (const item of text.items as PdfTextItem[]) {
          const value = item.str?.trim();
          const transform = item.transform;
          if (!value || !transform) continue;
          items.push({ text: value, x: transform[4] ?? 0, y: transform[5] ?? 0, page: pageNumber });
        }
      }
      const imported = parseTranscriptCourses(items);
      if (imported.length === 0) throw new Error("No course rows were found. Try an official or unofficial transcript PDF with selectable text.");
      setCourses(imported);
      setSelectedIds(imported.map((course) => course.id));
      setStatus("ready");
      setMessage(`${imported.length} course rows found. Review them, then add the checked courses.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The transcript could not be read.");
    } finally {
      event.target.value = "";
    }
  };

  const importCourses = () => {
    const selected = courses.filter((course) => selectedIds.includes(course.id));
    if (!selected.length) return;
    window.dispatchEvent(new CustomEvent("caltech-course-transcript-import", { detail: { courses: selected } }));
    setStatus("imported");
    setMessage(`${selected.length} course${selected.length === 1 ? "" : "s"} added as completed coursework.`);
  };

  return (
    <section className="transcript-importer" aria-labelledby="transcript-import-heading">
      <div>
        <p className="eyebrow">Transcript import</p>
        <h2 id="transcript-import-heading">Add courses from a transcript</h2>
        <p>Your PDF is read only in this browser. It is never uploaded; review the detected courses before saving them to the plan.</p>
      </div>
      <input accept="application/pdf,.pdf" className="sr-only" onChange={readTranscript} ref={inputRef} type="file" />
      <button className="transcript-import-button" onClick={() => inputRef.current?.click()} type="button">
        {status === "reading" ? "Reading transcript…" : "Upload transcript"}
      </button>
      {message && <p className={`transcript-import-message is-${status}`} role={status === "error" ? "alert" : "status"}>{message}</p>}
      {courses.length > 0 && status !== "imported" && (
        <div className="transcript-import-preview">
          <div className="transcript-import-preview-head">
            <span>{selectedIds.length} selected</span>
            <button onClick={() => setSelectedIds(selectedIds.length === courses.length ? [] : courses.map((course) => course.id))} type="button">{selectedIds.length === courses.length ? "Clear all" : "Select all"}</button>
          </div>
          <div className="transcript-import-course-list">
            {courses.map((course) => (
              <label key={course.id}>
                <input checked={selectedIds.includes(course.id)} onChange={() => setSelectedIds((current) => current.includes(course.id) ? current.filter((id) => id !== course.id) : [...current, course.id])} type="checkbox" />
                <span><strong>{course.code}</strong><small>{course.units || "Units not found"} units · {course.cell.replace("-", " · ")}</small></span>
              </label>
            ))}
          </div>
          <button className="transcript-import-confirm" disabled={!selectedIds.length} onClick={importCourses} type="button">Add selected courses to plan</button>
        </div>
      )}
    </section>
  );
}
