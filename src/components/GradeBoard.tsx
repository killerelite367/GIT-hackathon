import { Module } from "../types";
import { scoreToGrade } from "../lib/gpa";

interface GradeBoardProps {
  modules: Module[];
}

export default function GradeBoard({ modules }: GradeBoardProps) {
  const getGradeBg = (letter?: string): string => {
    if (!letter) return "bg-gray-500";
    if (letter === "A") return "bg-emerald-500";
    if (letter === "B+") return "bg-green-500";
    if (letter === "B") return "bg-blue-500";
    if (letter === "C+") return "bg-yellow-500";
    if (letter === "C") return "bg-yellow-600";
    if (letter === "D+") return "bg-orange-500";
    if (letter === "D") return "bg-orange-600";
    return "bg-red-500";
  };

  const getGradeEmoji = (letter?: string): string => {
    if (!letter) return "❓";
    if (letter === "A") return "🌟";
    if (letter === "B+") return "⭐";
    if (letter === "B") return "💙";
    if (letter === "C+") return "📚";
    if (letter === "C") return "✏️";
    if (letter === "D+") return "⚡";
    if (letter === "D") return "💪";
    return "🔥";
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-xl font-bold text-night">📊 Grade Board</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {modules.map((m) => {
          const g = m.grade != null ? scoreToGrade(m.grade) : null;
          const bgColor = getGradeBg(g?.letter);
          const emoji = getGradeEmoji(g?.letter);

          return (
            <div key={m.code} className={`rounded-2xl p-4 text-center transition-transform hover:scale-105 ${bgColor} shadow-lg text-white`}>
              <div className="text-4xl mb-2">{emoji}</div>
              <div className="text-2xl font-bold">{g?.letter || "—"}</div>
              <div className="text-sm font-medium mt-1">{m.code}</div>
              <div className="text-xs font-medium opacity-80 mt-1 truncate">{m.name}</div>
              {m.grade && <div className="text-xs opacity-70 mt-2">{m.grade}%</div>}
              <div className="text-xs opacity-80 mt-1">{m.credits} cr</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
