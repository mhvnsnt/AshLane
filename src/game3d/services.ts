/**
 * services.ts — AshLane integration hub.
 *
 * Every federated / urban-mayhem / attention module is pure logic with no
 * three.js dependency. This file owns their instances (one GameServices per
 * game session) and ticks them from the sim loop. The renderer reads the
 * same state from view.ts.
 *
 * Wiring map:
 *   federated/weather.ts      -> tickSimServices (clock) + view.ts (sun/fog/rain)
 *   federated/boids.ts        -> view.ts (bird meshes)
 *   federated/dialogue.ts     -> mount.ts (dialogue overlay UI)
 *   federated/quests.ts       -> tickSimServices (objectives/timers)
 *   federated/pedestrians.ts  -> tickSimServices (crowd AI) + view.ts (render)
 *   federated/framedata.ts    -> sim.ts hitGrunts (combo scaling)
 *   federated/counters.ts     -> sim.ts hurt/updatePlayer (parry)
 *   federated/touch.ts        -> mount.ts (mobile overlay -> FrameInput)
 *   federated/minigames.ts    -> mount.ts (darts/blackjack/pool overlays)
 *   federated/streaming.ts    -> view.ts render (chunk state machine)
 *   federated/replay.ts       -> mount.ts pump loop (input recording)
 *   federated/springbones.ts  -> view.ts render (hair/cloth secondary motion)
 *   urban-mayhem/disciplines  -> spawn: assignStyle per body
 *   urban-mayhem/movesets     -> combat: movesForStyle lookup
 *   urban-mayhem/melee-weapons-> sim Weapon mapping (meleeToSim)
 *   urban-mayhem/npc-ai       -> tickSimServices (ambient npc brains)
 *   attention.ts              -> tickSimServices (report/update/encounters)
 */

import type { Sim, FrameInput, Body } from "./sim";
import {
  createWeather, updateWeather, rainIntensity, fogDensity, sunElevation,
  type WeatherSim,
} from "./federated/weather";
import {
  createFlock, updateFlock, scatterFlock, type Flock,
} from "./federated/boids";
import {
  createPedSystem, updatePeds, spawnPed, pedAlarm, cullPeds, type PedSystem,
} from "./federated/pedestrians";
import {
  startQuest, questEvent, questTick, currentStep,
  type Quest, type QuestProgress, type ObjectiveType,
} from "./federated/quests";
import {
  createRecorder, recordFrame, packInput, finishRecording, serializeReplay,
  type Recorder, type Replay,
} from "./federated/replay";
import {
  createTouchState, touchToInput, type TouchState,
} from "./federated/touch";
import {
  createStreamSystem, updateStreaming, createChunk, type StreamSystem,
} from "./federated/streaming";
import {
  createSpringBone, stepSpringBone, SPRING_PRESETS,
  type SpringBone, type SpringChain,
} from "./federated/springbones";
import {
  createCounter, tryCounter, updateCounter, resolveCounter,
  type CounterState,
} from "./federated/counters";
import { MOVES, comboScale, type MoveData } from "./federated/framedata";
import {
  parseDialogue, startDialogue, dialogueNext, dialogueChoose,
  type DialogueState, type DialogueEvent,
} from "./federated/dialogue";
import {
  createDarts, dealBlackjack, rackPool,
  type DartsState, type BlackjackState, type PoolBall,
} from "./federated/minigames";
import {
  AttentionDirector, type AttentionAction, type AttentionEncounter,
} from "./attention";
import { assignStyle, getStyle, type StyleProfile } from "./urban-mayhem/disciplines";
import { movesForStyle, type MoveDef } from "./urban-mayhem/movesets";
import { MELEE_WEAPONS, type MeleeWeaponId } from "./urban-mayhem/melee-weapons";
import { makeNpc, type NpcState } from "./urban-mayhem/npc-ai";

// ---------------------------------------------------------------------------
// Sim weapon mapping (urban-mayhem -> sim Weapon union)
// ---------------------------------------------------------------------------

export type SimWeapon = "fist" | "pipe" | "bottle" | "board" | "blade" | "spear";

const MELEE_TO_SIM: Record<MeleeWeaponId, SimWeapon> = {
  unarmed: "fist",
  knife: "blade",
  bat: "board",
  pipe: "pipe",
  chair: "board",
  crowbar: "pipe",
  machete: "blade",
  katana: "spear",
};

/** Map an urban-mayhem melee weapon id to the sim's Weapon type. */
export function meleeToSim(id: MeleeWeaponId): SimWeapon {
  return MELEE_TO_SIM[id] ?? "fist";
}

/** All melee weapon defs (for pickups / shops). */
export function allMeleeWeapons() {
  return MELEE_WEAPONS;
}

// ---------------------------------------------------------------------------
// GameServices
// ---------------------------------------------------------------------------

export interface GameServices {
  weather: WeatherSim;
  flock: Flock;
  peds: PedSystem;
  recorder: Recorder;
  touch: TouchState;
  stream: StreamSystem;
  attention: AttentionDirector;
  /** active quest + progress, or null when free-roaming */
  quest: Quest | null;
  questProgress: QuestProgress | null;
  /** active dialogue state (mount.ts renders the overlay) */
  dialogue: DialogueState | null;
  /** parry state per body id */
  counters: Map<number, CounterState>;
  /** urban-mayhem style id per body id */
  styles: Map<number, string>;
  /** ambient npc brains keyed by ped id */
  npcBrains: Map<number, NpcState>;
  /** spring chains per fighter id (hair/cloth) */
  springs: Map<number, SpringChain[]>;
  /** minigame states (mount.ts opens the overlay) */
  darts: DartsState | null;
  blackjack: BlackjackState | null;
  pool: PoolBall[] | null;
  /** latest attention encounter waiting on the game loop */
  pendingEncounter: AttentionEncounter | null;
  /** encounter poll timer */
  encounterT: number;
  /** ped population maintenance timer */
  pedT: number;
  /** last grunt/boss alive count (for quest defeat tracking) */
  lastFoeCount: number;
  /** combo value last tick (for attention "fight started" detection) */
  lastCombo: number;
  /** quest step index whose brief was already shown */
  briefStep: number;
}

export function createServices(): GameServices {
  const stream = createStreamSystem();
  // Register the 6 districts as streamable chunks (centers are approximate;
  // updateStreaming drives requested/loading/loaded/active each frame).
  const districts: Array<[string, number, number]> = [
    ["strip", 0, 0],
    ["alleys", -60, 40],
    ["warehouses", 70, -50],
    ["park", -40, -70],
    ["subway", 30, 70],
    ["rooftops", 90, 60],
  ];
  for (const [name, x, z] of districts) {
    stream.chunks.set(name, createChunk(name, name, x, z, 55));
  }
  return {
    weather: createWeather(18),
    flock: createFlock(9, 0, 24, 0, 40),
    peds: createPedSystem(),
    recorder: createRecorder((Math.random() * 0xffffffff) >>> 0),
    touch: createTouchState(),
    stream,
    attention: new AttentionDirector({
      onTierChange: (d, from, to, v) => {
        void d; void from; void to; void v;
      },
    }),
    quest: null,
    questProgress: null,
    dialogue: null,
    counters: new Map(),
    styles: new Map(),
    npcBrains: new Map(),
    springs: new Map(),
    darts: null,
    blackjack: null,
    pool: null,
    pendingEncounter: null,
    encounterT: 5,
    pedT: 0,
    lastFoeCount: -1,
    lastCombo: 0,
    briefStep: -1,
  };
}

// ---------------------------------------------------------------------------
// Combat helpers (called from sim.ts)
// ---------------------------------------------------------------------------

/** Framedata for a named move; falls back to jab. */
export function moveData(id: string): MoveData {
  return MOVES[id] ?? MOVES.jab;
}

/** Combo damage multiplier for the current sim.combo count. */
export function comboDamageScale(combo: number): number {
  return comboScale(combo);
}

/** Get (or create) the parry state for a body. */
export function counterFor(s: GameServices, bodyId: number): CounterState {
  let c = s.counters.get(bodyId);
  if (!c) {
    c = createCounter();
    s.counters.set(bodyId, c);
  }
  return c;
}

/** Attempt a parry for a body. Returns true if the parry window opened. */
export function tryParry(s: GameServices, bodyId: number): boolean {
  return tryCounter(counterFor(s, bodyId));
}

/**
 * Resolve an incoming hit against a defender's parry window.
 * Returns "countered" | "traded" | "missed".
 */
export function resolveParry(s: GameServices, bodyId: number, moveId: string) {
  const c = s.counters.get(bodyId);
  if (!c) return "missed" as const;
  return resolveCounter(c, moveData(moveId));
}

/** Tick all parry states (called each sim step). */
export function tickCounters(s: GameServices): void {
  for (const c of s.counters.values()) updateCounter(c);
}

/** Assign an urban-mayhem fighting style to a body (192 discipline x modifier combos). */
export function styleFor(s: GameServices, bodyId: number, discipline?: string, modifier?: string): string {
  const existing = s.styles.get(bodyId);
  if (existing) return existing;
  const id = assignStyle(String(bodyId), discipline, modifier);
  s.styles.set(bodyId, id);
  return id;
}

/** Full style profile for a body. */
export function styleProfile(s: GameServices, bodyId: number): StyleProfile {
  return getStyle(styleFor(s, bodyId));
}

/** Moveset for a body's style (urban-mayhem movelists). */
export function movesetFor(s: GameServices, bodyId: number): MoveDef[] {
  const profile = styleProfile(s, bodyId);
  return movesForStyle(profile.discipline);
}

// ---------------------------------------------------------------------------
// Attention helpers
// ---------------------------------------------------------------------------

export function reportAttention(s: GameServices, action: AttentionAction, district?: string): void {
  s.attention.report(action, district);
}

// ---------------------------------------------------------------------------
// Quest helpers
// ---------------------------------------------------------------------------

export function setActiveQuest(s: GameServices, quest: Quest | null): void {
  s.quest = quest;
  s.questProgress = quest ? startQuest(quest) : null;
  // Quest scripts can set time-of-day / weather.
  if (quest?.timeOfDay !== undefined) s.weather.timeOfDay = quest.timeOfDay;
}

export function questObjective(s: GameServices, type: ObjectiveType, data?: { targetId?: string; faction?: string; count?: number }): boolean {
  if (!s.quest || !s.questProgress) return false;
  return questEvent(s.quest, s.questProgress, type, data ?? {});
}

/** Human-readable current objective label for the HUD. */
export function questTrackerLabel(s: GameServices): string | null {
  if (!s.quest || !s.questProgress || s.questProgress.complete) return null;
  const step = currentStep(s.quest, s.questProgress);
  if (!step) return null;
  return step.objectives.filter((o) => !o.optional).map((o) => o.label).join(" / ");
}

// ---------------------------------------------------------------------------
// Dialogue helpers (mount.ts renders)
// ---------------------------------------------------------------------------

export function openDialogue(s: GameServices, src: string, node = "Start"): DialogueEvent {
  const script = parseDialogue(src);
  s.dialogue = startDialogue(script, node);
  return dialogueNext(s.dialogue);
}

export function advanceDialogue(s: GameServices): DialogueEvent {
  if (!s.dialogue) return { kind: "end" };
  const ev = dialogueNext(s.dialogue);
  if (ev.kind === "end") s.dialogue = null;
  return ev;
}

export function chooseDialogue(s: GameServices, idx: number): DialogueEvent {
  if (!s.dialogue) return { kind: "end" };
  const ev = dialogueChoose(s.dialogue, idx);
  if (ev.kind === "end") s.dialogue = null;
  return ev;
}

// ---------------------------------------------------------------------------
// Spring bones (view.ts steps + applies)
// ---------------------------------------------------------------------------

/** Register a spring chain (dreads / ponytail / cloth / chain) for a fighter. */
export function addSpringChain(
  s: GameServices,
  fighterId: number,
  joint: number,
  preset: keyof typeof SPRING_PRESETS,
  restDir: [number, number, number] = [0, -1, 0],
): SpringChain {
  const bone: SpringBone = createSpringBone(joint, restDir, SPRING_PRESETS[preset]);
  const chain: SpringChain = { bones: [bone], anchorX: 0, anchorY: 0, anchorZ: 0 };
  const list = s.springs.get(fighterId) ?? [];
  list.push(chain);
  s.springs.set(fighterId, list);
  return chain;
}

export function tickSprings(s: GameServices, dt: number): void {
  for (const chains of s.springs.values()) {
    for (const chain of chains) {
      let px = chain.anchorX, py = chain.anchorY, pz = chain.anchorZ;
      for (const bone of chain.bones) {
        // Parent movement approximated from anchor delta is applied by the
        // view when it updates anchorX/Y/Z before stepping.
        stepSpringBone(bone, dt, 0, 0, 0);
        void px; void py; void pz;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Replay helpers (mount.ts records in the pump loop)
// ---------------------------------------------------------------------------

export function recordSimInput(s: GameServices, input: FrameInput): void {
  recordFrame(s.recorder, packInput(input), input.x, input.y);
}

export function touchInput(s: GameServices): FrameInput & { counter: boolean } {
  return touchToInput(s.touch);
}

export function finishReplay(s: GameServices, result: string): Replay {
  return finishRecording(s.recorder, result);
}

export function replayJSON(s: GameServices, result: string): string {
  return serializeReplay(finishRecording(s.recorder, result));
}

// ---------------------------------------------------------------------------
// Minigame openers (mount.ts renders overlays)
// ---------------------------------------------------------------------------

export function openDarts(s: GameServices): DartsState {
  s.darts = createDarts();
  return s.darts;
}

export function openBlackjack(s: GameServices): BlackjackState {
  s.blackjack = dealBlackjack();
  return s.blackjack;
}

export function openPool(s: GameServices): PoolBall[] {
  s.pool = rackPool();
  return s.pool;
}

// ---------------------------------------------------------------------------
// Pedestrian helpers
// ---------------------------------------------------------------------------

/** Scatter peds when a fight breaks out (also scatters the bird flock). */
export function alarmPeds(s: GameServices, x: number, z: number, radius = 18): number[] {
  const screamers = pedAlarm(s.peds, x, z, radius);
  scatterFlock(s.flock);
  return screamers;
}

// ---------------------------------------------------------------------------
// Per-tick update (called from sim.step)
// ---------------------------------------------------------------------------

/**
 * Tick every service once per sim step. Pure additive logic — safe to call
 * with services attached or skipped entirely when null.
 */
export function tickSimServices(sim: Sim, input: FrameInput, dt: number): void {
  const s = sim.services;
  if (!s) return;
  const p = sim.bodies[0];

  // 1. Weather clock.
  updateWeather(s.weather, dt);

  // 2. Attention director: decay + encounter polling.
  s.attention.update(dt);
  s.encounterT -= dt;
  if (s.encounterT <= 0) {
    s.encounterT = 7;
    const enc = s.attention.pollEncounter((Math.random() * 0xffffffff) >>> 0);
    if (enc && !s.pendingEncounter) {
      s.pendingEncounter = enc;
      // Surface it on the HUD banner until the spawner consumes it.
      if (enc.kind === "enforcer") {
        sim.banner = `${enc.enforcer.name} is hunting you`;
        sim.bannerT = 2.5;
      } else if (enc.kind === "scouts") {
        sim.banner = "Combine scouts sweeping the area";
        sim.bannerT = 2;
      }
    }
  }

  // 3. "Fight started" -> attention. Yakuza-style: peds panic too.
  if (p && sim.combo > 0 && s.lastCombo === 0) {
    reportAttention(s, "publicBrawl");
    alarmPeds(s, p.x, p.z);
  }
  s.lastCombo = sim.combo;

  // 4. Quest timers + defeat tracking.
  if (s.quest && s.questProgress) {
    const res = questTick(s.quest, s.questProgress, dt);
    if (res === "failed") {
      sim.banner = "Mission failed";
      sim.bannerT = 2;
    } else if (res === "advanced" && s.questProgress.complete) {
      sim.banner = "Mission complete";
      sim.bannerT = 2.5;
    }
    let foes = 0;
    for (const b of sim.bodies) {
      if (b.kind === "grunt" && b.alive) foes++;
    }
    if (s.lastFoeCount >= 0 && foes < s.lastFoeCount) {
      questObjective(s, "defeat", { count: s.lastFoeCount - foes });
    }
    s.lastFoeCount = foes;
  }

  // 5. Pedestrians: maintain population near the player, update, cull far.
  if (p) {
    s.pedT -= dt;
    if (s.pedT <= 0) {
      s.pedT = 1;
      cullPeds(s.peds, p.x, p.z, 90);
      let want = 14;
      // Fewer peds at night / in rough districts.
      if (sunElevation(s.weather) < 0.05) want = 8;
      let guard = 0;
      while (s.peds.peds.length < want && guard++ < 6) {
        const a = Math.random() * Math.PI * 2;
        const r = 25 + Math.random() * 40;
        const ped = spawnPed(s.peds, p.x + Math.cos(a) * r, p.z + Math.sin(a) * r, (Math.random() * 1e9) | 0);
        // Give ambient peds an urban-mayhem npc brain (wander/flee).
        s.npcBrains.set(ped.id, makeNpc(`ped-${ped.id}`, { faction: "civilian" }));
      }
    }
    updatePeds(s.peds, dt);
    // NPC brains: civilians flee when the player is mid-fight nearby.
    const fighting = sim.combo > 0;
    for (const ped of s.peds.peds) {
      const brain = s.npcBrains.get(ped.id);
      if (!brain) continue;
      const d = Math.hypot(ped.x - p.x, ped.z - p.z);
      if (fighting && d < 14 && brain.brain !== "flee") {
        brain.brain = "flee";
        ped.state = "flee";
        ped.tx = ped.x + (ped.x - p.x) * 2;
        ped.tz = ped.z + (ped.z - p.z) * 2;
      } else if (!fighting && brain.brain === "flee" && ped.state === "wander") {
        brain.brain = "wander";
      }
    }
  }

  // 6. Bird flock drift.
  updateFlock(s.flock, dt);

  // 7. Parry states.
  tickCounters(s);

  // 8. Replay recording.
  recordSimInput(s, input);

  // 9. District streaming state machine (view consumes load/unload queues).
  if (p) updateStreaming(s.stream, p.x, p.z);
}
