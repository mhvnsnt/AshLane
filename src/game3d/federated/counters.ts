/**
 * Federated counter system for AshLane.
 *
 * The owner asked for a counter button (input abstraction ready in touch.ts).
 * This module implements the counter MECHANICS:
 *
 *  - Tap counter within the parry window of an incoming attack -> negate it,
 *    open the attacker up for a punish.
 *  - Whiffed counter = recovery (risk/reward, not a free option).
 *
 * Design parallels: Tekken parry/reversal timing, Def Jam's counter-grapple
 * feel, Urban Reign's reversal windows — implemented as frame data so it
 * composes with framedata.ts.
 */

import { type MoveData } from "./framedata";

export interface CounterState {
  /** frames remaining in the active parry window */
  active: number;
  /** frames of whiff recovery */
  recovery: number;
  /** cooldown before counter can be used again */
  cooldown: number;
  /** successful counters this fight (for scoring/style) */
  count: number;
}

export const COUNTER_ACTIVE = 10;    // ~167ms parry window
export const COUNTER_RECOVERY = 24;  // whiff punishable
export const COUNTER_COOLDOWN = 45;  // can't spam

export function createCounter(): CounterState {
  return { active: 0, recovery: 0, cooldown: 0, count: 0 };
}

/** Player pressed counter. Returns false if on cooldown/recovery. */
export function tryCounter(c: CounterState): boolean {
  if (c.cooldown > 0 || c.recovery > 0 || c.active > 0) return false;
  c.active = COUNTER_ACTIVE;
  return true;
}

export function updateCounter(c: CounterState): void {
  if (c.active > 0) c.active--;
  else if (c.recovery > 0) c.recovery--;
  if (c.cooldown > 0) c.cooldown--;
}

/**
 * An attack with the given move data is about to hit the countering player.
 * Returns "countered" | "traded" | "missed" (counter not active).
 *
 * Countered: attacker enters a long punishable stagger; counterer is free.
 * Launchers and haymakers can't be countered — must be dodged/blocked.
 */
export function resolveCounter(
  c: CounterState,
  incoming: MoveData,
): "countered" | "traded" | "missed" {
  if (c.active <= 0) return "missed";
  c.active = 0;
  if (incoming.launcher || incoming.id === "haymaker") {
    // Too heavy — trade (both take reduced damage), no free punish
    c.recovery = 12;
    c.cooldown = COUNTER_COOLDOWN;
    return "traded";
  }
  c.count++;
  c.cooldown = COUNTER_COOLDOWN;
  return "countered";
}

/** Whiff: counter pressed but nothing came — punishable recovery */
export function counterWhiff(c: CounterState): void {
  if (c.active > 0) {
    c.active = 0;
    c.recovery = COUNTER_RECOVERY;
    c.cooldown = COUNTER_COOLDOWN;
  }
}

/** Punish window granted to the counterer, in frames */
export const COUNTER_PUNISH_FRAMES = 30;
