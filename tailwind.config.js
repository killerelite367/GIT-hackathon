/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        /*
         * Display: Bricolage Grotesque — a characterful variable grotesque
         * that gives headings a real voice instead of the default-sans look.
         * Body: Figtree — warm, highly legible, friendly for students.
         * Mono: JetBrains Mono — reserved for actual data (module codes,
         * dates, counters), never as decoration.
         */
        display: ['"Bricolage Grotesque"', "Figtree", "system-ui", "sans-serif"],
        sans: ["Figtree", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightish: "-0.02em",
        tighter2: "-0.03em",
      },
      colors: {
        /*
         * ── Main app: bright & friendly light theme ──────────────
         * A warm-but-cool near-white canvas with white cards, one confident
         * violet brand color, and friendly semantic hues. High-contrast ink
         * for text. This is what the whole app (except the Summon view) uses.
         */
        canvas: "#f3f2fb", // body background — light, faint violet-grey (not cream)
        surface: "#ffffff", // cards
        surface2: "#f5f3fd", // insets / inputs
        line: "#e7e3f2", // hairline borders
        line2: "#d6d0e8", // stronger borders / hover
        night: "#1c1830", // primary text (violet-black)
        dusk: "#4f4866", // secondary text
        haze: "#5e5678", // tertiary text / muted labels (AA on the light canvas)
        brand: { DEFAULT: "#6d49ff", soft: "#ece7ff", deep: "#4a2fd0" }, // violet
        warm: { DEFAULT: "#f39a1a", soft: "#fdeecd", deep: "#b5730b" }, // honey — XP / rewards / streak
        grass: { DEFAULT: "#17a06a", soft: "#d7f1e5", deep: "#0d8256" }, // success / done
        berry: { DEFAULT: "#e5476a", soft: "#fbdde4", deep: "#c72d50" }, // danger / high priority / overdue
        sky: { DEFAULT: "#2f8fe0", soft: "#dcecfb", deep: "#1f6fb8" }, // info / low priority

        /*
         * ── Summon (gacha) sub-brand: dark immersive stage ───────
         * Left intact for the Study Spirits view, which is a deliberate dark
         * "chamber" within the bright app. Do not use these in the main app.
         */
        ink: "#0d0d16",
        panel: "#17150f",
        panel2: "#1c1a13",
        panel3: "#232019",
        edge: "#2c2820",
        edge2: "#3a352a",
        neon: {
          green: "#7cff6b",
          cyan: "#5fd0ff",
          pink: "#ff5fa2",
          yellow: "#ffe14d",
          purple: "#a98bff",
        },
      },
      boxShadow: {
        // ── Light-theme depth: soft, violet-tinted, friendly ──
        soft: "0 1px 2px rgba(28,24,48,0.05), 0 2px 8px -3px rgba(80,70,130,0.10)",
        raised: "0 1px 2px rgba(28,24,48,0.05), 0 8px 22px -8px rgba(80,70,130,0.16)",
        pop: "0 2px 6px rgba(28,24,48,0.06), 0 18px 40px -12px rgba(80,70,130,0.26)",
        brand: "0 8px 20px -6px rgba(109,73,255,0.45)",
        warm: "0 8px 20px -6px rgba(243,154,26,0.45)",
        // ── Dark gacha tokens (kept for the Summon view) ──
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.7)",
        lift: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 16px 40px -16px rgba(0,0,0,0.85)",
        glow: "0 0 0 1px rgba(255,225,77,0.25), 0 0 24px -6px rgba(255,225,77,0.4)",
        "glow-cyan": "0 0 0 1px rgba(95,208,255,0.25), 0 0 24px -6px rgba(95,208,255,0.4)",
        "glow-purple": "0 0 0 1px rgba(169,139,255,0.25), 0 0 24px -6px rgba(169,139,255,0.4)",
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
