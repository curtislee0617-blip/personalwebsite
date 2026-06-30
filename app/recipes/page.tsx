import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Recipes" };

export default function RecipesPage() {
  return <PageIntro title="Recipes" />;
}
