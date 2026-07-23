/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightish: "-0.02em",
        tighter2: "-0.03em",
      },
      colors: {
        ink: "#07070d",
        panel: "#101019",
        panel2: "#16161f",
        panel3: "#1d1d29",
        edge: "#25252f",
        edge2: "#33333f",
        neon: {
          green: "#7cff6b",
          cyan: "#5fd0ff",
          pink: "#ff5fa2",
          yellow: "#ffe14d",
          purple: "#a98bff",
        },
      },
      boxShadow: {
        // Layered elevation — a defined near-shadow, never a soft ghost halo.
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.7)",
        lift: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 16px 40px -16px rgba(0,0,0,0.85)",
        glow: "0 0 0 1px rgba(124,255,107,0.25), 0 0 28px -6px rgba(124,255,107,0.35)",
        "glow-cyan": "0 0 0 1px rgba(95,208,255,0.25), 0 0 28px -6px rgba(95,208,255,0.4)",
        "glow-purple": "0 0 0 1px rgba(169,139,255,0.25), 0 0 28px -6px rgba(169,139,255,0.4)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        slideup: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        popin: {
          "0%": { transform: "scale(0.96) translateY(6px)", opacity: "0" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        rise: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glowpulse: {
          "0%,100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        floaty: "floaty 4s ease-in-out infinite",
        slideup: "slideup 0.28s cubic-bezier(0.22,1,0.36,1)",
        popin: "popin 0.2s cubic-bezier(0.22,1,0.36,1)",
        rise: "rise 0.45s cubic-bezier(0.22,1,0.36,1) both",
        glowpulse: "glowpulse 3s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
