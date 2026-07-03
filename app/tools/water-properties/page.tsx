import type { Metadata } from "next";
import Link from "next/link";
import { SteamTableCalculator } from "@/components/steam-table-calculator";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Water properties",
  description: "Continuous interpolation of Koretsky superheated-water-vapour and subcooled-liquid-water tables.",
};

export default function WaterPropertiesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Engineering tool"
        title="Water properties"
        description="Calculate specific volume, internal energy, enthalpy, and entropy from any two independent properties within the Koretsky steam-table ranges."
      />
      <div className="page-shell -mt-10 pb-4 sm:-mt-14">
        <Link className="text-xs font-semibold text-ink/55 transition hover:text-ink" href="/tools">← Back to tools</Link>
      </div>
      <div className="page-shell pb-16 sm:pb-20">
        <SteamTableCalculator />
      </div>
    </>
  );
}

