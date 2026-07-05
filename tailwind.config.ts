import type { Config } from "tailwindcss";

// Colors are stored as "R G B" CSS custom properties (see :root/.dark in globals.css) so
// Tailwind's opacity modifiers (e.g. bg-ink/10) keep working across the light/dark swap.
function withOpacity(variable: string) {
  return ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined ? `rgb(var(${variable}))` : `rgb(var(${variable}) / ${opacityValue})`;
}

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: withOpacity("--color-paper"),
        ink: withOpacity("--color-ink"),
        moss: withOpacity("--color-moss"),
        lime: withOpacity("--color-lime"),
        clay: withOpacity("--color-clay"),
        mist: withOpacity("--color-mist"),
        surface: withOpacity("--color-surface"),
      } as unknown as Record<string, string>,
      fontFamily: {
        sans: ["Roboto", "Arial", "sans-serif"],
        serif: ["Roboto", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 60px rgba(32, 35, 31, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
