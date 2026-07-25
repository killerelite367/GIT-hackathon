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
         * ── Main app: refined "twilight" dark theme ──────────────
         * A deep slate base (not harsh black) with elevated surfaces, so the
         * UI reads as a considered mix of tones rather than either glaring
         * white or flat black. One confident violet accent carries actions.
         * Semantic hues are dark-tuned; each has a `-deep` LIGHT variant for
         * readable coloured text and a `-soft` DEEP variant for tinted chips.
         * Same token NAMES as before, so components re-theme by value.
         */
        canvas: "#131319", // body — deep slate, faint cool-violet
        surface: "#1c1c26", // elevated cards
        surface2: "#24242f", // insets / inputs
        line: "#2c2c3a", // hairline borders
        line2: "#3b3b4e", // stronger borders / hover
        night: "#ecebf3", // primary text (near-white)
        dusk: "#a8a4bd", // secondary text
        haze: "#8b86a4", // tertiary text / muted labels (AA on dark surface)
        brand: { DEFAULT: "#8f74ff", soft: "#241d3b", deep: "#bca9ff" }, // violet
        warm: { DEFAULT: "#f2b452", soft: "#2f2413", deep: "#f8ca7d" }, // honey — XP / streak
        grass: { DEFAULT: "#2fbe85", soft: "#122c22", deep: "#63e3a9" }, // success / done
        berry: { DEFAULT: "#f2687d", soft: "#321a20", deep: "#ff97a2" }, // danger / high priority
        sky: { DEFAULT: "#5aa7ef", soft: "#152633", deep: "#8cc3f7" }, // info / low priority

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
        /*
         * ── Twilight depth ──
         * On dark, a drop shadow is nearly invisible, so elevation comes from
         * a deeper drop PLUS a 1px inset top highlight that catches the light —
         * the trick that makes dark surfaces read as genuinely raised.
         */
        soft: "0 1px 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        raised:
          "0 10px 28px -10px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)",
        pop: "0 24px 56px -18px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)",
        brand: "0 10px 26px -8px rgba(143,116,255,0.55)",
        warm: "0 10px 26px -8px rgba(242,180,82,0.4)",
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
        viewin: {
          "0%": { transform: "translateY(8px) scale(0.995)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
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
        viewin: "viewin 0.4s cubic-bezier(0.22,1,0.36,1) both",
        glowpulse: "glowpulse 3s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
