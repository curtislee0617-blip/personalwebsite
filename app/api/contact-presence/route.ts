import { type NextRequest, NextResponse } from "next/server";
import { emptyContactPresence, isContactPresenceCity } from "@/lib/contact-presence";
import { isRecipeAdminAuthenticated } from "@/lib/recipe-admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("contact_presence")
      .select("city, is_travelling, message, updated_at")
      .eq("id", "current")
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json(
      {
        status: data
          ? { city: data.city, isTravelling: data.is_travelling, message: data.message, updatedAt: data.updated_at }
          : emptyContactPresence,
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    console.error("Unable to load the contact presence", error);
    return NextResponse.json(
      { status: emptyContactPresence, unavailable: true },
      { headers: noStoreHeaders, status: 503 },
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  if (!(await isRecipeAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const candidate = body as { city?: unknown; isTravelling?: unknown; message?: unknown };
  const city = candidate.city === null
    ? null
    : isContactPresenceCity(candidate.city)
      ? candidate.city
      : undefined;
  const message = typeof candidate.message === "string"
    ? candidate.message.trim().replace(/\s+/g, " ")
    : undefined;
  const isTravelling = typeof candidate.isTravelling === "boolean"
    ? candidate.isTravelling
    : undefined;

  if (
    city === undefined
    || isTravelling === undefined
    || (isTravelling && city !== null)
    || message === undefined
    || message.length > 140
  ) {
    return NextResponse.json({ error: "Choose a valid city and keep the message under 140 characters." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("contact_presence")
      .upsert({ id: "current", city, is_travelling: isTravelling, message, updated_at: new Date().toISOString() })
      .select("city, is_travelling, message, updated_at")
      .single();

    if (error) throw error;

    return NextResponse.json(
      { status: { city: data.city, isTravelling: data.is_travelling, message: data.message, updatedAt: data.updated_at } },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    console.error("Unable to save the contact presence", error);
    return NextResponse.json({ error: "Unable to publish the update." }, { status: 503 });
  }
}
