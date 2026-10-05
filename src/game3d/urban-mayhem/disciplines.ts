/**
 * Urban Mayhem Combat Style System — ported to AshLane.
 * Original: mhvnsnt/URBAN-MAYHEM- Godot/scripts/combat_style_system.gd
 *
 * 24 disciplines x 8 tactical modifiers = 192 authored style combinations.
 * Combinations alter AI utility, preferred moves, spacing and risk.
 *
 * This is the full system. AshLane's char-gen.ts FightStyle is the
 * player-facing subset; this module is the AI/behavior authority.
 */

export interface DisciplineDef {
  range: number;
  pressure: number;
  counter: number;
  grapple: number;
  kicks: number;
  preferred: string[];
}

export interface ModifierDef {
  pressure?: number;
  counter?: number;
  grapple?: number;
  range?: number;
  risk?: number;
  speed?: number;
}

export interface StyleProfile extends DisciplineDef {
  discipline: string;
  modifier: string;
  id: string;
  skill: number;
  risk: number;
  speed: number;
}

export const DISCIPLINES: Record<string, DisciplineDef> = {
  boxing:         { range: 1.00, pressure: 0.78, counter: 0.76, grapple: 0.08, kicks: 0.10, preferred: ["jab", "cross", "hook"] },
  kickboxing:     { range: 1.08, pressure: 0.80, counter: 0.52, grapple: 0.12, kicks: 0.82, preferred: ["jab", "low_kick", "hook", "heavy"] },
  muay_thai:      { range: 1.00, pressure: 0.90, counter: 0.46, grapple: 0.48, kicks: 0.94, preferred: ["low_kick", "hook", "heavy"] },
  karate:         { range: 1.12, pressure: 0.48, counter: 0.82, grapple: 0.12, kicks: 0.72, preferred: ["jab", "low_kick", "counter"] },
  taekwondo:      { range: 1.18, pressure: 0.55, counter: 0.70, grapple: 0.05, kicks: 1.00, preferred: ["low_kick", "heavy", "counter"] },
  judo:           { range: 0.82, pressure: 0.64, counter: 0.72, grapple: 1.00, kicks: 0.05, preferred: ["takedown", "counter"] },
  wrestling:      { range: 0.82, pressure: 0.88, counter: 0.45, grapple: 1.00, kicks: 0.02, preferred: ["takedown", "heavy"] },
  bjj:            { range: 0.72, pressure: 0.50, counter: 0.88, grapple: 1.00, kicks: 0.02, preferred: ["takedown", "submission", "ground_strike"] },
  sambo:          { range: 0.82, pressure: 0.76, counter: 0.70, grapple: 0.92, kicks: 0.38, preferred: ["takedown", "low_kick", "submission"] },
  mma:            { range: 0.94, pressure: 0.82, counter: 0.66, grapple: 0.88, kicks: 0.72, preferred: ["jab", "takedown", "ground_strike", "low_kick"] },
  street_boxing:  { range: 0.94, pressure: 0.92, counter: 0.36, grapple: 0.30, kicks: 0.18, preferred: ["hook", "heavy", "jab"] },
  dirty_boxing:   { range: 0.78, pressure: 0.96, counter: 0.30, grapple: 0.66, kicks: 0.04, preferred: ["hook", "heavy", "takedown"] },
  savate:         { range: 1.16, pressure: 0.62, counter: 0.72, grapple: 0.08, kicks: 0.92, preferred: ["low_kick", "jab", "counter"] },
  capoeira:       { range: 1.04, pressure: 0.58, counter: 0.76, grapple: 0.16, kicks: 0.98, preferred: ["low_kick", "heavy", "counter"] },
  combat_sambo:   { range: 0.88, pressure: 0.90, counter: 0.62, grapple: 0.94, kicks: 0.48, preferred: ["takedown", "heavy", "submission"] },
  catch_wrestling:{ range: 0.76, pressure: 0.74, counter: 0.80, grapple: 1.00, kicks: 0.02, preferred: ["takedown", "submission"] },
  sumo:           { range: 0.72, pressure: 1.00, counter: 0.28, grapple: 0.82, kicks: 0.00, preferred: ["heavy", "takedown"] },
  silat:          { range: 0.92, pressure: 0.78, counter: 0.78, grapple: 0.62, kicks: 0.76, preferred: ["low_kick", "counter", "takedown"] },
  wing_chun:      { range: 0.76, pressure: 0.86, counter: 0.82, grapple: 0.26, kicks: 0.20, preferred: ["jab", "cross", "counter"] },
  krav_maga:      { range: 0.86, pressure: 0.94, counter: 0.50, grapple: 0.58, kicks: 0.52, preferred: ["heavy", "low_kick", "takedown"] },
  aikido:         { range: 0.82, pressure: 0.22, counter: 0.96, grapple: 0.86, kicks: 0.02, preferred: ["counter", "takedown", "submission"] },
  jeet_kune_do:   { range: 1.02, pressure: 0.74, counter: 0.86, grapple: 0.34, kicks: 0.62, preferred: ["jab", "counter", "low_kick"] },
  panantukan:     { range: 0.82, pressure: 0.88, counter: 0.68, grapple: 0.50, kicks: 0.08, preferred: ["hook", "counter", "takedown"] },
  luta_livre:     { range: 0.76, pressure: 0.68, counter: 0.82, grapple: 0.98, kicks: 0.05, preferred: ["takedown", "submission", "ground_strike"] },
};

export const MODIFIERS: Record<string, ModifierDef> = {
  pressure:          { pressure: 0.18, counter: -0.08, risk: 0.16, speed: 0.06 },
  counter_striker:  { pressure: -0.08, counter: 0.18, risk: -0.10, speed: 0.03 },
  grinder:          { pressure: 0.08, grapple: 0.14, risk: 0.05 },
  rangy:            { range: 0.16, counter: 0.10, risk: -0.04, speed: 0.08 },
  brawler:          { pressure: 0.20, counter: -0.14, risk: 0.22, speed: 0.02 },
  defensive:        { pressure: -0.18, counter: 0.22, risk: -0.18 },
  submission_hunter:{ grapple: 0.22, risk: 0.02, speed: -0.02 },
  tactical:         { counter: 0.14, risk: -0.08, speed: 0.04 },
};

export const DISCIPLINE_KEYS = Object.keys(DISCIPLINES);
export const MODIFIER_KEYS = Object.keys(MODIFIERS);

const clamp01 = (v: number, lo = 0, hi = 1.25) => Math.max(lo, Math.min(hi, v));

export interface StyleAssignment {
  id: string;
  discipline: string;
  modifier: string;
  skill: number;
}

const assignments = new Map<string, StyleAssignment>();

/** Assign a style to an actor. Returns the style id (discipline_modifier). */
export function assignStyle(actorId: string, discipline = "mma", modifier = "tactical", skill = 0.5): string {
  if (!DISCIPLINES[discipline]) discipline = "mma";
  if (!MODIFIERS[modifier]) modifier = "tactical";
  const id = `${discipline}_${modifier}`;
  assignments.set(actorId, { id, discipline, modifier, skill: clamp01(skill, 0, 1) });
  return id;
}

/** Get the full resolved style profile for an actor (base + modifier applied). */
export function getStyle(actorId: string): StyleProfile {
  let a = assignments.get(actorId);
  if (!a) {
    assignStyle(actorId);
    a = assignments.get(actorId)!;
  }
  const base = DISCIPLINES[a.discipline];
  const mod = MODIFIERS[a.modifier];
  const out: StyleProfile = {
    range: base.range, pressure: base.pressure, counter: base.counter,
    grapple: base.grapple, kicks: base.kicks, preferred: [...base.preferred],
    discipline: a.discipline, modifier: a.modifier, id: a.id, skill: a.skill,
    risk: 0.5, speed: 0.5,
  };
  for (const key of ["range", "pressure", "counter", "grapple", "kicks"] as const) {
    const dv = (mod as Record<string, number>)[key];
    if (dv !== undefined) out[key] = clamp01(out[key] + dv);
  }
  out.risk = clamp01(0.5 + (mod.risk ?? 0), 0.05, 1.0);
  out.speed = clamp01(0.5 + (mod.speed ?? 0) + a.skill * 0.25, 0.2, 1.0);
  return out;
}

/** Pick the style's preferred move from the available list. */
export function preferredMove(actorId: string, available: string[]): string {
  const style = getStyle(actorId);
  for (const move of style.preferred) {
    if (available.includes(move)) return move;
  }
  return available.length > 0 ? available[0] : "";
}

/** Total authored style space: 24 x 8 = 192. */
export function countStyleSpace(): number {
  return DISCIPLINE_KEYS.length * MODIFIER_KEYS.length;
}

/** Deterministic style from a numeric seed (for generated grunts). */
export function styleForSeed(seed: number, skill = 0.5): { discipline: string; modifier: string } {
  const d = DISCIPLINE_KEYS[Math.abs(seed) % DISCIPLINE_KEYS.length];
  const m = MODIFIER_KEYS[Math.abs(seed >> 4) % MODIFIER_KEYS.length];
  return { discipline: d, modifier: m };
}

/**
 * Map a 24-discipline id to AshLane's char-gen FightStyle (player-facing subset).
 * Used to bridge the full AI system with the visible style labels.
 */
export function disciplineToFightStyle(discipline: string): string {
  const map: Record<string, string> = {
    boxing: "boxing", kickboxing: "kickboxing", muay_thai: "muay-thai",
    karate: "martial-arts", taekwondo: "martial-arts", judo: "wrestling",
    wrestling: "wrestling", bjj: "mma", sambo: "mma", mma: "mma",
    street_boxing: "street", dirty_boxing: "street", savate: "kickboxing",
    capoeira: "capoeira", combat_sambo: "mma", catch_wrestling: "wrestling",
    sumo: "wrestling", silat: "martial-arts", wing_chun: "martial-arts",
    krav_maga: "street", aikido: "martial-arts", jeet_kune_do: "martial-arts",
    panantukan: "street", luta_livre: "mma",
  };
  return map[discipline] ?? "street";
}
