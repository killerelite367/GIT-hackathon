import { useStore } from "../store/StoreContext";
import { X } from "lucide-react";

const styles: Record<string, string> = {
  xp: "border-neon-green/40 bg-neon-green/10 text-neon-green",
  level: "border-neon-yellow/40 bg-neon-yellow/10 text-neon-yellow",
  achievement: "border-neon-purple/40 bg-neon-purple/10 text-neon-purple",
  crystal: "border-neon-pink/40 bg-neon-pink/10 text-neon-pink",
  info: "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan",
};

export default function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-glow backdrop-blur ${
            styles[t.kind] ?? styles.info
          } animate-slideup`}
        >
          <span>{t.message}</span>
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 opacity-60 transition hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
