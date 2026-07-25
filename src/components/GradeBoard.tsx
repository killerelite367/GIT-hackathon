import { Module } from "../types";
import { scoreToGrade } from "../lib/gpa";

interface GradeBoardProps {
  modules: Module[];
}

const GRADE_COLORS: Record<string, { bg: string; text: string; emoji: string }> = {
  "A+": { bg: "bg-gradient-to-br from-green-400 to-green-600", text: "text-white", emoji: "🌟" },
  A: { bg: "bg-gradient-to-br from-green-400 to-green-600", text: "text-white", emoji: "⭐" },
  "A-": { bg: "bg-gradient-to-br from-green-300 to-green-500", text: "text-white", emoji: "✨" },
  B: { bg: "bg-gradient-to-br from-blue-400 to-blue-600", text: "text-white", emoji: "💙" },
  C: { bg: "bg-gradient-to-br from-yellow-400 to-yellow-600", text: "text-white", emoji: "📚" },
  D: { bg: "bg-gradient-to-br from-orange-400 to-orange-600", text: "text-white", emoji: "⚡" },
  F: { bg: "bg-gradient-to-br from-red-400 to-red-600", text: "text-white", emoji: "🔥" },
};

export default function GradeBoard({ modules }: GradeBoardProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-xl font-bold text-night">📊 Grade Board</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {modules.map((m) => {
          const g = m.grade != null ? scoreToGrade(m.grade) : null;
          const gradeInfo = g ? GRADE_COLORS[g.letter] : GRADE_COLORS.F;

          return (
            <div
              key={m.code}
              className={`rounded-2xl p-4 text-center transition-transform hover:scale-105 ${gradeInfo.bg} shadow-lg`}
            >
              <div className="text-4xl mb-2">{g ? gradeInfo.emoji : "❓"}</div>
              <div className="text-2xl font-bold text-white">{g?.letter || "—"}</div>
              <div className="text-sm font-medium text-white/80 mt-1">{m.code}</div>
              <div className="text-xs font-medium text-white/60 mt-1 truncate">{m.name}</div>
              {g && <div className="text-xs text-white/70 mt-2">{m.grade}%</div>}
              <div className="text-xs text-white/80 mt-1">{m.credits} cr</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
