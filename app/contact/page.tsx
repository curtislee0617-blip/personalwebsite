import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="Get in touch" title="Good conversations start with hello." description="Have a project, a restaurant recommendation, or just want to compare notes? My inbox is open." />
      <section className="page-section grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
        <div>
          <a href="mailto:hello@example.com" className="font-serif text-2xl underline decoration-1 underline-offset-8 sm:text-3xl">hello@example.com ↗</a>
          <p className="mt-8 max-w-sm text-sm leading-6 text-ink/50">This is a placeholder address. Replace it with your preferred email when the site goes live.</p>
          <div className="mt-10 flex gap-4 text-sm font-semibold"><a href="#">LinkedIn</a><a href="#">Instagram</a><a href="#">GitHub</a></div>
        </div>
        <form className="card bg-white/65" action="#">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="text-sm font-medium">Name<input className="mt-2 w-full rounded-xl border border-ink/15 bg-paper/60 px-4 py-3 outline-none transition focus:border-moss" type="text" placeholder="Your name" /></label>
            <label className="text-sm font-medium">Email<input className="mt-2 w-full rounded-xl border border-ink/15 bg-paper/60 px-4 py-3 outline-none transition focus:border-moss" type="email" placeholder="you@example.com" /></label>
          </div>
          <label className="mt-6 block text-sm font-medium">Message<textarea className="mt-2 min-h-36 w-full resize-y rounded-xl border border-ink/15 bg-paper/60 px-4 py-3 outline-none transition focus:border-moss" placeholder="What’s on your mind?" /></label>
          <button type="submit" className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-moss">Send message →</button>
          <p className="mt-4 text-xs text-ink/40">Demo form only — no data is submitted yet.</p>
        </form>
      </section>
    </>
  );
}
