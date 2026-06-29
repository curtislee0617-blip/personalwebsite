import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Restaurants" };

const places = [
  { name: "Little Bowl", cuisine: "Cantonese", area: "Sham Shui Po", note: "Go for the noodles; stay for the milk tea.", mark: "★" },
  { name: "Bar Placeholder", cuisine: "Modern European", area: "Sheung Wan", note: "A tiny room with a very good soundtrack.", mark: "02" },
  { name: "Sunday Table", cuisine: "Italian", area: "Sai Ying Pun", note: "Order whatever pasta they recommend that day.", mark: "03" },
  { name: "Garden House", cuisine: "Thai", area: "Kowloon City", note: "Bright herbs, proper heat, always lively.", mark: "04" },
];

export default function RestaurantsPage() {
  return (
    <>
      <PageIntro eyebrow="Good places" title="Tables I’d happily return to." description="Personal restaurant notes from Hong Kong and elsewhere. Not reviews—just gentle nudges toward memorable meals." />
      <section className="page-section">
        <div className="mb-8 flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-ink/50">Showing placeholder favorites in Hong Kong</p><span className="pill w-fit">Hong Kong⌄</span></div>
        <div className="grid gap-5 md:grid-cols-2">
          {places.map((place) => (
            <article key={place.name} className="card card-hover min-h-64 flex flex-col justify-between">
              <div className="flex justify-between"><div className="flex gap-2"><span className="pill">{place.cuisine}</span><span className="pill">{place.area}</span></div><span className="font-serif text-xl text-clay">{place.mark}</span></div>
              <div><h2 className="font-serif text-3xl tracking-tight">{place.name}</h2><p className="mt-3 text-sm leading-6 text-ink/55">{place.note}</p></div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
