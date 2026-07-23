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

export interface Spirit {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  /** Short flavour of what this spirit "does" for you. */
  buff: string;
  /** XP multiplier bonus while equipped (0.1 = +10% XP). */
  xpBonus: number;
  /** One-line character blurb for the collection view. */
  blurb: string;
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
    glow: "rgba(255,255,255,0.3)",
  },
  rare: {
    label: "Rare",
    weight: 28,
    text: "text-neon-cyan",
    border: "border-neon-cyan/50",
    glow: "rgba(143,176,201,0.45)",
  },
  epic: {
    label: "Epic",
    weight: 9,
    text: "text-neon-purple",
    border: "border-neon-purple/60",
    glow: "rgba(167,148,209,0.5)",
  },
  legendary: {
    label: "Legendary",
    weight: 3,
    text: "text-neon-green",
    border: "border-neon-green/70",
    glow: "rgba(224,168,77,0.55)",
  },
};

export const RARITY_ORDER: Rarity[] = ["common", "rare", "epic", "legendary"];

/** The full roster. Themed around study tools & scholarly creatures. */
export const SPIRITS: Spirit[] = [
  // ── Common ──────────────────────────────────────────────
  { id: "pomo", name: "Pomo", emoji: "🍅", rarity: "common", xpBonus: 0.02, buff: "+2% XP", blurb: "A tireless little tomato timer. Ticks away so you don't have to." },
  { id: "inky", name: "Inky", emoji: "🖊️", rarity: "common", xpBonus: 0.02, buff: "+2% XP", blurb: "Never runs dry. Turns blank pages into finished reflections." },
  { id: "flashy", name: "Flashy", emoji: "🃏", rarity: "common", xpBonus: 0.02, buff: "+2% XP", blurb: "A flashcard sprite that whispers definitions before quizzes." },
  { id: "mocha", name: "Mocha", emoji: "☕", rarity: "common", xpBonus: 0.03, buff: "+3% XP", blurb: "Warm, dependable, mildly over-caffeinated study buddy." },
  { id: "clip", name: "Clip", emoji: "📎", rarity: "common", xpBonus: 0.02, buff: "+2% XP", blurb: "Keeps every group-project doc from falling apart. Literally." },

  // ── Rare ────────────────────────────────────────────────
  { id: "foxfocus", name: "Focus Fox", emoji: "🦊", rarity: "rare", xpBonus: 0.08, buff: "+8% XP", blurb: "Sharp-eyed and single-minded. Distractions don't stand a chance." },
  { id: "owlbiblio", name: "Biblio", emoji: "🦉", rarity: "rare", xpBonus: 0.08, buff: "+8% XP", blurb: "A night-owl librarian who's read everything, twice." },
  { id: "serpentstreak", name: "Streak Serpent", emoji: "🐍", rarity: "rare", xpBonus: 0.1, buff: "+10% XP", blurb: "Coils tighter with every day you show up. Guards your streak." },

  // ── Epic ────────────────────────────────────────────────
  { id: "chrono", name: "Chrono", emoji: "⏳", rarity: "epic", xpBonus: 0.18, buff: "+18% XP", blurb: "Keeper of deadlines. Bends time so your plan always fits." },
  { id: "nova", name: "Nova", emoji: "🌟", rarity: "epic", xpBonus: 0.2, buff: "+20% XP", blurb: "Pure motivation given form. Burns brightest at 2am." },

  // ── Legendary ───────────────────────────────────────────
  { id: "sage", name: "Sage", emoji: "🐉", rarity: "legendary", xpBonus: 0.33, buff: "+33% XP", blurb: "The Dean's Dragon. Hoards knowledge instead of gold." },
  { id: "athena", name: "Athena", emoji: "👑", rarity: "legendary", xpBonus: 0.35, buff: "+35% XP", blurb: "Scholar-sovereign of the quest. Wisdom incarnate, GPA immaculate." },
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
