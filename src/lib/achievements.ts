import type { AppData } from "../types";
import { levelFromXp } from "./gamification";

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string; // emoji, kept simple
  /** Is it unlocked given the current app data? */
  test: (d: AppData) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-quest",
    name: "First Quest",
    desc: "Complete your first assignment",
    icon: "🎯",
    test: (d) => d.assignments.some((a) => a.completed),
  },
  {
    id: "syllabus-sync",
    name: "Syllabus Sync",
    desc: "Import a brief with the parser",
    icon: "📥",
    test: (d) => d.game.syllabusImported,
  },
  {
    id: "streak-3",
    name: "Warming Up",
    desc: "Reach a 3-day streak",
    icon: "🔥",
    test: (d) => d.game.bestStreak >= 3,
  },
  {
    id: "streak-7",
    name: "On Fire",
    desc: "Reach a 7-day streak",
    icon: "⚡",
    test: (d) => d.game.bestStreak >= 7,
  },
  {
    id: "level-5",
    name: "Seasoned Quester",
    desc: "Reach level 5",
    icon: "🏆",
    test: (d) => levelFromXp(d.game.xp) >= 5,
  },
  {
    id: "clean-sweep",
    name: "Clean Sweep",
    desc: "Complete 5 assignments",
    icon: "🧹",
    test: (d) => d.assignments.filter((a) => a.completed).length >= 5,
  },
  {
    id: "heavy-lifter",
    name: "Heavy Lifter",
    desc: "Complete an assignment worth 25% or more",
    icon: "🛡️",
    test: (d) => d.assignments.some((a) => a.completed && a.weight >= 25),
  },
];

/** Return the ids of every achievement currently satisfied. */
export function unlockedIds(data: AppData): string[] {
  return ACHIEVEMENTS.filter((a) => a.test(data)).map((a) => a.id);
}
