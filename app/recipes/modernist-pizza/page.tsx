import type { Metadata } from "next";
import { HistoryBackButton } from "@/components/history-back-button";
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
        <HistoryBackButton className="mb-6" fallbackHref="/recipes#recipe-books">← Back to recipe books</HistoryBackButton>
        <ModernistPizzaGuide />
      </section>
    </>
  );
}
