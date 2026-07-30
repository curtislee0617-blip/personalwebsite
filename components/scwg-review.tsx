import {
  scwgHeatVsWork,
  scwgReviewCaption,
  scwgReviewIntro,
  scwgReviewObjections,
} from "@/lib/scwg-review";
import type { ReviewObjection } from "@/lib/scwg-types";
import { scwgUi } from "@/lib/scwg-meta";

// Disposition of external review comments. Server component; content from
// lib/scwg-review.ts.

const APPLIES_STYLE: Record<ReviewObjection["applies"], string> = {
  no: "border-moss/40 bg-moss/10 text-moss",
  inverted: "border-moss/40 bg-moss/10 text-moss",
  transformed: "border-ink/20 bg-ink/5 text-ink/60",
  overstated: "border-ink/20 bg-ink/5 text-ink/60",
  yes: "border-clay/40 bg-clay/10 text-clay",
  unmitigable: "border-clay/40 bg-clay/10 text-clay",
};

export function ScwgReview() {
  return (
    <div className="rounded-[2rem] border border-ink/10 bg-surface/55 p-6 sm:p-8">
      <p className="eyebrow">{scwgUi.review.label}</p>
      <p className="mt-3 text-sm leading-7 text-ink/65">{scwgReviewIntro}</p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
              <th className="py-1.5 pr-3 font-semibold">Objection</th>
              <th className="py-1.5 pr-3 font-semibold">{scwgUi.review.appliesColumn}</th>
              <th className="py-1.5 font-semibold">Disposition</th>
            </tr>
          </thead>
          <tbody>
            {scwgReviewObjections.map((row) => (
              <tr className="border-b border-ink/8 align-top" key={row.objection}>
                <td className="py-2.5 pr-3 font-medium text-ink/80">{row.objection}</td>
                <td className="py-2.5 pr-3">
                  <span
                    className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] ${APPLIES_STYLE[row.applies]}`}
                  >
                    {row.applies}
                  </span>
                </td>
                <td className="py-2.5 text-ink/60">{row.disposition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-6 text-ink/45">{scwgReviewCaption}</p>

      <div className="mt-6 rounded-[1.25rem] border border-dashed border-ink/15 bg-paper/50 p-4">
        <p className="text-sm font-semibold text-ink/75">{scwgHeatVsWork.title}</p>
        <div className="mt-2 space-y-2 text-sm leading-7 text-ink/60">
          {scwgHeatVsWork.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
