/**
 * Urban Mayhem Melee Weapons — ported to AshLane.
 * Original: mhvnsnt/URBAN-MAYHEM- Game/src/weapons.js (WEAPONS)
 *
 * MELEE ONLY. All firearms (pistol, revolver, smg, shotgun, rifle,
 * marksman) and thrown explosives (molotov, grenade) are SKIPPED per
 * owner directive: AshLane is a brawler, no guns.
 *
 * Maps to AshLane's sim.ts Weapon type:
 *   sim Weapon = "fist" | "pipe" | "bottle" | "board" | "blade" | "spear"
 */

export type MeleeWeaponId =
  | "unarmed" | "knife" | "bat" | "pipe" | "chair" | "crowbar" | "machete" | "katana";

export interface MeleeWeaponDef {
  name: string;
  dmg: number;
  reach: number;    // metres
  rate: number;     // seconds between swings
  poise: number;    // poise damage multiplier
  price: number;    // in-game currency
  desc: string;
  bleed?: number;   // bleed chance 0-1
  breakable?: number;// hits before it breaks (chair)
  /** Maps to AshLane sim.ts Weapon type. */
  simWeapon: "fist" | "pipe" | "bottle" | "board" | "blade" | "spear";
}

export const MELEE_WEAPONS: Record<MeleeWeaponId, MeleeWeaponDef> = {
  unarmed: { name: "Unarmed",      dmg: 9,  reach: 1.75, rate: 0.32, poise: 0.55, price: 0,   desc: "Fists, elbows, knees, feet.", simWeapon: "fist" },
  knife:   { name: "Combat Knife", dmg: 17, reach: 1.75, rate: 0.26, poise: 0.5,  bleed: 0.5, price: 120, desc: "Fast, quiet, opens people up.", simWeapon: "blade" },
  bat:     { name: "Baseball Bat", dmg: 26, reach: 2.35, rate: 0.52, poise: 1.35, price: 90,  desc: "Wide arc. Puts people down.", simWeapon: "board" },
  pipe:    { name: "Steel Pipe",   dmg: 22, reach: 2.15, rate: 0.46, poise: 1.2,  price: 40,  desc: "Found in every alley.", simWeapon: "pipe" },
  chair:   { name: "Steel Chair",  dmg: 30, reach: 2.30, rate: 0.62, poise: 1.7,  breakable: 6, price: 25, desc: "The great equaliser.", simWeapon: "board" },
  crowbar: { name: "Crowbar",      dmg: 24, reach: 2.10, rate: 0.48, poise: 1.3,  price: 60,  desc: "Opens doors and jaws.", simWeapon: "pipe" },
  machete: { name: "Machete",      dmg: 33, reach: 2.20, rate: 0.44, poise: 1.0,  bleed: 0.8, price: 260, desc: "Heavy blade. Messy work.", simWeapon: "blade" },
  katana:  { name: "Katana",       dmg: 40, reach: 2.45, rate: 0.40, poise: 1.1,  bleed: 1.0, price: 900, desc: "Precision edge. Two-handed.", simWeapon: "blade" },
};

export const MELEE_WEAPON_IDS = Object.keys(MELEE_WEAPONS) as MeleeWeaponId[];

/** SKIPPED per owner directive (no guns in AshLane). Documented, not ported. */
export const SKIPPED_WEAPONS = [
  "pistol", "revolver", "smg", "shotgun", "rifle", "marksman", // firearms
  "molotov", "grenade",                                        // thrown explosives
];

export function meleeWeaponOf(id: string): MeleeWeaponDef {
  return (MELEE_WEAPONS as Record<string, MeleeWeaponDef>)[id] ?? MELEE_WEAPONS.unarmed;
}
