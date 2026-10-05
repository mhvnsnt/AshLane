/**
 * AshLane procedural world generator — "Concrete Jungle" districts.
 *
 * Generates full playable districts at load from a seed: street layouts,
 * procedural building facades, scattered props, faction storytelling.
 * Same seed = same district, every time. No hand-placed levels.
 *
 * Design philosophy: each district has a VISUAL IDENTITY, not just
 * rearranged assets. The environment tells you whose turf you're on
 * before you see a single fighter.
 *
 * Pure three.js procedural + canvas textures. No external asset
 * dependencies for the core — CC0 GLB props hook in via `loadPropGLB()`
 * where available, with procedural fallbacks.
 */

// ---------------------------------------------------------------------------
// 1. Seeded RNG — deterministic generation
// ---------------------------------------------------------------------------

/** Mulberry32 — small, fast, deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Rng {
  /** 0..1 */
  next: () => number;
  /** integer in [min, max] */
  int: (min: number, max: number) => number;
  /** float in [min, max) */
  range: (min: number, max: number) => number;
  /** pick one */
  pick: <T>(arr: T[]) => T;
  /** true with probability p */
  chance: (p: number) => boolean;
}

export function createRng(seed: number): Rng {
  const next = mulberry32(seed);
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    range: (min, max) => min + next() * (max - min),
    pick: <T>(arr: T[]): T => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
  };
}

// ---------------------------------------------------------------------------
// 2. District definitions — visual identity per zone
// ---------------------------------------------------------------------------

export type DistrictId =
  | "alleys"      // Ashes turf — narrow, brick, graffiti
  | "strip"       // Commercial — wide, neon, storefronts
  | "warehouses"  // Combine — industrial, corporate, cold
  | "subway"      // Hollows — underground, dark, tiled
  | "rooftops"    // Elevated — vents, skyline, open
  | "park";       // Green — trees, benches, paths

export type FactionId = "ashes" | "combine" | "hollows" | "unaffiliated" | "painted" | "authority";

export interface DistrictDef {
  id: DistrictId;
  name: string;
  faction: FactionId;
  tagline: string;
  /** street width in meters */
  streetWidth: number;
  /** block size in meters */
  blockSize: number;
  /** building height range [min, max] in meters */
  buildingHeight: [number, number];
  /** ground palette */
  ground: number;
  road: number;
  /** building palette */
  buildingTones: number[];
  /** accent / lighting */
  accent: number;
  lampColor: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  /** ambient light tint */
  ambient: number;
  /** graffiti density 0..1 */
  graffiti: number;
  /** neon sign density 0..1 */
  neon: number;
  /** prop density 0..1 */
  propDensity: number;
}

export const DISTRICTS: Record<DistrictId, DistrictDef> = {
  alleys: {
    id: "alleys", name: "The Alleys", faction: "ashes",
    tagline: "Ashes turf. Narrow brick canyons, fire escapes, tags on every wall.",
    streetWidth: 6, blockSize: 28, buildingHeight: [9, 22],
    ground: 0x2a2a2e, road: 0x1e1e22,
    buildingTones: [0x6b4a3a, 0x5a3f34, 0x74584a, 0x4f3a30, 0x63514a],
    accent: 0xe4572e, lampColor: 0xffb347, fogColor: 0x1a1418, fogNear: 14, fogFar: 65,
    ambient: 0x8a6a5a, graffiti: 0.9, neon: 0.15, propDensity: 0.8,
  },
  strip: {
    id: "strip", name: "The Strip", faction: "unaffiliated",
    tagline: "Commercial heart. Wide boulevards, neon, storefronts fighting for your eye.",
    streetWidth: 14, blockSize: 40, buildingHeight: [8, 30],
    ground: 0x333338, road: 0x222226,
    buildingTones: [0x4a4a52, 0x3d3d44, 0x55555e, 0x42424a, 0x5e5e66],
    accent: 0x00e5ff, lampColor: 0xffffff, fogColor: 0x14141c, fogNear: 20, fogFar: 90,
    ambient: 0x7a7a9a, graffiti: 0.3, neon: 0.95, propDensity: 0.6,
  },
  warehouses: {
    id: "warehouses", name: "The Yards", faction: "combine",
    tagline: "Combine territory. Industrial sprawl, corporate signage, cameras everywhere.",
    streetWidth: 12, blockSize: 50, buildingHeight: [6, 14],
    ground: 0x2e3236, road: 0x26282c,
    buildingTones: [0x5a6068, 0x4c5258, 0x666c74, 0x545a62, 0x606670],
    accent: 0x2e9bff, lampColor: 0xcfe8ff, fogColor: 0x161a20, fogNear: 18, fogFar: 85,
    ambient: 0x6a7a8a, graffiti: 0.1, neon: 0.05, propDensity: 0.9,
  },
  subway: {
    id: "subway", name: "The Tunnels", faction: "hollows",
    tagline: "Hollows domain. Underground platforms, flickering tubes, something wrong.",
    streetWidth: 8, blockSize: 30, buildingHeight: [4, 8],
    ground: 0x1c1c20, road: 0x18181c,
    buildingTones: [0x3a3a3e, 0x323236, 0x404044, 0x36363a],
    accent: 0x9d4edd, lampColor: 0xb8ff9e, fogColor: 0x0c0c12, fogNear: 8, fogFar: 45,
    ambient: 0x4a4a5a, graffiti: 0.7, neon: 0.1, propDensity: 0.5,
  },
  rooftops: {
    id: "rooftops", name: "The High Line", faction: "unaffiliated",
    tagline: "Above it all. Rooftop runs, AC units, water towers, the city below.",
    streetWidth: 10, blockSize: 24, buildingHeight: [12, 28],
    ground: 0x3a3a3e, road: 0x2e2e32,
    buildingTones: [0x4e4e54, 0x46464c, 0x525258, 0x4a4a50],
    accent: 0xffb347, lampColor: 0xffd9a0, fogColor: 0x1c1a24, fogNear: 25, fogFar: 120,
    ambient: 0x9a8a7a, graffiti: 0.4, neon: 0.3, propDensity: 0.7,
  },
  park: {
    id: "park", name: "Ember Park", faction: "unaffiliated",
    tagline: "The green lung. Trees, paths, benches — and people who don't want to be seen.",
    streetWidth: 8, blockSize: 36, buildingHeight: [6, 16],
    ground: 0x2d3a2a, road: 0x3a3a34,
    buildingTones: [0x5a5148, 0x4e4640, 0x625a50, 0x54504a],
    accent: 0x7bc96f, lampColor: 0xffe8c0, fogColor: 0x141a14, fogNear: 20, fogFar: 80,
    ambient: 0x7a9a6a, graffiti: 0.2, neon: 0.05, propDensity: 0.7,
  },
};

export const DISTRICT_IDS = Object.keys(DISTRICTS) as DistrictId[];

// ---------------------------------------------------------------------------
// 4. Main API — generateDistrict()
// ---------------------------------------------------------------------------

import * as THREE from "three";
import { generateBuilding } from "./worldgen-buildings";
import { generateStreetBlock, scatterProps, addTerritoryMarkings } from "./worldgen-streets";

export interface DistrictBounds {
  minX: number; maxX: number;
  minZ: number; maxZ: number;
}

export interface SpawnPoint {
  x: number; z: number; yaw: number;
  kind: "player" | "enemy" | "npc" | "prop";
}

export interface Collider {
  x: number; z: number;
  hw: number; hd: number; // half-width, half-depth (AABB)
}

export interface GeneratedDistrict {
  id: DistrictId;
  seed: number;
  group: THREE.Group;
  bounds: DistrictBounds;
  spawnPoints: SpawnPoint[];
  colliders: Collider[];
  /** per-frame updatables (flicker lights, flames) */
  tick: (t: number, dt: number) => void;
  dispose: () => void;
}

export interface GenerateOpts {
  /** district size in blocks (default 2 = 2x2 blocks) */
  blocks?: number;
  /** include territory storytelling (default true) */
  storytelling?: boolean;
}

const DEFAULT_SEEDS: Record<DistrictId, number> = {
  alleys: 1101, strip: 2202, warehouses: 3303,
  subway: 4404, rooftops: 5505, park: 6606,
};

/**
 * Generate a full playable district. Deterministic — same id + seed
 * always produces the same layout.
 */
export function generateDistrict(
  id: DistrictId,
  seed: number = DEFAULT_SEEDS[id],
  opts: GenerateOpts = {}
): GeneratedDistrict {
  const def = DISTRICTS[id];
  const rng = createRng(seed);
  const blocks = opts.blocks ?? 2;
  const storytelling = opts.storytelling ?? true;

  const group = new THREE.Group();
  group.name = `district-${id}`;

  const blockSize = def.blockSize;
  const worldW = blockSize * blocks;
  const worldD = blockSize * blocks;
  const bounds: DistrictBounds = {
    minX: -worldW / 2, maxX: worldW / 2,
    minZ: -worldD / 2, maxZ: worldD / 2,
  };

  const colliders: Collider[] = [];
  const spawnPoints: SpawnPoint[] = [];
  const flickers: THREE.PointLight[] = [];
  const flames: THREE.Mesh[] = [];

  // -- District lighting mood --
  const hemi = new THREE.HemisphereLight(def.ambient, 0x1a1a1e, 0.9);
  group.add(hemi);
  const moon = new THREE.DirectionalLight(def.lampColor, 0.55);
  moon.position.set(-20, 30, 12);
  group.add(moon);
  group.userData.fog = { color: def.fogColor, near: def.fogNear, far: def.fogFar };

  // -- Street grid --
  for (let bx = 0; bx < blocks; bx++) {
    for (let bz = 0; bz < blocks; bz++) {
      const cx = -worldW / 2 + blockSize * (bx + 0.5);
      const cz = -worldD / 2 + blockSize * (bz + 0.5);
      const streets = generateStreetBlock({ district: def, rng, w: blockSize, d: blockSize });
      streets.position.set(cx, 0, cz);
      group.add(streets);
    }
  }

  // -- Buildings: ring the street grid, backs to the edge --
  const perSide = Math.max(2, Math.floor(worldW / 18));
  for (let i = 0; i < perSide; i++) {
    for (const side of [0, 1, 2, 3]) {
      const t = (i + 0.5) / perSide; // 0..1 along the side
      const bw = rng.range(10, 18);
      const bd = rng.range(8, 14);
      const bh = rng.range(def.buildingHeight[0], def.buildingHeight[1]);
      const b = generateBuilding({
        w: bw, d: bd, h: bh,
        tone: rng.pick(def.buildingTones),
        district: def, rng,
      });
      const m = worldW / 2 + bd / 2 + rng.range(1, 4); // setback
      const along = -worldW / 2 + t * worldW;
      let x = 0, z = 0, yaw = 0;
      if (side === 0) { x = along; z = -m; yaw = 0; }
      else if (side === 1) { x = along; z = m; yaw = Math.PI; }
      else if (side === 2) { x = -m; z = along; yaw = Math.PI / 2; }
      else { x = m; z = along; yaw = -Math.PI / 2; }
      b.position.set(x, 0, z);
      b.rotation.y = yaw;
      group.add(b);
      colliders.push({ x, z, hw: bw / 2, hd: bd / 2 });
    }
  }

  // -- Interior lot buildings (warehouses / park need interior mass) --
  if (id === "warehouses" || id === "park") {
    const lots = id === "warehouses" ? 4 : 2;
    for (let i = 0; i < lots; i++) {
      const bw = rng.range(12, 20), bd = rng.range(10, 16);
      const bh = rng.range(def.buildingHeight[0], def.buildingHeight[1]);
      const b = generateBuilding({
        w: bw, d: bd, h: bh,
        tone: rng.pick(def.buildingTones),
        district: def, rng,
        industrial: id === "warehouses",
      });
      // place in block quadrants, clear of road center
      const qx = (i % 2 === 0 ? -1 : 1) * worldW / 4;
      const qz = (i < 2 ? -1 : 1) * worldD / 4;
      const bx = qx + rng.range(-4, 4), bz = qz + rng.range(-4, 4);
      b.position.set(bx, 0, bz);
      b.rotation.y = rng.pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]);
      group.add(b);
      colliders.push({ x: bx, z: bz, hw: Math.max(bw, bd) / 2, hd: Math.max(bw, bd) / 2 });
    }
  }

  // -- Props --
  const propCount = Math.floor(28 * def.propDensity * blocks);
  const props = scatterProps(def, rng, worldW, worldD, propCount);
  group.add(props);
  // prop colliders (approximate — lamps, dumpsters, crates block movement)
  props.traverse((o) => {
    if (o.userData.solid) colliders.push({ x: o.position.x, z: o.position.z, hw: 0.4, hd: 0.4 });
  });

  // -- World storytelling --
  if (storytelling) {
    addTerritoryMarkings(group, def, rng, worldW, worldD);
  }

  // -- Collect animated elements --
  group.traverse((o) => {
    if ((o as THREE.PointLight).isPointLight && o.userData.flicker) {
      flickers.push(o as THREE.PointLight);
    }
    if (o.userData.flame) flames.push(o as THREE.Mesh);
  });

  // -- Spawn points --
  // Player spawns at south entrance; enemies at north + sides
  spawnPoints.push(
    { x: 0, z: worldD / 2 - 6, yaw: Math.PI, kind: "player" },
    { x: -worldW / 4, z: -worldD / 4, yaw: 0, kind: "enemy" },
    { x: worldW / 4, z: -worldD / 4, yaw: 0, kind: "enemy" },
    { x: 0, z: -worldD / 2 + 8, yaw: 0, kind: "enemy" },
    { x: -worldW / 4, z: worldD / 4, yaw: Math.PI / 2, kind: "npc" },
    { x: worldW / 4, z: worldD / 4, yaw: -Math.PI / 2, kind: "npc" },
  );

  // -- Per-frame tick (flicker, flame dance) --
  const tick = (t: number, _dt: number) => {
    for (const f of flickers) {
      // fluorescent stutter + fire dance
      const base = f.userData.baseIntensity ?? f.intensity;
      if (f.userData.baseIntensity === undefined) f.userData.baseIntensity = f.intensity;
      f.intensity = base * (0.82 + 0.18 * Math.abs(Math.sin(t * 13 + f.position.x)));
    }
    for (const fl of flames) {
      fl.scale.y = 0.85 + 0.3 * Math.abs(Math.sin(t * 11 + fl.position.z));
      fl.scale.x = fl.scale.z = 0.9 + 0.2 * Math.abs(Math.cos(t * 9));
    }
  };

  const dispose = () => {
    group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => disposeMat(m));
        else if (mat) disposeMat(mat);
      }
    });
  };

  return { id, seed, group, bounds, spawnPoints, colliders, tick, dispose };
}

function disposeMat(m: THREE.Material): void {
  const mm = m as THREE.MeshLambertMaterial;
  if (mm.map) mm.map.dispose();
  m.dispose();
}

/**
 * Point-in-collider test for the sim loop.
 * Returns true if (x, z) with radius r intersects any building/prop.
 */
export function hitsCollider(d: GeneratedDistrict, x: number, z: number, r = 0.4): boolean {
  for (const c of d.colliders) {
    if (Math.abs(x - c.x) < c.hw + r && Math.abs(z - c.z) < c.hd + r) return true;
  }
  return false;
}

/** Clamp a position inside district bounds. */
export function clampToDistrict(d: GeneratedDistrict, x: number, z: number, margin = 1): [number, number] {
  return [
    Math.max(d.bounds.minX + margin, Math.min(d.bounds.maxX - margin, x)),
    Math.max(d.bounds.minZ + margin, Math.min(d.bounds.maxZ - margin, z)),
  ];
}
