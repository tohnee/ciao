import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      colors: {
        sidebar: "#1C1917",
        "sidebar-hover": "#292524",
        "sidebar-active": "#363231",
        surface: "#FFFFFF",
        "surface-warm": "#F8F6F3",
        background: "#FFFFFF",
        border: "#E6E2DC",
        "border-light": "#F0ECE6",
        accent: "#0D7C6B",
        "accent-hover": "#096454",
        "accent-light": "#E8F5F2",
        success: "#10B981",
        warning: "#D97706",
        danger: "#DC2626",
        muted: "#78716C",
        "muted-light": "#A8A29E",
      },
      borderRadius: {
        card: "12px",
        button: "8px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.06), 0 1px 4px -1px rgb(0 0 0 / 0.04)",
        sidebar: "1px 0 3px 0 rgb(0 0 0 / 0.04)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    }
  },
  plugins: [],
};

export default config;
