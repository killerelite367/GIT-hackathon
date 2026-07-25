import type { Assignment } from "../types";
import { Clock, Check, Pencil, Trash2, Hourglass, Timer } from "lucide-react";
import { relativeDue, daysUntil } from "../lib/date";
import { priorityTier, priorityScore } from "../lib/priority";
import { useStore } from "../store/StoreContext";
import Button from "./Button";

const tierDot: Record<string, string> = {
  high: "bg-berry",
  medium: "bg-warm",
  low: "bg-sky",
};
const tierText: Record<string, string> = {
  high: "text-berry-deep",
  medium: "text-warm-deep",
  low: "text-sky-deep",
};

export default function AssignmentCard({
  a,
  onEdit,
  onFocus,
}: {
  a: Assignment;
  onEdit: (a: Assignment) => void;
  onFocus?: (id: string) => void;
}) {
  const { completeAssignment, deleteAssignment } = useStore();
  const tier = priorityTier(a);
  const overdue = !a.completed && daysUntil(a.dueDate) < 0;

  return (
    <div
      className={`group rounded-2xl border p-4 transition duration-200 ${
        a.completed
          ? "border-line bg-surface/60 opacity-70"
          : "border-line bg-surface shadow-soft hover:-translate-y-0.5 hover:shadow-raised"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-surface2 px-2 py-0.5 font-mono text-[11px] font-medium text-dusk">
              {a.module || "—"}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-haze">
              {a.type}
            </span>
            {!a.completed && (
              <span className="rounded-md bg-surface2 px-1.5 py-0.5 font-mono text-[10px] font-medium text-haze">
                P{priorityScore(a)}
              </span>
            )}
          </div>
          <h4
            className={`mt-2 font-semibold ${
              a.completed ? "text-haze line-through" : "text-night"
            }`}
          >
            {a.title}
          </h4>
        </div>
        {!a.completed && (
          <span
            className={`flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${tierText[tier]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tierDot[tier]}`} />
            {tier}
          </span>
        )}
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-grass transition-[width] duration-500 ease-out"
          style={{ width: `${a.progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs font-medium">
        <span className={`flex items-center gap-1 ${overdue ? "text-berry-deep" : "text-dusk"}`}>
          <Clock size={13} /> {a.completed ? "completed" : relativeDue(a.dueDate)}
        </span>
        <span className="flex items-center gap-2 text-dusk">
          <span className="flex items-center gap-1 text-haze">
            <Hourglass size={12} /> {a.estHours}h
          </span>
          {a.progress}% · {a.weight}%
        </span>
      </div>

      {/* Actions — Focus is the primary "do the work" action, the rest recede */}
      {!a.completed && (
        <div className="mt-3 flex items-center gap-2">
          {onFocus && (
            <Button variant="primary" size="sm" icon={<Timer size={13} />} onClick={() => onFocus(a.id)}>
              Focus
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={<Check size={13} />}
            onClick={() => completeAssignment(a.id)}
          >
            Done
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${a.title}`}
            onClick={() => onEdit(a)}
            className="ml-auto !px-2 text-haze"
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Delete ${a.title}`}
            onClick={() => deleteAssignment(a.id)}
            className="!px-2 text-haze hover:!text-berry-deep"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
