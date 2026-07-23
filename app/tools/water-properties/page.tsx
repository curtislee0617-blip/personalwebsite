import type { Metadata } from "next";
import { HistoryBackButton } from "@/components/history-back-button";
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
      <div className="page-shell pb-4 pt-5 sm:pt-6">
        <HistoryBackButton fallbackHref="/tools">← Back to tools</HistoryBackButton>
      </div>
      <div className="page-shell pb-16 sm:pb-20">
        <SteamTableCalculator />
      </div>
    </>
  );
}
