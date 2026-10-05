/**
 * AshLane per-character movesets — Tekken / Soulcalibur / Urban Reign style.
 *
 * Every named character gets their own unique movelist with Tekken-style input
 * notation, frame data, and animation-clip bindings. Picking a different
 * character FEELS different.
 *
 * Move-structure inspiration: SchwarzerblitzEngine's FK_Move
 * (mhvnsnt/SchwarzerblitzEngine — startup/active/recovery, hitboxes,
 * throw escapes, followups, counter-attack windows).
 * Input notation: Tekken convention (see INPUT_LEGEND in docs/MOVESETS.md).
 *
 * Clip bindings reference real assets:
 *   - bank.json keys (50 clips: boxing, chokeslam, german, suplex, ddt, ...)
 *   - UAL clips (Punch_Jab, Punch_Cross, Melee_Hook, Hit_Chest, ...)
 * Clips that don't exist yet are marked TODO_CLIP and fall back to the
 * nearest bank.json clip at runtime (see resolveClip()).
 */

export type MoveCategory = "strike" | "grapple" | "special" | "finisher";

export interface CharacterMove {
  /** Display name, e.g. "Snake Eyes". */
  name: string;
  /** Tekken notation, e.g. "f+2", "d/f+1,2", "1+2", "WR+3". */
  input: string;
  /** Animation clip: bank.json key or UAL clip name. */
  clip: string;
  category: MoveCategory;
  /** Raw damage (before archetype multipliers). */
  damage: number;
  /** Frames before the hitbox is live. */
  startup: number;
  /** Frames the hitbox stays live. */
  active: number;
  /** Frames before you can act again. */
  recovery: number;
  /** Hit range in metres. */
  range: number;
  /** Hitstun frames dealt on hit. */
  hitstun: number;
  /** e.g. "launcher", "knockdown", "unblockable", "counter-hit", "armor", "low", "high", "wall-splat", "stance". */
  properties: string[];
  /** One-line flavor / usage note. */
  description: string;
}

export interface CharacterMoveset {
  /** Lieutenant/boss display name (matches lieutenants.ts / roster). */
  character: string;
  /** FightStyle from char-gen.ts. */
  style: string;
  /** ArchetypeId from char-gen.ts. */
  archetype: string;
  /** 10-15 unique moves. */
  moves: CharacterMove[];
  /** 1-2 signature finishers. */
  finishers: CharacterMove[];
}

/** Compact move constructor — keeps the big tables readable. */
const mv = (
  name: string,
  input: string,
  clip: string,
  category: MoveCategory,
  damage: number,
  startup: number,
  active: number,
  recovery: number,
  range: number,
  hitstun: number,
  properties: string[],
  description: string,
): CharacterMove => ({
  name, input, clip, category, damage, startup, active, recovery,
  range, hitstun, properties, description,
});

/**
 * Fallback map: if a named clip isn't in bank.json/UAL yet, the runtime
 * should substitute the fallback instead of T-posing.
 */
export const CLIP_FALLBACKS: Record<string, string> = {
  TODO_CLIP_STRIKE: "boxing",
  TODO_CLIP_KICK: "dropkick",
  TODO_CLIP_GRAPPLE: "suplex",
  TODO_CLIP_SPECIAL: "corkscrew",
};

/** Resolve a clip name to a guaranteed-existing clip. */
export function resolveClip(clip: string): string {
  return CLIP_FALLBACKS[clip] ?? clip;
}

export const MOVESETS: Record<string, CharacterMoveset> = {
  // =====================================================================
  // LIEUTENANTS
  // =====================================================================

  "Cain": {
    character: "Cain",
    style: "wrestling",
    archetype: "tank",
    moves: [
      mv("Paperwork Jab", "1", "jabcross", "strike", 7, 7, 3, 11, 1.6, 13, ["mid"], "Cold, efficient jab. Files you away."),
      mv("Silent Cross", "2", "boxing", "strike", 10, 10, 3, 15, 1.7, 15, ["mid"], "No wind-up, no warning."),
      mv("Snake Skin Clothesline", "f+2", "boxing3", "strike", 16, 14, 4, 22, 1.9, 24, ["knockdown"], "Running lariat energy, standing still."),
      mv("Yakuza Kick", "f+4", "dropkick", "strike", 15, 15, 4, 20, 2.1, 20, ["mid"], "Stiff kick to the ribs."),
      mv("Red Hair Uppercut", "d/f+2", "boxing2", "strike", 17, 15, 4, 25, 1.5, 28, ["launcher"], "Launches. He never raises his voice, the fist does."),
      mv("Snake Eyes", "WS+2", "suplex", "grapple", 20, 16, 4, 26, 1.3, 30, ["unblockable", "knockdown"], "Face-first into the knee. Surgical."),
      mv("Chokeslam", "d+1+2", "chokeslam", "grapple", 26, 20, 5, 32, 1.4, 0, ["unblockable", "knockdown"], "One hand. Lift. Drop. Paperwork done."),
      mv("German Suplex", "b+1+2", "german", "grapple", 24, 18, 5, 30, 1.3, 0, ["unblockable", "knockdown", "wall-splat"], "Bridging german, releases at the top."),
      mv("Undertaker Sit-Up", "d+3+4", "rise", "special", 0, 30, 0, 40, 0, 0, ["armor", "stance"], "Rises from knockdown with full armor. The dead don't stay down."),
      mv("Old School Walk", "f+1+2", "evade", "special", 12, 12, 3, 18, 1.5, 16, ["high", "counter-hit"], "Walks the ropes of the street — arm across the throat."),
      mv("Last Ride", "qcf+2", "suplex", "grapple", 28, 22, 5, 34, 1.4, 0, ["unblockable", "knockdown"], "Elevated powerbomb. The ride ends here."),
    ],
    finishers: [
      mv("The Final Verdict", "1+2 (Rage)", "suplex", "finisher", 45, 18, 6, 40, 1.5, 0, ["unblockable", "knockdown", "cinematic"], "Tombstone piledriver. Canon finisher. The gavel falls."),
    ],
  },

  "Cass": {
    character: "Cass",
    style: "martial-arts",
    archetype: "tricky",
    moves: [
      mv("Golden Jab", "1", "Punch_Jab", "strike", 6, 6, 3, 10, 1.6, 12, ["mid"], "Beautiful and fast. Never gets his hands dirty — almost."),
      mv("Lure Cross", "1,2", "Punch_Cross", "strike", 9, 9, 3, 14, 1.7, 14, ["mid"], "The second hit comes with a smile."),
      mv("Walk Away Hook", "b+1", "Melee_Hook", "strike", 12, 11, 4, 17, 1.6, 17, ["counter-hit"], "Steps back, hooks you for leaving."),
      mv("Temptation Kick", "3", "dropkick", "strike", 11, 12, 4, 18, 2.0, 15, ["mid"], "Long legs, longer promises."),
      mv("Ultimate Lure", "d+1+2", "esquiva", "special", 0, 10, 0, 20, 0, 0, ["stance", "evade"], "Sways under your attack. Offers you a way out — take it and eat the counter."),
      mv("Fine Print", "WS+1", "elbow", "strike", 10, 8, 3, 13, 1.3, 14, ["mid", "counter-hit"], "Elbow you didn't read about."),
      mv("Hostile Takeover", "f+1+2", "takedown", "grapple", 18, 16, 4, 26, 1.2, 0, ["unblockable", "knockdown"], "Acquires your company. And your spine."),
      mv("Poison Pill", "d/f+2", "knee", "strike", 14, 12, 3, 18, 1.4, 22, ["launcher"], "Knee that launches the merger."),
      mv("Golden Parachute", "b+3+4", "evade", "special", 0, 8, 0, 16, 0, 0, ["evade", "stance"], "Exits the situation entirely. Cowardice as technique."),
      mv("Boardroom Slam", "d/b+1+2", "ddt", "grapple", 22, 17, 5, 28, 1.3, 0, ["unblockable", "knockdown"], "DDT. The deal is closed."),
    ],
    finishers: [
      mv("The Golden Ratio", "1+2 (Rage)", "brainbuster", "finisher", 42, 20, 5, 38, 1.4, 0, ["unblockable", "knockdown", "cinematic"], "Perfectly proportioned destruction. Brainbuster from the heavens."),
    ],
  },

  "Zero": {
    character: "Zero",
    style: "street",
    archetype: "striker",
    moves: [
      mv("Wrong Moment Laugh", "1", "slugger", "strike", 8, 8, 4, 14, 1.6, 14, ["mid"], "Swings while laughing. It throws your timing off."),
      mv("Nihilist Hook", "2", "boxing3", "strike", 13, 13, 4, 19, 1.7, 19, ["mid", "counter-hit"], "Doesn't care if it lands. It lands."),
      mv("Hurt First", "f+1", "slugger", "strike", 20, 20, 5, 28, 1.8, 30, ["knockdown", "armor"], "Slow, armored, devastating. He wants to trade."),
      mv("Void Kick", "4", "dropkick", "strike", 14, 16, 4, 21, 2.0, 18, ["mid"], "Kicks like the floor insulted him."),
      mv("Entropy Stomp", "d+4", "dropkick", "strike", 12, 14, 4, 20, 1.5, 0, ["low", "knockdown"], "Stomps whatever's down there."),
      mv("Chaos Theory", "d/f+1+2", "feral", "special", 0, 12, 0, 24, 0, 0, ["stance", "wild"], "Unpredictable sway stance. Nothing he does next makes sense."),
      mv("Zero Point", "1+2", "takedown", "grapple", 16, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "Tackles you into nothing."),
      mv("Scream Therapy", "d+1+2", "hit", "special", 10, 10, 3, 20, 2.5, 25, ["mid", "armor"], "Screams and swings. The scream is the armor."),
      mv("Bad Decision", "WR+2", "corkscrew", "strike", 18, 16, 5, 24, 1.9, 26, ["knockdown", "counter-hit"], "Running spinning backfist. Terrible idea. Works anyway."),
      mv("Nothing Matters", "b+1+2", "ddt", "grapple", 21, 17, 5, 28, 1.3, 0, ["unblockable", "knockdown"], "DDT delivered with total apathy."),
    ],
    finishers: [
      mv("The Null Set", "1+2 (Rage)", "brainbuster", "finisher", 44, 22, 6, 36, 1.5, 0, ["unblockable", "knockdown", "cinematic"], "Everything you are, deleted. Brainbuster into the void."),
    ],
  },

  "Griff": {
    character: "Griff",
    style: "martial-arts",
    archetype: "balanced",
    moves: [
      mv("Read Jab", "1", "Punch_Jab", "strike", 6, 6, 3, 10, 1.6, 12, ["mid"], "He's read this book. The jab is page one."),
      mv("Annotation", "1,2", "Punch_Cross", "strike", 9, 9, 3, 13, 1.7, 14, ["mid"], "Margin notes, in fist form."),
      mv("Grief Counter", "b+1", "Melee_Hook_Rec", "strike", 14, 8, 4, 16, 1.6, 20, ["counter-hit"], "Only works when you attack first. Which you will."),
      mv("Architect's Kick", "3", "dropkick", "strike", 10, 10, 4, 16, 2.0, 14, ["low"], "Low kick, placed like a foundation stone."),
      mv("Information Broker", "d+1+2", "evade", "special", 0, 9, 0, 18, 0, 0, ["evade", "stance"], "Sidesteps and studies. Knowledge is leverage."),
      mv("Quiet Takedown", "f+1+2", "takedown", "grapple", 17, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "No wasted motion. You're down before you notice."),
      mv("Footnote Elbow", "WS+1", "elbow", "strike", 9, 8, 3, 12, 1.3, 13, ["mid"], "Small, precise, devastating in context."),
      mv("Chapter Break", "d/f+2", "boxing2", "strike", 15, 13, 4, 22, 1.5, 26, ["launcher"], "Uppercut that starts a new section."),
      mv("Peer Review", "b+2", "boxing2", "strike", 12, 11, 3, 17, 1.7, 17, ["mid", "counter-hit"], "Critiques your guard. Harshly."),
      mv("Redacted", "d/b+1+2", "suplex", "grapple", 23, 18, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "Suplex. The record is sealed."),
    ],
    finishers: [
      mv("The Grief Architecture", "1+2 (Rage)", "chokeslam", "finisher", 43, 19, 6, 36, 1.5, 0, ["unblockable", "knockdown", "cinematic"], "A structure of pain, built to spec. Chokeslam from the blueprints."),
    ],
  },

  "Shadow": {
    character: "Shadow",
    style: "martial-arts",
    archetype: "striker",
    moves: [
      mv("Scalpel Jab", "1", "Punch_Jab", "strike", 6, 5, 3, 9, 1.6, 11, ["mid"], "Fastest jab in the Combine. A scalpel, not a hammer."),
      mv("Limb Seeker", "1,2", "jabcross", "strike", 9, 8, 3, 12, 1.7, 14, ["mid"], "Targets the lead arm. You won't need it."),
      mv("Iron Palm", "f+2", "boxing2", "strike", 15, 12, 4, 20, 1.5, 24, ["mid", "counter-hit"], "Open-hand strike. Canon Shaolin technique."),
      mv("Silent Kick", "3", "dropkick", "strike", 10, 9, 4, 15, 2.0, 14, ["low"], "You hear it after it lands."),
      mv("Discipline Stance", "d+1+2", "stancecrouch", "special", 0, 8, 0, 16, 0, 0, ["stance", "evade"], "Drops low. Breathes. Waits."),
      mv("Nerve Strike", "WS+1", "elbow", "strike", 8, 7, 3, 11, 1.3, 18, ["mid", "counter-hit"], "Elbow to the nerve cluster. Your arm forgets its job."),
      mv("Joint Lock", "f+1+2", "takedown", "grapple", 18, 14, 4, 22, 1.2, 0, ["unblockable", "knockdown"], "Takes the arm, then the fight."),
      mv("Bow", "b+1+2", "evade", "special", 0, 10, 0, 18, 0, 0, ["evade"], "Bows after the exchange. Respect, then ruin."),
      mv("Pressure Point", "d/f+1", "bodyblow", "strike", 11, 9, 3, 14, 1.4, 16, ["mid"], "Body shot that steals your breath."),
      mv("Executioner Palm", "d/f+2", "boxing2", "strike", 16, 13, 4, 22, 1.5, 28, ["launcher"], "Rising palm. Launches the unworthy."),
    ],
    finishers: [
      mv("The Iron Verdict", "1+2 (Rage)", "suplex", "finisher", 44, 17, 6, 34, 1.4, 0, ["unblockable", "knockdown", "cinematic"], "One palm. Total shutdown. The most expensive asset collects."),
    ],
  },

  "Toro": {
    character: "Toro",
    style: "wrestling",
    archetype: "bruiser",
    moves: [
      mv("Bull Jab", "1", "boxing", "strike", 8, 8, 3, 12, 1.6, 14, ["mid"], "Heavy jab. The mask doesn't move."),
      mv("Horn Hook", "2", "boxing3", "strike", 14, 13, 4, 19, 1.7, 20, ["mid"], "Hook like a horn to the temple."),
      mv("El Cuerno Dorado", "f,f+2", "slugger", "strike", 22, 18, 5, 28, 2.2, 32, ["knockdown", "armor"], "Running spear. Canon signature. Nobody touches his people."),
      mv("Pampas Spinebuster", "f+1+2", "suplex", "grapple", 24, 17, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "El Cierre de las Pampas. Spine first."),
      mv("Golden Bull Charge", "WR+2", "takedown", "strike", 20, 16, 5, 26, 2.0, 28, ["knockdown", "armor"], "Shoulder charge. The wall loses."),
      mv("Lucha Libre Kick", "4", "dropkick", "strike", 13, 14, 4, 19, 2.0, 17, ["mid"], "Stiff dropkick, lucha precision."),
      mv("Mask of Loyalty", "d+1+2", "guardhigh", "special", 0, 8, 0, 16, 0, 0, ["armor", "stance"], "Tightens the mask. Takes the hit for the crew."),
      mv("Toro Toss", "b+1+2", "backdrop", "grapple", 25, 19, 5, 32, 1.4, 0, ["unblockable", "knockdown", "wall-splat"], "Backdrop driver. The horns go up, you go over."),
      mv("Estocada Strike", "d/f+1", "knee", "strike", 12, 11, 3, 16, 1.4, 16, ["mid"], "Knee like a matador's blade."),
      mv("La Lucha Vive", "d+3+4", "rise", "special", 0, 24, 0, 36, 0, 0, ["armor"], "Rises for the people. The mask is who he is."),
    ],
    finishers: [
      mv("El Grito de la Bestia", "1+2 (Rage)", "suplex", "finisher", 46, 19, 6, 38, 1.5, 0, ["unblockable", "knockdown", "cinematic"], "Sit-out powerbomb. Canon finisher. The Cry of the Beast."),
      mv("La Estocada Final", "d/b+1+2 (Rage)", "takedown", "finisher", 40, 16, 5, 34, 1.3, 0, ["unblockable", "submission"], "Sharpshooter. The Final Thrust — tap or snap."),
    ],
  },

  "Jaleel": {
    character: "Jaleel",
    style: "martial-arts",
    archetype: "tricky",
    moves: [
      mv("Sitcom Slap", "1", "boxing", "strike", 7, 7, 3, 11, 1.6, 13, ["mid"], "Goofy open-hand slap. Which Jaleel is this?"),
      mv("Trap Cross", "1,2", "jabcross", "strike", 10, 9, 3, 14, 1.7, 15, ["mid"], "The goof drops mid-string. The cross is all business."),
      mv("Vibrating Laugh", "d+1+2", "feral", "special", 0, 10, 0, 20, 0, 0, ["stance", "evade"], "Exaggerated shaking laugh. You're watching the wrong thing."),
      mv("Shadow Dagger", "f+2", "tiger", "strike", 14, 11, 3, 17, 1.5, 20, ["mid", "counter-hit"], "Slashing strike — tendons, not throats. Tactical."),
      mv("Sitcom Cancelled", "b+1+2", "evade", "special", 0, 8, 0, 16, 0, 0, ["evade"], "\"Did I do that? No. WE did that.\" Vanishes from your combo."),
      mv("High-Water Kick", "4", "dropkick", "strike", 13, 14, 4, 19, 2.0, 17, ["mid"], "Stiff kick from the goofy stance. The pants are high-water. The kick is not."),
      mv("Tactical Takedown", "f+1+2", "takedown", "grapple", 17, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "Deep-cover operative takes you down like a playbook."),
      mv("Glitch Variant", "d/f+2", "corkscrew", "strike", 16, 14, 5, 24, 1.8, 26, ["launcher", "counter-hit"], "Spinning strike that shouldn't work. The legendary Glitch Variant."),
      mv("Suspenders Snap", "WS+1", "elbow", "strike", 9, 8, 3, 12, 1.3, 14, ["mid"], "Rising elbow. The suspenders snap back. So does your head."),
      mv("Deep Cover DDT", "d/b+1+2", "ddt", "grapple", 22, 17, 5, 28, 1.3, 0, ["unblockable", "knockdown"], "The operative was here all along. DDT."),
    ],
    finishers: [
      mv("Welcome to the Trap", "1+2 (Rage)", "brainbuster", "finisher", 43, 19, 6, 36, 1.4, 0, ["unblockable", "knockdown", "cinematic"], "The sitcom is cancelled. Brainbuster through the laugh track."),
    ],
  },

  "Akon": {
    character: "Akon",
    style: "boxing",
    archetype: "bruiser",
    moves: [
      mv("Principle Jab", "1", "Punch_Jab", "strike", 7, 6, 3, 10, 1.7, 13, ["mid"], "Textbook jab. He teaches this to the kids at Doc's."),
      mv("Honor Cross", "1,2", "Punch_Cross", "strike", 11, 9, 3, 14, 1.8, 16, ["mid"], "Straight right with everything behind it except anger."),
      mv("Warrior Hook", "f+1", "Melee_Hook", "strike", 15, 12, 4, 19, 1.7, 22, ["mid", "counter-hit"], "Hook thrown for what's right. Hits harder for it."),
      mv("Philosophy Uppercut", "d/f+2", "boxing2", "strike", 18, 14, 4, 24, 1.6, 30, ["launcher"], "The Philosophy Instructor's thesis statement. Launches."),
      mv("Discus Setup", "b+2", "corkscrew", "strike", 13, 13, 4, 20, 1.8, 18, ["mid"], "Spinning setup. The Lion's Roar is coming."),
      mv("Savage Body Shot", "d+1", "bodyblow", "strike", 12, 10, 3, 15, 1.5, 16, ["mid"], "Rips the body. Savage Striker fundamentals."),
      mv("Man of Honor", "d+1+2", "guardhigh", "special", 0, 8, 0, 16, 0, 0, ["armor", "stance"], "Takes your best shot on the guard. For principle."),
      mv("Power Straight", "f+2", "boxing1", "strike", 14, 11, 3, 18, 1.9, 20, ["mid", "knockdown"], "Straight right with bad intentions and good reasons."),
      mv("Gym Wisdom", "WS+2", "boxing3", "strike", 13, 12, 4, 18, 1.6, 18, ["mid", "counter-hit"], "Rising hook. Lesson three from Doc's gym."),
      mv("Warrior's Clinch", "f+1+2", "takedown", "grapple", 16, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "Ties you up, breaks you down. Ethical."),
    ],
    finishers: [
      mv("The Lion's Roar", "1+2 (Rage)", "slugger", "finisher", 46, 20, 6, 38, 2.2, 0, ["knockdown", "wall-splat", "cinematic"], "Running discus clothesline. Canon finisher. The gym goes silent."),
    ],
  },

  "Fuego": {
    character: "Fuego",
    style: "lucha",
    archetype: "speedster",
    moves: [
      mv("Pluma Jab", "1", "Punch_Jab", "strike", 5, 5, 3, 9, 1.6, 11, ["mid"], "Fast, joyful, barely hurts. The setup for everything."),
      mv("Fire Feather Cross", "1,2", "Punch_Cross", "strike", 8, 8, 3, 12, 1.7, 13, ["mid"], "One-two, dancing the whole time."),
      mv("619 Setup", "b+3", "esquiva", "special", 0, 9, 0, 16, 0, 0, ["evade", "stance"], "Slides through the ropes of the street. El Grito del Fuego is loading."),
      mv("Springboard Kick", "WR+4", "crossjump", "strike", 14, 15, 4, 22, 2.0, 20, ["mid", "knockdown"], "Bounces off the wall. Joyful. Devastating."),
      mv("Tijera Takedown", "f+1+2", "hurricane", "grapple", 18, 14, 5, 26, 1.4, 0, ["unblockable", "knockdown"], "La Tijera Mortale — headscissors into the pin."),
      mv("Grito Crossbody", "u+2", "bigjump", "strike", 16, 16, 5, 24, 1.8, 24, ["knockdown"], "Springboard crossbody. El Grito del Fuego."),
      mv("Dancing Evade", "d+3+4", "ginga", "special", 0, 8, 0, 14, 0, 0, ["evade", "stance"], "Ginga flow. He's having fun. You're not."),
      mv("Flecha Senton", "f,f+4", "corkscrew", "strike", 17, 17, 5, 26, 2.0, 26, ["knockdown"], "La Flecha Enmascarada — elevated diving senton."),
      mv("Alegria Kick", "3", "dropkick", "strike", 10, 11, 4, 17, 2.0, 14, ["mid"], "Happy kick. Still a kick."),
      mv("Showman's Roll", "d/b+3+4", "Roll", "special", 0, 10, 0, 18, 0, 0, ["evade"], "Rolls through. The crowd — there is no crowd — goes wild."),
    ],
    finishers: [
      mv("El Beso del Sol", "1+2 (Rage)", "bigjump", "finisher", 44, 22, 6, 40, 2.2, 0, ["knockdown", "cinematic"], "Springboard 450 splash. Canon finisher. The Kiss of the Sun."),
    ],
  },

  "Finesse": {
    character: "Finesse",
    style: "street",
    archetype: "balanced",
    moves: [
      mv("Biker Jab", "1", "jabcross", "strike", 7, 7, 3, 11, 1.6, 13, ["mid"], "Fast jab, trash talk included free."),
      mv("Highway Cross", "1,2", "boxing", "strike", 10, 9, 3, 14, 1.7, 15, ["mid"], "One-two at highway speed."),
      mv("Chrome Hook", "f+1", "boxing3", "strike", 14, 12, 4, 19, 1.7, 21, ["mid", "counter-hit"], "Hook with chrome on it. Flashy and heavy."),
      mv("Sellout Slap", "b+1", "slugger", "strike", 12, 11, 4, 17, 1.6, 17, ["high", "counter-hit"], "Backhand for corporate sellouts. Personal."),
      mv("Wheelie Kick", "4", "dropkick", "strike", 13, 14, 4, 20, 2.0, 17, ["mid"], "Kick like popping a wheelie. Stylish. Rude."),
      mv("Loyalty Check", "f+1+2", "takedown", "grapple", 17, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "Takes you down to check your loyalty. You failed."),
      mv("Trash Talk", "d+1+2", "feral", "special", 0, 10, 0, 20, 2.5, 0, ["taunt"], "Taunts the entire fight. Backs it up. Every time."),
      mv("Speed Trap", "WR+1", "corkscrew", "strike", 16, 14, 4, 22, 1.9, 24, ["knockdown"], "Running spinning strike. Speed and power, one package."),
      mv("Biker's Elbow", "WS+1", "elbow", "strike", 9, 8, 3, 12, 1.3, 14, ["mid"], "Rising elbow. The helmet stays on."),
      mv("Full Throttle DDT", "d/b+1+2", "ddt", "grapple", 22, 17, 5, 28, 1.3, 0, ["unblockable", "knockdown"], "DDT at full throttle."),
    ],
    finishers: [
      mv("The Sendoff", "1+2 (Rage)", "suplex", "finisher", 43, 19, 6, 36, 1.5, 0, ["unblockable", "knockdown", "cinematic"], "Sends you off the highway. Suplex into the asphalt."),
    ],
  },

  "Stick Up": {
    character: "Stick Up",
    style: "street",
    archetype: "speedster",
    moves: [
      mv("Jackboy Jab", "1", "Punch_Jab", "strike", 6, 5, 3, 9, 1.6, 12, ["mid"], "Fast hands, music in the movement."),
      mv("Enigmatic Cross", "1,2", "Punch_Cross", "strike", 9, 8, 3, 13, 1.7, 14, ["mid"], "You can't read him. The cross reads you."),
      mv("Flamboyant Hook", "f+1", "Melee_Hook", "strike", 13, 11, 4, 18, 1.7, 20, ["mid", "counter-hit"], "Flashy hook. The flamboyance is the point."),
      mv("Block Anthem", "3", "dropkick", "strike", 10, 10, 4, 16, 2.0, 14, ["low"], "Low kick with a beat."),
      mv("Swanton Setup", "u+4", "bigjump", "strike", 15, 16, 5, 24, 1.9, 24, ["knockdown"], "Climbs the wall. The Swanton is coming."),
      mv("450 Setup", "b+4", "corkscrew", "strike", 14, 15, 5, 24, 1.9, 22, ["knockdown", "counter-hit"], "Spinning setup for the 450. Hardy/Sabu energy."),
      mv("Heart of the Block", "d+1+2", "rise", "special", 0, 24, 0, 36, 0, 0, ["armor"], "Rises for the block, for the kids, for the memory."),
      mv("Stickup Takedown", "f+1+2", "hurricane", "grapple", 17, 14, 5, 24, 1.4, 0, ["unblockable", "knockdown"], "Hurricanrana. This is a stickup."),
      mv("Cypher Kick", "WR+3", "dropkick", "strike", 14, 14, 4, 20, 2.0, 18, ["mid"], "Running kick. The cypher keeps spinning."),
      mv("For the Memory", "d/f+2", "boxing2", "strike", 15, 13, 4, 22, 1.5, 26, ["launcher"], "Uppercut for everyone he's lost. Launches."),
    ],
    finishers: [
      mv("Twisted Faith", "1+2 (Rage)", "bigjump", "finisher", 45, 21, 6, 40, 2.2, 0, ["knockdown", "cinematic"], "Canon finisher. Swanton Bomb variant — faith, twisted, from the top."),
    ],
  },

  "Captain Silas \"The System\"": {
    character: "Captain Silas \"The System\"",
    style: "martial-arts",
    archetype: "balanced",
    moves: [
      mv("Variable Jab", "1", "Punch_Jab", "strike", 6, 6, 3, 10, 1.6, 12, ["mid"], "You are variable #4,096. The jab is processing."),
      mv("Data Cross", "1,2", "Punch_Cross", "strike", 9, 9, 3, 13, 1.7, 14, ["mid"], "Cross-referenced with your last three fights."),
      mv("Protocol Strike", "f+2", "boxing2", "strike", 14, 12, 4, 19, 1.7, 21, ["mid", "counter-hit"], "Executed per Protocol 7-C."),
      mv("Class-A Warrant", "f+1+2", "takedown", "grapple", 18, 16, 4, 26, 1.2, 0, ["unblockable", "knockdown"], "You are hereby served. Takedown."),
      mv("Bureaucrat's Kick", "3", "dropkick", "strike", 11, 12, 4, 18, 2.0, 15, ["mid"], "Filed in triplicate."),
      mv("Pattern Recognition", "b+1", "Melee_Hook_Rec", "strike", 13, 8, 4, 15, 1.6, 19, ["counter-hit"], "He's read your patterns. Punishes them."),
      mv("Mustache of Authority", "d+1+2", "guardhigh", "special", 0, 8, 0, 16, 0, 0, ["armor", "stance"], "The mustache does the intimidating. Armor up."),
      mv("Open Collar Elbow", "WS+1", "elbow", "strike", 9, 8, 3, 12, 1.3, 14, ["mid"], "Sleeves rolled up. Elbow out."),
      mv("Detention Hold", "d/b+1+2", "suplex", "grapple", 22, 18, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "You are detained. Indefinitely."),
      mv("System Override", "d/f+2", "boxing2", "strike", 15, 13, 4, 22, 1.5, 26, ["launcher"], "Override authorized. Launching variable."),
    ],
    finishers: [
      mv("Protocol Zero", "1+2 (Rage)", "chokeslam", "finisher", 44, 19, 6, 36, 1.5, 0, ["unblockable", "knockdown", "cinematic"], "Canon protocol. Sacrifices everything — including his own men — to delete you."),
    ],
  },

  "\"Big Dawg\" Titus": {
    character: "\"Big Dawg\" Titus",
    style: "street",
    archetype: "bruiser",
    moves: [
      mv("Riot Jab", "1", "boxing", "strike", 9, 8, 3, 13, 1.7, 15, ["mid"], "Jab in full riot plates. Still fast."),
      mv("Breacher Cross", "f+2", "boxing1", "strike", 15, 12, 4, 20, 1.8, 22, ["mid", "knockdown"], "First through the door. The door loses."),
      mv("Big Dawg Slam", "f+1+2", "suplex", "grapple", 26, 18, 5, 32, 1.4, 0, ["unblockable", "knockdown", "wall-splat"], "Picks you up in riot gear. Puts you through the wall."),
      mv("SWAT Shoulder", "WR+2", "takedown", "strike", 22, 17, 5, 28, 2.0, 30, ["knockdown", "armor"], "Running shoulder tackle. The battering ram."),
      mv("Riot Shield Bash", "b+1+2", "block", "strike", 16, 14, 4, 22, 1.5, 24, ["mid", "knockdown"], "Shield to the face. Standard procedure."),
      mv("No Helmet Headbutt", "d/f+1", "bodyblow", "strike", 14, 10, 3, 18, 1.2, 22, ["high", "counter-hit"], "No riot helmet — the head is the weapon."),
      mv("Crowd Control", "d+1+2", "slugger", "strike", 18, 16, 5, 26, 2.2, 28, ["knockdown"], "Wide swing. Controls the crowd. Literally."),
      mv("Big Boot Justice", "f+4", "dropkick", "strike", 17, 15, 4, 22, 2.1, 24, ["mid", "knockdown"], "Size-16 boot. Justice is served."),
      mv("Second Roof", "d+3+4", "rise", "special", 0, 26, 0, 38, 0, 0, ["armor"], "Thrown off a roof twice. Got up twice. Armor on rise."),
      mv("Dawg Pound", "d/b+1+2", "german", "grapple", 24, 19, 5, 32, 1.3, 0, ["unblockable", "knockdown"], "German suplex. Welcome to the pound."),
    ],
    finishers: [
      mv("The Breach", "1+2 (Rage)", "chokeslam", "finisher", 47, 20, 6, 40, 1.6, 0, ["unblockable", "knockdown", "cinematic"], "Full riot breach, solo. Chokeslam through the door you were hiding behind."),
    ],
  },

  "The Great White North": {
    character: "The Great White North",
    style: "wrestling",
    archetype: "tank",
    moves: [
      mv("Jailer Jab", "1", "boxing", "strike", 8, 8, 3, 12, 1.6, 14, ["mid"], "Quiet jab. The red beard doesn't move."),
      mv("Chain Fist", "f+1", "boxing3", "strike", 16, 13, 4, 21, 1.7, 24, ["mid", "counter-hit"], "Chain wrapped around the fist. The chains aren't for show."),
      mv("Brogue Kick", "f+4", "dropkick", "strike", 20, 16, 4, 24, 2.2, 30, ["high", "knockdown", "counter-hit"], "Canon Sheamus signature. The Brogue Kick ends arguments."),
      mv("Celtic Slam", "f+1+2", "suplex", "grapple", 25, 18, 5, 32, 1.4, 0, ["unblockable", "knockdown"], "Picks you up like luggage."),
      mv("Manacle Lock", "d/b+1+2", "takedown", "grapple", 20, 16, 5, 28, 1.3, 0, ["unblockable", "submission"], "Zip-ties the wrist, then the shoulder. Processing."),
      mv("Pale Warrior Knee", "d/f+1", "knee", "strike", 13, 11, 3, 17, 1.4, 18, ["mid"], "Knee to the gut. Very pale. Very heavy."),
      mv("Transport Duty", "b+1+2", "backdrop", "grapple", 24, 19, 5, 32, 1.4, 0, ["unblockable", "knockdown", "wall-splat"], "Decides you're getting 'handled on-site.' Backdrop."),
      mv("Northern Quiet", "d+1+2", "guardhigh", "special", 0, 8, 0, 16, 0, 0, ["armor", "stance"], "Says nothing. Takes the hit. The quiet is worse."),
      mv("Cloverleaf Setup", "WS+2", "boxing2", "strike", 14, 12, 4, 19, 1.6, 20, ["mid"], "Sets up the legs. You know what's coming."),
      mv("White Noise", "WR+2", "slugger", "strike", 19, 17, 5, 26, 2.0, 28, ["knockdown"], "Running lariat. All you hear after is white noise."),
    ],
    finishers: [
      mv("The Processing", "1+2 (Rage)", "german", "finisher", 45, 19, 6, 38, 1.4, 0, ["unblockable", "knockdown", "cinematic"], "You have been processed. German suplex into the concrete."),
    ],
  },

  "Finn \"The Priest\" Mac": {
    character: "Finn \"The Priest\" Mac",
    style: "boxing",
    archetype: "striker",
    moves: [
      mv("Confession Jab", "1", "Punch_Jab", "strike", 7, 6, 3, 10, 1.6, 12, ["mid"], "\"Confess!\" The jab demands it."),
      mv("Scripture Cross", "1,2", "Punch_Cross", "strike", 10, 9, 3, 14, 1.7, 15, ["mid"], "The good book, in two parts."),
      mv("Crucifix Nightstick", "f+2", "boxing1", "strike", 15, 12, 4, 20, 1.8, 22, ["mid", "knockdown"], "Nightstick swung like a crucifix. The contradiction is the point."),
      mv("Holy War Hook", "b+1", "Melee_Hook", "strike", 13, 11, 4, 18, 1.6, 19, ["counter-hit"], "Dueling messianic delirium, hook form."),
      mv("Sermon Kick", "3", "dropkick", "strike", 12, 13, 4, 19, 2.0, 16, ["mid"], "Preaches with the foot."),
      mv("Absolution", "d+1+2", "evade", "special", 0, 9, 0, 18, 0, 0, ["evade"], "Absolves himself of your combo. Sidesteps."),
      mv("Choir Elbow", "WS+1", "elbow", "strike", 9, 8, 3, 12, 1.3, 14, ["mid"], "Rising elbow. The choir sings."),
      mv("Divine Mandate", "f+1+2", "takedown", "grapple", 17, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "The badge is divine mandate. Takedown is scripture."),
      mv("Bullet Blessing", "d/f+1", "bodyblow", "strike", 11, 10, 3, 15, 1.5, 16, ["mid"], "Body shot. Blessed. Still hurts."),
      mv("Resurrection", "d+3+4", "kip", "special", 0, 22, 0, 34, 0, 0, ["armor"], "Sacrificed under Protocol Zero. Came back anyway. Kip-up with armor."),
    ],
    finishers: [
      mv("The Confession", "1+2 (Rage)", "brainbuster", "finisher", 44, 20, 6, 36, 1.4, 0, ["unblockable", "knockdown", "cinematic"], "Twisting brainbuster. Canon finisher. Confess — resistance is a sin against the Script."),
    ],
  },

  "Kiko Tanaka": {
    character: "Kiko Tanaka",
    style: "martial-arts",
    archetype: "speedster",
    moves: [
      mv("Ghost Jab", "1", "Punch_Jab", "strike", 5, 5, 3, 9, 1.6, 11, ["mid"], "You never see him coming. The jab is already gone."),
      mv("Dragon Stance Strike", "d+1+2~1", "boxing", "special", 10, 9, 3, 14, 1.7, 15, ["mid", "stance"], "Five Animals: DRAGON. Flowing strike from the stance shift."),
      mv("Snake Stance Pierce", "d+1+2~2", "jabcross", "special", 9, 8, 3, 13, 1.8, 14, ["mid", "stance", "counter-hit"], "Five Animals: SNAKE. Piercing fingers to the throat."),
      mv("Tiger Stance Claw", "d+1+2~3", "slugger", "special", 14, 12, 4, 19, 1.6, 20, ["mid", "stance"], "Five Animals: TIGER. Raking claw strike."),
      mv("Leopard Stance Fist", "d+1+2~4", "boxing2", "special", 12, 10, 3, 16, 1.6, 17, ["mid", "stance"], "Five Animals: LEOPARD. Half-fist to the temple."),
      mv("Crane Stance Kick", "d+1+2~5", "dropkick", "special", 13, 12, 4, 18, 2.0, 17, ["high", "stance"], "Five Animals: CRANE. Elegant, lethal kick."),
      mv("Drunken Slip", "b+3+4", "drunkwalk", "special", 0, 8, 0, 16, 0, 0, ["evade", "stance"], "Drunken fist sway. The Shadow Slip — seems invisible."),
      mv("Muta Mist Feint", "f+3+4", "evade", "special", 0, 10, 0, 18, 0, 0, ["evade"], "Great Muta nod — the feint blinds you without the mist."),
      mv("Detective's Knee", "f+2", "knee", "strike", 13, 11, 3, 17, 1.5, 20, ["mid", "counter-hit"], "Knee strike. Case closed."),
      mv("Phantom Lock Setup", "f+1+2", "takedown", "grapple", 16, 14, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "By the time you see him, the lock is already on."),
    ],
    finishers: [
      mv("Shining Wizard", "1+2 (Rage)", "knee", "finisher", 42, 16, 5, 34, 1.6, 0, ["unblockable", "knockdown", "cinematic"], "Canon Muta signature. Running knee to the skull. The wizard shines."),
    ],
  },

  "Astrid \"The Ice Maiden\"": {
    character: "Astrid \"The Ice Maiden\"",
    style: "muay-thai",
    archetype: "striker",
    moves: [
      mv("Clinical Jab", "1", "Punch_Jab", "strike", 6, 6, 3, 10, 1.6, 12, ["mid"], "No emotion. Just placement."),
      mv("Joint Seeker", "1,2", "Punch_Cross", "strike", 9, 9, 3, 13, 1.7, 14, ["mid"], "Targets the wrist. \"A broken wrist can't hold a weapon.\""),
      mv("Warden's Elbow", "f+1", "elbow", "strike", 10, 8, 3, 13, 1.3, 15, ["mid", "counter-hit"], "Muay Thai elbow, clinical precision."),
      mv("Ice Teep", "f+3", "dropkick", "strike", 11, 11, 4, 17, 2.0, 15, ["mid"], "Teep to create distance. Cold, efficient."),
      mv("Scandinavian Knee", "d/f+2", "knee", "strike", 14, 12, 3, 18, 1.4, 22, ["launcher"], "Knee that launches. The North remembers."),
      mv("Holding Cell", "f+1+2", "takedown", "grapple", 17, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "Takes you down like processing an inmate."),
      mv("Cold Read", "b+1", "Melee_Hook_Rec", "strike", 13, 8, 4, 15, 1.6, 19, ["counter-hit"], "Reads your attack. Punishes the joint, not the man."),
      mv("Frost Roundhouse", "4", "dropkick", "strike", 15, 15, 4, 21, 2.2, 20, ["high"], "High roundhouse. Other officers fear her — including this kick."),
      mv("Stillness", "d+1+2", "guardhigh", "special", 0, 8, 0, 16, 0, 0, ["armor", "stance"], "Clinical stillness. Never raises her voice. Armor up."),
      mv("Wrist Breaker", "d/b+1+2", "suplex", "grapple", 21, 17, 5, 28, 1.3, 0, ["unblockable", "submission"], "Suplex into the wrist lock setup. Tap or snap."),
    ],
    finishers: [
      mv("The Scandinavian Lock", "1+2 (Rage)", "takedown", "finisher", 40, 16, 5, 34, 1.3, 0, ["unblockable", "submission", "cinematic"], "Sharpshooter. Canon finisher. The most feared officer on the force."),
    ],
  },

  // =====================================================================
  // BOSSES
  // =====================================================================

  "Ash Lane": {
    character: "Ash Lane",
    style: "street",
    archetype: "balanced",
    moves: [
      mv("Lane Jab", "1", "Punch_Jab", "strike", 6, 6, 3, 10, 1.6, 12, ["mid"], "The protagonist's jab. Clean, honest, fast."),
      mv("Block Cross", "1,2", "Punch_Cross", "strike", 9, 9, 3, 14, 1.7, 14, ["mid"], "For the block. Every time."),
      mv("Ash Uppercut", "d/f+2", "boxing2", "strike", 16, 14, 4, 23, 1.5, 28, ["launcher"], "Rising uppercut. The block remembers — so does the fist."),
      mv("Street Hook", "f+1", "Melee_Hook", "strike", 13, 12, 4, 18, 1.7, 20, ["mid", "counter-hit"], "Hook learned in the alleys, perfected in the war."),
      mv("Lane Kick", "4", "dropkick", "strike", 12, 13, 4, 19, 2.0, 16, ["mid"], "Stiff kick. Nothing fancy. Everything effective."),
      mv("Ash Guard", "d+1+2", "guardhigh", "special", 0, 8, 0, 16, 0, 0, ["armor", "stance"], "The power within stirs. Guard hardens. Never named, never spoken."),
      mv("Homecoming Slam", "f+1+2", "suplex", "grapple", 22, 17, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "Suplex for everyone who doubted the Lane name."),
      mv("Mara's Memory", "b+1+2", "evade", "special", 0, 9, 0, 18, 0, 0, ["evade"], "Sidesteps for his sister. She's why he fights."),
      mv("Turf War Takedown", "d/b+1+2", "takedown", "grapple", 17, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "Takes the turf back, one body at a time."),
      mv("Last Fighter", "d+3+4", "rise", "special", 0, 24, 0, 36, 0, 0, ["armor"], "The Lane family's last fighter rises. Armor on wakeup."),
      mv("Uncomputable", "WR+2", "corkscrew", "strike", 17, 15, 5, 24, 1.9, 26, ["knockdown", "counter-hit"], "Life Path uncomputable. So is the spinning backfist."),
    ],
    finishers: [
      mv("The Block Remembers", "1+2 (Rage)", "suplex", "finisher", 45, 19, 6, 38, 1.5, 0, ["unblockable", "knockdown", "cinematic"], "His mantra, made flesh. Powerbomb through the pavement."),
      mv("Lane Eruption", "d/f+1+2 (Rage)", "corkscrew", "finisher", 48, 24, 6, 42, 2.5, 0, ["knockdown", "wall-splat", "cinematic"], "The power within, unleashed. Never named. Never spoken."),
    ],
  },

  "Doc": {
    character: "Doc",
    style: "wrestling",
    archetype: "tank",
    moves: [
      mv("Anchor Jab", "1", "boxing", "strike", 8, 8, 3, 12, 1.6, 14, ["mid"], "The gym owner's jab. Thrown ten thousand times."),
      mv("Moral Center Cross", "1,2", "jabcross", "strike", 11, 10, 3, 15, 1.7, 16, ["mid"], "Straight, honest, immovable."),
      mv("Counter Clinic", "b+1", "Melee_Hook_Rec", "strike", 14, 8, 4, 15, 1.6, 20, ["counter-hit"], "Atlas-style counter wrestling. Your mistake, his lesson."),
      mv("Strong Base Slam", "f+1+2", "suplex", "grapple", 24, 17, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "Unmovable base. You're going over."),
      mv("Gym Wisdom Kick", "3", "dropkick", "strike", 12, 13, 4, 19, 2.0, 16, ["mid"], "Old-school kick. Fundamentals win fights."),
      mv("The Anchor Drops", "d+1+2", "guardhigh", "special", 0, 8, 0, 16, 0, 0, ["armor", "stance"], "Drops the anchor. Immovable. Try moving him."),
      mv("Submission Lesson", "d/b+1+2", "takedown", "grapple", 19, 16, 5, 28, 1.3, 0, ["unblockable", "submission"], "Teaches the hold. You learn or you tap."),
      mv("Overtime", "WS+2", "boxing3", "strike", 14, 12, 4, 19, 1.6, 20, ["mid", "counter-hit"], "Stays late. Outlasts everyone. Rising hook."),
      mv("Corner Wisdom", "b+1+2", "backdrop", "grapple", 23, 18, 5, 30, 1.4, 0, ["unblockable", "knockdown", "wall-splat"], "Backdrop in the corner. Lesson over."),
      mv("Heavy Bag Hands", "f+2", "boxing1", "strike", 15, 12, 4, 20, 1.8, 22, ["mid", "knockdown"], "Hands conditioned on the heavy bag for decades."),
    ],
    finishers: [
      mv("The Anchor's Hold", "1+2 (Rage)", "takedown", "finisher", 42, 18, 5, 36, 1.3, 0, ["unblockable", "submission", "cinematic"], "The hold that ends arguments. Atlas would be proud. Tap or sleep."),
    ],
  },

  "Director Cole Vane": {
    character: "Director Cole Vane",
    style: "martial-arts",
    archetype: "tricky",
    moves: [
      mv("Corporate Jab", "1", "Punch_Jab", "strike", 6, 6, 3, 10, 1.6, 12, ["mid"], "Expensive jab. Tailored."),
      mv("Hostile Cross", "1,2", "Punch_Cross", "strike", 9, 9, 3, 13, 1.7, 14, ["mid"], "The takeover, in two parts."),
      mv("Golden Parachute", "b+3+4", "evade", "special", 0, 8, 0, 16, 0, 0, ["evade"], "Exits. Always lands soft. Always lands rich."),
      mv("Insider Trading", "b+1", "Melee_Hook_Rec", "strike", 14, 8, 4, 15, 1.6, 20, ["counter-hit"], "Knew your attack was coming. Profited from it."),
      mv("Downsizing", "d+1", "bodyblow", "strike", 11, 10, 3, 15, 1.5, 16, ["mid"], "Cuts the fat. You're the fat."),
      mv("Pink Slip", "f+1+2", "takedown", "grapple", 17, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "You're fired. From consciousness."),
      mv("Boardroom Kick", "4", "dropkick", "strike", 12, 13, 4, 19, 2.0, 16, ["mid"], "Kicks like signing a merger."),
      mv("Dirty Money", "d/f+1", "elbow", "strike", 10, 8, 3, 13, 1.3, 15, ["mid", "counter-hit"], "Elbow with something sharp on it. Allegedly."),
      mv("Leveraged Buyout", "d/b+1+2", "suplex", "grapple", 22, 17, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "Acquires your company. Liquidates your spine."),
      mv("Executive Privilege", "d+1+2", "guardhigh", "special", 0, 8, 0, 16, 0, 0, ["armor"], "Rules don't apply. Armor up."),
    ],
    finishers: [
      mv("The Termination", "1+2 (Rage)", "brainbuster", "finisher", 44, 20, 6, 38, 1.4, 0, ["unblockable", "knockdown", "cinematic"], "Your position has been eliminated. Brainbuster off the org chart."),
    ],
  },

  "Sombra Negra": {
    character: "Sombra Negra",
    style: "lucha",
    archetype: "speedster",
    moves: [
      mv("Mercenary Jab", "1", "Punch_Jab", "strike", 6, 5, 3, 9, 1.6, 11, ["mid"], "Calculated. Every jab is invoiced."),
      mv("Calculated Cross", "1,2", "Punch_Cross", "strike", 9, 8, 3, 13, 1.7, 14, ["mid"], "The math checks out. So does the fist."),
      mv("Sombra Kick", "3", "dropkick", "strike", 11, 11, 4, 17, 2.0, 15, ["mid"], "Lucha kick, mercenary precision."),
      mv("Black Hair Whip", "b+1", "esquiva", "special", 0, 9, 0, 16, 0, 0, ["evade"], "The long black hair whips as she slips your attack."),
      mv("Contract Killer", "f+1+2", "hurricane", "grapple", 19, 15, 5, 26, 1.4, 0, ["unblockable", "knockdown"], "Hurricanrana. The contract is fulfilled."),
      mv("Bodysuit Slam", "d/b+1+2", "suplex", "grapple", 22, 17, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "Suplex in the black bodysuit. The white ribs flash."),
      mv("Skull Grin", "d+1+2", "feral", "special", 0, 10, 0, 20, 2.5, 0, ["taunt"], "The skull facepaint grins. That's never good."),
      mv("Ribcage Knee", "d/f+1", "knee", "strike", 12, 11, 3, 16, 1.4, 18, ["mid"], "Knee to the sternum. The painted ribs approve."),
      mv("Mercenary's Rise", "d+3+4", "kip", "special", 0, 22, 0, 34, 0, 0, ["armor"], "Kip-up. The job isn't done."),
      mv("Lucha Precision", "WR+4", "corkscrew", "strike", 15, 15, 5, 24, 1.9, 22, ["knockdown"], "Running corkscrew. Calculated to the centimeter."),
    ],
    finishers: [
      mv("La Trampa de Plata", "1+2 (Rage)", "takedown", "finisher", 43, 18, 5, 36, 1.3, 0, ["unblockable", "submission", "cinematic"], "The Silver Trap. Canon finisher. You're caught — the only question is how long."),
    ],
  },

  "Onyx": {
    character: "Onyx",
    style: "wrestling",
    archetype: "tricky",
    moves: [
      mv("Unlit Jab", "1", "Punch_Jab", "strike", 6, 6, 3, 10, 1.6, 12, ["mid"], "The Flame can't touch her. The jab can touch you."),
      mv("Hex Cross", "1,2", "Punch_Cross", "strike", 9, 9, 3, 13, 1.7, 14, ["mid"], "Obsidian hex, two parts."),
      mv("Denial Grapple", "f+1+2", "takedown", "grapple", 18, 15, 4, 26, 1.2, 0, ["unblockable", "knockdown"], "Denies your entire gameplan. Then denies your consciousness."),
      mv("Uncomputable Path", "d+1+2", "evade", "special", 0, 8, 0, 16, 0, 0, ["evade", "stance"], "Life Path uncomputable. Your reads compute to nothing."),
      mv("Obsidian Elbow", "WS+1", "elbow", "strike", 9, 8, 3, 12, 1.3, 14, ["mid", "counter-hit"], "Rising elbow. Black, sharp, final."),
      mv("Earth-Crosser Slam", "d/b+1+2", "suplex", "grapple", 23, 18, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "She's walked between Earths. You'll walk into the mat."),
      mv("Chola's Kick", "4", "dropkick", "strike", 12, 13, 4, 19, 2.0, 16, ["mid"], "White facepaint, spiked leather, stiff kick."),
      mv("Talk Down", "b+1+2", "guardhigh", "special", 0, 10, 0, 20, 0, 0, ["armor"], "Unlit people can talk burners down. She armors through your rage."),
      mv("Stable Leader", "f+2", "boxing2", "strike", 14, 12, 4, 19, 1.7, 21, ["mid", "counter-hit"], "Leads Cipher, Echo, Hollow, Static, Theory. Hits like all of them."),
      mv("Vacancy Setup", "d/f+2", "boxing2", "strike", 15, 13, 4, 22, 1.5, 26, ["launcher"], "Uppercut that empties the room. And your future."),
    ],
    finishers: [
      mv("The Vacancy", "1+2 (Rage)", "chokeslam", "finisher", 46, 20, 6, 38, 1.5, 0, ["unblockable", "knockdown", "cinematic"], "Canon finisher. What's left of you when she's done: vacant."),
    ],
  },

  "Hollow": {
    character: "Hollow",
    style: "wrestling",
    archetype: "striker",
    moves: [
      mv("Stiff Jab", "1", "boxing", "strike", 8, 7, 3, 12, 1.6, 14, ["mid"], "Super Dragon stiff. The jab is a weapon."),
      mv("Masked Cross", "1,2", "jabcross", "strike", 11, 10, 3, 15, 1.7, 16, ["mid"], "The mask never changes expression. Your face does."),
      mv("Dragon Kick", "f+4", "dropkick", "strike", 16, 14, 4, 22, 2.1, 24, ["mid", "knockdown"], "Stiff kick. Super Dragon lineage."),
      mv("Silent Submission", "f+1+2", "takedown", "grapple", 19, 15, 5, 28, 1.3, 0, ["unblockable", "submission"], "Silent submission specialist. You tap or you nap."),
      mv("Swarm Leader", "d+1+2", "feral", "special", 0, 10, 0, 20, 2.5, 0, ["taunt"], "Calls the swarm. The Hollows answer."),
      mv("Burned-Out Slam", "d/b+1+2", "suplex", "grapple", 24, 18, 5, 32, 1.3, 0, ["unblockable", "knockdown", "wall-splat"], "The Flame burned everything out except the violence."),
      mv("Zero Life Path", "b+1+2", "evade", "special", 0, 8, 0, 16, 0, 0, ["evade"], "Life Path = 0. Impossible. Unreadable. Ungrabbable."),
      mv("Recruiter's Hook", "f+1", "boxing3", "strike", 14, 12, 4, 19, 1.7, 21, ["mid"], "Onyx's recruiter. The hook is the interview."),
      mv("Hollow Point", "d/f+1", "bodyblow", "strike", 12, 10, 3, 15, 1.5, 18, ["mid", "counter-hit"], "Body shot to the hollow place."),
      mv("Sudden Silence", "WS+2", "elbow", "strike", 13, 9, 3, 16, 1.4, 20, ["mid", "counter-hit"], "Rising elbow from nowhere. Then silence."),
    ],
    finishers: [
      mv("The Unheard", "1+2 (Rage)", "chokeslam", "finisher", 45, 17, 6, 36, 1.4, 0, ["unblockable", "knockdown", "cinematic"], "Sudden guillotine. Canon finisher. You never heard it coming."),
    ],
  },

  "Rook": {
    character: "Rook",
    style: "street",
    archetype: "speedster",
    moves: [
      mv("Runner's Jab", "1", "Punch_Jab", "strike", 5, 5, 3, 9, 1.6, 11, ["mid"], "Fast as a rumor. The teen runner's hands."),
      mv("Alley Cross", "1,2", "jabcross", "strike", 8, 8, 3, 12, 1.7, 13, ["mid"], "Learned in the alleys, not the gym."),
      mv("Parkour Kick", "WR+3", "dropkick", "strike", 13, 13, 4, 19, 2.0, 17, ["mid"], "Kicks off the wall. The \"?\" kid delivers."),
      mv("Scrappy Hook", "f+1", "boxing", "strike", 11, 11, 4, 17, 1.6, 17, ["mid", "counter-hit"], "Scrappy, not technical. Effective anyway."),
      mv("Side-Chain Slip", "d+1+2", "evade", "special", 0, 7, 0, 14, 0, 0, ["evade"], "Slips away like a side quest. You'll see him again."),
      mv("Courier's Knee", "d/f+1", "knee", "strike", 10, 10, 3, 15, 1.4, 15, ["mid"], "Knee while running past. Delivery complete."),
      mv("Rook Takes Pawn", "f+1+2", "takedown", "grapple", 15, 14, 4, 22, 1.2, 0, ["unblockable", "knockdown"], "Chess joke. Takedown punchline."),
      mv("Fire Escape", "b+3+4", "Roll", "special", 0, 9, 0, 16, 0, 0, ["evade"], "Rolls out. The fire escape is always an option."),
      mv("Message Received", "WS+1", "elbow", "strike", 8, 7, 3, 11, 1.3, 13, ["mid"], "Rising elbow. The message is: run."),
      mv("Gutter Uppercut", "d/f+2", "boxing2", "strike", 14, 13, 4, 21, 1.5, 24, ["launcher"], "Uppercut from the gutter. Launches."),
    ],
    finishers: [
      mv("Checkmate", "1+2 (Rage)", "corkscrew", "finisher", 40, 18, 6, 34, 1.9, 0, ["knockdown", "cinematic"], "The teen ends the game. Spinning strike — checkmate."),
    ],
  },

  "Edwin Kennedy": {
    character: "Edwin Kennedy",
    style: "wrestling",
    archetype: "bruiser",
    moves: [
      mv("Shareholder Jab", "1", "boxing", "strike", 8, 8, 3, 12, 1.6, 14, ["mid"], "Jab backed by majority shares."),
      mv("Hostile Cross", "1,2", "jabcross", "strike", 11, 10, 3, 15, 1.7, 16, ["mid"], "The hostile takeover, punch form."),
      mv("Micromanage", "b+1", "Melee_Hook_Rec", "strike", 14, 8, 4, 15, 1.6, 20, ["counter-hit"], "Manages your every move. Punishes the unmanaged ones."),
      mv("Legacy Slam", "f+1+2", "suplex", "grapple", 25, 18, 5, 32, 1.4, 0, ["unblockable", "knockdown", "wall-splat"], "His legacy is the weapon. Suplex."),
      mv("Greek Tragedy", "d+1+2", "feral", "special", 0, 12, 0, 24, 0, 0, ["taunt", "armor"], "Views his own collapse as Greek tragedy. Monologues. Armored."),
      mv("Paralyzed Perfectionist", "d/b+1+2", "german", "grapple", 24, 19, 5, 32, 1.3, 0, ["unblockable", "knockdown"], "Obsession made physical. German suplex, perfectly executed."),
      mv("Boardroom Boot", "f+4", "dropkick", "strike", 16, 15, 4, 23, 2.1, 24, ["mid", "knockdown"], "The boot behind every decision."),
      mv("Kayfabe Breaker", "d/f+2", "boxing2", "strike", 17, 14, 4, 24, 1.6, 28, ["launcher"], "Breaks the fourth wall and your jaw. Launches."),
      mv("Indefinite Hold", "d+3+4", "guardhigh", "special", 0, 8, 0, 16, 0, 0, ["armor", "stance"], "Holds the position. Indefinitely. That's the point."),
      mv("Tyrant's Elbow", "WS+1", "elbow", "strike", 11, 9, 3, 14, 1.3, 17, ["mid"], "The tyranny of LP 33/6, elbow form."),
    ],
    finishers: [
      mv("The Indefinite Suspension", "1+2 (Rage)", "chokeslam", "finisher", 47, 20, 6, 40, 1.5, 0, ["unblockable", "knockdown", "cinematic"], "Canon corporate finisher. You're suspended — from consciousness. Indefinitely."),
    ],
  },

  "Stan Combs": {
    character: "Stan Combs",
    style: "martial-arts",
    archetype: "tricky",
    moves: [
      mv("Predator's Jab", "1", "Punch_Jab", "strike", 6, 6, 3, 10, 1.6, 12, ["mid"], "Patient. Watching. The jab is just the lens focusing."),
      mv("Honey Trap", "1,2", "Punch_Cross", "strike", 9, 9, 3, 13, 1.7, 14, ["mid"], "\"Honey\" Combs. Sweet until the teeth."),
      mv("Prison Letter", "b+1", "Melee_Hook_Rec", "strike", 13, 8, 4, 15, 1.6, 19, ["counter-hit"], "Written from ADX Florence. Every word is a counter."),
      mv("Gravity Wins", "d/f+2", "boxing2", "strike", 16, 13, 4, 23, 1.5, 28, ["launcher"], "Doing pushups, waiting for gravity to win. It wins."),
      mv("RICO Kick", "3", "dropkick", "strike", 12, 13, 4, 19, 2.0, 16, ["mid"], "Money laundering, kick form."),
      mv("Mirror Monologue", "d+1+2", "evade", "special", 0, 9, 0, 18, 0, 0, ["evade"], "Talks to the mirror. The mirror dodges for him."),
      mv("Interim Director", "f+1+2", "takedown", "grapple", 18, 15, 4, 26, 1.2, 0, ["unblockable", "knockdown"], "Seizes power mid-fight. Interim, permanently."),
      mv("Puppet Emperor", "d/b+1+2", "suplex", "grapple", 22, 17, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "Installs you as the puppet. Then drops you."),
      mv("Slow Burn", "b+3+4", "stancecrouch", "special", 0, 10, 0, 20, 0, 0, ["stance", "armor"], "Slow-burn presence. Crouches. Waits. Burns."),
      mv("Towel Throw", "d+3+4", "block", "special", 0, 8, 0, 16, 0, 0, ["armor"], "Throws in YOUR towel. Ends your fight, not his."),
    ],
    finishers: [
      mv("The Overlord's Due", "1+2 (Rage)", "brainbuster", "finisher", 45, 20, 6, 38, 1.4, 0, ["unblockable", "knockdown", "cinematic"], "The true power behind everything collects. Brainbuster. Gravity always wins."),
    ],
  },
};

/* =====================================================================
 * LOOKUP HELPERS
 * ===================================================================== */

/** Get a character's full moveset by display name (matches lieutenants.ts). */
export function movesFor(name: string): CharacterMoveset | undefined {
  const key = Object.keys(MOVESETS).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  return key ? MOVESETS[key] : undefined;
}

/** Get a character's finishers. */
export function finishersFor(name: string): CharacterMove[] {
  return movesFor(name)?.finishers ?? [];
}

/** Filter a character's moves by category. */
export function movesByCategory(name: string, category: MoveCategory): CharacterMove[] {
  return movesFor(name)?.moves.filter((m) => m.category === category) ?? [];
}

/** All characters with movesets. */
export function rosterWithMovesets(): string[] {
  return Object.keys(MOVESETS);
}

/* =====================================================================
 * INPUT LEGEND (Tekken notation, adapted for AshLane's 3D brawler)
 * ===================================================================== */

export const INPUT_LEGEND: Record<string, string> = {
  "1": "Left punch",
  "2": "Right punch",
  "3": "Left kick",
  "4": "Right kick",
  "f": "Forward (toward opponent)",
  "b": "Back (away from opponent)",
  "d": "Down",
  "u": "Up",
  "d/f": "Down-forward (crouch dash)",
  "d/b": "Down-back",
  "1,2": "Press 1 then 2 in sequence (natural string)",
  "f+2": "Forward + right punch together",
  "1+2": "Both punches (grapple/throw attempt)",
  "3+4": "Both kicks",
  "WR": "While running",
  "WS": "While rising (from crouch/knockdown)",
  "FC": "Full crouch",
  "CH": "Counter-hit property (bonus on interrupt)",
  "BT": "Back-turned",
  "Rage": "Finisher — only usable when health is critical",
};

/* =====================================================================
 * FACTION GRUNT MOVESETS
 * Generated grunts share these per-faction pools (with per-grunt variation
 * via char-gen.ts archetype multipliers). Lieutenants/bosses above override
 * with their unique lists.
 * ===================================================================== */

export interface FactionMoveset {
  faction: string;
  /** Core shared moves every grunt of this faction knows. */
  core: CharacterMove[];
  /** Signature finisher available to high-level grunts. */
  finisher: CharacterMove;
}

export const FACTION_MOVESETS: Record<string, FactionMoveset> = {
  "ashes": {
    faction: "ashes",
    core: [
      mv("Neighborhood Jab", "1", "Punch_Jab", "strike", 6, 6, 3, 10, 1.6, 12, ["mid"], "Block fundamentals."),
      mv("Corner Hook", "2", "boxing3", "strike", 12, 12, 4, 18, 1.7, 18, ["mid"], "Learned on the corner."),
      mv("Stoop Kick", "3", "dropkick", "strike", 10, 12, 4, 17, 2.0, 14, ["mid"], "Stoop-side kick."),
      mv("Protect the Block", "d+1+2", "guardhigh", "special", 0, 8, 0, 16, 0, 0, ["armor"], "Takes one for the crew."),
      mv("Alley Takedown", "f+1+2", "takedown", "grapple", 16, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "Alley rules."),
      mv("Rooftop Drop", "d/b+1+2", "suplex", "grapple", 20, 18, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "What goes up comes down hard."),
    ],
    finisher: mv("Block Justice", "1+2 (Rage)", "suplex", "finisher", 38, 19, 6, 36, 1.4, 0, ["unblockable", "knockdown"], "For the neighborhood."),
  },
  "combine": {
    faction: "combine",
    core: [
      mv("Asset Jab", "1", "Punch_Jab", "strike", 6, 6, 3, 10, 1.6, 12, ["mid"], "Corporate-issue jab."),
      mv("Compliance Cross", "1,2", "Punch_Cross", "strike", 9, 9, 3, 14, 1.7, 14, ["mid"], "Comply."),
      mv("Security Kick", "3", "dropkick", "strike", 11, 12, 4, 18, 2.0, 15, ["mid"], "Private-security kick."),
      mv("Escalation", "f+2", "boxing2", "strike", 14, 12, 4, 19, 1.7, 21, ["mid", "counter-hit"], "Escalating the situation."),
      mv("Detainment", "f+1+2", "takedown", "grapple", 17, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "You are being detained."),
      mv("Liquidation", "d/b+1+2", "ddt", "grapple", 21, 17, 5, 28, 1.3, 0, ["unblockable", "knockdown"], "Asset liquidated."),
    ],
    finisher: mv("Termination Clause", "1+2 (Rage)", "chokeslam", "finisher", 40, 20, 6, 38, 1.5, 0, ["unblockable", "knockdown"], "Per section 7 of your contract."),
  },
  "hollows": {
    faction: "hollows",
    core: [
      mv("Burned Jab", "1", "slugger", "strike", 8, 8, 4, 14, 1.6, 14, ["mid"], "Wild, burned-out swing."),
      mv("Ash Hook", "2", "boxing3", "strike", 13, 13, 4, 19, 1.7, 19, ["mid"], "Swings like the world already ended."),
      mv("Cinder Kick", "4", "dropkick", "strike", 12, 14, 4, 20, 2.0, 16, ["mid"], "Kicks through the pain. There's always pain."),
      mv("Feeding Frenzy", "d+1+2", "feral", "special", 0, 10, 0, 20, 2.5, 0, ["taunt"], "The hunger shows."),
      mv("Drag Down", "f+1+2", "takedown", "grapple", 16, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "Drags you into the ash with them."),
      mv("Hollow Slam", "d/b+1+2", "suplex", "grapple", 22, 18, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "There's nothing inside. The slam still lands."),
    ],
    finisher: mv("Burnout", "1+2 (Rage)", "brainbuster", "finisher", 42, 22, 6, 36, 1.4, 0, ["unblockable", "knockdown"], "Everything burns. Especially you."),
  },
  "unaffiliated": {
    faction: "unaffiliated",
    core: [
      mv("Merc Jab", "1", "Punch_Jab", "strike", 6, 6, 3, 10, 1.6, 12, ["mid"], "No allegiance. Just the jab."),
      mv("Contract Cross", "1,2", "Punch_Cross", "strike", 9, 9, 3, 14, 1.7, 14, ["mid"], "Terms and conditions apply."),
      mv("Freelance Kick", "3", "dropkick", "strike", 11, 12, 4, 18, 2.0, 15, ["mid"], "Works for whoever pays."),
      mv("Highest Bidder", "f+1+2", "takedown", "grapple", 17, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "Sold to the highest bidder: gravity."),
      mv("No Questions", "d/b+1+2", "suplex", "grapple", 21, 17, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "Asks no questions. Neither will you."),
      mv("Side Hustle", "d/f+2", "boxing2", "strike", 15, 13, 4, 22, 1.5, 26, ["launcher"], "A little extra on the side."),
    ],
    finisher: mv("Paid in Full", "1+2 (Rage)", "suplex", "finisher", 40, 19, 6, 36, 1.4, 0, ["unblockable", "knockdown"], "Invoice settled."),
  },
  "painted": {
    faction: "painted",
    core: [
      mv("Painted Jab", "1", "boxing", "strike", 7, 7, 3, 11, 1.6, 13, ["mid"], "The facepaint grins. The jab doesn't."),
      mv("Carnival Hook", "2", "boxing3", "strike", 13, 13, 4, 19, 1.7, 19, ["mid", "counter-hit"], "Step right up."),
      mv("Big Top Kick", "4", "dropkick", "strike", 12, 14, 4, 20, 2.0, 16, ["mid"], "Under the big top, everyone's equal. On the ground."),
      mv("Riddle Me", "d+1+2", "evade", "special", 0, 9, 0, 18, 0, 0, ["evade"], "Riddle me this: where did your guard go?"),
      mv("Clown Car Pile", "f+1+2", "takedown", "grapple", 17, 15, 4, 24, 1.2, 0, ["unblockable", "knockdown"], "Everybody out of the car. Onto you."),
      mv("Punchline", "d/b+1+2", "ddt", "grapple", 21, 17, 5, 28, 1.3, 0, ["unblockable", "knockdown"], "You won't get it until you're flat."),
    ],
    finisher: mv("The Last Laugh", "1+2 (Rage)", "brainbuster", "finisher", 42, 21, 6, 36, 1.4, 0, ["unblockable", "knockdown"], "The Painted always get the last laugh."),
  },
  "authority": {
    faction: "authority",
    core: [
      mv("Citation Jab", "1", "Punch_Jab", "strike", 6, 6, 3, 10, 1.6, 12, ["mid"], "You're cited. The jab is the paperwork."),
      mv("Nightstick Cross", "1,2", "boxing1", "strike", 10, 10, 3, 15, 1.7, 16, ["mid"], "Nightstick-assisted cross."),
      mv("Compliance Kick", "3", "dropkick", "strike", 11, 12, 4, 18, 2.0, 15, ["mid"], "Comply."),
      mv("Resisting Arrest", "f+1+2", "takedown", "grapple", 18, 15, 4, 26, 1.2, 0, ["unblockable", "knockdown"], "Stop resisting. (You weren't.)"),
      mv("Processing", "d/b+1+2", "suplex", "grapple", 22, 18, 5, 30, 1.3, 0, ["unblockable", "knockdown"], "You are being processed."),
      mv("Peace Act", "d+1+2", "guardhigh", "special", 0, 8, 0, 16, 0, 0, ["armor"], "The Peace Act protects officers. Armor up."),
    ],
    finisher: mv("Maximum Sentence", "1+2 (Rage)", "chokeslam", "finisher", 41, 20, 6, 38, 1.5, 0, ["unblockable", "knockdown"], "Sentence: maximum."),
  },
};

/** Get a faction's grunt moveset. */
export function factionMoveset(faction: string): FactionMoveset | undefined {
  return FACTION_MOVESETS[faction];
}
