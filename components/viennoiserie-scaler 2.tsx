"use client";

import { useMemo, useState } from "react";

const baseYield = 15;

const groups = [
  {
    title: "Croissant dough",
    items: [
      [375, "bread flour T65"],
      [375, "all-purpose flour T55"],
      [112, "granulated sugar"],
      [12, "salt"],
      [375, "whole milk"],
      [50, "unsalted butter, chilled"],
      [35, "fresh yeast"],
    ],
  },
  { title: "Butter block", items: [[500, "unsalted butter, chilled"]] },
  {
    title: "Egg wash",
    items: [[100, "whole eggs"], [100, "egg yolks"], [100, "milk"]],
  },
] as const;

function formatAmount(amount: number) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(1).replace(/\.0$/, "");
}

export function ViennoiserieScaler() {
  const [yieldAmount, setYieldAmount] = useState(baseYield);
  const multiplier = useMemo(() => yieldAmount / baseYield, [yieldAmount]);

  return (
    <section className="viennoiserie-scaler" aria-labelledby="viennoiserie-scaler-title">
      <div className="viennoiserie-scaler-heading">
        <div><p className="eyebrow">Kitchen tool</p><h3 id="viennoiserie-scaler-title">Scale the batch</h3></div>
        <label>Target yield <input aria-label="Target croissant yield" inputMode="numeric" min="1" max="200" step="1" type="number" value={yieldAmount} onChange={(event) => setYieldAmount(Math.max(1, Math.min(200, Number(event.target.value) || 1)))} /> croissants</label>
      </div>
      <p className="viennoiserie-scaler-note"><strong>Important:</strong> this adjusts ingredient quantities, including the butter block and egg wash. The size measurements in the method will be different for another batch size — do not follow the photographed sizing measurements after scaling.</p>
      <div className="viennoiserie-scaled-groups">
        {groups.map((group) => <div key={group.title}><h4>{group.title}</h4><ul>{group.items.map(([amount, ingredient]) => <li key={ingredient}><span>{formatAmount(amount * multiplier)} g</span>{ingredient}</li>)}</ul></div>)}
      </div>
    </section>
  );
}
