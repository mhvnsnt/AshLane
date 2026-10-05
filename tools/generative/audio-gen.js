/**
 * audio-gen.js — Procedural hip-hop beat generator for AshLane.
 *
 * Generates seeded, deterministic boom-bap beats at three intensity levels:
 *   calm  — exploration: sparse drums, soft bass, pad chords, 82 BPM
 *   tense — combat: full boom-bap backbeat, driving 808, 90 BPM
 *   hype  — boss: double-time hats, hard 808, aggressive stabs, 96 BPM
 *
 * Pure functions only — no AudioContext. Works in Node and browsers.
 * The game-side playback engine (src/game3d/music.ts) consumes the
 * BeatData format produced here.
 *
 * Techniques adapted from open-source references (not copied):
 *  - gamedev-toolkit/loopsmith (Apache-2.0): seeded composition, look-ahead
 *    scheduling pattern, voice recipes (sine pitch-bend kick, noise hats)
 *  - theclosedloopcompany/codebeats (MIT engine): parametric track structure
 *
 * Part of AshLane tools/generative. Zero dependencies, zero audio files.
 */
import { rng } from './rng.js';

export const STEPS = 32; // 2 bars of 16th notes
export const STEPS_PER_BAR = 16;

/** Minor pentatonic + dorian color, semitones above root. */
const MINOR_PENT = [0, 3, 5, 7, 10, 12, 15];
const DORIAN_COLOR = [2, 9]; // occasional 9th / 6th spice

/** Chord roots as semitone offsets from the key root (i - bVI - bIII - bVII). */
const PROGRESSIONS = [
  [0, 8, 3, 10],
  [0, 10, 8, 7],
  [0, 3, 10, 8],
  [0, 8, 10, 7],
];

export const INTENSITIES = {
  calm: {
    label: 'calm',
    bpm: 82,
    drums: 'sparse',   // kick + soft hats only, no snare backbeat
    bass: 'soft',       // long root notes, low gain
    melody: 'sparse',   // occasional pentatonic plucks
    pad: true,
    swing: 0.14,
    energy: 0.3,
  },
  tense: {
    label: 'tense',
    bpm: 90,
    drums: 'boombap',  // kick pattern + snare on 2 & 4 + 8th hats
    bass: 'driving',    // 808 follows kick rhythm
    melody: 'riff',     // minor pentatonic riff
    pad: false,
    swing: 0.08,
    energy: 0.65,
  },
  hype: {
    label: 'hype',
    bpm: 96,
    drums: 'doubletime', // 16th hats + rolls, layered snare/clap
    bass: 'hard',        // aggressive 808 with octave jumps
    melody: 'aggressive',// denser riff + stabs
    pad: false,
    swing: 0.04,
    energy: 1.0,
  },
};

/**
 * @typedef {Object} BeatData
 * @property {string} seed
 * @property {'calm'|'tense'|'hype'} intensity
 * @property {number} bpm
 * @property {number} root        // MIDI note of key root (e.g. 45 = A2)
 * @property {number[]} kick      // steps where kick hits
 * @property {number[]} snare     // steps where snare hits
 * @property {number[]} clap      // layered clap steps (hype only)
 * @property {number[]} hat       // closed-hat steps
 * @property {number[]} openHat   // open-hat steps
 * @property {{step:number,midi:number,len:number}[]} bass  // 808 notes
 * @property {{step:number,midi:number,len:number,vel:number}[]} melody
 * @property {number[][]} chords  // per-bar chord tones (MIDI), for pad
 * @property {number} swing
 */

/**
 * Generate a full beat. Deterministic: same seed + intensity = same beat.
 * @param {string|number} seed
 * @param {'calm'|'tense'|'hype'} intensity
 * @returns {BeatData}
 */
export function generateBeat(seed, intensity = 'tense') {
  const preset = INTENSITIES[intensity] || INTENSITIES.tense;
  const r = rng(`${seed}:${intensity}`);
  const root = 45; // A2 — gritty low key for a street brawler
  const progression = r.pick(PROGRESSIONS);

  const kick = genKick(r, preset.drums);
  const snare = genSnare(r, preset.drums);
  const clap = preset.drums === 'doubletime' ? [...snare] : [];
  const { hat, openHat } = genHats(r, preset.drums);
  const bass = genBass(r, preset, root, progression, kick);
  const melody = genMelody(r, preset, root);
  const chords = genChords(root, progression);

  return {
    seed: String(seed),
    intensity: preset.label,
    bpm: preset.bpm,
    root,
    kick, snare, clap, hat, openHat,
    bass, melody, chords,
    swing: preset.swing,
    energy: preset.energy,
  };
}

/** Boom-bap kick: downbeat + seeded syncopation. */
function genKick(r, drums) {
  const out = new Set();
  for (let bar = 0; bar < 2; bar++) {
    const b = bar * 16;
    out.add(b); // downbeat always
    if (drums === 'sparse') {
      if (r.chance(0.5)) out.add(b + 10);
      continue;
    }
    // classic boom-bap syncopation slots
    const slots = [7, 10, 6, 11, 14];
    const n = drums === 'doubletime' ? 3 : 2;
    for (const s of r.pickN(slots, n)) out.add(b + s);
  }
  return [...out].sort((a, b2) => a - b2);
}

/** Snare backbeat on 2 & 4 (steps 4 and 12 of each bar). */
function genSnare(r, drums) {
  if (drums === 'sparse') return [];
  const out = [];
  for (let bar = 0; bar < 2; bar++) {
    const b = bar * 16;
    out.push(b + 4, b + 12);
    if (drums === 'doubletime' && r.chance(0.6)) out.push(b + 15); // pickup
  }
  return out.sort((a, b2) => a - b2);
}

/** Hats: 8ths normally, 16ths + rolls when hyped. */
function genHats(r, drums) {
  const hat = [];
  const openHat = [];
  const density = drums === 'sparse' ? 0.35 : drums === 'boombap' ? 0.8 : 1.0;
  for (let s = 0; s < STEPS; s++) {
    const is8th = s % 2 === 0;
    const is16th = !is8th;
    if (is8th && r.chance(density)) hat.push(s);
    if (is16th && drums === 'doubletime' && r.chance(0.7)) hat.push(s);
  }
  // open hat on the off-beat before bar 2, classic boom-bap
  if (drums !== 'sparse' && r.chance(0.8)) openHat.push(14);
  // hype: 16th roll into the loop point
  if (drums === 'doubletime') {
    for (let s = 28; s < 32; s++) if (!hat.includes(s)) hat.push(s);
  }
  hat.sort((a, b) => a - b);
  return { hat, openHat };
}

/** 808 bass follows the kick, walks the minor progression. */
function genBass(r, preset, root, progression, kick) {
  const out = [];
  const bassGain = preset.bass; // 'soft' | 'driving' | 'hard'
  for (const k of kick) {
    const bar = Math.floor(k / 16);
    const chordRoot = progression[bar % progression.length];
    let midi = root - 12 + chordRoot; // A1 region
    if (bassGain === 'hard' && r.chance(0.25)) midi += 12; // octave pop
    const len = bassGain === 'soft' ? 6 : 3;
    out.push({ step: k, midi, len });
  }
  // soft: hold the root through the bar
  if (bassGain === 'soft') {
    out.push({ step: 16, midi: root - 12 + progression[2], len: 8 });
  }
  return out;
}

/** Minor-pentatonic riff, density scales with intensity. */
function genMelody(r, preset, root) {
  const out = [];
  const density = { sparse: 0.12, riff: 0.3, aggressive: 0.5 }[preset.melody] ?? 0.3;
  for (let s = 0; s < STEPS; s++) {
    if (s % 4 === 0) continue; // keep downbeats clear for drums
    if (!r.chance(density)) continue;
    const deg = r.pick(MINOR_PENT);
    const spice = r.chance(0.12) ? r.pick(DORIAN_COLOR) : 0;
    out.push({
      step: s,
      midi: root + 12 + deg + spice,
      len: r.chance(0.3) ? 2 : 1,
      vel: 0.5 + r.rand() * 0.5,
    });
  }
  return out;
}

/** Pad chords: root + minor third + fifth per bar. */
function genChords(root, progression) {
  return [0, 1].map((bar) => {
    const cr = progression[(bar * 2) % progression.length];
    return [root + cr, root + cr + 3, root + cr + 7];
  });
}

/** Serialize a beat to JSON (for baking / debugging). */
export function beatToJSON(beat) {
  return JSON.stringify(beat, null, 2);
}

/** Quick human-readable summary. */
export function beatSummary(beat) {
  return `${beat.intensity} @ ${beat.bpm}bpm — ` +
    `kick:${beat.kick.length} snare:${beat.snare.length} ` +
    `hat:${beat.hat.length} bass:${beat.bass.length} mel:${beat.melody.length}`;
}

// Node CLI: node audio-gen.js --seed <s> --intensity <calm|tense|hype>
const isMain = typeof process !== 'undefined' &&
  process.argv[1] && process.argv[1].endsWith('audio-gen.js');
if (isMain) {
  const args = process.argv.slice(2);
  const seedArg = args.indexOf('--seed');
  const intArg = args.indexOf('--intensity');
  const seed = seedArg >= 0 ? args[seedArg + 1] : 'ashlane';
  const intensity = intArg >= 0 ? args[intArg + 1] : 'tense';
  const beat = generateBeat(seed, intensity);
  if (args.includes('--json')) {
    console.log(beatToJSON(beat));
  } else {
    console.log(beatSummary(beat));
    console.log(`steps: ${STEPS}, swing: ${beat.swing}, energy: ${beat.energy}`);
  }
}
