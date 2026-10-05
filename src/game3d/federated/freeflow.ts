/**
 * Federated Freeflow Combat for AshLane
 * Ported from celojevic/batman-arkham-combat (MIT)
 * Original: Assets/Scripts/CombatScript.cs
 *
 * The "magnetic" Arkham feel: when you attack, the player automatically
 * moves toward the best target. Directional input biases target selection.
 * Counters trigger when an enemy is winding up an attack.
 */
import type { Body } from "../sim";

export interface FreeflowState {
  lockedTargetId: number | null;
  isAttacking: boolean;
  isCountering: boolean;
  attackCooldown: number;
  attackCount: number;
}

/** Distance on the XZ plane. */
function dist(a: Body, b: Body): number {
  const dx = b.x - a.x, dz = b.z - a.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Pick the best target for a freeflow attack.
 * - If the player is giving directional input (inputMag > 0.2), prefer the
 *   enemy in that direction (cone check).
 * - Otherwise pick the nearest living enemy.
 * Mirrors CombatScript.AttackCheck().
 */
export function pickFreeflowTarget(
  player: Body,
  bodies: Body[],
  inputX: number,
  inputZ: number,
  inputMag: number,
  maxRange = 15
): Body | null {
  const enemies = bodies.filter(
    (b) => b.alive && b.kind !== "player" && b.kind !== "ally" && dist(player, b) < maxRange
  );
  if (enemies.length === 0) return null;

  if (inputMag > 0.2) {
    // Directional: pick enemy most aligned with input direction.
    const ix = inputX / inputMag, iz = inputZ / inputMag;
    let best: Body | null = null, bestDot = -2;
    for (const e of enemies) {
      const dx = e.x - player.x, dz = e.z - player.z;
      const d = Math.sqrt(dx * dx + dz * dz) || 1;
      const dot = (dx / d) * ix + (dz / d) * iz;
      if (dot > bestDot) { bestDot = dot; best = e; }
    }
    if (best && bestDot > 0.3) return best;
  }
  // Fallback: nearest.
  enemies.sort((a, b) => dist(player, a) - dist(player, b));
  return enemies[0];
}

/**
 * Compute the "magnetic" lunge toward the target.
 * Returns the XZ offset to apply over the attack's movement duration.
 * Mirrors CombatScript.MoveTorwardsTarget() — stops 0.95 short of the target.
 */
export function freeflowLunge(player: Body, target: Body): { dx: number; dz: number } {
  const dx = target.x - player.x, dz = target.z - player.z;
  const d = Math.sqrt(dx * dx + dz * dz) || 1;
  const stopDist = 0.95;
  const travel = Math.max(0, d - stopDist);
  return { dx: (dx / d) * travel, dz: (dz / d) * travel };
}

/**
 * Find the closest enemy currently winding up an attack (for counters).
 * Mirrors CombatScript.ClosestCounterEnemy().
 */
export function findCounterTarget(player: Body, bodies: Body[]): Body | null {
  let best: Body | null = null, bestDist = Infinity;
  for (const b of bodies) {
    if (!b.alive || b.kind === "player" || b.kind === "ally") continue;
    // "Preparing attack" = in windup/atk state with low stateT (just started).
    if (b.state === "windup" || (b.state === "atk" && b.stateT < 0.15)) {
      const d = dist(player, b);
      if (d < bestDist) { bestDist = d; best = b; }
    }
  }
  return best;
}

/** True when this is the final blow (last enemy, low HP) — for slow-mo finish. */
export function isLastHit(target: Body, bodies: Body[]): boolean {
  const aliveEnemies = bodies.filter((b) => b.alive && b.kind !== "player" && b.kind !== "ally");
  return aliveEnemies.length === 1 && target.hp <= target.maxHp * 0.15;
}
