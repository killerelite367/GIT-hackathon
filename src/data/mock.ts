import type { Assignment, Module, StudentStats } from "../types";

export const stats: StudentStats = {
  gpa: 3.62,
  streakDays: 12,
  xp: 2450,
  level: 7,
  tasksDoneThisWeek: 9,
  tasksPlannedThisWeek: 14,
};

export const modules: Module[] = [
  { code: "C240", name: "Data Engineering", grade: 82, credits: 6 },
  { code: "C216", name: "UX Design", grade: 88, credits: 4 },
  { code: "C299", name: "Applied AI", grade: 74, credits: 6 },
  { code: "C118", name: "Business Analytics", grade: 79, credits: 4 },
];

export const assignments: Assignment[] = [
  { id: "1", title: "CA2: ETL Pipeline Report", module: "C240", type: "CA", dueDate: "2026-07-27", progress: 40, priority: "high", weight: 25 },
  { id: "2", title: "Group Project Sprint 3 Demo", module: "C299", type: "Group Project", dueDate: "2026-07-29", progress: 60, priority: "high", weight: 30 },
  { id: "3", title: "Weekly Reflection #10", module: "C216", type: "Reflection", dueDate: "2026-07-25", progress: 0, priority: "medium", weight: 5 },
  { id: "4", title: "Dashboard Prototype", module: "C118", type: "CA", dueDate: "2026-08-02", progress: 20, priority: "medium", weight: 20 },
  { id: "5", title: "Quiz 4: Model Evaluation", module: "C299", type: "Quiz", dueDate: "2026-07-24", progress: 80, priority: "high", weight: 10 },
];
