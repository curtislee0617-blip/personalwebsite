import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Tools" };

const groups = [
  { title: "Make", items: [["Figma", "Designing and thinking visually"], ["VS Code", "Writing code without ceremony"], ["Notion", "Notes, drafts, and loose plans"]] },
  { title: "Focus", items: [["Things", "Keeping the next action visible"], ["Raycast", "Getting around the computer quickly"], ["Readwise", "Remembering what I read"]] },
  { title: "Carry", items: [["Ricoh GR", "A small camera for daily life"], ["Field Notes", "The analog capture device"], ["Headphones", "A portable room of one’s own"]] },
];

export default function ToolsPage() {
  return (
    <>
      <PageIntro eyebrow="The toolkit" title="Useful things, lightly held." description="Apps, objects, and small systems that earn their place by helping me think, make, or move through the day." />
      <section className="page-section grid gap-12 md:grid-cols-3 md:gap-6">
        {groups.map((group, groupIndex) => (
          <div key={group.title}>
            <div className="mb-6 flex items-center gap-3"><span className={`grid size-9 place-items-center rounded-full ${["bg-lime", "bg-mist", "bg-[#edd8cc]"][groupIndex]} text-xs font-semibold`}>0{groupIndex + 1}</span><h2 className="font-serif text-2xl">{group.title}</h2></div>
            <div className="divide-y divide-ink/10 border-y border-ink/10">
              {group.items.map(([name, description]) => <article className="py-6" key={name}><h3 className="font-semibold">{name}</h3><p className="mt-2 text-sm leading-6 text-ink/50">{description}</p></article>)}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
