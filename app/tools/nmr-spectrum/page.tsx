import type { Metadata } from "next";
import { HistoryBackButton } from "@/components/history-back-button";
import { NmrSpectrumTool } from "@/components/nmr-spectrum-tool";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "NMR spectrum processor",
  description: "Read and process Magritek Spinsolve one-dimensional NMR acquisitions in the browser.",
};

export default function NmrSpectrumPage() {
  return <>
    <PageIntro eyebrow="Spectroscopy tool" title="NMR spectrum processor" description="Decode and Fourier-transform Magritek Spinsolve 1D proton and carbon NMR acquisitions without uploading experimental data to a server." />
    <div className="page-shell pb-4 pt-5 sm:pt-6"><HistoryBackButton fallbackHref="/tools">← Back to tools</HistoryBackButton></div>
    <div className="page-shell pb-16 sm:pb-20"><NmrSpectrumTool /></div>
  </>;
}
