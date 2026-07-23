import { useState, useEffect } from "react";
import type { Assignment, AssignmentType, Module } from "../types";
import { X } from "lucide-react";
import { todayISO, addDays } from "../lib/date";
import { useStore } from "../store/StoreContext";

const TYPES: AssignmentType[] = ["CA", "Group Project", "Reflection", "Exam", "Quiz"];

interface Props {
  open: boolean;
  editing: Assignment | null;
  modules: Module[];
  onClose: () => void;
}

const empty = (modules: Module[]) => ({
  title: "",
  module: modules[0]?.code ?? "",
  type: "CA" as AssignmentType,
  dueDate: addDays(todayISO(), 7),
  progress: 0,
  weight: 20,
  estHours: 6,
});

const fieldLabel = "block text-xs font-semibold uppercase tracking-wide text-haze";
const fieldInput =
  "mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm font-medium text-night outline-none placeholder:text-haze focus:border-brand/50";

export default function AssignmentModal({ open, editing, modules, onClose }: Props) {
  const { addAssignment, updateAssignment } = useStore();
  const [form, setForm] = useState(empty(modules));

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        module: editing.module,
        type: editing.type,
        dueDate: editing.dueDate,
        progress: editing.progress,
        weight: editing.weight,
        estHours: editing.estHours,
      });
    } else {
      setForm(empty(modules));
    }
  }, [editing, open, modules]);

  if (!open) return null;

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editing) {
      updateAssignment(editing.id, { ...form });
    } else {
      addAssignment({ ...form, completed: false });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-night/30 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={editing ? "Edit assignment" : "Add assignment"}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-lg animate-popin rounded-t-3xl border border-line bg-surface p-6 shadow-pop sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-night">
            {editing ? "Edit quest" : "New quest"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-haze transition hover:text-night"
          >
            <X size={18} />
          </button>
        </div>

        <label className={fieldLabel}>
          Title
          <input
            autoFocus
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. CA2: ETL Pipeline Report"
            className={fieldInput}
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className={fieldLabel}>
            Module
            <select value={form.module} onChange={(e) => set("module", e.target.value)} className={fieldInput}>
              {modules.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.code} · {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className={fieldLabel}>
            Type
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value as AssignmentType)}
              className={fieldInput}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className={fieldLabel}>
            Due date
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
              className={fieldInput}
            />
          </label>
          <label className={fieldLabel}>
            Weight (%)
            <input
              type="number"
              min={0}
              max={100}
              value={form.weight}
              onChange={(e) => set("weight", Number(e.target.value))}
              className={fieldInput}
            />
          </label>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className={fieldLabel}>
            Est. effort (hours)
            <input
              type="number"
              min={0}
              step={0.5}
              value={form.estHours}
              onChange={(e) => set("estHours", Number(e.target.value))}
              className={fieldInput}
            />
          </label>
          <label className={fieldLabel}>
            Progress ({form.progress}%)
            <input
              type="range"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => set("progress", Number(e.target.value))}
              className="mt-3 w-full accent-brand"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-dusk transition hover:text-night active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-deep active:scale-95"
          >
            {editing ? "Save changes" : "Add & schedule"}
          </button>
        </div>
      </form>
    </div>
  );
}
