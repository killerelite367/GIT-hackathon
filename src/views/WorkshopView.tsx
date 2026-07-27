import { useState } from "react";
import { Hammer, Flame, AlertTriangle, Check, X, BookMarked, Plus, Sparkles } from "lucide-react";
import { useStore } from "../store/StoreContext";
import SpiritArt from "../components/SpiritArt";
import { SPIRIT_BY_ID, RARITY, RARITY_ORDER, type Spirit, type Rarity } from "../lib/gacha";

export default function WorkshopView() {
  const { data, bindSpirits, exchangeSecrets, giftSecrets } = useStore();
  const { game } = data;

  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [pickingSlot, setPickingSlot] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [result, setResult] = useState<Spirit | null>(null);
  const [showRecipes, setShowRecipes] = useState(false);

  const [altar, setAltar] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);

  const owned = Object.entries(game.spirits)
    .map(([id, n]) => ({ s: SPIRIT_BY_ID[id], n }))
    .filter((x): x is { s: Spirit; n: number } => !!x.s);

  // How many of each id the merge slots already hold (so we don't over-allocate).
  const slotCount: Record<string, number> = {};
  for (const id of slots) if (id) slotCount[id] = (slotCount[id] ?? 0) + 1;

  const filled = slots.filter(Boolean) as string[];
  const allSame = filled.length === 3 && filled.every((id) => id === filled[0]);
  const mergeId = allSame ? filled[0] : null;
  const mergeBase = mergeId ? SPIRIT_BY_ID[mergeId] : null;
  const nextRarity = mergeBase ? RARITY_ORDER[RARITY_ORDER.indexOf(mergeBase.rarity) + 1] : undefined;
  const canMerge = !!mergeId && !!nextRarity;

  function pickForSlot(id: string) {
    // fill the currently-picking slot (or the first empty one)
    const target = pickingSlot ?? slots.findIndex((s) => s === null);
    if (target < 0) return;
    const have = game.spirits[id] ?? 0;
    if ((slotCount[id] ?? 0) >= have) return; // can't slot more than you own
    const next = [...slots];
    next[target] = id;
    setSlots(next);
    setPickingSlot(null);
    setResult(null);
  }

  function clearSlot(i: number) {
    const next = [...slots];
    next[i] = null;
    setSlots(next);
    setResult(null);
  }

  function doMerge() {
    if (!mergeId || !canMerge) return;
    const crafted = bindSpirits(mergeId);
    if (crafted) {
      setShake(true);
      setTimeout(() => setShake(false), 650);
      setSlots([null, null, null]);
      setResult(SPIRIT_BY_ID[crafted] ?? null);
    }
  }

  // ── Altar ──
  const secrets = owned.filter((x) => x.s.rarity === "secret");
  const altarCount: Record<string, number> = {};
  for (const id of altar) altarCount[id] = (altarCount[id] ?? 0) + 1;
  function toggleAltar(id: string) {
    setConfirming(false);
    const have = game.spirits[id] ?? 0;
    if (altar.length >= 2 || (altarCount[id] ?? 0) >= have) return;
    setAltar([...altar, id]);
  }
  function doSacrifice() {
    if (altar.length !== 2) return;
    const code = exchangeSecrets([altar[0], altar[1]] as [string, string]);
    if (code) {
      setAltar([]);
      setConfirming(false);
    }
  }

  return (
    <section className={`relative space-y-6 ${shake ? "vfx-screen-shake-heavy" : ""}`}>
      {/* header + recipe book button */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-neon-yellow/25 bg-gradient-to-br from-neon-yellow/[0.06] to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neon-yellow/40 bg-neon-yellow/10 text-neon-yellow shadow-glow">
            <Hammer size={20} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tightish text-white">The Workshop</h2>
            <p className="text-sm text-white/50">Slot in 3 identical pets and press Merge.</p>
          </div>
        </div>
        <button
          onClick={() => setShowRecipes(true)}
          className="flex items-center gap-1.5 rounded-lg border border-neon-yellow/40 bg-neon-yellow/10 px-3 py-2 text-sm font-semibold text-neon-yellow transition hover:bg-neon-yellow/20"
        >
          <BookMarked size={15} /> Recipe Book
        </button>
      </div>

      {/* ── Binding Press: the merge machine ── */}
      <div className="rounded-2xl border border-edge bg-panel/70 p-6">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <Hammer size={18} className="text-neon-cyan" /> Binding Press
        </h3>

        {/* merge slots */}
        <div className="mt-5 flex items-center justify-center gap-3 sm:gap-5">
          {slots.map((id, i) => {
            const s = id ? SPIRIT_BY_ID[id] : null;
            const active = pickingSlot === i;
            return (
              <button
                key={i}
                onClick={() => (s ? clearSlot(i) : setPickingSlot(active ? null : i))}
                className={`flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed transition ${
                  active ? "scale-105 border-neon-cyan bg-neon-cyan/10" : "border-edge2 hover:border-neon-cyan/50"
                }`}
                title={s ? `${s.name} — click to remove` : "Click, then pick a pet below"}
              >
                {s ? <SpiritArt spirit={s} size={54} walking={false} /> : <Plus size={22} className="text-white/25" />}
              </button>
            );
          })}
        </div>

        {/* merge button */}
        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            onClick={doMerge}
            disabled={!canMerge}
            className="rounded-xl border border-neon-cyan/60 bg-gradient-to-br from-neon-cyan/25 to-neon-cyan/10 px-8 py-3 font-display font-bold text-white shadow-[0_0_24px_-6px_rgba(95,208,255,0.6)] transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            ⚒️ MERGE
          </button>
          <p className="text-[11px] text-white/45">
            {filled.length < 3
              ? `Fill all 3 slots (${filled.length}/3)`
              : !allSame
              ? "All 3 must be the SAME pet"
              : !nextRarity
              ? "Already the top rarity"
              : `Forges 1 random ${RARITY[nextRarity].label} pet`}
          </p>
        </div>

        {/* result */}
        {result && (
          <div className="mx-auto mt-4 flex max-w-xs items-center gap-3 rounded-xl border p-3" style={{ borderColor: RARITY[result.rarity].glow, background: "rgba(0,0,0,0.3)" }}>
            <SpiritArt spirit={result} size={44} walking={false} />
            <div>
              <p className="text-sm font-bold text-white">Forged {result.emoji} {result.name}!</p>
              <p className={`text-[11px] ${RARITY[result.rarity].text}`}>{RARITY[result.rarity].label}</p>
            </div>
          </div>
        )}

        {/* inventory picker */}
        <div className="mt-6 border-t border-edge pt-4">
          <p className="mb-2 text-[11px] uppercase tracking-wider text-white/40">
            {pickingSlot != null ? `Pick a pet for slot ${pickingSlot + 1}` : "Your pets — tap to add to the press"}
          </p>
          {owned.length === 0 ? (
            <p className="text-sm text-white/40">No pets yet — summon some in the Summon tab.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {owned.map(({ s, n }) => {
                const meta = RARITY[s.rarity];
                const used = slotCount[s.id] ?? 0;
                const soldOut = used >= n;
                return (
                  <button
                    key={s.id}
                    onClick={() => pickForSlot(s.id)}
                    disabled={soldOut}
                    className={`flex w-[74px] flex-col items-center rounded-xl border p-1.5 transition hover:-translate-y-0.5 disabled:opacity-30 ${
                      used > 0 ? "ring-1 ring-neon-cyan/40" : ""
                    }`}
                    style={{ borderColor: meta.glow }}
                  >
                    <SpiritArt spirit={s} size={34} walking={false} />
                    <span className="mt-0.5 line-clamp-1 text-[9px] font-semibold text-white">{s.name}</span>
                    <span className="text-[9px] text-white/40">×{n - used}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Altar of Sacrifice ── */}
      <div className="relative overflow-hidden rounded-2xl border border-neon-pink/30 p-5" style={{ background: "radial-gradient(90% 70% at 50% 0%, rgba(255,59,92,0.12), transparent 60%), #140a0c" }}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
              <Flame size={18} className="text-neon-pink" /> Altar of Sacrifice
            </h3>
            <p className="mt-1 text-sm text-white/55">
              Offer <span className="font-semibold text-neon-pink">two ??? (Secret) pets</span> to receive a voucher. They are gone forever.
            </p>
          </div>
          <button
            onClick={giftSecrets}
            title="Demo: gift 2 ??? (Secret) pets so you can test the Altar without grinding the 0.02% pull rate"
            className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-neon-pink/50 bg-neon-pink/10 px-2.5 text-xs font-semibold text-neon-pink transition hover:bg-neon-pink/20"
          >
            <Sparkles size={14} /> +2 ???
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4">
          {[0, 1].map((i) => {
            const id = altar[i];
            const s = id ? SPIRIT_BY_ID[id] : null;
            return (
              <div key={i} className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed" style={{ borderColor: s ? RARITY.secret.glow : "#3a2530" }}>
                {s ? <SpiritArt spirit={s} size={54} walking={false} /> : <span className="text-3xl text-white/20">?</span>}
              </div>
            );
          })}
        </div>
        {secrets.length === 0 ? (
          <p className="mt-4 text-center text-sm text-white/40">You have no ??? pets yet. They are the rarest of all (0.02%).</p>
        ) : (
          <>
            <p className="mt-4 text-center text-[11px] uppercase tracking-wider text-white/40">Your ??? pets — tap to offer</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {secrets.map(({ s, n }) => (
                <button key={s.id} onClick={() => toggleAltar(s.id)} className="flex w-24 flex-col items-center rounded-xl border border-white/15 bg-black/30 p-2 transition hover:border-white/40">
                  <SpiritArt spirit={s} size={38} walking={false} />
                  <span className="mt-1 text-[10px] font-semibold text-white">{s.name}</span>
                  <span className="text-[9px] text-white/40">owned ×{n} · offered {altarCount[s.id] ?? 0}</span>
                </button>
              ))}
            </div>
          </>
        )}
        <div className="mt-5 flex flex-col items-center gap-3">
          {altar.length > 0 && (
            <button onClick={() => { setAltar([]); setConfirming(false); }} className="flex items-center gap-1 text-xs text-white/50 hover:text-white"><X size={12} /> clear altar</button>
          )}
          {!confirming ? (
            <button onClick={() => setConfirming(true)} disabled={altar.length !== 2} className="rounded-xl border border-neon-pink/50 bg-neon-pink/15 px-6 py-2.5 text-sm font-bold text-neon-pink transition hover:bg-neon-pink/25 active:scale-95 disabled:opacity-40">
              Sacrifice ({altar.length}/2)
            </button>
          ) : (
            <div className="w-full max-w-sm rounded-xl border border-neon-pink/50 bg-black/50 p-4 text-center">
              <p className="flex items-center justify-center gap-1.5 font-semibold text-neon-pink"><AlertTriangle size={15} /> Are you sure?</p>
              <p className="mt-1 text-xs text-white/60">Sacrificing these entities permanently erases them. This cannot be undone.</p>
              <div className="mt-3 flex justify-center gap-2">
                <button onClick={doSacrifice} className="rounded-lg border border-neon-pink/60 bg-neon-pink/20 px-4 py-2 text-xs font-bold text-neon-pink"><Check size={12} className="mr-1 inline" /> Yes, sacrifice</button>
                <button onClick={() => setConfirming(false)} className="rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {game.vouchers.length > 0 && (
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="mb-2 text-center text-[11px] uppercase tracking-wider text-white/40">
              Your vouchers <span className="text-white/60">({game.vouchers.length})</span>
            </p>
            <div className="mx-auto flex max-w-sm flex-col gap-2">
              {[...game.vouchers].reverse().map((code, i) => (
                <div
                  key={code + i}
                  className="flex items-center justify-between rounded-xl border border-neon-yellow/40 bg-neon-yellow/5 px-4 py-2.5"
                >
                  <span className="text-xs uppercase tracking-wider text-neon-yellow">$10 Voucher</span>
                  <span className="font-mono text-sm font-bold tracking-widest text-white">{code}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-[11px] text-white/40">
              ⚠️ DEMO only — not real, redeemable vouchers. Real redemption needs the secured backend (Grab API + ledger) from GDD §8.
            </p>
          </div>
        )}
      </div>

      {/* ── Recipe Book modal ── */}
      {showRecipes && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowRecipes(false)}>
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-neon-yellow/40 bg-panel p-5 shadow-lift" onClick={(e) => e.stopPropagation()} style={{ animation: "popin 0.2s ease-out both" }}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white"><BookMarked size={18} className="text-neon-yellow" /> Recipe Book</h3>
              <button onClick={() => setShowRecipes(false)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>
            <p className="text-sm text-white/55">The Binding Press fuses <b className="text-white">3 identical pets</b> into <b className="text-white">1 random pet of the next rarity up</b>. The ladder:</p>
            <div className="mt-4 space-y-1.5">
              {RARITY_ORDER.slice(0, -1).map((r) => {
                const next = RARITY_ORDER[RARITY_ORDER.indexOf(r) + 1] as Rarity;
                return (
                  <div key={r} className="flex items-center gap-2 rounded-lg border border-edge bg-panel2/50 px-3 py-2 text-sm">
                    <span className={`font-semibold ${RARITY[r].text}`}>3× {RARITY[r].label}</span>
                    <span className="text-white/30">→</span>
                    <span className={`font-semibold ${RARITY[next].text}`}>1× {RARITY[next].label}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[11px] text-white/40">Tip: bind your spare Commons upward — it's the cheapest path to Rare and Ultra Rare pets.</p>
          </div>
        </div>
      )}
    </section>
  );
}
