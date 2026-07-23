import { useEffect, useRef } from "react";
import { useStore } from "../store/StoreContext";
import { buildBriefing, briefingHeadline } from "./briefing";
import { todayISO } from "./date";
import { notificationPermission, showReminder } from "./notify";

/**
 * Headless: fires the once-a-day in-tab reminder when the user has opted in.
 * Lives at the app root so it runs regardless of which screen is showing
 * (the reminders toggle now lives in Settings, not on a dashboard widget).
 */
export function useDailyReminder() {
  const { data, setReminders } = useStore();
  const { assignments, blocks, game } = data;
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (!game.remindersEnabled) return;
    if (notificationPermission() !== "granted") return;
    if (game.lastReminderDate === todayISO()) return;
    const briefing = buildBriefing(assignments, blocks);
    if (briefing.allClear) return;
    firedRef.current = true;
    showReminder("StudyQuest", briefingHeadline(briefing));
    setReminders(true, todayISO());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.remindersEnabled, game.lastReminderDate]);
}
