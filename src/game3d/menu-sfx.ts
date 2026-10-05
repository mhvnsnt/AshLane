/* AshLane menu SFX — synthesized with Web Audio. No assets.
   Street-arcade feel: short filtered blips, punch thuds, tape whoosh. */

let ctx: AudioContext | null = null;
let enabled = true;

function ac(): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function setMenuSfxEnabled(on: boolean) {
  enabled = on;
}

function blip(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur: number, gain: number, filterFreq: number, type: BiquadFilterType = "lowpass") {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = filterFreq;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);
}

/** Hover tick — short high blip. */
export function sfxHover() {
  blip(880, 0.05, "square", 0.045, 1180);
}

/** Select — punchy confirm thud. */
export function sfxSelect() {
  blip(196, 0.12, "triangle", 0.16, 98);
  noise(0.09, 0.1, 900);
}

/** Back — tape rewind whoosh. */
export function sfxBack() {
  blip(520, 0.14, "sawtooth", 0.06, 180);
  noise(0.12, 0.05, 2400, "highpass");
}

/** Locked / error — dull buzz. */
export function sfxLocked() {
  blip(140, 0.16, "sawtooth", 0.09, 110);
}

/** Round start — fight bell-ish metallic hit. */
export function sfxFight() {
  blip(1244, 0.5, "triangle", 0.14);
  blip(1866, 0.35, "sine", 0.08);
  noise(0.2, 0.06, 5200, "highpass");
}

/** Attach hover+click sounds to every button inside a container. Call once per menu mount. */
export function wireMenuSfx(root: HTMLElement | null) {
  if (!root) return;
  const els = root.querySelectorAll("button:not([data-sfx])");
  els.forEach((el) => {
    el.setAttribute("data-sfx", "1");
    el.addEventListener("mouseenter", sfxHover, { passive: true });
    el.addEventListener("click", () => {
      if ((el as HTMLButtonElement).disabled) sfxLocked();
      else sfxSelect();
    });
  });
}
