import type { Assignment, AssignmentType } from "../types";
import { todayISO, toISODate, daysUntil } from "./date";

/**
 * Syllabus / brief parser — the differentiator.
 *
 * Paste raw text from a module guide, assignment brief, or Brightspace
 * announcement and this extracts structured assignments: title, due date,
 * weightage, type, module code, and an effort estimate. No LLM/API needed,
 * so it runs offline and deterministically for a live demo. (An LLM parser
 * can slot in behind the same ParsedAssignment shape later.)
 */

export interface ParsedAssignment {
  title: string;
  module: string;
  type: AssignmentType;
  dueDate: string; // ISO
  weight: number;
  estHours: number;
  confidence: number; // 0-1, how sure we are about the extraction
}

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/** Pick a sensible year: if the month already passed this year, roll forward. */
function resolveYear(month: number, day: number, explicit?: number): number {
  if (explicit) return explicit < 100 ? 2000 + explicit : explicit;
  const now = new Date();
  const candidate = new Date(now.getFullYear(), month, day);
  // If it's more than a month in the past, assume next year.
  if (candidate.getTime() < now.getTime() - 31 * 86_400_000) {
    return now.getFullYear() + 1;
  }
  return now.getFullYear();
}

/** Try every supported date shape in a line. Returns ISO date or null. */
function extractDate(line: string): string | null {
  const l = line.toLowerCase();

  // 1) "27 Jul 2026", "27 July", "27th Jul"
  let m = l.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,9})\.?(?:\s+(\d{4}))?/);
  if (m && MONTHS[m[2]] !== undefined) {
    const day = +m[1];
    const month = MONTHS[m[2]];
    const year = resolveYear(month, day, m[3] ? +m[3] : undefined);
    return toISODate(new Date(year, month, day));
  }

  // 2) "Jul 27, 2026", "July 27"
  m = l.match(/\b([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/);
  if (m && MONTHS[m[1]] !== undefined) {
    const month = MONTHS[m[1]];
    const day = +m[2];
    const year = resolveYear(month, day, m[3] ? +m[3] : undefined);
    return toISODate(new Date(year, month, day));
  }

  // 3) ISO "2026-07-27"
  m = l.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  // 4) "27/07/2026" or "27/7/26" (day-first, SG convention)
  m = l.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if (m) {
    const day = +m[1];
    const month = +m[2] - 1;
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const year = resolveYear(month, day, +m[3]);
      return toISODate(new Date(year, month, day));
    }
  }

  return null;
}

function extractWeight(line: string): number | null {
  // "(25%)", "worth 30%", "weightage: 20%", "30 %"
  const m = line.match(/(\d{1,3})\s*%/);
  if (!m) return null;
  const w = +m[1];
  return w > 0 && w <= 100 ? w : null;
}

function extractModule(line: string): string | null {
  // RP module codes look like C240, C299, etc.
  const m = line.match(/\b([A-Z]\d{3})\b/);
  return m ? m[1] : null;
}

function guessType(line: string): AssignmentType {
  const l = line.toLowerCase();
  if (/\bquiz\b/.test(l)) return "Quiz";
  if (/\bexam|final|mid-?term\b/.test(l)) return "Exam";
  if (/\breflection|journal|log\b/.test(l)) return "Reflection";
  if (/\bgroup|team|project|sprint|demo\b/.test(l)) return "Group Project";
  return "CA";
}

/** Rough effort estimate (hours) from type + weight. */
function estimateHours(type: AssignmentType, weight: number): number {
  const base: Record<AssignmentType, number> = {
    Quiz: 2,
    Reflection: 1.5,
    CA: 6,
    Exam: 8,
    "Group Project": 10,
  };
  // Heavier assignments get a proportional bump.
  const bump = Math.round((weight / 10) * 1.5);
  return Math.max(1, base[type] + bump);
}

/** Clean a raw line into a human title. */
function cleanTitle(line: string): string {
  return line
    .replace(/^[\s\-*•\d.)\]]+/, "") // leading bullets/numbering
    .replace(/\bdue\s*(date)?\s*[:\-]?.*$/i, "") // trailing "due: ..."
    .replace(/\(?\bby\b.*$/i, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[·|,;–—-]\s*$/, "")
    .trim();
}

/**
 * Parse a blob of syllabus text into candidate assignments.
 * A line qualifies if it mentions a date OR a weightage (or both).
 */
export function parseSyllabus(text: string, fallbackModule = ""): ParsedAssignment[] {
  const results: ParsedAssignment[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const date = extractDate(line);
    const weight = extractWeight(line);
    if (!date && weight == null) continue; // no anchor signal, skip

    const module = extractModule(line) ?? fallbackModule ?? "";
    const type = guessType(line);
    const w = weight ?? defaultWeight(type);
    const due = date ?? toISODate(new Date(Date.now() + 7 * 86_400_000));

    let title = cleanTitle(line);
    if (title.length < 3) title = `${type} task`;
    if (title.length > 80) title = title.slice(0, 77) + "…";

    // Confidence: both signals present + a module code = high.
    let confidence = 0.4;
    if (date) confidence += 0.3;
    if (weight != null) confidence += 0.2;
    if (extractModule(line)) confidence += 0.1;

    results.push({
      title,
      module,
      type,
      dueDate: due,
      weight: w,
      estHours: estimateHours(type, w),
      confidence: Math.min(1, confidence),
    });
  }

  return dedupe(results);
}

function defaultWeight(type: AssignmentType): number {
  const d: Record<AssignmentType, number> = {
    Quiz: 10,
    Reflection: 5,
    CA: 20,
    Exam: 40,
    "Group Project": 30,
  };
  return d[type];
}

/** Drop near-duplicate rows (same title + due date). */
function dedupe(rows: ParsedAssignment[]): ParsedAssignment[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const key = `${r.title.toLowerCase()}|${r.dueDate}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

let idSeq = 0;
/** Turn confirmed parsed rows into real Assignment records. */
export function toAssignments(rows: ParsedAssignment[]): Assignment[] {
  return rows.map((r) => ({
    id: `imp_${Date.now().toString(36)}_${idSeq++}`,
    title: r.title,
    module: r.module,
    type: r.type,
    dueDate: r.dueDate,
    progress: 0,
    weight: r.weight,
    estHours: r.estHours,
    completed: false,
    createdAt: new Date().toISOString(),
  }));
}

/** A ready-made example brief so the demo has something to paste. */
export const SAMPLE_SYLLABUS = `C240 Data Engineering — Module Guide (Semester 2)
- CA2: ETL Pipeline Report is due 27 Jul 2026, worth 25% of the module grade.
- Quiz 4: Model Evaluation on 24 July (10%)
- Group Project Sprint 3 Demo — present on 29/07/2026, weightage 30%
- Weekly Reflection #10 due 2026-07-25 (5%)
- C118 Dashboard Prototype final submission by 2 Aug 2026, worth 20%
- Final Exam: 12 August 2026, 40% of grade`;

/** Convenience for the "how soon" badge on parsed rows. */
export function parsedUrgency(iso: string): "soon" | "later" {
  return daysUntil(iso) <= 3 ? "soon" : "later";
}

export { todayISO };
