import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { Assignment } from "../types";
import { analyzeLoad, burnoutAdvice } from "../lib/burnout";

const levelBar: Record<string, string> = {
  overload: "bg-berry",
  busy: "bg-warm",
  calm: "bg-grass",
};
const levelChip: Record<string, string> = {
  overload: "border-berry/30 bg-berry-soft text-berry-deep",
  busy: "border-warm/30 bg-warm-soft text-warm-deep",
  calm: "border-grass/30 bg-grass-soft text-grass-deep",
};

export default function BurnoutRadar({ assignments }: { assignments: Assignment[] }) {
  const weeks = analyzeLoad(assignments).slice(0, 5);
  const worst = weeks.find((w) => w.level === "overload");
  const maxWeight = Math.max(40, ...weeks.map((w) => w.totalWeight));

  return (
    <div
      className={`rounded-2xl border bg-surface p-5 shadow-soft ${
        worst ? "border-berry/30" : "border-line"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold tracking-tightish text-night">
          {worst ? (
            <AlertTriangle size={18} className="text-berry" />
          ) : (
            <ShieldCheck size={18} className="text-grass" />
          )}
          Burnout radar
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-haze">
          next 5 weeks
        </span>
      </div>

      {worst ? (
        <p className="mt-2 text-sm font-medium text-berry-deep">{burnoutAdvice(worst)}</p>
      ) : (
        <p className="mt-2 text-sm font-medium text-dusk">
          Your workload is evenly spread — no overloaded weeks ahead. Nice.
        </p>
      )}

      {weeks.length === 0 ? (
        <p className="mt-4 text-sm font-medium text-haze">No upcoming deadlines to plot.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {weeks.map((w) => (
            <div key={w.week}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-dusk">{w.label}</span>
                <span className="font-mono text-haze">
                  {w.count} tasks · {w.totalWeight}% · {w.totalHours}h
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full rounded-full ${levelBar[w.level]}`}
                  style={{ width: `${Math.min(100, (w.totalWeight / maxWeight) * 100)}%` }}
                />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {w.items.map((a) => (
                  <span
                    key={a.id}
                    className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${levelChip[w.level]}`}
                  >
                    {a.title.length > 22 ? a.title.slice(0, 21) + "…" : a.title}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
