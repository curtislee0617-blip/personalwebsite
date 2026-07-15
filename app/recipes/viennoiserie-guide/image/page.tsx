import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageViewerBackButton } from "@/components/image-viewer-back-button";

export const metadata: Metadata = {
  title: "Viennoiserie image",
};

const allowedPrefix = "/recipes/viennoiserie/";
const fallbackHref = "/recipes/viennoiserie-guide";

function validImageSrc(value: string | undefined) {
  if (!value) return null;
  if (!value.startsWith(allowedPrefix)) return null;
  if (value.includes("..")) return null;
  if (!/\.(jpe?g|png|webp|avif)$/i.test(value)) return null;
  return value;
}

export default async function ViennoiserieImagePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const rawSrc = Array.isArray(params.src) ? params.src[0] : params.src;
  const rawAlt = Array.isArray(params.alt) ? params.alt[0] : params.alt;
  const src = validImageSrc(rawSrc);

  if (!src) notFound();

  const alt = rawAlt || "Viennoiserie image";

  return (
    <main className="image-viewer-page">
      <div className="image-viewer-toolbar">
        <ImageViewerBackButton fallbackHref={fallbackHref} />
        <Link className="back-link-bubble" href={fallbackHref}>Viennoiserie guide</Link>
      </div>
      <figure className="image-viewer-frame">
        <Image alt={alt} className="image-viewer-image" height={1800} priority quality={95} sizes="100vw" src={src} width={1400} />
        <figcaption>{alt}</figcaption>
      </figure>
    </main>
  );
}
