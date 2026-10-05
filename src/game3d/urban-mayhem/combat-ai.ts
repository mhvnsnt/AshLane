/**
 * Urban Mayhem Combat AI — ported to AshLane.
 * Original: mhvnsnt/URBAN-MAYHEM- Godot/scripts/combat_ai_director.gd
 *
 * Tactical combat decision authority: utility scoring, style-aware
 * behavior, threat memory. Each fighter picks actions by scoring
 * every option against the current situation, with a bonus from
 * their 24-discipline style profile.
 */

import { getStyle, assignStyle, styleForSeed } from "./disciplines";

export type CombatAction =
  | "jab" | "cross" | "hook" | "low_kick" | "heavy"
  | "takedown" | "block" | "retreat" | "counter"
  | "ground_strike" | "submission";

export interface FighterProfile {
  archetype: string;
  skill: number;    // 0-1
  cooldown: number; // seconds until next decision
}

export interface CombatActorSnapshot {
  stamina: number;  // 0-100
  health: number;   // 0-100
  poise: number;    // 0-100
  state: string;    // neutral | ground | pin | stunned | knockdown ...
}

const ARCHETYPES: Record<string, { aggression: number; counter: number; grapple: number; risk: number }> = {
  brawler:   { aggression: 0.82, counter: 0.25, grapple: 0.35, risk: 0.75 },
  boxer:     { aggression: 0.68, counter: 0.72, grapple: 0.18, risk: 0.48 },
  wrestler:  { aggression: 0.62, counter: 0.42, grapple: 0.88, risk: 0.55 },
  technical: { aggression: 0.48, counter: 0.86, grapple: 0.52, risk: 0.28 },
  enforcer:  { aggression: 0.92, counter: 0.30, grapple: 0.62, risk: 0.82 },
};

const ACTION_COOLDOWNS: Record<string, number> = {
  jab: 0.35, cross: 0.5, hook: 0.55, low_kick: 0.55, heavy: 0.9,
  takedown: 1.2, block: 0.4, retreat: 0.6, counter: 0.7,
  ground_strike: 0.5, submission: 1.4,
};

const profiles = new Map<string, FighterProfile>();
const threats = new Map<string, { move: string; zone: string; damage: number; time: number }>();

/** Register a fighter with an AI archetype + skill. Auto-assigns a 24-discipline style. */
export function registerFighter(id: string, archetype = "brawler", skill = 0.5): void {
  // Deterministic style from id hash so the same fighter always fights the same way.
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const { discipline, modifier } = styleForSeed(h, skill);
  assignStyle(id, discipline, modifier, skill);
  profiles.set(id, {
    archetype: ARCHETYPES[archetype] ? archetype : "brawler",
    skill: Math.max(0, Math.min(1, skill)),
    cooldown: 0,
  });
}

export function unregisterFighter(id: string): void {
  profiles.delete(id);
  for (const k of [...threats.keys()]) {
    if (k.startsWith(id + ">") || k.endsWith(">" + id)) threats.delete(k);
  }
}

/** Record an observed hit for threat memory. */
export function observeHit(attackerId: string, defenderId: string, move: string, zone: string, damage: number): void {
  threats.set(`${attackerId}>${defenderId}`, { move, zone, damage, time: Date.now() / 1000 });
}

export function canDecide(id: string): boolean {
  const p = profiles.get(id);
  return !!p && p.cooldown <= 0;
}

export function tickCooldowns(dt: number): void {
  for (const p of profiles.values()) p.cooldown = Math.max(0, p.cooldown - dt);
}

function styleBonus(action: string, style: { preferred: string[]; grapple: number; kicks: number; counter: number; pressure: number }): number {
  let bonus = 0;
  if (style.preferred.includes(action)) bonus += 0.42;
  if (action === "takedown" || action === "submission") bonus += style.grapple * 0.30;
  if (action === "low_kick") bonus += style.kicks * 0.22;
  if (action === "counter") bonus += style.counter * 0.22;
  if (["jab", "cross", "hook", "heavy"].includes(action)) bonus += style.pressure * 0.10;
  return bonus;
}

function scoreAction(
  action: CombatAction,
  a: CombatActorSnapshot, d: CombatActorSnapshot,
  p: FighterProfile, distance: number
): number {
  const arch = ARCHETYPES[p.archetype];
  const stamina = a.stamina / 100;
  const targetHealth = d.health / 100;
  const targetPoise = d.poise / 100;
  const skill = p.skill;
  let score = 0;
  switch (action) {
    case "jab":          score = 0.45 + stamina * 0.35 + (1 - distance / 3) * 0.3; break;
    case "cross":        score = 0.25 + stamina * 0.3 + (1 - targetPoise) * 0.35 + skill * 0.2; break;
    case "hook":         score = 0.20 + stamina * 0.3 + arch.aggression * 0.35 + (1 - distance / 2.5) * 0.3; break;
    case "low_kick":     score = 0.18 + stamina * 0.25 + (1 - targetHealth) * 0.2 + arch.aggression * 0.25; break;
    case "heavy":        score = arch.aggression * 0.6 + (1 - targetHealth) * 0.65 + stamina * 0.2; break;
    case "takedown":     score = arch.grapple * 0.9 + (1 - targetPoise) * 0.55 + (distance < 1.7 ? 1 : -0.35); break;
    case "block":        score = 0.3 + (1 - stamina) * 0.2 + arch.counter * 0.25; break;
    case "retreat":      score = 0.15 + (1 - stamina) * 0.4 + (1 - arch.risk) * 0.2; break;
    case "counter":      score = arch.counter * 0.7 + skill * 0.3; break;
    case "ground_strike":score = 0.6 + arch.aggression * 0.3; break;
    case "submission":   score = arch.grapple * 0.8 + (1 - targetHealth) * 0.4; break;
  }
  return score;
}

/**
 * Decide the fighter's next action. Returns "" if they can't decide yet.
 * Style profile adds a bonus so a muay-thai fighter prefers kicks,
 * a wrestler prefers takedowns, etc.
 */
export function decide(
  actorId: string,
  a: CombatActorSnapshot,
  d: CombatActorSnapshot,
  distance: number
): CombatAction | "" {
  if (!canDecide(actorId)) return "";
  const p = profiles.get(actorId)!;
  const actions: CombatAction[] = ["jab", "cross", "hook", "low_kick", "heavy", "takedown", "block", "retreat", "counter"];
  if (d.state === "ground" || d.state === "pin") {
    actions.push("ground_strike", "submission");
  }
  const style = getStyle(actorId);
  let best: CombatAction = "jab";
  let bestScore = -Infinity;
  for (const action of actions) {
    let s = scoreAction(action, a, d, p, distance);
    s += styleBonus(action, style);
    if (s > bestScore) { bestScore = s; best = action; }
  }
  p.cooldown = ACTION_COOLDOWNS[best] ?? 0.5;
  return best;
}
