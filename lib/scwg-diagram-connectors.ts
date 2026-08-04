import type { ProcessBlock } from "@/lib/scwg-types";
import { SCWG_CH_JUMP, SCWG_CH_RECYCLE, type ScwgBox } from "@/lib/scwg-diagram-layout";

// Derives stream connectors from the block array by matching outlet tags to
// inlet tags. Pure geometry (SVG path strings + label coords), no JSX. This is
// what makes the diagram data-driven: a new block's streams route automatically.
//
// Flow is vertical (blocks stack top→bottom):
//   spine   down to the adjacent block (the backbone, centre line)
//   jump    down but skipping blocks (left "jump" channel)
//   recycle up to an earlier block (left "recycle" channel)
//   self    outlet re-entering the same block (small right-side loop)
//   feed    external inlet with no producer (stub into the left edge)
//   product outlet with no consumer (stub out of the right edge)

export type ScwgConnector = {
  key: string;
  tag: string;
  kind: "spine" | "jump" | "recycle" | "self" | "feed" | "product";
  from?: string;
  to?: string;
  d: string;
  label: [number, number];
};

const STUB = 46;

export function buildScwgConnectors(blocks: ProcessBlock[], boxes: ScwgBox[]): ScwgConnector[] {
  const boxById = new Map(boxes.map((box) => [box.id, box]));
  const producer = new Map<string, string>();
  const consumer = new Map<string, string>();

  blocks.forEach((block) => block.outlet.forEach((s) => producer.set(s.tag, block.id)));
  blocks.forEach((block) =>
    block.inlet.forEach((s) => {
      if (!consumer.has(s.tag)) consumer.set(s.tag, block.id);
    }),
  );

  const tags = new Set<string>([...producer.keys(), ...consumer.keys()]);
  const connectors: ScwgConnector[] = [];
  const pairCount = new Map<string, number>();
  let recycleChannelIndex = 0;

  const feedsByBlock = new Map<string, string[]>();
  const productsByBlock = new Map<string, string[]>();
  tags.forEach((tag) => {
    const p = producer.get(tag);
    const c = consumer.get(tag);
    if (!p && c) feedsByBlock.set(c, [...(feedsByBlock.get(c) ?? []), tag]);
    if (p && !c) productsByBlock.set(p, [...(productsByBlock.get(p) ?? []), tag]);
  });
  const feedIndex = new Map<string, number>();
  const productIndex = new Map<string, number>();

  tags.forEach((tag) => {
    const p = producer.get(tag);
    const c = consumer.get(tag);
    const from = p ? boxById.get(p) : undefined;
    const to = c ? boxById.get(c) : undefined;

    if (from && to) {
      const drow = to.row - from.row;
      if (drow === 0) {
        // self recycle — small loop off the right side
        const rx = from.x + from.w;
        const cy = from.cy;
        connectors.push({ key: tag, tag, kind: "self", from: p, to: c, d: `M ${rx} ${cy - 20} H ${rx + 34} V ${cy + 20} H ${rx}`, label: [rx + 34, cy] });
      } else if (drow === 1) {
        const pairKey = `${from.id}-${to.id}`;
        const n = pairCount.get(pairKey) ?? 0;
        pairCount.set(pairKey, n + 1);
        const dx = n === 0 ? 0 : n % 2 === 1 ? 26 * Math.ceil(n / 2) : -26 * (n / 2);
        const x = from.cx + dx;
        const y1 = from.y + from.h;
        const y2 = to.y;
        connectors.push({ key: tag, tag, kind: "spine", from: p, to: c, d: `M ${x} ${y1} V ${y2}`, label: [x, (y1 + y2) / 2] });
      } else if (drow > 1) {
        const ch = SCWG_CH_JUMP;
        connectors.push({ key: tag, tag, kind: "jump", from: p, to: c, d: `M ${from.x} ${from.cy} H ${ch} V ${to.cy} H ${to.x}`, label: [ch, (from.cy + to.cy) / 2] });
      } else {
        // Separate parallel recycle loops into adjacent left-hand channels so
        // water, CO₂ and mineral returns remain independently traceable.
        const ch = SCWG_CH_RECYCLE + recycleChannelIndex * 18;
        recycleChannelIndex += 1;
        connectors.push({ key: tag, tag, kind: "recycle", from: p, to: c, d: `M ${from.x} ${from.cy} H ${ch} V ${to.cy} H ${to.x}`, label: [ch, (from.cy + to.cy) / 2] });
      }
    } else if (to && !from) {
      const siblings = feedsByBlock.get(to.id) ?? [tag];
      const idx = feedIndex.get(to.id) ?? 0;
      feedIndex.set(to.id, idx + 1);
      const fy = to.y + (to.h * (idx + 1)) / (siblings.length + 1);
      connectors.push({ key: tag, tag, kind: "feed", to: c, d: `M ${to.x - STUB} ${fy} H ${to.x}`, label: [to.x - STUB, fy] });
    } else if (from && !to) {
      const siblings = productsByBlock.get(from.id) ?? [tag];
      const idx = productIndex.get(from.id) ?? 0;
      productIndex.set(from.id, idx + 1);
      const py = from.y + (from.h * (idx + 1)) / (siblings.length + 1);
      connectors.push({ key: tag, tag, kind: "product", from: p, d: `M ${from.x + from.w} ${py} H ${from.x + from.w + STUB}`, label: [from.x + from.w + STUB, py] });
    }
  });

  return connectors;
}
