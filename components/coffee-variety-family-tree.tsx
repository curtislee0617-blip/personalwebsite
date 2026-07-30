"use client";

import { useState } from "react";
import {
  coffeeVarieties,
  coffeeVarietyConnections,
  type VarietyGroup,
} from "@/data/coffee-guide-data";

type TreePosition = { x: number; y: number };

const nodeWidth = 158;
const nodeHeight = 54;
const treeWidth = 1420;
const treeHeight = 910;

const positions: Record<string, TreePosition> = {
  eugenioides: { x: 22, y: 18 },
  canephora: { x: 22, y: 102 },
  arabica: { x: 218, y: 60 },
  "ethiopian-landraces": { x: 414, y: 30 },
  typica: { x: 414, y: 270 },
  bourbon: { x: 414, y: 520 },
  "timor-hybrid": { x: 414, y: 722 },
  "robusta-selections": { x: 414, y: 832 },
  gesha: { x: 626, y: 0 },
  "rume-sudan": { x: 626, y: 68 },
  java: { x: 626, y: 136 },
  kurume: { x: 626, y: 204 },
  "blue-mountain": { x: 626, y: 252 },
  maragogipe: { x: 626, y: 320 },
  pache: { x: 626, y: 388 },
  kent: { x: 626, y: 456 },
  caturra: { x: 626, y: 510 },
  pacas: { x: 626, y: 578 },
  "villa-sarchi": { x: 626, y: 646 },
  sl28: { x: 626, y: 714 },
  "mundo-novo": { x: 846, y: 250 },
  pacamara: { x: 846, y: 326 },
  catuai: { x: 846, y: 402 },
  catimor: { x: 846, y: 502 },
  sarchimor: { x: 846, y: 584 },
  castillo: { x: 1048, y: 438 },
  "costa-rica-95": { x: 1048, y: 504 },
  "ihcafe-90": { x: 1048, y: 570 },
  marsellesa: { x: 1048, y: 636 },
  parainema: { x: 1048, y: 702 },
  "ruiru-11": { x: 1244, y: 438 },
  batian: { x: 1244, y: 510 },
  centroamericano: { x: 1244, y: 582 },
  starmaya: { x: 1244, y: 654 },
  "tr-clones": { x: 684, y: 832 },
  "bp-534": { x: 914, y: 832 },
  conilon: { x: 1144, y: 832 },
};

const groupLabels: Array<{ group: VarietyGroup; label: string }> = [
  { group: "species", label: "Species" },
  { group: "ethiopian", label: "Ethiopian diversity" },
  { group: "traditional", label: "Bourbon–Typica" },
  { group: "introgressed", label: "Introgressed" },
  { group: "hybrid", label: "F1 & complex hybrids" },
  { group: "robusta", label: "Robusta selections" },
];

function connectionPath(parent: TreePosition, child: TreePosition) {
  const startX = parent.x + nodeWidth;
  const startY = parent.y + nodeHeight / 2;
  const endX = child.x;
  const endY = child.y + nodeHeight / 2;
  const curve = Math.max(36, (endX - startX) * 0.48);
  return `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`;
}

export function CoffeeVarietyFamilyTree() {
  const [selectedId, setSelectedId] = useState("arabica");
  const selected = coffeeVarieties.find((variety) => variety.id === selectedId) ?? coffeeVarieties[0];
  const connectedIds = new Set(
    coffeeVarietyConnections
      .filter(([parentId, childId]) => parentId === selectedId || childId === selectedId)
      .flat(),
  );

  return (
    <div className="coffee-variety-explorer">
      <div className="coffee-variety-intro">
        <div>
          <p className="eyebrow">How to read the tree</p>
          <p>
            Follow a line to see a known parent or a direct selection. The words “landrace”, “family” and “composite”
            can each describe a whole population, which is why this tree occasionally looks more like a bowl of
            spaghetti. Coffee plants refuse to fit into a perfectly tidy pedigree.
          </p>
        </div>
        <div className="coffee-variety-legend" aria-label="Variety lineage legend">
          {groupLabels.map(({ group, label }) => (
            <span data-group={group} key={group}><i aria-hidden="true" />{label}</span>
          ))}
        </div>
      </div>

      <article aria-live="polite" className="coffee-variety-selection">
        <header>
          <div>
            <p className="eyebrow">{groupLabels.find((item) => item.group === selected.group)?.label}</p>
            <h3>{selected.name}</h3>
          </div>
          <span>{selected.lineage}</span>
        </header>
        <div>
          <p>{selected.description}</p>
          <dl>
            <div>
              <dt>Agronomy & cup</dt>
              <dd>{selected.traits}</dd>
            </div>
            <div>
              <dt>Associated origins</dt>
              <dd>{selected.associatedOrigins.join(" · ")}</dd>
            </div>
          </dl>
        </div>
      </article>

      <div
        aria-label="Scrollable coffee variety family tree"
        className="coffee-variety-scroll"
        role="region"
        tabIndex={0}
      >
        <div className="coffee-variety-canvas" style={{ height: treeHeight, width: treeWidth }}>
          <svg
            aria-hidden="true"
            className="coffee-variety-connections"
            height={treeHeight}
            viewBox={`0 0 ${treeWidth} ${treeHeight}`}
            width={treeWidth}
          >
            {coffeeVarietyConnections.map(([parentId, childId]) => {
              const parent = positions[parentId];
              const child = positions[childId];
              if (!parent || !child) return null;
              const isActive = parentId === selectedId || childId === selectedId;

              return (
                <path
                  d={connectionPath(parent, child)}
                  data-active={isActive || undefined}
                  key={`${parentId}-${childId}`}
                />
              );
            })}
          </svg>

          {coffeeVarieties.map((variety) => {
            const position = positions[variety.id];
            if (!position) return null;
            const isSelected = selectedId === variety.id;
            const isConnected = connectedIds.has(variety.id);

            return (
              <button
                aria-pressed={isSelected}
                className="coffee-variety-node"
                data-connected={isConnected || undefined}
                data-group={variety.group}
                key={variety.id}
                onClick={() => setSelectedId(variety.id)}
                style={{ left: position.x, top: position.y }}
                type="button"
              >
                <strong>{variety.name}</strong>
                <span>{variety.lineage}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="coffee-variety-mobile-index" aria-label="Coffee varieties">
        {groupLabels.map(({ group, label }) => (
          <section key={group}>
            <h4><i aria-hidden="true" data-group={group} />{label}</h4>
            <div>
              {coffeeVarieties.filter((variety) => variety.group === group).map((variety) => (
                <button
                  aria-pressed={selectedId === variety.id}
                  key={variety.id}
                  onClick={() => setSelectedId(variety.id)}
                  type="button"
                >
                  {variety.name}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="coffee-variety-source">
        I have followed the lineage and parentage in the{" "}
        <a href="https://varieties.worldcoffeeresearch.org/" rel="noreferrer" target="_blank">
          World Coffee Research Coffee Varieties Catalog
        </a>
        . It profiles more than 100 Arabica and Robusta varieties; this tree sticks to the main branches that explain
        the names we are most likely to meet on a bag of coffee.
      </p>
    </div>
  );
}
