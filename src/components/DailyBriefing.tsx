import { useEffect, useRef } from "react";
import { AlarmClock, Bell, BellOff, CheckCircle2 } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { buildBriefing, briefingHeadline } from "../lib/briefing";
import { relativeDue, todayISO } from "../lib/date";
import {
  notificationsSupported,
  notificationPermission,
  requestNotificationPermission,
  showReminder,
} from "../lib/notify";

export default function DailyBriefing() {
  const { data, setReminders } = useStore();
  const { assignments, blocks, game } = data;
  const briefing = buildBriefing(assignments, blocks);
  const headline = briefingHeadline(briefing);
  const firedRef = useRef(false);

  // Fire an in-tab reminder once per day when there's something to flag —
  // only ever runs if the user opted in and granted permission.
  useEffect(() => {
    if (firedRef.current) return;
    if (!game.remindersEnabled) return;
    if (notificationPermission() !== "granted") return;
    if (game.lastReminderDate === todayISO()) return;
    if (briefing.allClear) return;
    firedRef.current = true;
    showReminder("StudyQuest", headline);
    setReminders(true, todayISO());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.remindersEnabled, game.lastReminderDate]);

  const handleToggle = async () => {
    if (game.remindersEnabled) {
      setReminders(false);
      return;
    }
    const granted = await requestNotificationPermission();
    setReminders(granted);
  };

  const supported = notificationsSupported();
  const denied = notificationPermission() === "denied";

  const chip = briefing.allClear
    ? "bg-grass-soft text-grass-deep"
    : briefing.overdue.length > 0
    ? "bg-berry-soft text-berry-deep"
    : "bg-brand-soft text-brand";

  return (
    <section
      className={`rounded-2xl border p-5 shadow-soft ${
        briefing.overdue.length > 0 ? "border-berry/30 bg-berry-soft/40" : "border-line bg-surface"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${chip}`}>
            {briefing.allClear ? <CheckCircle2 size={20} /> : <AlarmClock size={20} />}
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-haze">
              Today's briefing
            </p>
            <p className="mt-1 text-[15px] font-semibold text-night">{headline}</p>
            {briefing.todayHours > 0 && (
              <p className="mt-0.5 text-xs font-medium text-dusk">
                {briefing.todayHours}h of study planned for today
              </p>
            )}
            {briefing.burnoutWarning && (
              <p className="mt-0.5 text-xs font-medium text-berry-deep">⚠ {briefing.burnoutWarning}</p>
            )}
          </div>
        </div>

        {supported && !denied && (
          <button
            onClick={handleToggle}
            title={
              game.remindersEnabled
                ? "Turn off daily reminders"
                : "Get a browser reminder once a day when something needs attention"
            }
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
              game.remindersEnabled
                ? "border-brand/40 bg-brand-soft text-brand-deep"
                : "border-line bg-surface text-dusk hover:border-line2 hover:text-night"
            }`}
          >
            {game.remindersEnabled ? <Bell size={13} /> : <BellOff size={13} />}
            {game.remindersEnabled ? "Reminders on" : "Enable reminders"}
          </button>
        )}
      </div>

      {(briefing.overdue.length > 0 || briefing.dueToday.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3">
          {[...briefing.overdue, ...briefing.dueToday].slice(0, 4).map((a) => (
            <span
              key={a.id}
              className={`flex items-center gap-1.5 text-[11px] font-medium ${
                daysUntilOverdue(a.dueDate) ? "text-berry-deep" : "text-dusk"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  daysUntilOverdue(a.dueDate) ? "bg-berry" : "bg-warm"
                }`}
              />
              {a.title} · {relativeDue(a.dueDate)}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function daysUntilOverdue(dueISO: string): boolean {
  return relativeDue(dueISO).startsWith("overdue");
}
