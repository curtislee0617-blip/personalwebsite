import type { Metadata } from "next";
import Link from "next/link";
import { ModernistCuisineBrowser } from "@/components/modernist-cuisine-browser";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Modernist Cuisine — Kitchen Manual" };

export default function ModernistCuisinePage() {
  return (
    <>
      <PageIntro
        eyebrow="Recipe book"
        title="Modernist Cuisine — Volume 6"
        description="The complete Kitchen Manual index, rebuilt from the supplied book page by page. Regular recipes are formatted into scalable ingredients and methods; charts, oven programs and unusual layouts retain a faithful image of the original page."
      />

      <section className="page-section pt-10 sm:pt-14">
        <Link className="back-link-bubble mb-6" href="/recipes#recipe-books">← Back to recipe books</Link>
        <ModernistCuisineBrowser />
      </section>
    </>
  );
}
