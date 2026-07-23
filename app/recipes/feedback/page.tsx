import type { Metadata } from "next";
import { HistoryBackButton } from "@/components/history-back-button";
import { WebsiteErrorFeedback } from "@/components/website-error-feedback";
import { WebsiteErrorFeedbackAdminList } from "@/components/website-error-feedback-admin-list";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Website error feedback", robots: { index: false, follow: false } };

export default async function WebsiteErrorFeedbackPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const returnTo = from?.startsWith("/") && !from.startsWith("//") ? from : "/";
  const authenticated = await isRecipeAdminAuthenticated();
  const feedbackResult = authenticated
    ? await (async () => {
        try {
          const supabase = createAdminClient();
          const { data, error } = await supabase
            .from("website_error_feedback")
            .select("id,page_url,message,submitter_name,created_at")
            .order("created_at", { ascending: false });
          if (error) throw error;
          return { feedback: data, unavailable: false };
        } catch (error) {
          console.error("Unable to load website error feedback for admin", error);
          return { feedback: [], unavailable: true };
        }
      })()
    : { feedback: [], unavailable: false };

  return (
    <div className="page-shell py-16 sm:py-20">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="eyebrow">Site feedback</p>
          <h1 className="section-title mt-3">Website error feedback</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/60">Use this page to report transcription mistakes, broken links, missing images, or anything else that needs checking.</p>
        </div>
        <HistoryBackButton fallbackHref={returnTo} />
      </div>
      <div className="mt-8">
        <WebsiteErrorFeedback />
      </div>
      {authenticated && <div className="mt-6"><WebsiteErrorFeedbackAdminList feedback={feedbackResult.feedback} unavailable={feedbackResult.unavailable} /></div>}
    </div>
  );
}
