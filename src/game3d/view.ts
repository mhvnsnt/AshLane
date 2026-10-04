import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneRig } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Body, Box, Sim } from "./sim";

type Fighter = {
  id: number;
  group: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  bar: THREE.Mesh;
  mats: THREE.Material[];
  mixer: THREE.AnimationMixer | null;
  actions: Record<string, THREE.AnimationAction>;
  clip: string;
};

type RigTemplate = { scene: THREE.Group; animations: THREE.AnimationClip[] };

const PAL = [
  { cloth: 0xe4572e, skin: 0xe6c2a2, visor: 0xf0b429 },
  { cloth: 0x5c6b73, skin: 0xd2b39a, visor: 0x9fd7d0 },
  { cloth: 0x6e4a3a, skin: 0xc4a484, visor: 0xe4572e },
  { cloth: 0x3e5c4a, skin: 0xd7c0a4, visor: 0xf0b429 },
  { cloth: 0x6a3a4a, skin: 0xe0c2a8, visor: 0xf3e6d4 },
  { cloth: 0x3a465c, skin: 0xd8bea6, visor: 0xe4572e },
];

export function createView(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.matchMedia("(pointer: coarse)").matches ? 1.35 : 1.75));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x5c463c);
  scene.fog = new THREE.Fog(0x5c463c, 36, 88);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120);
  camera.position.set(8, 14, 16);
  camera.lookAt(0, 1, 0);

  scene.add(new THREE.HemisphereLight(0xfff6ea, 0x6a4a3a, 1.55));
  const sun = new THREE.DirectionalLight(0xfff2dd, 2.35);
  sun.position.set(14, 22, 10);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xe4572e, 0.35);
  rim.position.set(-10, 8, -6);
  scene.add(rim);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(64, 64),
    new THREE.MeshLambertMaterial({ map: groundTex(), color: 0xffffff }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const lane = new THREE.Mesh(new THREE.PlaneGeometry(46, 8.2), new THREE.MeshLambertMaterial({ color: 0x2c241e }));
  lane.rotation.x = -Math.PI / 2;
  lane.position.set(0, 0.02, -19);
  scene.add(lane);
  const scaffold = new THREE.Mesh(new THREE.PlaneGeometry(46, 5.4), new THREE.MeshLambertMaterial({ color: 0x1c1614 }));
  scaffold.rotation.x = -Math.PI / 2;
  scaffold.position.set(-4, 0.02, 20);
  scene.add(scaffold);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.035, 8, 28),
    new THREE.MeshBasicMaterial({ color: 0xf0b429, transparent: true, opacity: 0.9 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.visible = false;
  scene.add(ring);

  const pit = new THREE.Mesh(
    new THREE.TorusGeometry(3.1, 0.06, 8, 40),
    new THREE.MeshBasicMaterial({ color: 0xf0b429 }),
  );
  pit.rotation.x = Math.PI / 2;
  pit.position.y = 0.04;
  scene.add(pit);

  const shared = {
    leg: new THREE.BoxGeometry(0.22, 0.55, 0.22),
    torso: new THREE.BoxGeometry(0.62, 0.58, 0.32),
    head: new THREE.SphereGeometry(0.26, 14, 10),
    visor: new THREE.BoxGeometry(0.36, 0.11, 0.16),
    arm: new THREE.BoxGeometry(0.16, 0.46, 0.16),
    bar: new THREE.PlaneGeometry(0.72, 0.08),
  };
  const fighters: Fighter[] = [];
  let rigs: RigTemplate[] | null = null;
  let rigsShown = false;
  const loader = new GLTFLoader();
  void Promise.all(
    ["/models/kaykit/Knight.glb", "/models/kaykit/Rogue.glb", "/models/kaykit/Barbarian.glb"].map((url) => loader.loadAsync(url)),
  )
    .then((loaded) => {
      rigs = loaded.map((gltf) => prepRig(gltf.scene, gltf.animations));
    })
    .catch(() => {
      rigs = null;
    });
  const boxMeshes: THREE.Object3D[] = [];
  const pGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
  const pMats = [0xf0b429, 0xe4572e, 0xf3e6d4].map((color) => new THREE.MeshBasicMaterial({ color }));
  const pool = Array.from({ length: 32 }, () => {
    const mesh = new THREE.Mesh(pGeo, pMats[0]);
    mesh.visible = false;
    scene.add(mesh);
    return mesh;
  });

  const _desired = new THREE.Vector3();
  const _target = new THREE.Vector3();
  let idle = 0.4;
  let built = false;

  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  function ensureWorld(sim: Sim) {
    if (built) return;
    built = true;
    for (const box of sim.boxes) boxMeshes.push(buildBox(box));
    addLamps();
    addSign();
  }

  function buildBox(box: Box) {
    const midX = (box.minX + box.maxX) / 2;
    const midZ = (box.minZ + box.maxZ) / 2;
    if (box.kind === "spring") {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.1, 14), new THREE.MeshBasicMaterial({ color: 0xf0b429 }));
      mesh.position.set(midX, 0.07, midZ);
      scene.add(mesh);
      return mesh;
    }
    if (box.kind === "goal") {
      const group = new THREE.Group();
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(box.maxX - box.minX, box.maxY, box.maxZ - box.minZ),
        new THREE.MeshLambertMaterial({ color: 0xc4843a }),
      );
      deck.position.y = box.maxY / 2;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.5, 8), new THREE.MeshBasicMaterial({ color: 0xe4572e }));
      pole.position.y = box.maxY + 0.75;
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), new THREE.MeshBasicMaterial({ color: 0xf0b429 }));
      orb.position.y = box.maxY + 1.65;
      group.add(deck, pole, orb);
      group.position.set(midX, 0, midZ);
      scene.add(group);
      return group;
    }
    const h = box.maxY - box.minY;
    const geo = new THREE.BoxGeometry(box.maxX - box.minX, h, box.maxZ - box.minZ);
    const wide = box.maxX - box.minX > 20 || box.maxZ - box.minZ > 20;
    const color = box.kind === "gate" ? 0xe4572e : box.kind === "plat" ? 0x8d6b45 : wide ? 0x6a5b50 : h < 2 ? 0x8a5a3a : 0x7a6558;
    const mat = new THREE.MeshLambertMaterial({
      color,
      transparent: box.kind === "gate",
      opacity: box.kind === "gate" ? 0.45 : 1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(midX, h / 2, midZ);
    scene.add(mesh);
    return mesh;
  }

  function addLamps() {
    const spots = [
      [-5, -2],
      [6, 3],
      [0, -16],
      [-8, 16],
    ];
    for (const [x, z] of spots) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.2, 6), new THREE.MeshLambertMaterial({ color: 0x1e1914 }));
      post.position.set(x, 1.6, z);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), new THREE.MeshBasicMaterial({ color: 0xf0b429 }));
      bulb.position.set(x, 3.25, z);
      scene.add(post, bulb);
      const light = new THREE.PointLight(0xf0b429, 0.6, 8);
      light.position.set(x, 3.1, z);
      scene.add(light);
    }
  }

  function addSign() {
    const tex = signTex();
    const board = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.5), new THREE.MeshBasicMaterial({ map: tex }));
    board.position.set(-6.92, 3.1, -9);
    board.rotation.y = Math.PI / 2;
    scene.add(board);
  }

  function syncFighters(sim: Sim) {
    const usingRigs = rigs != null;
    const same = fighters.length === sim.bodies.length && fighters.every((f, i) => f.id === sim.bodies[i].id) && rigsShown === usingRigs;
    if (same) return;
    rigsShown = usingRigs;
    for (const f of fighters) {
      scene.remove(f.group);
      scene.remove(f.bar);
      f.mixer?.stopAllAction();
      for (const m of f.mats) m.dispose();
    }
    fighters.length = 0;
    sim.bodies.forEach((b, i) => {
      const made = usingRigs && rigs ? makeRig(shared, rigs[b.kind === "player" ? 0 : (i % 2) + 1], b.kind === "player" ? 0xf0b429 : 0xe4572e) : makeFighter(shared, b.kind === "player" ? PAL[0] : PAL[(i % (PAL.length - 1)) + 1]);
      made.id = b.id;
      scene.add(made.group);
      scene.add(made.bar);
      fighters.push(made);
    });
  }

  function render(sim: Sim, dt: number) {
    ensureWorld(sim);
    syncFighters(sim);
    const p = sim.bodies[0];
    for (let i = 0; i < sim.boxes.length; i++) {
      const box = sim.boxes[i];
      const mesh = boxMeshes[i];
      if (!mesh) continue;
      if (box.kind === "gate") mesh.visible = !sim.streetClear;
    }
    fighters.forEach((f, i) => {
      const b = sim.bodies[i];
      poseFighter(f, b, sim, camera, dt);
    });
    for (let i = 0; i < pool.length; i++) {
      const bit = sim.particles[i];
      const mesh = pool[i];
      if (!bit) {
        mesh.visible = false;
        continue;
      }
      mesh.visible = true;
      mesh.position.set(bit.x, bit.y, bit.z);
      const s = 0.5 + (bit.life / bit.max) * 0.8;
      mesh.scale.setScalar(s);
      mesh.material = pMats[bit.color === 0xe4572e ? 1 : bit.color === 0xf3e6d4 ? 2 : 0];
    }
    if (p) {
      ring.visible = sim.canGrab && sim.running && !sim.paused;
      ring.position.set(p.x, p.y + 0.05, p.z);
      const g = sim.tune.grapple;
      ring.scale.setScalar(g);
    }
    placeCamera(sim, dt, camera, _desired, _target, () => {
      idle += dt;
      return idle;
    });
    renderer.render(scene, camera);
  }

  function dispose() {
    renderer.dispose();
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
  }

  resize();
  return { render, resize, dispose };
}

function placeCamera(
  sim: Sim,
  dt: number,
  camera: THREE.PerspectiveCamera,
  desired: THREE.Vector3,
  target: THREE.Vector3,
  idleOf: () => number,
) {
  const p = sim.bodies[0];
  if (!p || !sim.running) {
    const idle = idleOf();
    desired.set(Math.sin(idle * 0.18) * 16, 14, Math.cos(idle * 0.18) * 16);
    target.set(0, 1.2, 0);
  } else if (sim.mode === "roam") {
    const fx = -Math.sin(sim.camYaw);
    const fz = -Math.cos(sim.camYaw);
    const cx = p.x - fx * 5.6;
    const cy = p.y + 2.45;
    const cz = p.z - fz * 5.6;
    const clipped = clipCam(p.x, p.y + 1.3, p.z, cx, cy, cz, sim.boxes);
    desired.set(clipped.x, clipped.y, clipped.z);
    target.set(p.x + fx * 0.4, p.y + 1.25, p.z + fz * 0.4);
  } else if (sim.mode === "belt") {
    desired.set(p.x, p.y + 13.5, p.z + 12);
    target.set(p.x, p.y + 1, p.z);
  } else {
    desired.set(p.x, p.y + 11, p.z + 9);
    target.set(p.x, p.y + 1.15, p.z);
  }
  const k = 1 - Math.exp(-7 * dt);
  camera.position.lerp(desired, k);
  if (sim.running && !sim.reduced && sim.shake > 0.03) {
    camera.position.x += (Math.random() - 0.5) * sim.shake * 0.4;
    camera.position.y += (Math.random() - 0.5) * sim.shake * 0.22;
  }
  camera.lookAt(target);
}

function clipCam(px: number, py: number, pz: number, cx: number, cy: number, cz: number, boxes: Box[]) {
  const n = 12;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const x = px + (cx - px) * t;
    const y = py + (cy - py) * t;
    const z = pz + (cz - pz) * t;
    for (const b of boxes) {
      if (b.kind !== "wall") continue;
      if (x > b.minX && x < b.maxX && y > b.minY && y < b.maxY && z > b.minZ && z < b.maxZ) {
        const bt = Math.max(0.18, (i - 1) / n);
        return { x: px + (cx - px) * bt, y: Math.max(py, py + (cy - py) * bt), z: pz + (cz - pz) * bt };
      }
    }
  }
  return { x: cx, y: cy, z: cz };
}

function makeFighter(
  shared: { leg: THREE.BoxGeometry; torso: THREE.BoxGeometry; head: THREE.SphereGeometry; visor: THREE.BoxGeometry; arm: THREE.BoxGeometry; bar: THREE.PlaneGeometry },
  pal: { cloth: number; skin: number; visor: number },
) {
  const cloth = new THREE.MeshLambertMaterial({ color: pal.cloth });
  const skin = new THREE.MeshLambertMaterial({ color: pal.skin });
  const dark = new THREE.MeshLambertMaterial({ color: 0x1e1914 });
  const visor = new THREE.MeshBasicMaterial({ color: pal.visor });
  const group = new THREE.Group();
  const hipL = new THREE.Group();
  const hipR = new THREE.Group();
  hipL.position.set(-0.14, 0.55, 0);
  hipR.position.set(0.14, 0.55, 0);
  const legL = new THREE.Mesh(shared.leg, dark);
  const legR = new THREE.Mesh(shared.leg, dark);
  legL.position.y = -0.22;
  legR.position.y = -0.22;
  hipL.add(legL);
  hipR.add(legR);
  const torso = new THREE.Mesh(shared.torso, cloth);
  torso.position.y = 0.95;
  const head = new THREE.Mesh(shared.head, skin);
  head.position.y = 1.46;
  const vis = new THREE.Mesh(shared.visor, visor);
  vis.position.set(0, 1.48, 0.18);
  const armL = new THREE.Group();
  const armR = new THREE.Group();
  armL.position.set(-0.42, 1.18, 0);
  armR.position.set(0.42, 1.18, 0);
  const aL = new THREE.Mesh(shared.arm, cloth);
  const aR = new THREE.Mesh(shared.arm, cloth);
  aL.position.y = -0.2;
  aR.position.y = -0.2;
  armL.add(aL);
  armR.add(aR);
  group.add(hipL, hipR, torso, head, vis, armL, armR);
  const bar = new THREE.Mesh(shared.bar, new THREE.MeshBasicMaterial({ color: pal.visor }));
  return { id: 0, group, armL, armR, bar, mats: [cloth, skin, dark, visor, bar.material as THREE.Material], mixer: null, actions: {}, clip: "" };
}

function poseFighter(f: Fighter, b: Body, sim: Sim, camera: THREE.PerspectiveCamera, dt: number) {
  const moving = b.grounded && Math.hypot(b.vx, b.vz) > 0.7 && (b.state === "free" || b.state === "atk");
  const pop = f.mixer ? 1 + Math.min(1.2, Math.max(0, b.y)) * 0.06 : 1 + Math.min(2.4, Math.max(0, b.y)) * 0.26;
  const sink = b.alive ? 1 : 0.55;
  f.group.visible = b.alive || b.y > -0.7;
  f.group.position.set(b.x, b.y + (f.mixer || !moving ? 0 : Math.abs(Math.sin(sim.time * 12 + b.id)) * 0.05), b.z);
  f.group.rotation.y = b.yaw + Math.PI;
  f.group.scale.setScalar(Math.max(0.05, (b.kind === "grunt" ? 1.02 : 1) * pop * sink));
  if (f.mixer) {
    const want = clipFor(b);
    playClip(f, want.name, want.loop);
    f.mixer.update(dt);
  } else {
    const atk = b.state === "atk" ? Math.sin(Math.min(1, Math.max(0, 0.34 - b.stateT) / 0.28) * Math.PI) : 0;
    f.armR.rotation.x = b.state === "windup" ? -1.25 : b.state === "spin" ? Math.sin(sim.time * 22) : -1.45 * atk;
    f.armL.rotation.x = b.state === "spin" ? -Math.sin(sim.time * 22) : b.state === "grab" ? -0.8 : -0.35 * atk;
  }
  const show = b.alive && b.hp < b.maxHp;
  f.bar.visible = show;
  if (show) {
    f.bar.position.set(b.x, b.y + 2.05, b.z);
    f.bar.scale.set(Math.max(0.05, b.hp / b.maxHp), 1, 1);
    f.bar.lookAt(camera.position.x, f.bar.position.y, camera.position.z);
  }
}

const GEAR = /sword|axe|shield|knife|crossbow|mug|throw|dagger|quiver|arrow|staff|wand|spell|badge/i;

function prepRig(scene: THREE.Group, animations: THREE.AnimationClip[]): RigTemplate {
  scene.traverse((obj) => {
    if (GEAR.test(obj.name)) obj.visible = false;
  });
  for (const clip of animations) {
    clip.tracks = clip.tracks.filter((track) => !track.name.startsWith("root.position"));
  }
  return { scene, animations };
}

function makeRig(
  shared: { bar: THREE.PlaneGeometry },
  template: RigTemplate,
  barColor: number,
): Fighter {
  const model = cloneRig(template.scene) as THREE.Group;
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const height = Math.max(0.01, bounds.max.y - bounds.min.y);
  const scale = 1.7 / height;
  model.scale.setScalar(scale);
  model.position.y = -bounds.min.y * scale;
  const group = new THREE.Group();
  group.add(model);
  const mixer = new THREE.AnimationMixer(model);
  const actions: Record<string, THREE.AnimationAction> = {};
  for (const clip of template.animations) {
    const action = mixer.clipAction(clip);
    actions[clip.name] = action;
  }
  const bar = new THREE.Mesh(shared.bar, new THREE.MeshBasicMaterial({ color: barColor }));
  const fighter: Fighter = { id: 0, group, armL: group, armR: group, bar, mats: [bar.material as THREE.Material], mixer, actions, clip: "" };
  playClip(fighter, "Unarmed_Idle", true);
  return fighter;
}

function playClip(f: Fighter, name: string, loop: boolean) {
  if (!f.mixer || f.clip === name) return;
  const next = f.actions[name];
  if (!next) return;
  const prev = f.clip ? f.actions[f.clip] : undefined;
  next.reset();
  next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
  next.clampWhenFinished = !loop;
  next.enabled = true;
  next.fadeIn(0.1).play();
  if (prev && prev !== next) prev.fadeOut(0.1);
  f.clip = name;
}

function clipFor(b: Body): { name: string; loop: boolean } {
  if (!b.alive || b.state === "out") return { name: "Death_A", loop: false };
  if (b.state === "down") return { name: "Lie_Idle", loop: true };
  if (b.state === "hit" || b.state === "launch") return { name: "Hit_A", loop: false };
  if (b.state === "dash") return { name: "Dodge_Forward", loop: false };
  if (b.state === "spin") return { name: "2H_Melee_Attack_Spin", loop: true };
  if (b.state === "throw") return { name: "Hit_B", loop: false };
  if (b.state === "grab") return { name: "Unarmed_Idle", loop: true };
  if (b.state === "atk" || b.state === "windup") {
    if (b.swing >= 3) return { name: "Unarmed_Melee_Attack_Kick", loop: false };
    if (b.swing === 2) return { name: "Unarmed_Melee_Attack_Punch_B", loop: false };
    return { name: "Unarmed_Melee_Attack_Punch_A", loop: false };
  }
  if (!b.grounded) return { name: b.vy > 1 ? "Jump_Start" : "Jump_Idle", loop: true };
  const speed = Math.hypot(b.vx, b.vz);
  if (speed > 3.2) return { name: "Running_A", loop: true };
  if (speed > 0.45) return { name: "Walking_A", loop: true };
  return { name: "Unarmed_Idle", loop: true };
}

function groundTex() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#4a3c32";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#6e5a4a";
  g.lineWidth = 2;
  for (let i = 0; i <= 256; i += 32) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 256);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i);
    g.lineTo(256, i);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

function signTex() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 220;
  const g = c.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#12100e";
  g.fillRect(0, 0, 512, 220);
  g.fillStyle = "#f0b429";
  g.fillRect(18, 18, 476, 184);
  g.fillStyle = "#12100e";
  g.font = "700 86px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("ASHLANE", 256, 118);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
