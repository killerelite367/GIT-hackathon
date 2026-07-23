import type { AppData } from "../types";
import { seedData } from "../data/seed";

const KEY = "studyquest:v1";

/**
 * Local persistence. StudyQuest works fully offline against localStorage so
 * the demo is real and stateful with zero backend setup. The Supabase client
 * (src/lib/supabase.ts) can later replace this behind the same AppData shape.
 */
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    // Merge over a fresh seed so missing/renamed fields never crash the app.
    const base = seedData();
    return {
      modules: parsed.modules ?? base.modules,
      assignments: parsed.assignments ?? base.assignments,
      blocks: parsed.blocks ?? base.blocks,
      game: { ...base.game, ...parsed.game },
    };
  } catch {
    return seedData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage full / unavailable — ignore, app keeps working in-memory
  }
}

export function resetData(): AppData {
  const fresh = seedData();
  saveData(fresh);
  return fresh;
}
