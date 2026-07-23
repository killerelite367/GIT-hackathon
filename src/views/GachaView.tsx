import { useState, useEffect, type CSSProperties } from "react";
import { Gem, Sparkles, Info, Check, Zap, Volume2, VolumeX } from "lucide-react";
import { useStore } from "../store/StoreContext";
import {
  playCharge,
  playBurst,
  playReveal,
  isMuted,
  toggleMuted,
} from "../lib/sound";
import {
  SPIRITS,
  RARITY,
  RARITY_ORDER,
  PULL_COST,
  MULTI_PULLS,
  MULTI_COST,
  PITY_THRESHOLD,
  SPIRIT_BY_ID,
  canAfford,
  collectionCount,
  equippedXpMultiplier,
  type PullOutcome,
  type Rarity,
} from "../lib/gacha";

/** Rarity → gradient used for owned cards & reveal auras. */
const RARITY_GRAD: Record<Rarity, string> = {
  common: "linear-gradient(155deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03))",
  rare: "linear-gradient(155deg, rgba(95,208,255,0.30), rgba(95,208,255,0.04))",
  epic: "linear-gradient(155deg, rgba(169,139,255,0.34), rgba(169,139,255,0.05))",
  legendary: "linear-gradient(155deg, rgba(255,225,77,0.40), rgba(255,95,162,0.12))",
};

export default function GachaView() {
  const { data, pullGacha, equipSpirit } = useStore();
  const { game } = data;
  const [reveal, setReveal] = useState<PullOutcome[] | null>(null);

  const [muted, setMuted] = useState(isMuted());

  const { owned, total } = collectionCount(game);
  const mult = equippedXpMultiplier(game);
  const equipped = game.equippedSpirit ? SPIRIT_BY_ID[game.equippedSpirit] : null;
  const pityPct = Math.min((game.pityCount / PITY_THRESHOLD) * 100, 100);

  function summon(count: number) {
    const outcomes = pullGacha(count);
    if (outcomes.length) setReveal(outcomes);
  }

  return (
    <>
      {/* ══ Summon hero ══════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 p-[1.5px]">
        {/* animated gradient frame */}
        <div className="gq-aurora absolute inset-0 opacity-60" />
        <div className="relative rounded-3xl bg-panel/90 p-6 sm:p-8">
          {/* rotating beams + sparkles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            <div className="gq-beams absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-30" />
            {SPARKLES.map((s, i) => (
              <span
                key={i}
                className="gq-twinkle absolute text-neon-yellow"
                style={{ left: s.x, top: s.y, fontSize: s.size, animationDelay: s.delay }}
              >
                ✦
              </span>
            ))}
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => setMuted(toggleMuted())}
            aria-label={muted ? "Unmute summon sound" : "Mute summon sound"}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/60 transition hover:text-white"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <div className="relative flex flex-col items-center text-center">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-neon-yellow">
              <Sparkles size={13} /> summon circle
            </p>

            {/* Central crystal orb */}
            <div className="relative my-5 flex h-40 w-40 items-center justify-center">
              <div
                className="gq-orb-ring absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(169,139,255,0.55), transparent 68%)" }}
              />
              <div
                className="gq-orb-ring absolute inset-3 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(255,95,162,0.5), transparent 66%)", animationDelay: "0.6s" }}
              />
              <div className="gq-bob relative text-7xl drop-shadow-[0_0_25px_rgba(169,139,255,0.8)]">
                💎
              </div>
            </div>

            {/* Balance */}
            <div className="flex items-baseline gap-2">
              <span className="tabular bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-purple bg-clip-text font-mono text-4xl font-extrabold text-transparent">
                {game.crystals.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-neon-pink">💎 crystals</span>
            </div>
            <p className="mt-2 max-w-sm text-sm text-white/60">
              Earned <span className="font-semibold text-white">only</span> by completing real study
              quests. Spend them to summon <span className="text-neon-purple">Study Spirits</span>.
            </p>

            {/* Pull buttons */}
            <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <button
                onClick={() => summon(1)}
                disabled={!canAfford(game, 1)}
                className="gq-shine group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl border border-neon-purple/60 bg-gradient-to-br from-neon-purple/30 to-neon-purple/10 px-5 py-4 font-bold text-white shadow-[0_0_28px_-6px_rgba(169,139,255,0.6)] transition hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <Sparkles size={18} className="text-neon-purple transition group-hover:rotate-45" />
                Summon ×1
                <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-xs text-neon-pink">
                  <Gem size={11} /> {PULL_COST}
                </span>
              </button>
              <button
                onClick={() => summon(MULTI_PULLS)}
                disabled={!canAfford(game, MULTI_PULLS)}
                className="gq-shine group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl border border-neon-yellow/60 bg-gradient-to-br from-neon-yellow/25 via-neon-pink/20 to-neon-purple/20 px-5 py-4 font-bold text-white shadow-[0_0_28px_-6px_rgba(255,225,77,0.6)] transition hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <span className="absolute -top-2 right-3 rounded-full bg-neon-yellow px-1.5 py-0.5 text-[9px] font-bold uppercase text-ink">
                  1 free
                </span>
                <Sparkles size={18} className="text-neon-yellow transition group-hover:rotate-45" />
                Summon ×{MULTI_PULLS}
                <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-xs text-neon-pink">
                  <Gem size={11} /> {MULTI_COST}
                </span>
              </button>
            </div>

            {/* Pity bar */}
            <div className="mt-5 w-full max-w-md">
              <div className="flex items-center justify-between text-[11px] text-white/50">
                <span>Pity — Epic+ guaranteed</span>
                <span className="tabular font-mono text-neon-yellow">
                  {game.pityCount}/{PITY_THRESHOLD}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-yellow transition-all duration-500"
                  style={{ width: `${pityPct}%` }}
                />
              </div>
              <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-white/40">
                <Info size={12} /> Legendary 3% · Epic 9% · Rare 28% · Common 60%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Equipped spirit ══════════════════════════════════ */}
      <section className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-edge bg-panel/70 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl"
            style={{
              background: equipped ? RARITY_GRAD[equipped.rarity] : undefined,
              borderColor: equipped ? RARITY[equipped.rarity].glow : "#25252f",
            }}
          >
            {equipped ? equipped.emoji : "—"}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40">Equipped spirit</p>
            <p className="font-display text-lg font-bold text-white">
              {equipped ? equipped.name : "None yet"}
            </p>
            {equipped && <p className={`text-xs ${RARITY[equipped.rarity].text}`}>{equipped.blurb}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-neon-green/40 bg-neon-green/10 px-3.5 py-2 text-sm font-bold text-neon-green shadow-[0_0_20px_-6px_rgba(124,255,107,0.6)]">
          <Zap size={15} /> ×{mult.toFixed(2)} XP
        </div>
      </section>

      {/* ══ Collection ═══════════════════════════════════════ */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold tracking-tightish text-white">
            Spirit collection
          </h3>
          <span className="tabular rounded-full border border-edge bg-panel2/60 px-3 py-1 font-mono text-sm text-white/60">
            {owned} / {total} collected
          </span>
        </div>

        {RARITY_ORDER.slice().reverse().map((rarity) => (
          <RarityRow key={rarity} rarity={rarity} game={game} onEquip={equipSpirit} />
        ))}
      </section>

      {reveal && (
        <RevealOverlay outcomes={reveal} onClose={() => setReveal(null)} onEquip={equipSpirit} />
      )}
    </>
  );
}

/** Precomputed sparkle positions for the hero backdrop. */
const SPARKLES = [
  { x: "12%", y: "22%", size: "14px", delay: "0s" },
  { x: "84%", y: "18%", size: "18px", delay: "0.5s" },
  { x: "22%", y: "72%", size: "12px", delay: "1s" },
  { x: "72%", y: "68%", size: "16px", delay: "1.4s" },
  { x: "48%", y: "12%", size: "12px", delay: "0.8s" },
  { x: "90%", y: "50%", size: "14px", delay: "1.8s" },
  { x: "6%", y: "52%", size: "12px", delay: "0.3s" },
];

/** One rarity band of the collection grid. */
function RarityRow({
  rarity,
  game,
  onEquip,
}: {
  rarity: Rarity;
  game: { spirits: Record<string, number>; equippedSpirit: string | null };
  onEquip: (id: string) => void;
}) {
  const meta = RARITY[rarity];
  const list = SPIRITS.filter((s) => s.rarity === rarity);

  return (
    <div className="mb-5">
      <p className={`mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest ${meta.text}`}>
        <span className="h-2 w-2 rounded-full" style={{ background: meta.glow }} />
        {meta.label}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((s) => {
          const count = game.spirits[s.id] ?? 0;
          const isOwned = count > 0;
          const isEquipped = game.equippedSpirit === s.id;
          return (
            <div
              key={s.id}
              className={`gq-shine relative flex flex-col overflow-hidden rounded-2xl border p-3.5 transition ${
                isOwned ? "hover:-translate-y-1" : "border-edge opacity-55"
              }`}
              style={
                isOwned
                  ? {
                      background: RARITY_GRAD[rarity],
                      borderColor: meta.glow,
                      boxShadow: `0 0 26px -10px ${meta.glow}`,
                    }
                  : { background: "rgba(22,22,31,0.6)" }
              }
            >
              {count > 1 && (
                <span className="tabular absolute right-2 top-2 z-10 rounded-full bg-black/50 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
                  ×{count}
                </span>
              )}
              <div className={`text-4xl ${isOwned ? "gq-bob" : "grayscale"}`}>
                {isOwned ? s.emoji : "❔"}
              </div>
              <p className="mt-2 font-display text-sm font-bold text-white">
                {isOwned ? s.name : "???"}
              </p>
              <p className={`text-[11px] font-semibold ${meta.text}`}>
                {isOwned ? s.buff : "Locked"}
              </p>
              {isOwned && (
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/50">{s.blurb}</p>
              )}
              {isOwned &&
                (isEquipped ? (
                  <span className="mt-2 flex items-center justify-center gap-1 rounded-lg border border-neon-green/50 bg-neon-green/15 py-1 text-[11px] font-bold text-neon-green">
                    <Check size={12} /> Equipped
                  </span>
                ) : (
                  <button
                    onClick={() => onEquip(s.id)}
                    className="mt-2 rounded-lg border border-white/15 bg-white/5 py-1 text-[11px] font-semibold text-white/70 transition hover:border-neon-green/50 hover:text-neon-green"
                  >
                    Equip
                  </button>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Phase = "charge" | "burst" | "cards";

// Timing of the summon cinematic (ms).
const CHARGE_MS = 1500;
const BURST_MS = 480;

/** Cinematic summon: the orb charges, shakes, then EXPLODES into the reveal —
 *  with synchronised sound. Tap to skip ahead. */
function RevealOverlay({
  outcomes,
  onClose,
  onEquip,
}: {
  outcomes: PullOutcome[];
  onClose: () => void;
  onEquip: (id: string) => void;
}) {
  const best = outcomes.reduce((b, o) =>
    RARITY_ORDER.indexOf(o.spirit.rarity) > RARITY_ORDER.indexOf(b.spirit.rarity) ? o : b
  );
  const bestMeta = RARITY[best.spirit.rarity];
  const legendary = best.spirit.rarity === "legendary";

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [phase, setPhase] = useState<Phase>(reduced ? "cards" : "charge");

  useEffect(() => {
    if (reduced) {
      playReveal(best.spirit.rarity);
      return;
    }
    playCharge(1500);
    const t1 = setTimeout(() => {
      setPhase("burst");
      playBurst();
    }, CHARGE_MS);
    const t2 = setTimeout(() => {
      setPhase("cards");
      playReveal(best.spirit.rarity);
    }, CHARGE_MS + BURST_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tap skips the cinematic; once the cards are shown, tap dismisses.
  const handleBackdrop = () => {
    if (phase === "cards") onClose();
    else {
      setPhase("cards");
      playReveal(best.spirit.rarity);
    }
  };

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-hidden bg-black/90 p-6 backdrop-blur-md"
      style={{ animation: "gacha-fade 0.25s ease-out" }}
    >
      {/* rotating beams tinted by the incoming rarity */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="gq-beams h-[200vh] w-[200vh] opacity-25"
          style={{ filter: `drop-shadow(0 0 40px ${bestMeta.glow})` }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 45%, ${bestMeta.glow}, transparent 60%)` }}
      />

      {/* ── CHARGE ── energy gathers into a shaking, growing orb ── */}
      {phase === "charge" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {/* converging energy motes */}
          {MOTES.map((m, i) => (
            <span
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={
                {
                  background: bestMeta.glow,
                  boxShadow: `0 0 10px 2px ${bestMeta.glow}`,
                  "--x": `${m.x}px`,
                  "--y": `${m.y}px`,
                  animation: `converge 1.5s ease-in ${m.delay}s infinite`,
                } as CSSProperties
              }
            />
          ))}
          {/* the charging orb */}
          <div className="gq-charge-grow relative flex items-center justify-center">
            <div
              className="gq-shake h-28 w-28 rounded-full"
              style={{
                background: `radial-gradient(circle, #fff, ${bestMeta.glow} 45%, transparent 72%)`,
                boxShadow: `0 0 60px 12px ${bestMeta.glow}`,
              }}
            />
          </div>
        </div>
      )}

      {/* ── BURST ── shockwave, flash, flying shards ── */}
      {phase === "burst" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="gq-flash absolute inset-0" style={{ background: bestMeta.glow }} />
          <div
            className="gq-shockwave absolute h-40 w-40 rounded-full border-4"
            style={{ borderColor: bestMeta.glow }}
          />
          <div
            className="gq-shockwave absolute h-24 w-24 rounded-full"
            style={{ background: "#fff", animationDelay: "0.04s" }}
          />
          {SHARDS.map((s, i) => (
            <span
              key={i}
              className="absolute h-2.5 w-2.5 rounded-full"
              style={
                {
                  background: bestMeta.glow,
                  boxShadow: `0 0 12px 2px ${bestMeta.glow}`,
                  "--tx": `${s.tx}px`,
                  "--ty": `${s.ty}px`,
                  animation: "shard-fly 0.6s ease-out forwards",
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* ── CARDS ── the reveal ── */}
      {phase === "cards" && (
        <>
          {legendary &&
            CONFETTI.map((c, i) => (
              <span
                key={i}
                className="pointer-events-none absolute top-0 text-lg"
                style={{ left: c.x, animation: `spark-fall ${c.dur} linear ${c.delay} infinite` }}
              >
                {c.e}
              </span>
            ))}

          <p
            className={`relative font-mono text-xs uppercase tracking-[0.4em] ${bestMeta.text}`}
            style={{ animation: "gacha-rise 0.4s ease-out both" }}
          >
            ✦ ✦ ✦ Summoned ✦ ✦ ✦
          </p>

          <div className="relative flex max-w-2xl flex-wrap items-stretch justify-center gap-3">
            {outcomes.map((o, i) => {
              const meta = RARITY[o.spirit.rarity];
              return (
                <div
                  key={i}
                  className="relative flex w-32 flex-col items-center rounded-2xl border-2 p-4"
                  style={{
                    background: RARITY_GRAD[o.spirit.rarity],
                    borderColor: meta.glow,
                    boxShadow: `0 0 36px -4px ${meta.glow}`,
                    animation: `gacha-pop 0.5s cubic-bezier(0.22,1,0.36,1) both`,
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  {o.isNew && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-neon-green px-2 py-0.5 text-[9px] font-bold uppercase text-ink shadow-[0_0_10px_rgba(124,255,107,0.8)]">
                      New!
                    </span>
                  )}
                  <div className="gq-bob text-5xl drop-shadow-[0_0_16px_rgba(255,255,255,0.4)]">
                    {o.spirit.emoji}
                  </div>
                  <p className="mt-2 font-display text-sm font-bold text-white">{o.spirit.name}</p>
                  <p className={`font-mono text-[10px] font-bold uppercase tracking-wider ${meta.text}`}>
                    {meta.label}
                  </p>
                  <p className={`mt-1 text-[11px] font-semibold ${meta.text}`}>{o.spirit.buff}</p>
                </div>
              );
            })}
          </div>

          <div className="relative flex flex-col items-center gap-3">
            {legendary && (
              <p
                className="bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-yellow bg-clip-text font-display text-xl font-extrabold text-transparent"
                style={{ animation: "gacha-rise 0.5s ease-out 0.3s both" }}
              >
                🌟 A LEGENDARY spirit answered your call! 🌟
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEquip(best.spirit.id);
                  onClose();
                }}
                className="rounded-xl border border-neon-green/60 bg-neon-green/15 px-5 py-2.5 text-sm font-bold text-neon-green transition hover:scale-105 hover:bg-neon-green/25"
              >
                Equip {best.spirit.name}
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:text-white"
              >
                Continue
              </button>
            </div>
            <p className="text-[11px] text-white/40">tap anywhere to dismiss</p>
          </div>
        </>
      )}

      {phase !== "cards" && (
        <p className="absolute bottom-8 text-[11px] text-white/30">tap to skip</p>
      )}
    </div>
  );
}

/** Energy motes that fly inward during the charge phase. */
const MOTES = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  const r = 190 + (i % 3) * 45;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, delay: (i % 5) * 0.14 };
});

/** Debris shards flung outward on the burst. */
const SHARDS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  const r = 150 + (i % 4) * 40;
  return { tx: Math.cos(a) * r, ty: Math.sin(a) * r };
});

/** Legendary confetti spec. */
const CONFETTI = [
  { x: "10%", e: "✨", dur: "2.6s", delay: "0s" },
  { x: "25%", e: "🌟", dur: "3.1s", delay: "0.3s" },
  { x: "40%", e: "⭐", dur: "2.8s", delay: "0.7s" },
  { x: "55%", e: "✨", dur: "3.3s", delay: "0.2s" },
  { x: "70%", e: "🌟", dur: "2.7s", delay: "0.6s" },
  { x: "85%", e: "⭐", dur: "3.0s", delay: "0.1s" },
  { x: "92%", e: "✨", dur: "2.9s", delay: "0.9s" },
];
