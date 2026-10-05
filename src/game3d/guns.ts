/**
 * guns.ts — Yakuza-style RARE gun system for AshLane.
 *
 * Design law: guns are POWERFUL but SCARCE. The game stays melee-focused.
 * Finding a gun should feel exciting, like Yakuza — then it's gone.
 *
 * Sources:
 *  - Urban Mayhem weapon_director.gd (pistol/smg/shotgun/rifle stats) —
 *    firearms were SKIPPED in the original port per "no guns" directive.
 *    Owner approved rare guns 2026-10-05. Ported here with Yakuza-style
 *    scarcity (not GTA-style loadouts).
 *  - Finn "The Priest" Mac first-encounter: he carries a gun in his debut
 *    mission. Disarm him → gun drops → guns unlocked for the rest of game.
 *
 * Integration points:
 *  - sim.ts: gunfire resolves through the existing hit pipeline (ranged hit).
 *  - attention.ts: firing a gun in public is LOUD — big attention gain.
 *  - combat-sfx.ts: sfxGunshot / sfxReload / sfxDryFire / sfxDisarm.
 *  - view.ts: muzzle flash + tracer (to be wired by the view layer).
 */

// ---------------------------------------------------------------------------
// Gun definitions
// ---------------------------------------------------------------------------

export type GunId = "pistol" | "revolver" | "shotgun" | "smg";

export interface GunDef {
  id: GunId;
  name: string;
  desc: string;
  /** Damage per shot (shotgun = per pellet, see pellets). */
  dmg: number;
  /** Effective range in metres. */
  range: number;
  /** Magazine capacity. */
  mag: number;
  /** Seconds between shots. */
  rate: number;
  /** Pellets per shot (shotgun spread). */
  pellets: number;
  /** Spread angle in degrees (shotgun). */
  spread: number;
  /** Rarity weight for world spawns (higher = more common). */
  rarity: number;
  /** Base price for the gun itself (black market). */
  price: number;
  /** Price per bullet. Ammo is the real money sink. */
  ammoPrice: number;
}

/**
 * Gun stats. Damage tuned against AshLane's HP scale (~100 base).
 * A pistol shot hurts — but 6-12 shots and you're dry.
 */
export const GUNS: Record<GunId, GunDef> = {
  pistol: {
    id: "pistol",
    name: "9mm Pistol",
    desc: "Standard sidearm. Loud, common enough to find, gone too soon.",
    dmg: 22, range: 40, mag: 12, rate: 0.22, pellets: 1, spread: 0,
    rarity: 100, price: 800, ammoPrice: 25,
  },
  revolver: {
    id: "revolver",
    name: ".44 Revolver",
    desc: "Six shots. Each one counts. Slow to reload.",
    dmg: 38, range: 35, mag: 6, rate: 0.55, pellets: 1, spread: 0,
    rarity: 45, price: 1400, ammoPrice: 60,
  },
  shotgun: {
    id: "shotgun",
    name: "Pump Shotgun",
    desc: "Devastating up close. Useless past arm's length.",
    dmg: 9, range: 18, mag: 6, rate: 0.9, pellets: 8, spread: 7,
    rarity: 25, price: 2200, ammoPrice: 90,
  },
  smg: {
    id: "smg",
    name: "Machine Pistol",
    desc: "Sprays lead. Eats ammo like it's free. It isn't.",
    dmg: 13, range: 45, mag: 30, rate: 0.09, pellets: 1, spread: 3,
    rarity: 10, price: 4500, ammoPrice: 40,
  },
};

export const GUN_IDS = Object.keys(GUNS) as GunId[];

// ---------------------------------------------------------------------------
// Gun state — one per fighter that can hold a gun
// ---------------------------------------------------------------------------

export interface GunState {
  /** Which gun is held, or null for unarmed/melee. */
  gun: GunId | null;
  /** Rounds currently in the magazine. */
  magAmmo: number;
  /** Reserve ammo (bought, not loaded). */
  reserveAmmo: number;
  /** Seconds until the gun can fire again. */
  cooldown: number;
  /** Has the player unlocked guns at all? (Finn Mac encounter gates this.) */
  gunsUnlocked: boolean;
  /** Money available for ammo purchases. The game loop owns the wallet;
   *  guns.ts only reads/writes through these helpers. */
}

export function createGunState(): GunState {
  return { gun: null, magAmmo: 0, reserveAmmo: 0, cooldown: 0, gunsUnlocked: false };
}

// ---------------------------------------------------------------------------
// Firing
// ---------------------------------------------------------------------------

export interface FireResult {
  fired: boolean;
  reason?: "locked" | "no_gun" | "cooldown" | "empty_mag" | "no_reserve";
  damage?: number;
  pellets?: number;
  magAmmo?: number;
}

/** Attempt to fire the held gun. Returns damage to apply if fired. */
export function fireGun(state: GunState): FireResult {
  if (!state.gunsUnlocked) return { fired: false, reason: "locked" };
  if (!state.gun) return { fired: false, reason: "no_gun" };
  if (state.cooldown > 0) return { fired: false, reason: "cooldown" };
  if (state.magAmmo <= 0) return { fired: false, reason: "empty_mag" };

  const def = GUNS[state.gun];
  state.cooldown = def.rate;
  state.magAmmo -= 1;

  return {
    fired: true,
    damage: def.dmg,
    pellets: def.pellets,
    magAmmo: state.magAmmo,
  };
}

/** Reload from reserve into the magazine. Returns rounds loaded. */
export function reloadGun(state: GunState): number {
  if (!state.gun || !state.gunsUnlocked) return 0;
  const def = GUNS[state.gun];
  const needed = def.mag - state.magAmmo;
  const loaded = Math.min(needed, state.reserveAmmo);
  state.magAmmo += loaded;
  state.reserveAmmo -= loaded;
  return loaded;
}

/** Tick cooldowns. Call every frame with dt. */
export function tickGun(state: GunState, dt: number): void {
  state.cooldown = Math.max(0, state.cooldown - dt);
}

// ---------------------------------------------------------------------------
// Disarm — knock the gun out of someone's hand
// ---------------------------------------------------------------------------

export interface DisarmResult {
  disarmed: boolean;
  /** The gun that dropped (spawns as a world pickup). */
  droppedGun: GunId | null;
  /** Ammo left in the dropped gun's magazine. */
  droppedAmmo: number;
}

/**
 * Disarm check. Called when a heavy attack / counter lands on an armed enemy.
 * @param disarmChance 0..1 — higher for counters, heavy attacks, from behind.
 */
export function tryDisarm(
  target: GunState,
  disarmChance: number,
  rng: () => number = Math.random
): DisarmResult {
  if (!target.gun) return { disarmed: false, droppedGun: null, droppedAmmo: 0 };
  if (rng() > disarmChance) return { disarmed: false, droppedGun: null, droppedAmmo: 0 };

  const droppedGun = target.gun;
  const droppedAmmo = target.magAmmo;
  // Target loses the gun. Reserve ammo stays with them (they might pick it back up).
  target.gun = null;
  target.magAmmo = 0;
  target.cooldown = 0;

  return { disarmed: true, droppedGun, droppedAmmo };
}

/** Pick up a dropped gun. Replaces currently held gun (old one drops). */
export function pickupGun(
  state: GunState,
  gun: GunId,
  magAmmo: number
): GunId | null {
  if (!state.gunsUnlocked) return null;
  const old = state.gun;
  state.gun = gun;
  state.magAmmo = magAmmo;
  state.cooldown = 0.3; // brief draw time
  return old;
}

/** Pistol-whip: melee attack with the gun as a blunt object. */
export function pistolWhipDamage(state: GunState): number {
  if (!state.gun) return 0;
  // A gun makes a decent club. Not as good as a bat, better than fists.
  return 14;
}

// ---------------------------------------------------------------------------
// Ammo economy — the money sink
// ---------------------------------------------------------------------------

export interface AmmoPurchase {
  bought: number;
  cost: number;
  success: boolean;
}

/**
 * Buy ammo. Ammo is deliberately expensive — this is the Yakuza money sink.
 * @param wallet Current money. Mutated on success.
 */
export function buyAmmo(
  state: GunState,
  gun: GunId,
  rounds: number,
  wallet: { money: number }
): AmmoPurchase {
  if (!state.gunsUnlocked) return { bought: 0, cost: 0, success: false };
  const def = GUNS[gun];
  // Bulk discount: 10% off per 12 rounds, max 30% off. Still expensive.
  const discount = Math.min(0.3, Math.floor(rounds / 12) * 0.1);
  const cost = Math.ceil(rounds * def.ammoPrice * (1 - discount));
  if (wallet.money < cost) return { bought: 0, cost, success: false };
  wallet.money -= cost;
  state.reserveAmmo += rounds;
  return { bought: rounds, cost, success: true };
}

/** Buy a gun on the black market. Rare stock — the shop decides availability. */
export function buyGun(
  state: GunState,
  gun: GunId,
  wallet: { money: number }
): boolean {
  if (!state.gunsUnlocked) return false;
  const def = GUNS[gun];
  if (wallet.money < def.price) return false;
  wallet.money -= def.price;
  // Buying a gun comes with one loaded magazine, nothing in reserve.
  state.gun = gun;
  state.magAmmo = def.mag;
  return true;
}

// ---------------------------------------------------------------------------
// World spawns — guns are RARE
// ---------------------------------------------------------------------------

/**
 * Roll for a gun spawn at a loot location.
 * @param luckModifier Multiplies base chance (e.g. high-attention districts).
 * @returns GunId if a gun spawns, null otherwise.
 */
export function rollGunSpawn(
  luckModifier = 1,
  rng: () => number = Math.random
): GunId | null {
  // Base: 2% chance per loot roll. Yakuza-rare.
  const BASE_CHANCE = 0.02 * luckModifier;
  if (rng() > BASE_CHANCE) return null;

  // Weighted by rarity.
  const total = GUN_IDS.reduce((s, id) => s + GUNS[id].rarity, 0);
  let roll = rng() * total;
  for (const id of GUN_IDS) {
    roll -= GUNS[id].rarity;
    if (roll <= 0) return id;
  }
  return "pistol";
}

/** Starting ammo for a found gun: 1 mag, sometimes 2. Never full reserve. */
export function foundGunAmmo(gun: GunId, rng: () => number = Math.random): number {
  return rng() < 0.25 ? GUNS[gun].mag * 2 : GUNS[gun].mag;
}

// ---------------------------------------------------------------------------
// First encounter — Finn "The Priest" Mac
// ---------------------------------------------------------------------------

export interface FinnEncounter {
  /** Mission id that triggers the encounter. */
  missionId: string;
  /** Dialogue beats (the game loop plays these). */
  introLines: string[];
  /** What happens when he's disarmed. */
  disarmLines: string[];
}

/**
 * Finn Mac's debut mission. He draws a pistol mid-fight — the player's
 * first time seeing a gun. Disarm him to unlock guns for the rest of game.
 *
 * Design: Finn is a "Chaplain" — the gun/priest contradiction is the point.
 * He believes the badge is divine mandate. The gun is his "instrument."
 */
export const FINN_FIRST_ENCOUNTER: FinnEncounter = {
  missionId: "authority_finn_debut",
  introLines: [
    "FINN: Confess, child. The Script demands it.",
    "FINN: You resist the Authority — you resist the divine order itself.",
    "* Finn draws a pistol from his gun belt. *",
    "FINN: This is my instrument. Let us see if you are worthy of absolution.",
  ],
  disarmLines: [
    "* The pistol clatters across the pavement. *",
    "FINN: ...My instrument! You DARE—",
    "* Guns are now unlocked. That pistol is yours if you want it. *",
    "* Remember: ammo is expensive, and gunfire draws attention. *",
  ],
};

/** Call when the player disarms Finn in his debut mission. */
export function unlockGuns(state: GunState): void {
  state.gunsUnlocked = true;
}

// ---------------------------------------------------------------------------
// Attention integration — gunfire is LOUD
// ---------------------------------------------------------------------------

/**
 * Attention gain for firing a gun in public.
 * Firing a gun is the loudest thing you can do short of blowing up a car.
 * Integrates with attention.ts's AttentionAction system — the game loop
 * should report "gunfire" alongside "publicBrawl" etc.
 */
export const GUNFIRE_ATTENTION = 25;

/** Suppressed-ish: firing indoors/underground is slightly less noticeable. */
export const GUNFIRE_ATTENTION_INDOOR = 15;
