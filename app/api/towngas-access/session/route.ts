import { NextResponse } from "next/server";
import {
  clearTowngasAccessCookie,
  isTowngasAccessAuthenticated,
  isTowngasAccessConfigured,
  isTowngasPasswordValid,
  setTowngasAccessCookie,
} from "@/lib/towngas-access-auth";

const noStoreHeaders = { "Cache-Control": "private, no-store" };

export async function GET() {
  return NextResponse.json(
    {
      authenticated: await isTowngasAccessAuthenticated(),
      configured: isTowngasAccessConfigured(),
    },
    { headers: noStoreHeaders },
  );
}

export async function POST(request: Request) {
  if (!isTowngasAccessConfigured()) {
    return NextResponse.json({ error: "Project access is not configured." }, { status: 503, headers: noStoreHeaders });
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400, headers: noStoreHeaders });
  }

  if (!isTowngasPasswordValid(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401, headers: noStoreHeaders });
  }

  await setTowngasAccessCookie();
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}

export async function DELETE() {
  await clearTowngasAccessCookie();
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}
