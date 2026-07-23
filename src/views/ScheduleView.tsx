import { RefreshCw, Check, CalendarDays } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { shortDate, todayISO, daysUntil } from "../lib/date";
import { DAILY_CAP } from "../lib/scheduler";
import SemesterTimeline from "../components/SemesterTimeline";

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tightish text-white">
            Auto-scheduled study plan
          </h2>
          <p className="text-sm text-white/50">
            Effort spread backward from each deadline · max {DAILY_CAP}h per task
            per day
          </p>
        </div>
        <button
          onClick={regenerateSchedule}
          className="flex items-center gap-2 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-2 text-sm font-medium text-neon-cyan transition hover:bg-neon-cyan/20"
        >
          <RefreshCw size={15} /> Regenerate
        </button>
      </div>

      <SemesterTimeline assignments={assignments} blocks={blocks} />

      {days.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge bg-panel2/30 p-10 text-center text-white/50">
          <CalendarDays className="mx-auto mb-3 text-white/30" size={28} />
          No study blocks yet. Add an assignment or import a syllabus and a plan
          appears here automatically.
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const items = byDay.get(day)!;
            const total = items.reduce((s, b) => s + b.hours, 0);
            const isToday = day === todayISO();
            const d = daysUntil(day);
            return (
              <div
                key={day}
                className="rounded-2xl border border-edge bg-panel/70 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-display font-semibold text-white">
                    {shortDate(day)}
                    {isToday && (
                      <span className="rounded-full border border-neon-green/40 bg-neon-green/10 px-2 py-0.5 text-[10px] uppercase text-neon-green">
                        today
                      </span>
                    )}
                    {!isToday && d > 0 && (
                      <span className="text-xs font-normal text-white/40">
                        in {d}d
                      </span>
                    )}
                  </h3>
                  <span className="font-mono text-xs text-white/40">
                    {Math.round(total * 10) / 10}h planned
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => toggleBlockDone(b.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition ${
                        b.done
                          ? "border-neon-green/30 bg-neon-green/5 opacity-60"
                          : "border-edge bg-panel2/50 hover:border-white/20"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
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
