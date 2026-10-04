import * as THREE from "three";

export type Skins = { asphalt: THREE.Texture; brick: THREE.Texture; dock: THREE.Texture; pit: THREE.Texture };

function mat(color: number, map: THREE.Texture | null) {
  return new THREE.MeshLambertMaterial({ color, map });
}

function put(g: THREE.Group, x: number, y: number, z: number, yaw = 0) {
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  return g;
}

export function forgeDumpster(rust: THREE.Texture) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.05, 0.9), mat(0x3d6b45, rust));
  body.position.y = 0.62;
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.08, 0.92), mat(0x2c4a32, rust));
  lid.position.y = 1.18;
  lid.rotation.x = -0.4;
  g.add(body, lid);
  return g;
}

export function forgeCrate(wood: THREE.Texture) {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), mat(0xc4a574, wood));
  box.position.y = 0.35;
  const slat = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.06, 0.08), mat(0x8a6844, null));
  slat.position.set(0, 0.55, 0.32);
  g.add(box, slat);
  return g;
}

export function forgeBollard(wood: THREE.Texture) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.9, 8), mat(0x8a7560, wood));
  post.position.y = 0.45;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), mat(0x6e5e4c, null));
  cap.position.y = 0.92;
  g.add(post, cap);
  return g;
}

export function forgeSign(face: THREE.Texture) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.2, 6), mat(0x1c2026, null));
  pole.position.y = 1.1;
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 0.06), mat(0xffffff, face));
  board.position.y = 1.9;
  g.add(pole, board);
  return g;
}

function forgeLamp(metal: THREE.Texture) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 3.2, 6), mat(0x2a3038, metal));
  pole.position.y = 1.6;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.06), mat(0x2a3038, metal));
  arm.position.set(0.3, 3.15, 0);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.28), mat(0xffe2a0, null));
  head.position.set(0.62, 3.02, 0);
  g.add(pole, arm, head);
  return g;
}

function forgeBench(wood: THREE.Texture) {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.42), mat(0xb08968, wood));
  seat.position.y = 0.48;
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.06), mat(0xb08968, wood));
  back.position.set(0, 0.74, -0.18);
  for (const x of [-0.55, 0.55]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.36), mat(0x3a4048, null));
    leg.position.set(x, 0.24, 0);
    g.add(leg);
  }
  g.add(seat, back);
  return g;
}

function forgeHydrant() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.55, 8), mat(0xc23b2e, null));
  body.position.y = 0.36;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 8), mat(0xded6cc, null));
  cap.position.y = 0.7;
  const side = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 6), mat(0x9a3028, null));
  side.rotation.z = Math.PI / 2;
  side.position.set(0.16, 0.4, 0);
  g.add(body, cap, side);
  return g;
}

function forgeFence(metal: THREE.Texture) {
  const g = new THREE.Group();
  const rail = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.06), mat(0x8d97a1, metal));
  rail.position.y = 0.9;
  const rail2 = rail.clone();
  rail2.position.y = 0.45;
  for (let i = 0; i < 5; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.05, 0.04), mat(0x8d97a1, metal));
    bar.position.set(-0.9 + i * 0.45, 0.52, 0);
    g.add(bar);
  }
  g.add(rail, rail2);
  return g;
}

function forgePallet(wood: THREE.Texture) {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.16), mat(0xc4a574, wood));
    board.position.set(0, 0.16, -0.28 + i * 0.18);
    g.add(board);
  }
  for (const x of [-0.4, 0.4]) {
    const skid = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.9), mat(0x8a6844, null));
    skid.position.set(x, 0.06, 0);
    g.add(skid);
  }
  return g;
}

function forgeVent(metal: THREE.Texture) {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.7), mat(0xb7c0c8, metal));
  box.position.y = 0.28;
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 8), mat(0x2a3038, null));
  fan.position.set(0, 0.6, 0);
  g.add(box, fan);
  return g;
}

function forgeLadder(metal: THREE.Texture) {
  const g = new THREE.Group();
  for (const x of [-0.22, 0.22]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.4, 0.05), mat(0x9aa3ad, metal));
    rail.position.set(x, 1.2, 0);
    g.add(rail);
  }
  for (let i = 0; i < 6; i++) {
    const rung = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.04), mat(0x9aa3ad, metal));
    rung.position.set(0, 0.3 + i * 0.36, 0);
    g.add(rung);
  }
  return g;
}

function forgeBin(face: THREE.Texture) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.8, 8), mat(0x2f5f86, face));
  body.position.y = 0.4;
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 8), mat(0x1d3d58, null));
  lid.position.y = 0.84;
  g.add(body, lid);
  return g;
}

function forgeAwning(cloth: THREE.Texture) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 1.1), mat(0x8e2f2f, cloth));
  top.position.set(0, 2.2, 0.4);
  top.rotation.x = 0.25;
  for (const x of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.05), mat(0x2a3038, null));
    arm.position.set(x, 1.95, 0.15);
    g.add(arm);
  }
  g.add(top);
  return g;
}

export function forgeStreet(skins: Skins) {
  return [
    put(forgeDumpster(skins.asphalt), -38, 0, 4),
    put(forgeLamp(skins.asphalt), -40, 0, -6),
    put(forgeBench(skins.dock), -34, 0, 8, 0.4),
    put(forgeFence(skins.asphalt), -42, 0, 10, 1.2),
    put(forgeBollard(skins.dock), 4, 0, 36),
    put(forgeBollard(skins.dock), -4, 0, 36),
    put(forgePallet(skins.dock), 8, 0, 38),
    put(forgeCrate(skins.dock), 8.2, 0.16, 38.1),
    put(forgeSign(skins.brick), -2, 0, -38),
    put(forgeHydrant(), 6, 0, -34),
    put(forgeVent(skins.asphalt), -8, 0, -40),
    put(forgeLadder(skins.asphalt), 10, 0, -36, 0.2),
    put(forgeBin(skins.pit), 34, 0, -18),
    put(forgeAwning(skins.brick), 30, 0, -22, Math.PI),
    put(forgeCrate(skins.dock), 36, 0, -16),
  ];
}

export function forgeCar() {
  const g = new THREE.Group();
  const paint = mat(0x7a2433, null);
  const dark = mat(0x1a1c20, null);
  const glass = mat(0x9fd0e0, null);
  glass.transparent = true;
  glass.opacity = 0.45;
  const chrome = mat(0xc5ccd4, null);
  const shell = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.48, 1.72), paint);
  shell.name = "shell";
  shell.position.y = 0.48;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.62, 1.52), paint);
  cabin.name = "cabin";
  cabin.position.set(-0.15, 0.95, 0);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.1, 1.62), paint);
  hood.name = "hood";
  hood.position.set(1.35, 0.74, 0);
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 1.55), paint);
  trunk.name = "trunk";
  trunk.position.set(-1.55, 0.72, 0);
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 1.38), glass);
  win.name = "glass";
  win.position.set(-0.15, 1.05, 0);
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 1.55), chrome);
  bumper.position.set(2.12, 0.42, 0);
  g.add(shell, cabin, hood, trunk, win, bumper);
  for (const [x, z] of [
    [1.35, 0.78],
    [1.35, -0.78],
    [-1.35, 0.78],
    [-1.35, -0.78],
  ] as const) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 8), dark);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.28, z);
    g.add(wheel);
  }
  return g;
}

export function poseCar(g: THREE.Group, crush: number) {
  const c = Math.min(1, Math.max(0, crush));
  const shell = g.getObjectByName("shell");
  const cabin = g.getObjectByName("cabin");
  const hood = g.getObjectByName("hood");
  const trunk = g.getObjectByName("trunk");
  const win = g.getObjectByName("glass") as THREE.Mesh | undefined;
  if (shell) {
    shell.scale.y = 1 - c * 0.22;
    shell.position.y = 0.48 - c * 0.16;
  }
  if (cabin) {
    cabin.scale.y = Math.max(0.08, 1 - c * 0.9);
    cabin.position.y = 0.95 - c * 0.5;
  }
  if (hood) {
    hood.rotation.z = -c * 0.7;
    hood.position.y = 0.74 - c * 0.28;
  }
  if (trunk) {
    trunk.rotation.z = c * 0.45;
    trunk.position.y = 0.72 - c * 0.22;
  }
  if (win) {
    win.scale.y = Math.max(0.02, 1 - c * 1.4);
    win.position.y = 1.05 - c * 0.55;
    (win.material as THREE.MeshLambertMaterial).opacity = Math.max(0, 0.45 - c);
  }
}
