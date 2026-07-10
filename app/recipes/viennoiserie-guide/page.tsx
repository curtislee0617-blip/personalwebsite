import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { RecipeCard } from "@/components/recipe-card";
import { recipesForGuide } from "@/lib/recipes";

export const metadata: Metadata = { title: "Viennoiserie guide" };

export default function ViennoiserieGuidePage() {
  const relatedRecipes = recipesForGuide("viennoiserie-guide");

  return (
    <>
      <PageIntro
        eyebrow="Guide"
        title="Viennoiserie guide"
        description="A working home for laminated dough notes, shaping references, fillings, proofing cues, bake timings, and photos once they are uploaded."
      />

      <section className="page-section pt-12 sm:pt-16">
        <div className="rounded-[2rem] border border-dashed border-ink/15 bg-surface/40 p-6 text-sm leading-7 text-ink/60 sm:p-8">
          <p>
            This guide is being built. Images and notes can be uploaded through the recipe media/import workflow, then I will fold them into a full viennoiserie reference.
          </p>
          <Link className="back-link-bubble mt-6" href="/recipes">← Back to recipes</Link>
        </div>

        {relatedRecipes.length > 0 && (
          <section className="mt-12">
            <div>
              <p className="eyebrow">Related recipes</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Recipes in this guide</h2>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedRecipes.map((entry) => <RecipeCard entry={entry} key={entry.slug} showBackLink />)}
            </div>
          </section>
        )}
      </section>
    </>
  );
}
