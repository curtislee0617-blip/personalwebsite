import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { RestaurantExplorer } from "@/components/restaurant-explorer";
import { RestaurantRecommendations } from "@/components/restaurant-recommendations";
import { restaurants } from "@/data/restaurants";
import { getPublishedRestaurants } from "@/lib/restaurants";

export const metadata: Metadata = { title: "Restaurants" };
export const dynamic = "force-dynamic";

export default async function RestaurantsPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";
  const savedRestaurants = await getPublishedRestaurants();

  return (
    <>
      <PageIntro title="My saved places" description="Explore restaurants saved on my google maps list (I haven't been to most of them). The interactive map works best on laptop. Still working on category separation, may not be accurate." />
      <div className="page-shell mt-3">
        <a className="beli-profile-link" href="https://beliapp.co/app/curtL" rel="noreferrer" target="_blank">
          Connect with me on Beli to see my scores and rankings <span aria-hidden="true">↗</span>
        </a>
      </div>
      <section className="page-section restaurant-page-section">
        <RestaurantExplorer apiKey={apiKey} mapId={mapId} restaurants={savedRestaurants.length ? savedRestaurants : restaurants} />
      </section>
      <div className="page-shell pb-16 sm:pb-20 lg:pb-24">
        <RestaurantRecommendations />
      </div>
    </>
  );
}
