/**
 * AshLane procedural character generator — the infinite grunt roster.
 *
 * The owner doesn't want to hand-build every low-level fighter in Tripo.
 * This module generates unique, faction-flavored grunts from the Quaternius
 * CC0 base bodies + parts already in the repo.
 *
 * Design (from open-source research):
 *  - earth-online pattern: FIXED CATALOG + DETERMINISTIC RECIPES.
 *    The generator never creates meshes at runtime; it selects a recipe
 *    from a reviewed finite catalog. Same seed -> same grunt, every time.
 *  - undercity/fps-game-demo pattern: phenotype table -> body/hair/clothes
 *    variants, material tinting instead of new textures.
 *  - agentropolis-creator pattern: hero mode (hand-built, roster.ts) vs
 *    NPC population mode (this file). Named characters stay hand-made;
 *    everyone else comes from here.
 *
 * Usage:
 *    const grunt = generateGrunt("combine");          // random Combine thug
 *    const squad = generateSquad("hollows", 5, 1234);  // 5 seeded Hollows
 *    const fighter = gruntToFighter(grunt);            // LaneFighter for roster/sim
 *
 * Factions mirror docs/STORY_BIBLE.md §4.
 * Fighting styles mirror the Def Jam 5-style system (docs research).
 */

import * as THREE from "three";
import {
  QUATERNIUS_BODIES,
  QUATERNIUS_PARTS,
  partsFor,
  attachPart,
  tintSkin,
  type QuaterniusPart,
} from "./quaternius";

// ---------------------------------------------------------------------------
// Seeded RNG (mulberry32). Same seed -> same output, everywhere.
// ---------------------------------------------------------------------------

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one item from a weighted [item, weight] table using rng(). */
function weighted<T>(rng: () => number, table: [T, number][]): T {
  let total = 0;
  for (const [, w] of table) total += w;
  let roll = rng() * total;
  for (const [item, w] of table) {
    roll -= w;
    if (roll <= 0) return item;
  }
  return table[table.length - 1][0];
}

/** Random int in [min, max]. */
function ri(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Random float in [min, max]. */
function rf(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Pick a random element. */
function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FactionId = "ashes" | "combine" | "hollows" | "unaffiliated" | "painted" | "authority";

export type FightStyle =
  | "street"      // brawling, haymakers, dirty boxing
  | "boxing"      // jab/cross/hook fundamentals
  | "kickboxing"  // punches + kicks, range
  | "wrestling"   // grapples, throws, slams
  | "martial-arts"// fast technical strikes, evasive footwork
  | "lucha"       // high-flying, agile, aerial
  | "capoeira"    // ginga flow, esquivas, acrobatic kicks (16 Bannon clips)
  | "drunken"     // unpredictable sway, off-balance strikes (24 Bannon clips)
  | "muay-thai"   // elbows, knees, clinch, teeps
  | "mma"         // takedowns, ground-and-pound, submissions
  | "breakdance"; // b-boy footwork as fighting (6 Bannon clips)

export type ClothingPattern = "solid" | "camo" | "stripes" | "graffiti";

/**
 * A grunt recipe — pure data, JSON-serializable, deterministic from its seed.
 * This is what gets saved in mission data; the mesh is assembled at load.
 */
export type GruntRecipe = {
  seed: number;
  faction: FactionId;
  name: string;
  bodyId: "male" | "female";
  skinTone: number; // hex
  heightScale: number; // uniform root scale, ~0.92..1.08
  bulkScale: number; // x/z scale, ~0.85..1.18
  hairId: string | null;
  beard: boolean;
  browsId: string;
  shirtColor: number; // hex material tint
  pantsColor: number; // hex material tint
  accentColor: number; // faction color, hex
  pattern: ClothingPattern;
  patternSeed: number;
  style: FightStyle;
  level: number; // 1..5 grunt tier
  hpMul: number;
  dmgMul: number;
  speedMul: number;
  // Personality (docs/ROSTER_HIERARCHY.md §3-4)
  quirk: QuirkId;
  archetype: ArchetypeId;
  bio: string;
};

// ---------------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------------

/** Realistic skin tones, light -> dark. */
const SKIN_TONES = [
  0xf5d7b8, 0xeec39e, 0xe0ac82, 0xd19a6b, 0xc68642,
  0xb0713a, 0x9c6234, 0x8d5524, 0x74491f, 0x5c3a21,
] as const;

/** Faction definition: everything that makes a gang look like itself. */
export type FactionDef = {
  id: FactionId;
  label: string;
  motto: string;
  /** Shirt/jacket colors. */
  shirts: number[];
  /** Pants colors. */
  pants: number[];
  /** Faction accent (trim, tags, armbands). */
  accent: number;
  /** Skin tone distribution: [toneIndex, weight]. */
  skinDist: [number, number][];
  /** Body sex distribution: [bodyId, weight]. */
  bodyDist: ["male" | "female", number][];
  /** Height/bulk ranges. */
  height: [number, number];
  bulk: [number, number];
  /** Fighting style distribution: [style, weight]. */
  styles: [FightStyle, number][];
  /** Hair bias: "short" | "long" | "any". */
  hairBias: "short" | "long" | "any";
  beardChance: number;
  /** Street handles / names. */
  names: string[];
};

export const FACTIONS: Record<FactionId, FactionDef> = {
  ashes: {
    id: "ashes",
    label: "The Ashes",
    motto: "The block remembers.",
    shirts: [0x8a6f4d, 0x6b5b4c, 0x7a4a3a, 0x556b5d, 0x8c8c8c, 0x4a4a4a],
    pants: [0x3a3f4a, 0x2e2e2e, 0x4a3f30, 0x2f3a2f],
    accent: 0xff6b35, // ember orange
    skinDist: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]],
    bodyDist: [["male", 55], ["female", 45]],
    height: [0.94, 1.06],
    bulk: [0.92, 1.12],
    styles: [["street", 30], ["boxing", 20], ["wrestling", 15], ["kickboxing", 10], ["capoeira", 10], ["breakdance", 8], ["lucha", 5], ["drunken", 2]],
    hairBias: "any",
    beardChance: 0.3,
    names: ["Marv", "T", "Dez", "Rico", "Peanut", "Sable", "June", "Kilo", "Bo", "Nia", "Reyes", "Tasha", "Dre", "Lou", "Mica", "Sal"],
  },
  combine: {
    id: "combine",
    label: "The Combine",
    motto: "Order is just violence with paperwork.",
    shirts: [0x1f2a44, 0x2c3e5a, 0x4a5568, 0xd8d8d8, 0x3a3a3a],
    pants: [0x1f2a44, 0x2e2e2e, 0x3a3f4a],
    accent: 0x7fb3d5, // Halcyon corporate blue
    skinDist: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]],
    bodyDist: [["male", 70], ["female", 30]],
    height: [0.96, 1.08],
    bulk: [0.95, 1.18],
    styles: [["boxing", 25], ["wrestling", 25], ["martial-arts", 20], ["muay-thai", 15], ["mma", 10], ["street", 5]],
    hairBias: "short",
    beardChance: 0.15,
    names: ["Sarge", "Vick", "Doyle", "Mercer", "Pike", "Hale", "Stanton", "Rhodes", "Vale", "Cross", "Dunne", "Frost"],
  },
  hollows: {
    id: "hollows",
    label: "The Hollows",
    motto: "What's left when the fire eats the person.",
    shirts: [0x1a1a1a, 0x2a2a2a, 0x3d3d3d, 0x4a3a3a, 0x222222],
    pants: [0x1a1a1a, 0x2a2a2a, 0x333333],
    accent: 0xcc3300, // dying ember red
    skinDist: [[0, 2], [1, 2], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]], // paler bias
    bodyDist: [["male", 60], ["female", 40]],
    height: [0.92, 1.05],
    bulk: [0.85, 1.0], // gaunt
    styles: [["street", 40], ["martial-arts", 20], ["drunken", 15], ["wrestling", 10], ["capoeira", 10], ["breakdance", 5]],
    hairBias: "long",
    beardChance: 0.5,
    names: ["Ash", "Cinder", "Wick", "Smolder", "Char", "Ember", "Soot", "Flint", "Tinder", "Grim"],
  },
  unaffiliated: {
    id: "unaffiliated",
    label: "Unaffiliated",
    motto: "Everyone has a price.",
    shirts: [0x2d2d2d, 0x3d4a3d, 0x4a3f2d, 0x333a4a, 0x5a5a5a, 0x1f1f1f],
    pants: [0x2e2e2e, 0x3a3f4a, 0x2f3a2f, 0x1f1f1f],
    accent: 0xc9a227, // mercenary gold
    skinDist: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]],
    bodyDist: [["male", 60], ["female", 40]],
    height: [0.94, 1.07],
    bulk: [0.9, 1.12],
    styles: [["street", 20], ["boxing", 15], ["kickboxing", 15], ["wrestling", 12], ["martial-arts", 8], ["muay-thai", 8], ["mma", 8], ["capoeira", 6], ["lucha", 5], ["drunken", 3]],
    hairBias: "any",
    beardChance: 0.35,
    names: ["Vex", "Halo", "Rook", "Jax", "Nyx", "Blaze", "Onyx-2", "Sable", "Krait", "Zero", "Mira", "Dagger"],
  },
  painted: {
    id: "painted",
    label: "The Painted", // PROPOSED — owner approval needed (docs/DARK_CLOWN_FACTION.md)
    motto: "The paint never comes off.",
    shirts: [0x1a1a1a, 0x2a2a2a, 0x2d1a3e, 0x4a0a0a, 0x3e0a0a, 0xf5f5f5, 0x3d1a3e],
    pants: [0x1a1a1a, 0x2a2a2a, 0x333333, 0x3d1a3e],
    accent: 0xcc1122, // blood red
    skinDist: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]],
    bodyDist: [["male", 60], ["female", 40]],
    height: [0.93, 1.07],
    bulk: [0.88, 1.12],
    styles: [["wrestling", 25], ["street", 25], ["martial-arts", 15], ["drunken", 10], ["lucha", 10], ["mma", 10], ["capoeira", 5]],
    hairBias: "any",
    beardChance: 0.25,
    names: ["Riddle", "Jester", "Mirth", "Patches", "Smiles", "Mimo", "Payaso", "Broma", "Calavera", "Loco", "Truco", "Risa", "Giggles", "Harley", "Frowns", "Bozo"],
  },
  authority: {
    id: "authority",
    label: "The Dynasty Authority",
    motto: "Peace is mandatory.",
    shirts: [0x1a2f5a, 0x243b6b, 0x2e4a7a, 0x1a1a1a, 0x222222, 0x3a3a3a], // blues + SWAT black
    pants: [0x1a2f5a, 0x1f1f1f, 0x2e2e2e],
    accent: 0xb8c4d4, // badge steel
    skinDist: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]],
    bodyDist: [["male", 70], ["female", 30]],
    height: [0.96, 1.08],
    bulk: [0.95, 1.18],
    styles: [["wrestling", 25], ["boxing", 20], ["street", 15], ["martial-arts", 15], ["mma", 10], ["kickboxing", 10], ["muay-thai", 5]],
    hairBias: "short", // regulation cuts
    beardChance: 0.2,
    names: ["Miranda", "Sarge", "Booker", "Nightstick", "Warrant", "Gavel", "Badge", "Rook", "Cuffs", "Deputy", "Squad", "Beat", "Blue", "Paddy", "Rollins", "Sirens"],
  },
};

// ---------------------------------------------------------------------------
// Fighting styles -> animation clips + stat modifiers
// ---------------------------------------------------------------------------

export type StyleDef = {
  id: FightStyle;
  label: string;
  desc: string;
  /** UAL clip names (Quaternius rig, no retarget needed). */
  clips: {
    idle: string;
    jab: string;
    cross: string;
    hook: string;
    hit: string;
    knockdown: string;
    getup: string;
    special: string;
  };
  hpMul: number;
  dmgMul: number;
  speedMul: number;
};

export const FIGHT_STYLES: Record<FightStyle, StyleDef> = {
  street: {
    id: "street", label: "Street",
    desc: "Dirty brawling. Haymakers, headbutts, whatever works.",
    clips: { idle: "Idle_Loop", jab: "Punch_Jab", cross: "Punch_Cross", hook: "Melee_Hook", hit: "Hit_Chest", knockdown: "Death01", getup: "Jump_Land", special: "Melee_Hook" },
    hpMul: 1.1, dmgMul: 1.0, speedMul: 0.95,
  },
  boxing: {
    id: "boxing", label: "Boxing",
    desc: "Jab-cross-hook fundamentals. Clean hands, heavy volume.",
    clips: { idle: "Idle_Loop", jab: "Punch_Jab", cross: "Punch_Cross", hook: "Punch_Cross", hit: "Hit_Head", knockdown: "Death01", getup: "Jump_Land", special: "Punch_Cross" },
    hpMul: 1.0, dmgMul: 1.05, speedMul: 1.05,
  },
  kickboxing: {
    id: "kickboxing", label: "Kickboxing",
    desc: "Punches plus kicks. Fights at range, punishes whiffs.",
    clips: { idle: "Idle_Loop", jab: "Punch_Jab", cross: "Punch_Cross", hook: "Melee_Hook", hit: "Hit_Chest", knockdown: "Hit_Knockback", getup: "Jump_Land", special: "Sword_Dash" },
    hpMul: 0.95, dmgMul: 1.1, speedMul: 1.1,
  },
  wrestling: {
    id: "wrestling", label: "Wrestling",
    desc: "Grapples, throws, slams. Gets inside and ends it.",
    clips: { idle: "Crouch_Idle_Loop", jab: "Punch_Jab", cross: "OverhandThrow", hook: "Melee_Hook", hit: "Hit_Chest", knockdown: "Death01", getup: "ClimbUp_1m", special: "OverhandThrow" },
    hpMul: 1.25, dmgMul: 1.15, speedMul: 0.85,
  },
  "martial-arts": {
    id: "martial-arts", label: "Martial Arts",
    desc: "Fast technical strikes, evasive footwork. Hard to hit.",
    clips: { idle: "Idle_Loop", jab: "Punch_Jab", cross: "Punch_Cross", hook: "Sword_Regular_A", hit: "Hit_Head", knockdown: "Hit_Knockback", getup: "NinjaJump_Start", special: "Sword_Regular_Combo" },
    hpMul: 0.9, dmgMul: 1.0, speedMul: 1.2,
  },
  lucha: {
    id: "lucha", label: "Lucha",
    desc: "High-flying agile offense. Aerial entries, springboards.",
    clips: { idle: "Idle_Loop", jab: "Punch_Jab", cross: "Punch_Cross", hook: "Melee_Hook", hit: "Hit_Chest", knockdown: "Death01", getup: "NinjaJump_Loop", special: "Slide_Start" },
    hpMul: 0.85, dmgMul: 1.05, speedMul: 1.25,
  },
  capoeira: {
    id: "capoeira", label: "Capoeira",
    desc: "Ginga flow, esquivas, acrobatic kicks. Never stops moving.",
    clips: { idle: "Idle_Loop", jab: "Punch_Jab", cross: "Punch_Cross", hook: "Melee_Hook", hit: "Hit_Chest", knockdown: "Hit_Knockback", getup: "NinjaJump_Loop", special: "Sword_Dash" },
    hpMul: 0.9, dmgMul: 1.0, speedMul: 1.3,
  },
  drunken: {
    id: "drunken", label: "Drunken",
    desc: "Unpredictable swaying, off-balance strikes. Hard to read.",
    clips: { idle: "Idle_Loop", jab: "Punch_Jab", cross: "Punch_Cross", hook: "Melee_Hook", hit: "Hit_Chest", knockdown: "Death01", getup: "Jump_Land", special: "Melee_Hook" },
    hpMul: 1.0, dmgMul: 1.1, speedMul: 1.0,
  },
  "muay-thai": {
    id: "muay-thai", label: "Muay Thai",
    desc: "Elbows, knees, clinch, teeps. The art of eight limbs.",
    clips: { idle: "Idle_Loop", jab: "Punch_Jab", cross: "Punch_Cross", hook: "Melee_Hook", hit: "Hit_Chest", knockdown: "Hit_Knockback", getup: "Jump_Land", special: "Sword_Dash" },
    hpMul: 1.05, dmgMul: 1.15, speedMul: 1.0,
  },
  mma: {
    id: "mma", label: "MMA",
    desc: "Takedowns, ground-and-pound, submissions. Complete fighter.",
    clips: { idle: "Crouch_Idle_Loop", jab: "Punch_Jab", cross: "Punch_Cross", hook: "Melee_Hook", hit: "Hit_Chest", knockdown: "Death01", getup: "ClimbUp_1m", special: "OverhandThrow" },
    hpMul: 1.1, dmgMul: 1.1, speedMul: 1.0,
  },
  breakdance: {
    id: "breakdance", label: "Breakdance",
    desc: "B-boy footwork as fighting. Style is the weapon.",
    clips: { idle: "Idle_Loop", jab: "Punch_Jab", cross: "Punch_Cross", hook: "Melee_Hook", hit: "Hit_Chest", knockdown: "Hit_Knockback", getup: "NinjaJump_Loop", special: "Slide_Start" },
    hpMul: 0.9, dmgMul: 0.95, speedMul: 1.35,
  },
};

// ---------------------------------------------------------------------------
// Personality system — every grunt is a PERSON (docs/ROSTER_HIERARCHY.md §3-4)
// ---------------------------------------------------------------------------

/** Quirk ids. Flavor text AND AI behavior hints. */
export type QuirkId =
  // Universal
  | "fights-dirty" | "protects-crew" | "showoff" | "hothead" | "coward"
  | "loyal" | "opportunist" | "brawler" | "counter" | "wild"
  // Ashes
  | "block-pride" | "big-brother" | "old-head"
  // Combine
  | "by-the-book" | "overtime" | "true-believer"
  // Hollows
  | "burned" | "hollow-laugh" | "swarm-mind"
  // Unaffiliated
  | "mercenary" | "collector" | "drifter"
  // Painted (dark clown gang)
  | "painted-face" | "carnival" | "recruiter"
  // Authority (Dynasty Authority — corrupt police)
  | "badge-heavy" | "riot-line" | "nightstick" | "protocol-zero" | "confess";

export type QuirkDef = { id: QuirkId; label: string; hint: string };

export const QUIRKS: Record<QuirkId, QuirkDef> = {
  "fights-dirty":   { id: "fights-dirty",   label: "Fights Dirty",   hint: "Eye pokes, low blows. No honor." },
  "protects-crew":  { id: "protects-crew",  label: "Protects Crew",  hint: "Targets whoever's hitting allies first." },
  "showoff":        { id: "showoff",        label: "Showoff",        hint: "Taunts after knockdowns. Leaves openings." },
  "hothead":        { id: "hothead",        label: "Hothead",        hint: "Charges immediately. No patience." },
  "coward":         { id: "coward",         label: "Coward",         hint: "Hangs back, hits you when you're busy." },
  "loyal":          { id: "loyal",          label: "Loyal",          hint: "Won't flee, won't switch targets." },
  "opportunist":    { id: "opportunist",    label: "Opportunist",    hint: "Waits for openings, punishes whiffs." },
  "brawler":        { id: "brawler",        label: "Brawler",        hint: "Loves the clinch. Wants to trade." },
  "counter":        { id: "counter",        label: "Counter",        hint: "Baits attacks, punishes hard." },
  "wild":           { id: "wild",           label: "Wild",           hint: "Unpredictable. Might do anything." },
  "block-pride":    { id: "block-pride",    label: "Block Pride",    hint: "\"This is MY street.\" Fights harder at home." },
  "big-brother":    { id: "big-brother",    label: "Big Brother",    hint: "Shields weaker allies with his body." },
  "old-head":       { id: "old-head",       label: "Old Head",       hint: "Patient. Coaches mid-fight." },
  "by-the-book":    { id: "by-the-book",    label: "By The Book",    hint: "Disciplined formations, calls targets." },
  "overtime":       { id: "overtime",       label: "Overtime",       hint: "\"I'm getting paid for this.\" No wasted motion." },
  "true-believer":  { id: "true-believer",  label: "True Believer",  hint: "Actually believes Halcyon's pitch. Creepy." },
  "burned":         { id: "burned",         label: "Burned",         hint: "Flame-damaged. Fights through impossible pain." },
  "hollow-laugh":   { id: "hollow-laugh",   label: "Hollow Laugh",   hint: "Laughs while getting hit. Unsettling." },
  "swarm-mind":     { id: "swarm-mind",     label: "Swarm Mind",     hint: "Coordinates with other Hollows instinctively." },
  "mercenary":      { id: "mercenary",      label: "Mercenary",      hint: "\"Nothing personal.\" Efficient, cold." },
  "collector":      { id: "collector",      label: "Collector",      hint: "Wants YOUR moves. Studies you mid-fight." },
  "drifter":        { id: "drifter",        label: "Drifter",        hint: "Might walk away mid-fight if bored." },
  "painted-face":   { id: "painted-face",   label: "Painted Face",   hint: "Wears the paint. Never takes it off. Nobody's seen under." },  "carnival":       { id: "carnival",       label: "Carnival",       hint: "Treats the fight like a show. You're the audience." },
  "recruiter":      { id: "recruiter",      label: "Recruiter",      hint: "Trying to recruit you. The paint is the invitation." },
  "badge-heavy":    { id: "badge-heavy",    label: "Badge Heavy",    hint: "Badge first, questions never. Escalates fast." },
  "riot-line":      { id: "riot-line",      label: "Riot Line",      hint: "Holds formation. Shields up, advances slow." },
  "nightstick":     { id: "nightstick",     label: "Nightstick",     hint: "Leads with the baton. Loves the sound it makes." },
  "protocol-zero":  { id: "protocol-zero",  label: "Protocol Zero",  hint: "Will sacrifice anyone to complete the objective. Even their own." },
  "confess":        { id: "confess",        label: "Confess",        hint: "Demands confessions mid-fight. Religious fury." },
};

/** Quirk pools per faction: [quirkId, weight]. */
const FACTION_QUIRKS: Record<FactionId, [QuirkId, number][]> = {
  ashes: [
    ["block-pride", 25], ["big-brother", 20], ["old-head", 15],
    ["loyal", 15], ["brawler", 10], ["hothead", 8], ["protects-crew", 7],
  ],
  combine: [
    ["by-the-book", 25], ["overtime", 20], ["true-believer", 15],
    ["counter", 15], ["opportunist", 10], ["loyal", 10], ["coward", 5],
  ],
  hollows: [
    ["burned", 25], ["hollow-laugh", 20], ["swarm-mind", 20],
    ["wild", 15], ["hothead", 10], ["fights-dirty", 10],
  ],
  unaffiliated: [
    ["mercenary", 25], ["collector", 15], ["drifter", 15],
    ["opportunist", 15], ["showoff", 10], ["counter", 10], ["wild", 10],
  ],
  painted: [
    ["painted-face", 25], ["carnival", 20], ["wild", 15],
    ["showoff", 15], ["recruiter", 10], ["fights-dirty", 10], ["counter", 5],
  ],
  authority: [
    ["by-the-book", 25], ["badge-heavy", 20], ["loyal", 15],
    ["riot-line", 12], ["nightstick", 10], ["protocol-zero", 8],
    ["confess", 5], ["true-believer", 5],
  ],
};

/** Stat archetypes — what makes grunts FEEL different, not just look different. */
export type ArchetypeId = "bruiser" | "striker" | "tank" | "speedster" | "balanced" | "tricky";

export type ArchetypeDef = {
  id: ArchetypeId; label: string; tell: string;
  hpMul: number; dmgMul: number; speedMul: number;
};

export const ARCHETYPES: Record<ArchetypeId, ArchetypeDef> = {
  bruiser:   { id: "bruiser",   label: "Bruiser",   tell: "Big. Slow. Hits like a truck.",        hpMul: 1.35, dmgMul: 1.25, speedMul: 0.80 },
  striker:   { id: "striker",   label: "Striker",   tell: "Glass cannon. Fast hands, no chin.",    hpMul: 0.85, dmgMul: 1.40, speedMul: 1.05 },
  tank:      { id: "tank",      label: "Tank",      tell: "Walks through punches. Grabs you.",     hpMul: 1.50, dmgMul: 1.00, speedMul: 0.75 },
  speedster: { id: "speedster", label: "Speedster", tell: "Can't hit what you can't catch.",       hpMul: 0.75, dmgMul: 1.00, speedMul: 1.40 },
  balanced:  { id: "balanced",  label: "Balanced",  tell: "Fundamentals. Boring, hard to beat.",   hpMul: 1.00, dmgMul: 1.00, speedMul: 1.00 },
  tricky:    { id: "tricky",    label: "Tricky",    tell: "Feints, misdirection, dirty tricks.",   hpMul: 0.85, dmgMul: 1.10, speedMul: 1.20 },
};

const ARCHETYPE_IDS: ArchetypeId[] = ["bruiser", "striker", "tank", "speedster", "balanced", "tricky"];

// ---------------------------------------------------------------------------
// Bio generation — 2-3 sentences, faction-flavored.
// Format: [Origin] [Why they fight] [Quirk hint]
// ---------------------------------------------------------------------------

type BioTemplate = { origin: string[]; motive: string[] };

const BIO_TEMPLATES: Record<FactionId, BioTemplate> = {
  ashes: {
    origin: [
      "Grew up three doors down from the gym.",
      "Used to run with the Combine until they torched the corner store.",
      "Learned to fight in the parking lot behind the rec center.",
      "Third generation on this block. Not leaving.",
      "Doc patched them up after their first beating. Never forgot it.",
    ],
    motive: [
      "Fights because somebody has to hold the block.",
      "Now they're Ashes for life.",
      "Swings wide but means every word of it.",
      "Patient — waits for you to make the first mistake.",
      "The block remembers, and so do they.",
    ],
  },
  combine: {
    origin: [
      "Ex-military, dishonorably discharged.",
      "Corporate security before Halcyon bought the contract.",
      "Grew up in the suburbs. Never been in a real fight until Halcyon.",
      "Former athlete. Blew out a knee. Halcyon offered a paycheck.",
      "Private contractor. This is just another deployment.",
    ],
    motive: [
      "Halcyon pays better than the army and asks fewer questions.",
      "Fights like it's a job, because it is.",
      "True believer. Thinks the demolitions are 'urban renewal.'",
      "Methodical. No wasted motion. Overtime starts now.",
      "Will lecture you about property values while breaking your ribs.",
    ],
  },
  hollows: {
    origin: [
      "The Flame took their brother first. Then it took them.",
      "Nobody remembers what they were before. The fire ate that too.",
      "Used to be Ashes. Used to be somebody.",
      "Found wandering the subway tunnels, laughing at nothing.",
      "The last thing they said before the Flame took them was a name nobody knows.",
    ],
    motive: [
      "What's left fights because fighting is all that's left.",
      "Don't let them grab you.",
      "They laugh when they get hit. Nobody knows why.",
      "The fire wants to be fed. They're the delivery.",
      "Put them down fast. It's kinder.",
    ],
  },
  unaffiliated: {
    origin: [
      "Lucha circuit washout. Still wears the mask.",
      "Nobody knows where they're from. Shows up, collects, disappears.",
      "Ex-Pit fighter. Retired undefeated. Got bored.",
      "Trained in three countries. Owes money in all of them.",
      "Used to work security for people who don't exist on paper.",
    ],
    motive: [
      "Fights for cash, stays for the crowd.",
      "The only thing anyone agrees on: don't let them study you too long.",
      "\"Nothing personal\" — and they mean it.",
      "Says the mask is the only honest thing they own.",
      "Might leave mid-fight if it's boring. Might not.",
    ],
  },
  painted: {
    origin: [
      "Ran away to the carnival grounds at sixteen. Never left.",
      "The system failed them. Onyx offered the paint instead.",
      "Used to be somebody. The paint ate that too.",
      "Found laughing in the funhouse ruins. Hollow brought them in.",
      "Chola from the east side. The teardrops are real.",
      "Ex-lucha circuit. Still wears the mask under the paint.",
    ],
    motive: [
      "The paint never comes off. Neither do they.",
      "Treats the fight like a show. You're the audience.",
      "Laughs while they fight. It's not joy.",
      "Trying to recruit you. The paint is the invitation.",
      "Wears the paint. Never takes it off. Nobody's seen under.",
      "The carnival grounds are home. You're trespassing.",
    ],
  },
  authority: {
    origin: [
      "Failed out of the academy twice. Third time they stopped asking questions.",
      "Ex-military. The badge pays better and the rules are looser.",
      "Grew up wanting to be a hero. The Dynasty taught them otherwise.",
      "Third-generation cop. Grandfather walked a beat. They kick down doors.",
      "Was a fighter first. The badge was just a better corner to fight from.",
      "Joined for the pension. Stayed for the power.",
    ],
    motive: [
      "Peace is mandatory. They'll beat it into you if they have to.",
      "The badge means never having to say you're sorry.",
      "Writes you up before the fight even starts. Paperwork's already done.",
      "Believes the Peace Act like scripture. You're a verse that needs correcting.",
      "Protocol Zero means nobody's safe — not even their own partner.",
      "The street doesn't respect the badge. That's why the baton exists.",
    ],
  },
};

/** Generate a 2-3 sentence bio for a grunt. Deterministic from rng. */
export function generateBio(
  rng: () => number,
  faction: FactionId,
  name: string,
  quirk: QuirkId,
): string {
  const t = BIO_TEMPLATES[faction];
  const origin = pick(rng, t.origin);
  const motive = pick(rng, t.motive);
  const quirkHint = QUIRKS[quirk].hint;
  return `${origin} ${motive} ${name} ${quirkHint.charAt(0).toLowerCase()}${quirkHint.slice(1)}`;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/** Hair part ids biased by faction preference. */
function pickHair(rng: () => number, bodyId: "male" | "female", bias: "short" | "long" | "any"): string | null {
  const options = partsFor("hair", bodyId);
  if (options.length === 0 || rng() < 0.08) return null; // some grunts are bald
  const shortIds = ["hair_buzzed", "hair_buzzed_f", "hair_parted"];
  const longIds = ["hair_long", "hair_buns"];
  let pool: QuaterniusPart[] = options;
  if (bias === "short") {
    const s = options.filter((p) => shortIds.includes(p.id));
    if (s.length > 0) pool = s;
  } else if (bias === "long") {
    const l = options.filter((p) => longIds.includes(p.id));
    if (l.length > 0) pool = l;
  }
  return pick(rng, pool).id;
}

/**
 * Generate one grunt recipe. Deterministic: same (faction, seed) -> same grunt.
 * Omit seed for a random one.
 */
export function generateGrunt(faction: FactionId, seed?: number): GruntRecipe {
  const s = seed ?? Math.floor(Math.random() * 0xffffffff);
  const rng = mulberry32(s);
  const def = FACTIONS[faction];

  const bodyId = weighted(rng, def.bodyDist);
  const skinIdx = weighted(rng, def.skinDist);
  const style = weighted(rng, def.styles);
  const styleDef = FIGHT_STYLES[style];

  const hairId = pickHair(rng, bodyId, def.hairBias);
  const beard = bodyId === "male" && rng() < def.beardChance;
  const brows = partsFor("eyebrows", bodyId);
  const browsId = brows.length > 0 ? pick(rng, brows).id : "brows";

  const level = ri(rng, 1, 5);
  const levelScale = 1 + (level - 1) * 0.12; // L5 hits ~48% harder, ~48% more HP

  const patternRoll = rng();
  const pattern: ClothingPattern =
    patternRoll < 0.6 ? "solid" : patternRoll < 0.75 ? "camo" : patternRoll < 0.9 ? "stripes" : "graffiti";

  // Personality: quirk + archetype + bio (docs/ROSTER_HIERARCHY.md §3-4)
  const quirk = weighted(rng, FACTION_QUIRKS[faction]);
  const archetype = pick(rng, ARCHETYPE_IDS);
  const archDef = ARCHETYPES[archetype];
  const name = pick(rng, def.names);
  const bio = generateBio(rng, faction, name, quirk);

  return {
    seed: s,
    faction,
    name,
    bodyId,
    skinTone: SKIN_TONES[skinIdx],
    heightScale: rf(rng, def.height[0], def.height[1]),
    bulkScale: rf(rng, def.bulk[0], def.bulk[1]),
    hairId,
    beard,
    browsId,
    shirtColor: pick(rng, def.shirts),
    pantsColor: pick(rng, def.pants),
    accentColor: def.accent,
    pattern,
    patternSeed: Math.floor(rng() * 0xffffffff),
    style,
    level,
    hpMul: styleDef.hpMul * archDef.hpMul * levelScale,
    dmgMul: styleDef.dmgMul * archDef.dmgMul * levelScale,
    speedMul: styleDef.speedMul * archDef.speedMul,
    quirk,
    archetype,
    bio,
  };
}

/** Generate a squad of N grunts with sequential seeds (deterministic as a group). */
export function generateSquad(faction: FactionId, count: number, seed?: number): GruntRecipe[] {
  const base = seed ?? Math.floor(Math.random() * 0xffffffff);
  const out: GruntRecipe[] = [];
  for (let i = 0; i < count; i++) out.push(generateGrunt(faction, base + i * 7919));
  return out;
}

/** Generate a mixed-faction street crowd (background NPCs, not fighters). */
export function generateCrowd(count: number, seed?: number): GruntRecipe[] {
  const base = seed ?? Math.floor(Math.random() * 0xffffffff);
  const rng = mulberry32(base ^ 0x9e3779b9);
  const factions: FactionId[] = ["ashes", "combine", "hollows", "unaffiliated", "painted", "authority"];
  const out: GruntRecipe[] = [];
  for (let i = 0; i < count; i++) {
    out.push(generateGrunt(pick(rng, factions), base + i * 104729));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Runtime assembly (three.js) — turns a recipe into a live character.
// ---------------------------------------------------------------------------

export type GruntAssets = {
  body: THREE.Object3D;
  parts: Map<string, THREE.Object3D>; // partId -> loaded part Object3D
};

/**
 * Assemble a grunt from a recipe + preloaded assets.
 *
 * @param recipe  the grunt recipe
 * @param assets  body = loaded Quaternius base body GLB scene;
 *                parts = map of part id -> loaded part GLB scene
 * @returns the body root with parts attached, scaled, and tinted.
 *
 * Loading is the caller's job (use THREE.GLTFLoader with the paths in
 * quaternius.ts: QUATERNIUS_BODIES / QUATERNIUS_PARTS). This keeps the
 * generator testable without a renderer.
 */
export function assembleGrunt(recipe: GruntRecipe, assets: GruntAssets): THREE.Object3D {
  const body = assets.body;

  // 1. Proportions: uniform height + x/z bulk.
  body.scale.set(recipe.bulkScale, recipe.heightScale, recipe.bulkScale);

  // 2. Skin tone.
  tintSkin(body, recipe.skinTone);

  // 3. Clothing: tint shirt/pants materials by name convention.
  //    Quaternius Standard bakes one outfit; we tint material slots.
  //    Slot mapping: materials named *shirt*/*top*/*jacket* -> shirtColor,
  //    *pants*/*bottom*/*legs* -> pantsColor, *accent*/*trim* -> accentColor.
  //    Anything unmatched keeps its authored color.
  body.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const mat = m as THREE.MeshStandardMaterial;
      if (!mat || !("color" in mat)) continue;
      const n = (mat.name || "").toLowerCase();
      if (/shirt|top|jacket|torso|chest/.test(n)) mat.color.setHex(recipe.shirtColor);
      else if (/pant|bottom|leg|jean/.test(n)) mat.color.setHex(recipe.pantsColor);
      else if (/accent|trim|strap|belt|boot|glove/.test(n)) mat.color.setHex(recipe.accentColor);
    }
  });

  // 4. Hair / beard / brows.
  const wantParts: string[] = [];
  if (recipe.hairId) wantParts.push(recipe.hairId);
  if (recipe.beard) {
    const beard = QUATERNIUS_PARTS.find((p) => p.slot === "beard" && (p.fits === "both" || p.fits === recipe.bodyId));
    if (beard) wantParts.push(beard.id);
  }
  wantParts.push(recipe.browsId);
  for (const pid of wantParts) {
    const part = assets.parts.get(pid);
    if (part) attachPart(body, part);
  }

  // 5. Clothing pattern overlay (procedural).
  //    tools/generative/svg-textures.js can bake camo/stripes/graffiti
  //    into a data-URI texture; the renderer applies it as a map multiply.
  //    We record the intent here — view.ts resolves pattern -> texture.
  body.userData.gruntRecipe = recipe;
  body.userData.clothingPattern = recipe.pattern;
  body.userData.patternSeed = recipe.patternSeed;

  return body;
}

// ---------------------------------------------------------------------------
// Roster / sim integration
// ---------------------------------------------------------------------------

/** Grunt display name with faction tag, e.g. "Marv (Ashes)". */
export function gruntDisplayName(recipe: GruntRecipe): string {
  const short: Record<FactionId, string> = {
    ashes: "Ashes",
    combine: "Combine",
    hollows: "Hollows",
    unaffiliated: "Unaffiliated",
    painted: "Painted",
    authority: "Authority",
  };
  return `${recipe.name} (${short[recipe.faction]})`;
}

/** Bio line for a grunt — the full generated bio (docs/ROSTER_HIERARCHY.md §4). */
export function gruntBio(recipe: GruntRecipe): string {
  return recipe.bio;
}

/** One-line personality summary: "Marv — Bruiser Boxer, Block Pride". */
export function gruntPersonality(recipe: GruntRecipe): string {
  return `${recipe.name} — ${ARCHETYPES[recipe.archetype].label} ${FIGHT_STYLES[recipe.style].label}, ${QUIRKS[recipe.quirk].label}`;
}

/**
 * Convert a recipe to a roster-compatible fighter entry.
 * Grunts reuse the Quaternius base body file as their "attire" — the
 * recipe (seed) is what makes them unique, resolved at load by assembleGrunt.
 */
export function gruntToFighter(recipe: GruntRecipe): {
  id: string;
  name: string;
  martial: string;
  bio: string;
  faction: FactionId;
  seed: number;
  bodyFile: string;
  hpMul: number;
  dmgMul: number;
  speedMul: number;
  quirk: QuirkId;
  archetype: ArchetypeId;
  personality: string;
} {
  const body = QUATERNIUS_BODIES.find((b) => b.id === recipe.bodyId) ?? QUATERNIUS_BODIES[0];
  return {
    id: `grunt-${recipe.faction}-${recipe.seed.toString(36)}`,
    name: gruntDisplayName(recipe),
    martial: recipe.style,
    bio: gruntBio(recipe),
    faction: recipe.faction,
    seed: recipe.seed,
    bodyFile: body.file,
    hpMul: recipe.hpMul,
    dmgMul: recipe.dmgMul,
    speedMul: recipe.speedMul,
    quirk: recipe.quirk,
    archetype: recipe.archetype,
    personality: gruntPersonality(recipe),
  };
}

/**
 * Mission helper: build a wave of grunts for a mission.
 * Swarm missions (STORY_BIBLE §8) just ask for a bigger count —
 * the group-AI cap is lifted per-mission via setMaxAttackers().
 */
export function missionWave(
  faction: FactionId,
  count: number,
  seed: number,
  minLevel = 1,
  maxLevel = 5,
): GruntRecipe[] {
  const squad = generateSquad(faction, count, seed);
  const rng = mulberry32(seed ^ 0x51ed);
  for (const g of squad) {
    g.level = ri(rng, minLevel, maxLevel);
    const ls = 1 + (g.level - 1) * 0.12;
    const sd = FIGHT_STYLES[g.style];
    const ad = ARCHETYPES[g.archetype];
    g.hpMul = sd.hpMul * ad.hpMul * ls;
    g.dmgMul = sd.dmgMul * ad.dmgMul * ls;
    g.speedMul = sd.speedMul * ad.speedMul;
  }
  return squad;
}
