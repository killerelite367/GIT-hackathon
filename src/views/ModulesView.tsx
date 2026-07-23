import { useState } from "react";
import { Calculator } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { computeGpa, scoreToGrade, scoreNeededFor } from "../lib/gpa";
import GpaRing from "../components/GpaRing";

export default function ModulesView() {
  const { data, updateModule } = useStore();
  const { modules } = data;
  const gpa = computeGpa(modules);

  const [target, setTarget] = useState(3.7);
  const [focusModule, setFocusModule] = useState(modules[0]?.code ?? "");
  const needed = scoreNeededFor(modules, focusModule, target);

  return (
    <section className="space-y-6">
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
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* What-if calculator */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold tracking-tightish text-night">
          <Calculator size={18} className="text-brand" /> What-if calculator
        </h3>
        <p className="mt-1 text-sm text-dusk">What score does one module need to hit a target GPA?</p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-haze">
            Module
            <select
              value={focusModule}
              onChange={(e) => setFocusModule(e.target.value)}
              className="mt-1 block rounded-lg border border-line bg-surface2 px-3 py-2 text-sm font-medium text-night outline-none focus:border-brand/50"
            >
              {modules.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.code}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-haze">
            Target GPA
            <input
              type="number"
              min={0}
              max={4}
              step={0.1}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="mt-1 block w-24 rounded-lg border border-line bg-surface2 px-3 py-2 text-sm font-medium text-night outline-none focus:border-brand/50"
            />
          </label>
          <div className="rounded-xl border border-line bg-surface2 px-4 py-2.5">
            {needed == null ? (
              <span className="text-sm font-semibold text-berry-deep">
                Not reachable with this module alone
              </span>
            ) : (
              <span className="text-sm font-medium text-dusk">
                Need <span className="font-mono text-lg font-bold text-brand-deep">{needed}</span> in{" "}
                {focusModule}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
