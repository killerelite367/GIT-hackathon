import type { Element } from "../lib/gacha";

interface Palette {
  body: string;
  robe: string;
  glow: string;
  eye: string;
}

const PAL: Record<Element, Palette> = {
  fire: { body: "#2a0a06", robe: "#7a1a00", glow: "#ff5a2c", eye: "#ffcc33" },
  light: { body: "#fff6d0", robe: "#f0d98a", glow: "#fff2b0", eye: "#e0a020" },
  glitch: { body: "#08140a", robe: "#0f2a12", glow: "#39ff14", eye: "#39ff14" },
  water: { body: "#0e2f47", robe: "#14506f", glow: "#5fd0ff", eye: "#bdefff" },
  time: { body: "#3a2a0e", robe: "#8a6520", glow: "#e6c060", eye: "#fff0b0" },
  void: { body: "#0a0512", robe: "#1c0d33", glow: "#a98bff", eye: "#d8c6ff" },
  earth: { body: "#233318", robe: "#3a5a2a", glow: "#8fd45a", eye: "#e2ffb0" },
  crystal: { body: "#ffb4d6", robe: "#c79bff", glow: "#ffe1f2", eye: "#ffffff" },
};

/**
 * A premium elemental character — a majestic hooded figure whose palette and
 * signature emblem come from its VFX-Bible element. Bigger and more detailed
 * than the cute snack-books, with an idle float + glowing eyes.
 */
export default function PremiumArt({
  element,
  size = 190,
  idle = true,
}: {
  element: Element;
  size?: number;
  idle?: boolean;
}) {
  const p = PAL[element];
  const rainbow = element === "crystal";

  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 160 200"
      className={rainbow ? "sp-rainbow" : undefined}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`aura-${element}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={p.glow} stopOpacity="0.55" />
          <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`robe-${element}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.robe} />
          <stop offset="100%" stopColor={p.body} />
        </linearGradient>
      </defs>

      {/* ambient aura */}
      <ellipse cx="80" cy="96" rx="72" ry="80" fill={`url(#aura-${element})`} />

      <g className={idle ? "sp-bob" : ""}>
        {/* ── per-element emblem BEHIND the figure ── */}
        {element === "light" && (
          <>
            {/* halo + wings */}
            <circle cx="80" cy="44" r="26" fill="none" stroke={p.glow} strokeWidth="4" opacity="0.9" />
            <path d="M40 96 Q6 80 14 130 Q40 118 52 118 Z" fill="#fff" opacity="0.85" />
            <path d="M120 96 Q154 80 146 130 Q120 118 108 118 Z" fill="#fff" opacity="0.85" />
          </>
        )}
        {element === "void" && (
          <g fill={p.eye}>
            {[...Array(9)].map((_, i) => (
              <circle key={i} cx={30 + i * 12.5} cy={40 + (i % 3) * 14} r={i % 2 ? 1.6 : 2.4} className="gq-twinkle" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </g>
        )}
        {element === "time" && (
          <g stroke={p.glow} strokeWidth="3" fill="none" opacity="0.8">
            <circle cx="80" cy="70" r="46" className="orbit-cw" style={{ transformOrigin: "80px 70px" }} strokeDasharray="6 10" />
            <circle cx="80" cy="70" r="34" strokeDasharray="3 8" />
          </g>
        )}
        {element === "crystal" && (
          <>
            <path d="M44 92 Q12 70 26 132 Q52 116 62 112 Z" fill={p.glow} opacity="0.7" />
            <path d="M116 92 Q148 70 134 132 Q108 116 98 112 Z" fill={p.glow} opacity="0.7" />
          </>
        )}
        {element === "earth" && (
          <g fill={p.glow} opacity="0.85">
            <path d="M52 44 Q60 20 74 40 Q66 48 60 52 Z" />
            <path d="M108 44 Q100 20 86 40 Q94 48 100 52 Z" />
          </g>
        )}

        {/* ── cloak / body ── */}
        <path
          d="M80 40 C104 40 116 60 118 92 C122 130 128 160 132 186 L28 186 C32 160 38 130 42 92 C44 60 56 40 80 40 Z"
          fill={`url(#robe-${element})`}
          stroke={p.glow}
          strokeWidth="2.5"
          strokeOpacity="0.5"
        />

        {/* hood */}
        <path
          d="M80 30 C100 30 112 48 110 74 C110 74 96 64 80 64 C64 64 50 74 50 74 C48 48 60 30 80 30 Z"
          fill={p.body}
          stroke={p.glow}
          strokeWidth="2.5"
        />

        {/* face shadow */}
        <ellipse cx="80" cy="70" rx="20" ry="16" fill="#000" opacity="0.55" />

        {/* glowing eyes */}
        <g fill={p.eye} style={{ filter: `drop-shadow(0 0 6px ${p.eye})` }}>
          {element === "glitch" ? (
            <rect x="66" y="66" width="28" height="4" rx="2" className="gq-glitch-eye" />
          ) : element === "void" ? null : (
            <>
              <ellipse cx="72" cy="70" rx="3.4" ry="5" />
              <ellipse cx="88" cy="70" rx="3.4" ry="5" />
            </>
          )}
        </g>

        {/* ── per-element emblem IN FRONT ── */}
        {element === "fire" && (
          <>
            {/* horns */}
            <path d="M56 40 Q46 18 60 20 Q60 32 68 40 Z" fill={p.glow} />
            <path d="M104 40 Q114 18 100 20 Q100 32 92 40 Z" fill={p.glow} />
            {/* burning staff */}
            <line x1="126" y1="70" x2="138" y2="188" stroke={p.robe} strokeWidth="5" strokeLinecap="round" />
            <circle cx="124" cy="64" r="9" fill={p.glow} className="gq-flame" style={{ filter: `drop-shadow(0 0 8px ${p.glow})` }} />
          </>
        )}
        {element === "water" && (
          <>
            {/* fins */}
            <path d="M50 60 Q34 54 40 84 Q52 74 56 72 Z" fill={p.glow} opacity="0.7" />
            <path d="M110 60 Q126 54 120 84 Q108 74 104 72 Z" fill={p.glow} opacity="0.7" />
            {/* trident */}
            <line x1="34" y1="60" x2="30" y2="186" stroke={p.robe} strokeWidth="5" strokeLinecap="round" />
            <path d="M22 58 L26 44 M30 58 L30 42 M38 58 L34 44" stroke={p.glow} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
        {element === "time" && (
          /* clock face on chest */
          <g>
            <circle cx="80" cy="118" r="16" fill={p.body} stroke={p.glow} strokeWidth="2.5" />
            <line x1="80" y1="118" x2="80" y2="106" stroke={p.glow} strokeWidth="2.5" strokeLinecap="round" className="orbit-cw" style={{ transformOrigin: "80px 118px" }} />
            <line x1="80" y1="118" x2="90" y2="118" stroke={p.glow} strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
        {element === "crystal" && (
          /* floating gem */
          <polygon points="80,96 90,108 80,128 70,108" fill={p.glow} stroke="#fff" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 8px #fff)" }} />
        )}
      </g>
    </svg>
  );
}
