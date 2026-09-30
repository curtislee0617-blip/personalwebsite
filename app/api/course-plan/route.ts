import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

type CoursePlanRequest = {
  action?: unknown;
  loginKey?: unknown;
  displayName?: unknown;
  majors?: unknown;
  plan?: unknown;
};

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

function validLoginKey(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 160;
}

function validMajors(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length >= 1
    && value.length <= 6
    && value.every((major) => typeof major === "string" && major.length > 0 && major.length <= 80);
}

function validPlan(value: unknown): value is Json {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") return true;
  if (Array.isArray(value)) return value.every(validPlan);
  return typeof value === "object" && Object.values(value as Record<string, unknown>).every(validPlan);
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });

  let body: CoursePlanRequest;
  try {
    body = await request.json() as CoursePlanRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!validLoginKey(body.loginKey)) return NextResponse.json({ error: "Invalid account details." }, { status: 400 });

  try {
    const supabase = createAdminClient();

    if (body.action === "load") {
      const { data, error } = await supabase.rpc("get_course_plan", { p_login_key: body.loginKey });
      if (error) throw error;
      return NextResponse.json({ plan: data?.login_key && Array.isArray(data.majors) ? data : null }, { headers: { "Cache-Control": "no-store" } });
    }

    if (
      body.action !== "save"
      || typeof body.displayName !== "string"
      || body.displayName.trim().length === 0
      || body.displayName.length > 100
      || !validMajors(body.majors)
      || !validPlan(body.plan)
      || JSON.stringify(body.plan).length > 180_000
    ) {
      return NextResponse.json({ error: "Invalid course plan." }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("upsert_course_plan", {
      p_login_key: body.loginKey,
      p_display_name: body.displayName.trim(),
      p_majors: body.majors,
      p_plan: body.plan,
    });
    if (error) throw error;

    return NextResponse.json({ plan: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to access the saved course plan", error);
    return NextResponse.json({ error: "Course plan storage is unavailable." }, { status: 503 });
  }
}
