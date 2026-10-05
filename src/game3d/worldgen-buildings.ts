/**
 * Procedural architecture for AshLane districts — buildings, streets, props.
 * Everything seeded; same seed = same block, every load.
 */
import * as THREE from "three";
import type { DistrictDef, DistrictId, FactionId, Rng } from "./worldgen";
import {
  asphaltTexture, brickTexture, facadeTexture, concreteTexture,
  graffitiTexture, neonSignTexture, plateSignTexture,
} from "./worldgen-textures";

// ---------------------------------------------------------------------------
// Shared materials cache (per district, per seed)
// ---------------------------------------------------------------------------

interface MatCache {
  ground: THREE.MeshLambertMaterial;
  road: THREE.MeshLambertMaterial;
  trims: THREE.MeshLambertMaterial[];
}

function lam(color: number, map?: THREE.Texture): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color, map: map ?? null });
}

// ---------------------------------------------------------------------------
// Buildings — procedural facades with identity
// ---------------------------------------------------------------------------

export interface BuildingOpts {
  w: number;       // width (x)
  d: number;       // depth (z)
  h: number;       // height (y)
  tone: number;    // base color
  district: DistrictDef;
  rng: Rng;
  /** force a storefront at ground level (strip) */
  storefront?: boolean;
  /** force industrial (warehouses) */
  industrial?: boolean;
}

function hex(n: number): string {
  return "#" + n.toString(16).padStart(6, "0");
}

/**
 * A building: box mass + canvas facade texture + parapet + details.
 * Returns a Group positioned at origin (base at y=0), caller places it.
 */
export function generateBuilding(o: BuildingOpts): THREE.Group {
  const { rng, district } = o;
  const g = new THREE.Group();
  const floors = Math.max(1, Math.round(o.h / 3.2));
  const cols = Math.max(2, Math.round(o.w / 3));

  // Facade texture per face character
  const warm = district.id === "alleys" || district.id === "rooftops";
  const litRatio = district.id === "subway" ? 0.08 : district.id === "warehouses" ? 0.25 : 0.45;
  const facade = facadeTexture(rng, {
    floors, cols,
    base: hex(o.tone),
    litRatio, warm,
  });

  const wallMat = lam(0xffffff, facade);
  const sideMat = lam(new THREE.Color(o.tone).multiplyScalar(0.82).getHex(),
    district.id === "alleys" ? brickTexture(rng, hex(o.tone)) : undefined);

  const mass = new THREE.Mesh(new THREE.BoxGeometry(o.w, o.h, o.d), [sideMat, sideMat, wallMat, wallMat, sideMat, sideMat]);
  mass.position.y = o.h / 2;
  g.add(mass);

  // Parapet cap
  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(o.w + 0.3, 0.35, o.d + 0.3),
    lam(new THREE.Color(o.tone).multiplyScalar(0.6).getHex())
  );
  cap.position.y = o.h + 0.17;
  g.add(cap);

  // Ground-floor treatment
  if (o.storefront || (district.id === "strip" && rng.chance(0.7))) {
    addStorefront(g, o, rng);
  } else if (o.industrial || district.id === "warehouses") {
    addIndustrialDoor(g, o, rng);
  } else {
    addEntryDoor(g, o, rng);
  }

  // Fire escape (alleys signature)
  if (district.id === "alleys" && o.h > 8 && rng.chance(0.65)) {
    g.add(makeFireEscape(rng, o.w * 0.5, Math.min(o.h - 3, 12)));
  }

  // Rooftop clutter
  if (rng.chance(0.7)) {
    const n = rng.int(1, 3);
    for (let i = 0; i < n; i++) {
      const vent = new THREE.Mesh(
        new THREE.BoxGeometry(rng.range(0.6, 1.2), rng.range(0.5, 1), rng.range(0.6, 1.2)),
        lam(0x8a929a)
      );
      vent.position.set(rng.range(-o.w / 3, o.w / 3), o.h + 0.5, rng.range(-o.d / 3, o.d / 3));
      g.add(vent);
    }
  }
  // Water tower (rooftops / alleys flavor)
  if ((district.id === "rooftops" || district.id === "alleys") && rng.chance(0.3)) {
    g.add(makeWaterTower(rng));
  }

  // Faction graffiti on the wall facing the street (+z face)
  if (rng.next() < district.graffiti) {
    const tag = new THREE.Mesh(
      new THREE.PlaneGeometry(rng.range(2.5, 5), rng.range(1.2, 2.5)),
      new THREE.MeshBasicMaterial({
        map: graffitiTexture(rng, district.faction),
        transparent: true,
        polygonOffset: true, polygonOffsetFactor: -1,
      })
    );
    tag.position.set(rng.range(-o.w / 3, o.w / 3), rng.range(1.5, 3.5), o.d / 2 + 0.02);
    g.add(tag);
  }

  // Neon sign (strip signature)
  if (rng.next() < district.neon) {
    g.add(makeNeonSign(rng, o));
  }

  // Corporate plate (warehouses signature)
  if (district.id === "warehouses" && rng.chance(0.6)) {
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 1.5),
      new THREE.MeshBasicMaterial({
        map: plateSignTexture(
          rng.pick(["KENNEDY CORP", "MERIDIAN", "KCS LOGISTICS", "AWE HOLDINGS", "SECURED"]),
          rng.pick(["AUTHORIZED ONLY", "PRIVATE PROPERTY", "SECTOR 7", "NO TRESPASS"])
        ),
      })
    );
    plate.position.set(0, rng.range(2.5, 4), o.d / 2 + 0.02);
    g.add(plate);
  }

  return g;
}

function addStorefront(g: THREE.Group, o: BuildingOpts, rng: Rng) {
  const { w } = o;
  // Recessed glass front
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.8, 2.6),
    new THREE.MeshLambertMaterial({
      color: 0x9fc4d8, transparent: true, opacity: 0.45,
      emissive: 0x2a3a4a, emissiveIntensity: 0.7,
    })
  );
  glass.position.set(0, 1.5, o.d / 2 + 0.01);
  g.add(glass);
  // Awning
  const awnColors = [0x8e2f2f, 0x2f5a8e, 0x2e7a4a, 0xb8892e];
  const awn = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.85, 0.08, 1.2),
    lam(rng.pick(awnColors))
  );
  awn.position.set(0, 3.1, o.d / 2 + 0.6);
  awn.rotation.x = 0.18;
  g.add(awn);
  // Shop sign band
  const names = ["NOODLE", "CUTS", "PAWN", "LIQUOR", "TACOS", "CASH", "BAR", "DELI", "INK", "GYM"];
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.7, 0.9),
    new THREE.MeshBasicMaterial({
      map: neonSignTexture(rng, rng.pick(names), rng.pick(["#00e5ff", "#ff2e88", "#f0b429", "#7bc96f"])),
    })
  );
  sign.position.set(0, 3.9, o.d / 2 + 0.03);
  g.add(sign);
}

function addIndustrialDoor(g: THREE.Group, o: BuildingOpts, rng: Rng) {
  // Roller door
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 3),
    lam(0x6a7076)
  );
  // corrugation lines via thin boxes
  door.position.set(rng.range(-o.w / 4, o.w / 4), 1.5, o.d / 2 + 0.01);
  g.add(door);
  for (let i = 0; i < 6; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 0.02), lam(0x54585e));
    slat.position.set(door.position.x, 0.4 + i * 0.45, o.d / 2 + 0.02);
    g.add(slat);
  }
  // hazard stripes
  const stripe = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 0.3),
    new THREE.MeshBasicMaterial({ color: 0xd8a020 })
  );
  stripe.position.set(door.position.x, 0.25, o.d / 2 + 0.02);
  g.add(stripe);
}

function addEntryDoor(g: THREE.Group, o: BuildingOpts, rng: Rng) {
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 2.3, 0.1),
    lam(rng.pick([0x5a3a28, 0x2a4a5a, 0x3a3a3a, 0x6b2a2a]))
  );
  door.position.set(rng.range(-o.w / 4, o.w / 4), 1.15, o.d / 2 + 0.02);
  g.add(door);
  // stoop
  const stoop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.8), lam(0x4a4a4e));
  stoop.position.set(door.position.x, 0.09, o.d / 2 + 0.4);
  g.add(stoop);
}

function makeFireEscape(rng: Rng, width: number, height: number): THREE.Group {
  const g = new THREE.Group();
  const metal = lam(0x2e3236);
  const levels = Math.floor(height / 3);
  for (let l = 0; l < levels; l++) {
    const y = 2.5 + l * 3;
    const plat = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, 1), metal);
    plat.position.set(0, y, 0.55);
    g.add(plat);
    // railing
    const rail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.7, 0.05), metal);
    rail.position.set(0, y + 0.4, 1.02);
    g.add(rail);
    // ladder to next
    if (l < levels - 1) {
      const lad = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3, 0.05), metal);
      lad.position.set(width / 2 - 0.3, y + 1.5, 0.9);
      g.add(lad);
    }
  }
  // mount slightly off the wall — caller positions at facade
  g.position.z = 0.1;
  return g;
}

function makeWaterTower(rng: Rng): THREE.Group {
  const g = new THREE.Group();
  const wood = lam(0x6b4a34);
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 2, 10), wood);
  tank.position.y = 3.4;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.9, 10), lam(0x4a3428));
  cone.position.y = 4.85;
  g.add(tank, cone);
  for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.6, 0.14), lam(0x3a2c22));
    leg.position.set(x, 1.3, z);
    g.add(leg);
  }
  g.position.set(rng.range(-2, 2), 0, rng.range(-2, 2));
  return g;
}

function makeNeonSign(rng: Rng, o: BuildingOpts): THREE.Group {
  const g = new THREE.Group();
  const words = o.district.id === "strip"
    ? ["BAR", "EAT", "INK", "CASH", "CLUB", "PAWN", "24H"]
    : ["ASHES", "WARD", "OPEN", "BEER"];
  const color = rng.pick(["#ff2e88", "#00e5ff", "#f0b429", "#9d4edd"]);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.7),
    new THREE.MeshBasicMaterial({ map: neonSignTexture(rng, rng.pick(words), color) })
  );
  // Blade sign jutting perpendicular from wall
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1), lam(0x222226));
  arm.position.set(0, 0, -0.5);
  sign.rotation.y = Math.PI / 2;
  sign.position.set(0, 0, -1);
  // backing glow plane
  const glow = new THREE.PointLight(new THREE.Color(color), 6, 9);
  glow.position.set(0, 0, -1);
  g.add(arm, sign, glow);
  g.position.set(rng.range(-o.w / 3, o.w / 3), rng.range(3.5, 6), o.d / 2 + 0.05);
  return g;
}
