import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { SPIRITS, SPIRIT_BY_ID } from "../lib/gacha";
import SpiritArt from "../components/SpiritArt";

export default function GroupProjectView() {
  const { data, updateData, equipSpirit } = useStore();
  const { game } = data;
  const [newEmail, setNewEmail] = useState("");
  const [newTask, setNewTask] = useState("");

  const owned = SPIRITS.filter((s) => (game.spirits[s.id] ?? 0) > 0);
  const DEFAULT_SPIRIT = SPIRIT_BY_ID["apple"];
  const equipped = (game.equippedSpirit ? SPIRIT_BY_ID[game.equippedSpirit] : null) ?? DEFAULT_SPIRIT;

  const addMember = () => {
    if (!newEmail.trim()) return;
    if (game.groupMembers.length >= 6) {
      alert("Max 6 team members!");
      return;
    }
    updateData({
      ...data,
      game: {
        ...game,
        groupMembers: [...game.groupMembers, { email: newEmail.trim(), contribution: 0 }],
      },
    });
    setNewEmail("");
  };

  const deleteMember = (idx: number) => {
    const members = game.groupMembers.filter((_, i) => i !== idx);
    // Unassign tasks that pointed at the removed member; shift indices down.
    const tasks = game.groupTasks.map((t) => {
      if (t.assignedIdx === idx) return { ...t, assignedIdx: null };
      if (typeof t.assignedIdx === "number" && t.assignedIdx > idx) {
        return { ...t, assignedIdx: t.assignedIdx - 1 };
      }
      return t;
    });
    updateData({ ...data, game: { ...game, groupMembers: members, groupTasks: tasks } });
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task = {
      id: `task_${Date.now()}`,
      title: newTask.trim(),
      assignedIdx: "me" as const,
      done: false,
    };
    updateData({ ...data, game: { ...game, groupTasks: [...game.groupTasks, task] } });
    setNewTask("");
  };

  const assignTask = (taskId: string, idx: number | "me" | null) => {
    const tasks = game.groupTasks.map((t) => (t.id === taskId ? { ...t, assignedIdx: idx } : t));
    updateData({ ...data, game: { ...game, groupTasks: tasks } });
  };

  const toggleTask = (taskId: string) => {
    const tasks = game.groupTasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
    updateData({ ...data, game: { ...game, groupTasks: tasks } });
  };

  const deleteTask = (taskId: string) => {
    updateData({ ...data, game: { ...game, groupTasks: game.groupTasks.filter((t) => t.id !== taskId) } });
  };

  const assigneeLabel = (idx: number | "me" | null) => {
    if (idx === "me") return "Me";
    if (idx === null) return "Unassigned";
    return game.groupMembers[idx] ? `Member ${idx + 1}` : "Unassigned";
  };

  const activeTasks = game.groupTasks.filter((t) => !t.done);
  const completedTasks = game.groupTasks.filter((t) => t.done);

  return (
    <div className="space-y-6">
      {/* Pond — everyone on the team gets a character here */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
        <h3 className="mb-3 text-sm font-bold text-haze">🌊 The Pond</h3>
        <div
          className="relative flex h-44 flex-wrap items-end justify-center gap-4 overflow-x-auto overflow-y-hidden rounded-xl border border-line/50 px-4 pb-3 pt-6"
          style={{ background: "linear-gradient(180deg,#7ec8ff 0%,#bfe8ff 60%,#e8f7ff 100%)" }}
        >
          <div className="flex flex-col items-center">
            <SpiritArt spirit={equipped} size={64} walking />
            <p className="mt-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold text-white">You</p>
          </div>
          {game.groupMembers.map((m, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <SpiritArt spirit={DEFAULT_SPIRIT} size={64} walking />
              <p className="mt-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold text-white">
                {m.email.split("@")[0]}
              </p>
            </div>
          ))}
        </div>

        {owned.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {owned.map((s) => (
              <button
                key={s.id}
                onClick={() => equipSpirit(s.id)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  game.equippedSpirit === s.id
                    ? "border-neon-cyan bg-neon-cyan/15 text-neon-cyan"
                    : "border-line bg-surface2 text-haze hover:text-night"
                }`}
              >
                <span className="text-lg">{s.emoji}</span>
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Team members */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
        <h3 className="mb-3 text-sm font-bold text-haze">👥 Team</h3>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="teammate@email.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMember()}
            className="flex-1 rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-night placeholder-haze focus:border-brand/50 focus:outline-none"
          />
          <button
            onClick={addMember}
            disabled={game.groupMembers.length >= 6}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white transition hover:bg-brand/80 disabled:opacity-50"
          >
            <Plus size={16} /> Add
          </button>
        </div>
        {game.groupMembers.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {game.groupMembers.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-surface2 px-3 py-1.5 text-sm">
                <span className="text-night">
                  <span className="font-semibold text-haze">Member {idx + 1}:</span> {m.email}
                </span>
                <button onClick={() => deleteMember(idx)} className="text-haze hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task list */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
        <h3 className="mb-3 text-sm font-bold text-haze">✅ Tasks</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Draft slide 3"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="flex-1 rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-night placeholder-haze focus:border-brand/50 focus:outline-none"
          />
          <button
            onClick={addTask}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white transition hover:bg-brand/80"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {game.groupTasks.length === 0 ? (
          <p className="mt-4 text-center text-xs text-haze">No tasks yet — add one above and assign it below.</p>
        ) : (
          <>
            <div className="mt-3 space-y-2">
              {activeTasks.length === 0 ? (
                <p className="text-xs text-haze">All done! 🎉</p>
              ) : (
                activeTasks.map((t) => (
                  <div key={t.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface2 p-2.5">
                    <button
                      onClick={() => toggleTask(t.id)}
                      aria-label={`Mark ${t.title} as done`}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-line text-transparent transition hover:border-brand"
                    >
                      <Check size={14} />
                    </button>

                    <span className="flex-1 text-sm font-medium text-night">{t.title}</span>

                    <select
                      value={t.assignedIdx === null ? "" : String(t.assignedIdx)}
                      onChange={(e) => {
                        const v = e.target.value;
                        assignTask(t.id, v === "" ? null : v === "me" ? "me" : Number(v));
                      }}
                      className="rounded-lg border border-line bg-surface px-2 py-1 text-xs font-semibold text-night outline-none focus:border-brand/50"
                    >
                      <option value="">Unassigned</option>
                      <option value="me">Me</option>
                      {game.groupMembers.map((m, idx) => (
                        <option key={idx} value={idx}>
                          Member {idx + 1} ({m.email})
                        </option>
                      ))}
                    </select>

                    <button onClick={() => deleteTask(t.id)} className="text-haze hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {completedTasks.length > 0 && (
              <div className="mt-4 border-t border-line pt-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-haze">
                  Completed
                  <span className="ml-1.5 font-normal normal-case text-haze">({completedTasks.length})</span>
                </p>
                <div className="space-y-2">
                  {completedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface2/50 p-2.5 opacity-60"
                    >
                      <button
                        onClick={() => toggleTask(t.id)}
                        aria-label={`Mark ${t.title} as not done`}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-neon-cyan bg-neon-cyan text-black transition"
                      >
                        <Check size={14} />
                      </button>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-haze line-through">
                          {t.title}
                        </span>
                        <span className="text-[10px] font-semibold text-haze">by {assigneeLabel(t.assignedIdx)}</span>
                      </span>

                      <button onClick={() => deleteTask(t.id)} className="text-haze hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
