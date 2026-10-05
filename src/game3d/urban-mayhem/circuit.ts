/**
 * Urban Mayhem "The Circuit" — ported to AshLane.
 * Original: mhvnsnt/URBAN-MAYHEM- Game/src/careers.js (CIRCUIT_TIERS)
 *
 * Ranked underground fights for a purse. Each tier: tougher opponents,
 * bigger purses, entry fees. This is AshLane's tournament/fight-club
 * progression backbone.
 *
 * SKIPPED from careers.js: The Blocks (drug economy — owner didn't ask),
 * The Wheel (street racing — no driving in AshLane), Hired Gun
 * (gun contracts — no guns). Documented in URBAN_MAYHEM_PORT.md.
 */

export interface CircuitTier {
  name: string;
  purse: number;
  hp: number;       // opponent HP
  skill: number;    // 0-1 opponent skill
  styles: string[]; // discipline ids opponents use
  entry: number;    // entry fee
}

export const CIRCUIT_TIERS: CircuitTier[] = [
  { name: "Card Filler", purse: 400,   hp: 85,  skill: 0.20, styles: ["street_boxing"], entry: 0 },
  { name: "Undercard",   purse: 1100,  hp: 105, skill: 0.35, styles: ["street_boxing", "boxing"], entry: 150 },
  { name: "Regional",    purse: 2800,  hp: 130, skill: 0.50, styles: ["boxing", "muay_thai", "wrestling"], entry: 400 },
  { name: "Main Event",  purse: 6500,  hp: 165, skill: 0.68, styles: ["muay_thai", "wrestling", "mma"], entry: 1000 },
  { name: "Title Fight", purse: 15000, hp: 210, skill: 0.85, styles: ["mma", "wrestling"], entry: 2500 },
  { name: "The Belt",    purse: 40000, hp: 280, skill: 0.96, styles: ["mma"], entry: 6000 },
];

export interface CircuitState {
  tier: number;       // current tier index
  wins: number;
  losses: number;
}

export function makeCircuit(): CircuitState {
  return { tier: 0, wins: 0, losses: 0 };
}

/** Can the player afford / access a tier? */
export function canEnterTier(s: CircuitState, tierIdx: number, cash: number): boolean {
  if (tierIdx < 0 || tierIdx >= CIRCUIT_TIERS.length) return false;
  if (tierIdx > s.tier + 1) return false; // must climb in order
  return cash >= CIRCUIT_TIERS[tierIdx].entry;
}

export interface CircuitResult {
  purse: number;
  newTier: number;
  titleWon: boolean;
}

/** Resolve a circuit fight. Returns purse + progression. */
export function resolveCircuitFight(s: CircuitState, tierIdx: number, won: boolean): CircuitResult {
  const tier = CIRCUIT_TIERS[tierIdx];
  let titleWon = false;
  if (won) {
    s.wins++;
    // Win at current max tier -> advance.
    if (tierIdx === s.tier && s.tier < CIRCUIT_TIERS.length - 1) {
      s.tier++;
    }
    if (tierIdx === CIRCUIT_TIERS.length - 1) titleWon = true;
    return { purse: tier.purse, newTier: s.tier, titleWon };
  }
  s.losses++;
  return { purse: 0, newTier: s.tier, titleWon: false };
}

/** Pick a random opponent style for a tier (caller provides rng 0-1). */
export function opponentStyleForTier(tierIdx: number, rng: () => number = Math.random): string {
  const styles = CIRCUIT_TIERS[tierIdx]?.styles ?? ["street_boxing"];
  return styles[Math.floor(rng() * styles.length)];
}
