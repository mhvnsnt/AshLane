/**
 * AshLane lieutenants — named characters with fixed seeds.
 *
 * Three persona tiers (owner, 2026-10-05 — docs/ROSTER_HIERARCHY.md):
 *  1. KEEP AS-IS — Bannon persona already works on the street (urban/music/corporate)
 *  2. STREET PERSONA — heavy wrestling gimmick gets a street name
 *  3. WRESTLING FACTION — stays a wrestler in The Circuit / Old Guard / Pit
 *
 * Each lieutenant has a FIXED seed — same person every time.
 * They're generated through the grunt pipeline but hand-tuned.
 *
 * Rule: only EXISTING canon characters. No invented book characters.
 */

import type { FactionId, FightStyle, QuirkId, ArchetypeId } from "./char-gen";

export type PersonaTier = "keep" | "street" | "wrestling";

export type LieutenantDef = {
  /** Display name in AshLane. */
  name: string;
  /** Bannon canon name (for writers' reference — never shown in-game). */
  canonName: string;
  /** Which persona tier. */
  tier: PersonaTier;
  /** Why this tier (one line for writers). */
  tierReason: string;
  faction: FactionId;
  style: FightStyle;
  archetype: ArchetypeId;
  quirk: QuirkId;
  /** Fixed seed — this person, every time. */
  seed: number;
  /** Hand-written bio (not generated). */
  bio: string;
  /** Level 1-5. Lieutenants are 3-5. */
  level: number;
};

export const LIEUTENANTS: LieutenantDef[] = [
  // --- STREET PERSONAS (gimmick too wrestling) ---
  {
    name: "Cain",
    canonName: 'Cain Elias ("The Executioner")',
    tier: "street",
    tierReason: '"The Executioner" is a wrestling gimmick — on the street he\'s just Cain, and that\'s scarier.',
    faction: "combine",
    style: "wrestling",
    archetype: "tank",
    quirk: "by-the-book",
    seed: 0xC41E1,
    bio: "Halcyon's enforcer. Never raises his voice — doesn't need to. Cold, vindictive, surgical. Takes people apart like he's filing paperwork. The Combine's most reliable weapon because he genuinely enjoys the work.",
    level: 5,
  },
  {
    name: "Cass",
    canonName: 'Cassian Thorne ("The Golden Ratio")',
    tier: "street",
    tierReason: '"Ultimate Lure" gimmick too wrestling — becomes a smooth corporate operator.',
    faction: "combine",
    style: "martial-arts",
    archetype: "tricky",
    quirk: "true-believer",
    seed: 0xCA55,
    bio: "Beautiful, untouchable, and always offering you a way out — if you just walk away from your people. Never gets his hands dirty if he can talk someone else into it. The temptation with a Halcyon badge.",
    level: 4,
  },
  {
    name: "Zero",
    canonName: 'Mr. Zero Point ("The Nihilist")',
    tier: "street",
    tierReason: "Nihilist gimmick too abstract — on the street he's a chaos agent the Hollows fear.",
    faction: "hollows",
    style: "street",
    archetype: "striker",
    quirk: "wild",
    seed: 0x2E80,
    bio: "Doesn't fight to win — fights to hurt. Laughs at the wrong moments. Unpredictable in a way that scares even the other Hollows. The Flame didn't make him like this. It just gave him permission.",
    level: 5,
  },
  {
    name: "Griff",
    canonName: 'Grixf ("The Grief Architect")',
    tier: "street",
    tierReason: '"Grief Architect" too wrestling — becomes a quiet information broker.',
    faction: "unaffiliated",
    style: "martial-arts",
    archetype: "balanced",
    quirk: "collector",
    seed: 0x681FF,
    bio: "Quiet. Analytical. Watches fights like he's reading a book he's already finished. Sells information, not loyalty. Knows things about the Flame that nobody else has figured out yet — and he's not sharing for free.",
    level: 4,
  },
  {
    name: "Shadow",
    canonName: "The Shaolin Shadow",
    tier: "street",
    tierReason: "No real name in canon — a street handle fits the discipline better than a gimmick.",
    faction: "combine",
    style: "martial-arts",
    archetype: "striker",
    quirk: "overtime",
    seed: 0x5AD0,
    bio: "Disciplined. Silent. A scalpel, not a hammer — targets limbs, ends fights in seconds, bows after. Halcyon's most expensive asset. Nobody knows what they paid him. Nobody wants to ask.",
    level: 5,
  },
  {
    name: "Toro",
    canonName: 'El Toro de Oro ("The Golden Bull")',
    tier: "street",
    tierReason: '"Golden Bull" too wrestling — "Toro" is street. Mask stays (lucha culture).',
    faction: "unaffiliated",
    style: "wrestling",
    archetype: "bruiser",
    quirk: "protects-crew",
    seed: 0x7080,
    bio: "Loyal powerhouse in the mask. If you're his people, nobody touches you — ever. Speaks little, hits hard. Runs with Fuego. The mask isn't a gimmick; it's who he is.",
    level: 4,
  },
  {
    name: "Jaleel",
    canonName: "Jaleel Friday / Trap Shinobi",
    tier: "keep",
    tierReason: "Real name already — no gimmick to strip. The goofy/tactical switch IS the personality.",
    faction: "hollows",
    style: "martial-arts",
    archetype: "tricky",
    quirk: "hollow-laugh",
    seed: 0x1A311,
    bio: "Code-switches between goofy and terrifying mid-sentence. You never know which Jaleel you're getting until the first punch lands. Tactical mind under the act — the Flame just turned the volume up.",
    level: 4,
  },
  // --- KEEP AS-IS (already urban/music) ---
  {
    name: "Akon",
    canonName: 'Akon ("The Warrior")',
    tier: "keep",
    tierReason: '"The Warrior" already works as a street name. Principled fighter needs no gimmick.',
    faction: "ashes",
    style: "boxing",
    archetype: "bruiser",
    quirk: "old-head",
    seed: 0xA140,
    bio: "Principled to a fault. Fights only for what's right — which makes him the most dangerous man on the block. Teaches the kids at Doc's gym. The Ashes' conscience with heavy hands.",
    level: 5,
  },
  {
    name: "Fuego",
    canonName: 'Rey "La Pluma" Fuego',
    tier: "keep",
    tierReason: "Lucha names are street culture, not wrestling gimmick. The mask and the joy stay.",
    faction: "unaffiliated",
    style: "lucha",
    archetype: "speedster",
    quirk: "showoff",
    seed: 0xF9360,
    bio: "Joyful high-flyer who fights like he's dancing. The only person in AshLane who seems to be having fun. Runs with Toro. Lucha isn't a gimmick to him — it's home.",
    level: 4,
  },
  {
    name: "Finesse",
    canonName: 'Narvin Jackson ("Finxsse")',
    tier: "keep",
    tierReason: "Already urban/industry. Biker-street charisma needs no translation.",
    faction: "unaffiliated",
    style: "street",
    archetype: "balanced",
    quirk: "loyal",
    seed: 0xF1E5,
    bio: "Biker-street charisma, speed and power in one package. Hates corporate sellouts with a personal passion. Fast, flashy, talks trash the entire fight — and backs it up. Loyal to his own to the bone.",
    level: 5,
  },
  {
    name: "Stick Up",
    canonName: 'Andre Curtis ("Stick Up" / "Jackboy")',
    tier: "keep",
    tierReason: "Already urban/music. Real person in canon — handle with care per owner.",
    faction: "ashes",
    style: "street",
    archetype: "speedster",
    quirk: "big-brother",
    seed: 0x511C,
    bio: "The heart. High-flying street fighter with music in his movement. Fights for the block, for the kids, for the memory. (Canon: real person — this is the regular Stick Up, NOT the cyborg variant.)",
    level: 5,
  },
];

/** Look up a lieutenant by AshLane display name. */
export function getLieutenant(name: string): LieutenantDef | undefined {
  return LIEUTENANTS.find((l) => l.name.toLowerCase() === name.toLowerCase());
}

/** All lieutenants for a faction. */
export function lieutenantsFor(faction: FactionId): LieutenantDef[] {
  return LIEUTENANTS.filter((l) => l.faction === faction);
}
