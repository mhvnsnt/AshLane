/**
 * Federated Enemy Group AI for AshLane
 * Ported from paulcodes/deathblood-lazer (MIT)
 * Original: scripts/managers/enemy_group_manager.gd
 *
 * Configurable per-mission: 3 for fair fights, 8+ for swarm missions.
 * Enemies request permission before entering ATTACK state; if MAX_ATTACKERS
 * are already attacking, they circle/wait instead.
 */
import type { Body } from "../sim";

export let MAX_ATTACKERS = 3;

/** Set max attackers for this mission (e.g. 8 for swarm missions). */
export function setMaxAttackers(n: number) { MAX_ATTACKERS = n; }

export interface GroupAIState {
  activeAttackers: number[]; // body ids currently in attack
}

/** Enemy requests permission to attack. Returns true if granted. */
export function requestAttack(group: GroupAIState, enemyId: number, bodies: Body[]): boolean {
  // Prune dead/finished attackers.
  group.activeAttackers = group.activeAttackers.filter((id) => {
    const b = bodies.find((x) => x.id === id);
    return b && b.alive && (b.state === "atk" || b.state === "windup");
  });
  if (group.activeAttackers.length < MAX_ATTACKERS) {
    if (!group.activeAttackers.includes(enemyId)) group.activeAttackers.push(enemyId);
    return true;
  }
  return false;
}

/** Enemy leaves attack state — frees a slot. */
export function releaseAttack(group: GroupAIState, enemyId: number): void {
  group.activeAttackers = group.activeAttackers.filter((id) => id !== enemyId);
}

/**
 * For enemies denied attack permission: pick a circling position.
 * Returns a yaw offset so they spread around the player instead of stacking.
 */
export function circleSlot(enemyId: number, player: Body, bodies: Body[]): { x: number; z: number } {
  const enemies = bodies.filter((b) => b.alive && b.kind !== "player" && b.kind !== "ally");
  const idx = enemies.findIndex((b) => b.id === enemyId);
  const n = Math.max(1, enemies.length);
  const angle = (idx / n) * Math.PI * 2;
  const radius = 3.5;
  return {
    x: player.x + Math.cos(angle) * radius,
    z: player.z + Math.sin(angle) * radius,
  };
}
