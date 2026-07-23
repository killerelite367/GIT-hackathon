import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { Assignment } from "../types";
import { analyzeLoad, burnoutAdvice } from "../lib/burnout";

const levelStyle: Record<string, string> = {
  overload: "border-neon-pink/40 bg-neon-pink/10 text-neon-pink",
  busy: "border-neon-yellow/40 bg-neon-yellow/10 text-neon-yellow",
  calm: "border-neon-green/30 bg-neon-green/5 text-neon-green",
};

export default function BurnoutRadar({ assignments }: { assignments: Assignment[] }) {
  const weeks = analyzeLoad(assignments).slice(0, 5);
  const worst = weeks.find((w) => w.level === "overload");
  const maxWeight = Math.max(40, ...weeks.map((w) => w.totalWeight));

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        worst ? "border-neon-pink/30 shadow-glow" : "border-edge"
      } bg-panel/70`}
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          {worst ? (
            <AlertTriangle size={18} className="animate-glowpulse text-neon-pink" />
          ) : (
            <ShieldCheck size={18} className="text-neon-green" />
          )}
          Burnout radar
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">
          next 5 weeks
        </span>
      </div>

      {worst ? (
        <p className="mt-2 text-sm text-neon-pink/90">{burnoutAdvice(worst)}</p>
      ) : (
        <p className="mt-2 text-sm text-white/50">
          Your workload is evenly spread — no overloaded weeks ahead. Nice.
        </p>
      )}

      {weeks.length === 0 ? (
        <p className="mt-4 text-sm text-white/40">No upcoming deadlines to plot.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {weeks.map((w) => (
            <div key={w.week}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">{w.label}</span>
                <span className="font-mono text-white/55">
                  {w.count} tasks · {w.totalWeight}% · {w.totalHours}h
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${
                    w.level === "overload"
                      ? "bg-neon-pink"
                      : w.level === "busy"
                      ? "bg-neon-yellow"
                      : "bg-neon-green"
                  }`}
                  style={{ width: `${Math.min(100, (w.totalWeight / maxWeight) * 100)}%` }}
                />
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {w.items.map((a) => (
                  <span
                    key={a.id}
                    className={`rounded border px-1.5 py-0.5 text-[10px] ${levelStyle[w.level]}`}
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
