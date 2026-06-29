import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Recipes" };

const recipes = [
  { title: "Tomato egg noodles", note: "Comfort in twenty minutes", time: "20 min", color: "bg-[#edd8cc]" },
  { title: "Miso butter mushrooms", note: "Deeply savory, very low effort", time: "25 min", color: "bg-lime" },
  { title: "Sunday lemon cake", note: "Bright, soft, and not too sweet", time: "1 hr", color: "bg-[#f0e3ae]" },
  { title: "Green tahini salad", note: "The dressing does the heavy lifting", time: "15 min", color: "bg-mist" },
  { title: "Ginger scallion fish", note: "A weeknight centerpiece", time: "35 min", color: "bg-[#d9e3ef]" },
  { title: "Cold sesame noodles", note: "Best eaten straight from the fridge", time: "20 min", color: "bg-[#eadbd2]" },
];

export default function RecipesPage() {
  return (
    <>
      <PageIntro eyebrow="From the kitchen" title="Recipes for ordinary, delicious days." description="A growing notebook of things I like to cook. Measurements and stories are placeholders, but the appetite is real." />
      <section className="page-section">
        <div className="flex flex-wrap gap-2">{["All recipes", "Quick", "Vegetarian", "Sweet things"].map((tag, i) => <button key={tag} className={`pill ${i === 0 ? "border-ink bg-ink text-paper" : ""}`}>{tag}</button>)}</div>
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe, index) => (
            <article className="group" key={recipe.title}>
              <div className={`aspect-[4/3] overflow-hidden rounded-[1.75rem] ${recipe.color} p-5`}><div className="flex h-full items-start justify-end rounded-[1.25rem] border border-ink/10 p-4"><span className="text-xs font-semibold">0{index + 1}</span></div></div>
              <div className="px-1 pt-5"><div className="flex items-start justify-between gap-4"><h2 className="font-serif text-2xl tracking-tight">{recipe.title}</h2><span className="shrink-0 text-xs text-ink/45">{recipe.time}</span></div><p className="mt-2 text-sm text-ink/55">{recipe.note}</p></div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
