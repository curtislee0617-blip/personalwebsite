import { NextResponse } from "next/server";
import { recipeSearchItems } from "@/lib/recipe-search";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(recipeSearchItems, {
    headers: { "Cache-Control": "no-store" },
  });
}
