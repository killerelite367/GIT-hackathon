import { useState } from "react";
import { useStore } from "../store/StoreContext";
import { Plus, Trash2, Edit2 } from "lucide-react";

const TURTLE_SHELLS = [
  "bg-gradient-to-br from-green-400 to-green-600",
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-yellow-400 to-yellow-600",
  "bg-gradient-to-br from-pink-400 to-pink-600",
  "bg-gradient-to-br from-cyan-400 to-cyan-600",
];

export default function GroupProjectView() {
  const { data, updateData } = useStore();
  const { game } = data;
  const [newEmail, setNewEmail] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingContribution, setEditingContribution] = useState("");

  const addMember = () => {
    if (!newEmail.trim()) return;
    if (game.groupMembers.length >= 6) {
      alert("Max 6 team members!");
      return;
    }

    const members = [...game.groupMembers, { email: newEmail.trim(), contribution: 0 }];
    updateData({
      ...data,
      game: { ...game, groupMembers: members },
    });
    setNewEmail("");
  };

  const updateContribution = (idx: number, value: number) => {
    const members = [...game.groupMembers];
    members[idx].contribution = Math.max(0, Math.min(100, value));

    // Auto-normalize if total is over 100
    const total = members.reduce((sum, m) => sum + m.contribution, 0);
    if (total > 100) {
      const scale = 100 / total;
      members.forEach(m => m.contribution = Math.round(m.contribution * scale));
    }

    updateData({
      ...data,
      game: { ...game, groupMembers: members },
    });
  };

  const deleteMember = (idx: number) => {
    const members = game.groupMembers.filter((_, i) => i !== idx);
    updateData({
      ...data,
      game: { ...game, groupMembers: members },
    });
  };

  const totalContribution = game.groupMembers.reduce((sum, m) => sum + m.contribution, 0);

  // Calculate turtle positions in a circle
  const getTurtlePosition = (index: number, total: number) => {
    const angleStep = (360 / Math.max(total, 1));
    const angle = (index * angleStep - 90) * (Math.PI / 180);
    const radius = Math.min(120, 60 + total * 8);
    const x = 200 + radius * Math.cos(angle);
    const y = 200 + radius * Math.sin(angle);
    const rotation = index * angleStep;
    return { x, y, rotation };
  };

  return (
    <div className="space-y-6">
      {/* Add member form */}
      <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
        <h3 className="mb-3 text-sm font-bold text-haze">🐢 Add Team Member</h3>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="teammate@email.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMember()}
            className="flex-1 rounded border border-line bg-background px-3 py-2 text-sm text-text placeholder-haze focus:border-neon-purple focus:outline-none"
          />
          <button
            onClick={addMember}
            disabled={game.groupMembers.length >= 6}
            className="rounded bg-brand px-4 py-2 font-bold text-text disabled:opacity-50 hover:bg-brand/80 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {game.groupMembers.length > 0 && (
        <>
          {/* Turtle circle visualization */}
          <div className="rounded-lg border border-line bg-surface p-6 shadow-soft">
            <h3 className="mb-4 text-center text-sm font-bold text-haze">👥 Team Turtles</h3>

            <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto drop-shadow-lg">
              {/* Pond water */}
              <defs>
                <radialGradient id="pondGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#22c55e" />
                </radialGradient>
                <filter id="shadow">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                </filter>
              </defs>

              {/* Pond background with gradient */}
              <ellipse cx="200" cy="200" rx="180" ry="160" fill="url(#pondGradient)" opacity="0.3" />
              <ellipse cx="200" cy="200" rx="190" ry="170" fill="none" stroke="#86efac" strokeWidth="2" opacity="0.5" />

              {/* Lily pads */}
              {game.groupMembers.map((_member, idx) => {
                const { x, y } = getTurtlePosition(idx, game.groupMembers.length);
                return (
                  <g key={`lilypad-${idx}`}>
                    {/* Lily pad (circular green leaf) */}
                    <circle cx={x} cy={y} r="26" className="fill-green-600" opacity="0.7" />
                    <circle cx={x} cy={y} r="26" fill="none" stroke="#16a34a" strokeWidth="1.5" />
                    {/* Lily pad veins */}
                    <line x1={x} y1={y - 20} x2={x} y2={y + 20} stroke="#15803d" strokeWidth="1" opacity="0.5" />
                    <line x1={x - 20} y1={y} x2={x + 20} y2={y} stroke="#15803d" strokeWidth="1" opacity="0.5" />
                  </g>
                );
              })}

              {/* Turtles on lily pads */}
              {game.groupMembers.map((member, idx) => {
                const { x, y, rotation } = getTurtlePosition(idx, game.groupMembers.length);
                const contribution = member.contribution;
                const isWorking = contribution > 0;

                return (
                  <g key={`turtle-${idx}`} transform={`translate(${x} ${y}) rotate(${rotation})`} filter="url(#shadow)">
                    {/* 3D shadow effect */}
                    <ellipse cx="1.5" cy="2" rx="20" ry="24" className="fill-black" opacity="0.25" />

                    {/* Turtle shell - rounded dome shape with pattern */}
                    <ellipse cx="0" cy="0" rx="20" ry="26" className={TURTLE_SHELLS[idx % TURTLE_SHELLS.length]} opacity={isWorking ? 1 : 0.4} />

                    {/* Shell dome highlight */}
                    <ellipse cx="-8" cy="-8" rx="10" ry="8" fill="white" opacity={isWorking ? 0.25 : 0.1} />

                    {/* Shell pattern - hexagon tiles */}
                    <circle cx="-6" cy="-2" r="3" fill="white" opacity={isWorking ? 0.2 : 0.08} />
                    <circle cx="0" cy="-4" r="3" fill="white" opacity={isWorking ? 0.2 : 0.08} />
                    <circle cx="6" cy="-2" r="3" fill="white" opacity={isWorking ? 0.2 : 0.08} />
                    <circle cx="-4" cy="6" r="3" fill="white" opacity={isWorking ? 0.2 : 0.08} />
                    <circle cx="4" cy="6" r="3" fill="white" opacity={isWorking ? 0.2 : 0.08} />

                    {/* Cute little turtle legs */}
                    <ellipse cx="-12" cy="8" rx="5" ry="8" className="fill-green-700" opacity={isWorking ? 0.9 : 0.35} />
                    <ellipse cx="12" cy="8" rx="5" ry="8" className="fill-green-700" opacity={isWorking ? 0.9 : 0.35} />
                    <ellipse cx="-8" cy="20" rx="4" ry="6" className="fill-green-600" opacity={isWorking ? 0.85 : 0.3} />
                    <ellipse cx="8" cy="20" rx="4" ry="6" className="fill-green-600" opacity={isWorking ? 0.85 : 0.3} />

                    {/* Cute tail poking out */}
                    <path d="M 0 28 Q 2 36 0 44" stroke="#557a55" strokeWidth="3" fill="none" opacity={isWorking ? 0.8 : 0.3} strokeLinecap="round" />

                    {/* Turtle head - cute rounded */}
                    <circle cx="0" cy="-32" r="12" className="fill-green-600" opacity={isWorking ? 1 : 0.4} />
                    <circle cx="0" cy="-34" r="10" className="fill-green-500" opacity={isWorking ? 0.95 : 0.38} />

                    {/* Cute snout/mouth */}
                    <circle cx="0" cy="-26" r="4" className="fill-green-700" opacity={isWorking ? 0.7 : 0.3} />

                    {/* Turtle eyes - BIG and cute! */}
                    <circle cx="-4" cy="-35" r="3.5" className="fill-white" opacity={isWorking ? 1 : 0.5} />
                    <circle cx="4" cy="-35" r="3.5" className="fill-white" opacity={isWorking ? 1 : 0.5} />
                    <circle cx="-3.5" cy="-35" r="2" className="fill-black" />
                    <circle cx="4.5" cy="-35" r="2" className="fill-black" />

                    {/* Cute eye shine - gives life! */}
                    {isWorking && (
                      <>
                        <circle cx="-2.2" cy="-36.5" r="0.8" className="fill-white" />
                        <circle cx="5.2" cy="-36.5" r="0.8" className="fill-white" />
                      </>
                    )}

                    {/* Contribution percentage label */}
                    {contribution > 0 && (
                      <text
                        x="0"
                        y="8"
                        textAnchor="middle"
                        className="font-bold text-white text-[13px]"
                        dominantBaseline="middle"
                        fontWeight="900"
                        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
                      >
                        {contribution}%
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Water ripples animation hint */}
              <circle cx="200" cy="200" r="180" fill="none" stroke="#86efac" strokeWidth="1" opacity="0.2" />
            </svg>

            {/* Work breakdown */}
            <div className="mt-4 text-center">
              <p className="text-sm text-haze">Total Work Assigned: <span className="font-bold text-neon-cyan">{totalContribution}%</span></p>
              {totalContribution < 100 && (
                <p className="text-xs text-neon-purple mt-1">⚠️ {100 - totalContribution}% unassigned</p>
              )}
              {totalContribution > 100 && (
                <p className="text-xs text-neon-cyan mt-1">💯 Over 100%! Auto-normalized.</p>
              )}
            </div>
          </div>

          {/* Member list with contribution controls */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-haze">📊 Contributions</h3>
            {game.groupMembers.map((member, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-line bg-surface p-3 shadow-soft"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text truncate">{member.email}</p>
                    {member.contribution === 0 && (
                      <p className="text-xs text-neon-purple">🦗 Slacker turtle (no work assigned)</p>
                    )}
                  </div>

                  {editingIdx === idx ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingContribution}
                        onChange={(e) => setEditingContribution(e.target.value)}
                        className="w-16 rounded border border-neon-purple bg-background px-2 py-1 text-sm font-bold text-text"
                      />
                      <span className="text-xs font-bold text-haze">%</span>
                      <button
                        onClick={() => {
                          updateContribution(idx, parseInt(editingContribution) || 0);
                          setEditingIdx(null);
                        }}
                        className="rounded bg-neon-cyan px-2 py-1 text-xs font-bold text-text hover:bg-neon-cyan/80 transition-colors"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-neon-cyan">{member.contribution}%</p>
                        <div className="w-20 h-1 bg-line rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan transition-all"
                            style={{ width: `${member.contribution}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingIdx(idx);
                          setEditingContribution(String(member.contribution));
                        }}
                        className="rounded bg-neon-purple/30 p-1.5 text-neon-purple hover:bg-neon-purple/50 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteMember(idx)}
                        className="rounded bg-red-500/30 p-1.5 text-red-500 hover:bg-red-500/50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Work distribution tips */}
          <div className="rounded-lg border border-neon-purple/30 bg-neon-purple/10 p-3">
            <p className="text-xs text-haze">
              💡 <strong>Turtle Tip:</strong> Each turtle's shell color represents a team member. Bright shells = doing work, faded = slacking! Edit each member's contribution % to split the work fairly.
            </p>
          </div>
        </>
      )}

      {game.groupMembers.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-line p-8 text-center">
          <p className="text-lg font-bold text-haze mb-2">🐢 No team yet!</p>
          <p className="text-sm text-haze">Add your teammates above to start tracking the group project.</p>
        </div>
      )}
    </div>
  );
}
