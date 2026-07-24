import type { Assignment, GameState } from "../types";

/**
 * StudyQuest Gacha — "Study Spirits".
 *
 * The twist that separates this from every coin-shop gacha: the ONLY currency is
 * studying. You earn Focus Crystals by completing real coursework, then spend
 * them to summon collectible Study Spirits. No real money, ever. The pull is a
 * reward for doing the work — so the game loop literally promotes studying.
 *
 * Each Spirit carries a small, honest buff (an XP multiplier when equipped) so
 * collecting also compounds motivation instead of being pure cosmetics.
 */

export type Rarity =
  | "common"
  | "rare"
  | "ultrarare"
  | "epic"
  | "legendary"
  | "mythic"
  | "ultramythic"
  | "chromatic"
  | "demon"
  | "cloud"
  | "secret";

/**
 * The gacha-machine "destruction" cinematic escalates by tier group, per the
 * Master GDD §6/§7. Higher groups = more of the machine/UI is destroyed.
 */
export type DestructionGroup =
  | "conveyor" // common/rare — normal clunk, hatch, conveyor slide-out
  | "overheat" // ultrarare/epic — glass cracks, flavour burst shatters panel
  | "meltdown" // legendary/mythic — machine melts to liquid, hero rises from abyss
  | "reality" // ultramythic/chromatic — glitches out of reality, space-time tear
  | "fire" // demon — UI catches fire, burns to ash, bites through the screen
  | "cloud" // cloud — gravity reverses, machine floats up, hero descends from fog
  | "freeze"; // secret — fake fatal error, glass shatter, emerges from the void

/** Drawing recipe for a spirit's cute textbook-buddy character. */
export interface SpiritArt {
  body: string; // cover colour
  trim: string; // darker outline / limbs
  belly: string; // page / label colour
  accessory: "none" | "cat-ears" | "glasses" | "sparkle" | "star" | "horns" | "crown";
  rainbow?: boolean; // cycle hue (chromatic tier)
  angry?: boolean; // angled brows (demon tier)
}

/**
 * The eight premium elemental themes from the VFX Bible. When a spirit has an
 * `element`, it uses the cinematic 4-phase summon (Environmental Overwrite →
 * Breach → Climax → Idle) and the detailed PremiumArt character instead of the
 * cute snack-book flow.
 */
export type Element =
  | "fire"
  | "light"
  | "glitch"
  | "water"
  | "time"
  | "void"
  | "earth"
  | "crystal";

export interface Spirit {
  id: string;
  name: string;
  emoji: string; // small flavour icon (used in toasts)
  rarity: Rarity;
  /** Short flavour of what this spirit "does" for you. */
  buff: string;
  /** XP multiplier bonus while equipped (0.1 = +10% XP). */
  xpBonus: number;
  /** One-line character blurb for the collection view. */
  blurb: string;
  /** How to draw the character. */
  art: SpiritArt;
  /** What the character says out loud when summoned. */
  voice?: string;
  /** Epithet subtitle, e.g. "Demon of the Burning Midnight Oil". */
  title?: string;
  /** Premium cinematic element theme (VFX Bible characters only). */
  element?: Element;
  /** The real-world food this textbook is fused with (GDD "Base Form"). */
  food?: string;
}

/** Which gacha-machine destruction cinematic a rarity triggers (GDD §6/§7). */
export function destructionGroup(r: Rarity): DestructionGroup {
  switch (r) {
    case "common":
    case "rare":
      return "conveyor";
    case "ultrarare":
    case "epic":
      return "overheat";
    case "legendary":
    case "mythic":
      return "meltdown";
    case "ultramythic":
    case "chromatic":
      return "reality";
    case "demon":
      return "fire";
    case "cloud":
      return "cloud";
    case "secret":
      return "freeze";
  }
}

export interface RarityMeta {
  label: string;
  /** Rank, 0 = common. Higher = rarer = grander reveal. */
  tier: number;
  /** Draw weight (relative probability). */
  weight: number;
  /** Tailwind text colour class. */
  text: string;
  /** Tailwind border colour class. */
  border: string;
  /** rgba glow used in inline styles for the summon flare. */
  glow: string;
}

export const RARITY: Record<Rarity, RarityMeta> = {
  common: {
    label: "Common", tier: 0, weight: 55,
    text: "text-white/70", border: "border-white/20", glow: "rgba(255,255,255,0.35)",
  },
  rare: {
    label: "Rare", tier: 1, weight: 25,
    text: "text-[#5fd0ff]", border: "border-[#5fd0ff]/50", glow: "rgba(95,208,255,0.55)",
  },
  ultrarare: {
    label: "Ultra Rare", tier: 2, weight: 11,
    text: "text-[#5fffb0]", border: "border-[#5fffb0]/60", glow: "rgba(95,255,176,0.6)",
  },
  epic: {
    label: "Epic", tier: 3, weight: 5,
    text: "text-[#a98bff]", border: "border-[#a98bff]/60", glow: "rgba(169,139,255,0.6)",
  },
  legendary: {
    label: "Legendary", tier: 4, weight: 2.4,
    text: "text-[#ffe14d]", border: "border-[#ffe14d]/70", glow: "rgba(255,225,77,0.7)",
  },
  mythic: {
    label: "Mythic", tier: 5, weight: 1.2,
    text: "text-[#ff6fd6]", border: "border-[#ff6fd6]/70", glow: "rgba(255,111,214,0.75)",
  },
  ultramythic: {
    label: "Ultra Mythic", tier: 6, weight: 0.5,
    text: "text-[#ff9a3d]", border: "border-[#ff9a3d]/70", glow: "rgba(255,154,61,0.8)",
  },
  chromatic: {
    label: "Chromatic", tier: 7, weight: 0.25,
    text: "text-[#7dffd0]", border: "border-[#7dffd0]/70", glow: "rgba(125,255,208,0.85)",
  },
  demon: {
    label: "Demon", tier: 8, weight: 0.1,
    text: "text-[#ff3b5c]", border: "border-[#ff3b5c]/80", glow: "rgba(255,59,92,0.9)",
  },
  cloud: {
    label: "Cloud", tier: 9, weight: 0.04,
    text: "text-[#bfe3ff]", border: "border-[#bfe3ff]/80", glow: "rgba(191,227,255,0.9)",
  },
  secret: {
    label: "???", tier: 10, weight: 0.02,
    text: "text-white", border: "border-white/80", glow: "rgba(200,255,255,0.95)",
  },
};

export const RARITY_ORDER: Rarity[] = [
  "common", "rare", "ultrarare", "epic", "legendary", "mythic",
  "ultramythic", "chromatic", "demon", "cloud", "secret",
];

/** The tier at and above which a spirit gets the grand "awakening" reveal. */
export const AWAKEN_TIER = 4; // legendary+ (meltdown and grander) get the hero idle + speech

/** The full roster — a family of cute flavoured "snack-book" buddies. */
export const SPIRITS: Spirit[] = [
  // ── common ──
  {
    id: "apple", name: "Apple Math Primer", emoji: "🍎", rarity: "common", xpBonus: 0.02, buff: "+2% XP",
    food: "Red Apple",
    blurb: "A fusion of Red Apple and a Math Textbook.",
    art: { body: "#e23b3b", trim: "#9c1f1f", belly: "#ffd9d9", accessory: "none" },
  },
  {
    id: "grape", name: "Grape History Log", emoji: "🍇", rarity: "common", xpBonus: 0.02, buff: "+2% XP",
    food: "Concord Grapes",
    blurb: "A fusion of Concord Grapes and a Spiral Notebook.",
    art: { body: "#7a4bbf", trim: "#4f2f80", belly: "#e2d6f5", accessory: "none" },
  },
  {
    id: "bread", name: "Bread Physics Notes", emoji: "🍞", rarity: "common", xpBonus: 0.02, buff: "+2% XP",
    food: "Sliced Loaf",
    blurb: "A fusion of Sliced Loaf and a Notepad.",
    art: { body: "#e0b878", trim: "#b0863f", belly: "#fff0d6", accessory: "none" },
  },
  {
    id: "carrot", name: "Carrot Biology Binder", emoji: "🥕", rarity: "common", xpBonus: 0.02, buff: "+2% XP",
    food: "Root Carrot",
    blurb: "A fusion of Root Carrot and a Ring Binder.",
    art: { body: "#ef8a3a", trim: "#c05f1a", belly: "#ffe0c0", accessory: "none" },
  },
  {
    id: "milk", name: "Milk Carton Diary", emoji: "🥛", rarity: "common", xpBonus: 0.02, buff: "+2% XP",
    food: "Carton of Milk",
    blurb: "A fusion of Carton of Milk and a Pocket Diary.",
    art: { body: "#eef2f7", trim: "#b8c2cf", belly: "#ffffff", accessory: "none" },
  },
  // ── rare ──
  {
    id: "strawberry", name: "Strawberry Jam Essay", emoji: "🍓", rarity: "rare", xpBonus: 0.05, buff: "+5% XP",
    food: "Strawberry Jam",
    blurb: "A fusion of Strawberry Jam and a Essay Draft.",
    art: { body: "#ff5f7a", trim: "#d63f5a", belly: "#ffd6de", accessory: "none" },
  },
  {
    id: "watermelon", name: "Watermelon Geometry Atlas", emoji: "🍉", rarity: "rare", xpBonus: 0.05, buff: "+5% XP",
    food: "Sliced Watermelon",
    blurb: "A fusion of Sliced Watermelon and a Atlas.",
    art: { body: "#ff6b8a", trim: "#3a9b4a", belly: "#ffd6de", accessory: "none" },
  },
  {
    id: "bento", name: "Bento Box Syllabus", emoji: "🍱", rarity: "rare", xpBonus: 0.05, buff: "+5% XP",
    food: "Japanese Bento",
    blurb: "A fusion of Japanese Bento and a Syllabus.",
    art: { body: "#e8623a", trim: "#7a3a20", belly: "#ffd8c8", accessory: "none" },
  },
  {
    id: "cheese", name: "Cheese Wheel Dictionary", emoji: "🧀", rarity: "rare", xpBonus: 0.05, buff: "+5% XP",
    food: "Swiss Cheese",
    blurb: "A fusion of Swiss Cheese and a Hardcover Dictionary.",
    art: { body: "#ffcf4d", trim: "#d9a52a", belly: "#fff2c8", accessory: "none" },
  },
  {
    id: "pancake", name: "Pancake Sketchbook", emoji: "🥞", rarity: "rare", xpBonus: 0.05, buff: "+5% XP",
    food: "Flapjacks & Syrup",
    blurb: "A fusion of Flapjacks & Syrup and a Leather Sketchbook.",
    art: { body: "#e0a860", trim: "#b07a30", belly: "#ffe6bf", accessory: "none" },
  },
  // ── ultrarare ──
  {
    id: "taco", name: "Spicy Taco Flashcards", emoji: "🌮", rarity: "ultrarare", xpBonus: 0.08, buff: "+8% XP",
    food: "Hard Shell Taco",
    blurb: "A fusion of Hard Shell Taco and a Flashcard Ring.",
    art: { body: "#e8a23a", trim: "#b06a1a", belly: "#ffe0b0", accessory: "none" },
  },
  {
    id: "sushi", name: "Sushi Roll Scroll", emoji: "🍣", rarity: "ultrarare", xpBonus: 0.08, buff: "+8% XP",
    food: "Maki Sushi",
    blurb: "A fusion of Maki Sushi and a Ancient Scroll.",
    art: { body: "#ff8a7a", trim: "#2a2a2a", belly: "#ffd8cf", accessory: "none" },
  },
  {
    id: "lemonade", name: "Lemonade Calculus", emoji: "🍋", rarity: "ultrarare", xpBonus: 0.08, buff: "+8% XP",
    food: "Iced Lemonade",
    blurb: "A fusion of Iced Lemonade and a Calculus Tome.",
    art: { body: "#ffe14d", trim: "#d9b52a", belly: "#fff6c0", accessory: "none" },
  },
  {
    id: "coffee", name: "Coffee Bean Thesis", emoji: "☕", rarity: "ultrarare", xpBonus: 0.09, buff: "+9% XP",
    food: "Espresso Beans",
    blurb: "A fusion of Espresso Beans and a Bound Thesis.",
    art: { body: "#6a4326", trim: "#2f1a0e", belly: "#b58a5c", accessory: "none" },
  },
  {
    id: "ramen", name: "Ramen Bowl Encyclopedia", emoji: "🍜", rarity: "ultrarare", xpBonus: 0.08, buff: "+8% XP",
    food: "Tonkotsu Ramen",
    blurb: "A fusion of Tonkotsu Ramen and a Encyclopedia.",
    art: { body: "#e8b84d", trim: "#b0863f", belly: "#ffe6b0", accessory: "none" },
  },
  // ── epic ──
  {
    id: "durian", name: "Durian Advanced Calc", emoji: "🍈", rarity: "epic", xpBonus: 0.12, buff: "+12% XP",
    food: "King of Fruits",
    blurb: "A fusion of King of Fruits and a Advanced Textbook.",
    art: { body: "#cfd44a", trim: "#7a8a2a", belly: "#eef0c0", accessory: "star" },
  },
  {
    id: "muffin", name: "Blueberry Muffin Lit", emoji: "🧁", rarity: "epic", xpBonus: 0.13, buff: "+13% XP",
    food: "Baked Muffin",
    blurb: "A fusion of Baked Muffin and a Literature Anthology.",
    art: { body: "#6a7bff", trim: "#3f4fd0", belly: "#d6dcff", accessory: "star" },
  },
  {
    id: "coconut", name: "Coconut Shell Geography", emoji: "🥥", rarity: "epic", xpBonus: 0.14, buff: "+14% XP",
    food: "Cracked Coconut",
    blurb: "A fusion of Cracked Coconut and a Globe & Map Book.",
    art: { body: "#8a6a4a", trim: "#5a3f2a", belly: "#e6d2bc", accessory: "star" },
  },
  // ── legendary ──
  {
    id: "matcha", name: "Matcha Layer Cake Thesis", emoji: "🍵", rarity: "legendary", xpBonus: 0.2, buff: "+20% XP",
    food: "Matcha Crepe Cake",
    blurb: "A fusion of Matcha Crepe Cake and a Doctoral Thesis.",
    art: { body: "#9fd67a", trim: "#5a9b3a", belly: "#e6f6d4", accessory: "crown" },
    voice: "The garden grows where I walk. Bow to the thesis.",
  },
  {
    id: "pomegranate", name: "Pomegranate Art History", emoji: "💎", rarity: "legendary", xpBonus: 0.21, buff: "+21% XP",
    food: "Jeweled Pomegranate",
    blurb: "A fusion of Jeweled Pomegranate and a Art Portfolio.",
    art: { body: "#d6395a", trim: "#8a1f3a", belly: "#ffd0da", accessory: "crown" },
    voice: "Every jewel is another chapter of history.",
  },
  {
    id: "honeycomb", name: "Honeycomb Music Theory", emoji: "🍯", rarity: "legendary", xpBonus: 0.22, buff: "+22% XP",
    food: "Raw Honeycomb",
    blurb: "A fusion of Raw Honeycomb and a Sheet Music Binder.",
    art: { body: "#ffb84d", trim: "#d98a2a", belly: "#ffe6b0", accessory: "crown" },
    voice: "Listen... the sweetest symphony of knowledge.",
  },
  // ── mythic ──
  {
    id: "dragonfruit", name: "Dragonfruit Cosmos Journal", emoji: "🐉", rarity: "mythic", xpBonus: 0.3, buff: "+30% XP",
    food: "Neon Dragonfruit",
    blurb: "A fusion of Neon Dragonfruit and a Astrophysics Journal.",
    art: { body: "#ff4fd0", trim: "#a02f9b", belly: "#ffd0f2", accessory: "sparkle" },
    voice: "I have charted every star in your curriculum.",
  },
  {
    id: "caviar", name: "Caviar Economics", emoji: "⚫", rarity: "mythic", xpBonus: 0.32, buff: "+32% XP",
    food: "Black Caviar",
    blurb: "A fusion of Black Caviar and a Grand Ledger.",
    art: { body: "#1a1a2a", trim: "#0a0a12", belly: "#4a4a6a", accessory: "crown" },
    voice: "Knowledge is the only currency that compounds.",
  },
  {
    id: "saffron", name: "Saffron Poetry", emoji: "🌾", rarity: "mythic", xpBonus: 0.34, buff: "+34% XP",
    food: "Saffron Threads",
    blurb: "A fusion of Saffron Threads and a Velvet Poetry Book.",
    art: { body: "#e8a23a", trim: "#b06a1a", belly: "#ffe0b0", accessory: "sparkle" },
    voice: "Rare as saffron, my verses will move you.",
  },
  // ── ultramythic ──
  {
    id: "truffle", name: "Golden Truffle Ledger", emoji: "🍄", rarity: "ultramythic", xpBonus: 0.5, buff: "+50% XP",
    food: "Gold Flake Truffle",
    blurb: "A fusion of Gold Flake Truffle and a Accounting Ledger.",
    art: { body: "#ffd76a", trim: "#cf9a24", belly: "#fff2c8", accessory: "star" },
    voice: "I do not walk. I simply arrive.",
  },
  {
    id: "peach", name: "White Peach Quantum Mech", emoji: "🍑", rarity: "ultramythic", xpBonus: 0.55, buff: "+55% XP",
    food: "Pristine White Peach",
    blurb: "A fusion of Pristine White Peach and a Quantum Physics Tome.",
    art: { body: "#ffd9cf", trim: "#ef9ea0", belly: "#fff0ec", accessory: "star" },
    voice: "I exist in every possible answer at once.",
  },
  // ── chromatic ──
  {
    id: "sherbet", name: "Rainbow Sherbet Anthology", emoji: "🌈", rarity: "chromatic", xpBonus: 0.75, buff: "+75% XP",
    food: "Melting Sherbet",
    blurb: "A fusion of Melting Sherbet and a Color Theory Book.",
    art: { body: "#ff5fa2", trim: "#ffffff", belly: "#ffffff", accessory: "sparkle", rainbow: true },
    voice: "Taste every colour of the spectrum!",
  },
  {
    id: "macaron", name: "Macaron Tower Linguistics", emoji: "🍬", rarity: "chromatic", xpBonus: 0.8, buff: "+80% XP",
    food: "Pastel Macarons",
    blurb: "A fusion of Pastel Macarons and a Language Dictionary.",
    art: { body: "#ffc0e0", trim: "#ffffff", belly: "#ffffff", accessory: "star", rainbow: true },
    voice: "A thousand tongues, all sweetly spoken.",
  },
  // ── demon ──
  {
    id: "ghostpepper", name: "Ghost Pepper Forbidden Grimoire", emoji: "🌶️", rarity: "demon", xpBonus: 1.0, buff: "+100% XP",
    food: "Ghost Pepper",
    blurb: "A fusion of Ghost Pepper and a Cursed Grimoire.",
    art: { body: "#3a0e08", trim: "#ff3b1a", belly: "#ff6a2c", accessory: "horns", angry: true },
    voice: "BURN, weeds of procrastination! BURN!",
  },
  {
    id: "blackgarlic", name: "Black Garlic Occult", emoji: "🧄", rarity: "demon", xpBonus: 1.1, buff: "+110% XP",
    food: "Fermented Black Garlic",
    blurb: "A fusion of Fermented Black Garlic and a Occult Manuscript.",
    art: { body: "#1a1420", trim: "#6a4a7a", belly: "#3a2a4a", accessory: "horns", angry: true },
    voice: "From the fermented dark... forbidden knowledge.",
  },
  // ── cloud ──
  {
    id: "cottoncandy", name: "Cotton Candy Philosophy", emoji: "☁️", rarity: "cloud", xpBonus: 1.3, buff: "+130% XP",
    food: "Spun Sugar",
    blurb: "A fusion of Spun Sugar and a Scroll of Ethics.",
    art: { body: "#ffc8ee", trim: "#bf9ad0", belly: "#ffe6f8", accessory: "sparkle" },
    voice: "Float with me, above every deadline.",
  },
  {
    id: "marshmallow", name: "Marshmallow Cloud Computing", emoji: "☁️", rarity: "cloud", xpBonus: 1.4, buff: "+140% XP",
    food: "Toasted Marshmallow",
    blurb: "A fusion of Toasted Marshmallow and a Tech Manual.",
    art: { body: "#fff0e0", trim: "#d9b89a", belly: "#fff8ee", accessory: "sparkle" },
    voice: "Soft, warm, and endlessly scalable.",
  },
  // ── secret ──
  {
    id: "almanac", name: "The Absolute Zero-Calorie Almanac", emoji: "❄️", rarity: "secret", xpBonus: 2.0, buff: "+200% XP",
    food: "Anti-Matter Ice",
    blurb: "A fusion of Anti-Matter Ice and a Forbidden Almanac.",
    art: { body: "#dfefff", trim: "#9fc0e0", belly: "#f0f8ff", accessory: "sparkle" },
    voice: "You were never meant to compute me.",
  },
  {
    id: "noodle", name: "The Infinite Noodle Paradox", emoji: "🍜", rarity: "secret", xpBonus: 2.1, buff: "+210% XP",
    food: "Endless Noodle Strand",
    blurb: "A fusion of Endless Noodle Strand and a Theoretical Physics Paper.",
    art: { body: "#f0e0b0", trim: "#c0a860", belly: "#fff6d6", accessory: "sparkle" },
    voice: "There is no end. Only more noodle.",
  },
];

/** The line a spirit speaks on reveal (falls back to a cheerful default). */
export function voiceLine(s: Spirit): string {
  return s.voice ?? "Let's study together!";
}

export const SPIRIT_BY_ID: Record<string, Spirit> = Object.fromEntries(
  SPIRITS.map((s) => [s.id, s])
);

// ── Economy ───────────────────────────────────────────────
/** Crystals a completed assignment awards (heavier work = more crystals). */
export function crystalsForCompletion(a: Assignment): number {
  return 20 + Math.round(a.weight * 1.5);
}

export const PULL_COST = 100; // single summon
export const MULTI_PULLS = 10;
export const MULTI_COST = 900; // 10-summon (one free)
/** Guaranteed Epic-or-better on the Nth pull without one. */
export const PITY_THRESHOLD = 10;

export interface PullOutcome {
  spirit: Spirit;
  isNew: boolean;
}

export interface PullResult {
  game: GameState;
  outcomes: PullOutcome[];
  spent: number;
}

export function pullCost(count: number): number {
  return count === MULTI_PULLS ? MULTI_COST : PULL_COST * count;
}

export function canAfford(game: GameState, count: number): boolean {
  return game.crystals >= pullCost(count);
}

function randomSpiritOf(rarity: Rarity): Spirit {
  const pool = SPIRITS.filter((s) => s.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Weighted rarity roll across the whole table. */
function rollRarity(): Rarity {
  const total = RARITY_ORDER.reduce((n, r) => n + RARITY[r].weight, 0);
  let roll = Math.random() * total;
  for (const r of RARITY_ORDER) {
    roll -= RARITY[r].weight;
    if (roll < 0) return r;
  }
  return "common";
}

/** Weighted roll restricted to rarities at or above `minTier`. */
function rollAtLeast(minTier: number, fallback: Rarity): Rarity {
  const pool = RARITY_ORDER.filter((r) => RARITY[r].tier >= minTier);
  const total = pool.reduce((n, r) => n + RARITY[r].weight, 0);
  let roll = Math.random() * total;
  for (const r of pool) {
    roll -= RARITY[r].weight;
    if (roll < 0) return r;
  }
  return fallback;
}

const isEpicPlus = (r: Rarity) => RARITY[r].tier >= RARITY.epic.tier;

/**
 * Demo "lucky" mode — when on, every pull is Legendary or better, so the grand
 * awakening animations can be shown on demand (e.g. to judges). Off by default.
 */
let luckyMode = false;
export function setLucky(v: boolean) {
  luckyMode = v;
}
export function isLucky() {
  return luckyMode;
}

/**
 * Perform `count` pulls. Pure over Math.random: reads crystals + pity from the
 * given game state and returns a brand-new state plus what was summoned.
 * Caller must check `canAfford` first.
 */
export function pull(game: GameState, count: number): PullResult {
  const spent = pullCost(count);
  const spirits = { ...game.spirits };
  let pity = game.pityCount;
  let equipped = game.equippedSpirit;
  const outcomes: PullOutcome[] = [];

  for (let i = 0; i < count; i++) {
    pity += 1;
    let rarity: Rarity;
    if (luckyMode) {
      rarity = rollAtLeast(RARITY.legendary.tier, "legendary");
    } else if (pity >= PITY_THRESHOLD) {
      rarity = rollAtLeast(RARITY.epic.tier, "epic");
    } else {
      rarity = rollRarity();
    }
    if (isEpicPlus(rarity)) pity = 0;

    const spirit = randomSpiritOf(rarity);
    const owned = spirits[spirit.id] ?? 0;
    spirits[spirit.id] = owned + 1;
    outcomes.push({ spirit, isNew: owned === 0 });

    // Auto-equip your very first spirit so the buff is live immediately.
    if (!equipped) equipped = spirit.id;
  }

  const next: GameState = {
    ...game,
    crystals: game.crystals - spent,
    spirits,
    pityCount: pity,
    equippedSpirit: equipped,
  };
  return { game: next, outcomes, spent };
}

/** XP multiplier from the currently equipped spirit (1 = none). */
export function equippedXpMultiplier(game: GameState): number {
  if (!game.equippedSpirit) return 1;
  const s = SPIRIT_BY_ID[game.equippedSpirit];
  return s ? 1 + s.xpBonus : 1;
}

/** How many distinct spirits are owned, for a "12 of N collected" line. */
export function collectionCount(game: GameState): { owned: number; total: number } {
  const owned = SPIRITS.filter((s) => (game.spirits[s.id] ?? 0) > 0).length;
  return { owned, total: SPIRITS.length };
}
