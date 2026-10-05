/**
 * combat-sfx.ts — Procedural combat sound effects for AshLane.
 *
 * All synthesized with the Web Audio API. Zero audio files.
 * Complements src/game3d/menu-sfx.ts (UI sounds); this file covers
 * fight sounds: impacts, blocks, whooshes, knockdowns, crowd.
 *
 * Voice recipes use standard synthesis building blocks:
 *  - impact thump: sine pitch-bend (150→55 Hz), cf. LoopSmith kick
 *  - snap/crack: filtered noise burst
 *  - whoosh: band-passed noise sweep
 *  - crowd bed: looped filtered noise with slow LFO
 */

let ctx: AudioContext | null = null;
let enabled = true;
let crowdNodes: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

function ac(): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch { return null; }
}

export function setCombatSfxEnabled(on: boolean): void {
  enabled = on;
  if (!on) stopCrowd();
}

/** Short low thump: the "body" of a punch/kick. */
function thump(t: number, amp: number, startHz = 160, endHz = 50, dur = 0.14): void {
  const c = ac(); if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.setValueAtTime(startHz, t);
  o.frequency.exponentialRampToValueAtTime(endHz, t + dur * 0.7);
  g.gain.setValueAtTime(amp, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

/** Filtered noise snap: the "crack" of glove on jaw. */
function snap(t: number, amp: number, freq = 2800, dur = 0.07, type: BiquadFilterType = 'bandpass'): void {
  const c = ac(); if (!c) return;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = 1.2;
  const g = c.createGain();
  g.gain.setValueAtTime(amp, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);
}

/** Punch impact: snap + thump. `heavy` for haymakers/finishers. */
export function sfxPunch(heavy = false): void {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  snap(t, heavy ? 0.5 : 0.32, heavy ? 2200 : 2800, heavy ? 0.1 : 0.07);
  thump(t, heavy ? 0.55 : 0.34, heavy ? 130 : 160, 48, heavy ? 0.2 : 0.14);
}

/** Kick impact: deeper thump, duller snap. */
export function sfxKick(heavy = false): void {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  snap(t, heavy ? 0.4 : 0.26, 1400, 0.09, 'lowpass');
  thump(t, heavy ? 0.6 : 0.4, 110, 42, heavy ? 0.24 : 0.16);
}

/** Blocked hit: woody knock, less body. */
export function sfxBlock(): void {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  snap(t, 0.3, 900, 0.06, 'bandpass');
  thump(t, 0.2, 220, 90, 0.08);
}

/** Swing whoosh: band-passed noise sweep. */
export function sfxWhoosh(big = false): void {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  const dur = big ? 0.22 : 0.13;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2;
  f.frequency.setValueAtTime(big ? 500 : 900, t);
  f.frequency.exponentialRampToValueAtTime(big ? 2400 : 3200, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(big ? 0.22 : 0.12, t + dur * 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);
}

/** Body hitting the ground: low boom + grit. */
export function sfxBodyFall(): void {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  thump(t, 0.5, 100, 36, 0.28);
  snap(t + 0.02, 0.2, 700, 0.12, 'lowpass');
}

/** Knockout bell + impact. */
export function sfxKnockout(): void {
  sfxPunch(true);
  const c = ac(); if (!c) return;
  const t = c.currentTime + 0.05;
  // fight bell: metallic FM-ish ping
  for (const [mult, amp] of [[1, 0.22], [2.76, 0.1], [5.4, 0.05]] as const) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine'; o.frequency.value = 880 * mult;
    g.gain.setValueAtTime(amp, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + 1.15);
  }
}

/** Crowd ambience bed: looped brown-ish noise, swells with excitement 0..1. */
export function startCrowd(excitement = 0.4): void {
  const c = ac(); if (!c || crowdNodes) return;
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02; // brown-ish
    d[i] = last * 3.2;
  }
  const src = c.createBufferSource();
  src.buffer = buf; src.loop = true;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.6;
  const g = c.createGain();
  g.gain.value = 0.02 + excitement * 0.09;
  // slow swell LFO
  const lfo = c.createOscillator(); lfo.frequency.value = 0.13;
  const lfoGain = c.createGain(); lfoGain.gain.value = 0.012;
  lfo.connect(lfoGain).connect(g.gain);
  src.connect(f).connect(g).connect(c.destination);
  src.start(); lfo.start();
  crowdNodes = { src, gain: g };
}

/** Raise/lower crowd excitement (0..1). Call on big moments. */
export function crowdSwell(excitement: number): void {
  const c = ac();
  if (!c || !crowdNodes) { if (excitement > 0.55) startCrowd(excitement); return; }
  const t = c.currentTime;
  crowdNodes.gain.gain.cancelScheduledValues(t);
  crowdNodes.gain.gain.setTargetAtTime(0.02 + excitement * 0.11, t, 0.4);
}

export function stopCrowd(): void {
  if (!crowdNodes) return;
  try { crowdNodes.src.stop(); } catch { /* already stopped */ }
  crowdNodes = null;
}

/** Referee/announcer-style blip for round cues. */
export function sfxRoundCue(): void {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'square'; o.frequency.value = 660;
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + 0.18);
}

/* ---------------------------------------------------------------------------
 * Gun SFX — appended for the rare-gun system (guns.ts).
 * All procedural Web Audio, matching the existing voice recipes above.
 * ------------------------------------------------------------------------- */

/** Gunshot: sharp crack + low boom + tail. Varies by gun class. */
export function sfxGunshot(kind: "pistol" | "revolver" | "shotgun" | "smg" = "pistol"): void {
  const c = ac(); if (!c) return;
  const t = c.currentTime;

  // Crack: very short, very loud filtered noise burst.
  const crackDur = kind === "shotgun" ? 0.09 : 0.05;
  const crackLen = Math.max(1, Math.floor(c.sampleRate * crackDur));
  const crackBuf = c.createBuffer(1, crackLen, c.sampleRate);
  const cd = crackBuf.getChannelData(0);
  for (let i = 0; i < crackLen; i++) cd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / crackLen, 3);
  const crack = c.createBufferSource(); crack.buffer = crackBuf;
  const crackF = c.createBiquadFilter();
  crackF.type = 'highpass';
  crackF.frequency.value = kind === "shotgun" ? 400 : 900;
  const crackG = c.createGain();
  const crackAmp = kind === "shotgun" ? 0.85 : kind === "revolver" ? 0.7 : 0.55;
  crackG.gain.setValueAtTime(crackAmp, t);
  crackG.gain.exponentialRampToValueAtTime(0.0001, t + crackDur);
  crack.connect(crackF).connect(crackG).connect(c.destination);
  crack.start(t);

  // Boom: low thump that follows the crack.
  const boomAmp = kind === "shotgun" ? 0.7 : kind === "revolver" ? 0.5 : 0.35;
  thump(t + 0.008, boomAmp, kind === "shotgun" ? 120 : 180, 35, kind === "shotgun" ? 0.35 : 0.22);

  // Tail: short noise wash for indoor echo feel.
  const tailDur = 0.18;
  const tailLen = Math.max(1, Math.floor(c.sampleRate * tailDur));
  const tailBuf = c.createBuffer(1, tailLen, c.sampleRate);
  const td = tailBuf.getChannelData(0);
  for (let i = 0; i < tailLen; i++) td[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / tailLen, 2) * 0.3;
  const tail = c.createBufferSource(); tail.buffer = tailBuf;
  const tailF = c.createBiquadFilter(); tailF.type = 'lowpass'; tailF.frequency.value = 1200;
  const tailG = c.createGain();
  tailG.gain.setValueAtTime(0.18, t + 0.02);
  tailG.gain.exponentialRampToValueAtTime(0.0001, t + tailDur);
  tail.connect(tailF).connect(tailG).connect(c.destination);
  tail.start(t + 0.02);
}

/** Dry fire: empty click. The sound of regret. */
export function sfxDryFire(): void {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  snap(t, 0.22, 3200, 0.03, 'highpass');
  snap(t + 0.045, 0.14, 1800, 0.025, 'bandpass');
}

/** Reload: mag out, mag in, slide rack. Three-part foley. */
export function sfxReload(): void {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  // Mag release.
  snap(t, 0.2, 2400, 0.04, 'bandpass');
  // Mag insert.
  snap(t + 0.28, 0.26, 1600, 0.05, 'bandpass');
  thump(t + 0.28, 0.14, 300, 120, 0.06);
  // Slide rack.
  snap(t + 0.55, 0.3, 2800, 0.05, 'highpass');
  snap(t + 0.62, 0.34, 2200, 0.06, 'bandpass');
}

/** Disarm: gun clatters to the ground. Metallic bounce. */
export function sfxDisarm(): void {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  // Initial clatter.
  snap(t, 0.4, 3600, 0.05, 'highpass');
  thump(t, 0.2, 500, 150, 0.08);
  // Two bounces, getting quieter.
  snap(t + 0.16, 0.24, 3200, 0.04, 'highpass');
  snap(t + 0.34, 0.14, 2800, 0.035, 'highpass');
}

/** Pistol-whip: dull metal-on-bone thunk. */
export function sfxPistolWhip(): void {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  snap(t, 0.36, 1900, 0.06, 'bandpass');
  thump(t, 0.42, 200, 60, 0.14);
  // Metallic ring.
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'triangle'; o.frequency.value = 2400;
  g.gain.setValueAtTime(0.06, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + 0.14);
}

/** Gun pickup: quick metal handling sound. */
export function sfxGunPickup(): void {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  snap(t, 0.18, 2600, 0.04, 'bandpass');
  snap(t + 0.09, 0.22, 2000, 0.05, 'bandpass');
}
