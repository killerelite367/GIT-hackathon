import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { AppData, Assignment, Module } from "../types";
import { loadData, saveData, resetData, exportDataFile, parseImportedData } from "../lib/storage";
import { applyCompletion, levelFromXp } from "../lib/gamification";
import { buildSchedule } from "../lib/scheduler";
import { unlockedIds } from "../lib/achievements";
import { ACHIEVEMENTS } from "../lib/achievements";
import type { ParsedAssignment } from "../lib/parser";
import { toAssignments } from "../lib/parser";
import {
  pull as gachaPull,
  canAfford,
  crystalsForCompletion,
  equippedXpMultiplier,
  SPIRIT_BY_ID,
  type PullOutcome,
} from "../lib/gacha";
import { xpForSession, crystalsForSession, progressDelta } from "../lib/focus";
import { todayISO, daysBetween } from "../lib/date";

export interface Toast {
  id: number;
  message: string;
  kind: "xp" | "level" | "achievement" | "crystal" | "info";
}

interface StoreValue {
  data: AppData;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  addAssignment: (a: Omit<Assignment, "id" | "createdAt">) => void;
  updateAssignment: (id: string, patch: Partial<Assignment>) => void;
  completeAssignment: (id: string) => void;
  deleteAssignment: (id: string) => void;
  importParsed: (rows: ParsedAssignment[]) => void;
  regenerateSchedule: () => void;
  toggleBlockDone: (id: string) => void;
  updateModule: (code: string, patch: Partial<Module>) => void;
  resetAll: () => void;
  /** Summon `count` Study Spirits, spending Focus Crystals. Returns what was
   *  pulled (empty array if you can't afford it). */
  pullGacha: (count: number) => PullOutcome[];
  equipSpirit: (id: string) => void;
  /** Log a completed focus session against an assignment: awards XP + Focus
   *  Crystals for the actual minutes spent and nudges progress forward. */
  logFocusMinutes: (assignmentId: string, minutes: number) => void;
  /** Opt in/out of in-tab daily reminders. `reminderDate` marks a reminder as
   *  shown for that day (pass when firing one, omit otherwise). */
  setReminders: (enabled: boolean, reminderDate?: string) => void;
  exportData: () => void;
  importData: (file: File) => Promise<boolean>;
}

const StoreContext = createContext<StoreValue | null>(null);

let toastSeq = 0;
let idSeq = 0;

/** Record XP earned toward today's cell in the study heatmap. */
function bumpActivity(log: Record<string, number>, date: string, amount: number) {
  return { ...log, [date]: (log[date] ?? 0) + amount };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    const d = loadData();
    // Build the study plan on first load so the Schedule view is never empty
    // when there's already work to do.
    if (d.blocks.length === 0 && d.assignments.some((a) => !a.completed)) {
      d.blocks = buildSchedule(d.assignments);
    }
    return d;
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persist on every change.
  useEffect(() => {
    saveData(data);
  }, [data]);

  const pushToast = useCallback((message: string, kind: Toast["kind"]) => {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  /**
   * Recompute unlocked achievements after a data change and fire a toast for
   * anything newly earned. Returns data with the achievement list refreshed.
   */
  const withAchievements = useCallback(
    (next: AppData): AppData => {
      const unlocked = unlockedIds(next);
      const fresh = unlocked.filter((id) => !next.game.achievements.includes(id));
      if (fresh.length) {
        for (const id of fresh) {
          const a = ACHIEVEMENTS.find((x) => x.id === id);
          if (a) pushToast(`${a.icon} Achievement unlocked — ${a.name}`, "achievement");
        }
      }
      return { ...next, game: { ...next.game, achievements: unlocked } };
    },
    [pushToast]
  );

  const addAssignment = useCallback(
    (a: Omit<Assignment, "id" | "createdAt">) => {
      setData((d) => {
        const assignment: Assignment = {
          ...a,
          id: `a_${Date.now().toString(36)}_${idSeq++}`,
          createdAt: new Date().toISOString(),
        };
        const assignments = [...d.assignments, assignment];
        return withAchievements({
          ...d,
          assignments,
          blocks: buildSchedule(assignments),
        });
      });
    },
    [withAchievements]
  );

  const updateAssignment = useCallback(
    (id: string, patch: Partial<Assignment>) => {
      setData((d) => {
        const assignments = d.assignments.map((a) =>
          a.id === id ? { ...a, ...patch } : a
        );
        return withAchievements({
          ...d,
          assignments,
          blocks: buildSchedule(assignments),
        });
      });
    },
    [withAchievements]
  );

  const completeAssignment = useCallback(
    (id: string) => {
      setData((d) => {
        const target = d.assignments.find((a) => a.id === id);
        if (!target || target.completed) return d;

        const mult = equippedXpMultiplier(d.game);
        const completion = applyCompletion(d.game, target, mult);
        const { gainedXp, leveledUp, streakUp } = completion;

        // Completing real work is the ONLY way to earn Focus Crystals.
        const earnedCrystals = crystalsForCompletion(target);
        const game = {
          ...completion.game,
          crystals: completion.game.crystals + earnedCrystals,
          activityLog: bumpActivity(completion.game.activityLog, todayISO(), gainedXp),
        };

        pushToast(`+${gainedXp} XP · ${target.title}`, "xp");
        pushToast(`+${earnedCrystals} 💎 Focus Crystals`, "crystal");
        if (streakUp && game.streakDays > 1)
          pushToast(`🔥 ${game.streakDays}-day streak!`, "info");
        if (leveledUp) pushToast(`⭐ Level up! You're now level ${levelFromXp(game.xp)}`, "level");

        const assignments = d.assignments.map((a) =>
          a.id === id ? { ...a, completed: true, progress: 100 } : a
        );
        return withAchievements({
          ...d,
          assignments,
          blocks: buildSchedule(assignments),
          game,
        });
      });
    },
    [pushToast, withAchievements]
  );

  const deleteAssignment = useCallback((id: string) => {
    setData((d) => {
      const assignments = d.assignments.filter((a) => a.id !== id);
      return {
        ...d,
        assignments,
        blocks: buildSchedule(assignments),
      };
    });
  }, []);

  const importParsed = useCallback(
    (rows: ParsedAssignment[]) => {
      setData((d) => {
        const assignments = [...d.assignments, ...toAssignments(rows)];
        pushToast(`📥 Imported ${rows.length} assignments & auto-scheduled`, "info");
        return withAchievements({
          ...d,
          assignments,
          blocks: buildSchedule(assignments),
          game: { ...d.game, syllabusImported: true },
        });
      });
    },
    [pushToast, withAchievements]
  );

  const regenerateSchedule = useCallback(() => {
    setData((d) => ({ ...d, blocks: buildSchedule(d.assignments) }));
    pushToast("🗓️ Study plan regenerated", "info");
  }, [pushToast]);

  const toggleBlockDone = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === id ? { ...b, done: !b.done } : b)),
    }));
  }, []);

  const updateModule = useCallback(
    (code: string, patch: Partial<Module>) => {
      setData((d) =>
        withAchievements({
          ...d,
          modules: d.modules.map((m) => (m.code === code ? { ...m, ...patch } : m)),
        })
      );
    },
    [withAchievements]
  );

  const resetAll = useCallback(() => {
    setData(resetData());
    pushToast("Reset to demo data", "info");
  }, [pushToast]);

  const pullGacha = useCallback(
    (count: number): PullOutcome[] => {
      if (!canAfford(data.game, count)) {
        pushToast("Not enough Focus Crystals — complete a quest to earn more.", "info");
        return [];
      }
      const { game, outcomes } = gachaPull(data.game, count);
      setData((d) => withAchievements({ ...d, game }));
      const legendary = outcomes.find((o) => o.spirit.rarity === "legendary");
      if (legendary)
        pushToast(`🌟 LEGENDARY! ${legendary.spirit.emoji} ${legendary.spirit.name} joined you!`, "level");
      return outcomes;
    },
    [data.game, pushToast, withAchievements]
  );

  const equipSpirit = useCallback(
    (id: string) => {
      setData((d) => ({ ...d, game: { ...d.game, equippedSpirit: id } }));
      const s = SPIRIT_BY_ID[id];
      if (s) pushToast(`${s.emoji} ${s.name} equipped · ${s.buff}`, "info");
    },
    [pushToast]
  );

  const logFocusMinutes = useCallback(
    (assignmentId: string, minutes: number) => {
      if (minutes <= 0) return;
      setData((d) => {
        const target = d.assignments.find((a) => a.id === assignmentId);
        if (!target || target.completed) return d;

        const mult = equippedXpMultiplier(d.game);
        const gainedXp = xpForSession(minutes, mult);
        const gainedCrystals = crystalsForSession(minutes);
        const delta = progressDelta(target, minutes);
        const newProgress = Math.min(100, Math.round(target.progress + delta));
        const willComplete = newProgress >= 100;

        // Same day/streak accounting as completing a quest — a focused
        // session is real study time and should keep the streak alive too.
        const today = todayISO();
        let streakDays = d.game.streakDays;
        let streakUp = false;
        if (d.game.lastActiveDate == null) {
          streakDays = 1;
          streakUp = true;
        } else {
          const gap = daysBetween(d.game.lastActiveDate, today);
          if (gap === 1) {
            streakDays += 1;
            streakUp = true;
          } else if (gap > 1) {
            streakDays = 1;
            streakUp = true;
          }
        }

        const prevLevel = levelFromXp(d.game.xp);
        const xp = d.game.xp + gainedXp;
        const game = {
          ...d.game,
          xp,
          streakDays,
          bestStreak: Math.max(d.game.bestStreak, streakDays),
          lastActiveDate: today,
          crystals: d.game.crystals + gainedCrystals,
          activityLog: bumpActivity(d.game.activityLog, today, gainedXp),
        };

        pushToast(`+${gainedXp} XP · ${minutes}m on ${target.title}`, "xp");
        pushToast(`+${gainedCrystals} 💎 Focus Crystals`, "crystal");
        if (streakUp && streakDays > 1) pushToast(`🔥 ${streakDays}-day streak!`, "info");
        if (levelFromXp(xp) > prevLevel)
          pushToast(`⭐ Level up! You're now level ${levelFromXp(xp)}`, "level");
        if (willComplete) pushToast(`✅ ${target.title} completed via focus session!`, "info");

        const assignments = d.assignments.map((a) =>
          a.id === assignmentId
            ? { ...a, progress: newProgress, completed: willComplete }
            : a
        );

        return withAchievements({
          ...d,
          assignments,
          blocks: buildSchedule(assignments),
          game,
        });
      });
    },
    [pushToast, withAchievements]
  );

  const setReminders = useCallback((enabled: boolean, reminderDate?: string) => {
    setData((d) => ({
      ...d,
      game: {
        ...d.game,
        remindersEnabled: enabled,
        lastReminderDate: reminderDate ?? d.game.lastReminderDate,
      },
    }));
  }, []);

  const exportData = useCallback(() => {
    exportDataFile(data);
    pushToast("📦 Backup downloaded", "info");
  }, [data, pushToast]);

  const importData = useCallback(
    async (file: File): Promise<boolean> => {
      const parsed = await parseImportedData(file);
      if (!parsed) {
        pushToast("Import failed — that doesn't look like a StudyQuest backup.", "info");
        return false;
      }
      setData(parsed);
      pushToast("📥 Backup restored", "info");
      return true;
    },
    [pushToast]
  );

  const value = useMemo<StoreValue>(
    () => ({
      data,
      toasts,
      dismissToast,
      addAssignment,
      updateAssignment,
      completeAssignment,
      deleteAssignment,
      importParsed,
      regenerateSchedule,
      toggleBlockDone,
      updateModule,
      resetAll,
      pullGacha,
      equipSpirit,
      logFocusMinutes,
      setReminders,
      exportData,
      importData,
    }),
    [
      data,
      toasts,
      dismissToast,
      addAssignment,
      updateAssignment,
      completeAssignment,
      deleteAssignment,
      importParsed,
      regenerateSchedule,
      toggleBlockDone,
      updateModule,
      resetAll,
      pullGacha,
      equipSpirit,
      logFocusMinutes,
      setReminders,
      exportData,
      importData,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
