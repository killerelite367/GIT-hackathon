/**
 * The Study Buddies brand mark.
 *
 * A rough sketch of the "textbook buddy" summon character from the gacha —
 * a rounded book body, round eyes, a smile, and two little feet — reduced to
 * a mark simple enough to survive a 16px favicon. Drawn on a 32-unit grid
 * and inherits `currentColor` so the same glyph works on the violet tile,
 * on white, and on the dark canvas.
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
  const stroke = size <= 16 ? 3 : size <= 22 ? 2.8 : 2.5;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label="Study Buddies"
    >
      {/* book body */}
      <rect x="7.5" y="8.5" width="17" height="16" rx="6" stroke="currentColor" strokeWidth={stroke} />
      {/* little feet peeking out the bottom */}
      <path d="M11.5 24.5 L11.5 27" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
      <path d="M20.5 24.5 L20.5 27" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
      {/* eyes */}
      <circle cx="12.6" cy="15.6" r="1.7" fill="currentColor" />
      <circle cx="19.4" cy="15.6" r="1.7" fill="currentColor" />
      {/* smile */}
      <path
        d="M13 19.2 Q16 21.4 19 19.2"
        stroke="currentColor"
        strokeWidth={stroke * 0.8}
        strokeLinecap="round"
      />
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
          Study Buddies
        </span>
      )}
    </div>
  );
}
