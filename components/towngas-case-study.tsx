import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { HistoryBackButton } from "@/components/history-back-button";
import { ScwgSitingMap } from "@/components/scwg-siting-map";
import { TowngasLogoAccess } from "@/components/towngas-logo-access";
import { TowngasLocalNav } from "@/components/towngas-local-nav";
import { TowngasProcessOverview } from "@/components/towngas-process-overview";
import { scwgAffiliation } from "@/lib/scwg-meta";
import { towngasCaseStudy, type TowngasEvidenceBasis } from "@/lib/towngas-case-study";
import {
  towngasConfidentialOpex,
  towngasConfidentialSources,
  towngasMethanolReferenceCosts,
} from "@/lib/towngas-confidential";
import towngasLogo from "@/public/logos/scwg-towngas.png";
import venexLogo from "@/public/logos/scwg-venex.png";

function evidenceSlug(basis: TowngasEvidenceBasis) {
  return basis.replace(/ /g, "-");
}

function EvidenceTag({ basis }: { basis: TowngasEvidenceBasis }) {
  if (basis === "requires pilot validation") {
    return <span className="towngas-testing-note">(needs testing)</span>;
  }
  return <span className={`towngas-evidence towngas-evidence--${evidenceSlug(basis)}`}>{basis}</span>;
}

function SectionHeading({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: ReactNode }) {
  return (
    <div className="towngas-section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {lede ? <div className="towngas-section-lede">{lede}</div> : null}
    </div>
  );
}

function ReportActions({ hasPrivateAccess }: { hasPrivateAccess: boolean }) {
  const { privateReportHref, processAnchor, publicReportHref } = towngasCaseStudy.meta;
  const reportHref = hasPrivateAccess ? privateReportHref : publicReportHref;
  return (
    <div className="towngas-actions">
      <a className="towngas-button towngas-button--primary" download href={reportHref}>
        <span>{hasPrivateAccess ? "Download private report" : "Download public report"}</span><span aria-hidden="true">↓</span>
      </a>
      <a className="towngas-button towngas-button--secondary" href={processAnchor}>
        <span>Explore process</span><span aria-hidden="true">↘</span>
      </a>
      <a className="towngas-button towngas-button--secondary" href="#report">
        <span>Public report basis</span><span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  return <i aria-hidden="true" style={{ "--bar": `${Math.max(2, (value / max) * 100)}%` } as CSSProperties}><b /></i>;
}

export function TowngasCaseStudy({ hasPrivateAccess }: { hasPrivateAccess: boolean }) {
  const data = towngasCaseStudy;
  const maxMassOutput = Math.max(...data.massBalance.outputs.map((item) => item.value));
  const maxCapex = Math.max(...data.capex.map((item) => item.value));
  const maxPublicOpex = Math.max(...data.opexDrivers.map((item) => item.value));

  return (
    <article className="scwg-page towngas-page" id="top">
      <header className="towngas-hero">
        <div aria-hidden="true" className="towngas-hero-image" />
        <div className="towngas-shell towngas-hero-inner">
          <div className="towngas-hero-topline">
            <HistoryBackButton fallbackHref="/projects" />
            <p><span>Project synthesis</span><span aria-hidden="true">·</span><span>{data.meta.reportDate}</span>{hasPrivateAccess ? <><span aria-hidden="true">·</span><span>Private detail unlocked</span></> : null}</p>
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
                <ul aria-label="Keywords" className="towngas-technology-list">
                  {data.technologyLabels.map((label) => <li key={label}>{label}</li>)}
                </ul>
              </div>
              <ReportActions hasPrivateAccess={hasPrivateAccess} />
            </div>

            <aside aria-label="Commercial design basis" className="towngas-hero-basis">
              <p className="eyebrow">Commercial design basis</p>
              <div className="towngas-hero-basis-number"><strong>10 × 300</strong><span>t/day isolatable hydrothermal trains</span></div>
              <div className="towngas-hero-basis-number"><strong>42.35 → 55.45</strong><span>kt/year light-olefin envelope</span></div>
              <dl>
                <div><dt>Central feed</dt><dd>B1 balanced regional blend</dd></div>
                <div><dt>TCI</dt><dd>RMB 2.814 billion</dd></div>
                <div><dt>Commercial frame</dt><dd>Waste service + certified carbon</dd></div>
              </dl>
              <p className="towngas-hero-warning">Screening calculations and targets—not measured commercial performance or guaranteed product claims.</p>
            </aside>
          </div>

          <div className="towngas-affiliation">
            <TowngasLogoAccess initiallyAuthenticated={hasPrivateAccess}>
              <Image alt="Towngas logo" src={towngasLogo} />
              <Image alt="VENEX Power logo" src={venexLogo} />
            </TowngasLogoAccess>
            <p>{scwgAffiliation.note} {scwgAffiliation.disclaimer} The context image shows the affiliated Jungar Banner green-methanol facility, not the proposed SCWG complex.</p>
          </div>
        </div>
      </header>

      <TowngasLocalNav />

      <section className="towngas-section towngas-shell" id="reasoning">
        <SectionHeading
          eyebrow="01 · Design reasoning"
          title="The project begins with the wastes, not the reactor"
          lede={<p>The report is organised as a chain of engineering decisions. Each step answers a practical question, changes the design boundary, and creates evidence that must be obtained before the next commitment.</p>}
        />

        <ol className="towngas-reasoning-path">
          {data.reasoning.map((step, index) => (
            <li key={step.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><p>Question</p><h3>{step.question}</h3></div>
              <div><p>Finding</p><p>{step.finding}</p></div>
              <div><p>Design decision</p><p>{step.decision}</p></div>
            </li>
          ))}
        </ol>

        <div className="towngas-waste-pair">
          {data.wastePair.map((waste) => (
            <article key={waste.id}>
              <header><div><p>{waste.role}</p><h3>{waste.name}</h3></div><p><strong>{waste.number}</strong><span>{waste.unit}</span></p></header>
              <dl>
                <div><dt>Starting problem</dt><dd>{waste.problem}</dd></div>
                <div><dt>Use in the process</dt><dd>{waste.use}</dd></div>
                <div><dt>Defensible outlet</dt><dd>{waste.release}</dd></div>
              </dl>
            </article>
          ))}
        </div>

        <dl className="towngas-metric-grid">
          {data.designMetrics.map((metric) => (
            <div className="towngas-metric" key={metric.id}>
              <dt>{metric.label}</dt>
              <dd>
                <span className="towngas-metric-value"><strong>{metric.value}</strong><span>{metric.unit}</span></span>
                <EvidenceTag basis={metric.basis} />
                <p>{metric.note}</p>
              </dd>
            </div>
          ))}
        </dl>

        <details className="towngas-evidence-key">
          <summary>How to read the evidence labels</summary>
          <div>{data.evidenceLegend.map((item) => <p key={item.basis}><EvidenceTag basis={item.basis} /><span>{item.description}</span></p>)}</div>
        </details>
      </section>

      <section className="towngas-section towngas-section--tint" id="feed-platform">
        <div className="towngas-shell">
          <SectionHeading
            eyebrow="02 · Feed platform"
            title="A balanced recipe, governed by properties rather than labels"
            lede={<p>Douzha is the anchor, but the platform remains flexible. Carbon density, pumpability, nitrogen, ash, salt, chloride, and a defined contaminant destination decide whether a regional co-feed belongs in the plant.</p>}
          />

          <div className="towngas-recipe-layout">
            <figure className="towngas-recipe-figure">
              <div className="towngas-figure-heading"><div><p className="eyebrow">Central B1 recipe</p><h3>One 300 t/day train</h3></div><p>Every feed is metered into a controlled batch; new feed replaces an existing component rather than adding uncontrolled wet tonnes.</p></div>
              <ol>
                {data.centralRecipe.map((item) => (
                  <li key={item.name}>
                    <div><span>{item.name}</span><small>{item.role}</small></div>
                    <span><i style={{ "--bar": `${(item.value / 150) * 100}%` } as CSSProperties}><b /></i><strong>{item.value} t/d</strong></span>
                  </li>
                ))}
              </ol>
              <figcaption>Figure 1. B1 balanced regional recipe. Total solids are 62.40 t/day; feed carbon is 25.947 t C/day; gross slurry carbon is 8.649 wt%.</figcaption>
            </figure>

            <aside className="towngas-feed-rule">
              <p className="eyebrow">Binding rule</p>
              <h3>Substitute dry solids; do not simply add wet tonnes.</h3>
              <p>Hold each train at 300 t/day and release the final blend only when rheology, restart, particle size, carbon, nitrogen, sulfur, ash, salts, and chloride meet the campaign envelope.</p>
              <EvidenceTag basis="requires pilot validation" />
            </aside>
          </div>

          <div className="towngas-blend-grid">
            {data.blendCases.map((blend) => (
              <article className={blend.id === "B1" ? "is-selected" : undefined} key={blend.id}>
                <header><span>{blend.id}</span><div><h3>{blend.name}</h3><p>{blend.purpose}</p></div></header>
                <dl>
                  <div><dt>Total solids</dt><dd>{blend.solidsPct.toFixed(2)}%</dd></div>
                  <div><dt>Feed carbon</dt><dd>{blend.carbon.toFixed(3)} t/d</dd></div>
                  <div><dt>C/N screen</dt><dd>{blend.cn.toFixed(2)}</dd></div>
                  <div><dt>Olefin envelope</dt><dd>{blend.product42.toFixed(2)}–{blend.product55.toFixed(2)} kt/y</dd></div>
                </dl>
                {blend.id === "B1" ? <small>Selected central basis</small> : null}
              </article>
            ))}
          </div>

          <div className="towngas-feed-controls">
            <details open>
              <summary>Compatible regional co-feeds</summary>
              <div className="towngas-table-wrap"><table><thead><tr><th>Feed</th><th>Design dose / role</th><th>Function</th><th>Binding constraint</th></tr></thead><tbody>{data.compatibleCoFeeds.map((feed) => <tr key={feed.name}><th>{feed.name}</th><td>{feed.dose}</td><td>{feed.function}</td><td>{feed.constraint}</td></tr>)}</tbody></table></div>
            </details>
            <details>
              <summary>Feed acceptance envelope</summary>
              <div className="towngas-table-wrap"><table><thead><tr><th>Control</th><th>Normal target</th><th>Response outside target</th></tr></thead><tbody>{data.feedAcceptance.map((item) => <tr key={item.property}><th>{item.property}</th><td>{item.target}</td><td>{item.response}</td></tr>)}</tbody></table></div>
            </details>
          </div>
        </div>
      </section>

      <section className="towngas-section towngas-shell" id="siting">
        <SectionHeading
          eyebrow="03 · Regional sourcing"
          title="Why South China—and what the map does not decide"
          lede={<p>The Guangxi–Guangdong / Beibu Gulf corridor contains complementary wet-organic, dry-carbon, mineral, utility, and product-logistics opportunities. It is a first screen, not a selected plant site.</p>}
        />

        <div className="towngas-siting-logic">
          {data.sitingLogic.map((item) => <article key={item.label}><p>{item.label}</p><strong>{item.value}</strong><span>{item.note}</span></article>)}
        </div>

        <figure className="towngas-map-figure">
          <div className="towngas-figure-heading"><div><p className="eyebrow">Interactive siting screen</p><h3>Qinzhou–Beihai–Fangchenggang corridor</h3></div><p>Toggle feed and infrastructure layers. Candidate points compare screening logic only; supplier coordinates and volumes require verification.</p></div>
          <ScwgSitingMap />
          <figcaption>Figure 2. South China source and logistics screen retained from the earlier case study. Final siting minimises annual delivered cost across wet water haul, dry carbon, mineral transport, utilities, and product logistics.</figcaption>
        </figure>
      </section>

      <section className="towngas-section towngas-section--tint" id="process-design">
        <div className="towngas-shell">
          <SectionHeading
            eyebrow="04 · Process architecture"
            title="Ten dirty-service trains; one shared conversion island"
            lede={<p>B1–B4 contains the feed, salt, dirty heat-recovery, letdown, water, and solids risks inside independently isolatable trains. Only accepted raw gas crosses into shared B5–B7. B8 provides an explicit residue outlet and retreatment route.</p>}
          />

          <div className="towngas-architecture-note">
            <div><span>10×</span><p><strong>B1–B4</strong> complete hydrothermal trains</p></div>
            <span aria-hidden="true">→</span>
            <div><span>1×</span><p><strong>B5–B7</strong> shared clean-gas conversion island</p></div>
            <span aria-hidden="true">+</span>
            <div><span>B8</span><p><strong>Release</strong> qualified residue or retreat</p></div>
          </div>

          <TowngasProcessOverview />

          <div className="towngas-figure-heading">
            <div><p className="eyebrow">Operating windows</p><h3>How each train enters, changes, recovers, and leaves service</h3></div>
            <p>{data.availability.target}. {data.availability.basis}</p>
          </div>
          <div className="towngas-cert-grid">
            {data.operatingTransitions.map((transition, index) => (
              <article key={transition.id}>
                <header><span>{String(index + 1).padStart(2, "0")}</span><h3>{transition.title}</h3></header>
                <p>{transition.action}</p>
                <div><strong>Release condition</strong><p>{transition.release}</p></div>
              </article>
            ))}
          </div>
          <p className="towngas-efficiency-proof"><strong>Common-mode warning:</strong> {data.availability.warning}</p>

          <figure className="towngas-chemistry-strip">
            <div className="towngas-figure-heading"><div><p className="eyebrow">Chemistry in practical terms</p><h3>Why the methane-rich gas still needs B6</h3></div><p>Three process transformations; the full licensed kinetics remain a vendor and pilot workstream.</p></div>
            <ol>{data.chemistry.map((item) => <li key={item.step}><span>{item.step}</span><p>{item.label}</p><strong>{item.reaction}</strong><small>{item.note}</small></li>)}</ol>
            <figcaption>Figure 3. Simplified reaction sequence. Methane suppression in B2 can reduce B6 duty, but is not assumed sufficient to remove the reformer.</figcaption>
          </figure>
        </div>
      </section>

      <section className="towngas-section towngas-section--dark" id="balances">
        <div className="towngas-shell">
          <SectionHeading
            eyebrow="05 · Mass, carbon + energy"
            title="Nearly one million tonnes of slurry support tens of thousands of tonnes of olefins"
            lede={<p>The balances make the central design tension visible: water and mineral handling size the high-pressure plant, while only the renewable carbon fraction becomes saleable hydrocarbon product.</p>}
          />

          <figure className="towngas-v3-balance">
            <div className="towngas-v3-balance-in"><p>{data.massBalance.basis}</p><strong>300 <span>t/day in</span></strong>{data.massBalance.input.map((item) => <div key={item.label}><span>{item.label}</span><b>{item.value.toFixed(item.value % 1 ? 3 : 1)} t/d</b></div>)}</div>
            <div className="towngas-v3-balance-close"><span>Closed screen</span><strong>300</strong><small>t/day out</small></div>
            <ol>{data.massBalance.outputs.map((item) => <li key={item.label}><div><span>{item.label}</span><strong>{item.value.toFixed(2)} t/d</strong></div><Bar max={maxMassOutput} value={item.value} /><small>{item.note}</small></li>)}</ol>
            <figcaption>Figure 4. B1–B4 one-train pseudo-component closure. This is an arithmetic screening balance; rigorous H/O closure, salt speciation, and licensed gas properties remain open.</figcaption>
          </figure>

          <div className="towngas-carbon-cases">
            {data.carbonCases.map((item) => (
              <article key={item.id}><header><div><p>{item.label}</p><h3>{item.production.toFixed(2)} kt/year olefins</h3></div><strong>{item.efficiency}%</strong></header><dl><div><dt>Olefin carbon</dt><dd>{item.olefinCarbon.toFixed(3)} t C/day/train</dd></div><div><dt>Purge carbon</dt><dd>{item.purgeCarbon.toFixed(3)} t C/day/train</dd></div></dl></article>
            ))}
          </div>

          <div className="towngas-energy-v3">
            <div className="towngas-figure-heading"><div><p className="eyebrow">Heat-integration cascade</p><h3>1,060 gross → 260 purchased GJ/day per train</h3></div><p>Purchased-energy equivalent includes 205 GJ/day thermal and 55 GJ/day shaft/electric work.</p></div>
            <div className="towngas-energy-columns">
              <section><h4>Gross duties</h4>{data.energyCascade.gross.map((item) => <p key={item.label}><span>{item.label}</span><strong>+{item.value}</strong></p>)}</section>
              <section><h4>Recovery + credit</h4>{data.energyCascade.recovery.map((item) => <p key={item.label}><span>{item.label}</span><strong>−{item.value}</strong></p>)}</section>
              <section className="is-total"><h4>Site result</h4><p><span>Purchased equivalent</span><strong>{data.energyCascade.purchased.total}</strong></p>{data.energyCascade.site.map((item) => <p key={item.label}><span>{item.label}</span><small>{item.value}</small></p>)}</section>
            </div>
          </div>
        </div>
      </section>

      <section className="towngas-section towngas-section--tint" id="assurance">
        <div className="towngas-shell">
          <SectionHeading
            eyebrow="06 · Equipment + assurance"
            title="The process is released by measurements, not by equipment names"
            lede={<p>The public report carries the equipment quantities, chloride inventory controls, preliminary HAZOP, and analytical release plan into the website. These controls connect supplier acceptance to metallurgy, train isolation, product quality, and safe shutdown.</p>}
          />

          <div className="towngas-feed-controls towngas-assurance-controls">
            <details open>
              <summary>Major equipment and confirmation programme</summary>
              <div className="towngas-table-wrap"><table><thead><tr><th>Area / equipment</th><th>Quantity</th><th>Screening duty</th><th>Critical confirmation</th></tr></thead><tbody>{data.majorEquipment.map((item) => <tr key={item.area}><th>{item.area}</th><td>{item.quantity}</td><td>{item.duty}</td><td>{item.confirmation}</td></tr>)}</tbody></table></div>
            </details>
            <details>
              <summary>Plant-wide chloride control</summary>
              <div className="towngas-table-wrap"><table><thead><tr><th>Location</th><th>Measurement</th><th>Control response</th></tr></thead><tbody>{data.chlorideControls.map((item) => <tr key={item.location}><th>{item.location}</th><td>{item.measurement}</td><td>{item.response}</td></tr>)}</tbody></table></div>
            </details>
            <details>
              <summary>Preliminary HAZOP register</summary>
              <div className="towngas-table-wrap"><table><thead><tr><th>Deviation</th><th>Consequence</th><th>Safeguard / response</th></tr></thead><tbody>{data.hazop.map((item) => <tr key={item.deviation}><th>{item.deviation}</th><td>{item.consequence}</td><td>{item.safeguard}</td></tr>)}</tbody></table></div>
            </details>
            <details>
              <summary>Analytical release plan</summary>
              <div className="towngas-table-wrap"><table><thead><tr><th>Location</th><th>Online measurements</th><th>Laboratory / periodic measurements</th></tr></thead><tbody>{data.analyticalPlan.map((item) => <tr key={item.location}><th>{item.location}</th><td>{item.online}</td><td>{item.laboratory}</td></tr>)}</tbody></table></div>
            </details>
          </div>

          <p className="towngas-efficiency-proof"><strong>Relief philosophy:</strong> each hydrothermal train depressurises to its own water-filled quench / blowdown receiver. Dirty salt-bearing relief remains separated from the clean B5–B7 syngas and hydrocarbon relief system until composition and hydraulic studies justify any shared boundary.</p>
        </div>
      </section>

      <section className="towngas-section towngas-shell" id="certification">
        <SectionHeading
          eyebrow="07 · Certification + market position"
          title="Four claims, four separate evidence chains"
          lede={<p>Product footprint, certified attribution, residue treatment, and price premium are related but not interchangeable. The design keeps each claim narrow enough to audit and refuses value where contracts or measured performance do not yet exist.</p>}
        />
        <div className="towngas-cert-grid">
          {data.certification.map((item, index) => <article key={item.id}><header><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3></header><p>{item.claim}</p><div><strong>Do not imply</strong><p>{item.limit}</p></div><EvidenceTag basis={item.basis} /></article>)}
        </div>
      </section>

      <section className="towngas-section towngas-section--tint" id="economics">
        <div className="towngas-shell">
          <SectionHeading
            eyebrow="08 · China economics"
            title="Capital dilution—not catalyst price—is the financial problem"
            lede={<p>The high-pressure and salt-resistant plant is sized by 999,000 t/year of slurry, but its saleable olefin output is only 42.35–55.45 kt/year. Commercial success therefore requires a stack of operational and contractual improvements.</p>}
          />

          <div className="towngas-capital-dilution"><p className="eyebrow">Main cost driver</p><h3>RMB 2.814bn TCI</h3><p>Ten high-pressure feed, reactor, heat-recovery, and salt-separation trains process almost one million tonnes of watery slurry each year.</p><div><span>Class 4 range</span><strong>≈ RMB 2.2–4.0bn</strong><span>Improved-case cash OPEX</span><strong>RMB 219.9m/year</strong></div></div>

          <figure className="towngas-table-wrap">
            <table>
              <caption>Public planning inputs stated in the downloadable report</caption>
              <thead><tr><th>Input</th><th>Project quantity</th><th>Public unit basis</th><th>Annual treatment</th></tr></thead>
              <tbody>{data.publicPlanningInputs.map((item) => <tr key={item.input}><th>{item.input}</th><td>{item.quantity}</td><td>{item.basis}</td><td>{item.annual}</td></tr>)}</tbody>
            </table>
          </figure>

          <div className="towngas-cost-split">
            <figure><h3>CAPEX by area <span>RMB million</span></h3><ol>{data.capex.map((item) => <li key={item.label}><span>{item.label}</span><Bar max={maxCapex} value={item.value} /><strong>{item.value}</strong></li>)}</ol><figcaption>Table 1. China Class 4 screening estimate. B2 alone represents RMB 880m.</figcaption></figure>
            <figure><h3>Cash OPEX <span>RMB million/year · public planning basis</span></h3><ol>{data.opexDrivers.map((item) => <li key={item.label} title={item.note}><span>{item.label}</span><Bar max={maxPublicOpex} value={item.value} /><strong>{item.value.toFixed(1)}</strong></li>)}</ol><figcaption>Table 2. The public report states every line shown here. Subtotal before product tax is RMB 218.0m/year; the improved-conversion total is RMB 219.9m/year before the EU increment.</figcaption></figure>
          </div>

          <section className="towngas-efficiency-bridge" aria-labelledby="towngas-efficiency-title">
            <div className="towngas-figure-heading">
              <div><p className="eyebrow">42% → 55% carbon efficiency</p><h3 id="towngas-efficiency-title">Where the additional olefin carbon comes from</h3></div>
              <p>Efficiency is olefin carbon divided by the {data.carbonEfficiencyBridge.feedCarbon.toFixed(3)} t C/day entering one B1 train.</p>
            </div>

            <div className="towngas-efficiency-layout">
              <div className="towngas-table-wrap">
                <table>
                  <caption>Table 3. One-train carbon bridge, t C/day</caption>
                  <thead><tr><th>Carbon destination</th><th>42% case</th><th>55% target</th><th>Change</th></tr></thead>
                  <tbody>{data.carbonEfficiencyBridge.rows.map((row) => <tr className={`is-${row.role}`} key={row.destination}><th>{row.destination}</th><td>{row.current.toFixed(3)}</td><td>{row.target.toFixed(3)}</td><td>{row.change === 0 ? "—" : `${row.change > 0 ? "+" : "−"}${Math.abs(row.change).toFixed(3)}`}</td></tr>)}</tbody>
                </table>
              </div>
              <aside>
                <p className="eyebrow">What the model assumes</p>
                <strong>3.37 t C/day per train moves from purge into olefins.</strong>
                <p>{data.carbonEfficiencyBridge.conclusion}</p>
                <p className="towngas-testing-note">(needs testing)</p>
              </aside>
            </div>

            <div className="towngas-efficiency-areas">
              {data.carbonEfficiencyBridge.areas.map((area) => <article key={area.stage}><header><span>{area.stage}</span><div><p>{area.priority}</p><h4>{area.title}</h4></div></header><p>{area.action}</p></article>)}
            </div>

            <p className="towngas-efficiency-proof"><strong>Evidence required:</strong> {data.carbonEfficiencyBridge.testing}</p>
          </section>

          <div className="towngas-scenario-grid">
            {data.economicScenarios.map((scenario, index) => (
              <article className={`is-${scenario.tone}`} key={scenario.id}>
                <header><span>Scenario {index + 1}</span><h3>{scenario.name}</h3></header>
                <p className="towngas-scenario-question">{scenario.question}</p>
                <p className="towngas-scenario-npv"><span>20-year NPV</span><strong>{scenario.npv > 0 ? "+" : "−"}RMB {Math.abs(scenario.npv).toFixed(1)}m</strong></p>
                <dl>
                  <div><dt>Olefin</dt><dd>{scenario.production.toFixed(2)} kt/y</dd></div>
                  <div><dt>Revenue</dt><dd>RMB {scenario.revenue.toFixed(1)}m/y</dd></div>
                  <div><dt>Cash OPEX</dt><dd>RMB {scenario.opex.toFixed(1)}m/y</dd></div>
                  <div><dt>EBITDA</dt><dd>RMB {scenario.ebitda.toFixed(1)}m/y</dd></div>
                  <div><dt>IRR / payback</dt><dd>{scenario.irr} · {scenario.payback}</dd></div>
                  <div><dt>NPV after 70% / 90% ramp</dt><dd>{scenario.rampNpv > 0 ? "+" : "−"}RMB {Math.abs(scenario.rampNpv).toFixed(1)}m</dd></div>
                </dl>
                <div className="towngas-scenario-explanation">
                  <div><strong>What changes</strong><p>{scenario.changes}</p></div>
                  <div><strong>Assumption set</strong><p>{scenario.assumptions}</p></div>
                  <div><strong>How to read it</strong><p>{scenario.interpretation}</p></div>
                </div>
              </article>
            ))}
          </div>

          <div className="towngas-economic-tables">
            <figure className="towngas-table-wrap"><table><caption>Table 4. Premium and conversion thresholds</caption><thead><tr><th>Premium</th><th>Netback RMB/t</th><th>Break-even product</th><th>Break-even C efficiency</th><th>NPV at 55%</th></tr></thead><tbody>{data.breakEven.map((row) => <tr key={row.premium}><th>{row.premium}</th><td>{row.netback}</td><td>{row.product.toFixed(2)} kt/y</td><td>{row.efficiency.toFixed(1)}%</td><td>+RMB {row.npv55}m</td></tr>)}</tbody></table></figure>
            <div className="towngas-economic-risk-list">{data.economicRisks.map((risk) => <article key={risk.change}><div><h3>{risk.change}</h3><strong>{risk.impact}</strong></div><p>{risk.meaning}</p></article>)}</div>
          </div>

          <div className="towngas-figure-heading">
            <div><p className="eyebrow">Route decision</p><h3>OXZEO, methanol, or renewable methane</h3></div>
            <p>The design includes two fallback routes. They are complete battery-limit alternatives, not shortcuts that automatically remove the hydrothermal or gas-cleanup systems.</p>
          </div>
          <div className="towngas-cert-grid">
            {data.routeAlternatives.map((route, index) => (
              <article key={route.id}>
                <header><span>{String(index + 1).padStart(2, "0")}</span><h3>{route.route}</h3></header>
                <p>{route.configuration}</p>
                <p><strong>{route.scale}</strong></p>
                <div><strong>Commercial strength</strong><p>{route.strength}</p></div>
                <div><strong>Principal weakness</strong><p>{route.weakness}</p></div>
              </article>
            ))}
          </div>

          {hasPrivateAccess ? (
            <section aria-labelledby="towngas-private-cost-title" className="towngas-efficiency-bridge">
              <div className="towngas-figure-heading">
                <div><p className="eyebrow">Private project annex</p><h3 id="towngas-private-cost-title">Exact reference-derived cost inputs</h3></div>
                <p>This server-rendered annex is included only when the HTTP-only Towngas project session is valid.</p>
              </div>
              <div className="towngas-economic-tables">
                <figure className="towngas-table-wrap">
                  <table>
                    <caption>Private reference-derived alternative project OPEX basis</caption>
                    <thead><tr><th>Line item</th><th>RMB million/year</th><th>Calculation basis</th></tr></thead>
                    <tbody>{towngasConfidentialOpex.map((item) => <tr key={item.label}><th>{item.label}</th><td>{item.value.toFixed(1)}</td><td>{item.basis}</td></tr>)}</tbody>
                  </table>
                </figure>
                <figure className="towngas-table-wrap">
                  <table>
                    <caption>Reference 300 kt/year methanol cash-cost breakdown</caption>
                    <thead><tr><th>Reference item</th><th>Consumption</th><th>Unit price</th><th>RMB/t</th><th>RMB m/y</th></tr></thead>
                    <tbody>{towngasMethanolReferenceCosts.map((item) => <tr key={item.item}><th>{item.item}</th><td>{item.consumption}</td><td>{item.unitPrice}</td><td>{item.perTonne.toFixed(1)}</td><td>{item.annual.toFixed(2)}</td></tr>)}</tbody>
                  </table>
                </figure>
              </div>
              <p className="towngas-efficiency-proof"><strong>Scope limit:</strong> the disclosed methanol subtotal excludes raw feed, labour, depreciation, and fixed investment; it is a comparator, not a Towngas vendor quote.</p>
            </section>
          ) : (
            <aside className="towngas-feed-rule">
              <p className="eyebrow">Detailed cost inputs</p>
              <h3>The public planning basis is fully shown.</h3>
              <p>The public page now shows the report&apos;s complete public planning basis, including its stated OPEX line items and scenario results. The hidden Towngas project login is reserved for the separate reference-plant methanol component breakdown and source identities.</p>
            </aside>
          )}
        </div>
      </section>

      <section className="towngas-section towngas-shell" id="decision">
        <SectionHeading
          eyebrow="09 · Final design position"
          title="Technically coherent; commercially conditional"
          lede={<p>The design now states what is fixed, what is a controlled fallback, and what still needs evidence. These are the decisions that define the next development programme.</p>}
        />

        <div className="towngas-final-conclusion">
          <p>Final conclusion</p>
          <blockquote>The process is technically coherent and can become commercially credible, but only as an integrated waste-service and certified-carbon project. It should not be presented as a commodity-olefin plant that happens to use waste.</blockquote>
        </div>

        <div className="towngas-decision-ledger">{data.decisions.map((item) => <article key={item.topic}><h3>{item.topic}</h3><p>{item.position}</p></article>)}</div>

        <figure className="towngas-open-evidence">
          <div className="towngas-figure-heading"><div><p className="eyebrow">Next decision gate</p><h3>Load-bearing claims to retire</h3></div><p>Commercial FEED follows representative evidence and contracts; it is not the current project status.</p></div>
          <ol>{data.openEvidence.map((item) => <li key={item.id}><span>{item.id}</span><div><strong>{item.claim}</strong><p>{item.evidence}</p></div></li>)}</ol>
          <figcaption>Table 4. Condensed assumption-and-evidence register from the project appendix.</figcaption>
        </figure>
      </section>

      <section className="towngas-section towngas-section--report" id="report">
        <div className="towngas-shell">
          <div className="towngas-report-card">
            <div>
              <h2>Financing depends on conversion, contracts, and capital discipline</h2>
              <p>The design is capital-intensive and cannot rely on commodity product sales alone. A credible financing case emerges only when higher verified carbon conversion, dependable plant availability, contracted waste-service income, and certified product value are delivered together.</p>
              <p>The weaker configuration struggles to recover the infrastructure investment, while the improved configuration can support an investable case. Even then, the project has limited tolerance for construction overruns, slow ramp-up, unreliable salt handling, or a product premium that is not secured by contract.</p>
              <p>The public website reproduces the report&apos;s stated Class 4 capital estimate, rounded public utility assumptions, project OPEX allowances, and twenty-year scenario results. These remain screening inputs, not supplier quotations or guarantees.</p>
              <p>{data.meta.publicationNote}</p>
            </div>
            <aside><span>Capital character</span><strong>High-pressure, capital-intensive infrastructure</strong><span>Commercial foundation</span><strong>Waste service plus verified product value</strong><span>Financeability</span><strong>Conditional on conversion, availability, and contracts</strong></aside>
          </div>

          <div className="towngas-references"><div><p className="eyebrow">Source basis</p><h2>Report sections used on this page</h2></div><ol>{data.references.map((reference, index) => <li key={reference.id}><span>{String(index + 1).padStart(2, "0")}</span><p><strong>{reference.title}</strong><small>{reference.detail}</small></p></li>)}</ol></div>

          {hasPrivateAccess ? (
            <div className="towngas-references">
              <div><p className="eyebrow">Private source register</p><h2>References 36–46</h2></div>
              <ol>{towngasConfidentialSources.map((reference) => <li key={reference.id}><span>{reference.id}</span><p><strong>Restricted project source</strong><small>{reference.description}</small></p></li>)}</ol>
            </div>
          ) : (
            <details className="towngas-evidence-key">
              <summary>Public descriptions of References 36–46</summary>
              <div>{data.publicRestrictedSources.map((reference) => <p key={reference.id}><span><strong>{reference.id} · {reference.title}.</strong> {reference.detail}</span></p>)}</div>
            </details>
          )}

          <footer className="towngas-page-footer"><p>Screening / pre-FEED case study · {data.meta.reportDate}</p><div><Link href="/projects">All projects</Link><a href="#top">Back to top ↑</a></div></footer>
        </div>
      </section>
    </article>
  );
}
