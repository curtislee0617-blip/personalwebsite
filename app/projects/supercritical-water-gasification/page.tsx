import type { Metadata } from "next";
import { TowngasCaseStudy } from "@/components/towngas-case-study";

const title = "Towngas SCWG–OXZEO integrated waste process design";
const description =
  "Third-edition screening design for ten modular SCWG trains converting a douzha-led regional feed while conditioning bauxite residue, with interactive process architecture, closed balances, certification logic, and China-specific RMB economics.";
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
