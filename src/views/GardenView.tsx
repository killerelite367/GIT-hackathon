import { useState } from "react";
import { Sprout, Sparkles, BookOpen, Coffee, X } from "lucide-react";
import { useStore } from "../store/StoreContext";
import SpiritArt from "../components/SpiritArt";
import { SPIRIT_BY_ID, RARITY, type Spirit } from "../lib/gacha";

const N = 6; // 6×6 isometric plot
const TILE_W = 78;
const TILE_H = 39;

/** Garden health from real task-completion ratio (GDD §3.1). */
function gardenHealth(done: number, total: number) {
  const ratio = total === 0 ? 1 : done / total;
  if (ratio >= 0.9)
    return { ratio, label: "Flourishing", grass: "#4CAF50", edge: "#69d16d", mood: "vibrant" as const };
  if (ratio >= 0.5)
    return { ratio, label: "Healthy", grass: "#5a9b3a", edge: "#77b84e", mood: "normal" as const };
  return { ratio, label: "Wilting", grass: "#8D6E63", edge: "#a88472", mood: "sickly" as const };
}

/** Passive gacha-luck bonus from placed pets (GDD: garden boosts Luck). */
function gardenLuck(placedIds: string[]): number {
  let luck = 0;
  for (const id of placedIds) {
    const s = SPIRIT_BY_ID[id];
    if (s) luck += 0.5 + RARITY[s.rarity].tier * 0.4;
  }
  return Math.round(luck * 10) / 10;
}

export default function GardenView() {
  const { data, placeInGarden, removeFromGarden } = useStore();
  const { game, assignments } = data;
  const [selected, setSelected] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState(false);

  const done = assignments.filter((a) => a.completed).length;
  const health = gardenHealth(done, assignments.length);
  const placedIds = Object.values(game.garden);
  const luck = gardenLuck(placedIds);

  // Owned spirits not yet placed → the planting tray.
  const placedSet = new Set(placedIds);
  const tray: Spirit[] = Object.keys(game.spirits)
    .map((id) => SPIRIT_BY_ID[id])
    .filter((s): s is Spirit => !!s && !placedSet.has(s.id))
    .sort((a, b) => RARITY[b.rarity].tier - RARITY[a.rarity].tier);

  const originX = ((N - 1) * TILE_W) / 2;

  function onTile(tile: string) {
    const occupant = game.garden[tile];
    if (occupant) {
      removeFromGarden(tile); // click a planted pet to lift it back to the tray
      return;
    }
    if (selected) {
      placeInGarden(selected, tile);
      setSelected(null);
    }
  }

  return (
    <section className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neon-green/25 bg-gradient-to-br from-neon-green/[0.06] to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neon-green/40 bg-neon-green/10 text-neon-green shadow-glow">
            <Sprout size={20} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tightish text-white">GPA Garden</h2>
            <p className="text-sm text-white/50">
              Your garden reflects your real progress. Plant pets to boost your luck.
            </p>
          </div>
        </div>
        <button
          onClick={() => setStudyMode((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
            studyMode
              ? "border-neon-purple/50 bg-neon-purple/15 text-neon-purple"
              : "border-edge text-white/60 hover:text-white"
          }`}
        >
          {studyMode ? <BookOpen size={15} /> : <Coffee size={15} />}
          {studyMode ? "Study mode" : "Rest mode"}
        </button>
      </div>

      {/* stat strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-edge bg-panel/70 p-4">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Garden state</p>
          <p className="mt-1 font-display text-lg font-bold" style={{ color: health.edge }}>
            {health.label}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(health.ratio * 100)}%`, background: health.grass }} />
          </div>
        </div>
        <div className="rounded-2xl border border-edge bg-panel/70 p-4">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Garden luck</p>
          <p className="mt-1 flex items-center gap-1 font-display text-lg font-bold text-neon-yellow">
            <Sparkles size={15} /> +{luck}%
          </p>
          <p className="mt-1 text-[11px] text-white/40">{placedIds.length} pets planted</p>
        </div>
        <div className="rounded-2xl border border-edge bg-panel/70 p-4">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Binding glue</p>
          <p className="mt-1 font-display text-lg font-bold text-neon-cyan">🩹 {game.bindingGlue ?? 0}</p>
          <p className="mt-1 text-[11px] text-white/40">for the Binding Press</p>
        </div>
      </div>

      {/* the isometric plot */}
      <div
        className={`relative overflow-hidden rounded-2xl border border-edge p-6 transition ${
          studyMode ? "bg-[#0b0f1e]" : health.mood === "sickly" ? "bg-[#171310]" : "bg-[#0c130a]"
        }`}
        style={{
          backgroundImage: studyMode
            ? "radial-gradient(80% 60% at 50% 0%, rgba(169,139,255,0.12), transparent 60%)"
            : "radial-gradient(80% 60% at 50% 0%, rgba(124,255,107,0.1), transparent 60%)",
        }}
      >
        <div className="relative mx-auto" style={{ width: N * TILE_W, height: N * TILE_H + 90 }}>
          {Array.from({ length: N }).map((_, r) =>
            Array.from({ length: N }).map((__, c) => {
              const tile = `${r},${c}`;
              const x = originX + (c - r) * (TILE_W / 2);
              const y = (c + r) * (TILE_H / 2) + 30;
              const occupantId = game.garden[tile];
              const occupant = occupantId ? SPIRIT_BY_ID[occupantId] : null;
              return (
                <div key={tile}>
                  {/* diamond tile */}
                  <button
                    onClick={() => onTile(tile)}
                    className="absolute transition hover:brightness-125"
                    style={{
                      left: x,
                      top: y,
                      width: TILE_W,
                      height: TILE_H,
                      clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
                      background: health.grass,
                      boxShadow: `inset 0 0 0 1px ${health.edge}`,
                      cursor: occupant || selected ? "pointer" : "default",
                    }}
                    aria-label={occupant ? `Lift ${occupant.name}` : `Plant on tile ${tile}`}
                  />
                  {/* sickly weeds on edge tiles */}
                  {health.mood === "sickly" && (r === 0 || c === 0 || r === N - 1 || c === N - 1) && !occupant && (
                    <span className="pointer-events-none absolute text-xs" style={{ left: x + TILE_W / 2 - 6, top: y + 4 }}>
                      🥀
                    </span>
                  )}
                  {/* flowers when flourishing */}
                  {health.mood === "vibrant" && (r + c) % 4 === 0 && !occupant && (
                    <span className="pointer-events-none absolute text-xs" style={{ left: x + TILE_W / 2 - 6, top: y + 3 }}>
                      🌼
                    </span>
                  )}
                  {/* planted pet */}
                  {occupant && (
                    <button
                      onClick={() => onTile(tile)}
                      className="absolute z-10"
                      style={{ left: x + TILE_W / 2 - 26, top: y - 30 }}
                      title={`${occupant.name} — click to lift`}
                    >
                      <div className={studyMode ? "" : "sp-bob"} style={{ position: "relative" }}>
                        <SpiritArt spirit={occupant} size={52} walking={false} />
                        {studyMode ? (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">🤓</span>
                        ) : (
                          <span className="absolute -top-1 right-0 text-[10px]">💤</span>
                        )}
                      </div>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
        {placedIds.length === 0 && (
          <p className="mt-4 text-center text-sm text-white/40">
            Pick a pet below, then tap a tile to plant it. 🌱
          </p>
        )}
      </div>

      {/* planting tray */}
      <div className="rounded-2xl border border-edge bg-panel/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-white">Inventory · tap to select, then tap a tile</h3>
          {selected && (
            <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-xs text-white/50 hover:text-white">
              <X size={12} /> cancel
            </button>
          )}
        </div>
        {tray.length === 0 ? (
          <p className="text-sm text-white/40">
            No pets to plant — summon some in the Summon tab, or lift a planted pet by tapping it.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tray.map((s) => {
              const meta = RARITY[s.rarity];
              const isSel = selected === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(isSel ? null : s.id)}
                  className={`flex w-24 flex-col items-center rounded-xl border p-2 transition ${
                    isSel ? "scale-105" : "hover:-translate-y-0.5"
                  }`}
                  style={{
                    borderColor: isSel ? meta.glow : "#25252f",
                    boxShadow: isSel ? `0 0 18px -4px ${meta.glow}` : undefined,
                  }}
                >
                  <SpiritArt spirit={s} size={40} walking={false} />
                  <span className="mt-1 line-clamp-1 text-[10px] font-semibold text-white">{s.name}</span>
                  <span className={`text-[9px] ${meta.text}`}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
