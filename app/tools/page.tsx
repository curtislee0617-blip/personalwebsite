import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  return <PageIntro title="Tools" description="This section is in development." />;
}
