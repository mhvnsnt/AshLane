/**
 * Urban Mayhem Street Events — ported to AshLane.
 * Original: mhvnsnt/URBAN-MAYHEM- Game/src/street-events.js
 *
 * Dynamic street encounters: transient systemic events, deliberately
 * separate from authored missions. The city creates trouble even when
 * the player is not following a mission.
 *
 * Adapted: "POLICE RAID" kept (Ash Lane PD exists); factions mapped
 * to AshLane's four factions.
 */

export type StreetEventType = "ambush" | "rescue" | "raid";

export interface StreetEventDef {
  title: string;
  prompt: string;
  reward: number;
  xp: number;
  cooldown: number; // seconds
}

export const STREET_EVENT_TYPES: Record<StreetEventType, StreetEventDef> = {
  ambush: {
    title: "STREET AMBUSH",
    prompt: "A crew has boxed you in. Put them down or break line of sight.",
    reward: 280, xp: 90, cooldown: 85,
  },
  rescue: {
    title: "CIVILIAN IN DISTRESS",
    prompt: "Someone is being hunted. Get them clear, then deal with the attackers.",
    reward: 420, xp: 120, cooldown: 105,
  },
  raid: {
    title: "POLICE RAID",
    prompt: "Officers are hitting a crew nearby. Back them up or stay out of the crossfire.",
    reward: 350, xp: 110, cooldown: 125,
  },
};

export interface StreetEventSpawn {
  type: StreetEventType;
  x: number;
  z: number;
  /** NPC spawn requests: { faction, brain, aggro, targetRole } */
  enemies: Array<{ faction: string; count: number; targetRole: "player" | "victim" | "cops" }>;
  allies: Array<{ faction: string; count: number; targetRole: "enemies" }>;
  victim: boolean;
}

export interface ActiveStreetEvent {
  type: StreetEventType;
  x: number;
  z: number;
  t: number;
  enemyIds: string[];
  allyIds: string[];
  victimId: string | null;
  escaped: boolean;
}

export interface StreetEventsState {
  active: ActiveStreetEvent | null;
  cooldown: number;
}

/** Create fresh street-events state. */
export function makeStreetEvents(): StreetEventsState {
  return { active: null, cooldown: 35 };
}

export interface StreetEventContext {
  playerAlive: boolean;
  gamePaused: boolean;
  missionActive: boolean;
  careerActivity: boolean;
  heatStars: number;   // 0-5; high heat suppresses street events
  playerX: number;
  playerZ: number;
  /** Called to spawn an NPC. Returns the NPC id. */
  spawnNpc: (x: number, z: number, faction: string, brain: NpcBrainKind, aggro: number) => string;
  /** Called to resolve NPC aliveness. */
  npcAlive: (id: string) => boolean;
  /** Called on completion. */
  onComplete: (success: boolean, label: string, reward: number, xp: number) => void;
  /** UI hooks. */
  centerMsg: (title: string, prompt: string, ms: number) => void;
  toast: (msg: string, kind?: string) => void;
}

type NpcBrainKind = "wander" | "flee" | "fight" | "pursue" | "investigate" | "idle";

/**
 * Tick the street-event system. Call once per frame.
 * Returns a spawn request when a new event starts (caller spawns NPCs
 * and registers their ids via beginEvent).
 */
export function tickStreetEvents(
  s: StreetEventsState,
  ctx: StreetEventContext,
  dt: number,
  rng: () => number = Math.random
): StreetEventSpawn | null {
  if (!ctx.playerAlive || ctx.gamePaused) return null;

  if (s.active) {
    tickActive(s, ctx, dt);
    return null;
  }

  s.cooldown -= dt;
  if (s.cooldown > 0) return null;
  // Authored activities and high-intensity wanted states own the stage.
  if (ctx.missionActive || ctx.careerActivity || ctx.heatStars >= 3) {
    s.cooldown = 12;
    return null;
  }

  // A modest roll keeps encounters feeling like discoveries, not a timer.
  if (rng() > dt / 95) return null;
  const roll = rng();
  const type: StreetEventType = roll < 0.52 ? "ambush" : roll < 0.82 ? "rescue" : "raid";
  return buildSpawn(type, ctx, rng);
}

function spawnPoint(ctx: StreetEventContext, rng: () => number): { x: number; z: number } {
  for (let i = 0; i < 12; i++) {
    const a = rng() * Math.PI * 2;
    const r = 28 + rng() * 16;
    // Caller validates via world.blocked; we return the candidate.
    return { x: ctx.playerX + Math.cos(a) * r, z: ctx.playerZ + Math.sin(a) * r };
  }
  return { x: ctx.playerX + 30, z: ctx.playerZ + 4 };
}

function buildSpawn(type: StreetEventType, ctx: StreetEventContext, rng: () => number): StreetEventSpawn {
  const at = spawnPoint(ctx, rng);
  const def = STREET_EVENT_TYPES[type];
  ctx.centerMsg(def.title, def.prompt, 4200);
  ctx.toast("STREET EVENT — " + def.title);

  if (type === "raid") {
    return {
      type, x: at.x, z: at.z,
      enemies: [{ faction: "hollows", count: 3, targetRole: "cops" }],
      allies: [{ faction: "police", count: 2, targetRole: "enemies" }],
      victim: false,
    };
  }
  const count = type === "ambush" ? 3 : 2;
  return {
    type, x: at.x, z: at.z,
    enemies: [{ faction: "unaffiliated", count, targetRole: type === "ambush" ? "player" : "victim" }],
    allies: [],
    victim: type === "rescue",
  };
}

/** Register a started event's NPC ids (caller spawns from the StreetEventSpawn). */
export function beginEvent(
  s: StreetEventsState,
  type: StreetEventType, x: number, z: number,
  enemyIds: string[], allyIds: string[], victimId: string | null
): void {
  s.active = { type, x, z, t: 0, enemyIds, allyIds, victimId, escaped: false };
}

function tickActive(s: StreetEventsState, ctx: StreetEventContext, dt: number): void {
  const e = s.active!;
  e.t += dt;
  const def = STREET_EVENT_TYPES[e.type];
  const aliveEnemies = e.enemyIds.filter((id) => ctx.npcAlive(id));
  const distPlayer = Math.hypot(ctx.playerX - e.x, ctx.playerZ - e.z);

  const complete = (success: boolean, label: string) => {
    if (success) ctx.onComplete(true, label, def.reward, def.xp);
    else ctx.toast(label, "bad");
    s.active = null;
    s.cooldown = def.cooldown;
  };

  if (e.type === "ambush") {
    if (aliveEnemies.length === 0) { complete(true, "AMBUSH CLEARED"); return; }
    if (e.t > 55 || distPlayer > 175) complete(false, "THE CREW LOST YOU");
    return;
  }
  if (e.type === "raid") {
    const aliveAllies = e.allyIds.filter((id) => ctx.npcAlive(id));
    if (aliveEnemies.length === 0 && aliveAllies.length > 0) { complete(true, "RAID SECURED"); return; }
    if (aliveAllies.length === 0 || e.t > 70 || distPlayer > 185) {
      complete(false, aliveAllies.length === 0 ? "OFFICERS OVERWHELMED" : "THE RAID MOVED ON");
    }
    return;
  }
  // rescue
  const victimAlive = e.victimId ? ctx.npcAlive(e.victimId) : false;
  if (victimAlive && e.t > 8) e.escaped = true; // victim got clear (caller moves them)
  if (aliveEnemies.length === 0 && victimAlive && e.escaped) { complete(true, "CIVILIAN SAFE"); return; }
  if (!victimAlive || e.t > 65) complete(false, victimAlive ? "THE ATTACKERS GOT AWAY" : "CIVILIAN DOWN");
}
