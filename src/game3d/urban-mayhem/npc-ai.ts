/**
 * Urban Mayhem NPC AI — ported to AshLane.
 * Original: mhvnsnt/URBAN-MAYHEM- Game/src/ai.js (NPC brains, FACTIONS)
 *
 * One small finite state machine per actor with a per-frame brain budget
 * so the population scales on a phone.
 *
 * Brains: wander | flee | fight | pursue | investigate | idle
 *
 * Gun-related fields (gunSkill, magazine, ammo, gunCd, reloading) are
 * STRIPPED — no guns in AshLane. Melee skill retained.
 *
 * Factions are adapted: Urban Mayhem's region-specific factions
 * (Mook's Crew, Altair Syndicate, etc.) map to AshLane's four factions
 * (Ashes, Combine, Hollows, Unaffiliated) + civilians.
 */

export type NpcBrain = "wander" | "flee" | "fight" | "pursue" | "investigate" | "idle";

export interface FactionDef {
  name: string;
  color: number;
  hostileTo: string[];
}

export const FACTIONS: Record<string, FactionDef> = {
  civilian:     { name: "Civilians",      color: 0x9aa3ad, hostileTo: [] },
  ashes:        { name: "The Ashes",      color: 0x8a5a2f, hostileTo: ["combine", "hollows"] },
  combine:      { name: "The Combine",    color: 0x2f4f9e, hostileTo: ["ashes", "hollows", "unaffiliated"] },
  hollows:      { name: "The Hollows",    color: 0x3a3a3a, hostileTo: ["ashes", "combine", "civilian"] },
  unaffiliated: { name: "Unaffiliated",   color: 0x5a2f8a, hostileTo: ["combine"] },
  police:       { name: "Ash Lane PD",    color: 0x2f4f9e, hostileTo: ["hollows", "unaffiliated"] },
};

export const FACTION_KEYS = Object.keys(FACTIONS);

const FIRST = ["Marcus", "Dre", "Tasha", "Wes", "Iris", "Cal", "Renny", "June", "Otis", "Nadia", "Sol", "Byrd", "Kem", "Lorna", "Dax", "Vee", "Hollis", "Sable", "Ruben", "Ivy", "Mook", "Silas", "Tandy", "Ezra"];
const LAST = ["Whitacre", "Goodloe", "Tullahoma", "Beckwith", "Ridley", "Halloway", "Combs", "Vance", "Deen", "Pruitt", "Karr", "Bassett", "Oyelaran", "Meeks", "Santoro", "Ford", "Nabors", "Ilesanmi", "Crowe", "Batts", "Renfro"];

/** Generate a random NPC name. Pass a rng function returning 0-1. */
export function npcName(rng: () => number = Math.random): string {
  const f = FIRST[Math.floor(rng() * FIRST.length)];
  const l = LAST[Math.floor(rng() * LAST.length)];
  return `${f} ${l}`;
}

export interface NpcState {
  id: string;
  brain: NpcBrain;
  brainT: number;       // seconds until brain re-evaluates
  faction: string;
  alert: number;        // 0-100 awareness
  aggro: number;        // 0-1 aggression
  brave: number;        // 0-1 bravery (flee threshold)
  meleeSkill: number;   // 0-1
  style: string;        // discipline id
  hp: number;
  alive: boolean;
  // pursuit / investigation
  pursueId: string | null;
  investigateX: number;
  investigateZ: number;
  lastKnownX: number;
  lastKnownZ: number;
  lastKnownT: number;
  searchT: number;
}

/** Create a fresh NPC state. */
export function makeNpc(id: string, opts: Partial<NpcState> = {}): NpcState {
  return {
    id,
    brain: "wander",
    brainT: 0,
    faction: "civilian",
    alert: 0,
    aggro: 0,
    brave: 0.3,
    meleeSkill: 0.2,
    style: "street",
    hp: 100,
    alive: true,
    pursueId: null,
    investigateX: 0, investigateZ: 0,
    lastKnownX: 0, lastKnownZ: 0, lastKnownT: 0,
    searchT: 0,
    ...opts,
  };
}

/** Is faction A hostile to faction B? */
export function hostileTo(factionA: string, factionB: string): boolean {
  if (factionA === factionB) return false;
  const f = FACTIONS[factionA];
  if (!f) return false;
  return f.hostileTo.includes(factionB);
}

/**
 * Brain tick — call once per frame (or on a budget) per NPC.
 * Returns the brain's desired action for this tick.
 *
 * Context required from caller:
 * - distToPlayer: distance to player
 * - distToTarget: distance to pursue target (if any)
 * - seesPlayer, seesTarget: line-of-sight flags
 * - playerHeat: current heat level (for police response)
 */
export interface BrainContext {
  distToPlayer: number;
  distToTarget: number;
  seesPlayer: boolean;
  seesTarget: boolean;
  playerHeat: number;
  playerFaction: string;
}

export type BrainAction =
  | { kind: "wander" }
  | { kind: "flee"; fromX: number; fromZ: number }
  | { kind: "fight"; targetId: string }
  | { kind: "pursue"; targetId: string }
  | { kind: "investigate"; x: number; z: number }
  | { kind: "idle" };

export function tickBrain(npc: NpcState, ctx: BrainContext, dt: number): BrainAction {
  if (!npc.alive) return { kind: "idle" };
  npc.brainT -= dt;
  npc.lastKnownT = Math.max(0, npc.lastKnownT - dt);
  npc.searchT = Math.max(0, npc.searchT - dt);
  if (npc.alert > 0) npc.alert -= dt * 12; // alert decays (0-100 scale, ~8s)

  switch (npc.brain) {
    case "wander":
      // Civilians flee if player is fighting nearby and they're cowardly
      if (npc.faction === "civilian" && ctx.seesPlayer && ctx.playerHeat > 0 && npc.brave < 0.4) {
        npc.brain = "flee";
        npc.brainT = 6;
        return { kind: "flee", fromX: 0, fromZ: 0 };
      }
      // Hostile factions aggro on sight
      if (npc.aggro > 0.5 && ctx.seesPlayer && hostileTo(npc.faction, ctx.playerFaction)) {
        npc.brain = "fight";
        npc.brainT = 3;
        return { kind: "fight", targetId: "player" };
      }
      if (npc.brainT <= 0) {
        npc.brainT = 3 + Math.random() * 4;
      }
      return { kind: "wander" };

    case "flee":
      if (npc.brainT <= 0) {
        npc.brain = "wander";
        npc.brainT = 3;
        return { kind: "wander" };
      }
      return { kind: "flee", fromX: 0, fromZ: 0 };

    case "fight":
      if (!npc.pursueId) {
        npc.brain = "wander";
        return { kind: "wander" };
      }
      // Lost sight -> pursue last known
      if (!ctx.seesTarget) {
        npc.brain = "pursue";
        npc.brainT = 8;
        return { kind: "pursue", targetId: npc.pursueId };
      }
      if (npc.brainT <= 0) npc.brainT = 1.5; // re-evaluate fight decisions
      return { kind: "fight", targetId: npc.pursueId };

    case "pursue":
      if (ctx.seesTarget && ctx.distToTarget < 3) {
        npc.brain = "fight";
        npc.brainT = 3;
        return { kind: "fight", targetId: npc.pursueId! };
      }
      if (npc.brainT <= 0 || npc.searchT <= 0) {
        npc.brain = "investigate";
        npc.investigateX = npc.lastKnownX;
        npc.investigateZ = npc.lastKnownZ;
        npc.brainT = 10;
        return { kind: "investigate", x: npc.lastKnownX, z: npc.lastKnownZ };
      }
      return { kind: "pursue", targetId: npc.pursueId! };

    case "investigate":
      if (ctx.seesTarget) {
        npc.brain = "fight";
        npc.brainT = 3;
        return { kind: "fight", targetId: npc.pursueId! };
      }
      if (npc.brainT <= 0) {
        npc.brain = "wander";
        npc.brainT = 3;
        return { kind: "wander" };
      }
      return { kind: "investigate", x: npc.investigateX, z: npc.investigateZ };

    case "idle":
    default:
      if (npc.brainT <= 0) {
        npc.brain = "wander";
        npc.brainT = 3;
      }
      return { kind: "idle" };
  }
}

/** Alert an NPC to a position (heard a fight, saw something). */
export function alertNpc(npc: NpcState, x: number, z: number): void {
  npc.alert = 100;
  npc.investigateX = x;
  npc.investigateZ = z;
  if (npc.brain === "wander" || npc.brain === "idle") {
    npc.brain = "investigate";
    npc.brainT = 10;
  }
}

/** Set an NPC to fight a target. */
export function setCombatTarget(npc: NpcState, targetId: string | null): void {
  npc.pursueId = targetId;
  npc.brain = targetId ? "fight" : "wander";
  npc.brainT = targetId ? 3 : 3;
}
