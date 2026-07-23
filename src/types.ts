export type Priority = "low" | "medium" | "high";

export interface Assignment {
  id: string;
  title: string;
  module: string;
  type: "CA" | "Group Project" | "Reflection" | "Exam" | "Quiz";
  dueDate: string; // ISO date
  progress: number; // 0-100
  priority: Priority;
  weight: number; // % of module grade
}

export interface Module {
  code: string;
  name: string;
  grade: number | null; // current running score 0-100
  credits: number;
}

export interface StudentStats {
  gpa: number;
  streakDays: number;
  xp: number;
  level: number;
  tasksDoneThisWeek: number;
  tasksPlannedThisWeek: number;
}
