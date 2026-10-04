import { clampTune, SPEC, type Hud, type Mode, type Tune } from "./spec";
import { resetYoko, tickYokosukaBelt } from "./yokosuka/belt";

export type Phase = "free" | "atk" | "hit" | "launch" | "down" | "grab" | "throw" | "dash" | "spin" | "windup" | "out";
export type Home = "plaza" | "street" | "scaffold";

export type Body = {
  id: number;
  kind: "player" | "grunt";
  name: string;
  home: Home;
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

export type Sim = {
  mode: Mode;
  running: boolean;
  paused: boolean;
  tune: Tune;
  bodies: Body[];
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
  bufAtk: number;
  bufGrab: number;
  bufBlast: number;
  bufJump: number;
  prevAtk: boolean;
  prevGrab: boolean;
  prevBlast: boolean;
  prevJump: boolean;
  prevDash: boolean;
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
};

export type FrameInput = {
  x: number;
  y: number;
  attack: boolean;
  grab: boolean;
  blast: boolean;
  jump: boolean;
  dash: boolean;
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
    box(-26, 26, -26, -24, 3, "wall"),
    box(-26, 26, 24, 26, 3, "wall"),
    box(-26, -24, -26, 26, 3, "wall"),
    box(24, 26, -24, 24, 3, "wall"),
    box(-18, -7, -13, -5, 5.2, "wall"),
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
  ];
}

function blankBody(sim: Sim, partial: Pick<Body, "kind" | "x" | "z"> & Partial<Body>): Body {
  const grunt = partial.kind === "grunt";
  return {
    id: sim.nextId++,
    name: grunt ? NAMES[sim.nextId % NAMES.length] : "Ash",
    home: "plaza",
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
    ...partial,
  };
}

function prefersReduced() {
  try {
    return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function createSim(tune?: Tune): Sim {
  const sim: Sim = {
    mode: "roam",
    running: false,
    paused: false,
    tune: clampTune(tune ?? {}),
    bodies: [],
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
    bufAtk: 0,
    bufGrab: 0,
    bufBlast: 0,
    bufJump: 0,
    prevAtk: false,
    prevGrab: false,
    prevBlast: false,
    prevJump: false,
    prevDash: false,
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

function addGrunt(sim: Sim, x: number, z: number, y: number, home: Home) {
  const g = blankBody(sim, { kind: "grunt", x, z, y, home, homeX: x, homeZ: z });
  const p = sim.bodies[0];
  g.yaw = p ? yawFromDir(p.x - g.x, p.z - g.z) : 0;
  sim.bodies.push(g);
}

function spawnBodies(sim: Sim) {
  sim.bodies = [];
  sim.grabId = -1;
  sim.cleared = false;
  sim.streetClear = false;
  sim.scaffoldClear = false;
  sim.plazaClear = false;
  sim.nextId = 1;
  sim.bodies.push(blankBody(sim, { kind: "player", x: 0, z: 2, yaw: 0, name: "Ash", home: "plaza" }));
  addGrunt(sim, 6, -4, 0, "plaza");
  addGrunt(sim, -8, 4, 0, "plaza");
  addGrunt(sim, 7, -1, 0, "plaza");
  addGrunt(sim, -16, -19, 0, "street");
  addGrunt(sim, -7, -18.3, 0, "street");
  addGrunt(sim, 1.5, -19.6, 0, "street");
  addGrunt(sim, 9, -18.4, 0, "street");
  addGrunt(sim, -8.4, 20, 2.4, "scaffold");
  addGrunt(sim, 7.2, 20, 2.55, "scaffold");
  placePlayer(sim, sim.mode);
  sim.foes = 9;
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
  spawnBodies(sim);
  sim.mode = mode;
  placePlayer(sim, mode);
  sim.banner = "Rematch";
  sim.bannerT = 1;
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
}

function hurt(sim: Sim, b: Body, dmg: number, poiseDmg: number, kx: number, kz: number, lift: number) {
  if (!b.alive || b.iframe > 0 || b.state === "out") return false;
  if (b.state === "grab") return false;
  b.hp -= dmg;
  b.poise -= poiseDmg;
  b.vx = kx;
  b.vz = kz;
  b.vy = Math.max(b.vy, lift);
  b.iframe = b.kind === "player" ? 0.38 : 0.14;
  sim.hitstop = Math.max(sim.hitstop, lift > 4 ? 0.06 : 0.04);
  sim.shake = Math.min(1, sim.shake + (lift > 4 ? 0.55 : 0.32));
  sim.sfx.push(b.kind === "player" ? "hurt" : "hit");
  burst(sim, b.x, b.y + 1, b.z, b.kind === "player" ? 0xe4572e : 0xf0b429);
  if (b.kind === "player" && sim.grabId >= 0) breakGrab(sim);
  if (b.hp <= 0) {
    b.hp = 0;
    if (b.kind === "player") {
      b.state = "down";
      b.stateT = 1.05;
    } else {
      b.alive = false;
      b.state = "out";
      b.stateT = 0.7;
      sim.combo += 1;
      sim.comboT = 1.3;
    }
    return true;
  }
  if (b.poise <= 0) {
    b.poise = b.kind === "player" ? SPEC.poisePlayer : SPEC.poiseGrunt;
    b.state = "down";
    b.stateT = 0.85;
    sim.sfx.push("crumple");
    return true;
  }
  if (lift > 4) {
    b.state = "launch";
    b.stateT = 0.2;
    return true;
  }
  b.state = "hit";
  b.stateT = sim.tune.hitstun;
  return true;
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

function hitGrunts(sim: Sim, hx: number, hz: number, radius: number, dmg: number, kb: number, lift: number, poise: number, dirX: number, dirZ: number) {
  const p = sim.bodies[0];
  let any = false;
  for (const e of sim.bodies) {
    if (e.kind !== "grunt" || !e.alive || e.state === "grab") continue;
    if (Math.abs(e.y + 0.7 - (p.y + 0.8)) > 1.35) continue;
    if (Math.hypot(e.x - hx, e.z - hz) > radius) continue;
    const awayX = e.x - p.x;
    const awayZ = e.z - p.z;
    const al = Math.hypot(awayX, awayZ) || 1;
    const kx = (dirX * 0.7 + (awayX / al) * 0.3) * kb;
    const kz = (dirZ * 0.7 + (awayZ / al) * 0.3) * kb;
    if (hurt(sim, e, dmg, poise, kx, kz, lift)) {
      any = true;
      p.meter = Math.min(100, p.meter + 8);
      sim.combo += 1;
      sim.comboT = 1.25;
    }
  }
  return any;
}

function swingDur(swing: number) {
  return swing === 3 ? 0.44 : 0.32;
}

function beginSwing(sim: Sim, p: Body) {
  if (p.comboWindow > 0 || p.queued) p.swing = p.swing >= 3 ? 1 : p.swing + 1;
  else p.swing = 1;
  p.queued = false;
  p.comboWindow = 0;
  p.state = "atk";
  p.swung = false;
  p.stateT = swingDur(p.swing);
  sim.bufAtk = 0;
  sim.sfx.push("swing");
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
  p.vx = dx * SPEC.dashSpeed;
  p.vz = dz * SPEC.dashSpeed;
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
  e.state = "throw";
  e.slam = true;
  e.iframe = 0.08;
  e.vx = dx * 12.5;
  e.vz = dz * 12.5;
  e.vy = 3.4;
  e.stateT = 0.48;
  e.hp -= SPEC.throwDamage;
  p.meter = Math.min(100, p.meter + 10);
  p.state = "free";
  p.iframe = Math.max(p.iframe, 0.12);
  sim.grabId = -1;
  sim.bufGrab = 0;
  sim.sfx.push("throw");
  if (e.hp <= 0) {
    e.hp = 0;
    e.alive = false;
    e.state = "out";
  }
}

function wallSlam(sim: Sim, b: Body) {
  b.slam = false;
  b.hp -= sim.tune.wallBonus;
  b.vx *= -0.28;
  b.vz *= -0.28;
  b.vy = 4.2;
  sim.shake = Math.min(1, sim.shake + 0.75);
  sim.hitstop = Math.max(sim.hitstop, 0.07);
  sim.sfx.push("slam");
  burst(sim, b.x, b.y + 0.8, b.z, 0xf3e6d4);
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

function resolveXZ(sim: Sim, b: Body) {
  let hit = false;
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
    hit = true;
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
  return hit;
}

function resolveY(sim: Sim, b: Body, prevY: number) {
  b.grounded = false;
  if (b.y <= 0) {
    b.y = 0;
    if (b.vy <= 0) {
      b.vy = 0;
      b.grounded = true;
    }
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
  b.vy -= sim.tune.gravity * dt;
  b.y += b.vy * dt;
  const dist = Math.hypot(b.vx, b.vz) * dt;
  const steps = Math.max(1, Math.ceil(dist / 0.28));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    b.x += b.vx * h;
    b.z += b.vz * h;
    const hit = resolveXZ(sim, b);
    if (hit && b.state === "throw" && b.slam) {
      wallSlam(sim, b);
      break;
    }
  }
  b.x = Math.min(24.2, Math.max(-24.2, b.x));
  b.z = Math.min(24.2, Math.max(-24.2, b.z));
  resolveY(sim, b, prevY);
  if (b.kind === "player") trySpring(sim, b);
  if ((b.state === "launch" || b.state === "throw") && b.grounded) {
    b.vx *= 0.25;
    b.vz *= 0.25;
    if (!b.alive || b.hp <= 0) {
      b.state = "out";
      b.alive = false;
    } else {
      b.state = "down";
      b.stateT = b.kind === "player" ? 0.35 : 0.55;
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

function engaged(home: Home, p: Body) {
  if (home === "street") return p.z < -12.6;
  if (home === "scaffold") return p.z > 14.2;
  return p.z > -12.8 && p.z < 14.6;
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
      if (yokoStreet && (e.yState === "hurt" || e.yState === "dying")) {
        e.vx *= Math.exp(-6 * dt);
        e.vz *= Math.exp(-6 * dt);
        continue;
      }
      e.stateT -= dt;
      e.vx *= Math.exp(-6 * dt);
      e.vz *= Math.exp(-6 * dt);
      if (e.stateT <= 0) e.state = "free";
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
        if (p.iframe <= 0 && p.state !== "dash" && Math.hypot(p.x - e.x, p.z - e.z) < 1.22 && Math.abs(p.y - e.y) < 1.2) {
          const f = forward(e.yaw);
          hurt(sim, p, 9, 10, f.x * 6.5, f.z * 6.5, 1.2);
        }
      }
      if (e.stateT <= 0) {
        e.state = "free";
        e.cd = 0.9;
      }
      continue;
    }
    if (e.state !== "free") continue;
    const hot = engaged(e.home, p);
    let ax = (hot ? p.x : e.homeX) - e.x;
    let az = (hot ? p.z : e.homeZ) - e.z;
    const d = Math.hypot(ax, az) || 1;
    if (hot && d < 1.22 && e.cd <= 0 && Math.abs(e.y - p.y) < 1.1 && p.state !== "down") {
      e.state = "windup";
      e.stateT = SPEC.enemyWindup;
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
    const sp = !hot ? sim.tune.enemySpeed * 0.65 : d < 1.05 ? 0 : sim.tune.enemySpeed;
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

  if (p.state === "down" || p.state === "hit") {
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
    }
    if (p.stateT <= 0) p.state = "free";
    return;
  }
  if (p.state === "grab") {
    p.vx = 0;
    p.vz = 0;
    p.stateT -= dt;
    const e = sim.bodies.find((b) => b.id === sim.grabId);
    if (!e || !e.alive) {
      sim.grabId = -1;
      p.state = "free";
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
      p.state = "free";
      sim.grabId = -1;
    }
    return;
  }
  if (p.state === "atk") {
    if (sim.mode === "belt") return;
    const dur = swingDur(p.swing);
    const startup = p.swing === 3 ? SPEC.launchStartup : p.swing === 2 ? SPEC.crossStartup : SPEC.jabStartup;
    const elapsed = dur - p.stateT;
    if (!p.swung && elapsed >= startup && elapsed < startup + SPEC.active) {
      p.swung = true;
      const f = forward(p.yaw);
      const lift = p.swing === 3 ? sim.tune.launcher : p.swing === 2 ? 2.4 : 0.2;
      const dmg = p.swing === 3 ? SPEC.launchDamage : p.swing === 2 ? SPEC.crossDamage : SPEC.jabDamage;
      const kb = p.swing === 3 ? 3.2 : p.swing === 2 ? 6.2 : 3.6;
      const poise = p.swing === 3 ? 18 : 11;
      hitGrunts(sim, p.x + f.x * 0.85, p.z + f.z * 0.85, p.swing === 3 ? 0.95 : 0.78, dmg, kb, lift, poise, f.x, f.z);
      p.vx += f.x * 2.4;
      p.vz += f.z * 2.4;
    }
    if (atk) {
      p.queued = true;
      sim.bufAtk = 0;
    }
    p.stateT -= dt;
    applyMove(sim, p, dt, 0.4);
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
      beginSwing(sim, p);
      return;
    }
  }
  if (grab) {
    const e = nearestGrunt(sim, sim.tune.grapple);
    if (e) {
      p.state = "grab";
      p.stateT = 1.35;
      e.state = "grab";
      e.vx = 0;
      e.vz = 0;
      e.vy = 0;
      sim.grabId = e.id;
      sim.bufGrab = 0;
      sim.sfx.push("grab");
    } else startDash(sim, p);
    return;
  }
  if (blast) {
    sim.bufBlast = 0;
    if (p.meter < SPEC.meterCost) sim.sfx.push("deny");
    else {
      p.meter -= SPEC.meterCost;
      p.state = "spin";
      p.stateT = 0.56;
      sim.spinPulse = 0;
      sim.sfx.push("blast");
      return;
    }
  }
  if (jump && sim.coyote > 0 && sim.mode !== "belt") {
    p.vy = sim.tune.jumpV;
    p.grounded = false;
    sim.coyote = 0;
    sim.bufJump = 0;
    sim.sfx.push("jump");
  }
  if (sim.mode !== "belt") applyMove(sim, p, dt, 1);
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

function glueGrab(sim: Sim) {
  if (sim.grabId < 0) return;
  const p = sim.bodies[0];
  const e = sim.bodies.find((b) => b.id === sim.grabId);
  if (!e || p.state !== "grab") return;
  const f = forward(p.yaw);
  e.x = p.x + f.x * 1.02;
  e.z = p.z + f.z * 1.02;
  e.y = p.y;
  e.vx = 0;
  e.vy = 0;
  e.vz = 0;
  e.yaw = p.yaw + Math.PI;
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
  return sim.bodies.some((b) => b.kind === "grunt" && b.home === home && b.alive);
}

export function step(sim: Sim, input: FrameInput, dt: number) {
  sim.sfx.length = 0;
  sim.time += dt;
  const atkEdge = input.attack && !sim.prevAtk;
  const grabEdge = input.grab && !sim.prevGrab;
  const blastEdge = input.blast && !sim.prevBlast;
  const jumpEdge = input.jump && !sim.prevJump;
  const dashEdge = input.dash && !sim.prevDash;
  sim.prevAtk = input.attack;
  sim.prevGrab = input.grab;
  sim.prevBlast = input.blast;
  sim.prevJump = input.jump;
  sim.prevDash = input.dash;
  if (atkEdge) sim.bufAtk = 0.16;
  else sim.bufAtk = Math.max(0, sim.bufAtk - dt);
  if (grabEdge) sim.bufGrab = 0.16;
  else sim.bufGrab = Math.max(0, sim.bufGrab - dt);
  if (blastEdge) sim.bufBlast = 0.16;
  else sim.bufBlast = Math.max(0, sim.bufBlast - dt);
  if (jumpEdge) sim.bufJump = 0.14;
  else sim.bufJump = Math.max(0, sim.bufJump - dt);

  if (!sim.running || sim.paused) return;
  if (sim.hitstop > 0) {
    sim.hitstop -= dt;
    sim.shake *= Math.exp(-8 * dt);
    return;
  }

  steer(sim, input);
  updatePlayer(sim, dt, dashEdge);
  updateEnemies(sim, dt);
  tickYokosukaBelt(sim, input, dt);
  for (const b of sim.bodies) moveBody(sim, b, dt);
  glueGrab(sim);

  const p = sim.bodies[0];
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
  sim.canGrab = p.state === "free" && nearestGrunt(sim, sim.tune.grapple) != null;

  const wasStreet = sim.streetClear;
  const wasPlaza = sim.plazaClear;
  sim.streetClear = !living(sim, "street");
  sim.plazaClear = !living(sim, "plaza");
  if (!sim.scaffoldClear && overlapGoal(p, sim.boxes)) {
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
  if (!sim.cleared && sim.streetClear && sim.plazaClear && sim.scaffoldClear) {
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
  };
}
