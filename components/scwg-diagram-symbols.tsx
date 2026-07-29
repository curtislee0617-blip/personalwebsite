import type { BlockSymbol } from "@/lib/scwg-types";

// Aspen Plus / ISA-5.1 PFD unit-operation glyphs. Each is drawn inside a unit
// box of the given width/height with near-black linework (currentColor, set to
// the ink token by the diagram). Selected by the block's `symbol` field so a new
// block gets the correct symbol automatically. Kept in its own file to keep the
// diagram component under the size limit.

type GlyphProps = { w: number; h: number };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

function MixPump({ w, h }: GlyphProps) {
  // Slurry mix tank + positive-displacement pump (circle with triangle).
  const tankW = w * 0.5;
  const tankH = h * 0.66;
  const tankX = w * 0.06;
  const tankY = (h - tankH) / 2;
  const pr = h * 0.16;
  const pcx = w * 0.78;
  const pcy = h * 0.5;
  return (
    <g {...stroke}>
      <rect height={tankH} rx={4} width={tankW} x={tankX} y={tankY} />
      <path d={`M ${tankX + 6} ${tankY + 8} h ${tankW - 12}`} opacity={0.5} />
      <path d={`M ${tankX + tankW} ${pcy} H ${pcx - pr}`} />
      <circle cx={pcx} cy={pcy} r={pr} />
      <path d={`M ${pcx - pr * 0.45} ${pcy - pr * 0.55} L ${pcx + pr * 0.6} ${pcy} L ${pcx - pr * 0.45} ${pcy + pr * 0.55} Z`} />
    </g>
  );
}

function TubularReactor({ w, h }: GlyphProps) {
  // Vertical tubular high-pressure reactor with packed-bed hatch.
  const bw = w * 0.42;
  const bx = (w - bw) / 2;
  const by = h * 0.08;
  const bh = h * 0.84;
  const rows = 5;
  return (
    <g {...stroke}>
      <rect height={bh} rx={bw * 0.28} width={bw} x={bx} y={by} />
      {Array.from({ length: rows }, (_, i) => {
        const y = by + bh * (0.2 + (0.6 * i) / (rows - 1));
        return <path d={`M ${bx + 5} ${y} h ${bw - 10}`} key={i} opacity={0.6} />;
      })}
    </g>
  );
}

function Cyclone({ w, h }: GlyphProps) {
  // Cyclone body with tangential inlet.
  const cx = w * 0.5;
  const top = h * 0.12;
  const bodyBottom = h * 0.5;
  const tipY = h * 0.9;
  const half = w * 0.2;
  return (
    <g {...stroke}>
      <path
        d={`M ${cx - half} ${top} h ${half * 2} v ${bodyBottom - top} L ${cx} ${tipY} L ${cx - half} ${bodyBottom} Z`}
      />
      <path d={`M ${cx - half - w * 0.14} ${top + 6} h ${w * 0.14}`} />
      <path d={`M ${cx} ${top} v ${-h * 0.08}`} />
    </g>
  );
}

function FlashDrum({ w, h }: GlyphProps) {
  // Let-down valve (bowtie) + horizontal flash drum.
  const vcx = w * 0.2;
  const vcy = h * 0.5;
  const vs = h * 0.14;
  const dx = w * 0.42;
  const dw = w * 0.5;
  const dh = h * 0.5;
  const dy = (h - dh) / 2;
  return (
    <g {...stroke}>
      <path d={`M ${vcx - vs} ${vcy - vs} L ${vcx + vs} ${vcy + vs} L ${vcx + vs} ${vcy - vs} L ${vcx - vs} ${vcy + vs} Z`} />
      <path d={`M ${vcx + vs} ${vcy} H ${dx}`} />
      <rect height={dh} rx={dh / 2} width={dw} x={dx} y={dy} />
    </g>
  );
}

function AbsorberPair({ w, h }: GlyphProps) {
  // Packed absorber + regenerator column pair, plus a small guard vessel.
  const cw = w * 0.2;
  const ch = h * 0.8;
  const cy = h * 0.1;
  const c1x = w * 0.08;
  const c2x = w * 0.4;
  const gx = w * 0.74;
  const gw = w * 0.16;
  const gh = h * 0.4;
  const gy = (h - gh) / 2;
  const col = (x: number) => (
    <g>
      <rect height={ch} rx={cw * 0.4} width={cw} x={x} y={cy} />
      <path d={`M ${x + 4} ${cy + ch * 0.35} h ${cw - 8}`} opacity={0.55} />
      <path d={`M ${x + 4} ${cy + ch * 0.6} h ${cw - 8}`} opacity={0.55} />
    </g>
  );
  return (
    <g {...stroke}>
      {col(c1x)}
      {col(c2x)}
      <path d={`M ${c1x + cw} ${h * 0.3} H ${c2x}`} opacity={0.7} />
      <rect height={gh} rx={4} width={gw} x={gx} y={gy} />
    </g>
  );
}

function FiredReformer({ w, h }: GlyphProps) {
  // Fired tubular reformer: radiant box with vertical tubes.
  const bx = w * 0.14;
  const bw = w * 0.72;
  const by = h * 0.12;
  const bh = h * 0.76;
  const tubes = 4;
  return (
    <g {...stroke}>
      <rect height={bh} width={bw} x={bx} y={by} />
      {Array.from({ length: tubes }, (_, i) => {
        const x = bx + bw * (0.2 + (0.6 * i) / (tubes - 1));
        return <path d={`M ${x} ${by + 8} v ${bh - 16}`} key={i} opacity={0.7} />;
      })}
      {/* burner flames along the base */}
      {Array.from({ length: 3 }, (_, i) => {
        const x = bx + bw * (0.3 + 0.2 * i);
        return <path d={`M ${x} ${by + bh} l 4 8 l -8 0 z`} key={`f${i}`} opacity={0.6} />;
      })}
    </g>
  );
}

function FixedBed({ w, h }: GlyphProps) {
  // Fixed-bed catalytic reactor with internal bed indication.
  const bw = w * 0.44;
  const bx = (w - bw) / 2;
  const by = h * 0.1;
  const bh = h * 0.8;
  const bandY = by + bh * 0.32;
  const bandH = bh * 0.36;
  return (
    <g {...stroke}>
      <rect height={bh} rx={bw * 0.24} width={bw} x={bx} y={by} />
      <rect fill="currentColor" fillOpacity={0.12} height={bandH} stroke="none" width={bw - 8} x={bx + 4} y={bandY} />
      <path d={`M ${bx + 4} ${bandY} h ${bw - 8}`} opacity={0.6} />
      <path d={`M ${bx + 4} ${bandY + bandH} h ${bw - 8}`} opacity={0.6} />
    </g>
  );
}

function Regenerator({ w, h }: GlyphProps) {
  // Rotary/fluid-bed regenerator + small leach train.
  const cx = w * 0.3;
  const cy = h * 0.5;
  const r = h * 0.3;
  const tx = w * 0.62;
  const tw = w * 0.12;
  const th = h * 0.34;
  const ty = (h - th) / 2;
  return (
    <g {...stroke}>
      <circle cx={cx} cy={cy} r={r} />
      <path d={`M ${cx} ${cy} m ${-r * 0.5} 0 a ${r * 0.5} ${r * 0.5} 0 1 0 ${r} 0`} opacity={0.6} />
      <path d={`M ${cx + r} ${cy} H ${tx}`} />
      <rect height={th} rx={3} width={tw} x={tx} y={ty} />
      <rect height={th} rx={3} width={tw} x={tx + tw * 1.5} y={ty} />
      <path d={`M ${tx + tw} ${cy} h ${tw * 0.5}`} opacity={0.7} />
    </g>
  );
}

const GLYPHS: Record<BlockSymbol, (props: GlyphProps) => React.ReactElement> = {
  "mix-pump": MixPump,
  "tubular-reactor": TubularReactor,
  cyclone: Cyclone,
  "flash-drum": FlashDrum,
  "absorber-pair": AbsorberPair,
  "fired-reformer": FiredReformer,
  "fixed-bed": FixedBed,
  regenerator: Regenerator,
};

export function BlockGlyph({ symbol, w, h }: { symbol: BlockSymbol } & GlyphProps) {
  const Glyph = GLYPHS[symbol];
  return <Glyph h={h} w={w} />;
}
