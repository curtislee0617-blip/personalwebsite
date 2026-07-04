"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";

// OS file pickers don't reliably preserve "the order you clicked them in", so this keeps its
// own ordered list and mirrors it onto a hidden <input type="file"> (via DataTransfer) right
// before the surrounding <form> submits — that hidden input is what the server action reads.
export function RecipePhotoPicker({ name }: { name: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const pickerInputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = hiddenInputRef.current?.form;
    if (!form) return;
    const syncHiddenInput = () => {
      const hidden = hiddenInputRef.current;
      if (!hidden) return;
      const dataTransfer = new DataTransfer();
      for (const file of files) dataTransfer.items.add(file);
      hidden.files = dataTransfer.files;
    };
    form.addEventListener("submit", syncHiddenInput);
    return () => form.removeEventListener("submit", syncHiddenInput);
  }, [files]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
    if (pickerInputRef.current) pickerInputRef.current.value = "";
  }

  function removeAt(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    setFiles((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div>
      <input accept="image/*" className="hidden" multiple onChange={(event) => addFiles(event.target.files)} ref={pickerInputRef} type="file" />
      <input className="hidden" multiple name={name} ref={hiddenInputRef} type="file" />
      <button className="rounded-full border border-ink/20 bg-white px-4 py-2 text-xs font-semibold transition hover:border-ink" onClick={() => pickerInputRef.current?.click()} type="button">
        + Add photos
      </button>

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {files.map((file, index) => (
            <div className="relative w-28 rounded-xl border border-ink/10 bg-white p-1.5" key={`${file.name}-${file.size}-${index}`}>
              <img alt="" className="h-24 w-full rounded-lg object-cover" src={URL.createObjectURL(file)} />
              {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[0.6rem] font-semibold text-paper">Thumbnail</span>}
              <div className="mt-1.5 flex items-center justify-between gap-1">
                <button className="px-1 text-xs text-ink/40 hover:text-ink disabled:opacity-20" disabled={index === 0} onClick={() => move(index, -1)} title="Move earlier" type="button">←</button>
                <button className="px-1 text-xs text-ink/40 hover:text-clay" onClick={() => removeAt(index)} title="Remove" type="button">✕</button>
                <button className="px-1 text-xs text-ink/40 hover:text-ink disabled:opacity-20" disabled={index === files.length - 1} onClick={() => move(index, 1)} title="Move later" type="button">→</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
