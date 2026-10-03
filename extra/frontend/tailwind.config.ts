import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#0A0A0C",
        panel: "#111113",
        card: "#15151a",
        border: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "brand-gradient": "linear-gradient(135deg, #3b82f6, #06b6d4, #a855f7)",
      },
      backgroundSize: {
        grid: "32px 32px",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(59,130,246,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
