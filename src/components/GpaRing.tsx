import { useEffect, useState } from "react";
import { useCountUp } from "../lib/useCountUp";

interface Props {
  gpa: number;
  max?: number;
}

export default function GpaRing({ gpa, max = 4 }: Props) {
  const pct = Math.min(gpa / max, 1);
  const r = 54;
  const c = 2 * Math.PI * r;

  // Draw the ring on mount: start empty, then transition to the real offset.
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const offset = c * (1 - (drawn ? pct : 0));
  const shown = useCountUp(gpa, 900, 2);

  return (
    <div className="relative h-44 w-44">
      <svg className="h-44 w-44 -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#2c2820" strokeWidth="9" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="#e0a84d"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[2rem] font-bold tabular leading-none text-white">
          {shown.toFixed(2)}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/50">
          GPA / {max.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
