import { NextResponse } from "next/server";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";

export async function GET() {
  return NextResponse.json(
    { authenticated: await isRecipeAdminAuthenticated() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
