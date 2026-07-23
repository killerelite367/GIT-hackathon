import { useRef, useState } from "react";
import Sidebar, { BottomNav } from "./components/Sidebar";
import Toasts from "./components/Toasts";
import AssignmentModal from "./components/AssignmentModal";
import SyllabusImport from "./components/SyllabusImport";
import DashboardView from "./views/DashboardView";
import ScheduleView from "./views/ScheduleView";
import ModulesView from "./views/ModulesView";
import GachaView from "./views/GachaView";
import AchievementsView from "./views/AchievementsView";
import type { View } from "./nav";
import type { Assignment } from "./types";
import { useStore } from "./store/StoreContext";
import { isSupabaseConfigured } from "./lib/supabase";
import { levelFromXp } from "./lib/gamification";
import { Sparkles, RotateCcw, Download, Upload } from "lucide-react";

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
  gacha: {
    kicker: "▸ summon circle",
    heading: "Study Spirits",
    sub: "Study to earn crystals, summon spirits, power up your XP.",
  },
  achievements: {
    kicker: "▸ rewards",
    heading: "Achievements",
    sub: "Earn XP, keep the streak, level up.",
  },
};

export default function App() {
  const { data, resetAll, exportData, importData } = useStore();
  const [view, setView] = useState<View>("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file next time
    if (file) await importData(file);
  };

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
    <div className="app-shell flex min-h-screen">
      <Sidebar view={view} setView={setView} />

      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          {/* Mobile brand */}
          <div className="mb-4 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-green text-ink">
              <Sparkles size={16} />
            </div>
            <span className="font-display text-base font-bold text-white">StudyQuest</span>
          </div>

          {/* Header */}
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-white/40">
                {t.kicker}
                <span className="text-white/20">·</span>
                <span>level {levelFromXp(data.game.xp)}</span>
              </p>
              <h1 className="mt-2 text-balance font-display text-[2rem] font-bold leading-[1.05] tracking-tighter2 text-white sm:text-[2.6rem]">
                {t.heading}
              </h1>
              <p className="mt-2 max-w-md text-[15px] text-white/55">{t.sub}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportData}
                title="Download a backup of all your data"
                className="flex items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 text-xs text-white/50 transition hover:border-edge2 hover:text-white"
              >
                <Download size={12} /> Export
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Restore from a backup file"
                className="flex items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 text-xs text-white/50 transition hover:border-edge2 hover:text-white"
              >
                <Upload size={12} /> Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportFile}
                className="hidden"
              />
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
            {view === "gacha" && <GachaView />}
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
