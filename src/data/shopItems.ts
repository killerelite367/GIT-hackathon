export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "rose", name: "Rose", emoji: "🌹", cost: 50, description: "Classic red rose" },
  { id: "sunflower", name: "Sunflower", emoji: "🌻", cost: 40, description: "Bright and cheerful" },
  { id: "lily", name: "Lily", emoji: "🪷", cost: 45, description: "Elegant white lily" },
  { id: "tulip", name: "Tulip", emoji: "🌷", cost: 35, description: "Spring beauty" },
  { id: "cherry", name: "Cherry Blossom", emoji: "🌸", cost: 60, description: "Delicate pink petals" },
  { id: "hibiscus", name: "Hibiscus", emoji: "🌺", cost: 55, description: "Tropical vibes" },
  { id: "daisy", name: "Daisy", emoji: "🌼", cost: 30, description: "Simple and cute" },
  { id: "lotus", name: "Lotus", emoji: "🪷", cost: 70, description: "Mystical power" },
];

export const SHOP_ITEM_BY_ID: Record<string, ShopItem> = Object.fromEntries(
  SHOP_ITEMS.map((i) => [i.id, i])
);
