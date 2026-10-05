/**
 * Federated quest/mission data format for AshLane.
 *
 * Inspiration: OQF — Open Quest Format (Apache 2.0) — engine-agnostic quest
 * data: steps with objectives, flags, dialogue bindings, timers, factions.
 * OQF's design rule: "a loader is a few hundred lines." This is an original
 * TypeScript implementation of that shape, tuned for Urban Reign-style
 * brawler missions. Also informed by insimul's 15+ objective-type list
 * (reference only).
 *
 * Missions are DATA (JSON), not code — cf. coastal-stroll's quests.json.
 */

export type ObjectiveType =
  | "defeat"        // defeat N enemies (optionally of a faction/tag)
  | "defeat_target" // assassinate a specific enemy
  | "survive"       // survive T seconds
  | "reach"         // reach a marker
  | "talk"          // talk to an NPC (dialogue node)
  | "escort"        // keep an NPC alive until they reach a marker
  | "protect"       // keep an object/NPC above X hp for T seconds
  | "timed_defeat"  // defeat N enemies within T seconds
  | "no_kill"       // reach marker without defeating anyone (don't provoke)
  | "break"         // break N breakables
  | "weaponless"    // disarm / defeat enemies using only the environment
  | "collect";      // pick up N items

export interface Objective {
  type: ObjectiveType;
  /** human-readable, shown in HUD tracker */
  label: string;
  count?: number;
  seconds?: number;
  targetId?: string;
  marker?: { x: number; z: number };
  faction?: string;
  optional?: boolean;
}

export interface QuestStep {
  id: string;
  objectives: Objective[];
  /** dialogue node to play when the step starts */
  brief?: string;
  /** all objectives complete (AND) unless anyOf is true */
  anyOf?: boolean;
}

export interface QuestReward {
  rep?: number;
  cash?: number;
  unlockFighter?: string;
  unlockMove?: string;
  unlockVenue?: string;
  points?: number; // upgrade points (Urban Reign parallel)
}

export interface Quest {
  id: string;
  title: string;
  chapter: number;
  giver?: string;
  steps: QuestStep[];
  rewards: QuestReward;
  /** attacker cap override for this mission (swarm set-pieces) */
  maxAttackers?: number;
  timeOfDay?: number;
  weather?: string;
}

export interface QuestProgress {
  questId: string;
  stepIndex: number;
  /** objective key -> current count */
  counts: Map<string, number>;
  started: boolean;
  complete: boolean;
  failed: boolean;
}

export function startQuest(q: Quest): QuestProgress {
  return {
    questId: q.id, stepIndex: 0, counts: new Map(),
    started: true, complete: false, failed: false,
  };
}

function objKey(step: QuestStep, oi: number): string {
  return `${step.id}:${oi}`;
}

export function currentStep(q: Quest, p: QuestProgress): QuestStep | null {
  return p.stepIndex < q.steps.length ? q.steps[p.stepIndex] : null;
}

/** Report an event; returns true if it advanced the quest. */
export function questEvent(
  q: Quest, p: QuestProgress,
  type: ObjectiveType, data: { targetId?: string; faction?: string; count?: number } = {},
): boolean {
  if (!p.started || p.complete || p.failed) return false;
  const step = currentStep(q, p);
  if (!step) return false;
  let advanced = false;

  step.objectives.forEach((obj, oi) => {
    if (obj.type !== type || obj.optional) return;
    if (obj.targetId && data.targetId !== obj.targetId) return;
    if (obj.faction && data.faction !== obj.faction) return;
    const key = objKey(step, oi);
    const cur = p.counts.get(key) ?? 0;
    p.counts.set(key, cur + (data.count ?? 1));
    advanced = true;
  });

  if (advanced && stepDone(step, p)) {
    p.stepIndex++;
    if (p.stepIndex >= q.steps.length) p.complete = true;
  }
  return advanced;
}

/** Timed objectives tick; returns "failed" | "advanced" | null */
export function questTick(q: Quest, p: QuestProgress, dt: number): "failed" | "advanced" | null {
  if (!p.started || p.complete || p.failed) return null;
  const step = currentStep(q, p);
  if (!step) return null;
  for (let oi = 0; oi < step.objectives.length; oi++) {
    const obj = step.objectives[oi];
    if (obj.type !== "survive" && obj.type !== "protect" && obj.type !== "timed_defeat") continue;
    const key = objKey(step, oi);
    const cur = p.counts.get(key) ?? 0;
    if (obj.type === "timed_defeat") {
      // counts down instead of up
      const left = (obj.seconds ?? 60) - cur - dt;
      p.counts.set(key, (obj.seconds ?? 60) - left);
      if (left <= 0 && !stepDone(step, p)) {
        p.failed = true;
        return "failed";
      }
    } else {
      p.counts.set(key, cur + dt);
    }
  }
  if (stepDone(step, p)) {
    p.stepIndex++;
    if (p.stepIndex >= q.steps.length) p.complete = true;
    return "advanced";
  }
  return null;
}

function stepDone(step: QuestStep, p: QuestProgress): boolean {
  const results = step.objectives
    .filter(o => !o.optional)
    .map((o, oi) => {
      const cur = p.counts.get(objKey(step, oi)) ?? 0;
      if (o.type === "survive" || o.type === "protect") return cur >= (o.seconds ?? 30);
      if (o.type === "reach" || o.type === "talk") return cur >= 1;
      return cur >= (o.count ?? 1);
    });
  return step.anyOf ? results.some(Boolean) : results.every(Boolean);
}

/** Serialize for save files */
export function serializeProgress(p: QuestProgress): object {
  return {
    questId: p.questId, stepIndex: p.stepIndex,
    counts: [...p.counts.entries()],
    started: p.started, complete: p.complete, failed: p.failed,
  };
}
