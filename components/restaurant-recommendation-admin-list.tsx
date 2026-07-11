import { deleteRestaurantRecommendation } from "@/app/restaurants/actions";
import type { Database } from "@/lib/supabase/database.types";

type RestaurantRecommendation = Database["public"]["Tables"]["restaurant_recommendations"]["Row"];

type RestaurantRecommendationAdminListProps = {
  recommendations: RestaurantRecommendation[];
  unavailable?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function RestaurantRecommendationAdminList({ recommendations, unavailable = false }: RestaurantRecommendationAdminListProps) {
  return (
    <section aria-labelledby="restaurant-admin-recommendations" className="restaurant-recommendation-admin design-panel">
      <div className="restaurant-recommendation-admin__heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h2 id="restaurant-admin-recommendations">Submitted recommendations</h2>
        </div>
        <span>{recommendations.length}</span>
      </div>

      {unavailable ? (
        <p className="restaurant-recommendation-admin__empty">The Supabase recommendation list is temporarily unavailable.</p>
      ) : recommendations.length === 0 ? (
        <p className="restaurant-recommendation-admin__empty">No restaurant recommendations are waiting.</p>
      ) : (
        <ol className="restaurant-recommendation-admin__list">
          {recommendations.map((recommendation) => (
            <li key={recommendation.id}>
              <div className="restaurant-recommendation-admin__copy">
                <div>
                  <h3>{recommendation.restaurant_name}</h3>
                  <p>{recommendation.location}</p>
                </div>
                <p className="restaurant-recommendation-admin__message">{recommendation.message}</p>
                <p className="restaurant-recommendation-admin__meta">
                  {recommendation.submitter_name ? `From ${recommendation.submitter_name} · ` : ""}
                  {dateFormatter.format(new Date(recommendation.created_at))} · {recommendation.status}
                </p>
              </div>
              <form action={deleteRestaurantRecommendation}>
                <input name="id" type="hidden" value={recommendation.id} />
                <button aria-label={`Remove ${recommendation.restaurant_name}`} title="Remove recommendation" type="submit">×</button>
              </form>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
