/**
 * Urban Mayhem Heat / Wanted — ported to AshLane.
 * Original: mhvnsnt/URBAN-MAYHEM- Game/src/meta.js (Heat class, CRIME)
 *
 * Infractions raise heat; distance, time and cover lower it.
 * Adapted for AshLane: gun-related crimes (gunfire, vehicleTheft,
 * hitAndRun, robbery-armed) REMOVED — no guns, no driving.
 * Street-brawler crimes retained.
 */

export interface CrimeDef {
  heat: number;
  name: string;
}

export const CRIME: Record<string, CrimeDef> = {
  trespass:    { heat: 2,  name: "Trespassing" },
  assault:     { heat: 8,  name: "Assault" },
  murder:      { heat: 40, name: "Homicide" },
  copKill:     { heat: 70, name: "Killing an officer" },
  propertyDmg: { heat: 5,  name: "Property damage" },
  brawl:       { heat: 12, name: "Street brawl" },
  // SKIPPED (guns/driving): gunfire, vehicleTheft, hitAndRun, robbery
};

/** Heat thresholds for 0-5 stars. */
export const HEAT_STARS = [0, 20, 55, 110, 190, 300];

export interface HeatEvents {
  onCrime?: (kind: string, name: string, heat: number, stars: number) => void;
  onWanted?: (stars: number, value: number) => void;
}

export class Heat {
  value = 0;
  stars = 0;
  lastCrime: string | null = null;
  cooldown = 0;
  evade = 0;
  busted = false;
  crimes: Array<{ kind: string; at: number }> = [];
  private region = "strip";
  private regionHeatBias: Record<string, number> = {};
  private events: HeatEvents;

  constructor(events: HeatEvents = {}, regionHeatBias: Record<string, number> = {}) {
    this.events = events;
    this.regionHeatBias = regionHeatBias;
  }

  add(kind: string, mult = 1): void {
    const c = CRIME[kind];
    if (!c) return;
    const bias = this.regionHeatBias[this.region] ?? 1;
    this.value += c.heat * mult * bias;
    this.lastCrime = c.name;
    this.cooldown = 0;
    this.crimes.push({ kind, at: Date.now() });
    if (this.crimes.length > 40) this.crimes.shift();
    this.restat();
    this.events.onCrime?.(kind, c.name, this.value, this.stars);
  }

  private restat(): void {
    let s = 0;
    for (let i = HEAT_STARS.length - 1; i >= 0; i--) {
      if (this.value >= HEAT_STARS[i]) { s = i; break; }
    }
    if (s !== this.stars) {
      this.stars = s;
      this.events.onWanted?.(s, this.value);
    }
  }

  /**
   * Tick heat decay.
   * @param seenByCop — whether any officer currently sees the player
   * @param region — current district key (for heat bias)
   */
  update(dt: number, seenByCop: boolean, region: string): void {
    this.region = region;
    if (this.stars === 0) {
      this.value = Math.max(0, this.value - dt * 4);
      return;
    }
    if (!seenByCop) {
      this.evade += dt;
      // Evade long enough unseen and heat drops a star.
      const evadeNeed = 20 + this.stars * 15;
      if (this.evade >= evadeNeed) {
        this.value = Math.max(0, this.value - HEAT_STARS[this.stars] * 0.5);
        this.evade = 0;
        this.restat();
      }
    } else {
      this.evade = 0;
      this.cooldown += dt;
    }
    // Slow passive decay even when wanted.
    this.value = Math.max(0, this.value - dt * 0.8);
    this.restat();
  }

  reset(): void {
    this.value = 0; this.stars = 0; this.lastCrime = null;
    this.cooldown = 0; this.evade = 0; this.busted = false; this.crimes = [];
  }
}
