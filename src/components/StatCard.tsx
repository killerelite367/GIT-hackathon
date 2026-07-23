import type { ReactNode } from "react";

export type Tone = "brand" | "warm" | "grass" | "berry" | "sky";

const TONE: Record<Tone, { chip: string; bar: string }> = {
  brand: { chip: "bg-brand-soft text-brand", bar: "bg-brand" },
  warm: { chip: "bg-warm-soft text-warm-deep", bar: "bg-warm" },
  grass: { chip: "bg-grass-soft text-grass-deep", bar: "bg-grass" },
  berry: { chip: "bg-berry-soft text-berry-deep", bar: "bg-berry" },
  sky: { chip: "bg-sky-soft text-sky-deep", bar: "bg-sky" },
};

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  tone: Tone;
  progress?: number; // 0-100, renders a thin state bar when provided
  index?: number; // stagger index for the mount rise
}

export default function StatCard({ label, value, sub, icon, tone, progress, index = 0 }: Props) {
  const c = TONE[tone];
  return (
    <div
      className="group animate-rise rounded-2xl border border-line bg-surface p-4 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-raised sm:p-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.chip} transition-transform duration-200 group-hover:scale-105`}
        >
          {icon}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-haze">
          {label}
        </span>
      </div>

      <div className="mt-3 font-display text-[1.7rem] font-bold tabular leading-none text-night">
        {value}
      </div>

      {progress != null && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className={`h-full rounded-full ${c.bar} transition-[width] duration-700 ease-out`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}

      {sub && <div className="mt-2 text-xs font-medium text-dusk">{sub}</div>}
    </div>
  );
}
