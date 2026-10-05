/**
 * Street layouts, prop scattering, and environmental storytelling.
 */
import * as THREE from "three";
import type { DistrictDef, DistrictId, FactionId, Rng } from "./worldgen";
import { asphaltTexture, graffitiTexture, plateSignTexture } from "./worldgen-textures";

function lam(color: number, map?: THREE.Texture): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color, map: map ?? null });
}

// ---------------------------------------------------------------------------
// Street blocks — road + sidewalks + curbs, per district character
// ---------------------------------------------------------------------------

export interface StreetBlockOpts {
  district: DistrictDef;
  rng: Rng;
  /** block footprint */
  w: number;
  d: number;
}

/** One city block: road cross + sidewalks + corner details. Caller tiles these. */
export function generateStreetBlock(o: StreetBlockOpts): THREE.Group {
  const { district, rng, w, d } = o;
  const g = new THREE.Group();
  const sw = district.streetWidth;

  // Base ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    lam(district.ground, asphaltTexture(rng, "#26262a"))
  );
  ground.rotation.x = -Math.PI / 2;
  g.add(ground);

  // Roads: cross pattern (one N-S, one E-W)
  const roadMat = lam(district.road, asphaltTexture(rng));
  const roadNS = new THREE.Mesh(new THREE.PlaneGeometry(sw, d), roadMat);
  roadNS.rotation.x = -Math.PI / 2;
  roadNS.position.y = 0.01;
  const roadEW = new THREE.Mesh(new THREE.PlaneGeometry(w, sw), roadMat);
  roadEW.rotation.x = -Math.PI / 2;
  roadEW.position.y = 0.011;
  g.add(roadNS, roadEW);

  // Lane markings (worn)
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xb8a83a, transparent: true, opacity: 0.55 });
  if (sw >= 8) {
    for (let z = -d / 2 + 4; z < d / 2 - 2; z += 4) {
      // skip intersection
      if (Math.abs(z) < sw / 2 + 1) continue;
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 1.6), lineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, z);
      g.add(dash);
    }
  }

  // Sidewalks: raised slabs along road edges
  const walkMat = lam(0x4a4a4e, asphaltTexture(rng, "#3a3a3e"));
  const walkW = 2.2;
  for (const sx of [-1, 1]) {
    const walk = new THREE.Mesh(new THREE.BoxGeometry(walkW, 0.14, d), walkMat);
    walk.position.set(sx * (sw / 2 + walkW / 2), 0.07, 0);
    g.add(walk);
  }
  for (const sz of [-1, 1]) {
    const walk = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, walkW), walkMat);
    walk.position.set(0, 0.07, sz * (sw / 2 + walkW / 2));
    g.add(walk);
  }

  // Crosswalk stripes at intersection
  if (district.id === "strip" || district.id === "warehouses") {
    const cw = new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.5 });
    for (let i = -3; i <= 3; i++) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.4), cw);
      s.rotation.x = -Math.PI / 2;
      s.position.set(i * 0.9, 0.02, sw / 2 + 1.6);
      g.add(s);
    }
  }

  // Manhole covers
  const mh = new THREE.Mesh(
    new THREE.CircleGeometry(0.45, 12),
    lam(0x2e3236)
  );
  mh.rotation.x = -Math.PI / 2;
  mh.position.set(rng.range(-sw / 4, sw / 4), 0.02, rng.range(-d / 4, d / 4));
  g.add(mh);

  return g;
}

// ---------------------------------------------------------------------------
// Props — procedural street furniture, scattered with intent
// ---------------------------------------------------------------------------

export type PropKind =
  | "lamp" | "hydrant" | "dumpster" | "crate" | "bench" | "bollard"
  | "trashcan" | "barrier" | "pallet" | "fence" | "tree" | "planter"
  | "newspaper" | "phonebooth" | "ac_unit" | "camera";

function makeLamp(rng: Rng, color: number): THREE.Group {
  const g = new THREE.Group();
  const metal = lam(0x2a3038);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 4.6, 8), metal);
  pole.position.y = 2.3;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 0.08), metal);
  arm.position.set(0.45, 4.55, 0);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.3),
    new THREE.MeshBasicMaterial({ color }));
  head.position.set(0.9, 4.42, 0);
  const light = new THREE.PointLight(color, 14, 16, 1.6);
  light.position.set(0.9, 4.2, 0);
  g.add(pole, arm, head, light);
  return g;
}

function makeHydrant(): THREE.Group {
  const g = new THREE.Group();
  const red = lam(0xc23b2e);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.6, 10), red);
  body.position.y = 0.38;
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), red);
  top.position.y = 0.72;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), lam(0xd8d0c4));
  cap.rotation.z = Math.PI / 2;
  cap.position.y = 0.45;
  g.add(body, top, cap);
  return g;
}

function makeDumpster(rng: Rng): THREE.Group {
  const g = new THREE.Group();
  const green = lam(rng.pick([0x3d6b45, 0x4a5a6b, 0x6b4a3a]));
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1), green);
  body.position.y = 0.65;
  // tilt the lid open a crack
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.08, 1.02), lam(0x2c2c30));
  lid.position.set(0, 1.28, -0.1);
  lid.rotation.x = -0.35;
  g.add(body, lid);
  // trash bags spilling
  for (let i = 0; i < rng.int(1, 3); i++) {
    const bag = new THREE.Mesh(
      new THREE.SphereGeometry(rng.range(0.2, 0.32), 8, 6),
      lam(0x1c1c20)
    );
    bag.scale.y = 0.8;
    bag.position.set(rng.range(-1.4, 1.4), 0.2, rng.range(0.8, 1.4));
    g.add(bag);
  }
  return g;
}

function makeCrate(rng: Rng): THREE.Group {
  const g = new THREE.Group();
  const s = rng.range(0.5, 0.9);
  const box = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), lam(0x9a7448));
  box.position.y = s / 2;
  box.rotation.y = rng.range(0, Math.PI);
  // edge slats
  const edge = new THREE.Mesh(new THREE.BoxGeometry(s * 1.02, s * 0.12, s * 1.02), lam(0x6e5233));
  edge.position.y = s * 0.85;
  edge.rotation.y = box.rotation.y;
  g.add(box, edge);
  return g;
}

function makeBench(): THREE.Group {
  const g = new THREE.Group();
  const wood = lam(0x7a5c40);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.5), wood);
  seat.position.y = 0.45;
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.07), wood);
  back.position.set(0, 0.75, -0.24);
  back.rotation.x = -0.12;
  for (const x of [-0.75, 0.75]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.45), lam(0x2c3036));
    leg.position.set(x, 0.22, 0);
    g.add(leg);
  }
  g.add(seat, back);
  return g;
}

function makeBollard(): THREE.Group {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.85, 10), lam(0xb8a020));
  post.position.y = 0.42;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.12, 10),
    new THREE.MeshBasicMaterial({ color: 0xdddddd }));
  band.position.y = 0.62;
  g.add(post, band);
  return g;
}

function makeTrashcan(rng: Rng): THREE.Group {
  const g = new THREE.Group();
  const can = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.26, 0.85, 10),
    lam(rng.pick([0x3a5a7a, 0x4a4a4e, 0x5a6b3a]))
  );
  can.position.y = 0.42;
  can.rotation.z = rng.chance(0.15) ? 0.5 : 0; // knocked over sometimes
  if (can.rotation.z !== 0) can.position.y = 0.3;
  g.add(can);
  return g;
}

function makeBarrier(): THREE.Group {
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(2, 0.25, 0.06),
    new THREE.MeshBasicMaterial({ color: 0xe86a20 }));
  board.position.y = 0.85;
  // white stripes
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.26),
      new THREE.MeshBasicMaterial({ color: 0xffffff }));
    s.position.set(-0.75 + i * 0.5, 0.85, 0.035);
    g.add(s);
  }
  for (const x of [-0.85, 0.85]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.4), lam(0x3a3e44));
    leg.position.set(x, 0.42, 0);
    g.add(leg);
  }
  g.add(board);
  return g;
}

function makePallet(rng: Rng): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.14), lam(0x9a7448));
    slat.position.set(0, 0.12, -0.4 + i * 0.2);
    g.add(slat);
  }
  for (const x of [-0.5, 0.5]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1), lam(0x6e5233));
    beam.position.set(x, 0.05, 0);
    g.add(beam);
  }
  g.rotation.y = rng.range(0, Math.PI);
  return g;
}

function makeFence(len: number): THREE.Group {
  const g = new THREE.Group();
  const metal = lam(0x7a828c);
  // chain-link approximated with semi-transparent plane + posts
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(len, 1.8),
    new THREE.MeshLambertMaterial({
      color: 0x8a929c, transparent: true, opacity: 0.35,
      side: THREE.DoubleSide,
    })
  );
  mesh.position.y = 1;
  g.add(mesh);
  // diamond pattern lines
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x6a727c });
  for (let x = -len / 2; x < len / 2; x += 0.5) {
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 2.4), lineMat);
    d.position.set(x, 1, 0.01);
    d.rotation.z = 0.6;
    g.add(d);
  }
  for (let x = -len / 2; x <= len / 2; x += 2) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 6), metal);
    post.position.set(x, 1, 0);
    g.add(post);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, 0.06), metal);
  rail.position.y = 1.95;
  g.add(rail);
  // barbed top
  const barb = new THREE.Mesh(new THREE.BoxGeometry(len, 0.25, 0.04), lam(0x4a4e54));
  barb.position.y = 2.1;
  g.add(barb);
  return g;
}

function makeTree(rng: Rng): THREE.Group {
  const g = new THREE.Group();
  const trunkH = rng.range(2, 3.2);
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.22, trunkH, 8),
    lam(0x4a3a2c)
  );
  trunk.position.y = trunkH / 2;
  g.add(trunk);
  const blobs = rng.int(3, 5);
  for (let i = 0; i < blobs; i++) {
    const r = rng.range(0.8, 1.5);
    const leaf = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r, 1),
      lam(new THREE.Color(0x3a6b2f).offsetHSL(rng.range(-0.03, 0.03), 0, rng.range(-0.06, 0.06)).getHex(),
        undefined)
    );
    // Lambert with flat shading for stylized look
    (leaf.material as THREE.MeshLambertMaterial).flatShading = true;
    leaf.position.set(
      rng.range(-0.8, 0.8),
      trunkH + rng.range(-0.3, 1),
      rng.range(-0.8, 0.8)
    );
    g.add(leaf);
  }
  return g;
}

function makePlanter(rng: Rng): THREE.Group {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), lam(0x5a5a5e));
  box.position.y = 0.3;
  g.add(box);
  for (let i = 0; i < 3; i++) {
    const bush = new THREE.Mesh(
      new THREE.IcosahedronGeometry(rng.range(0.3, 0.5), 1),
      lam(0x3a6b2f)
    );
    (bush.material as THREE.MeshLambertMaterial).flatShading = true;
    bush.position.set(rng.range(-0.4, 0.4), rng.range(0.7, 1), rng.range(-0.4, 0.4));
    g.add(bush);
  }
  return g;
}

function makeACUnit(rng: Rng): THREE.Group {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.7), lam(0x9aa0a8));
  box.position.y = 0.35;
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12), lam(0x4a4e54));
  fan.position.set(0, 0.72, 0);
  // grill lines
  for (let i = 0; i < 4; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.03, 0.02), lam(0x6a7076));
    slat.position.set(0, 0.2 + i * 0.12, 0.36);
    g.add(slat);
  }
  g.add(box, fan);
  g.rotation.y = rng.range(0, Math.PI * 2);
  return g;
}

function makeSecurityCamera(): THREE.Group {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.2, 6), lam(0x3a3e44));
  pole.position.y = 0.6;
  const cam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.16), lam(0x22262c));
  cam.position.set(0.1, 1.25, 0);
  cam.rotation.y = 0.5;
  const eye = new THREE.Mesh(new THREE.CircleGeometry(0.045, 8),
    new THREE.MeshBasicMaterial({ color: 0xff2222 }));
  eye.position.set(0.26, 1.25, 0);
  eye.rotation.y = Math.PI / 2 + 0.5;
  g.add(pole, cam, eye);
  return g;
}

const BUILDERS: Record<PropKind, (rng: Rng, district: DistrictDef) => THREE.Group> = {
  lamp: (rng, d) => makeLamp(rng, d.lampColor),
  hydrant: () => makeHydrant(),
  dumpster: (rng) => makeDumpster(rng),
  crate: (rng) => makeCrate(rng),
  bench: () => makeBench(),
  bollard: () => makeBollard(),
  trashcan: (rng) => makeTrashcan(rng),
  barrier: () => makeBarrier(),
  pallet: (rng) => makePallet(rng),
  fence: () => makeFence(6),
  tree: (rng) => makeTree(rng),
  planter: (rng) => makePlanter(rng),
  newspaper: (rng) => makeTrashcan(rng), // placeholder — box stack
  phonebooth: () => makeBarrier(), // placeholder
  ac_unit: (rng) => makeACUnit(rng),
  camera: () => makeSecurityCamera(),
};

/** Which props belong in each district + weights. */
const DISTRICT_PROPS: Record<DistrictId, [PropKind, number][]> = {
  alleys: [
    ["dumpster", 3], ["trashcan", 3], ["lamp", 2], ["crate", 2],
    ["bollard", 1], ["pallet", 1], ["fireescape" as PropKind, 0], // handled in buildings
  ],
  strip: [
    ["lamp", 3], ["bench", 2], ["planter", 2], ["trashcan", 2],
    ["bollard", 2], ["newspaper", 1],
  ],
  warehouses: [
    ["crate", 4], ["pallet", 4], ["fence", 3], ["barrier", 2],
    ["lamp", 2], ["camera", 2], ["bollard", 1],
  ],
  subway: [
    ["bench", 2], ["trashcan", 3], ["lamp", 2], ["barrier", 1], ["bollard", 1],
  ],
  rooftops: [
    ["ac_unit", 4], ["pallet", 1], ["crate", 1], ["fence", 2], ["lamp", 1],
  ],
  park: [
    ["tree", 5], ["bench", 3], ["lamp", 2], ["trashcan", 2], ["planter", 1],
  ],
};

function pickWeighted(rng: Rng, table: [PropKind, number][]): PropKind {
  const total = table.reduce((s, [, w]) => s + w, 0);
  let r = rng.next() * total;
  for (const [kind, w] of table) {
    r -= w;
    if (r <= 0) return kind;
  }
  return table[0][0];
}

/**
 * Scatter props across a block with organic placement —
 * clustered near walls, never grid-perfect, clear of the road center.
 */
export function scatterProps(
  district: DistrictDef,
  rng: Rng,
  areaW: number,
  areaD: number,
  count: number
): THREE.Group {
  const g = new THREE.Group();
  const table = DISTRICT_PROPS[district.id];
  const sw = district.streetWidth;

  for (let i = 0; i < count; i++) {
    const kind = pickWeighted(rng, table);
    const builder = BUILDERS[kind];
    if (!builder) continue;
    const prop = builder(rng, district);

    // Placement: bias toward edges/walls, keep road center clear
    const side = rng.chance(0.5) ? -1 : 1;
    let x: number, z: number;
    if (rng.chance(0.7)) {
      // along the street edges
      x = side * rng.range(sw / 2 + 0.8, sw / 2 + 3.5);
      z = rng.range(-areaD / 2, areaD / 2);
    } else {
      // scattered in the block interior (lots)
      x = side * rng.range(sw / 2 + 4, areaW / 2 - 1);
      z = rng.range(-areaD / 2 + 2, areaD / 2 - 2);
    }
    prop.position.set(x, 0, z);
    prop.rotation.y = rng.range(0, Math.PI * 2);
    // slight tilt for organic feel (trash, etc.)
    if (rng.chance(0.1)) prop.rotation.z = rng.range(-0.08, 0.08);
    g.add(prop);
  }
  return g;
}

// ---------------------------------------------------------------------------
// World storytelling — faction territory marking
// ---------------------------------------------------------------------------

/** Faction color for tags, lighting accents, UI. */
export const FACTION_COLORS: Record<FactionId, number> = {
  ashes: 0xe4572e,
  combine: 0x2e9bff,
  hollows: 0x9d4edd,
  painted: 0xff2e88,
  unaffiliated: 0x9a9a9a,
  authority: 0x2e6bff,
};

/**
 * Territory markers: faction tags on walls, colored light accents,
 * symbolic props that say "you are in X territory" without a UI label.
 */
export function addTerritoryMarkings(
  group: THREE.Group,
  district: DistrictDef,
  rng: Rng,
  blockW: number,
  blockD: number
): void {
  const faction = district.faction;
  const color = FACTION_COLORS[faction];

  // Wall tags — 2-4 per block
  const tags = 2 + Math.floor(rng.next() * 3 * district.graffiti + 1);
  for (let i = 0; i < tags; i++) {
    const w = rng.range(2, 4.5), h = w * 0.5;
    const tag = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        map: graffitiTexture(rng, faction),
        transparent: true,
        polygonOffset: true, polygonOffsetFactor: -2,
      })
    );
    // place on block perimeter walls (buildings will be behind these)
    const edge = rng.int(0, 3);
    const inset = 0.05;
    if (edge === 0) { tag.position.set(rng.range(-blockW / 2, blockW / 2), rng.range(1.2, 3), -blockD / 2 + inset); }
    else if (edge === 1) { tag.position.set(rng.range(-blockW / 2, blockW / 2), rng.range(1.2, 3), blockD / 2 - inset); tag.rotation.y = Math.PI; }
    else if (edge === 2) { tag.position.set(-blockW / 2 + inset, rng.range(1.2, 3), rng.range(-blockD / 2, blockD / 2)); tag.rotation.y = Math.PI / 2; }
    else { tag.position.set(blockW / 2 - inset, rng.range(1.2, 3), rng.range(-blockD / 2, blockD / 2)); tag.rotation.y = -Math.PI / 2; }
    group.add(tag);
  }

  // Faction accent light — subtle colored wash on one corner
  if (faction !== "unaffiliated") {
    const wash = new THREE.PointLight(color, 5, 14, 1.8);
    wash.position.set(
      rng.range(-blockW / 4, blockW / 4),
      rng.range(2, 4),
      rng.range(-blockD / 4, blockD / 4)
    );
    group.add(wash);
  }

  // District-specific storytelling props
  if (district.id === "warehouses") {
    // Corporate security presence
    for (let i = 0; i < 2; i++) {
      const cam = makeSecurityCamera();
      cam.position.set(rng.range(-blockW / 3, blockW / 3), 3.5, rng.range(-blockD / 3, blockD / 3));
      group.add(cam);
    }
    // Corporate banner
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 1.2),
      new THREE.MeshBasicMaterial({
        map: plateSignTexture("KENNEDY CORP", "BUILDING TOMORROW TODAY", "#16283f", "#cfe0f5"),
      })
    );
    banner.position.set(0, 5, -blockD / 2 + 0.1);
    group.add(banner);
  }

  if (district.id === "subway") {
    // Hollows creepiness — flickering light + strange symbols
    const flicker = new THREE.PointLight(0xb8ff9e, 8, 12, 1.5);
    flicker.position.set(0, 3, 0);
    flicker.userData.flicker = true; // view.ts can animate this
    group.add(flicker);
  }

  if (district.id === "alleys") {
    // Ashes warmth — barrel fire
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.9, 10),
      lam(0x3a3e44)
    );
    barrel.position.set(rng.range(-6, 6), 0.45, rng.range(-6, 6));
    const fire = new THREE.PointLight(0xff7b2e, 12, 10, 1.7);
    fire.position.copy(barrel.position).y += 1;
    fire.userData.flicker = true;
    // flame cone
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.6, 8),
      new THREE.MeshBasicMaterial({ color: 0xff9a3d, transparent: true, opacity: 0.9 })
    );
    flame.position.copy(barrel.position).y += 1.1;
    flame.userData.flame = true;
    group.add(barrel, fire, flame);
  }
}
