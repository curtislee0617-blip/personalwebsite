import type { Metadata } from "next";
import Link from "next/link";
import { ModernistPizzaGuide } from "@/components/modernist-pizza-guide";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Modernist Pizza" };

export default function ModernistPizzaPage() {
  return (
    <>
      <PageIntro
        eyebrow="Recipe book"
        title="Modernist Pizza"
        description="The complete Volume 4 kitchen-manual index, separated into recipes and a practical techniques-and-knowledge library. Search doughs, sauces, cheeses, toppings, iconic pizzas, baking methods, troubleshooting, storage, and reference tables from one page."
      />
      <section className="page-section pt-10 sm:pt-14">
        <Link className="back-link-bubble mb-6" href="/recipes#recipe-books">← Back to recipe books</Link>
        <ModernistPizzaGuide />
      </section>
    </>
  );
}
