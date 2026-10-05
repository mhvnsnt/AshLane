/**
 * Federated deterministic replay for AshLane.
 *
 * Inspiration: sinusphi/stickman-fighter (MIT) — deterministic replays:
 * record inputs per frame, re-simulate to reproduce the fight exactly.
 * Also the training-mode hitbox display concept.
 *
 * The sim is already deterministic (fixed timestep, seeded RNG); this module
 * records FrameInputs + the seed so any fight can be replayed or verified.
 */

export interface ReplayFrame {
  /** packed input bits */
  input: number;
  /** analog stick, quantized */
  x: number;
  y: number;
}

export interface Replay {
  version: 1;
  seed: number;
  frames: ReplayFrame[];
  /** sim tick rate */
  tickRate: number;
  result: string;
}

// Input bit flags (must match sim's FrameInput fields)
export const IN_ATTACK = 1 << 0;
export const IN_GRAB   = 1 << 1;
export const IN_BLAST  = 1 << 2;
export const IN_JUMP   = 1 << 3;
export const IN_DASH   = 1 << 4;
export const IN_USE    = 1 << 5;
export const IN_LOCK   = 1 << 6;

export function packInput(i: {
  attack: boolean; grab: boolean; blast: boolean; jump: boolean;
  dash: boolean; use: boolean; lock?: boolean;
}): number {
  let b = 0;
  if (i.attack) b |= IN_ATTACK;
  if (i.grab) b |= IN_GRAB;
  if (i.blast) b |= IN_BLAST;
  if (i.jump) b |= IN_JUMP;
  if (i.dash) b |= IN_DASH;
  if (i.use) b |= IN_USE;
  if (i.lock) b |= IN_LOCK;
  return b;
}

export function unpackInput(b: number): {
  attack: boolean; grab: boolean; blast: boolean; jump: boolean;
  dash: boolean; use: boolean; lock: boolean;
} {
  return {
    attack: !!(b & IN_ATTACK),
    grab: !!(b & IN_GRAB),
    blast: !!(b & IN_BLAST),
    jump: !!(b & IN_JUMP),
    dash: !!(b & IN_DASH),
    use: !!(b & IN_USE),
    lock: !!(b & IN_LOCK),
  };
}

export interface Recorder {
  replay: Replay;
  recording: boolean;
}

export function createRecorder(seed: number, tickRate = 60): Recorder {
  return {
    replay: { version: 1, seed, frames: [], tickRate, result: "" },
    recording: true,
  };
}

export function recordFrame(r: Recorder, packed: number, x: number, y: number): void {
  if (!r.recording) return;
  // Quantize analog to 2 decimals to keep replays small
  r.replay.frames.push({
    input: packed,
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
  });
}

export function finishRecording(r: Recorder, result: string): Replay {
  r.recording = false;
  r.replay.result = result;
  return r.replay;
}

/** Serialize to a compact string for sharing/saving */
export function serializeReplay(r: Replay): string {
  const frames = r.frames.map(f =>
    `${f.input.toString(36)},${Math.round(f.x * 100)},${Math.round(f.y * 100)}`
  ).join(";");
  return JSON.stringify({
    v: r.version, seed: r.seed, tick: r.tickRate, result: r.result, f: frames,
  });
}

export function deserializeReplay(s: string): Replay {
  const d = JSON.parse(s);
  const frames: ReplayFrame[] = d.f.split(";").map((p: string) => {
    const [ib, xs, ys] = p.split(",");
    return {
      input: parseInt(ib, 36),
      x: parseInt(xs, 10) / 100,
      y: parseInt(ys, 10) / 100,
    };
  });
  return { version: d.v, seed: d.seed, tickRate: d.tick, result: d.result, frames };
}

/** A "My Replays & Tips" moment (Tekken parallel): jump to a frame */
export function replayFrameAt(r: Replay, frame: number): ReplayFrame | null {
  return frame >= 0 && frame < r.frames.length ? r.frames[frame] : null;
}
