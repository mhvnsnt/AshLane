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

export type FactionId = "ashes" | "combine" | "hollows" | "unaffiliated";

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

  return {
    seed: s,
    faction,
    name: pick(rng, def.names),
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
    hpMul: styleDef.hpMul * levelScale,
    dmgMul: styleDef.dmgMul * levelScale,
    speedMul: styleDef.speedMul,
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
  const factions: FactionId[] = ["ashes", "combine", "hollows", "unaffiliated"];
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
  };
  return `${recipe.name} (${short[recipe.faction]})`;
}

/** Bio line for a grunt, faction-flavored. */
export function gruntBio(recipe: GruntRecipe): string {
  const styleLabel = FIGHT_STYLES[recipe.style].label;
  const tier = ["", "green", "seasoned", "hardened", "veteran", "elite"][recipe.level];
  return `${FACTIONS[recipe.faction].label} ${tier} ${styleLabel.toLowerCase()}. ${FACTIONS[recipe.faction].motto}`;
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
    g.hpMul = sd.hpMul * ls;
    g.dmgMul = sd.dmgMul * ls;
  }
  return squad;
}
