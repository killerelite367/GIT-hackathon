import type { Assignment } from "../types";
import { Clock } from "lucide-react";

const priorityColor: Record<Assignment["priority"], string> = {
  high: "text-neon-pink border-neon-pink/40 bg-neon-pink/10",
  medium: "text-neon-yellow border-neon-yellow/40 bg-neon-yellow/10",
  low: "text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10",
};

function daysLeft(due: string) {
  const ms = new Date(due).getTime() - new Date("2026-07-23").getTime();
  const d = Math.round(ms / 86400000);
  if (d < 0) return "overdue";
  if (d === 0) return "due today";
  if (d === 1) return "1 day left";
  return `${d} days left`;
}

export default function AssignmentCard({ a }: { a: Assignment }) {
  return (
    <div className="group rounded-xl border border-edge bg-panel2/60 p-4 transition hover:border-neon-green/40 hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-white/60">{a.module}</span>
            <span className="text-[11px] uppercase tracking-wider text-white/40">{a.type}</span>
          </div>
          <h4 className="mt-2 font-medium text-white">{a.title}</h4>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityColor[a.priority]}`}>
          {a.priority}
        </span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-cyan transition-all"
          style={{ width: `${a.progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-white/50">
        <span className="flex items-center gap-1">
          <Clock size={13} /> {daysLeft(a.dueDate)}
        </span>
        <span>{a.progress}% · {a.weight}% of grade</span>
      </div>
    </div>
  );
}
