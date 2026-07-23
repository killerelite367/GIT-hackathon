import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Timer as TimerIcon } from "lucide-react";
import type { Assignment } from "../types";
import { useStore } from "../store/StoreContext";
import { PRESET_MINUTES, xpForSession, crystalsForSession } from "../lib/focus";

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * A real countdown timer that converts focused minutes into progress, XP,
 * and Focus Crystals. This is the piece that was missing: completing an
 * assignment card is a single click, but this rewards the actual time spent.
 */
export default function FocusTimer({ assignments }: { assignments: Assignment[] }) {
  const { logFocusMinutes } = useStore();
  const [assignmentId, setAssignmentId] = useState(assignments[0]?.id ?? "");
  const [presetMinutes, setPresetMinutes] = useState<number>(PRESET_MINUTES[1]);
  const [remaining, setRemaining] = useState(presetMinutes * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number>();
  const elapsedSecRef = useRef(0);
  const remainingRef = useRef(presetMinutes * 60);

  // Keep the selection valid as assignments get completed/deleted elsewhere.
  useEffect(() => {
    if (!assignments.some((a) => a.id === assignmentId)) {
      setAssignmentId(assignments[0]?.id ?? "");
    }
  }, [assignments, assignmentId]);

  // Reset the clock whenever the preset changes while stopped.
  useEffect(() => {
    if (!running) {
      remainingRef.current = presetMinutes * 60;
      setRemaining(remainingRef.current);
      elapsedSecRef.current = 0;
    }
  }, [presetMinutes, running]);

  // Side-effectful completion lives in the interval callback itself, never
  // inside a setState updater — React 18 StrictMode can invoke updaters
  // twice, which would double-award XP/crystals if finish() ran there.
  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      remainingRef.current -= 1;
      if (remainingRef.current <= 0) {
        window.clearInterval(intervalRef.current);
        setRunning(false);
        setRemaining(0);
        elapsedSecRef.current = presetMinutes * 60;
        finish(presetMinutes);
      } else {
        elapsedSecRef.current += 1;
        setRemaining(remainingRef.current);
      }
    }, 1000);
    return () => window.clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function finish(minutes: number) {
    if (assignmentId && minutes > 0) logFocusMinutes(assignmentId, minutes);
    remainingRef.current = presetMinutes * 60;
    setRemaining(remainingRef.current);
    elapsedSecRef.current = 0;
  }

  function handleStop() {
    // Ending early still rewards the whole minutes actually spent.
    setRunning(false);
    window.clearInterval(intervalRef.current);
    const minutes = Math.floor(elapsedSecRef.current / 60);
    if (minutes >= 1) finish(minutes);
    else {
      remainingRef.current = presetMinutes * 60;
      setRemaining(remainingRef.current);
      elapsedSecRef.current = 0;
    }
  }

  function handleReset() {
    setRunning(false);
    window.clearInterval(intervalRef.current);
    remainingRef.current = presetMinutes * 60;
    setRemaining(remainingRef.current);
    elapsedSecRef.current = 0;
  }

  const selected = assignments.find((a) => a.id === assignmentId);
  const pct = 100 - (remaining / (presetMinutes * 60)) * 100;
  const previewXp = xpForSession(presetMinutes);
  const previewCrystals = crystalsForSession(presetMinutes);

  if (assignments.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5 text-center text-sm font-medium text-haze shadow-soft">
        <TimerIcon className="mx-auto mb-2" size={20} />
        No open quests to focus on — add one to start a session.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold tracking-tightish text-night">
        <TimerIcon size={18} className="text-brand" /> Focus session
      </h3>

      <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-haze">
        Studying
        <select
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
          disabled={running}
          className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm font-medium text-night outline-none focus:border-brand/50 disabled:opacity-60"
        >
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 flex items-center justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#eae7f4" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#6d49ff"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - pct / 100)}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="tabular absolute font-mono text-2xl font-bold text-night">
            {formatClock(remaining)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {PRESET_MINUTES.map((m) => (
          <button
            key={m}
            onClick={() => setPresetMinutes(m)}
            disabled={running}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:opacity-40 ${
              presetMinutes === m
                ? "border-brand/40 bg-brand-soft text-brand-deep"
                : "border-line text-dusk hover:text-night"
            }`}
          >
            {m}m
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {!running ? (
          <button
            onClick={() => setRunning(true)}
            disabled={!selected}
            className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-deep active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <Play size={14} /> Start
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 rounded-xl border border-line2 bg-surface2 px-4 py-2 text-sm font-semibold text-night transition hover:bg-line active:scale-95"
          >
            <Pause size={14} /> End & log
          </button>
        )}
        <button
          onClick={handleReset}
          title="Reset timer"
          className="flex items-center justify-center rounded-xl border border-line px-3 py-2 text-haze transition hover:text-night active:scale-95"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <p className="mt-3 text-center text-[11px] font-medium text-haze">
        A full {presetMinutes}m session earns ~{previewXp} XP · {previewCrystals} 💎
      </p>
    </div>
  );
}
