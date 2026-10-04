import { clampTune, loadTune, saveTune, type Mode, type Tune } from "./spec";
import { createSim, rematch, saveShape, setMode, startBout as bootBout, startStory as bootStory, warp, snapshot, step, type FrameInput, type Sim } from "./sim";
import { createView } from "./view";
import { equipStyle, retargetSlot, type Slot } from "./rig-pipeline";
import { loadCleared, loadPurse, loadXp } from "./campaign";
import { applyFighter, applyMartial, applyStance, loadFighter, saveFighter } from "./styles";
import { fighterById } from "./roster";

export type Handle = {
  start: (mode: Mode) => void;
  pause: (paused: boolean) => void;
  rematch: () => void;
  focus: (mode: Mode) => void;
  tune: (partial: Partial<Tune>) => void;
  setStyle: (id: string) => void;
  setBuild: (id: "chibi" | "full") => void;
  setCrowd: (id: "mix" | "chibi" | "full") => void;
  setShape: (partial: { height?: number; bulk?: number; head?: number; leg?: number; shoulder?: number }) => void;
  setMartial: (id: string) => void;
  setWho: (id: string) => void;
  setAttire: (file: string) => void;
  setStance: (id: string) => void;
  setStage: (id: string) => void;
  startBout: (kind: "exhibit" | "practice", stage: string) => void;
  startStory: (index: number) => void;
  quit: () => void;
  assignClip: (slot: Slot, clip: string) => void;
  setStick: (x: number, y: number) => void;
  setBtn: (name: "attack" | "grab" | "blast" | "jump" | "dash" | "use", down: boolean) => void;
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
  "KeyF",
]);

export function mount(canvas: HTMLCanvasElement, push: (hud: ReturnType<typeof snapshot>) => void): Handle {
  const sim = createSim(loadTune());
  sim.clearedMission = loadCleared();
  sim.purse = loadPurse();
  sim.xp = loadXp();
  sim.level = 1 + Math.floor(sim.xp / 100);
  const ranked = sim.bodies[0];
  if (ranked && sim.level > 1) {
    ranked.maxHp += (sim.level - 1) * 8;
    ranked.hp = ranked.maxHp;
  }
  const fighter = loadFighter();
  if (fighter) {
    sim.style = fighter.style;
    sim.martial = fighter.martial;
    sim.stance = fighter.stance;
    applyFighter(fighter.style, fighter.martial, fighter.slots);
    applyStance(fighter.stance);
  }
  const view = createView(canvas);
  const keys = new Set<string>();
  const stick = { x: 0, y: 0 };
  const btns = { attack: false, grab: false, blast: false, jump: false, dash: false, use: false };
  const input: FrameInput = { x: 0, y: 0, attack: false, grab: false, blast: false, jump: false, dash: false, use: false };
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
    setStyle(id) {
      sim.style = id;
      equipStyle(id);
      if (sim.martial) applyMartial(sim.martial);
      applyStance(sim.stance);
      saveFighter(sim.style, sim.martial, sim.stance);
      push(snapshot(sim));
    },
    setBuild(id) {
      sim.build = id;
      saveShape(sim);
      push(snapshot(sim));
    },
    setCrowd(id) {
      sim.crowd = id;
      saveShape(sim);
      push(snapshot(sim));
    },
    setShape(partial) {
      const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
      if (partial.height !== undefined) sim.height = clamp(partial.height, 0.86, 1.18);
      if (partial.bulk !== undefined) sim.bulk = clamp(partial.bulk, 0.8, 1.25);
      if (partial.head !== undefined) sim.head = clamp(partial.head, 0.75, 1.3);
      if (partial.leg !== undefined) sim.leg = clamp(partial.leg, 0.82, 1.22);
      if (partial.shoulder !== undefined) sim.shoulder = clamp(partial.shoulder, 0.82, 1.22);
      saveShape(sim);
      push(snapshot(sim));
    },
    setMartial(id) {
      sim.martial = id;
      equipStyle(sim.style);
      applyMartial(id);
      applyStance(sim.stance);
      saveFighter(sim.style, sim.martial, sim.stance);
      push(snapshot(sim));
    },
    setWho(id) {
      const row = fighterById(id);
      sim.who = row.name;
      sim.bio = row.bio;
      sim.cast = row.attires[0]?.file ?? "";
      sim.martial = row.martial;
      const p = sim.bodies[0];
      if (p) p.name = row.name;
      equipStyle(sim.style);
      applyMartial(row.martial);
      applyStance(sim.stance);
      saveFighter(sim.style, sim.martial, sim.stance);
      push(snapshot(sim));
    },
    setAttire(file) {
      sim.cast = file;
      push(snapshot(sim));
    },
    setStance(id) {
      sim.stance = id;
      applyStance(id);
      saveFighter(sim.style, sim.martial, sim.stance);
      push(snapshot(sim));
    },
    setStage(id) {
      sim.stage = id;
      push(snapshot(sim));
    },
    startBout(kind, stage) {
      unlock();
      bootBout(sim, kind, stage);
      push(snapshot(sim));
    },
    startStory(index) {
      unlock();
      bootStory(sim, index);
      push(snapshot(sim));
    },
    quit() {
      sim.running = false;
      sim.paused = false;
      sim.story = false;
      sim.bout = "off";
      push(snapshot(sim));
    },
    assignClip(slot, clip) {
      retargetSlot("player", slot, clip);
      saveFighter(sim.style, sim.martial, sim.stance);
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

function readInput(sim: Sim, keys: Set<string>, stick: { x: number; y: number }, btns: { attack: boolean; grab: boolean; blast: boolean; jump: boolean; dash: boolean; use: boolean }, input: FrameInput) {
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
  input.use = btns.use || keys.has("KeyF") || !!pad?.buttons[4]?.pressed;
}

function deadzone(x: number, y: number) {
  const m = Math.hypot(x, y);
  if (m < 0.18) return { x: 0, y: 0 };
  const scale = (m - 0.18) / (1 - 0.18) / m;
  return { x: x * scale, y: y * scale };
}

function blip(audio: AudioContext, name: string) {
  const now = audio.currentTime;
  const impact = name === "hit" || name === "hurt" || name === "slam" || name === "throw" || name === "swing" || name === "crumple" || name === "grab";
  if (impact) {
    const dur = name === "slam" || name === "throw" ? 0.16 : 0.07;
    const count = Math.floor(audio.sampleRate * dur);
    const buf = audio.createBuffer(1, count, audio.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < count; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / count);
    const src = audio.createBufferSource();
    src.buffer = buf;
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = name === "slam" || name === "throw" ? 280 : name === "swing" ? 1400 : 700;
    const g = audio.createGain();
    g.gain.setValueAtTime(name === "swing" ? 0.05 : 0.12, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(audio.destination);
    src.start(now);
    if (name === "swing" || name === "grab") return;
  }
  const o = audio.createOscillator();
  const tone = audio.createGain();
  const table: Record<string, [number, number, OscillatorType]> = {
    swing: [220, 0.07, "square"],
    hit: [140, 0.06, "triangle"],
    hurt: [90, 0.12, "sawtooth"],
    grab: [140, 0.1, "square"],
    throw: [70, 0.14, "sawtooth"],
    slam: [55, 0.16, "square"],
    blast: [320, 0.16, "sawtooth"],
    jump: [420, 0.08, "square"],
    spring: [520, 0.12, "square"],
    dash: [260, 0.06, "triangle"],
    win: [660, 0.22, "square"],
    deny: [80, 0.08, "square"],
    crumple: [80, 0.1, "triangle"],
    land: [120, 0.05, "triangle"],
  };
  const spec = table[name] ?? [200, 0.05, "square"];
  o.type = spec[2];
  o.frequency.setValueAtTime(spec[0], now);
  if (name === "win") o.frequency.exponentialRampToValueAtTime(880, now + 0.18);
  tone.gain.setValueAtTime(impact ? 0.04 : 0.08, now);
  tone.gain.exponentialRampToValueAtTime(0.001, now + spec[1]);
  o.connect(tone);
  tone.connect(audio.destination);
  o.start(now);
  o.stop(now + spec[1] + 0.02);
}
