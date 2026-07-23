import type { Assignment, StudyBlock } from "../types";
import { todayISO, daysUntil, addDays } from "./date";

/** Max hours of study we'll ever schedule onto a single day. */
export const DAILY_CAP = 3;

let blockSeq = 0;
function blockId() {
  return `blk_${Date.now().toString(36)}_${blockSeq++}`;
}

/**
 * Auto-scheduler. For every incomplete assignment it spreads the remaining
 * estimated effort backward from the due date into daily study blocks,
 * starting today. Work is distributed as evenly as possible but never
 * exceeds DAILY_CAP on any one day for a single task.
 *
 * This is the "auto-organise workload" pillar — deadlines in, a concrete
 * day-by-day plan out, no manual dragging.
 */
export function buildSchedule(assignments: Assignment[]): StudyBlock[] {
  const blocks: StudyBlock[] = [];

  for (const a of assignments) {
    if (a.completed) continue;

    const remaining = a.estHours * (1 - a.progress / 100);
    if (remaining <= 0.01) continue;

    const daysLeft = daysUntil(a.dueDate);
    // Work window: today .. due date (inclusive). If overdue, cram into today.
    const window = Math.max(1, daysLeft + 1);

    // Enough days that we stay under the per-day cap where possible.
    const neededDays = Math.min(window, Math.ceil(remaining / DAILY_CAP));
    const perDay = remaining / neededDays;

    for (let i = 0; i < neededDays; i++) {
      blocks.push({
        id: blockId(),
        assignmentId: a.id,
        date: addDays(todayISO(), i),
        hours: Math.round(perDay * 10) / 10,
        done: false,
      });
    }
  }

  return blocks.sort((x, y) => x.date.localeCompare(y.date));
}

/** Total scheduled hours on a given ISO day. */
export function hoursOnDay(blocks: StudyBlock[], iso: string): number {
  return blocks
    .filter((b) => b.date === iso)
    .reduce((sum, b) => sum + b.hours, 0);
}
