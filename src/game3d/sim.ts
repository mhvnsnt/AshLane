import { clampTune, SPEC, type Hud, type Mode, type Tune } from "./spec";
import { phaseCopy, resolvePhase } from "./parallel";
import { jobNow } from "./jobs";
import { missionAt, saveCleared, MISSIONS } from "./campaign";
import { motionDur, motionReady } from "./motion-bank";
import { resetYoko, tickYokosukaBelt } from "./yokosuka/belt";

export type Phase = "free" | "atk" | "hit" | "launch" | "down" | "grab" | "throw" | "dash" | "spin" | "windup" | "out";
export type Home = "plaza" | "street" | "scaffold" | "market";
export type Arch = "brawler" | "runner" | "brute" | "hood" | "hex";
export type Weapon = "fist" | "pipe" | "bottle";

export type Body = {
  id: number;
  kind: "player" | "grunt" | "ally";
  name: string;
  home: Home;
  arch: Arch;
  homeX: number;
  homeZ: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  hp: number;
  maxHp: number;
  poise: number;
  meter: number;
  state: Phase;
  stateT: number;
  swing: number;
  swung: boolean;
  queued: boolean;
  comboWindow: number;
  cd: number;
  iframe: number;
  grounded: boolean;
  alive: boolean;
  slam: boolean;
  facingLeft: boolean;
  yState: string;
  yFrame: number;
  yHealth: number;
  weapon: Weapon;
  wpn: number;
  throwT: number;
  pickupT: number;
  wearT: number;
  low: boolean;
  air: number;
  splat: number;
  tech: number;
  head: number;
  chest: number;
  legs: number;
  wake: number;
};

export type BoxKind = "wall" | "plat" | "spring" | "goal" | "gate";

export type Box = {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  kind: BoxKind;
};

export type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  max: number;
  color: number;
};

export type Prop = {
  id: number;
  kind: "crate" | "pipe" | "bottle";
  x: number;
  y: number;
  z: number;
  hp: number;
  alive: boolean;
  loot: "pipe" | "bottle" | "";
};

export type Sim = {
  mode: Mode;
  running: boolean;
  paused: boolean;
  tune: Tune;
  bodies: Body[];
  props: Prop[];
  boxes: Box[];
  particles: Particle[];
  camYaw: number;
  orbit: number;
  hitstop: number;
  shake: number;
  time: number;
  banner: string;
  bannerT: number;
  sfx: string[];
  cleared: boolean;
  streetClear: boolean;
  scaffoldClear: boolean;
  plazaClear: boolean;
  marketClear: boolean;
  style: string;
  martial: string;
  stance: string;
  stage: string;
  bout: string;
  flow: number;
  pair: string;
  pairT: number;
  pairVx: number;
  pairVy: number;
  pairVz: number;
  pairDmg: number;
  story: boolean;
  mission: number;
  wave: number;
  waveMax: number;
  missionClear: boolean;
  clearedMission: number;
  leaseSpawned: boolean;
  bufAtk: number;
  bufGrab: number;
  bufBlast: number;
  bufJump: number;
  prevAtk: boolean;
  prevGrab: boolean;
  prevBlast: boolean;
  prevJump: boolean;
  prevDash: boolean;
  prevUse: boolean;
  bufUse: number;
  reduced: boolean;
  spawnX: number;
  spawnY: number;
  spawnZ: number;
  spawnYaw: number;
  nextId: number;
  grabId: number;
  coyote: number;
  springLock: number;
  canGrab: boolean;
  combo: number;
  comboT: number;
  spinPulse: number;
  aimX: number;
  aimZ: number;
  foes: number;
  yokoClock: number;
  pulse: { x: number; z: number; r: number } | null;
  landed: boolean;
  sawHouse: boolean;
  sawMarket: boolean;
  scuffle: Home | "";
  clearT: number;
  phase: string;
  phaseStep: string;
  stickY: number;
  stickX: number;
  guard: boolean;
  build: "chibi" | "full";
  crowd: "mix" | "chibi" | "full";
  height: number;
  bulk: number;
  head: number;
  leg: number;
  shoulder: number;
  block: number;
};

export type FrameInput = {
  x: number;
  y: number;
  attack: boolean;
  grab: boolean;
  blast: boolean;
  jump: boolean;
  dash: boolean;
  use: boolean;
};

const R = 0.42;
const NAMES = ["Cinder", "Bolt", "Rook", "Moth", "Vesper", "Kiln", "Ashen", "Piton"];

export function forward(yaw: number) {
  return { x: -Math.sin(yaw), z: -Math.cos(yaw) };
}

export function yawFromDir(x: number, z: number) {
  return Math.atan2(-x, -z);
}

function approachAngle(cur: number, target: number, rate: number, dt: number) {
  const d = Math.atan2(Math.sin(target - cur), Math.cos(target - cur));
  return cur + d * (1 - Math.exp(-rate * dt));
}

function box(minX: number, maxX: number, minZ: number, maxZ: number, h: number, kind: BoxKind): Box {
  return { minX, maxX, minY: 0, maxY: h, minZ, maxZ, kind };
}

function buildBoxes(): Box[] {
  return [
    box(-26, 48, -26, -24, 3, "wall"),
    box(-26, 26, 24, 26, 3, "wall"),
    box(-26, -24, -26, 26, 3, "wall"),
    box(24, 26, -14.4, 24, 3, "wall"),
    box(16.4, 48, -14.9, -14.2, 2.4, "wall"),
    box(46, 48, -26, -14.2, 3, "wall"),
    box(-18, -13.5, -5.8, -5, 5.2, "wall"),
    box(-11.3, -7, -5.8, -5, 5.2, "wall"),
    box(-18, -7, -13, -12.2, 5.2, "wall"),
    box(-18, -17.2, -13, -5, 5.2, "wall"),
    box(-7.8, -7, -13, -5, 5.2, "wall"),
    box(7, 18, -13, -5, 6.4, "wall"),
    box(-18, -7, 5, 13, 5.6, "wall"),
    box(7, 18, 5, 13, 4.8, "wall"),
    box(4.2, 6.2, -6.2, -4.4, 1.15, "wall"),
    box(3.2, 5.1, 1.2, 3.2, 1.35, "wall"),
    box(14.2, 15.15, -23.4, -14.9, 2.8, "gate"),
    box(-22, -16.6, 16.7, 17.7, 2.15, "wall"),
    box(-13.6, 18, 16.7, 17.7, 2.15, "wall"),
    box(-22, 16.4, 21.9, 22.9, 2.4, "wall"),
    box(16.2, 17.3, 17.2, 22.4, 2.5, "wall"),
    box(-18, -14, 18.7, 21.3, 1.15, "plat"),
    box(-10.6, -6.2, 18.7, 21.3, 2.4, "plat"),
    box(-3, 1.4, 18.7, 21.3, 1.25, "plat"),
    box(4.6, 10.4, 18.7, 21.3, 2.55, "plat"),
    box(-13.5, -11.1, 19.2, 20.8, 0.2, "spring"),
    box(-5.7, -3.5, 19.2, 20.8, 0.2, "spring"),
    box(1.9, 4.1, 19.2, 20.8, 0.2, "spring"),
    box(12.2, 15.4, 19, 21, 2.2, "goal"),
    box(-16.7, -15.7, -6.7, -5.7, 1.15, "wall"),
    box(15.9, 16.9, -7, -5.8, 1.25, "wall"),
    box(16.8, 17.6, -16.7, -15.7, 2.2, "wall"),
    box(16.8, 17.6, -22.9, -21.9, 2.2, "wall"),
    box(22, 22.8, -22.7, -21.7, 1.1, "wall"),
    box(29.4, 30.6, -22.7, -21.7, 0.9, "wall"),
    box(34, 35, -16.9, -15.9, 1.25, "wall"),
    box(40.6, 41.4, -22.5, -21.5, 0.9, "wall"),
    box(25.4, 26.6, -17.1, -16.1, 1.05, "wall"),
    box(28, 29, -16.6, -15.8, 1.05, "wall"),
    box(36.5, 37.5, -22.8, -22, 1.05, "wall"),
    box(-4.4, -3.6, 7.6, 8.4, 2.4, "wall"),
    box(-15.1, -14.1, -7.9, -6.9, 0.7, "wall"),
  ];
}

function blankBody(sim: Sim, partial: Pick<Body, "kind" | "x" | "z"> & Partial<Body>): Body {
  const grunt = partial.kind === "grunt";
  return {
    id: sim.nextId++,
    name: grunt ? NAMES[sim.nextId % NAMES.length] : "Ash",
    home: "plaza",
    arch: "brawler",
    homeX: partial.x,
    homeZ: partial.z,
    y: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    yaw: 0,
    hp: grunt ? 64 : 100,
    maxHp: grunt ? 64 : 100,
    poise: grunt ? SPEC.poiseGrunt : SPEC.poisePlayer,
    meter: grunt ? 0 : 100,
    state: "free",
    stateT: 0,
    swing: 0,
    swung: false,
    queued: false,
    comboWindow: 0,
    cd: 0.45,
    iframe: grunt ? 0 : 0.7,
    grounded: true,
    alive: true,
    slam: false,
    facingLeft: false,
    yState: "standing",
    yFrame: 0,
    yHealth: grunt ? 4 : 8,
    weapon: "fist",
    wpn: 0,
    throwT: 0,
    pickupT: 0,
    wearT: 0,
    low: false,
    air: 0,
    splat: 0,
    tech: 0,
    ...partial,
    head: partial.head ?? 100,
    chest: partial.chest ?? 100,
    legs: partial.legs ?? 100,
    wake: partial.wake ?? 0,
  };
}

function prefersReduced() {
  try {
    return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function loadShape(): Pick<Sim, "build" | "crowd" | "height" | "bulk" | "head" | "leg" | "shoulder"> {
  const base = { build: "chibi" as const, crowd: "mix" as const, height: 1, bulk: 1, head: 1, leg: 1, shoulder: 1 };
  try {
    const raw = JSON.parse(localStorage.getItem("ashlane-shape") || "{}") as { build?: string; crowd?: string; height?: number; bulk?: number; head?: number; leg?: number; shoulder?: number };
    const num = (value: unknown, min: number, max: number, fallback: number) => (typeof value === "number" && value >= min && value <= max ? value : fallback);
    return {
      build: raw.build === "full" ? "full" : "chibi",
      crowd: raw.crowd === "full" || raw.crowd === "chibi" ? raw.crowd : "mix",
      height: num(raw.height, 0.86, 1.18, 1),
      bulk: num(raw.bulk, 0.8, 1.25, 1),
      head: num(raw.head, 0.75, 1.3, 1),
      leg: num(raw.leg, 0.82, 1.22, 1),
      shoulder: num(raw.shoulder, 0.82, 1.22, 1),
    };
  } catch {
    return base;
  }
}

export function saveShape(sim: Sim) {
  localStorage.setItem("ashlane-shape", JSON.stringify({ build: sim.build, crowd: sim.crowd, height: sim.height, bulk: sim.bulk, head: sim.head, leg: sim.leg, shoulder: sim.shoulder }));
}

function callRook(sim: Sim, rook: Body) {
  const foe = nearestGrunt(sim, 8);
  if (!foe) {
    sim.sfx.push("deny");
    return;
  }
  rook.x = foe.x;
  rook.z = foe.z + 0.8;
  rook.yaw = yawFromDir(foe.x - rook.x, foe.z - rook.z);
  rook.state = "atk";
  rook.stateT = 0.22;
  rook.swung = false;
  const f = forward(rook.yaw);
  hurt(sim, foe, 12, 14, f.x * 7, f.z * 7, 2.2);
  sim.banner = "Rook";
  sim.bannerT = 0.7;
  sim.sfx.push("hit");
}

export function createSim(tune?: Tune): Sim {
  const sim: Sim = {
    mode: "roam",
    running: false,
    paused: false,
    tune: clampTune(tune ?? {}),
    bodies: [],
    props: [],
    boxes: buildBoxes(),
    particles: [],
    camYaw: 0,
    orbit: 0,
    hitstop: 0,
    shake: 0,
    time: 0,
    banner: "",
    bannerT: 0,
    sfx: [],
    cleared: false,
    streetClear: false,
    scaffoldClear: false,
    plazaClear: false,
    marketClear: false,
    style: "knight",
    martial: "",
    stance: "orthodox",
    stage: "ward",
    bout: "off",
    flow: 0,
    pair: "",
    pairT: 0,
    pairVx: 0,
    pairVy: 0,
    pairVz: 0,
    pairDmg: 0,
    story: false,
    mission: 0,
    wave: 1,
    waveMax: 1,
    missionClear: false,
    clearedMission: 0,
    leaseSpawned: false,
    bufAtk: 0,
    bufGrab: 0,
    bufBlast: 0,
    bufJump: 0,
    prevAtk: false,
    prevGrab: false,
    prevBlast: false,
    prevJump: false,
    prevDash: false,
    prevUse: false,
    bufUse: 0,
    reduced: prefersReduced(),
    spawnX: 0,
    spawnY: 0,
    spawnZ: 2,
    spawnYaw: 0,
    nextId: 1,
    grabId: -1,
    coyote: 0.12,
    springLock: 0,
    canGrab: false,
    combo: 0,
    comboT: 0,
    spinPulse: 0,
    aimX: 0,
    aimZ: 0,
    foes: 0,
    yokoClock: 0,
    pulse: null,
    landed: false,
    sawHouse: false,
    sawMarket: false,
    scuffle: "",
    clearT: 0,
    phase: "walk",
    phaseStep: phaseCopy("walk").step,
    stickY: 0,
    stickX: 0,
    guard: false,
    block: 0,
    ...loadShape(),
  };
  spawnBodies(sim);
  return sim;
}

function placePlayer(sim: Sim, mode: Mode) {
  const p = sim.bodies[0];
  if (!p) return;
  if (mode === "belt") {
    p.x = -20;
    p.z = -19;
    p.yaw = -Math.PI / 2;
  } else if (mode === "platform") {
    p.x = -21.2;
    p.z = 20;
    p.yaw = -Math.PI / 2;
  } else {
    p.x = 0;
    p.z = 2;
    p.yaw = 0;
  }
  p.y = 0;
  p.vx = 0;
  p.vy = 0;
  p.vz = 0;
  p.state = "free";
  resetYoko(p);
  sim.spawnX = p.x;
  sim.spawnZ = p.z;
  sim.spawnYaw = p.yaw;
  sim.camYaw = p.yaw;
  sim.orbit = 0;
}

function addGrunt(sim: Sim, x: number, z: number, y: number, home: Home, arch: Arch) {
  const g = blankBody(sim, { kind: "grunt", x, z, y, home, homeX: x, homeZ: z, arch });
  if (arch === "brute") {
    g.hp = 120;
    g.maxHp = 120;
  } else if (arch === "runner") {
    g.hp = 44;
    g.maxHp = 44;
  } else if (arch === "hood") {
    g.hp = 56;
    g.maxHp = 56;
  } else if (arch === "hex") {
    g.hp = 72;
    g.maxHp = 72;
  }
  const p = sim.bodies[0];
  g.yaw = p ? yawFromDir(p.x - g.x, p.z - g.z) : 0;
  sim.bodies.push(g);
}

function addProp(sim: Sim, kind: Prop["kind"], x: number, y: number, z: number, hp: number, loot: Prop["loot"]) {
  sim.props.push({ id: sim.nextId++, kind, x, y, z, hp, alive: true, loot });
}

function spawnBodies(sim: Sim) {
  sim.bodies = [];
  sim.props = [];
  sim.grabId = -1;
  sim.pair = "";
  sim.pairT = 0;
  sim.cleared = false;
  sim.streetClear = false;
  sim.scaffoldClear = false;
  sim.plazaClear = false;
  sim.marketClear = false;
  sim.leaseSpawned = false;
  sim.sawHouse = false;
  sim.sawMarket = false;
  sim.scuffle = "";
  sim.clearT = 0;
  sim.phase = "walk";
  sim.phaseStep = phaseCopy("walk").step;
  sim.nextId = 1;
  sim.bodies.push(blankBody(sim, { kind: "player", x: 0, z: 2, yaw: 0, name: "Ash", home: "plaza" }));
  addGrunt(sim, 6, -4, 0, "plaza", "hood");
  addGrunt(sim, -8, 4, 0, "plaza", "runner");
  addGrunt(sim, 7, -1, 0, "plaza", "brute");
  addGrunt(sim, 2, 6, 0, "plaza", "hex");
  addGrunt(sim, -3, -6, 0, "plaza", "brawler");
  addGrunt(sim, -16, -19, 0, "street", "brawler");
  addGrunt(sim, -7, -18.3, 0, "street", "runner");
  addGrunt(sim, 1.5, -19.6, 0, "street", "hex");
  addGrunt(sim, 9, -18.4, 0, "street", "brute");
  addGrunt(sim, -8.4, 20, 2.4, "scaffold", "hood");
  addGrunt(sim, 7.2, 20, 2.55, "scaffold", "brute");
  addGrunt(sim, 22, -19, 0, "market", "hex");
  addGrunt(sim, 31, -18.2, 0, "market", "runner");
  addGrunt(sim, 39, -20, 0, "market", "hood");
  addProp(sim, "pipe", -12.2, 1.02, -9, 1, "");
  addProp(sim, "crate", -15.4, 0, -8.2, 2, "");
  addProp(sim, "crate", 27.5, 0, -17.6, 2, "bottle");
  addProp(sim, "crate", 36.2, 0, -21.2, 2, "");
  placePlayer(sim, sim.mode);
  sim.foes = 12;
}

export function setMode(sim: Sim, mode: Mode) {
  sim.mode = mode;
  sim.hitstop = 0;
  spawnBodies(sim);
  sim.banner = intro(mode);
  sim.bannerT = 2.4;
}

export function warp(sim: Sim, mode: Mode) {
  sim.mode = mode;
  sim.hitstop = 0;
  sim.grabId = -1;
  const p = sim.bodies[0];
  if (p?.state === "grab") p.state = "free";
  for (const b of sim.bodies) if (b.state === "grab") b.state = "free";
  placePlayer(sim, mode);
  sim.banner = intro(mode);
  sim.bannerT = 1.6;
}

function intro(mode: Mode) {
  if (mode === "belt") return "Yokosuka street. J punches. Down plus J kicks.";
  if (mode === "platform") return "Coil scaffolds. Jump to the brass pylon.";
  return "Cinder ward. North is the street. South is the scaffolds.";
}

export function rematch(sim: Sim) {
  const mode = sim.mode;
  const clearedMission = sim.clearedMission;
  const style = sim.style;
  const martial = sim.martial;
  const stance = sim.stance;
  spawnBodies(sim);
  sim.mode = mode;
  sim.clearedMission = clearedMission;
  sim.style = style;
  sim.martial = martial;
  sim.stance = stance;
  sim.story = false;
  sim.bout = "off";
  sim.flow = 0;
  sim.missionClear = false;
  placePlayer(sim, mode);
  sim.banner = "Rematch";
  sim.bannerT = 1;
}

export function startStory(sim: Sim, index: number) {
  const mission = missionAt(index);
  const clearedMission = sim.clearedMission;
  const style = sim.style;
  const martial = sim.martial;
  const stance = sim.stance;
  spawnBodies(sim);
  sim.mode = "roam";
  sim.clearedMission = clearedMission;
  sim.style = style;
  sim.martial = martial;
  sim.stance = stance;
  sim.story = true;
  sim.bout = "off";
  sim.flow = 0;
  sim.mission = Math.max(0, Math.min(MISSIONS.length - 1, index));
  sim.wave = 1;
  sim.waveMax = mission.waves;
  sim.missionClear = false;
  sim.running = true;
  sim.paused = false;
  placePlayer(sim, "roam");
  focusPack(sim);
  if (mission.boss) summonLease(sim);
  sim.banner = mission.title;
  sim.bannerT = 2.2;
  sim.stage = mission.stage;
}

export function startBout(sim: Sim, kind: "exhibit" | "practice", stage: string) {
  const clearedMission = sim.clearedMission;
  const style = sim.style;
  const martial = sim.martial;
  const stance = sim.stance;
  spawnBodies(sim);
  sim.mode = "roam";
  sim.clearedMission = clearedMission;
  sim.style = style;
  sim.martial = martial;
  sim.stance = stance;
  sim.story = false;
  sim.missionClear = false;
  sim.bout = kind;
  sim.flow = 0;
  sim.stage = stage;
  sim.running = true;
  sim.paused = false;
  const p = sim.bodies[0];
  p.x = 0;
  p.z = 2.2;
  p.y = 0;
  p.vx = 0;
  p.vz = 0;
  for (const b of sim.bodies) {
    if (b.kind !== "grunt") continue;
    b.alive = false;
    b.hp = 0;
    b.state = "out";
  }
  const foe = sim.bodies.find((b) => b.kind === "grunt" && b.arch === (kind === "practice" ? "hood" : "brute")) ?? sim.bodies.find((b) => b.kind === "grunt");
  if (foe) {
    foe.alive = true;
    foe.state = "free";
    foe.x = 0;
    foe.z = -2.2;
    foe.y = 0;
    foe.home = "plaza";
    foe.homeX = 0;
    foe.homeZ = -2.2;
    foe.vx = 0;
    foe.vz = 0;
    if (kind === "practice") {
      foe.name = "Bag";
      foe.hp = 400;
      foe.maxHp = 400;
    } else {
      foe.name = "The card";
      foe.hp = 160;
      foe.maxHp = 160;
    }
  }
  sim.banner = kind === "practice" ? "Practice. The bag does not swing." : "Exhibition.";
  sim.bannerT = 2;
}

function burst(sim: Sim, x: number, y: number, z: number, color: number) {
  for (let i = 0; i < 7; i++) {
    sim.particles.push({
      x,
      y,
      z,
      vx: (Math.random() - 0.5) * 6,
      vy: 1.5 + Math.random() * 4,
      vz: (Math.random() - 0.5) * 6,
      life: 0.38,
      max: 0.38,
      color,
    });
  }
  if (sim.particles.length > 40) sim.particles.splice(0, sim.particles.length - 40);
}

function breakGrab(sim: Sim) {
  if (sim.grabId < 0 && sim.bodies[0]?.state !== "grab") return;
  const p = sim.bodies[0];
  const e = sim.bodies.find((b) => b.id === sim.grabId);
  if (p?.state === "grab") p.state = "free";
  if (e && e.state === "grab") e.state = "hit";
  sim.grabId = -1;
  sim.pair = "";
  sim.pairT = 0;
}

function hurt(sim: Sim, b: Body, dmg: number, poiseDmg: number, kx: number, kz: number, lift: number, tag: "mid" | "low" | "high" = "mid") {
  if (!b.alive || b.iframe > 0 || b.state === "out") return false;
  if (b.state === "grab") return false;
  if (b.kind === "player" && !b.grounded && b.y > 0.35 && tag === "low") {
    sim.banner = "Hopped the low";
    sim.bannerT = 0.4;
    return false;
  }
  const f = forward(b.yaw);
  const kl = Math.hypot(kx, kz) || 1;
  const facing = (kx / kl) * f.x + (kz / kl) * f.z;
  if (b.kind === "player" && sim.guard && b.state === "free" && tag !== "low" && facing < -0.2) {
    const broken = tag === "high" || sim.block >= 3;
    sim.block = broken ? 0 : sim.block + 1;
    b.hp -= dmg * (broken ? 0.35 : 0.12);
    b.vx = kx * 0.15;
    b.vz = kz * 0.15;
    b.iframe = 0.12;
    sim.shake = Math.min(1, sim.shake + 0.16);
    sim.sfx.push("hit");
    sim.flow = Math.min(100, sim.flow + 6);
    sim.banner = broken ? (sim.block === 0 && tag !== "high" ? "Guard crush" : "Guard break") : "Guard";
    sim.bannerT = 0.45;
    if (!sim.pair) {
      sim.pair = "defender";
      sim.pairT = broken ? 0.28 : 0.18;
    }
    if (broken) {
      b.state = "hit";
      b.stateT = 0.22;
    }
    if (b.hp <= 0) {
      b.hp = 0;
      b.state = "down";
      b.stateT = 1.05;
    }
    return true;
  }
  b.hp -= markRegion(sim, b, tag, dmg);
  b.poise -= poiseDmg;
  b.vx = kx;
  b.vz = kz;
  b.vy = Math.max(b.vy, lift);
  b.iframe = b.kind === "player" ? 0.38 : 0.14;
  sim.hitstop = Math.max(sim.hitstop, lift > 4 ? 0.06 : 0.04);
  sim.shake = Math.min(1, sim.shake + (lift > 4 ? 0.55 : 0.32));
  sim.sfx.push(b.kind === "player" ? "hurt" : "hit");
  burst(sim, b.x, b.y + 1, b.z, b.kind === "player" ? 0xe4572e : 0xf0b429);
  if (b.kind === "player") {
    sim.flow *= 0.35;
    if (sim.grabId >= 0) breakGrab(sim);
    if (!sim.pair && facing > 0.45) {
      sim.pair = "hitback";
      sim.pairT = 0.45;
    } else if (!sim.pair && Math.abs(facing) < 0.35) {
      sim.pair = "hitside";
      sim.pairT = 0.4;
    }
  }
  if (b.hp <= 0) {
    b.hp = 0;
    if (b.kind === "player") {
      b.state = "down";
      b.stateT = 1.05;
    } else if (b.name === "Bag") {
      b.hp = b.maxHp;
      b.poise = SPEC.poiseGrunt;
      b.state = "down";
      b.stateT = 0.4;
    } else {
      b.alive = false;
      b.state = "out";
      b.stateT = 0.7;
      sim.combo += 1;
      sim.comboT = 1.3;
    }
    return true;
  }
  const airborne = !b.grounded && b.y > 0.4 && b.state !== "down";
  if (airborne) {
    b.air = Math.min(6, b.air + 1);
    b.state = "launch";
    b.stateT = 0.28;
    if (b.air >= 4) {
      b.vy = Math.min(b.vy, 1.2);
      b.vx *= 0.55;
      b.vz *= 0.55;
      if (b.kind !== "player") {
        sim.banner = "Dropped";
        sim.bannerT = 0.55;
      }
    } else {
      b.vy = Math.max(b.vy, Math.max(lift, 3.2) * (1 - b.air * 0.1));
      if (b.kind !== "player" && b.air > 1) {
        sim.banner = `Juggle ${b.air}`;
        sim.bannerT = 0.45;
      }
    }
    return true;
  }
  if (b.poise <= 0) {
    b.poise = b.kind === "player" ? SPEC.poisePlayer : SPEC.poiseGrunt;
    b.state = "down";
    b.air = 0;
    b.stateT = 1.45;
    sim.sfx.push("crumple");
    return true;
  }
  if (lift > 4) {
    b.state = "launch";
    b.stateT = 0.2;
    b.air = Math.max(1, b.air);
    return true;
  }
  b.state = "hit";
  b.stateT = sim.tune.hitstun * (b.head < 35 ? 1.45 : 1);
  return true;
}

function markRegion(sim: Sim, b: Body, tag: "mid" | "low" | "high", dmg: number) {
  const key = tag === "high" ? "head" : tag === "low" ? "legs" : "chest";
  const before = b[key];
  b[key] = Math.max(0, before - 16);
  if (before >= 35 && b[key] < 35) {
    sim.banner = key === "head" ? "Head's gone" : key === "legs" ? "Leg's gone" : "Body's gone";
    sim.bannerT = 0.8;
  }
  return b[key] < 35 ? dmg * 1.45 : dmg;
}

function nearestGrunt(sim: Sim, maxDist: number) {
  const p = sim.bodies[0];
  let best: Body | null = null;
  let bestD = maxDist;
  for (const e of sim.bodies) {
    if (e.kind !== "grunt" || !e.alive || e.state === "out" || e.state === "down" || e.state === "grab") continue;
    if (e.y > p.y + 1.3 || Math.abs(e.y - p.y) > 1.2) continue;
    const d = Math.hypot(e.x - p.x, e.z - p.z);
    if (d <= bestD) {
      best = e;
      bestD = d;
    }
  }
  return best;
}

function hitGrunts(sim: Sim, hx: number, hz: number, radius: number, dmg: number, kb: number, lift: number, poise: number, dirX: number, dirZ: number, tag: "mid" | "low" | "high" = "mid") {
  const p = sim.bodies[0];
  let any = false;
  for (const e of sim.bodies) {
    if (e.kind !== "grunt" || !e.alive || e.state === "grab") continue;
    if (Math.abs(e.y + 0.7 - (p.y + 0.8)) > 1.35) continue;
    if (Math.hypot(e.x - hx, e.z - hz) > radius) continue;
    const laying = e.state === "down" && e.grounded;
    const waking = laying && e.stateT < 0.34;
    const awayX = e.x - p.x;
    const awayZ = e.z - p.z;
    const al = Math.hypot(awayX, awayZ) || 1;
    const scale = !e.grounded && e.y > 0.4 ? Math.max(0.42, 1 - e.air * 0.16) : 1;
    const stomp = laying && sim.stickY > 0.45;
    const popUp = laying && !stomp && sim.stickY < -0.28;
    const kx = (dirX * 0.7 + (awayX / al) * 0.3) * kb * (laying ? (popUp ? 1.15 : 0.35) : 1);
    const kz = (dirZ * 0.7 + (awayZ / al) * 0.3) * kb * (laying ? (popUp ? 1.15 : 0.35) : 1);
    const pop = laying ? (popUp ? 6.2 : 0.05) : lift;
    let dealt = dmg * scale;
    let liftHit = pop;
    if (e.splat > 0 && !laying) {
      dealt *= 1.3;
      liftHit = Math.max(liftHit, 5.4);
      e.splat = 0;
      sim.banner = "Wall follow";
      sim.bannerT = 0.6;
    }
    if (hurt(sim, e, dealt, poise, kx, kz, liftHit, stomp ? "low" : tag)) {
      any = true;
      p.meter = Math.min(100, p.meter + 8);
      sim.combo += 1;
      sim.comboT = 1.25;
      sim.flow = Math.min(100, sim.flow + (sim.flow > 40 ? 8 : 5));
      if (stomp && e.alive && e.state !== "out") {
        e.state = "down";
        e.vy = 0;
        e.air = 0;
        e.stateT = 1.15;
        sim.banner = "Stomp";
        sim.bannerT = 0.55;
      } else if (laying && !popUp && e.alive && e.state !== "out") {
        e.state = "down";
        e.vy = 0;
        e.air = 0;
        e.stateT = waking ? 0.85 : 1.25;
        e.tech = waking ? 1 : 0;
        sim.banner = waking ? "Meaty" : "Ground";
        sim.bannerT = 0.55;
      } else if (laying && popUp) {
        sim.banner = "Ground launch";
        sim.bannerT = 0.55;
      }
    }
  }
  return any;
}

function hitProps(sim: Sim, x: number, z: number, radius: number) {
  let any = false;
  for (const prop of sim.props) {
    if (!prop.alive || prop.kind !== "crate") continue;
    if (Math.hypot(prop.x - x, prop.z - z) > radius + 0.4) continue;
    prop.hp -= 1;
    any = true;
    sim.sfx.push("hit");
    sim.shake = Math.min(1, sim.shake + 0.28);
    burst(sim, prop.x, 0.6, prop.z, 0x8a5a3a);
    if (prop.hp > 0) continue;
    prop.alive = false;
    sim.banner = "Crate smashed";
    sim.bannerT = 1.2;
    if (prop.loot) addProp(sim, prop.loot, prop.x, 0.2, prop.z + 0.4, 1, "");
  }
  return any;
}

function wearWeapon(sim: Sim, p: Body) {
  if (p.weapon === "fist" || p.wearT > 0) return;
  p.wearT = 0.36;
  p.wpn -= 1;
  const kind = p.weapon;
  if (p.wpn > 0) return;
  p.weapon = "fist";
  p.wpn = 0;
  sim.banner = kind === "bottle" ? "Bottle shattered" : "The pipe snapped";
  sim.bannerT = 1.3;
  sim.sfx.push("slam");
  burst(sim, p.x, p.y + 1, p.z, kind === "bottle" ? 0x69c3c2 : 0x9aa3ad);
}

function tryUse(sim: Sim, p: Body) {
  if (p.state !== "free" && p.state !== "down") return;
  if (p.weapon !== "fist") {
    const f = forward(p.yaw);
    addProp(sim, p.weapon, p.x + f.x * 0.7, 0.2, p.z + f.z * 0.7, Math.max(1, p.wpn), "");
    p.weapon = "fist";
    p.wpn = 0;
    p.pickupT = 0.25;
    sim.banner = "Dropped";
    sim.bannerT = 0.8;
    sim.sfx.push("grab");
    return;
  }
  tryPickup(sim, p);
}

function tryPickup(sim: Sim, p: Body) {
  if (p.weapon !== "fist" || p.state !== "free") return;
  for (const prop of sim.props) {
    if (!prop.alive || prop.kind === "crate") continue;
    if (Math.hypot(prop.x - p.x, prop.z - p.z) > 0.85 || Math.abs(prop.y - p.y) > 1.4) continue;
    prop.alive = false;
    p.weapon = prop.kind;
    p.wpn = prop.kind === "pipe" ? 8 : 3;
    p.pickupT = 0.4;
    sim.banner = prop.kind === "pipe" ? "Pipe. Run in and it lunges." : "Bottle. A few swings, then it breaks.";
    sim.bannerT = 1.6;
    sim.sfx.push("grab");
    return;
  }
  sim.banner = "Nothing in reach";
  sim.bannerT = 0.6;
}

function commitFacing(sim: Sim, p: Body) {
  const foe = nearestGrunt(sim, 3.4);
  if (foe) p.yaw = yawFromDir(foe.x - p.x, foe.z - p.z);
  p.vx = 0;
  p.vz = 0;
}

function faceFlow(sim: Sim, p: Body) {
  let best: Body | null = null;
  let bestD = sim.flow > 45 ? 4.6 : 2.7;
  for (const e of sim.bodies) {
    if (e.kind !== "grunt" || !e.alive || e.state === "out" || e.state === "grab") continue;
    if (Math.abs(e.y - p.y) > 1.6) continue;
    const d = Math.hypot(e.x - p.x, e.z - p.z);
    if (d < bestD) {
      best = e;
      bestD = d;
    }
  }
  if (!best) return;
  p.yaw = yawFromDir(best.x - p.x, best.z - p.z);
  if (sim.flow > 55) {
    const f = forward(p.yaw);
    p.vx += f.x * 4;
    p.vz += f.z * 4;
  }
}

function tryCounter(sim: Sim, p: Body) {
  let caught = false;
  for (const e of sim.bodies) {
    if (e.kind !== "grunt" || !e.alive || e.name === "Bag") continue;
    const winding = e.state === "windup" || (e.state === "atk" && !e.swung);
    if (!winding || Math.hypot(e.x - p.x, e.z - p.z) > 1.65) continue;
    e.state = "hit";
    e.stateT = 0.42;
    e.vx = (e.x - p.x) * 4;
    e.vz = (e.z - p.z) * 4;
    caught = true;
  }
  if (!caught) return;
  sim.flow = Math.min(100, sim.flow + 22);
  sim.banner = "Flow";
  sim.bannerT = 0.55;
  p.iframe = Math.max(p.iframe, 0.26);
  sim.sfx.push("hit");
}

function swingDur(swing: number) {
  if (swing >= 10) return 0.55;
  if (swing >= 9) return 0.62;
  if (swing >= 8) return 0.48;
  if (swing >= 7) return 0.55;
  if (swing >= 6) return 0.5;
  if (swing >= 5) return 0.4;
  if (swing >= 4) return 0.42;
  return swing === 3 ? 0.44 : 0.32;
}

function beginSwing(sim: Sim, p: Body) {
  const diving = !p.grounded && p.y > 0.85 && !(p.comboWindow > 0 || p.queued);
  const fast = Math.hypot(p.vx, p.vz) > 4.4;
  if (!diving) commitFacing(sim, p);
  else if (sim.flow > 40) faceFlow(sim, p);
  tryCounter(sim, p);
  if (diving) {
    const f = forward(p.yaw);
    const back = sim.stickY > 0.35;
    const ahead = sim.stickY < -0.35;
    const side = Math.abs(sim.stickX) > 0.45;
    if (side && !back && !ahead) {
      p.swing = 9;
      p.vx += f.x * 6;
      p.vz += f.z * 6;
      p.vy = Math.min(p.vy, -0.4);
    } else if (back || (sim.stance === "ginga" && !ahead)) {
      p.swing = 7;
      p.vx *= 0.2;
      p.vz *= 0.2;
      p.vy = Math.min(p.vy, -1.4);
    } else if (ahead) {
      p.swing = 8;
      p.vx += f.x * 11;
      p.vz += f.z * 11;
      p.vy = Math.min(p.vy, -0.6);
    } else {
      p.swing = 6;
      p.vx += f.x * 8;
      p.vz += f.z * 8;
      p.vy = Math.min(p.vy, 0.4);
    }
  } else if (p.low && !(p.comboWindow > 0 || p.queued)) p.swing = 5;
  else if (fast && !(p.comboWindow > 0 || p.queued)) p.swing = 4;
  else if (p.comboWindow > 0 || p.queued) {
    if (p.swing >= 3 && p.swing < 6) {
      if (sim.stickY < -0.3) p.swing = 3;
      else if (sim.stickY > 0.4) p.swing = 5;
      else if (Math.abs(sim.stickX) > 0.45) p.swing = 4;
      else p.swing = 1;
    } else p.swing = p.swing >= 3 ? 1 : p.swing + 1;
  } else if (sim.stickY > 0.45) p.swing = 5;
  else if (sim.stickY < -0.45 || fast) p.swing = 4;
  else if (Math.abs(sim.stickX) > 0.45) p.swing = 2;
  else p.swing = sim.stance === "southpaw" ? 2 : 1;
  p.queued = false;
  p.comboWindow = 0;
  p.state = "atk";
  p.swung = false;
  p.stateT = swingDur(p.swing);
  sim.bufAtk = 0;
  sim.sfx.push("swing");
  if (p.grounded && p.swing === 4) {
    const f = forward(p.yaw);
    p.vx = f.x * 6.5;
    p.vz = f.z * 6.5;
  }
}

function startDash(sim: Sim, p: Body) {
  let dx = sim.aimX;
  let dz = sim.aimZ;
  const m = Math.hypot(dx, dz);
  if (m < 0.2) {
    const f = forward(p.yaw);
    dx = f.x;
    dz = f.z;
  } else {
    dx /= m;
    dz /= m;
  }
  p.state = "dash";
  p.stateT = 0.16;
  p.iframe = Math.max(p.iframe, 0.16);
  const slipped = sim.bodies.some(
    (e) => e.kind === "grunt" && e.alive && (e.state === "atk" || e.state === "windup") && Math.hypot(e.x - p.x, e.z - p.z) < 1.75,
  );
  if (slipped) {
    for (const e of sim.bodies) {
      if (e.kind !== "grunt" || !e.alive || (e.state !== "atk" && e.state !== "windup")) continue;
      if (Math.hypot(e.x - p.x, e.z - p.z) > 1.75) continue;
      e.state = "hit";
      e.stateT = 0.85;
      e.poise = 0;
      e.vx = (e.x - p.x) * 3;
      e.vz = (e.z - p.z) * 3;
    }
    p.iframe = Math.max(p.iframe, 0.34);
    sim.banner = "Deflect";
    sim.bannerT = 0.7;
    if (!sim.pair) {
      sim.pair = sim.martial === "capoeira" ? "esquiva" : "evade";
      sim.pairT = 0.4;
    }
  }
  p.vx = dx * SPEC.dashSpeed;
  p.vz = dz * SPEC.dashSpeed;
  const face = forward(p.yaw);
  const along = Math.abs(dx * face.x + dz * face.z);
  const side = Math.abs(dx * face.z - dz * face.x);
  if (side > along + 0.2) {
    p.iframe = Math.max(p.iframe, 0.26);
    sim.banner = "Sidestep";
    sim.bannerT = 0.45;
  }
  p.yaw = yawFromDir(dx, dz);
  sim.bufGrab = 0;
  sim.sfx.push("dash");
}

function throwEnemy(sim: Sim, e: Body) {
  const p = sim.bodies[0];
  let dx = sim.aimX;
  let dz = sim.aimZ;
  const m = Math.hypot(dx, dz);
  if (m < 0.25) {
    const f = forward(p.yaw);
    dx = f.x;
    dz = f.z;
  } else {
    dx /= m;
    dz /= m;
  }
  const back = sim.stickY > 0.35;
  const ahead = sim.stickY < -0.35;
  const art = sim.martial;
  const face = forward(e.yaw);
  const behind = face.x * (p.x - e.x) + face.z * (p.z - e.z) < -0.2;
  let name = "Throw";
  let vx = dx * 12.5;
  let vz = dz * 12.5;
  let vy = 3.4;
  let dmg: number = SPEC.throwDamage;
  if (behind) {
    name = "Back throw";
    vx = dx * 3.2;
    vz = dz * 3.2;
    vy = 5.4;
    dmg = 24;
  } else if (Math.abs(sim.stickX) > 0.45) {
    const right = { x: -Math.cos(p.yaw), z: Math.sin(p.yaw) };
    const dir = sim.stickX > 0 ? 1 : -1;
    name = "Whip";
    vx = right.x * dir * 16;
    vz = right.z * dir * 16;
    vy = 1.1;
    dmg = 12;
  } else if (sim.stickY > 0.62 && motionReady() && motionDur("takedown") > 0) {
    name = "Takedown";
    vx = dx * 2.4;
    vz = dz * 2.4;
    vy = 1.2;
    dmg = 16;
  } else if (back && (art === "sambo" || art === "jiujitsu")) {
    name = "German suplex";
    vx = -dx * 7;
    vz = -dz * 7;
    vy = 6.4;
    dmg = 21;
  } else if (back) {
    name = "Neckbreaker";
    vx = -dx * 4.2;
    vz = -dz * 4.2;
    vy = 2.2;
    dmg = 19;
  } else if (ahead && (art === "wrestling" || art === "catch")) {
    name = "Brainbuster";
    vx = dx * 1.1;
    vz = dz * 1.1;
    vy = 8.4;
    dmg = 24;
  } else if (ahead) {
    name = "Chokeslam";
    vx = dx * 0.6;
    vz = dz * 0.6;
    vy = -2.4;
    dmg = 26;
  } else if (art === "wrestling" || art === "catch" || sim.stance === "collar") {
    name = art === "catch" && sim.stance !== "collar" ? "Fireman's carry" : "Powerbomb";
    vx = dx * (art === "catch" && sim.stance !== "collar" ? 5 : 3.4);
    vz = dz * (art === "catch" && sim.stance !== "collar" ? 5 : 3.4);
    vy = art === "catch" && sim.stance !== "collar" ? 6.2 : 7.6;
    dmg = art === "catch" && sim.stance !== "collar" ? 20 : 22;
  } else if (art === "sambo" || art === "jiujitsu") {
    name = "Suplex";
    vx = -dx * 9;
    vz = -dz * 9;
    vy = 7.2;
    dmg = 18;
  }
  const paired = name === "Chokeslam" ? "chokeslam" : name === "German suplex" ? "german" : name === "Suplex" ? "suplex" : name === "Takedown" ? "takedown" : name === "Neckbreaker" ? "ddt" : "";
  if (paired && motionReady() && motionDur(paired) > 0) {
    sim.pair = paired;
    sim.pairT = 2.1;
    sim.pairVx = vx;
    sim.pairVy = vy;
    sim.pairVz = vz;
    sim.pairDmg = dmg;
    p.throwT = 2.1;
    e.throwT = 2.1;
    e.iframe = 2.1;
    sim.banner = paired === "ddt" ? "DDT" : name;
    sim.bannerT = 2.1;
    sim.sfx.push("throw");
    sim.bufGrab = 0;
    return;
  }
  e.state = "throw";
  e.slam = true;
  e.iframe = 0.08;
  e.vx = vx;
  e.vz = vz;
  e.vy = vy;
  e.stateT = 0.48;
  e.hp -= dmg;
  const extra = sim.bodies.find((o) => o !== e && o.kind === "grunt" && o.alive && (o.state === "hit" || o.state === "launch") && Math.hypot(o.x - e.x, o.z - e.z) < 1.8);
  if (extra) {
    extra.hp -= Math.round(dmg * 0.6);
    extra.vx = vx * 0.8;
    extra.vz = vz * 0.8;
    extra.vy = vy;
    extra.state = "throw";
    extra.stateT = 0.4;
    name = "Double throw";
    if (extra.hp <= 0) {
      extra.hp = 0;
      extra.alive = false;
      extra.state = "out";
    }
  }
  p.meter = Math.min(100, p.meter + 10);
  p.state = "free";
  p.iframe = Math.max(p.iframe, 0.12);
  sim.grabId = -1;
  sim.bufGrab = 0;
  sim.sfx.push("throw");
  p.throwT = 0.42;
  sim.banner = name;
  sim.bannerT = 0.8;
  if (e.hp <= 0) {
    e.hp = 0;
    e.alive = false;
    e.state = "out";
  }
}

function wallSlam(sim: Sim, b: Body) {
  b.slam = false;
  const bounced = b.splat > 0;
  b.splat = 0.7;
  b.air = Math.max(1, b.air);
  b.hp -= sim.tune.wallBonus;
  b.head = Math.max(0, b.head - 15);
  b.chest = Math.max(0, b.chest - 8);
  b.vx *= -0.28;
  b.vz *= -0.28;
  b.vy = bounced ? 6.4 : 4.2;
  sim.shake = Math.min(1, sim.shake + 0.75);
  sim.hitstop = Math.max(sim.hitstop, 0.07);
  sim.sfx.push("slam");
  burst(sim, b.x, b.y + 0.8, b.z, 0xf3e6d4);
  sim.banner = bounced ? "Wall bounce" : "Wall";
  sim.bannerT = 0.6;
  const p = sim.bodies[0];
  if (p) p.meter = Math.min(100, p.meter + 14);
  if (b.hp <= 0) {
    b.hp = 0;
    b.alive = false;
    b.state = "out";
    b.stateT = 0.7;
    return;
  }
  b.poise = SPEC.poiseGrunt;
  b.state = "launch";
  b.stateT = 0.25;
}

function resolveXZ(sim: Sim, b: Body): "" | "hard" | "soft" {
  let touch: "" | "hard" | "soft" = "";
  for (const box of sim.boxes) {
    if (box.kind === "spring" || box.kind === "goal" || box.kind === "plat") continue;
    if (box.kind === "gate" && sim.streetClear) continue;
    if (b.y >= box.maxY - 0.08) continue;
    if (b.y + 1.45 < box.minY) continue;
    const cx = Math.min(Math.max(b.x, box.minX), box.maxX);
    const cz = Math.min(Math.max(b.z, box.minZ), box.maxZ);
    let dx = b.x - cx;
    let dz = b.z - cz;
    let d2 = dx * dx + dz * dz;
    if (d2 >= R * R) continue;
    touch = "hard";
    if (d2 < 1e-6) {
      dx = 1;
      dz = 0;
      d2 = 1;
    }
    const d = Math.sqrt(d2);
    const push = (R - d) / d;
    b.x += dx * push;
    b.z += dz * push;
    const nx = dx / d;
    const nz = dz / d;
    const vn = b.vx * nx + b.vz * nz;
    if (vn < 0) {
      b.vx -= vn * nx;
      b.vz -= vn * nz;
    }
  }
  for (const prop of sim.props) {
    if (!prop.alive || prop.kind === "pipe" || prop.kind === "bottle") continue;
    const minX = prop.x - 0.55;
    const maxX = prop.x + 0.55;
    const minZ = prop.z - 0.55;
    const maxZ = prop.z + 0.55;
    if (b.y >= 0.9) continue;
    const cx = Math.min(Math.max(b.x, minX), maxX);
    const cz = Math.min(Math.max(b.z, minZ), maxZ);
    let dx = b.x - cx;
    let dz = b.z - cz;
    let d2 = dx * dx + dz * dz;
    if (d2 >= R * R) continue;
    if (!touch) touch = "soft";
    if (d2 < 1e-6) {
      dx = 1;
      dz = 0;
      d2 = 1;
    }
    const d = Math.sqrt(d2);
    const push = (R - d) / d;
    b.x += dx * push;
    b.z += dz * push;
    const nx = dx / d;
    const nz = dz / d;
    const vn = b.vx * nx + b.vz * nz;
    if (vn < 0) {
      b.vx -= vn * nx;
      b.vz -= vn * nz;
    }
  }
  eject(sim, b);
  return touch;
}

function eject(sim: Sim, b: Body) {
  for (const box of sim.boxes) {
    if (box.kind === "spring" || box.kind === "goal" || box.kind === "plat") continue;
    if (box.kind === "gate" && sim.streetClear) continue;
    if (b.y >= box.maxY - 0.05) continue;
    if (b.x <= box.minX || b.x >= box.maxX || b.z <= box.minZ || b.z >= box.maxZ) continue;
    const left = b.x - box.minX;
    const right = box.maxX - b.x;
    const south = b.z - box.minZ;
    const north = box.maxZ - b.z;
    const m = Math.min(left, right, south, north);
    if (m === left) {
      b.x = box.minX - R;
      b.vx = Math.min(0, b.vx);
    } else if (m === right) {
      b.x = box.maxX + R;
      b.vx = Math.max(0, b.vx);
    } else if (m === south) {
      b.z = box.minZ - R;
      b.vz = Math.min(0, b.vz);
    } else {
      b.z = box.maxZ + R;
      b.vz = Math.max(0, b.vz);
    }
  }
}

function resolveY(sim: Sim, b: Body, prevY: number) {
  b.grounded = false;
  if (b.y < 0) {
    b.y = 0;
    if (b.vy < 0) b.vy = 0;
    b.grounded = true;
  }
  for (const box of sim.boxes) {
    if (box.kind !== "plat" && box.kind !== "wall" && box.kind !== "gate" && box.kind !== "goal") continue;
    if (box.kind === "gate" && sim.streetClear) continue;
    if (b.x + R <= box.minX || b.x - R >= box.maxX || b.z + R <= box.minZ || b.z - R >= box.maxZ) continue;
    if (prevY >= box.maxY - 0.06 && b.y < box.maxY && b.vy <= 0) {
      b.y = box.maxY;
      b.vy = 0;
      b.grounded = true;
    }
  }
}

function trySpring(sim: Sim, b: Body) {
  if (b.kind !== "player" || sim.springLock > 0 || b.vy > 0.4) return;
  for (const box of sim.boxes) {
    if (box.kind !== "spring") continue;
    if (b.x < box.minX || b.x > box.maxX || b.z < box.minZ || b.z > box.maxZ) continue;
    if (b.y > 0.45) continue;
    b.vy = Math.max(sim.tune.launcher, sim.tune.jumpV * 1.35);
    b.grounded = false;
    if (b.state === "down" || b.state === "hit") b.state = "free";
    sim.springLock = 0.35;
    sim.sfx.push("spring");
    return;
  }
}

function moveBody(sim: Sim, b: Body, dt: number) {
  if (!b.alive && b.state === "out") {
    b.y -= dt * 0.9;
    b.stateT -= dt;
    return;
  }
  const prevY = b.y;
  b.splat = Math.max(0, b.splat - dt);
  b.vy -= sim.tune.gravity * dt;
  b.y += b.vy * dt;
  const dist = Math.hypot(b.vx, b.vz) * dt;
  const steps = Math.max(1, Math.ceil(dist / 0.12));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    b.x += b.vx * h;
    b.z += b.vz * h;
    const touch = resolveXZ(sim, b);
    if (touch && b.state === "throw" && b.slam) {
      if (touch === "soft") {
        b.slam = false;
        b.vx = 0;
        b.vz = 0;
        b.vy = 0;
        b.state = "hit";
        b.stateT = 1;
        sim.banner = "Stalled";
        sim.bannerT = 0.7;
      } else wallSlam(sim, b);
      break;
    }
  }
  b.x = Math.min(b.z < -14.5 ? 45.6 : 24.2, Math.max(-24.2, b.x));
  b.z = Math.min(24.2, Math.max(-24.2, b.z));
  if (sim.bout !== "off") {
    const ring = Math.hypot(b.x, b.z);
    if (ring > 7.2) {
      b.x *= 7.2 / ring;
      b.z *= 7.2 / ring;
      b.vx *= -0.15;
      b.vz *= -0.15;
    }
  }
  resolveY(sim, b, prevY);
  if (b.kind === "player") trySpring(sim, b);
  if ((b.state === "launch" || b.state === "throw") && b.grounded) {
    b.vx *= 0.25;
    b.vz *= 0.25;
    if (!b.alive || b.hp <= 0) {
      b.state = "out";
      b.alive = false;
    } else {
      const teching = b.kind === "player" && Math.hypot(sim.stickX, sim.stickY) > 0.42;
      const foe = sim.bodies[0];
      const enemyTech = b.kind !== "player" && foe && b.tech <= 0 && Math.random() < 0.2;
      if ((teching || enemyTech) && b.tech <= 0) {
        b.state = "free";
        b.air = 0;
        b.iframe = b.kind === "player" ? 0.3 : 0.18;
        if (teching) {
          const m = Math.hypot(sim.aimX, sim.aimZ) || 1;
          b.vx = (sim.aimX / m) * 8;
          b.vz = (sim.aimZ / m) * 8;
          sim.banner = "Tech";
          sim.bannerT = 0.5;
          if (!sim.pair) {
            sim.pair = "esquiva";
            sim.pairT = 0.4;
          }
        } else if (foe) {
          const dx = b.x - foe.x;
          const dz = b.z - foe.z;
          const m = Math.hypot(dx, dz) || 1;
          b.vx = (dx / m) * 6;
          b.vz = (dz / m) * 6;
        }
      } else {
        b.state = "down";
        b.air = 0;
        b.stateT = b.kind === "player" ? 0.75 : 1.4;
        if (b.kind !== "player" && sim.bannerT < 0.25) {
          sim.banner = "Downed";
          sim.bannerT = 0.7;
        }
      }
      b.tech = 0;
    }
    sim.sfx.push("land");
  }
}

function steer(sim: Sim, input: FrameInput) {
  if (sim.mode === "roam") {
    const fX = -Math.sin(sim.camYaw);
    const fZ = -Math.cos(sim.camYaw);
    const rX = Math.cos(sim.camYaw);
    const rZ = -Math.sin(sim.camYaw);
    sim.aimX = fX * -input.y + rX * input.x;
    sim.aimZ = fZ * -input.y + rZ * input.x;
  } else {
    sim.aimX = input.x;
    sim.aimZ = input.y;
  }
  const mag = Math.hypot(sim.aimX, sim.aimZ);
  if (mag > 1) {
    sim.aimX /= mag;
    sim.aimZ /= mag;
  }
}

function applyMove(sim: Sim, p: Body, dt: number, scale: number) {
  const mag = Math.hypot(sim.aimX, sim.aimZ);
  if (mag > 0.08) {
    const speed = sim.tune.moveSpeed * scale;
    const tx = (sim.aimX / mag) * speed;
    const tz = (sim.aimZ / mag) * speed;
    const k = 1 - Math.exp(-10 * dt);
    p.vx += (tx - p.vx) * k;
    p.vz += (tz - p.vz) * k;
    if (sim.mode === "roam") p.yaw = approachAngle(p.yaw, yawFromDir(sim.aimX, sim.aimZ), 14, dt);
    else if (Math.abs(sim.aimX) > 0.2) p.yaw = approachAngle(p.yaw, sim.aimX >= 0 ? -Math.PI / 2 : Math.PI / 2, 16, dt);
    else p.yaw = approachAngle(p.yaw, yawFromDir(sim.aimX, sim.aimZ), 12, dt);
  } else {
    const k = 1 - Math.exp(-14 * dt);
    p.vx += (0 - p.vx) * k;
    p.vz += (0 - p.vz) * k;
  }
}

function inputLikeDown(sim: Sim) {
  return sim.stickY > 0.45;
}

function engaged(home: Home, p: Body) {
  if (home === "street") return p.z < -12.6 && p.x < 17;
  if (home === "market") return p.z < -14.2 && p.x > 16;
  if (home === "scaffold") return p.z > 14.2;
  return p.z > -12.8 && p.z < 14.6 && p.x < 23;
}

function updateEnemies(sim: Sim, dt: number) {
  const p = sim.bodies[0];
  for (const e of sim.bodies) {
    if (e.kind !== "grunt") continue;
    const yokoStreet = sim.mode === "belt" && e.home === "street";
    e.iframe = Math.max(0, e.iframe - dt);
    e.cd = Math.max(0, e.cd - dt);
    if (!e.alive) continue;
    if (e.state === "grab" || e.state === "throw") continue;
    if (e.state === "hit" || e.state === "down") {
      if (e.state === "down" && e.name !== "Bag" && p) {
        const near = Math.hypot(e.x - p.x, e.z - p.z) < 1.2;
        e.wake = near ? e.wake + dt : Math.max(0, e.wake - dt);
        if (e.wake > 2) {
          e.wake = 0;
          e.state = "atk";
          e.swing = 5;
          e.swung = false;
          e.stateT = 0.32;
          e.yaw = yawFromDir(p.x - e.x, p.z - e.z);
          sim.banner = "Wake-up sweep";
          sim.bannerT = 0.6;
          continue;
        }
      }
      if (e.id === sim.grabId) {
        e.vx = 0;
        e.vz = 0;
        continue;
      }
      if (yokoStreet && (e.yState === "hurt" || e.yState === "dying")) {
        e.vx *= Math.exp(-6 * dt);
        e.vz *= Math.exp(-6 * dt);
        continue;
      }
      e.stateT -= dt;
      e.vx *= Math.exp(-6 * dt);
      e.vz *= Math.exp(-6 * dt);
      if (e.stateT <= 0) {
        const close = Math.hypot(e.x - p.x, e.z - p.z) < 1.7;
        if (e.state === "down" && close && Math.random() < 0.38) {
          e.state = "windup";
          e.stateT = 0.18;
          e.yaw = yawFromDir(p.x - e.x, p.z - e.z);
        } else e.state = "free";
      }
      continue;
    }
    if (e.name === "Bag") {
      if (e.state === "windup" || e.state === "atk") e.state = "free";
      e.vx *= 0.7;
      e.vz *= 0.7;
      continue;
    }
    if (yokoStreet) continue;
    if (e.state === "launch") continue;
    if (e.state === "windup") {
      e.vx = 0;
      e.vz = 0;
      e.stateT -= dt;
      if (e.stateT <= 0) {
        const f = forward(e.yaw);
        e.state = "atk";
        e.stateT = 0.22;
        e.swung = false;
        e.vx = f.x * 5.5;
        e.vz = f.z * 5.5;
      }
      continue;
    }
    if (e.state === "atk") {
      e.stateT -= dt;
        if (!e.swung && e.stateT < 0.14) {
        e.swung = true;
        const f = forward(e.yaw);
        const bite = (e.arch === "brute" ? 14 : e.arch === "hex" ? 11 : e.arch === "hood" ? 8 : e.arch === "runner" ? 7 : 9) * (e.chest < 35 ? 0.65 : 1);
        for (const target of sim.bodies) {
          if (target.kind === "grunt" || !target.alive) continue;
          if (target.iframe > 0 || target.state === "dash") continue;
          if (Math.hypot(target.x - e.x, target.z - e.z) > 1.22 || Math.abs(target.y - e.y) >= 1.2) continue;
          hurt(sim, target, bite, 10, f.x * 6.5, f.z * 6.5, e.arch === "brute" ? 2.4 : 1.2);
        }
      }
      if (e.stateT <= 0) {
        e.state = "free";
        e.cd = 0.9;
      }
      continue;
    }
    if (e.state !== "free") continue;
    const hot = engaged(e.home, p) || (sim.scuffle === e.home && Math.hypot(p.x - e.homeX, p.z - e.homeZ) < 22);
    let ax = (hot ? p.x : e.homeX) - e.x;
    let az = (hot ? p.z : e.homeZ) - e.z;
    const d = Math.hypot(ax, az) || 1;
    if (hot && d < (e.arch === "hex" ? 2.3 : 1.22) && e.cd <= 0 && Math.abs(e.y - p.y) < 1.1 && p.state !== "down") {
      e.state = "windup";
      e.stateT = SPEC.enemyWindup * (e.arch === "runner" || e.arch === "hood" ? 0.62 : e.arch === "brute" || e.arch === "hex" ? 1.28 : 1);
      e.yaw = yawFromDir(ax, az);
      e.vx = 0;
      e.vz = 0;
      continue;
    }
    if (!hot && d < 0.35) {
      e.vx = 0;
      e.vz = 0;
      continue;
    }
    ax /= d;
    az /= d;
    if (hot) {
      for (const o of sim.bodies) {
        if (o === e || o.kind !== "grunt" || !o.alive) continue;
        const ox = e.x - o.x;
        const oz = e.z - o.z;
        const od = Math.hypot(ox, oz);
        if (od < 1.15 && od > 0.001) {
          ax += (ox / od) * 0.85;
          az += (oz / od) * 0.85;
        }
      }
    }
    const m = Math.hypot(ax, az) || 1;
    const archMul = e.arch === "runner" ? 1.38 : e.arch === "hood" ? 1.2 : e.arch === "brute" ? 0.72 : e.arch === "hex" ? 0.84 : 1;
    const heat = sim.story ? 1 + sim.mission * 0.012 : 1;
    const sp = (!hot ? sim.tune.enemySpeed * 0.65 : d < 1.05 ? 0 : sim.tune.enemySpeed) * archMul * heat * (e.legs < 35 ? 0.55 : 1);
    e.vx = (ax / m) * sp;
    e.vz = (az / m) * sp;
    if (sp > 0) e.yaw = approachAngle(e.yaw, yawFromDir(e.vx, e.vz), 10, dt);
  }
}

function updatePlayer(sim: Sim, dt: number, dashEdge: boolean) {
  const p = sim.bodies[0];
  p.iframe = Math.max(0, p.iframe - dt);
  const atk = sim.bufAtk > 0;
  const grab = sim.bufGrab > 0;
  const blast = sim.bufBlast > 0;
  const jump = sim.bufJump > 0;
  const use = sim.bufUse > 0;
  if (use && (p.state === "free" || p.state === "down")) {
    sim.bufUse = 0;
    tryUse(sim, p);
  }
  sim.guard = p.state === "free" && p.grounded && sim.stickY > 0.48 && !atk && !grab && !jump;
  if (!sim.guard) sim.block = Math.max(0, sim.block - dt * 1.4);
  if (sim.pair && p.state !== "grab") {
    sim.pairT -= dt;
    p.throwT = Math.max(0, sim.pairT);
    if (sim.pairT <= 0) sim.pair = "";
  }

  if (p.state === "down" || p.state === "hit") {
    if (p.state === "down" && p.hp > 0) {
      if (dashEdge) {
        const f = forward(p.yaw);
        p.state = "free";
        p.iframe = 0.4;
        p.vx = -f.x * 8;
        p.vz = -f.z * 8;
        sim.banner = "Roll";
        sim.bannerT = 0.5;
        return;
      }
      const stay = sim.stickY > 0.62;
      const back = sim.stickY > 0.35;
      const ahead = sim.stickY < -0.35;
      if (atk && stay) {
        sim.bufAtk = 0;
        p.stateT += 0.75;
        sim.banner = "Stay down";
        sim.bannerT = 0.5;
        return;
      }
      if (atk && back) {
        sim.bufAtk = 0;
        const f = forward(p.yaw);
        p.state = "free";
        p.iframe = 0.42;
        p.vx = -f.x * 9;
        p.vz = -f.z * 9;
        sim.banner = "Roll";
        sim.bannerT = 0.55;
        sim.sfx.push("dash");
        return;
      }
      if (atk && !stay && !back && !ahead) {
        const foe = nearestGrunt(sim, 1.35);
        if (foe) {
          sim.bufAtk = 0;
          const f = forward(p.yaw);
          hurt(sim, foe, 12, 22, f.x * 4, f.z * 4, 3.4, "low");
          p.state = "free";
          p.iframe = 0.2;
          sim.banner = "Wake-up sweep";
          sim.bannerT = 0.6;
          return;
        }
      }
      if (atk && ahead) {
        sim.bufAtk = 0;
        p.iframe = 0.18;
        p.state = "free";
        beginSwing(sim, p);
        p.swing = 4;
        p.stateT = swingDur(4);
        sim.banner = "Rising strike";
        sim.bannerT = 0.6;
        return;
      }
      if (atk && p.stateT < 0.42) {
        sim.bufAtk = 0;
        p.iframe = 0.12;
        p.state = "free";
        beginSwing(sim, p);
        p.swing = 2;
        p.stateT = swingDur(2);
        sim.banner = "While rising";
        sim.bannerT = 0.6;
        return;
      }
      if (atk) {
        sim.bufAtk = 0;
        sim.pair = sim.martial === "capoeira" ? "corkscrew" : "kip";
        sim.pairT = 0.9;
        p.state = "free";
        p.iframe = 0.55;
        p.vy = Math.max(p.vy, 3.4);
        sim.banner = sim.pair === "corkscrew" ? "Corkscrew kip" : "Kip up";
        sim.bannerT = 0.8;
        sim.sfx.push("jump");
        return;
      }
    }
    if (p.state === "hit" && atk && p.stateT > 0.16) {
      sim.bufAtk = 0;
      p.state = "free";
      p.stateT = 0;
      p.iframe = 0.32;
      sim.pair = "block";
      sim.pairT = 0.4;
      sim.flow = Math.min(100, sim.flow + 16);
      sim.banner = "Reversal";
      sim.bannerT = 0.6;
      const foe = nearestGrunt(sim, 2.2);
      if (foe) {
        const f = forward(p.yaw);
        foe.state = "hit";
        foe.stateT = 0.42;
        foe.vx = f.x * 7;
        foe.vz = f.z * 7;
      }
      return;
    }
    if (sim.mode === "belt" && p.state === "hit") return;
    p.stateT -= dt;
    p.vx *= Math.exp(-8 * dt);
    p.vz *= Math.exp(-8 * dt);
    if (p.stateT <= 0) {
      if (p.hp <= 0) respawn(sim);
      else p.state = "free";
    }
    return;
  }
  if (p.state === "launch") return;
  if (p.state === "dash") {
    p.stateT -= dt;
    if (p.stateT <= 0) p.state = "free";
    return;
  }
  if (p.state === "spin") {
    p.stateT -= dt;
    applyMove(sim, p, dt, 0.35);
    p.yaw += 12 * dt;
    sim.spinPulse -= dt;
    if (sim.spinPulse <= 0) {
      sim.spinPulse = 0.14;
      const f = forward(p.yaw);
      hitGrunts(sim, p.x, p.z, 2.15, 11, 7.5, 1.4, 12, f.x, f.z);
      if (hitProps(sim, p.x, p.z, 2.15)) wearWeapon(sim, p);
    }
    if (p.stateT <= 0) p.state = "free";
    return;
  }
  if (p.state === "grab") {
    p.vx = 0;
    p.vz = 0;
    const e = sim.bodies.find((b) => b.id === sim.grabId);
    if (!e || !e.alive) {
      sim.grabId = -1;
      sim.pair = "";
      sim.pairT = 0;
      p.state = "free";
      return;
    }
    if (dashEdge && sim.pair !== "mount") {
      const f = forward(p.yaw);
      e.state = "hit";
      e.stateT = 0.4;
      e.vx = -f.x * 7;
      e.vz = -f.z * 7;
      e.vy = 0;
      p.state = "free";
      sim.grabId = -1;
      sim.pair = "";
      sim.banner = "Broke the hold";
      sim.bannerT = 0.6;
      return;
    }
    if (sim.pair !== "mount") {
      const f = forward(p.yaw);
      e.x = p.x + f.x * 0.52;
      e.z = p.z + f.z * 0.52;
      e.y = Math.max(0, p.y);
      e.yaw = p.yaw + Math.PI;
      e.vx = 0;
      e.vz = 0;
      e.vy = 0;
      e.state = "grab";
    }
    if (sim.pair === "mount") {
      e.state = "down";
      e.vx = 0;
      e.vz = 0;
      e.vy = 0;
      e.stateT = Math.max(e.stateT, 0.45);
      if (!e.alive || e.hp <= 0) {
        sim.grabId = -1;
        sim.pair = "";
        p.state = "free";
        return;
      }
      if (grab && sim.stickY > 0.3) {
        sim.bufGrab = 0;
        sim.grabId = -1;
        sim.pair = "";
        p.state = "free";
        sim.banner = "Stand";
        sim.bannerT = 0.4;
        return;
      }
      if (atk) {
        sim.bufAtk = 0;
        const side = Math.abs(sim.stickX) > 0.45;
        const heavy = sim.stickY < -0.3;
        const dmg = heavy ? 14 : side ? 7 : 9;
        e.hp -= dmg;
        e.poise = Math.max(0, e.poise - 6);
        p.meter = Math.min(100, p.meter + 5);
        sim.hitstop = 0.04;
        sim.sfx.push("hit");
        sim.combo += 1;
        sim.comboT = 1.1;
        e.state = "down";
        e.stateT = 1.2;
        sim.banner = heavy ? "Ground and pound" : side ? "Side control" : "Mount";
        sim.bannerT = 0.55;
        if (e.hp <= 0) {
          e.hp = 0;
          e.alive = false;
          e.state = "out";
          sim.grabId = -1;
          sim.pair = "";
          p.state = "free";
        }
      }
      p.stateT -= dt;
      if (p.stateT <= 0) {
        e.state = "free";
        p.state = "free";
        sim.grabId = -1;
        sim.pair = "";
      }
      return;
    }
    p.stateT -= dt;
    if (sim.bufUse > 0) {
      sim.bufUse = 0;
      let dx = sim.aimX;
      let dz = sim.aimZ;
      const m = Math.hypot(dx, dz);
      if (m < 0.25) {
        const f = forward(p.yaw);
        dx = f.x;
        dz = f.z;
      } else {
        dx /= m;
        dz /= m;
      }
      e.vx = dx * 12;
      e.vz = dz * 12;
      e.vy = 1.1;
      e.slam = true;
      e.state = "throw";
      e.stateT = 0.35;
      p.state = "free";
      sim.grabId = -1;
      sim.pair = "";
      sim.banner = "Shove";
      sim.bannerT = 0.6;
      return;
    }
    if (sim.pairT > 0) {
      sim.pairT -= dt;
      p.throwT = Math.max(0, sim.pairT);
      e.throwT = Math.max(0, sim.pairT);
      if (sim.pairT > 0) return;
      e.vx = sim.pairVx;
      e.vz = sim.pairVz;
      e.vy = sim.pairVy;
      e.hp -= sim.pairDmg;
      e.slam = true;
      e.state = "throw";
      e.stateT = 0.48;
      p.state = "free";
      p.throwT = 0.2;
      sim.grabId = -1;
      sim.pair = "";
      if (e.hp <= 0) {
        e.hp = 0;
        e.alive = false;
        e.state = "out";
      }
      return;
    }
    if (grab) throwEnemy(sim, e);
    else if (atk) {
      sim.bufAtk = 0;
      e.hp -= 8;
      e.poise -= 7;
      p.meter = Math.min(100, p.meter + 6);
      sim.hitstop = 0.035;
      sim.sfx.push("hit");
      burst(sim, e.x, e.y + 1, e.z, 0xf0b429);
      if (e.hp <= 0) {
        e.hp = 0;
        e.alive = false;
        e.state = "out";
        p.state = "free";
        sim.grabId = -1;
      }
    } else if (p.stateT <= 0) {
      e.state = "free";
      e.iframe = 0.2;
      p.state = "free";
      sim.grabId = -1;
      sim.banner = "Slipped the lock";
      sim.bannerT = 0.6;
    }
    return;
  }
  if (p.state === "atk") {
    if (sim.mode === "belt") return;
    const dur = swingDur(p.swing);
      const startup = p.swing >= 5 ? 0.08 : p.swing >= 4 ? 0.09 : p.swing === 3 ? SPEC.launchStartup : p.swing === 2 ? SPEC.crossStartup : SPEC.jabStartup;
    const elapsed = dur - p.stateT;
    const recovery = elapsed >= startup + SPEC.active;
    if (recovery && dashEdge) {
      startDash(sim, p);
      return;
    }
    if (recovery && (atk || sim.bufAtk > 0)) {
      beginSwing(sim, p);
      return;
    }
    if (!p.swung && elapsed >= startup && elapsed < startup + SPEC.active) {
      p.swung = true;
      const f = forward(p.yaw);
      let lift = p.swing === 5 ? 0.3 : p.swing === 4 ? 2.8 : p.swing === 3 ? sim.tune.launcher : p.swing === 2 ? 2.4 : 0.2;
      let dmg = p.swing === 5 ? 11 : p.swing === 4 ? 15 : p.swing === 3 ? SPEC.launchDamage : p.swing === 2 ? SPEC.crossDamage : SPEC.jabDamage;
      let kb = p.swing === 5 ? 4.5 : p.swing === 4 ? 8 : p.swing === 3 ? 3.2 : p.swing === 2 ? 6.2 : 3.6;
      let call = "";
      if (p.swing >= 10) {
        lift = 1.3;
        dmg = 14;
        kb = 6.5;
        call = "Au";
      } else if (p.swing >= 9) {
        lift = 0.4;
        dmg = 20;
        kb = 7;
        call = "450 splash";
        p.yaw += 14 * (1 / 60);
      } else if (p.swing >= 8) {
        lift = 1.15;
        dmg = 24;
        kb = 5;
        call = "Frog splash";
      } else if (p.swing >= 7) {
        lift = 0.15;
        dmg = 16;
        kb = 3.4;
        call = "Senton";
      } else if (p.swing >= 6) {
        lift = 0.2;
        dmg = 18;
        kb = 13;
        call = p.y > 2.1 ? "Crossbody" : "Flying clothesline";
      } else if (p.swing === 4 && (sim.martial === "wrestling" || sim.martial === "catch" || sim.martial === "savate" || sim.martial === "muaythai")) {
        lift = 0.55;
        kb = 11;
        call = "Clothesline";
      }
      if (p.weapon === "pipe") {
        dmg *= 1.35;
        kb *= 1.2;
      } else if (p.weapon === "bottle") {
        dmg *= 1.1;
        kb *= 1.05;
      }
      const poise = p.swing >= 8 ? 26 : p.swing === 5 ? (sim.stance === "crane" ? 70 : 48) : p.swing >= 3 ? 18 : 11;
      const reach = p.swing === 10 ? 1.5 : p.swing === 9 || p.swing === 7 ? 1.85 : p.swing >= 6 ? 1.35 : p.swing >= 4 ? 1.05 : p.swing === 3 ? 0.95 : 0.78;
      const hx = p.swing === 9 || p.swing === 7 ? p.x : p.x + f.x * 0.85;
      const hz = p.swing === 9 || p.swing === 7 ? p.z : p.z + f.z * 0.85;
      const tag = p.swing === 5 ? "low" : p.swing === 3 || p.swing >= 6 ? "high" : "mid";
      const hit = hitGrunts(sim, hx, hz, reach, dmg, kb, lift, poise, f.x, f.z, tag);
      const smashed = hitProps(sim, p.x + f.x * 0.7, p.z + f.z * 0.7, reach + 0.35);
      if (hit && call) {
        sim.banner = call;
        sim.bannerT = 0.75;
      }
      if (hit || smashed) wearWeapon(sim, p);
      p.vx += f.x * 2.4;
      p.vz += f.z * 2.4;
    }
    if (atk) {
      p.queued = true;
      sim.bufAtk = 0;
    }
    p.stateT -= dt;
    if (p.stateT <= 0) {
      if (p.queued) beginSwing(sim, p);
      else {
        p.state = "free";
        p.comboWindow = 0.42;
      }
    }
    return;
  }

  if (dashEdge) {
    startDash(sim, p);
    return;
  }
  if (atk) {
    if (sim.mode !== "belt") {
      p.low = inputLikeDown(sim);
      beginSwing(sim, p);
      return;
    }
  }
  if (grab) {
    const downed = nearestDown(sim, 1.35);
    if (downed) {
      p.state = "grab";
      p.stateT = 2.6;
      downed.state = "down";
      downed.stateT = 2.6;
      downed.vx = 0;
      downed.vz = 0;
      downed.vy = 0;
      sim.grabId = downed.id;
      sim.pair = "mount";
      sim.pairT = 0;
      sim.bufGrab = 0;
      sim.banner = "Mount";
      sim.bannerT = 0.7;
      sim.sfx.push("grab");
      return;
    }
    const e = nearestGrunt(sim, sim.tune.grapple * (sim.stance === "drunken" ? 1.35 : 1));
    if (e && (e.state === "launch" || e.y > 0.75)) {
      const f = forward(p.yaw);
      e.hp -= 16;
      e.vx = f.x * 2;
      e.vz = f.z * 2;
      e.vy = -7;
      e.state = "down";
      e.stateT = 0.9;
      e.grounded = false;
      sim.bufGrab = 0;
      sim.banner = "Air slam";
      sim.bannerT = 0.7;
      sim.sfx.push("slam");
      if (e.hp <= 0) {
        e.hp = 0;
        e.alive = false;
        e.state = "out";
      }
      return;
    }
    if (e && Math.hypot(p.vx, p.vz) > 4.2) {
      const f = forward(p.yaw);
      p.state = "atk";
      p.swing = 6;
      p.swung = false;
      p.stateT = swingDur(6);
      p.vy = Math.max(p.vy, 1.6);
      p.vx = f.x * 9;
      p.vz = f.z * 9;
      sim.bufGrab = 0;
      sim.banner = "Spear";
      sim.bannerT = 0.6;
      sim.sfx.push("swing");
      return;
    }
    if (e) {
      commitFacing(sim, p);
      p.state = "grab";
      p.stateT = 1;
      e.state = "grab";
      e.vx = 0;
      e.vz = 0;
      e.vy = 0;
      sim.grabId = e.id;
      sim.bufGrab = 0;
      sim.banner = "Lock";
      sim.bannerT = 0.6;
      sim.sfx.push("grab");
    } else startDash(sim, p);
    return;
  }
  if (blast) {
    sim.bufBlast = 0;
    if (p.meter < SPEC.meterCost) {
      const rook = sim.bodies.find((a) => a.kind === "ally" && a.alive);
      if (rook) callRook(sim, rook);
      else sim.sfx.push("deny");
    } else {
      p.meter -= SPEC.meterCost;
      p.state = "spin";
      p.stateT = 0.56;
      sim.spinPulse = 0;
      sim.sfx.push("blast");
      return;
    }
  }
  if (jump && sim.coyote > 0 && sim.mode !== "belt") {
    if (Math.abs(sim.stickX) > 0.55 && Math.abs(sim.stickY) < 0.35) {
      startAu(sim, p);
      return;
    }
    p.vy = sim.tune.jumpV;
    p.grounded = false;
    sim.coyote = 0;
    sim.bufJump = 0;
    sim.sfx.push("jump");
  }
  if (sim.mode !== "belt") applyMove(sim, p, dt, sim.guard ? 0.4 : 1);
}

function startAu(sim: Sim, p: Body) {
  const side = sim.stickX >= 0 ? 1 : -1;
  const f = forward(p.yaw);
  p.state = "atk";
  p.swing = 10;
  p.swung = false;
  p.queued = false;
  p.comboWindow = 0;
  p.stateT = swingDur(10);
  p.vx = f.z * side * 8;
  p.vz = -f.x * side * 8;
  p.vy = 2.4;
  p.grounded = false;
  sim.coyote = 0;
  sim.bufJump = 0;
  sim.banner = "Au";
  sim.bannerT = 0.6;
  sim.sfx.push("swing");
}

function respawn(sim: Sim) {
  const p = sim.bodies[0];
  p.x = sim.spawnX;
  p.y = 0;
  p.z = sim.spawnZ;
  p.vx = 0;
  p.vy = 0;
  p.vz = 0;
  p.yaw = sim.spawnYaw;
  p.hp = p.maxHp;
  p.poise = SPEC.poisePlayer;
  p.state = "free";
  p.iframe = 1.15;
  p.alive = true;
  resetYoko(p);
  sim.camYaw = p.yaw;
  sim.banner = "Back on your feet";
  sim.bannerT = 1.15;
}

function nearestDown(sim: Sim, maxDist: number) {
  const p = sim.bodies[0];
  let best: Body | null = null;
  let bestD = maxDist;
  for (const e of sim.bodies) {
    if (e.kind !== "grunt" || !e.alive || e.state !== "down") continue;
    if (e.y > 0.6) continue;
    const d = Math.hypot(e.x - p.x, e.z - p.z);
    if (d <= bestD) {
      best = e;
      bestD = d;
    }
  }
  return best;
}

function glueGrab(sim: Sim) {
  if (sim.grabId < 0) return;
  const p = sim.bodies[0];
  const e = sim.bodies.find((b) => b.id === sim.grabId);
  if (!e || p.state !== "grab") return;
  const f = forward(p.yaw);
  if (sim.pair === "mount") {
    e.x = p.x + f.x * 0.2;
    e.z = p.z + f.z * 0.2;
    e.y = 0;
    e.yaw = p.yaw + Math.PI;
    e.vx = 0;
    e.vy = 0;
    e.vz = 0;
    p.y = Math.min(p.y, 0.2);
    return;
  }
  if (sim.pair) {
    e.x = p.x;
    e.z = p.z;
    e.y = p.y;
    e.yaw = p.yaw;
    e.vx = 0;
    e.vy = 0;
    e.vz = 0;
    return;
  }
  const ahead = sim.stickY < -0.35;
  const back = sim.stickY > 0.35;
  const grappler = sim.martial === "sambo" || sim.martial === "jiujitsu" || sim.martial === "wrestling" || sim.martial === "catch";
  if (ahead) {
    e.x = p.x + f.x * 0.45;
    e.z = p.z + f.z * 0.45;
    e.y = p.y + 2.2;
    e.yaw = p.yaw;
  } else if (back && (sim.martial === "sambo" || sim.martial === "jiujitsu")) {
    e.x = p.x - f.x * 0.2;
    e.z = p.z - f.z * 0.2;
    e.y = p.y + 1.45;
    e.yaw = p.yaw;
  } else if (back) {
    e.x = p.x - f.x * 0.15;
    e.z = p.z - f.z * 0.15;
    e.y = p.y + 1.05;
    e.yaw = p.yaw + Math.PI;
  } else if (grappler) {
    e.x = p.x;
    e.z = p.z;
    e.y = p.y + 1.35;
    e.yaw = p.yaw + Math.PI;
  } else {
    e.x = p.x + f.x * 0.85;
    e.z = p.z + f.z * 0.85;
    e.y = p.y;
    e.yaw = p.yaw + Math.PI;
  }
  e.vx = 0;
  e.vy = 0;
  e.vz = 0;
}

function overlapGoal(p: Body, boxes: Box[]) {
  return boxes.some(
    (b) => b.kind === "goal" && p.grounded && p.x > b.minX && p.x < b.maxX && p.z > b.minZ && p.z < b.maxZ && p.y >= b.maxY - 0.25,
  );
}

function refreshZone(sim: Sim) {
  const z = sim.bodies[0].z;
  let next = sim.mode;
  if (sim.mode === "belt") {
    if (z > -13.2) next = "roam";
  } else if (sim.mode === "platform") {
    if (z < 14.2) next = "roam";
  } else if (z < -15.4) next = "belt";
  else if (z > 15.6) next = "platform";
  if (next === sim.mode) return;
  if (sim.mode === "belt" && next !== "belt") {
    const p = sim.bodies[0];
    if (p && (p.state === "atk" || p.state === "hit")) p.state = "free";
    for (const b of sim.bodies) {
      if (b.home === "street" && b.alive && (b.state === "atk" || b.state === "hit")) b.state = "free";
    }
  }
  if (next === "belt") {
    sim.yokoClock = 0;
    for (const b of sim.bodies) {
      if (b.kind !== "player" && b.home !== "street") continue;
      b.vx = 0;
      b.vz = 0;
      if (b.kind === "player") resetYoko(b);
      else b.facingLeft = Math.sin(b.yaw) > 0;
    }
  }
  sim.mode = next;
  sim.orbit = 0;
  if (next === "roam") sim.camYaw = 0;
  sim.banner = next === "belt" ? "Yokosuka street. J punch, down+J kick." : next === "platform" ? "Coil scaffolds" : "Cinder ward";
  sim.bannerT = 1.5;
}

function living(sim: Sim, home: Home) {
  return sim.bodies.some((b) => b.kind === "grunt" && b.home === home && b.alive && b.name !== "The Lease");
}

function updateAlly(sim: Sim, dt: number) {
  if (sim.mode === "belt") return;
  const p = sim.bodies[0];
  if (!p) return;
  for (const a of sim.bodies) {
    if (a.kind !== "ally" || !a.alive) continue;
    a.iframe = Math.max(0, a.iframe - dt);
    a.cd = Math.max(0, a.cd - dt);
    if (a.state === "hit" || a.state === "down" || a.state === "launch") {
      a.stateT -= dt;
      a.vx *= Math.exp(-6 * dt);
      a.vz *= Math.exp(-6 * dt);
      if (a.stateT <= 0) a.state = "free";
      continue;
    }
    if (a.state === "windup") {
      a.stateT -= dt;
      if (a.stateT <= 0) {
        a.state = "atk";
        a.stateT = 0.22;
        a.swung = false;
      }
      continue;
    }
    if (a.state === "atk") {
      a.stateT -= dt;
      if (!a.swung && a.stateT < 0.14) {
        a.swung = true;
        const f = forward(a.yaw);
        for (const foe of sim.bodies) {
          if (foe.kind !== "grunt" || !foe.alive) continue;
          if (Math.hypot(foe.x - a.x, foe.z - a.z) > 1.35) continue;
          hurt(sim, foe, 9, 12, f.x * 6, f.z * 6, 1.4);
        }
      }
      if (a.stateT <= 0) {
        a.state = "free";
        a.cd = 0.55;
      }
      continue;
    }
    let foe: Body | null = null;
    let best = 14;
    for (const e of sim.bodies) {
      if (e.kind !== "grunt" || !e.alive) continue;
      const d = Math.hypot(e.x - a.x, e.z - a.z);
      if (d < best) {
        best = d;
        foe = e;
      }
    }
    const tx = foe ? foe.x : p.x + 1.3;
    const tz = foe ? foe.z : p.z + 0.4;
    const dx = tx - a.x;
    const dz = tz - a.z;
    const d = Math.hypot(dx, dz) || 1;
    if (foe && a.cd <= 0 && (d < 1.25 || (foe.state === "launch" && d < 2.4))) {
      a.state = "windup";
      a.stateT = 0.28;
      a.yaw = yawFromDir(dx, dz);
      a.vx = 0;
      a.vz = 0;
      continue;
    }
    const speed = foe ? sim.tune.enemySpeed * 1.05 : sim.tune.moveSpeed * 0.92;
    const k = 1 - Math.exp(-8 * dt);
    a.vx += ((dx / d) * speed - a.vx) * k;
    a.vz += ((dz / d) * speed - a.vz) * k;
    if (d > 0.4) a.yaw = approachAngle(a.yaw, yawFromDir(dx, dz), 10, dt);
  }
}

function ensureCrew(sim: Sim) {
  const p = sim.bodies[0];
  if (!p || sim.bout !== "off") return;
  const wantPartner = sim.story ? sim.mission >= 1 : sim.plazaClear;
  if (wantPartner && !sim.bodies.some((b) => b.kind === "ally")) {
    sim.bodies.push(
      blankBody(sim, {
        kind: "ally",
        name: "Rook",
        arch: "hood",
        x: p.x + 1.4,
        z: p.z,
        home: "plaza",
        hp: 90,
        maxHp: 90,
      }),
    );
    sim.banner = "Rook steps in";
    sim.bannerT = 1.6;
  }
  if (sim.story) return;
  if (!sim.leaseSpawned && sim.plazaClear && sim.streetClear && sim.scaffoldClear && sim.marketClear) {
    summonLease(sim);
  }
}

function summonLease(sim: Sim) {
  if (sim.leaseSpawned) return;
  sim.leaseSpawned = true;
  addGrunt(sim, 0.4, 3.2, 0, "plaza", "brute");
  const boss = sim.bodies[sim.bodies.length - 1];
  if (boss) {
    boss.name = "The Lease";
    boss.hp = 180;
    boss.maxHp = 180;
  }
  sim.banner = "The lease";
  sim.bannerT = 1.8;
}

function focusPack(sim: Sim) {
  const mission = missionAt(sim.mission);
  for (const b of sim.bodies) {
    if (b.kind !== "grunt" || b.name === "The Lease") continue;
    const keep = mission.home === "all" || b.home === mission.home;
    if (!keep) {
      b.alive = false;
      b.hp = 0;
      b.state = "out";
      continue;
    }
    const base = b.arch === "brute" ? 120 : b.arch === "runner" ? 44 : b.arch === "hood" ? 56 : b.arch === "hex" ? 72 : 64;
    b.alive = true;
    b.state = "free";
    b.stateT = 0;
    b.x = b.homeX;
    b.z = b.homeZ;
    b.y = b.home === "scaffold" ? 2.4 : 0;
    b.vx = 0;
    b.vz = 0;
    b.maxHp = Math.round(base * mission.hp);
    b.hp = b.maxHp;
  }
}

function advanceStory(sim: Sim) {
  if (!sim.story || sim.missionClear) return;
  const pack = sim.bodies.some((b) => b.kind === "grunt" && b.alive);
  if (pack) return;
  if (sim.wave < sim.waveMax) {
    sim.wave += 1;
    focusPack(sim);
    sim.banner = `Wave ${sim.wave}`;
    sim.bannerT = 1.2;
    return;
  }
  sim.missionClear = true;
  sim.paused = true;
  sim.banner = "Job done";
  sim.bannerT = 2;
  const next = Math.min(MISSIONS.length, sim.mission + 1);
  if (next > sim.clearedMission) {
    sim.clearedMission = next;
    saveCleared(next);
  }
}

export function step(sim: Sim, input: FrameInput, dt: number) {
  sim.sfx.length = 0;
  sim.time += dt;
  const atkEdge = input.attack && !sim.prevAtk;
  const grabEdge = input.grab && !sim.prevGrab;
  const blastEdge = input.blast && !sim.prevBlast;
  const jumpEdge = input.jump && !sim.prevJump;
  const dashEdge = input.dash && !sim.prevDash;
  const useEdge = input.use && !sim.prevUse;
  sim.prevAtk = input.attack;
  sim.prevGrab = input.grab;
  sim.prevBlast = input.blast;
  sim.prevJump = input.jump;
  sim.prevDash = input.dash;
  sim.prevUse = input.use;
  if (atkEdge) sim.bufAtk = 0.16;
  else sim.bufAtk = Math.max(0, sim.bufAtk - dt);
  if (grabEdge) sim.bufGrab = 0.16;
  else sim.bufGrab = Math.max(0, sim.bufGrab - dt);
  if (blastEdge) sim.bufBlast = 0.16;
  else sim.bufBlast = Math.max(0, sim.bufBlast - dt);
  if (jumpEdge) sim.bufJump = 0.14;
  else sim.bufJump = Math.max(0, sim.bufJump - dt);
  if (useEdge) sim.bufUse = 0.2;
  else sim.bufUse = Math.max(0, sim.bufUse - dt);

  if (!sim.running || sim.paused) return;
  if (sim.hitstop > 0) {
    sim.hitstop -= dt;
    sim.shake *= Math.exp(-8 * dt);
    return;
  }

  steer(sim, input);
  sim.stickY = input.y;
  sim.stickX = input.x;
  updatePlayer(sim, dt, dashEdge);
  updateEnemies(sim, dt);
  updateAlly(sim, dt);
  tickYokosukaBelt(sim, input, dt);
  for (const b of sim.bodies) moveBody(sim, b, dt);
  for (let i = 0; i < sim.bodies.length; i++) {
    const a = sim.bodies[i];
    if (!a.alive || a.state === "out" || a.state === "grab" || a.state === "throw") continue;
    for (let j = i + 1; j < sim.bodies.length; j++) {
      const b = sim.bodies[j];
      if (!b.alive || b.state === "out" || b.state === "grab" || b.state === "throw") continue;
      let dx = b.x - a.x;
      let dz = b.z - a.z;
      const d = Math.hypot(dx, dz);
      if (d >= 0.72 || Math.abs(a.y - b.y) > 1.2) continue;
      if (d < 1e-4) {
        dx = 1;
        dz = 0;
      }
      const push = (0.72 - d) / 2 / Math.max(d, 1e-4);
      a.x -= dx * push;
      a.z -= dz * push;
      b.x += dx * push;
      b.z += dz * push;
    }
  }
  const holder = sim.bodies[0];
  const held = holder && holder.state === "grab" ? sim.bodies.find((b) => b.id === sim.grabId) : undefined;
  if (holder && held && sim.pair !== "mount") {
    const f = forward(holder.yaw);
    held.x = holder.x + f.x * 0.52;
    held.z = holder.z + f.z * 0.52;
    held.y = Math.max(0, holder.y);
    held.yaw = holder.yaw + Math.PI;
    held.vx = 0;
    held.vz = 0;
    held.vy = 0;
    eject(sim, held);
  }
  glueGrab(sim);

  const p = sim.bodies[0];
  if (sim.pulse) {
    if (hitProps(sim, sim.pulse.x, sim.pulse.z, sim.pulse.r)) sim.landed = true;
    sim.pulse = null;
  }
  if (sim.landed) wearWeapon(sim, p);
  sim.landed = false;
  p.throwT = Math.max(0, p.throwT - dt);
  p.pickupT = Math.max(0, p.pickupT - dt);
  p.wearT = Math.max(0, p.wearT - dt);
  if (!sim.sawHouse && p.x < -7.6 && p.x > -17.4 && p.z < -5.5 && p.z > -12.2) {
    sim.sawHouse = true;
    sim.banner = "Noodle house. The pipe is on the table.";
    sim.bannerT = 2.1;
  }
  if (!sim.sawMarket && sim.streetClear && p.x > 18 && p.z < -15) {
    sim.sawMarket = true;
    sim.banner = "Night market.";
    sim.bannerT = 1.8;
  }
  if (p.grounded) sim.coyote = 0.12;
  else sim.coyote = Math.max(0, sim.coyote - dt);
  if (p.state === "free") p.poise = Math.min(SPEC.poisePlayer, p.poise + 7 * dt);
  p.comboWindow = Math.max(0, p.comboWindow - dt);
  sim.springLock = Math.max(0, sim.springLock - dt);
  sim.comboT -= dt;
  if (sim.comboT <= 0) sim.combo = 0;
  sim.bannerT -= dt;
  if (sim.bannerT <= 0) sim.banner = "";
  sim.shake *= Math.exp(-3.2 * dt);

  refreshZone(sim);
  refreshScuffle(sim, dt);
  if (sim.mode === "roam") sim.camYaw = sim.orbit;

  for (let i = sim.particles.length - 1; i >= 0; i--) {
    const bit = sim.particles[i];
    bit.life -= dt;
    if (bit.life <= 0) {
      sim.particles.splice(i, 1);
      continue;
    }
    bit.vy -= 16 * dt;
    bit.x += bit.vx * dt;
    bit.y += bit.vy * dt;
    bit.z += bit.vz * dt;
    if (bit.y < 0) {
      bit.y = 0;
      bit.vy *= -0.25;
    }
  }

  let foes = 0;
  for (const b of sim.bodies) if (b.kind === "grunt" && b.alive) foes += 1;
  sim.foes = foes;
  sim.flow = Math.max(0, sim.flow - dt * 4);
  if (sim.bout === "exhibit" && foes === 0 && sim.running && !sim.paused) {
    sim.paused = true;
    sim.bout = "done";
    sim.banner = "Exhibition clear";
    sim.bannerT = 2;
  }
  sim.canGrab = p.state === "free" && nearestGrunt(sim, sim.tune.grapple * (sim.stance === "drunken" ? 1.35 : 1)) != null;

  const wasStreet = sim.streetClear;
  const wasPlaza = sim.plazaClear;
  sim.streetClear = !living(sim, "street");
  sim.plazaClear = !living(sim, "plaza");
  sim.marketClear = !living(sim, "market");
  ensureCrew(sim);
  advanceStory(sim);
  if (!sim.story && !sim.scaffoldClear && overlapGoal(p, sim.boxes)) {
    sim.scaffoldClear = true;
    sim.banner = "Pylon lit";
    sim.bannerT = 2.2;
    sim.sfx.push("win");
  }
  if (!wasStreet && sim.streetClear) {
    sim.banner = "Gate's open";
    sim.bannerT = 2.2;
    sim.sfx.push("win");
  }
  if (!sim.story && !sim.cleared && sim.streetClear && sim.plazaClear && sim.scaffoldClear) {
    sim.cleared = true;
    sim.banner = "Circuit clear";
    sim.bannerT = 6;
    sim.sfx.push("win");
  } else if (!wasPlaza && sim.plazaClear && !sim.cleared) {
    sim.banner = "Plaza clear";
    sim.bannerT = 1.8;
  }
}

export function snapshot(sim: Sim): Hud {
  const p = sim.bodies[0];
  return {
    running: sim.running,
    paused: sim.paused,
    mode: sim.mode,
    hp: p?.hp ?? 100,
    maxHp: p?.maxHp ?? 100,
    meter: p?.meter ?? 0,
    poise: p?.poise ?? SPEC.poisePlayer,
    maxPoise: SPEC.poisePlayer,
    combo: sim.combo,
    foes: sim.foes,
    banner: sim.banner,
    canGrab: sim.canGrab,
    cleared: sim.cleared,
    streetClear: sim.streetClear,
    scaffoldClear: sim.scaffoldClear,
    plazaClear: sim.plazaClear,
    tune: sim.tune,
    weapon: p?.weapon ?? "fist",
    area: areaOf(p),
    phase: sim.phase,
    phaseStep: sim.phaseStep,
    scuffle: sim.scuffle,
    marketClear: sim.marketClear,
    style: sim.style,
    job: jobNow({
      plazaClear: sim.plazaClear,
      streetClear: sim.streetClear,
      scaffoldClear: sim.scaffoldClear,
      marketClear: sim.marketClear,
      leaseDown: sim.leaseSpawned && !sim.bodies.some((b) => b.name === "The Lease" && b.alive),
    }).title,
    jobStep: jobNow({
      plazaClear: sim.plazaClear,
      streetClear: sim.streetClear,
      scaffoldClear: sim.scaffoldClear,
      marketClear: sim.marketClear,
      leaseDown: sim.leaseSpawned && !sim.bodies.some((b) => b.name === "The Lease" && b.alive),
    }).step,
    martial: sim.martial,
    stance: sim.stance,
    bout: sim.bout,
    flow: Math.round(sim.flow),
    story: sim.story,
    mission: sim.mission,
    missionTitle: sim.story ? missionAt(sim.mission).title : "",
    missionStep: sim.story ? missionAt(sim.mission).step : "",
    actName: sim.story ? missionAt(sim.mission).actName : "",
    wave: sim.wave,
    waveMax: sim.waveMax,
    missionClear: sim.missionClear,
    clearedMission: sim.clearedMission,
    build: sim.build,
    crowd: sim.crowd,
    height: sim.height,
    bulk: sim.bulk,
    head: sim.head,
    leg: sim.leg,
    shoulder: sim.shoulder,
    headDmg: p?.head ?? 100,
    chestDmg: p?.chest ?? 100,
    legsDmg: p?.legs ?? 100,
  };
}

function refreshScuffle(sim: Sim, dt: number) {
  const p = sim.bodies[0];
  if (!p) return;
  const was = sim.scuffle;
  if (was && !living(sim, was)) {
    sim.scuffle = "";
    sim.clearT = 1.6;
    sim.banner = "Block's quiet";
    sim.bannerT = 1.5;
  } else if (!was) {
    const homes: Home[] = ["plaza", "street", "market", "scaffold"];
    for (const home of homes) {
      if (engaged(home, p) && living(sim, home)) {
        sim.scuffle = home;
        sim.banner = "Scuffle";
        sim.bannerT = 1.1;
        break;
      }
    }
  }
  sim.clearT = Math.max(0, sim.clearT - dt);
  const id = sim.clearT > 0 && !sim.scuffle ? "clear" : resolvePhase({ scuffle: sim.scuffle !== "", weapon: p.weapon, combo: sim.combo, canGrab: sim.canGrab });
  const copy = phaseCopy(id);
  sim.phase = copy.id;
  sim.phaseStep = copy.step;
}

function areaOf(p: Body | undefined) {
  if (!p) return "plaza";
  if (p.x < -7.6 && p.x > -17.4 && p.z < -5.5 && p.z > -12.2) return "house";
  if (p.z < -14.4 && p.x > 16) return "market";
  if (p.z < -14.4) return "street";
  if (p.z > 15) return "scaffolds";
  return "plaza";
}
