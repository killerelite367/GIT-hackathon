import { useState } from "react";
import { Sprout, Sparkles, BookOpen, Coffee, X } from "lucide-react";
import { useStore } from "../store/StoreContext";
import SpiritArt from "../components/SpiritArt";
import { SPIRIT_BY_ID, RARITY, type Spirit } from "../lib/gacha";

const MAX_PLANTS = 8;

/** Scatter positions across the scenic garden foreground (nearer = bigger). */
const SPOTS = [
  { x: "11%", y: "50%", s: 0.9 },
  { x: "31%", y: "58%", s: 1.05 },
  { x: "52%", y: "50%", s: 0.85 },
  { x: "71%", y: "58%", s: 1.1 },
  { x: "88%", y: "51%", s: 0.9 },
  { x: "20%", y: "76%", s: 1.35 },
  { x: "50%", y: "80%", s: 1.45 },
  { x: "78%", y: "75%", s: 1.3 },
];

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
  let luck = 0;
  for (const id of ids) {
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
  const placed = Object.entries(game.garden).slice(0, MAX_PLANTS); // [key, spiritId]
  const placedIds = placed.map(([, id]) => id);
  const luck = gardenLuck(placedIds);
  const full = placed.length >= MAX_PLANTS;

  const placedSet = new Set(placedIds);
  const tray: Spirit[] = Object.keys(game.spirits)
    .map((id) => SPIRIT_BY_ID[id])
    .filter((s): s is Spirit => !!s && !placedSet.has(s.id))
    .sort((a, b) => RARITY[b.rarity].tier - RARITY[a.rarity].tier);

  function plant() {
    if (!selected || full) return;
    for (let i = 0; i < MAX_PLANTS; i++) {
      const key = `p${i}`;
      if (!game.garden[key]) {
        placeInGarden(selected, key);
        setSelected(null);
        return;
      }
    }
  }

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
            <p className="text-sm text-white/50">Your garden reflects your real progress. Plant pets for luck.</p>
          </div>
        </div>
        <button
          onClick={() => setStudyMode((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
            studyMode ? "border-neon-purple/50 bg-neon-purple/15 text-neon-purple" : "border-edge text-white/60 hover:text-white"
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
          <p className="mt-1 font-display text-lg font-bold" style={{ color: health.ground }}>{health.label}</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(health.ratio * 100)}%`, background: health.ground }} />
          </div>
        </div>
        <div className="rounded-2xl border border-edge bg-panel/70 p-4">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Garden luck</p>
          <p className="mt-1 flex items-center gap-1 font-display text-lg font-bold text-neon-yellow"><Sparkles size={15} /> +{luck}%</p>
          <p className="mt-1 text-[11px] text-white/40">{placed.length}/{MAX_PLANTS} pets planted</p>
        </div>
        <div className="rounded-2xl border border-edge bg-panel/70 p-4">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Binding glue</p>
          <p className="mt-1 font-display text-lg font-bold text-neon-cyan">🩹 {game.bindingGlue ?? 0}</p>
          <p className="mt-1 text-[11px] text-white/40">for the Workshop</p>
        </div>
      </div>

      {/* ══ the scenic garden — you're standing in it ══ */}
      <div
        className="relative h-[380px] overflow-hidden rounded-2xl border border-edge"
        style={{ background: studyMode ? "linear-gradient(180deg,#101830,#0a1020)" : health.sky }}
      >
        {/* sun / moon */}
        <div
          className="pointer-events-none absolute h-20 w-20 rounded-full"
          style={{
            right: "12%", top: "10%",
            background: studyMode
              ? "radial-gradient(circle,#fff 30%,#dfe6ff 60%,transparent 72%)"
              : health.mood === "sickly"
              ? "radial-gradient(circle,#d8d8de 40%,transparent 72%)"
              : "radial-gradient(circle,#fff6c0 30%,#ffe37a 55%,transparent 72%)",
            boxShadow: studyMode
              ? "0 0 40px 10px rgba(200,210,255,0.4)"
              : health.mood === "sickly"
              ? "none"
              : "0 0 60px 18px rgba(255,220,90,0.5)",
          }}
        />
        {/* clouds */}
        {["18%", "60%", "80%"].map((left, i) => (
          <div
            key={i}
            className="pointer-events-none absolute rounded-full bg-white"
            style={{
              left, top: `${12 + i * 7}%`, width: 90 - i * 14, height: 26 - i * 3,
              opacity: studyMode ? 0.12 : health.mood === "sickly" ? 0.85 : 0.9,
              filter: "blur(2px)",
              boxShadow: "24px 6px 0 -4px #fff, -22px 6px 0 -6px #fff",
            }}
          />
        ))}
        {/* stars in study mode */}
        {studyMode &&
          [...Array(14)].map((_, i) => (
            <span key={i} className="gq-twinkle absolute text-white/70" style={{ left: `${(i * 37) % 95}%`, top: `${(i * 23) % 45}%`, fontSize: 8, animationDelay: `${i * 0.2}s` }}>✦</span>
          ))}

        {/* distant hills */}
        <div className="pointer-events-none absolute bottom-[32%] left-[-10%] h-40 w-[70%] rounded-[50%]" style={{ background: health.groundDark, opacity: 0.5 }} />
        <div className="pointer-events-none absolute bottom-[34%] right-[-14%] h-44 w-[75%] rounded-[50%]" style={{ background: health.groundDark, opacity: 0.4 }} />

        {/* ground */}
        <div className="absolute inset-x-0 bottom-0 h-[42%]" style={{ background: `linear-gradient(180deg, ${health.ground}, ${health.groundDark})` }}>
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 2px, transparent 2px 26px)" }} />
        </div>

        {/* decorations */}
        {health.mood === "vibrant" &&
          ["8%", "26%", "44%", "62%", "82%", "94%"].map((x, i) => (
            <span key={i} className="pointer-events-none absolute" style={{ left: x, bottom: `${6 + (i % 3) * 8}%`, fontSize: 18 }}>
              {["🌷", "🌼", "🌸", "🌻"][i % 4]}
            </span>
          ))}
        {health.mood === "vibrant" &&
          ["30%", "68%"].map((x, i) => (
            <span key={i} className="pointer-events-none absolute gq-bob" style={{ left: x, top: `${28 + i * 8}%`, fontSize: 20, animationDelay: `${i * 0.6}s` }}>🦋</span>
          ))}
        {health.mood === "normal" &&
          ["14%", "50%", "84%"].map((x, i) => (
            <span key={i} className="pointer-events-none absolute" style={{ left: x, bottom: "8%", fontSize: 16 }}>🌿</span>
          ))}
        {health.mood === "sickly" &&
          ["10%", "40%", "72%", "92%"].map((x, i) => (
            <span key={i} className="pointer-events-none absolute" style={{ left: x, bottom: `${6 + (i % 2) * 6}%`, fontSize: 16 }}>🥀</span>
          ))}
        {/* trees framing the scene */}
        <span className="pointer-events-none absolute left-[2%] bottom-[26%] text-5xl" style={{ filter: health.mood === "sickly" ? "grayscale(0.6) brightness(0.7)" : "none" }}>🌳</span>
        <span className="pointer-events-none absolute right-[3%] bottom-[24%] text-6xl" style={{ filter: health.mood === "sickly" ? "grayscale(0.6) brightness(0.7)" : "none" }}>🌳</span>

        {/* planted pets standing in the garden */}
        {placed.map(([key, id], i) => {
          const s = SPIRIT_BY_ID[id];
          if (!s) return null;
          const spot = SPOTS[i] ?? SPOTS[SPOTS.length - 1];
          return (
            <button
              key={key}
              onClick={() => removeFromGarden(key)}
              className="absolute z-10"
              style={{ left: spot.x, bottom: spot.y, transform: `translateX(-50%) scale(${spot.s})` }}
              title={`${s.name} — click to lift`}
            >
              <div className={studyMode ? "" : "sp-bob"} style={{ position: "relative" }}>
                <div className="absolute left-1/2 top-[46px] h-2 w-10 -translate-x-1/2 rounded-[50%] bg-black/30 blur-[2px]" />
                <SpiritArt spirit={s} size={50} walking={false} />
                {studyMode ? (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">🤓</span>
                ) : (
                  <span className="absolute -top-1 right-0 text-[10px]">💤</span>
                )}
              </div>
            </button>
          );
        })}

        {/* plant prompt */}
        {selected && !full && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center">
            <button
              onClick={plant}
              className="rounded-full border border-neon-green/50 bg-black/60 px-4 py-2 text-sm font-bold text-neon-green backdrop-blur transition hover:bg-black/80"
            >
              🌱 Plant here
            </button>
          </div>
        )}
        {full && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center">
            <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] text-white/60">Garden full — lift a pet to make room</span>
          </div>
        )}
      </div>

      {/* planting tray */}
      <div className="rounded-2xl border border-edge bg-panel/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-white">Inventory · tap a pet, then “Plant here”</h3>
          {selected && (
            <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-xs text-white/50 hover:text-white"><X size={12} /> cancel</button>
          )}
        </div>
        {tray.length === 0 ? (
          <p className="text-sm text-white/40">No pets to plant — summon some in the Summon tab, or lift a planted pet by tapping it.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tray.map((s) => {
              const meta = RARITY[s.rarity];
              const isSel = selected === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(isSel ? null : s.id)}
                  className={`flex w-24 flex-col items-center rounded-xl border p-2 transition ${isSel ? "scale-105" : "hover:-translate-y-0.5"}`}
                  style={{ borderColor: isSel ? meta.glow : "#25252f", boxShadow: isSel ? `0 0 18px -4px ${meta.glow}` : undefined }}
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
