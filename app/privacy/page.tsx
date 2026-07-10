import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Privacy policy for the course planner and saved course schedules.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageIntro
        eyebrow="Privacy"
        title="Privacy policy"
        description="This site only asks for course-planner information so your schedule can be saved and reopened later."
      />

      <div className="page-shell pb-4 pt-5 sm:pt-6">
        <Link className="back-link-bubble" href="/tools/course-planner">← Back to course planner</Link>
      </div>

      <section className="page-shell pb-16 sm:pb-20">
        <div className="max-w-3xl space-y-6 rounded-[1.5rem] border border-ink/10 bg-surface/55 p-6 text-sm leading-7 text-ink/65 sm:p-8">
          <section>
            <h2 className="text-base font-semibold text-ink">Course Planner Data</h2>
            <p className="mt-2">
              The course planner may store your first name, last name, small profile password, selected majors/minors/tracks, and the course schedule you create.
              This information is used only to reopen your course-planning profile and keep your schedule available across devices.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">How It Is Used</h2>
            <p className="mt-2">
              Your name and course schedule will not be used for anything outside this course scheduling tool. They are not used for advertising, analytics profiling,
              public display, or unrelated contact.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">Password Note</h2>
            <p className="mt-2">
              The small password is only there to separate profiles that may have the same name. Do not use an important password from another account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">Local Use</h2>
            <p className="mt-2">
              You can use the planner without signing in. In that case, your plan is stored locally in your browser and is not saved to the cloud profile system.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
