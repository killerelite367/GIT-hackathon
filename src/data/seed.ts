import type { AppData } from "../types";
import { todayISO, addDays } from "../lib/date";

/**
 * First-run seed data. Dates are relative to *today* so the demo always looks
 * live (a deadline is always "3 days out", never stuck in the past).
 */
export function seedData(): AppData {
  const t = todayISO();
  return {
    modules: [
      { code: "C240", name: "Data Engineering", grade: 82, credits: 6 },
      { code: "C216", name: "UX Design", grade: 88, credits: 4 },
      { code: "C299", name: "Applied AI", grade: 74, credits: 6 },
      { code: "C118", name: "Business Analytics", grade: 79, credits: 4 },
    ],
    assignments: [
      {
        id: "seed1",
        title: "CA2: ETL Pipeline Report",
        module: "C240",
        type: "CA",
        dueDate: addDays(t, 4),
        progress: 40,
        weight: 25,
        estHours: 8,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "seed2",
        title: "Group Project Sprint 3 Demo",
        module: "C299",
        type: "Group Project",
        dueDate: addDays(t, 6),
        progress: 60,
        weight: 30,
        estHours: 10,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "seed3",
        title: "Weekly Reflection #10",
        module: "C216",
        type: "Reflection",
        dueDate: addDays(t, 2),
        progress: 0,
        weight: 5,
        estHours: 1.5,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "seed4",
        title: "Dashboard Prototype",
        module: "C118",
        type: "CA",
        dueDate: addDays(t, 10),
        progress: 20,
        weight: 20,
        estHours: 7,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "seed5",
        title: "Quiz 4: Model Evaluation",
        module: "C299",
        type: "Quiz",
        dueDate: addDays(t, 1),
        progress: 80,
        weight: 10,
        estHours: 2,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ],
    blocks: [],
    game: {
      xp: 0,
      streakDays: 0,
      lastActiveDate: null,
      bestStreak: 0,
      achievements: [],
      syllabusImported: false,
      // Welcome bonus: enough for one big 10× summon so the loop is exciting on
      // first open — after that you earn crystals by completing real study work.
      crystals: 1000,
      spirits: {},
      pityCount: 0,
      equippedSpirit: null,
      remindersEnabled: false,
      lastReminderDate: null,
    },
  };
}
