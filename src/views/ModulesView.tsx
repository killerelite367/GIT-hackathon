import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { computeGpa, scoreToGrade } from "../lib/gpa";
import GpaRing from "../components/GpaRing";

export default function ModulesView() {
  const { data, updateModule, addModule, deleteModule } = useStore();
  const { modules } = data;
  const gpa = computeGpa(modules);

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState("4");
  const [newGrade, setNewGrade] = useState("");

  const handleAddModule = () => {
    const code = newCode.trim().toUpperCase();
    if (!code || !newName.trim()) {
      alert("Please enter module code and name");
      return;
    }
    if (modules.some((m) => m.code === code)) {
      alert(`${code} already exists`);
      return;
    }
    addModule({
      code,
      name: newName.trim(),
      credits: Number(newCredits) || 0,
      grade: newGrade === "" ? null : Number(newGrade),
    });
    setNewCode("");
    setNewName("");
    setNewCredits("4");
    setNewGrade("");
  };

  const getGradeBg = (letter?: string) => {
    if (letter === "A") return "bg-gradient-to-br from-emerald-400 to-emerald-600";
    if (letter === "B+") return "bg-gradient-to-br from-green-400 to-green-600";
    if (letter === "B") return "bg-gradient-to-br from-blue-400 to-blue-600";
    if (letter === "C+") return "bg-gradient-to-br from-yellow-400 to-yellow-600";
    if (letter === "C") return "bg-gradient-to-br from-yellow-500 to-yellow-700";
    if (letter === "D+") return "bg-gradient-to-br from-orange-400 to-orange-600";
    if (letter === "D") return "bg-gradient-to-br from-orange-500 to-orange-700";
    return "bg-gradient-to-br from-red-400 to-red-600";
  };

  return (
    <section className="space-y-6">

      {/* ➕ ADD MODULE FORM */}
      <div className="rounded-2xl border border-neon-cyan/25 bg-gradient-to-br from-neon-cyan/[0.06] to-transparent p-5">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-neon-cyan">
          <Plus size={18} /> Add New Module
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <input
            type="text"
            placeholder="Code (e.g. C240)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="rounded-lg border border-line bg-surface2 px-3 py-2 text-sm font-medium text-night placeholder-haze focus:border-brand/50 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Module name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rounded-lg border border-line bg-surface2 px-3 py-2 text-sm font-medium text-night placeholder-haze focus:border-brand/50 focus:outline-none sm:col-span-2"
          />
          <input
            type="number"
            placeholder="Credits"
            value={newCredits}
            onChange={(e) => setNewCredits(e.target.value)}
            className="rounded-lg border border-line bg-surface2 px-3 py-2 text-sm font-medium text-night placeholder-haze focus:border-brand/50 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Grade (0-100)"
            value={newGrade}
            onChange={(e) => setNewGrade(e.target.value)}
            className="rounded-lg border border-line bg-surface2 px-3 py-2 text-sm font-medium text-night placeholder-haze focus:border-brand/50 focus:outline-none"
          />
          <button
            onClick={handleAddModule}
            className="col-span-2 rounded-lg bg-neon-cyan px-4 py-2 font-bold text-black hover:bg-neon-cyan/90 transition sm:col-span-1 flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Grade Board */}
      <div>
        <h3 className="mb-4 font-display text-lg font-bold text-night">📊 Grade Board</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {modules.map((m) => {
            const g = m.grade != null ? scoreToGrade(m.grade) : null;
            const gradeBg = getGradeBg(g?.letter);
            return (
              <div key={m.code} className={`${gradeBg} rounded-2xl p-4 text-center text-white shadow-lg`}>
                <div className="text-3xl mb-2">{g?.letter === "A" ? "🌟" : g?.letter?.includes("B") ? "⭐" : g?.letter?.includes("C") ? "📚" : "🔥"}</div>
                <div className="text-2xl font-bold">{g?.letter || "—"}</div>
                <div className="text-xs font-bold mt-1">{m.code}</div>
                {m.grade && <div className="text-xs opacity-80 mt-1">{m.grade}%</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* GPA ring feature */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface p-6 text-center shadow-soft">
          <GpaRing gpa={gpa} />
          <p className="mt-3 max-w-[16rem] text-xs font-medium text-dusk">
            Credit-weighted on the 0–4 poly scale. Edit any score to watch it update live.
          </p>
        </div>

        {/* Module scores */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft md:col-span-2">
          <h3 className="mb-3 font-display text-lg font-bold tracking-tightish text-night">
            Running scores
          </h3>
          <div className="space-y-3">
          {modules.map((m) => {
            const g = m.grade != null ? scoreToGrade(m.grade) : null;
            return (
              <div
                key={m.code}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface2 p-3"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs font-medium text-haze">{m.code}</span>
                  <p className="truncate text-sm font-semibold text-night">{m.name}</p>
                  <span className="text-[11px] text-haze">{m.credits} credits</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-haze">
                    Score
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={m.grade ?? ""}
                      onChange={(e) =>
                        updateModule(m.code, {
                          grade: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      className="mt-0.5 block w-20 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm font-medium text-night outline-none focus:border-brand/50"
                    />
                  </label>
                  {g && (
                    <div className="min-w-[2.5rem] text-center">
                      <div className="font-display text-lg font-bold text-night">{g.letter}</div>
                      <div className="text-[10px] text-haze">{g.point.toFixed(1)}</div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${m.code}? This can't be undone.`)) deleteModule(m.code);
                    }}
                    aria-label={`Remove ${m.code}`}
                    className="shrink-0 rounded-lg p-1.5 text-haze transition hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

    </section>
  );
}
