import type { Assignment, StudyBlock } from "../types";
import { todayISO, addDays } from "./date";
import { hoursOnDay } from "./scheduler";

/**
 * Semester Timeline — a zoomed-out, day-by-day view from today to the
 * furthest deadline, showing both when things are due and how the planned
 * study load is spread out. This is the "different shape than a calendar"
 * answer: a calendar can't show workload density at a glance.
 */
export interface TimelineDay {
  date: string;
  hours: number;
  dueItems: Assignment[];
}

const MAX_DAYS = 120;

export function buildTimeline(assignments: Assignment[], blocks: StudyBlock[]): TimelineDay[] {
  const open = assignments.filter((a) => !a.completed);
  if (open.length === 0) return [];

  const start = todayISO();
  let maxDue = start;
  for (const a of open) if (a.dueDate > maxDue) maxDue = a.dueDate;
  const end = addDays(maxDue, 2); // small trailing buffer past the last deadline

  const days: TimelineDay[] = [];
  let cursor = start;
  let guard = 0;
  while (cursor <= end && guard < MAX_DAYS) {
    days.push({
      date: cursor,
      hours: hoursOnDay(blocks, cursor),
      dueItems: open.filter((a) => a.dueDate === cursor),
    });
    cursor = addDays(cursor, 1);
    guard++;
  }
  return days;
}
