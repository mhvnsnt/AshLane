import { roomHostile, type Cart, type Mode, type Room } from "./model";

export const TILE = 16;
export const VIEW_W = 320;
export const VIEW_H = 180;
const RAD = 5;
const STEP_REACH = 18;

export type Dir = "n" | "s" | "e" | "w";
export type Kind = "player" | "grunt" | "bruiser" | "npc";

export type Input = {
  x: number;
  y: number;
  attackEdge: boolean;
  dashEdge: boolean;
  blastEdge: boolean;
};

export type Actor = {
  kind: Kind;
  x: number;
  y: number;
  z: number;
  vz: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  dir: Dir;
  hp: number;
  maxHp: number;
  meter: number;
  state: "idle" | "walk" | "atk" | "hit" | "dash";
  stateT: number;
  combo: number;
  comboWait: number;
  stun: number;
  iframe: number;
  cooldown: number;
  flash: number;
  npcIndex: number;
  name: string;
  text: string;
  alive: boolean;
  gone: boolean;
  downT: number;
  swung: boolean;
  queued: boolean;
  spawnSide: number;
};

export type Pickup = { x: number; y: number; kind: "H" | "C"; taken: boolean };
export type Bolt = { x: number; y: number; vx: number; vy: number; life: number };
export type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number };
export type Floater = { x: number; y: number; text: string; life: number; max: number };

export type Sim = {
  cart: Cart;
  room: Room;
  actors: Actor[];
  pickups: Pickup[];
  bolts: Bolt[];
  particles: Particle[];
  floats: Floater[];
  cleared: Set<string>;
  yaw: number;
  time: number;
  hitstop: number;
  trauma: number;
  spawnGrace: number;
  banner: string;
  bannerT: number;
  dialog: { name: string; text: string } | null;
  sfx: string[];
  downT: number;
  won: boolean;
  lockBuzz: number;
  reduced: boolean;
};

export function playerOf(sim: Sim) {
  return sim.actors[0];
}

function makeActor(partial: Pick<Actor, "kind" | "x" | "y"> & Partial<Actor>): Actor {
  return {
    z: 0,
    vz: 0,
    vx: 0,
    vy: 0,
    facing: 1,
    dir: "s",
    hp: 30,
    maxHp: 30,
    meter: 0,
    state: "idle",
    stateT: 0,
    combo: 0,
    comboWait: 0,
    stun: 0,
    iframe: 0,
    cooldown: 0.4,
    flash: 0,
    npcIndex: 0,
    name: "",
    text: "",
    alive: true,
    gone: false,
    downT: 0,
    swung: false,
    queued: false,
    spawnSide: 0,
    ...partial,
  };
}

function cell(room: Room, c: number, r: number) {
  if (r < 0 || c < 0 || r >= room.rows.length || c >= room.rows[0].length) return "#";
  return room.rows[r][c];
}

function solidTile(ch: string) {
  return ch === "#";
}

function blocked(room: Room, x: number, y: number) {
  const points: [number, number][] = [
    [x - RAD, y - RAD],
    [x + RAD, y - RAD],
    [x - RAD, y + RAD],
    [x + RAD, y + RAD],
  ];
  return points.some(([px, py]) => solidTile(cell(room, Math.floor(px / TILE), Math.floor(py / TILE))));
}

function slide(room: Room, actor: Actor, dx: number, dy: number) {
  if (!blocked(room, actor.x + dx, actor.y)) actor.x += dx;
  if (!blocked(room, actor.x, actor.y + dy)) actor.y += dy;
}

function findChar(room: Room, ch: string) {
  const found: { c: number; r: number }[] = [];
  room.rows.forEach((row, r) => {
    [...row].forEach((cellCh, c) => {
      if (cellCh === ch) found.push({ c, r });
    });
  });
  return found;
}

function center(c: number, r: number) {
  return { x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 };
}

function doorSpawn(room: Room, fromId: string) {
  let index = 0;
  for (let r = 0; r < room.rows.length; r++) {
    for (let c = 0; c < room.rows[r].length; c++) {
      if (room.rows[r][c] !== "D") continue;
      if (room.doors[index] === fromId) {
        const spot = center(c, r);
        const cx = (room.rows[r].length * TILE) / 2;
        const cy = (room.rows.length * TILE) / 2;
        const dx = cx - spot.x;
        const dy = cy - spot.y;
        const mag = Math.hypot(dx, dy) || 1;
        let x = spot.x + (dx / mag) * (TILE + 4);
        let y = spot.y + (dy / mag) * (TILE + 4);
        if (blocked(room, x, y)) {
          x = spot.x + Math.sign(dx || 1) * 8;
          y = spot.y + Math.sign(dy || 1) * 8;
        }
        return { x, y };
      }
      index += 1;
    }
  }
  return null;
}

function playerSpawn(room: Room) {
  const spots = findChar(room, "P");
  if (!spots.length) return { x: TILE * 2, y: TILE * 2 };
  return center(spots[0].c, spots[0].r);
}

export function lockX(room: Room) {
  for (let r = 0; r < room.rows.length; r++) {
    for (let c = 0; c < room.rows[0].length; c++) {
      if (room.rows[r][c] === "|") return c * TILE;
    }
  }
  return null;
}

function clearedKey(sim: Sim, roomId = sim.room.id) {
  return `${sim.cart.id}:${roomId}`;
}

export function gateClosed(sim: Sim) {
  const gate = lockX(sim.room);
  if (gate == null) return false;
  return sim.actors.some(
    (actor) => (actor.kind === "grunt" || actor.kind === "bruiser") && actor.hp > 0 && !actor.gone && actor.spawnSide < gate,
  );
}

export function bootRoom(sim: Sim, roomId: string, fromId: string | null, keep?: { hp: number; meter: number }) {
  const room = sim.cart.rooms.find((item) => item.id === roomId);
  if (!room) return;
  const quiet = sim.cleared.has(clearedKey(sim, room.id));
  sim.room = room;
  sim.bolts = [];
  sim.pickups = [];
  sim.floats = [];
  sim.dialog = null;
  sim.downT = 0;
  sim.spawnGrace = fromId ? 0.45 : 0;
  const spawn = (fromId && doorSpawn(room, fromId)) || playerSpawn(room);
  const player = makeActor({
    kind: "player",
    x: spawn.x,
    y: spawn.y,
    hp: keep?.hp ?? 100,
    maxHp: 100,
    meter: keep?.meter ?? 40,
    dir: "s",
  });
  sim.actors = [player];
  if (!quiet) {
    findChar(room, "E").forEach((spot) => {
      const pos = center(spot.c, spot.r);
      sim.actors.push(
        makeActor({
          kind: "grunt",
          x: pos.x,
          y: pos.y,
          hp: 28,
          maxHp: 28,
          facing: pos.x < spawn.x ? 1 : -1,
          spawnSide: pos.x,
        }),
      );
    });
    findChar(room, "M").forEach((spot) => {
      const pos = center(spot.c, spot.r);
      sim.actors.push(
        makeActor({
          kind: "bruiser",
          x: pos.x,
          y: pos.y,
          hp: 86,
          maxHp: 86,
          facing: -1,
          cooldown: 0.8,
          spawnSide: pos.x,
        }),
      );
    });
  }
  let npcIndex = 0;
  findChar(room, "N").forEach((spot) => {
    const pos = center(spot.c, spot.r);
    const meta = room.npcs[npcIndex] ?? { name: "Local", text: "..." };
    sim.actors.push(
      makeActor({
        kind: "npc",
        x: pos.x,
        y: pos.y,
        hp: 1,
        maxHp: 1,
        npcIndex,
        name: meta.name,
        text: meta.text,
        dir: "s",
      }),
    );
    npcIndex += 1;
  });
  findChar(room, "H").forEach((spot) => {
    const pos = center(spot.c, spot.r);
    sim.pickups.push({ x: pos.x, y: pos.y, kind: "H", taken: false });
  });
  findChar(room, "C").forEach((spot) => {
    const pos = center(spot.c, spot.r);
    sim.pickups.push({ x: pos.x, y: pos.y, kind: "C", taken: false });
  });
  sim.banner = room.name;
  sim.bannerT = 1.5;
}

export function createSim(cart: Cart, cleared: string[], reduced = false): Sim {
  const sim: Sim = {
    cart,
    room: cart.rooms[0],
    actors: [],
    pickups: [],
    bolts: [],
    particles: [],
    floats: [],
    cleared: new Set(cleared),
    yaw: 0,
    time: 0,
    hitstop: 0,
    trauma: 0,
    spawnGrace: 0,
    banner: "",
    bannerT: 0,
    dialog: null,
    sfx: [],
    downT: 0,
    won: false,
    lockBuzz: 0,
    reduced,
  };
  bootRoom(sim, cart.start, null);
  sim.banner = cart.id === "ashlane" ? "Walk the ward" : cart.name;
  sim.bannerT = 2.2;
  const needed = cart.rooms.filter(roomHostile).map((room) => `${cart.id}:${room.id}`);
  sim.won = needed.length > 0 && needed.every((key) => sim.cleared.has(key));
  return sim;
}

export function restartRoom(sim: Sim) {
  const player = playerOf(sim);
  bootRoom(sim, sim.room.id, null, { hp: player.maxHp, meter: Math.max(20, player.meter) });
}

function burst(sim: Sim, x: number, y: number, color: string, n: number, speed: number) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = speed * (0.4 + Math.random());
    sim.particles.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: 0.25 + Math.random() * 0.2,
      max: 0.45,
      color,
      size: 1 + Math.random() * 1.5,
    });
  }
  if (sim.particles.length > 100) sim.particles.splice(0, sim.particles.length - 100);
}

function floatText(sim: Sim, x: number, y: number, text: string) {
  sim.floats.push({ x, y, text, life: 0.7, max: 0.7 });
  if (sim.floats.length > 14) sim.floats.shift();
}

function dirOf(x: number, y: number, prev: Dir): Dir {
  if (Math.abs(x) < 0.2 && Math.abs(y) < 0.2) return prev;
  if (Math.abs(x) > Math.abs(y)) return x > 0 ? "e" : "w";
  return y > 0 ? "s" : "n";
}

function facingFromDir(dir: Dir, prev: 1 | -1): 1 | -1 {
  if (dir === "e") return 1;
  if (dir === "w") return -1;
  return prev;
}

function hurt(sim: Sim, target: Actor, attacker: Actor | null, dmg: number, knock: number, launch: boolean) {
  if (target.iframe > 0 || target.hp <= 0 || target.kind === "npc") return false;
  target.hp = Math.max(0, target.hp - dmg);
  target.flash = 0.12;
  target.stun = target.kind === "bruiser" ? 0.16 : 0.24;
  target.state = "hit";
  target.stateT = 0;
  const sign = attacker ? Math.sign(target.x - attacker.x) || attacker.facing : target.facing * -1;
  target.vx = sign * knock;
  target.vy = attacker ? (target.y - attacker.y) * 3 : 0;
  if (launch && sim.room.mode === "brawl") {
    target.vz = target.kind === "bruiser" ? 150 : 230;
    target.z = 1;
  }
  sim.hitstop = launch ? 0.07 : 0.045;
  if (!sim.reduced) sim.trauma = Math.min(1, sim.trauma + (launch ? 0.55 : 0.32));
  burst(sim, target.x, target.y - 10 - target.z, launch ? "#f0b429" : "#f3e6d4", launch ? 10 : 6, launch ? 80 : 50);
  floatText(sim, target.x, target.y - 18, String(dmg));
  if (target.kind === "player") {
    target.iframe = 0.5;
    sim.sfx.push("hurt");
    if (target.hp <= 0) {
      sim.downT = 1.15;
      sim.sfx.push("ko");
      sim.banner = "Down";
      sim.bannerT = 1;
    }
  } else {
    sim.sfx.push(launch ? "heavy" : "hit");
    const player = playerOf(sim);
    player.meter = Math.min(100, player.meter + (launch ? 18 : 12));
    if (target.hp <= 0) {
      target.downT = 0.45;
      target.vx = sign * knock * 1.2;
      burst(sim, target.x, target.y - 8, "#e4572e", 12, 90);
    }
  }
  return true;
}

function attackOrigin(actor: Actor, mode: Mode) {
  if (mode === "brawl") return { x: actor.x + actor.facing * 14, y: actor.y };
  const step = STEP_REACH;
  if (actor.dir === "e") return { x: actor.x + step, y: actor.y };
  if (actor.dir === "w") return { x: actor.x - step, y: actor.y };
  if (actor.dir === "n") return { x: actor.x, y: actor.y - step };
  return { x: actor.x, y: actor.y + step };
}

function inSwing(attacker: Actor, target: Actor, mode: Mode) {
  const origin = attackOrigin(attacker, mode);
  if (mode === "brawl") {
    const reachX = attacker.combo >= 2 || attacker.kind === "bruiser" ? 20 : 15;
    return Math.abs(origin.x - target.x) < reachX && Math.abs(attacker.y - target.y) < 13 && Math.abs(attacker.z - target.z) < 30;
  }
  return Math.hypot(origin.x - target.x, origin.y - target.y) < (attacker.kind === "bruiser" ? 18 : 14);
}

function trySwing(sim: Sim, actor: Actor) {
  if (actor.swung) return;
  const heavy = actor.kind === "player" && actor.combo >= 2;
  const dmg = actor.kind === "player" ? [10, 12, 18][actor.combo] : actor.kind === "bruiser" ? 16 : 8;
  const knock = actor.kind === "player" ? [80, 96, 150][actor.combo] : actor.kind === "bruiser" ? 120 : 70;
  for (const other of sim.actors) {
    if (other === actor || other.hp <= 0 || other.gone) continue;
    if (actor.kind === "player" && other.kind === "npc") continue;
    if (actor.kind !== "player" && other.kind !== "player") continue;
    if (!inSwing(actor, other, sim.room.mode)) continue;
    hurt(sim, other, actor, dmg, knock, heavy);
    actor.swung = true;
  }
}

function nearestTalk(sim: Sim) {
  const player = playerOf(sim);
  let best: { name: string; text: string; d: number } | null = null;
  for (const actor of sim.actors) {
    if (actor.kind !== "npc") continue;
    const d = Math.hypot(actor.x - player.x, actor.y - player.y);
    if (d < 30 && (!best || d < best.d)) best = { name: actor.name, text: actor.text, d };
  }
  const room = sim.room;
  let signIndex = 0;
  for (let r = 0; r < room.rows.length; r++) {
    for (let c = 0; c < room.rows[r].length; c++) {
      if (room.rows[r][c] !== "S") continue;
      const pos = center(c, r);
      const d = Math.hypot(pos.x - player.x, pos.y - player.y);
      const text = room.signs[signIndex] ?? "...";
      if (d < 30 && (!best || d < best.d)) best = { name: "Sign", text, d };
      signIndex += 1;
    }
  }
  return best;
}

function movePlayer(sim: Sim, dt: number, input: Input) {
  const player = playerOf(sim);
  const mode = sim.room.mode;
  if (player.hp <= 0) {
    player.vx *= Math.exp(-6 * dt);
    player.vy *= Math.exp(-6 * dt);
    slide(sim.room, player, player.vx * dt, player.vy * dt);
    return;
  }
  if (player.stun > 0 || player.z > 2) {
    player.stun = Math.max(0, player.stun - dt);
    player.vx *= Math.exp(-7 * dt);
    player.vy *= Math.exp(-7 * dt);
    const prevX = player.x;
    slide(sim.room, player, player.vx * dt, player.vy * dt);
    holdLock(sim, player, prevX);
    player.state = "hit";
    return;
  }
  if (player.state === "atk") {
    if (input.attackEdge) player.queued = true;
    player.stateT += dt;
    const dur = [0.18, 0.18, 0.32][player.combo];
    if (player.stateT > dur * 0.22 && player.stateT < dur * 0.78) trySwing(sim, player);
    const lunge = player.stateT < 0.07 ? (mode === "brawl" ? player.facing * 70 : 0) : 0;
    if (mode === "brawl") {
      const prevX = player.x;
      slide(sim.room, player, lunge * dt, 0);
      holdLock(sim, player, prevX);
    } else {
      const origin = attackOrigin(player, "roam");
      const dx = origin.x - player.x;
      const dy = origin.y - player.y;
      const mag = Math.hypot(dx, dy) || 1;
      if (player.stateT < 0.07) slide(sim.room, player, (dx / mag) * 60 * dt, (dy / mag) * 60 * dt);
    }
    if (player.stateT >= dur) {
      if (player.queued && player.combo < 2) {
        player.combo += 1;
        player.state = "atk";
        player.stateT = 0;
        player.swung = false;
        player.queued = false;
        if (player.combo === 2) sim.sfx.push("heavy");
      } else {
        player.state = "idle";
        player.comboWait = 0.42;
        player.queued = false;
      }
    }
    return;
  }
  if (player.state === "dash") {
    player.stateT += dt;
    const speed = 210;
    const prevX = player.x;
    if (mode === "brawl") slide(sim.room, player, player.facing * speed * dt, 0);
    else {
      const v = attackOrigin(player, "roam");
      const dx = v.x - player.x;
      const dy = v.y - player.y;
      const mag = Math.hypot(dx, dy) || 1;
      slide(sim.room, player, (dx / mag) * speed * dt, (dy / mag) * speed * dt);
    }
    holdLock(sim, player, prevX);
    if (player.stateT >= 0.14) player.state = "idle";
    return;
  }

  let ix = input.x;
  let iy = input.y;
  const mag = Math.hypot(ix, iy);
  if (mag > 1) {
    ix /= mag;
    iy /= mag;
  }
  const speed = mode === "brawl" ? 98 : 86;
  player.vx = ix * speed;
  player.vy = iy * speed;
  const prevX = player.x;
  slide(sim.room, player, player.vx * dt, player.vy * dt);
  holdLock(sim, player, prevX);
  player.dir = dirOf(ix, iy, player.dir);
  if (Math.abs(ix) > 0.2) player.facing = ix > 0 ? 1 : -1;
  else player.facing = facingFromDir(player.dir, player.facing);
  const moving = mag > 0.15;
  player.state = moving ? "walk" : "idle";
  if (moving && Math.random() < dt * 8) burst(sim, player.x, player.y + 2, "#6b4a34", 1, 18);

  if (input.attackEdge) {
    const talk = nearestTalk(sim);
    if (talk && mode === "roam") {
      sim.dialog = { name: talk.name, text: talk.text };
      sim.sfx.push("talk");
      player.vx = 0;
      player.vy = 0;
      return;
    }
    player.combo = player.comboWait > 0 && player.combo < 2 ? player.combo + 1 : 0;
    player.state = "atk";
    player.stateT = 0;
    player.swung = false;
    player.comboWait = 0;
    if (player.combo === 2) sim.sfx.push("heavy");
  } else if (input.dashEdge && player.cooldown <= 0) {
    player.state = "dash";
    player.stateT = 0;
    player.iframe = 0.16;
    player.cooldown = 0.55;
    sim.sfx.push("dash");
    const prevX = player.x;
    if (mode === "brawl") slide(sim.room, player, player.facing * 8, 0);
    holdLock(sim, player, prevX);
    burst(sim, player.x - player.facing * 6, player.y, "#f3e6d4", 5, 40);
  } else if (input.blastEdge && player.meter >= 34) {
    player.meter -= 34;
    const speed = 250;
    if (mode === "brawl") {
      sim.bolts.push({ x: player.x + player.facing * 12, y: player.y - 8, vx: player.facing * speed, vy: 0, life: 0.55 });
    } else {
      const aim = attackOrigin(player, "roam");
      const dx = aim.x - player.x;
      const dy = aim.y - player.y;
      const m = Math.hypot(dx, dy) || 1;
      sim.bolts.push({
        x: player.x + (dx / m) * 10,
        y: player.y + (dy / m) * 10 - 6,
        vx: (dx / m) * speed,
        vy: (dy / m) * speed,
        life: 0.5,
      });
    }
    sim.sfx.push("blast");
  }
}

function holdLock(sim: Sim, actor: Actor, prevX: number) {
  if (!gateClosed(sim)) return;
  const gate = lockX(sim.room);
  if (gate == null) return;
  if (prevX < gate && actor.x >= gate) {
    actor.x = gate - 1;
    actor.vx = 0;
    if (sim.lockBuzz <= 0) {
      sim.lockBuzz = 0.35;
      sim.banner = "Gate holds";
      sim.bannerT = 0.7;
      sim.sfx.push("lock");
    }
  }
}

function thinkEnemy(sim: Sim, enemy: Actor, dt: number) {
  const player = playerOf(sim);
  if (enemy.hp <= 0) {
    enemy.downT -= dt;
    enemy.vx *= Math.exp(-4 * dt);
    slide(sim.room, enemy, enemy.vx * dt, enemy.vy * dt);
    if (enemy.downT <= 0) enemy.gone = true;
    return;
  }
  if (enemy.stun > 0 || enemy.z > 2) {
    enemy.stun = Math.max(0, enemy.stun - dt);
    enemy.vx *= Math.exp(-6 * dt);
    enemy.vy *= Math.exp(-6 * dt);
    slide(sim.room, enemy, enemy.vx * dt, enemy.vy * dt);
    enemy.state = "hit";
    return;
  }
  if (enemy.state === "atk") {
    enemy.stateT += dt;
    const dur = enemy.kind === "bruiser" ? 0.48 : 0.36;
    if (enemy.stateT > dur * 0.4 && enemy.stateT < dur * 0.72) trySwing(sim, enemy);
    if (enemy.stateT >= dur) enemy.state = "idle";
    return;
  }
  if (player.hp <= 0) {
    enemy.state = "idle";
    enemy.vx = 0;
    enemy.vy = 0;
    return;
  }
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const mode = sim.room.mode;
  const speed = enemy.kind === "bruiser" ? 36 : 52;
  const reach = enemy.kind === "bruiser" ? 24 : 18;
  const depthOk = mode === "roam" || Math.abs(dy) < 12;
  const close = mode === "brawl" ? depthOk && Math.abs(dx) < reach : Math.hypot(dx, dy) < reach;
  if (close && enemy.cooldown <= 0) {
    enemy.state = "atk";
    enemy.stateT = 0;
    enemy.swung = false;
    enemy.cooldown = enemy.kind === "bruiser" ? 1.25 : 0.9;
    enemy.facing = dx >= 0 ? 1 : -1;
    enemy.dir = dirOf(dx, dy, enemy.dir);
    return;
  }
  if (mode === "brawl" && Math.abs(dy) > 8) slide(sim.room, enemy, 0, Math.sign(dy) * speed * dt);
  else if (Math.abs(dx) > 8 || mode === "roam") {
    const m = Math.hypot(dx, dy) || 1;
    const prevX = enemy.x;
    if (mode === "brawl") slide(sim.room, enemy, Math.sign(dx) * speed * dt, 0);
    else slide(sim.room, enemy, (dx / m) * speed * dt, (dy / m) * speed * dt);
    keepSide(sim, enemy, prevX);
    enemy.facing = dx >= 0 ? 1 : -1;
    enemy.dir = dirOf(dx, dy, enemy.dir);
  }
  enemy.state = "walk";
}

function separate(sim: Sim) {
  const foes = sim.actors.filter((actor) => actor.kind === "grunt" || actor.kind === "bruiser");
  for (let i = 0; i < foes.length; i++) {
    for (let j = i + 1; j < foes.length; j++) {
      const a = foes[i];
      const b = foes[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.001;
      if (d < 14) {
        const push = (14 - d) / 2;
        slide(sim.room, a, (-dx / d) * push, (-dy / d) * push);
        slide(sim.room, b, (dx / d) * push, (dy / d) * push);
      }
    }
  }
}

function updateBolts(sim: Sim, dt: number) {
  const mode = sim.room.mode;
  for (const bolt of sim.bolts) {
    bolt.life -= dt;
    bolt.x += bolt.vx * dt;
    bolt.y += bolt.vy * dt;
    if (blocked(sim.room, bolt.x, bolt.y + 8)) bolt.life = 0;
    for (const actor of sim.actors) {
      if (actor.kind === "player" || actor.kind === "npc" || actor.hp <= 0) continue;
      const depth = mode === "brawl" ? Math.abs(actor.y - (bolt.y + 8)) < 14 : true;
      if (depth && Math.hypot(actor.x - bolt.x, actor.y - (bolt.y + 8)) < 12 && Math.abs(actor.z) < 26) {
        hurt(sim, actor, playerOf(sim), 22, 110, mode === "brawl");
        bolt.life = 0;
        break;
      }
    }
  }
  sim.bolts = sim.bolts.filter((bolt) => bolt.life > 0);
}

function updatePickups(sim: Sim) {
  const player = playerOf(sim);
  if (player.hp <= 0) return;
  for (const pickup of sim.pickups) {
    if (pickup.taken) continue;
    if (Math.hypot(player.x - pickup.x, player.y - pickup.y) < 12) {
      pickup.taken = true;
      if (pickup.kind === "H") {
        player.hp = Math.min(player.maxHp, player.hp + 36);
        floatText(sim, player.x, player.y - 16, "+36");
      } else {
        player.meter = Math.min(100, player.meter + 40);
        floatText(sim, player.x, player.y - 16, "COIL");
      }
      sim.sfx.push("pickup");
      burst(sim, pickup.x, pickup.y, pickup.kind === "H" ? "#e4572e" : "#f0b429", 8, 40);
    }
  }
}

function doorAt(sim: Sim) {
  const player = playerOf(sim);
  const c = Math.floor(player.x / TILE);
  const r = Math.floor(player.y / TILE);
  let index = 0;
  for (let rr = 0; rr < sim.room.rows.length; rr++) {
    for (let cc = 0; cc < sim.room.rows[rr].length; cc++) {
      if (sim.room.rows[rr][cc] !== "D") continue;
      if (rr === r && cc === c) return sim.room.doors[index] ?? null;
      index += 1;
    }
  }
  return null;
}

function present(sim: Sim, dt: number) {
  sim.time += dt;
  sim.bannerT = Math.max(0, sim.bannerT - dt);
  sim.lockBuzz = Math.max(0, sim.lockBuzz - dt);
  sim.trauma = Math.max(0, sim.trauma - dt * 1.7);
  sim.spawnGrace = Math.max(0, sim.spawnGrace - dt);
  const player = sim.actors[0];
  if (player) {
    player.iframe = Math.max(0, player.iframe - dt);
    player.flash = Math.max(0, player.flash - dt);
    player.cooldown = Math.max(0, player.cooldown - dt);
    player.comboWait = Math.max(0, player.comboWait - dt);
    player.z += player.vz * dt;
    player.vz -= 980 * dt;
    if (player.z <= 0) {
      player.z = 0;
      player.vz = 0;
    }
    const speed = Math.hypot(player.vx, player.vy);
    if (speed > 8) sim.yaw = Math.atan2(-player.vx, -player.vy);
  }
  for (const actor of sim.actors) {
    if (actor === player) continue;
    actor.flash = Math.max(0, actor.flash - dt);
    actor.cooldown = Math.max(0, actor.cooldown - dt);
    actor.z += actor.vz * dt;
    actor.vz -= 980 * dt;
    if (actor.z <= 0) {
      actor.z = 0;
      actor.vz = 0;
    }
  }
  for (const particle of sim.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 20 * dt;
  }
  sim.particles = sim.particles.filter((particle) => particle.life > 0);
  for (const floater of sim.floats) floater.life -= dt;
  sim.floats = sim.floats.filter((floater) => floater.life > 0);
}

function keepSide(sim: Sim, enemy: Actor, prevX: number) {
  const gate = lockX(sim.room);
  if (gate == null || !gateClosed(sim)) return;
  if (enemy.spawnSide < gate && prevX < gate && enemy.x >= gate) enemy.x = gate - 1;
  if (enemy.spawnSide >= gate && enemy.x < gate + TILE) enemy.x = Math.max(enemy.x, gate + TILE);
}

function checkClear(sim: Sim) {
  if (!roomHostile(sim.room) || sim.actors.some((actor) => (actor.kind === "grunt" || actor.kind === "bruiser") && actor.hp > 0 && !actor.gone)) return;
  const key = clearedKey(sim);
  if (!sim.cleared.has(key)) {
    sim.cleared.add(key);
    sim.banner = "Lane clear";
    sim.bannerT = 2;
    sim.sfx.push("clear");
    burst(sim, playerOf(sim).x, playerOf(sim).y - 20, "#f0b429", 16, 70);
  }
  const needed = sim.cart.rooms.filter(roomHostile).map((room) => `${sim.cart.id}:${room.id}`);
  if (!sim.won && needed.length > 0 && needed.every((id) => sim.cleared.has(id))) {
    sim.won = true;
    sim.banner = sim.cart.id === "ashlane" ? "The ward is yours" : "Circuit clear";
    sim.bannerT = 3;
    sim.sfx.push("win");
  }
}

export function step(sim: Sim, dt: number, input: Input) {
  if (sim.hitstop > 0) {
    sim.hitstop -= dt;
    if (input.attackEdge) playerOf(sim).queued = true;
    present(sim, dt);
    return;
  }
  const player = playerOf(sim);
  if (sim.dialog) {
    present(sim, dt);
    if (input.attackEdge || input.dashEdge) sim.dialog = null;
    player.vx = 0;
    player.vy = 0;
    player.state = "idle";
    return;
  }
  if (sim.downT > 0) {
    sim.downT -= dt;
    present(sim, dt);
    if (sim.downT <= 0) bootRoom(sim, sim.room.id, null, { hp: player.maxHp, meter: Math.max(16, player.meter) });
    return;
  }
  const here = sim.room.id;
  movePlayer(sim, dt, input);
  for (const actor of sim.actors) {
    if (actor.kind === "grunt" || actor.kind === "bruiser") thinkEnemy(sim, actor, dt);
  }
  separate(sim);
  updateBolts(sim, dt);
  updatePickups(sim);
  if (sim.spawnGrace <= 0 && playerOf(sim).hp > 0) {
    const dest = doorAt(sim);
    if (dest && dest !== here) {
      const current = playerOf(sim);
      bootRoom(sim, dest, here, { hp: current.hp, meter: current.meter });
      present(sim, dt);
      return;
    }
  }
  sim.actors = sim.actors.filter((actor) => actor.kind === "player" || !actor.gone);
  present(sim, dt);
  checkClear(sim);
}

