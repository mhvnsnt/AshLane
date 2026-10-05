/**
 * Federated Lock-On System for AshLane
 * Ported from prashanna135/souls-like-controller (public domain)
 * Original: scripts/player/player_lock_on.gd
 *
 * Picks nearest enemy, cycles on repeat press, tracks target for camera.
 * Adapted from Godot CharacterBody3D to AshLane's Body sim.
 */
import type { Body } from "../sim";

export interface LockOnState {
  targetId: number | null;
  isLocked: boolean;
  candidates: number[];
  index: number;
  maxRange: number;
}

export function createLockOn(maxRange = 15): LockOnState {
  return { targetId: null, isLocked: false, candidates: [], index: -1, maxRange };
}

/** One lock-on press: grab nearest, or cycle/unlock if already locked. */
export function lockOnPress(lock: LockOnState, player: Body, bodies: Body[]): void {
  if (lock.isLocked) {
    cycleOrUnlock(lock, bodies);
  } else {
    tryLockOn(lock, player, bodies);
  }
}

function tryLockOn(lock: LockOnState, player: Body, bodies: Body[]): void {
  const found: { id: number; dist: number }[] = [];
  for (const b of bodies) {
    if (b.kind === "player" || b.kind === "ally" || !b.alive) continue;
    const dx = b.x - player.x, dz = b.z - player.z;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d < lock.maxRange) found.push({ id: b.id, dist: d });
  }
  if (found.length === 0) return;
  found.sort((a, b) => a.dist - b.dist);
  lock.candidates = found.map((f) => f.id);
  lock.index = 0;
  applyTarget(lock, found[0].id, bodies);
}

function cycleOrUnlock(lock: LockOnState, bodies: Body[]): void {
  if (lock.candidates.length === 0) { clearLock(lock); return; }
  lock.index += 1;
  if (lock.index >= lock.candidates.length) {
    clearLock(lock);
  } else {
    applyTarget(lock, lock.candidates[lock.index], bodies);
  }
}

function applyTarget(lock: LockOnState, id: number, bodies: Body[]): void {
  const t = bodies.find((b) => b.id === id);
  if (!t || !t.alive) { clearLock(lock); return; }
  lock.targetId = id;
  lock.isLocked = true;
}

export function clearLock(lock: LockOnState): void {
  lock.targetId = null;
  lock.isLocked = false;
  lock.index = -1;
  lock.candidates = [];
}

/** Per-frame: drop lock if target died. Returns the target Body or null. */
export function lockOnUpdate(lock: LockOnState, bodies: Body[]): Body | null {
  if (!lock.isLocked || lock.targetId === null) return null;
  const t = bodies.find((b) => b.id === lock.targetId);
  if (!t || !t.alive) { clearLock(lock); return null; }
  return t;
}

/** Yaw the player to face the locked target (for camera + attacks). */
export function faceTarget(player: Body, target: Body): void {
  const dx = target.x - player.x, dz = target.z - player.z;
  player.yaw = Math.atan2(dx, dz);
}
