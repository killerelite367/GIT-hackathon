import { Flame, Zap, Target, GraduationCap, Plus, Wand2 } from "lucide-react";
import type { Assignment } from "../types";
import StatCard from "../components/StatCard";
import GpaRing from "../components/GpaRing";
import AssignmentCard from "../components/AssignmentCard";
import BurnoutRadar from "../components/BurnoutRadar";
import DailyBriefing from "../components/DailyBriefing";
import FocusTimer from "../components/FocusTimer";
import { useStore } from "../store/StoreContext";
import { byPriority } from "../lib/priority";
import { computeGpa } from "../lib/gpa";
import { levelProgress } from "../lib/gamification";
import { useCountUp } from "../lib/useCountUp";

export default function DashboardView({
  onAdd,
  onEdit,
  onImport,
}: {
  onAdd: () => void;
  onEdit: (a: Assignment) => void;
  onImport: () => void;
}) {
  const { data } = useStore();
  const { assignments, modules, game } = data;

  const open = assignments.filter((a) => !a.completed).sort(byPriority);
  const done = assignments.filter((a) => a.completed);
  const gpa = computeGpa(modules);
  const lp = levelProgress(game.xp);

  const weekDone = done.length;
  const weekTotal = assignments.length || 1;
  const weekPct = Math.round((weekDone / weekTotal) * 100);

  // Animate the numbers so state changes (XP earned, GPA shift) read as motion.
  const xpCU = Math.round(useCountUp(game.xp));
  const gpaCU = useCountUp(gpa, 900, 2);
  const streakCU = Math.round(useCountUp(game.streakDays, 500));
  const weekCU = Math.round(useCountUp(weekPct));
  const gpaLabel = modules.some((m) => m.grade != null)
    ? `${modules.filter((m) => m.grade != null).length} modules graded`
    : "No grades yet";

  return (
    <>
      <div className="mb-6">
        <DailyBriefing />
      </div>

      {/* Stat row */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          index={0}
          tone="warm"
          label="Streak"
          value={`${streakCU} ${streakCU === 1 ? "day" : "days"}`}
          sub={`Personal best: ${game.bestStreak}`}
          icon={<Flame size={18} />}
          progress={game.bestStreak ? (game.streakDays / game.bestStreak) * 100 : 0}
        />
        <StatCard
          index={1}
          tone="brand"
          label="Level"
          value={`${xpCU.toLocaleString()} XP`}
          sub={`Level ${lp.level} · ${lp.toNext} to next`}
          icon={<Zap size={18} />}
          progress={lp.pct}
        />
        <StatCard
          index={2}
          tone="grass"
          label="Completed"
          value={`${weekCU}%`}
          sub={`${weekDone} of ${assignments.length} quests done`}
          icon={<Target size={18} />}
          progress={weekPct}
        />
        <StatCard
          index={3}
          tone="sky"
          label="GPA"
          value={gpaCU.toFixed(2)}
          sub={gpaLabel}
          icon={<GraduationCap size={18} />}
          progress={(gpa / 4) * 100}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Upcoming quests */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold tracking-tightish text-night">
              Upcoming quests
            </h2>
            <div className="flex gap-2">
              <button
                onClick={onImport}
                className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-medium text-dusk shadow-soft transition hover:border-line2 hover:text-night active:scale-95"
              >
                <Wand2 size={14} /> Import syllabus
              </button>
              <button
                onClick={onAdd}
                className="flex items-center gap-1.5 rounded-xl bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-brand transition hover:bg-brand-deep active:scale-95"
              >
                <Plus size={14} /> Add quest
              </button>
            </div>
          </div>

          {open.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line2 bg-surface/60 p-8 text-center">
              <p className="font-medium text-dusk">No open quests. You're all caught up! 🎉</p>
              <button
                onClick={onImport}
                className="mt-3 rounded-xl bg-brand px-3.5 py-2 text-xs font-semibold text-white shadow-brand transition hover:bg-brand-deep active:scale-95"
              >
                Import a syllabus to plan ahead
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {open.map((a) => (
                <AssignmentCard key={a.id} a={a} onEdit={onEdit} />
              ))}
            </div>
          )}

          {done.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-haze transition hover:text-dusk">
                {done.length} completed
              </summary>
              <div className="mt-3 space-y-3">
                {done.map((a) => (
                  <AssignmentCard key={a.id} a={a} onEdit={onEdit} />
                ))}
              </div>
            </details>
          )}
        </section>

        {/* Right column */}
        <section className="space-y-6">
          <div className="flex flex-col items-center rounded-2xl border border-line bg-surface p-6 shadow-soft">
            <h3 className="self-start font-display text-lg font-bold tracking-tightish text-night">
              Academic progress
            </h3>
            <div className="my-5">
              <GpaRing gpa={gpa} />
            </div>
            <div className="w-full space-y-0.5">
              {modules.map((m) => (
                <div
                  key={m.code}
                  className="flex items-center justify-between rounded-xl px-2.5 py-2 text-sm transition hover:bg-surface2"
                >
                  <span className="flex items-center gap-2 text-dusk">
                    <span className="font-mono text-[11px] font-medium text-haze">{m.code}</span>
                    {m.name}
                  </span>
                  <span className="font-mono font-bold tabular text-night">{m.grade ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>

          <FocusTimer assignments={open} />

          <BurnoutRadar assignments={assignments} />
        </section>
      </div>
    </>
  );
}
