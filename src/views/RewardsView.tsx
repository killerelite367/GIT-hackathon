import { useState } from "react";
import { Trophy, Gem, Flame, Zap, Sparkles, Lock } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { levelProgress } from "../lib/gamification";
import { ACHIEVEMENTS } from "../lib/achievements";
import { collectionCount } from "../lib/gacha";
import StudyHeatmap from "../components/StudyHeatmap";
import GachaView from "./GachaView";

type Tab = "progress" | "summon";

export default function RewardsView() {
  const { data } = useStore();
  const { game } = data;
  const [tab, setTab] = useState<Tab>("progress");

  const lp = levelProgress(game.xp);
  const unlocked = new Set(game.achievements);
  const earned = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  const { owned, total } = collectionCount(game);

  return (
    <div className="space-y-6">
      {/* Sub-tab toggle */}
      <div className="inline-flex rounded-full border border-line bg-surface p-1 shadow-soft">
        <TabButton active={tab === "progress"} onClick={() => setTab("progress")} icon={<Trophy size={15} />}>
          Progress
        </TabButton>
        <TabButton active={tab === "summon"} onClick={() => setTab("summon")} icon={<Gem size={15} />}>
          Summon
        </TabButton>
      </div>

      {tab === "progress" ? (
        <div className="space-y-6">
          {/* Reward stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <RewardStat icon={<Zap size={18} />} tone="brand" label="Level" value={`${lp.level}`}>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-brand" style={{ width: `${lp.pct}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-haze">{lp.toNext} XP to next</p>
            </RewardStat>
            <RewardStat icon={<Flame size={18} />} tone="warm" label="Streak" value={`${game.streakDays}d`}>
              <p className="mt-2 text-[11px] font-medium text-haze">Best: {game.bestStreak} days</p>
            </RewardStat>
            <RewardStat icon={<Gem size={18} />} tone="berry" label="Crystals" value={game.crystals.toLocaleString()}>
              <p className="mt-2 text-[11px] font-medium text-haze">Earned by studying</p>
            </RewardStat>
            <RewardStat icon={<Sparkles size={18} />} tone="grass" label="Spirits" value={`${owned}/${total}`}>
              <p className="mt-2 text-[11px] font-medium text-haze">{earned} achievements</p>
            </RewardStat>
          </div>

          <StudyHeatmap activityLog={game.activityLog} />

          {/* Achievements */}
          <section>
            <h3 className="mb-3 font-display text-lg font-bold tracking-tightish text-night">
              Achievements
              <span className="ml-2 text-sm font-medium text-haze">
                {earned}/{ACHIEVEMENTS.length}
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ACHIEVEMENTS.map((a) => {
                const on = unlocked.has(a.id);
                return (
                  <div
                    key={a.id}
                    className={`rounded-2xl border p-4 text-center transition ${
                      on ? "border-brand/25 bg-brand-soft/50 shadow-soft" : "border-line bg-surface/60 opacity-70"
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
        </div>
      ) : (
        /* The Summon spectacle lives in its own dark chamber. */
        <div className="summon-stage overflow-hidden rounded-[1.75rem] p-4 shadow-pop ring-1 ring-brand/20 sm:p-6">
          <GachaView />
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        active ? "bg-brand text-white shadow-brand" : "text-dusk hover:text-night"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

const STAT_TONE: Record<string, string> = {
  brand: "bg-brand-soft text-brand",
  warm: "bg-warm-soft text-warm-deep",
  berry: "bg-berry-soft text-berry-deep",
  grass: "bg-grass-soft text-grass-deep",
};

function RewardStat({
  icon,
  tone,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  tone: keyof typeof STAT_TONE;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${STAT_TONE[tone]}`}>
          {icon}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-haze">{label}</span>
      </div>
      <div className="mt-3 font-display text-[1.7rem] font-bold tabular leading-none text-night">
        {value}
      </div>
      {children}
    </div>
  );
}
