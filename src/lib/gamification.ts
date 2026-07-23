import type { Assignment, GameState } from "../types";
import { todayISO, daysBetween } from "./date";

/**
 * Real gamification loop. Completing a task earns XP (scaled by how much it's
 * worth), keeps a daily streak alive, and levels you up. All state is
 * persisted by the store — no fake numbers.
 */

/** XP awarded for completing an assignment. Heavier work = more XP. */
export function xpForCompletion(a: Assignment): number {
  return 40 + Math.round(a.weight * 2);
}

/** Cumulative XP needed to *reach* a given level (level 1 = 0). */
export function xpForLevel(level: number): number {
  // Gentle quadratic curve: L2=250, L3=600, L4=1050, ...
  return Math.round(125 * (level - 1) * level);
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}

/** Progress within the current level, for the XP bar. */
export function levelProgress(xp: number): {
  level: number;
  intoLevel: number;
  span: number;
  toNext: number;
  pct: number;
} {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const span = ceil - floor;
  const intoLevel = xp - floor;
  return {
    level,
    intoLevel,
    span,
    toNext: ceil - xp,
    pct: Math.round((intoLevel / span) * 100),
  };
}

/**
 * Apply a task completion to the game state. Returns the new state plus
 * what happened (for toasts): xp gained, whether a level-up occurred,
 * and the streak delta.
 */
export function applyCompletion(
  game: GameState,
  a: Assignment
): { game: GameState; gainedXp: number; leveledUp: boolean; streakUp: boolean } {
  const gainedXp = xpForCompletion(a);
  const prevLevel = levelFromXp(game.xp);
  const xp = game.xp + gainedXp;

  // Streak logic based on the last day a task was completed.
  const today = todayISO();
  let streakDays = game.streakDays;
  let streakUp = false;
  if (game.lastActiveDate == null) {
    streakDays = 1;
    streakUp = true;
  } else {
    const gap = daysBetween(game.lastActiveDate, today);
    if (gap === 0) {
      // already counted today, streak unchanged
    } else if (gap === 1) {
      streakDays += 1;
      streakUp = true;
    } else {
      streakDays = 1; // missed a day, reset
      streakUp = true;
    }
  }

  const next: GameState = {
    ...game,
    xp,
    streakDays,
    bestStreak: Math.max(game.bestStreak, streakDays),
    lastActiveDate: today,
  };

  return {
    game: next,
    gainedXp,
    leveledUp: levelFromXp(xp) > prevLevel,
    streakUp,
  };
}
