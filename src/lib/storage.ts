import type { AppData } from "../types";
import { seedData } from "../data/seed";

const KEY = "studyquest:v1";

/**
 * Merge a partial/parsed blob over fresh defaults so missing or renamed
 * fields (e.g. after a schema change) never crash the app. Shared by the
 * localStorage loader and the JSON import path.
 */
function mergeWithDefaults(parsed: Partial<AppData>): AppData {
  const base = seedData();
  return {
    modules: parsed.modules ?? base.modules,
    assignments: parsed.assignments ?? base.assignments,
    blocks: parsed.blocks ?? base.blocks,
    game: { ...base.game, ...parsed.game },
  };
}

/**
 * Local persistence. StudyQuest works fully offline against localStorage so
 * the demo is real and stateful with zero backend setup. The Supabase client
 * (src/lib/supabase.ts) can later replace this behind the same AppData shape.
 */
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedData();
    return mergeWithDefaults(JSON.parse(raw) as Partial<AppData>);
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

/**
 * Download the current data as a JSON file. This is the only backup
 * mechanism available since everything lives in localStorage — clearing
 * browser data or switching devices otherwise loses all progress.
 */
export function exportDataFile(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `studyquest-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse an uploaded backup file. Returns null if it isn't valid JSON. */
export function parseImportedData(file: File): Promise<AppData | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<AppData>;
        resolve(mergeWithDefaults(parsed));
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}
