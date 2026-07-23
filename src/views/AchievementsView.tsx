import { Lock } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { ACHIEVEMENTS } from "../lib/achievements";
import { levelProgress } from "../lib/gamification";
import StudyHeatmap from "../components/StudyHeatmap";

export default function AchievementsView() {
  const { data } = useStore();
  const unlocked = new Set(data.game.achievements);
  const lp = levelProgress(data.game.xp);
  const earned = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tightish text-white">
          Achievements
        </h2>
        <p className="text-sm text-white/50">
          {earned} of {ACHIEVEMENTS.length} unlocked · Level {lp.level} · {data.game.xp}{" "}
          XP
        </p>
      </div>

      {/* Level bar */}
      <div className="rounded-2xl border border-edge bg-panel/70 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-mono text-neon-green">LEVEL {lp.level}</span>
          <span className="text-white/40">
            {lp.intoLevel}/{lp.span} XP · {lp.toNext} to level {lp.level + 1}
          </span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-neon-green transition-all"
            style={{ width: `${lp.pct}%` }}
          />
        </div>
      </div>

      <StudyHeatmap activityLog={data.game.activityLog} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const on = unlocked.has(a.id);
          return (
            <div
              key={a.id}
              className={`rounded-2xl border p-4 text-center transition ${
                on
                  ? "border-neon-purple/30 bg-panel2/60"
                  : "border-edge bg-panel2/40 opacity-60"
              }`}
            >
              <div className="text-3xl">{on ? a.icon : <Lock className="mx-auto text-white/30" size={26} />}</div>
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
