import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./remotion/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bay: {
          charcoal: "#1A1712",
          panel: "#232019",
          "panel-raised": "#2C281F",
          hairline: "#3A3427",
        },
        amber: {
          DEFAULT: "#E8A33D",
          dim: "#B87F2B",
        },
        tally: {
          DEFAULT: "#C0453B",
          dim: "#8E2B23",
        },
        moss: {
          DEFAULT: "#7FA37A",
          dim: "#567552",
        },
        cue: "#F3EFE6",
        ash: {
          DEFAULT: "#A79E8E",
          dim: "#766E5F",
          dark: "#4B4438",
        },
      },
      fontFamily: {
        sans: ["General Sans", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        monitor: "0 0 0 1px #3A3427, 0 16px 36px -8px rgba(0, 0, 0, 0.75)",
        raised: "0 4px 16px -2px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
