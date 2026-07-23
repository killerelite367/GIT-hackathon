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
import { loadData, saveData, resetData } from "../lib/storage";
import { applyCompletion, levelFromXp } from "../lib/gamification";
import { buildSchedule } from "../lib/scheduler";
import { unlockedIds } from "../lib/achievements";
import { ACHIEVEMENTS } from "../lib/achievements";
import type { ParsedAssignment } from "../lib/parser";
import { toAssignments } from "../lib/parser";

export interface Toast {
  id: number;
  message: string;
  kind: "xp" | "level" | "achievement" | "info";
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
}

const StoreContext = createContext<StoreValue | null>(null);

let toastSeq = 0;
let idSeq = 0;

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

        const { game, gainedXp, leveledUp, streakUp } = applyCompletion(
          d.game,
          target
        );
        pushToast(`+${gainedXp} XP · ${target.title}`, "xp");
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
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
