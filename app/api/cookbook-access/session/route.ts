import { NextResponse } from "next/server";
import {
  clearCookbookAccessCookie,
  cookbookPasswordMatches,
  hasPrivateRecipeLibraryAccess,
  setCookbookAccessCookie,
} from "@/lib/cookbook-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { authenticated: await hasPrivateRecipeLibraryAccess() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!cookbookPasswordMatches(password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  await setCookbookAccessCookie();
  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  await clearCookbookAccessCookie();
  return NextResponse.json({ authenticated: false });
}
