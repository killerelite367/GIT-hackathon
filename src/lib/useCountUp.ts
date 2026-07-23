import { useEffect, useRef, useState } from "react";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Animate a number toward `target` with an ease-out curve. Conveys state
 * change (XP earned, GPA shifting) rather than decoration. Snaps instantly
 * when the user prefers reduced motion. Re-animates from the previous value
 * whenever the target changes.
 */
export function useCountUp(target: number, duration = 700, decimals = 0): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (prefersReduced()) {
      setValue(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      const next = from + delta * eased;
      const factor = Math.pow(10, decimals);
      setValue(Math.round(next * factor) / factor);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = target;
    };
  }, [target, duration, decimals]);

  return value;
}
