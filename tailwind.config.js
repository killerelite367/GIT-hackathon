/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        ink: "#0a0a12",
        panel: "#12121f",
        panel2: "#191927",
        edge: "#262636",
        neon: {
          green: "#7cff6b",
          cyan: "#5fd0ff",
          pink: "#ff5fa2",
          yellow: "#ffe14d",
          purple: "#a98bff",
        },
      },
      boxShadow: {
        glow: "0 0 24px -4px rgba(124,255,107,0.35)",
        "glow-cyan": "0 0 24px -4px rgba(95,208,255,0.4)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        floaty: "floaty 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
