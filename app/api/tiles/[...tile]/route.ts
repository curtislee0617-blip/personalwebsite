/**
 * Map tile proxy.
 *
 * Map keys are normally shipped to the browser and domain-locked. Proxying
 * instead keeps TOMTOM_API_KEY entirely server-side, and Vercel's edge cache
 * absorbs the extra hop — tiles are immutable, so a long s-maxage costs one
 * origin fetch per tile per week.
 */

export const runtime = "edge";

type Ctx = { params: { tile: string[] } | Promise<{ tile: string[] }> };

export async function GET(_req: Request, ctx: Ctx) {
  // Next 15 made params a Promise; awaiting a plain object is a no-op, so this
  // works on both 14 and 15.
  const { tile } = await ctx.params;
  const [z, x, y] = tile;

  if (![z, x, y].every((v) => /^\d+$/.test(v ?? ""))) {
    return new Response("Bad tile coordinates", { status: 400 });
  }

  const key = process.env.TOMTOM_API_KEY;
  if (!key) return new Response("Missing TOMTOM_API_KEY", { status: 500 });

  const upstream = `https://api.tomtom.com/map/1/tile/basic/main/${z}/${x}/${y}.png?key=${key}`;
  const res = await fetch(upstream);

  if (!res.ok) return new Response("Tile unavailable", { status: res.status });

  return new Response(res.body, {
    headers: {
      "Content-Type": "image/png",
      // Immutable content; cache hard at the edge and in the browser.
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
    },
  });
}
