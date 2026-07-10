import type { Metadata } from "next";
import Link from "next/link";
import { CompoundPropertiesCalculator } from "@/components/compound-properties-calculator";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Compound properties",
  description: "Search Koretsky physical-property data and calculate continuous Lee–Kesler fluid properties.",
};

export default function CompoundPropertiesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Engineering tool"
        title="Compound properties"
        description="Search by name or formula, then calculate vapour pressure and Lee–Kesler real-fluid properties at a chosen temperature and pressure."
      />
      <div className="page-shell pb-4 pt-5 sm:pt-6"><Link className="back-link-bubble" href="/tools">← Back to tools</Link></div>
      <div className="page-shell pb-16 sm:pb-20"><CompoundPropertiesCalculator /></div>
    </>
  );
}
