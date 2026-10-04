// Portion of YokosukaJS directors.js (MIT). Copyright (c) 2018 Allen Ussher.
// MovementDirectionsFromUserInput is theirs.
// The NPC block is theirs with pixel thresholds converted by YOKO_PX
// (8px, 24px, 32px) and facing_right corrected to !facing_left.
// Their original reads actor.facing_right, which is never set, so NPCs
// could not turn one direction.

import { YOKO_PX } from "./model";

export type YokoPad = {
  left?: boolean;
  right?: boolean;
  up?: boolean;
  down?: boolean;
  a_key?: boolean;
  s_key?: boolean;
};

export function movementDirectionsFromUserInput(userInput: YokoPad, facingLeft: boolean) {
  const directions: string[] = [];
  if (userInput.a_key) directions.push("punch");
  if (userInput.s_key) directions.push("kick");
  if (userInput.left) {
    if (facingLeft) {
      if (userInput.down) directions.push("forward_down");
      else if (userInput.up) directions.push("forward_up");
      else directions.push("forward");
    } else directions.push("backward");
  } else if (userInput.right) {
    if (facingLeft) directions.push("backward");
    else if (userInput.down) directions.push("forward_down");
    else if (userInput.up) directions.push("forward_up");
    else directions.push("forward");
  } else if (userInput.down) directions.push("down");
  else if (userInput.up) directions.push("up");
  return directions;
}

type Npc = {
  id: string;
  actor_type: "player" | "npc";
  enabled: boolean;
  facing_left: boolean;
  position: { x: number; y: number };
};

/** Their NPC director. Attack rolls stay 0.05 per their frame. */
export function npcDirections(actor: Npc, actors: Npc[], rand: () => number) {
  const target = actors.find((other) => other.actor_type === "player" && other.enabled);
  if (!target) return [];
  const reach = 24 * YOKO_PX;
  const slack = 8 * YOKO_PX;
  const goal = {
    x: target.position.x < actor.position.x ? target.position.x + reach : target.position.x - reach,
    y: target.position.y,
  };
  const pad: YokoPad = {};
  const absX = Math.abs(actor.position.x - goal.x);
  if (actor.position.x < goal.x && absX > slack) pad.right = true;
  else if (actor.position.x > goal.x && absX > slack) pad.left = true;
  else if (actor.position.x < target.position.x && actor.facing_left) pad.right = true;
  else if (actor.position.x > target.position.x && !actor.facing_left) pad.left = true;

  const absY = Math.abs(actor.position.y - goal.y);
  if (actor.position.y < goal.y && absY > slack) pad.down = true;
  else if (actor.position.y > goal.y && absY > slack) pad.up = true;

  const directions = movementDirectionsFromUserInput(pad, actor.facing_left);
  const distance = Math.hypot(target.position.x - actor.position.x, target.position.y - actor.position.y);
  if (distance <= 32 * YOKO_PX) {
    if (rand() < 0.05) directions.push("punch");
    else if (rand() < 0.05) directions.push("kick");
  }
  return directions;
}
