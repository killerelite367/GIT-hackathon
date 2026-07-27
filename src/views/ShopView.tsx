import { useStore } from "../store/StoreContext";
import { SHOP_ITEMS, type ShopItem } from "../data/shopItems";

export default function ShopView() {
  const { data, updateData } = useStore();
  const { game } = data;

  const buyItem = (item: ShopItem) => {
    if (game.crystals < item.cost) {
      alert(`Not enough diamonds! Need ${item.cost}, have ${game.crystals}`);
      return;
    }

    updateData({
      ...data,
      game: {
        ...game,
        crystals: game.crystals - item.cost,
        accessories: { ...game.accessories, [item.id]: (game.accessories[item.id] || 0) + 1 },
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

      <p className="text-xs text-haze">
        Bought flowers show up in your <strong className="text-night">GPA Garden</strong> tray, ready to place.
        Want a pet in the garden instead? Summon a Study Spirit — those go in the garden too.
      </p>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-haze">🌸 Flower Shop</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SHOP_ITEMS.map((item) => {
            const owned = game.accessories[item.id] || 0;

            return (
              <div
                key={item.id}
                className={`rounded-lg border-2 p-3 transition-all ${
                  owned > 0 ? "border-neon-cyan/50 bg-neon-cyan/5" : "border-line bg-surface hover:border-neon-purple"
                }`}
              >
                <div className="mb-2 text-center text-4xl">{item.emoji}</div>

                <div className="mb-2">
                  <p className="text-xs font-bold text-night">{item.name}</p>
                  <p className="text-[10px] text-haze">{item.description}</p>
                </div>

                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-brand">💎 {item.cost}</span>
                  {owned > 0 && (
                    <span className="rounded bg-neon-purple/20 px-1.5 py-0.5 font-bold text-neon-purple">
                      ×{owned}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => buyItem(item)}
                  disabled={game.crystals < item.cost}
                  className="w-full rounded bg-brand px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-brand/80 disabled:opacity-50"
                >
                  Buy
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
