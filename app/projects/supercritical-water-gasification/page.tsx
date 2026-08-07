import type { Metadata } from "next";
import { TowngasCaseStudy } from "@/components/towngas-case-study";
import { isTowngasAccessAuthenticated } from "@/lib/towngas-access-auth";

const title = "Towngas SCWG–OXZEO integrated waste process design";
const description =
  "Public-safe screening design for ten modular SCWG trains converting a douzha-led regional feed while conditioning bauxite residue, with interactive process architecture, operating transitions, closed balances, certification logic, route alternatives, and revised China RMB economics.";
const canonicalPath = "/projects/supercritical-water-gasification";

export const dynamic = "force-dynamic";

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

export default async function SupercriticalWaterGasificationPage() {
  const hasPrivateAccess = await isTowngasAccessAuthenticated();
  return <TowngasCaseStudy hasPrivateAccess={hasPrivateAccess} />;
}
