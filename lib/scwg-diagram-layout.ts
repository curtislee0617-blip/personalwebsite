import type { ProcessBlock } from "@/lib/scwg-types";

// Pure geometry for the process diagram, shared by the diagram (rendering) and
// the scroller (viewBox targeting). No JSX, no client code. Everything derives
// from the block array, so adding a block extends the diagram automatically.
//
// The flow is VERTICAL: blocks stack top→bottom (B1 at the top), so scrolling
// down the descriptions reads as descending through the plant. The spine runs
// down the centre; feeds enter from the left, products exit to the right, and
// recycle / skip streams run in side channels.

export const SCWG_BOX_W = 288;
export const SCWG_BOX_H = 120;
export const SCWG_CELL_H = 210; // vertical pitch between block centres
export const SCWG_MARGIN_Y = 44;

export const SCWG_VIEW_W = 720;
export const SCWG_CENTER_X = SCWG_VIEW_W / 2;

// Side channels (x positions) for non-spine streams.
export const SCWG_CH_RECYCLE = 34;
export const SCWG_CH_JUMP = 74;

export function scwgViewHeight(count: number): number {
  return SCWG_MARGIN_Y * 2 + (count - 1) * SCWG_CELL_H + SCWG_BOX_H;
}

export type ScwgBox = {
  id: string;
  row: number;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
};

export function scwgBoxes(blocks: ProcessBlock[]): ScwgBox[] {
  return blocks.map((block, index) => {
    const y = SCWG_MARGIN_Y + index * SCWG_CELL_H;
    const x = SCWG_CENTER_X - SCWG_BOX_W / 2;
    return { id: block.id, row: index, x, y, w: SCWG_BOX_W, h: SCWG_BOX_H, cx: SCWG_CENTER_X, cy: y + SCWG_BOX_H / 2 };
  });
}

/** Target viewBox that centres a block vertically with neighbours visible, clamped to the extent. */
export function scwgViewBoxFor(box: ScwgBox | undefined, count: number): [number, number, number, number] {
  const viewH = scwgViewHeight(count);
  if (!box) return [0, 0, SCWG_VIEW_W, viewH];
  const vw = SCWG_VIEW_W;
  const vh = SCWG_CELL_H * 3.4; // taller sticky panel — show the active block plus more context
  let vy = box.cy - vh / 2;
  vy = Math.max(0, Math.min(vy, viewH - vh));
  return [0, vy, vw, vh];
}
