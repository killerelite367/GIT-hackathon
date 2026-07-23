import { useState } from "react";
import Sidebar, { BottomNav } from "./components/Sidebar";
import Toasts from "./components/Toasts";
import AssignmentModal from "./components/AssignmentModal";
import SyllabusImport from "./components/SyllabusImport";
import DashboardView from "./views/DashboardView";
import ScheduleView from "./views/ScheduleView";
import ModulesView from "./views/ModulesView";
import AchievementsView from "./views/AchievementsView";
import type { View } from "./nav";
import type { Assignment } from "./types";
import { useStore } from "./store/StoreContext";
import { isSupabaseConfigured } from "./lib/supabase";
import { levelFromXp } from "./lib/gamification";
import { Sparkles, RotateCcw } from "lucide-react";

const TITLES: Record<View, { kicker: string; heading: string; sub: string }> = {
  dashboard: {
    kicker: "▸ mission briefing",
    heading: "Welcome back, quester",
    sub: "Your workload, auto-organised and prioritised.",
  },
  schedule: {
    kicker: "▸ study plan",
    heading: "Your schedule",
    sub: "Every deadline, broken into daily study blocks.",
  },
  modules: {
    kicker: "▸ academic progress",
    heading: "Modules & GPA",
    sub: "Live, credit-weighted GPA on the poly scale.",
  },
  achievements: {
    kicker: "▸ rewards",
    heading: "Achievements",
    sub: "Earn XP, keep the streak, level up.",
  },
};

export default function App() {
  const { data, resetAll } = useStore();
  const [view, setView] = useState<View>("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (a: Assignment) => {
    setEditing(a);
    setModalOpen(true);
  };

  const t = TITLES[view];

  return (
    <div className="app-shell grid-bg flex min-h-screen">
      <Sidebar view={view} setView={setView} />

      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          {/* Mobile brand */}
          <div className="mb-4 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan text-ink">
              <Sparkles size={16} />
            </div>
            <span className="font-display text-base font-bold text-white">StudyQuest</span>
          </div>

          {/* Header */}
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-neon-green">
                {t.kicker}
                <span className="text-white/25">/</span>
                <span className="text-white/45">level {levelFromXp(data.game.xp)}</span>
              </p>
              <h1 className="mt-2 text-balance font-display text-[2rem] font-bold leading-[1.05] tracking-tighter2 text-white sm:text-[2.6rem]">
                {t.heading}
              </h1>
              <p className="mt-2 max-w-md text-[15px] text-white/55">{t.sub}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetAll}
                title="Reset to demo data"
                className="flex items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 text-xs text-white/50 transition hover:border-edge2 hover:text-white"
              >
                <RotateCcw size={12} /> Reset
              </button>
              <span
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${
                  isSupabaseConfigured
                    ? "border-neon-green/40 bg-neon-green/10 text-neon-green"
                    : "border-neon-cyan/30 bg-neon-cyan/[0.07] text-neon-cyan/90"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isSupabaseConfigured ? "bg-neon-green" : "bg-neon-cyan"
                  } animate-glowpulse`}
                />
                {isSupabaseConfigured ? "Supabase connected" : "Local storage"}
              </span>
            </div>
          </header>

          <div className="mt-8">
            {view === "dashboard" && (
              <DashboardView
                onAdd={openAdd}
                onEdit={openEdit}
                onImport={() => setImportOpen(true)}
              />
            )}
            {view === "schedule" && <ScheduleView />}
            {view === "modules" && <ModulesView />}
            {view === "achievements" && <AchievementsView />}
          </div>

          <footer className="mt-10 border-t border-edge pt-4 font-mono text-xs text-white/30">
            $ studyquest --semester 2026-S2 · {data.assignments.filter((a) => !a.completed).length} open quests · auto-organised
          </footer>
        </div>
      </main>

      <BottomNav view={view} setView={setView} />

      <AssignmentModal
        open={modalOpen}
        editing={editing}
        modules={data.modules}
        onClose={() => setModalOpen(false)}
      />
      {importOpen && <SyllabusImport onClose={() => setImportOpen(false)} />}
      <Toasts />
    </div>
  );
}
