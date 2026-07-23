import type { Metadata } from "next";
import { HistoryBackButton } from "@/components/history-back-button";
import { PageIntro } from "@/components/page-intro";
import { VleSimulator } from "@/components/vle-simulator";

export const metadata: Metadata = {
  title: "VLE simulator",
  description: "Generate binary T-x-y and P-x-y diagrams with activity-coefficient and cubic equation-of-state models.",
};

export default function VlePage() {
  return (
    <>
      <PageIntro eyebrow="Engineering tool" title="VLE simulator" description="Explore binary vapour–liquid equilibrium with ideal, activity-coefficient, and Peng–Robinson models." />
      <div className="page-shell pb-4 pt-5 sm:pt-6"><HistoryBackButton fallbackHref="/tools">← Back to tools</HistoryBackButton></div>
      <div className="page-shell pb-16 sm:pb-20"><VleSimulator /></div>
    </>
  );
}
