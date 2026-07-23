import type { Assignment } from "../types";
import { Clock, Check, Pencil, Trash2, Hourglass } from "lucide-react";
import { relativeDue, daysUntil } from "../lib/date";
import { priorityTier, priorityScore } from "../lib/priority";
import { useStore } from "../store/StoreContext";

const tierStyle: Record<string, string> = {
  high: "text-neon-pink border-neon-pink/40 bg-neon-pink/10",
  medium: "text-neon-yellow border-neon-yellow/40 bg-neon-yellow/10",
  low: "text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10",
};

export default function AssignmentCard({
  a,
  onEdit,
}: {
  a: Assignment;
  onEdit: (a: Assignment) => void;
}) {
  const { completeAssignment, deleteAssignment } = useStore();
  const tier = priorityTier(a);
  const overdue = !a.completed && daysUntil(a.dueDate) < 0;

  return (
    <div
      className={`group rounded-xl border p-4 shadow-card transition duration-200 ${
        a.completed
          ? "border-edge/50 bg-panel2/30 opacity-55"
          : "border-edge bg-panel2/70 hover:-translate-y-0.5 hover:border-neon-green/40 hover:shadow-glow"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-white/60">
              {a.module || "—"}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-white/55">
              {a.type}
            </span>
            {!a.completed && (
              <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-white/40">
                P{priorityScore(a)}
              </span>
            )}
          </div>
          <h4
            className={`mt-2 font-medium ${
              a.completed ? "text-white/50 line-through" : "text-white"
            }`}
          >
            {a.title}
          </h4>
        </div>
        {!a.completed && (
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${tierStyle[tier]}`}
          >
            {tier}
          </span>
        )}
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-cyan shadow-[0_0_10px_-2px_rgba(124,255,107,0.6)] transition-[width] duration-500 ease-out"
          style={{ width: `${a.progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-white/50">
        <span
          className={`flex items-center gap-1 ${
            overdue ? "text-neon-pink" : ""
          }`}
        >
          <Clock size={13} /> {a.completed ? "completed" : relativeDue(a.dueDate)}
        </span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-white/55">
            <Hourglass size={12} /> {a.estHours}h
          </span>
          {a.progress}% · {a.weight}%
        </span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        {!a.completed && (
          <button
            onClick={() => completeAssignment(a.id)}
            className="flex items-center gap-1 rounded-lg border border-neon-green/40 bg-neon-green/10 px-2.5 py-1 text-xs font-medium text-neon-green transition hover:bg-neon-green/20"
          >
            <Check size={13} /> Complete
          </button>
        )}
        <button
          onClick={() => onEdit(a)}
          aria-label={`Edit ${a.title}`}
          className="flex items-center gap-1 rounded-lg border border-edge px-2.5 py-1 text-xs text-white/60 transition hover:border-white/30 hover:text-white"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={() => deleteAssignment(a.id)}
          aria-label={`Delete ${a.title}`}
          className="ml-auto flex items-center gap-1 rounded-lg border border-edge px-2.5 py-1 text-xs text-white/40 transition hover:border-neon-pink/40 hover:text-neon-pink"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
