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
    kicker: "Mission briefing",
    heading: "Welcome back, quester",
    sub: "Your whole semester, auto-organised and prioritised for you.",
  },
  schedule: {
    kicker: "Study plan",
    heading: "Your schedule",
    sub: "Every deadline, broken into bite-sized daily study blocks.",
  },
  modules: {
    kicker: "Academic progress",
    heading: "Modules & GPA",
    sub: "Live, credit-weighted GPA on the poly scale.",
  },
  gacha: {
    kicker: "Summon circle",
    heading: "Study Spirits",
    sub: "Study to earn crystals, summon spirits, power up your XP.",
  },
  achievements: {
    kicker: "Rewards",
    heading: "Achievements",
    sub: "Earn XP, keep your streak alive, and level up.",
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
  const chipBtn =
    "flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-dusk shadow-soft transition hover:border-line2 hover:text-night active:scale-95";

  return (
    <div className="app-shell flex min-h-screen">
      <Sidebar view={view} setView={setView} />

      <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-9">
          {/* Mobile brand */}
          <div className="mb-5 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white shadow-brand">
              <Sparkles size={16} />
            </div>
            <span className="font-display text-base font-bold text-night">StudyQuest</span>
          </div>

          {/* Header */}
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                {t.kicker}
                <span className="text-line2">·</span>
                <span className="text-haze">Level {levelFromXp(data.game.xp)}</span>
              </p>
              <h1 className="mt-2 text-balance font-display text-[2rem] font-bold leading-[1.05] tracking-tighter2 text-night sm:text-[2.7rem]">
                {t.heading}
              </h1>
              <p className="mt-2 max-w-md text-[15px] text-dusk">{t.sub}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={exportData} title="Download a backup of all your data" className={chipBtn}>
                <Download size={12} /> Export
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Restore from a backup file"
                className={chipBtn}
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
              <button onClick={resetAll} title="Reset to demo data" className={chipBtn}>
                <RotateCcw size={12} /> Reset
              </button>
              <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-dusk shadow-soft">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isSupabaseConfigured ? "bg-grass" : "bg-warm"}`}
                />
                {isSupabaseConfigured ? "Supabase connected" : "Local storage"}
              </span>
            </div>
          </header>

          <div className="mt-8">
            {view === "dashboard" && (
              <DashboardView onAdd={openAdd} onEdit={openEdit} onImport={() => setImportOpen(true)} />
            )}
            {view === "schedule" && <ScheduleView />}
            {view === "modules" && <ModulesView />}
            {view === "gacha" && (
              /* The Summon view is a deliberate dark "chamber" within the bright app. */
              <div className="summon-stage overflow-hidden rounded-[1.75rem] p-4 shadow-pop ring-1 ring-brand/20 sm:p-6">
                <GachaView />
              </div>
            )}
            {view === "achievements" && <AchievementsView />}
          </div>

          <footer className="mt-12 border-t border-line pt-5 text-xs text-haze">
            StudyQuest · Semester 2026-S2 ·{" "}
            <span className="font-medium text-dusk">
              {data.assignments.filter((a) => !a.completed).length} open quests
            </span>{" "}
            · built for RP students
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
