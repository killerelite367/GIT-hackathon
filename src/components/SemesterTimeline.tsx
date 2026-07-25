import { useMemo } from "react";
import type { Assignment, StudyBlock } from "../types";
import { buildTimeline } from "../lib/timeline";
import { shortDate, todayISO } from "../lib/date";
import { priorityTier } from "../lib/priority";

const tierBg: Record<string, string> = {
  high: "bg-berry",
  medium: "bg-warm",
  low: "bg-sky",
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
      <div className="mb-6 rounded-2xl border border-dashed border-line2 bg-surface/60 p-6 text-center text-sm font-medium text-haze">
        No upcoming deadlines to plot on the timeline yet.
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold tracking-tightish text-night">
          Semester timeline
        </h3>
        <span className="text-[11px] font-medium text-haze">
          {days.length} days · today → last deadline
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex items-end gap-[3px]" style={{ minWidth: `${days.length * 14}px` }}>
          {days.map((d) => {
            const isToday = d.date === today;
            const barPct = Math.round((d.hours / maxHours) * 100);
            return (
              <div key={d.date} className="flex w-[11px] shrink-0 flex-col items-center gap-1">
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
                  className="flex h-14 w-full items-end overflow-hidden rounded-sm bg-surface2"
                  title={`${shortDate(d.date)} · ${d.hours}h planned`}
                >
                  <div
                    className={`w-full rounded-sm ${isToday ? "bg-brand" : "bg-brand/35"}`}
                    style={{ height: `${barPct}%` }}
                  />
                </div>

                {/* today marker */}
                <span className={`h-1 w-1 rounded-full ${isToday ? "bg-brand" : "bg-transparent"}`} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-medium text-haze">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-berry" /> high-priority deadline
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-warm" /> medium
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sky" /> low
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-2 rounded-sm bg-brand/35" /> planned study hours
        </span>
      </div>
    </div>
  );
}
