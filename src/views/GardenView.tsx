import { useState, useRef } from "react";
import { Sprout, Sparkles, BookOpen, Coffee, Heart } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { computeGpa, scoreToGrade } from "../lib/gpa";
import { SHOP_ITEMS, SHOP_ITEM_BY_ID } from "../data/shopItems";
import { SPIRITS, SPIRIT_BY_ID } from "../lib/gacha";
import SpiritArt from "../components/SpiritArt";

const GRID_SIZE = 4; // 4x4 = 16 slots, expandable later

function gardenHealth(done: number, total: number) {
  const ratio = total === 0 ? 1 : done / total;
  if (ratio >= 0.9)
    return {
      ratio, label: "Flourishing", mood: "vibrant" as const,
      ground: "#4CAF50", groundDark: "#357a37",
      sky: "linear-gradient(180deg,#7ec8ff 0%,#bfe8ff 55%,#e8f7ff 100%)",
    };
  if (ratio >= 0.5)
    return {
      ratio, label: "Healthy", mood: "normal" as const,
      ground: "#5a9b3a", groundDark: "#3f7328",
      sky: "linear-gradient(180deg,#9bc4de 0%,#c9e0ee 60%,#e4f0f6 100%)",
    };
  return {
    ratio, label: "Wilting", mood: "sickly" as const,
    ground: "#8D6E63", groundDark: "#6a4f45",
    sky: "linear-gradient(180deg,#8a8a92 0%,#a8a8b0 60%,#c2c2c8 100%)",
  };
}

function gardenLuck(ids: string[]): number {
  return Math.round(ids.length * 2.5 * 10) / 10; // 2.5% per item placed
}

export default function GardenView() {
  const { data, placeInGarden, removeFromGarden } = useStore();
  const { game, assignments, modules } = data;
  const [selected, setSelected] = useState<string | null>(null);
  const [draggedSpirit, setDraggedSpirit] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [likes, setLikes] = useState(data.game.gardenLikes ?? 0);
  const [liked, setLiked] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const done = assignments.filter((a) => a.completed).length;
  const health = gardenHealth(done, assignments.length);
  const gpa = computeGpa(modules);
  const placedIds = Object.values(game.garden);
  const luck = gardenLuck(placedIds);

  const placedCounts: Record<string, number> = {};
  for (const id of placedIds) placedCounts[id] = (placedCounts[id] || 0) + 1;

  const ownedCount = (id: string) => game.accessories[id] ?? game.spirits[id] ?? 0;

  const trayFlowers = SHOP_ITEMS.filter((item) => ownedCount(item.id) > (placedCounts[item.id] || 0));
  const traySpirits = SPIRITS.filter((s) => ownedCount(s.id) > (placedCounts[s.id] || 0));
  const tray = [...trayFlowers, ...traySpirits];

  function handleDragStart(e: React.DragEvent, spiritId: string) {
    setDraggedSpirit(spiritId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDropOnSlot(e: React.DragEvent, slot: string) {
    e.preventDefault();
    if (!draggedSpirit) return;

    const existingInSlot = Object.entries(game.garden).find(
      ([k]) => k === slot
    )?.[1];
    if (existingInSlot && existingInSlot === draggedSpirit) return; // already there

    // If dragging from tray, just place it
    placeInGarden(draggedSpirit, slot);
    setDraggedSpirit(null);
    setSelected(null);
  }

  function handleClickSlot(slot: string) {
    // If a tray item is selected, place it on click
    if (selected) {
      placeInGarden(selected, slot);
      setSelected(null);
      return;
    }
    // If slot has a spirit, remove it
    if (game.garden[slot]) {
      removeFromGarden(slot);
    }
  }

  function toggleLike() {
    if (liked) {
      setLikes(Math.max(0, likes - 1));
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  }

  const slots = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;
    return `${row},${col}`;
  });

  return (
    <section className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neon-green/25 bg-gradient-to-br from-neon-green/[0.06] to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neon-green/40 bg-neon-green/10 text-neon-green shadow-glow">
            <Sprout size={20} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tightish text-white">GPA Garden</h2>
            <p className="text-sm text-white/50">Drag spirits to place. Build your garden.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              liked ? "border-neon-pink/50 bg-neon-pink/15 text-neon-pink" : "border-edge text-white/60 hover:text-white"
            }`}
          >
            <Heart size={15} fill={liked ? "currentColor" : "none"} />
            {likes}
          </button>
          <button
            onClick={() => setStudyMode((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              studyMode ? "border-neon-purple/50 bg-neon-purple/15 text-neon-purple" : "border-edge text-white/60 hover:text-white"
            }`}
          >
            {studyMode ? <BookOpen size={15} /> : <Coffee size={15} />}
            {studyMode ? "Study" : "Rest"}
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-edge bg-panel/70 p-4">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Garden health</p>
          <p className="mt-1 font-display text-lg font-bold" style={{ color: health.ground }}>{health.label}</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(health.ratio * 100)}%`, background: health.ground }} />
          </div>
        </div>
        <div className="rounded-2xl border border-edge bg-panel/70 p-4">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Garden luck</p>
          <p className="mt-1 flex items-center gap-1 font-display text-lg font-bold text-neon-yellow"><Sparkles size={15} /> +{luck}%</p>
          <p className="mt-1 text-[11px] text-white/40">{placedIds.length}/{GRID_SIZE * GRID_SIZE} placed</p>
        </div>
        <div className="rounded-2xl border border-edge bg-panel/70 p-4">
          <p className="text-[10px] uppercase tracking-wider text-white/40">GPA Score</p>
          <p className="mt-1 font-display text-lg font-bold text-neon-cyan">{gpa.toFixed(2)}</p>
          <p className="mt-1 text-[11px] text-white/40">of 4.0</p>
        </div>
      </div>

      {/* garden grid */}
      <div
        ref={gridRef}
        className="relative rounded-2xl border border-edge overflow-hidden"
        style={{
          background: studyMode ? "linear-gradient(180deg,#101830,#0a1020)" : health.sky,
          minHeight: "500px",
          backgroundAttachment: "fixed",
        }}
      >
        {/* compact GPA strip — lives inside the garden card, doesn't eat a slot */}
        <div className="mx-4 mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-neon-yellow/50 bg-black/30 px-4 py-2 backdrop-blur-sm">
          <span className="text-xs font-bold uppercase tracking-wide text-neon-yellow">📊 GPA {gpa.toFixed(2)}</span>
          <div className="flex flex-wrap gap-1.5">
            {modules.map((m) => {
              const g = m.grade != null ? scoreToGrade(m.grade) : null;
              return (
                <span
                  key={m.code}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70"
                >
                  {m.code} <span className="text-white">{g?.letter ?? "—"}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Grid of draggable slots */}
        <div className="grid gap-2 p-6" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {slots.map((slot) => {
            const itemId = game.garden[slot];
            const flower = itemId ? SHOP_ITEM_BY_ID[itemId] : null;
            const spirit = !flower && itemId ? SPIRIT_BY_ID[itemId] : null;
            const filled = !!flower || !!spirit;

            return (
              <div
                key={slot}
                draggable={filled}
                onDragStart={(e) => {
                  if (filled) handleDragStart(e, itemId);
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnSlot(e, slot)}
                onClick={() => handleClickSlot(slot)}
                className={`relative h-24 rounded-lg border-2 flex items-center justify-center cursor-move transition ${
                  filled
                    ? "border-dashed border-edge bg-black/20 hover:bg-black/30"
                    : "border-dashed border-white/20 bg-white/5 hover:bg-white/10"
                }`}
              >
                {flower ? (
                  <div className="text-center">
                    <div className="flex justify-center mb-1 text-5xl">{flower.emoji}</div>
                    <p className="text-[10px] text-white/60 truncate max-w-full px-1">{flower.name}</p>
                  </div>
                ) : spirit ? (
                  <div className="text-center">
                    <div className="flex justify-center">
                      <SpiritArt spirit={spirit} size={56} walking />
                    </div>
                    <p className="text-[10px] text-white/60 truncate max-w-full px-1">{spirit.name}</p>
                  </div>
                ) : (
                  <p className="text-xs text-white/30">Drag here</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* tray of available shop items */}
      <div className="rounded-2xl border border-edge bg-panel/50 p-4">
        <p className="mb-3 text-sm font-semibold text-white">Available flowers & pets</p>
        <div className="flex flex-wrap gap-2">
          {tray.map((item) => {
            const remaining = ownedCount(item.id) - (placedCounts[item.id] || 0);
            return (
              <button
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onClick={() => setSelected(item.id === selected ? null : item.id)}
                className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 transition ${
                  selected === item.id
                    ? "border-neon-yellow bg-neon-yellow/20 text-neon-yellow"
                    : "border-edge bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs font-semibold">{item.name}</span>
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/60">
                  ×{remaining}
                </span>
              </button>
            );
          })}
        </div>
        {tray.length === 0 && (
          <p className="text-xs text-white/40">Buy flowers & pets from the shop to place them here!</p>
        )}
      </div>
    </section>
  );
}
