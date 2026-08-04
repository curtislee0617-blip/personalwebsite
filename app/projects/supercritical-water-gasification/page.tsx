import type { Metadata } from "next";
import { TowngasCaseStudy } from "@/components/towngas-case-study";

const title = "Towngas SCWG–OXZEO process design";
const description =
  "Screening/pre-FEED design integrating supercritical water gasification, bauxite-residue treatment, bi-reforming and OXZEO light-olefin synthesis, with closed balances and China-specific RMB economics.";
const canonicalPath = "/projects/supercritical-water-gasification";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: canonicalPath,
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: canonicalPath,
    images: [
      {
        url: "/photos/scwg-hero-wide.webp",
        width: 1600,
        height: 900,
        alt: "Existing Jungar Banner green-methanol facility shown as Towngas project context, not the proposed SCWG plant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/photos/scwg-hero-wide.webp"],
  },
};

export default function SupercriticalWaterGasificationPage() {
  return <TowngasCaseStudy />;
}
