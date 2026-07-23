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

export type Rarity = "common" | "rare" | "epic" | "legendary";

/** Drawing recipe for a spirit's cute textbook-buddy character. */
export interface SpiritArt {
  body: string; // cover colour
  trim: string; // darker outline / limbs
  belly: string; // page / label colour
  accessory: "none" | "cat-ears" | "glasses" | "sparkle" | "star" | "horns" | "crown";
}

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
}

export interface RarityMeta {
  label: string;
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
    label: "Common",
    weight: 60,
    text: "text-white/70",
    border: "border-white/20",
    glow: "rgba(255,255,255,0.35)",
  },
  rare: {
    label: "Rare",
    weight: 28,
    text: "text-neon-cyan",
    border: "border-neon-cyan/50",
    glow: "rgba(95,208,255,0.55)",
  },
  epic: {
    label: "Epic",
    weight: 9,
    text: "text-neon-purple",
    border: "border-neon-purple/60",
    glow: "rgba(169,139,255,0.6)",
  },
  legendary: {
    label: "Legendary",
    weight: 3,
    text: "text-neon-yellow",
    border: "border-neon-yellow/70",
    glow: "rgba(255,225,77,0.7)",
  },
};

export const RARITY_ORDER: Rarity[] = ["common", "rare", "epic", "legendary"];

/** The full roster — a family of cute flavoured "snack-book" buddies. */
export const SPIRITS: Spirit[] = [
  // ── Common — flavoured textbooks ────────────────────────
  {
    id: "pomo", name: "Butterbook", emoji: "🧈", rarity: "common", xpBonus: 0.02, buff: "+2% XP",
    blurb: "A warm slab of butter-yellow textbook. Melts study stress away.",
    art: { body: "#ffdd7a", trim: "#e0af3c", belly: "#fff3cf", accessory: "none" },
  },
  {
    id: "inky", name: "Chocobook", emoji: "🍫", rarity: "common", xpBonus: 0.02, buff: "+2% XP",
    blurb: "Rich cocoa covers. Sweetens even the driest chapter.",
    art: { body: "#8a5233", trim: "#5f3620", belly: "#cf9264", accessory: "none" },
  },
  {
    id: "flashy", name: "Matchabook", emoji: "🍵", rarity: "common", xpBonus: 0.02, buff: "+2% XP",
    blurb: "Grassy-green and quietly focused. Sips knowledge slowly.",
    art: { body: "#9fd47c", trim: "#68a544", belly: "#e6f6d4", accessory: "none" },
  },
  {
    id: "mocha", name: "Berrybook", emoji: "🍓", rarity: "common", xpBonus: 0.03, buff: "+3% XP",
    blurb: "Strawberry-pink and endlessly encouraging. Never gives up on you.",
    art: { body: "#ff9ec4", trim: "#e56fa0", belly: "#ffdcea", accessory: "none" },
  },
  {
    id: "clip", name: "Blueberrybook", emoji: "🫐", rarity: "common", xpBonus: 0.02, buff: "+2% XP",
    blurb: "Cool blueberry cover. Keeps a clear head under deadlines.",
    art: { body: "#7aa7ff", trim: "#5178dd", belly: "#d9e6ff", accessory: "none" },
  },

  // ── Rare ────────────────────────────────────────────────
  {
    id: "foxfocus", name: "Caramel Cub", emoji: "🦊", rarity: "rare", xpBonus: 0.08, buff: "+8% XP",
    blurb: "A caramel textbook with little fox ears. Sniffs out distractions.",
    art: { body: "#eaa24d", trim: "#c47a28", belly: "#ffe1b8", accessory: "cat-ears" },
  },
  {
    id: "owlbiblio", name: "Professor Grape", emoji: "🍇", rarity: "rare", xpBonus: 0.08, buff: "+8% XP",
    blurb: "A grape-purple tome in tiny spectacles. Has read everything, twice.",
    art: { body: "#b07adf", trim: "#8b53c0", belly: "#e7d4f7", accessory: "glasses" },
  },
  {
    id: "serpentstreak", name: "Minty", emoji: "🌿", rarity: "rare", xpBonus: 0.1, buff: "+10% XP",
    blurb: "Fresh mint cover that coils around your streak and guards it.",
    art: { body: "#66e0c0", trim: "#37b697", belly: "#d3f7ec", accessory: "sparkle" },
  },

  // ── Epic ────────────────────────────────────────────────
  {
    id: "chrono", name: "Honey Chrono", emoji: "⏳", rarity: "epic", xpBonus: 0.18, buff: "+18% XP",
    blurb: "Golden honey pages that bend time so your plan always fits.",
    art: { body: "#ffc531", trim: "#e0a013", belly: "#fff0c2", accessory: "star" },
  },
  {
    id: "nova", name: "Cosmic Nova", emoji: "🌟", rarity: "epic", xpBonus: 0.2, buff: "+20% XP",
    blurb: "A starlit textbook — pure motivation. Burns brightest at 2am.",
    art: { body: "#8a6bff", trim: "#6247e0", belly: "#ded6ff", accessory: "sparkle" },
  },

  // ── Legendary ───────────────────────────────────────────
  {
    id: "sage", name: "Sage the Dragonbook", emoji: "🐉", rarity: "legendary", xpBonus: 0.33, buff: "+33% XP",
    blurb: "The Dean's dragon in book form. Hoards knowledge instead of gold.",
    art: { body: "#ffd76a", trim: "#cf9a24", belly: "#fff2c8", accessory: "horns" },
  },
  {
    id: "athena", name: "Queen Athena", emoji: "👑", rarity: "legendary", xpBonus: 0.35, buff: "+35% XP",
    blurb: "Crowned scholar-sovereign. Wisdom incarnate, GPA immaculate.",
    art: { body: "#ffe7a1", trim: "#d9b64a", belly: "#fff6d6", accessory: "crown" },
  },
];

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

/** Roll restricted to Epic or Legendary (used by the pity guarantee). */
function rollEpicPlus(): Rarity {
  const epic = RARITY.epic.weight;
  const legendary = RARITY.legendary.weight;
  return Math.random() * (epic + legendary) < legendary ? "legendary" : "epic";
}

const isEpicPlus = (r: Rarity) => r === "epic" || r === "legendary";

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
    if (pity >= PITY_THRESHOLD) {
      rarity = rollEpicPlus();
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
