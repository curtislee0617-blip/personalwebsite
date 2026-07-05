export type PageCursorConfig = {
  match: (pathname: string) => boolean;
  svg: string;
  // Optional brighter variant used when the site is in dark mode.
  svgDark?: string;
  hotspot: [number, number];
};

// Each icon is drawn "tip up" then rotated about its own center so the tip lands at the
// top-left — the same contact-point convention a normal arrow cursor uses.
const ANGLE = -30;
const MAGNIFIER_ANGLE = -42;

function icon(inner: string, size: number) {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${inner}</svg>`;
}

function magnifier(ring: string, handle: string, glass: string) {
  return icon(
    `
    <g transform='rotate(${MAGNIFIER_ANGLE} 13 13)'>
      <line x1='13' y1='16.5' x2='13' y2='24' stroke='${handle}' stroke-width='3.4' stroke-linecap='round'/>
      <circle cx='13' cy='9' r='6.2' fill='${glass}' stroke='${ring}' stroke-width='2'/>
    </g>
  `,
    26,
  );
}

export const pageCursors: PageCursorConfig[] = [
  {
    // Fork — restaurants
    match: (path) => path.startsWith("/restaurants"),
    svg: icon(
      `
      <g transform='rotate(${ANGLE} 13 13)' fill='#c4ccd6' stroke='#767e8a' stroke-width='0.7' stroke-linejoin='round' stroke-linecap='round'>
        <rect x='8' y='3' width='1.5' height='7.4' rx='0.75'/>
        <rect x='10.75' y='3' width='1.5' height='7.4' rx='0.75'/>
        <rect x='13.5' y='3' width='1.5' height='7.4' rx='0.75'/>
        <path d='M7.6 9 h7.8 v1.2 c0 3.3 -7.8 3.3 -7.8 0 z'/>
        <path d='M10.55 12.3 h1.9 l-0.45 11.5 a0.5 0.5 0 0 1 -1 0 z'/>
      </g>
    `,
      26,
    ),
    hotspot: [4, 7],
  },
  {
    // Knife — guides and recipes (blade tip at top-left, black handle, lightened blade)
    match: (path) => path.startsWith("/recipes"),
    svg: icon(
      `
      <g transform='rotate(${ANGLE} 15 15)'>
        <path d='M15 2 L20 15 Q15 17.5 10 15 Z' fill='#cdd2d7' stroke='#3a3d42' stroke-width='1.4' stroke-linejoin='round'/>
        <line x1='13' y1='6' x2='17' y2='13' stroke='#f2f4f6' stroke-width='1.5' stroke-linecap='round' opacity='0.9'/>
        <rect x='11.5' y='15' width='7' height='11' rx='2.2' fill='#000000'/>
      </g>
    `,
      30,
    ),
    hotspot: [9, 3],
  },
  {
    // Screwdriver — tools (orange handle, silver shaft, flat tip at top-left)
    match: (path) => path.startsWith("/tools"),
    svg: icon(
      `
      <g transform='rotate(${ANGLE} 17 17)'>
        <path d='M13.8 4 h6.4 v3.2 h-6.4 z' fill='#cbd0d6' stroke='#1b1c1e' stroke-width='1.4' stroke-linejoin='round'/>
        <rect x='14.4' y='7' width='5.2' height='10' fill='#cbd0d6' stroke='#1b1c1e' stroke-width='1.4'/>
        <rect x='12.8' y='17' width='8.4' height='14' rx='1.2' fill='#f2a63d' stroke='#1b1c1e' stroke-width='1.7'/>
        <line x1='15.6' y1='19.5' x2='15.6' y2='28.5' stroke='#d1832b' stroke-width='1.2' stroke-linecap='round'/>
        <line x1='18.4' y1='19.5' x2='18.4' y2='28.5' stroke='#d1832b' stroke-width='1.2' stroke-linecap='round'/>
      </g>
    `,
      34,
    ),
    hotspot: [10, 6],
  },
  {
    // Yellow wave emoji — contact (hotspot on a raised fingertip)
    match: (path) => path.startsWith("/contact"),
    svg: icon(`<text x='16' y='25' font-size='26' text-anchor='middle'>\u{1F44B}</text>`, 32),
    hotspot: [18, 3],
  },
  {
    // Magnifying glass — projects and about (transparent lens; brighter ring/handle in dark mode)
    match: (path) => path.startsWith("/projects") || path.startsWith("/about"),
    svg: magnifier("#9ba1a8", "#000000", "none"),
    svgDark: magnifier("#eaf1f6", "#cfd6dd", "rgba(255,255,255,0.08)"),
    hotspot: [6, 5],
  },
];

export function cursorCss(config: PageCursorConfig, isDark = false) {
  const svg = isDark && config.svgDark ? config.svgDark : config.svg;
  const encoded = encodeURIComponent(svg);
  return `url("data:image/svg+xml,${encoded}") ${config.hotspot[0]} ${config.hotspot[1]}, auto`;
}
