import { useStore } from "../store/StoreContext";
import { X } from "lucide-react";

const styles: Record<string, string> = {
  xp: "border-brand/25 bg-surface text-brand-deep",
  level: "border-warm/30 bg-surface text-warm-deep",
  achievement: "border-brand/25 bg-surface text-brand-deep",
  crystal: "border-berry/25 bg-surface text-berry-deep",
  info: "border-line2 bg-surface text-dusk",
};

export default function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-pop ${
            styles[t.kind] ?? styles.info
          } animate-slideup`}
        >
          <span>{t.message}</span>
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 text-haze transition hover:text-night"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
