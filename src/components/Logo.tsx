/**
 * The StudyQuest brand mark.
 *
 * A "Q" whose tail is a checkmark — the initial and a completed quest in one
 * stroke. Drawn on a 32-unit grid with round caps so it stays legible from a
 * 16px favicon up to hero size, and it inherits `currentColor` so the same
 * glyph works on the violet tile, on white, and on the dark canvas.
 *
 * Stroke weight is scaled up slightly at small sizes: a hairline that reads
 * correctly at 40px disappears at 16px.
 */

export function LogoMark({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const stroke = size <= 16 ? 4 : size <= 22 ? 3.8 : 3.4;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label="StudyQuest"
    >
      {/* The tail runs out to the right, so the raw glyph sits right-of-centre
          on the canvas. Nudge it back to optical centre inside the tile. */}
      <g transform="translate(-1.7 0.8)">
        {/* Ring, left open at the lower right so the tail reads as a tail */}
        <path
          d="M20.4 22.6 A8.6 8.6 0 1 1 24.6 15.2"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* The tail, drawn as a check */}
        <path
          d="M18.6 20.4 L21.4 23.6 L28 15.4"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

type LogoSize = "sm" | "md" | "lg";

const TILE: Record<LogoSize, { box: string; glyph: number; text: string }> = {
  sm: { box: "h-7 w-7 rounded-lg", glyph: 14, text: "text-[15px]" },
  md: { box: "h-8 w-8 rounded-xl", glyph: 16, text: "text-base" },
  lg: { box: "h-9 w-9 rounded-xl", glyph: 18, text: "text-lg" },
};

/**
 * Full lockup: mark on a tile + wordmark. `tileClass` overrides the tile
 * treatment for surfaces that need it (e.g. the translucent one on the
 * landing hero, which sits on violet rather than on the app canvas).
 */
export default function Logo({
  size = "lg",
  tileClass = "bg-brand text-white shadow-brand",
  textClass = "text-night",
  wordmark = true,
}: {
  size?: LogoSize;
  tileClass?: string;
  textClass?: string;
  wordmark?: boolean;
}) {
  const s = TILE[size];
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex shrink-0 items-center justify-center ${s.box} ${tileClass}`}>
        <LogoMark size={s.glyph} />
      </div>
      {wordmark && (
        <span className={`font-display font-bold tracking-tightish ${s.text} ${textClass}`}>
          StudyQuest
        </span>
      )}
    </div>
  );
}
