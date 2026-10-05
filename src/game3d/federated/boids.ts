/**
 * Federated boids — bird flocks over AshLane's streets and parks.
 *
 * Inspiration: beneater/boids (MIT) — Craig Reynolds' 3 rules:
 * separation, alignment, cohesion. Original TypeScript implementation,
 * tuned for ambient city birds (not a simulation showcase).
 *
 * Runs in the sim at low tick rate; the renderer instances the birds.
 */

export interface Bird {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
}

export interface Flock {
  birds: Bird[];
  /** center the flock drifts around */
  cx: number; cy: number; cz: number;
  /** wander radius */
  radius: number;
  /** counts down; on 0 the flock scatters (loud noise, fight nearby) */
  scatter: number;
}

const MAX_SPEED = 9;
const MIN_Y = 14;
const MAX_Y = 34;

export function createFlock(n: number, cx: number, cy: number, cz: number, radius: number): Flock {
  const birds: Bird[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;
    birds.push({
      x: cx + Math.cos(a) * r,
      y: cy + (Math.random() - 0.5) * 8,
      z: cz + Math.sin(a) * r,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 2,
      vz: (Math.random() - 0.5) * 6,
    });
  }
  return { birds, cx, cy, cz, radius, scatter: 0 };
}

/** Scatter the flock (called when a fight breaks out nearby) */
export function scatterFlock(f: Flock): void {
  f.scatter = 3 + Math.random() * 2;
}

export function updateFlock(f: Flock, dt: number): void {
  const n = f.birds.length;
  if (n === 0) return;
  if (f.scatter > 0) f.scatter -= dt;

  const sepR = 3, aliR = 10, cohR = 14;
  const sepW = f.scatter > 0 ? 3.2 : 1.6;
  const aliW = 0.9, cohW = 0.55;

  for (let i = 0; i < n; i++) {
    const b = f.birds[i];
    let sx = 0, sy = 0, sz = 0;   // separation
    let ax = 0, ay = 0, az = 0;   // alignment
    let cx = 0, cy = 0, cz = 0;   // cohesion
    let na = 0;

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const o = f.birds[j];
      const dx = b.x - o.x, dy = b.y - o.y, dz = b.z - o.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > cohR * cohR) continue;
      na++;
      ax += o.vx; ay += o.vy; az += o.vz;
      cx += o.x; cy += o.y; cz += o.z;
      if (d2 < sepR * sepR && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        sx += dx / d / d; sy += dy / d / d; sz += dz / d / d;
      }
    }

    let fx = sx * sepW, fy = sy * sepW, fz = sz * sepW;
    if (na > 0) {
      fx += (ax / na - b.vx) * aliW;
      fy += (ay / na - b.vy) * aliW;
      fz += (az / na - b.vz) * aliW;
      fx += (cx / na - b.x) * cohW * 0.1;
      fy += (cy / na - b.y) * cohW * 0.1;
      fz += (cz / na - b.z) * cohW * 0.1;
    }

    // Drift back toward home center
    fx += (f.cx - b.x) * 0.02;
    fz += (f.cz - b.z) * 0.02;
    fy += (f.cy - b.y) * 0.03;

    // Scatter burst
    if (f.scatter > 0) {
      fx += (Math.random() - 0.5) * 30;
      fy += Math.random() * 14;
      fz += (Math.random() - 0.5) * 30;
    }

    b.vx += fx * dt; b.vy += fy * dt; b.vz += fz * dt;

    // Clamp speed
    const sp = Math.hypot(b.vx, b.vy, b.vz) || 1;
    const max = f.scatter > 0 ? MAX_SPEED * 1.8 : MAX_SPEED;
    const cl = Math.min(sp, max) / sp;
    b.vx *= cl; b.vy *= cl; b.vz *= cl;

    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    if (b.y < MIN_Y) { b.y = MIN_Y; b.vy = Math.abs(b.vy); }
    if (b.y > MAX_Y) { b.y = MAX_Y; b.vy = -Math.abs(b.vy); }
  }
}
