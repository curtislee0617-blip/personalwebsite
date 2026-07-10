import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Pasta guide" };

export default function PastaGuidePage() {
  return (
    <>
      <PageIntro
        eyebrow="Guide"
        title="Pasta guide"
        description="A working home for fresh pasta notes: dough formulas, egg ratios, flour blends, resting, rolling, cutting, shaping, filling, cooking, and photos once they are uploaded."
      />

      <section className="page-section pt-12 sm:pt-16">
        <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-dashed border-ink/15 bg-surface/40 p-6 text-sm leading-7 text-ink/60 sm:p-8">
            <p>
              This guide is being built. The first formula is the basic egg pasta dough, and future notes can expand into rolling thicknesses, cuts, filled shapes, storage, and cooking times.
            </p>
            <Link className="back-link-bubble mt-6" href="/recipes">← Back to recipes</Link>
          </div>

          <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 text-sm leading-7 text-ink/60 sm:p-8">
            <p className="eyebrow">Basic dough</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Egg pasta dough</h2>
            <p className="mt-5">
              This is the base dough I like using for fresh egg pasta. The tuorli weight is the total egg and yolk amount, about 21 egg yolks and 1 whole egg.
            </p>
          </div>
        </div>

        <section className="mt-12 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Formula</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Egg pasta dough</h2>
            <p className="mt-3 text-sm leading-7 text-ink/60">
              A simple egg pasta dough built around equal weights of farina and semola, with egg yolks and whole egg measured together as tuorli.
            </p>
          </div>

          <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Ingredients</h3>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-ink/65">
                {[
                  "Egg yolks - 21",
                  "Whole egg - 1",
                  "Farina - 270g",
                  "Semola - 270g",
                  "Tuorli - 420g",
                ].map((item) => (
                  <li className="flex gap-2" key={item}>
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 border-t border-ink/10 pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Note</h3>
              <p className="mt-3 text-sm leading-7 text-ink/65">
                Tuorli is the amount of egg and egg yolk together, equating to about 21 egg yolks and 1 whole egg.
              </p>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}
