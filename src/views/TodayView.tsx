import { Check, Clock, ChevronRight, PartyPopper, Timer } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { daysUntil, todayISO, shortDate } from "../lib/date";

export default function TodayView({ onFocus }: { onFocus: (id?: string) => void }) {
  const { data, completeAssignment } = useStore();
  const { assignments } = data;

  const today = todayISO();
  // What you planned for today in the Planner's "This week" view.
  const planned = assignments.filter((a) => !a.completed && a.targetDate === today);
  // Anything due today that you didn't plan for — surfaced separately so it isn't lost.
  const dueUnplanned = assignments.filter(
    (a) => !a.completed && a.targetDate !== today && daysUntil(a.dueDate) === 0
  );

  const nothingToday = planned.length === 0 && dueUnplanned.length === 0;

  return (
    <section className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold tracking-tightish text-night">
            Today's plan
          </h3>
          <span className="text-[11px] font-medium text-haze">{shortDate(today)}</span>
        </div>

        {nothingToday ? (
          <div className="mt-6 py-6 text-center">
            <PartyPopper size={26} className="mx-auto text-grass" />
            <p className="mt-3 text-sm text-dusk">Nothing planned for today. Enjoy the breather.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {planned.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface2 p-2.5"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-night">
                  {a.title}
                </span>
                <button
                  onClick={() => onFocus(a.id)}
                  className="flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-[11px] font-semibold text-brand-deep transition hover:bg-brand-soft"
                >
                  <Timer size={12} /> Focus
                </button>
                <button
                  onClick={() => completeAssignment(a.id)}
                  className="flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-[11px] font-semibold text-grass-deep transition hover:bg-grass-soft"
                >
                  <Check size={12} /> Done
                </button>
              </div>
            ))}

            {dueUnplanned.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-warm/30 bg-warm-soft/40 p-2.5"
              >
                <Clock size={15} className="shrink-0 text-warm-deep" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-night">
                  {a.title}
                </span>
                <span className="shrink-0 text-[11px] font-bold uppercase text-warm-deep">due, unplanned</span>
                <button
                  onClick={() => onFocus(a.id)}
                  className="flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-[11px] font-semibold text-brand-deep transition hover:bg-brand-soft"
                >
                  <Timer size={12} /> Focus
                </button>
                <button
                  onClick={() => completeAssignment(a.id)}
                  className="flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-[11px] font-semibold text-grass-deep transition hover:bg-grass-soft"
                >
                  <Check size={12} /> Done
                </button>
              </div>
            ))}
          </div>
        )}

        {!nothingToday && (
          <button
            onClick={() => onFocus((planned[0] ?? dueUnplanned[0])?.id)}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface2 py-2 text-sm font-semibold text-brand-deep transition hover:bg-brand-soft active:scale-95"
          >
            Start a focus session
            <ChevronRight size={15} />
          </button>
        )}
      </div>
    </section>
  );
}
