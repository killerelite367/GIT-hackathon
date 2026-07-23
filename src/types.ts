export type Priority = "low" | "medium" | "high";

export type AssignmentType =
  | "CA"
  | "Group Project"
  | "Reflection"
  | "Exam"
  | "Quiz";

export interface Assignment {
  id: string;
  title: string;
  module: string; // module code, e.g. "C240"
  type: AssignmentType;
  dueDate: string; // ISO date (YYYY-MM-DD)
  progress: number; // 0-100
  weight: number; // % of module grade
  estHours: number; // estimated effort in hours (drives the scheduler)
  completed: boolean;
  createdAt: string; // ISO timestamp
}

export interface StudyBlock {
  id: string;
  assignmentId: string;
  date: string; // ISO date (YYYY-MM-DD)
  hours: number;
  done: boolean;
}

export interface Module {
  code: string;
  name: string;
  grade: number | null; // current running score 0-100
  credits: number;
}

export interface GameState {
  xp: number;
  streakDays: number;
  lastActiveDate: string | null; // ISO date of last completed task
  bestStreak: number;
  achievements: string[]; // unlocked achievement ids
  syllabusImported: boolean;

  // ── Gacha ("Study Spirits") ──────────────────────────────
  crystals: number; // Focus Crystals — earned ONLY by completing study work
  spirits: Record<string, number>; // spirit id -> copies owned
  pityCount: number; // pulls since the last Epic+ (drives the pity guarantee)
  equippedSpirit: string | null; // the spirit whose XP buff is active

  // ── Reminders ─────────────────────────────────────────────
  remindersEnabled: boolean; // opted into in-tab browser notifications
  lastReminderDate: string | null; // ISO date a reminder was last shown (once/day)

  // ── Activity log ──────────────────────────────────────────
  activityLog: Record<string, number>; // ISO date -> XP earned that day (drives the study heatmap)
}

/** Everything we persist for a user, in one blob. */
export interface AppData {
  modules: Module[];
  assignments: Assignment[];
  blocks: StudyBlock[];
  game: GameState;
}
