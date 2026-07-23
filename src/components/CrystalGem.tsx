/** A faceted crystal gem rendered as real SVG geometry — replaces the flat
 *  emoji diamond with something that actually looks like jewellery art. */
export default function CrystalGem({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="gemTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3fff0" />
          <stop offset="100%" stopColor="#7cff6b" />
        </linearGradient>
        <linearGradient id="gemMid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a9f0ff" />
          <stop offset="100%" stopColor="#5fd0ff" />
        </linearGradient>
        <linearGradient id="gemSideL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5fd0ff" />
          <stop offset="100%" stopColor="#a98bff" />
        </linearGradient>
        <linearGradient id="gemSideR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a98bff" />
          <stop offset="100%" stopColor="#ff5fa2" />
        </linearGradient>
        <radialGradient id="gemGlow" cx="50%" cy="34%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="70" cy="66" rx="58" ry="52" fill="url(#gemGlow)" />

      {/* crown (top) facets */}
      <polygon points="70,16 100,44 40,44" fill="url(#gemTop)" stroke="#0a0a12" strokeWidth="1.4" strokeLinejoin="round" />
      <polygon points="40,44 100,44 86,60 54,60" fill="url(#gemMid)" stroke="#0a0a12" strokeWidth="1.4" strokeLinejoin="round" />

      {/* pavilion (bottom) facets converging to a point */}
      <polygon points="40,44 54,60 70,124 16,54" fill="url(#gemSideL)" stroke="#0a0a12" strokeWidth="1.2" strokeLinejoin="round" />
      <polygon points="100,44 86,60 70,124 124,54" fill="url(#gemSideR)" stroke="#0a0a12" strokeWidth="1.2" strokeLinejoin="round" />
      <polygon points="54,60 86,60 70,124" fill="url(#gemMid)" stroke="#0a0a12" strokeWidth="1.2" strokeLinejoin="round" />

      {/* bright shine streak */}
      <polygon points="46,46 56,46 36,92 27,88" fill="#ffffff" opacity="0.45" />
      <polygon points="94,52 100,55 78,96 73,92" fill="#ffffff" opacity="0.18" />
    </svg>
  );
}
