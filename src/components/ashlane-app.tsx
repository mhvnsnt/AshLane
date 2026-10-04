import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { EMPTY_HUD, parseSpecText, specDocument, type Hud, type Mode } from "@/game3d/spec";
import { mount, type Handle } from "@/game3d/mount";
import { MISSIONS } from "@/game3d/campaign";
import { ASSIGN_SLOTS, CLIP_NAMES, STYLES, type Slot } from "@/game3d/rig-pipeline";
import { MARTIAL, STANCES } from "@/game3d/styles";

const ARENAS: { id: string; label: string; note: string }[] = [
  { id: "ward", label: "Cinder ward", note: "The whole lane." },
  { id: "dock", label: "Dock", note: "Blue rain. You see less of the street." },
  { id: "pit", label: "Pit", note: "Warm lamps. The fog sits low." },
  { id: "high", label: "High line", note: "The coil. Dive from the scaffolds." },
  { id: "yard", label: "Yard", note: "Pale gravel. Open." },
  { id: "under", label: "Underpass", note: "Dark. They have to come in close." },
];

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
  const [suite, setSuite] = useState(false);
  const [menu, setMenu] = useState<"main" | "jobs" | "style" | "library" | "story" | "arenas">("main");
  const [arena, setArena] = useState("ward");
  const [slot, setSlot] = useState<Slot>("jab");
  const [clip, setClip] = useState("Unarmed_Melee_Attack_Punch_A");
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
            <p className="font-display text-[10px] leading-tight text-cream-dim">
              H {Math.round(hud.headDmg)}
              <br />
              C {Math.round(hud.chestDmg)}
              <br />
              L {Math.round(hud.legsDmg)}
            </p>
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
          {playing && hud.flow > 8 ? <p className="pointer-events-none absolute right-4 top-10 font-display text-xs text-brass">FLOW {hud.flow}</p> : null}
          {playing ? (
            <p className="pointer-events-none absolute bottom-3 left-4 max-w-[70%] text-sm text-cream-dim">{objective(hud)}</p>
          ) : null}

          {!hud.running ? (
            <div className="veil absolute inset-0 flex items-end justify-center p-4 sm:items-center">
              <div className="max-h-[78%] w-full max-w-md overflow-y-auto">
                <p className="font-display text-3xl text-cream">Ashlane</p>
                <p className="mt-2 text-sm leading-relaxed text-cream-dim">
                  {MISSIONS.length} jobs. Hold stick back to guard. Lows and launchers break it. Stick sideways and jump is an au. Throw them into a wall, then hit for a wall follow. Hold a direction as you land to tech. Spin stays on L.
                </p>
                {menu === "main" ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <button type="button" className="rounded-full bg-ember px-5 py-3 font-display text-sm text-ink" onClick={() => api.current?.startStory(Math.min(hud.clearedMission, MISSIONS.length - 1))}>
                      Story
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" className="rounded-full border border-line bg-ink-2 px-3 py-3 text-sm" onClick={() => api.current?.startBout("exhibit", arena)}>
                        Exhibition
                      </button>
                      <button type="button" className="rounded-full border border-line bg-ink-2 px-3 py-3 text-sm" onClick={() => api.current?.startBout("practice", arena)}>
                        Practice
                      </button>
                    </div>
                    <button type="button" className="rounded-full border border-line bg-ink-2 px-5 py-3 text-sm text-cream" onClick={() => { api.current?.setStage("ward"); begin("roam"); }}>
                      Ward
                    </button>
                    <div className="grid grid-cols-3 gap-2">
                      <button type="button" className="rounded-full border border-line bg-ink-2 px-3 py-3 text-sm" onClick={() => { api.current?.setStage("dock"); begin("roam"); }}>
                        Dock
                      </button>
                      <button type="button" className="rounded-full border border-line bg-ink-2 px-3 py-3 text-sm" onClick={() => { api.current?.setStage("pit"); begin("roam"); }}>
                        Pit
                      </button>
                      <button type="button" className="rounded-full border border-line bg-ink-2 px-3 py-3 text-sm" onClick={() => { api.current?.setStage("high"); begin("platform"); }}>
                        High line
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button type="button" className="rounded-full border border-line bg-ink-2 px-3 py-3 text-sm" onClick={() => setMenu("arenas")}>
                        Arenas
                      </button>
                      <button type="button" className="rounded-full border border-line bg-ink-2 px-3 py-3 text-sm" onClick={() => setMenu("story")}>
                        Jobs
                      </button>
                      <button type="button" className="rounded-full border border-line bg-ink-2 px-3 py-3 text-sm" onClick={() => setMenu("style")}>
                        Customize
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" className="rounded-full border border-line bg-ink-2 px-4 py-3 text-sm text-cream" onClick={() => begin("belt")}>
                        Scrap street
                      </button>
                      <button type="button" className="rounded-full border border-line bg-ink-2 px-4 py-3 text-sm text-cream" onClick={() => begin("platform")}>
                        Coil scaffolds
                      </button>
                    </div>
                  </div>
                ) : null}
                {menu === "arenas" ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-sm text-cream-dim">Pick a look. Exhibition and Practice use a ring in the middle of it. Ward still walks the whole lane.</p>
                    {ARENAS.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        className="rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left"
                        onClick={() => setArena(place.id)}
                      >
                        <span className="font-display text-sm text-brass">
                          {place.label}
                          {arena === place.id ? " · on" : ""}
                        </span>
                        <span className="mt-1 block text-sm text-cream-dim">{place.note}</span>
                      </button>
                    ))}
                    <button type="button" className="rounded-full bg-ember px-4 py-3 font-display text-sm text-ink" onClick={() => api.current?.startBout("exhibit", arena)}>
                      Exhibition here
                    </button>
                    <button type="button" className="rounded-full border border-line px-4 py-3 text-sm" onClick={() => api.current?.startBout("practice", arena)}>
                      Practice here
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-line px-4 py-3 text-sm"
                      onClick={() => {
                        api.current?.setStage(arena);
                        begin(arena === "high" ? "platform" : "roam");
                      }}
                    >
                      Walk it
                    </button>
                    <button type="button" className="rounded-full border border-line px-4 py-3 text-sm" onClick={() => setMenu("main")}>
                      Back
                    </button>
                  </div>
                ) : null}
                {menu === "story" ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-sm text-cream-dim">Cleared {hud.clearedMission} of {MISSIONS.length}. Later jobs stay locked until the one before them is done.</p>
                    {MISSIONS.map((mission, index) => {
                      const locked = index > hud.clearedMission;
                      return (
                        <button
                          key={mission.n}
                          type="button"
                          disabled={locked}
                          className="rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left disabled:opacity-40"
                          onClick={() => api.current?.startStory(index)}
                        >
                          <span className="font-display text-sm text-brass">
                            {mission.n}. {mission.title}
                            {index < hud.clearedMission ? " · done" : ""}
                          </span>
                          <span className="mt-1 block text-sm text-cream-dim">
                            {mission.step} {mission.waves} waves.
                          </span>
                        </button>
                      );
                    })}
                    <button type="button" className="rounded-full border border-line px-4 py-3 text-sm" onClick={() => setMenu("main")}>
                      Back
                    </button>
                  </div>
                ) : null}
                {menu === "style" ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-sm text-cream-dim">KayKit stays shorter, at ward size. Soldier, Second soldier, Shambler, and Second shambler are full-size CC0 bodies and stand taller. Limb bones are no longer stretched, so the skin stays in one piece. Sliders change height, width, and the head only.</p>
                    <div className="flex gap-2">
                      <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => api.current?.setBuild("chibi")}>Ward size{hud.build === "chibi" ? " · on" : ""}</button>
                      <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => api.current?.setBuild("full")}>Full size{hud.build === "full" ? " · on" : ""}</button>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => api.current?.setCrowd("mix")}>Mixed crowd{hud.crowd === "mix" ? " · on" : ""}</button>
                      <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => api.current?.setCrowd("chibi")}>Chibi crowd{hud.crowd === "chibi" ? " · on" : ""}</button>
                      <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => api.current?.setCrowd("full")}>Full crowd{hud.crowd === "full" ? " · on" : ""}</button>
                    </div>
                    <label className="text-sm text-cream-dim">Height
                      <input className="mt-1 block w-full" type="range" min={0.86} max={1.18} step={0.02} value={hud.height} onChange={(event) => api.current?.setShape({ height: Number(event.target.value) })} />
                    </label>
                    <label className="text-sm text-cream-dim">Bulk
                      <input className="mt-1 block w-full" type="range" min={0.8} max={1.25} step={0.02} value={hud.bulk} onChange={(event) => api.current?.setShape({ bulk: Number(event.target.value) })} />
                    </label>
                    <label className="text-sm text-cream-dim">Head
                      <input className="mt-1 block w-full" type="range" min={0.75} max={1.3} step={0.02} value={hud.head} onChange={(event) => api.current?.setShape({ head: Number(event.target.value) })} />
                    </label>
                    <label className="text-sm text-cream-dim">Legs
                      <input className="mt-1 block w-full" type="range" min={0.82} max={1.22} step={0.02} value={hud.leg} onChange={(event) => api.current?.setShape({ leg: Number(event.target.value) })} />
                    </label>
                    <label className="text-sm text-cream-dim">Shoulders
                      <input className="mt-1 block w-full" type="range" min={0.82} max={1.22} step={0.02} value={hud.shoulder} onChange={(event) => api.current?.setShape({ shoulder: Number(event.target.value) })} />
                    </label>
                    {STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        className="rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left"
                        onClick={() => api.current?.setStyle(style.id)}
                      >
                        <span className="font-display text-sm text-brass">
                          {style.label}
                          {hud.style === style.id ? " · on" : ""}
                        </span>
                        <span className="mt-1 block text-sm text-cream-dim">{style.note}</span>
                      </button>
                    ))}
                    <p className="pt-2 font-display text-xs text-brass">Fighting style</p>
                    {MARTIAL.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        className="rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left"
                        onClick={() => api.current?.setMartial(style.id)}
                      >
                        <span className="font-display text-sm text-brass">
                          {style.label}
                          {hud.martial === style.id ? " · on" : ""}
                        </span>
                        <span className="mt-1 block text-sm text-cream-dim">{style.note}</span>
                      </button>
                    ))}
                    <p className="pt-2 font-display text-xs text-brass">Stance</p>
                    {STANCES.map((stance) => (
                      <button
                        key={stance.id}
                        type="button"
                        className="rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left"
                        onClick={() => api.current?.setStance(stance.id)}
                      >
                        <span className="font-display text-sm text-brass">
                          {stance.label}
                          {hud.stance === stance.id ? " · on" : ""}
                        </span>
                        <span className="mt-1 block text-sm text-cream-dim">{stance.note}</span>
                      </button>
                    ))}
                    <button type="button" className="rounded-full border border-line px-4 py-3 text-sm" onClick={() => setMenu("library")}>
                      Assign a single clip
                    </button>
                    <button type="button" className="rounded-full border border-line px-4 py-3 text-sm" onClick={() => setMenu("main")}>
                      Back
                    </button>
                  </div>
                ) : null}
                {menu === "library" ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-sm text-cream-dim">
                      {CLIP_NAMES.length} clips on this skeleton, kept on every body. Bannon's Mixamo bank uses different bone names, so those files are not in the phone build. Assign one of these instead.
                    </p>
                    <label className="text-xs text-cream-dim">
                      Slot
                      <select className="mt-1 w-full rounded-xl border border-line bg-ink-2 px-3 py-3 text-sm text-cream" value={slot} onChange={(e) => setSlot(e.target.value as Slot)}>
                        {ASSIGN_SLOTS.map((name) => (
                          <option key={name}>{name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-cream-dim">
                      Clip
                      <select className="mt-1 w-full rounded-xl border border-line bg-ink-2 px-3 py-3 text-sm text-cream" value={clip} onChange={(e) => setClip(e.target.value)}>
                        {CLIP_NAMES.map((name) => (
                          <option key={name}>{name}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="rounded-full bg-brass px-4 py-3 text-sm text-ink"
                      onClick={() => api.current?.assignClip(slot, clip)}
                    >
                      Assign {clip} to {slot}
                    </button>
                    <button type="button" className="rounded-full border border-line px-4 py-3 text-sm" onClick={() => setMenu("main")}>
                      Back
                    </button>
                  </div>
                ) : null}
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

          {suite && hud.running ? (
            <div className="veil absolute inset-0 flex items-end justify-center overflow-y-auto p-4 sm:items-center">
              <div className="max-h-[78%] w-full max-w-sm overflow-y-auto">
                <p className="font-display text-xl">Customize</p>
                <div className="mt-3 flex flex-col gap-2">
                  {STYLES.map((style) => (
                    <button key={style.id} type="button" className="rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left" onClick={() => api.current?.setStyle(style.id)}>
                      <span className="font-display text-sm text-brass">
                        {style.label}
                        {hud.style === style.id ? " · on" : ""}
                      </span>
                    </button>
                  ))}
                  {MARTIAL.map((style) => (
                    <button key={style.id} type="button" className="rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left" onClick={() => api.current?.setMartial(style.id)}>
                      <span className="font-display text-sm text-brass">
                        {style.label}
                        {hud.martial === style.id ? " · on" : ""}
                      </span>
                      <span className="mt-1 block text-sm text-cream-dim">{style.note}</span>
                    </button>
                  ))}
                  {STANCES.map((stance) => (
                    <button key={stance.id} type="button" className="rounded-2xl border border-line bg-ink-2 px-4 py-3 text-left" onClick={() => api.current?.setStance(stance.id)}>
                      <span className="font-display text-sm text-brass">
                        {stance.label}
                        {hud.stance === stance.id ? " · on" : ""}
                      </span>
                      <span className="mt-1 block text-sm text-cream-dim">{stance.note}</span>
                    </button>
                  ))}
                  <button type="button" className="rounded-full bg-ember px-4 py-3 font-display text-sm text-ink" onClick={() => setSuite(false)}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {hud.running && hud.paused && hud.bout === "done" && !suite ? (
            <div className="veil absolute inset-0 flex items-end justify-center p-4 sm:items-center">
              <div className="w-full max-w-sm">
                <p className="font-display text-xl">Exhibition clear</p>
                <p className="mt-1 text-sm text-cream-dim">The card is down. Flow was {hud.flow}.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <button type="button" className="rounded-full bg-ember px-4 py-3 font-display text-sm text-ink" onClick={() => api.current?.startBout("exhibit", arena)}>
                    Run it again
                  </button>
                  <button type="button" className="rounded-full border border-line px-4 py-3 text-sm" onClick={() => api.current?.startBout("practice", arena)}>
                    Practice
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {hud.running && hud.paused && hud.missionClear && hud.bout !== "done" && !suite ? (
            <div className="veil absolute inset-0 flex items-end justify-center p-4 sm:items-center">
              <div className="w-full max-w-sm">
                <p className="font-display text-xl">Job done</p>
                <p className="mt-1 text-sm text-cream-dim">{hud.missionTitle}</p>
                <div className="mt-4 flex flex-col gap-2">
                  {hud.mission + 1 < MISSIONS.length ? (
                    <button type="button" className="rounded-full bg-ember px-4 py-3 font-display text-sm text-ink" onClick={() => api.current?.startStory(hud.mission + 1)}>
                      Next job
                    </button>
                  ) : (
                    <p className="text-sm text-cream-dim">That's the end of the four chapters.</p>
                  )}
                  <button type="button" className="rounded-full border border-line px-4 py-3 text-sm" onClick={() => api.current?.startStory(hud.mission)}>
                    Run it again
                  </button>
                  <button type="button" className="rounded-full border border-line px-4 py-3 text-sm" onClick={() => setSuite(true)}>
                    Customize
                  </button>
                  <button type="button" className="rounded-full border border-line px-4 py-3 text-sm" onClick={() => api.current?.pause(false)}>
                    Stay in the ward
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {hud.running && hud.paused && !hud.missionClear && hud.bout !== "done" ? (
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
          <Pad label="Use" hot={hud.weapon !== "fist"} onDown={(d) => api.current?.setBtn("use", d)} />
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
  if (hud.bout === "practice") return "Practice. The bag stays. Try the dives, the grabs, and the flow counter.";
  if (hud.bout === "exhibit" || hud.bout === "done") return "Exhibition. One card in the ring. Hit them as they swing and it counts as flow.";
  if (hud.story) return `${hud.missionTitle}. Wave ${hud.wave}/${hud.waveMax}. ${hud.missionStep}`;
  if (hud.scuffle || hud.phase === "clear") return `${hud.phase}. ${hud.phaseStep}`;
  if (hud.area === "house") return hud.weapon === "fist" ? "Noodle house. Take the pipe. Smash the crate." : "Pipe's in hand. Run and the swing lunges. It snaps.";
  return `${hud.job}. ${hud.jobStep}`;
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
