import { useStore } from "../store/StoreContext";

interface Accessory {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
}

const ACCESSORIES: Accessory[] = [
  { id: "rose", name: "Rose", emoji: "🌹", cost: 50, description: "Classic red rose" },
  { id: "sunflower", name: "Sunflower", emoji: "🌻", cost: 40, description: "Bright and cheerful" },
  { id: "lily", name: "Lily", emoji: "🪷", cost: 45, description: "Elegant white lily" },
  { id: "tulip", name: "Tulip", emoji: "🌷", cost: 35, description: "Spring beauty" },
  { id: "cherry", name: "Cherry Blossom", emoji: "🌸", cost: 60, description: "Delicate pink petals" },
  { id: "hibiscus", name: "Hibiscus", emoji: "🌺", cost: 55, description: "Tropical vibes" },
  { id: "daisy", name: "Daisy", emoji: "🌼", cost: 30, description: "Simple and cute" },
  { id: "lotus", name: "Lotus", emoji: "🪲", cost: 70, description: "Mystical power" },
];

export default function ShopView() {
  const { data, updateData } = useStore();
  const { game } = data;

  const buyAccessory = (accessory: Accessory) => {
    if (game.crystals < accessory.cost) {
      alert(`Not enough diamonds! Need ${accessory.cost}, have ${game.crystals}`);
      return;
    }

    const newAccessories = { ...game.accessories };
    newAccessories[accessory.id] = (newAccessories[accessory.id] || 0) + 1;

    updateData({
      ...data,
      game: {
        ...game,
        crystals: game.crystals - accessory.cost,
        accessories: newAccessories,
      },
    });
  };

  const equipAccessory = (id: string) => {
    const equipped = new Set(game.equippedAccessories);
    if (equipped.has(id)) {
      equipped.delete(id);
    } else {
      if (equipped.size >= 3) {
        alert("Max 3 accessories equipped!");
        return;
      }
      equipped.add(id);
    }

    updateData({
      ...data,
      game: {
        ...game,
        equippedAccessories: Array.from(equipped),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Diamond balance */}
      <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <span className="font-bold text-haze">Diamonds</span>
          </div>
          <span className="text-2xl font-bold text-brand">{game.crystals}</span>
        </div>
      </div>

      {/* Equipped accessories */}
      {game.equippedAccessories.length > 0 && (
        <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
          <h3 className="mb-3 text-sm font-bold text-haze">✨ Equipped</h3>
          <div className="flex gap-2 flex-wrap">
            {game.equippedAccessories.map((id) => {
              const acc = ACCESSORIES.find((a) => a.id === id);
              return acc ? (
                <div
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan px-3 py-1 text-sm font-bold text-white"
                >
                  <span>{acc.emoji}</span>
                  <span>{acc.name}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Shop grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-haze">🌸 Flower Shop</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ACCESSORIES.map((acc) => {
            const owned = game.accessories[acc.id] || 0;
            const isEquipped = game.equippedAccessories.includes(acc.id);

            return (
              <div
                key={acc.id}
                className={`rounded-lg border-2 p-3 transition-all ${
                  isEquipped
                    ? "border-neon-cyan bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10"
                    : "border-line bg-surface hover:border-neon-purple"
                }`}
              >
                {/* Accessory emoji */}
                <div className="mb-2 text-center text-4xl">{acc.emoji}</div>

                {/* Name & description */}
                <div className="mb-2">
                  <p className="text-xs font-bold text-text">{acc.name}</p>
                  <p className="text-[10px] text-haze">{acc.description}</p>
                </div>

                {/* Cost & owned count */}
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-brand">💎 {acc.cost}</span>
                  {owned > 0 && (
                    <span className="rounded bg-neon-purple/20 px-1.5 py-0.5 font-bold text-neon-purple">
                      ×{owned}
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div className="space-y-1">
                  <button
                    onClick={() => buyAccessory(acc)}
                    disabled={game.crystals < acc.cost}
                    className="w-full rounded bg-brand px-2 py-1 text-xs font-bold text-text disabled:opacity-50 hover:bg-brand/80 transition-colors"
                  >
                    Buy
                  </button>
                  {owned > 0 && (
                    <button
                      onClick={() => equipAccessory(acc.id)}
                      className={`w-full rounded px-2 py-1 text-xs font-bold transition-colors ${
                        isEquipped
                          ? "bg-neon-cyan text-text"
                          : "bg-neon-purple/30 text-neon-purple hover:bg-neon-purple/50"
                      }`}
                    >
                      {isEquipped ? "✓ Equipped" : "Equip"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
