import type { AssignmentType } from "../types";
import type { ParsedAssignment } from "./parser";
import { todayISO } from "./date";
import { GEMINI_MODEL, getApiKey, getMode, getWebhookUrl } from "./aiConfig";

/**
 * AI document scanner — photograph a module guide, brief, timetable, or result
 * slip and get structured data back.
 *
 * This is the vision counterpart to `parser.ts`: it returns the exact same
 * `ParsedAssignment` shape, so scanned rows flow through the identical confirm
 * list → `importParsed` → auto-scheduler pipeline as pasted text. It can also
 * pull module scores off a results slip so grades update from a photo too.
 */

/** A running score spotted on the document, e.g. from a results slip. */
export interface ScannedGrade {
  module: string; // module code, e.g. "C240"
  score: number; // 0-100
  label: string; // what the document called it
}

export interface ScanResult {
  assignments: ParsedAssignment[];
  grades: ScannedGrade[];
  /** What the model thinks it was looking at ("module guide", "timetable"…). */
  documentType: string;
  /** One-line note shown above the review list — or why nothing was found. */
  note: string;
}

export class ScanError extends Error {
  constructor(message: string, readonly hint?: string) {
    super(message);
    this.name = "ScanError";
  }
}

const ASSIGNMENT_TYPES: AssignmentType[] = [
  "CA",
  "Group Project",
  "Reflection",
  "Exam",
  "Quiz",
];

/** Hard cap on what we'll upload — protects the free-tier token budget. */
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
/** Longest edge we downscale photos to. Plenty for OCR, ~10x smaller payload. */
const MAX_EDGE = 1600;

// ─── Image prep ──────────────────────────────────────────────────────────────

/**
 * Shrink a phone photo before upload. A 12MP snap is ~4MB (≈5.3MB as base64)
 * and burns tokens for no extra accuracy — 1600px on the long edge reads just
 * as well. PDFs pass through untouched (Gemini reads them natively).
 */
export async function prepareFile(
  file: File
): Promise<{ base64: string; mimeType: string; previewUrl: string }> {
  if (file.type === "application/pdf") {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new ScanError(
        "That PDF is too large to scan.",
        "Try a single page, or export it at a lower quality."
      );
    }
    const base64 = await fileToBase64(file);
    return { base64, mimeType: "application/pdf", previewUrl: "" };
  }

  if (!file.type.startsWith("image/")) {
    throw new ScanError(
      "That file type can't be scanned.",
      "Use a photo (JPG/PNG/WebP) or a PDF."
    );
  }

  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ScanError("Couldn't read that image in this browser.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  if ("close" in bitmap) bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return {
    base64: dataUrl.split(",")[1] ?? "",
    mimeType: "image/jpeg",
    previewUrl: dataUrl,
  };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through to <img> — e.g. some HEIC/odd encoders */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(
          new ScanError(
            "That image couldn't be decoded.",
            "iPhone HEIC photos often fail — set Camera to “Most Compatible”, or screenshot it first."
          )
        );
      img.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(new ScanError("Couldn't read that file."));
    r.readAsDataURL(file);
  });
}

// ─── Prompt + schema ─────────────────────────────────────────────────────────

function buildPrompt(knownModules: string[]): string {
  const today = todayISO();
  return `You are the document scanner for Study Buddies, a study planner used by Singapore polytechnic students.

Read the attached document image and extract every piece of assessed work you can find: continuous assessments, quizzes, exams, group projects, reflections, presentations, submissions.

Today's date is ${today}. Use it to resolve any date that omits a year — always pick the NEXT occurrence, never a date in the past. Return every date as YYYY-MM-DD.

Rules:
- "weight" is the percentage of the module grade (a number 1-100). If the document does not state one, estimate a sensible value from the assessment type.
- "estHours" is your estimate of the total effort in hours (1-40).
- "type" must be exactly one of: ${ASSIGNMENT_TYPES.join(", ")}.
- "module" is the module code such as C240 or C237. ${
    knownModules.length
      ? `Modules already in this student's account: ${knownModules.join(", ")} — reuse these codes when the document clearly refers to them.`
      : "Leave it empty if the document does not show one."
  }
- "confidence" is 0-1: how sure you are this row is a real assessment with the right date.
- Do NOT invent assignments. If the document has no assessed work, return an empty list and explain what it was in "note".
- If the document shows achieved marks or grades (a results slip, a graded rubric, a transcript), also fill "grades" with the module code and the score out of 100. Convert letter grades: A=85, B+=78, B=72, C+=65, C=58, D+=52, D=45, F=30. Leave "grades" empty otherwise.
- Ignore anything that is not assessed work: lecture topics, readings, timetable slots without a submission, admin notices.`;
}

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    documentType: {
      type: "STRING",
      description: "What this document is, in 2-4 words.",
    },
    note: {
      type: "STRING",
      description: "One short sentence summarising what was found.",
    },
    assignments: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          module: { type: "STRING" },
          type: { type: "STRING", enum: ASSIGNMENT_TYPES },
          dueDate: { type: "STRING", description: "YYYY-MM-DD" },
          weight: { type: "NUMBER" },
          estHours: { type: "NUMBER" },
          confidence: { type: "NUMBER" },
        },
        required: ["title", "type", "dueDate", "weight", "estHours", "confidence"],
      },
    },
    grades: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          module: { type: "STRING" },
          score: { type: "NUMBER" },
          label: { type: "STRING" },
        },
        required: ["module", "score", "label"],
      },
    },
  },
  required: ["documentType", "note", "assignments", "grades"],
} as const;

// ─── Scan ────────────────────────────────────────────────────────────────────

/**
 * Scan a prepared document. Routes to the n8n webhook or straight to Gemini
 * depending on the configured mode; both return the same shape.
 */
export async function scanDocument(
  base64: string,
  mimeType: string,
  knownModules: string[] = [],
  signal?: AbortSignal
): Promise<ScanResult> {
  const raw =
    getMode() === "webhook"
      ? await callWebhook(base64, mimeType, knownModules, signal)
      : await callGemini(base64, mimeType, knownModules, signal);
  return normalize(raw);
}

async function callGemini(
  base64: string,
  mimeType: string,
  knownModules: string[],
  signal?: AbortSignal
): Promise<unknown> {
  const key = getApiKey();
  if (!key) {
    throw new ScanError(
      "No Gemini API key set.",
      "Add one in Settings → AI document scan."
    );
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: buildPrompt(knownModules) },
              { inlineData: { mimeType, data: base64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    }
  );

  if (!res.ok) throw await geminiError(res);

  const json = await res.json();
  const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const blocked = json?.promptFeedback?.blockReason;
    throw new ScanError(
      blocked
        ? "Gemini refused to read that document."
        : "Gemini returned an empty response.",
      "Try a clearer, better-lit photo of the page."
    );
  }
  return safeJson(text);
}

/** Turn an HTTP failure into something a student can act on. */
async function geminiError(res: Response): Promise<ScanError> {
  let message = "";
  try {
    const body = await res.json();
    message = body?.error?.message ?? "";
  } catch {
    /* non-JSON error body */
  }

  if (res.status === 429) {
    return new ScanError(
      "The free Gemini quota is used up for now.",
      "Wait a minute and try again, or paste the text instead."
    );
  }
  if (res.status === 400 && /api key not valid/i.test(message)) {
    return new ScanError(
      "That Gemini API key isn't valid.",
      "Check it in Settings → AI document scan."
    );
  }
  if (res.status === 401 || res.status === 403) {
    return new ScanError(
      "Gemini rejected the API key.",
      "Make sure the key is from aistudio.google.com and the Generative Language API is enabled."
    );
  }
  return new ScanError(
    `Gemini error ${res.status}.`,
    message.slice(0, 160) || undefined
  );
}

/**
 * Cheap round-trip so Settings can prove the key works before a student
 * discovers otherwise mid-demo. Text-only, a handful of tokens.
 */
export async function testConnection(): Promise<{ ok: boolean; detail: string }> {
  if (getMode() === "webhook") {
    const url = getWebhookUrl();
    if (!url) return { ok: false, detail: "No webhook URL set." };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ping: true }),
      });
      return res.ok
        ? { ok: true, detail: "Webhook reachable." }
        : { ok: false, detail: `Webhook returned ${res.status}.` };
    } catch {
      return { ok: false, detail: "Couldn't reach the webhook (network or CORS)." };
    }
  }

  const key = getApiKey();
  if (!key) return { ok: false, detail: "No API key set." };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Reply with the single word: ready" }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
      }
    );
    if (res.ok) return { ok: true, detail: `Connected to ${GEMINI_MODEL}.` };
    const e = await geminiError(res);
    return { ok: false, detail: e.hint ? `${e.message} ${e.hint}` : e.message };
  } catch {
    return { ok: false, detail: "Network error reaching Google." };
  }
}

async function callWebhook(
  base64: string,
  mimeType: string,
  knownModules: string[],
  signal?: AbortSignal
): Promise<unknown> {
  const url = getWebhookUrl();
  if (!url) {
    throw new ScanError(
      "No n8n webhook URL set.",
      "Add one in Settings → AI document scan, or switch to direct mode."
    );
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: base64,
        mimeType,
        today: todayISO(),
        knownModules,
      }),
    });
  } catch {
    throw new ScanError(
      "Couldn't reach the n8n webhook.",
      "Check the URL, that the workflow is active, and that CORS allows this site."
    );
  }

  if (!res.ok) {
    throw new ScanError(
      `The n8n workflow returned ${res.status}.`,
      "Open the workflow's execution log in n8n to see what failed."
    );
  }
  return safeJson(await res.text());
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Models occasionally wrap JSON in a ``` fence despite the schema.
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* fall through */
      }
    }
    throw new ScanError(
      "The scan came back in an unexpected format.",
      "Try again — or paste the text instead."
    );
  }
}

// ─── Normalising ─────────────────────────────────────────────────────────────

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Coerce whatever the model returned into valid app data. The schema makes the
 * shape very likely but never guaranteed, and one bad date would poison the
 * scheduler — so every field is validated here rather than trusted.
 */
function normalize(raw: unknown): ScanResult {
  const root = (raw ?? {}) as Record<string, unknown>;
  // n8n nodes commonly wrap the payload — unwrap the usual suspects.
  const body = (root.assignments || root.grades
    ? root
    : ((root.output ?? root.data ?? root.json ?? root) as Record<string, unknown>)) as Record<
    string,
    unknown
  >;

  const rawRows = Array.isArray(body.assignments) ? body.assignments : [];
  const assignments: ParsedAssignment[] = [];

  for (const item of rawRows) {
    const r = (item ?? {}) as Record<string, unknown>;
    const dueDate = str(r.dueDate);
    if (!ISO_DATE.test(dueDate)) continue; // unusable without a real deadline
    if (Number.isNaN(new Date(dueDate).getTime())) continue;

    let title = str(r.title);
    if (title.length < 2) continue;
    if (title.length > 80) title = `${title.slice(0, 77)}…`;

    const type = (ASSIGNMENT_TYPES as string[]).includes(str(r.type))
      ? (str(r.type) as AssignmentType)
      : "CA";

    assignments.push({
      title,
      module: str(r.module).toUpperCase(),
      type,
      dueDate,
      weight: Math.round(clamp(num(r.weight, 20), 1, 100)),
      estHours: Math.round(clamp(num(r.estHours, 5), 1, 40) * 2) / 2,
      confidence: clamp(num(r.confidence, 0.6), 0, 1),
    });
  }

  const rawGrades = Array.isArray(body.grades) ? body.grades : [];
  const grades: ScannedGrade[] = [];
  for (const item of rawGrades) {
    const g = (item ?? {}) as Record<string, unknown>;
    const module = str(g.module).toUpperCase();
    const score = num(g.score, NaN);
    if (!module || !Number.isFinite(score)) continue;
    grades.push({
      module,
      score: Math.round(clamp(score, 0, 100)),
      label: str(g.label) || module,
    });
  }

  return {
    assignments: dedupe(assignments),
    grades,
    documentType: str(body.documentType) || "document",
    note: str(body.note),
  };
}

function dedupe(rows: ParsedAssignment[]): ParsedAssignment[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const key = `${r.title.toLowerCase()}|${r.dueDate}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
