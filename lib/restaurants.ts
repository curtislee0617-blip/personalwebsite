import type { Restaurant } from "@/data/restaurants";
import { createClient } from "@/lib/supabase/server";

type StoredOpeningHours = {
  openNow?: boolean;
  weekdayDescriptions?: string[];
  updatedAt?: string;
};

function priceLevel(value: number | null): 1 | 2 | 3 | 4 {
  if (value === 1 || value === 2 || value === 3 || value === 4) return value;
  return 2;
}

export async function getPublishedRestaurants(): Promise<Restaurant[]> {
  const supabase = await createClient();
  const rows = [];

  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase
      .from("restaurants")
      .select("id,name,category,tags,emoji,area,city,country,address,description,price_level,latitude,longitude,google_maps_url,opening_hours,hours_updated_at")
      .eq("is_published", true)
      .order("country", { nullsFirst: false })
      .order("city", { nullsFirst: false })
      .order("name")
      .range(start, start + 999);

    if (error) {
      console.error("Unable to load restaurants from Supabase", error);
      return [];
    }

    rows.push(...data);
    if (data.length < 1000) break;
  }

  return rows.map((row) => {
    const storedHours = row.opening_hours as StoredOpeningHours | null;
    const location = row.area ?? row.city ?? row.country ?? "Location unavailable";

    return {
      id: row.id,
      name: row.name,
      category: row.category as Restaurant["category"],
      tags: row.tags,
      emoji: row.emoji,
      area: location,
      city: row.city ?? location,
      country: row.country ?? "",
      address: row.address ?? ([row.city, row.country].filter(Boolean).join(", ") || location),
      description: row.description ?? "",
      priceLevel: priceLevel(row.price_level),
      googleMapsUrl: row.google_maps_url,
      openingHours: storedHours
        ? {
            openNow: Boolean(storedHours.openNow),
            weekdayDescriptions: storedHours.weekdayDescriptions ?? [],
            updatedAt: storedHours.updatedAt ?? row.hours_updated_at ?? "",
          }
        : null,
      position: { lat: row.latitude, lng: row.longitude },
    };
  });
}
