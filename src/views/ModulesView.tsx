import { useState } from "react";
import { Calculator, GraduationCap } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { computeGpa, scoreToGrade, scoreNeededFor } from "../lib/gpa";

/** Colour accent by grade point so strong grades pop and weak ones warn. */
function gradeAccent(point: number): { text: string; border: string; glow: string } {
  if (point >= 3.5) return { text: "text-neon-green", border: "border-neon-green/40", glow: "shadow-glow" };
  if (point >= 3.0) return { text: "text-neon-cyan", border: "border-neon-cyan/40", glow: "shadow-glow-cyan" };
  if (point >= 2.0) return { text: "text-neon-yellow", border: "border-neon-yellow/40", glow: "" };
  return { text: "text-neon-pink", border: "border-neon-pink/40", glow: "" };
}

export default function ModulesView() {
  const { data, updateModule } = useStore();
  const { modules } = data;
  const gpa = computeGpa(modules);

  const [target, setTarget] = useState(3.7);
  const [focusModule, setFocusModule] = useState(modules[0]?.code ?? "");
  const needed = scoreNeededFor(modules, focusModule, target);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 rounded-2xl border border-neon-green/25 bg-gradient-to-br from-neon-green/[0.06] to-transparent p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neon-green/40 bg-neon-green/10 text-neon-green shadow-glow">
          <GraduationCap size={20} />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tightish text-white">
            Modules &amp; GPA
          </h2>
          <p className="text-sm text-white/50">
            Credit-weighted on the 0–4 poly scale · edit any running score to see
            your GPA update live.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-edge bg-panel/70 p-5">
        <div className="mb-4 flex items-baseline gap-3">
          <span
            className="bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text font-mono text-4xl font-bold text-transparent"
            style={{ filter: "drop-shadow(0 0 18px rgba(124,255,107,0.35))" }}
          >
            {gpa.toFixed(2)}
          </span>
          <span className="text-sm text-white/40">current GPA / 4.00</span>
        </div>

        <div className="space-y-3">
          {modules.map((m, i) => {
            const g = m.grade != null ? scoreToGrade(m.grade) : null;
            const accent = g ? gradeAccent(g.point) : null;
            return (
              <div
                key={m.code}
                className={`animate-rise flex flex-wrap items-center gap-3 rounded-xl border p-3 transition hover:border-white/25 ${
                  accent ? accent.border : "border-edge"
                } bg-panel2/50`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs text-white/40">{m.code}</span>
                  <p className="truncate text-sm font-medium text-white">{m.name}</p>
                  <span className="text-[11px] text-white/40">{m.credits} credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] uppercase tracking-wider text-white/40">
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
                      className="mt-0.5 block w-20 rounded-lg border border-edge bg-panel px-2 py-1.5 text-sm text-white outline-none focus:border-neon-green/50"
                    />
                  </label>
                  {g && accent && (
                    <div
                      className={`rounded-lg border px-3 py-1 text-center ${accent.border} ${accent.glow}`}
                    >
                      <div className={`font-mono text-lg font-bold ${accent.text}`}>
                        {g.letter}
                      </div>
                      <div className="text-[10px] text-white/40">{g.point.toFixed(1)}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What-if calculator */}
      <div className="rounded-2xl border border-neon-cyan/25 bg-panel/70 p-5">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <Calculator size={18} className="text-neon-cyan" /> What-if calculator
        </h3>
        <p className="mt-1 text-sm text-white/50">
          What score does one module need to hit a target GPA?
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="text-xs uppercase tracking-wider text-white/40">
            Module
            <select
              value={focusModule}
              onChange={(e) => setFocusModule(e.target.value)}
              className="mt-1 block rounded-lg border border-edge bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-neon-cyan/50"
            >
              {modules.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.code}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs uppercase tracking-wider text-white/40">
            Target GPA
            <input
              type="number"
              min={0}
              max={4}
              step={0.1}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="mt-1 block w-24 rounded-lg border border-edge bg-panel2 px-3 py-2 text-sm text-white outline-none focus:border-neon-cyan/50"
            />
          </label>
          <div className="rounded-xl border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-2 shadow-glow-cyan">
            {needed == null ? (
              <span className="text-sm text-neon-pink">
                Not reachable with this module alone
              </span>
            ) : (
              <span className="text-sm text-white">
                Need{" "}
                <span className="font-mono text-lg font-bold text-neon-cyan">
                  {needed}
                </span>{" "}
                in {focusModule}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
