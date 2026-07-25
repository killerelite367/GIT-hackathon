import { useEffect } from "react";
import { X } from "lucide-react";
import { useStore } from "../store/StoreContext";
import FocusTimer from "./FocusTimer";

/**
 * Focus sessions live in a modal now — launched from the Today hero or any
 * quest's "Focus" action, with that task pre-selected. Keeps the timer a
 * deliberate, single-task action instead of an ambient dashboard widget.
 */
export default function FocusModal({
  open,
  initialAssignmentId,
  onClose,
}: {
  open: boolean;
  initialAssignmentId: string | null;
  onClose: () => void;
}) {
  const { data } = useStore();
  const openAssignments = data.assignments.filter((a) => !a.completed);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-night/30 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Focus session"
    >
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm animate-popin">
        <button
          onClick={onClose}
          aria-label="Close focus session"
          className="absolute -top-2 right-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-haze shadow-soft transition hover:text-night sm:-right-2 sm:-top-2"
        >
          <X size={15} />
        </button>
        <FocusTimer
          assignments={openAssignments}
          initialAssignmentId={initialAssignmentId ?? undefined}
        />
      </div>
    </div>
  );
}
