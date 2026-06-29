import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f5ef",
        ink: "#20231f",
        moss: "#526b46",
        lime: "#dbe9bd",
        clay: "#d77a55",
        mist: "#dce8e5",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        soft: "0 24px 60px rgba(32, 35, 31, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
