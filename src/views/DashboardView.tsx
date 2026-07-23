import { Flame, Zap, Target, GraduationCap, Plus, Wand2 } from "lucide-react";
import type { Assignment } from "../types";
import StatCard from "../components/StatCard";
import GpaRing from "../components/GpaRing";
import AssignmentCard from "../components/AssignmentCard";
import BurnoutRadar from "../components/BurnoutRadar";
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
  const gpaLetter = modules.some((m) => m.grade != null)
    ? `${modules.filter((m) => m.grade != null).length} modules graded`
    : "No grades yet";

  return (
    <>
      {/* Stat row */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          index={0}
          label="Streak"
          value={`${streakCU} ${streakCU === 1 ? "day" : "days"}`}
          sub={`Personal best: ${game.bestStreak}`}
          icon={<Flame size={18} />}
          accent="text-neon-pink"
          progress={game.bestStreak ? (game.streakDays / game.bestStreak) * 100 : 0}
          barClass="bg-neon-pink"
        />
        <StatCard
          index={1}
          label="Level"
          value={`${xpCU.toLocaleString()} XP`}
          sub={`Level ${lp.level} · ${lp.toNext} to next`}
          icon={<Zap size={18} />}
          accent="text-neon-yellow"
          progress={lp.pct}
          barClass="bg-neon-yellow"
        />
        <StatCard
          index={2}
          label="Completed"
          value={`${weekCU}%`}
          sub={`${weekDone} of ${assignments.length} quests done`}
          icon={<Target size={18} />}
          accent="text-neon-cyan"
          progress={weekPct}
          barClass="bg-neon-cyan"
        />
        <StatCard
          index={3}
          label="GPA"
          value={gpaCU.toFixed(2)}
          sub={gpaLetter}
          icon={<GraduationCap size={18} />}
          accent="text-neon-green"
          progress={(gpa / 4) * 100}
          barClass="bg-neon-green"
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Upcoming quests */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-lg font-semibold tracking-tightish text-white">
                Upcoming quests
              </h2>
              <span className="rounded-full border border-neon-cyan/25 bg-neon-cyan/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neon-cyan/90">
                smart-ranked
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onImport}
                className="flex items-center gap-1.5 rounded-lg border border-neon-purple/40 bg-neon-purple/10 px-3 py-1.5 text-xs font-medium text-neon-purple transition hover:bg-neon-purple/20 active:scale-95"
              >
                <Wand2 size={14} /> Import syllabus
              </button>
              <button
                onClick={onAdd}
                className="flex items-center gap-1.5 rounded-lg border border-edge px-3 py-1.5 text-xs text-white/70 transition hover:border-neon-green/40 hover:text-neon-green active:scale-95"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {open.length === 0 ? (
            <div className="rounded-xl border border-dashed border-edge bg-panel2/30 p-8 text-center">
              <p className="text-white/60">🎉 No open quests. You're all caught up!</p>
              <button
                onClick={onImport}
                className="mt-3 rounded-lg border border-neon-purple/40 bg-neon-purple/10 px-3 py-1.5 text-xs text-neon-purple"
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
              <summary className="cursor-pointer text-sm text-white/40 hover:text-white/70">
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
          <div className="flex flex-col items-center rounded-2xl border border-edge bg-panel/80 p-6 shadow-card">
            <h3 className="self-start font-display text-lg font-semibold tracking-tightish text-white">
              Academic progress
            </h3>
            <div className="my-5">
              <GpaRing gpa={gpa} />
            </div>
            <div className="w-full space-y-1">
              {modules.map((m) => (
                <div
                  key={m.code}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition hover:bg-white/5"
                >
                  <span className="flex items-center gap-2 text-white/70">
                    <span className="font-mono text-[11px] text-white/40">{m.code}</span>
                    {m.name}
                  </span>
                  <span className="font-mono font-semibold tabular text-white">
                    {m.grade ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <BurnoutRadar assignments={assignments} />
        </section>
      </div>
    </>
  );
}
