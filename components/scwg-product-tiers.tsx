"use client";

import { useMemo, useState } from "react";
import type { ProductItem } from "@/lib/scwg-types";
import { scwgProductGroups } from "@/lib/scwg-products";

// Act 4 — product slate. Client component only for the expand/collapse and the
// sortable Tier 3 table. All prose comes from lib/scwg-products.ts.

function SortableTable({ table }: { table: NonNullable<ProductItem["table"]> }) {
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null);

  const rows = useMemo(() => {
    if (!sort) return table.rows;
    return [...table.rows].sort((a, b) => a[sort.col].localeCompare(b[sort.col]) * sort.dir);
  }, [sort, table.rows]);

  const toggle = (col: number) =>
    setSort((current) => (current?.col === col ? { col, dir: (current.dir * -1) as 1 | -1 } : { col, dir: 1 }));

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
            {table.columns.map((column, index) => (
              <th className="py-1.5 pr-3 font-semibold" key={column}>
                <button
                  className="inline-flex items-center gap-1 hover:text-ink/70 focus-visible:text-ink/70"
                  onClick={() => toggle(index)}
                  type="button"
                >
                  {column}
                  <span aria-hidden="true" className="text-[0.9em]">
                    {sort?.col === index ? (sort.dir === 1 ? "▲" : "▼") : "↕"}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-ink/8 align-top" key={row.join("|")}>
              {row.map((cell, index) => (
                <td className={`py-2 pr-3 ${index === 0 ? "font-mono font-semibold tabular-nums text-ink/80" : "text-ink/60"}`} key={index}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductCard({ item }: { item: ProductItem }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="flex flex-col rounded-[2rem] border border-ink/10 bg-surface/55 p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight">
          {item.tier ? <span className="mr-2 font-mono text-sm text-moss">T{item.tier}</span> : null}
          {item.name}
        </h3>
      </div>
      <p className="mt-2 text-sm leading-7 text-ink/65">{item.summary}</p>

      <button
        aria-expanded={open}
        className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-ink/15 bg-paper/80 px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink/25 hover:bg-surface"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? "Show less" : "Details"}
        <span aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="mt-4 space-y-3 text-sm leading-7 text-ink/65">
          {item.detail.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          {item.table ? <SortableTable table={item.table} /> : null}
          {item.callout ? (
            <div className="rounded-[1.25rem] border-l-2 border-clay bg-clay/8 px-4 py-3">
              <p className="text-sm font-semibold text-ink/80">{item.callout.title}</p>
              <p className="mt-1 text-sm leading-6 text-ink/70">{item.callout.body}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function ScwgProductTiers() {
  return (
    <div className="space-y-10">
      {scwgProductGroups.map((group) => (
        <div key={group.id}>
          <h3 className="section-title text-2xl sm:text-3xl">{group.title}</h3>
          {group.intro ? <p className="mt-2 max-w-prose text-sm leading-7 text-ink/60">{group.intro}</p> : null}
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <ProductCard item={item} key={item.name} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
