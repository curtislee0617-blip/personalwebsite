import { deleteWebsiteErrorFeedback } from "@/app/recipes/feedback-actions";
import type { Database } from "@/lib/supabase/database.types";

type WebsiteErrorFeedbackRow = Database["public"]["Tables"]["website_error_feedback"]["Row"];

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export function WebsiteErrorFeedbackAdminList({ feedback, unavailable = false }: { feedback: WebsiteErrorFeedbackRow[]; unavailable?: boolean }) {
  return (
    <section aria-labelledby="website-error-feedback-admin" className="restaurant-recommendation-admin website-error-feedback-admin design-panel">
      <div className="restaurant-recommendation-admin__heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h2 id="website-error-feedback-admin">Submitted website error feedback</h2>
        </div>
        <span>{feedback.length}</span>
      </div>
      {unavailable ? (
        <p className="restaurant-recommendation-admin__empty">The feedback list is temporarily unavailable.</p>
      ) : feedback.length === 0 ? (
        <p className="restaurant-recommendation-admin__empty">No website error feedback is waiting.</p>
      ) : (
        <ol className="restaurant-recommendation-admin__list">
          {feedback.map((item) => (
            <li key={item.id}>
              <div className="restaurant-recommendation-admin__copy">
                <div>
                  <h3>{item.page_url}</h3>
                  {item.submitter_name && <p>{item.submitter_name}</p>}
                </div>
                <p className="restaurant-recommendation-admin__message">{item.message}</p>
                <p className="restaurant-recommendation-admin__meta">{dateFormatter.format(new Date(item.created_at))}</p>
              </div>
              <form action={deleteWebsiteErrorFeedback}>
                <input name="id" type="hidden" value={item.id} />
                <button aria-label="Cancel this website error feedback" title="Cancel feedback" type="submit">×</button>
              </form>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
