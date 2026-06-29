import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About" title="A generalist with a fondness for thoughtful details." description="I’m Curtis—a placeholder human for now—interested in how design, technology, food, and culture shape everyday life." />
      <section className="page-section grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <div className="aspect-[4/5] rounded-[2rem] bg-mist p-6">
          <div className="flex h-full items-end rounded-[1.4rem] border border-ink/10 p-6">
            <p className="max-w-xs font-serif text-2xl italic text-ink/60">Portrait placeholder — somewhere between a coffee and the next idea.</p>
          </div>
        </div>
        <div className="space-y-8 text-base leading-8 text-ink/65 sm:text-lg">
          <p className="font-serif text-3xl leading-tight text-ink sm:text-4xl">I like making complicated things feel clear, useful, and a little more human.</p>
          <p>This is placeholder copy for a longer personal introduction. Use it to share your background, what drives your work, and the experiences that have shaped your point of view.</p>
          <p>Outside of work, you’ll usually find me trying a new recipe, saving too many restaurant recommendations, or tinkering with a tool that promises to make life one percent smoother.</p>
          <div className="grid gap-4 border-t border-ink/10 pt-8 sm:grid-cols-2">
            <div><p className="eyebrow">Interested in</p><p className="mt-3 text-ink">Design, systems, hospitality</p></div>
            <div><p className="eyebrow">Elsewhere</p><p className="mt-3 text-ink">Hong Kong & beyond</p></div>
          </div>
        </div>
      </section>
    </>
  );
}
