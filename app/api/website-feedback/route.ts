import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });

  let body: { pageUrl?: unknown; message?: unknown; submitterName?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.website) return new NextResponse(null, { status: 204 });

  const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const submitterName = typeof body.submitterName === "string" ? body.submitterName.trim() : "";
  if (!pageUrl || pageUrl.length > 500 || !message || message.length > 1200 || submitterName.length > 100) {
    return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("website_error_feedback").insert({
      page_url: pageUrl,
      message,
      submitter_name: submitterName || null,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Unable to save website feedback", error);
    return NextResponse.json({ error: "Feedback storage is unavailable." }, { status: 503 });
  }
}
