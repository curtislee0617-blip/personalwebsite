import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Sushi guide" };

export default function SushiGuidePage() {
  return (
    <>
      <PageIntro
        eyebrow="Guide"
        title="Sushi guide"
        description="A working home for sushi ratios and notes: rice seasoning, fish preparation, zuke marinades, nigiri, and other sushi details as they are added."
      />

      <section className="page-section pt-12 sm:pt-16">
        <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-dashed border-ink/15 bg-surface/40 p-6 text-sm leading-7 text-ink/60 sm:p-8">
            <p>
              This guide is being built around the sushi ratios I use most often. The current notes include a sushi rice seasoning mixture and an Akami zuke brine.
            </p>
            <Link className="back-link-bubble mt-6" href="/recipes">← Back to recipes</Link>
          </div>

          <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 text-sm leading-7 text-ink/60 sm:p-8">
            <p className="eyebrow">Current notes</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Rice and zuke</h2>
            <p className="mt-5">
              The first section keeps the base sushi vinegar ratio separate from the Akami zuke brine, so more fish and rice notes can be added cleanly later.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
            <p className="eyebrow">Sushi rice</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Sushi rice mixture</h2>
            <p className="mt-3 text-sm leading-7 text-ink/60">A simple sushi vinegar ratio for seasoning rice.</p>
            <ul className="mt-6 grid gap-2 text-sm leading-6 text-ink/65">
              {[
                "Salt - 50g",
                "Sugar - 90g",
                "Vinegar - 260g",
              ].map((item) => (
                <li className="flex gap-2" key={item}>
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
            <p className="eyebrow">Akami brine</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Zuke</h2>
            <p className="mt-3 text-sm leading-7 text-ink/60">Equal parts soy, nikiri mirin, and nikiri sake for Akami zuke.</p>
            <ul className="mt-6 grid gap-2 text-sm leading-6 text-ink/65">
              {[
                "Koikuchi soy sauce - 1 part",
                "Nikiri mirin - 1 part",
                "Nikiri sake - 1 part",
              ].map((item) => (
                <li className="flex gap-2" key={item}>
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </>
  );
}
