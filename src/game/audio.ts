let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;

export function unlockAudio() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!ctx) {
    ctx = new AC({ latencyHint: "interactive" });
    master = ctx.createGain();
    sfx = ctx.createGain();
    sfx.gain.value = 0.9;
    sfx.connect(master);
    master.connect(ctx.destination);
    master.gain.value = 0.75;
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function setMuted(muted: boolean) {
  if (!ctx || !master) return;
  master.gain.setTargetAtTime(muted ? 0 : 0.75, ctx.currentTime, 0.02);
}

export function resumeAudio() {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, slide = 0) {
  if (!ctx || !sfx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + dur);
  amp.gain.setValueAtTime(gain, ctx.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.connect(amp);
  amp.connect(sfx);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.02);
  osc.onended = () => {
    osc.disconnect();
    amp.disconnect();
  };
}

export function playEvent(name: string) {
  if (name === "hit") {
    tone(180 + Math.random() * 30, 0.05, "square", 0.05, -70);
    tone(420 + Math.random() * 40, 0.04, "square", 0.03, 80);
  } else if (name === "heavy") {
    tone(120, 0.09, "sawtooth", 0.05, -50);
    tone(240, 0.08, "square", 0.04, 140);
  } else if (name === "blast") {
    tone(520, 0.09, "square", 0.04, -280);
    tone(180, 0.1, "triangle", 0.03, 40);
  } else if (name === "dash") tone(300, 0.06, "square", 0.03, 180);
  else if (name === "hurt") tone(160, 0.1, "sawtooth", 0.045, -90);
  else if (name === "ko") tone(90, 0.22, "triangle", 0.05, -40);
  else if (name === "talk") tone(660, 0.04, "square", 0.025, 40);
  else if (name === "pickup") tone(720, 0.07, "square", 0.04, 180);
  else if (name === "clear") {
    tone(523, 0.08, "square", 0.04);
    window.setTimeout(() => tone(659, 0.1, "square", 0.04), 80);
  } else if (name === "win") {
    tone(523, 0.1, "square", 0.045);
    window.setTimeout(() => tone(659, 0.1, "square", 0.045), 100);
    window.setTimeout(() => tone(784, 0.18, "square", 0.05), 200);
  } else if (name === "lock") tone(200, 0.05, "square", 0.03, -40);
}
