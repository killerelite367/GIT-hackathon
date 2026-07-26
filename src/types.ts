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

/** How well a card is known. Drives the New / Learning / Mastered counts. */
export type CardStage = "new" | "learning" | "mastered";

export interface Flashcard {
  id: string;
  front: string; // the term or prompt
  back: string; // the definition or answer
  stage: CardStage;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface KeyTerm {
  term: string;
  definition: string;
}

/**
 * One generated study set — the notes, cards, and quiz all derived from a
 * single source document, kept together so they stay in sync.
 */
export interface StudySet {
  id: string;
  title: string;
  module: string;
  createdAt: string; // ISO timestamp
  source: "scan" | "paste";
  summary: string[]; // summarized notes, one bullet per line
  keyTerms: KeyTerm[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
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

  // ── GPA Garden ────────────────────────────────────────────
  garden: Record<string, string>; // tile "row,col" -> placed spirit id
  gardenLikes: number; // how many people like this garden
  bindingGlue: number; // crafting material earned alongside crystals

  // ── Book Binding ──────────────────────────────────────────
  // (uses `spirits` counts + bindingGlue; no extra state needed)

  // ── Shop (Accessories) ─────────────────────────────────────
  accessories: Record<string, number>; // accessory id -> quantity owned
  equippedAccessories: string[]; // currently equipped accessory ids

  // ── Group Project ──────────────────────────────────────────
  groupMembers: Array<{ email: string; contribution: number }>; // team emails + work %
}

/** Everything we persist for a user, in one blob. */
export interface AppData {
  modules: Module[];
  assignments: Assignment[];
  blocks: StudyBlock[];
  game: GameState;
  /** Generated study sets. Optional so older backups still import cleanly. */
  studySets?: StudySet[];
}
