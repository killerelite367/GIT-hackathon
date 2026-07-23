import { addDays, todayISO } from "./date";

/**
 * Study Heatmap — a GitHub-contribution-style record of real daily effort
 * (XP earned, which only comes from completing work or logging a focus
 * session). Deliberately shows the underlying academic activity rather than
 * more game decoration, per the known "gamification distracts from the task"
 * failure mode seen in apps like Habitica.
 */
export interface HeatmapDay {
  date: string;
  value: number; // XP earned that day
  level: 0 | 1 | 2 | 3 | 4;
}

function levelFor(value: number): HeatmapDay["level"] {
  if (value <= 0) return 0;
  if (value < 50) return 1;
  if (value < 100) return 2;
  if (value < 200) return 3;
  return 4;
}

/** Build the last `days` days (inclusive of today) as a flat chronological list. */
export function buildHeatmap(activityLog: Record<string, number>, days = 91): HeatmapDay[] {
  const end = todayISO();
  const start = addDays(end, -(days - 1));
  const out: HeatmapDay[] = [];
  let cursor = start;
  for (let i = 0; i < days; i++) {
    const value = activityLog[cursor] ?? 0;
    out.push({ date: cursor, value, level: levelFor(value) });
    cursor = addDays(cursor, 1);
  }
  return out;
}

/** Total XP earned across the whole window, plus how many active days. */
export function heatmapSummary(days: HeatmapDay[]): { totalXp: number; activeDays: number } {
  return {
    totalXp: days.reduce((s, d) => s + d.value, 0),
    activeDays: days.filter((d) => d.value > 0).length,
  };
}
