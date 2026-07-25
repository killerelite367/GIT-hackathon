import { RefreshCw, Check, CalendarDays } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { shortDate, todayISO, daysUntil } from "../lib/date";
import { DAILY_CAP } from "../lib/scheduler";
import SemesterTimeline from "../components/SemesterTimeline";
import BurnoutRadar from "../components/BurnoutRadar";
import Button from "../components/Button";

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
        <p className="text-sm text-dusk">
          Effort spread backward from each deadline · max {DAILY_CAP}h per task per day.
        </p>
        <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={regenerateSchedule}>
          Regenerate
        </Button>
      </div>

      <SemesterTimeline assignments={assignments} blocks={blocks} />

      <div className="mb-6">
        <BurnoutRadar assignments={assignments} />
      </div>

      {days.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line2 bg-surface/60 p-10 text-center text-dusk">
          <CalendarDays className="mx-auto mb-3 text-haze" size={28} />
          No study blocks yet. Add an assignment or import a syllabus and a plan appears here
          automatically.
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const items = byDay.get(day)!;
            const total = items.reduce((s, b) => s + b.hours, 0);
            const isToday = day === todayISO();
            const d = daysUntil(day);
            return (
              <div key={day} className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-display font-bold text-night">
                    {shortDate(day)}
                    {isToday && (
                      <span className="rounded-full border border-brand/30 bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-deep">
                        today
                      </span>
                    )}
                    {!isToday && d > 0 && (
                      <span className="text-xs font-medium text-haze">in {d}d</span>
                    )}
                  </h3>
                  <span className="font-mono text-xs font-medium text-haze">
                    {Math.round(total * 10) / 10}h planned
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => toggleBlockDone(b.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                        b.done
                          ? "border-grass/30 bg-grass-soft/50 opacity-70"
                          : "border-line bg-surface2 hover:border-line2"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          b.done ? "border-grass bg-grass text-white" : "border-line2"
                        }`}
                      >
                        {b.done && <Check size={12} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm font-medium ${
                            b.done ? "text-haze line-through" : "text-night"
                          }`}
                        >
                          {titleOf(b.assignmentId)}
                        </span>
                        <span className="font-mono text-[10px] text-haze">
                          {moduleOf(b.assignmentId)}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-xs font-semibold text-brand-deep">
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
