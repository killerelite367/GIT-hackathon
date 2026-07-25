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
         * ── Themed tokens ────────────────────────────────────────
         * Every one of these resolves to a CSS variable, so the whole app
         * re-themes by swapping values on <html> — no component knows which
         * theme is active. Values live in index.css:
         *   dark  → the original "twilight" violet-on-slate
         *   light → a near-monochrome paper theme
         *
         * Channels are stored space-separated ("143 116 255") rather than as
         * hex so Tailwind's slash-opacity syntax (bg-brand/40) still works.
         *
         * `-deep` is always the higher-contrast variant for coloured TEXT and
         * `-soft` the tinted chip background — which means they swap lightness
         * between themes rather than swapping meaning.
         */
        canvas: "rgb(var(--c-canvas) / <alpha-value>)", // page background
        surface: "rgb(var(--c-surface) / <alpha-value>)", // elevated cards
        surface2: "rgb(var(--c-surface2) / <alpha-value>)", // insets / inputs
        line: "rgb(var(--c-line) / <alpha-value>)", // hairline borders
        line2: "rgb(var(--c-line2) / <alpha-value>)", // stronger borders / hover
        night: "rgb(var(--c-night) / <alpha-value>)", // primary text
        dusk: "rgb(var(--c-dusk) / <alpha-value>)", // secondary text
        haze: "rgb(var(--c-haze) / <alpha-value>)", // tertiary text / muted labels
        brand: {
          DEFAULT: "rgb(var(--c-brand) / <alpha-value>)",
          soft: "rgb(var(--c-brand-soft) / <alpha-value>)",
          deep: "rgb(var(--c-brand-deep) / <alpha-value>)",
        },
        warm: {
          DEFAULT: "rgb(var(--c-warm) / <alpha-value>)",
          soft: "rgb(var(--c-warm-soft) / <alpha-value>)",
          deep: "rgb(var(--c-warm-deep) / <alpha-value>)",
        },
        grass: {
          DEFAULT: "rgb(var(--c-grass) / <alpha-value>)",
          soft: "rgb(var(--c-grass-soft) / <alpha-value>)",
          deep: "rgb(var(--c-grass-deep) / <alpha-value>)",
        },
        berry: {
          DEFAULT: "rgb(var(--c-berry) / <alpha-value>)",
          soft: "rgb(var(--c-berry-soft) / <alpha-value>)",
          deep: "rgb(var(--c-berry-deep) / <alpha-value>)",
        },
        sky: {
          DEFAULT: "rgb(var(--c-sky) / <alpha-value>)",
          soft: "rgb(var(--c-sky-soft) / <alpha-value>)",
          deep: "rgb(var(--c-sky-deep) / <alpha-value>)",
        },

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
         * Elevation is themed too. Dark needs a deep drop plus a 1px inset top
         * highlight to read as raised; light needs the opposite — an almost
         * invisible drop and no highlight, or cards look like they're floating
         * off the page. Values in index.css.
         */
        soft: "var(--sh-soft)",
        raised: "var(--sh-raised)",
        pop: "var(--sh-pop)",
        brand: "var(--sh-brand)",
        warm: "var(--sh-warm)",
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
