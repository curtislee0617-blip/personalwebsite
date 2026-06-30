"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FormStatus = "idle" | "sending" | "sent" | "error";

export function RestaurantRecommendations() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function submitRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (formData.get("website")) return;
    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("restaurant_recommendations").insert({
      restaurant_name: String(formData.get("restaurantName") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      submitter_name: String(formData.get("submitterName") ?? "").trim() || null,
    });

    if (error) {
      console.error("Recommendation submission failed", error);
      setStatus("error");
      setMessage("Recommendations are not connected yet. Please try again after the database table is enabled.");
      return;
    }

    form.reset();
    setStatus("sent");
    setMessage("Thank you — your recommendation has been sent for review.");
  }

  return (
    <section className="restaurant-recommendations" aria-labelledby="recommendation-title">
      <div>
        <p className="eyebrow">Your turn</p>
        <h2 id="recommendation-title">Know somewhere I’m missing?</h2>
        <p>Send a restaurant recommendation. Suggestions are reviewed before appearing on the map.</p>
      </div>
      <form onSubmit={submitRecommendation}>
        <label>
          <span>Restaurant name</span>
          <input name="restaurantName" required />
        </label>
        <label>
          <span>Location</span>
          <input name="location" placeholder="City or neighbourhood" required />
        </label>
        <label>
          <span>Your name <small>(optional)</small></span>
          <input name="submitterName" />
        </label>
        <label className="recommendation-message">
          <span>Why should I add it?</span>
          <textarea maxLength={600} name="message" required rows={4} />
        </label>
        <label className="recommendation-honeypot" aria-hidden="true">
          Website
          <input autoComplete="off" name="website" tabIndex={-1} />
        </label>
        <button disabled={status === "sending"} type="submit">{status === "sending" ? "Sending…" : "Send recommendation"}</button>
        {message && <p className={`recommendation-status is-${status}`} role="status">{message}</p>}
      </form>
    </section>
  );
}
