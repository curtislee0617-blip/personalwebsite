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

function iconRect(inner: string, width: number, height: number) {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>${inner}</svg>`;
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
    // Knife — guides and recipes, matching the attached reference exactly (light gray/white
    // two-tone blade, dark brown outline, orange handle with tan stripe and rivet), tilted a
    // little further anticlockwise from the reference's own angle so the tip sits top-left.
    match: (path) => path.startsWith("/recipes"),
    svg: iconRect(
      `
      <g transform='rotate(-35 16 19)'>
        <path d='M16 2 C19.5 8 21.5 14 21 21 C19 22.7 14.7 22.7 12 21 C11.5 14 13 7 16 2 Z' fill='#c9c5cf' stroke='#3d2817' stroke-width='1.1' stroke-linejoin='round'/>
        <path d='M15.6 3 C13.4 8 12.3 13.3 12.4 19.3 C13.3 19.9 14.4 20 15.1 19.6 C15.5 13.2 15.7 7 15.6 3 Z' fill='#eef0f2'/>
        <path d='M13 21 C12.2 24.2 12.4 28 13.5 31.2 C14.3 33 16.8 33 17.4 31.2 C18.3 28 18.1 24.2 17.5 21 Z' fill='#c8631c' stroke='#3d2817' stroke-width='1.1' stroke-linejoin='round'/>
        <path d='M14 21.3 C13.4 24.3 13.5 27.8 14.4 30.8 C14.9 31.9 15.7 31.9 16 31 C15.3 27.8 15 24.2 15.2 21.2 Z' fill='#eda23f'/>
        <circle cx='16.3' cy='29.3' r='0.85' fill='#1c0f06'/>
      </g>
    `,
      32,
      36,
    ),
    hotspot: [6, 5],
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

export function svgDataUrl(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function cursorCss(config: PageCursorConfig, isDark = false) {
  const svg = isDark && config.svgDark ? config.svgDark : config.svg;
  return `url("${svgDataUrl(svg)}") ${config.hotspot[0]} ${config.hotspot[1]}, auto`;
}

// The same icon used for the cursor, sized for an inline nav-menu glyph rather than a cursor.
export function navIconForPath(pathname: string): string | null {
  const match = pageCursors.find((entry) => entry.match(pathname));
  return match ? svgDataUrl(match.svg) : null;
}
