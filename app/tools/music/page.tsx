import type { Metadata } from "next";
import Link from "next/link";
import { MusicPageTurner } from "@/components/music-page-turner";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Music page turner",
  description: "Upload sheet music and auto-turn pages from a BPM-based timing plan.",
};

export default function MusicToolPage() {
  return (
    <>
      <PageIntro
        eyebrow="Music tool"
        title="Music page turner"
        description="Upload sheet music, set the BPM, tune the number of beats on each page, and let the score flip while you play. Files stay in the browser."
      />
      <div className="page-shell pb-4 pt-5 sm:pt-6">
        <Link className="back-link-bubble" href="/tools">← Back to tools</Link>
      </div>
      <div className="page-shell pb-16 sm:pb-20">
        <MusicPageTurner />
      </div>
    </>
  );
}
