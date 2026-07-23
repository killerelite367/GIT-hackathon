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

  return (
    <section
      className={`rounded-2xl border p-5 shadow-card transition ${
        briefing.overdue.length > 0 ? "border-neon-pink/25 bg-panel/70" : "border-edge bg-panel/70"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              briefing.allClear
                ? "bg-neon-green/10 text-neon-green"
                : briefing.overdue.length > 0
                ? "bg-neon-pink/10 text-neon-pink"
                : "bg-white/[0.06] text-white/60"
            }`}
          >
            {briefing.allClear ? <CheckCircle2 size={18} /> : <AlarmClock size={18} />}
          </span>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
              Today's briefing
            </p>
            <p className="mt-1 text-[15px] font-medium text-white">{headline}</p>
            {briefing.todayHours > 0 && (
              <p className="mt-0.5 text-xs text-white/50">
                {briefing.todayHours}h of study planned for today
              </p>
            )}
            {briefing.burnoutWarning && (
              <p className="mt-0.5 text-xs text-neon-pink/80">⚠ {briefing.burnoutWarning}</p>
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
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              game.remindersEnabled
                ? "border-neon-green/40 bg-neon-green/10 text-neon-green"
                : "border-edge text-white/50 hover:border-edge2 hover:text-white"
            }`}
          >
            {game.remindersEnabled ? <Bell size={13} /> : <BellOff size={13} />}
            {game.remindersEnabled ? "Reminders on" : "Enable reminders"}
          </button>
        )}
      </div>

      {(briefing.overdue.length > 0 || briefing.dueToday.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-edge pt-3">
          {[...briefing.overdue, ...briefing.dueToday].slice(0, 4).map((a) => (
            <span
              key={a.id}
              className={`flex items-center gap-1.5 text-[11px] ${
                daysUntilOverdue(a.dueDate) ? "text-neon-pink/90" : "text-white/55"
              }`}
            >
              <span
                className={`h-1 w-1 rounded-full ${
                  daysUntilOverdue(a.dueDate) ? "bg-neon-pink" : "bg-white/40"
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
