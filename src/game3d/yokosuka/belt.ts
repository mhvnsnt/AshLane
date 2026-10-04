// Street clock for YokosukaJS. Their tick is 10fps (YOKO_FRAME).
// Positions stay in this ward's meters. Their pixel steps are scaled by YOKO_PX.

import type { Body, FrameInput, Sim } from "../sim";
import { nextActorState } from "./animata";
import { movementDirectionsFromUserInput, npcDirections } from "./directors";
import { YOKO_FRAME, YOKO_MODEL, YOKO_PX, YOKO_TOUCH } from "./model";

type Actor = {
  id: string;
  actor_type: "player" | "npc";
  enabled: boolean;
  facing_left: boolean;
  state_name: string;
  frame_index: number;
  health: number;
  position: { x: number; y: number };
  body: Body;
};

function busy(b: Body) {
  return b.state === "grab" || b.state === "spin" || b.state === "dash" || b.state === "launch" || b.state === "throw";
}

function frameOf(actor: Actor) {
  const state = YOKO_MODEL.states[actor.state_name];
  return state?.frames[actor.frame_index];
}

function actorsOf(sim: Sim): Actor[] {
  const list: Actor[] = [];
  for (const b of sim.bodies) {
    if (b.kind !== "player" && b.home !== "street") continue;
    if (!b.alive || b.state === "out" || b.state === "down") continue;
    if (b.state === "hit" && b.yState !== "hurt" && b.yState !== "dying") continue;
    if (busy(b)) continue;
    list.push({
      id: String(b.id),
      actor_type: b.kind === "player" ? "player" : "npc",
      enabled: b.alive,
      facing_left: b.facingLeft,
      state_name: b.yState,
      frame_index: b.yFrame,
      health: b.yHealth,
      position: { x: b.x, y: b.z },
      body: b,
    });
  }
  return list;
}

function playerPad(sim: Sim, input: FrameInput) {
  const attack = input.attack || sim.bufAtk > 0;
  const down = input.y > 0.35;
  return {
    left: input.x < -0.35,
    right: input.x > 0.35,
    up: input.y < -0.35,
    down,
    a_key: attack && !down,
    s_key: attack && down,
  };
}

function beingAttacked(actor: Actor, actors: Actor[]) {
  const other = actor.actor_type === "player" ? "npc" : "player";
  return actors.some((foe) => {
    if (!foe.enabled || foe.actor_type !== other || foe.id === actor.id) return false;
    if (Math.hypot(foe.position.x - actor.position.x, foe.position.y - actor.position.y) > YOKO_TOUCH) return false;
    const frame = frameOf(foe);
    return (frame?.attack ?? 0) > 0;
  });
}

function writePose(sim: Sim, actor: Actor) {
  const b = actor.body;
  b.facingLeft = actor.facing_left;
  b.yState = actor.state_name;
  b.yFrame = actor.frame_index;
  b.yHealth = actor.health;
  if (b.state === "down") {
    b.vx = 0;
    b.vz = 0;
    return;
  }
  b.yaw = actor.facing_left ? Math.PI / 2 : -Math.PI / 2;
  if (actor.state_name === "dying") {
    if (b.kind === "player") b.state = "hit";
    else {
      b.state = "out";
      b.alive = false;
      b.hp = 0;
    }
    b.vx = 0;
    b.vz = 0;
    return;
  }
  if (actor.state_name === "hurt") b.state = "hit";
  else if (actor.state_name === "punching") {
    b.state = "atk";
    b.swing = 1;
  } else if (actor.state_name === "kicking") {
    b.state = "atk";
    b.swing = 3;
  } else if (!busy(b)) b.state = "free";
  const frame = frameOf(actor);
  if (!frame) {
    b.vx = 0;
    b.vz = 0;
    return;
  }
  const speedScale = b.kind === "player" ? sim.tune.moveSpeed / 6.4 : sim.tune.enemySpeed / 3.35;
  let factor = actor.facing_left ? -1 : 1;
  if (b.kind !== "player") factor *= 0.5;
  const dx = (frame.x_move ?? 0) * factor * YOKO_PX * speedScale;
  const dz = (frame.y_move ?? 0) * YOKO_PX * speedScale;
  b.vx = dx / YOKO_FRAME;
  b.vz = dz / YOKO_FRAME;
}

function applyFrame(sim: Sim, actor: Actor, prev: string) {
  const frame = frameOf(actor);
  const b = actor.body;
  if (!frame) return;
  if (frame.flip) actor.facing_left = !actor.facing_left;
  if (frame.jump_v && b.kind === "player" && actor.state_name !== prev) {
    b.vy = sim.tune.jumpV;
    b.grounded = false;
    sim.coyote = 0;
    sim.bufJump = 0;
    sim.sfx.push("jump");
  }
  if (frame.health_hit && actor.state_name !== prev) {
    actor.health -= frame.health_hit;
    const bites = b.kind === "player" ? 8 : 4;
    b.hp = Math.max(0, b.hp - b.maxHp / bites);
    sim.hitstop = Math.max(sim.hitstop, 0.04);
    sim.shake = Math.min(1, sim.shake + 0.32);
    sim.sfx.push(b.kind === "player" ? "hurt" : "hit");
    if (b.kind === "grunt") {
      const p = sim.bodies[0];
      if (p) p.meter = Math.min(100, p.meter + 8);
      sim.combo += 1;
      sim.comboT = 1.25;
      sim.landed = true;
    }
    if (b.hp <= 0) actor.health = 0;
  }
  if (frame.signals?.includes("disable_sender")) {
    actor.enabled = false;
    if (b.kind === "player") {
      actor.health = 8;
      actor.state_name = "standing";
      actor.frame_index = 0;
      b.yHealth = 8;
      b.hp = 0;
      b.state = "down";
      b.stateT = 1.05;
    } else {
      b.alive = false;
      b.hp = 0;
      b.state = "out";
      b.stateT = 0.7;
    }
  }
  if ((frame.attack ?? 0) > 0 && actor.state_name !== prev) {
    sim.sfx.push("swing");
    if (b.kind === "player") {
      const fx = actor.facing_left ? -1 : 1;
      sim.pulse = { x: b.x + fx * 0.85, z: b.z, r: 1.15 };
    }
  }
}

function stepActors(sim: Sim, input: FrameInput) {
  const actors = actorsOf(sim);
  if (!actors.length) return;
  const requested: Record<string, string[]> = {};
  const pads = actors.map((actor) => ({
    id: actor.id,
    actor_type: actor.actor_type,
    enabled: actor.enabled,
    facing_left: actor.facing_left,
    position: actor.position,
  }));
  for (const actor of actors) {
    if (!actor.enabled) {
      requested[actor.id] = [];
      continue;
    }
    if (actor.actor_type === "player") {
      const dirs = movementDirectionsFromUserInput(playerPad(sim, input), actor.facing_left);
      if ((input.jump || sim.bufJump > 0) && (actor.body.grounded || sim.coyote > 0)) dirs.unshift("jump");
      requested[actor.id] = dirs;
    } else requested[actor.id] = npcDirections(pads.find((row) => row.id === actor.id)!, pads, Math.random);
  }
  for (const actor of actors) {
    if (!actor.enabled) continue;
    let dirs = requested[actor.id] ?? [];
    if (actor.health <= 0) dirs = ["die"];
    else if (beingAttacked(actor, actors)) dirs = ["hurt"];
    const prev = actor.state_name;
    const next = nextActorState(YOKO_MODEL, actor, dirs);
    actor.state_name = next.state_name;
    actor.frame_index = next.frame_index;
    applyFrame(sim, actor, prev);
    writePose(sim, actor);
  }
}

export function tickYokosukaBelt(sim: Sim, input: FrameInput, dt: number) {
  if (sim.mode !== "belt") return;
  sim.yokoClock += dt;
  let guard = 0;
  while (sim.yokoClock >= YOKO_FRAME && guard < 3) {
    sim.yokoClock -= YOKO_FRAME;
    stepActors(sim, input);
    guard += 1;
  }
}

export function resetYoko(b: Body) {
  b.yState = "standing";
  b.yFrame = 0;
  b.yHealth = b.kind === "player" ? 8 : 4;
  b.facingLeft = Math.sin(b.yaw) > 0;
}
