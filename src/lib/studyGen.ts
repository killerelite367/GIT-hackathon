import type { Flashcard, KeyTerm, QuizQuestion, StudySet } from "../types";
import { GEMINI_MODEL, getApiKey, getMode, getWebhookUrl } from "./aiConfig";
import { ScanError } from "./vision";

/**
 * Turns source material into a study set — summarized notes, key terms,
 * flashcards, and a multiple-choice quiz — in one pass.
 *
 * Deliberately one call rather than four: the four artefacts should describe
 * the same material, and asking separately lets them drift (a flashcard about
 * something the notes never mention). One call, one schema, one source of truth.
 *
 * Shares the scanner's transport, so it inherits webhook-vs-direct mode and
 * therefore the "no API key in the browser" property.
 */

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING", description: "Short title for this material, 2-6 words." },
    module: { type: "STRING", description: "Module code like C237 if visible, else empty." },
    summary: {
      type: "ARRAY",
      description: "6-12 bullets covering the material, most important first.",
      items: { type: "STRING" },
    },
    keyTerms: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { term: { type: "STRING" }, definition: { type: "STRING" } },
        required: ["term", "definition"],
      },
    },
    flashcards: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { front: { type: "STRING" }, back: { type: "STRING" } },
        required: ["front", "back"],
      },
    },
    quiz: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          options: { type: "ARRAY", items: { type: "STRING" } },
          answerIndex: { type: "NUMBER" },
          explanation: { type: "STRING" },
        },
        required: ["question", "options", "answerIndex", "explanation"],
      },
    },
  },
  required: ["title", "module", "summary", "keyTerms", "flashcards", "quiz"],
} as const;

const PROMPT = `You are StudyQuest's study-material generator, used by Singapore polytechnic students revising for exams.

From the material provided, produce a study set:

- "summary": 6-12 bullets covering what a student actually needs to remember. Most important first. Each bullet one sentence, plain language, no filler like "this section discusses".
- "keyTerms": every technical term the material defines, with a one-sentence definition IN YOUR OWN WORDS. 4-15 of them.
- "flashcards": 10-20 cards. "front" is a term or a short question; "back" is the answer in one or two sentences. Test understanding, not trivia — no "what page is X on". Do not duplicate a card that is already a key term unless it genuinely needs drilling.
- "quiz": 5-10 multiple-choice questions. Exactly 4 options each. "answerIndex" is the 0-based index of the correct one. Wrong options must be plausible — a student who half-learned the material should be able to pick them. "explanation" says in one sentence why the right answer is right.

Rules:
- Use ONLY what is in the material. Do not add outside facts.
- If the material is too thin to work with, return empty arrays and put the reason in "title".
- Write for someone revising the night before, not for a textbook.`;

export interface GenerateInput {
  /** Raw text pasted by the student. */
  text?: string;
  /** Or a document image / PDF, already base64-encoded. */
  base64?: string;
  mimeType?: string;
}

let seq = 0;
const uid = (p: string) => `${p}_${Date.now().toString(36)}_${seq++}`;

export async function generateStudySet(
  input: GenerateInput,
  signal?: AbortSignal
): Promise<StudySet> {
  const raw =
    getMode() === "webhook"
      ? await viaWebhook(input, signal)
      : await viaGemini(input, signal);
  return normalize(raw, input.base64 ? "scan" : "paste");
}

function parts(input: GenerateInput) {
  const p: Record<string, unknown>[] = [{ text: PROMPT }];
  if (input.base64) {
    p.push({ inlineData: { mimeType: input.mimeType || "image/jpeg", data: input.base64 } });
  } else {
    p.push({ text: `\n\nMATERIAL:\n${input.text ?? ""}` });
  }
  return p;
}

async function viaGemini(input: GenerateInput, signal?: AbortSignal): Promise<unknown> {
  const key = getApiKey();
  if (!key) {
    throw new ScanError(
      "No Gemini API key set.",
      "Add one in Settings → AI document scan, or switch to webhook mode."
    );
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: parts(input) }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    }
  );
  if (!res.ok) {
    if (res.status === 429) {
      throw new ScanError(
        "The free Gemini quota is used up for now.",
        "Wait a minute and try again."
      );
    }
    throw new ScanError(`Gemini error ${res.status}.`);
  }
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new ScanError("Gemini returned an empty response.");
  return safeJson(text);
}

async function viaWebhook(input: GenerateInput, signal?: AbortSignal): Promise<unknown> {
  const url = getWebhookUrl();
  if (!url) throw new ScanError("No n8n webhook URL set.");

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: "studyset",
        text: input.text ?? "",
        imageBase64: input.base64 ?? "",
        mimeType: input.mimeType ?? "",
      }),
    });
  } catch {
    throw new ScanError(
      "Couldn't reach the n8n webhook.",
      "Check the URL and that the workflow is active."
    );
  }
  if (!res.ok) throw new ScanError(`The n8n workflow returned ${res.status}.`);

  const raw = (await res.text()).trim();

  /*
   * An older deployment only knows how to scan for deadlines. Given a
   * studyset task it either returns nothing at all (its Code node throws on
   * the missing image, and n8n still answers 200 with an empty body) or it
   * answers in the assignment shape. Both mean the same thing, and neither
   * should surface as a parse error — name the real cause.
   */
  const outdated = (): never => {
    throw new ScanError(
      "Your n8n workflow doesn't support study sets yet.",
      "Re-import n8n/studyquest-scan.json in n8n — the updated version handles both scanning and study sets."
    );
  };

  if (!raw) outdated();

  const body = safeJson(raw) as Record<string, unknown>;
  if (!body?.flashcards && !body?.summary) {
    if (Array.isArray(body?.assignments)) outdated();
  }
  return body;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* fall through */
      }
    }
    throw new ScanError("The generated set came back in an unexpected format.");
  }
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Validate hard — a malformed quiz answer index would silently mark students wrong. */
function normalize(raw: unknown, source: "scan" | "paste"): StudySet {
  const root = (raw ?? {}) as Record<string, unknown>;
  const body = (root.flashcards || root.summary
    ? root
    : ((root.output ?? root.data ?? root) as Record<string, unknown>)) as Record<string, unknown>;

  const summary = (Array.isArray(body.summary) ? body.summary : [])
    .map(str)
    .filter((s) => s.length > 1);

  const keyTerms: KeyTerm[] = [];
  for (const t of Array.isArray(body.keyTerms) ? body.keyTerms : []) {
    const o = (t ?? {}) as Record<string, unknown>;
    const term = str(o.term);
    const definition = str(o.definition);
    if (term && definition) keyTerms.push({ term, definition });
  }

  const flashcards: Flashcard[] = [];
  for (const c of Array.isArray(body.flashcards) ? body.flashcards : []) {
    const o = (c ?? {}) as Record<string, unknown>;
    const front = str(o.front);
    const back = str(o.back);
    if (front && back) flashcards.push({ id: uid("fc"), front, back, stage: "new" });
  }

  const quiz: QuizQuestion[] = [];
  for (const q of Array.isArray(body.quiz) ? body.quiz : []) {
    const o = (q ?? {}) as Record<string, unknown>;
    const question = str(o.question);
    const options = (Array.isArray(o.options) ? o.options : []).map(str).filter(Boolean);
    const answerIndex = Number(o.answerIndex);
    // Drop anything whose answer doesn't point at a real option.
    if (
      !question ||
      options.length < 2 ||
      !Number.isInteger(answerIndex) ||
      answerIndex < 0 ||
      answerIndex >= options.length
    ) {
      continue;
    }
    quiz.push({
      id: uid("q"),
      question,
      options,
      answerIndex,
      explanation: str(o.explanation),
    });
  }

  return {
    id: uid("set"),
    title: str(body.title) || "Study set",
    module: str(body.module).toUpperCase(),
    createdAt: new Date().toISOString(),
    source,
    summary,
    keyTerms,
    flashcards,
    quiz,
  };
}
