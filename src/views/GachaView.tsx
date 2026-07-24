import { useState, useEffect, type CSSProperties } from "react";
import { Gem, Sparkles, Info, Check, Zap, Volume2, VolumeX, Clover, Gift } from "lucide-react";
import { useStore } from "../store/StoreContext";
import SpiritArt from "../components/SpiritArt";
import CharacterArt from "../components/CharacterArt";
import CrystalGem from "../components/CrystalGem";
import {
  playCharge,
  playBurst,
  playReveal,
  playTalk,
  speak,
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
  voiceLine,
  setLucky,
  isLucky,
  AWAKEN_TIER,
  type PullOutcome,
  type Rarity,
} from "../lib/gacha";

/** Rarity → gradient used for owned cards & reveal auras. */
const RARITY_GRAD: Record<Rarity, string> = {
  common: "linear-gradient(155deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03))",
  rare: "linear-gradient(155deg, rgba(95,208,255,0.30), rgba(95,208,255,0.04))",
  epic: "linear-gradient(155deg, rgba(169,139,255,0.34), rgba(169,139,255,0.05))",
  legendary: "linear-gradient(155deg, rgba(255,225,77,0.40), rgba(255,95,162,0.12))",
  mythic: "linear-gradient(155deg, rgba(255,111,214,0.42), rgba(169,139,255,0.12))",
  ultramythic: "linear-gradient(155deg, rgba(255,154,61,0.45), rgba(255,59,92,0.14))",
  chromatic: "linear-gradient(155deg, rgba(125,255,208,0.4), rgba(95,208,255,0.16))",
  demon: "linear-gradient(155deg, rgba(255,59,92,0.45), rgba(20,0,6,0.5))",
  secret: "linear-gradient(155deg, rgba(200,255,255,0.5), rgba(20,20,30,0.4))",
};

export default function GachaView() {
  const { data, pullGacha, equipSpirit, giftCrystals } = useStore();
  const { game } = data;
  const [reveal, setReveal] = useState<PullOutcome[] | null>(null);

  const [muted, setMuted] = useState(isMuted());
  const [lucky, setLuckyState] = useState(isLucky());

  const { owned, total } = collectionCount(game);
  const mult = equippedXpMultiplier(game);
  const equipped = game.equippedSpirit ? SPIRIT_BY_ID[game.equippedSpirit] : null;
  const pityPct = Math.min((game.pityCount / PITY_THRESHOLD) * 100, 100);

  function summon(count: number) {
    const outcomes = pullGacha(count);
    if (outcomes.length) setReveal(outcomes);
  }

  /** Dev/testing only: preview a rarity's animation instantly — free, no
   *  crystals spent, doesn't touch your collection or pity. */
  function previewRarity(rarity: Rarity) {
    const pool = SPIRITS.filter((s) => s.rarity === rarity);
    const spirit = pool[Math.floor(Math.random() * pool.length)];
    setReveal([{ spirit, isNew: false }]);
  }

  return (
    <>
      {/* ══ Summon hero ══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden rounded-3xl border border-neon-purple/25 shadow-lift"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -10%, rgba(169,139,255,0.16), transparent 60%), linear-gradient(180deg, #14141f, #0d0d16)",
        }}
      >
        <div className="relative rounded-3xl p-6 sm:p-8">
          {/* a few still sparkles for depth — no spinning background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            {SPARKLES.map((s, i) => (
              <span
                key={i}
                className="gq-twinkle absolute text-white/50"
                style={{ left: s.x, top: s.y, fontSize: s.size, animationDelay: s.delay }}
              >
                ✦
              </span>
            ))}
          </div>

          {/* Sound + demo toggles */}
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            <button
              onClick={() => giftCrystals(100000)}
              title="Demo: gift 100,000 crystals to chase the rare pulls"
              className="flex h-9 items-center gap-1 rounded-full border border-neon-pink/50 bg-neon-pink/10 px-2.5 text-xs font-semibold text-neon-pink transition hover:bg-neon-pink/20"
            >
              <Gift size={14} /> +100k
            </button>
            <button
              onClick={() => {
                const v = !lucky;
                setLucky(v);
                setLuckyState(v);
              }}
              aria-pressed={lucky}
              title="Demo: force Legendary+ so you can show the animations"
              className={`flex h-9 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition ${
                lucky
                  ? "border-neon-green/60 bg-neon-green/15 text-neon-green"
                  : "border-white/15 bg-black/30 text-white/50 hover:text-white"
              }`}
            >
              <Clover size={14} /> Lucky
            </button>
            <button
              onClick={() => setMuted(toggleMuted())}
              aria-label={muted ? "Unmute summon sound" : "Mute summon sound"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/60 transition hover:text-white"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>

          <div className="relative flex flex-col items-center text-center">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-neon-yellow">
              <Sparkles size={13} /> summon circle
            </p>

            {/* Central faceted crystal — real SVG gem, gently bobbing */}
            <div className="relative my-5 flex h-44 w-44 items-center justify-center">
              <div
                className="gq-orb-ring absolute inset-4 rounded-full blur-md"
                style={{ background: "radial-gradient(circle, rgba(95,208,255,0.4), transparent 70%)" }}
              />
              <div className="gq-bob relative">
                <CrystalGem size={150} />
              </div>
            </div>

            {/* Balance */}
            <div className="flex items-center gap-2">
              <Gem size={22} className="text-neon-cyan" />
              <span className="tabular bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text font-mono text-4xl font-extrabold text-transparent">
                {game.crystals.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-white/50">crystals</span>
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

      {/* ══ Test panel — instantly preview any rarity's animation ══ */}
      <section className="mt-4 rounded-2xl border border-dashed border-white/15 bg-panel2/40 p-4">
        <p className="mb-2.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-white/40">
          <Sparkles size={12} /> preview a rarity (free — no crystals, no collection change)
        </p>
        <div className="flex flex-wrap gap-2">
          {RARITY_ORDER.map((r) => {
            const meta = RARITY[r];
            return (
              <button
                key={r}
                onClick={() => previewRarity(r)}
                className={`rounded-full border bg-white/[0.04] px-3 py-1.5 text-xs font-semibold transition hover:scale-105 hover:bg-white/[0.09] ${meta.text}`}
                style={{ borderColor: meta.glow }}
              >
                {RARITY_ICON[r]} {meta.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ══ Equipped spirit ══════════════════════════════════ */}
      <section className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-edge bg-panel/70 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl border"
            style={{
              background: equipped ? RARITY_GRAD[equipped.rarity] : undefined,
              borderColor: equipped ? RARITY[equipped.rarity].glow : "#25252f",
            }}
          >
            {equipped ? <CharacterArt spirit={equipped} size={equipped.element ? 44 : 48} /> : <span className="text-3xl text-white/30">—</span>}
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

  const ownedCount = list.filter((s) => (game.spirits[s.id] ?? 0) > 0).length;

  return (
    <div className="mb-6">
      <p className={`mb-2.5 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest ${meta.text}`}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.glow, boxShadow: `0 0 8px ${meta.glow}` }} />
        {meta.label}
        <span className="text-white/30">· {ownedCount}/{list.length}</span>
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((s) => {
          const count = game.spirits[s.id] ?? 0;
          const isOwned = count > 0;
          const isEquipped = game.equippedSpirit === s.id;

          if (!isOwned) {
            return (
              <div
                key={s.id}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-2xl text-white/20">
                  ?
                </div>
                <p className="mt-2 font-display text-sm font-bold text-white/30">Locked</p>
                <p className="text-[11px] text-white/20">not yet summoned</p>
              </div>
            );
          }

          return (
            <div
              key={s.id}
              className="group relative flex flex-col items-center overflow-hidden rounded-2xl border p-3.5 text-center transition hover:-translate-y-1"
              style={{
                background: RARITY_GRAD[rarity],
                borderColor: meta.glow,
                boxShadow: isEquipped
                  ? `0 0 24px -6px ${meta.glow}, inset 0 0 0 1px ${meta.glow}`
                  : `0 8px 24px -14px #000`,
              }}
            >
              {count > 1 && (
                <span className="tabular absolute right-2 top-2 z-10 rounded-full bg-black/55 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white/90">
                  ×{count}
                </span>
              )}
              {/* character on a glowing pedestal */}
              <div className="relative flex h-20 w-full items-center justify-center">
                <div
                  className="absolute bottom-1 h-6 w-16 rounded-[50%] blur-md"
                  style={{ background: meta.glow, opacity: 0.5 }}
                />
                <div className="relative transition-transform duration-300 group-hover:scale-110">
                  <CharacterArt spirit={s} size={s.element ? 52 : 62} />
                </div>
              </div>
              <p className="mt-1 font-display text-xs font-bold leading-tight text-white">{s.name}</p>
              <span
                className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.text}`}
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                {s.buff}
              </span>
              {isEquipped ? (
                <span className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-neon-green/50 bg-neon-green/15 py-1 text-[11px] font-bold text-neon-green">
                  <Check size={12} /> Equipped
                </span>
              ) : (
                <button
                  onClick={() => onEquip(s.id)}
                  className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 py-1 text-[11px] font-semibold text-white/70 transition hover:border-neon-green/50 hover:bg-neon-green/10 hover:text-neon-green"
                >
                  Equip
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Phase = "charge" | "burst" | "awaken" | "cards";

// Timing of the summon cinematic (ms).
const CHARGE_MS = 1500;
const BURST_MS = 480;
const AWAKEN_MS = 7000;

/** Small icon shown next to the rarity label so tiers read at a glance. */
const RARITY_ICON: Record<Rarity, string> = {
  common: "◇",
  rare: "◆",
  epic: "🔷",
  legendary: "🌟",
  mythic: "🔮",
  ultramythic: "☀️",
  chromatic: "🌈",
  demon: "🔥",
  secret: "👁️",
};

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
  const grand = bestMeta.tier >= AWAKEN_TIER; // legendary+ gets the awakening

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [phase, setPhase] = useState<Phase>(reduced ? "cards" : "charge");

  // Reveal chime fires immediately (ties to the explosion); the spoken
  // catchphrase is held until the power-up lands and the bubble pops in,
  // so the voice feels connected to the character, not the explosion.
  const speakBest = () => {
    playReveal(best.spirit.rarity);
    const line = voiceLine(best.spirit);
    window.setTimeout(() => {
      speak(line, best.spirit.rarity);
      playTalk(line, best.spirit.rarity);
    }, 2150);
  };

  useEffect(() => {
    if (reduced) {
      playReveal(best.spirit.rarity);
      return;
    }
    // Higher rarity = longer, more dramatic charge.
    const chargeMs = CHARGE_MS + bestMeta.tier * 220;
    playCharge(chargeMs);
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        setPhase("burst");
        playBurst();
      }, chargeMs)
    );
    timers.push(
      window.setTimeout(() => {
        if (grand) {
          setPhase("awaken");
          speakBest();
        } else {
          setPhase("cards");
          playReveal(best.spirit.rarity);
        }
      }, chargeMs + BURST_MS)
    );
    if (grand) {
      timers.push(
        window.setTimeout(() => setPhase("cards"), chargeMs + BURST_MS + AWAKEN_MS)
      );
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tap advances: charge/burst → reveal, awaken → cards, cards → dismiss.
  const handleBackdrop = () => {
    if (phase === "cards") onClose();
    else if (phase === "awaken") setPhase("cards");
    else if (grand) {
      setPhase("awaken");
      speakBest();
    } else {
      setPhase("cards");
      playReveal(best.spirit.rarity);
    }
  };

  return (
    <div
      onClick={handleBackdrop}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 overflow-hidden p-6 backdrop-blur-md ${
        best.spirit.element && phase !== "cards" ? `env-${best.spirit.element}` : "bg-black/90"
      } ${phase === "burst" ? "vfx-screen-shake-heavy" : ""}`}
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

      {/* ── AWAKEN ── the star flies out, wakes up, and SPEAKS (legendary+) ── */}
      {phase === "awaken" && (
        <div
          className={`relative flex flex-col items-center gap-5 ${
            bestMeta.tier >= RARITY.demon.tier ? "gq-tremble" : ""
          } ${bestMeta.tier >= RARITY.secret.tier ? "gq-invert" : ""}`}
        >
          {/* escalating effects — richer for each higher rarity */}
          <AwakenEffects
            tier={bestMeta.tier}
            glow={bestMeta.glow}
            rainbow={!!best.spirit.art.rainbow}
          />
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="pointer-events-none absolute top-0 text-xl"
              style={{ left: c.x, animation: `spark-fall ${c.dur} linear ${c.delay} infinite` }}
            >
              {c.e}
            </span>
          ))}

          <p
            className={`font-mono text-sm font-bold uppercase tracking-[0.35em] ${bestMeta.text}`}
            style={{ animation: "gacha-rise 0.5s ease-out both", textShadow: `0 0 18px ${bestMeta.glow}` }}
          >
            {bestMeta.label}
          </p>

          {/* the crystal HATCHES — cracks, splits open, the hero rises out of
              the light, gets knocked, then BURSTS with power, then walks/talks */}
          <div className="sp-stroll relative flex h-52 w-52 items-center justify-center">
            {/* the crystal shell, sitting where the charge-orb ended up */}
            <div className="shell-crack pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className="shell-half-l absolute h-24 w-14 origin-right rounded-l-full"
                style={{ right: "50%", background: `linear-gradient(135deg, #fff, ${bestMeta.glow})`, boxShadow: `0 0 30px 4px ${bestMeta.glow}` }}
              />
              <div
                className="shell-half-r absolute h-24 w-14 origin-left rounded-r-full"
                style={{ left: "50%", background: `linear-gradient(315deg, #fff, ${bestMeta.glow})`, boxShadow: `0 0 30px 4px ${bestMeta.glow}` }}
              />
            </div>
            {/* light bloom the instant it splits */}
            <div
              className="hatch-flash pointer-events-none absolute h-40 w-40 rounded-full"
              style={{ background: `radial-gradient(circle, #fff, ${bestMeta.glow} 55%, transparent 75%)` }}
            />

            {/* power-up ring + light beam, timed to the post-hatch impact burst */}
            <div
              className="power-ring pointer-events-none absolute h-40 w-40 rounded-full border-4"
              style={{ borderColor: bestMeta.glow, boxShadow: `0 0 40px 4px ${bestMeta.glow}` }}
            />
            <div
              className="power-beam pointer-events-none absolute h-64 w-10"
              style={{ background: `linear-gradient(to bottom, transparent, ${bestMeta.glow}, transparent)` }}
            />

            {/* RGB-split ghost duplicates — ??? only */}
            {bestMeta.tier >= RARITY.secret.tier && (
              <>
                <div className="gq-rgb-r pointer-events-none absolute mix-blend-screen" style={{ filter: "sepia(1) saturate(6) hue-rotate(-50deg)" }}>
                  <SpiritArt spirit={best.spirit} size={190} talking walking={false} />
                </div>
                <div className="gq-rgb-b pointer-events-none absolute mix-blend-screen" style={{ filter: "sepia(1) saturate(6) hue-rotate(150deg)" }}>
                  <SpiritArt spirit={best.spirit} size={190} talking walking={false} />
                </div>
              </>
            )}

            {/* rising flame particles licking up around the hero — demon only */}
            {bestMeta.tier === RARITY.demon.tier &&
              FLAMES.map((f, i) => (
                <span
                  key={i}
                  className="gq-flame pointer-events-none absolute bottom-2 text-2xl"
                  style={{ left: f.x, animationDelay: `${f.delay}s` }}
                >
                  🔥
                </span>
              ))}

            <div className="sp-hatch" style={{ filter: `drop-shadow(0 0 40px ${bestMeta.glow})` }}>
              <div className="sp-impact">
                <div className="sp-hop">
                  <CharacterArt spirit={best.spirit} size={best.spirit.element ? 210 : 190} talking />
                </div>
              </div>
            </div>
          </div>

          {/* speech bubble — appears right as the power-up lands, not before */}
          <div
            className="bubble-pop relative max-w-xs rounded-2xl border-2 bg-panel/95 px-5 py-3 text-center opacity-0"
            style={{
              borderColor: bestMeta.glow,
              boxShadow: `0 0 30px -8px ${bestMeta.glow}`,
              animationDelay: "2.15s",
            }}
          >
            <p className="font-display text-base font-bold text-white">
              “{voiceLine(best.spirit)}”
            </p>
            <span
              className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l-2 border-t-2 bg-panel"
              style={{ borderColor: bestMeta.glow }}
            />
          </div>

          <div
            className="flex flex-col items-center opacity-0"
            style={{ animation: "gacha-rise 0.6s ease-out 2.3s both" }}
          >
            <p className="text-center font-display text-2xl font-extrabold text-white">
              {best.spirit.name}
            </p>
            {best.spirit.title && (
              <p className={`mt-0.5 font-mono text-[11px] uppercase tracking-widest ${bestMeta.text}`}>
                “{best.spirit.title}”
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPhase("cards");
            }}
            className="rounded-xl border border-white/25 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-105"
          >
            Continue
          </button>
          <p className="text-[11px] text-white/40">tap anywhere to continue</p>
        </div>
      )}

      {/* ── CARDS ── the reveal ── */}
      {phase === "cards" && (
        <>
          {grand &&
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
                  <div
                    className="sp-flyin flex h-20 items-center justify-center drop-shadow-[0_0_16px_rgba(255,255,255,0.4)]"
                    style={{ animationDelay: `${i * 80 + 120}ms` }}
                  >
                    <CharacterArt spirit={o.spirit} size={o.spirit.element ? 66 : 76} />
                  </div>
                  <p className="mt-2 font-display text-xs font-bold leading-tight text-white">{o.spirit.name}</p>
                  <p className={`font-mono text-[10px] font-bold uppercase tracking-wider ${meta.text}`}>
                    {meta.label}
                  </p>
                  <p className={`mt-1 text-[11px] font-semibold ${meta.text}`}>{o.spirit.buff}</p>
                </div>
              );
            })}
          </div>

          <div className="relative flex flex-col items-center gap-3">
            {grand && (
              <p
                className="bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-yellow bg-clip-text font-display text-xl font-extrabold text-transparent"
                style={{ animation: "gacha-rise 0.5s ease-out 0.3s both" }}
              >
                🌟 A {bestMeta.label.toUpperCase()} spirit answered your call! 🌟
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

/** Rising particle positions (energy / embers). */
const RISERS = Array.from({ length: 16 }, (_, i) => ({
  x: `${6 + i * 6}%`,
  dur: 1.8 + (i % 5) * 0.4,
  delay: (i % 7) * 0.25,
}));

/** Flame emoji positions ringing the demon hero's feet. */
const FLAMES = [
  { x: "18%", delay: 0 },
  { x: "30%", delay: 0.3 },
  { x: "42%", delay: 0.6 },
  { x: "54%", delay: 0.15 },
  { x: "66%", delay: 0.45 },
  { x: "78%", delay: 0.75 },
];

/**
 * Escalating spectacle behind the awakening hero. Effects stack as rarity
 * climbs: orbiting sparks → aura rings → rising energy → rainbow storm →
 * demon flames → reality glitch. Higher rarity = visibly more going on.
 */
function AwakenEffects({
  tier,
  glow,
  rainbow,
}: {
  tier: number;
  glow: string;
  rainbow: boolean;
}) {
  const orbits = Math.min(6 + tier, 16);
  return (
    <>
      {/* soft radial base */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{ background: `radial-gradient(circle at 50% 42%, ${glow}, transparent 42%)` }}
      />

      {/* rainbow storm — chromatic+ (or any rainbow spirit) */}
      {(rainbow || tier >= RARITY.chromatic.tier) && (
        <div className="chroma-bg pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[170vh] w-[170vh] -translate-x-1/2 -translate-y-1/2 opacity-20" />
      )}

      {/* demon inferno + lightning + cracked ground — demon only (??? gets its own scene below) */}
      {tier === RARITY.demon.tier && (
        <>
          <div
            className="gq-vignette pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(circle at 50% 88%, rgba(255,59,44,0.55), transparent 55%)" }}
          />
          {/* screen-wide flash on each bolt strike */}
          <div className="gq-bolt pointer-events-none absolute inset-0 -z-10 bg-[#ff3b5c]/25" />
          {/* jagged lightning bolts */}
          <svg
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2"
            viewBox="0 0 200 260"
          >
            <path
              className="gq-bolt"
              d="M70 0 L90 70 L60 80 L110 180 L85 110 L120 100 Z"
              fill="#fff2e0"
              style={{ filter: "drop-shadow(0 0 10px #ff3b5c)" }}
            />
            <path
              className="gq-bolt"
              style={{ animationDelay: "1.3s", filter: "drop-shadow(0 0 10px #ff3b5c)" }}
              d="M150 10 L165 60 L142 66 L175 140 L155 90 L182 84 Z"
              fill="#fff2e0"
            />
          </svg>
          {/* cracked ground beneath the hero */}
          <svg
            className="pointer-events-none absolute bottom-2 left-1/2 -z-10 h-16 w-64 -translate-x-1/2"
            viewBox="0 0 260 60"
          >
            <path
              className="gq-crack"
              d="M10 30 L70 25 L90 40 L130 20 L160 38 L200 15 L250 32"
              stroke="#ff3b5c"
              strokeWidth="2.5"
              fill="none"
              style={{ filter: "drop-shadow(0 0 6px #ff3b5c)" }}
            />
          </svg>
        </>
      )}

      {/* reality tear + RGB split glitch — ??? only */}
      {tier >= RARITY.secret.tier && (
        <>
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(circle at 50% 45%, rgba(10,10,20,0.6), transparent 60%)" }}
          />
          <div className="gq-glitch pointer-events-none absolute inset-0 -z-10" />
          <div
            className="gq-tear pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vh] w-1 -translate-x-1/2 -translate-y-1/2 bg-white"
            style={{ boxShadow: "0 0 40px 8px rgba(200,255,255,0.9)" }}
          />
        </>
      )}

      {/* orbiting sparks — always (legendary+), more as tier climbs */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="orbit-cw relative h-72 w-72">
          {Array.from({ length: orbits }).map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `rotate(${(i / orbits) * 360}deg) translateY(-150px)`,
                color: glow,
                textShadow: `0 0 8px ${glow}`,
              }}
            >
              ✦
            </span>
          ))}
        </div>
        {/* second counter-rotating ring for mythic+ */}
        {tier >= RARITY.mythic.tier && (
          <div className="orbit-ccw absolute h-96 w-96">
            {Array.from({ length: orbits }).map((_, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 text-sm"
                style={{
                  transform: `rotate(${(i / orbits) * 360}deg) translateY(-200px)`,
                  color: glow,
                }}
              >
                ✦
              </span>
            ))}
          </div>
        )}
      </div>

      {/* pulsing aura rings — mythic+ */}
      {tier >= RARITY.mythic.tier &&
        [0, 1, 2].map((i) => (
          <div
            key={i}
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border-2"
            style={{
              width: 230 + i * 80,
              height: 230 + i * 80,
              marginLeft: -(115 + i * 40),
              marginTop: -(115 + i * 40),
              borderColor: glow,
              animation: `ring-pulse ${2.2 + i * 0.5}s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}

      {/* rising energy — ultra mythic+ (embers for demon) */}
      {tier >= RARITY.ultramythic.tier &&
        RISERS.map((r, i) => (
          <span
            key={i}
            className="pointer-events-none absolute bottom-8 rounded-full"
            style={{
              left: r.x,
              width: 6,
              height: 6,
              background: tier >= RARITY.demon.tier ? "#ff6a2c" : glow,
              boxShadow: `0 0 10px 2px ${tier >= RARITY.demon.tier ? "#ff3b00" : glow}`,
              animation: `rise-up ${r.dur}s ease-out ${r.delay}s infinite`,
            }}
          />
        ))}
    </>
  );
}
