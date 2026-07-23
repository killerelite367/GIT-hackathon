import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  accent: string; // tailwind text color class
}

export default function StatCard({ label, value, sub, icon, accent }: Props) {
  return (
    <div className="rounded-2xl border border-edge bg-panel/70 p-5 backdrop-blur transition hover:border-white/20">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-white/40">{label}</span>
        <span className={accent}>{icon}</span>
      </div>
      <div className="mt-3 font-mono text-2xl font-bold text-white">{value}</div>
      {sub && <div className="mt-1 text-sm text-white/50">{sub}</div>}
    </div>
  );
}
