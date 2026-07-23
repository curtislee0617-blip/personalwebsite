import type { Metadata } from "next";
import { HistoryBackButton } from "@/components/history-back-button";
import { IrSpectrumTool } from "@/components/ir-spectrum-tool";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "IR spectrum plotter",
  description: "Plot, compare, convert, and analyse infrared spectra directly in the browser.",
};

export default function IrSpectrumPage() {
  return <>
    <PageIntro eyebrow="Engineering tool" title="IR spectrum plotter" description="Upload, compare, and label infrared spectra without sending the measurement files to a server." />
    <div className="page-shell pb-4 pt-5 sm:pt-6"><HistoryBackButton fallbackHref="/tools">← Back to tools</HistoryBackButton></div>
    <div className="page-shell pb-16 sm:pb-20"><IrSpectrumTool /></div>
  </>;
}
