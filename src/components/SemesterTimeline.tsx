import { useMemo } from "react";
import type { Assignment, StudyBlock } from "../types";
import { buildTimeline } from "../lib/timeline";
import { shortDate, todayISO } from "../lib/date";
import { priorityTier } from "../lib/priority";

const tierBg: Record<string, string> = {
  high: "bg-neon-pink",
  medium: "bg-neon-yellow",
  low: "bg-neon-cyan",
};

/**
 * A zoomed-out, horizontally-scrolling view from today to the furthest
 * deadline: a thin bar of planned study hours per day, with deadline
 * markers stacked above. Shows workload shape across the whole semester at
 * a glance — the thing a generic calendar can't do.
 */
export default function SemesterTimeline({
  assignments,
  blocks,
}: {
  assignments: Assignment[];
  blocks: StudyBlock[];
}) {
  const days = useMemo(() => buildTimeline(assignments, blocks), [assignments, blocks]);
  const maxHours = Math.max(1, ...days.map((d) => d.hours));
  const today = todayISO();

  if (days.length === 0) {
    return (
      <div className="mb-6 rounded-2xl border border-dashed border-edge bg-panel2/30 p-6 text-center text-sm text-white/40">
        No upcoming deadlines to plot on the timeline yet.
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-edge bg-panel/70 p-5 shadow-card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold tracking-tightish text-white">
          Semester timeline
        </h3>
        <span className="text-[11px] text-white/40">
          {days.length} days · today → last deadline
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className="flex items-end gap-[3px]"
          style={{ minWidth: `${days.length * 14}px` }}
        >
          {days.map((d) => {
            const isToday = d.date === today;
            const barPct = Math.round((d.hours / maxHours) * 100);
            return (
              <div
                key={d.date}
                className="flex w-[11px] shrink-0 flex-col items-center gap-1"
              >
                {/* deadline markers, stacked above the bar */}
                <div className="flex h-5 flex-col-reverse items-center justify-start gap-0.5">
                  {d.dueItems.slice(0, 3).map((a) => (
                    <span
                      key={a.id}
                      title={`${a.title} — due ${shortDate(a.dueDate)} · ${a.weight}%`}
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${tierBg[priorityTier(a)]}`}
                    />
                  ))}
                </div>

                {/* planned-hours bar */}
                <div
                  className="flex h-14 w-full items-end overflow-hidden rounded-sm bg-white/[0.06]"
                  title={`${shortDate(d.date)} · ${d.hours}h planned`}
                >
                  <div
                    className={`w-full rounded-sm ${isToday ? "bg-neon-green" : "bg-neon-cyan/70"}`}
                    style={{ height: `${barPct}%` }}
                  />
                </div>

                {/* today marker */}
                <span
                  className={`h-1 w-1 rounded-full ${isToday ? "bg-neon-green" : "bg-transparent"}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-white/40">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-pink" /> high-priority deadline
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-yellow" /> medium
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" /> low
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-2 rounded-sm bg-neon-cyan/70" /> planned study hours
        </span>
      </div>
    </div>
  );
}
