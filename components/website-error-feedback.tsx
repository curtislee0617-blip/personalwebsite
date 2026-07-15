"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FormStatus = "idle" | "sending" | "sent" | "error";

export function WebsiteErrorFeedback() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [pageUrl, setPageUrl] = useState("");

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (formData.get("website")) return;
    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("website_error_feedback").insert({
      page_url: String(formData.get("pageUrl") ?? "").trim() || window.location.href,
      message: String(formData.get("message") ?? "").trim(),
      submitter_name: String(formData.get("submitterName") ?? "").trim() || null,
    });

    if (error) {
      console.error("Website error feedback submission failed", error);
      setStatus("error");
      setMessage("Feedback is not connected yet. Please try again later.");
      return;
    }

    form.reset();
    setPageUrl("");
    setStatus("sent");
    setMessage("Thank you — your feedback has been sent for review.");
  }

  return (
    <section aria-labelledby="website-error-feedback-title" className="restaurant-recommendations website-error-feedback">
      <div>
        <p className="eyebrow">Help improve the site</p>
        <h2 id="website-error-feedback-title">Website error feedback</h2>
        <p>Found a transcription mistake, broken link, missing image, or anything else that looks wrong? Send me a note and I&apos;ll check it.</p>
      </div>
      <form onSubmit={submitFeedback}>
        <label>
          <span>Page or recipe</span>
          <input name="pageUrl" onChange={(event) => setPageUrl(event.currentTarget.value)} placeholder="Leave blank to use this page" value={pageUrl} />
        </label>
        <label>
          <span>Your name <small>(optional)</small></span>
          <input name="submitterName" />
        </label>
        <label className="recommendation-message">
          <span>What needs checking?</span>
          <textarea maxLength={1200} name="message" required rows={4} />
        </label>
        <label className="recommendation-honeypot" aria-hidden="true">
          Website
          <input autoComplete="off" name="website" tabIndex={-1} />
        </label>
        <button disabled={status === "sending"} type="submit">{status === "sending" ? "Sending…" : "Send feedback"}</button>
        {message && <p className={`recommendation-status is-${status}`} role="status">{message}</p>}
      </form>
    </section>
  );
}
