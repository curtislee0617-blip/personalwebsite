import type { RestaurantCategory } from "@/data/restaurant-categories";

export type Restaurant = {
  id: string;
  name: string;
  category: RestaurantCategory;
  tags: string[];
  emoji: string;
  area: string;
  city: string;
  country: string;
  address: string;
  description: string;
  priceLevel: 1 | 2 | 3 | 4;
  googleMapsUrl: string | null;
  businessStatus: "OPERATIONAL" | "CLOSED_TEMPORARILY";
  openingHours: {
    openNow: boolean;
    weekdayDescriptions: string[];
    periods?: Array<{
      open: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number } | null;
    }>;
    utcOffsetMinutes?: number | null;
    updatedAt: string;
  } | null;
  position: {
    lat: number;
    lng: number;
  };
};

// Temporary entries for developing the map. The Google Maps importer will
// eventually produce objects with this same shape.
export const restaurants: Restaurant[] = [
  {
    id: "little-bowl",
    name: "Little Bowl",
    category: "East Asian",
    tags: ["Noodles", "Casual"],
    emoji: "🥢",
    area: "Sham Shui Po",
    city: "Hong Kong",
    country: "Hong Kong",
    address: "Sham Shui Po, Hong Kong",
    description: "Go for the noodles; stay for the milk tea.",
    priceLevel: 1,
    googleMapsUrl: null,
    businessStatus: "OPERATIONAL",
    openingHours: null,
    position: { lat: 22.3307, lng: 114.1622 },
  },
  {
    id: "bar-placeholder",
    name: "Bar Placeholder",
    category: "Bars",
    tags: ["Wine", "Late night"],
    emoji: "🍷",
    area: "Sheung Wan",
    city: "Hong Kong",
    country: "Hong Kong",
    address: "Sheung Wan, Hong Kong",
    description: "A tiny room with a very good soundtrack.",
    priceLevel: 3,
    googleMapsUrl: null,
    businessStatus: "OPERATIONAL",
    openingHours: null,
    position: { lat: 22.2866, lng: 114.1491 },
  },
  {
    id: "sunday-table",
    name: "Sunday Table",
    category: "Casual",
    tags: ["Pasta", "Date night"],
    emoji: "🍝",
    area: "Sai Ying Pun",
    city: "Hong Kong",
    country: "Hong Kong",
    address: "Sai Ying Pun, Hong Kong",
    description: "Order whatever pasta they recommend that day.",
    priceLevel: 2,
    googleMapsUrl: null,
    businessStatus: "OPERATIONAL",
    openingHours: null,
    position: { lat: 22.2867, lng: 114.1367 },
  },
  {
    id: "garden-house",
    name: "Garden House",
    category: "Southeast Asian",
    tags: ["Spicy", "Groups"],
    emoji: "🌶️",
    area: "Kowloon City",
    city: "Hong Kong",
    country: "Hong Kong",
    address: "Kowloon City, Hong Kong",
    description: "Bright herbs, proper heat, always lively.",
    priceLevel: 2,
    googleMapsUrl: null,
    businessStatus: "OPERATIONAL",
    openingHours: null,
    position: { lat: 22.3282, lng: 114.1916 },
  },
  {
    id: "morning-window",
    name: "Morning Window",
    category: "Cafés",
    tags: ["Coffee", "Bakery"],
    emoji: "🥐",
    area: "Central",
    city: "Hong Kong",
    country: "Hong Kong",
    address: "Central, Hong Kong",
    description: "A quiet coffee and something warm from the oven.",
    priceLevel: 2,
    googleMapsUrl: null,
    businessStatus: "OPERATIONAL",
    openingHours: null,
    position: { lat: 22.2819, lng: 114.1589 },
  },
  {
    id: "harbour-sushi",
    name: "Harbour Sushi",
    category: "Sushi",
    tags: ["Sushi", "Special occasion"],
    emoji: "🍣",
    area: "Wan Chai",
    city: "Hong Kong",
    country: "Hong Kong",
    address: "Wan Chai, Hong Kong",
    description: "A counter seat, a long lunch, and no need to rush.",
    priceLevel: 4,
    googleMapsUrl: null,
    businessStatus: "OPERATIONAL",
    openingHours: null,
    position: { lat: 22.2774, lng: 114.1722 },
  },
];
