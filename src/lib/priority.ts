import type { Assignment, Priority } from "../types";
import { daysUntil } from "./date";

/**
 * Smart prioritisation score. Combines three signals the brief calls out:
 *   - urgency: how soon it's due (closer = higher, overdue = max)
 *   - stakes:  how much it's worth (weight % of grade)
 *   - gap:     how little is done (1 - progress)
 *
 * Returns a 0-100 score so tasks can be ranked and coloured consistently.
 */
export function priorityScore(a: Assignment): number {
  if (a.completed) return 0;

  const days = daysUntil(a.dueDate);
  // Urgency curve: overdue/today ~1.0, tapering to ~0.1 two weeks out.
  const urgency = days <= 0 ? 1 : Math.max(0.1, 1 - days / 14);

  const stakes = Math.min(a.weight, 40) / 40; // cap so a huge weight can't dwarf urgency
  const gap = 1 - a.progress / 100;

  // Weighted blend, then scaled to 0-100.
  const raw = urgency * 0.5 + stakes * 0.3 + gap * 0.2;
  return Math.round(raw * 100);
}

/** Bucket the score into the three priority tiers used for colour/labels. */
export function priorityTier(a: Assignment): Priority {
  const s = priorityScore(a);
  if (s >= 66) return "high";
  if (s >= 40) return "medium";
  return "low";
}

/** Sort incomplete first, then by descending priority score. */
export function byPriority(a: Assignment, b: Assignment): number {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  return priorityScore(b) - priorityScore(a);
}

/** One-line reason string for why something is ranked where it is. */
export function priorityReason(a: Assignment): string {
  const days = daysUntil(a.dueDate);
  const when =
    days < 0 ? "overdue" : days === 0 ? "due today" : `${days}d left`;
  return `${when} · ${a.weight}% of grade · ${a.progress}% done`;
}
