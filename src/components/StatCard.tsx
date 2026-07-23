import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  accent: string; // tailwind text color class for the icon
  progress?: number; // 0-100, renders a thin state bar when provided
  barClass?: string; // bar fill color, defaults to a neutral
  index?: number; // stagger index for the mount rise
}

export default function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
  progress,
  barClass = "bg-white/60",
  index = 0,
}: Props) {
  return (
    <div
      className="group animate-rise rounded-2xl border border-edge bg-panel/80 p-4 shadow-card backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-edge2 sm:p-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
          {label}
        </span>
        <span
          className={`${accent} transition-transform duration-200 group-hover:scale-110`}
        >
          {icon}
        </span>
      </div>

      <div className="mt-3 font-mono text-2xl font-bold tabular text-white sm:text-[1.7rem]">
        {value}
      </div>

      {progress != null && (
        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className={`h-full rounded-full ${barClass} transition-[width] duration-700 ease-out`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}

      {sub && <div className="mt-2 text-xs text-white/50">{sub}</div>}
    </div>
  );
}
