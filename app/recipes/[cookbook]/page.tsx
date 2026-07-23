import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ImportedCookbookGuide } from "@/components/imported-cookbook-guide";
import { getImportedCookbook, importedCookbooks } from "@/lib/imported-cookbooks";
import { PageIntro } from "@/components/page-intro";

export function generateStaticParams() {
  return importedCookbooks.map((book) => ({ cookbook: book.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ cookbook: string }> }): Promise<Metadata> {
  const { cookbook: id } = await params;
  const book = await getImportedCookbook(id);
  return { title: book ? `${book.title} by ${book.author}` : "Recipe book" };
}

export default async function ImportedCookbookPage({ params }: { params: Promise<{ cookbook: string }> }) {
  const { cookbook: id } = await params;
  const book = await getImportedCookbook(id);
  if (!book) notFound();

  return (
    <>
      <PageIntro eyebrow="Recipe book" title={book.title} description={`${book.author} · ${book.recipeCountLabel}`} />
      <section className="page-section pt-8 sm:pt-10">
        <Link className="back-link-bubble mb-6" href="/recipes#recipe-books">← Back to recipe books</Link>
        <ImportedCookbookGuide cookbook={book} />
      </section>
    </>
  );
}
