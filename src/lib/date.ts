/** Small date helpers. Everything works in local time and ISO day strings. */

const MS_PER_DAY = 86_400_000;

/** Today as an ISO day string (YYYY-MM-DD) in local time. */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Convert a Date to a YYYY-MM-DD string in local time. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a YYYY-MM-DD string as a local midnight Date. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Whole days from `a` to `b` (b - a). Negative if b is before a. */
export function daysBetween(aISO: string, bISO: string): number {
  const a = fromISODate(aISO).getTime();
  const b = fromISODate(bISO).getTime();
  return Math.round((b - a) / MS_PER_DAY);
}

/** Days remaining from today until the given ISO date. */
export function daysUntil(iso: string): number {
  return daysBetween(todayISO(), iso);
}

/** Add n days to an ISO date, returning a new ISO date. */
export function addDays(iso: string, n: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Human "3 days left" / "due today" / "overdue by 2 days". */
export function relativeDue(iso: string): string {
  const d = daysUntil(iso);
  if (d < -1) return `overdue by ${-d} days`;
  if (d === -1) return "overdue by 1 day";
  if (d === 0) return "due today";
  if (d === 1) return "1 day left";
  return `${d} days left`;
}

/** Short label like "Mon 27 Jul". */
export function shortDate(iso: string): string {
  const d = fromISODate(iso);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * ISO week key "YYYY-Www" for grouping (Mon-based).
 * Good enough for burnout clustering by calendar week.
 */
export function weekKey(iso: string): string {
  const d = fromISODate(iso);
  // Shift to Thursday of the current week to get the ISO week number.
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3);
  const week =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY));
  return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Monday (ISO date) of the week containing `iso`. */
export function weekStart(iso: string): string {
  const d = fromISODate(iso);
  const dayNr = (d.getDay() + 6) % 7; // Mon=0
  d.setDate(d.getDate() - dayNr);
  return toISODate(d);
}
