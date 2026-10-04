import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { ArrowLeft, Hammer, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { playEvent, resumeAudio, setMuted, unlockAudio } from "@/game/audio";
import { drawWorld } from "@/game/draw";
import { createSim, playerOf, restartRoom, step, type Input, type Sim } from "@/game/engine";
import { BLANK_SOURCE, STORY, STORY_SOURCE } from "@/game/levels";
import { TILE_LEGEND, parseCart, type Cart } from "@/game/model";
import { loadSave, writeSave, type SaveData } from "@/game/save";

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getX: () => number;
      getSpeed: () => number;
      setKeys: (codes: string[]) => void;
    };
  }
}

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
  "KeyZ",
  "KeyX",
  "Escape",
]);

function readAxes(keys: Set<string>, stick: { x: number; y: number }) {
  let x = Math.abs(stick.x) > 0.18 ? stick.x : 0;
  let y = Math.abs(stick.y) > 0.18 ? stick.y : 0;
  if (keys.has("ArrowLeft") || keys.has("KeyA")) x -= 1;
  if (keys.has("ArrowRight") || keys.has("KeyD")) x += 1;
  if (keys.has("ArrowUp") || keys.has("KeyW")) y -= 1;
  if (keys.has("ArrowDown") || keys.has("KeyS")) y += 1;
  const mag = Math.hypot(x, y);
  if (mag > 1) {
    x /= mag;
    y /= mag;
  }
  return { x, y };
}

function edges(keys: Set<string>, prev: { attack: boolean; dash: boolean; blast: boolean }) {
  const attack = keys.has("Space") || keys.has("KeyJ") || keys.has("KeyZ");
  const dash = keys.has("ShiftLeft") || keys.has("ShiftRight") || keys.has("KeyK");
  const blast = keys.has("KeyL") || keys.has("KeyX");
  const input: Input = {
    ...readAxes(keys, { x: 0, y: 0 }),
    attackEdge: attack && !prev.attack,
    dashEdge: dash && !prev.dash,
    blastEdge: blast && !prev.blast,
  };
  return { input, attack, dash, blast };
}

function installProbe(simRef: RefObject<Sim | null>, keysRef: RefObject<Set<string>>) {
  window.__controlsTest = {
    getYaw: () => simRef.current?.yaw ?? 0,
    getX: () => (simRef.current ? playerOf(simRef.current).x : 0),
    getSpeed: () => {
      const sim = simRef.current;
      if (!sim) return 0;
      const player = playerOf(sim);
      return Math.hypot(player.vx, player.vy);
    },
    setKeys: (codes) => {
      keysRef.current = new Set(codes);
    },
  };
}

function Hold({
  label,
  code,
  keys,
}: {
  label: string;
  code: string;
  keys: RefObject<Set<string> | null>;
}) {
  const down = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    keys.current?.add(code);
    unlockAudio();
  };
  const up = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    keys.current?.delete(code);
  };
  return (
    <button
      type="button"
      className="min-h-12 min-w-16 rounded-xl bg-ink-2 px-3 text-sm font-semibold text-cream"
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerLeave={up}
    >
      {label}
    </button>
  );
}

function Stick({ axes }: { axes: RefObject<{ x: number; y: number }> }) {
  const knob = useRef<HTMLSpanElement>(null);
  const set = (event: ReactPointerEvent<HTMLDivElement>, active: boolean) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!active) {
      axes.current = { x: 0, y: 0 };
      if (knob.current) knob.current.style.transform = "translate(-50%, -50%)";
      return;
    }
    let x = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    let y = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const mag = Math.hypot(x, y);
    if (mag > 1) {
      x /= mag;
      y /= mag;
    }
    axes.current = { x, y };
    if (knob.current) knob.current.style.transform = `translate(calc(-50% + ${x * 22}px), calc(-50% + ${y * 22}px))`;
  };
  return (
    <div
      className="relative h-28 w-28 rounded-full border border-line bg-ink-2"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        unlockAudio();
        set(event, true);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) set(event, true);
      }}
      onPointerUp={(event) => set(event, false)}
      onPointerCancel={(event) => set(event, false)}
    >
      <span ref={knob} className="absolute top-1/2 left-1/2 h-12 w-12 rounded-full bg-ember" />
    </div>
  );
}

export function GameApp() {
  const [screen, setScreen] = useState<"title" | "play" | "mix">("title");
  const [source, setSource] = useState(STORY_SOURCE);
  const [mixError, setMixError] = useState("");
  const [save, setSave] = useState<SaveData>({ version: 1, muted: false, cleared: [], customs: [] });
  const [paused, setPaused] = useState(false);
  const [hudTick, setHudTick] = useState(0);
  const simRef = useRef<Sim | null>(null);
  const keysRef = useRef(new Set<string>());
  const stickRef = useRef({ x: 0, y: 0 });
  const prevRef = useRef({ attack: false, dash: false, blast: false });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const saveRef = useRef(save);
  const pausedRef = useRef(false);
  saveRef.current = save;
  pausedRef.current = paused;

  useEffect(() => {
    const loaded = loadSave();
    setSave(loaded);
    setMuted(loaded.muted);
  }, []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (!WATCH.has(event.code)) return;
      event.preventDefault();
      keysRef.current.add(event.code);
      if (event.code === "Escape") setPaused((value) => !value);
    };
    const up = (event: KeyboardEvent) => {
      keysRef.current.delete(event.code);
    };
    const blur = () => {
      keysRef.current.clear();
      stickRef.current = { x: 0, y: 0 };
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") resumeAudio();
    });
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let hudSig = "";
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const sim = simRef.current;
      if (sim && !pausedRef.current) {
        acc += dt;
        let guard = 0;
        const held = edges(keysRef.current, prevRef.current);
        prevRef.current = { attack: held.attack, dash: held.dash, blast: held.blast };
        const aim = readAxes(keysRef.current, stickRef.current);
        let attackEdge = held.input.attackEdge;
        let dashEdge = held.input.dashEdge;
        let blastEdge = held.input.blastEdge;
        while (acc >= 1 / 60 && guard++ < 5) {
          const before = sim.cleared.size;
          step(sim, 1 / 60, { x: aim.x, y: aim.y, attackEdge, dashEdge, blastEdge });
          attackEdge = false;
          dashEdge = false;
          blastEdge = false;
          acc -= 1 / 60;
          if (sim.cleared.size !== before) {
            const next = { ...saveRef.current, cleared: [...sim.cleared] };
            saveRef.current = next;
            writeSave(next);
            setSave(next);
          }
        }
        for (const name of sim.sfx.splice(0)) playEvent(name);
        const canvas = canvasRef.current;
        if (canvas) drawWorld(canvas, sim, null);
        const player = playerOf(sim);
        const sig = `${sim.room.id}|${sim.dialog?.name ?? ""}|${Math.ceil(player.hp)}|${sim.banner}`;
        if (sig !== hudSig) {
          hudSig = sig;
          setHudTick((value) => value + 1);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const startCart = (cart: Cart) => {
    unlockAudio();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sim = createSim(cart, saveRef.current.cleared, reduced);
    simRef.current = sim;
    installProbe(simRef, keysRef);
    setPaused(false);
    setScreen("play");
  };

  const toggleMute = () => {
    const next = { ...saveRef.current, muted: !saveRef.current.muted };
    saveRef.current = next;
    setSave(next);
    writeSave(next);
    setMuted(next.muted);
    unlockAudio();
  };

  const sim = simRef.current;
  const modeLabel = screen === "play" && sim ? (sim.room.mode === "brawl" ? "Belt lane" : "Ward") : "";
  void hudTick;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 px-4 py-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs tracking-wide text-brass">POCKET CIRCUIT</p>
          <h1 className="font-display text-xl text-cream sm:text-2xl">Ashlane</h1>
        </div>
        <button type="button" className="grid h-11 w-11 place-items-center rounded-xl bg-ink-2 text-cream" onClick={toggleMute} aria-label={save.muted ? "Unmute" : "Mute"}>
          {save.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </header>

      {screen === "title" ? (
        <section className="flex flex-col gap-4">
          <p className="max-w-xl text-base leading-relaxed text-cream-dim">
            Roam Cinder Ward from above, then step through a door and the street drops into a belt brawl. Original scrap-city, no license, plays in the browser and on your phone.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="min-h-12 rounded-xl bg-ember px-5 font-semibold text-ink" onClick={() => startCart(STORY)}>
              Start
            </button>
            <button
              type="button"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-ink-2 px-5 font-semibold text-cream"
              onClick={() => {
                setMixError("");
                setScreen("mix");
              }}
            >
              <Hammer size={16} /> Mix a lane
            </button>
          </div>
          <ul className="grid gap-2 sm:grid-cols-3">
            {[
              ["Ward", "Free roam, talk, choose a door."],
              ["Belt", "Up and down is depth. Punches miss if you step off their line."],
              ["Cartridge", "Rooms are text. Edit them, then walk in."],
            ].map(([title, copy]) => (
              <li key={title} className="rounded-xl border border-line bg-ink-2 p-3">
                <p className="font-display text-xs text-brass">{title.toUpperCase()}</p>
                <p className="mt-1 text-sm leading-relaxed text-cream">{copy}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-cream-dim">
            {save.cleared.some((id) => id.startsWith("ashlane:"))
              ? save.cleared.includes("ashlane:alley") && save.cleared.includes("ashlane:kiln")
                ? "The ward is yours. Both lanes are quiet."
                : "One lane is quiet. The other is still hot."
              : "Nothing cleared yet. Mira and Voss are waiting in the plaza."}
          </p>
        </section>
      ) : null}

      {screen === "mix" ? (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink-2 px-3 text-sm text-cream" onClick={() => setScreen("title")}>
              <ArrowLeft size={16} /> Back
            </button>
            <button type="button" className="min-h-11 rounded-xl bg-ink-2 px-3 text-sm text-cream" onClick={() => setSource(STORY_SOURCE)}>
              Load circuit
            </button>
            <button type="button" className="min-h-11 rounded-xl bg-ink-2 px-3 text-sm text-cream" onClick={() => setSource(BLANK_SOURCE)}>
              Blank lane
            </button>
          </div>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            className="min-h-64 w-full rounded-xl border border-line bg-ink-2 p-3 font-display text-xs leading-relaxed text-cream"
            aria-label="Cartridge text"
          />
          {mixError ? <p className="text-sm text-ember">{mixError}</p> : null}
          <button
            type="button"
            className="min-h-12 rounded-xl bg-ember px-5 font-semibold text-ink"
            onClick={() => {
              const parsed = parseCart(source);
              if (!parsed.ok) {
                setMixError(parsed.error);
                return;
              }
              setMixError("");
              const next = {
                ...saveRef.current,
                customs: [{ id: parsed.cart.id, name: parsed.cart.name, source }, ...saveRef.current.customs.filter((item) => item.id !== parsed.cart.id)].slice(0, 8),
              };
              saveRef.current = next;
              setSave(next);
              writeSave(next);
              startCart(parsed.cart);
            }}
          >
            Walk in
          </button>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TILE_LEGEND.map((item) => (
              <li key={item.ch} className="rounded-lg border border-line px-2 py-2 text-sm">
                <span className="font-display text-brass">{item.ch}</span> {item.name}
                <span className="mt-1 block text-cream-dim">{item.hint}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {screen === "play" ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-cream-dim">
              <span className="text-cream">{sim?.room.name}</span> · {modeLabel}
            </p>
            <div className="flex gap-2">
              <button type="button" className="grid h-11 w-11 place-items-center rounded-xl bg-ink-2 text-cream" onClick={() => setPaused((value) => !value)} aria-label="Pause">
                <Pause size={18} />
              </button>
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-xl bg-ink-2 text-cream"
                onClick={() => {
                  if (simRef.current) restartRoom(simRef.current);
                }}
                aria-label="Retry room"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
          <div className="screen-bezel">
            <canvas ref={canvasRef} width={320} height={180} />
            <div className="screen-shade" />
            {paused ? (
              <div className="absolute inset-2 grid place-items-center rounded-xl bg-ink/90">
                <div className="flex flex-col items-center gap-3">
                  <p className="font-display text-sm text-cream">Paused</p>
                  <button type="button" className="min-h-11 rounded-xl bg-ember px-4 font-semibold text-ink" onClick={() => setPaused(false)}>
                    Resume
                  </button>
                  <button
                    type="button"
                    className="min-h-11 rounded-xl bg-ink-2 px-4 text-cream"
                    onClick={() => {
                      simRef.current = null;
                      setPaused(false);
                      setScreen("title");
                    }}
                  >
                    Leave the ward
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <p className="hidden text-sm text-cream-dim sm:block">WASD or arrows move. J or Space strikes. K or Shift dashes. L fires the coil. On a lane, up and down steps off their line.</p>
          <div className="touch-controls items-end justify-between gap-3">
            <Stick axes={stickRef} />
            <div className="flex gap-2">
              <Hold label="Dash" code="KeyK" keys={keysRef} />
              <Hold label="Coil" code="KeyL" keys={keysRef} />
              <Hold label="Strike" code="KeyJ" keys={keysRef} />
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
