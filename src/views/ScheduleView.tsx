import { Plus, Wand2, ScanLine, ChevronUp, ChevronDown } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { todayISO, weekStart, addDays, shortDate } from "../lib/date";
import AssignmentCard from "../components/AssignmentCard";
import Button from "../components/Button";
import type { Assignment } from "../types";

// The 7 days of this week (Monday first), plus one catch-all bucket for
// anything further out — 8 buckets total, shifted between with up/down.
const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => addDays(weekStart(todayISO()), i));
const NEXT_WEEK = null; // sentinel for "beyond this week"
const BUCKETS: (string | null)[] = [...WEEK_DAYS, NEXT_WEEK];

function bucketIndex(targetDate: string | null): number {
  if (targetDate == null) return 7;
  const i = WEEK_DAYS.indexOf(targetDate);
  return i === -1 ? 7 : i;
}

export default function ScheduleView({
  onAdd,
  onEdit,
  onImport,
  onScan,
}: {
  onAdd: () => void;
  onEdit: (a: Assignment) => void;
  onImport: () => void;
  onScan: () => void;
}) {
  const { data, updateAssignment } = useStore();
  const { assignments } = data;

  const open = assignments.filter((a) => !a.completed);

  const byBucket = new Map<number, Assignment[]>();
  for (const a of open) {
    const idx = bucketIndex(a.targetDate);
    (byBucket.get(idx) ?? byBucket.set(idx, []).get(idx)!).push(a);
  }

  const shift = (a: Assignment, delta: number) => {
    const idx = bucketIndex(a.targetDate);
    const nextIdx = Math.max(0, Math.min(7, idx + delta));
    updateAssignment(a.id, { targetDate: nextIdx === 7 ? null : WEEK_DAYS[nextIdx] });
  };

  // Every open quest, earliest deadline first — move a due date and the item
  // re-sorts up or down on its own.
  const allDeadlines = [...open].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <section className="space-y-6">
      {/* Add a quest: name + deadline, the rest is optional */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold tracking-tightish text-night">
            Add a quest
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" icon={<ScanLine size={14} />} onClick={onScan}>
              Scan
            </Button>
            <Button variant="secondary" size="sm" icon={<Wand2 size={14} />} onClick={onImport}>
              Import
            </Button>
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
              Add quest
            </Button>
          </div>
        </div>
        <p className="mt-1.5 text-sm text-dusk">
          New quests land on Monday — shift each one to the day you'll actually do it.
        </p>
      </div>

      {/* This week, day by day — shift a quest up/down to move it a day, or all the way to Next week */}
      <div>
        <h3 className="mb-3 font-display text-lg font-bold tracking-tightish text-night">
          This week
        </h3>
        <div className="space-y-3">
          {BUCKETS.map((day, idx) => {
            const items = byBucket.get(idx) ?? [];
            const isToday = day === todayISO();
            return (
              <div key={day ?? "later"} className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
                <div className="mb-2 flex items-center gap-2">
                  <h4 className="font-display text-sm font-bold text-night">
                    {day ? shortDate(day) : "Next week & beyond"}
                  </h4>
                  {isToday && (
                    <span className="rounded-full border border-brand/30 bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-deep">
                      today
                    </span>
                  )}
                </div>
                {items.length === 0 ? (
                  <p className="text-xs text-haze">Nothing planned</p>
                ) : (
                  <div className="space-y-1.5">
                    {items.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-2 rounded-xl border border-line bg-surface2 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-[10px] font-medium text-haze">{a.module}</span>
                          <p className="truncate text-sm font-semibold text-night">{a.title}</p>
                        </div>
                        <button
                          onClick={() => shift(a, -1)}
                          disabled={idx === 0}
                          aria-label={`Move ${a.title} to previous day`}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line text-dusk transition hover:text-night disabled:opacity-30"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          onClick={() => shift(a, 1)}
                          disabled={idx === 7}
                          aria-label={`Move ${a.title} to next day`}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line text-dusk transition hover:text-night disabled:opacity-30"
                        >
                          <ChevronDown size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Every open quest, earliest deadline first */}
      <div>
        <h3 className="mb-3 font-display text-lg font-bold tracking-tightish text-night">
          All deadlines
          <span className="ml-2 text-sm font-medium text-haze">{allDeadlines.length}</span>
        </h3>
        {allDeadlines.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line2 bg-surface/60 p-6 text-center text-sm text-dusk">
            No open quests yet — add one above.
          </p>
        ) : (
          <div className="space-y-3">
            {allDeadlines.map((a) => (
              <AssignmentCard key={a.id} a={a} onEdit={onEdit} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
