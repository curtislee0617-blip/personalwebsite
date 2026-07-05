export type PageCursorConfig = {
  match: (pathname: string) => boolean;
  // Either an inline SVG icon...
  svg?: string;
  // ...or a raster image file (used exactly as-is, e.g. a downscaled artwork PNG).
  img?: string;
  // Optional brighter variant used when the site is in dark mode.
  svgDark?: string;
  hotspot: [number, number];
};

// Each SVG icon is drawn "tip up" then rotated about its own center so the tip lands at the
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
    // Compass — home (needle points at the top-left contact point; light face + halo so it
    // stays visible over the bright/dark photo wall). Exact match so it never shadows a section.
    match: (path) => path === "/",
    svg: icon(
      `
      <circle cx='14' cy='14' r='10.7' fill='#f2f3f4' stroke='#f2f3f4' stroke-width='2.2'/>
      <circle cx='14' cy='14' r='10' fill='#eef1f4' stroke='#c9962f' stroke-width='2'/>
      <g transform='rotate(-45 14 14)'>
        <polygon points='14,5 12.1,14 15.9,14' fill='#dc3c2c'/>
        <polygon points='14,23 12.1,14 15.9,14' fill='#b9c0c8'/>
      </g>
      <circle cx='14' cy='14' r='1.5' fill='#5b636c' stroke='#3a3f45' stroke-width='0.4'/>
    `,
      28,
    ),
    hotspot: [8, 8],
  },
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
    // Knife — guides and recipes. The exact attached artwork, background removed and downscaled.
    match: (path) => path.startsWith("/recipes"),
    img: "/cursors/knife-cursor.png",
    hotspot: [2, 0],
  },
  {
    // Screwdriver — tools. The exact attached artwork, background removed and downscaled.
    match: (path) => path.startsWith("/tools"),
    img: "/cursors/screwdriver-cursor.png",
    hotspot: [2, 1],
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

export function svgDataUrl(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function cursorUrl(config: PageCursorConfig, isDark: boolean) {
  if (config.img) return config.img;
  const svg = (isDark && config.svgDark ? config.svgDark : config.svg) ?? "";
  return svgDataUrl(svg);
}

export function cursorCss(config: PageCursorConfig, isDark = false) {
  return `url("${cursorUrl(config, isDark)}") ${config.hotspot[0]} ${config.hotspot[1]}, auto`;
}

// The same icon used for the cursor, sized for an inline nav-menu glyph rather than a cursor.
export function navIconForPath(pathname: string): string | null {
  const match = pageCursors.find((entry) => entry.match(pathname));
  return match ? cursorUrl(match, false) : null;
}
