import { NextResponse } from "next/server";
import { isRecipeAdminAuthenticated, isRecipeAdminSessionAuthenticated } from "@/lib/recipe-admin-auth";

export async function GET(request: Request) {
  const strict = new URL(request.url).searchParams.get("strict") === "1";
  return NextResponse.json(
    {
      authenticated: await (strict ? isRecipeAdminSessionAuthenticated() : isRecipeAdminAuthenticated()),
      configured: Boolean(process.env.RECIPE_ADMIN_PASSWORD),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
