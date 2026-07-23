import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import GpaRing from "./components/GpaRing";
import AssignmentCard from "./components/AssignmentCard";
import { assignments, modules, stats } from "./data/mock";
import { isSupabaseConfigured } from "./lib/supabase";
import { Flame, Zap, Target, TrendingUp } from "lucide-react";

export default function App() {
  const sorted = [...assignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  const weekPct = Math.round((stats.tasksDoneThisWeek / stats.tasksPlannedThisWeek) * 100);

  return (
    <div className="grid-bg flex min-h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          {/* Header */}
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-neon-green">
                ▸ mission briefing · level {stats.level}
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">
                Welcome back, quester
              </h1>
              <p className="mt-1 text-white/50">
                You have {sorted.length} active quests this week. Let's keep the streak alive.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs ${
                  isSupabaseConfigured
                    ? "border-neon-green/40 bg-neon-green/10 text-neon-green"
                    : "border-neon-yellow/40 bg-neon-yellow/10 text-neon-yellow"
                }`}
              >
                {isSupabaseConfigured ? "● Supabase connected" : "○ demo mode (mock data)"}
              </span>
            </div>
          </header>

          {/* Stat row */}
          <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Streak" value={`${stats.streakDays} days`} sub="Personal best: 18" icon={<Flame size={18} />} accent="text-neon-pink" />
            <StatCard label="XP" value={stats.xp.toLocaleString()} sub={`Level ${stats.level} · 550 to next`} icon={<Zap size={18} />} accent="text-neon-yellow" />
            <StatCard label="This week" value={`${weekPct}%`} sub={`${stats.tasksDoneThisWeek}/${stats.tasksPlannedThisWeek} tasks done`} icon={<Target size={18} />} accent="text-neon-cyan" />
            <StatCard label="Trend" value="+0.14" sub="GPA vs last semester" icon={<TrendingUp size={18} />} accent="text-neon-green" />
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Upcoming quests */}
            <section className="lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-white">Upcoming quests</h2>
                <button className="rounded-lg border border-edge px-3 py-1.5 text-xs text-white/60 transition hover:border-neon-green/40 hover:text-neon-green">
                  + Add assignment
                </button>
              </div>
              <div className="space-y-3">
                {sorted.map((a) => (
                  <AssignmentCard key={a.id} a={a} />
                ))}
              </div>
            </section>

            {/* Right column: GPA + modules */}
            <section className="space-y-6">
              <div className="flex flex-col items-center rounded-2xl border border-edge bg-panel/70 p-6">
                <h3 className="self-start font-display text-lg font-semibold text-white">Academic progress</h3>
                <div className="my-4 animate-floaty">
                  <GpaRing gpa={stats.gpa} />
                </div>
                <div className="w-full space-y-2">
                  {modules.map((m) => (
                    <div key={m.code} className="flex items-center justify-between text-sm">
                      <span className="text-white/60">
                        <span className="font-mono text-white/40">{m.code}</span> {m.name}
                      </span>
                      <span className="font-mono font-semibold text-white">{m.grade ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <footer className="mt-10 border-t border-edge pt-4 font-mono text-xs text-white/30">
            $ studyquest --semester 2026-S2 · problem detected... generating solution...
          </footer>
        </div>
      </main>
    </div>
  );
}
