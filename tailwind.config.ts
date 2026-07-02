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
        cream: {
          DEFAULT: "#FDF8F3",
          muted: "#F7EFE6",
        },
        warm: "#F0E4D4",
        espresso: "#2A221C",
        charcoal: "#3D342C",
        amber: {
          DEFAULT: "#D4A96A",
          dark: "#B8894F",
        },
        sage: "#9AAB8C",
        rose: "#E8C4B8",
        stone: "#7A726A",
        glass: "rgba(253, 248, 243, 0.78)",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-instrument)", "Georgia", "serif"],
      },
      fontSize: {
        cozy: ["1.125rem", { lineHeight: "1.75rem" }],
        "cozy-lg": ["1.25rem", { lineHeight: "1.875rem" }],
      },
      borderRadius: {
        bezel: "2rem",
        inner: "calc(2rem - 0.375rem)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      boxShadow: {
        ambient: "0 24px 64px -20px rgba(42, 34, 28, 0.12)",
        elevated: "0 32px 80px -24px rgba(42, 34, 28, 0.16), 0 8px 24px -8px rgba(212, 169, 106, 0.15)",
        glow: "0 0 24px rgba(212, 169, 106, 0.35)",
        "glow-red": "0 0 20px rgba(220, 38, 38, 0.4)",
        "glow-green": "0 0 20px rgba(154, 171, 140, 0.5)",
      },
      spacing: {
        safe: "env(safe-area-inset-bottom)",
      },
      minHeight: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
