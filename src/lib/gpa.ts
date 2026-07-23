import type { Module } from "../types";

/**
 * Singapore polytechnic style GPA on a 0-4 scale.
 * Maps a running module score (0-100) to a letter + grade point.
 * Bands follow the common poly GPA table (RP uses the same 4.0 ceiling).
 */
interface Band {
  min: number;
  letter: string;
  point: number;
}

const BANDS: Band[] = [
  { min: 80, letter: "A", point: 4.0 },
  { min: 75, letter: "B+", point: 3.5 },
  { min: 70, letter: "B", point: 3.0 },
  { min: 65, letter: "C+", point: 2.5 },
  { min: 60, letter: "C", point: 2.0 },
  { min: 55, letter: "D+", point: 1.5 },
  { min: 50, letter: "D", point: 1.0 },
  { min: 0, letter: "F", point: 0.0 },
];

export function scoreToGrade(score: number): { letter: string; point: number } {
  const band = BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1];
  return { letter: band.letter, point: band.point };
}

/** Credit-weighted GPA across all graded modules. Returns 0 if none graded. */
export function computeGpa(modules: Module[]): number {
  const graded = modules.filter((m) => m.grade != null);
  if (graded.length === 0) return 0;
  let points = 0;
  let credits = 0;
  for (const m of graded) {
    points += scoreToGrade(m.grade as number).point * m.credits;
    credits += m.credits;
  }
  return credits === 0 ? 0 : points / credits;
}

/**
 * "What-if" — what running score does a target module need on its remaining
 * work to lift the overall GPA to `targetGpa`? Returns the minimum score
 * (0-100) needed on `moduleCode`, holding other modules fixed. null if the
 * target is unreachable even with a perfect 100.
 */
export function scoreNeededFor(
  modules: Module[],
  moduleCode: string,
  targetGpa: number
): number | null {
  const target = modules.find((m) => m.code === moduleCode);
  if (!target) return null;
  // Binary search the score that yields >= targetGpa overall.
  let lo = 0;
  let hi = 100;
  const gpaWith = (score: number) =>
    computeGpa(modules.map((m) => (m.code === moduleCode ? { ...m, grade: score } : m)));
  if (gpaWith(100) < targetGpa) return null;
  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    if (gpaWith(mid) >= targetGpa) hi = mid;
    else lo = mid;
  }
  return Math.ceil(hi);
}
