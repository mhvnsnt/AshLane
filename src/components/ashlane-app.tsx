import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { EMPTY_HUD, parseSpecText, specDocument, type Hud, type Mode } from "@/game3d/spec";
import { mount, type Handle } from "@/game3d/mount";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "roam", label: "Cinder ward", hint: "Third person. The plaza fight, then walk north or south on your own." },
  { id: "belt", label: "Scrap street", hint: "Side view. Up and down is depth. The gate stays shut until the street is empty." },
  { id: "platform", label: "Coil scaffolds", hint: "Same hands, gravity on. Springs, jumps, then the brass pylon." },
];

export function AshlaneApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<Handle | null>(null);
  const queued = useRef<Mode | null>(null);
  const [hud, setHud] = useState<Hud>(EMPTY_HUD);
  const [specText, setSpecText] = useState(() => specDocument("roam", EMPTY_HUD.tune));
  const [specErr, setSpecErr] = useState("");
  const seeded = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handle = mount(canvas, setHud);
    api.current = handle;
    if (queued.current) {
      handle.start(queued.current);
      queued.current = null;
    }
    return () => {
      handle.dispose();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    setSpecText(specDocument(hud.mode, hud.tune));
  }, [hud]);

  function begin(mode: Mode) {
    if (!api.current) {
      queued.current = mode;
      return;
    }
    if (hud.running) api.current.focus(mode);
    else api.current.start(mode);
  }

  function applySpec() {
    const parsed = parseSpecText(specText);
    if (!parsed.ok) {
      setSpecErr(parsed.error);
      return;
    }
    setSpecErr("");
    api.current?.tune(parsed.tune);
    if (parsed.mode) begin(parsed.mode);
  }

  const playing = hud.running && !hud.paused;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink text-cream">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="font-display text-xs tracking-widest text-ember">ASHLANE</p>
          <h1 className="font-display text-lg leading-tight">{labelFor(hud.mode)}</h1>
        </div>
        {hud.running ? (
          <div className="flex items-center gap-3">
            <Meter label="HP" value={hud.hp / hud.maxHp} tone="ember" />
            <Meter label="KI" value={hud.meter / 100} tone="brass" />
            <button type="button" className="rounded-full border border-line bg-ink-2 px-4 py-2 font-display text-xs text-cream" onClick={() => api.current?.pause(true)}>
              Modes
            </button>
          </div>
        ) : (
          <p className="max-w-48 text-right text-sm text-cream-dim">One ward. Three feelings.</p>
        )}
      </header>

      <div className="relative min-h-0 flex-1 px-3 pb-3">
        <div className="stage h-full overflow-hidden rounded-2xl border border-line">
          <canvas ref={canvasRef} className="h-full w-full" />
          {hud.running && hud.banner ? <p className="pointer-events-none absolute inset-x-0 top-4 text-center font-display text-brass">{hud.banner}</p> : null}
          {hud.combo > 1 && playing ? <p className="pointer-events-none absolute right-4 top-4 font-display text-ember">{hud.combo} HIT</p> : null}
          {playing ? (
            <p className="pointer-events-none absolute bottom-3 left-4 max-w-[70%] text-sm text-cream-dim">{objective(hud)}</p>
          ) : null}

          {!hud.running ? (
            <div className="veil absolute inset-0 flex items-end justify-center p-4 sm:items-center">
              <div className="w-full max-w-md">
                <p className="font-display text-3xl text-cream">Ashlane</p>
                <p className="mt-2 text-sm leading-relaxed text-cream-dim">
                  Free-roam the plaza, brawl the street, jump the scaffolds. The scrap street runs YokosukaJS, an MIT beat-em-up: its punch, kick, turn, and hurt. Bodies are KayKit CC0. J punches. Hold down and J to kick.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <button type="button" className="rounded-full bg-ember px-5 py-3 font-display text-sm text-ink" onClick={() => begin("roam")}>
                    Start
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" className="rounded-full border border-line bg-ink-2 px-4 py-3 text-sm text-cream" onClick={() => begin("belt")}>
                      Scrap street
                    </button>
                    <button type="button" className="rounded-full border border-line bg-ink-2 px-4 py-3 text-sm text-cream" onClick={() => begin("platform")}>
                      Coil scaffolds
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-cream-dim">WASD run · Space jump · J hit · K grab or dash · L spin · Shift dash · drag to look in the plaza</p>
                <details className="tune mt-4">
                  <summary className="cursor-pointer font-display text-xs text-brass">Rule card</summary>
                  <p className="mt-2 text-sm text-cream-dim">
                    Change one rule and apply. Movement, jump, gravity, grapple range, launch height, hitstun, how fast they chase, and wall-slam bonus.
                  </p>
                  <label className="mt-3 block text-xs text-cream-dim">
                    Move {hud.tune.moveSpeed.toFixed(1)}
                    <input
                      type="range"
                      min={3}
                      max={10}
                      step={0.1}
                      value={hud.tune.moveSpeed}
                      onChange={(e) => api.current?.tune({ moveSpeed: Number(e.target.value) })}
                    />
                  </label>
                  <label className="mt-2 block text-xs text-cream-dim">
                    Jump {hud.tune.jumpV.toFixed(1)}
                    <input
                      type="range"
                      min={6}
                      max={14}
                      step={0.1}
                      value={hud.tune.jumpV}
                      onChange={(e) => api.current?.tune({ jumpV: Number(e.target.value) })}
                    />
                  </label>
                  <label className="mt-2 block text-xs text-cream-dim">
                    Gravity {hud.tune.gravity.toFixed(0)}
                    <input
                      type="range"
                      min={14}
                      max={42}
                      step={1}
                      value={hud.tune.gravity}
                      onChange={(e) => api.current?.tune({ gravity: Number(e.target.value) })}
                    />
                  </label>
                  <textarea className="spec-box mt-3" value={specText} spellCheck={false} onChange={(e) => setSpecText(e.target.value)} />
                  {specErr ? <p className="mt-1 text-sm text-ember">{specErr}</p> : null}
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="rounded-full bg-brass px-4 py-2 text-sm text-ink" onClick={applySpec}>
                      Apply rules
                    </button>
                    <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => setSpecText(specDocument(hud.mode, hud.tune))}>
                      Refresh
                    </button>
                  </div>
                </details>
              </div>
            </div>
          ) : null}

          {hud.running && hud.paused ? (
            <div className="veil absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-sm">
                <p className="font-display text-xl">Modes</p>
                <p className="mt-1 text-sm text-cream-dim">Hop to a part of the ward. The fights you already finished stay finished.</p>
                <div className="mt-4 flex flex-col gap-2">
                  {MODES.map((mode) => (
                    <button key={mode.id} type="button" className="rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left" onClick={() => begin(mode.id)}>
                      <span className="font-display text-sm text-brass">{mode.label}</span>
                      <span className="mt-1 block text-sm text-cream-dim">{mode.hint}</span>
                    </button>
                  ))}
                  <button type="button" className="rounded-full bg-ember px-4 py-3 font-display text-sm text-ink" onClick={() => api.current?.pause(false)}>
                    Resume
                  </button>
                  <button type="button" className="rounded-full border border-line px-4 py-3 text-sm" onClick={() => api.current?.rematch()}>
                    Rematch
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="pad-dock">
        <Stick onChange={(x, y) => api.current?.setStick(x, y)} />
        <div className="flex flex-wrap justify-end gap-2">
          <Pad label="Jump" hot={false} onDown={(d) => api.current?.setBtn("jump", d)} />
          <Pad label="Grab" hot={hud.canGrab} onDown={(d) => api.current?.setBtn("grab", d)} />
          <Pad label="Hit" hot={false} onDown={(d) => api.current?.setBtn("attack", d)} />
          <Pad label="Spin" hot={false} onDown={(d) => api.current?.setBtn("blast", d)} />
        </div>
      </div>
    </div>
  );
}

function labelFor(mode: Mode) {
  if (mode === "belt") return "Scrap street";
  if (mode === "platform") return "Coil scaffolds";
  return "Cinder ward";
}

function objective(hud: Hud) {
  if (hud.cleared) return "Circuit clear. Open Modes and rematch if you want another pass.";
  if (hud.mode === "belt") return hud.streetClear ? "Gate's open. Walk south for the scaffolds." : "YokosukaJS street. J punch, down+J kick. Clear it and the gate opens.";
  if (hud.mode === "platform") return hud.scaffoldClear ? "Pylon lit." : "Springs, then land on the brass pylon.";
  const left = [hud.plazaClear ? "" : "plaza", hud.streetClear ? "" : "street", hud.scaffoldClear ? "" : "scaffolds"].filter(Boolean);
  return left.length ? `Still open: ${left.join(", ")}.${hud.canGrab ? " Grab is in range." : ""}` : "Walk it.";
}

function Meter({ label, value, tone }: { label: string; value: number; tone: "ember" | "brass" }) {
  return (
    <div className="w-16">
      <div className="mb-1 font-display text-xs text-cream-dim">{label}</div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-2">
        <div className={tone === "ember" ? "h-full bg-ember" : "h-full bg-brass"} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
      </div>
    </div>
  );
}

function Pad({ label, hot, onDown }: { label: string; hot: boolean; onDown: (down: boolean) => void }) {
  function set(down: boolean) {
    return (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onDown(down);
    };
  }
  return (
    <button type="button" className="pad-btn" data-hot={hot ? "1" : "0"} onPointerDown={set(true)} onPointerUp={set(false)} onPointerCancel={set(false)} onPointerLeave={set(false)}>
      {label}
    </button>
  );
}

function Stick({ onChange }: { onChange: (x: number, y: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: 0, y: 0, id: -1 });
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  function point(e: ReactPointerEvent<HTMLDivElement>) {
    const max = 36;
    let x = e.clientX - origin.current.x;
    let y = e.clientY - origin.current.y;
    const m = Math.hypot(x, y);
    if (m > max) {
      x = (x / m) * max;
      y = (y / m) * max;
    }
    setKnob({ x, y });
    onChange(x / max, y / max);
  }

  function down(e: ReactPointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2, id: e.pointerId };
    point(e);
  }
  function move(e: ReactPointerEvent<HTMLDivElement>) {
    if (origin.current.id !== e.pointerId) return;
    point(e);
  }
  function up(e: ReactPointerEvent<HTMLDivElement>) {
    if (origin.current.id !== e.pointerId) return;
    origin.current.id = -1;
    setKnob({ x: 0, y: 0 });
    onChange(0, 0);
  }

  return (
    <div ref={ref} className="stick" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} role="slider" aria-label="Move">
      <span style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}
