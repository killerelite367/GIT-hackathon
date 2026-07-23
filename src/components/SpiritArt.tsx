import type { Spirit } from "../lib/gacha";

/**
 * A cute textbook-buddy character, drawn as an original animated SVG.
 * Big blinking eyes, blushing cheeks, a little smile, and tiny feet that
 * "walk" in place. Colours and the top accessory come from the spirit's art.
 */
export default function SpiritArt({
  spirit,
  size = 72,
  walking = true,
}: {
  spirit: Spirit;
  size?: number;
  walking?: boolean;
}) {
  const { body, trim, belly, accessory } = spirit.art;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 132"
      role="img"
      aria-label={spirit.name}
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

        {/* book cover */}
        <rect x="24" y="34" width="72" height="76" rx="13" fill={body} stroke={trim} strokeWidth="3.5" />
        {/* page edge on the right */}
        <rect x="89" y="39" width="7" height="66" rx="3" fill={belly} />
        {/* label band */}
        <rect x="24" y="82" width="72" height="15" fill={belly} opacity="0.55" />
        <rect x="34" y="87" width="30" height="5" rx="2.5" fill={trim} opacity="0.5" />

        {/* face — eyes blink together */}
        <g className="sp-eyes">
          <circle cx="48" cy="58" r="9" fill="#fff" />
          <circle cx="72" cy="58" r="9" fill="#fff" />
          <circle cx="50" cy="59" r="4.5" fill="#2a2540" />
          <circle cx="74" cy="59" r="4.5" fill="#2a2540" />
          <circle cx="51.5" cy="56.5" r="1.8" fill="#fff" />
          <circle cx="75.5" cy="56.5" r="1.8" fill="#fff" />
        </g>

        {/* blush */}
        <ellipse cx="39" cy="70" rx="5.5" ry="3.2" fill="#ff8fb8" opacity="0.75" />
        <ellipse cx="81" cy="70" rx="5.5" ry="3.2" fill="#ff8fb8" opacity="0.75" />

        {/* smile */}
        <path d="M53 69 Q60 76 67 69" stroke="#2a2540" strokeWidth="2.6" fill="none" strokeLinecap="round" />

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
