import { useState } from "react";
import Sidebar, { BottomNav } from "./components/Sidebar";
import Toasts from "./components/Toasts";
import AssignmentModal from "./components/AssignmentModal";
import SyllabusImport from "./components/SyllabusImport";
import FocusModal from "./components/FocusModal";
import TodayView from "./views/TodayView";
import ScheduleView from "./views/ScheduleView";
import ModulesView from "./views/ModulesView";
import RewardsView from "./views/RewardsView";
import SettingsView from "./views/SettingsView";
import LandingPage from "./views/LandingPage";
import type { View } from "./nav";
import type { Assignment } from "./types";
import { useStore } from "./store/StoreContext";
import { levelFromXp } from "./lib/gamification";
import { useDailyReminder } from "./lib/useDailyReminder";
import { Sparkles, Settings, Flame } from "lucide-react";

const ENTERED_KEY = "studyquest:entered";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function App() {
  const { data } = useStore();
  useDailyReminder();
  const [view, setView] = useState<View>("today");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [focusOpen, setFocusOpen] = useState(false);
  // Returning visitors go straight to the app; the landing stays reachable
  // from Settings.
  const [entered, setEntered] = useState(() => {
    try {
      return localStorage.getItem(ENTERED_KEY) === "1";
    } catch {
      return false;
    }
  });

  const enterApp = () => {
    try {
      localStorage.setItem(ENTERED_KEY, "1");
    } catch {
      /* storage unavailable — still enter for this session */
    }
    setEntered(true);
  };
  const showLanding = () => {
    try {
      localStorage.removeItem(ENTERED_KEY);
    } catch {
      /* ignore */
    }
    setEntered(false);
  };

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (a: Assignment) => {
    setEditing(a);
    setModalOpen(true);
  };
  const openFocus = (id?: string) => {
    setFocusId(id ?? null);
    setFocusOpen(true);
  };

  // Every hook above runs unconditionally; the landing gate comes after.
  if (!entered) return <LandingPage onEnter={enterApp} />;

  const TITLES: Record<View, { kicker: string; heading: string; sub: string }> = {
    today: {
      kicker: "Today",
      heading: `${greeting()}, quester`,
      sub: "Here's what matters most right now.",
    },
    planner: {
      kicker: "Planner",
      heading: "Your semester plan",
      sub: "Every deadline, spread into daily study blocks.",
    },
    grades: {
      kicker: "Grades",
      heading: "Modules & GPA",
      sub: "Live, credit-weighted GPA on the poly scale.",
    },
    rewards: {
      kicker: "Rewards",
      heading: "Your progress",
      sub: "Earn XP by studying, then summon Study Spirits.",
    },
    settings: {
      kicker: "Settings",
      heading: "Settings & data",
      sub: "Reminders, backups, and demo data.",
    },
  };
  const t = TITLES[view];

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

          {/* Page header */}
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                {t.kicker}
              </p>
              <h1 className="mt-1.5 text-balance font-display text-[1.9rem] font-bold leading-[1.05] tracking-tighter2 text-night sm:text-[2.5rem]">
                {t.heading}
              </h1>
              <p className="mt-2 max-w-md text-[15px] text-dusk">{t.sub}</p>
            </div>

            {/* Compact HUD: streak + level, and settings */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-night shadow-soft">
                <Flame size={15} className="text-warm" />
                {data.game.streakDays}
                <span className="text-haze">·</span>
                <span className="text-brand-deep">Lv {levelFromXp(data.game.xp)}</span>
              </div>
              <button
                onClick={() => setView("settings")}
                aria-label="Settings"
                aria-current={view === "settings" ? "page" : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-soft transition active:scale-95 ${
                  view === "settings"
                    ? "border-brand/40 bg-brand-soft text-brand-deep"
                    : "border-line bg-surface text-dusk hover:text-night"
                }`}
              >
                <Settings size={16} />
              </button>
            </div>
          </header>

          <div className="mt-8">
            {view === "today" && (
              <TodayView
                onAdd={openAdd}
                onEdit={openEdit}
                onImport={() => setImportOpen(true)}
                onFocus={openFocus}
              />
            )}
            {view === "planner" && <ScheduleView />}
            {view === "grades" && <ModulesView />}
            {view === "rewards" && <RewardsView />}
            {view === "settings" && (
              <SettingsView
                onImportSyllabus={() => setImportOpen(true)}
                onShowLanding={showLanding}
              />
            )}
          </div>
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
      <FocusModal
        open={focusOpen}
        initialAssignmentId={focusId}
        onClose={() => setFocusOpen(false)}
      />
      <Toasts />
    </div>
  );
}
