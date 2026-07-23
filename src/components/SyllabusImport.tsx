import { useState } from "react";
import { Wand2, X, FileText, Check } from "lucide-react";
import { parseSyllabus, SAMPLE_SYLLABUS, type ParsedAssignment } from "../lib/parser";
import { shortDate, relativeDue } from "../lib/date";
import { useStore } from "../store/StoreContext";

export default function SyllabusImport({ onClose }: { onClose: () => void }) {
  const { importParsed } = useStore();
  const [text, setText] = useState("");
  const [rows, setRows] = useState<ParsedAssignment[] | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());

  const run = () => {
    const parsed = parseSyllabus(text);
    setRows(parsed);
    setPicked(new Set(parsed.map((_, i) => i)));
  };

  const toggle = (i: number) =>
    setPicked((p) => {
      const n = new Set(p);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const confirm = () => {
    if (!rows) return;
    const chosen = rows.filter((_, i) => picked.has(i));
    if (chosen.length) importParsed(chosen);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-night/30 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Import from syllabus"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl animate-popin flex-col rounded-t-3xl border border-line bg-surface p-6 shadow-pop sm:rounded-3xl"
      >
        <div className="mb-1 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-night">
            <Wand2 size={18} className="text-brand" /> Import from syllabus
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-haze transition hover:text-night">
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-sm text-dusk">
          Paste a module guide, brief, or Brightspace announcement. StudyQuest extracts every
          deadline, weightage, and effort estimate — then auto-schedules them. No manual entry.
        </p>

        {!rows ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
              placeholder="Paste your syllabus text here…"
              className="w-full resize-none rounded-2xl border border-line bg-surface2 p-3 font-mono text-xs text-night outline-none placeholder:text-haze focus:border-brand/50"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={run}
                disabled={!text.trim()}
                className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-deep active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <Wand2 size={15} /> Extract assignments
              </button>
              <button
                onClick={() => setText(SAMPLE_SYLLABUS)}
                className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-medium text-dusk transition hover:text-night active:scale-95"
              >
                <FileText size={15} /> Try a sample
              </button>
            </div>
          </>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface2 p-6 text-center text-sm text-dusk">
            No deadlines or weightages found in that text. Try pasting lines that include dates (e.g.
            “27 Jul”) or percentages.
            <div className="mt-4">
              <button
                onClick={() => setRows(null)}
                className="rounded-xl border border-line px-4 py-2 font-medium text-dusk hover:text-night"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-haze">
              Found {rows.length} — pick what to import
            </p>
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {rows.map((r, i) => {
                const on = picked.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggle(i)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      on ? "border-brand/40 bg-brand-soft/40" : "border-line bg-surface2 opacity-70"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        on ? "border-brand bg-brand text-white" : "border-line2"
                      }`}
                    >
                      {on && <Check size={12} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-semibold text-night">{r.title}</span>
                        <span className="font-mono text-[10px] text-haze">{r.module || "?"}</span>
                        <span className="text-[10px] font-semibold uppercase text-haze">{r.type}</span>
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-dusk">
                        {shortDate(r.dueDate)} · {relativeDue(r.dueDate)} · {r.weight}% · ~{r.estHours}h
                      </span>
                    </span>
                    <span
                      className="shrink-0 font-mono text-[10px] text-haze"
                      title="extraction confidence"
                    >
                      {Math.round(r.confidence * 100)}%
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex justify-between gap-2">
              <button
                onClick={() => setRows(null)}
                className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-dusk transition hover:text-night active:scale-95"
              >
                Back
              </button>
              <button
                onClick={confirm}
                disabled={picked.size === 0}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-deep active:scale-95 disabled:opacity-40 disabled:shadow-none"
              >
                Import {picked.size} & schedule
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
