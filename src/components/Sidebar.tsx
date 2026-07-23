import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Trophy,
  Sparkles,
} from "lucide-react";
import type { View } from "../nav";
import { levelProgress } from "../lib/gamification";
import { useStore } from "../store/StoreContext";

export const NAV: { view: View; icon: typeof LayoutDashboard; label: string }[] = [
  { view: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { view: "schedule", icon: CalendarDays, label: "Schedule" },
  { view: "modules", icon: BookOpen, label: "Modules" },
  { view: "achievements", icon: Trophy, label: "Achievements" },
];

export default function Sidebar({
  view,
  setView,
}: {
  view: View;
  setView: (v: View) => void;
}) {
  const { data } = useStore();
  const lp = levelProgress(data.game.xp);

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-edge bg-panel/40 p-4 lg:flex">
      <div className="flex items-center gap-2.5 px-2 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-green to-neon-cyan text-ink shadow-[0_0_18px_-4px_rgba(124,255,107,0.6)]">
          <Sparkles size={18} />
        </div>
        <span className="font-display text-lg font-bold tracking-tightish text-white">
          StudyQuest
        </span>
      </div>

      <nav className="mt-6 space-y-1">
        {NAV.map(({ icon: Icon, label, view: v }) => {
          const active = view === v;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-current={active ? "page" : undefined}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition duration-150 ${
                active
                  ? "bg-neon-green/[0.12] text-neon-green shadow-[inset_0_0_0_1px_rgba(124,255,107,0.2)]"
                  : "text-white/55 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={active ? "" : "text-white/40 group-hover:text-white/80"}
              />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon-green shadow-[0_0_8px_0_rgba(124,255,107,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Level widget */}
      <div className="mt-6 rounded-xl border border-edge bg-panel2/60 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-neon-yellow">LVL {lp.level}</span>
          <span className="text-white/40">{lp.toNext} XP to next</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-neon-yellow to-neon-pink transition-all"
            style={{ width: `${lp.pct}%` }}
          />
        </div>
      </div>

      <div className="mt-auto rounded-xl border border-edge bg-panel2/60 p-3 text-xs text-white/50">
        <p className="font-mono text-neon-green">$ tip</p>
        <p className="mt-1">
          Paste a syllabus and StudyQuest auto-schedules every deadline for you.
        </p>
      </div>
    </aside>
  );
}

/** Mobile bottom navigation bar. */
export function BottomNav({
  view,
  setView,
}: {
  view: View;
  setView: (v: View) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-edge bg-panel/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
      {NAV.map(({ icon: Icon, label, view: v }) => {
        const active = view === v;
        return (
          <button
            key={v}
            onClick={() => setView(v)}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition ${
              active ? "text-neon-green" : "text-white/40"
            }`}
          >
            {active && (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-neon-green shadow-[0_0_8px_0_rgba(124,255,107,0.8)]" />
            )}
            <Icon size={20} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
