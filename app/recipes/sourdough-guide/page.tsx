import type { Metadata } from "next";
import { HistoryBackButton } from "@/components/history-back-button";
import { PageIntro } from "@/components/page-intro";
import { SectionRail } from "@/components/section-rail";
import { SourdoughGuide } from "@/components/sourdough-guide";
import { getImportedCookbook } from "@/lib/imported-cookbooks";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";

export const metadata: Metadata = { title: "Sourdough guide" };
export const dynamic = "force-dynamic";

const sourdoughSections = [
  { id: "sourdough-calculator", label: "Calculator" },
  { id: "sourdough-timeline", label: "Timeline" },
  { id: "sourdough-gallery", label: "Gallery" },
  { id: "sourdough-notes", label: "My ingredient notes" },
  { id: "sourdough-food-science", label: "Food science" },
] as const;

export default async function SourdoughGuidePage() {
  const isAdmin = await isRecipeAdminAuthenticated();
  const openCrumbCookbook = isAdmin
    ? await getImportedCookbook("secrets-of-open-crumb")
    : null;
  const visibleSections = isAdmin
    ? [...sourdoughSections, { id: "sourdough-open-crumb-recipes", label: "Bread Stalker recipes" }]
    : sourdoughSections;

  return (
    <div className="guide-page">
      <PageIntro
        eyebrow="Guide"
        title="Sourdough guide"
        description="A practical guide for making and adjusting sourdough: how to read the dough formula, scale the loaf, change hydration, plan the timing, follow the folds and proofing stages, and bake with clearer cues instead of relying only on a fixed recipe. A deeper review of the science of sourdough is included below."
      />
      <SectionRail ariaLabel="Sourdough guide sections" sections={visibleSections} />

      <section className="page-section pt-12 sm:pt-16">
        <HistoryBackButton className="mb-6" fallbackHref="/recipes">← Back to recipes</HistoryBackButton>
        <SourdoughGuide isAdmin={isAdmin} openCrumbCookbook={openCrumbCookbook} />
      </section>
    </div>
  );
}
