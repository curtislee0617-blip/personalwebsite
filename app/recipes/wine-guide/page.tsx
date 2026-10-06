import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "./wine-guide.css";
import "./wine-encyclopedia.css";
import { HistoryBackButton } from "@/components/history-back-button";
import { PageIntro } from "@/components/page-intro";
import { WineGuide } from "@/components/wine-guide";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";

export const metadata: Metadata = {
  title: "The world of wine",
  description:
    "A comprehensive guide to wine chemistry, viticulture, world regions, grape varieties, winemaking, sparkling wine and fortified wine.",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function WineGuidePage() {
  if (!(await isRecipeAdminAuthenticated())) notFound();

  return (
    <div className="guide-page wine-guide-page">
      <PageIntro
        eyebrow="Wine encyclopedia"
        title="The world of wine"
        description="An illustrated reference to grape varieties, wine regions, viticulture, winemaking and tasting. Explore the atlas, look up a variety or browse by topic."
      />

      <section className="page-section pt-10 sm:pt-12">
        <HistoryBackButton className="mb-6" fallbackHref="/recipes">← Back to recipes</HistoryBackButton>
        <WineGuide />
      </section>
    </div>
  );
}
