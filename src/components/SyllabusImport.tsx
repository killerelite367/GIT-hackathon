import { useState } from "react";
import { Wand2, X, FileText, Check, ScanLine, ClipboardType, Sparkles } from "lucide-react";
import { parseSyllabus, SAMPLE_SYLLABUS, type ParsedAssignment } from "../lib/parser";
import type { ScannedGrade, ScanResult } from "../lib/vision";
import { shortDate, relativeDue } from "../lib/date";
import { useStore } from "../store/StoreContext";
import DocumentScan from "./DocumentScan";

/**
 * Import assignments two ways, into one review step:
 *   - Paste  → the offline heuristic parser (`lib/parser`)
 *   - Scan   → a photo read by Gemini (`lib/vision`)
 * Both produce `ParsedAssignment[]`, so the confirm list, the auto-scheduler,
 * and everything downstream stay identical. A scan can additionally return
 * module scores, which are shown as their own confirm rows.
 */

type Tab = "paste" | "scan";

export default function SyllabusImport({
  onClose,
  onGoToSettings,
  initialTab = "paste",
}: {
  onClose: () => void;
  onGoToSettings: () => void;
  initialTab?: Tab;
}) {
  const { data, importParsed, updateModule } = useStore();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [text, setText] = useState("");

  // ── Shared review state ──
  const [rows, setRows] = useState<ParsedAssignment[] | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [grades, setGrades] = useState<ScannedGrade[]>([]);
  const [pickedGrades, setPickedGrades] = useState<Set<number>>(new Set());
  const [source, setSource] = useState<string>("");

  const knownModules = data.modules.map((m) => m.code);

  const showRows = (parsed: ParsedAssignment[], foundGrades: ScannedGrade[], note: string) => {
    setRows(parsed);
    setPicked(new Set(parsed.map((_, i) => i)));
    // Only offer scores for modules that actually exist in the account.
    const usable = foundGrades.filter((g) => knownModules.includes(g.module));
    setGrades(usable);
    setPickedGrades(new Set(usable.map((_, i) => i)));
    setSource(note);
  };

  const runPaste = () => showRows(parseSyllabus(text), [], "");

  const onScanned = (r: ScanResult) =>
    showRows(
      r.assignments,
      r.grades,
      r.note || `Read a ${r.documentType}.`
    );

  const backToInput = () => {
    setRows(null);
    setGrades([]);
    setSource("");
  };

  const toggle = (i: number) =>
    setPicked((p) => {
      const n = new Set(p);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const toggleGrade = (i: number) =>
    setPickedGrades((p) => {
      const n = new Set(p);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const confirm = () => {
    if (!rows) return;
    const chosen = rows.filter((_, i) => picked.has(i));
    if (chosen.length) importParsed(chosen);
    for (const [i, g] of grades.entries()) {
      if (pickedGrades.has(i)) updateModule(g.module, { grade: g.score });
    }
    onClose();
  };

  const totalPicked = picked.size + pickedGrades.size;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-night/30 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Import assignments"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl animate-popin flex-col rounded-t-3xl border border-line bg-surface p-6 shadow-pop sm:rounded-3xl"
      >
        <div className="mb-1 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-night">
            <Wand2 size={18} className="text-brand" /> Import assignments
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-haze transition hover:text-night">
            <X size={18} />
          </button>
        </div>

        {!rows ? (
          <>
            <p className="mb-4 text-sm text-dusk">
              Photograph or paste a module guide, brief, or Brightspace announcement.
              StudyQuest extracts every deadline, weightage, and effort estimate — then
              auto-schedules them. No manual entry.
            </p>

            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Import method"
              className="mb-4 flex gap-1 rounded-xl border border-line bg-surface2 p-1"
            >
              {(
                [
                  { id: "scan", label: "Scan a photo", icon: <ScanLine size={14} /> },
                  { id: "paste", label: "Paste text", icon: <ClipboardType size={14} /> },
                ] as const
              ).map((o) => (
                <button
                  key={o.id}
                  role="tab"
                  aria-selected={tab === o.id}
                  onClick={() => setTab(o.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    tab === o.id
                      ? "bg-brand text-white shadow-brand"
                      : "text-dusk hover:text-night"
                  }`}
                >
                  {o.icon}
                  {o.label}
                </button>
              ))}
            </div>

            {tab === "scan" ? (
              <DocumentScan
                knownModules={knownModules}
                onResult={onScanned}
                onGoToSettings={onGoToSettings}
              />
            ) : (
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
                    onClick={runPaste}
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
            )}
          </>
        ) : rows.length === 0 && grades.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface2 p-6 text-center text-sm text-dusk">
            {source ||
              "No deadlines or weightages found. Try text with dates (e.g. “27 Jul”) or percentages."}
            <div className="mt-4">
              <button
                onClick={backToInput}
                className="rounded-xl border border-line px-4 py-2 font-medium text-dusk hover:text-night"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <>
            {source && (
              <p className="mb-3 flex items-start gap-2 rounded-xl border border-brand/30 bg-brand-soft/40 px-3 py-2 text-xs text-dusk">
                <Sparkles size={13} className="mt-0.5 shrink-0 text-brand-deep" />
                <span>{source}</span>
              </p>
            )}
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-haze">
              Found {rows.length + grades.length} — pick what to import
            </p>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {rows.map((r, i) => {
                const on = picked.has(i);
                return (
                  <button
                    key={`a${i}`}
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

              {grades.map((g, i) => {
                const on = pickedGrades.has(i);
                const current = data.modules.find((m) => m.code === g.module)?.grade;
                return (
                  <button
                    key={`g${i}`}
                    onClick={() => toggleGrade(i)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      on ? "border-grass/40 bg-grass-soft" : "border-line bg-surface2 opacity-70"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        on ? "border-grass bg-grass text-white" : "border-line2"
                      }`}
                    >
                      {on && <Check size={12} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-semibold text-night">{g.label}</span>
                        <span className="font-mono text-[10px] text-haze">{g.module}</span>
                        <span className="text-[10px] font-semibold uppercase text-grass-deep">
                          score
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-dusk">
                        {current != null ? `${current}% → ` : "Set to "}
                        <span className="font-mono font-bold text-grass-deep">{g.score}%</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex justify-between gap-2">
              <button
                onClick={backToInput}
                className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-dusk transition hover:text-night active:scale-95"
              >
                Back
              </button>
              <button
                onClick={confirm}
                disabled={totalPicked === 0}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-deep active:scale-95 disabled:opacity-40 disabled:shadow-none"
              >
                Import {totalPicked} & schedule
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
