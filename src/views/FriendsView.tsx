import { useState } from "react";
import { Share2, Copy, Check, Heart } from "lucide-react";
import { SPIRIT_BY_ID } from "../lib/gacha";
import SpiritArt from "../components/SpiritArt";

interface FriendGarden {
  name: string;
  code: string;
  gpa: number;
  grades: { code: string; letter: string }[];
  garden: Record<string, string>;
  likes: number;
}

const EXAMPLE_FRIENDS: FriendGarden[] = [
  {
    name: "Dythan's Garden",
    code: "dythan-garden-2026",
    gpa: 3.85,
    grades: [
      { code: "C101", letter: "A+" },
      { code: "C240", letter: "A" },
      { code: "C341", letter: "A-" },
    ],
    garden: {
      "0,0": "spirit_1",
      "0,2": "spirit_3",
      "1,1": "spirit_2",
      "2,2": "spirit_4",
      "3,3": "spirit_5",
    },
    likes: 42,
  },
];

export default function FriendsView() {
  const [selectedFriend, setSelectedFriend] = useState<FriendGarden | null>(EXAMPLE_FRIENDS[0]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(selectedFriend?.likes ?? 0);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleLike = () => {
    if (liked) {
      setLikes(Math.max(0, likes - 1));
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className="space-y-6">
      {/* Share your garden */}
      <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
        <h3 className="mb-3 text-sm font-bold text-haze">📤 Share Your Garden</h3>
        <div className="flex items-center gap-2 rounded-lg bg-surface2 p-3">
          <span className="font-mono text-xs text-night break-all flex-1">your-garden-2026</span>
          <button className="rounded bg-brand px-3 py-1 text-xs font-bold text-white hover:bg-brand/80 transition-colors flex items-center gap-1">
            <Share2 size={14} /> Share
          </button>
        </div>
        <p className="mt-2 text-xs text-haze">
          💡 Share your garden code with friends! They can view your GPA Garden anytime.
        </p>
      </div>

      {/* Friends gardens list */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-haze">👥 Friends' Gardens</h3>
        {EXAMPLE_FRIENDS.map((friend) => (
          <div
            key={friend.code}
            onClick={() => setSelectedFriend(friend)}
            className={`rounded-lg border-2 p-3 cursor-pointer transition-all ${
              selectedFriend?.code === friend.code
                ? "border-neon-cyan bg-neon-cyan/10"
                : "border-line bg-surface hover:border-neon-purple"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-night">{friend.name}</p>
                <p className="text-xs text-haze">{friend.code}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(friend.code);
                }}
                className="rounded bg-neon-purple/20 p-2 text-neon-purple hover:bg-neon-purple/30 transition-colors"
              >
                {copiedCode === friend.code ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected friend's garden preview */}
      {selectedFriend && (
        <div className="space-y-5">
          {/* Header with like button */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neon-green/25 bg-gradient-to-br from-neon-green/[0.06] to-transparent p-4">
            <div>
              <h3 className="text-sm font-bold text-haze">🌱 {selectedFriend.name}</h3>
              <p className="text-xs text-white/40">{Object.keys(selectedFriend.garden).length} spirits planted</p>
            </div>
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                liked ? "border-neon-pink/50 bg-neon-pink/15 text-neon-pink" : "border-edge text-white/60 hover:text-white"
              }`}
            >
              <Heart size={15} fill={liked ? "currentColor" : "none"} />
              {likes}
            </button>
          </div>

          {/* Garden with GPA board */}
          <div
            className="relative rounded-2xl border border-edge overflow-hidden"
            style={{
              background: "linear-gradient(180deg,#7ec8ff 0%,#bfe8ff 55%,#e8f7ff 100%)",
              minHeight: "500px",
            }}
          >
            {/* Sunny GPA Board */}
            <div className="absolute top-6 left-6 right-6 rounded-2xl border-4 border-neon-yellow/80 bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 max-w-sm shadow-lg">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-900">📊 {selectedFriend.name.split("'")[0]}'s GPA</p>
              <p className="mt-2 font-display text-4xl font-bold text-amber-950">{selectedFriend.gpa.toFixed(2)}</p>
              <p className="text-sm text-amber-800">of 4.0</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {selectedFriend.grades.map((g) => (
                  <div key={g.code} className="rounded-lg bg-white/60 p-2 text-center border border-amber-200">
                    <p className="text-xs font-bold text-amber-900">{g.code}</p>
                    <p className="text-sm font-bold text-amber-950">{g.letter}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Garden grid */}
            <div className="grid gap-2 p-6 mt-32" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {Array.from({ length: 16 }).map((_, i) => {
                const row = Math.floor(i / 4);
                const col = i % 4;
                const slot = `${row},${col}`;
                const spiritId = selectedFriend.garden[slot];
                const spirit = spiritId ? SPIRIT_BY_ID[spiritId] : null;

                return (
                  <div
                    key={slot}
                    className={`relative h-24 rounded-lg border-2 flex items-center justify-center transition ${
                      spirit
                        ? "border-dashed border-edge bg-black/20"
                        : "border-dashed border-white/20 bg-white/5"
                    }`}
                  >
                    {spirit ? (
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          <SpiritArt spirit={spirit} size={60} />
                        </div>
                        <p className="text-[10px] text-white/60 truncate max-w-full px-1">{spirit.name}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-white/30">Empty</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add friend section */}
      <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
        <h3 className="mb-3 text-sm font-bold text-haze">➕ Add Friend's Garden</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste garden code here..."
            className="flex-1 rounded border border-line bg-surface2 px-3 py-2 text-sm text-night placeholder-haze focus:border-neon-purple focus:outline-none"
          />
          <button className="rounded bg-brand px-4 py-2 font-bold text-white hover:bg-brand/80 transition-colors">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
