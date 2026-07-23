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
        <h2 className="font-display text-xl font-bold tracking-tightish text-night">Achievements</h2>
        <p className="text-sm text-dusk">
          {earned} of {ACHIEVEMENTS.length} unlocked · Level {lp.level} · {data.game.xp} XP
        </p>
      </div>

      {/* Level bar */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <div className="flex items-center justify-between text-sm">
          <span className="font-mono font-bold text-brand-deep">LEVEL {lp.level}</span>
          <span className="font-medium text-haze">
            {lp.intoLevel}/{lp.span} XP · {lp.toNext} to level {lp.level + 1}
          </span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-brand transition-all"
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
                  ? "border-brand/25 bg-brand-soft/50 shadow-soft"
                  : "border-line bg-surface/60 opacity-70"
              }`}
            >
              <div className="text-3xl">
                {on ? a.icon : <Lock className="mx-auto text-haze" size={26} />}
              </div>
              <p className={`mt-2 text-sm font-bold ${on ? "text-night" : "text-haze"}`}>{a.name}</p>
              <p className="mt-0.5 text-[11px] font-medium text-dusk">{a.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
