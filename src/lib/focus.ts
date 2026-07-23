import type { Assignment } from "../types";

/**
 * Focus sessions — the missing "effort/time model". Completing an assignment
 * card is a single click; this rewards the actual minutes spent studying it,
 * so the XP/crystal loop tracks real work instead of just checkbox clicks.
 */

export const XP_PER_MINUTE = 1.2;
export const CRYSTALS_PER_MINUTE = 0.6;

export const PRESET_MINUTES = [15, 25, 50] as const;

/** XP a focus session earns, scaled by the equipped spirit's multiplier. */
export function xpForSession(minutes: number, xpMultiplier = 1): number {
  return Math.max(1, Math.round(minutes * XP_PER_MINUTE * xpMultiplier));
}

/** Focus Crystals a session earns (multiplier-free — crystals stay honest). */
export function crystalsForSession(minutes: number): number {
  return Math.max(1, Math.round(minutes * CRYSTALS_PER_MINUTE));
}

/**
 * How much an assignment's progress should move for `minutes` of focused
 * work, given its effort estimate. Capped so it never overshoots 100.
 */
export function progressDelta(a: Assignment, minutes: number): number {
  if (a.estHours <= 0) return 0;
  const hours = minutes / 60;
  return Math.min(100 - a.progress, (hours / a.estHours) * 100);
}
