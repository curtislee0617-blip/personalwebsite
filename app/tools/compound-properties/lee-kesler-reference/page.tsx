import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Lee–Kesler reference" };

export default function LeeKeslerReferencePage() {
  return (
    <>
      <PageIntro eyebrow="Formatted reference" title="Lee–Kesler correlation" description="A readable guide to the generalized tables in Koretsky Appendix C." />
      <div className="page-shell pb-16 pt-5 sm:pb-20 sm:pt-6">
        <div className="lk-reference-actions"><Link className="back-link-bubble" href="/tools/compound-properties">← Back to calculator</Link><a download href="/documents/koretsky-lee-kesler.pdf">Download source PDF</a></div>
        <article className="lk-reference">
          <section><p>01 · Reduce the state</p><h2>Critical-property scaling</h2><div className="lk-equations"><strong>Tᵣ = T / Tᶜ</strong><strong>Pᵣ = P / Pᶜ</strong></div><span>Use absolute temperature and consistent pressure units. Critical constants and the acentric factor ω are selected automatically from Appendix A.</span></section>
          <section><p>02 · Evaluate two fluids</p><h2>Simple and reference correlations</h2><div className="lk-equations"><strong>Z⁽⁰⁾ = PᵣVᵣ⁽⁰⁾ / Tᵣ</strong><strong>Z⁽ʳ⁾ = PᵣVᵣ⁽ʳ⁾ / Tᵣ</strong></div><span>The calculator solves the Lee–Kesler equation of state for both the simple fluid (ω = 0) and reference fluid (ωʳ = 0.3978), choosing the largest real volume root.</span></section>
          <section><p>03 · Correct for molecular shape</p><h2>Acentric interpolation</h2><div className="lk-equations"><strong>Z = Z⁽⁰⁾ + (ω / ωʳ)(Z⁽ʳ⁾ − Z⁽⁰⁾)</strong></div><span>The same corresponding-states interpolation underlies the generalized departure functions printed in Appendix C.</span></section>
          <section><p>04 · Recover useful properties</p><h2>Fugacity and departures</h2><div className="lk-equations"><strong>ln φ = ∫₀ᴾ (Z − 1) dP / P</strong><strong>Hᴿ / RT = −T ∫₀ᴾ (∂Z/∂T)ₚ dP / P</strong><strong>Sᴿ / R = Hᴿ / RT − ln φ</strong></div><span>Continuous numerical integration replaces visual interpolation between printed cells. The calculator reports φ, f = φP, Hᴿ and Sᴿ directly.</span></section>
          <aside><strong>Recommended range</strong><span>The supplied tables span approximately 0.3 ≤ Tᵣ ≤ 5 and 0.01 ≤ Pᵣ ≤ 10. Lee–Kesler is most reliable for non-polar and mildly polar fluids; associating fluids such as water and alcohols can depart materially from the generalized correlation.</span></aside>
          <footer>Reference: Milo D. Koretsky, <cite>Engineering and Chemical Thermodynamics</cite>, Appendix C, “Lee–Kesler Generalized Correlation Tables.”</footer>
        </article>
      </div>
    </>
  );
}
