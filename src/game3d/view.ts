import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { clone as cloneRig } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Body, Box, Sim } from "./sim";
import { HAND_SLOT, PROP_MESH, TARGET_HEIGHT, adoptRig, castMoveset, clipForMoveset, slotFor } from "./rig-pipeline";
import { forgeCar, forgeStreet, poseCar } from "./forge";
import { bakeMotion, loadMotionBank, motionNames, retargetUal, setUal } from "./motion-bank";
// Wired modules (services.ts hub): weather drives sun/fog/rain, boids drive
// bird meshes, streaming ticks the chunk state machine, springbones step
// secondary motion, universal-retarget remaps template clips per model.
import {
  rainIntensity, fogDensity, sunElevation, type WeatherSim,
} from "./federated/weather";
import { updateFlock, type Flock } from "./federated/boids";
import { updateStreaming } from "./federated/streaming";
import { stepSpringBone } from "./federated/springbones";
import { retargetClip, collectRest as collectRestPose } from "./universal-retarget";

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

const critters: THREE.Object3D[] = [];
let swordTpl: THREE.Object3D | null = null;
let spearTpl: THREE.Object3D | null = null;

export function createView(canvas: HTMLCanvasElement) {
  const phone = window.matchMedia("(pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !phone, alpha: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1 : 1.5));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x12161c);
  scene.fog = new THREE.Fog(0x12161c, 18, 78);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 240);
  camera.position.set(8, 14, 16);
  camera.lookAt(0, 1, 0);

  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { uDay: { value: 0.65 } },
    vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform float uDay; varying vec3 vP; void main(){ vec3 d = normalize(vP); float h = d.y; vec3 night = vec3(0.02, 0.025, 0.07); vec3 noon = mix(vec3(0.55, 0.72, 0.9), vec3(0.78, 0.88, 0.98), smoothstep(0.0, 0.55, h)); vec3 dusk = vec3(0.86, 0.42, 0.22); float day = smoothstep(0.08, 0.62, uDay); vec3 col = mix(night, noon, day); float belt = (1.0 - smoothstep(0.18, 0.48, uDay)) * smoothstep(0.02, 0.22, uDay); col = mix(col, dusk, belt * smoothstep(-0.15, 0.25, h)); gl_FragColor = vec4(col, 1.0); }",
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(120, 20, 14), skyMat);
  sky.frustumCulled = false;
  scene.add(sky);
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(180 * 3);
  for (let i = 0; i < 180; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.random() * 0.9 + 0.15;
    const r = 90;
    starPos[i * 3] = Math.cos(th) * Math.sin(ph) * r;
    starPos[i * 3 + 1] = Math.cos(ph) * r;
    starPos[i * 3 + 2] = Math.sin(th) * Math.sin(ph) * r;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xf7f1dd, size: 0.55, sizeAttenuation: false, transparent: true, opacity: 0 }));
  scene.add(stars);
  const clouds: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const cloud = new THREE.Mesh(new THREE.PlaneGeometry(28 + i * 6, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, depthWrite: false, fog: false }));
    cloud.rotation.x = Math.PI / 2;
    cloud.position.set((i - 2) * 18, 46, (i % 2 === 0 ? -10 : 14));
    scene.add(cloud);
    clouds.push(cloud);
  }
  const sunOrb = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff1c4, fog: false }));
  scene.add(sunOrb);
  const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.35, 0.16), new THREE.MeshLambertMaterial({ color: 0x6b3a28 }));
  door.position.set(-12.4, 1.18, -5.5);
  scene.add(door);
  const lamps: THREE.PointLight[] = [];
  const hemi = new THREE.HemisphereLight(0xd5e4f4, 0x2a2428, 1.45);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e4, 1.55);
  sun.position.set(-8, 18, 6);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xe4572e, 0.28);
  rim.position.set(12, 6, -10);
  scene.add(rim);

  const groundMat = new THREE.MeshPhongMaterial({ map: groundTex(), color: 0xffffff, shininess: 22, specular: 0x3d5166 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const texLoader = new THREE.TextureLoader();
  const loadSkin = (file: string, rx: number, ry: number) => {
    const tex = texLoader.load(`/textures/${file}`);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(rx, ry);
    return tex;
  };
  const asphalt = loadSkin("asphalt.jpg", 16, 16);
  const brick = loadSkin("brick.jpg", 2, 2);
  const dockSkin = loadSkin("dock.jpg", 5, 5);
  const pitSkin = loadSkin("pit.jpg", 5, 5);

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
  const slab = (x: number, z: number, w: number, d: number, color: number, y = 0.018) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshPhongMaterial({ color, shininess: 10, specular: 0x223038 }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    scene.add(mesh);
  };
  slab(-37, 0, 22, 26, 0x3a4432);
  slab(-1, 35, 14, 22, 0x243440);
  slab(16, 36, 16, 20, 0x102430, -0.06);
  slab(1, -36, 14, 22, 0x14161a);

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
  loader.setMeshoptDecoder(MeshoptDecoder);
  // Load all three UAL libraries: Godot Standard (base) + UAL1/UAL2 (86 combat clips).
  // UAL1/UAL2 ship on the Quaternius 65-joint rig — retargetUal() handles the mapping.
  const ualLibs = [
    "/motion/ual/AnimationLibrary_Godot_Standard.gltf",
    "/motion/ual/UAL1_Standard.glb",
    "/motion/ual/UAL2_Standard.glb",
  ];
  void Promise.all(ualLibs.map((url) => loader.loadAsync(url).catch(() => null))).then(
    (gltfs) => {
      const valid = gltfs.filter((g): g is NonNullable<typeof g> => g !== null);
      if (valid.length === 0) return;
      const allClips = valid.flatMap((g) => g.animations);
      setUal(valid[0].scene, allClips);
      rigKey = "";
    }
  );
  const castRigs = new Map<string, RigTemplate>();
  const castLoading = new Set<string>();
  function ensureCast(file: string) {
    if (!file || castRigs.has(file) || castLoading.has(file)) return;
    castLoading.add(file);
    loader.loadAsync(`/models/cast/${file}`).then((gltf) => {
      castRigs.set(file, adoptRig(gltf.scene, gltf.animations, castMoveset(file)));
      castLoading.delete(file);
      rigKey = "";
    }).catch(() => {
      castLoading.delete(file);
    });
  }
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
  void Promise.all([
    loadRig("/models/humanoid/Soldier_Male.glb", "soldier", "soldier"),
    loadRig("/models/humanoid/Soldier_Female.glb", "soldierf", "soldierf"),
    loadRig("/models/humanoid/Zombie_Male.glb", "zombie", "zombie"),
    loadRig("/models/humanoid/Zombie_Female.glb", "zombief", "zombief"),
    loadRig("/models/humanoid/mannequin.glb", "mannequin", "mannequin"),
  ]).then(() => {
    void loadRig("/models/kaykit/Knight.glb", "knight", "knight");
    void loadRig("/models/kaykit/Rogue.glb", "rogue", "runner");
    void loadRig("/models/kaykit/Barbarian.glb", "brute", "brute");
    void loadRig("/models/kaykit/Rogue_Hooded.glb", "hood", "hood");
    void loadRig("/models/kaykit/Mage.glb", "hex", "hex");
    void loadRig("/models/humanoid/drifter.glb", "drifter", "drifter");
    void loadRig("/models/kaykit/Skeleton_Warrior.glb", "skel", "skeleton");
    void loadRig("/models/kaykit/Skeleton_Rogue.glb", "bones", "bones");
    void loadRig("/models/kaykit/Skeleton_Mage.glb", "skull", "skull");
    void loadRig("/models/kaykit/Skeleton_Minion.glb", "minion", "minion");
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
  // Wired: boids.ts bird flock — simple two-triangle birds driven by the
  // flock sim in services. Positions update in render().
  const birdGeo = new THREE.BufferGeometry();
  birdGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([
    -0.5, 0, 0, 0, 0.12, 0.18, 0, 0, -0.18,
    0.5, 0, 0, 0, 0, -0.18, 0, 0.12, 0.18,
  ]), 3));
  const birdMat = new THREE.MeshBasicMaterial({ color: 0x1c2126, side: THREE.DoubleSide });
  const birdMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(birdGeo, birdMat);
    m.frustumCulled = false;
    scene.add(m);
    birdMeshes.push(m);
  }
  // Wired: pedestrians.ts crowd — cheap capsule peds synced from the sim.
  const pedGeo = new THREE.CapsuleGeometry(0.28, 0.9, 3, 8);
  const pedMats = [0x8a7a6a, 0x5c6b73, 0x6e4a3a, 0x3a465c, 0x777788].map(
    (c) => new THREE.MeshLambertMaterial({ color: c }),
  );
  const pedMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 40; i++) {
    const m = new THREE.Mesh(pedGeo, pedMats[i % pedMats.length]);
    m.visible = false;
    m.frustumCulled = false;
    scene.add(m);
    pedMeshes.push(m);
  }
  let idle = 0.4;
  let built = false;

  const curb = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.045, 5, 48),
    new THREE.MeshBasicMaterial({ color: 0x14181c }),
  );
  curb.rotation.x = Math.PI / 2;
  curb.position.y = 0.04;
  curb.visible = false;
  scene.add(curb);

  let stageId = "";
  function applyStage(id: string) {
    if (id === stageId) return;
    stageId = id;
    const look =
      id === "dock"
        ? { fog: 0x163044, sky: 0xb7d4ea, near: 16, far: 70 }
        : id === "pit"
          ? { fog: 0x6a3a28, sky: 0xf2c09a, near: 14, far: 62 }
          : id === "high"
          ? { fog: 0x8ea4be, sky: 0xf7fbff, near: 24, far: 96 }
          : id === "yard"
            ? { fog: 0x3d5230, sky: 0xd7efb0, near: 18, far: 80 }
            : id === "under"
              ? { fog: 0x1a2830, sky: 0x7f96a4, near: 12, far: 52 }
              : { fog: 0x243044, sky: 0xd7e6f8, near: 22, far: 90 };
    scene.background = new THREE.Color(look.fog);
    scene.fog = new THREE.Fog(look.fog, look.near, look.far);
    hemi.color.setHex(look.sky);
    hemi.intensity = 1.45;
    sun.intensity = id === "under" ? 1.15 : 1.55;
    const floor = id === "dock" ? dockSkin : id === "pit" ? pitSkin : asphalt;
    groundMat.map = floor;
    groundMat.color.setHex(0xffffff);
    groundMat.needsUpdate = true;
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
    for (const model of forgeStreet({ asphalt, brick, dock: dockSkin, pit: pitSkin })) scene.add(model);
    const train = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 12), new THREE.MeshLambertMaterial({ color: 0xc5ced6 }));
    train.position.set(0, 1.2, -90);
    scene.add(train);
    train.name = "train";
    const city: [string, number, number, number, number][] = [
      ["low-detail-building-a.glb", 78, -8, 7, 0.4],
      ["low-detail-building-b.glb", 78, 52, 8, -0.6],
      ["low-detail-building-c.glb", -78, 22, 7, 1.2],
      ["low-detail-building-wide-a.glb", -78, -28, 6, 0.2],
      ["building-a.glb", 24, 76, 9, 0],
      ["building-skyscraper-a.glb", -28, -76, 16, 0.3],
    ];
    for (const [file, x, z, height, yaw] of city) plantBuilding(sim, file, x, z, height, yaw);
    const dress: [string, number, number, number, boolean][] = [
      ["/models/kenney/nature/grass.glb", -40, 6, 0.55, false],
      ["/models/kenney/nature/grass_large.glb", -36, -4, 0.7, false],
      ["/models/kenney/nature/grass.glb", 12, 38, 0.55, false],
      ["/models/kenney/nature/flower_redA.glb", -38, 4, 0.4, false],
      ["/models/kenney/nature/plant_bush.glb", -42, -2, 0.85, false],
      ["/models/kenney/nature/tree_oak.glb", -44, 12, 4.2, true],
      ["/models/kenney/nature/tree_default.glb", 16, 40, 3.4, true],
      ["/models/kenney/nature/rock_largeA.glb", -46, -8, 0.8, true],
      ["/models/kenney/nature/fence_simple.glb", 18, 36, 1.15, true],
      ["/models/kenney/pets/animal-dog.glb", -40, -6, 0.7, false],
      ["/models/kenney/pets/animal-cat.glb", 40, -16, 0.42, false],
    ];
    for (const [url, x, z, height, solid] of dress) dropPiece(sim, url, x, z, height, solid);
    void loader.loadAsync("/models/kenney/arms/weapon-sword.glb").then((gltf) => {
      swordTpl = gltf.scene;
      propKey = "";
    });
    void loader.loadAsync("/models/kenney/arms/weapon-spear.glb").then((gltf) => {
      spearTpl = gltf.scene;
      propKey = "";
    });
    void loader.loadAsync("/models/gen/cart.glb").then((gltf) => {
      const mesh = gltf.scene;
      const steel = document.createElement("canvas");
      steel.width = 128;
      steel.height = 128;
      const paint = steel.getContext("2d");
      if (paint) {
        paint.fillStyle = "#8d969e";
        paint.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 500; i++) {
          paint.fillStyle = i % 17 === 0 ? "#7a3e2a" : i % 2 === 0 ? "#d5dde2" : "#6a737a";
          paint.fillRect(Math.random() * 128, Math.random() * 128, 2, 1);
        }
      }
      const map = new THREE.CanvasTexture(steel);
      map.colorSpace = THREE.SRGBColorSpace;
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(4, 4);
      mesh.traverse((obj) => {
        const part = obj as THREE.Mesh;
        if (!part.isMesh) return;
        const geo = part.geometry;
        geo.computeVertexNormals();
        const pos = geo.getAttribute("position");
        geo.computeBoundingBox();
        const bb = geo.boundingBox;
        if (pos && bb) {
          const uv = new Float32Array(pos.count * 2);
          const sx = bb.max.x - bb.min.x || 1;
          const sy = bb.max.y - bb.min.y || 1;
          for (let i = 0; i < pos.count; i++) {
            uv[i * 2] = (pos.getX(i) - bb.min.x) / sx;
            uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) / sy;
          }
          geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
        }
        part.material = new THREE.MeshStandardMaterial({ map, color: 0xd7dee4, metalness: 0.72, roughness: 0.42 });
      });
      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const span = Math.max(size.x, size.y, size.z) || 1;
      mesh.scale.setScalar(1.15 / span);
      mesh.position.set(38, 0, -20);
      const grounded = new THREE.Box3().setFromObject(mesh);
      mesh.position.y -= grounded.min.y;
      scene.add(mesh);
    });
  }

  function soften(mesh: THREE.Object3D) {
    mesh.traverse((obj) => {
      const part = obj as THREE.Mesh;
      if (!part.isMesh) return;
      const mat = part.material as THREE.MeshStandardMaterial;
      if (mat && "metalness" in mat) mat.metalness = 0;
    });
  }

  function dropPiece(sim: Sim, url: string, x: number, z: number, height: number, solid: boolean) {
    void loader.loadAsync(url).then((gltf) => {
      const mesh = gltf.scene;
      soften(mesh);
      const raw = new THREE.Box3().setFromObject(mesh);
      const size = raw.getSize(new THREE.Vector3());
      mesh.scale.setScalar(height / (size.y || 1));
      mesh.position.set(x, 0, z);
      const grounded = new THREE.Box3().setFromObject(mesh);
      mesh.position.y -= grounded.min.y;
      scene.add(mesh);
      if (url.includes("animal")) critters.push(mesh);
      if (!solid) return;
      const placed = new THREE.Box3().setFromObject(mesh);
      sim.boxes.push({
        minX: placed.min.x + 0.2,
        maxX: placed.max.x - 0.2,
        minY: 0,
        maxY: Math.max(0.8, placed.max.y * 0.7),
        minZ: placed.min.z + 0.2,
        maxZ: placed.max.z - 0.2,
        kind: "wall",
        hp: 0,
        role: "",
      });
    });
  }

  function plantBuilding(sim: Sim, file: string, x: number, z: number, height: number, yaw: number) {
    void loader.loadAsync(`/models/kenney/${file}`).then((gltf) => {
      const mesh = gltf.scene;
      mesh.rotation.y = yaw;
      const raw = new THREE.Box3().setFromObject(mesh);
      const size = raw.getSize(new THREE.Vector3());
      const span = size.y || 1;
      mesh.scale.setScalar(height / span);
      mesh.position.set(x, 0, z);
      const grounded = new THREE.Box3().setFromObject(mesh);
      mesh.position.y -= grounded.min.y;
      const placed = new THREE.Box3().setFromObject(mesh);
      scene.add(mesh);
      sim.boxes.push({
        minX: placed.min.x + 0.35,
        maxX: placed.max.x - 0.35,
        minY: 0,
        maxY: Math.max(2.2, placed.max.y - 0.2),
        minZ: placed.min.z + 0.35,
        maxZ: placed.max.z - 0.35,
        kind: "wall",
        hp: 0,
        role: "",
      });
    });
  }

  function buildBox(box: Box) {
    const midX = (box.minX + box.maxX) / 2;
    const midZ = (box.minZ + box.maxZ) / 2;
    if (box.kind === "rope") {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(box.maxX - box.minX, box.maxY, box.maxZ - box.minZ),
        new THREE.MeshLambertMaterial({ color: 0xc23b2e }),
      );
      mesh.position.set(midX, box.maxY / 2, midZ);
      scene.add(mesh);
      return mesh;
    }
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
    const plaza = box.maxX > -28 && box.minX < 26 && box.maxZ > -28 && box.minZ < 26;
    const pick = Math.abs(Math.round(midX * 3 + midZ * 7)) % 4;
    const skin = box.kind === "wall" && !plaza && h > 2 ? (pick === 1 ? brick : pick === 2 ? dockSkin : pick === 3 ? asphalt : null) : null;
    const mat = new THREE.MeshLambertMaterial({
      color: skin ? 0xffffff : color,
      map: skin,
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
      lamps.push(light);
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
        const pieces = ["barrel_small", "barrel_large", "box_small", "box_large", "pillar", "barrier", "stool", "torch_mounted", "column", "table_small"];
        const spots: [number, number][] = [
          [-40, 1], [-36, -7], [-33, 6], [-44, -3], [-30, -4], [-42, 8], [-38, 4],
          [-4, 30], [1, 33], [-2, 39], [3, 36], [0, 42],
          [-3, -31], [1, -35], [2, -41], [-1, -44], [3, -38],
          [11, -17.5], [-9, -17.2], [5, 9], [-1, 11], [20, -17],
        ];
        let seed = 20261004;
        const roll = () => {
          seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
          return seed / 4294967296;
        };
        for (const [x, z] of spots) {
          drop(pieces[Math.floor(roll() * pieces.length)], x + (roll() - 0.5) * 0.5, z + (roll() - 0.5) * 0.5, roll() * 6.28);
        }
        scene.add(root);
        for (const mesh of boxMeshes) if (mesh.userData.shell) mesh.visible = false;
        propKey = "";
      })
      .catch(() => {
        kit = null;
      });
  }

  function people(): RigTemplate[] {
    return [soldier, soldierf, drifter, knight, rogue, hood, brute, hex].filter((rig): rig is RigTemplate => rig !== null);
  }

  function mixed(): RigTemplate[] {
    const extra = [skel, bones, skull, minion, zombie, zombief, mannequin].filter((rig): rig is RigTemplate => rig !== null);
    return [...people(), ...extra];
  }

  function rigFor(b: Body, sim: Sim): RigTemplate | null {
    const humans = people();
    const all = sim.crowd === "chibi" ? [knight, rogue, hood, brute, hex, skel, bones, skull, minion].filter((rig): rig is RigTemplate => rig !== null) : mixed();
    if (!humans.length && !all.length && !knight) return null;
    if (b.kind === "player") {
      if (sim.cast && castRigs.has(sim.cast)) return castRigs.get(sim.cast) ?? null;
      if (sim.style === "soldier") return soldier ?? humans[0] ?? knight;
      if (sim.style === "soldierf") return soldierf ?? humans[0] ?? knight;
      if (sim.style === "zombie") return zombie ?? humans[0] ?? knight;
      if (sim.style === "zombief") return zombief ?? humans[0] ?? knight;
      if (sim.style === "mannequin") return mannequin ?? humans[0] ?? knight;
      if (sim.style === "drifter") return drifter ?? humans[0] ?? knight;
      if (sim.style === "runner" || sim.style === "ash") return sim.build === "chibi" ? rogue ?? knight : soldierf ?? rogue ?? humans[0] ?? knight;
      if (sim.style === "brute" || sim.style === "pit") return sim.build === "chibi" ? brute ?? knight : soldier ?? brute ?? humans[0] ?? knight;
      if (sim.style === "hood") return sim.build === "chibi" ? hood ?? knight : soldierf ?? hood ?? knight;
      if (sim.style === "hex") return sim.build === "chibi" ? hex ?? knight : soldier ?? hex ?? knight;
      if (sim.style === "skeleton") return skel ?? knight;
      if (sim.style === "bones") return bones ?? knight;
      if (sim.style === "skull") return skull ?? knight;
      if (sim.style === "minion") return minion ?? knight;
      if (sim.build === "chibi") return knight;
      return soldier ?? soldierf ?? drifter ?? humans[0] ?? knight;
    }
    if (b.kind === "ally") return soldierf ?? hood ?? rogue ?? knight;
    const pool = sim.crowd === "full" ? humans : all;
    if (pool.length) return pool[b.id % pool.length];
    return knight;
  }

  function syncFighters(sim: Sim) {
    if (sim.cast) ensureCast(sim.cast);
    const key = `${sim.cast}|${castRigs.has(sim.cast) ? 1 : 0}|${sim.style}|${sim.build}|${sim.crowd}|${sim.height}|${sim.bulk}|${sim.head}|${sim.leg}|${sim.shoulder}|${sim.bodies.map((b) => b.id).join(",")}|${knight ? 1 : 0}${rogue ? 1 : 0}${brute ? 1 : 0}${hood ? 1 : 0}${hex ? 1 : 0}${drifter ? 1 : 0}${skel ? 1 : 0}${bones ? 1 : 0}${mannequin ? 1 : 0}${skull ? 1 : 0}${minion ? 1 : 0}${soldier ? 1 : 0}${soldierf ? 1 : 0}${zombie ? 1 : 0}${zombief ? 1 : 0}`;
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
      const cast = b.kind === "player" && rig?.moveset.startsWith("cast:");
      const native = !!rig && (rig.moveset === "soldier" || rig.moveset === "soldierf" || rig.moveset === "zombie" || rig.moveset === "zombief" || rig.moveset === "drifter" || rig.moveset === "mannequin");
      const made = rig ? makeRig(rig, b.kind === "player" ? 0xf0b429 : 0xe4572e, cast ? rig.moveset : b.kind === "player" && !native ? "player" : rig.moveset, b.kind === "player" && !native && !cast ? DYE[sim.style] ?? 0 : 0, b.kind === "player" ? sim.height : 1, b.kind === "player" ? sim.bulk : 1, b.kind === "player" ? sim.head : 1, b.kind === "player" ? sim.leg : 1, b.kind === "player" ? sim.shoulder : 1) : makeFighter(shared, b.kind === "player" ? PAL[0] : PAL[(b.id % (PAL.length - 1)) + 1]);
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
        } else if (prop.kind === "chair") {
          mesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.46), new THREE.MeshLambertMaterial({ color: 0x8a5a32 }));
        } else if (prop.kind === "table") {
          mesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.7, 0.7), new THREE.MeshLambertMaterial({ color: 0x6a4328 }));
        } else if (prop.kind === "board") {
          mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.28), new THREE.MeshLambertMaterial({ color: 0xa56b3c }));
        } else if (prop.kind === "car") {
          mesh = forgeCar();
        } else if (prop.kind === "blade" && swordTpl) {
          mesh = swordTpl.clone(true);
          mesh.scale.setScalar(0.55);
        } else if (prop.kind === "spear" && spearTpl) {
          mesh = spearTpl.clone(true);
          mesh.scale.setScalar(0.7);
        } else if (prop.kind === "blade") {
          mesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.7), new THREE.MeshLambertMaterial({ color: 0xd7dee4 }));
        } else if (prop.kind === "spear") {
          mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 5), new THREE.MeshLambertMaterial({ color: 0x8a5a32 }));
        } else if (src) mesh = src.clone(true);
        else mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), new THREE.MeshLambertMaterial({ color: 0x6a5438 }));
        scene.add(mesh);
        propViews.push(mesh);
      }
    }
    sim.props.forEach((prop, i) => {
      const mesh = propViews[i];
      if (!mesh) return;
      mesh.visible = prop.kind === "car" || prop.alive;
      mesh.position.set(prop.x, prop.y + (prop.kind === "pipe" || prop.kind === "spear" || prop.kind === "blade" ? 0.2 : 0), prop.z);
      if (prop.kind === "car") poseCar(mesh as THREE.Group, prop.crush);
    });
  }

  function render(sim: Sim, dt: number) {
    const p = sim.bodies[0];
    applyStage(sim.story ? sim.stage : p && p.x < -26 ? "yard" : p && p.z > 26 ? "dock" : p && p.z < -26 ? "under" : sim.stage);
    const day = (Math.sin(sim.time * 0.045) + 1) / 2;
    skyMat.uniforms.uDay.value = day;
    sky.position.copy(camera.position);
    stars.position.copy(camera.position);
    (stars.material as THREE.PointsMaterial).opacity = Math.max(0, 0.9 - day * 1.6);
    sun.position.set(Math.cos(sim.time * 0.045) * 40, -8 + day * 46, Math.sin(sim.time * 0.045) * 18);
    sun.intensity = 0.35 + day * 1.25;
    sun.color.setHex(day < 0.35 ? 0xffb07a : 0xfff4e4);
    hemi.intensity = 0.72 + day * 0.75;
    sunOrb.position.copy(sun.position);
    sunOrb.visible = day > 0.08;
    for (let i = 0; i < clouds.length; i++) {
      clouds[i].position.x += dt * (1.2 + i * 0.3);
      if (clouds[i].position.x > 70) clouds[i].position.x = -70;
      (clouds[i].material as THREE.MeshBasicMaterial).opacity = 0.12 + day * 0.22;
    }
    for (const lamp of lamps) lamp.intensity = 0.45 + (1 - day) * 1.35;
    door.position.x = -12.4 - sim.door * 1.7;
    const train = scene.getObjectByName("train");
    if (train) {
      const cycle = sim.time % 8;
      train.visible = cycle < 1.3;
      train.position.z = -80 + (cycle / 1.2) * 26;
    }
    for (const critter of critters) {
      const homeX = critter.userData.ox as number | undefined;
      if (homeX === undefined) {
        critter.userData.ox = critter.position.x;
        critter.userData.oz = critter.position.z;
      }
      critter.position.x = (critter.userData.ox as number) + Math.sin(sim.time * 0.6 + critter.position.z) * 0.8;
      critter.rotation.y = Math.sin(sim.time * 0.6) > 0 ? 0.4 : -2.4;
    }
    if (sim.story && sim.venueR > 1) {
      curb.visible = true;
      curb.position.x = sim.venueX;
      curb.position.z = sim.venueZ;
      curb.scale.set(sim.venueR, sim.venueR, 1);
    } else curb.visible = false;
    ring.visible = false;
    ensureWorld(sim);
    syncFighters(sim);
    syncProps(sim);
    for (let i = 0; i < sim.boxes.length; i++) {
      const box = sim.boxes[i];
      const mesh = boxMeshes[i];
      if (!mesh) continue;
      if (box.kind === "open") mesh.visible = false;
      else if (box.kind === "gate") mesh.visible = !sim.streetClear;
      else mesh.visible = true;
      if (box.hp > 0 && box.kind !== "open") {
        const mat = (mesh as THREE.Mesh).material as THREE.MeshLambertMaterial | undefined;
        if (mat && mat.color) mat.color.setHex(box.role === "cage" ? 0x9aa7b2 : box.role === "door" ? 0x8a5a32 : 0x6d5344);
      }
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
    // ---- Wired services: weather / boids / streaming / springbones ----
    // (services.ts hub; skipped entirely when mount() hasn't attached it.)
    const svcs = sim.services;
    if (svcs) {
      const w: WeatherSim = svcs.weather;
      // Rain follows the weather sim (drizzle -> storm); dry weather hides it.
      const rainI = rainIntensity(w);
      rain.step(sim.reduced || rainI <= 0 ? 0 : dt * beat, camera);
      // Fog density from weather; lightning flashes during storms.
      const fog = scene.fog as THREE.Fog | null;
      if (fog) {
        const d = fogDensity(w);
        fog.near = 24 - d * 14;
        fog.far = 90 - d * 55;
      }
      if (w.lightning > 0.02) {
        sun.intensity += w.lightning * 3;
        hemi.intensity += w.lightning * 1.5;
      }
      // Boids: drift the flock (already ticked in sim), place bird meshes.
      const birds = svcs.flock.birds;
      for (let i = 0; i < birdMeshes.length; i++) {
        const b = birds[i % birds.length];
        const m = birdMeshes[i];
        m.position.set(b.x, b.y, b.z);
        m.rotation.y = Math.atan2(b.vx, b.vz);
        m.visible = !sim.reduced;
      }
      // Streaming: district chunk state machine follows the player.
      if (p) updateStreaming(svcs.stream, p.x, p.z);
      // Pedestrians: sync cheap capsule peds from the sim crowd.
      {
        const peds = svcs.peds.peds;
        for (let i = 0; i < pedMeshes.length; i++) {
          const m = pedMeshes[i];
          const ped = peds[i];
          if (!ped || sim.reduced) {
            m.visible = false;
            continue;
          }
          m.visible = true;
          m.position.set(ped.x, 0.75, ped.z);
          m.rotation.y = Math.atan2(ped.vx, ped.vz);
          // Panic reads as a hop; cower crouches.
          const hop = ped.state === "panic" ? Math.abs(Math.sin(sim.time * 9 + ped.id)) * 0.25 : 0;
          m.position.y = 0.75 + hop;
          m.scale.y = ped.state === "cower" ? 0.7 : 1;
        }
      }
      // Spring bones: hair/cloth secondary motion per fighter.
      for (const chains of svcs.springs.values()) {
        for (const chain of chains) {
          for (const bone of chain.bones) stepSpringBone(bone, dt, 0, 0, 0);
        }
      }
    } else {
      rain.step(sim.reduced ? 0 : dt * beat, camera);
    }
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
  if (b.kind !== "player" && Math.hypot(b.x - camera.position.x, b.z - camera.position.z) > 26) {
    f.group.visible = false;
    f.bar.visible = false;
    return;
  }
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
    if (action && sim.pairAtk >= 0 && (b.id === sim.pairAtk || b.id === sim.pairVic) && sim.pairT > 0) {
      const len = sim.pairLen > 0 ? sim.pairLen : action.getClip().duration;
      action.timeScale = 1;
      action.time = Math.max(0, Math.min(action.getClip().duration - 0.001, len - sim.pairT));
    }
    if (b.kind === "player" && b.alive && b.grounded && b.state === "free") settleFeet(f);
    if (f.gear) {
      const want = b.alive && (b.weapon === "blade" || b.weapon === "spear") ? b.weapon : "";
      const src = want === "blade" ? swordTpl : want === "spear" ? spearTpl : null;
      if (f.gear.userData.held !== want) {
        const old = f.gear.getObjectByName("held");
        if (old) f.gear.remove(old);
        f.gear.userData.held = want;
        if (src) {
          const held = src.clone(true);
          held.name = "held";
          held.scale.setScalar(want === "spear" ? 0.45 : 0.35);
          held.rotation.x = Math.PI / 2;
          f.gear.add(held);
        }
      }
      const held = f.gear.getObjectByName("held");
      if (held) held.visible = !!want;
      f.gear.visible = b.alive && b.weapon !== "fist";
      const mat = f.gear.material as THREE.MeshLambertMaterial;
      if (!want) mat.color.setHex(b.weapon === "bottle" ? 0x69c3c2 : b.weapon === "board" ? 0xa56b3c : 0xb7c0c8);
      mat.opacity = want ? 0 : 1;
      mat.transparent = !!want;
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
    if (obj.name !== "foot.l" && obj.name !== "foot.r" && obj.name !== "FootL" && obj.name !== "FootR" && obj.name !== "LeftFoot" && obj.name !== "RightFoot" && obj.name !== "mixamorigLeftFoot" && obj.name !== "mixamorigRightFoot") return;
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
  const full = template.moveset.startsWith("cast:") || template.moveset === "soldier" || template.moveset === "soldierf" || template.moveset === "zombie" || template.moveset === "zombief" || template.moveset === "mannequin" || template.moveset === "drifter";
  const tall = Math.max(0.01, bounds.max.y - bounds.min.y);
  const scale = (full ? 1.92 : 1.5) / tall;
  const yScale = scale * heightMul * (0.9 + leg * 0.1);
  const xz = scale * bulk * (0.9 + shoulder * 0.1);
  model.scale.set(xz, yScale, xz);
  model.position.y = -bounds.min.y * yScale;
  if (template.moveset.startsWith("cast:")) model.rotation.y = -Math.PI / 2;
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
  if (template.moveset.startsWith("cast:")) {
    for (const clip of retargetUal(model)) {
      actions[clip.name] = mixer.clipAction(clip);
    }
  }
  // Universal retargeter: remap any template clip whose bone names don't
  // match this model, so one animation bank plays on every rig without
  // per-model retargeting. Additive — never replaces a loaded clip.
  {
    const srcRest = collectRestPose(template.scene);
    for (const clip of template.animations) {
      if (clip.name in actions) continue;
      const mapped = retargetClip(clip, srcRest.quats, srcRest.names, model);
      if (mapped) actions[clip.name] = mixer.clipAction(mapped);
    }
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
  next.fadeIn(0).play();
  if (prev && prev !== next) {
    if (name.endsWith(":vic") || motionNames().has(name)) prev.stop();
    else prev.fadeOut(0.08);
  }
  f.clip = resolved;
}

function firstClip(actions: Record<string, THREE.AnimationAction>, names: string[]) {
  for (const name of names) if (name in actions) return name;
  return "";
}

function resolveClip(f: Fighter, b: Body, sim: Sim): { name: string; loop: boolean } {
  if (sim.pair && sim.pairAtk >= 0) {
    const vic = `${sim.pair}:vic`;
    if (b.id === sim.pairVic && vic in f.actions) return { name: vic, loop: false };
    if (b.id === sim.pairAtk && sim.pair in f.actions) return { name: sim.pair, loop: false };
    if (b.id === sim.pairAtk || b.id === sim.pairVic) {
      const asked = slotFor(b);
      return { name: clipForMoveset(f.moveset, asked.slot, (clip) => clip in f.actions), loop: false };
    }
  }
  if (sim.pair && sim.pair !== "mount" && sim.pairAtk < 0) {
    const vic = `${sim.pair}:vic`;
    if (b.kind !== "player" && b.state === "grab" && vic in f.actions) return { name: vic, loop: false };
    if (b.kind === "player" && (b.throwT > 0 || b.state === "grab") && sim.pair in f.actions) return { name: sim.pair, loop: false };
  }
  if (sim.grabId === b.id && b.state === "grab" && sim.pairT <= 0) {
    const hold = sim.rearLock
      ? firstClip(f.actions, ["hitback", "Hit_Chest", "defender"])
      : firstClip(f.actions, ["defender", "Punch_Enter", "Interact", "boxidle"]);
    if (hold) return { name: hold, loop: true };
  }
  if (b.state === "grab" && b.kind !== "player") {
    const held = firstClip(f.actions, ["Hit_Chest", "defender", "hitbody", "Idle_Loop"]);
    if (held) return { name: held, loop: true };
  }
  if (b.kind === "player" && b.state === "free" && b.grounded) {
    if (sim.guard) {
      const pose = sim.lowGuard
        ? firstClip(f.actions, ["guardlow", "Crouch_Idle_Loop", "stancecrouch"])
        : firstClip(f.actions, ["guardhigh", "block", "defender"]);
      if (pose) return { name: pose, loop: true };
    }
  }
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
  const n = window.matchMedia("(pointer: coarse)").matches ? 140 : 280;
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
