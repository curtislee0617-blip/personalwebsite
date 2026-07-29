import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { RestaurantExplorer } from "@/components/restaurant-explorer";
import { RestaurantRecommendationAdminList } from "@/components/restaurant-recommendation-admin-list";
import { RestaurantRecommendations } from "@/components/restaurant-recommendations";
import { restaurants } from "@/data/restaurants";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { getPublishedRestaurants } from "@/lib/restaurants";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Restaurants" };
export const revalidate = 300;

export default async function RestaurantsPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";
  const savedRestaurants = await getPublishedRestaurants().catch(() => {
    console.warn("Using bundled restaurant data because Supabase is unavailable.");
    return [];
  });
  const isAdmin = await isRecipeAdminAuthenticated();
  const recommendationResult = isAdmin
    ? await (async () => {
        try {
          const supabase = createAdminClient();
          const { data, error } = await supabase
            .from("restaurant_recommendations")
            .select("id,restaurant_name,location,message,submitter_name,status,created_at")
            .order("created_at", { ascending: false });
          if (error) throw error;
          return { recommendations: data, unavailable: false };
        } catch (error) {
          console.error("Unable to load restaurant recommendations for admin", error);
          return { recommendations: [], unavailable: true };
        }
      })()
    : { recommendations: [], unavailable: false };

  return (
    <>
      <PageIntro
        title="My saved places"
        description="Explore restaurants saved on my Google Maps list (I haven't been to most of them). The interactive map works best on a laptop. Use the filters to narrow the results, download the filtered list for Google My Maps, or open any restaurant directly in Google Maps."
      />
      <div className="restaurant-beli-row page-shell mt-3" data-reveal>
        <a className="beli-profile-link" href="https://beliapp.co/app/curtL" rel="noreferrer" target="_blank">
          Connect with me on Beli to see my scores and rankings <span aria-hidden="true">↗</span>
        </a>
      </div>
      <section className="page-section restaurant-page-section" id="restaurant-map">
        <RestaurantExplorer apiKey={apiKey} mapId={mapId} restaurants={savedRestaurants.length ? savedRestaurants : restaurants} />
      </section>
      <div className="page-shell pb-16 sm:pb-20 lg:pb-24" data-reveal id="restaurant-recommendations">
        <RestaurantRecommendations />
        {isAdmin && (
          <RestaurantRecommendationAdminList
            recommendations={recommendationResult.recommendations}
            unavailable={recommendationResult.unavailable}
          />
        )}
      </div>
    </>
  );
}
