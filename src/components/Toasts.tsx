import { useStore } from "../store/StoreContext";
import { X } from "lucide-react";

const styles: Record<string, string> = {
  xp: "border-neon-green/30 bg-panel2 text-neon-green",
  level: "border-neon-green/40 bg-panel2 text-neon-green",
  achievement: "border-neon-purple/30 bg-panel2 text-neon-purple",
  crystal: "border-neon-purple/25 bg-panel2 text-white/80",
  info: "border-edge2 bg-panel2 text-white/80",
};

export default function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lift backdrop-blur ${
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
