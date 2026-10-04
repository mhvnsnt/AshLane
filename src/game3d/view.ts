import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneRig } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Body, Box, Sim } from "./sim";
import { HAND_SLOT, PROP_MESH, TARGET_HEIGHT, adoptRig, clipForMoveset, slotFor } from "./rig-pipeline";
import { bakeMotion, loadMotionBank, motionNames } from "./motion-bank";

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
  gear: THREE.Mesh | null;
  moveset: string;
  baseY: number;
  lockL: THREE.Vector3 | null;
  lockR: THREE.Vector3 | null;
};

type RigTemplate = { scene: THREE.Group; animations: THREE.AnimationClip[]; moveset: string };

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
  scene.background = new THREE.Color(0x12161c);
  scene.fog = new THREE.Fog(0x12161c, 18, 78);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120);
  camera.position.set(8, 14, 16);
  camera.lookAt(0, 1, 0);

  const hemi = new THREE.HemisphereLight(0x8ea4c0, 0x1a1418, 0.85);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xc5d2e4, 1.05);
  sun.position.set(-8, 18, 6);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xe4572e, 0.28);
  rim.position.set(12, 6, -10);
  scene.add(rim);

  const groundMat = new THREE.MeshPhongMaterial({ map: groundTex(), color: 0xffffff, shininess: 22, specular: 0x3d5166 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(64, 64), groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const lane = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 8.2),
    new THREE.MeshPhongMaterial({ color: 0x10161e, shininess: 48, specular: 0x6a849c }),
  );
  lane.rotation.x = -Math.PI / 2;
  lane.position.set(0, 0.02, -19);
  scene.add(lane);
  const scaffold = new THREE.Mesh(new THREE.PlaneGeometry(46, 5.4), new THREE.MeshPhongMaterial({ color: 0x16141a, shininess: 8, specular: 0x222228 }));
  scaffold.rotation.x = -Math.PI / 2;
  scaffold.position.set(-4, 0.021, 20);
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
  pit.visible = false;
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
  let knight: RigTemplate | null = null;
  let rogue: RigTemplate | null = null;
  let brute: RigTemplate | null = null;
  let hood: RigTemplate | null = null;
  let hex: RigTemplate | null = null;
  let drifter: RigTemplate | null = null;
  let skel: RigTemplate | null = null;
  let bones: RigTemplate | null = null;
  let mannequin: RigTemplate | null = null;
  let skull: RigTemplate | null = null;
  let minion: RigTemplate | null = null;
  let soldier: RigTemplate | null = null;
  let soldierf: RigTemplate | null = null;
  let zombie: RigTemplate | null = null;
  let zombief: RigTemplate | null = null;
  let rigKey = "";
  const loader = new GLTFLoader();
  const loadRig = (url: string, slot: string, moveset: string) =>
    loader.loadAsync(url).then((gltf) => {
      const rig = adoptRig(gltf.scene, gltf.animations, moveset);
      if (slot === "knight") knight = rig;
      else if (slot === "rogue") rogue = rig;
      else if (slot === "brute") brute = rig;
      else if (slot === "hood") hood = rig;
      else if (slot === "drifter") drifter = rig;
      else if (slot === "skel") skel = rig;
      else if (slot === "bones") bones = rig;
      else if (slot === "mannequin") mannequin = rig;
      else if (slot === "skull") skull = rig;
      else if (slot === "minion") minion = rig;
      else if (slot === "soldier") soldier = rig;
      else if (slot === "soldierf") soldierf = rig;
      else if (slot === "zombie") zombie = rig;
      else if (slot === "zombief") zombief = rig;
      else hex = rig;
      rigKey = "";
    });
  void loadRig("/models/kaykit/Knight.glb", "knight", "knight").then(() => {
    void loadRig("/models/kaykit/Rogue.glb", "rogue", "runner");
    void loadRig("/models/kaykit/Barbarian.glb", "brute", "brute");
    void loadRig("/models/kaykit/Rogue_Hooded.glb", "hood", "hood");
    void loadRig("/models/kaykit/Mage.glb", "hex", "hex");
    void loadRig("/models/humanoid/drifter.glb", "drifter", "drifter");
    void loadRig("/models/kaykit/Skeleton_Warrior.glb", "skel", "skeleton");
    void loadRig("/models/kaykit/Skeleton_Rogue.glb", "bones", "bones");
    void loadRig("/models/humanoid/mannequin.glb", "mannequin", "mannequin");
    void loadRig("/models/kaykit/Skeleton_Mage.glb", "skull", "skull");
    void loadRig("/models/kaykit/Skeleton_Minion.glb", "minion", "minion");
    void loadRig("/models/humanoid/Soldier_Male.glb", "soldier", "soldier");
    void loadRig("/models/humanoid/Soldier_Female.glb", "soldierf", "soldierf");
    void loadRig("/models/humanoid/Zombie_Male.glb", "zombie", "zombie");
    void loadRig("/models/humanoid/Zombie_Female.glb", "zombief", "zombief");
  });
  void loadMotionBank().then(() => {
    rigKey = "";
  });
  const boxMeshes: THREE.Object3D[] = [];
  const propViews: THREE.Object3D[] = [];
  let propKey = "";
  let kit: Record<string, THREE.Object3D> | null = null;
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
  const flickers: { mat: THREE.MeshBasicMaterial; rate: number }[] = [];
  const rain = makeRain(scene);
  let idle = 0.4;
  let built = false;

  let stageId = "";
  function applyStage(id: string) {
    if (id === stageId) return;
    stageId = id;
    const look =
      id === "dock"
        ? { fog: 0x0c141c, sky: 0x6a90b0, ground: 0x9bb0c4, near: 14, far: 62 }
        : id === "pit"
          ? { fog: 0x1a100e, sky: 0xc08060, ground: 0xc4a090, near: 12, far: 55 }
          : id === "high"
          ? { fog: 0x161c28, sky: 0xb0c0d8, ground: 0xc8d0dc, near: 16, far: 70 }
          : id === "yard"
            ? { fog: 0x1a2218, sky: 0xa8c090, ground: 0xc6d2b4, near: 20, far: 80 }
            : id === "under"
              ? { fog: 0x070c10, sky: 0x4a6870, ground: 0x8098a0, near: 10, far: 42 }
              : { fog: 0x12161c, sky: 0x8ea4c0, ground: 0xffffff, near: 18, far: 78 };
    scene.background = new THREE.Color(look.fog);
    scene.fog = new THREE.Fog(look.fog, look.near, look.far);
    hemi.color.setHex(look.sky);
    groundMat.color.setHex(look.ground);
  }

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
    addUrban(flickers);
    addDress();
    addMarket();
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
    const color = box.kind === "gate" ? 0xe4572e : box.kind === "plat" ? 0x6a5438 : wide ? 0x3c4450 : h < 2 ? 0x3a342e : 0x2a313c;
    const mat = new THREE.MeshLambertMaterial({
      color,
      transparent: box.kind === "gate",
      opacity: box.kind === "gate" ? 0.45 : 1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(midX, h / 2, midZ);
    mesh.userData.shell = box.kind === "wall" && h > 3 && !wide;
    scene.add(mesh);
    return mesh;
  }

  function addLamps() {
    const spots: [number, number, number][] = [
      [-14, -23.15, 0xf0b429],
      [-4, -23.15, 0xf0b429],
      [6, -23.15, 0x7fd0ff],
      [14, -23.15, 0xf0b429],
      [-8, -2, 0xf0b429],
      [8, 2, 0xe85aad],
      [0, 10, 0xf0b429],
      [-16, 18, 0x7fd0ff],
    ];
    for (const [x, z, color] of spots) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 3.4, 6), new THREE.MeshLambertMaterial({ color: 0x1a1c22 }));
      post.position.set(x, 1.7, z);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.28), new THREE.MeshBasicMaterial({ color }));
      head.position.set(x, 3.35, z);
      scene.add(post, head);
      const light = new THREE.PointLight(color, color === 0xf0b429 ? 1.15 : 0.85, 12, 1.4);
      light.position.set(x, 3.15, z);
      scene.add(light);
    }
  }

  function addSign() {
    const tex = signTex();
    const board = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.5), new THREE.MeshBasicMaterial({ map: tex }));
    board.position.set(-6.92, 3.4, -4.88);
    board.rotation.y = 0;
    scene.add(board);
  }

  function addUrban(glows: { mat: THREE.MeshBasicMaterial; rate: number }[]) {
    const sign = (text: string, fill: string, x: number, y: number, z: number, rotY: number, w: number, h: number, flicker: boolean) => {
      const tex = labelTex(text, fill);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95 });
      const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      board.position.set(x, y, z);
      board.rotation.y = rotY;
      scene.add(board);
      if (flicker) glows.push({ mat, rate: 2.2 + glows.length * 0.37 });
      const light = new THREE.PointLight(fill === "#3ee0c5" ? 0x3ee0c5 : fill === "#e85aad" ? 0xe85aad : 0xf0b429, 0.55, 7, 1.6);
      light.position.set(x, y, z + (rotY === 0 ? 0.4 : -0.4));
      scene.add(light);
    };
    sign("LATE", "#3ee0c5", -10, 3.15, -23.88, 0, 1.7, 0.48, true);
    sign("OPEN", "#e85aad", 2.2, 2.7, -23.88, 0, 1.35, 0.42, true);
    sign("24", "#f0b429", 11.5, 3.3, -23.88, 0, 0.7, 0.7, false);
    sign("NOODLE", "#e85aad", -12.2, 2.55, -4.88, 0, 2.1, 0.46, true);
    sign("COIL", "#3ee0c5", 11, 2.4, 5.12, Math.PI, 1.5, 0.42, false);

    const awning = (x: number, z: number, len: number, rotY: number, color: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.7), new THREE.MeshLambertMaterial({ color }));
      mesh.position.set(x, 2.35, z);
      mesh.rotation.y = rotY;
      scene.add(mesh);
    };
    awning(-10, -23.45, 2.4, 0, 0x1a3a40);
    awning(2.2, -23.45, 1.8, 0, 0x4a2040);
    awning(-12.2, -5.28, 2.4, 0, 0x4a2040);

    const pane = (x: number, y: number, z: number, color: number) => {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.7), mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
    };
    for (let i = 0; i < 9; i++) pane(-16 + i * 3.6, 3.5, -23.9, i % 2 ? 0x7fd0ff : 0xf0c36a);
    for (let i = 0; i < 4; i++) pane(-16 + i * 2.4, 2.6, -4.9, 0xf2d7a2);
    for (let i = 0; i < 4; i++) pane(8.2 + i * 2.2, 2.5, -4.9, 0x9fd7ff);

    const puddle = (x: number, z: number, rx: number, rz: number) => {
      const mesh = new THREE.Mesh(
        new THREE.CircleGeometry(1, 18),
        new THREE.MeshBasicMaterial({ color: 0x243246, transparent: true, opacity: 0.55 }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0.03, z);
      mesh.scale.set(rx, rz, 1);
      scene.add(mesh);
    };
    puddle(-6, -19.2, 1.4, 0.7);
    puddle(3.5, -18.4, 1.1, 0.55);
    puddle(8, -20.2, 0.8, 0.45);
    puddle(1.2, 1.4, 1.3, 0.6);
    puddle(-7, 6, 0.9, 0.5);

    for (let i = 0; i < 5; i++) {
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 2.4), new THREE.MeshBasicMaterial({ color: 0xd5dde6 }));
      bar.rotation.x = -Math.PI / 2;
      bar.position.set(-1.6 + i * 0.7, 0.035, -16.2);
      scene.add(bar);
    }
  }

  function addMarket() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 9.2),
      new THREE.MeshPhongMaterial({ color: 0x101820, shininess: 36, specular: 0x5c7388 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(31, 0.025, -19.4);
    scene.add(floor);
    const tex = labelTex("MARKET", "#f0b429");
    const board = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.55), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    board.position.set(20, 3.2, -23.88);
    scene.add(board);
  }

  function addDress() {
    const files = ["wall", "barrel_small", "barrel_large", "box_small", "box_large", "table_small", "table_medium", "pillar", "column", "floor_tile_large", "banner_red", "barrier", "stairs_wood", "stool", "torch_mounted", "wall_arched"];
    void Promise.all(files.map((name) => loader.loadAsync(`/models/kaykit/props/${name}.gltf.glb`).then((gltf) => [name, gltf.scene] as const)))
      .then((pairs) => {
        kit = Object.fromEntries(pairs);
        const root = new THREE.Group();
        const wall = kit.wall;
        if (wall) {
          const buildings = [
            { x0: -18, x1: -7, z0: -13, z1: -5, door: { x0: -13.7, x1: -11.1, z0: -6.3, z1: -4.3 } },
            { x0: 7, x1: 18, z0: -13, z1: -5, door: null },
            { x0: -18, x1: -7, z0: 5, z1: 13, door: null },
            { x0: 7, x1: 18, z0: 5, z1: 13, door: null },
          ];
          for (const b of buildings) {
            wallRun(root, wall, b.x0, b.z1, b.x1, b.z1, b.door);
            wallRun(root, wall, b.x1, b.z1, b.x1, b.z0, null);
            wallRun(root, wall, b.x1, b.z0, b.x0, b.z0, null);
            wallRun(root, wall, b.x0, b.z0, b.x0, b.z1, null);
          }
          wallRun(root, wall, -22, -23.6, 44, -23.6, null);
        }
        const drop = (name: string, x: number, z: number, yaw = 0) => {
          const src = kit?.[name];
          if (!src) return;
          const mesh = src.clone(true);
          mesh.position.set(x, 0, z);
          mesh.rotation.y = yaw;
          root.add(mesh);
        };
        drop("floor_tile_large", -12.5, -9);
        drop("table_small", -12.2, -9.2);
        drop("barrel_small", -16.2, -6.2);
        drop("barrel_large", 16.4, -6.4);
        drop("pillar", 17.2, -16.2);
        drop("pillar", 17.2, -22.4);
        drop("barrel_small", 22.4, -22.2);
        drop("table_small", 30, -22.2);
        drop("barrel_large", 34.5, -16.4);
        drop("box_small", 41, -22);
        drop("box_large", 26, -16.6);
        drop("banner_red", 24, -23.3);
        drop("barrier", 28.5, -16.2);
        drop("barrier", 37, -22.4);
        drop("stool", -14.6, -7.4);
        drop("table_medium", 32.5, -21.6);
        drop("torch_mounted", -10, -23.4);
        drop("torch_mounted", 8, -23.4);
        drop("stairs_wood", -16.2, 17.1);
        drop("column", -4, 8);
        drop("wall_arched", -12.4, -5.15, Math.PI);
        scene.add(root);
        for (const mesh of boxMeshes) if (mesh.userData.shell) mesh.visible = false;
        propKey = "";
      })
      .catch(() => {
        kit = null;
      });
  }

  function rigFor(b: Body, sim: Sim): RigTemplate | null {
    if (!knight) return null;
    if (b.kind === "player") {
      if (sim.style === "soldier") return soldier ?? mannequin ?? knight;
      if (sim.style === "soldierf") return soldierf ?? mannequin ?? knight;
      if (sim.style === "zombie") return zombie ?? soldier ?? knight;
      if (sim.style === "zombief") return zombief ?? soldierf ?? knight;
      if (sim.build === "full" && sim.style !== "drifter") return mannequin ?? soldier ?? knight;
      if (sim.style === "runner") return rogue ?? knight;
      if (sim.style === "brute") return brute ?? knight;
      if (sim.style === "hood") return hood ?? knight;
      if (sim.style === "hex") return hex ?? knight;
      if (sim.style === "drifter") return drifter ?? knight;
      if (sim.style === "skeleton") return skel ?? knight;
      if (sim.style === "bones") return bones ?? knight;
      if (sim.style === "mannequin") return mannequin ?? knight;
      if (sim.style === "skull") return skull ?? knight;
      if (sim.style === "minion") return minion ?? knight;
      if (sim.style === "rain") return knight;
      if (sim.style === "ash") return rogue ?? knight;
      if (sim.style === "pit") return brute ?? knight;
      return knight;
    }
    if (b.kind === "ally") return hood ?? rogue ?? knight;
    if (sim.crowd === "full") {
      const pick = b.id % 4;
      if (pick === 0 && soldier) return soldier;
      if (pick === 1 && soldierf) return soldierf;
      if (pick === 2 && zombie) return zombie;
      return zombief ?? mannequin ?? drifter ?? knight;
    }
    if (b.arch === "brute") return brute ?? knight;
    if (b.arch === "runner") return rogue ?? knight;
    if (b.arch === "hood") return hood ?? knight;
    if (b.arch === "hex") return hex ?? knight;
    if (b.arch === "brawler") return knight;
    if (b.id % 5 === 0 && skel) return skel;
    if (b.id % 5 === 1 && bones) return bones;
    if (b.id % 5 === 2 && skull) return skull;
    if (b.id % 5 === 3 && minion) return minion;
    if (sim.crowd !== "chibi" && b.id % 5 === 4 && mannequin) return mannequin;
    return b.id % 2 === 0 ? rogue : brute;
  }

  function syncFighters(sim: Sim) {
    const key = `${sim.style}|${sim.build}|${sim.crowd}|${sim.height}|${sim.bulk}|${sim.head}|${sim.leg}|${sim.shoulder}|${sim.bodies.map((b) => b.id).join(",")}|${knight ? 1 : 0}${rogue ? 1 : 0}${brute ? 1 : 0}${hood ? 1 : 0}${hex ? 1 : 0}${drifter ? 1 : 0}${skel ? 1 : 0}${bones ? 1 : 0}${mannequin ? 1 : 0}${skull ? 1 : 0}${minion ? 1 : 0}${soldier ? 1 : 0}${soldierf ? 1 : 0}${zombie ? 1 : 0}${zombief ? 1 : 0}`;
    if (key === rigKey && fighters.length === sim.bodies.length) return;
    rigKey = key;
    for (const f of fighters) {
      scene.remove(f.group);
      scene.remove(f.bar);
      f.mixer?.stopAllAction();
      for (const m of f.mats) m.dispose();
    }
    fighters.length = 0;
    for (const b of sim.bodies) {
      const rig = rigFor(b, sim);
      const made = rig ? makeRig(rig, b.kind === "player" ? 0xf0b429 : 0xe4572e, b.kind === "player" ? "player" : rig.moveset, b.kind === "player" ? DYE[sim.style] ?? 0 : 0, b.kind === "player" ? sim.height : 1, b.kind === "player" ? sim.bulk : 1, b.kind === "player" ? sim.head : 1, b.kind === "player" ? sim.leg : 1, b.kind === "player" ? sim.shoulder : 1) : makeFighter(shared, b.kind === "player" ? PAL[0] : PAL[(b.id % (PAL.length - 1)) + 1]);
      made.id = b.id;
      scene.add(made.group);
      scene.add(made.bar);
      fighters.push(made);
    }
  }

  function syncProps(sim: Sim) {
    const key = `${sim.props.map((p) => p.id).join(",")}|${kit ? 1 : 0}`;
    if (key !== propKey) {
      propKey = key;
      for (const mesh of propViews) scene.remove(mesh);
      propViews.length = 0;
      for (const prop of sim.props) {
        const src = kit?.[prop.kind === "crate" ? "box_small" : prop.kind === "pipe" ? "pillar" : "barrel_small"];
        let mesh: THREE.Object3D;
        if (src && prop.kind === "crate") mesh = src.clone(true);
        else if (prop.kind === "pipe") {
          mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6), new THREE.MeshLambertMaterial({ color: 0x9aa3ad }));
          mesh.rotation.z = Math.PI / 2;
        } else if (prop.kind === "bottle") {
          mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.32, 6), new THREE.MeshLambertMaterial({ color: 0x69c3c2 }));
        } else if (src) mesh = src.clone(true);
        else mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), new THREE.MeshLambertMaterial({ color: 0x6a5438 }));
        scene.add(mesh);
        propViews.push(mesh);
      }
    }
    sim.props.forEach((prop, i) => {
      const mesh = propViews[i];
      if (!mesh) return;
      mesh.visible = prop.alive;
      mesh.position.set(prop.x, prop.y + (prop.kind === "pipe" ? 0.15 : 0), prop.z);
    });
  }

  function render(sim: Sim, dt: number) {
    applyStage(sim.stage);
    ring.visible = false;
    ensureWorld(sim);
    syncFighters(sim);
    syncProps(sim);
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
    placeCamera(sim, dt, camera, _desired, _target, () => {
      idle += dt;
      return idle;
    });
    const beat = sim.hitstop > 0 ? 1.8 : 1;
    rain.step(sim.reduced ? 0 : dt * beat, camera);
    for (const glow of flickers) {
      glow.mat.opacity = sim.reduced ? 0.9 : 0.72 + Math.sin(sim.time * glow.rate) * 0.22;
    }
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
    const dist = sim.scuffle ? 4.3 : 5.6;
    const cx = p.x - fx * dist;
    const cy = p.y + (sim.scuffle ? 2.1 : 2.45);
    const cz = p.z - fz * dist;
    const clipped = clipCam(p.x, p.y + 1.3, p.z, cx, cy, cz, sim.boxes);
    desired.set(clipped.x, clipped.y, clipped.z);
    target.set(p.x + fx * 0.4, p.y + 1.25, p.z + fz * 0.4);
  } else if (sim.mode === "belt") {
    const cz = Math.min(p.z + 5.15, -13.4);
    const close = cz - p.z < 3.4;
    desired.set(p.x, p.y + (close ? 7.2 : 3.45), cz);
    target.set(p.x, p.y + 1.2, p.z - 0.35);
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
  return { id: 0, group, armL, armR, bar, mats: [cloth, skin, dark, visor, bar.material as THREE.Material], mixer: null, actions: {}, clip: "", gear: null, moveset: "knight", baseY: 0, lockL: null, lockR: null };
}

function poseFighter(f: Fighter, b: Body, sim: Sim, camera: THREE.PerspectiveCamera, dt: number) {
  const sink = b.alive ? 1 : 0.55;
  const bulk = b.kind === "player" ? 1 : b.arch === "brute" ? 1.16 : b.arch === "runner" ? 0.92 : b.arch === "hood" ? 0.98 : b.arch === "hex" ? 1.04 : 1;
  f.group.visible = b.alive || b.y > -0.7;
  f.group.position.set(b.x, b.y, b.z);
  f.group.rotation.y = b.yaw + Math.PI;
  if (!f.mixer) f.group.scale.setScalar(Math.max(0.05, bulk * sink));
  if (f.mixer) {
    const want = resolveClip(f, b, sim);
    playClip(f, want.name, want.loop);
    const speed = Math.hypot(b.vx, b.vz);
    const action = f.actions[f.clip];
    if (action && b.grounded && b.state === "free" && speed > 0.45 && !motionNames().has(f.clip)) {
      action.timeScale = Math.min(1.65, Math.max(0.7, speed / 2.15));
    }
    f.mixer.update(dt);
    if (b.alive && b.grounded && b.state === "free") settleFeet(f);
    if (f.gear) {
      f.gear.visible = b.alive && b.weapon !== "fist";
      (f.gear.material as THREE.MeshLambertMaterial).color.setHex(b.weapon === "bottle" ? 0x69c3c2 : 0xb7c0c8);
    }
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

function settleFeet(f: Fighter) {
  const model = f.group.children[0];
  if (!model) return;
  model.position.y = f.baseY;
  model.updateWorldMatrix(true, true);
  let lowest = Infinity;
  const spot = new THREE.Vector3();
  model.traverse((obj) => {
    if (obj.name !== "foot.l" && obj.name !== "foot.r" && obj.name !== "FootL" && obj.name !== "FootR" && obj.name !== "LeftFoot" && obj.name !== "RightFoot") return;
    obj.getWorldPosition(spot);
    lowest = Math.min(lowest, spot.y);
  });
  if (!Number.isFinite(lowest) || lowest >= -0.02) return;
  model.position.y = f.baseY + (0.02 - lowest);
}

function makeRig(template: RigTemplate, barColor: number, moveset = template.moveset, dye = 0, heightMul = 1, bulk = 1, head = 1, leg = 1, shoulder = 1): Fighter {
  const model = cloneRig(template.scene) as THREE.Group;
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const full = template.moveset === "soldier" || template.moveset === "soldierf" || template.moveset === "zombie" || template.moveset === "zombief" || template.moveset === "mannequin" || template.moveset === "drifter";
  const tall = Math.max(0.01, bounds.max.y - bounds.min.y);
  const scale = (full ? 1.92 : 1.5) / tall;
  const yScale = scale * heightMul * (0.9 + leg * 0.1);
  const xz = scale * bulk * (0.9 + shoulder * 0.1);
  model.scale.set(xz, yScale, xz);
  model.position.y = -bounds.min.y * yScale;
  model.traverse((obj) => {
    if (PROP_MESH.test(obj.name)) obj.visible = false;
    if (obj.name === "head" || obj.name === "Head" || obj.name === "DEF-head") obj.scale.setScalar(0.85 + head * 0.15);
  });
  const dyed: THREE.Material[] = [];
  if (dye) {
    const tint = new THREE.Color(dye);
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const next = list.map((mat) => {
        const copy = mat.clone();
        const colored = copy as THREE.MeshStandardMaterial;
        if (colored.color) colored.color.lerp(tint, 0.62);
        dyed.push(copy);
        return copy;
      });
      mesh.material = Array.isArray(mesh.material) ? next : next[0];
    });
  }
  const group = new THREE.Group();
  group.add(model);
  const mixer = new THREE.AnimationMixer(model);
  const actions: Record<string, THREE.AnimationAction> = {};
  for (const clip of template.animations) {
    actions[clip.name] = mixer.clipAction(clip);
  }
  for (const clip of bakeMotion(model)) {
    actions[clip.name] = mixer.clipAction(clip);
  }
  const slots: THREE.Object3D[] = [];
  model.traverse((obj) => {
    if (obj.name === HAND_SLOT) slots.push(obj);
  });
  const gear = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.72, 6), new THREE.MeshLambertMaterial({ color: 0xb7c0c8 }));
  gear.rotation.z = Math.PI / 3;
  gear.visible = false;
  const slot = slots[0];
  if (slot) slot.add(gear);
  else {
    gear.position.set(0.28, 1.15, 0.2);
    group.add(gear);
  }
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.08), new THREE.MeshBasicMaterial({ color: barColor }));
  const fighter: Fighter = {
    id: 0,
    group,
    armL: group,
    armR: group,
    bar,
    mats: [bar.material as THREE.Material, gear.material as THREE.Material, ...dyed],
    mixer,
    actions,
    clip: "",
    gear,
    moveset,
    baseY: model.position.y,
    lockL: null,
    lockR: null,
  };
  playClip(fighter, "Unarmed_Idle", true);
  return fighter;
}

const DYE: Record<string, number> = { rain: 0x6a90b0, ash: 0xb7b2a8, pit: 0xc46a3a };

function playClip(f: Fighter, name: string, loop: boolean) {
  if (!f.mixer || f.clip === name) return;
  const next = f.actions[name] ?? f.actions.Unarmed_Idle ?? f.actions.Idle ?? f.actions.Idle_Loop;
  if (!next) return;
  const resolved = next.getClip().name;
  if (f.clip === resolved && name !== resolved) {
    f.clip = name;
    return;
  }
  const prev = f.clip ? f.actions[f.clip] : undefined;
  next.reset();
  next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
  next.clampWhenFinished = !loop;
  next.enabled = true;
  next.fadeIn(0.1).play();
  if (prev && prev !== next) prev.fadeOut(0.1);
  f.clip = resolved;
}

function resolveClip(f: Fighter, b: Body, sim: Sim): { name: string; loop: boolean } {
  const asked = slotFor(b);
  const name = clipForMoveset(f.moveset, asked.slot, (clip) => clip in f.actions);
  return { name, loop: asked.loop };
}

function wallRun(
  root: THREE.Group,
  template: THREE.Object3D,
  x0: number,
  z0: number,
  x1: number,
  z1: number,
  gap: { x0: number; x1: number; z0: number; z1: number } | null,
) {
  const dx = x1 - x0;
  const dz = z1 - z0;
  const len = Math.hypot(dx, dz);
  if (len < 0.4) return;
  const yaw = Math.atan2(-dz, dx);
  let t = 0;
  while (t < len - 0.15) {
    const seg = Math.min(4, len - t);
    const mid = t + seg / 2;
    const x = x0 + (dx / len) * mid;
    const z = z0 + (dz / len) * mid;
    t += seg;
    if (gap && x > gap.x0 && x < gap.x1 && z > gap.z0 && z < gap.z1) continue;
    const mesh = template.clone(true);
    mesh.position.set(x, 0, z);
    mesh.rotation.y = yaw;
    mesh.scale.set(seg / 4, 1.2, 1);
    root.add(mesh);
  }
}

function makeRain(scene: THREE.Scene) {
  const n = 480;
  const pos = new Float32Array(n * 6);
  const vel = new Float32Array(n);
  for (let i = 0; i < n; i++) seedDrop(pos, vel, i, 0, 6, 2);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({ color: 0xd5e4f2, transparent: true, opacity: 0.42, depthWrite: false });
  const lines = new THREE.LineSegments(geo, mat);
  lines.frustumCulled = false;
  scene.add(lines);
  return {
    step(dt: number, cam: THREE.PerspectiveCamera) {
      lines.visible = dt > 0;
      if (dt <= 0) return;
      const attr = geo.getAttribute("position") as THREE.BufferAttribute;
      const a = attr.array as Float32Array;
      for (let i = 0; i < n; i++) {
        const o = i * 6;
        const fall = vel[i] * dt;
        a[o + 1] -= fall;
        a[o + 4] -= fall;
        a[o] -= dt * 2.2;
        a[o + 3] -= dt * 2.2;
        const far = Math.abs(a[o] - cam.position.x) > 16 || Math.abs(a[o + 2] - cam.position.z) > 16;
        if (a[o + 1] < 0 || far) seedDrop(a, vel, i, cam.position.x, cam.position.y + 4, cam.position.z);
      }
      attr.needsUpdate = true;
    },
  };
}

const _hip = new THREE.Vector3();
const _knee = new THREE.Vector3();
const _end = new THREE.Vector3();
const _target = new THREE.Vector3();
const _pole = new THREE.Vector3();
const _look = new THREE.Vector3();
const LEGS: [string, string, string][] = [
  ["upperleg.l", "lowerleg.l", "foot.l"],
  ["upperleg.r", "lowerleg.r", "foot.r"],
  ["UpperLegL", "LowerLegL", "FootL"],
  ["UpperLegR", "LowerLegR", "FootR"],
  ["LeftUpLeg", "LeftLeg", "LeftFoot"],
  ["RightUpLeg", "RightLeg", "RightFoot"],
  ["DEF-thighL", "DEF-shinL", "DEF-footL"],
  ["DEF-thighR", "DEF-shinR", "DEF-footR"],
];
const ARMS: [string, string, string][] = [
  ["upperarm.l", "lowerarm.l", "hand.l"],
  ["upperarm.r", "lowerarm.r", "hand.r"],
  ["UpperArmL", "LowerArmL", "FistL"],
  ["UpperArmR", "LowerArmR", "FistR"],
  ["LeftArm", "LeftForeArm", "LeftHand"],
  ["RightArm", "RightForeArm", "RightHand"],
  ["DEF-upper_armL", "DEF-forearmL", "DEF-handL"],
  ["DEF-upper_armR", "DEF-forearmR", "DEF-handR"],
];

function bone(root: THREE.Object3D, name: string) {
  return root.getObjectByName(name) ?? null;
}

function plantFeet(f: Fighter, model: THREE.Object3D, speed: number) {
  model.position.y = f.baseY;
  model.updateWorldMatrix(true, true);
  const left = chain(model, 0);
  const right = chain(model, 1);
  if (!left || !right) return;
  let lowest = Infinity;
  for (const foot of [left[2], right[2]]) {
    foot.getWorldPosition(_end);
    lowest = Math.min(lowest, _end.y);
  }
  const drop = 0.04 - lowest;
  if (Math.abs(drop) < 0.4) model.position.y = f.baseY + drop;
  model.updateWorldMatrix(true, true);
  const actionTime = f.actions[f.clip]?.time ?? 0;
  const dur = f.actions[f.clip]?.getClip().duration ?? 1;
  const phase = (actionTime / Math.max(0.2, dur)) % 1;
  stepFoot(f, model, left, phase < 0.48, speed, "L");
  stepFoot(f, model, right, phase >= 0.48, speed, "R");
}

function chain(root: THREE.Object3D, side: 0 | 1) {
  const names = side === 0 ? LEGS.filter((_, i) => i % 2 === 0) : LEGS.filter((_, i) => i % 2 === 1);
  for (const [a, b, c] of names) {
    const upper = bone(root, a);
    const mid = bone(root, b);
    const end = bone(root, c);
    if (upper && mid && end) return [upper, mid, end] as const;
  }
  return null;
}

function stepFoot(f: Fighter, model: THREE.Object3D, bones: readonly [THREE.Object3D, THREE.Object3D, THREE.Object3D], support: boolean, speed: number, side: "L" | "R") {
  const foot = bones[2];
  foot.getWorldPosition(_end);
  const lock = side === "L" ? f.lockL : f.lockR;
  if (!support || speed < 0.35) {
    if (side === "L") f.lockL = null;
    else f.lockR = null;
    if (_end.y < 0.02 || _end.y > 0.2) {
      _target.set(_end.x, 0.04, _end.z);
      solveTwo(bones[0], bones[1], bones[2], _target, model);
    }
    return;
  }
  if (!lock) {
    const planted = _end.clone();
    planted.y = 0.04;
    if (side === "L") f.lockL = planted;
    else f.lockR = planted;
  }
  const held = side === "L" ? f.lockL : f.lockR;
  if (!held) return;
  solveTwo(bones[0], bones[1], bones[2], held, model);
}

function solveTwo(upper: THREE.Object3D, mid: THREE.Object3D, end: THREE.Object3D, target: THREE.Vector3, model: THREE.Object3D) {
  upper.updateWorldMatrix(true, true);
  upper.getWorldPosition(_hip);
  mid.getWorldPosition(_knee);
  const upperLen = mid.position.length() || 0.01;
  const lowerLen = end.position.length() || 0.01;
  _look.set(0, 0.2, 1).applyQuaternion(model.parent?.quaternion ?? model.quaternion);
  _pole.copy(_knee).add(_look);
  const parent = upper.parent;
  if (!parent) return;
  const inv = new THREE.Matrix4().copy(parent.matrixWorld).invert();
  const localTarget = target.clone().applyMatrix4(inv);
  const localPole = _pole.clone().applyMatrix4(inv);
  const hip = upper.position;
  const to = localTarget.sub(hip);
  const raw = to.length() || 0.001;
  const dist = Math.min(upperLen + lowerLen - 0.001, Math.max(Math.abs(upperLen - lowerLen) + 0.001, raw));
  to.multiplyScalar(dist / raw);
  const bend = localPole.sub(hip);
  if (bend.lengthSq() < 1e-5) bend.set(0, 1, 0);
  bend.normalize();
  const axis = new THREE.Vector3().crossVectors(to, bend);
  if (axis.lengthSq() < 1e-6) axis.set(0, 1, 0);
  axis.normalize();
  const side = new THREE.Vector3().crossVectors(axis, to).normalize();
  const cos = Math.min(1, Math.max(-1, (upperLen * upperLen + dist * dist - lowerLen * lowerLen) / (2 * upperLen * dist)));
  const sin = Math.sqrt(Math.max(0, 1 - cos * cos));
  const kneePos = hip.clone().addScaledVector(to.clone().normalize(), cos * upperLen).addScaledVector(side, sin * upperLen);
  aimBone(upper, mid.position, kneePos.clone().sub(hip));
  upper.updateWorldMatrix(true, false);
  const invUpper = new THREE.Matrix4().copy(upper.matrixWorld).invert();
  const hand = target.clone().applyMatrix4(invUpper);
  aimBone(mid, end.position, hand.sub(mid.position));
}

function aimBone(boneObj: THREE.Object3D, fromDir: THREE.Vector3, toDir: THREE.Vector3) {
  if (fromDir.lengthSq() < 1e-6 || toDir.lengthSq() < 1e-6) return;
  const before = boneObj.quaternion.clone();
  const q = new THREE.Quaternion().setFromUnitVectors(fromDir.clone().normalize(), toDir.clone().normalize());
  boneObj.quaternion.premultiply(q);
  if (before.angleTo(boneObj.quaternion) > 0.55) boneObj.quaternion.copy(before);
}

function holdPair(fighters: Fighter[], sim: Sim) {
  const player = sim.bodies[0];
  if (!player || player.state !== "grab" || sim.grabId < 0) return;
  const victimBody = sim.bodies.find((b) => b.id === sim.grabId);
  const attacker = fighters.find((f) => f.id === player.id);
  const victim = fighters.find((f) => f.id === sim.grabId);
  if (!attacker || !victim || !victimBody || !attacker.mixer || !victim.mixer) return;
  _look.set(0, 0, 1).applyQuaternion(attacker.group.quaternion);
  victim.group.position.set(attacker.group.position.x + _look.x * 0.62, attacker.group.position.y, attacker.group.position.z + _look.z * 0.62);
  victim.group.rotation.y = attacker.group.rotation.y + Math.PI;
  victim.group.updateWorldMatrix(true, true);
  attacker.group.updateWorldMatrix(true, true);
  const modelA = attacker.group.children[0];
  const modelV = victim.group.children[0];
  if (!modelA || !modelV) return;
  _target.copy(victim.group.position);
  _target.y += 1.15;
  reach(modelA, _target.clone().add(new THREE.Vector3(-_look.z, 0, _look.x).multiplyScalar(0.12)), 0);
  reach(modelA, _target.clone().add(new THREE.Vector3(_look.z, 0, -_look.x).multiplyScalar(0.12)), 1);
  _target.copy(attacker.group.position);
  _target.y += 1.05;
  reach(modelV, _target, 0);
  reach(modelV, _target, 1);
}

function reach(model: THREE.Object3D, target: THREE.Vector3, side: 0 | 1) {
  const names = ARMS.filter((_, i) => i % 2 === side);
  for (const [a, b, c] of names) {
    const upper = bone(model, a);
    const mid = bone(model, b);
    const end = bone(model, c);
    if (!upper || !mid || !end) continue;
    solveTwo(upper, mid, end, target, model);
    return;
  }
}

function seedDrop(pos: Float32Array, vel: Float32Array, i: number, ox: number, oy: number, oz: number) {
  const x = ox + (Math.random() - 0.5) * 30;
  const y = oy + Math.random() * 12;
  const z = oz + (Math.random() - 0.5) * 30;
  const len = 0.45 + Math.random() * 0.55;
  const o = i * 6;
  pos[o] = x;
  pos[o + 1] = y;
  pos[o + 2] = z;
  pos[o + 3] = x + 0.18;
  pos[o + 4] = y - len;
  pos[o + 5] = z;
  vel[i] = 10 + Math.random() * 8;
}

function groundTex() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#1a212b";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#2a3544";
  g.lineWidth = 2;
  for (let i = 0; i <= 256; i += 64) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 256);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i);
    g.lineTo(256, i);
    g.stroke();
  }
  g.fillStyle = "rgba(90, 120, 150, 0.18)";
  for (let i = 0; i < 7; i++) {
    g.beginPath();
    g.ellipse(30 + ((i * 47) % 220), 20 + ((i * 61) % 210), 18 + (i % 3) * 8, 8 + (i % 2) * 4, 0.4, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

function labelTex(text: string, fill: string) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 96;
  const g = c.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#07080c";
  g.fillRect(0, 0, 256, 96);
  g.strokeStyle = fill;
  g.lineWidth = 8;
  g.strokeRect(6, 6, 244, 84);
  g.fillStyle = fill;
  g.font = "700 54px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 128, 50);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function signTex() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 220;
  const g = c.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#07080c";
  g.fillRect(0, 0, 512, 220);
  g.strokeStyle = "#3ee0c5";
  g.lineWidth = 14;
  g.strokeRect(12, 12, 488, 196);
  g.fillStyle = "#f0b429";
  g.font = "700 78px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("ASHLANE", 256, 118);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
