import { useState } from "react";
import { Users, Share2, Copy, Check } from "lucide-react";
import GardenView from "./GardenView";

interface FriendGarden {
  name: string;
  code: string;
  garden: Record<string, string>;
}

const EXAMPLE_FRIENDS: FriendGarden[] = [
  {
    name: "John's Garden",
    code: "john-garden-2026",
    garden: {
      "0,0": "spirit_1",
      "0,1": "spirit_2",
      "1,0": "spirit_3",
      "2,2": "spirit_4",
    },
  },
  {
    name: "Sarah's Garden",
    code: "sarah-garden-2026",
    garden: {
      "1,1": "spirit_5",
      "2,0": "spirit_6",
      "0,3": "spirit_7",
    },
  },
];

export default function FriendsView() {
  const [selectedFriend, setSelectedFriend] = useState<FriendGarden | null>(EXAMPLE_FRIENDS[0]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Share your garden */}
      <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
        <h3 className="mb-3 text-sm font-bold text-haze">📤 Share Your Garden</h3>
        <div className="flex items-center gap-2 rounded-lg bg-background p-3">
          <span className="font-mono text-xs text-text break-all flex-1">your-garden-2026</span>
          <button className="rounded bg-brand px-3 py-1 text-xs font-bold text-text hover:bg-brand/80 transition-colors flex items-center gap-1">
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
                <p className="font-bold text-text">{friend.name}</p>
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
        <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
          <h3 className="mb-3 text-sm font-bold text-haze">🌱 {selectedFriend.name}</h3>
          <div className="text-xs text-haze mb-3">
            {Object.keys(selectedFriend.garden).length} spirits planted
          </div>

          {/* Simple garden grid visualization */}
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }).map((_, idx) => {
              const row = Math.floor(idx / 5);
              const col = idx % 5;
              const key = `${row},${col}`;
              const hasSoul = key in selectedFriend.garden;

              return (
                <div
                  key={key}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    hasSoul
                      ? "border-neon-cyan bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20"
                      : "border-dashed border-line bg-surface2 hover:border-neon-purple/50"
                  }`}
                >
                  {hasSoul && (
                    <div className="flex items-center justify-center h-full text-xl">
                      🌱
                    </div>
                  )}
                </div>
              );
            })}
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
            className="flex-1 rounded border border-line bg-background px-3 py-2 text-sm text-text placeholder-haze focus:border-neon-purple focus:outline-none"
          />
          <button className="rounded bg-brand px-4 py-2 font-bold text-text hover:bg-brand/80 transition-colors">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
