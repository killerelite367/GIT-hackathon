import type { Assignment, StudyBlock } from "../types";
import { daysUntil, todayISO } from "./date";
import { byPriority } from "./priority";
import { worstWeek } from "./burnout";
import { hoursOnDay } from "./scheduler";

/**
 * Daily Briefing — a synthesis of overdue work, what's due today, today's
 * scheduled study blocks, and any burnout warning, collapsed into one
 * glanceable panel. This is the closest thing to the brief's "intelligent
 * reminders" pillar that a fully client-side app can offer without a backend
 * or push infrastructure (see notify.ts for the opt-in browser notification).
 */
export interface Briefing {
  overdue: Assignment[];
  dueToday: Assignment[];
  topFocus: Assignment | null;
  todayHours: number;
  burnoutWarning: string | null;
  allClear: boolean;
}

export function buildBriefing(assignments: Assignment[], blocks: StudyBlock[]): Briefing {
  const open = assignments.filter((a) => !a.completed);
  const overdue = open.filter((a) => daysUntil(a.dueDate) < 0);
  const dueToday = open.filter((a) => daysUntil(a.dueDate) === 0);
  const sorted = [...open].sort(byPriority);
  const topFocus = sorted[0] ?? null;
  const todayHours = Math.round(hoursOnDay(blocks, todayISO()) * 10) / 10;

  const worst = worstWeek(assignments);
  const burnoutWarning = worst
    ? `${worst.label.toLowerCase()} stacks ${worst.totalWeight}% of your grade — start early`
    : null;

  return {
    overdue,
    dueToday,
    topFocus,
    todayHours,
    burnoutWarning,
    allClear: overdue.length === 0 && dueToday.length === 0 && !burnoutWarning,
  };
}

/** One-line headline summarising the briefing, for the notification body. */
export function briefingHeadline(b: Briefing): string {
  if (b.overdue.length > 0) {
    return `${b.overdue.length} quest${b.overdue.length > 1 ? "s" : ""} overdue — "${b.overdue[0].title}" needs attention.`;
  }
  if (b.dueToday.length > 0) {
    return `${b.dueToday.length} quest${b.dueToday.length > 1 ? "s" : ""} due today, including "${b.dueToday[0].title}".`;
  }
  if (b.topFocus) {
    return `Nothing urgent — next up is "${b.topFocus.title}" (${daysUntil(b.topFocus.dueDate)}d left).`;
  }
  return "You're all caught up. Nice.";
}
