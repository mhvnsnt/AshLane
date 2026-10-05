/**
 * Federated pedestrian / crowd AI for AshLane's streets.
 *
 * Inspiration (patterns, original implementation):
 *  - naveenkcg/game (MIT): 40 NPCs with waypoint wandering + flee AI,
 *    distance culling, object pooling.
 *  - ashalluf/rando-game pedestrian panic: alarm() scares everyone in radius,
 *    they run from the threat, nearest few scream (rate-limited per spot).
 *  - rishabhbhartiya/gitcity PedestrianSystem.js: pavement walking, road crossing.
 *  - richardran/grid-city: ambient conversation bubbles, proximity remarks.
 *  - imnathaniel28/67th-godot: crosswalks, flee ignores traffic laws.
 *
 * Pedestrians are cheap: wander waypoints, flee fights, panic-scream,
 * ambient chatter. No per-ped collision — separation steering only.
 */

export type PedState = "wander" | "flee" | "panic" | "cower" | "talk" | "shop";

export interface Ped {
  id: number;
  x: number; z: number;
  vx: number; vz: number;
  speed: number;
  state: PedState;
  /** waypoint target */
  tx: number; tz: number;
  /** panic timer */
  panicT: number;
  /** scream cooldown (rate-limited per spot) */
  screamCd: number;
  /** chatter cooldown */
  chatterCd: number;
  /** seed for appearance variety */
  seed: number;
}

export interface PedSystem {
  peds: Ped[];
  nextId: number;
  /** recent scream positions for rate limiting: key -> time */
  screams: Map<string, number>;
  time: number;
}

export function createPedSystem(): PedSystem {
  return { peds: [], nextId: 1, screams: new Map(), time: 0 };
}

export function spawnPed(s: PedSystem, x: number, z: number, seed: number): Ped {
  const p: Ped = {
    id: s.nextId++, x, z, vx: 0, vz: 0,
    speed: 1.2 + Math.random() * 0.8,
    state: "wander",
    tx: x + (Math.random() - 0.5) * 40,
    tz: z + (Math.random() - 0.5) * 40,
    panicT: 0, screamCd: 0, chatterCd: 5 + Math.random() * 10,
    seed,
  };
  s.peds.push(p);
  return p;
}

/**
 * Alarm: a fight broke out at (x,z). Everyone in radius panics and runs away.
 * Returns ids of peds that screamed (for audio).
 */
export function pedAlarm(s: PedSystem, x: number, z: number, radius: number): number[] {
  const screamers: number[] = [];
  for (const p of s.peds) {
    const dx = p.x - x, dz = p.z - z;
    const d = Math.hypot(dx, dz);
    if (d > radius) continue;
    p.state = "panic";
    p.panicT = 4 + Math.random() * 4;
    // Run away from threat
    const inv = 1 / (d || 1);
    p.tx = p.x + dx * inv * (radius + 20);
    p.tz = p.z + dz * inv * (radius + 20);
    // Nearest few scream — rate-limited per spot (rando-game pattern)
    if (d < radius * 0.4 && p.screamCd <= 0) {
      const key = `${Math.round(x / 10)},${Math.round(z / 10)}`;
      const last = s.screams.get(key) ?? -99;
      if (s.time - last > 1.5) {
        s.screams.set(key, s.time);
        p.screamCd = 6 + Math.random() * 6;
        screamers.push(p.id);
      }
    }
  }
  return screamers;
}

export function updatePeds(
  s: PedSystem, dt: number,
  onChatter?: (pedId: number) => void,
): void {
  s.time += dt;
  for (const p of s.peds) {
    p.screamCd = Math.max(0, p.screamCd - dt);
    p.chatterCd -= dt;

    if (p.state === "panic") {
      p.panicT -= dt;
      if (p.panicT <= 0) { p.state = "wander"; pickWanderTarget(p); }
    } else if (p.state === "flee") {
      if (Math.hypot(p.tx - p.x, p.tz - p.z) < 2) { p.state = "wander"; pickWanderTarget(p); }
    } else if (p.state === "wander") {
      if (Math.hypot(p.tx - p.x, p.tz - p.z) < 1.5) pickWanderTarget(p);
      // Ambient chatter when player is near (grid-city pattern)
      if (p.chatterCd <= 0) {
        p.chatterCd = 20 + Math.random() * 30;
        onChatter?.(p.id);
      }
    }

    const wantSpeed = p.state === "panic" ? p.speed * 3.2
      : p.state === "flee" ? p.speed * 2.2
      : p.state === "cower" ? 0 : p.speed;

    const dx = p.tx - p.x, dz = p.tz - p.z;
    const d = Math.hypot(dx, dz);
    if (d > 0.01 && wantSpeed > 0) {
      const tx = dx / d * wantSpeed, tz = dz / d * wantSpeed;
      p.vx += (tx - p.vx) * Math.min(1, dt * 4);
      p.vz += (tz - p.vz) * Math.min(1, dt * 4);
    } else {
      p.vx *= 1 - Math.min(1, dt * 6);
      p.vz *= 1 - Math.min(1, dt * 6);
    }
    p.x += p.vx * dt;
    p.z += p.vz * dt;
  }

  // Separation steering (cheap O(n^2), fine for <120 peds)
  const ps = s.peds;
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j];
      const dx = a.x - b.x, dz = a.z - b.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < 1 && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const push = (1 - d) * 2 * dt;
        a.x += dx / d * push; a.z += dz / d * push;
        b.x -= dx / d * push; b.z -= dz / d * push;
      }
    }
  }
}

function pickWanderTarget(p: Ped): void {
  p.tx = p.x + (Math.random() - 0.5) * 60;
  p.tz = p.z + (Math.random() - 0.5) * 60;
}

/** Cull peds beyond radius (naveenkcg/game pattern) — returns removed count */
export function cullPeds(s: PedSystem, px: number, pz: number, radius: number): number {
  const before = s.peds.length;
  s.peds = s.peds.filter(p => Math.hypot(p.x - px, p.z - pz) < radius);
  return before - s.peds.length;
}
