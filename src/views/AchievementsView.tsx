import { Lock, Trophy } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { ACHIEVEMENTS } from "../lib/achievements";
import { levelProgress } from "../lib/gamification";

export default function AchievementsView() {
  const { data } = useStore();
  const unlocked = new Set(data.game.achievements);
  const lp = levelProgress(data.game.xp);
  const earned = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 rounded-2xl border border-neon-purple/25 bg-gradient-to-br from-neon-purple/[0.06] to-transparent p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neon-purple/40 bg-neon-purple/10 text-neon-purple shadow-glow-purple">
          <Trophy size={20} />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tightish text-white">
            Achievements
          </h2>
          <p className="text-sm text-white/50">
            {earned} of {ACHIEVEMENTS.length} unlocked · Level {lp.level} ·{" "}
            {data.game.xp} XP
          </p>
        </div>
      </div>

      {/* Level bar */}
      <div className="relative overflow-hidden rounded-2xl border border-neon-yellow/25 bg-panel/70 p-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(circle at 0% 0%, rgba(255,225,77,0.4), transparent 60%)" }}
        />
        <div className="relative flex items-center justify-between text-sm">
          <span className="font-mono font-bold text-neon-yellow">LEVEL {lp.level}</span>
          <span className="text-white/40">
            {lp.intoLevel}/{lp.span} XP · {lp.toNext} to level {lp.level + 1}
          </span>
        </div>
        <div className="relative mt-2 h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-neon-yellow to-neon-pink shadow-[0_0_14px_-2px_rgba(255,225,77,0.7)] transition-all duration-500"
            style={{ width: `${lp.pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACHIEVEMENTS.map((a, i) => {
          const on = unlocked.has(a.id);
          return (
            <div
              key={a.id}
              className={`animate-popin rounded-2xl border p-4 text-center transition ${
                on
                  ? "border-neon-purple/40 bg-gradient-to-br from-neon-purple/15 to-neon-purple/[0.03] shadow-glow-purple hover:-translate-y-0.5"
                  : "border-edge bg-panel2/40 opacity-55"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`text-3xl ${on ? "animate-floaty" : ""}`}>
                {on ? a.icon : <Lock className="mx-auto text-white/30" size={26} />}
              </div>
              <p
                className={`mt-2 text-sm font-semibold ${
                  on ? "text-white" : "text-white/50"
                }`}
              >
                {a.name}
              </p>
              <p className="mt-0.5 text-[11px] text-white/40">{a.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
