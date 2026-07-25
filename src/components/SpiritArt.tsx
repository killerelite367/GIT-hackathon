import type { Spirit } from "../lib/gacha";

/**
 * A diverse textbook-buddy character with multiple eye styles and notebook designs.
 * Features: fierce/calm/sleepy eyes, different notebook patterns, unique personalities.
 */
export default function SpiritArt({
  spirit,
  size = 72,
  walking = true,
  talking = false,
}: {
  spirit: Spirit;
  size?: number;
  walking?: boolean;
  talking?: boolean;
}) {
  const { body, trim, belly, accessory, rainbow, angry } = spirit.art;

  // Deterministic eye style based on spirit ID
  const spiritHash = spirit.id.charCodeAt(0) + spirit.id.charCodeAt(spirit.id.length - 1);
  const eyeStyle = ["fierce", "calm", "sleepy", "wide", "happy"][spiritHash % 5];
  const notebookStyle = ["regular", "spiral", "minimalist", "striped", "dotted"][spiritHash % 5];

  const renderEyes = () => {
    switch (eyeStyle) {
      case "fierce":
        return (
          <g className="sp-eyes">
            {/* Wide intense eyes */}
            <circle cx="48" cy="58" r="11" fill="#fff" />
            <circle cx="72" cy="58" r="11" fill="#fff" />
            <circle cx="50" cy="60" r="6" fill="#2a2540" />
            <circle cx="74" cy="60" r="6" fill="#2a2540" />
            <circle cx="52" cy="55" r="2.5" fill="#ff6b6b" />
            <circle cx="76" cy="55" r="2.5" fill="#ff6b6b" />
            {/* Sharp eyebrows */}
            <line x1="38" y1="48" x2="58" y2="44" stroke={trim} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="82" y1="48" x2="62" y2="44" stroke={trim} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case "sleepy":
        return (
          <g className="sp-eyes">
            {/* Half-closed eyes */}
            <ellipse cx="48" cy="62" rx="10" ry="6" fill="#fff" />
            <ellipse cx="72" cy="62" rx="10" ry="6" fill="#fff" />
            <path d="M40 62 Q48 58 56 62" stroke="#2a2540" strokeWidth="3" fill="#2a2540" />
            <path d="M64 62 Q72 58 80 62" stroke="#2a2540" strokeWidth="3" fill="#2a2540" />
            <circle cx="48" cy="62" r="1.5" fill="#fff" />
            <circle cx="72" cy="62" r="1.5" fill="#fff" />
          </g>
        );
      case "wide":
        return (
          <g className="sp-eyes">
            {/* Big surprised/energetic eyes */}
            <circle cx="47" cy="57" r="13" fill="#fff" />
            <circle cx="73" cy="57" r="13" fill="#fff" />
            <circle cx="50" cy="59" r="6" fill="#2a2540" />
            <circle cx="76" cy="59" r="6" fill="#2a2540" />
            <circle cx="51.5" cy="55" r="2.5" fill="#fff" />
            <circle cx="77.5" cy="55" r="2.5" fill="#fff" />
          </g>
        );
      case "calm":
        return (
          <g className="sp-eyes">
            {/* Peaceful closed/happy eyes */}
            <path d="M42 56 Q48 62 54 56" stroke="#2a2540" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M66 56 Q72 62 78 56" stroke="#2a2540" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="48" cy="60" r="1" fill="#2a2540" />
            <circle cx="72" cy="60" r="1" fill="#2a2540" />
          </g>
        );
      default: // happy
        return (
          <g className="sp-eyes">
            <circle cx="48" cy="58" r="9" fill="#fff" />
            <circle cx="72" cy="58" r="9" fill="#fff" />
            <circle cx="50" cy="59" r="4.5" fill="#2a2540" />
            <circle cx="74" cy="59" r="4.5" fill="#2a2540" />
            <circle cx="51.5" cy="56.5" r="1.8" fill="#fff" />
            <circle cx="75.5" cy="56.5" r="1.8" fill="#fff" />
          </g>
        );
    }
  };

  const renderNotebook = () => {
    switch (notebookStyle) {
      case "spiral":
        return (
          <>
            <rect x="24" y="34" width="72" height="76" rx="13" fill={body} stroke={trim} strokeWidth="3.5" />
            {/* Spiral binding */}
            <circle cx="30" cy="45" r="2.5" fill={trim} opacity="0.6" />
            <circle cx="30" cy="57" r="2.5" fill={trim} opacity="0.6" />
            <circle cx="30" cy="69" r="2.5" fill={trim} opacity="0.6" />
            <circle cx="30" cy="81" r="2.5" fill={trim} opacity="0.6" />
            <rect x="89" y="39" width="7" height="66" rx="3" fill={belly} />
            <rect x="24" y="82" width="72" height="15" fill={belly} opacity="0.55" />
          </>
        );
      case "minimalist":
        return (
          <>
            <rect x="28" y="38" width="64" height="68" rx="8" fill={body} stroke={trim} strokeWidth="2" />
            <line x1="60" y1="34" x2="60" y2="108" stroke={trim} strokeWidth="1.5" opacity="0.4" />
            <rect x="89" y="39" width="7" height="66" rx="3" fill={belly} />
          </>
        );
      case "striped":
        return (
          <>
            <rect x="24" y="34" width="72" height="76" rx="13" fill={body} stroke={trim} strokeWidth="3.5" />
            {/* Horizontal stripes */}
            <line x1="28" y1="50" x2="92" y2="50" stroke={belly} strokeWidth="2" opacity="0.3" />
            <line x1="28" y1="65" x2="92" y2="65" stroke={belly} strokeWidth="2" opacity="0.3" />
            <line x1="28" y1="80" x2="92" y2="80" stroke={belly} strokeWidth="2" opacity="0.3" />
            <rect x="89" y="39" width="7" height="66" rx="3" fill={belly} />
            <rect x="24" y="82" width="72" height="15" fill={belly} opacity="0.55" />
          </>
        );
      case "dotted":
        return (
          <>
            <rect x="24" y="34" width="72" height="76" rx="13" fill={body} stroke={trim} strokeWidth="3.5" strokeDasharray="3,3" />
            <rect x="89" y="39" width="7" height="66" rx="3" fill={belly} />
            <circle cx="35" cy="50" r="1.5" fill={trim} opacity="0.4" />
            <circle cx="50" cy="55" r="1.5" fill={trim} opacity="0.4" />
            <circle cx="70" cy="52" r="1.5" fill={trim} opacity="0.4" />
            <circle cx="85" cy="58" r="1.5" fill={trim} opacity="0.4" />
          </>
        );
      default: // regular
        return (
          <>
            <rect x="24" y="34" width="72" height="76" rx="13" fill={body} stroke={trim} strokeWidth="3.5" />
            <rect x="89" y="39" width="7" height="66" rx="3" fill={belly} />
            <rect x="24" y="82" width="72" height="15" fill={belly} opacity="0.55" />
            <rect x="34" y="87" width="30" height="5" rx="2.5" fill={trim} opacity="0.5" />
          </>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 132"
      role="img"
      aria-label={spirit.name}
      className={rainbow ? "sp-rainbow" : undefined}
      style={{ overflow: "visible" }}
    >
      {/* ground shadow */}
      <ellipse cx="60" cy="126" rx="30" ry="5" fill="#000" opacity="0.18" />

      {/* feet (walk in place) */}
      <g fill={trim}>
        <ellipse className={walking ? "sp-foot sp-foot-l" : ""} cx="49" cy="116" rx="9" ry="7" />
        <ellipse className={walking ? "sp-foot sp-foot-r" : ""} cx="71" cy="116" rx="9" ry="7" />
      </g>

      {/* body bobs gently */}
      <g className="sp-bob">
        {/* arms */}
        <ellipse cx="22" cy="80" rx="7" ry="11" fill={trim} />
        <ellipse cx="98" cy="80" rx="7" ry="11" fill={trim} />

        {/* accessory that sits BEHIND the book (ears / horns) */}
        {accessory === "cat-ears" && (
          <g fill={body} stroke={trim} strokeWidth="3" strokeLinejoin="round">
            <path d="M34 44 L36 20 L54 38 Z" />
            <path d="M86 44 L84 20 L66 38 Z" />
          </g>
        )}
        {accessory === "horns" && (
          <g fill={belly} stroke={trim} strokeWidth="3" strokeLinejoin="round">
            <path d="M36 40 Q26 22 40 18 Q40 30 48 36 Z" />
            <path d="M84 40 Q94 22 80 18 Q80 30 72 36 Z" />
          </g>
        )}

        {/* Notebook/book cover with different styles */}
        {renderNotebook()}

        {/* face — diverse eyes! */}
        {renderEyes()}

        {/* angry brows (demon) */}
        {angry && (
          <g stroke="#2a2540" strokeWidth="3" strokeLinecap="round">
            <line x1="41" y1="46" x2="55" y2="51" />
            <line x1="79" y1="46" x2="65" y2="51" />
          </g>
        )}

        {/* blush */}
        <ellipse cx="39" cy="70" rx="5.5" ry="3.2" fill="#ff8fb8" opacity="0.75" />
        <ellipse cx="81" cy="70" rx="5.5" ry="3.2" fill="#ff8fb8" opacity="0.75" />

        {/* mouth — talks (animated open mouth) or smiles */}
        {talking ? (
          <ellipse className="sp-talk" cx="60" cy="71" rx="6" ry="5" fill="#2a2540" />
        ) : (
          <path d="M53 69 Q60 76 67 69" stroke="#2a2540" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        )}

        {/* accessory that sits ON TOP (glasses / star / crown / sparkle) */}
        {accessory === "glasses" && (
          <g stroke={trim} strokeWidth="2.6" fill="none">
            <circle cx="48" cy="58" r="11" />
            <circle cx="72" cy="58" r="11" />
            <line x1="59" y1="58" x2="61" y2="58" />
          </g>
        )}
        {accessory === "star" && (
          <path
            d="M60 14 l3.5 7.5 8 1 -6 5.5 1.6 8 -7.1-4 -7.1 4 1.6-8 -6-5.5 8-1 Z"
            fill="#fff3b0"
            stroke={trim}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}
        {accessory === "crown" && (
          <path
            d="M40 32 L44 16 L52 27 L60 13 L68 27 L76 16 L80 32 Z"
            fill="#ffe07a"
            stroke="#d9a52a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}
        {accessory === "sparkle" && (
          <g fill="#fff7c2">
            <path className="sp-tw" d="M30 40 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2 Z" />
            <path
              className="sp-tw"
              style={{ animationDelay: "0.8s" }}
              d="M92 46 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6-4 -4-1.6 4-1.6 Z"
            />
          </g>
        )}
      </g>
    </svg>
  );
}
