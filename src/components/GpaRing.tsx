interface Props {
  gpa: number;
  max?: number;
}

export default function GpaRing({ gpa, max = 4 }: Props) {
  const pct = Math.min(gpa / max, 1);
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="relative h-40 w-40">
      <svg className="h-40 w-40 -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#262636" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={r} fill="none"
          stroke="url(#g)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7cff6b" />
            <stop offset="100%" stopColor="#5fd0ff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold text-white">{gpa.toFixed(2)}</span>
        <span className="text-xs uppercase tracking-widest text-white/40">GPA / {max}</span>
      </div>
    </div>
  );
}
