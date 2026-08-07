import { readFile } from "node:fs/promises";
import path from "node:path";
import { isTowngasAccessAuthenticated } from "@/lib/towngas-access-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const fileName = "TowngasGasificationProjectPrivate.docx";

export async function GET() {
  if (!(await isTowngasAccessAuthenticated())) {
    return Response.json(
      { error: "Towngas project access is required." },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  try {
    const file = await readFile(path.join(process.cwd(), "private", "towngas", fileName));
    return new Response(new Uint8Array(file), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "The private report is unavailable." },
      { status: 404, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
