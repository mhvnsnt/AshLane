// Portion of YokosukaJS (MIT). Copyright (c) 2018 Allen Ussher.
// https://github.com/allenu/YokosukaJS — NextActorState and its helpers.

import type { YokoModel } from "./model";

export type YokoActorState = {
  state_name: string;
  frame_index: number;
};

function groupsWithState(groups: YokoModel["groups"], stateName: string) {
  const found: string[] = [];
  for (const key in groups) {
    if (groups[key].some((name) => name === stateName)) found.push(key);
  }
  return found;
}

function shares(first: string[], second: string[]) {
  return first.some((n) => second.indexOf(n) !== -1);
}

/** Their frame stepper. A matching transition wins over advancing the clip. */
export function nextActorState(model: YokoModel, actor: YokoActorState, inputs: string[]): YokoActorState {
  const groups = groupsWithState(model.groups, actor.state_name);
  const animation = model.states[actor.state_name];
  const transition = model.transitions.find((row) => {
    const any = row.from === "any";
    const group = groups.some((name) => name === row.from);
    const same = row.from === actor.state_name;
    const pressed = shares(inputs, row.input);
    let excluded = false;
    if (row.excluding) {
      excluded = row.excluding.some((name) => name === actor.state_name || groups.some((groupName) => groupName === name));
    }
    return (any || group || same) && pressed && !excluded;
  });

  let stateName = actor.state_name;
  let frame = actor.frame_index;

  if (transition) {
    const next = model.states[transition.to];
    if (next) {
      stateName = transition.to;
      if (transition.no_reset !== true) frame = 0;
      else {
        frame += 1;
        if (frame >= next.frames.length) frame = 0;
      }
    } else {
      stateName = model.default_state;
      frame = 0;
    }
  } else if (animation) {
    frame = actor.frame_index + 1;
    if (frame >= animation.frames.length) {
      stateName = animation.next ?? model.default_state;
      frame = 0;
    }
  } else {
    stateName = model.default_state;
    frame = 0;
  }

  return { state_name: stateName, frame_index: frame };
}
