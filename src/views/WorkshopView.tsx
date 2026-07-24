import { useState } from "react";
import { Hammer, Flame, AlertTriangle, Check, X } from "lucide-react";
import { useStore } from "../store/StoreContext";
import SpiritArt from "../components/SpiritArt";
import { SPIRIT_BY_ID, RARITY, RARITY_ORDER, type Spirit } from "../lib/gacha";

export default function WorkshopView() {
  const { data, bindSpirits, exchangeSecrets } = useStore();
  const { game } = data;

  const [shake, setShake] = useState(false);
  const [altar, setAltar] = useState<string[]>([]); // up to 2 secret ids
  const [confirming, setConfirming] = useState(false);
  const [voucher, setVoucher] = useState<string | null>(null);

  const owned = Object.entries(game.spirits)
    .map(([id, n]) => ({ s: SPIRIT_BY_ID[id], n }))
    .filter((x): x is { s: Spirit; n: number } => !!x.s);

  const bindable = owned.filter((x) => x.n >= 3);
  const secrets = owned.filter((x) => x.s.rarity === "secret");

  function doBind(id: string) {
    const crafted = bindSpirits(id);
    if (crafted) {
      setShake(true);
      setTimeout(() => setShake(false), 650);
    }
  }

  // How many of each id the altar currently holds.
  const altarCount: Record<string, number> = {};
  for (const id of altar) altarCount[id] = (altarCount[id] ?? 0) + 1;

  function toggleAltar(id: string) {
    setVoucher(null);
    setConfirming(false);
    if (altar.length >= 2 && !altarCount[id]) return;
    // add one (respecting owned count)
    const have = game.spirits[id] ?? 0;
    if ((altarCount[id] ?? 0) >= have) return;
    if (altar.length < 2) setAltar([...altar, id]);
  }

  function clearAltar() {
    setAltar([]);
    setConfirming(false);
    setVoucher(null);
  }

  function doSacrifice() {
    if (altar.length !== 2) return;
    const code = exchangeSecrets([altar[0], altar[1]] as [string, string]);
    if (code) {
      setVoucher(code);
      setAltar([]);
      setConfirming(false);
    }
  }

  return (
    <section className={`space-y-6 ${shake ? "vfx-screen-shake-heavy" : ""}`}>
      {/* header */}
      <div className="flex items-center gap-3 rounded-2xl border border-neon-yellow/25 bg-gradient-to-br from-neon-yellow/[0.06] to-transparent p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neon-yellow/40 bg-neon-yellow/10 text-neon-yellow shadow-glow">
          <Hammer size={20} />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tightish text-white">Workshop</h2>
          <p className="text-sm text-white/50">
            Bind duplicates into rarer pets, or sacrifice ??? pets at the Altar.
          </p>
        </div>
      </div>

      {/* ── Binding Press ─────────────────────────────────── */}
      <div className="rounded-2xl border border-edge bg-panel/70 p-5">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <Hammer size={18} className="text-neon-cyan" /> Binding Press
        </h3>
        <p className="mt-1 text-sm text-white/50">
          Slot in <span className="font-semibold text-white">3 identical pets</span> → the press slams down and forges one pet of the next rarity up.
        </p>

        {bindable.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-edge bg-panel2/30 p-6 text-center text-sm text-white/40">
            No triples yet. Summon more pets — once you own 3 of the same, it can be bound.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {bindable.map(({ s, n }) => {
              const meta = RARITY[s.rarity];
              const nextRarity = RARITY_ORDER[RARITY_ORDER.indexOf(s.rarity) + 1];
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border p-3"
                  style={{ borderColor: meta.glow }}
                >
                  <SpiritArt spirit={s} size={44} walking={false} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {s.emoji} {s.name}
                    </p>
                    <p className={`text-[11px] ${meta.text}`}>
                      {meta.label} · owned ×{n}
                    </p>
                  </div>
                  <button
                    onClick={() => doBind(s.id)}
                    disabled={!nextRarity}
                    className="shrink-0 rounded-lg border border-neon-cyan/50 bg-neon-cyan/10 px-3 py-2 text-xs font-bold text-neon-cyan transition hover:bg-neon-cyan/20 active:scale-95 disabled:opacity-40"
                  >
                    Bind ×3 →{" "}
                    {nextRarity ? RARITY[nextRarity].label : "MAX"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Altar of Sacrifice ────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-neon-pink/30 p-5"
        style={{ background: "radial-gradient(90% 70% at 50% 0%, rgba(255,59,92,0.12), transparent 60%), #140a0c" }}
      >
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <Flame size={18} className="text-neon-pink" /> Altar of Sacrifice
        </h3>
        <p className="mt-1 text-sm text-white/55">
          Offer <span className="font-semibold text-neon-pink">two ??? (Secret) pets</span> to receive a voucher.
          They are gone forever.
        </p>

        {/* offering slots */}
        <div className="mt-4 flex items-center justify-center gap-4">
          {[0, 1].map((i) => {
            const id = altar[i];
            const s = id ? SPIRIT_BY_ID[id] : null;
            return (
              <div
                key={i}
                className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed"
                style={{ borderColor: s ? RARITY.secret.glow : "#3a2530" }}
              >
                {s ? <SpiritArt spirit={s} size={54} walking={false} /> : <span className="text-3xl text-white/20">?</span>}
              </div>
            );
          })}
        </div>

        {secrets.length === 0 ? (
          <p className="mt-4 text-center text-sm text-white/40">
            You have no ??? pets yet. They are the rarest of all (0.02%).
          </p>
        ) : (
          <>
            <p className="mt-4 text-center text-[11px] uppercase tracking-wider text-white/40">Your ??? pets — tap to offer</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {secrets.map(({ s, n }) => (
                <button
                  key={s.id}
                  onClick={() => toggleAltar(s.id)}
                  className="flex w-24 flex-col items-center rounded-xl border border-white/15 bg-black/30 p-2 transition hover:border-white/40"
                >
                  <SpiritArt spirit={s} size={38} walking={false} />
                  <span className="mt-1 text-[10px] font-semibold text-white">{s.name}</span>
                  <span className="text-[9px] text-white/40">
                    owned ×{n} · offered {altarCount[s.id] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* action */}
        <div className="mt-5 flex flex-col items-center gap-3">
          {altar.length > 0 && (
            <button onClick={clearAltar} className="flex items-center gap-1 text-xs text-white/50 hover:text-white">
              <X size={12} /> clear altar
            </button>
          )}

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              disabled={altar.length !== 2}
              className="rounded-xl border border-neon-pink/50 bg-neon-pink/15 px-6 py-2.5 text-sm font-bold text-neon-pink transition hover:bg-neon-pink/25 active:scale-95 disabled:opacity-40"
            >
              Sacrifice ({altar.length}/2)
            </button>
          ) : (
            <div className="w-full max-w-sm rounded-xl border border-neon-pink/50 bg-black/50 p-4 text-center">
              <p className="flex items-center justify-center gap-1.5 font-semibold text-neon-pink">
                <AlertTriangle size={15} /> Are you sure?
              </p>
              <p className="mt-1 text-xs text-white/60">
                Sacrificing these entities permanently erases them. This cannot be undone.
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  onClick={doSacrifice}
                  className="rounded-lg border border-neon-pink/60 bg-neon-pink/20 px-4 py-2 text-xs font-bold text-neon-pink"
                >
                  <Check size={12} className="mr-1 inline" /> Yes, sacrifice
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {voucher && (
            <div className="w-full max-w-sm rounded-xl border border-neon-yellow/40 bg-neon-yellow/5 p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-neon-yellow">$10 Voucher</p>
              <p className="mt-1 font-mono text-lg font-bold tracking-widest text-white">{voucher}</p>
              <p className="mt-2 text-[11px] text-white/40">
                ⚠️ DEMO only — not a real, redeemable voucher. Real redemption needs the secured
                backend (Grab API + ledger) from GDD §8.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
