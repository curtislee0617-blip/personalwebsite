import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { CaltechCoursePlanner } from "@/components/caltech-course-planner";

export const metadata: Metadata = {
  title: "Course planner",
  description: "Plan Caltech Chemical Engineering (process track) and BEM requirements across a four-year, three-term grid.",
};

export default function CoursePlannerPage() {
  return (
    <>
      <PageIntro
        eyebrow="Planning tool"
        title="Course planner"
        description="Every Chemical Engineering (process track) and BEM option requirement, plus the shared institute core, as draggable tags. Drop each onto a term, check it off once it's done, and rename the generic tags (like “Humanities elective” or “PE”) to the exact class you took."
      />
      <div className="page-shell pb-4 pt-5 sm:pt-6"><Link className="text-xs font-semibold text-ink/55 transition hover:text-ink" href="/tools">← Back to tools</Link></div>
      <div className="page-shell pb-16 sm:pb-20">
        <CaltechCoursePlanner />
        <p className="mt-10 text-xs leading-5 text-ink/40">
          Requirements are transcribed from the Caltech Academic Catalog (Chemical Engineering option, BEM option, and core institute requirements) and may drift from the current catalog year — always confirm against your degree audit. Saved locally in your browser only.
        </p>
      </div>
    </>
  );
}
