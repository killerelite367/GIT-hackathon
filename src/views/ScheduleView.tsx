import { RefreshCw, Check, CalendarDays, Flame } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { shortDate, todayISO, daysUntil } from "../lib/date";
import { DAILY_CAP } from "../lib/scheduler";

export default function ScheduleView() {
  const { data, regenerateSchedule, toggleBlockDone } = useStore();
  const { blocks, assignments } = data;

  const titleOf = (id: string) =>
    assignments.find((a) => a.id === id)?.title ?? "Unknown task";
  const moduleOf = (id: string) =>
    assignments.find((a) => a.id === id)?.module ?? "";

  // Group blocks by day.
  const byDay = new Map<string, typeof blocks>();
  for (const b of [...blocks].sort((a, c) => a.date.localeCompare(c.date))) {
    (byDay.get(b.date) ?? byDay.set(b.date, []).get(b.date)!).push(b);
  }
  const days = [...byDay.keys()];

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neon-cyan/25 bg-gradient-to-br from-neon-cyan/[0.06] to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan shadow-glow-cyan">
            <CalendarDays size={20} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tightish text-white">
              Auto-scheduled study plan
            </h2>
            <p className="text-sm text-white/50">
              Effort spread backward from each deadline · max {DAILY_CAP}h per task
              per day
            </p>
          </div>
        </div>
        <button
          onClick={regenerateSchedule}
          className="flex items-center gap-2 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-2 text-sm font-medium text-neon-cyan transition hover:scale-105 hover:bg-neon-cyan/20 active:scale-95"
        >
          <RefreshCw size={15} /> Regenerate
        </button>
      </div>

      {days.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-edge bg-panel2/30 p-10 text-center text-white/50">
          <CalendarDays className="mx-auto mb-3 text-white/30" size={28} />
          No study blocks yet. Add an assignment or import a syllabus and a plan
          appears here automatically.
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day, di) => {
            const items = byDay.get(day)!;
            const total = items.reduce((s, b) => s + b.hours, 0);
            const doneCount = items.filter((b) => b.done).length;
            const pct = Math.round((doneCount / items.length) * 100);
            const isToday = day === todayISO();
            const d = daysUntil(day);
            const heavy = total >= DAILY_CAP * 2; // a genuinely loaded day
            return (
              <div
                key={day}
                className={`animate-rise rounded-2xl border p-4 transition hover:border-white/20 ${
                  isToday
                    ? "border-neon-green/40 bg-neon-green/[0.04] shadow-glow"
                    : "border-edge bg-panel/70"
                }`}
                style={{ animationDelay: `${di * 60}ms` }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-display font-semibold text-white">
                    {shortDate(day)}
                    {isToday && (
                      <span className="rounded-full border border-neon-green/40 bg-neon-green/10 px-2 py-0.5 text-[10px] uppercase text-neon-green shadow-[0_0_10px_-2px_rgba(124,255,107,0.6)]">
                        today
                      </span>
                    )}
                    {!isToday && d > 0 && (
                      <span className="text-xs font-normal text-white/40">
                        in {d}d
                      </span>
                    )}
                    {heavy && (
                      <span className="flex items-center gap-1 rounded-full border border-neon-pink/40 bg-neon-pink/10 px-2 py-0.5 text-[10px] uppercase text-neon-pink">
                        <Flame size={10} /> heavy
                      </span>
                    )}
                  </h3>
                  <span className="font-mono text-xs text-white/40">
                    {Math.round(total * 10) / 10}h planned
                  </span>
                </div>

                {/* day progress bar */}
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-cyan transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="space-y-2">
                  {items.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => toggleBlockDone(b.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition active:scale-[0.99] ${
                        b.done
                          ? "border-neon-green/30 bg-neon-green/5 opacity-60"
                          : "border-edge bg-panel2/50 hover:border-neon-cyan/40 hover:bg-panel2/80"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                          b.done
                            ? "border-neon-green bg-neon-green/20 text-neon-green"
                            : "border-white/30"
                        }`}
                      >
                        {b.done && <Check size={12} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm ${
                            b.done ? "text-white/50 line-through" : "text-white"
                          }`}
                        >
                          {titleOf(b.assignmentId)}
                        </span>
                        <span className="font-mono text-[10px] text-white/40">
                          {moduleOf(b.assignmentId)}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-xs text-neon-cyan">
                        {b.hours}h
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
