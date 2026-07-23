import { Timer, Check, Plus, Wand2, Clock, AlertTriangle, PartyPopper, ChevronRight } from "lucide-react";
import type { Assignment } from "../types";
import Button from "../components/Button";
import AssignmentCard from "../components/AssignmentCard";
import { useStore } from "../store/StoreContext";
import { byPriority, priorityReason } from "../lib/priority";
import { computeGpa } from "../lib/gpa";
import { levelProgress } from "../lib/gamification";
import { daysUntil, todayISO, shortDate } from "../lib/date";

export default function TodayView({
  onAdd,
  onEdit,
  onImport,
  onFocus,
}: {
  onAdd: () => void;
  onEdit: (a: Assignment) => void;
  onImport: () => void;
  onFocus: (id?: string) => void;
}) {
  const { data, completeAssignment, toggleBlockDone } = useStore();
  const { assignments, blocks, modules, game } = data;

  const open = assignments.filter((a) => !a.completed).sort(byPriority);
  const top = open[0] ?? null;
  const rest = open.slice(1);

  const overdue = open.filter((a) => daysUntil(a.dueDate) < 0);
  const today = todayISO();
  const todayBlocks = blocks
    .filter((b) => b.date === today)
    .sort((a, b) => b.hours - a.hours);
  const dueToday = open.filter((a) => daysUntil(a.dueDate) === 0);

  const gpa = computeGpa(modules);
  const lp = levelProgress(game.xp);
  const doneCount = assignments.filter((a) => a.completed).length;
  const donePct = Math.round((doneCount / (assignments.length || 1)) * 100);
  const titleOf = (id: string) => assignments.find((a) => a.id === id)?.title ?? "Task";

  const stats = [
    { label: "Streak", value: `${game.streakDays}d`, tone: "text-warm-deep" },
    { label: "Level", value: `${lp.level}`, tone: "text-brand-deep" },
    { label: "Done", value: `${donePct}%`, tone: "text-grass-deep" },
    { label: "GPA", value: gpa.toFixed(2), tone: "text-sky-deep" },
  ];

  return (
    <div className="space-y-6">
      {/* Urgent alert — only when something is actually overdue */}
      {overdue.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-berry/30 bg-berry-soft/50 px-4 py-3">
          <AlertTriangle size={18} className="shrink-0 text-berry" />
          <p className="text-sm font-semibold text-berry-deep">
            {overdue.length} quest{overdue.length > 1 ? "s" : ""} overdue —{" "}
            <span className="font-bold">{overdue[0].title}</span> needs attention.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Focal column: what to do now ── */}
        <div className="space-y-6 lg:col-span-2">
          {top ? (
            <section className="overflow-hidden rounded-3xl border border-brand/20 bg-surface shadow-raised">
              <div className="bg-brand-soft/60 px-6 pt-5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-deep">
                  <Timer size={13} /> Up next
                </p>
              </div>
              <div className="px-6 pb-6 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-surface2 px-2 py-0.5 font-mono text-[11px] font-medium text-dusk">
                    {top.module}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-haze">
                    {top.type}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-night">
                  {top.title}
                </h2>
                <p className="mt-1 text-sm font-medium text-dusk">{priorityReason(top)}</p>

                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-grass transition-[width] duration-700 ease-out"
                    style={{ width: `${top.progress}%` }}
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Button variant="primary" size="lg" icon={<Timer size={16} />} onClick={() => onFocus(top.id)}>
                    Start focus session
                  </Button>
                  <Button variant="secondary" size="lg" icon={<Check size={16} />} onClick={() => completeAssignment(top.id)}>
                    Mark done
                  </Button>
                  <Button variant="ghost" size="lg" onClick={() => onEdit(top)}>
                    Edit
                  </Button>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-3xl border border-dashed border-line2 bg-surface/60 p-10 text-center">
              <PartyPopper size={28} className="mx-auto text-grass" />
              <h2 className="mt-3 font-display text-xl font-bold text-night">All caught up!</h2>
              <p className="mt-1 text-sm text-dusk">
                No open quests. Import a syllabus or add one to plan ahead.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button variant="primary" icon={<Wand2 size={15} />} onClick={onImport}>
                  Import syllabus
                </Button>
                <Button variant="secondary" icon={<Plus size={15} />} onClick={onAdd}>
                  Add quest
                </Button>
              </div>
            </section>
          )}

          {/* The rest of the queue */}
          {rest.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold tracking-tightish text-night">
                  Up after that
                  <span className="ml-2 text-sm font-medium text-haze">{rest.length}</span>
                </h3>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" icon={<Wand2 size={14} />} onClick={onImport}>
                    Import
                  </Button>
                  <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
                    Add quest
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {rest.map((a) => (
                  <AssignmentCard key={a.id} a={a} onEdit={onEdit} onFocus={onFocus} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Support column: today's plan + at-a-glance ── */}
        <div className="space-y-6">
          {/* At-a-glance status strip — secondary, compact */}
          <section className="grid grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-soft">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface px-2 py-3 text-center">
                <div className={`font-display text-lg font-bold tabular ${s.tone}`}>{s.value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-haze">
                  {s.label}
                </div>
              </div>
            ))}
          </section>

          {/* Today's plan */}
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold tracking-tightish text-night">
                Today's plan
              </h3>
              <span className="text-[11px] font-medium text-haze">{shortDate(today)}</span>
            </div>

            {todayBlocks.length === 0 && dueToday.length === 0 ? (
              <p className="mt-3 text-sm text-dusk">
                Nothing scheduled for today — enjoy the breather, or get ahead on Up next.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {todayBlocks.map((b) => (
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
                    <span
                      className={`min-w-0 flex-1 truncate text-sm font-medium ${
                        b.done ? "text-haze line-through" : "text-night"
                      }`}
                    >
                      {titleOf(b.assignmentId)}
                    </span>
                    <span className="shrink-0 font-mono text-xs font-semibold text-brand-deep">
                      {b.hours}h
                    </span>
                  </button>
                ))}
                {dueToday.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-xl border border-warm/30 bg-warm-soft/40 p-2.5"
                  >
                    <Clock size={15} className="shrink-0 text-warm-deep" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-night">
                      {a.title}
                    </span>
                    <span className="shrink-0 text-[11px] font-bold uppercase text-warm-deep">
                      due
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => onFocus(top?.id)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface2 py-2 text-sm font-semibold text-brand-deep transition hover:bg-brand-soft active:scale-95"
            >
              Start a focus session
              <ChevronRight size={15} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
