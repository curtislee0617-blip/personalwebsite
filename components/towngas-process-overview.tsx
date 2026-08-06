import { ScwgProcessScroller } from "@/components/scwg-process-scroller";
import { towngasCurrentProcessBlocks } from "@/lib/towngas-process-blocks";

export function TowngasProcessOverview() {
  return (
    <div className="towngas-process-overview">
      <div className="towngas-process-preface">
        <p>
          Read one dirty-service hydrothermal train from B1 to B4, then follow its accepted gas into the
          shared B5–B7 conversion island. B8 is an outlet-and-qualification route, not an indefinite recycle.
        </p>
        <ul aria-label="Process-flow conventions" className="towngas-process-legend">
          <li><span aria-hidden="true" className="towngas-process-legend-line" />Process stream</li>
          <li><span aria-hidden="true" className="towngas-process-legend-tag"><i>4</i></span>Numbered stream tag</li>
          <li>
            <span aria-hidden="true" className="towngas-process-legend-flow" />
            <span className="towngas-process-legend-motion">Animated flow direction</span>
            <span className="towngas-process-legend-static">Arrowhead flow direction</span>
          </li>
          <li><span aria-hidden="true" className="towngas-process-legend-alert" />Requires qualification</li>
        </ul>
      </div>

      <ScwgProcessScroller blocks={towngasCurrentProcessBlocks} />
    </div>
  );
}
