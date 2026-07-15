import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModernistPizzaSourceViewer } from "@/components/modernist-pizza-source-viewer";

export const metadata: Metadata = {
  title: "Modernist Pizza source viewer",
  description: "Full-size source-page viewer for Modernist Pizza recipes and reference material.",
};

type ModernistPizzaViewerPageProps = {
  searchParams: Promise<{
    from?: string;
    pages?: string;
    title?: string;
  }>;
};

function parsePages(value: string | undefined) {
  if (!value) return [];
  return [...new Set(value.split(",").map(Number).filter((page) => Number.isInteger(page) && page >= 4 && page <= 385))].slice(0, 24);
}

export default async function ModernistPizzaViewerPage({ searchParams }: ModernistPizzaViewerPageProps) {
  const { from, pages: pageList, title } = await searchParams;
  const pages = parsePages(pageList);

  if (pages.length === 0) notFound();

  const backHref = from?.startsWith("/recipes/modernist-pizza") ? from : "/recipes/modernist-pizza";
  const viewerTitle = title?.trim().slice(0, 180) || "Modernist Pizza source pages";

  return <ModernistPizzaSourceViewer backHref={backHref} pages={pages} title={viewerTitle} />;
}
