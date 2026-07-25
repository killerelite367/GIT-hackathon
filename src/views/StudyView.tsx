import { useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Layers,
  ListChecks,
  KeyRound,
  Sparkles,
  Plus,
  Trash2,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Check,
  X,
  Loader2,
  ClipboardType,
  ImageUp,
} from "lucide-react";
import type { CardStage, StudySet } from "../types";
import { useStore } from "../store/StoreContext";
import Button from "../components/Button";
import { generateStudySet } from "../lib/studyGen";
import { prepareFile, ScanError } from "../lib/vision";
import { isScanConfigured } from "../lib/aiConfig";

/**
 * Study tools — notes, flashcards, key terms, and a quiz, all generated from
 * one source document so they describe the same material.
 *
 * Layout follows the reference: a set list on the left, tool tabs, and the
 * active tool filling the space. The flashcard deck is the centrepiece.
 */

type Tool = "notes" | "cards" | "terms" | "quiz";

const TOOLS: { id: Tool; label: string; icon: typeof BookOpen }[] = [
  { id: "notes", label: "Summarized Notes", icon: BookOpen },
  { id: "cards", label: "Flashcards", icon: Layers },
  { id: "terms", label: "Key Terms", icon: KeyRound },
  { id: "quiz", label: "Multiple Choice Quiz", icon: ListChecks },
];

export default function StudyView({ onGoToSettings }: { onGoToSettings: () => void }) {
  const { data, addStudySet, deleteStudySet } = useStore();
  const sets = data.studySets ?? [];
  const [activeId, setActiveId] = useState<string | null>(sets[0]?.id ?? null);
  const [tool, setTool] = useState<Tool>("cards");
  const [composing, setComposing] = useState(sets.length === 0);

  const active = sets.find((s) => s.id === activeId) ?? sets[0] ?? null;

  if (composing || !active) {
    return (
      <Composer
        onCancel={sets.length ? () => setComposing(false) : undefined}
        onDone={(set) => {
          addStudySet(set);
          setActiveId(set.id);
          setTool("cards");
          setComposing(false);
        }}
        onGoToSettings={onGoToSettings}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Set list */}
      <aside className="space-y-2">
        <Button variant="primary" size="sm" block icon={<Plus size={14} />} onClick={() => setComposing(true)}>
          New study set
        </Button>
        {sets.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={`flex w-full items-center gap-2.5 rounded-xl border p-3 text-left transition ${
              s.id === active.id
                ? "border-brand/40 bg-brand-soft"
                : "border-line bg-surface hover:border-line2"
            }`}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-night">{s.title}</span>
              <span className="mt-0.5 block text-[11px] text-haze">
                {s.module && <span className="font-mono">{s.module} · </span>}
                {s.flashcards.length} cards
              </span>
            </span>
          </button>
        ))}
      </aside>

      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl font-bold tracking-tightish text-night">
              {active.title}
            </h2>
            <p className="text-xs text-haze">
              Generated from {active.source === "scan" ? "a scanned document" : "pasted text"}
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() => {
              deleteStudySet(active.id);
              setActiveId(sets.find((s) => s.id !== active.id)?.id ?? null);
            }}
          >
            Delete
          </Button>
        </div>

        {/* Tool tabs */}
        <div className="mb-5 flex flex-wrap gap-1 rounded-xl border border-line bg-surface2 p-1">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            const count =
              t.id === "cards"
                ? active.flashcards.length
                : t.id === "quiz"
                ? active.quiz.length
                : t.id === "terms"
                ? active.keyTerms.length
                : active.summary.length;
            return (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                aria-pressed={tool === t.id}
                className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  tool === t.id ? "bg-brand text-white shadow-brand" : "text-dusk hover:text-night"
                }`}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {tool === "notes" && <Notes set={active} />}
        {tool === "cards" && <Deck set={active} />}
        {tool === "terms" && <Terms set={active} />}
        {tool === "quiz" && <Quiz set={active} />}
      </section>
    </div>
  );
}

// ── Composer ────────────────────────────────────────────────────────────────

function Composer({
  onDone,
  onCancel,
  onGoToSettings,
}: {
  onDone: (s: StudySet) => void;
  onCancel?: () => void;
  onGoToSettings: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<false | "reading" | "thinking">(false);
  const [error, setError] = useState<{ msg: string; hint?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async (payload: Parameters<typeof generateStudySet>[0]) => {
    setError(null);
    setBusy("thinking");
    try {
      onDone(await generateStudySet(payload));
    } catch (e) {
      if (e instanceof ScanError) setError({ msg: e.message, hint: e.hint });
      else setError({ msg: "Generating the study set failed.", hint: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setError(null);
    setBusy("reading");
    try {
      const { base64, mimeType } = await prepareFile(f);
      await run({ base64, mimeType });
    } catch (err) {
      if (err instanceof ScanError) setError({ msg: err.message, hint: err.hint });
      setBusy(false);
    }
  };

  if (!isScanConfigured()) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-soft">
        <Sparkles size={22} className="mx-auto text-brand" />
        <p className="mt-3 text-sm font-semibold text-night">AI isn't set up yet</p>
        <p className="mt-1 text-xs text-dusk">
          Study sets are generated by AI, using the same connection as the document scanner.
        </p>
        <Button variant="primary" size="sm" className="mt-4" onClick={onGoToSettings}>
          Open settings
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-night">
          <Sparkles size={18} className="text-brand" /> New study set
        </h2>
        <p className="mt-1 text-sm text-dusk">
          Paste your notes or upload a lecture handout. You'll get summarized notes, key terms,
          flashcards, and a quiz — all from the same material.
        </p>

        {busy ? (
          <div className="py-14 text-center">
            <Loader2 size={22} className="mx-auto animate-spin text-brand" />
            <p className="mt-3 text-sm font-semibold text-night">
              {busy === "reading" ? "Reading your document…" : "Building your study set…"}
            </p>
            <p className="mt-1 text-xs text-dusk">
              {busy === "reading"
                ? "Resizing the image before upload."
                : "Notes, terms, cards, and questions in one pass. Around 15 seconds."}
            </p>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder="Paste lecture notes, a chapter, or your own summary…"
              className="mt-4 w-full resize-none rounded-2xl border border-line bg-surface2 p-3 text-sm text-night outline-none placeholder:text-haze focus:border-brand/50"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                icon={<ClipboardType size={15} />}
                disabled={text.trim().length < 40}
                onClick={() => run({ text })}
              >
                Generate from text
              </Button>
              <Button variant="secondary" icon={<ImageUp size={15} />} onClick={() => fileRef.current?.click()}>
                Upload a document
              </Button>
              {onCancel && (
                <Button variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
            {text.trim().length > 0 && text.trim().length < 40 && (
              <p className="mt-2 text-xs text-haze">
                A bit more text needed — {40 - text.trim().length} more characters.
              </p>
            )}
          </>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={onFile}
          className="hidden"
        />

        {error && (
          <div className="mt-4 rounded-xl border border-berry/40 bg-berry-soft p-3">
            <p className="text-sm font-semibold text-berry-deep">{error.msg}</p>
            {error.hint && <p className="mt-0.5 text-xs text-dusk">{error.hint}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Notes ───────────────────────────────────────────────────────────────────

function Notes({ set }: { set: StudySet }) {
  if (!set.summary.length) return <Empty what="notes" />;
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
      <ul className="space-y-3">
        {set.summary.map((line, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-night">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Key terms ───────────────────────────────────────────────────────────────

function Terms({ set }: { set: StudySet }) {
  if (!set.keyTerms.length) return <Empty what="key terms" />;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {set.keyTerms.map((t, i) => (
        <div key={i} className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <p className="font-display text-sm font-bold text-night">{t.term}</p>
          <p className="mt-1 text-sm text-dusk">{t.definition}</p>
        </div>
      ))}
    </div>
  );
}

// ── Flashcards ──────────────────────────────────────────────────────────────

const STAGE_STYLE: Record<CardStage, string> = {
  new: "text-sky-deep bg-sky-soft border-sky/30",
  learning: "text-warm-deep bg-warm-soft border-warm/30",
  mastered: "text-grass-deep bg-grass-soft border-grass/30",
};

function Deck({ set }: { set: StudySet }) {
  const { setCardStage, resetCardStages } = useStore();
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [definitionFirst, setDefinitionFirst] = useState(false);

  // Cards still worth drilling: everything not yet mastered, in order.
  const queue = useMemo(() => set.flashcards.filter((c) => c.stage !== "mastered"), [set.flashcards]);
  const counts = useMemo(() => {
    const c = { new: 0, learning: 0, mastered: 0 };
    for (const card of set.flashcards) c[card.stage]++;
    return c;
  }, [set.flashcards]);

  if (!set.flashcards.length) return <Empty what="flashcards" />;

  const done = queue.length === 0;
  const card = queue[Math.min(i, queue.length - 1)];

  const answer = (stage: CardStage) => {
    if (!card) return;
    setCardStage(set.id, card.id, stage);
    setFlipped(false);
    // The queue shrinks when a card is mastered, so staying put lands on the
    // next card; for "learning" we step forward explicitly.
    if (stage === "learning") setI((n) => (n + 1) % Math.max(queue.length, 1));
    else setI((n) => (n >= queue.length - 1 ? 0 : n));
  };

  return (
    <div>
      {/* Stage counts + front/back toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["new", "learning", "mastered"] as CardStage[]).map((s) => (
            <span
              key={s}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${STAGE_STYLE[s]}`}
            >
              {s} {counts[s]}
            </span>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-dusk">
          <input
            type="checkbox"
            checked={definitionFirst}
            onChange={(e) => {
              setDefinitionFirst(e.target.checked);
              setFlipped(false);
            }}
            className="h-4 w-4 accent-brand"
          />
          Definition on front
        </label>
      </div>

      {done ? (
        <div className="rounded-2xl border border-line bg-surface p-12 text-center shadow-soft">
          <Check size={26} className="mx-auto text-grass" />
          <p className="mt-3 font-display text-lg font-bold text-night">Deck mastered</p>
          <p className="mt-1 text-sm text-dusk">All {set.flashcards.length} cards are marked known.</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            icon={<RotateCcw size={14} />}
            onClick={() => {
              resetCardStages(set.id);
              setI(0);
              setFlipped(false);
            }}
          >
            Study again
          </Button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setFlipped((f) => !f)}
            className="flex min-h-[260px] w-full items-center justify-center rounded-2xl border border-line bg-surface p-8 text-center shadow-soft transition hover:border-line2"
          >
            <span>
              <span className="mb-3 block text-[11px] font-semibold uppercase tracking-wide text-haze">
                {flipped ? "Answer" : "Tap to flip"}
              </span>
              <span className="block font-display text-2xl font-bold leading-snug text-night">
                {flipped
                  ? definitionFirst
                    ? card.front
                    : card.back
                  : definitionFirst
                  ? card.back
                  : card.front}
              </span>
            </span>
          </button>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="danger" icon={<ThumbsDown size={15} />} onClick={() => answer("learning")}>
              Don't know
            </Button>
            <Button variant="secondary" icon={<RefreshCw size={15} />} onClick={() => setFlipped((f) => !f)}>
              Flip
            </Button>
            <Button
              variant="primary"
              icon={<ThumbsUp size={15} />}
              className="!bg-grass hover:!bg-grass-deep !shadow-none"
              onClick={() => answer("mastered")}
            >
              Know
            </Button>
          </div>
          <p className="mt-3 text-center text-xs text-haze">{queue.length} cards remaining</p>
        </>
      )}
    </div>
  );
}

// ── Quiz ────────────────────────────────────────────────────────────────────

function Quiz({ set }: { set: StudySet }) {
  const [picked, setPicked] = useState<Record<string, number>>({});

  if (!set.quiz.length) return <Empty what="quiz questions" />;

  const answered = Object.keys(picked).length;
  const correct = set.quiz.filter((q) => picked[q.id] === q.answerIndex).length;

  return (
    <div className="space-y-4">
      {answered > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <p className="text-sm font-semibold text-night">
            {correct} / {answered} correct
          </p>
          <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={() => setPicked({})}>
            Reset
          </Button>
        </div>
      )}

      {set.quiz.map((q, qi) => {
        const choice = picked[q.id];
        const isAnswered = choice != null;
        return (
          <div key={q.id} className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
            <p className="text-[15px] font-semibold text-night">
              <span className="mr-2 font-mono text-xs text-haze">{qi + 1}</span>
              {q.question}
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => {
                const isRight = oi === q.answerIndex;
                const isPicked = choice === oi;
                let cls = "border-line bg-surface2 text-dusk hover:border-line2";
                if (isAnswered && isRight) cls = "border-grass/50 bg-grass-soft text-grass-deep";
                else if (isAnswered && isPicked) cls = "border-berry/50 bg-berry-soft text-berry-deep";
                else if (isAnswered) cls = "border-line bg-surface2 text-haze";
                return (
                  <button
                    key={oi}
                    disabled={isAnswered}
                    onClick={() => setPicked((p) => ({ ...p, [q.id]: oi }))}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium transition disabled:cursor-default ${cls}`}
                  >
                    <span className="font-mono text-[11px] opacity-70">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {isAnswered && isRight && <Check size={15} />}
                    {isAnswered && isPicked && !isRight && <X size={15} />}
                  </button>
                );
              })}
            </div>
            {isAnswered && q.explanation && (
              <p className="mt-3 rounded-xl border border-line bg-surface2 p-3 text-xs text-dusk">
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Empty({ what }: { what: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line2 bg-surface/60 p-10 text-center">
      <p className="text-sm text-dusk">The AI didn't produce any {what} for this material.</p>
      <p className="mt-1 text-xs text-haze">Try a longer or clearer source document.</p>
    </div>
  );
}
