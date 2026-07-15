"use client";

export function CookbookSearch({ bookName, onChange, value, scope = "Basics and recipes" }: { bookName: string; onChange: (value: string) => void; value: string; scope?: string }) {
  const label = `Search ${bookName} ${scope}`;
  return (
    <label className="relative block w-full">
      <span className="sr-only">{label}</span>
      <input
        aria-label={label}
        className="h-11 w-full rounded-full border border-ink/12 bg-surface/65 px-4 pr-10 text-sm outline-none transition placeholder:text-ink/35 focus:border-ink/30"
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={label}
        type="search"
        value={value}
      />
      <span aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink/35">⌕</span>
    </label>
  );
}
