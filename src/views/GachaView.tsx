import { useState } from "react";
import { Gem, Sparkles, Info, Check, Zap } from "lucide-react";
import { useStore } from "../store/StoreContext";
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

export default function GachaView() {
  const { data, pullGacha, equipSpirit } = useStore();
  const { game } = data;
  const [reveal, setReveal] = useState<PullOutcome[] | null>(null);

  const { owned, total } = collectionCount(game);
  const mult = equippedXpMultiplier(game);
  const equipped = game.equippedSpirit ? SPIRIT_BY_ID[game.equippedSpirit] : null;

  function summon(count: number) {
    const outcomes = pullGacha(count);
    if (outcomes.length) setReveal(outcomes);
  }

  return (
    <>
      {/* ── Summon banner ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-neon-purple/30 bg-panel/80 p-6 shadow-card">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(169,139,255,0.35), transparent 70%)" }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neon-purple">
              <Sparkles size={13} /> summon circle
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tightish text-white">
              Study Spirits
            </h2>
            <p className="mt-1 max-w-md text-sm text-white/55">
              Companions summoned with <span className="text-neon-pink">Focus Crystals</span> — the
              currency you earn <span className="text-white/80">only</span> by completing real study
              work. Each spirit boosts your XP.
            </p>
          </div>

          {/* Crystal balance */}
          <div className="flex items-center gap-2 rounded-xl border border-neon-pink/30 bg-neon-pink/[0.08] px-4 py-3">
            <Gem size={22} className="text-neon-pink" />
            <div className="leading-none">
              <div className="tabular font-mono text-2xl font-bold text-white">
                {game.crystals.toLocaleString()}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-white/45">
                Focus Crystals
              </div>
            </div>
          </div>
        </div>

        {/* Pull buttons */}
        <div className="relative mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => summon(1)}
            disabled={!canAfford(game, 1)}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-neon-purple/50 bg-neon-purple/10 px-5 py-3.5 font-semibold text-neon-purple transition hover:bg-neon-purple/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles size={18} className="transition group-hover:rotate-12" />
            Summon ×1
            <span className="ml-1 flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-xs text-neon-pink">
              <Gem size={11} /> {PULL_COST}
            </span>
          </button>
          <button
            onClick={() => summon(MULTI_PULLS)}
            disabled={!canAfford(game, MULTI_PULLS)}
            className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border border-neon-yellow/50 bg-gradient-to-r from-neon-yellow/15 to-neon-pink/15 px-5 py-3.5 font-semibold text-white transition hover:from-neon-yellow/25 hover:to-neon-pink/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="absolute -top-2 right-2 rounded-full bg-neon-yellow px-1.5 py-0.5 text-[9px] font-bold uppercase text-ink">
              1 free
            </span>
            <Sparkles size={18} className="text-neon-yellow transition group-hover:rotate-12" />
            Summon ×{MULTI_PULLS}
            <span className="ml-1 flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-xs text-neon-pink">
              <Gem size={11} /> {MULTI_COST}
            </span>
          </button>
        </div>

        {/* Pity + odds line */}
        <div className="relative mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/40">
          <span className="flex items-center gap-1">
            <Info size={12} /> Rates — Legendary 3% · Epic 9% · Rare 28% · Common 60%
          </span>
          <span>
            Pity: <span className="tabular font-mono text-neon-yellow">{game.pityCount}/{PITY_THRESHOLD}</span>{" "}
            → Epic+ guaranteed
          </span>
        </div>
      </section>

      {/* ── Equipped spirit ───────────────────────────────── */}
      <section className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-edge bg-panel/70 p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border text-2xl ${
              equipped ? RARITY[equipped.rarity].border : "border-edge"
            }`}
          >
            {equipped ? equipped.emoji : "—"}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40">Equipped spirit</p>
            <p className="font-display font-semibold text-white">
              {equipped ? equipped.name : "None yet"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-neon-green/30 bg-neon-green/10 px-3 py-1.5 text-sm font-semibold text-neon-green">
          <Zap size={14} /> ×{mult.toFixed(2)} XP
        </div>
      </section>

      {/* ── Collection ────────────────────────────────────── */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold tracking-tightish text-white">
            Spirit collection
          </h3>
          <span className="tabular font-mono text-sm text-white/45">
            {owned} / {total} collected
          </span>
        </div>

        {RARITY_ORDER.slice().reverse().map((rarity) => (
          <RarityRow key={rarity} rarity={rarity} game={game} onEquip={equipSpirit} />
        ))}
      </section>

      {reveal && <RevealOverlay outcomes={reveal} onClose={() => setReveal(null)} onEquip={equipSpirit} />}
    </>
  );
}

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
      <p className={`mb-2 font-mono text-[11px] uppercase tracking-widest ${meta.text}`}>
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
              className={`relative flex flex-col rounded-xl border bg-panel2/60 p-3 transition ${
                isOwned ? `${meta.border} hover:-translate-y-0.5` : "border-edge opacity-60"
              }`}
              style={isOwned ? { boxShadow: `0 0 20px -10px ${meta.glow}` } : undefined}
            >
              {count > 1 && (
                <span className="absolute right-2 top-2 tabular rounded-full bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-white/70">
                  ×{count}
                </span>
              )}
              <div className={`text-3xl ${isOwned ? "" : "grayscale"}`}>
                {isOwned ? s.emoji : "❔"}
              </div>
              <p className="mt-2 font-display text-sm font-semibold text-white">
                {isOwned ? s.name : "???"}
              </p>
              <p className={`text-[11px] ${meta.text}`}>{isOwned ? s.buff : "Locked"}</p>
              {isOwned && (
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/40">{s.blurb}</p>
              )}
              {isOwned &&
                (isEquipped ? (
                  <span className="mt-2 flex items-center justify-center gap-1 rounded-lg border border-neon-green/40 bg-neon-green/10 py-1 text-[11px] font-semibold text-neon-green">
                    <Check size={12} /> Equipped
                  </span>
                ) : (
                  <button
                    onClick={() => onEquip(s.id)}
                    className="mt-2 rounded-lg border border-edge py-1 text-[11px] text-white/60 transition hover:border-neon-green/40 hover:text-neon-green"
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

/** Full-screen summon reveal with a rarity flare per card. */
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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black/80 p-6 backdrop-blur-sm"
      style={{ animation: "gacha-fade 0.25s ease-out" }}
    >
      {/* Radiant backdrop tinted by the best pull */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 45%, ${bestMeta.glow}, transparent 60%)` }}
      />
      <p
        className={`relative font-mono text-xs uppercase tracking-[0.3em] ${bestMeta.text}`}
        style={{ animation: "gacha-rise 0.4s ease-out both" }}
      >
        ✦ Summoning ✦
      </p>

      <div className="relative flex max-w-2xl flex-wrap items-stretch justify-center gap-3">
        {outcomes.map((o, i) => {
          const meta = RARITY[o.spirit.rarity];
          return (
            <div
              key={i}
              className={`relative flex w-32 flex-col items-center rounded-2xl border-2 bg-panel/90 p-4 ${meta.border}`}
              style={{
                boxShadow: `0 0 30px -6px ${meta.glow}`,
                animation: `gacha-pop 0.45s cubic-bezier(0.22,1,0.36,1) both`,
                animationDelay: `${i * 90}ms`,
              }}
            >
              {o.isNew && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-neon-green px-2 py-0.5 text-[9px] font-bold uppercase text-ink">
                  New!
                </span>
              )}
              <div className="text-5xl" style={{ animation: "gacha-float 3s ease-in-out infinite" }}>
                {o.spirit.emoji}
              </div>
              <p className="mt-2 font-display text-sm font-bold text-white">{o.spirit.name}</p>
              <p className={`font-mono text-[10px] uppercase tracking-wider ${meta.text}`}>
                {meta.label}
              </p>
              <p className={`mt-1 text-[11px] ${meta.text}`}>{o.spirit.buff}</p>
            </div>
          );
        })}
      </div>

      <div className="relative flex flex-col items-center gap-2">
        {best.spirit.rarity === "legendary" && (
          <p
            className="font-display text-lg font-bold text-neon-yellow"
            style={{ animation: "gacha-rise 0.5s ease-out 0.3s both" }}
          >
            🌟 A LEGENDARY spirit answered your call!
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEquip(best.spirit.id);
              onClose();
            }}
            className="rounded-xl border border-neon-green/50 bg-neon-green/10 px-5 py-2.5 text-sm font-semibold text-neon-green transition hover:bg-neon-green/20"
          >
            Equip {best.spirit.name}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-edge px-5 py-2.5 text-sm text-white/70 transition hover:text-white"
          >
            Continue
          </button>
        </div>
        <p className="text-[11px] text-white/35">tap anywhere to dismiss</p>
      </div>
    </div>
  );
}
