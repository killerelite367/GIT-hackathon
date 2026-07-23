/**
 * Thin wrapper over the browser Notification API. This is an honest, scoped
 * implementation of "intelligent reminders": it can only fire while the tab
 * is open (no service worker / push infra is wired up), so it nudges once
 * per day when the app is opened, rather than promising background push it
 * can't deliver.
 */

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

export function showReminder(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.svg", tag: "studyquest-daily" });
  } catch {
    // Some browsers (notably iOS Safari) throw on direct construction; ignore.
  }
}
