// Combat model from YokosukaJS resources/model.yaml (MIT).
// Copyright (c) 2018 Allen Ussher. https://github.com/allenu/YokosukaJS
// Sprite names stay as labels only. The RCR sprites themselves are not used.
// ADD marks the jump state this ward needs. Everything else is their file.

export type YokoFrame = {
  sprite: string;
  attack?: number;
  x_move?: number;
  y_move?: number;
  flip?: boolean;
  health_hit?: number;
  signals?: string;
  spark?: boolean;
  /** ADD. Not in the original model. */
  jump_v?: number;
};

export type YokoTransition = {
  from: string;
  excluding?: string[];
  to: string;
  input: string[];
  no_reset?: boolean;
};

export type YokoModel = {
  default_state: string;
  states: Record<string, { frames: YokoFrame[]; next?: string; uninterruptible?: boolean }>;
  groups: Record<string, string[]>;
  transitions: YokoTransition[];
};

export const YOKO_MODEL: YokoModel = {
  default_state: "standing",
  states: {
    standing: { frames: [{ sprite: "Standing" }], next: "standing" },
    punching: {
      frames: [{ sprite: "Punching 1" }, { sprite: "Punching 2" }, { sprite: "Punching 3", attack: 10 }, { sprite: "Punching 3" }],
    },
    kicking: {
      frames: [{ sprite: "Kicking 1" }, { sprite: "Kicking 2" }, { sprite: "Kicking 3", attack: 5 }, { sprite: "Kicking 3" }],
    },
    walking_fwd: {
      frames: [
        { sprite: "Walking 1", x_move: 10 },
        { sprite: "Walking 2", x_move: 10 },
      ],
    },
    walking_fwd_down: {
      frames: [
        { sprite: "Walking 1", x_move: 5, y_move: 5 },
        { sprite: "Walking 2", x_move: 10, y_move: 5 },
      ],
    },
    walking_fwd_up: {
      frames: [
        { sprite: "Walking 1", x_move: 5, y_move: -5 },
        { sprite: "Walking 2", x_move: 10, y_move: -5 },
      ],
    },
    walking_up: {
      frames: [
        { sprite: "Walking 1", y_move: -10 },
        { sprite: "Walking 2", y_move: -10 },
      ],
    },
    walking_down: {
      frames: [
        { sprite: "Walking 1", y_move: 10 },
        { sprite: "Walking 2", y_move: 10 },
      ],
    },
    turn_around: { frames: [{ sprite: "Standing", flip: true }] },
    hurt: {
      frames: [
        { sprite: "Hurt 1", spark: true, health_hit: 1, signals: "sfx_oof" },
        { sprite: "Hurt 2" },
        { sprite: "Hurt 2" },
        { sprite: "Hurt 2" },
        { sprite: "Hurt 3" },
      ],
      uninterruptible: true,
    },
    dying: {
      frames: [
        { sprite: "Hurt 4" },
        { sprite: "Hurt 4" },
        { sprite: "Hurt 5" },
        { sprite: "Hurt 5" },
        { sprite: "Hurt 4" },
        { sprite: "Hurt 4" },
        { sprite: "Hurt 5" },
        { sprite: "Hurt 5" },
        { sprite: "Hurt 4" },
        { sprite: "Hurt 4" },
        { sprite: "Hurt 5" },
        { sprite: "Hurt 5", signals: "disable_sender Died" },
      ],
      uninterruptible: true,
    },
    // ADD
    jumping: { frames: [{ sprite: "Jumping", jump_v: 1 }], next: "standing" },
  },
  groups: {
    attacking: ["punching", "kicking"],
    standing_walking: ["standing", "turn_around", "walking_fwd", "walking_down", "walking_up", "walking_fwd_down", "walking_fwd_up"],
  },
  transitions: [
    // ADD — listed first so Space beats a held punch
    { from: "standing_walking", to: "jumping", input: ["jump"] },
    { from: "any", excluding: ["hurt", "dying"], to: "dying", input: ["die"] },
    { from: "any", excluding: ["hurt", "dying"], to: "hurt", input: ["hurt"] },
    { from: "standing_walking", to: "punching", input: ["punch"] },
    { from: "standing_walking", to: "kicking", input: ["kick"] },
    { from: "standing_walking", to: "walking_fwd", input: ["forward"], no_reset: true },
    { from: "standing_walking", to: "walking_fwd_down", input: ["forward_down"], no_reset: true },
    { from: "standing_walking", to: "walking_fwd_up", input: ["forward_up"], no_reset: true },
    { from: "standing_walking", to: "walking_down", input: ["down"], no_reset: true },
    { from: "standing_walking", to: "walking_up", input: ["up"], no_reset: true },
    { from: "standing", to: "turn_around", input: ["backward"] },
  ],
};

export const YOKO_FRAME = 0.1;
/** Their 10px step at 10fps, scaled so 10px matches the default move speed of 6.4. */
export const YOKO_PX = 0.064;
/** Their touch test was 32px. */
export const YOKO_TOUCH = 32 * YOKO_PX;
