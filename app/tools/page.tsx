import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  return (
    <>
      <PageIntro title="Tools" description="Engineering calculators and practical references." />
      <section className="page-section grid gap-3 pt-0 sm:pt-0 lg:pt-0">
        <Link className="group block rounded-[1.5rem] border border-ink/10 bg-white/55 p-5 transition hover:-translate-y-0.5 hover:border-ink/20 hover:bg-white sm:p-6" href="/tools/water-properties">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-moss">Thermodynamics</p>
          <div className="mt-3 flex items-end justify-between gap-5">
            <div>
              <h2 className="text-xl font-semibold">Water properties</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/55">Interpolate the Koretsky superheated vapour and subcooled liquid tables from two state properties.</p>
            </div>
            <span className="text-xl transition group-hover:translate-x-1" aria-hidden="true">→</span>
          </div>
        </Link>
        <Link className="group block rounded-[1.5rem] border border-ink/10 bg-white/55 p-5 transition hover:-translate-y-0.5 hover:border-ink/20 hover:bg-white sm:p-6" href="/tools/compound-properties">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-moss">Thermodynamics</p>
          <div className="mt-3 flex items-end justify-between gap-5">
            <div>
              <h2 className="text-xl font-semibold">Compound properties</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/55">Search Koretsky physical-property constants and calculate continuous Lee–Kesler real-fluid properties.</p>
            </div>
            <span className="text-xl transition group-hover:translate-x-1" aria-hidden="true">→</span>
          </div>
        </Link>
        <Link className="group block rounded-[1.5rem] border border-ink/10 bg-white/55 p-5 transition hover:-translate-y-0.5 hover:border-ink/20 hover:bg-white sm:p-6" href="/tools/vle">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-moss">Phase equilibrium</p>
          <div className="mt-3 flex items-end justify-between gap-5">
            <div>
              <h2 className="text-xl font-semibold">VLE simulator</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/55">Generate binary T–x–y and P–x–y diagrams using Raoult, Van Laar, NRTL, Wilson, or Peng–Robinson.</p>
            </div>
            <span className="text-xl transition group-hover:translate-x-1" aria-hidden="true">→</span>
          </div>
        </Link>
      </section>
    </>
  );
}
