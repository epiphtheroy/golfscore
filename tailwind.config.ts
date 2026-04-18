import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Brand
        "brand-dark": "#0F1419",
        "brand-darker": "#1A1F2E",
        "brand-cyan": "#00E5FF",
        "brand-gold": "#FFD54F",
        // Player colors
        "player-bibi": "#E91E63",
        "player-able": "#9C27B0",
        "player-ethan": "#1E88E5",
        "player-jerry": "#43A047",
      },
      fontFamily: {
        display: ["'Black Han Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["Pretendard", "sans-serif"],
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "shine": "shine 3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(255, 213, 79, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(255, 213, 79, 0.6)" },
        },
        "shine": {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
