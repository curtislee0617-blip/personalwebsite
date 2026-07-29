import {
  scwgProvenanceConvention,
  scwgReportSections,
  scwgReportStructureIntro,
} from "@/lib/scwg-report-structure";
import { scwgUi } from "@/lib/scwg-meta";

// Table A.1 — the ten report sections and how far each is actually written.
// Server component; content from lib/scwg-report-structure.ts.

export function ScwgReportStructure() {
  const drafted = scwgReportSections.filter((section) => section.status === "drafted").length;

  return (
    <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="eyebrow">{scwgUi.reportStructure.label}</p>
        <p className="font-mono text-sm tabular-nums text-ink/55">
          {drafted}/{scwgReportSections.length} drafted
        </p>
      </div>

      <p className="mt-3 text-sm leading-7 text-ink/65">{scwgReportStructureIntro}</p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
              <th className="py-1.5 pr-3 font-semibold">§</th>
              <th className="py-1.5 pr-3 font-semibold">{scwgUi.reportStructure.columnSection}</th>
              <th className="py-1.5 pr-3 font-semibold">{scwgUi.reportStructure.columnArgument}</th>
              <th className="py-1.5 font-semibold">{scwgUi.reportStructure.columnStatus}</th>
            </tr>
          </thead>
          <tbody>
            {scwgReportSections.map((section) => (
              <tr className="border-b border-ink/8 align-top" key={section.number}>
                <td className="py-2.5 pr-3 font-mono font-semibold tabular-nums text-moss">{section.number}</td>
                <td className="py-2.5 pr-3 font-medium text-ink/80">{section.title}</td>
                <td className="py-2.5 pr-3 text-ink/60">{section.argument}</td>
                <td className="py-2.5">
                  <span
                    className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] ${
                      section.status === "drafted"
                        ? "border border-moss/40 bg-moss/10 text-moss"
                        : "border border-ink/15 bg-ink/5 text-ink/50"
                    }`}
                  >
                    {section.status === "drafted"
                      ? scwgUi.reportStructure.statusDrafted
                      : scwgUi.reportStructure.statusOutlined}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-[1.25rem] border border-dashed border-ink/15 bg-paper/50 p-4">
        <p className="text-sm font-semibold text-ink/75">{scwgProvenanceConvention.title}</p>
        <p className="mt-1 text-sm leading-6 text-ink/60">{scwgProvenanceConvention.body}</p>
      </div>
    </div>
  );
}
