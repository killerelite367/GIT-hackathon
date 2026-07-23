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
  | "epic"
  | "legendary"
  | "mythic"
  | "ultramythic"
  | "chromatic"
  | "demon"
  | "secret";

/** Drawing recipe for a spirit's cute textbook-buddy character. */
export interface SpiritArt {
  body: string; // cover colour
  trim: string; // darker outline / limbs
  belly: string; // page / label colour
  accessory: "none" | "cat-ears" | "glasses" | "sparkle" | "star" | "horns" | "crown";
  rainbow?: boolean; // cycle hue (chromatic tier)
  angry?: boolean; // angled brows (demon tier)
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
  /** What the character says out loud when summoned. */
  voice?: string;
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
    label: "Common", tier: 0, weight: 60,
    text: "text-white/70", border: "border-white/20", glow: "rgba(255,255,255,0.35)",
  },
  rare: {
    label: "Rare", tier: 1, weight: 28,
    text: "text-neon-cyan", border: "border-neon-cyan/50", glow: "rgba(95,208,255,0.55)",
  },
  epic: {
    label: "Epic", tier: 2, weight: 9,
    text: "text-neon-purple", border: "border-neon-purple/60", glow: "rgba(169,139,255,0.6)",
  },
  legendary: {
    label: "Legendary", tier: 3, weight: 3,
    text: "text-neon-yellow", border: "border-neon-yellow/70", glow: "rgba(255,225,77,0.7)",
  },
  mythic: {
    label: "Mythic", tier: 4, weight: 1.4,
    text: "text-[#ff6fd6]", border: "border-[#ff6fd6]/70", glow: "rgba(255,111,214,0.75)",
  },
  ultramythic: {
    label: "Ultra Mythic", tier: 5, weight: 0.55,
    text: "text-[#ff9a3d]", border: "border-[#ff9a3d]/70", glow: "rgba(255,154,61,0.8)",
  },
  chromatic: {
    label: "Chromatic", tier: 6, weight: 0.22,
    text: "text-[#7dffd0]", border: "border-[#7dffd0]/70", glow: "rgba(125,255,208,0.85)",
  },
  demon: {
    label: "Demon", tier: 7, weight: 0.09,
    text: "text-[#ff3b5c]", border: "border-[#ff3b5c]/80", glow: "rgba(255,59,92,0.9)",
  },
  secret: {
    label: "???", tier: 8, weight: 0.03,
    text: "text-white", border: "border-white/80", glow: "rgba(200,255,255,0.95)",
  },
};

export const RARITY_ORDER: Rarity[] = [
  "common", "rare", "epic", "legendary",
  "mythic", "ultramythic", "chromatic", "demon", "secret",
];

/** The tier at and above which a spirit gets the grand "awakening" reveal. */
export const AWAKEN_TIER = 3; // legendary+

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
  {
    id: "volt", name: "Voltbook", emoji: "⚡", rarity: "epic", xpBonus: 0.22, buff: "+22% XP",
    blurb: "Crackling with energy. Zaps you awake for that 8am class.",
    art: { body: "#6f8bff", trim: "#4a5bd0", belly: "#d6dcff", accessory: "star" },
  },

  // ── Legendary ───────────────────────────────────────────
  {
    id: "sage", name: "Sage the Dragonbook", emoji: "🐉", rarity: "legendary", xpBonus: 0.33, buff: "+33% XP",
    blurb: "The Dean's dragon in book form. Hoards knowledge instead of gold.",
    art: { body: "#ffd76a", trim: "#cf9a24", belly: "#fff2c8", accessory: "horns" },
    voice: "Rooar! Your knowledge... grows stronger!",
  },
  {
    id: "athena", name: "Queen Athena", emoji: "👑", rarity: "legendary", xpBonus: 0.35, buff: "+35% XP",
    blurb: "Crowned scholar-sovereign. Wisdom incarnate, GPA immaculate.",
    art: { body: "#ffe7a1", trim: "#d9b64a", belly: "#fff6d6", accessory: "crown" },
    voice: "By my crown, we shall ace this semester!",
  },
  {
    id: "titanus", name: "Titanus", emoji: "🛡️", rarity: "legendary", xpBonus: 0.34, buff: "+34% XP",
    blurb: "A steel-bound tome that guards your focus like a fortress.",
    art: { body: "#cfd6e0", trim: "#8a93a3", belly: "#eef2f7", accessory: "crown" },
    voice: "None shall pass... without studying!",
  },

  // ── Mythic ──────────────────────────────────────────────
  {
    id: "prisma", name: "Prisma", emoji: "🔮", rarity: "mythic", xpBonus: 0.5, buff: "+50% XP",
    blurb: "A mythic tome humming with pink energy. Bends focus to its will.",
    art: { body: "#ff6fd6", trim: "#d63fb0", belly: "#ffd6f2", accessory: "sparkle" },
    voice: "Mythic power... awakened! Let's go!",
  },
  {
    id: "aurora", name: "Aurora", emoji: "🌌", rarity: "mythic", xpBonus: 0.52, buff: "+52% XP",
    blurb: "Glows with northern lights. Makes even 3am revision feel magical.",
    art: { body: "#6fe0ff", trim: "#3aa8d0", belly: "#d6f6ff", accessory: "sparkle" },
    voice: "Shining bright, just like you!",
  },
  {
    id: "seraph", name: "Seraph", emoji: "😇", rarity: "mythic", xpBonus: 0.55, buff: "+55% XP",
    blurb: "A radiant tome of blessings. Answers your prayers before finals.",
    art: { body: "#fff0b0", trim: "#e0c34a", belly: "#fffbe0", accessory: "star" },
    voice: "Blessings upon your grades!",
  },

  // ── Ultra Mythic ────────────────────────────────────────
  {
    id: "solaris", name: "Solaris", emoji: "☀️", rarity: "ultramythic", xpBonus: 0.75, buff: "+75% XP",
    blurb: "A blazing sun-book. Feel the burn... of pure productivity.",
    art: { body: "#ff9a3d", trim: "#e0670f", belly: "#ffe0b0", accessory: "star" },
    voice: "Feel the burning power of study!",
  },
  {
    id: "vortex", name: "Vortex", emoji: "🌀", rarity: "ultramythic", xpBonus: 0.78, buff: "+78% XP",
    blurb: "A spiralling tome that pulls every distraction into oblivion.",
    art: { body: "#b06bff", trim: "#7a3fd0", belly: "#e6d6ff", accessory: "sparkle" },
    voice: "Round and round... into focus!",
  },
  {
    id: "genesis", name: "Genesis", emoji: "✨", rarity: "ultramythic", xpBonus: 0.8, buff: "+80% XP",
    blurb: "The first textbook. Every subject was born from its pages.",
    art: { body: "#ff6f8f", trim: "#d63f6a", belly: "#ffd6df", accessory: "star" },
    voice: "A new beginning... let's ace it!",
  },

  // ── Chromatic ───────────────────────────────────────────
  {
    id: "chroma", name: "Chroma", emoji: "🌈", rarity: "chromatic", xpBonus: 1.0, buff: "+100% XP",
    blurb: "A shifting rainbow textbook. Every colour, every subject, mastered.",
    art: { body: "#ff5fa2", trim: "#ffffff", belly: "#ffffff", accessory: "sparkle", rainbow: true },
    voice: "Taste the rainbow of knowledge!",
  },
  {
    id: "spectra", name: "Spectra", emoji: "💠", rarity: "chromatic", xpBonus: 1.05, buff: "+105% XP",
    blurb: "Refracts pure knowledge into a spectrum of straight-A grades.",
    art: { body: "#5fd0ff", trim: "#ffffff", belly: "#ffffff", accessory: "star", rainbow: true },
    voice: "Every colour, every subject, mastered!",
  },

  // ── Demon ───────────────────────────────────────────────
  {
    id: "malachor", name: "Malachor", emoji: "😈", rarity: "demon", xpBonus: 1.5, buff: "+150% XP",
    blurb: "A textbook forged in the fires of finals week. Deadlines fear it.",
    art: { body: "#3a0e18", trim: "#ff3b5c", belly: "#ff3b5c", accessory: "horns", angry: true },
    voice: "Your deadlines... shall PERISH.",
  },
  {
    id: "diabolus", name: "Diabolus", emoji: "👹", rarity: "demon", xpBonus: 1.55, buff: "+155% XP",
    blurb: "Lord of the all-nighter. It does not sleep, and neither will you.",
    art: { body: "#2a0810", trim: "#ff5a2c", belly: "#ff7a2c", accessory: "horns", angry: true },
    voice: "Burn the midnight oil... FOREVER.",
  },

  // ── ??? (Secret) ────────────────────────────────────────
  {
    id: "secret", name: "???", emoji: "❓", rarity: "secret", xpBonus: 2.0, buff: "+200% XP",
    blurb: "It should not exist. Yet here it is, watching you study.",
    art: { body: "#0d0d16", trim: "#b8ffff", belly: "#6fffff", accessory: "sparkle" },
    voice: "You were not... supposed to find me.",
  },
  {
    id: "secret2", name: "???", emoji: "⬛", rarity: "secret", xpBonus: 2.1, buff: "+210% XP",
    blurb: "The other one. There were never supposed to be two.",
    art: { body: "#0a0a12", trim: "#ff6fff", belly: "#b8ffff", accessory: "sparkle" },
    voice: "Two of us now... impossible.",
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
