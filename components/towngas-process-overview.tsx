import { ScwgProcessScroller } from "@/components/scwg-process-scroller";
import {
  towngasCurrentProcessBlocks,
  towngasRecycleStage,
} from "@/lib/towngas-process-blocks";

export function TowngasProcessOverview() {
  return (
    <div className="towngas-process-overview">
      <div className="towngas-process-preface">
        <p>
          Read the plant from top to bottom. The Aspen-style process figure holds on the left while the
          report-current definition of each battery-limit stage passes on the right.
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

      {towngasRecycleStage ? (
        <aside aria-labelledby="towngas-r1-title" className="towngas-process-recycle-spec" id="towngas-process-r1">
          <header>
            <span>R1</span>
            <div>
              <p>Recycle specification · not a separate unit operation</p>
              <h3 id="towngas-r1-title">{towngasRecycleStage.name}</h3>
            </div>
          </header>
          <div>
            <p>{towngasRecycleStage.purpose}</p>
            <p>{towngasRecycleStage.mechanism}</p>
          </div>
          <dl>
            {towngasRecycleStage.conditions.map((condition) => (
              <div key={condition.label}>
                <dt>{condition.label}</dt>
                <dd>{condition.value}</dd>
              </div>
            ))}
          </dl>
          <div className="towngas-process-recycle-lists">
            <section>
              <h4>Main equipment</h4>
              <ul>{towngasRecycleStage.equipment.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section>
              <h4>Inputs</h4>
              <ul>{towngasRecycleStage.inputs.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section>
              <h4>Outputs</h4>
              <ul>{towngasRecycleStage.outputs.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          </div>
          <p className="towngas-process-recycle-risk">
            <strong>Inventory-control risk</strong>
            {towngasRecycleStage.risk}
          </p>
          <p className="towngas-process-recycle-risk">
            <strong>Evidence required to retire it</strong>
            {towngasRecycleStage.validation}
          </p>
          <p className="scwg-process-source-note">Source basis: {towngasRecycleStage.source}</p>
        </aside>
      ) : null}
    </div>
  );
}
