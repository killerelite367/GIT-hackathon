import {
  Home,
  CalendarRange,
  GraduationCap,
  Trophy,
  Settings,
  Sparkles,
} from "lucide-react";
import type { View } from "../nav";
import { levelProgress } from "../lib/gamification";
import { useStore } from "../store/StoreContext";

export const NAV: { view: View; icon: typeof Home; label: string }[] = [
  { view: "today", icon: Home, label: "Today" },
  { view: "planner", icon: CalendarRange, label: "Planner" },
  { view: "grades", icon: GraduationCap, label: "Grades" },
  { view: "rewards", icon: Trophy, label: "Rewards" },
];

/** Bottom-nav set (mobile): the four primary destinations. Settings lives in the header. */
export const BOTTOM_NAV = NAV;

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Home;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-150 ${
        active ? "bg-brand-soft text-brand-deep" : "text-dusk hover:bg-surface2 hover:text-night"
      }`}
    >
      <Icon size={18} className={active ? "text-brand" : "text-haze group-hover:text-dusk"} />
      {label}
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />}
    </button>
  );
}

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
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface/70 p-4 backdrop-blur-sm lg:flex">
      <div className="flex items-center gap-2.5 px-2 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-brand">
          <Sparkles size={18} />
        </div>
        <span className="font-display text-lg font-bold tracking-tightish text-night">
          StudyQuest
        </span>
      </div>

      <nav className="mt-6 space-y-1">
        {NAV.map(({ icon, label, view: v }) => (
          <NavButton key={v} active={view === v} onClick={() => setView(v)} icon={icon} label={label} />
        ))}
      </nav>

      {/* Level widget */}
      <div className="mt-6 rounded-2xl border border-line bg-surface2 p-3.5 shadow-soft">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-brand-deep">LVL {lp.level}</span>
          <span className="text-haze">{lp.toNext} XP to next</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${lp.pct}%` }} />
        </div>
      </div>

      <div className="mt-auto space-y-1 border-t border-line pt-2">
        <NavButton
          active={view === "settings"}
          onClick={() => setView("settings")}
          icon={Settings}
          label="Settings"
        />
      </div>
    </aside>
  );
}

/** Mobile bottom navigation bar — the four primary destinations. */
export function BottomNav({
  view,
  setView,
}: {
  view: View;
  setView: (v: View) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-8px_rgba(80,70,130,0.2)] backdrop-blur-lg lg:hidden">
      {BOTTOM_NAV.map(({ icon: Icon, label, view: v }) => {
        const active = view === v;
        return (
          <button
            key={v}
            onClick={() => setView(v)}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
              active ? "text-brand" : "text-haze"
            }`}
          >
            {active && <span className="absolute top-0 h-1 w-9 rounded-full bg-brand" />}
            <Icon size={20} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
