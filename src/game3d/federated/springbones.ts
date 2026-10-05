/**
 * Federated spring bones — secondary motion for hair, clothes, accessories.
 *
 * Inspiration: pixiv/three-vrm (MIT) — VRM spring bones: verlet-integrated
 * bone chains with stiffness, gravity, and drag. This is an original
 * TypeScript implementation of that pattern, decoupled from three.js so the
 * sim can step it and the renderer applies the rotations.
 *
 * Use: ponytails, dreads, jacket hems, chains, capes on AshLane characters.
 */

export interface SpringBone {
  /** joint index in the character skeleton */
  joint: number;
  /** rest direction (unit vector, local space) */
  restDir: [number, number, number];
  /** current tip offset from rest */
  offset: [number, number, number];
  /** previous tip offset (verlet) */
  prev: [number, number, number];
  stiffness: number;  // 0..1, higher = snappier
  gravity: number;    // downward pull
  drag: number;       // 0..1 damping
  radius: number;     // collision sphere (head/body approx)
}

export interface SpringChain {
  bones: SpringBone[];
  /** world-space anchor the chain hangs from (updated per frame) */
  anchorX: number; anchorY: number; anchorZ: number;
}

export function createSpringBone(
  joint: number,
  restDir: [number, number, number],
  opts: { stiffness?: number; gravity?: number; drag?: number; radius?: number } = {},
): SpringBone {
  return {
    joint,
    restDir,
    offset: [0, 0, 0],
    prev: [0, 0, 0],
    stiffness: opts.stiffness ?? 0.35,
    gravity: opts.gravity ?? 0.6,
    drag: opts.drag ?? 0.15,
    radius: opts.radius ?? 0.12,
  };
}

/**
 * Step one spring bone. Call per chain from root to tip.
 * parentMove = how far the parent joint moved this frame (world units).
 */
export function stepSpringBone(
  b: SpringBone,
  dt: number,
  parentMoveX: number, parentMoveY: number, parentMoveZ: number,
): void {
  const sub = Math.min(dt * 60, 2); // substeps for stability
  for (let s = 0; s < sub; s++) {
    const h = dt / sub;
    // Verlet: new = current + (current - prev) * (1 - drag) + forces
    const px = b.prev[0], py = b.prev[1], pz = b.prev[2];
    b.prev[0] = b.offset[0]; b.prev[1] = b.offset[1]; b.prev[2] = b.offset[2];

    const damp = 1 - b.drag;
    let nx = b.offset[0] + (b.offset[0] - px) * damp;
    let ny = b.offset[1] + (b.offset[1] - py) * damp;
    let nz = b.offset[2] + (b.offset[2] - pz) * damp;

    // Spring toward rest + gravity - parent inertia
    nx += (-b.offset[0] * b.stiffness - parentMoveX * 2.2) * h * 60 * 0.016;
    ny += ((-b.offset[1] * b.stiffness - b.gravity * 0.12) - parentMoveY * 2.2) * h * 60 * 0.016;
    nz += (-b.offset[2] * b.stiffness - parentMoveZ * 2.2) * h * 60 * 0.016;

    // Clamp to max deflection sphere
    const maxDef = 0.45;
    const d = Math.hypot(nx, ny, nz);
    if (d > maxDef) {
      nx = nx / d * maxDef; ny = ny / d * maxDef; nz = nz / d * maxDef;
    }
    b.offset[0] = nx; b.offset[1] = ny; b.offset[2] = nz;
  }
}

/** Presets for common AshLane attachments */
export const SPRING_PRESETS = {
  /** long hair / dreads: loose, heavy */
  dreads: { stiffness: 0.22, gravity: 0.9, drag: 0.22, radius: 0.14 },
  /** ponytail: medium */
  ponytail: { stiffness: 0.35, gravity: 0.7, drag: 0.18, radius: 0.1 },
  /** jacket hem / cape: stiff, light */
  cloth: { stiffness: 0.5, gravity: 0.4, drag: 0.12, radius: 0.16 },
  /** chain/necklace: very loose */
  chain: { stiffness: 0.12, gravity: 1.0, drag: 0.25, radius: 0.05 },
} as const;
