import { LayoutDashboard, CalendarDays, BookOpen, Trophy, Settings, Sparkles } from "lucide-react";

const nav = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: CalendarDays, label: "Schedule" },
  { icon: BookOpen, label: "Modules" },
  { icon: Trophy, label: "Achievements" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-edge bg-panel/40 p-4 lg:flex">
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan text-ink">
          <Sparkles size={18} />
        </div>
        <span className="font-display text-lg font-bold text-white">StudyQuest</span>
      </div>

      <nav className="mt-6 space-y-1">
        {nav.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              active
                ? "bg-neon-green/10 text-neon-green shadow-glow"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-edge bg-panel2/60 p-3 text-xs text-white/50">
        <p className="font-mono text-neon-green">$ tip</p>
        <p className="mt-1">Paste a syllabus and StudyQuest auto-schedules every deadline for you.</p>
      </div>
    </aside>
  );
}
