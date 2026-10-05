/**
 * Urban Mayhem Frame Data — ported to AshLane.
 * Original: mhvnsnt/URBAN-MAYHEM- Godot/scripts/combat_director.gd (MOVES)
 *
 * Per-move combat frame data: startup / active / recovery timing,
 * damage, poise damage, range, stamina cost.
 *
 * Complements movesets.ts (animation-timed pools) with the
 * simulation-tuned numbers the AI and damage resolver use.
 */

export interface FrameData {
  startup: number;   // seconds before active frames
  active: number;    // seconds the hitbox is live
  recovery: number;  // seconds after active before neutral
  damage: number;    // base HP damage
  poise: number;     // poise/stagger damage
  range: number;     // metres
  stamina: number;   // stamina cost
}

export const MOVES: Record<string, FrameData> = {
  jab:              { startup: 0.10, active: 0.08, recovery: 0.18, damage: 6,  poise: 3,  range: 1.80, stamina: 4 },
  cross:            { startup: 0.16, active: 0.10, recovery: 0.24, damage: 10, poise: 6,  range: 1.90, stamina: 7 },
  hook:             { startup: 0.20, active: 0.10, recovery: 0.28, damage: 13, poise: 9,  range: 1.70, stamina: 8 },
  uppercut:         { startup: 0.22, active: 0.10, recovery: 0.32, damage: 16, poise: 14, range: 1.45, stamina: 10 },
  body_hook:        { startup: 0.18, active: 0.10, recovery: 0.28, damage: 14, poise: 7,  range: 1.55, stamina: 8 },
  low_kick:         { startup: 0.18, active: 0.12, recovery: 0.25, damage: 9,  poise: 8,  range: 1.75, stamina: 7 },
  teep:             { startup: 0.20, active: 0.12, recovery: 0.28, damage: 10, poise: 11, range: 2.00, stamina: 8 },
  roundhouse:       { startup: 0.30, active: 0.14, recovery: 0.38, damage: 19, poise: 16, range: 1.90, stamina: 13 },
  knee:             { startup: 0.20, active: 0.12, recovery: 0.30, damage: 17, poise: 13, range: 1.25, stamina: 10 },
  elbow:            { startup: 0.16, active: 0.10, recovery: 0.30, damage: 18, poise: 15, range: 1.15, stamina: 10 },
  heavy:            { startup: 0.38, active: 0.14, recovery: 0.46, damage: 24, poise: 20, range: 1.65, stamina: 16 },
  clinch_entry:     { startup: 0.22, active: 0.14, recovery: 0.40, damage: 3,  poise: 16, range: 1.25, stamina: 9 },
  takedown:         { startup: 0.28, active: 0.16, recovery: 0.55, damage: 8,  poise: 30, range: 1.35, stamina: 14 },
  throw:            { startup: 0.36, active: 0.18, recovery: 0.65, damage: 18, poise: 35, range: 1.20, stamina: 18 },
  sweep:            { startup: 0.25, active: 0.14, recovery: 0.48, damage: 7,  poise: 26, range: 1.25, stamina: 12 },
  sprawl:           { startup: 0.10, active: 0.12, recovery: 0.30, damage: 5,  poise: 18, range: 1.20, stamina: 8 },
  ground_strike:    { startup: 0.16, active: 0.10, recovery: 0.24, damage: 15, poise: 10, range: 1.40, stamina: 8 },
  guard_pass:       { startup: 0.25, active: 0.12, recovery: 0.38, damage: 4,  poise: 15, range: 1.10, stamina: 9 },
  armbar:           { startup: 0.40, active: 0.20, recovery: 0.60, damage: 20, poise: 5,  range: 1.30, stamina: 18 },
  rear_naked_choke: { startup: 0.45, active: 0.25, recovery: 0.65, damage: 24, poise: 4,  range: 1.10, stamina: 20 },
  triangle:         { startup: 0.44, active: 0.22, recovery: 0.62, damage: 21, poise: 5,  range: 1.10, stamina: 19 },
  submission:       { startup: 0.40, active: 0.20, recovery: 0.60, damage: 20, poise: 5,  range: 1.30, stamina: 18 },
};

export const MOVE_KEYS = Object.keys(MOVES);

/** Total duration of a move (startup + active + recovery). */
export function moveDuration(moveId: string): number {
  const m = MOVES[moveId];
  if (!m) return 0.5;
  return m.startup + m.active + m.recovery;
}

/** Frame data lookup with fallback. */
export function frameData(moveId: string): FrameData {
  return MOVES[moveId] ?? MOVES.jab;
}
