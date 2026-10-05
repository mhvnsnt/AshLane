import { clampTune, SPEC, type Hud, type Mode, type Tune } from "./spec";
import { phaseCopy, resolvePhase } from "./parallel";
import { jobNow } from "./jobs";
import { missionAt, placeName, saveCleared, MISSIONS } from "./campaign";
import { motionDur, motionReady } from "./motion-bank";
import { fighterById } from "./roster";
import { LEASE_NAME, PARTNER, claimWard, resetWard, wardByName } from "./ward";
import { resetYoko, tickYokosukaBelt } from "./yokosuka/belt";
import { createLockOn, lockOnPress, lockOnUpdate, clearLock, type LockOnState } from "./federated/lockon";
import { pickFreeflowTarget, freeflowLunge } from "./federated/freeflow";
import { requestAttack, releaseAttack, type GroupAIState } from "./federated/groupai";
import {
  tickSimServices, tryParry, resolveParry, comboDamageScale, styleFor,
  type GameServices,
} from "./services";

export type Phase = "free" | "atk" | "hit" | "launch" | "down" | "grab" | "throw" | "dash" | "spin" | "windup" | "out";
export type Home = "plaza" | "street" | "scaffold" | "market" | "yard" | "dock" | "under" | "ring" | "cage" | "subway" | "crane" | "office";
export type Arch = "brawler" | "runner" | "brute" | "hood" | "hex";
export type Weapon = "fist" | "pipe" | "bottle" | "board" | "blade" | "spear";

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
  stopT: number;
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
  stun: number;
  head: number;
  chest: number;
  legs: number;
  wake: number;
  landed: boolean;
  prone: boolean;
  route: string;
  link: number;
};

export type BoxKind = "wall" | "plat" | "spring" | "goal" | "gate" | "rope" | "open";

export type Box = {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  kind: BoxKind;
  hp: number;
  role: "" | "door" | "cage" | "weak";
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
  kind: "crate" | "pipe" | "bottle" | "chair" | "table" | "board" | "car" | "blade" | "spear";
  x: number;
  y: number;
  z: number;
  hp: number;
  maxHp: number;
  crush: number;
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
  who: string;
  bio: string;
  cast: string;
  stance: string;
  stage: string;
  venueX: number;
  venueZ: number;
  venueR: number;
  backupT: number;
  backups: number;
  door: number;
  doorHits: number;
  doorBroke: boolean;
  rearLock: boolean;
  xp: number;
  level: number;
  grip: number;
  squeezeT: number;
  bout: string;
  flow: number;
  pair: string;
  pairT: number;
  pairAtk: number;
  pairVic: number;
  pairLen: number;
  lockArm: number;
  group: GroupAIState;
  lock: LockOnState;
  bufLock: number;
  prevLock: boolean;
  rush: boolean;
  chain: boolean;
  chains: number;
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
  purse: number;
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
  lowGuard: boolean;
  guardT: number;
  build: "chibi" | "full";
  crowd: "mix" | "chibi" | "full";
  height: number;
  bulk: number;
  head: number;
  leg: number;
  shoulder: number;
  block: number;
  /** Wired module hub (services.ts). Null until mount() attaches it. */
  services: GameServices | null;
  prevCounter: boolean;
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
  lock?: boolean;
  /** just-frame parry button (touch CTR / KeyC) — wired to federated/counters.ts */
  counter?: boolean;
};

const R = 0.42;
const STREET = ["Cinder", "Bolt", "Moth", "Vesper", "Kiln", "Ashen", "Piton", "Rook", "Soot", "Latch", "Nim", "Hark"];

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

function box(minX: number, maxX: number, minZ: number, maxZ: number, h: number, kind: BoxKind, hp = 0, role: Box["role"] = ""): Box {
  return { minX, maxX, minY: 0, maxY: h, minZ, maxZ, kind, hp, role };
}

function buildBoxes(): Box[] {
  return [
    box(-26, -2, -26, -24, 3, "wall"),
    box(4, 48, -26, -24, 3, "wall"),
    box(-26, -6, 24, 26, 3, "wall"),
    box(-1, 26, 24, 26, 3, "wall"),
    box(-26, -24, -26, -1, 3, "wall"),
    box(-26, -24, 5, 26, 3, "wall"),
    box(-48, -46, -14, -3, 3, "wall"),
    box(-48, -46, 3, 14, 3, "wall"),
    box(-48, -24, -14, -12, 3, "wall"),
    box(-48, -24, 12, 14, 3, "wall"),
    box(-40, -37.2, -4, -1.2, 1.5, "wall"),
    box(-34.2, -32, 3.4, 6.6, 1.7, "wall"),
    box(-44.4, -42.2, 1.2, 5.4, 2.1, "wall"),
    box(-10, -8, 24, 46, 2.4, "wall"),
    box(6, 8, 24, 46, 2.4, "wall"),
    box(-10, -3, 44, 46, 2.6, "wall"),
    box(3, 8, 44, 46, 2.6, "wall"),
    box(-4.2, -3, 31.6, 33.2, 1.5, "wall"),
    box(1.6, 2.8, 37.4, 39, 1.5, "wall"),
    box(-8, -6, -46, -24, 3, "wall"),
    box(6, 8, -46, -24, 3, "wall"),
    box(-8, -3, -48, -46, 3, "wall"),
    box(3, 8, -48, -46, 3, "wall"),
    box(-1.2, 0.4, -34.4, -33, 2.6, "wall"),
    box(1.8, 3.4, -40.6, -39.2, 2.6, "wall"),
    box(24, 26, -14.4, -2, 3, "wall"),
    box(24, 26, -2, 4, 3, "wall", 4, "weak"),
    box(24, 26, 4, 24, 3, "wall"),
    box(16.4, 48, -14.9, -14.2, 2.4, "wall"),
    box(46, 48, -26, -22, 3, "wall"),
    box(46, 48, -16, -14.2, 3, "wall"),
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
    box(21.4, 22.3, -19.2, -18.1, 1.15, "plat"),
    box(21.4, 22.3, -19.2, -18.1, 2.3, "plat"),
    box(21.4, 22.3, -19.2, -18.1, 3.4, "plat"),
    box(48, 62, 26, 28, 3, "wall"),
    box(48, 62, 36, 38, 3, "wall"),
    box(62, 78, 26, 27.5, 1.15, "rope"),
    box(62, 78, 36.5, 38, 1.15, "rope"),
    box(76.5, 78, 26, 38, 1.15, "rope"),
    box(62, 63.4, 26, 30.4, 1.15, "rope"),
    box(62, 63.4, 33.6, 38, 1.15, "rope"),
    box(62, 63.2, 26, 27.4, 3, "wall"),
    box(76.8, 78, 26, 27.4, 3, "wall"),
    box(62, 63.2, 36.6, 38, 3, "wall"),
    box(76.8, 78, 36.6, 38, 3, "wall"),
    box(-62, -48, -8, -6, 3, "wall"),
    box(-62, -48, 6, 8, 3, "wall"),
    box(-78, -76.4, -8, 8, 3.2, "wall", 8, "cage"),
    box(-78, -62, -8, -6.6, 3.2, "wall"),
    box(-78, -62, 6.6, 8, 3.2, "wall"),
    box(-63.4, -62, -8, -1.6, 3.2, "wall", 6, "cage"),
    box(-63.4, -62, 1.6, 8, 3.2, "wall", 6, "cage"),
    box(-14, -6, -78, -48, 3, "wall"),
    box(6, 14, -78, -48, 3, "wall"),
    box(-14, 14, -80, -78, 3, "wall"),
    box(-8, 8, 48, 54, 0.55, "plat"),
    box(-8, 8, 54, 58, 1.15, "plat"),
    box(-8, 8, 58, 62, 1.8, "plat"),
    box(-8, 8, 62, 66, 2.5, "plat"),
    box(-8, 8, 66, 78, 3.4, "plat"),
    box(-10, -8, 64, 78, 3.6, "wall"),
    box(8, 10, 64, 78, 3.6, "wall"),
    box(-8, -2, 76.4, 78, 3.6, "wall"),
    box(2, 8, 76.4, 78, 3.6, "wall"),
    box(48, 66, -22, -20, 3, "wall"),
    box(48, 66, -16, -14, 3, "wall"),
    box(66, 82, -36, -34, 3, "wall"),
    box(66, 82, -14, -12, 3, "wall"),
    box(80, 82, -36, -12, 3, "wall"),
    box(66, 68, -34, -22, 3, "wall"),
    box(66, 68, -20, -14, 3, "wall"),
  ];
}

function blankBody(sim: Sim, partial: Pick<Body, "kind" | "x" | "z"> & Partial<Body>): Body {
  const grunt = partial.kind === "grunt";
  return {
    id: sim.nextId++,
    name: grunt ? STREET[sim.nextId % STREET.length] : sim.who || "Bannon",
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
    stopT: 0,
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
    stun: partial.stun ?? 0,
    ...partial,
    head: partial.head ?? 100,
    chest: partial.chest ?? 100,
    legs: partial.legs ?? 100,
    wake: partial.wake ?? 0,
    landed: partial.landed ?? false,
    prone: partial.prone ?? false,
    route: partial.route ?? "n",
    link: partial.link ?? 0,
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
  const base = { build: "full" as const, crowd: "mix" as const, height: 1, bulk: 1, head: 1, leg: 1, shoulder: 1 };
  try {
    const raw = JSON.parse(localStorage.getItem("ashlane-shape-v2") || "{}") as { build?: string; crowd?: string; height?: number; bulk?: number; head?: number; leg?: number; shoulder?: number };
    const num = (value: unknown, min: number, max: number, fallback: number) => (typeof value === "number" && value >= min && value <= max ? value : fallback);
    return {
      build: raw.build === "chibi" ? "chibi" : "full",
      crowd: raw.crowd === "chibi" || raw.crowd === "full" || raw.crowd === "mix" ? raw.crowd : "mix",
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
  localStorage.setItem("ashlane-shape-v2", JSON.stringify({ build: sim.build, crowd: sim.crowd, height: sim.height, bulk: sim.bulk, head: sim.head, leg: sim.leg, shoulder: sim.shoulder }));
}

function callRook(sim: Sim, rook: Body) {
  const foe = nearestGrunt(sim, 8);
  if (!foe) {
    sim.sfx.push("deny");
    return;
  }
  const clip = motionDur("suplex") > 0 ? "suplex" : motionDur("backdrop") > 0 ? "backdrop" : motionDur("german") > 0 ? "german" : "";
  if (clip) {
    const span = Math.min(2.4, motionDur(clip));
    const face = forward(foe.yaw);
    sim.pair = clip;
    sim.pairT = span;
    sim.pairLen = span;
    sim.pairAtk = rook.id;
    sim.pairVic = foe.id;
    sim.pairVx = face.x * 8;
    sim.pairVy = 4;
    sim.pairVz = face.z * 8;
    sim.pairDmg = 16;
    rook.state = "grab";
    rook.stateT = span;
    rook.throwT = span;
    rook.x = foe.x + face.x * 0.7;
    rook.z = foe.z + face.z * 0.7;
    rook.y = foe.y;
    rook.yaw = yawFromDir(foe.x - rook.x, foe.z - rook.z);
    rook.vx = 0;
    rook.vz = 0;
    foe.state = "grab";
    foe.throwT = span;
    foe.iframe = span;
    foe.vx = 0;
    foe.vz = 0;
    sim.banner = "Tag throw";
    sim.bannerT = span;
    sim.sfx.push("throw");
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
    martial: "wrestling",
    who: "Bannon",
    bio: fighterById("bannon").bio,
    cast: "BANNON_muscular_skinned.glb",
    stance: "orthodox",
    stage: "ward",
    venueX: 0,
    venueZ: 0,
    venueR: 0,
    backupT: 0,
    backups: 0,
    door: 0,
    doorHits: 0,
    doorBroke: false,
    rearLock: false,
    xp: 0,
    level: 1,
    grip: 0,
    squeezeT: 0,
    bout: "off",
    flow: 0,
    pair: "",
    pairT: 0,
    pairAtk: -1,
    pairVic: -1,
    pairLen: 0,
    lockArm: 0,
    group: { activeAttackers: [] },
    lock: createLockOn(),
    bufLock: 0,
    prevLock: false,
    rush: false,
    chain: false,
    chains: 0,
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
    purse: 0,
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
    prevCounter: false,
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
    lowGuard: false,
    guardT: 0,
    block: 0,
    services: null,
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
  const who = claimWard(home, arch);
  g.name = who.name;
  sim.bodies.push(g);
  // Wired: urban-mayhem fighting style per archetype (192 discipline x modifier combos).
  if (sim.services) {
    const disc = arch === "brute" ? "wrestling" : arch === "runner" ? "kickboxing"
      : arch === "hood" ? "street_boxing" : arch === "hex" ? "muay_thai" : "mma";
    styleFor(sim.services, g.id, disc);
  }
}

/**
 * Spawn a grunt for an attention-system encounter (thugs / scouts / enforcer
 * backup). Exported for services.ts / mount.ts consumers.
 */
export function addAttentionGrunt(
  sim: Sim, x: number, z: number, arch: Arch, name?: string, hp?: number,
): void {
  addGrunt(sim, x, z, 0, "street", arch);
  const g = sim.bodies[sim.bodies.length - 1];
  if (name) g.name = name;
  if (hp !== undefined) {
    g.hp = hp;
    g.maxHp = hp;
  }
}

function addProp(sim: Sim, kind: Prop["kind"], x: number, y: number, z: number, hp: number, loot: Prop["loot"]) {
  sim.props.push({ id: sim.nextId++, kind, x, y, z, hp, maxHp: hp, crush: 0, alive: true, loot });
}

function carTop(prop: Prop) {
  return 1.15 * (1 - prop.crush * 0.72);
}

function dentCar(sim: Sim, prop: Prop, amount: number, fromSlam: boolean) {
  if (prop.kind !== "car" || !prop.alive) return;
  const before = prop.hp;
  prop.hp -= amount;
  sim.sfx.push(fromSlam ? "slam" : "hit");
  sim.shake = Math.min(1, sim.shake + (fromSlam ? 0.55 : 0.2));
  burst(sim, prop.x + (Math.random() - 0.5) * 2, 0.7 + Math.random() * 0.5, prop.z, before > prop.maxHp * 0.55 ? 0x9fd0e0 : 0x8a9098);
  const mid = prop.maxHp * 0.66;
  const low = prop.maxHp * 0.33;
  if (before > 0 && prop.hp <= 0) sim.banner = "The car caves in";
  else if (before > low && prop.hp <= low) sim.banner = "Roof caves";
  else if (before > mid && prop.hp <= mid) sim.banner = "Hood buckles";
  else if (fromSlam) sim.banner = "Slammed on the car";
  else sim.banner = "Dent";
  sim.bannerT = 1;
  if (prop.hp <= -8) {
    prop.alive = false;
    prop.hp = -8;
    sim.banner = "Scrapped";
    sim.bannerT = 1.3;
    burst(sim, prop.x, 0.4, prop.z, 0x6e2430);
  }
}

function spawnBodies(sim: Sim) {
  sim.bodies = [];
  sim.props = [];
  resetWard();
  sim.grabId = -1;
  sim.group.activeAttackers = [];
  clearLock(sim.lock);
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
  sim.bodies.push(blankBody(sim, { kind: "player", x: 0, z: 2, yaw: 0, name: "Bannon", home: "plaza" }));
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
  addGrunt(sim, -36, 2, 0, "yard", "brute");
  addGrunt(sim, -42, -6, 0, "yard", "runner");
  addGrunt(sim, -30, 7, 0, "yard", "hood");
  addGrunt(sim, -2, 32, 0, "dock", "hex");
  addGrunt(sim, 2, 38, 0, "dock", "brute");
  addGrunt(sim, 0, -32, 0, "under", "brawler");
  addGrunt(sim, -2, -40, 0, "under", "hood");
  addGrunt(sim, 3, -36, 0, "under", "runner");
  addGrunt(sim, 70, 32, 0, "ring", "brawler");
  addGrunt(sim, 74, 34, 0, "ring", "hood");
  addGrunt(sim, -70, 0, 0, "cage", "brute");
  addGrunt(sim, -66, -3, 0, "cage", "brawler");
  addGrunt(sim, 0, -68, 0, "subway", "runner");
  addGrunt(sim, -3, -64, 0, "subway", "hood");
  addGrunt(sim, 0, 72, 3.4, "crane", "hex");
  addGrunt(sim, 74, -26, 0, "office", "hex");
  addProp(sim, "spear", 66, 0.2, 30, 7, "");
  addProp(sim, "blade", -60, 0.2, 2, 6, "");
  addProp(sim, "crate", -15.4, 0, -8.2, 2, "");
  addProp(sim, "crate", 27.5, 0, -17.6, 2, "bottle");
  addProp(sim, "crate", 36.2, 0, -21.2, 2, "");
  addProp(sim, "table", -13.6, 0, -9.1, 2, "");
  addProp(sim, "chair", -11.2, 0, -8.2, 1, "");
  addProp(sim, "chair", -15.2, 0, -10.2, 1, "");
  addProp(sim, "table", 32.4, 0, -19.4, 2, "");
  addProp(sim, "chair", 30.2, 0, -18.2, 1, "");
  addProp(sim, "car", 11, 0, -21, 18, "");
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
  const dropped = sim.bodies[0];
  const spot = dropFor(mission.drop);
  if (dropped) {
    dropped.x = spot[0];
    dropped.z = spot[1];
    dropped.y = standY(mission.drop);
    sim.spawnX = dropped.x;
    sim.spawnZ = dropped.z;
    sim.camYaw = dropped.yaw;
  }
  const fight = dropFor(mission.home);
  sim.venueX = fight[0];
  sim.venueZ = fight[1];
  sim.venueR = mission.rule === "inside" ? 7.2 : 0;
  sim.backupT = 0;
  sim.backups = 0;
  focusPack(sim);
  if (mission.boss && mission.home === "office") {
    summonLease(sim);
    const boss = sim.bodies.find((b) => b.name === LEASE_NAME);
    const room = dropFor("office");
    if (boss) {
      boss.x = room[0] + 1.4;
      boss.z = room[1];
      boss.y = 0;
      boss.home = "office";
      boss.homeX = boss.x;
      boss.homeZ = boss.z;
    }
  }
  sim.banner = `${mission.title}. ${placeName(mission.drop)}`;
  sim.bannerT = 2.4;
  sim.stage = mission.stage;
}

function standY(home: string) {
  if (home === "scaffold") return 2.4;
  if (home === "crane") return 3.4;
  return 0;
}

function dropFor(home: string): [number, number] {
  if (home === "yard") return [-34, 0];
  if (home === "dock") return [0, 32];
  if (home === "under") return [0, -36];
  if (home === "street") return [-4, -18];
  if (home === "market") return [28, -18];
  if (home === "scaffold") return [0, 18];
  if (home === "ring") return [70, 32];
  if (home === "cage") return [-70, 0];
  if (home === "subway") return [0, -64];
  if (home === "crane") return [0, 70];
  if (home === "office") return [74, -24];
  return [0, 2];
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

function grantXp(sim: Sim, n: number) {
  const before = 1 + Math.floor(sim.xp / 100);
  sim.xp += n;
  const after = 1 + Math.floor(sim.xp / 100);
  sim.level = after;
  if (after > before) {
    const p = sim.bodies[0];
    if (p) {
      p.maxHp += 8;
      p.hp = Math.min(p.maxHp, p.hp + 8);
    }
    sim.banner = `Rank ${after}`;
    sim.bannerT = 1.2;
    saveCleared(sim.clearedMission, sim.purse, sim.xp);
  }
}

function breakGrab(sim: Sim) {
  if (sim.grabId < 0 && sim.bodies[0]?.state !== "grab") return;
  const p = sim.bodies[0];
  const e = sim.bodies.find((b) => b.id === sim.grabId);
  if (p?.state === "grab") p.state = "free";
  if (e && e.state === "grab") e.state = "hit";
  sim.grabId = -1;
  sim.group.activeAttackers = [];
  clearLock(sim.lock);
  sim.pair = "";
  sim.pairT = 0;
  sim.rearLock = false;
  sim.grip = 0;
}

function hurt(sim: Sim, b: Body, dmg: number, poiseDmg: number, kx: number, kz: number, lift: number, tag: "mid" | "low" | "high" = "mid") {
  if (!b.alive || b.iframe > 0 || b.state === "out") return false;
  if (b.kind === "player" && sim.martial === "capoeira" && b.state === "atk" && b.swing === 3 && tag === "high") {
    sim.banner = "Handstand";
    sim.bannerT = 0.4;
    return false;
  }
  if (b.kind === "player" && sim.martial === "capoeira" && b.state === "free" && tag !== "low" && Math.random() < 0.2) {
    sim.banner = "Ginga";
    sim.bannerT = 0.45;
    return false;
  }
  if (b.state === "grab") return false;
  if (b.kind === "player" && !b.grounded && b.y > 0.35 && tag === "low") {
    sim.banner = "Hopped the low";
    sim.bannerT = 0.4;
    return false;
  }
  if (b.kind === "player" && b.state === "dash") {
    if (b.stateT > 0.08) {
      for (const e of sim.bodies) {
        if (e.kind !== "grunt" || !e.alive || (e.state !== "atk" && e.state !== "windup")) continue;
        if (Math.hypot(e.x - b.x, e.z - b.z) > 1.8) continue;
        e.state = "hit";
        e.stateT = 0.7;
        e.poise = 0;
        e.vx = (e.x - b.x) * 2.2;
        e.vz = (e.z - b.z) * 2.2;
      }
      b.iframe = Math.max(b.iframe, 0.16);
      sim.banner = "Just frame";
      sim.bannerT = 0.55;
      sim.sfx.push("hit");
      return false;
    }
    dmg *= 1.5;
    sim.banner = "Counter hit";
    sim.bannerT = 0.55;
  }
  if (b.kind === "player" && b.state === "atk" && b.swing === 5 && tag === "high") {
    sim.banner = "Ducked it";
    sim.bannerT = 0.4;
    return false;
  }
  // Federated just-frame parry (counters.ts): the counter button opens a
  // ~167ms active window. resolveParry() is a no-op ("missed") when no
  // window is open, so this is safe to call on every player hit.
  if (b.kind === "player" && sim.services) {
    const res = resolveParry(sim.services, b.id, "jab");
    if (res === "countered") {
      for (const e of sim.bodies) {
        if (e.kind !== "grunt" || !e.alive || (e.state !== "atk" && e.state !== "windup")) continue;
        if (Math.hypot(e.x - b.x, e.z - b.z) > 2.2) continue;
        e.state = "hit";
        e.stateT = 0.8;
        e.poise = 0;
        e.vx = (e.x - b.x) * 2.6;
        e.vz = (e.z - b.z) * 2.6;
      }
      b.iframe = Math.max(b.iframe, 0.25);
      b.meter = Math.min(100, (b.meter ?? 0) + 20);
      sim.banner = "Counter!";
      sim.bannerT = 0.6;
      sim.sfx.push("hit");
      sim.flow = Math.min(100, sim.flow + 12);
      return false;
    }
    if (res === "traded") {
      dmg *= 0.4;
      sim.banner = "Traded";
      sim.bannerT = 0.4;
    }
  }
  const f = forward(b.yaw);
  const kl = Math.hypot(kx, kz) || 1;
  const facing = (kx / kl) * f.x + (kz / kl) * f.z;
  if (b.kind === "player" && sim.guard && b.state === "free" && facing < -0.2) {
    const covers = sim.lowGuard ? tag !== "high" : tag !== "low";
    if (covers && sim.guardT > 0) {
      for (const e of sim.bodies) {
        if (e.kind !== "grunt" || !e.alive || (e.state !== "atk" && e.state !== "windup")) continue;
        if (Math.hypot(e.x - b.x, e.z - b.z) > 1.8) continue;
        e.state = "hit";
        e.stateT = 0.62;
        e.poise = 0;
        e.vx = (e.x - b.x) * 2.4;
        e.vz = (e.z - b.z) * 2.4;
      }
      b.iframe = Math.max(b.iframe, 0.22);
      sim.guardT = 0;
      sim.banner = sim.lowGuard && tag === "low" ? "Low parry" : "Parry";
      sim.bannerT = 0.6;
      sim.sfx.push("hit");
      sim.flow = Math.min(100, sim.flow + 14);
      return false;
    }
    if (covers) {
      const broken = sim.block >= 4;
      sim.block = broken ? 0 : sim.block + 1;
      b.hp -= dmg * (broken ? 0.35 : 0.08);
      b.vx = kx * 0.12;
      b.vz = kz * 0.12;
      b.iframe = 0.1;
      sim.sfx.push("hit");
      sim.flow = Math.min(100, sim.flow + 4);
      sim.banner = broken ? "Guard break" : sim.lowGuard ? "Low block" : "Block";
      sim.bannerT = 0.4;
      if (!sim.pair) {
        sim.pair = "defender";
        sim.pairT = 0.16;
      }
      if (broken) {
        b.state = "hit";
        b.stateT = 0.28;
      }
      if (b.hp <= 0) {
        b.hp = 0;
        b.state = "down";
        b.stateT = 1.05;
      }
      return true;
    }
    sim.banner = tag === "low" ? "Low" : "High";
    sim.bannerT = 0.35;
  }
  const mass = b.arch === "brute" || b.arch === "hex" ? 1.45 : b.arch === "hood" || b.arch === "runner" ? 0.75 : 1;
  b.hp -= markRegion(sim, b, tag, dmg);
  b.stun = Math.max(b.stun, tag === "high" ? 1.5 : tag === "low" ? 0.9 : 1.1);
  b.poise -= poiseDmg;
  b.vx = kx / mass;
  b.vz = kz / mass;
  b.vy = Math.max(b.vy, lift / mass);
  b.iframe = b.kind === "player" ? 0.38 : 0.14;
  b.stopT = Math.max(b.stopT, lift > 4 ? 0.06 : 0.04);
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
    sim.banner = "Crumple";
    sim.bannerT = 0.6;
    return true;
  }
  if (lift > 4) {
    b.state = "launch";
    b.stateT = 0.2;
    b.air = Math.max(1, b.air);
    return true;
  }
  b.state = "hit";
  b.stateT = sim.tune.hitstun * (b.head < 35 ? 1.45 : 1) * (b.kind === "player" && sim.banner === "Counter hit" ? 1.55 : 1);
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
    const airborne = !e.grounded && e.y > 0.4;
    const scale = airborne ? Math.max(0.3, 1 - e.air * 0.17) : 1;
    const shove = airborne ? 1 + e.air * 0.28 : 1;
    const stomp = laying && sim.stickY > 0.45;
    const popUp = laying && !stomp && sim.stickY < -0.28;
    const kx = (dirX * 0.7 + (awayX / al) * 0.3) * kb * (laying ? (popUp ? 1.15 : 0.35) : 1) * shove;
    const kz = (dirZ * 0.7 + (awayZ / al) * 0.3) * kb * (laying ? (popUp ? 1.15 : 0.35) : 1) * shove;
    const pop = laying ? (popUp ? 6.2 : 0.05) : lift;
    let dealt = dmg * scale * (sim.services ? comboDamageScale(sim.combo + 1) : 1);
    let liftHit = pop;
    if (e.splat > 0 && !laying) {
      dealt *= 1.3;
      liftHit = Math.max(liftHit, 5.4);
      e.splat = 0;
      sim.banner = "Wall follow";
      sim.bannerT = 0.6;
    }
    const heat = e.state === "hit" && e.poise <= 8 && !laying;
    if (heat) {
      dealt *= 1.45;
      liftHit = Math.max(liftHit, 4.2);
      sim.banner = "Heat";
      sim.bannerT = 0.55;
    }
    if (hurt(sim, e, dealt, poise, kx, kz, liftHit, stomp ? "low" : tag)) {
      any = true;
      p.meter = Math.min(100, p.meter + 8);
      sim.combo += 1;
      sim.comboT = 1.25;
      grantXp(sim, heat ? 6 : 2);
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
  if (any) p.stopT = Math.max(p.stopT, 0.04);
  return any;
}

function hitProps(sim: Sim, x: number, z: number, radius: number) {
  let any = false;
  for (const prop of sim.props) {
    if (prop.kind === "car") {
      if (!prop.alive) continue;
      const dx = Math.max(Math.abs(x - prop.x) - 2.05, 0);
      const dz = Math.max(Math.abs(z - prop.z) - 0.9, 0);
      if (Math.hypot(dx, dz) > radius) continue;
      dentCar(sim, prop, 1, false);
      any = true;
      continue;
    }
    if (prop.kind !== "crate" && prop.kind !== "chair" && prop.kind !== "table") continue;
    if (Math.hypot(prop.x - x, prop.z - z) > radius + 0.4) continue;
    prop.hp -= 1;
    any = true;
    sim.sfx.push("hit");
    sim.shake = Math.min(1, sim.shake + 0.28);
    burst(sim, prop.x, 0.6, prop.z, 0x8a5a3a);
    if (prop.hp > 0) continue;
    prop.alive = false;
    if (prop.kind === "table") addProp(sim, "board", prop.x, 0.2, prop.z + 0.35, 5, "");
    sim.banner = prop.kind === "chair" ? "Chair broke" : prop.kind === "table" ? "Table broke" : "Crate smashed";
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
  sim.banner = kind === "bottle" ? "Bottle shattered" : kind === "board" ? "Board split" : kind === "blade" ? "The blade snaps" : kind === "spear" ? "The spear snaps" : "The pipe snapped";
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
    if (!prop.alive || prop.kind === "crate" || prop.kind === "chair" || prop.kind === "table" || prop.kind === "car") continue;
    if (Math.hypot(prop.x - p.x, prop.z - p.z) > 0.85 || Math.abs(prop.y - p.y) > 1.4) continue;
    prop.alive = false;
    p.weapon = prop.kind;
    p.wpn = prop.kind === "pipe" ? 8 : prop.kind === "spear" ? 7 : prop.kind === "blade" ? 6 : prop.kind === "board" ? 5 : 3;
    p.pickupT = 0.4;
    sim.banner = prop.kind === "pipe" ? "Pipe. Run in and it lunges." : prop.kind === "spear" ? "Spear. It reaches." : prop.kind === "blade" ? "Blade. Short cuts." : prop.kind === "board" ? "Board. Short, heavy swings." : "Bottle. A few swings, then it breaks.";
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

function stickRoute(sim: Sim) {
  if (sim.stickY > 0.4) return "d";
  if (sim.stickY < -0.4) return "u";
  if (sim.stickX > 0.4) return "r";
  if (sim.stickX < -0.4) return "l";
  return "n";
}

const STRINGS: Record<string, number[]> = {
  n: [1, 2, 11, 12, 3],
  r: [2, 12, 4, 3],
  l: [11, 1, 12, 5],
  u: [3, 12, 4],
  d: [5, 12, 1],
};

function swingDur(swing: number) {
  if (swing === 11 || swing === 12) return 0.34;
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
  let ffDone = false;
  if (!diving) {
    const stickMag = Math.hypot(sim.stickX, sim.stickY);
    let ffT: Body | null = null;
    const locked = lockOnUpdate(sim.lock, sim.bodies);
    if (locked && Math.hypot(locked.x - p.x, locked.z - p.z) < 15) ffT = locked;
    if (!ffT) ffT = pickFreeflowTarget(p, sim.bodies, sim.stickX, sim.stickY, stickMag);
    if (ffT) {
      p.yaw = yawFromDir(ffT.x - p.x, ffT.z - p.z);
      const lg = freeflowLunge(p, ffT);
      const LUNGE_T = 0.14;
      const LUNGE_MAX = 10;
      let lvx = lg.dx / LUNGE_T;
      let lvz = lg.dz / LUNGE_T;
      const lsp = Math.hypot(lvx, lvz);
      if (lsp > LUNGE_MAX) {
        lvx = (lvx / lsp) * LUNGE_MAX;
        lvz = (lvz / lsp) * LUNGE_MAX;
      }
      p.vx = 0;
      p.vz = 0;
      p.vx += lvx;
      p.vz += lvz;
      ffDone = true;
    }
  }
  if (!ffDone) {
    if (!diving) commitFacing(sim, p);
    else if (sim.flow > 40) faceFlow(sim, p);
  }
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
  else if (fast && stickRoute(sim) === "n" && !(p.comboWindow > 0 || p.queued)) p.swing = 4;
  else {
    const route = stickRoute(sim);
    const seq = STRINGS[route];
    if ((p.comboWindow > 0 || p.queued) && route === p.route) p.link = Math.min(seq.length - 1, p.link + 1);
    else {
      p.route = route;
      p.link = 0;
    }
    p.swing = seq[p.link];
    const hitName = p.swing === 12 ? "Hook" : p.swing === 11 ? "Elbow" : p.swing === 5 ? "Sweep" : p.swing === 4 ? "Step-in" : p.swing === 3 ? "Launcher" : p.swing === 2 ? "Cross" : "Jab";
    const way = route === "l" ? "Left " : route === "r" ? "Right " : route === "u" ? "High " : route === "d" ? "Low " : "";
    sim.banner = `${way}${hitName}`;
    sim.bannerT = 0.4;
  }
  p.queued = false;
  p.comboWindow = 0;
  p.landed = false;
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
  const face = forward(p.yaw);
  const into = dx * face.x + dz * face.z;
  const lateral = Math.abs(dx * face.z - dz * face.x);
  p.state = "dash";
  p.stateT = 0.16;
  if (into < -0.45 && lateral < 0.55) {
    p.vx = dx * SPEC.dashSpeed * 0.28;
    p.vz = dz * SPEC.dashSpeed * 0.28;
    sim.banner = "Sway";
    sim.bannerT = 0.4;
    sim.bufGrab = 0;
    sim.sfx.push("dash");
    return;
  }
  p.vx = dx * SPEC.dashSpeed;
  p.vz = dz * SPEC.dashSpeed;
  const along = Math.abs(dx * face.x + dz * face.z);
  const side = Math.abs(dx * face.z - dz * face.x);
  if (side > along + 0.2) {
    p.iframe = Math.max(p.iframe, sim.martial === "boxing" ? 0.32 : 0.26);
    sim.banner = sim.martial === "boxing" ? "Weave" : "Sidestep";
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
  if (sim.rearLock) {
    if (Math.abs(sim.stickX) > 0.45) {
      const right = { x: -Math.cos(p.yaw), z: Math.sin(p.yaw) };
      const dir = sim.stickX > 0 ? 1 : -1;
      name = "Pendulum";
      vx = right.x * dir * 11;
      vz = right.z * dir * 11;
      vy = 3.2;
      dmg = 16;
    } else if (ahead) {
      name = "German suplex";
      vx = -dx * 7;
      vz = -dz * 7;
      vy = 6.4;
      dmg = 21;
    } else if (back) {
      name = "Dragon suplex";
      vx = dx * 2.2;
      vz = dz * 2.2;
      vy = 7.4;
      dmg = 22;
    } else {
      name = "Bulldog";
      vx = dx * 8;
      vz = dz * 8;
      vy = 2.4;
      dmg = 18;
    }
  } else if (behind) {
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
    name = "Powerbomb";
    vx = dx * 1.1;
    vz = dz * 1.1;
    vy = 6.2;
    dmg = 22;
  } else if (ahead) {
    name = "Chokeslam";
    vx = dx * 0.6;
    vz = dz * 0.6;
    vy = -2.4;
    dmg = 26;
  } else if (art === "wrestling" || art === "catch" || sim.stance === "collar") {
    name = "Toss";
    vx = dx * 7;
    vz = dz * 7;
    vy = 2.1;
    dmg = 12;
  } else if (art === "sambo" || art === "jiujitsu") {
    name = "Suplex";
    vx = -dx * 9;
    vz = -dz * 9;
    vy = 7.2;
    dmg = 18;
  }
  if (art === "boxing" && !sim.rearLock) {
    name = ahead ? "Uppercut" : "Shove";
    dmg = ahead ? 14 : 8;
    vx = dx * (ahead ? 7 : 14);
    vz = dz * (ahead ? 7 : 14);
    vy = ahead ? 2.4 : 1.1;
  } else if (art === "muaythai" && !sim.rearLock && !back && !ahead && Math.abs(sim.stickX) < 0.45) {
    name = "Teep";
    dmg = 9;
    vx = dx * 16;
    vz = dz * 16;
    vy = 1.4;
  } else if (art === "savate" && !sim.rearLock && Math.abs(sim.stickX) < 0.45 && !back && !ahead) {
    name = "Hip toss";
    dmg = 11;
    vx = dx * 14;
    vz = dz * 14;
    vy = 3.2;
  } else if (art === "kenpo" && (sim.rearLock || behind)) {
    dmg = Math.round(dmg * 1.5);
    if (name === "Throw" || name === "Back throw" || name === "Bulldog") name = "Back take";
  } else if (art === "capoeira" && !sim.rearLock && !back && !ahead) {
    name = "Sweep toss";
    dmg = 13;
    vy = 2.2;
    vx = dx * 8;
    vz = dz * 8;
  }
  if (e.tech === 3) {
    dmg = Math.round(dmg * 1.35);
    if (name === "Throw") name = "Stun throw";
    e.tech = 0;
  }
  if (sim.grip >= 2) {
    dmg = Math.round(dmg * 1.3);
    if (name === "Throw") name = "Chain throw";
  }
  sim.grip = 0;
  if (sim.rush && (art === "capoeira" || art === "monkey" || art === "lucha")) {
    name = "Hurricanrana";
    dmg = Math.round(dmg * 1.35);
    vy = 6.5;
  } else if (sim.rush && motionDur("feral") > 0) name = "Feral";
  const extra = sim.bodies.find((o) => o !== e && o.kind === "grunt" && o.alive && (o.stun > 0.15 || o.state === "hit" || o.state === "launch") && Math.hypot(o.x - e.x, o.z - e.z) < 1.8);
  const both = !!extra && e.stun > 0.15 && (extra.stun > 0.15 || extra.state === "hit");
  const paired = both ? "" : name === "Chokeslam" ? "chokeslam" : name === "German suplex" ? "german" : name === "Suplex" ? "suplex" : name === "Takedown" ? "takedown" : name === "Neckbreaker" ? "ddt" : name === "Brainbuster" ? "brainbuster" : name === "Feral" ? "feral" : name === "Throw" ? "backdrop" : "";
  if (paired && motionReady() && motionDur(paired) > 0) {
    const span = Math.min(2.2, motionDur(paired));
    sim.pair = paired;
    sim.pairT = span;
    sim.pairAtk = p.id;
    sim.pairVic = e.id;
    sim.pairLen = span;
    sim.rush = false;
    sim.pairVx = vx;
    sim.pairVy = vy;
    sim.pairVz = vz;
    sim.pairDmg = dmg;
    p.throwT = span;
    e.throwT = span;
    e.iframe = span;
    sim.banner = paired === "ddt" ? "DDT" : name;
    sim.bannerT = 2.1;
    sim.sfx.push("throw");
    sim.bufGrab = 0;
    sim.rearLock = false;
    grantXp(sim, 12);
    return;
  }
  sim.rearLock = false;
  grantXp(sim, 12);
  e.state = "throw";
  e.slam = true;
  e.iframe = 0.08;
  e.vx = vx;
  e.vz = vz;
  e.vy = vy;
  e.stateT = 0.48;
  e.hp -= dmg;
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
  e.yaw = name === "Powerbomb" ? p.yaw : p.yaw + Math.PI;
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

function crack(sim: Sim, box: Box | null) {
  if (!box || box.hp <= 0 || box.kind === "open") return;
  box.hp -= box.role === "cage" ? 1 : box.role === "door" ? 2 : 1.5;
  if (box.hp > 0) {
    sim.banner = box.role === "door" ? "Door buckles" : box.role === "cage" ? "Cage dents" : "Wall cracks";
    sim.bannerT = 0.6;
    return;
  }
  box.kind = "open";
  box.maxY = 0;
  sim.banner = box.role === "door" ? "Door's down" : box.role === "cage" ? "Cage's down" : "Wall's open";
  sim.bannerT = 1.1;
  sim.sfx.push("slam");
}

function nearestHard(sim: Sim, b: Body) {
  let best: Box | null = null;
  let bestD = 0.9;
  for (const box of sim.boxes) {
    if (box.kind === "plat" || box.kind === "spring" || box.kind === "goal" || box.kind === "open" || box.kind === "rope") continue;
    if (box.kind === "gate" && sim.streetClear) continue;
    if (box.role === "door" && (sim.doorBroke || sim.door > 0.45)) continue;
    const cx = Math.min(Math.max(b.x, box.minX), box.maxX);
    const cz = Math.min(Math.max(b.z, box.minZ), box.maxZ);
    const d = Math.hypot(b.x - cx, b.z - cz);
    if (d < bestD) {
      best = box;
      bestD = d;
    }
  }
  return best;
}

function resolveXZ(sim: Sim, b: Body): "" | "hard" | "soft" | "rope" {
  let touch: "" | "hard" | "soft" | "rope" = "";
  for (const box of sim.boxes) {
    if (box.kind === "spring" || box.kind === "goal" || box.kind === "plat" || box.kind === "open") continue;
    if (box.kind === "gate" && sim.streetClear) continue;
    if (box.role === "door" && (sim.doorBroke || sim.door > 0.45)) continue;
    if (b.y >= box.maxY - 0.08) continue;
    if (b.y + 1.45 < box.minY) continue;
    const cx = Math.min(Math.max(b.x, box.minX), box.maxX);
    const cz = Math.min(Math.max(b.z, box.minZ), box.maxZ);
    let dx = b.x - cx;
    let dz = b.z - cz;
    let d2 = dx * dx + dz * dz;
    if (d2 >= R * R) continue;
    if (touch !== "hard") touch = box.kind === "rope" ? "rope" : "hard";
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
  if (!sim.doorBroke && sim.door < 0.45 && b.y < 2.15 && b.x > -13.6 && b.x < -11.2 && b.z > -6.05 && b.z < -4.95) {
    b.z = b.z > -5.5 ? -4.88 : -6.12;
    b.vz = 0;
    if (b.splat < 0.15 && ((b.state === "throw" && b.slam) || ((b.state === "hit" || b.state === "launch") && Math.hypot(b.vx, b.vz) > 6))) {
      sim.doorHits += 1;
      if (sim.doorHits >= 2) {
        sim.doorBroke = true;
        sim.door = 1;
        sim.banner = "Door's down";
      } else sim.banner = "Door buckles";
      sim.bannerT = 0.8;
      wallSlam(sim, b);
      return "hard";
    }
  }
  for (const prop of sim.props) {
    if (!prop.alive || prop.kind === "pipe" || prop.kind === "bottle" || prop.kind === "board" || prop.kind === "blade" || prop.kind === "spear") continue;
    const car = prop.kind === "car";
    if (car && prop.crush > 0.92) continue;
    const top = car ? carTop(prop) : prop.kind === "table" ? 0.7 : prop.kind === "crate" ? 0.62 : prop.kind === "chair" ? 0.42 : 0.9;
    if (b.y >= top - (car ? 0.02 : 0)) continue;
    const hx = car ? 2.05 : 0.55;
    const hz = car ? 0.9 : 0.55;
    const minX = prop.x - hx;
    const maxX = prop.x + hx;
    const minZ = prop.z - hz;
    const maxZ = prop.z + hz;
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
    if (box.kind === "spring" || box.kind === "goal" || box.kind === "plat" || box.kind === "open") continue;
    if (box.kind === "gate" && sim.streetClear) continue;
    if (box.role === "door" && (sim.doorBroke || sim.door > 0.45)) continue;
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
  for (const prop of sim.props) {
    if (prop.kind !== "car" || !prop.alive && prop.crush > 0.98) continue;
    if (Math.abs(b.x - prop.x) > 2.05 || Math.abs(b.z - prop.z) > 0.9) continue;
    const top = carTop(prop);
    if (prevY >= top - 0.08 && b.y < top && b.vy <= 0) {
      b.y = top;
      b.vy = 0;
      b.grounded = true;
    }
  }
  for (const prop of sim.props) {
    if (!prop.alive || (prop.kind !== "table" && prop.kind !== "crate" && prop.kind !== "chair")) continue;
    const top = prop.kind === "table" ? 0.7 : prop.kind === "crate" ? 0.62 : 0.42;
    const hx = prop.kind === "table" ? 0.5 : 0.32;
    const hz = prop.kind === "table" ? 0.32 : 0.32;
    if (Math.abs(b.x - prop.x) > hx || Math.abs(b.z - prop.z) > hz) continue;
    if (prevY >= top - 0.08 && b.y < top && b.vy <= 0) {
      b.y = top;
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
    if (touch === "rope" && b.state === "throw" && b.slam) {
      b.slam = false;
      b.vx *= -1.25;
      b.vz *= -1.25;
      b.vy = 2.6;
      b.state = "hit";
      b.stateT = 0.45;
      b.hp -= 8;
      sim.banner = "Off the ropes";
      sim.bannerT = 0.7;
      sim.sfx.push("slam");
      break;
    }
    if (touch && b.state === "throw" && b.slam) {
      if (touch === "soft") {
        const furn = sim.props.find((prop) => {
          if (!prop.alive) return false;
          if (prop.kind === "car") return Math.abs(prop.x - b.x) < 2.3 && Math.abs(prop.z - b.z) < 1.3;
          return (prop.kind === "chair" || prop.kind === "table" || prop.kind === "crate") && Math.hypot(prop.x - b.x, prop.z - b.z) < 1.1;
        });
        b.slam = false;
        b.vx = 0;
        b.vz = 0;
        b.vy = 0;
        b.state = "hit";
        b.stateT = 1;
        if (furn?.kind === "car") {
          dentCar(sim, furn, 5, true);
          b.hp -= 16;
        } else if (furn) {
          furn.hp -= 2;
          b.hp -= 10;
          sim.banner = furn.kind === "table" ? "Through the table" : furn.kind === "chair" ? "Through the chair" : "Through the crate";
          if (furn.hp <= 0) {
            furn.alive = false;
            if (furn.kind === "table") addProp(sim, "board", furn.x, 0.2, furn.z, 1, "");
          }
        } else sim.banner = "Stalled";
        sim.bannerT = 0.7;
      } else {
        crack(sim, nearestHard(sim, b));
        wallSlam(sim, b);
      }
      break;
    }
    const speed = Math.hypot(b.vx, b.vz);
    if (touch === "hard" && b.splat < 0.15 && (b.state === "hit" || b.state === "launch") && speed > 6) {
      crack(sim, nearestHard(sim, b));
      wallSlam(sim, b);
      break;
    }
  }
    if (b.state === "throw" && b.kind !== "player") {
      for (const o of sim.bodies) {
        if (o === b || o.kind !== "grunt" || !o.alive || o.state === "throw" || o.state === "hit" || o.state === "grab") continue;
        if (Math.hypot(o.x - b.x, o.z - b.z) > 0.75) continue;
        o.vx = b.vx * 0.4;
        o.vz = b.vz * 0.4;
        o.vy = 2.2;
        o.state = "hit";
        o.stateT = 0.55;
        o.hp -= 8;
        sim.banner = "Carried into them";
        sim.bannerT = 0.6;
        break;
      }
    }
  b.x = Math.min(84, Math.max(-84, b.x));
  b.z = Math.min(84, Math.max(-84, b.z));
  if (sim.bout !== "off") {
    const ring = Math.hypot(b.x, b.z);
    if (ring > 7.2) {
      b.x *= 7.2 / ring;
      b.z *= 7.2 / ring;
      b.vx *= -0.15;
      b.vz *= -0.15;
    }
  }
  if (sim.story && sim.venueR > 1) {
    const dx = b.x - sim.venueX;
    const dz = b.z - sim.venueZ;
    const ring = Math.hypot(dx, dz);
    if (ring > sim.venueR) {
      b.x = sim.venueX + (dx / ring) * sim.venueR;
      b.z = sim.venueZ + (dz / ring) * sim.venueR;
      b.vx *= -0.12;
      b.vz *= -0.12;
    }
  }
  resolveY(sim, b, prevY);
  if (b.kind === "player") trySpring(sim, b);
  const cycle = sim.time % 8;
  if (cycle < 0.45 && b.z < -60 && b.z > -78 && Math.abs(b.x) < 5 && b.y < 1.3) {
    b.hp -= 80 * dt;
    b.vx *= 0.9;
    if (cycle < 0.08) {
      sim.banner = "The train";
      sim.bannerT = 0.8;
      sim.sfx.push("slam");
      sim.shake = Math.min(1, sim.shake + 0.4);
    }
    if (b.hp <= 0) {
      b.hp = 0;
      b.alive = false;
      b.state = "out";
    }
  }
  if (b.grounded && prevY > 3.3) {
    b.hp -= 12;
    sim.banner = "Dropped";
    sim.bannerT = 0.7;
    sim.sfx.push("slam");
    if (b.hp <= 0) {
      b.hp = 0;
      b.alive = false;
      b.state = "out";
    }
  }
  if ((b.state === "launch" || b.state === "throw") && b.grounded) {
    const car = sim.props.find((prop) => prop.kind === "car" && prop.alive && Math.abs(prop.x - b.x) < 2.15 && Math.abs(prop.z - b.z) < 1.05 && b.y > 0.2);
    if (car) {
      dentCar(sim, car, 5, true);
      b.hp -= 16;
      b.slam = false;
    }
    const face = forward(b.yaw);
    const fellForward = b.vx * face.x + b.vz * face.z > 0.15;
    b.vx *= 0.25;
    b.vz *= 0.25;
    if (!b.alive || b.hp <= 0) {
      b.state = "out";
      b.alive = false;
    } else {
      const teching = b.kind === "player" && sim.prevDash;
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
        b.prone = fellForward;
        b.air = 0;
        b.stateT = b.kind === "player" ? 0.75 : 1.4;
        if (b.kind !== "player" && sim.bannerT < 0.25) {
          sim.banner = fellForward ? "Face down" : "Face up";
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

function holdingBack(sim: Sim, p: Body) {
  const m = Math.hypot(sim.aimX, sim.aimZ);
  if (m < 0.35) return false;
  const f = forward(p.yaw);
  return (sim.aimX / m) * f.x + (sim.aimZ / m) * f.z < -0.35;
}

function engaged(home: Home, p: Body) {
  if (home === "ring") return p.x > 58 && p.z > 20 && p.z < 46;
  if (home === "cage") return p.x < -58;
  if (home === "subway") return p.z < -50;
  if (home === "crane") return p.z > 56 && Math.abs(p.x) < 16;
  if (home === "office") return p.x > 64 && p.z < -12 && p.z > -38;
  if (home === "yard") return p.x < -26 && p.x > -52;
  if (home === "dock") return p.z > 26 && p.z < 50 && p.x < 20;
  if (home === "under") return p.z < -26 && p.z > -48;
  if (home === "street") return p.z < -12.6 && p.x < 17;
  if (home === "market") return p.z < -14.2 && p.z > -26 && p.x > 16 && p.x < 48;
  if (home === "scaffold") return p.z > 14.2 && p.z < 46;
  return p.z > -12.8 && p.z < 14.6 && p.x < 23 && p.x > -26;
}

function updateEnemies(sim: Sim, dt: number) {
  const p = sim.bodies[0];
  for (const e of sim.bodies) {
    if (e.kind !== "grunt") continue;
    if (e.stopT > 0) {
      e.stopT -= dt;
      continue;
    }
    const yokoStreet = sim.mode === "belt" && e.home === "street";
    e.iframe = Math.max(0, e.iframe - dt);
    e.cd = Math.max(0, e.cd - dt);
    e.stun = Math.max(0, e.stun - dt);
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
      if (e.arch !== "brute" && e.stateT < 0.08 && p) e.yaw = yawFromDir(p.x - e.x, p.z - e.z);
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
        const tag = e.swing === 5 || e.arch === "runner" ? "low" : e.arch === "brute" ? "high" : "mid";
        for (const target of sim.bodies) {
          if (target.kind === "grunt" || !target.alive) continue;
          if (target.iframe > 0) continue;
          if (Math.hypot(target.x - e.x, target.z - e.z) > 1.22 || Math.abs(target.y - e.y) >= 1.2) continue;
          if (hurt(sim, target, bite, 10, f.x * 6.5, f.z * 6.5, e.swing === 5 ? 0.25 : e.arch === "brute" ? 2.4 : 1.2, tag)) {
            e.stopT = Math.max(e.stopT, 0.04);
          }
        }
      }
      if (e.stateT <= 0) {
        releaseAttack(sim.group, e.id);
        e.state = "free";
        const f = forward(e.yaw);
        e.vx = -f.x * 2.2;
        e.vz = -f.z * 2.2;
        e.cd = e.arch === "runner" || e.arch === "hood" ? 0.42 : e.arch === "brute" ? 1.15 : 0.7;
      }
      continue;
    }
    if (e.state !== "free") continue;
    const hot = engaged(e.home, p) || (sim.scuffle === e.home && Math.hypot(p.x - e.homeX, p.z - e.homeZ) < 22);
    let rank = 0;
    if (hot && p) {
      const mine = Math.hypot(e.x - p.x, e.z - p.z);
      for (const o of sim.bodies) {
        if (o === e || o.kind !== "grunt" || !o.alive || o.state === "down" || o.state === "out") continue;
        if (Math.hypot(o.x - p.x, o.z - p.z) < mine - 0.05) rank += 1;
      }
    }
    const pressing = rank === 0 || (rank === 1 && p && p.state === "atk" && p.swung);
    const swinging = sim.bodies.some((o) => o !== e && o.kind === "grunt" && o.alive && (o.state === "windup" || o.state === "atk") && p && Math.hypot(o.x - p.x, o.z - p.z) < 2.2);
    let ax = (hot && p ? p.x : e.homeX) - e.x;
    let az = (hot && p ? p.z : e.homeZ) - e.z;
    const d = Math.hypot(ax, az) || 1;
    const playerOpen = p && p.state === "atk" && p.swung && p.stateT < 0.16;
    const playerThreat = p && p.state === "atk" && !p.swung;
    if (hot && p && pressing && !swinging && e.cd <= 0 && Math.abs(e.y - p.y) < 1.1 && d < (playerOpen ? 2.5 : e.arch === "hex" ? 2.3 : 1.35)) {
      if (!requestAttack(sim.group, e.id, sim.bodies)) continue;
      e.swing = p.state === "down" || e.arch === "runner" ? 5 : 0;
      e.state = "windup";
      e.stateT = (playerOpen ? 0.12 : SPEC.enemyWindup) * (e.arch === "runner" || e.arch === "hood" ? 0.62 : e.arch === "brute" || e.arch === "hex" ? 1.28 : 1);
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
    if (hot && p && !pressing) {
      const orbit = e.id * 0.9 + sim.time * 0.45;
      ax = p.x + Math.sin(orbit) * 2.55 - e.x;
      az = p.z + Math.cos(orbit) * 2.55 - e.z;
    } else if (hot && p && playerThreat && e.arch !== "brute" && d < 2.1) {
      ax = e.x - p.x;
      az = e.z - p.z;
    }
    const steer = Math.hypot(ax, az) || 1;
    ax /= steer;
    az /= steer;
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
    const retreat = hot && p && playerThreat && e.arch !== "brute" && d < 2.1;
    const sp = (!hot ? sim.tune.enemySpeed * 0.65 : retreat ? sim.tune.enemySpeed * 0.8 : !pressing ? sim.tune.enemySpeed * 0.75 : d < 1.05 ? sim.tune.enemySpeed * 0.35 : sim.tune.enemySpeed) * archMul * heat * (e.legs < 35 ? 0.55 : 1);
    e.vx = (ax / m) * sp;
    e.vz = (az / m) * sp;
    if (sp > 0 && p) e.yaw = approachAngle(e.yaw, yawFromDir(hot ? p.x - e.x : e.vx, hot ? p.z - e.z : e.vz), 10, dt);
  }
}

function updatePlayer(sim: Sim, dt: number, dashEdge: boolean, counterEdge: boolean) {
  const p = sim.bodies[0];
  p.iframe = Math.max(0, p.iframe - dt);
  if (p.stopT > 0) {
    p.stopT -= dt;
    return;
  }
  // Federated just-frame parry (counters.ts): KeyC / touch CTR / gamepad.
  if (counterEdge && sim.services && p.state === "free") {
    tryParry(sim.services, p.id);
  }
  if (sim.bufLock > 0) {
    sim.bufLock = 0;
    const was = sim.lock.isLocked;
    lockOnPress(sim.lock, p, sim.bodies);
    if (sim.lock.isLocked && !was) {
      sim.banner = "Locked on";
      sim.bannerT = 0.4;
    }
  }
  lockOnUpdate(sim.lock, sim.bodies);
  const atk = sim.bufAtk > 0;
  const grab = sim.bufGrab > 0;
  const blast = sim.bufBlast > 0;
  const jump = sim.bufJump > 0;
  const use = sim.bufUse > 0;
  if (use && (p.state === "free" || p.state === "down")) {
    sim.bufUse = 0;
    tryUse(sim, p);
  }
  const blocking = p.state === "free" && p.grounded && holdingBack(sim, p) && !atk && !grab && !jump;
  if (blocking && !sim.guard) sim.guardT = 0.13;
  sim.guard = blocking;
  sim.lowGuard = blocking && sim.stickY > 0.32;
  if (sim.guard) sim.guardT = Math.max(0, sim.guardT - dt);
  else sim.block = Math.max(0, sim.block - dt * 1.4);
  if (sim.pair && p.state !== "grab") {
    sim.pairT -= dt;
    const atk = sim.bodies.find((b) => b.id === sim.pairAtk);
    const vic = sim.bodies.find((b) => b.id === sim.pairVic);
    if (atk && vic && sim.pairT > 0) {
      atk.throwT = sim.pairT;
      vic.throwT = sim.pairT;
    }
    if (sim.pairAtk === p.id) p.throwT = Math.max(0, sim.pairT);
    if (sim.pairT <= 0) {
      if (vic && vic.alive && sim.pairAtk !== p.id) {
        vic.vx = sim.pairVx;
        vic.vz = sim.pairVz;
        vic.vy = sim.pairVy;
        vic.hp -= sim.pairDmg;
        vic.slam = true;
        vic.state = vic.hp <= 0 ? "out" : "throw";
        vic.alive = vic.hp > 0;
        vic.stateT = 0.48;
      }
      if (atk && atk.kind !== "player" && atk.state === "grab") atk.state = "free";
      sim.pair = "";
      sim.pairAtk = -1;
      sim.pairVic = -1;
      sim.pairLen = 0;
    }
  }

  if (p.state === "down" || p.state === "hit") {
    if (p.state === "down" && p.hp > 0) {
      if (dashEdge) {
        const f = forward(p.yaw);
        const rx = Math.cos(p.yaw);
        const rz = -Math.sin(p.yaw);
        const along = sim.aimX * f.x + sim.aimZ * f.z;
        const side = sim.aimX * rx + sim.aimZ * rz;
        p.state = "free";
        p.prone = false;
        if (Math.abs(side) > Math.abs(along) + 0.12) {
          const dir = side >= 0 ? 1 : -1;
          p.vx = rx * dir * 7.2;
          p.vz = rz * dir * 7.2;
          p.iframe = 0.32;
          sim.banner = "Side roll";
        } else if (along > 0.2) {
          p.vx = f.x * 8;
          p.vz = f.z * 8;
          p.iframe = 0.28;
          sim.banner = "Forward roll";
        } else {
          p.vx = -f.x * 8;
          p.vz = -f.z * 8;
          p.iframe = 0.28;
          sim.banner = "Back roll";
        }
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
        sim.banner = sim.martial === "drunken" ? "From the floor" : "Rising strike";
        if (sim.martial === "drunken") p.vy = Math.max(p.vy, 4.2);
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
    if (dashEdge && sim.pair !== "mount" && sim.pairT <= 0) {
      if (Math.abs(sim.stickX) > 0.4) {
        sim.rearLock = !sim.rearLock;
        p.yaw += Math.PI;
        p.stateT = 1;
        sim.banner = sim.rearLock ? "Around to the back" : "Around to the front";
        sim.bannerT = 0.6;
        return;
      }
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
      e.yaw = sim.rearLock ? p.yaw : p.yaw + Math.PI;
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
      if (grab && Math.abs(sim.stickX) > 0.45 && (sim.martial === "wrestling" || sim.martial === "catch")) {
        sim.bufGrab = 0;
        const spin = sim.stickX > 0 ? 1 : -1;
        e.hp -= 16;
        e.legs = Math.max(0, e.legs - 18);
        e.vx = Math.cos(p.yaw) * spin * 13;
        e.vz = -Math.sin(p.yaw) * spin * 13;
        e.vy = 3.2;
        e.slam = true;
        e.state = "throw";
        e.stateT = 0.5;
        for (const o of sim.bodies) {
          if (o === e || o.kind !== "grunt" || !o.alive) continue;
          if (Math.hypot(o.x - e.x, o.z - e.z) > 1.8) continue;
          o.hp -= 10;
          o.vx = e.vx * 0.5;
          o.vz = e.vz * 0.5;
          o.vy = 2;
          o.state = "hit";
          o.stateT = 0.5;
          if (o.hp <= 0) {
            o.hp = 0;
            o.alive = false;
            o.state = "out";
          }
        }
        p.state = "free";
        sim.grabId = -1;
        sim.pair = "";
        sim.banner = "Giant swing";
        sim.bannerT = 0.8;
        sim.sfx.push("throw");
        if (e.hp <= 0) {
          e.hp = 0;
          e.alive = false;
          e.state = "out";
        }
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
    sim.lockArm = Math.max(0, sim.lockArm - dt);
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
    if (sim.prevGrab && (sim.martial === "jiujitsu" || sim.martial === "sambo" || sim.martial === "wrestling")) {
      sim.squeezeT -= dt;
      if (sim.squeezeT <= 0) {
        sim.squeezeT = 0.28;
        e.hp -= 4;
        sim.banner = "Squeeze";
        sim.bannerT = 0.35;
        sim.sfx.push("hit");
        if (e.hp <= 0) {
          e.hp = 0;
          e.alive = false;
          e.state = "out";
          p.state = "free";
          sim.grabId = -1;
          sim.grip = 0;
          return;
        }
      }
    }
    if (sim.pairT > 0) {
      sim.pairT -= dt;
      if (grab && (sim.martial === "wrestling" || sim.martial === "catch" || sim.martial === "jiujitsu" || sim.martial === "sambo")) sim.chain = true;
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
      sim.pairAtk = -1;
      sim.pairVic = -1;
      sim.pairLen = 0;
      if (sim.chain && sim.chains < 3 && e.alive && (sim.martial === "wrestling" || sim.martial === "catch" || sim.martial === "jiujitsu" || sim.martial === "sambo")) {
        sim.chain = false;
        sim.chains += 1;
        e.state = "grab";
        p.state = "grab";
        sim.grabId = e.id;
        sim.lockArm = 0;
        sim.banner = "Chain";
        throwEnemy(sim, e);
        return;
      }
      sim.chains = 0;
      if (e.hp <= 0) {
        e.hp = 0;
        e.alive = false;
        e.state = "out";
      }
      return;
    }
    if (grab && sim.lockArm <= 0 && sim.pairT <= 0) throwEnemy(sim, e);
    else if (atk) {
      sim.bufAtk = 0;
      sim.grip += 1;
      let dmg = sim.grip >= 3 ? 12 : sim.grip === 2 ? 9 : 7;
      let name = sim.grip >= 3 ? "Headbutt" : sim.grip === 2 ? "Elbow" : "Knee";
      if (sim.martial === "boxing") name = sim.grip >= 2 ? "Hook" : "Uppercut";
      if (sim.martial === "muaythai") name = sim.grip >= 2 ? "Elbow" : "Knee";
      if (sim.martial === "muaythai" && sim.grip >= 4) {
        e.state = "hit";
        e.stateT = 0.35;
        p.state = "free";
        sim.grabId = -1;
        sim.grip = 0;
        sim.banner = "Clinch breaks";
        sim.bannerT = 0.5;
        return;
      }
      if (sim.martial === "capoeira") name = "Meia lua";
      if (p.weapon === "pipe" || p.weapon === "blade" || p.weapon === "spear") {
        dmg = p.weapon === "blade" ? 13 : p.weapon === "spear" ? 12 : 14;
        name = p.weapon === "blade" ? "Cut" : p.weapon === "spear" ? "Spear jab" : "Club";
        wearWeapon(sim, p);
      } else if (p.weapon === "board") {
        dmg = 12;
        name = "Board";
        wearWeapon(sim, p);
      } else if (p.weapon === "bottle") {
        dmg = 11;
        name = "Bottle to the head";
        p.weapon = "fist";
        p.wpn = 0;
      }
      e.hp -= dmg;
      e.poise -= 7;
      p.meter = Math.min(100, p.meter + 6);
      p.stateT = Math.max(p.stateT, 0.7);
      sim.hitstop = 0.035;
      sim.sfx.push("hit");
      burst(sim, e.x, e.y + 1, e.z, 0xf0b429);
      sim.banner = name;
      sim.bannerT = 0.45;
      if (e.hp <= 0) {
        e.hp = 0;
        e.alive = false;
        e.state = "out";
        p.state = "free";
        sim.grabId = -1;
        sim.grip = 0;
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
    let startup = p.swing >= 5 ? 0.08 : p.swing >= 4 ? 0.09 : p.swing === 3 ? SPEC.launchStartup : p.swing === 2 ? SPEC.crossStartup : SPEC.jabStartup;
    if ((sim.martial === "boxing") && p.swing <= 2) startup = Math.max(0.03, startup - 0.045);
    if (sim.martial === "drunken") startup += 0.09;
    const elapsed = dur - p.stateT;
    const cancelAt = p.landed ? startup + SPEC.active : startup + SPEC.active + 0.18;
    const recovery = elapsed >= cancelAt;
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
      if (p.swing === 12) {
        lift = 1.1;
        dmg = 13;
        kb = 5.5;
      } else if (p.swing === 11) {
        lift = 0.35;
        dmg = 10;
        kb = 4.2;
      } else if (p.swing >= 10) {
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
      } else if ((sim.martial === "kenpo" || sim.martial === "jeet") && p.swing === 2) {
        kb = 16;
        call = "Inch punch";
      } else if (p.swing === 2 && sim.martial === "muaythai") {
        kb = 14;
        dmg = 8;
        call = "Teep";
      } else if (p.swing === 3 && sim.martial === "karate" && sim.combo >= 2) {
        dmg += 6;
        call = "Chain";
      } else if (p.swing === 4 && (sim.martial === "wrestling" || sim.martial === "catch" || sim.martial === "savate" || sim.martial === "muaythai")) {
        lift = 0.55;
        kb = 11;
        call = "Clothesline";
      }
      if (p.weapon === "pipe" || p.weapon === "blade" || p.weapon === "spear") {
        dmg *= p.weapon === "blade" ? 1.28 : p.weapon === "spear" ? 1.16 : 1.35;
        kb *= p.weapon === "spear" ? 1.25 : 1.2;
      } else if (p.weapon === "bottle") {
        dmg *= 1.1;
        kb *= 1.05;
      } else if (p.weapon === "board") {
        dmg *= 1.22;
        kb *= 1.15;
      }
      const poise = p.swing >= 8 ? 26 : p.swing === 5 ? (sim.stance === "crane" ? 70 : 48) : p.swing >= 3 ? 18 : 11;
      const reach = p.swing === 11 || p.swing === 12 ? 0.85 : p.swing === 10 ? 1.5 : (sim.martial === "kenpo" || sim.martial === "jeet") && p.swing === 5 ? 2.15 : sim.martial === "capoeira" && p.swing === 3 ? 1.85 : p.swing === 9 || p.swing === 7 ? 1.85 : p.swing >= 6 ? 1.35 : p.swing >= 4 ? 1.05 : p.swing === 3 ? 0.95 : 0.78;
      const hx = sim.martial === "capoeira" && p.swing === 3 ? p.x : p.swing === 9 || p.swing === 7 ? p.x : p.x + f.x * 0.85;
      const hz = sim.martial === "capoeira" && p.swing === 3 ? p.z : p.swing === 9 || p.swing === 7 ? p.z : p.z + f.z * 0.85;
      if (sim.martial === "capoeira" && p.swing === 3) call = call || "Windmill";
      if ((sim.martial === "kenpo" || sim.martial === "jeet") && p.swing === 5) call = call || "Dragon tail";
      const tag = p.swing === 5 ? "low" : p.swing === 11 || p.swing === 12 ? "mid" : p.swing === 3 || p.swing >= 6 ? "high" : "mid";
      const hit = hitGrunts(sim, hx, hz, reach + (p.weapon === "spear" ? 0.45 : p.weapon === "blade" ? 0.12 : 0), dmg, kb, lift, poise, f.x, f.z, tag);
      if (hit) p.landed = true;
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
        p.comboWindow = 0.58;
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
      if (downed.prone) {
        downed.state = "hit";
        downed.stateT = 0.95;
        downed.prone = false;
        downed.vx = 0;
        downed.vz = 0;
        sim.bufGrab = 0;
        sim.banner = "Drag up";
        sim.bannerT = 0.7;
        sim.sfx.push("grab");
        return;
      }
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
    if (e) {
      const look = forward(e.yaw);
      const behind = look.x * (p.x - e.x) + look.z * (p.z - e.z) < -0.35;
      sim.rearLock = behind && e.state !== "windup" && e.state !== "atk";
      if (e.stun > 0.15) e.tech = 3;
      sim.rush = Math.hypot(p.vx, p.vz) > 4.2;
      sim.grip = 0;
      sim.squeezeT = 0.2;
      sim.lockArm = 0.28;
      commitFacing(sim, p);
      p.state = "grab";
      p.stateT = 1.5;
      e.tech = e.state === "hit" || e.state === "launch" ? 3 : 0;
      e.state = "grab";
      e.vx = 0;
      e.vz = 0;
      e.vy = 0;
      sim.grabId = e.id;
      sim.bufGrab = 0;
      sim.banner = e.stun > 0.15 ? "Stun lock" : sim.rearLock ? "Rear lock" : "Lock";
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
    const wobble = Math.sin(sim.time * 17) * 0.035;
    pullHold(e, p.x + f.x * 0.62 + wobble, p.y, p.z + f.z * 0.62, p.yaw + Math.PI);
  }
  e.vx = 0;
  e.vy = 0;
  e.vz = 0;
}

function pullHold(e: Body, x: number, y: number, z: number, yaw: number) {
  e.x += (x - e.x) * 0.42;
  e.y += (y - e.y) * 0.42;
  e.z += (z - e.z) * 0.42;
  e.yaw += Math.atan2(Math.sin(yaw - e.yaw), Math.cos(yaw - e.yaw)) * 0.42;
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

function stickPair(sim: Sim) {
  if (sim.pairT <= 0 || sim.pairAtk < 0) return;
  const atk = sim.bodies.find((b) => b.id === sim.pairAtk);
  const vic = sim.bodies.find((b) => b.id === sim.pairVic);
  if (!atk || !vic) return;
  const face = forward(atk.yaw);
  atk.vx = 0;
  atk.vz = 0;
  vic.x = atk.x + face.x * 0.78;
  vic.z = atk.z + face.z * 0.78;
  vic.y = atk.y;
  vic.yaw = atk.yaw + Math.PI;
  vic.vx = 0;
  vic.vz = 0;
  vic.vy = 0;
}

function living(sim: Sim, home: Home) {
  return sim.bodies.some((b) => b.kind === "grunt" && b.home === home && b.alive && b.name !== LEASE_NAME);
}

function updateAlly(sim: Sim, dt: number) {
  if (sim.mode === "belt") return;
  const p = sim.bodies[0];
  if (!p) return;
  for (const a of sim.bodies) {
    if (a.kind !== "ally" || !a.alive) continue;
    a.iframe = Math.max(0, a.iframe - dt);
    a.cd = Math.max(0, a.cd - dt);
    if (a.state === "grab") {
      a.vx = 0;
      a.vz = 0;
      continue;
    }
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
    const side = foe ? 0 : 1;
    const tx = foe ? foe.x : p.x + Math.cos(p.yaw) * 1.5 * side;
    const tz = foe ? foe.z : p.z - Math.sin(p.yaw) * 1.5;
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
    const gap = Math.hypot(a.x - p.x, a.z - p.z);
    if (gap < 0.9 && gap > 0.001) {
      a.vx += ((a.x - p.x) / gap) * 3;
      a.vz += ((a.z - p.z) / gap) * 3;
    }
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
        name: PARTNER.name,
        arch: "hood",
        x: p.x + 1.4,
        z: p.z,
        home: "plaza",
        hp: 90,
        maxHp: 90,
      }),
    );
    sim.banner = "Rook Calder steps in";
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
    boss.name = LEASE_NAME;
    boss.hp = 180;
    boss.maxHp = 180;
  }
  sim.banner = "Paper Quinn";
  sim.bannerT = 1.8;
}

function focusPack(sim: Sim) {
  const mission = missionAt(sim.mission);
  for (const b of sim.bodies) {
    if (b.kind !== "grunt" || b.name === LEASE_NAME) continue;
    const keep = b.home === mission.home;
    if (!keep) {
      b.alive = false;
      b.hp = 0;
      b.state = "out";
      continue;
    }
    if (mission.rule === "rival" && sim.bodies.some((o) => o.kind === "grunt" && o.alive && o.id < b.id && o.home === mission.home)) {
      b.alive = false;
      b.hp = 0;
      b.state = "out";
      continue;
    }
    b.alive = true;
    b.state = "free";
    b.stateT = 0;
    b.y = standY(b.home);
    b.vx = 0;
    b.vz = 0;
    if (mission.rule === "inside") {
      const ang = b.id;
      const rad = 3.2;
      b.x = sim.venueX + Math.cos(ang) * rad;
      b.z = sim.venueZ + Math.sin(ang) * rad;
      b.homeX = b.x;
      b.homeZ = b.z;
    } else if (sim.wave > 1) {
      b.x = b.homeX + 3;
      b.z = b.homeZ + 3;
    }
    const base = b.arch === "brute" ? 120 : b.arch === "runner" ? 44 : b.arch === "hood" ? 56 : b.arch === "hex" ? 72 : 64;
    b.maxHp = Math.round(base * mission.hp * (mission.rule === "rival" ? 2.2 : 1));
    b.hp = b.maxHp;
  }
}

function advanceStory(sim: Sim) {
  if (!sim.story || sim.missionClear) return;
  const job = missionAt(sim.mission);
  const p = sim.bodies[0];
  if (job.rule === "reach" && p) {
    const goal = dropFor(job.home);
    if (Math.hypot(p.x - goal[0], p.z - goal[1]) > 7) return;
  }
  const pack = sim.bodies.some((b) => b.kind === "grunt" && b.alive);
  if (pack) return;
  if (sim.wave < sim.waveMax) {
    sim.wave += 1;
    focusPack(sim);
    sim.banner = `They fell back. Wave ${sim.wave} of ${sim.waveMax}`;
    sim.bannerT = 1.4;
    return;
  }
  const pay = 40 + sim.mission * 8 + (job.boss ? 80 : 0) + (job.rule === "rival" ? 50 : job.rule === "reach" ? 30 : 0);
  sim.purse += pay;
  grantXp(sim, 40);
  sim.missionClear = true;
  sim.paused = true;
  sim.banner = `Paid ${pay}. Purse ${sim.purse}`;
  sim.bannerT = 2;
  const next = Math.min(MISSIONS.length, sim.mission + 1);
  if (next > sim.clearedMission) {
    sim.clearedMission = next;
    saveCleared(next, sim.purse, sim.xp);
  } else saveCleared(sim.clearedMission, sim.purse, sim.xp);
  openCity(sim, job.home);
}

function openCity(sim: Sim, quiet: string) {
  for (const b of sim.bodies) {
    if (b.kind !== "grunt" || b.name === LEASE_NAME || b.home === quiet) continue;
    b.alive = true;
    b.state = "free";
    b.stateT = 0;
    b.hp = b.maxHp;
    b.x = b.homeX;
    b.z = b.homeZ;
    b.y = b.home === "scaffold" ? 2.4 : 0;
    b.vx = 0;
    b.vz = 0;
  }
}

export function step(sim: Sim, input: FrameInput, dt: number) {
  sim.sfx.length = 0;
  sim.time += dt;
  for (const prop of sim.props) {
    if (prop.kind !== "car") continue;
    const target = !prop.alive ? 1 : 1 - Math.max(0, prop.hp) / prop.maxHp;
    prop.crush += (target - prop.crush) * Math.min(1, dt * 0.85);
  }
  const atkEdge = input.attack && !sim.prevAtk;
  const grabEdge = input.grab && !sim.prevGrab;
  const blastEdge = input.blast && !sim.prevBlast;
  const jumpEdge = input.jump && !sim.prevJump;
  const dashEdge = input.dash && !sim.prevDash;
  const useEdge = input.use && !sim.prevUse;
  const lockEdge = !!input.lock && !sim.prevLock;
  const counterEdge = !!input.counter && !sim.prevCounter;
  sim.prevAtk = input.attack;
  sim.prevGrab = input.grab;
  sim.prevBlast = input.blast;
  sim.prevJump = input.jump;
  sim.prevDash = input.dash;
  sim.prevUse = input.use;
  sim.prevLock = !!input.lock;
  sim.prevCounter = !!input.counter;
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
  if (lockEdge) sim.bufLock = 0.2;
  else sim.bufLock = Math.max(0, sim.bufLock - dt);

  if (!sim.running || sim.paused) return;
  // Wired modules: weather clock, attention director, quests, peds, replay.
  if (sim.services) tickSimServices(sim, input, dt);
  if (sim.hitstop > 0) {
    sim.hitstop -= dt;
    sim.shake *= Math.exp(-8 * dt);
    return;
  }

  steer(sim, input);
  sim.stickY = input.y;
  sim.stickX = input.x;
  updatePlayer(sim, dt, dashEdge, counterEdge);
  updateEnemies(sim, dt);
  updateAlly(sim, dt);
  tickYokosukaBelt(sim, input, dt);
  for (const b of sim.bodies) {
    if (b.stopT > 0) continue;
    moveBody(sim, b, dt);
  }
  stickPair(sim);
  for (let i = 0; i < sim.bodies.length; i++) {
    const a = sim.bodies[i];
    if (!a.alive || a.state === "out" || a.state === "grab" || a.state === "throw") continue;
    if (a.stopT > 0) continue;
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
    held.vx = 0;
    held.vz = 0;
    held.vy = 0;
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
  updateDoor(sim, dt);
  sim.comboT -= dt;
  if (sim.comboT <= 0) sim.combo = 0;
  sim.bannerT -= dt;
  if (sim.bannerT <= 0) sim.banner = "";
  sim.shake *= Math.exp(-3.2 * dt);

  refreshZone(sim);
  refreshScuffle(sim, dt);
  callBackup(sim, dt);
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
    face: (() => {
      const foe = nearestGrunt(sim, 7);
      if (!foe) return "";
      const card = wardByName(foe.name);
      return card ? `${foe.name} · ${card.style}` : foe.name;
    })(),
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
      leaseDown: sim.leaseSpawned && !sim.bodies.some((b) => b.name === LEASE_NAME && b.alive),
    }).title,
    jobStep: jobNow({
      plazaClear: sim.plazaClear,
      streetClear: sim.streetClear,
      scaffoldClear: sim.scaffoldClear,
      marketClear: sim.marketClear,
      leaseDown: sim.leaseSpawned && !sim.bodies.some((b) => b.name === LEASE_NAME && b.alive),
    }).step,
    martial: sim.martial,
    who: sim.who,
    bio: sim.bio,
    cast: sim.cast,
    stance: sim.stance,
    bout: sim.bout,
    flow: Math.round(sim.flow),
    story: sim.story,
    mission: sim.mission,
    missionTitle: sim.story ? missionAt(sim.mission).title : "",
    missionStep: sim.story ? `${missionAt(sim.mission).step} ${placeName(missionAt(sim.mission).home)}.` : "",
    actName: sim.story ? missionAt(sim.mission).actName : "",
    wave: sim.wave,
    waveMax: sim.waveMax,
    missionClear: sim.missionClear,
    clearedMission: sim.clearedMission,
    purse: sim.purse,
    xp: sim.xp,
    level: sim.level,
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

function updateDoor(sim: Sim, dt: number) {
  const p = sim.bodies[0];
  if (!p) return;
  if (sim.doorBroke) {
    sim.door = 1;
    return;
  }
  const near = Math.hypot(p.x + 12.4, p.z + 5.5) < 2.15;
  sim.door = near ? Math.min(1, sim.door + dt * 2.6) : Math.max(0, sim.door - dt * 1.5);
}

function callBackup(sim: Sim, dt: number) {
  const hot = sim.bodies.some((e) => e.kind === "grunt" && e.alive && (e.state === "windup" || e.state === "atk" || e.state === "hit"));
  if (!hot) {
    sim.backupT = 0;
    return;
  }
  sim.backupT += dt;
  if (sim.backupT < 8 || sim.backups >= 2) return;
  const up = sim.bodies.filter((e) => e.kind === "grunt" && e.alive).length;
  if (up >= 3) return;
  const dead = sim.bodies.find((e) => e.kind === "grunt" && !e.alive && e.name !== LEASE_NAME);
  if (!dead) return;
  const p = sim.bodies[0];
  if (!p) return;
  sim.backupT = 0;
  sim.backups += 1;
  const f = forward(p.yaw);
  dead.alive = true;
  dead.hp = Math.max(20, Math.round(dead.maxHp * 0.65));
  dead.state = "free";
  dead.stateT = 0;
  dead.x = p.x - f.x * 6.5;
  dead.z = p.z - f.z * 6.5;
  dead.y = 0;
  dead.vx = f.x * 3;
  dead.vz = f.z * 3;
  sim.banner = "Another one";
  sim.bannerT = 1;
}

function refreshScuffle(sim: Sim, dt: number) {
  const p = sim.bodies[0];
  if (!p) return;
  const was = sim.scuffle;
  if (was && !living(sim, was)) {
    sim.scuffle = "";
    sim.clearT = 1.6;
    if (!sim.story || sim.missionClear) {
      sim.purse += 20;
      sim.banner = "Camp quiet. +20";
    } else sim.banner = "Block's quiet";
    sim.bannerT = 1.5;
  } else if (!was) {
    const homes: Home[] = ["plaza", "street", "market", "scaffold", "yard", "dock", "under", "ring", "cage", "subway", "crane", "office"];
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
  if (p.x > 60 && p.z < -18) return "office";
  if (p.x > 58) return "ring";
  if (p.x < -58) return "cage";
  if (p.z < -50) return "subway";
  if (p.z > 58) return "crane";
  if (p.x < -26) return "yard";
  if (p.z > 26) return "docks";
  if (p.z < -26) return "underpass";
  if (p.x < -7.6 && p.x > -17.4 && p.z < -5.5 && p.z > -12.2) return "house";
  if (p.z < -14.4 && p.x > 16) return "market";
  if (p.z < -14.4) return "street";
  if (p.z > 15) return "scaffolds";
  return "plaza";
}
