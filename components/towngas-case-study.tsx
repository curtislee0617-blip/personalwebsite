import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { HistoryBackButton } from "@/components/history-back-button";
import { ScwgSitingMap } from "@/components/scwg-siting-map";
import { TowngasLocalNav } from "@/components/towngas-local-nav";
import { TowngasProcessOverview } from "@/components/towngas-process-overview";
import { scwgAffiliation } from "@/lib/scwg-meta";
import towngasLogo from "@/public/logos/scwg-towngas.png";
import venexLogo from "@/public/logos/scwg-venex.png";
import {
  towngasCaseStudy,
  type TowngasEvidenceBasis,
} from "@/lib/towngas-case-study";

const numberFormat = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 2,
});

function displayNumber(value: number, display?: string) {
  return display ?? numberFormat.format(value);
}

function evidenceSlug(basis: TowngasEvidenceBasis) {
  return basis.replace(/ /g, "-");
}

function EvidenceTag({ basis }: { basis: TowngasEvidenceBasis }) {
  return (
    <span className={`towngas-evidence towngas-evidence--${evidenceSlug(basis)}`}>
      {basis}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: ReactNode;
}) {
  return (
    <div className="towngas-section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {lede ? <div className="towngas-section-lede">{lede}</div> : null}
    </div>
  );
}

function SourceNote({ children }: { children: ReactNode }) {
  return <p className="towngas-source">Source basis: {children}</p>;
}

function ReportActions({ compact = false }: { compact?: boolean }) {
  const { reportDownloads, processAnchor } = towngasCaseStudy.meta;
  return (
    <div className={compact ? "towngas-actions towngas-actions--compact" : "towngas-actions"}>
      <a className="towngas-button towngas-button--primary" download href={reportDownloads.docx}>
        <span>Download report (DOCX)</span>
        <span aria-hidden="true">↓</span>
      </a>
      <a className="towngas-button towngas-button--secondary" href={processAnchor}>
        <span>Section 3 · Process design</span>
        <span aria-hidden="true">↘</span>
      </a>
    </div>
  );
}

function ReferenceLink({ referenceId }: { referenceId?: string }) {
  if (!referenceId) return null;
  const reference = towngasCaseStudy.references.find((item) => item.id === referenceId);
  if (!reference) return null;
  return (
    <a aria-label={`Official source: ${reference.title}`} className="towngas-inline-link" href={reference.url} rel="noreferrer" target="_blank">
      Official source <span aria-hidden="true">↗</span>
    </a>
  );
}

export function TowngasCaseStudy() {
  const data = towngasCaseStudy;
  const maxOutput = Math.max(...data.massBalance.outputs.map((row) => row.value));
  const maxEnergy = Math.max(...data.energyCascade.steps.map((row) => row.valueGjPerDay));
  const maxCapex = Math.max(...data.capex.areas.map((row) => row.valueRmbMillion));
  const maxOpex = Math.max(...data.opex.items.map((row) => row.valueRmbMillion));

  return (
    <article className="scwg-page towngas-page" id="top">
      <header className="towngas-hero">
        <div aria-hidden="true" className="towngas-hero-image" />
        <div className="towngas-shell towngas-hero-inner">
          <div className="towngas-hero-topline">
            <HistoryBackButton fallbackHref="/projects" />
            <p>
              <span>{data.meta.reportDate}</span>
              <span aria-hidden="true">·</span>
              <span>Guangxi–Guangdong screening basis</span>
            </p>
          </div>

          <div className="towngas-hero-grid">
            <div className="towngas-hero-copy">
              <p className="eyebrow">{data.meta.eyebrow}</p>
              <h1>{data.meta.title}</h1>
              <p className="towngas-hero-subtitle">{data.meta.subtitle}</p>
              <div className="towngas-hero-abstract">
                <p className="eyebrow">Abstract</p>
                <p className="towngas-hero-summary">{data.meta.summary}</p>
              </div>

              <div className="towngas-keywords">
                <p>Keywords</p>
                <ul className="towngas-technology-list" aria-label="Keywords">
                  {data.technologyLabels.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              </div>

              <ReportActions />
            </div>

            <aside className="towngas-hero-basis" aria-label="Central design basis">
              <p className="eyebrow">Central design basis</p>
              <div className="towngas-hero-basis-number">
                <strong>1,500</strong>
                <span>t/day slurry</span>
              </div>
              <div className="towngas-hero-basis-number">
                <strong>5 × 300</strong>
                <span>t/day hydrothermal trains</span>
              </div>
              <dl>
                <div>
                  <dt>Products</dt>
                  <dd>≈19.33 kt/year light olefins</dd>
                </div>
                <div>
                  <dt>Base NPV</dt>
                  <dd>−RMB 1.856 billion</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>Screening / pre-FEED</dd>
                </div>
              </dl>
              <p className="towngas-hero-warning">Calculated and assumed results—not measured commercial performance.</p>
            </aside>
          </div>

          <div className="towngas-affiliation">
            <div aria-label="Project affiliations" className="towngas-affiliation-logos">
              <Image alt="Towngas logo" src={towngasLogo} />
              <Image alt="VENEX Power logo" src={venexLogo} />
            </div>
            <p>{scwgAffiliation.note} {scwgAffiliation.disclaimer} Context image: the affiliated Jungar Banner green-methanol facility—not the proposed SCWG complex.</p>
          </div>
        </div>
      </header>

      <TowngasLocalNav />

      <div>
        <section className="towngas-section towngas-shell" id="overview">
          <SectionHeading
            eyebrow="01 · Project overview"
            title="Design basis and plant architecture"
            lede={
              <p>
                Five parallel B1–B4 trains manage the wet, abrasive feed; one shared B5–B8 island cleans and reforms the gas, synthesises olefins, and conditions the mineral residue. Every number below carries its evidence status.
              </p>
            }
          />

          <dl className="towngas-metric-grid">
            {data.designMetrics.map((metric) => (
              <div className="towngas-metric" key={metric.id}>
                <dt>{metric.label}</dt>
                <dd>
                  <span className="towngas-metric-value">
                    <strong>{displayNumber(metric.value, "display" in metric ? metric.display : undefined)}</strong>
                    <span>{metric.unit}</span>
                  </span>
                  <EvidenceTag basis={metric.basis} />
                  {"note" in metric && metric.note ? <p>{metric.note}</p> : null}
                </dd>
              </div>
            ))}
          </dl>

          <details className="towngas-evidence-key">
            <summary>How to read the evidence labels</summary>
            <div>
              {data.evidenceLegend.map((item) => (
                <p key={item.basis}>
                  <EvidenceTag basis={item.basis} />
                  <span>{item.description}</span>
                </p>
              ))}
            </div>
          </details>

          <div className="towngas-proposition">
            <div className="towngas-proposition-intro">
              <p className="eyebrow">The engineering proposition</p>
              <h3>{data.engineeringProposition.summary}</h3>
              <p>
                Okara’s water is a burden for dry thermochemical routes but the reaction medium in SCWG. Red mud’s alkalinity and iron may assist conversion while the same hydrothermal pass begins dealkalising the residue.
              </p>
            </div>
            <ol className="towngas-proposition-grid">
              {data.engineeringProposition.arguments.map((argument, index) => (
                <li key={argument.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h4>{argument.challenge}</h4>
                  <p>{argument.evidence}</p>
                  <div>
                    <strong>Proposed response</strong>
                    <p>{argument.proposal}</p>
                  </div>
                  <p className="towngas-consequence"><strong>Design consequence:</strong> {argument.consequence}</p>
                  <EvidenceTag basis={argument.basis} />
                  <SourceNote>{argument.source}</SourceNote>
                </li>
              ))}
            </ol>
            <details className="towngas-technical-detail">
              <summary>Technical qualification</summary>
              <p>{data.engineeringProposition.technicalDetail}</p>
            </details>
          </div>
        </section>

        <section className="towngas-section towngas-section--tint" id="feedstocks">
          <div className="towngas-shell">
            <SectionHeading
              eyebrow="02 · Feedstocks + location"
              title="Feedstock constraints and siting screen"
              lede={
                <p>
                  Wet okara spoils quickly and transports mostly water, so it sets the practical collection radius. Denser red mud can move farther. The Guangxi–Guangdong corridor is the shortest credible pairing found—not a selected plant site.
                </p>
              }
            />

            <div className="towngas-feed-grid">
              {data.feedstocks.map((feedstock) => (
                <article key={feedstock.id}>
                  <header>
                    <div>
                      <p>{feedstock.role}</p>
                      <h3>{feedstock.name}</h3>
                    </div>
                    <p className="towngas-feed-amount">
                      <strong>{displayNumber(feedstock.amount.value)}</strong>
                      <span>{feedstock.amount.unit}</span>
                    </p>
                  </header>
                  <ul>
                    {feedstock.characteristics.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                  <p className="towngas-feed-note">{feedstock.sitingOrControlNote}</p>
                  <EvidenceTag basis={feedstock.basis} />
                </article>
              ))}
            </div>

            <figure className="towngas-map-figure">
              <div className="towngas-figure-heading">
                <div>
                  <p className="eyebrow">Interactive siting screen</p>
                  <h3>Guangxi–Guangdong supply corridor</h3>
                </div>
                <p>Toggle feed and infrastructure layers; select a candidate only to compare screening haul distances.</p>
              </div>
              <ScwgSitingMap />
              <figcaption>
                Figure 1. Screening overlay assembled from the report’s source categories. Coordinates and candidate points are indicative and require owner verification; this is not a final site-selection result.
              </figcaption>
            </figure>

            <div className="towngas-feed-controls">
              <details>
                <summary>Compatible co-feeds and exclusions</summary>
                <div className="towngas-table-wrap">
                  <table>
                    <thead><tr><th>Feed</th><th>Screening verdict</th><th>Case for</th><th>Constraint</th></tr></thead>
                    <tbody>
                      {data.compatibleCoFeeds.map((feed) => (
                        <tr key={feed.id}><th>{feed.name}</th><td>{feed.verdict}</td><td>{feed.caseFor}</td><td>{feed.constraint}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              <details>
                <summary>Feed acceptance envelope</summary>
                <div className="towngas-table-wrap">
                  <table>
                    <thead><tr><th>Control</th><th>Acceptance basis</th><th>Operating response</th><th>Evidence</th></tr></thead>
                    <tbody>
                      {data.feedAcceptance.map((item) => (
                        <tr key={item.property}>
                          <th>{item.property}</th><td>{item.acceptance}</td><td>{item.response}</td><td><EvidenceTag basis={item.basis} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="towngas-section towngas-shell" id="process-design">
          <SectionHeading
            eyebrow="03 · Integrated process design"
            title="Integrated process configuration and battery-limit definitions"
            lede={<p>The route is deliberately serial through B1–B7. B8 receives mineral solids after B4, and R1 returns only a controlled conditioned fraction to B1.</p>}
          />

          <TowngasProcessOverview />

          <div className="towngas-equations" aria-label="Key reforming reactions">
            <div><span>Steam reforming</span><strong>CH₄ + H₂O ⇌ CO + 3H₂</strong></div>
            <div><span>Dry reforming</span><strong>CH₄ + CO₂ ⇌ 2CO + 2H₂</strong></div>
            <p>B6 uses both reactions to correct the CO deficit created by SCWG before B7 OXZEO synthesis.</p>
          </div>

          <div className="towngas-conflicts">
            <div className="towngas-figure-heading">
              <div><p className="eyebrow">Three central conflicts</p><h3>Design conflicts and selected resolutions</h3></div>
              <p>The flowsheet changed at each conflict; none is solved by optimistic language.</p>
            </div>
            <ol>
              {data.designConflicts.map((conflict, index) => (
                <li key={conflict.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><small>Engineering conflict</small><h4>{conflict.conflict}</h4></div>
                  <div className="towngas-conflict-arrow" aria-hidden="true">→</div>
                  <div><small>Decision</small><p>{conflict.decision}</p></div>
                  <div className="towngas-conflict-arrow" aria-hidden="true">→</div>
                  <div><small>Consequence</small><p>{conflict.consequence}</p><SourceNote>{conflict.source}</SourceNote></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="towngas-section towngas-section--dark" id="balances">
          <div className="towngas-shell">
            <SectionHeading
              eyebrow="04 · Closed screening balances"
              title="Reconciled one-train mass, carbon, and energy balances"
              lede={<p>The closure is arithmetic, not pilot evidence. It reconciles pseudo-components so the process and economics can be screened consistently.</p>}
            />

            <figure className="towngas-balance-figure">
              <div className="towngas-balance-inputs">
                <p className="eyebrow">Battery-limit inputs</p>
                <strong>300.00 <span>t/day</span></strong>
                <ol>
                  {data.massBalance.inputs.map((row) => (
                    <li key={row.id}><span>{row.label}</span><strong>{row.value.toFixed(row.value % 1 ? 2 : 0)} t/day</strong></li>
                  ))}
                </ol>
              </div>
              <div className="towngas-balance-closure" aria-label="Overall mass closure 100 percent">
                <span>Overall mass closure</span><strong>{data.massBalance.closurePct}%</strong><small>reconciled screening basis</small>
              </div>
              <div className="towngas-balance-outputs">
                <p className="eyebrow">Battery-limit outputs</p>
                <strong>300.00 <span>t/day</span></strong>
                <ol>
                  {data.massBalance.outputs.map((row) => (
                    <li key={row.id}>
                      <div><span>{row.label}</span><strong>{row.value.toFixed(2)} t/day</strong></div>
                      <span className="towngas-balance-bar"><i style={{ "--bar": `${(row.value / maxOutput) * 100}%` } as CSSProperties} /></span>
                    </li>
                  ))}
                </ol>
              </div>
              <figcaption>Figure 3. Reconciled one-train pseudo-component mass balance. {data.massBalance.caveat}</figcaption>
            </figure>

            <figure className="towngas-carbon-figure">
              <div className="towngas-carbon-heading">
                <div><p className="eyebrow">Carbon destinations</p><h3>{data.carbonBalance.feedCarbon.value.toFixed(2)} t C/day feed carbon</h3></div>
                <p><strong>{data.carbonBalance.olefinCarbonSharePct}%</strong> to light olefins</p>
              </div>
              <div className="towngas-carbon-strip" aria-label="Carbon destination shares">
                {data.carbonBalance.destinations.map((row) => (
                  <span key={row.id} style={{ "--share": `${row.sharePct}%` } as CSSProperties} title={`${row.label}: ${row.sharePct}%`} />
                ))}
              </div>
              <ol>
                {data.carbonBalance.destinations.map((row, index) => (
                  <li key={row.id}><i className={`towngas-carbon-key towngas-carbon-key--${index + 1}`} /><span>{row.label}</span><strong>{row.value.toFixed(2)} t C/day · {row.sharePct}%</strong></li>
                ))}
              </ol>
              <p>{data.carbonBalance.caveat}</p>
              <figcaption>Figure 4. Carbon destinations on the one-train battery-limit basis; closure is {data.carbonBalance.closurePct}%.</figcaption>
            </figure>

            <figure className="towngas-energy-figure">
              <div className="towngas-figure-heading">
                <div><p className="eyebrow">Energy cascade</p><h3>Heat integration reduces—but does not erase—the water and methane penalty</h3></div>
                <p>{data.energyCascade.basis}</p>
              </div>
              <div className="towngas-energy-summary">
                {[
                  ["Gross sensible heating", "≈796", "GJ/day"],
                  ["Feed–effluent recovery", "≈637", "GJ/day"],
                  ["Reformer + OXZEO recovery", "≈130", "GJ/day"],
                  ["Internal purge-fuel credit", "≈75", "GJ/day"],
                  ["Purchased energy", "≈207", "GJ/day"],
                ].map(([label, value, unit]) => <div key={label}><span>{label}</span><strong>{value}</strong><small>{unit}</small></div>)}
              </div>
              <ol className="towngas-energy-cascade">
                {data.energyCascade.steps.map((step) => (
                  <li className={`towngas-energy-step towngas-energy-step--${step.kind}`} key={step.id}>
                    <div><span>{step.label}</span><EvidenceTag basis={step.basis} /></div>
                    <span className="towngas-energy-bar"><i style={{ "--bar": `${(step.valueGjPerDay / maxEnergy) * 100}%` } as CSSProperties} /></span>
                    <strong>{step.signedGjPerDay < 0 ? "−" : ""}{step.valueGjPerDay} GJ/day</strong>
                  </li>
                ))}
              </ol>
              <blockquote>{data.energyCascade.centralMessage}</blockquote>
              <figcaption>Figure 5. Screening energy cascade. Recovered heat and purge fuel are credits; the final 207 GJ/day is the purchased-energy equivalent per train.</figcaption>
            </figure>
          </div>
        </section>

        <section className="towngas-section towngas-shell" id="economics">
          <SectionHeading
            eyebrow="05 · China-specific RMB economics"
            title="China-specific cost basis and 20-year economic evaluation"
            lede={<p>The model uses 2026 China screening inputs and a Class 4 range. It assumes 20 operating years, nominal pre-tax unlevered cash flow, and a 10% discount rate.</p>}
          />

          <div className="towngas-economic-basis">
            <div><span>Central total capital</span><strong>RMB {data.capex.totalRmbBillion.toFixed(2)} bn</strong><small>Class 4 range: RMB {data.capex.rangeRmbBillion.low.toFixed(1)}–{data.capex.rangeRmbBillion.high.toFixed(1)} bn</small></div>
            <div><span>Annual cash OPEX</span><strong>RMB {data.opex.totalRmbMillionPerYear.toFixed(1)}m</strong><small>≈RMB {numberFormat.format(data.opex.intensity.perTonneOlefinRmb)}/t olefin</small></div>
            <div><span>Central production</span><strong>≈19.33 kt/year</strong><small>Light C₂–C₄ olefins</small></div>
          </div>

          <div className="towngas-cost-grid">
            <figure className="towngas-cost-chart">
              <div className="towngas-figure-heading"><div><p className="eyebrow">CAPEX</p><h3>RMB 1.90 billion central estimate</h3></div><p>RMB million</p></div>
              <ol>
                {data.capex.areas.map((area) => (
                  <li key={area.id}>
                    <div><span>{area.label}</span><strong>{area.valueRmbMillion}</strong></div>
                    <span><i style={{ "--bar": `${(area.valueRmbMillion / maxCapex) * 100}%` } as CSSProperties} /></span>
                  </li>
                ))}
              </ol>
              <figcaption>Figure 6. Area-by-area 2026 China screening estimate; vendor quotes are not yet available.</figcaption>
            </figure>

            <figure className="towngas-cost-chart towngas-cost-chart--opex">
              <div className="towngas-figure-heading"><div><p className="eyebrow">OPEX</p><h3>RMB 160.2 million per year</h3></div><p>RMB million/year</p></div>
              <ol>
                {data.opex.items.map((item) => (
                  <li key={item.id}>
                    <div><span>{item.label}</span><strong>{item.valueRmbMillion.toFixed(1)}</strong></div>
                    <span><i style={{ "--bar": `${(item.valueRmbMillion / maxOpex) * 100}%` } as CSSProperties} /></span>
                  </li>
                ))}
              </ol>
              <figcaption>Figure 7. Annual operating-cost basis at central throughput and availability.</figcaption>
            </figure>
          </div>

          <details className="towngas-economic-inputs">
            <summary>China price, utility, and labour inputs</summary>
            <div className="towngas-table-wrap">
              <table>
                <thead><tr><th>Input</th><th>Central basis</th><th>Evidence</th><th>Source</th></tr></thead>
                <tbody>
                  {data.chinaEconomicInputs.map((item) => (
                    <tr key={item.label}><th>{item.label}</th><td>{numberFormat.format(item.value)} {item.unit}</td><td><EvidenceTag basis={item.basis} /></td><td><ReferenceLink referenceId={"referenceId" in item ? item.referenceId : undefined} /></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <div className="towngas-benchmark">
            <div className="towngas-benchmark-copy">
              <p className="eyebrow">Methanol benchmark</p>
              <h3>{data.methanolBenchmarkExplanation.headline}</h3>
              <div className="towngas-benchmark-number"><strong>RMB 1.5 bn</strong><span>owner-supplied Inner Mongolia methanol plant · ≈300 kt/year · scope/date to verify</span></div>
              <ul>{data.methanolBenchmarkExplanation.points.map((point) => <li key={point}>{point}</li>)}</ul>
              <p>{data.methanolBenchmarkExplanation.carbonLimit}</p>
            </div>
            <div className="towngas-table-wrap">
              <table>
                <caption>Official and owner-supplied capital comparators</caption>
                <thead><tr><th>Project</th><th>Year / basis</th><th>Capital</th><th>Capacity</th><th>Product</th><th>Use</th></tr></thead>
                <tbody>
                  {data.methanolComparators.map((item) => (
                    <tr key={item.id}>
                      <th>{item.name}{"referenceId" in item && item.referenceId ? <><br /><ReferenceLink referenceId={item.referenceId} /></> : null}</th>
                      <td>{"year" in item && item.year ? item.year : item.id === "owner-inner-mongolia" ? "Date to verify" : "2026 screening"}</td>
                      <td>RMB {item.investmentRmbBillion.toFixed(item.investmentRmbBillion < 1 ? 3 : 2)} bn</td>
                      <td>{numberFormat.format(item.capacityKtPerYear)} kt/year</td><td>{item.product}</td><td>{item.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="towngas-economics-result" aria-labelledby="economics-result-title">
            <div className="towngas-economics-result-heading">
              <p className="eyebrow">20-year economic evaluation</p>
              <h3 id="economics-result-title">The central commodity-olefin case is not financeable.</h3>
              <p>{data.economics.conclusion}</p>
            </div>
            <dl>
              <div><dt>Revenue + credits</dt><dd>RMB {data.economics.revenueAndCreditsRmbMillionPerYear.toFixed(1)}m/year</dd></div>
              <div><dt>Cash OPEX</dt><dd>RMB {data.economics.cashOpexRmbMillionPerYear.toFixed(1)}m/year</dd></div>
              <div><dt>EBITDA</dt><dd>RMB {data.economics.ebitdaRmbMillionPerYear.toFixed(1)}m/year</dd></div>
              <div><dt>Operating life</dt><dd>{data.economics.projectLifeYears} years</dd></div>
              <div><dt>Discount rate</dt><dd>{data.economics.discountRatePct}% nominal pre-tax</dd></div>
              <div className="towngas-npv"><dt>Base pre-tax NPV</dt><dd>−RMB {Math.abs(data.economics.preTaxNpvRmbBillion).toFixed(3)} bn</dd></div>
              <div><dt>Project IRR</dt><dd>{data.economics.irrLabel}</dd></div>
              <div><dt>Simple payback</dt><dd>≈{data.economics.simplePaybackYears} years · commercially unacceptable</dd></div>
              <div><dt>NPV-zero EBITDA</dt><dd>RMB {data.economics.npvZeroEbitdaRmbMillionPerYear.toFixed(1)}m/year</dd></div>
            </dl>
          </div>

          <div className="towngas-revenue-grid">
            <div>
              <h3>What the base revenue contains</h3>
              <p>Conditional credits are displayed, not guaranteed. Carbon premium and scandium are explicitly zero.</p>
            </div>
            <ol>
              {data.revenueCredits.map((item) => (
                <li key={item.id}><span>{item.label}<EvidenceTag basis={item.basis} /></span><strong>RMB {item.valueRmbMillion.toFixed(1)}m/year</strong>{"note" in item && item.note ? <p>{item.note}</p> : null}</li>
              ))}
            </ol>
          </div>

          <div className="towngas-table-wrap towngas-sensitivity">
            <table>
              <caption>Sensitivity frame—screening ranges, not independent bankable cases</caption>
              <thead><tr><th>Driver</th><th>Low</th><th>Base</th><th>High / qualification</th><th>Interpretation</th></tr></thead>
              <tbody>
                {data.economicSensitivities.map((item) => (
                  <tr key={item.id}><th>{item.label}</th><td>{item.low}</td><td>{item.base}</td><td>{item.high}</td><td>{item.interpretation}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="towngas-section towngas-section--tint" id="policy">
          <div className="towngas-shell">
            <SectionHeading
              eyebrow="06 · Environmental policy + certification"
              title="Environmental, certification, and product-qualification basis"
              lede={<p>Carbon, circularity, fertilizer, and residue claims require different evidence chains. None is converted into guaranteed revenue in the base case.</p>}
            />
            <div className="towngas-policy-grid">
              {data.policyItems.map((item, index) => (
                <article key={item.id}>
                  <header><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3></header>
                  <p>{item.summary}</p>
                  <div><strong>Commercial treatment</strong><p>{item.commercialTreatment}</p></div>
                  <footer><EvidenceTag basis={item.basis} /><ReferenceLink referenceId={"referenceId" in item ? item.referenceId : undefined} /></footer>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="towngas-section towngas-shell" id="development">
          <SectionHeading
            eyebrow="07 · Risk register + development programme"
            title="Risk retirement and development gates G0–G7"
            lede={<p>The concept advances only when the physical failure modes and commercial assumptions are retired with representative material and real gas.</p>}
          />

          <div className="towngas-risk-grid">
            {data.risks.slice(0, 6).map((risk) => (
              <article key={risk.id}>
                <span>Risk {String(risk.rank).padStart(2, "0")}</span>
                <h3>{risk.risk}</h3>
                <p>{risk.mechanism}</p>
                <div><strong>Retirement test</strong><p>{risk.retirementTest}</p></div>
              </article>
            ))}
          </div>
          <details className="towngas-more-risks">
            <summary>Two additional programme risks</summary>
            <div>
              {data.risks.slice(6).map((risk) => <p key={risk.id}><strong>{risk.risk}:</strong> {risk.mechanism} <span>{risk.retirementTest}</span></p>)}
            </div>
          </details>

          <figure className="towngas-gates">
            <div className="towngas-figure-heading"><div><p className="eyebrow">Development sequence</p><h3>Development gates G0–G7</h3></div><p>Representative feed to investment decision</p></div>
            <ol>
              {data.stageGates.map((gate) => (
                <li key={gate.id}>
                  <span>{gate.id}</span>
                  <div><p>{gate.scaleOrDuration}</p><h4>{gate.name}</h4><p>{gate.evidence}</p><strong>{gate.decision}</strong></div>
                </li>
              ))}
            </ol>
            <figcaption>Figure 8. Evidence-gated development programme. Commercial FEED is the final gate, not the present project status.</figcaption>
          </figure>
        </section>

        <section className="towngas-section towngas-section--report" id="report">
          <div className="towngas-shell">
            <div className="towngas-report-card">
              <div>
                <p className="eyebrow">Report files</p>
                <h2>Process design and pre-FEED screening report</h2>
                <p>The downloadable 3 August 2026 report contains the complete screening basis, tables, references, assumptions register, arithmetic checks, and development plan.</p>
                <ReportActions compact />
                <a className="towngas-pdf-link" href={data.meta.reportDownloads.pdf} target="_blank">Open PDF review copy <span aria-hidden="true">↗</span></a>
              </div>
              <aside>
                <span>Document status</span><strong>{data.meta.status}</strong>
                <span>Currency</span><strong>RMB throughout</strong>
                <span>Economic horizon</span><strong>20 operating years</strong>
              </aside>
            </div>

            <div className="towngas-references">
              <div><p className="eyebrow">Selected references</p><h2>Scientific and official sources</h2></div>
              <ol>
                {data.references.map((reference, index) => (
                  <li id={`reference-${reference.id}`} key={reference.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p><strong>{reference.title}</strong><small>{reference.authorsOrPublisher} · {reference.year} · {reference.kind}</small></p>
                    <a aria-label={`Open ${reference.title}`} href={reference.url} rel="noreferrer" target="_blank">↗</a>
                  </li>
                ))}
              </ol>
            </div>

            <footer className="towngas-page-footer">
              <p>Screening/pre-FEED case study · 3 August 2026</p>
              <div><Link href="/projects">All projects</Link><a href="#top">Back to top ↑</a></div>
            </footer>
          </div>
        </section>
      </div>
    </article>
  );
}
