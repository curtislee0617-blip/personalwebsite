import { NextResponse } from "next/server";
import { recipeSearchItems } from "@/lib/recipe-search";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(recipeSearchItems, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
