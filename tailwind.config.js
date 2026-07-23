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
        // Warm-neutral dark base (one consistent hue family, not cool blue-black).
        ink: "#0c0b09",
        panel: "#17150f",
        panel2: "#1c1a13",
        panel3: "#232019",
        edge: "#2c2820",
        edge2: "#3a352a",
        /*
         * A single refined accent (warm amber/gold) carries every primary
         * action, focus ring, and "brand" moment across the main app chrome.
         * The remaining hues are desaturated and used ONLY for semantic
         * meaning (status/priority), never as decoration. `neon.purple` is
         * reserved for the Study Spirits gacha sub-brand and should not leak
         * into the main app.
         */
        neon: {
          green: "#e0a84d", // primary accent
          cyan: "#8fb0c9", // muted steel-blue — info / low priority
          pink: "#d97b6c", // muted coral — danger / high priority / overdue
          yellow: "#c99a5a", // muted bronze — warning / medium priority (gacha epic)
          purple: "#a794d1", // muted violet — gacha sub-brand only
        },
      },
      boxShadow: {
        // Layered elevation — a defined near-shadow, never a soft ghost halo.
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.7)",
        lift: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 16px 40px -16px rgba(0,0,0,0.85)",
        // Reserved for genuinely earned moments (level-up, legendary summon),
        // not default hover states — kept subtle even there.
        glow: "0 0 0 1px rgba(224,168,77,0.2), 0 0 14px -6px rgba(224,168,77,0.3)",
        "glow-cyan": "0 0 0 1px rgba(143,176,201,0.18), 0 0 14px -6px rgba(143,176,201,0.28)",
        "glow-purple": "0 0 0 1px rgba(167,148,209,0.2), 0 0 14px -6px rgba(167,148,209,0.32)",
      },
      keyframes: {
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
