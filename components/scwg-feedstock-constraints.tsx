import {
  scwgCoFeedCaption,
  scwgCoFeedIntro,
  scwgCoFeeds,
  scwgProvinceCaption,
  scwgProvinceClosing,
  scwgProvinceIntro,
  scwgProvinces,
  scwgSlurryFormulation,
  scwgSolidsBudget,
} from "@/lib/scwg-feedstock";
import { scwgUi } from "@/lib/scwg-meta";
import { ScwgSolidsBudget } from "@/components/scwg-solids-budget";

// Report sections 1.6-1.9 — the solids budget, slurry formulation, co-feed
// evaluation and the five red-mud provinces. Split out of scwg-feedstock.tsx to
// keep both files under the size limit. Server component; content from lib.

export function ScwgFeedstockConstraints() {
  return (
    <>
      {/* §1.6 The solids budget — the most consequential finding in Section 1 */}
      <div className="rounded-[2rem] border-l-2 border-clay bg-clay/8 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.feedstock.solidsBudgetLabel}</p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">{scwgSolidsBudget.title}</h3>
        <div className="mt-3 space-y-3 text-sm leading-7 text-ink/70">
          {scwgSolidsBudget.intro.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
                <th className="py-1.5 pr-3 font-semibold">Component</th>
                <th className="py-1.5 pr-3 font-semibold">Contributes solids</th>
                <th className="py-1.5 pr-3 font-semibold">Contributes carbon</th>
                <th className="py-1.5 font-semibold">Effect on the budget</th>
              </tr>
            </thead>
            <tbody>
              {scwgSolidsBudget.rows.map((row) => (
                <tr className="border-b border-ink/8 align-top" key={row.component}>
                  <td className="py-2 pr-3 font-medium text-ink/80">{row.component}</td>
                  <td className="py-2 pr-3 text-ink/60">{row.contributesSolids}</td>
                  <td className="py-2 pr-3 text-ink/60">{row.contributesCarbon}</td>
                  <td className="py-2 text-ink/60">{row.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-6 text-ink/45">{scwgSolidsBudget.caption}</p>

        <div className="mt-5">
          <ScwgSolidsBudget />
        </div>

        <p className="mt-4 text-sm font-medium leading-7 text-ink/80">{scwgSolidsBudget.correction}</p>
      </div>

      {/* §1.7 Slurry formulation */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.feedstock.slurryLabel}</p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">{scwgSlurryFormulation.title}</h3>
        <div className="mt-3 space-y-3 text-sm leading-7 text-ink/65">
          {scwgSlurryFormulation.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-4 rounded-[1.25rem] border-l-2 border-clay bg-clay/8 px-4 py-3">
          <p className="text-sm font-semibold text-ink/80">{scwgSlurryFormulation.trap.title}</p>
          <p className="mt-1 text-sm leading-6 text-ink/70">{scwgSlurryFormulation.trap.body}</p>
        </div>
        <p className="mt-4 text-sm leading-7 text-ink/65">{scwgSlurryFormulation.resolution}</p>
        <p className="mt-3 text-sm font-medium leading-7 text-ink/80">{scwgSlurryFormulation.firstQuestion}</p>
      </div>

      {/* §1.8 Co-feeds */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.feedstock.coFeedLabel}</p>
        <div className="mt-3 space-y-3 text-sm leading-7 text-ink/65">
          {scwgCoFeedIntro.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
                <th className="py-1.5 pr-3 font-semibold">Co-feed</th>
                <th className="py-1.5 pr-3 font-semibold">Case for</th>
                <th className="py-1.5 pr-3 font-semibold">Why it is risky here</th>
                <th className="py-1.5 font-semibold">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {scwgCoFeeds.map((row) => (
                <tr className="border-b border-ink/8 align-top" key={row.feed}>
                  <td className="py-2.5 pr-3 font-medium text-ink/80">{row.feed}</td>
                  <td className="py-2.5 pr-3 text-ink/60">{row.caseFor}</td>
                  <td className="py-2.5 pr-3 text-ink/60">{row.risk}</td>
                  <td className="py-2.5">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] ${
                        row.verdict === "design basis"
                          ? "border-moss/40 bg-moss/10 text-moss"
                          : row.verdict === "rejected"
                            ? "border-clay/40 bg-clay/10 text-clay"
                            : "border-ink/20 bg-ink/5 text-ink/60"
                      }`}
                    >
                      {row.verdict}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-6 text-ink/45">{scwgCoFeedCaption}</p>
      </div>

      {/* §1.9 The five provinces */}
      <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
        <p className="eyebrow">{scwgUi.feedstock.provinceLabel}</p>
        <div className="mt-3 space-y-3 text-sm leading-7 text-ink/65">
          {scwgProvinceIntro.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
                <th className="py-1.5 pr-3 font-semibold">Province</th>
                <th className="py-1.5 pr-3 font-semibold">Principal refining centres</th>
                <th className="py-1.5 font-semibold">Assessment against douzha supply</th>
              </tr>
            </thead>
            <tbody>
              {scwgProvinces.map((row) => (
                <tr className="border-b border-ink/8 align-top" key={row.province}>
                  <td className="py-2.5 pr-3">
                    <span className="font-medium text-ink/80">{row.province}</span>
                    <span
                      className={`ml-2 inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${
                        row.rank === "strongest"
                          ? "border-moss/40 bg-moss/10 text-moss"
                          : row.rank === "trap"
                            ? "border-clay/40 bg-clay/10 text-clay"
                            : "border-ink/20 bg-ink/5 text-ink/55"
                      }`}
                    >
                      {row.rank}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-ink/60">{row.centres}</td>
                  <td className="py-2.5 text-ink/60">{row.assessment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-6 text-ink/45">{scwgProvinceCaption}</p>
        <p className="mt-4 text-sm font-medium leading-7 text-ink/80">{scwgProvinceClosing}</p>
      </div>
    </>
  );
}
