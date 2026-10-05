/**
 * Federated frame-data system for AshLane combat.
 *
 * Inspiration: aminrx/shoto-fighter-godot (MIT, code only) — real frame data:
 * startup/active/recovery, hitstun/hitstop, combo damage scaling.
 * This is an original TypeScript implementation of that architecture,
 * adapted to AshLane's sim (which runs at 60 ticks/sec).
 *
 * Every attack is data: { startup, active, recovery, damage, ... }.
 * The sim reads this instead of hardcoding timings per move.
 */

export interface MoveData {
  id: string;
  /** frames before the hitbox is live */
  startup: number;
  /** frames the hitbox stays live */
  active: number;
  /** frames before you can act again */
  recovery: number;
  damage: number;
  /** hitstun frames dealt on hit */
  hitstun: number;
  /** blockstun frames on block */
  blockstun: number;
  /** hitstop freeze frames (attacker+victim) */
  hitstop: number;
  range: number;
  /** knockback impulse */
  knockback: number;
  /** launches (juggle starter) */
  launcher: boolean;
  /** hits airborne opponents */
  antiAir: boolean;
}

export const MOVES: Record<string, MoveData> = {
  jab:        { id: "jab",        startup: 6,  active: 3, recovery: 10, damage: 6,  hitstun: 12, blockstun: 8,  hitstop: 3, range: 1.6, knockback: 2,   launcher: false, antiAir: false },
  cross:      { id: "cross",      startup: 9,  active: 3, recovery: 14, damage: 9,  hitstun: 14, blockstun: 10, hitstop: 4, range: 1.7, knockback: 3,   launcher: false, antiAir: false },
  hook:       { id: "hook",       startup: 12, active: 4, recovery: 18, damage: 13, hitstun: 18, blockstun: 12, hitstop: 5, range: 1.6, knockback: 5,   launcher: false, antiAir: true  },
  uppercut:   { id: "uppercut",   startup: 14, active: 4, recovery: 24, damage: 16, hitstun: 26, blockstun: 14, hitstop: 6, range: 1.5, knockback: 7,   launcher: true,  antiAir: true  },
  kick_low:   { id: "kick_low",   startup: 10, active: 4, recovery: 16, damage: 10, hitstun: 14, blockstun: 10, hitstop: 4, range: 2.0, knockback: 3,   launcher: false, antiAir: false },
  kick_high:  { id: "kick_high",  startup: 16, active: 4, recovery: 22, damage: 15, hitstun: 20, blockstun: 13, hitstop: 5, range: 2.2, knockback: 6,   launcher: false, antiAir: false },
  elbow:      { id: "elbow",      startup: 8,  active: 3, recovery: 12, damage: 8,  hitstun: 13, blockstun: 9,  hitstop: 3, range: 1.3, knockback: 2.5, launcher: false, antiAir: false },
  knee:       { id: "knee",       startup: 11, active: 3, recovery: 15, damage: 11, hitstun: 16, blockstun: 11, hitstop: 4, range: 1.4, knockback: 4,   launcher: false, antiAir: false },
  sweep:      { id: "sweep",      startup: 15, active: 5, recovery: 20, damage: 12, hitstun: 24, blockstun: 12, hitstop: 5, range: 2.1, knockback: 4,   launcher: false, antiAir: false },
  haymaker:   { id: "haymaker",   startup: 22, active: 5, recovery: 30, damage: 24, hitstun: 32, blockstun: 18, hitstop: 8, range: 1.8, knockback: 10,  launcher: true,  antiAir: false },
};

/** Combo damage scaling: each hit in a combo deals less (shoto-fighter pattern) */
export function comboScale(hitIndex: number): number {
  if (hitIndex <= 1) return 1;
  if (hitIndex === 2) return 0.9;
  if (hitIndex === 3) return 0.8;
  return Math.max(0.5, 0.8 - (hitIndex - 3) * 0.07);
}

export interface MoveState {
  moveId: string;
  /** frames elapsed since move started */
  t: number;
  /** has the hitbox connected this activation? */
  connected: boolean;
}

/** What phase is the move in? */
export function movePhase(m: MoveData, t: number): "startup" | "active" | "recovery" | "done" {
  if (t < m.startup) return "startup";
  if (t < m.startup + m.active) return "active";
  if (t < m.startup + m.active + m.recovery) return "recovery";
  return "done";
}

/** Can this move be canceled into another right now? (combo buffer window) */
export function cancelWindow(m: MoveData, t: number): boolean {
  // Cancel allowed from first active frame through mid-recovery (150ms ≈ 9 frames)
  return t >= m.startup && t < m.startup + m.active + 9;
}

/** Frame advantage on hit: how many frames sooner attacker recovers vs victim */
export function frameAdvantage(m: MoveData): number {
  return m.hitstun - (m.startup + m.active + m.recovery - (m.startup + m.active));
}
