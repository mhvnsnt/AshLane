import { clampTune, loadTune, saveTune, type Mode, type Tune } from "./spec";
import { createSim, rematch, setMode, warp, snapshot, step, type FrameInput, type Sim } from "./sim";
import { createView } from "./view";

export type Handle = {
  start: (mode: Mode) => void;
  pause: (paused: boolean) => void;
  rematch: () => void;
  focus: (mode: Mode) => void;
  tune: (partial: Partial<Tune>) => void;
  setStick: (x: number, y: number) => void;
  setBtn: (name: "attack" | "grab" | "blast" | "jump" | "dash", down: boolean) => void;
  dispose: () => void;
};

const WATCH = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "KeyJ",
  "KeyK",
  "KeyL",
  "KeyU",
  "KeyZ",
  "KeyX",
]);

export function mount(canvas: HTMLCanvasElement, push: (hud: ReturnType<typeof snapshot>) => void): Handle {
  const sim = createSim(loadTune());
  const view = createView(canvas);
  const keys = new Set<string>();
  const stick = { x: 0, y: 0 };
  const btns = { attack: false, grab: false, blast: false, jump: false, dash: false };
  const input: FrameInput = { x: 0, y: 0, attack: false, grab: false, blast: false, jump: false, dash: false };
  let audio: AudioContext | null = null;
  let raf = 0;
  let hudAcc = 0;
  let last = performance.now();
  let acc = 0;
  let pointerId = -1;
  let orbiting = false;

  const onKeyDown = (e: KeyboardEvent) => {
    if (WATCH.has(e.code)) e.preventDefault();
    keys.add(e.code);
    unlock();
  };
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);
  const clearKeys = () => keys.clear();
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", clearKeys);
  document.addEventListener("visibilitychange", clearKeys);

  let lastX = 0;
  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || !sim.running || sim.mode !== "roam") return;
    orbiting = true;
    pointerId = e.pointerId;
    lastX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
    unlock();
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!orbiting || e.pointerId !== pointerId) return;
    sim.orbit -= (e.clientX - lastX) * 0.005;
    lastX = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    orbiting = false;
    pointerId = -1;
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  const parent = canvas.parentElement ?? canvas;
  const ro = new ResizeObserver(() => view.resize());
  ro.observe(parent);

  window.__controlsTest = {
    getYaw: () => sim.bodies[0]?.yaw ?? 0,
    getX: () => sim.bodies[0]?.x ?? 0,
    getSpeed: () => {
      const p = sim.bodies[0];
      return p ? Math.hypot(p.vx, p.vz) : 0;
    },
    setKeys: (codes) => {
      keys.clear();
      for (const code of codes) keys.add(code);
    },
  };

  const pump = (now: number) => {
    const frameDt = Math.min(0.05, (now - last) / 1000);
    last = now;
    acc += frameDt;
    readInput(sim, keys, stick, btns, input);
    let guard = 0;
    while (acc >= 1 / 60 && guard < 5) {
      step(sim, input, 1 / 60);
      playSfx(sim.sfx);
      acc -= 1 / 60;
      guard += 1;
    }
    view.render(sim, frameDt);
    hudAcc += frameDt;
    if (hudAcc > 0.1) {
      hudAcc = 0;
      push(snapshot(sim));
    }
    raf = requestAnimationFrame(pump);
  };
  push(snapshot(sim));
  raf = requestAnimationFrame(pump);

  function unlock() {
    if (!audio) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      audio = new Ctx();
    }
    if (audio.state === "suspended") void audio.resume();
  }

  function playSfx(names: string[]) {
    if (!audio || audio.state !== "running") return;
    const heard = new Set<string>();
    for (const name of names) {
      if (heard.has(name)) continue;
      heard.add(name);
      blip(audio, name);
      if (heard.size > 3) break;
    }
  }

  return {
    start(mode) {
      unlock();
      sim.running = true;
      sim.paused = false;
      setMode(sim, mode);
      push(snapshot(sim));
    },
    pause(paused) {
      sim.paused = paused;
      push(snapshot(sim));
    },
    rematch() {
      rematch(sim);
      sim.paused = false;
      push(snapshot(sim));
    },
    focus(mode) {
      unlock();
      sim.running = true;
      sim.paused = false;
      warp(sim, mode);
      push(snapshot(sim));
    },
    tune(partial) {
      sim.tune = clampTune(partial, sim.tune);
      saveTune(sim.tune);
      push(snapshot(sim));
    },
    setStick(x, y) {
      stick.x = x;
      stick.y = y;
    },
    setBtn(name, down) {
      btns[name] = down;
      if (down) unlock();
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearKeys);
      document.removeEventListener("visibilitychange", clearKeys);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      ro.disconnect();
      view.dispose();
      window.__controlsTest = undefined;
    },
  };
}

function readInput(sim: Sim, keys: Set<string>, stick: { x: number; y: number }, btns: { attack: boolean; grab: boolean; blast: boolean; jump: boolean; dash: boolean }, input: FrameInput) {
  let x = stick.x;
  let y = stick.y;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) x -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) x += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) y -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) y += 1;
  const pads = navigator.getGamepads?.();
  const pad = pads ? pads[0] : null;
  if (pad) {
    const dz = deadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
    x += dz.x;
    y += dz.y;
    if ((pad.axes[2] ?? 0) > 0.2 || (pad.axes[2] ?? 0) < -0.2) sim.orbit -= (pad.axes[2] ?? 0) * 0.03;
  }
  const mag = Math.hypot(x, y);
  if (mag > 1) {
    x /= mag;
    y /= mag;
  }
  input.x = x;
  input.y = y;
  input.attack = btns.attack || keys.has("KeyJ") || keys.has("KeyZ") || !!pad?.buttons[0]?.pressed;
  input.grab = btns.grab || keys.has("KeyK") || !!pad?.buttons[1]?.pressed;
  input.blast = btns.blast || keys.has("KeyL") || keys.has("KeyX") || !!pad?.buttons[2]?.pressed;
  input.jump = btns.jump || keys.has("Space") || keys.has("KeyU") || !!pad?.buttons[3]?.pressed;
  input.dash = btns.dash || keys.has("ShiftLeft") || keys.has("ShiftRight") || !!pad?.buttons[5]?.pressed;
}

function deadzone(x: number, y: number) {
  const m = Math.hypot(x, y);
  if (m < 0.18) return { x: 0, y: 0 };
  const scale = (m - 0.18) / (1 - 0.18) / m;
  return { x: x * scale, y: y * scale };
}

function blip(audio: AudioContext, name: string) {
  const o = audio.createOscillator();
  const g = audio.createGain();
  const now = audio.currentTime;
  const table: Record<string, [number, number, OscillatorType]> = {
    swing: [220, 0.07, "square"],
    hit: [180, 0.08, "triangle"],
    hurt: [110, 0.14, "sawtooth"],
    grab: [140, 0.1, "square"],
    throw: [90, 0.12, "sawtooth"],
    slam: [70, 0.18, "square"],
    blast: [320, 0.16, "sawtooth"],
    jump: [420, 0.08, "square"],
    spring: [520, 0.12, "square"],
    dash: [260, 0.06, "triangle"],
    win: [660, 0.22, "square"],
    deny: [80, 0.08, "square"],
    crumple: [100, 0.12, "triangle"],
    land: [150, 0.05, "triangle"],
  };
  const spec = table[name] ?? [200, 0.05, "square"];
  o.type = spec[2];
  o.frequency.setValueAtTime(spec[0], now);
  if (name === "win") o.frequency.exponentialRampToValueAtTime(880, now + 0.18);
  g.gain.setValueAtTime(0.08, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + spec[1]);
  o.connect(g);
  g.connect(audio.destination);
  o.start(now);
  o.stop(now + spec[1] + 0.02);
}
