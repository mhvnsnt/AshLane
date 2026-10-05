/**
 * Urban Mayhem Move Pools — ported to AshLane.
 * Original: mhvnsnt/URBAN-MAYHEM- Game/src/combat.js (MOVESETS)
 *
 * Per-style move pools. `hitAt` is the fraction of the animation where
 * the blow lands, so impact matches what the body is doing.
 * Weapon swings replace the empty-hand pool while armed with melee.
 */

export interface MoveDef {
  name: string;
  limb: "punch" | "kick" | "elbow" | "knee" | "grapple" | "weapon";
  side: "L" | "R";
  dmg: number;      // damage multiplier
  reach: number;    // metres
  poise: number;    // poise damage multiplier
  dur: number;      // seconds
  hitAt: number;    // fraction of dur when impact lands (0-1)
  stam: number;     // stamina cost
  heavy?: boolean;
  hook?: boolean;
  upper?: boolean;
  round?: boolean;
  high?: boolean;
  low?: boolean;
  wild?: boolean;   // drunken style unpredictability
  bleed?: number;   // bleed chance (elbows, blades)
  part?: "head" | "chest" | "legs";
  grapple?: boolean;
}

const M = (name: string, o: Partial<MoveDef> = {}): MoveDef =>
  Object.assign(
    { name, limb: "punch", side: "R", dmg: 1, reach: 1, poise: 1, dur: 0.42, hitAt: 0.5, stam: 5 } as MoveDef,
    o
  );

export const MOVESETS: Record<string, MoveDef[]> = {
  street: [
    M("Jab",          { side: "L", dmg: 0.72, dur: 0.28, hitAt: 0.45, poise: 0.55, stam: 3 }),
    M("Cross",        { dmg: 1.0, dur: 0.36, hitAt: 0.5 }),
    M("Hook",         { side: "L", hook: true, dmg: 1.25, dur: 0.44, hitAt: 0.55, poise: 1.2 }),
    M("Overhand",     { heavy: true, dmg: 1.6, dur: 0.56, hitAt: 0.58, poise: 1.6, stam: 9 }),
    M("Body Shot",    { dmg: 1.05, dur: 0.38, hitAt: 0.5, part: "chest" }),
    M("Stomp Kick",   { limb: "kick", dmg: 1.3, dur: 0.5, hitAt: 0.55, poise: 1.5, stam: 8 }),
  ],
  boxer: [
    M("Jab",          { side: "L", dmg: 0.8, dur: 0.24, hitAt: 0.42, poise: 0.5, stam: 2.5 }),
    M("Straight Right", { dmg: 1.15, dur: 0.32, hitAt: 0.48 }),
    M("Left Hook",    { side: "L", hook: true, dmg: 1.35, dur: 0.4, hitAt: 0.52, poise: 1.3 }),
    M("Uppercut",     { upper: true, dmg: 1.7, dur: 0.48, hitAt: 0.55, poise: 1.8, part: "head", stam: 8 }),
    M("Liver Shot",   { side: "L", dmg: 1.5, dur: 0.42, hitAt: 0.5, poise: 1.1, stam: 7 }),
  ],
  muaythai: [
    M("Teep",         { limb: "kick", dmg: 1.0, dur: 0.4, hitAt: 0.5, poise: 1.4 }),
    M("Roundhouse",   { limb: "kick", round: true, dmg: 1.7, dur: 0.52, hitAt: 0.55, poise: 1.7, stam: 9 }),
    M("Head Kick",    { limb: "kick", round: true, high: true, dmg: 2.1, dur: 0.6, hitAt: 0.58, poise: 2.2, part: "head", stam: 12 }),
    M("Elbow",        { limb: "elbow", dmg: 1.5, dur: 0.34, hitAt: 0.5, poise: 1.2, part: "head", bleed: 0.6 }),
    M("Knee",         { limb: "knee", dmg: 1.45, dur: 0.4, hitAt: 0.52, poise: 1.5 }),
    M("Low Kick",     { limb: "kick", round: true, low: true, dmg: 1.1, dur: 0.38, hitAt: 0.5, poise: 1.0, part: "legs" }),
  ],
  wrestler: [
    M("Forearm",      { dmg: 1.0, dur: 0.32, hitAt: 0.48 }),
    M("Chop",         { side: "L", dmg: 0.95, dur: 0.3, hitAt: 0.46 }),
    M("Clothesline",  { hook: true, heavy: true, dmg: 1.8, dur: 0.5, hitAt: 0.52, poise: 2.4, stam: 10 }),
    M("Big Boot",     { limb: "kick", high: true, dmg: 1.9, dur: 0.54, hitAt: 0.55, poise: 2.3, part: "head", stam: 11 }),
    M("Grapple",      { limb: "grapple", grapple: true, dmg: 0.4, dur: 0.44, hitAt: 0.6, poise: 0.6, reach: 0.72, stam: 8 }),
  ],
  mma: [
    M("Jab",          { side: "L", dmg: 0.78, dur: 0.26, hitAt: 0.44, stam: 3 }),
    M("Cross",        { dmg: 1.1, dur: 0.34, hitAt: 0.48 }),
    M("Low Kick",     { limb: "kick", round: true, low: true, dmg: 1.15, dur: 0.38, hitAt: 0.5, part: "legs" }),
    M("Head Kick",    { limb: "kick", round: true, high: true, dmg: 2.0, dur: 0.58, hitAt: 0.57, part: "head", poise: 2.1, stam: 12 }),
    M("Knee",         { limb: "knee", dmg: 1.4, dur: 0.4, hitAt: 0.52, poise: 1.4 }),
    M("Takedown",     { limb: "grapple", grapple: true, dmg: 0.5, dur: 0.46, hitAt: 0.6, poise: 0.8, reach: 0.72, stam: 10 }),
  ],
  drunken: [
    M("Wild Swing",     { hook: true, dmg: 1.3, dur: 0.5, hitAt: 0.6, poise: 1.5, wild: true, stam: 6 }),
    M("Stumble Headbutt", { limb: "elbow", dmg: 1.6, dur: 0.46, hitAt: 0.55, part: "head", poise: 1.6, wild: true }),
    M("Falling Elbow",  { limb: "elbow", heavy: true, dmg: 1.9, dur: 0.6, hitAt: 0.6, poise: 2.0, wild: true, stam: 9 }),
    M("Bottle Swing",   { limb: "weapon", dmg: 1.5, dur: 0.5, hitAt: 0.55, poise: 1.4, wild: true }),
  ],
  // AshLane-native additions mapped from the 24-discipline system.
  kickboxer: [
    M("Jab",          { side: "L", dmg: 0.8, dur: 0.26, hitAt: 0.44, stam: 3 }),
    M("Cross",        { dmg: 1.1, dur: 0.34, hitAt: 0.48 }),
    M("Hook Kick",    { limb: "kick", round: true, dmg: 1.5, dur: 0.48, hitAt: 0.55, poise: 1.5, stam: 9 }),
    M("Low Kick",     { limb: "kick", round: true, low: true, dmg: 1.1, dur: 0.38, hitAt: 0.5, part: "legs" }),
    M("Spinning Back",{ hook: true, heavy: true, dmg: 1.8, dur: 0.58, hitAt: 0.6, poise: 2.0, stam: 11 }),
  ],
  capoeira: [
    M("Meia-lua",     { limb: "kick", round: true, dmg: 1.4, dur: 0.5, hitAt: 0.55, poise: 1.4, stam: 8 }),
    M("Queixada",     { limb: "kick", round: true, high: true, dmg: 1.7, dur: 0.56, hitAt: 0.58, part: "head", poise: 1.8, stam: 10 }),
    M("Banda",        { limb: "kick", low: true, dmg: 1.0, dur: 0.4, hitAt: 0.5, part: "legs", poise: 1.2 }),
    M("Esquiva Strike", { dmg: 1.2, dur: 0.42, hitAt: 0.55, poise: 1.1 }),
  ],
  lucha: [
    M("Chop",         { side: "L", dmg: 0.9, dur: 0.3, hitAt: 0.46 }),
    M("Dropkick",     { limb: "kick", dmg: 1.5, dur: 0.5, hitAt: 0.5, poise: 1.8, stam: 9 }),
    M("Hurricanrana Setup", { limb: "grapple", grapple: true, dmg: 0.5, dur: 0.46, hitAt: 0.6, reach: 0.72, stam: 10 }),
    M("Springboard Kick", { limb: "kick", high: true, dmg: 1.6, dur: 0.52, hitAt: 0.55, part: "head", poise: 1.6, stam: 10 }),
  ],
};

export const STYLE_NAMES: Record<string, string> = {
  street: "Street Brawler", boxer: "Boxer", muaythai: "Muay Thai",
  wrestler: "Wrestler", mma: "Mixed Martial Arts", drunken: "Drunken Monkey",
  kickboxer: "Kickboxer", capoeira: "Capoeira", lucha: "Lucha Libre",
};

/** Weapon swings replace the empty-hand pool while armed with melee. */
export const WEAPON_MOVES: MoveDef[] = [
  M("Swing",     { limb: "weapon", dmg: 1.0, dur: 0.46, hitAt: 0.52, poise: 1.0 }),
  M("Backswing", { limb: "weapon", dmg: 1.15, dur: 0.5, hitAt: 0.55, poise: 1.2 }),
  M("Overhead",  { limb: "weapon", heavy: true, dmg: 1.7, dur: 0.62, hitAt: 0.58, poise: 1.9, stam: 10 }),
];

export const COMBO_WINDOW = 1.5;

/** Get the move pool for a style key. Falls back to street. */
export function movesForStyle(style: string): MoveDef[] {
  return MOVESETS[style] ?? MOVESETS.street;
}

/** Get the move pool for an armed fighter (melee weapon equipped). */
export function movesForWeapon(): MoveDef[] {
  return WEAPON_MOVES;
}
