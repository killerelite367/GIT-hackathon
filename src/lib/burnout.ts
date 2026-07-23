import type { Assignment } from "../types";
import { weekKey, weekStart, shortDate } from "./date";

/**
 * Burnout radar — a genuinely differentiating feature. It clusters upcoming
 * deadlines by calendar week and flags weeks where too much high-stakes work
 * stacks up, then suggests starting the heaviest task earlier to spread load.
 */

export interface WeekLoad {
  week: string; // ISO week key
  start: string; // Monday ISO date
  label: string; // "Week of Mon 27 Jul"
  totalWeight: number; // summed % of grade due that week
  totalHours: number; // summed estimated effort
  count: number;
  level: "calm" | "busy" | "overload";
  items: Assignment[];
}

// Thresholds tuned for a demo: a week over ~40% combined weight OR ~14h of
// effort is an overload; roughly half that is "busy".
const OVERLOAD_WEIGHT = 40;
const OVERLOAD_HOURS = 14;

export function analyzeLoad(assignments: Assignment[]): WeekLoad[] {
  const groups = new Map<string, Assignment[]>();
  for (const a of assignments) {
    if (a.completed) continue;
    const key = weekKey(a.dueDate);
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(a);
  }

  const weeks: WeekLoad[] = [];
  for (const [week, items] of groups) {
    const totalWeight = items.reduce((s, a) => s + a.weight, 0);
    const totalHours = items.reduce(
      (s, a) => s + a.estHours * (1 - a.progress / 100),
      0
    );
    const overloaded = totalWeight >= OVERLOAD_WEIGHT || totalHours >= OVERLOAD_HOURS;
    const busy = totalWeight >= OVERLOAD_WEIGHT / 2 || totalHours >= OVERLOAD_HOURS / 2;
    const start = weekStart(items[0].dueDate);
    weeks.push({
      week,
      start,
      label: `Week of ${shortDate(start)}`,
      totalWeight,
      totalHours: Math.round(totalHours * 10) / 10,
      count: items.length,
      level: overloaded ? "overload" : busy ? "busy" : "calm",
      items: [...items].sort((a, b) => b.weight - a.weight),
    });
  }

  return weeks.sort((a, b) => a.start.localeCompare(b.start));
}

/** The single most-overloaded upcoming week, if any. */
export function worstWeek(assignments: Assignment[]): WeekLoad | null {
  const overloaded = analyzeLoad(assignments).filter((w) => w.level === "overload");
  if (overloaded.length === 0) return null;
  return overloaded.sort((a, b) => b.totalWeight - a.totalWeight)[0];
}

/** Human advice for an overloaded week. */
export function burnoutAdvice(week: WeekLoad): string {
  const heaviest = week.items[0];
  return `${week.count} deadlines worth ${week.totalWeight}% land in ${week.label.toLowerCase()}. Start "${heaviest.title}" early to spread the ${week.totalHours}h of work.`;
}
