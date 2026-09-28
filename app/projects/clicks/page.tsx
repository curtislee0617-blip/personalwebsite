import type { Metadata } from "next";
import { ButtonIdeas } from "@/components/button-ideas";
import { HistoryBackButton } from "@/components/history-back-button";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Clicks",
  description: "One hundred interactive button directions for future interfaces on this website.",
};

export default function ClicksPage() {
  return (
    <>
      <PageIntro eyebrow="Creative projects · UI/UX brainstorming" title="Clicks" />
      <div className="page-shell pb-4 pt-5 sm:pt-6">
        <HistoryBackButton fallbackHref="/projects#creative-projects-title">← Back to creative projects</HistoryBackButton>
      </div>
      <div className="clicks-page page-shell pb-16 sm:pb-20">
        <ButtonIdeas />
      </div>
    </>
  );
}
