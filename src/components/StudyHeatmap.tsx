import { buildHeatmap, heatmapSummary } from "../lib/heatmap";
import { dayOfWeekMon0, shortDate } from "../lib/date";

const LEVEL_CLASS = [
  "bg-line",
  "bg-brand/25",
  "bg-brand/45",
  "bg-brand/70",
  "bg-brand",
];

const WINDOW_DAYS = 91; // ~13 weeks

/**
 * GitHub-contribution-style grid of real daily effort (XP earned, which only
 * comes from completing work or a focus session). Deliberately shows the
 * underlying academic activity rather than more game decoration.
 */
export default function StudyHeatmap({
  activityLog,
}: {
  activityLog: Record<string, number>;
}) {
  const days = buildHeatmap(activityLog, WINDOW_DAYS);
  const { totalXp, activeDays } = heatmapSummary(days);

  // Pad the front so the first real day lands in its correct weekday row,
  // and pad the back so the grid completes a full last column.
  const leading = dayOfWeekMon0(days[0].date);
  const cells: (null | (typeof days)[number])[] = [...Array(leading).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold tracking-tightish text-night">Study activity</h3>
        <span className="text-[11px] font-medium text-haze">
          {activeDays} active days · {totalXp.toLocaleString()} XP in 13 weeks
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateRows: "repeat(7, 11px)",
            gridAutoFlow: "column",
            gridAutoColumns: "11px",
          }}
        >
          {cells.map((c, i) =>
            c ? (
              <div
                key={i}
                title={`${shortDate(c.date)} · ${c.value} XP`}
                className={`h-[11px] w-[11px] rounded-[2px] ${LEVEL_CLASS[c.level]}`}
              />
            ) : (
              <div key={i} className="h-[11px] w-[11px]" />
            )
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] font-medium text-haze">
        Less
        {LEVEL_CLASS.map((cls, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-[2px] ${cls}`} />
        ))}
        More
      </div>
    </div>
  );
}
