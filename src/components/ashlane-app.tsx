import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { EMPTY_HUD, parseSpecText, specDocument, type Hud, type Mode } from "@/game3d/spec";
import { mount, type Handle } from "@/game3d/mount";
import { MISSIONS, placeName, ruleLabel } from "@/game3d/campaign";
import { ASSIGN_SLOTS, CLIP_NAMES, STYLES, type Slot } from "@/game3d/rig-pipeline";
import { MARTIAL, STANCES } from "@/game3d/styles";
import { CAST_PICKS, fighterByName, ROSTER } from "@/game3d/roster";
import { sfxBack, sfxFight, wireMenuSfx } from "@/game3d/menu-sfx";
import "@/game3d/menu-theme.css";

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
  const [pendingJob, setPendingJob] = useState<number | null>(null);
  const [pendingWho, setPendingWho] = useState<string | null>(null);
  const [suiteWho, setSuiteWho] = useState<string | null>(null);
  const [menu, setMenu] = useState<"main" | "jobs" | "style" | "library" | "story" | "arenas">("main");
  const [arena, setArena] = useState("ward");
  const [slot, setSlot] = useState<Slot>("jab");
  const [clip, setClip] = useState("Unarmed_Melee_Attack_Punch_A");
  const seeded = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Wire synthesized menu SFX to every button in the menu sheet.
  useEffect(() => {
    wireMenuSfx(sheetRef.current);
  }, [menu, pendingJob, suite]);

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

  function leave() {
    sfxBack();
    setSuite(false);
    setPendingJob(null);
    setPendingWho(null);
    setSuiteWho(null);
    setMenu("main");
    api.current?.quit();
  }

  function walkIn(pick: (typeof CAST_PICKS)[number]) {
    if (pendingJob === null) return;
    sfxFight();
    api.current?.setWho(pick.id);
    api.current?.setAttire(pick.file);
    api.current?.startStory(pendingJob);
    setPendingJob(null);
    setPendingWho(null);
    setMenu("main");
  }

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
      <div className="al-hazard-thin h-1.5 shrink-0" aria-hidden="true" />
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-asphalt/60 px-4 py-2.5">
        <div>
          <p className="al-kicker al-flicker">Ashlane</p>
          <h1 className="font-headline text-xl uppercase leading-none tracking-wide text-cream">{labelFor(hud.mode)}</h1>
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
            <button type="button" className="al-chip" onClick={() => api.current?.pause(true)}>
              Pause
            </button>
          </div>
        ) : (
          <p className="max-w-48 text-right font-display text-[10px] uppercase tracking-widest text-cream-dim">One ward. Three feelings.</p>
        )}
      </header>

      <div className="relative min-h-0 flex-1 px-3 pb-3">
        <div className="stage h-full overflow-hidden rounded-2xl border border-line">
          <canvas ref={canvasRef} className="h-full w-full" />
          {hud.running && hud.banner ? <p className="al-banner pointer-events-none absolute inset-x-0 top-4 text-center text-xl">{hud.banner}</p> : null}
          {playing && hud.face ? <p className="pointer-events-none absolute inset-x-0 top-12 text-center font-display text-xs uppercase tracking-widest text-cream">{hud.face}</p> : null}
          {hud.combo > 1 && playing ? <p className="al-title pointer-events-none absolute right-4 top-4 text-2xl text-ember">{hud.combo} HIT</p> : null}
          {playing && hud.flow > 8 ? <p className="pointer-events-none absolute right-4 top-12 al-hud-chip">FLOW {hud.flow}</p> : null}
          {playing ? (
            <p className="pointer-events-none absolute bottom-3 left-4 max-w-[70%] text-sm text-cream-dim">{objective(hud)}</p>
          ) : null}

          {!hud.running ? (
            <div ref={sheetRef} className="sheet veil al-sheet al-concrete">
              <div className="al-sheet-inner mx-auto w-full max-w-md px-4 py-6">
                <p className="al-kicker">Green Harbor · street circuit</p>
                <h2 className="al-title al-title-xl al-spray mt-1">Ashlane</h2>
                <div className="al-rip mt-3" aria-hidden="true" />
                <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                  <span className="font-headline uppercase text-brass">{MISSIONS.length} jobs.</span> Hold stick back to guard. Lows and launchers break it. Stick sideways and jump is an au. Throw them into a wall, then hit for a wall follow. Hold a direction as you land to tech. Spin stays on L.
                </p>
                {menu === "main" ? (
                  <div className="mt-5 flex flex-col gap-2.5">
                    <button type="button" className="al-btn al-btn-primary al-pulse al-rise" onClick={() => setMenu("story")}>
                      <span>Story — take the jobs</span>
                    </button>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button type="button" className="al-btn al-rise al-rise-1" onClick={() => api.current?.startBout("exhibit", arena)}>
                        <span>Exhibition</span>
                      </button>
                      <button type="button" className="al-btn al-rise al-rise-1" onClick={() => api.current?.startBout("practice", arena)}>
                        <span>Practice</span>
                      </button>
                    </div>
                    <div className="al-section"><span className="al-section-title">Walk the ward</span></div>
                    <button type="button" className="al-btn al-rise al-rise-2" onClick={() => { api.current?.setStage("ward"); begin("roam"); }}>
                      <span>Cinder Ward <em className="not-italic text-cream-dim">— the plaza</em></span>
                    </button>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button type="button" className="al-chip al-rise al-rise-2" onClick={() => { api.current?.setStage("dock"); begin("roam"); }}>
                        Dock
                      </button>
                      <button type="button" className="al-chip al-rise al-rise-2" onClick={() => { api.current?.setStage("pit"); begin("roam"); }}>
                        Pit
                      </button>
                      <button type="button" className="al-chip al-rise al-rise-2" onClick={() => { api.current?.setStage("high"); begin("platform"); }}>
                        High line
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button type="button" className="al-chip al-rise al-rise-3" onClick={() => setMenu("arenas")}>
                        Arenas
                      </button>
                      <button type="button" className="al-chip al-rise al-rise-3" onClick={() => setMenu("story")}>
                        Jobs
                      </button>
                      <button type="button" className="al-chip al-rise al-rise-3" onClick={() => setMenu("style")}>
                        Customize
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button type="button" className="al-btn al-rise al-rise-4" onClick={() => begin("belt")}>
                        <span>Scrap street</span>
                      </button>
                      <button type="button" className="al-btn al-rise al-rise-4" onClick={() => begin("platform")}>
                        <span>Coil scaffolds</span>
                      </button>
                    </div>
                  </div>
                ) : null}
                {menu === "arenas" ? (
                  <div className="mt-4 flex flex-col gap-2.5">
                    <div className="al-section"><span className="al-section-title">Pick a block</span></div>
                    <p className="text-sm text-cream-dim">Exhibition and Practice use a ring in the middle of it. Ward still walks the whole lane.</p>
                    {ARENAS.map((place, i) => (
                      <button
                        key={place.id}
                        type="button"
                        data-on={arena === place.id ? "1" : undefined}
                        className={`al-card al-rise al-rise-${Math.min(i + 1, 5)}`}
                        onClick={() => setArena(place.id)}
                      >
                        <span className="al-card-title">
                          {place.label}
                          {arena === place.id ? " — locked in" : ""}
                        </span>
                        <span className="al-card-sub">{place.note}</span>
                      </button>
                    ))}
                    <button type="button" className="al-btn al-btn-primary" onClick={() => api.current?.startBout("exhibit", arena)}>
                      <span>Exhibition here</span>
                    </button>
                    <button type="button" className="al-btn" onClick={() => api.current?.startBout("practice", arena)}>
                      <span>Practice here</span>
                    </button>
                    <button
                      type="button"
                      className="al-btn"
                      onClick={() => {
                        api.current?.setStage(arena);
                        begin(arena === "high" ? "platform" : "roam");
                      }}
                    >
                      <span>Walk it</span>
                    </button>
                    <button type="button" className="al-btn al-btn-ghost" onClick={() => { sfxBack(); setMenu("main"); }}>
                      <span>← Back</span>
                    </button>
                  </div>
                ) : null}
                {menu === "story" ? (
                  <div className="mt-4 flex flex-col gap-2.5">
                    <div className="al-section"><span className="al-section-title">The jobs</span></div>
                    <p className="text-sm text-cream-dim"><span className="al-stamp">Cleared {hud.clearedMission} / {MISSIONS.length}</span></p>
                    <p className="text-sm text-cream-dim">Later jobs stay locked until the one before them is done.</p>
                    {MISSIONS.map((mission, index) => {
                      const locked = index > hud.clearedMission;
                      const done = index < hud.clearedMission;
                      return (
                        <button
                          key={mission.n}
                          type="button"
                          disabled={locked}
                          data-done={done ? "1" : undefined}
                          data-locked={locked ? "1" : undefined}
                          className="al-card al-mission"
                          onClick={() => { setPendingWho(null); setPendingJob(index); }}
                        >
                          <span className="al-mission-num">{locked ? "✕" : mission.n}</span>
                          <span className="al-card-title">{mission.title}</span>
                          <span className="al-card-sub">
                            {placeName(mission.drop)}{mission.drop !== mission.home ? ` to ${placeName(mission.home)}` : ""}. {ruleLabel(mission.rule)}.{mission.waves > 1 ? " One extra crew." : ""}
                          </span>
                        </button>
                      );
                    })}
                    <button type="button" className="al-btn al-btn-ghost" onClick={() => { sfxBack(); setMenu("main"); }}>
                      <span>← Back</span>
                    </button>
                  </div>
                ) : null}
                {menu === "style" ? (
                  <div className="mt-4 flex flex-col gap-2.5">
                    <div className="al-section"><span className="al-section-title">Build</span></div>
                    <p className="text-sm text-cream-dim">KayKit stays shorter, at ward size. Soldier, Second soldier, Shambler, and Second shambler are full-size CC0 bodies and stand taller. Limb bones are no longer stretched, so the skin stays in one piece. Sliders change height, width, and the head only.</p>
                    <div className="flex gap-2.5">
                      <button type="button" className="al-chip flex-1" data-on={hud.build === "chibi" ? "1" : undefined} onClick={() => api.current?.setBuild("chibi")}>Ward size</button>
                      <button type="button" className="al-chip flex-1" data-on={hud.build === "full" ? "1" : undefined} onClick={() => api.current?.setBuild("full")}>Full size</button>
                    </div>
                    <div className="flex gap-2.5">
                      <button type="button" className="al-chip flex-1" data-on={hud.crowd === "mix" ? "1" : undefined} onClick={() => api.current?.setCrowd("mix")}>Mixed crowd</button>
                      <button type="button" className="al-chip flex-1" data-on={hud.crowd === "chibi" ? "1" : undefined} onClick={() => api.current?.setCrowd("chibi")}>Chibi crowd</button>
                      <button type="button" className="al-chip flex-1" data-on={hud.crowd === "full" ? "1" : undefined} onClick={() => api.current?.setCrowd("full")}>Full crowd</button>
                    </div>
                    <label className="al-slider-label">Height
                      <input className="mt-1 block w-full" type="range" min={0.86} max={1.18} step={0.02} value={hud.height} onChange={(event) => api.current?.setShape({ height: Number(event.target.value) })} />
                    </label>
                    <label className="al-slider-label">Bulk
                      <input className="mt-1 block w-full" type="range" min={0.8} max={1.25} step={0.02} value={hud.bulk} onChange={(event) => api.current?.setShape({ bulk: Number(event.target.value) })} />
                    </label>
                    <label className="al-slider-label">Head
                      <input className="mt-1 block w-full" type="range" min={0.75} max={1.3} step={0.02} value={hud.head} onChange={(event) => api.current?.setShape({ head: Number(event.target.value) })} />
                    </label>
                    <label className="al-slider-label">Legs
                      <input className="mt-1 block w-full" type="range" min={0.82} max={1.22} step={0.02} value={hud.leg} onChange={(event) => api.current?.setShape({ leg: Number(event.target.value) })} />
                    </label>
                    <label className="al-slider-label">Shoulders
                      <input className="mt-1 block w-full" type="range" min={0.82} max={1.22} step={0.02} value={hud.shoulder} onChange={(event) => api.current?.setShape({ shoulder: Number(event.target.value) })} />
                    </label>
                    <div className="al-section"><span className="al-section-title">Fight kit</span></div>
                    {STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        data-on={hud.style === style.id ? "1" : undefined}
                        className="al-card"
                        onClick={() => api.current?.setStyle(style.id)}
                      >
                        <span className="al-card-title">{style.label}</span>
                        <span className="al-card-sub">{style.note}</span>
                      </button>
                    ))}
                    <div className="al-section"><span className="al-section-title">Who you are</span></div>
                    <p className="text-sm text-cream-dim"><span className="font-headline uppercase text-cream">{hud.who}</span>. {hud.bio}</p>
                    {ROSTER.map((fighter) => {
                      const on = hud.who === fighter.name;
                      return (
                        <button
                          key={fighter.id}
                          type="button"
                          data-on={on ? "1" : undefined}
                          className="al-card"
                          onClick={() => api.current?.setWho(fighter.id)}
                        >
                          <span className="al-fighter" data-on={on ? "1" : undefined}>
                            <span className="al-portrait" aria-hidden="true"><b>{fighter.name.charAt(0)}</b></span>
                            <span>
                              <span className="al-card-title">{fighter.name}</span>
                              <span className="al-card-sub">{fighter.bio}</span>
                              <span className="al-hud-chip mt-1 inline-block">{fighter.martial}</span>
                            </span>
                          </span>
                        </button>
                      );
                    })}
                    {fighterByName(hud.who)?.attires.length ? (
                      <div className="al-section"><span className="al-section-title">Attire</span></div>
                    ) : null}
                    {fighterByName(hud.who)?.attires.map((attire) => (
                      <button
                        key={attire.file}
                        type="button"
                        data-on={hud.cast === attire.file ? "1" : undefined}
                        className="al-card"
                        onClick={() => api.current?.setAttire(attire.file)}
                      >
                        <span className="al-card-title">{attire.label}</span>
                      </button>
                    ))}
                    <div className="al-section"><span className="al-section-title">Fighting style</span></div>
                    {MARTIAL.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        data-on={hud.martial === style.id ? "1" : undefined}
                        className="al-card"
                        onClick={() => api.current?.setMartial(style.id)}
                      >
                        <span className="al-card-title">{style.label}</span>
                        <span className="al-card-sub">{style.note}</span>
                      </button>
                    ))}
                    <div className="al-section"><span className="al-section-title">Stance</span></div>
                    {STANCES.map((stance) => (
                      <button
                        key={stance.id}
                        type="button"
                        data-on={hud.stance === stance.id ? "1" : undefined}
                        className="al-card"
                        onClick={() => api.current?.setStance(stance.id)}
                      >
                        <span className="al-card-title">{stance.label}</span>
                        <span className="al-card-sub">{stance.note}</span>
                      </button>
                    ))}
                    <button type="button" className="al-btn" onClick={() => setMenu("library")}>
                      <span>Assign a single clip</span>
                    </button>
                    <button type="button" className="al-btn al-btn-ghost" onClick={() => { sfxBack(); setMenu("main"); }}>
                      <span>← Back</span>
                    </button>
                  </div>
                ) : null}
                {menu === "library" ? (
                  <div className="mt-4 flex flex-col gap-2.5">
                    <div className="al-section"><span className="al-section-title">Move lab</span></div>
                    <p className="text-sm text-cream-dim">
                      {CLIP_NAMES.length} clips on this skeleton, kept on every body. Bannon's Mixamo bank uses different bone names, so those files are not in the phone build. Assign one of these instead.
                    </p>
                    <label className="al-slider-label">
                      Slot
                      <select className="al-select" value={slot} onChange={(e) => setSlot(e.target.value as Slot)}>
                        {ASSIGN_SLOTS.map((name) => (
                          <option key={name}>{name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="al-slider-label">
                      Clip
                      <select className="al-select" value={clip} onChange={(e) => setClip(e.target.value)}>
                        {CLIP_NAMES.map((name) => (
                          <option key={name}>{name}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="al-btn al-btn-primary"
                      onClick={() => api.current?.assignClip(slot, clip)}
                    >
                      <span>Assign {clip} to {slot}</span>
                    </button>
                    <button type="button" className="al-btn al-btn-ghost" onClick={() => { sfxBack(); setMenu("main"); }}>
                      <span>← Back</span>
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
            <div className="sheet veil al-sheet al-concrete">
              <div className="al-sheet-inner mx-auto w-full max-w-sm px-4 py-6">
                <p className="al-kicker">Dress for the fight</p>
                <h2 className="al-title text-3xl mt-1">Customize</h2>
                <div className="al-rip mt-2" aria-hidden="true" />
                <p className="mt-2 text-sm text-cream-dim"><span className="font-headline uppercase text-cream">{hud.who}</span>{hud.cast ? ` · ${CAST_PICKS.find((pick) => pick.file === hud.cast)?.label ?? hud.cast}` : ""}</p>
                <div className="mt-3 flex flex-col gap-2.5">
                  <div className="flex gap-2.5">
                    <button type="button" className="al-chip flex-1" data-on={hud.build === "full" ? "1" : undefined} onClick={() => api.current?.setBuild("full")}>Full</button>
                    <button type="button" className="al-chip flex-1" data-on={hud.build === "chibi" ? "1" : undefined} onClick={() => api.current?.setBuild("chibi")}>Ward size</button>
                  </div>
                  {suiteWho === null ? ROSTER.map((fighter) => {
                    const on = hud.who === fighter.name;
                    return (
                      <button key={fighter.id} type="button" data-on={on ? "1" : undefined} className="al-card" onClick={() => { setSuiteWho(fighter.id); api.current?.setWho(fighter.id); }}>
                        <span className="al-fighter" data-on={on ? "1" : undefined}>
                          <span className="al-portrait" aria-hidden="true"><b>{fighter.name.charAt(0)}</b></span>
                          <span>
                            <span className="al-card-title">{fighter.name}</span>
                            <span className="al-card-sub">{fighter.attires.length} look{fighter.attires.length === 1 ? "" : "s"}</span>
                          </span>
                        </span>
                      </button>
                    );
                  }) : (
                    <>
                      <div className="al-section"><span className="al-section-title">{ROSTER.find((fighter) => fighter.id === suiteWho)?.name} · pick a look</span></div>
                      {ROSTER.find((fighter) => fighter.id === suiteWho)?.attires.map((attire) => (
                        <button key={attire.file} type="button" data-on={hud.cast === attire.file ? "1" : undefined} className="al-card" onClick={() => api.current?.setAttire(attire.file)}>
                          <span className="al-card-title">{attire.label}</span>
                        </button>
                      ))}
                      <button type="button" className="al-btn al-btn-ghost" onClick={() => setSuiteWho(null)}><span>← Different fighter</span></button>
                    </>
                  )}
                  <div className="al-section"><span className="al-section-title">Kit</span></div>
                  {STYLES.map((style) => (
                    <button key={style.id} type="button" data-on={hud.style === style.id ? "1" : undefined} className="al-card" onClick={() => api.current?.setStyle(style.id)}>
                      <span className="al-card-title">{style.label}</span>
                    </button>
                  ))}
                  {MARTIAL.map((style) => (
                    <button key={style.id} type="button" data-on={hud.martial === style.id ? "1" : undefined} className="al-card" onClick={() => api.current?.setMartial(style.id)}>
                      <span className="al-card-title">{style.label}</span>
                      <span className="al-card-sub">{style.note}</span>
                    </button>
                  ))}
                  {STANCES.map((stance) => (
                    <button key={stance.id} type="button" data-on={hud.stance === stance.id ? "1" : undefined} className="al-card" onClick={() => api.current?.setStance(stance.id)}>
                      <span className="al-card-title">{stance.label}</span>
                      <span className="al-card-sub">{stance.note}</span>
                    </button>
                  ))}
                  <button type="button" className="al-btn al-btn-primary" onClick={() => setSuite(false)}>
                    <span>Done</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {hud.running && hud.paused && hud.bout === "done" && !suite ? (
            <div className="veil al-sheet absolute inset-0 flex items-end justify-center p-4 sm:items-center">
              <div className="w-full max-w-sm al-rise">
                <p className="al-kicker">Card's down</p>
                <h2 className="al-title text-4xl mt-1">Exhibition clear</h2>
                <div className="al-rip mt-2" aria-hidden="true" />
                <p className="mt-2 text-sm text-cream-dim">Flow was <span className="font-headline text-brass">{hud.flow}</span>.</p>
                <div className="mt-4 flex flex-col gap-2.5">
                  <button type="button" className="al-btn al-btn-primary" onClick={() => api.current?.startBout("exhibit", arena)}>
                    <span>Run it again</span>
                  </button>
                  <button type="button" className="al-btn" onClick={() => api.current?.startBout("practice", arena)}>
                    <span>Practice</span>
                  </button>
                  <button type="button" className="al-btn al-btn-ghost" onClick={leave}>
                    <span>← Main menu</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {hud.running && hud.paused && hud.missionClear && hud.bout !== "done" && !suite && pendingJob === null ? (
            <div className="veil al-sheet absolute inset-0 flex items-end justify-center p-4 sm:items-center">
              <div className="w-full max-w-sm al-rise">
                <p className="al-kicker al-flicker">Job complete</p>
                <h2 className="al-title text-4xl mt-1">Job done</h2>
                <div className="al-rip mt-2" aria-hidden="true" />
                <p className="mt-2 text-sm text-cream-dim">{hud.missionTitle}</p>
                <p className="mt-1 text-sm text-cream">Purse <span className="font-headline text-brass">{hud.purse}</span>. Rank <span className="font-headline text-brass">{hud.level}</span>. The next job is a different block.</p>
                <div className="mt-4 flex flex-col gap-2.5">
                  {hud.mission + 1 < MISSIONS.length ? (
                    <button type="button" className="al-btn al-btn-primary al-pulse" onClick={() => setPendingJob(hud.mission + 1)}>
                      <span>Next: {placeName(MISSIONS[hud.mission + 1].home)}</span>
                    </button>
                  ) : (
                    <p className="text-sm text-cream-dim">That's the end of the four chapters.</p>
                  )}
                  <button type="button" className="al-btn" onClick={() => setPendingJob(hud.mission)}>
                    <span>Run it again</span>
                  </button>
                  <button type="button" className="al-btn" onClick={() => setSuite(true)}>
                    <span>Customize</span>
                  </button>
                  <button type="button" className="al-btn al-btn-ghost" onClick={leave}>
                    <span>← Main menu</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {hud.running && hud.paused && !hud.missionClear && hud.bout !== "done" && !suite && pendingJob === null ? (
            <div ref={sheetRef} className="sheet veil al-sheet al-concrete">
              <div className="al-sheet-inner mx-auto w-full max-w-sm px-4 py-6">
                <p className="al-kicker">Take five</p>
                <h2 className="al-title text-4xl mt-1">Paused</h2>
                <div className="al-rip mt-2" aria-hidden="true" />
                <p className="mt-2 text-sm text-cream-dim"><span className="font-headline uppercase text-cream">{hud.who}</span>. Drag this list. The ward stays where you left it.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="al-chip" data-on={hud.build === "full" ? "1" : undefined} onClick={() => api.current?.setBuild("full")}>You full</button>
                  <button type="button" className="al-chip" data-on={hud.build === "chibi" ? "1" : undefined} onClick={() => api.current?.setBuild("chibi")}>You chibi</button>
                  <button type="button" className="al-chip" data-on={hud.crowd === "full" ? "1" : undefined} onClick={() => api.current?.setCrowd("full")}>Crowd full</button>
                  <button type="button" className="al-chip" data-on={hud.crowd === "mix" ? "1" : undefined} onClick={() => api.current?.setCrowd("mix")}>Crowd mix</button>
                  <button type="button" className="al-chip" data-on={hud.crowd === "chibi" ? "1" : undefined} onClick={() => api.current?.setCrowd("chibi")}>Crowd chibi</button>
                </div>
                <div className="al-section"><span className="al-section-title">Switch block</span></div>
                <div className="flex flex-col gap-2.5">
                  {MODES.map((mode) => (
                    <button key={mode.id} type="button" className="al-card" onClick={() => begin(mode.id)}>
                      <span className="al-card-title">{mode.label}</span>
                      <span className="al-card-sub">{mode.hint}</span>
                    </button>
                  ))}
                  <button type="button" className="al-btn al-btn-primary al-pulse" onClick={() => api.current?.pause(false)}>
                    <span>Resume</span>
                  </button>
                  <button type="button" className="al-btn" onClick={() => setSuite(true)}>
                    <span>Customize</span>
                  </button>
                  <button type="button" className="al-btn" onClick={() => api.current?.rematch()}>
                    <span>Rematch</span>
                  </button>
                  <button type="button" className="al-btn al-btn-ghost" onClick={leave}>
                    <span>← Main menu</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          {pendingJob !== null && MISSIONS[pendingJob] ? (
            <div ref={sheetRef} className="sheet veil al-sheet al-concrete">
              <div className="al-sheet-inner mx-auto w-full max-w-md px-4 py-6">
                <p className="al-kicker">Job {MISSIONS[pendingJob].n} · {placeName(MISSIONS[pendingJob].drop)}</p>
                <h2 className="al-title text-4xl mt-1">{pendingWho ? "Which look" : "Who walks in"}</h2>
                <div className="al-rip mt-2" aria-hidden="true" />
                <p className="mt-2 text-sm text-cream-dim">{MISSIONS[pendingJob].title}.</p>
                <div className="mt-4 flex flex-col gap-2.5">
                  {pendingWho === null ? ROSTER.map((fighter) => (
                    <button key={fighter.id} type="button" className="al-card" onClick={() => setPendingWho(fighter.id)}>
                      <span className="al-fighter">
                        <span className="al-portrait" aria-hidden="true"><b>{fighter.name.charAt(0)}</b></span>
                        <span>
                          <span className="al-card-title">{fighter.name}</span>
                          <span className="al-card-sub">{fighter.bio}</span>
                          <span className="al-hud-chip mt-1 inline-block">{fighter.martial}</span>
                        </span>
                      </span>
                    </button>
                  )) : ROSTER.find((fighter) => fighter.id === pendingWho)?.attires.map((attire) => (
                    <button key={attire.file} type="button" className="al-card" onClick={() => walkIn({ id: pendingWho, name: ROSTER.find((fighter) => fighter.id === pendingWho)?.name ?? "", label: attire.label, file: attire.file, bio: "" })}>
                      <span className="al-card-title">{attire.label}</span>
                      <span className="al-card-sub">{ROSTER.find((fighter) => fighter.id === pendingWho)?.name}</span>
                    </button>
                  ))}
                  <button type="button" className="al-btn al-btn-ghost" onClick={() => { sfxBack(); pendingWho ? setPendingWho(null) : setPendingJob(null); }}>
                    <span>← Back</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="pad-dock">
        <Stick onChange={(x, y) => api.current?.setStick(x, y)} />
        <button type="button" className="rounded-full border border-line bg-ink-2 px-4 py-3 font-display text-xs text-cream" onClick={() => api.current?.pause(true)}>
          Pause
        </button>
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
  if (hud.story) return `Rank ${hud.level}. ${hud.actName}. ${hud.missionTitle}. Wave ${hud.wave}/${hud.waveMax}. Purse ${hud.purse}. ${hud.missionStep}`;
  if (hud.scuffle || hud.phase === "clear") return `${hud.phase}. ${hud.phaseStep}`;
  if (hud.area === "house") return hud.weapon === "fist" ? "Noodle house. Take the pipe. Smash the crate." : "Pipe's in hand. Run and the swing lunges. It snaps.";
  if (hud.area === "ring") return "The ring. Throw them into the red ropes and they come back.";
  if (hud.area === "cage") return "West cage. The grate is a wall. Throw them into it.";
  if (hud.area === "subway") return "South tunnel. Stay off the track when the train comes.";
  if (hud.area === "crane") return "North roof. A long fall hurts.";
  if (hud.area === "office") return "Back room, past the market. Ledger Cho keeps the paper.";
  return `${hud.job}. ${hud.jobStep}`;
}

function Meter({ label, value, tone }: { label: string; value: number; tone: "ember" | "brass" }) {
  return (
    <div className="w-20">
      <div className="mb-1 font-display text-[10px] uppercase tracking-widest text-cream-dim">{label}</div>
      <div className={`al-hpbar${tone === "brass" ? " brass" : ""}`}>
        <i style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
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
