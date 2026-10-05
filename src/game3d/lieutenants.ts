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
  /**
   * Visual notes for model/art reference — never shown in-game UI.
   * (e.g. "white guy, red hair, snake skin pants")
   */
  appearance?: string;
  /**
   * Hidden narrative faction — a PLOT TWIST. NEVER shown in roster, menus,
   * character select, or HUD. For writers and story scripts only.
   * (e.g. an undercover character whose true allegiance is a reveal)
   */
  secretFaction?: string;
};

export const LIEUTENANTS: LieutenantDef[] = [
  // --- STREET PERSONAS (gimmick too wrestling) ---
  {
    name: "Cain",
    canonName: 'Cain Elias ("The Executioner")',
    tier: "street",
    tierReason: 'Based on The Undertaker — but on the street he\'s a Yakuza-boss / pimp type, not a wrestler. Snake skin pants, street gear.',
    faction: "unaffiliated",
    /**
     * PLOT TWIST — never shown in-game: undercover for the Dynasty Authority
     * (police). Publicly Unaffiliated. Nobody in the narrative knows.
     */
    secretFaction: "authority",
    appearance: "White guy, red hair. Snake skin pants as everyday attire. Street gear — Yakuza-boss / pimp energy. Cold eyes, never raises his voice.",
    style: "wrestling",
    archetype: "tank",
    quirk: "by-the-book",
    seed: 0xC41E1,
    bio: "Runs the block like a Yakuza boss — snake skin pants, quiet money, colder temper. Never raises his voice; doesn't need to. Cold, vindictive, surgical. Takes people apart like he's filing paperwork. What nobody knows: he feeds the Dynasty Authority. And nobody will know — until it's too late.",
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
  // --- THE DYNASTY AUTHORITY (police faction — tier "keep": they're cops in canon too) ---
  {
    name: 'Captain Silas "The System"',
    canonName: 'Captain Silas ("The System")',
    tier: "keep",
    tierReason: "Already law enforcement in canon — Commissioner of the Dynasty Authority. Cold bureaucrat translates directly.",
    faction: "authority",
    style: "martial-arts",
    archetype: "balanced",
    quirk: "by-the-book",
    seed: 0x511A5,
    appearance: "White man, 5'11', stocky build. Slicked-back hair, thick mustache (Silas Young 'Last Real Man' look). White collar shirt with top buttons OPEN, sleeves ROLLED UP. Gun belt with holstered sidearm, dark slacks, polished boots. Badge on belt. Never raises his voice — the mustache does the intimidating.",
    bio: "The Commissioner. Runs the precinct like a data center — crime stats on wall screens, patrol routes optimized by algorithm. Treats citizens as variables. Issued a Class-A warrant once and never rescinded it. Cold, detached, patient. Reads your patterns, then punishes them.",
    level: 5,
  },
  {
    name: '"Big Dawg" Titus',
    canonName: '"Big Dawg" Titus',
    tier: "keep",
    tierReason: "Already SWAT muscle in canon. Breacher energy translates directly.",
    faction: "authority",
    style: "street",
    archetype: "bruiser",
    quirk: "brawler",
    seed: 0x71905,
    appearance: "Huge Black man, 6'6', 270 lb. Bald, sculpted powerhouse physique (Titus O'Neil). FULL RIOT GEAR — chest plate, shoulder pads, forearm and shin guards — but NO riot helmet, face visible. Black tactical base layer. 'POLICE' on chest plate. Heavy boots.",
    bio: "SWAT breacher. First through the door, last one standing. Big, loud, loves the gear — the battering ram of the Dynasty. Full riot plates but never wears the helmet. Been thrown off a roof twice. Got back up twice.",
    level: 4,
  },
  {
    name: "The Great White North",
    canonName: "The Great White North",
    tier: "keep",
    tierReason: '"Jailer" gimmick is already law-enforcement. Chains and manacles translate directly.',
    faction: "authority",
    style: "wrestling",
    archetype: "tank",
    quirk: "loyal",
    seed: 0x60717,
    appearance: "Big white man, 6'3', 267 lb. Bright RED HAIR (short/mohawk), thick RED BEARD, very pale skin, blue eyes, freckles (Sheamus 'Celtic Warrior' look). Dark blue tactical plate carrier, ballistic shield option on back. Chain wrapped around one fist. Zip-ties on belt. Quiet.",
    bio: 'The Jailer. Transport officer — decides who gets "processed" and who gets "handled on-site." Carries a chain wrapped around his fist. The chains aren\'t for show. Red hair and beard make him instantly recognizable. Quiet. Loyal to Silas to the bone.',
    level: 4,
  },
  {
    name: 'Finn "The Priest" Mac',
    canonName: 'Finn "The Priest" Mac',
    tier: "keep",
    tierReason: '"Chaplain" gimmick is already law-enforcement-adjacent. Nightstick-as-cross translates directly.',
    faction: "authority",
    style: "boxing",
    archetype: "striker",
    quirk: "confess",
    seed: 0xF1A17,
    appearance: "Irish, lean/athletic build, dark textured hair (Finn Balor / Prince Devitt). BLACK CLERICAL SHIRT with WHITE PRIEST COLLAR — not police blue. Dark tactical pants. Gun belt worn OVER the clerical shirt. Nightstick held like a crucifix. Cross patch on shoulder. The contradiction is the point.",
    bio: 'The Chaplain. Black clerical shirt, white priest collar, gun belt over the top. Swings the nightstick like a crucifix and demands confessions mid-fight: "Confess! Resistance is a sin against the Script!" Genuinely believes the badge is divine mandate. Silas sacrificed him once under Protocol Zero. He came back anyway.',
    level: 4,
  },
  {
    name: "Kiko Tanaka",
    canonName: 'Kiko "The Ghost" Tanaka',
    tier: "keep",
    tierReason: '"Detective" role is already law enforcement. Stealth specialist translates directly.',
    faction: "authority",
    style: "martial-arts",
    archetype: "speedster",
    quirk: "opportunist",
    seed: 0x7A4A0,
    appearance: "Japanese man, ~6'2', athletic. Long dark hair tied back. Subtle tactical face paint markings (Great Muta nod). DARK DETECTIVE TRENCH COAT worn open (Lei Wulong style), plainclothes underneath. Night-vision goggles pushed up on forehead. Shoulder holster. Fingerless tactical gloves. You never see him coming.",
    bio: "The Detective. Great Muta base, Lei Wulong soul — Five Animals kung fu (Dragon, Snake, Tiger, Leopard, Crane) plus drunken fist. Switches stances mid-combo like changing personalities. Signature: the Shining Wizard knee strike. The Shadow Slip makes him seem invisible. Works alone. Files reports nobody reads. By the time you see him, the Phantom Lock is already on.",
    level: 4,
  },
  {
    name: 'Astrid "The Ice Maiden"',
    canonName: 'Astrid "The Ice Maiden"',
    tier: "keep",
    tierReason: '"Warden" role is already law enforcement. Cold precision translates directly.',
    faction: "authority",
    style: "muay-thai",
    archetype: "striker",
    quirk: "counter",
    seed: 0xA5711,
    appearance: "Swedish woman, 5'7', athletic/muscular. Long BLACK HAIR pulled back severe (Rhea Ripley likeness — KEEP face). DARK NAVY TACTICAL POLICE GEAR via texture reskin on wwe_rhea_ripley_2k22 model: plate carrier with 'POLICE' marking, tactical vest, dark cargo pants, duty belt. Clinical stillness. Targets joints.",
    bio: 'The Warden. Runs the holding cells. Cold, clinical — targets joints because "a broken wrist can\'t hold a weapon." Dark navy tactical gear over the Rhea Ripley frame. Never raises her voice. The most feared officer on the force, including by other officers.',
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
