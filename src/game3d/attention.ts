/**
 * AshLane attention system — "Kennedy's people are looking for you."
 *
 * This is NOT GTA wanted stars. There are no generic cops, no star UI,
 * no "evade the police" chase. Attention is FACTION-BASED: make noise on
 * the street and Edwin Kennedy's Corporate Structure — the Halcyon
 * Combine — starts looking for you. With NAMED enforcers, not patrol cars.
 *
 * Canon mapping (docs/BANNON_CANON_REFERENCE.md):
 *   - The Corporate Structure (Kennedy's AWE + Combs's JPCW) -> The Combine
 *   - The Halcyon Group is Kennedy's corporate front. The enforcers below
 *     are Kennedy's people wearing Halcyon badges.
 *
 * Design (owner-approved, 2026-10-05):
 *   - 0-30  (quiet):   random street thugs, Yakuza-style — visible on the
 *                        street, avoidable if you walk around them.
 *   - 30-70 (noticed): corporate scouts — Combine security, weaker
 *                        enforcers actively sweeping the district.
 *   - 70-100 (hunted): NAMED enforcers dispatched to hunt YOU specifically.
 *                        They don't patrol — they come to your district.
 *
 * Pure logic, no three.js dependency — same pattern as
 * src/game3d/federated/*. The game loop consumes encounter requests and
 * handles the actual spawning via char-gen / lieutenants.
 */

import type { ArchetypeId, FightStyle, QuirkId } from "./char-gen";

// ---------------------------------------------------------------------------
// Tiers
// ---------------------------------------------------------------------------

export const ATTENTION_MAX = 100;

export type AttentionTier = "quiet" | "noticed" | "hunted";

/** Tier for an attention value. */
export function tierFor(v: number): AttentionTier {
  if (v >= 70) return "hunted";
  if (v >= 30) return "noticed";
  return "quiet";
}

// ---------------------------------------------------------------------------
// Named enforcers — Kennedy's people. Escalation order: weakest -> Cain.
// Canon personas grounded in the Off The Top Rope books (see
// docs/BANNON_CANON_REFERENCE.md). Street frames, not wrestling gimmicks.
// ---------------------------------------------------------------------------

export interface EnforcerDef {
  /** Stable id. */
  id: "grixf" | "coldFrost" | "machineTiger" | "cain";
  /** Name used in AshLane. */
  name: string;
  /** Bannon canon name (writers' reference — never shown in-game). */
  canonName: string;
  /** One-line street title. */
  title: string;
  /** Escalation order, 0 = first dispatched. */
  tierOrder: number;
  /** Attention needed before this enforcer can be dispatched. */
  minAttention: number;
  /** Fighting style (char-gen FightStyle). */
  style: FightStyle;
  archetype: ArchetypeId;
  quirk: QuirkId;
  /** Lieutenant-style level 1-5. */
  level: number;
  /** Combine grunts riding with them. */
  backup: number;
  /** Hand-written street bio. */
  bio: string;
  /** How the game loop should play them (AI hints). */
  behavior: string;
}

export const ENFORCERS: EnforcerDef[] = [
  {
    id: "grixf",
    name: "Grixf",
    canonName: 'Grixf ("The Grief Architect" / "The Prophet")',
    title: "The Analyst",
    tierOrder: 0,
    minAttention: 70,
    style: "mma",
    archetype: "tricky",
    quirk: "true-believer",
    level: 4,
    backup: 1,
    bio: "Kennedy's true believer. An analyst who acts like a prophet — studies your fights, learns your habits, and shows up already knowing your favorite punch. Survived things that should have broken him; it made him certain.",
    behavior:
      "Patient opener: circles, reads, counters. Learns — after 30s in-fight, " +
      "prioritizes counters against the player's most-used strike. Calls backup in when hurt.",
  },
  {
    id: "coldFrost",
    name: "Cold Frost",
    canonName: 'Dr. Cold Frost ("The Technician")',
    title: "The Technician",
    tierOrder: 1,
    minAttention: 78,
    style: "martial-arts",
    archetype: "balanced",
    quirk: "by-the-book",
    level: 4,
    backup: 2,
    bio: "Halcyon's surgeon. Cold, clinical, precise — dismantles people the way other men take apart engines. Doesn't trash-talk. Doesn't hurry. Every strike lands exactly where he meant it to.",
    behavior:
      "Surgical pressure: walks you down with fundamental strikes, targets " +
      "whichever body region you've been hit in most (regional damage synergy). " +
      "Never wastes a move; punishes whiffs hard.",
  },
  {
    id: "machineTiger",
    name: "Machine Tiger",
    canonName: "Machine Tiger (Dynasty Asset)",
    title: "The Stiff",
    tierOrder: 2,
    minAttention: 85,
    style: "street",
    archetype: "bruiser",
    quirk: "counter",
    level: 5,
    backup: 2,
    bio: "A Dynasty asset on loan to Kennedy's operation. Doesn't flinch — broke a pool cue over his back once and threw the man through a merch stand. Stiff, mean, and patient enough to let you make the first mistake.",
    behavior:
      "Counter-specialist bruiser: baits attacks, punishes with heavy " +
      "counters. High poise — doesn't get staggered by light hits. Loves the " +
      "clinch; will trade to land the bigger shot.",
  },
  {
    id: "cain",
    name: "Cain",
    canonName: 'Cain Elias ("The Executioner")',
    title: "Kennedy's Final Answer",
    tierOrder: 3,
    minAttention: 92,
    style: "wrestling",
    archetype: "tank",
    quirk: "by-the-book",
    level: 5,
    backup: 0, // Comes alone. That's scarier.
    bio: "Kennedy's most trusted enforcer. Never raises his voice — doesn't need to. Cold, vindictive, surgical. Takes people apart like he's filing paperwork. When Cain shows up alone, the message is: they don't think they need anyone else.",
    behavior:
      "Apex hunter: methodical takedowns into ground control. Walks through " +
      "punches (high HP/poise). No backup — the fight is 1v1 and he likes it " +
      "that way. Defeating Cain drops district attention hard.",
  },
];

/** Enforcer def by id. */
export function enforcerById(id: EnforcerDef["id"]): EnforcerDef {
  return ENFORCERS.find((e) => e.id === id)!;
}

// ---------------------------------------------------------------------------
// District base attention — corporate-controlled areas start hotter.
// ---------------------------------------------------------------------------

/** Attention floor per district key. */
export const DISTRICT_ATTENTION_FLOOR: Record<string, number> = {
  warehouses: 15, // Combine territory — Halcyon security everywhere
  strip: 10,      // Commercial, cameras, witnesses
  alleys: 5,      // Ashes turf — eyes on the street, some corporate informants
  subway: 5,
  rooftops: 0,
  park: 0,
};

/** Which faction's thugs show up in the "quiet" tier per district. */
export const DISTRICT_THUG_FACTION: Record<string, string> = {
  strip: "unaffiliated",
  alleys: "ashes",
  warehouses: "combine",
  park: "unaffiliated",
  subway: "hollows",
  rooftops: "unaffiliated",
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type AttentionAction =
  | "publicBrawl"    // started/won a fight in public view
  | "propertyDamage" // smashed props, broke windows, wrecked a storefront
  | "combineDown"    // beat a Combine member — they take it personally
  | "enforcerDown";  // defeated a named enforcer — big statement

/** Attention gained per action (before district bias). */
export const ATTENTION_GAIN: Record<AttentionAction, number> = {
  publicBrawl: 14,
  propertyDamage: 7,
  combineDown: 18,
  enforcerDown: -25, // beating THEIR hunter is a statement — they back off... for now
};

/** District attention bias multipliers (from urban-mayhem districts.ts). */
export const DISTRICT_ATTENTION_BIAS: Record<string, number> = {
  strip: 1.0,
  alleys: 1.25,
  warehouses: 1.15,
  park: 0.7,
  subway: 1.1,
  rooftops: 0.9,
};

// ---------------------------------------------------------------------------
// Encounter requests — the game loop consumes these and spawns.
// ---------------------------------------------------------------------------

export type AttentionEncounter =
  | {
      kind: "thugs";
      district: string;
      /** Street thug count (Yakuza-style: visible, avoidable). */
      count: number;
      faction: string;
      seed: number;
      /** Player can walk around them — no forced fight. */
      avoidable: true;
    }
  | {
      kind: "scouts";
      district: string;
      /** Combine security sweeping the area. */
      count: number;
      seed: number;
      avoidable: false;
    }
  | {
      kind: "enforcer";
      district: string;
      enforcer: EnforcerDef;
      /** Combine grunt backup count. */
      backup: number;
      seed: number;
    };

export interface AttentionEvents {
  /** Fired when a district's tier changes. */
  onTierChange?: (district: string, from: AttentionTier, to: AttentionTier, value: number) => void;
  /** Fired when attention rises. */
  onAttention?: (action: AttentionAction, district: string, value: number) => void;
  /** Fired when an enforcer is dispatched. */
  onEnforcerDispatched?: (enforcer: EnforcerDef, district: string) => void;
  /** Fired when an enforcer hunt is called off (attention dropped). */
  onHuntCalledOff?: (enforcer: EnforcerDef, district: string) => void;
}

// ---------------------------------------------------------------------------
// Director
// ---------------------------------------------------------------------------

export class AttentionDirector {
  /** Per-district attention 0-100. */
  private meters: Record<string, number> = {};
  private activeDistrict = "strip";
  /** Currently dispatched enforcer (hunt in progress). */
  private activeEnforcer: EnforcerDef | null = null;
  /** Enforcer ids on cooldown (defeated recently — licking wounds). */
  private enforcerCooldowns: Record<string, number> = {};
  /** Encounter cooldowns per kind (seconds). */
  private encounterCooldown = 0;
  /** Time since last attention-raising action (seconds). */
  private quietTime = 999;
  private layingLow = false;
  private events: AttentionEvents;

  constructor(events: AttentionEvents = {}) {
    this.events = events;
    for (const d of Object.keys(DISTRICT_ATTENTION_FLOOR)) {
      this.meters[d] = DISTRICT_ATTENTION_FLOOR[d];
    }
  }

  /** Current district the player is in. */
  get district(): string {
    return this.activeDistrict;
  }

  /** Attention for a district (defaults to active). */
  attentionFor(district: string = this.activeDistrict): number {
    return this.meters[district] ?? 0;
  }

  /** Tier for a district (defaults to active). */
  tier(district: string = this.activeDistrict): AttentionTier {
    return tierFor(this.attentionFor(district));
  }

  /** The enforcer currently hunting the player, if any. */
  get hunting(): EnforcerDef | null {
    return this.activeEnforcer;
  }

  /**
   * Report an attention-raising action in the active district.
   * District bias multiplies gains — rough districts notice more.
   */
  report(action: AttentionAction, district: string = this.activeDistrict): void {
    const bias = DISTRICT_ATTENTION_BIAS[district] ?? 1;
    const before = tierFor(this.attentionFor(district));
    const next = Math.max(
      0,
      Math.min(ATTENTION_MAX, this.attentionFor(district) + ATTENTION_GAIN[action] * bias)
    );
    this.meters[district] = next;
    if (action !== "enforcerDown") this.quietTime = 0;
    this.events.onAttention?.(action, district, next);
    const after = tierFor(next);
    if (after !== before) this.events.onTierChange?.(district, before, after, next);
  }

  /**
   * Player enters a new district. Corporate can't track you perfectly —
   * other districts' attention decays (they lose the trail), and the new
   * district applies its own meter + floor.
   */
  enterDistrict(district: string): void {
    if (district === this.activeDistrict) return;
    for (const d of Object.keys(this.meters)) {
      if (d !== district) this.meters[d] = Math.max(0, this.meters[d] * 0.6);
    }
    this.meters[district] = Math.max(
      this.meters[district] ?? 0,
      DISTRICT_ATTENTION_FLOOR[district] ?? 0
    );
    this.activeDistrict = district;
    // A hunted enforcer follows you between districts — the hunt continues.
  }

  /** Player is deliberately keeping their head down (not fighting, not sprinting). */
  setLayingLow(layingLow: boolean): void {
    this.layingLow = layingLow;
  }

  /** Tick decay, cooldowns, hunt logic. Call every frame with dt seconds. */
  update(dt: number): void {
    this.quietTime += dt;
    this.encounterCooldown = Math.max(0, this.encounterCooldown - dt);
    for (const id of Object.keys(this.enforcerCooldowns)) {
      this.enforcerCooldowns[id] = Math.max(0, this.enforcerCooldowns[id] - dt);
    }

    // Passive decay: slow normally, faster when laying low.
    // Decay only kicks in after a few quiet seconds — attention should be
    // sticky enough that encounters can escalate across cooldowns.
    const rate = this.quietTime > 5 ? (this.layingLow ? 1.5 : 0.25) : 0;
    for (const d of Object.keys(this.meters)) {
      const floor = DISTRICT_ATTENTION_FLOOR[d] ?? 0;
      const before = tierFor(this.meters[d]);
      this.meters[d] = Math.max(floor, this.meters[d] - dt * rate);
      const after = tierFor(this.meters[d]);
      if (after !== before) this.events.onTierChange?.(d, before, after, this.meters[d]);
    }

    // A hunt gets called off if attention in the active district drops
    // below "noticed" — they lost you.
    if (this.activeEnforcer && this.attentionFor() < 40) {
      const e = this.activeEnforcer;
      this.activeEnforcer = null;
      this.events.onHuntCalledOff?.(e, this.activeDistrict);
    }
  }

  /**
   * Ask the director for an encounter. Returns null if nothing is due
   * (cooldowns) or if the player already has an active hunt.
   * The game loop calls this periodically and spawns via char-gen.
   */
  pollEncounter(nowSeed: number): AttentionEncounter | null {
    if (this.encounterCooldown > 0) return null;
    const district = this.activeDistrict;
    const value = this.attentionFor(district);
    const tier = tierFor(value);

    if (tier === "quiet") {
      // Yakuza-style: visible street thugs, avoidable.
      this.encounterCooldown = 45;
      return {
        kind: "thugs",
        district,
        count: 2 + (nowSeed % 2), // 2-3
        faction: DISTRICT_THUG_FACTION[district] ?? "unaffiliated",
        seed: nowSeed,
        avoidable: true,
      };
    }

    if (tier === "noticed") {
      // Corporate scouts sweeping the district.
      this.encounterCooldown = 60;
      return {
        kind: "scouts",
        district,
        count: 2 + (nowSeed % 3), // 2-4
        seed: nowSeed,
        avoidable: false,
      };
    }

    // Hunted: dispatch a named enforcer — but only one hunt at a time.
    if (this.activeEnforcer) return null;
    const enforcer = this.pickEnforcer(value);
    if (!enforcer) return null;
    this.activeEnforcer = enforcer;
    this.encounterCooldown = 90;
    this.events.onEnforcerDispatched?.(enforcer, district);
    return {
      kind: "enforcer",
      district,
      enforcer,
      backup: enforcer.backup,
      seed: nowSeed,
    };
  }

  /**
   * A named enforcer was defeated. The hunt ends, attention drops hard
   * (they back off — for now), and that enforcer won't come back soon.
   */
  reportEnforcerDefeated(id: EnforcerDef["id"]): void {
    if (this.activeEnforcer?.id === id) this.activeEnforcer = null;
    this.enforcerCooldowns[id] = 300; // 5 minutes before they try again
    this.report("enforcerDown");
  }

  /** Pick the strongest available enforcer for the current attention. */
  private pickEnforcer(value: number): EnforcerDef | null {
    const candidates = ENFORCERS.filter(
      (e) => value >= e.minAttention && (this.enforcerCooldowns[e.id] ?? 0) <= 0
    ).sort((a, b) => b.tierOrder - a.tierOrder);
    return candidates[0] ?? null;
  }

  /** Serialize for saves. */
  toJSON(): { meters: Record<string, number>; district: string } {
    return { meters: { ...this.meters }, district: this.activeDistrict };
  }

  /** Restore from a save. */
  fromJSON(data: { meters: Record<string, number>; district: string }): void {
    this.meters = { ...data.meters };
    this.activeDistrict = data.district;
    this.activeEnforcer = null;
  }

  /** Full reset (new game). */
  reset(): void {
    for (const d of Object.keys(DISTRICT_ATTENTION_FLOOR)) {
      this.meters[d] = DISTRICT_ATTENTION_FLOOR[d];
    }
    this.activeDistrict = "strip";
    this.activeEnforcer = null;
    this.enforcerCooldowns = {};
    this.encounterCooldown = 0;
    this.quietTime = 999;
  }
}
