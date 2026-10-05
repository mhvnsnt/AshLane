/**
 * music.ts — Adaptive procedural music engine for AshLane.
 *
 * Synthesizes hip-hop beats live with the Web Audio API. No audio files.
 * Three intensity levels switch on bar boundaries:
 *   calm  — exploration (82 BPM, sparse)
 *   tense — combat (90 BPM, boom-bap)
 *   hype  — boss (96 BPM, double-time)
 *
 * Composition recipes mirror tools/generative/audio-gen.js (same seeded
 * patterns); this file is self-contained so the game bundle has no
 * tools/ dependency.
 *
 * Scheduling follows the standard look-ahead pattern (cf. the Web Audio
 * metronome technique; also used by gamedev-toolkit/loopsmith, Apache-2.0).
 */

export type Intensity = 'calm' | 'tense' | 'hype';

export interface BassNote { step: number; midi: number; len: number }
export interface MelodyNote { step: number; midi: number; len: number; vel: number }

export interface BeatData {
  seed: string;
  intensity: Intensity;
  bpm: number;
  root: number;
  kick: number[];
  snare: number[];
  clap: number[];
  hat: number[];
  openHat: number[];
  bass: BassNote[];
  melody: MelodyNote[];
  chords: number[][];
  swing: number;
  energy: number;
}

const STEPS = 32;
const STEPS_PER_BAR = 16;
const MINOR_PENT = [0, 3, 5, 7, 10, 12, 15];
const DORIAN_COLOR = [2, 9];
const PROGRESSIONS = [
  [0, 8, 3, 10],
  [0, 10, 8, 7],
  [0, 3, 10, 8],
  [0, 8, 10, 7],
];

/* ---------- seeded RNG (mulberry32, mirrors tools/generative/rng.js) ---------- */

function hashStr(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Rng {
  rand: () => number;
  chance: (p: number) => boolean;
  pick: <T>(arr: T[]) => T;
  pickN: <T>(arr: T[], n: number) => T[];
}

function makeRng(seed: string): Rng {
  const rand = mulberry32(hashStr(seed));
  return {
    rand,
    chance: (p) => rand() < p,
    pick: (arr) => arr[Math.floor(rand() * arr.length)],
    pickN: (arr, n) => {
      const copy = [...arr];
      const out: typeof arr = [];
      for (let i = 0; i < n && copy.length; i++) {
        out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
      }
      return out;
    },
  };
}

/* ---------- beat composition (mirrors audio-gen.js) ---------- */

const INTENSITY_CFG = {
  calm:  { bpm: 82, drums: 'sparse',     bass: 'soft',    melody: 'sparse',     pad: true,  swing: 0.14, energy: 0.3 },
  tense: { bpm: 90, drums: 'boombap',    bass: 'driving', melody: 'riff',       pad: false, swing: 0.08, energy: 0.65 },
  hype:  { bpm: 96, drums: 'doubletime', bass: 'hard',    melody: 'aggressive', pad: false, swing: 0.04, energy: 1.0 },
} as const;

export function generateBeat(seed: string, intensity: Intensity): BeatData {
  const cfg = INTENSITY_CFG[intensity];
  const r = makeRng(`${seed}:${intensity}`);
  const root = 45; // A2
  const progression = r.pick(PROGRESSIONS);

  const kick = new Set<number>();
  for (let bar = 0; bar < 2; bar++) {
    const b = bar * 16;
    kick.add(b);
    if (cfg.drums === 'sparse') {
      if (r.chance(0.5)) kick.add(b + 10);
    } else {
      const n = cfg.drums === 'doubletime' ? 3 : 2;
      for (const s of r.pickN([7, 10, 6, 11, 14], n)) kick.add(b + s);
    }
  }

  const snare: number[] = [];
  if (cfg.drums !== 'sparse') {
    for (let bar = 0; bar < 2; bar++) {
      const b = bar * 16;
      snare.push(b + 4, b + 12);
      if (cfg.drums === 'doubletime' && r.chance(0.6)) snare.push(b + 15);
    }
  }
  const clap = cfg.drums === 'doubletime' ? [...snare] : [];

  const hat: number[] = [];
  const openHat: number[] = [];
  const density = cfg.drums === 'sparse' ? 0.35 : cfg.drums === 'boombap' ? 0.8 : 1.0;
  for (let s = 0; s < STEPS; s++) {
    if (s % 2 === 0) { if (r.chance(density)) hat.push(s); }
    else if (cfg.drums === 'doubletime' && r.chance(0.7)) hat.push(s);
  }
  if (cfg.drums !== 'sparse' && r.chance(0.8)) openHat.push(14);
  if (cfg.drums === 'doubletime') for (let s = 28; s < 32; s++) if (!hat.includes(s)) hat.push(s);
  hat.sort((a, b) => a - b);

  const bass: BassNote[] = [];
  for (const k of [...kick].sort((a, b) => a - b)) {
    const bar = Math.floor(k / 16);
    let midi = root - 12 + progression[bar % progression.length];
    if (cfg.bass === 'hard' && r.chance(0.25)) midi += 12;
    bass.push({ step: k, midi, len: cfg.bass === 'soft' ? 6 : 3 });
  }
  if (cfg.bass === 'soft') bass.push({ step: 16, midi: root - 12 + progression[2], len: 8 });

  const melDensity = { sparse: 0.12, riff: 0.3, aggressive: 0.5 }[cfg.melody];
  const melody: MelodyNote[] = [];
  for (let s = 0; s < STEPS; s++) {
    if (s % 4 === 0 || !r.chance(melDensity)) continue;
    const deg = r.pick(MINOR_PENT) + (r.chance(0.12) ? r.pick(DORIAN_COLOR) : 0);
    melody.push({ step: s, midi: root + 12 + deg, len: r.chance(0.3) ? 2 : 1, vel: 0.5 + r.rand() * 0.5 });
  }

  const chords = [0, 1].map((bar) => {
    const cr = progression[(bar * 2) % progression.length];
    return [root + cr, root + cr + 3, root + cr + 7];
  });

  return {
    seed, intensity, bpm: cfg.bpm, root,
    kick: [...kick].sort((a, b) => a - b),
    snare: snare.sort((a, b) => a - b), clap, hat, openHat,
    bass, melody, chords, swing: cfg.swing, energy: cfg.energy,
  };
}

/* ---------- Web Audio voices ---------- */

function midiHz(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

function kickVoice(c: AudioContext, out: AudioNode, t: number, amp: number): void {
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
  g.gain.setValueAtTime(amp, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
  o.connect(g).connect(out);
  o.start(t); o.stop(t + 0.26);
}

function noiseBurst(
  c: AudioContext, out: AudioNode, t: number, dur: number, amp: number,
  filterType: BiquadFilterType, freq: number, q = 1,
): void {
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = filterType; f.frequency.value = freq; f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(amp, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(out);
  src.start(t);
}

function snareVoice(c: AudioContext, out: AudioNode, t: number, amp: number): void {
  noiseBurst(c, out, t, 0.18, amp, 'highpass', 1800);
  // body thump
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(210, t);
  o.frequency.exponentialRampToValueAtTime(120, t + 0.09);
  g.gain.setValueAtTime(amp * 0.7, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
  o.connect(g).connect(out);
  o.start(t); o.stop(t + 0.13);
}

function hatVoice(c: AudioContext, out: AudioNode, t: number, amp: number, open: boolean): void {
  noiseBurst(c, out, t, open ? 0.32 : 0.045, amp, 'highpass', 7500);
}

function bass808(c: AudioContext, out: AudioNode, t: number, midi: number, dur: number, amp: number): void {
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  o.type = 'sine';
  o.frequency.setValueAtTime(midiHz(midi) * 1.02, t);
  o.frequency.exponentialRampToValueAtTime(midiHz(midi), t + 0.03);
  f.type = 'lowpass'; f.frequency.value = 300;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(amp, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f).connect(g).connect(out);
  o.start(t); o.stop(t + dur + 0.02);
}

function pluckVoice(c: AudioContext, out: AudioNode, t: number, midi: number, dur: number, amp: number): void {
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  o.type = 'sawtooth';
  o.frequency.value = midiHz(midi);
  f.type = 'lowpass';
  f.frequency.setValueAtTime(3200, t);
  f.frequency.exponentialRampToValueAtTime(700, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(amp, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f).connect(g).connect(out);
  o.start(t); o.stop(t + dur + 0.02);
}

function padVoice(c: AudioContext, out: AudioNode, t: number, midi: number, dur: number, amp: number): void {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.value = midiHz(midi);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(amp, t + 0.4);
  g.gain.setValueAtTime(amp, t + Math.max(0.41, dur - 0.5));
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out);
  o.start(t); o.stop(t + dur + 0.02);
}

/* ---------- adaptive engine ---------- */

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;
  private beat: BeatData;
  private pendingIntensity: Intensity | null = null;
  private playing = false;
  private enabled = true;

  constructor(seed = 'ashlane', intensity: Intensity = 'calm') {
    this.beat = generateBeat(seed, intensity);
  }

  setEnabled(on: boolean): void { this.enabled = on; }

  /** Request an intensity change — takes effect at the next bar line. */
  setIntensity(i: Intensity): void {
    if (i === this.beat.intensity && !this.pendingIntensity) return;
    this.pendingIntensity = i;
  }

  getIntensity(): Intensity { return this.pendingIntensity ?? this.beat.intensity; }

  private ensureCtx(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        const limiter = this.ctx.createDynamicsCompressor();
        limiter.threshold.value = -16;
        limiter.ratio.value = 6;
        this.master.connect(limiter).connect(this.ctx.destination);
        this.musicBus = this.ctx.createGain();
        this.musicBus.gain.value = 0.8;
        this.musicBus.connect(this.master);
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    } catch { return null; }
  }

  start(): void {
    const c = this.ensureCtx();
    if (!c || this.playing) return;
    this.playing = true;
    this.step = 0;
    this.nextTime = c.currentTime + 0.08;
    this.timer = window.setInterval(() => this.schedule(), 25);
  }

  stop(): void {
    this.playing = false;
    if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; }
  }

  get isPlaying(): boolean { return this.playing; }

  private stepDur(): number { return 30 / this.beat.bpm; } // 16th-note seconds

  private schedule(): void {
    const c = this.ctx;
    const bus = this.musicBus;
    if (!c || !bus || !this.playing) return;
    while (this.nextTime < c.currentTime + 0.12) {
      // bar-quantized intensity switch
      if (this.pendingIntensity && this.step % STEPS_PER_BAR === 0) {
        this.beat = generateBeat(this.beat.seed, this.pendingIntensity);
        this.pendingIntensity = null;
      }
      const t = this.nextTime + (this.step % 2 === 1 ? this.stepDur() * this.beat.swing : 0);
      this.playStep(c, bus, this.step, t);
      this.nextTime += this.stepDur();
      this.step = (this.step + 1) % STEPS;
    }
  }

  private playStep(c: AudioContext, bus: GainNode, step: number, t: number): void {
    const b = this.beat;
    const e = b.energy;
    if (b.kick.includes(step)) kickVoice(c, bus, t, 0.5 + e * 0.3);
    if (b.snare.includes(step)) snareVoice(c, bus, t, 0.32 + e * 0.2);
    if (b.clap.includes(step)) noiseBurst(c, bus, t + 0.012, 0.09, 0.14, 'bandpass', 2400, 1.4);
    if (b.hat.includes(step)) hatVoice(c, bus, t, 0.07 + e * 0.05, false);
    if (b.openHat.includes(step)) hatVoice(c, bus, t, 0.1, true);
    for (const n of b.bass) {
      if (n.step === step) bass808(c, bus, t, n.midi, this.stepDur() * n.len, 0.34 + e * 0.2);
    }
    for (const n of b.melody) {
      if (n.step === step) pluckVoice(c, bus, t, n.midi, this.stepDur() * n.len, 0.05 + n.vel * 0.06);
    }
    if (step % STEPS_PER_BAR === 0 && b.chords.length) {
      const bar = Math.floor(step / STEPS_PER_BAR) % b.chords.length;
      for (const midi of b.chords[bar]) {
        padVoice(c, bus, t, midi, this.stepDur() * STEPS_PER_BAR, 0.028);
      }
    }
  }

  /** Duck music briefly (e.g. under dialogue). */
  duck(amount = 0.35, ms = 400): void {
    const bus = this.musicBus;
    const c = this.ctx;
    if (!bus || !c) return;
    const t = c.currentTime;
    bus.gain.cancelScheduledValues(t);
    bus.gain.setValueAtTime(bus.gain.value, t);
    bus.gain.linearRampToValueAtTime(amount, t + 0.08);
    bus.gain.linearRampToValueAtTime(0.8, t + ms / 1000);
  }
}

/** Singleton for the game. */
let engine: MusicEngine | null = null;
export function getMusic(seed = 'ashlane'): MusicEngine {
  if (!engine) engine = new MusicEngine(seed, 'calm');
  return engine;
}
