import * as THREE from "three";

/**
 * Contract for every fighter that comes in later.
 * Face is +Z. The view adds PI of yaw because movement forward is -Z at yaw 0.
 * Physics owns translation, so only root.position tracks are removed. Every clip stays.
 * A new model joins by calling adoptRig with a moveset id. Unused clips stay on the mixer.
 */
export const JOINTS = [
  "root",
  "hips",
  "spine",
  "chest",
  "upperarm.l",
  "lowerarm.l",
  "wrist.l",
  "hand.l",
  "handslot.l",
  "upperarm.r",
  "lowerarm.r",
  "wrist.r",
  "hand.r",
  "handslot.r",
  "head",
  "upperleg.l",
  "lowerleg.l",
  "foot.l",
  "toes.l",
  "upperleg.r",
  "lowerleg.r",
  "foot.r",
  "toes.r",
  "kneeIK.l",
  "control-toe-roll.l",
  "control-heel-roll.l",
  "control-foot-roll.l",
  "heelIK.l",
  "IK-foot.l",
  "IK-toe.l",
  "kneeIK.r",
  "control-toe-roll.r",
  "control-heel-roll.r",
  "control-foot-roll.r",
  "heelIK.r",
  "IK-foot.r",
  "IK-toe.r",
  "elbowIK.l",
  "handIK.l",
  "elbowIK.r",
  "handIK.r",
] as const;

export const TARGET_HEIGHT = 1.7;
export const HAND_SLOT = "handslot.r";
export const PROP_MESH = /sword|axe|shield|knife|crossbow|mug|throw|dagger|quiver|arrow|staff|wand|spell|badge/i;

export type Slot =
  | "idle"
  | "walk"
  | "run"
  | "back"
  | "strafeL"
  | "strafeR"
  | "jump"
  | "fall"
  | "jab"
  | "cross"
  | "launch"
  | "sweep"
  | "lunge"
  | "armedJab"
  | "armedCross"
  | "armedLaunch"
  | "armedSweep"
  | "armedLunge"
  | "spin"
  | "hit"
  | "dodge"
  | "down"
  | "death"
  | "pickup"
  | "throw"
  | "grab"
  | "block"
  | "cheer";

export type Moveset = {
  id: string;
  show: string[];
  clips: Record<Slot, string>;
};

const libraries = new Map<string, string[]>();

export function clipLibrary(id: string) {
  return libraries.get(id) ?? [];
}

export function skeletonMatches(root: THREE.Object3D) {
  const names = new Set<string>();
  root.traverse((obj) => {
    if (obj.name) names.add(obj.name);
  });
  return JOINTS.every((joint) => names.has(joint));
}

export const MOVESETS: Record<string, Moveset> = {
  drifter: {
    id: "drifter",
    show: [],
    clips: {
      idle: "Idle_Loop",
      walk: "Jog_Fwd_Loop",
      run: "Sprint_Loop",
      back: "Jog_Fwd_Loop",
      strafeL: "Jog_Fwd_Loop",
      strafeR: "Jog_Fwd_Loop",
      jump: "Jump_Start",
      fall: "Jump_Loop",
      jab: "Punch_Jab",
      cross: "Punch_Cross",
      launch: "Punch_Cross",
      sweep: "Punch_Enter",
      lunge: "Punch_Enter",
      armedJab: "Punch_Jab",
      armedCross: "Punch_Cross",
      armedLaunch: "Punch_Cross",
      armedSweep: "Punch_Enter",
      armedLunge: "Punch_Enter",
      spin: "Spell_Simple_Shoot",
      hit: "Hit_Chest",
      dodge: "Roll",
      down: "Crouch_Idle_Loop",
      death: "Death01",
      pickup: "PickUp_Table",
      throw: "Punch_Cross",
      grab: "Interact",
      block: "Crouch_Idle_Loop",
      cheer: "Dance_Loop",
    },
  },
  knight: {
    id: "knight",
    show: [],
    clips: {
      idle: "Unarmed_Idle",
      walk: "Walking_A",
      run: "Running_A",
      back: "Walking_Backwards",
      strafeL: "Running_Strafe_Left",
      strafeR: "Running_Strafe_Right",
      jump: "Jump_Start",
      fall: "Jump_Idle",
      jab: "Unarmed_Melee_Attack_Punch_A",
      cross: "Unarmed_Melee_Attack_Punch_B",
      launch: "Unarmed_Melee_Attack_Kick",
      sweep: "Dualwield_Melee_Attack_Slice",
      lunge: "2H_Melee_Attack_Chop",
      armedJab: "1H_Melee_Attack_Slice_Horizontal",
      armedCross: "1H_Melee_Attack_Chop",
      armedLaunch: "1H_Melee_Attack_Stab",
      armedSweep: "1H_Melee_Attack_Slice_Diagonal",
      armedLunge: "1H_Melee_Attack_Slice_Diagonal",
      spin: "2H_Melee_Attack_Spin",
      hit: "Hit_A",
      dodge: "Dodge_Forward",
      down: "Lie_Idle",
      death: "Death_A",
      pickup: "PickUp",
      throw: "Throw",
      grab: "Interact",
      block: "Block",
      cheer: "Cheer",
    },
  },
  runner: {
    id: "runner",
    show: [],
    clips: {
      idle: "Idle",
      walk: "Walking_B",
      run: "Running_B",
      back: "Walking_Backwards",
      strafeL: "Running_Strafe_Left",
      strafeR: "Running_Strafe_Right",
      jump: "Jump_Full_Short",
      fall: "Jump_Idle",
      jab: "Dualwield_Melee_Attack_Slice",
      cross: "Dualwield_Melee_Attack_Chop",
      launch: "Dualwield_Melee_Attack_Stab",
      sweep: "Unarmed_Melee_Attack_Kick",
      lunge: "Dualwield_Melee_Attack_Slice",
      armedJab: "Dualwield_Melee_Attack_Slice",
      armedCross: "Dualwield_Melee_Attack_Chop",
      armedLaunch: "Dualwield_Melee_Attack_Stab",
      armedSweep: "Unarmed_Melee_Attack_Kick",
      armedLunge: "Dualwield_Melee_Attack_Slice",
      spin: "2H_Melee_Attack_Spinning",
      hit: "Hit_A",
      dodge: "Dodge_Left",
      down: "Lie_Idle",
      death: "Death_A",
      pickup: "PickUp",
      throw: "Throw",
      grab: "Use_Item",
      block: "Block_Hit",
      cheer: "Cheer",
    },
  },
  brute: {
    id: "brute",
    show: [],
    clips: {
      idle: "2H_Melee_Idle",
      walk: "Walking_A",
      run: "Running_A",
      back: "Walking_Backwards",
      strafeL: "Running_Strafe_Left",
      strafeR: "Running_Strafe_Right",
      jump: "Jump_Start",
      fall: "Jump_Idle",
      jab: "2H_Melee_Attack_Chop",
      cross: "2H_Melee_Attack_Slice",
      launch: "2H_Melee_Attack_Stab",
      sweep: "2H_Melee_Attack_Chop",
      lunge: "2H_Melee_Attack_Slice",
      armedJab: "2H_Melee_Attack_Chop",
      armedCross: "2H_Melee_Attack_Slice",
      armedLaunch: "2H_Melee_Attack_Stab",
      armedSweep: "2H_Melee_Attack_Chop",
      armedLunge: "2H_Melee_Attack_Slice",
      spin: "2H_Melee_Attack_Spin",
      hit: "Hit_B",
      dodge: "Dodge_Backward",
      down: "Lie_Idle",
      death: "Death_B",
      pickup: "PickUp",
      throw: "Throw",
      grab: "Interact",
      block: "Block",
      cheer: "Cheer",
    },
  },
  hood: {
    id: "hood",
    show: [],
    clips: {
      idle: "Idle",
      walk: "Walking_C",
      run: "Running_B",
      back: "Walking_Backwards",
      strafeL: "Running_Strafe_Left",
      strafeR: "Running_Strafe_Right",
      jump: "Jump_Full_Long",
      fall: "Jump_Idle",
      jab: "Dualwield_Melee_Attack_Chop",
      cross: "Dualwield_Melee_Attack_Stab",
      launch: "Dualwield_Melee_Attack_Slice",
      sweep: "Unarmed_Melee_Attack_Kick",
      lunge: "Dualwield_Melee_Attack_Chop",
      armedJab: "Dualwield_Melee_Attack_Chop",
      armedCross: "Dualwield_Melee_Attack_Stab",
      armedLaunch: "Dualwield_Melee_Attack_Slice",
      armedSweep: "Unarmed_Melee_Attack_Kick",
      armedLunge: "Dualwield_Melee_Attack_Chop",
      spin: "2H_Melee_Attack_Spinning",
      hit: "Hit_B",
      dodge: "Dodge_Right",
      down: "Lie_Idle",
      death: "Death_B",
      pickup: "PickUp",
      throw: "Throw",
      grab: "Use_Item",
      block: "Blocking",
      cheer: "Cheer",
    },
  },
  hex: {
    id: "hex",
    show: [],
    clips: {
      idle: "Idle",
      walk: "Walking_A",
      run: "Running_B",
      back: "Walking_Backwards",
      strafeL: "Running_Strafe_Left",
      strafeR: "Running_Strafe_Right",
      jump: "Jump_Start",
      fall: "Jump_Idle",
      jab: "Spellcast_Shoot",
      cross: "Spellcast_Raise",
      launch: "Spellcast_Long",
      sweep: "Spellcasting",
      lunge: "Spellcast_Long",
      armedJab: "Spellcast_Shoot",
      armedCross: "Spellcast_Raise",
      armedLaunch: "Spellcast_Long",
      armedSweep: "Spellcasting",
      armedLunge: "Spellcast_Long",
      spin: "Spellcasting",
      hit: "Hit_A",
      dodge: "Dodge_Backward",
      down: "Lie_Idle",
      death: "Death_A",
      pickup: "PickUp",
      throw: "Throw",
      grab: "Spellcast_Raise",
      block: "Block",
      cheer: "Cheer",
    },
  },
};

export function equipStyle(id: string) {
  const src = MOVESETS[id] ?? MOVESETS.knight;
  MOVESETS.player = { id: "player", show: [...src.show], clips: { ...src.clips } };
}

export function retargetSlot(id: string, slot: Slot, clip: string) {
  const row = MOVESETS[id];
  if (row) row.clips[slot] = clip;
}

export const STYLES = [
  { id: "knight", label: "Punches", note: "Unarmed string. A pipe still changes the swings. Spin stays on L." },
  { id: "runner", label: "Knives", note: "Dual cuts and a left sidestep." },
  { id: "hood", label: "Hood", note: "The other knife order and a right sidestep." },
  { id: "brute", label: "Axe", note: "Two-hand chops and stabs." },
  { id: "hex", label: "Staff", note: "Spell casts instead of punches." },
  { id: "drifter", label: "Drifter", note: "CC0 mannequin. Jab, cross, sword swing, roll. KayKit bodies stay as they are." },
  { id: "skeleton", label: "Bone warrior", note: "CC0 KayKit skeleton. Same clips as the knight, different skin." },
  { id: "bones", label: "Bone rogue", note: "CC0 KayKit skeleton rogue. Same rig, lighter skin." },
  { id: "mannequin", label: "Mannequin", note: "Stripped Mixamo skeleton. The motion bank plays on Hips and LeftArm, not a likeness." },
  { id: "skull", label: "Bone mage", note: "CC0 KayKit skeleton mage. Same rig as the knight." },
  { id: "minion", label: "Bone minion", note: "CC0 KayKit skeleton minion." },
  { id: "rain", label: "Rain dye", note: "The knight, dyed for the wet ward." },
  { id: "ash", label: "Ash dye", note: "The rogue, greyed out." },
  { id: "pit", label: "Pit dye", note: "The brute, dyed for the pit." },
  { id: "soldier", label: "Soldier", note: "CC0 full-size body, about 1.8m. Walk, punch, roll, and the motion bank." },
  { id: "soldierf", label: "Second soldier", note: "Same full-size rig, other body." },
  { id: "zombie", label: "Shambler", note: "CC0 full-size body. Same skeleton as the soldiers." },
  { id: "zombief", label: "Second shambler", note: "CC0 full-size body, other mesh." },
] as const;

export const ASSIGN_SLOTS: Slot[] = ["jab", "cross", "launch", "sweep", "lunge", "spin", "dodge", "hit", "grab", "cheer"];

export const CLIP_NAMES = [
  "1H_Melee_Attack_Chop",
  "1H_Melee_Attack_Slice_Diagonal",
  "1H_Melee_Attack_Slice_Horizontal",
  "1H_Melee_Attack_Stab",
  "1H_Ranged_Aiming",
  "1H_Ranged_Reload",
  "1H_Ranged_Shoot",
  "1H_Ranged_Shooting",
  "2H_Melee_Attack_Chop",
  "2H_Melee_Attack_Slice",
  "2H_Melee_Attack_Spin",
  "2H_Melee_Attack_Spinning",
  "2H_Melee_Attack_Stab",
  "2H_Melee_Idle",
  "2H_Ranged_Aiming",
  "2H_Ranged_Reload",
  "2H_Ranged_Shoot",
  "2H_Ranged_Shooting",
  "Block",
  "Block_Attack",
  "Block_Hit",
  "Blocking",
  "Cheer",
  "Death_A",
  "Death_A_Pose",
  "Death_B",
  "Death_B_Pose",
  "Dodge_Backward",
  "Dodge_Forward",
  "Dodge_Left",
  "Dodge_Right",
  "Dualwield_Melee_Attack_Chop",
  "Dualwield_Melee_Attack_Slice",
  "Dualwield_Melee_Attack_Stab",
  "Hit_A",
  "Hit_B",
  "Idle",
  "Interact",
  "Jump_Full_Long",
  "Jump_Full_Short",
  "Jump_Idle",
  "Jump_Land",
  "Jump_Start",
  "Lie_Down",
  "Lie_Idle",
  "Lie_Pose",
  "Lie_StandUp",
  "PickUp",
  "Running_A",
  "Running_B",
  "Running_Strafe_Left",
  "Running_Strafe_Right",
  "Sit_Chair_Down",
  "Sit_Chair_Idle",
  "Sit_Chair_Pose",
  "Sit_Chair_StandUp",
  "Sit_Floor_Down",
  "Sit_Floor_Idle",
  "Sit_Floor_Pose",
  "Sit_Floor_StandUp",
  "Spellcast_Long",
  "Spellcast_Raise",
  "Spellcast_Shoot",
  "Spellcasting",
  "T-Pose",
  "Throw",
  "Unarmed_Idle",
  "Unarmed_Melee_Attack_Kick",
  "Unarmed_Melee_Attack_Punch_A",
  "Unarmed_Melee_Attack_Punch_B",
  "Unarmed_Pose",
  "Use_Item",
  "Walking_A",
  "Walking_B",
  "Walking_Backwards",
  "Walking_C",
] as const;

MOVESETS.player = { id: "player", show: [], clips: { ...MOVESETS.knight.clips } };
MOVESETS.skeleton = { id: "skeleton", show: [], clips: { ...MOVESETS.knight.clips } };
MOVESETS.bones = { id: "bones", show: [], clips: { ...MOVESETS.knight.clips } };
MOVESETS.skull = { id: "skull", show: [], clips: { ...MOVESETS.knight.clips } };
MOVESETS.minion = { id: "minion", show: [], clips: { ...MOVESETS.knight.clips } };
MOVESETS.rain = { id: "rain", show: [], clips: { ...MOVESETS.knight.clips } };
MOVESETS.ash = { id: "ash", show: [...MOVESETS.runner.show], clips: { ...MOVESETS.runner.clips } };
MOVESETS.pit = { id: "pit", show: [...MOVESETS.brute.show], clips: { ...MOVESETS.brute.clips } };
const SOLDIER: Moveset = {
  id: "soldier",
  show: [],
  clips: {
    idle: "Idle",
    walk: "Walk",
    run: "Run",
    back: "Walk",
    strafeL: "Walk",
    strafeR: "Walk",
    jump: "Jump",
    fall: "Jump",
    jab: "Punch",
    cross: "Punch",
    launch: "SwordSlash",
    sweep: "Punch",
    lunge: "SwordSlash",
    armedJab: "SwordSlash",
    armedCross: "Shoot_OneHanded",
    armedLaunch: "SwordSlash",
    armedSweep: "Punch",
    armedLunge: "SwordSlash",
    spin: "SwordSlash",
    hit: "RecieveHit",
    dodge: "Roll",
    down: "Defeat",
    death: "Death",
    pickup: "PickUp",
    throw: "Punch",
    grab: "PickUp",
    block: "Idle",
    cheer: "Victory",
  },
};
MOVESETS.soldier = SOLDIER;
MOVESETS.soldierf = { id: "soldierf", show: [], clips: { ...SOLDIER.clips } };
MOVESETS.zombie = { id: "zombie", show: [], clips: { ...SOLDIER.clips } };
MOVESETS.zombief = { id: "zombief", show: [], clips: { ...SOLDIER.clips } };
MOVESETS.mannequin = {
  id: "mannequin",
  show: [],
  clips: {
    idle: "boxidle",
    walk: "ginga",
    run: "gingaside",
    back: "drunkidle",
    strafeL: "gingaside",
    strafeR: "gingaside",
    jump: "bigjump",
    fall: "crossjump",
    jab: "boxing",
    cross: "jabcross",
    launch: "knee",
    sweep: "bodyblow",
    lunge: "dropkick",
    armedJab: "elbow",
    armedCross: "jabcross",
    armedLaunch: "knee",
    armedSweep: "bodyblow",
    armedLunge: "dropkick",
    spin: "hurricane",
    hit: "hit",
    dodge: "esquiva",
    down: "fallflat",
    death: "fallflat",
    pickup: "boxing1",
    throw: "suplex",
    grab: "boxing",
    block: "defender",
    cheer: "capoeira",
  },
};

const CAST_STYLES: Moveset["clips"][] = [
  {
    idle: "boxidle", walk: "Walk_Loop", run: "Jog_Fwd_Loop", back: "Walk_Formal_Loop", strafeL: "Walk_Loop", strafeR: "Walk_Formal_Loop",
    jump: "Jump_Start", fall: "Jump_Loop", jab: "boxing", cross: "jabcross", launch: "elbow", sweep: "bodyblow", lunge: "slugger",
    armedJab: "elbow", armedCross: "jabcross", armedLaunch: "knee", armedSweep: "bodyblow", armedLunge: "slugger",
    spin: "hurricane", hit: "hit", dodge: "evade", down: "fallflat", death: "Death01", pickup: "rise", throw: "suplex", grab: "defender", block: "guardhigh", cheer: "boxing1",
  },
  {
    idle: "drunkidle", walk: "drunkwalk", run: "Jog_Fwd_Loop", back: "drunkwalk", strafeL: "evade", strafeR: "esquiva",
    jump: "Jump_Start", fall: "Jump_Loop", jab: "combo", cross: "rib", launch: "knee", sweep: "crouch", lunge: "dropkick",
    armedJab: "elbow", armedCross: "rib", armedLaunch: "knee", armedSweep: "bodyblow", armedLunge: "dropkick",
    spin: "capoeira", hit: "hitbody", dodge: "esquiva", down: "fallflat", death: "Death01", pickup: "kip", throw: "german", grab: "defender", block: "guardlow", cheer: "drunkidle",
  },
  {
    idle: "ginga", walk: "gingaside", run: "Sprint_Loop", back: "gingaback", strafeL: "gingaside", strafeR: "au",
    jump: "bigjump", fall: "crossjump", jab: "capoeira", cross: "hurricane", launch: "knee", sweep: "bodyblow", lunge: "dropkick",
    armedJab: "elbow", armedCross: "hurricane", armedLaunch: "knee", armedSweep: "crouch", armedLunge: "dropkick",
    spin: "au", hit: "hitside", dodge: "esquiva", down: "fallflat", death: "Death01", pickup: "kip", throw: "backdrop", grab: "takedown", block: "stancecrouch", cheer: "capoeira",
  },
  {
    idle: "defender", walk: "Walk_Loop", run: "Jog_Fwd_Loop", back: "Walk_Formal_Loop", strafeL: "evade", strafeR: "evade",
    jump: "Jump_Start", fall: "Jump_Loop", jab: "boxing", cross: "slugger", launch: "elbow", sweep: "bodyblow", lunge: "knee",
    armedJab: "elbow", armedCross: "slugger", armedLaunch: "knee", armedSweep: "crouch", armedLunge: "dropkick",
    spin: "tiger", hit: "hithead", dodge: "Roll", down: "fallflat", death: "Death01", pickup: "rise", throw: "chokeslam", grab: "defender", block: "guardhigh", cheer: "boxidle",
  },
  {
    idle: "Sword_Idle", walk: "Walk_Loop", run: "Jog_Fwd_Loop", back: "Walk_Formal_Loop", strafeL: "Roll", strafeR: "Walk_Formal_Loop",
    jump: "Jump_Start", fall: "Jump_Loop", jab: "Sword_Attack", cross: "Sword_Attack_RM", launch: "elbow", sweep: "crouch", lunge: "slugger",
    armedJab: "Sword_Attack", armedCross: "Sword_Attack_RM", armedLaunch: "knee", armedSweep: "bodyblow", armedLunge: "Sword_Attack",
    spin: "hurricane", hit: "Hit_Chest", dodge: "Roll", down: "fallflat", death: "Death01", pickup: "rise", throw: "ddt", grab: "defender", block: "guardhigh", cheer: "Sword_Idle",
  },
  {
    idle: "Idle_Loop", walk: "Walk_Loop", run: "Sprint_Loop", back: "Walk_Formal_Loop", strafeL: "Walk_Loop", strafeR: "Walk_Formal_Loop",
    jump: "Jump_Start", fall: "Jump_Loop", jab: "Punch_Jab", cross: "Punch_Cross", launch: "knee", sweep: "bodyblow", lunge: "dropkick",
    armedJab: "Punch_Jab", armedCross: "Punch_Cross", armedLaunch: "elbow", armedSweep: "crouch", armedLunge: "slugger",
    spin: "feral", hit: "Hit_Head", dodge: "Roll", down: "fallflat", death: "Death01", pickup: "Jump_Land", throw: "brainbuster", grab: "Punch_Enter", block: "guardhigh", cheer: "Idle_Talking_Loop",
  },
  {
    idle: "stancecrouch", walk: "Walk_Loop", run: "Jog_Fwd_Loop", back: "gingaback", strafeL: "esquiva", strafeR: "evade",
    jump: "Jump_Start", fall: "Jump_Loop", jab: "boxing2", cross: "boxing3", launch: "elbow", sweep: "crouch", lunge: "knee",
    armedJab: "elbow", armedCross: "boxing3", armedLaunch: "knee", armedSweep: "bodyblow", armedLunge: "dropkick",
    spin: "corkscrew", hit: "hit", dodge: "evade", down: "fallflat", death: "Death01", pickup: "kip", throw: "takedown", grab: "defender", block: "guardlow", cheer: "boxing1",
  },
  {
    idle: "Idle_Talking_Loop", walk: "Walk_Formal_Loop", run: "Sprint_Loop", back: "Walk_Loop", strafeL: "Walk_Formal_Loop", strafeR: "Walk_Loop",
    jump: "Jump_Start", fall: "Jump_Loop", jab: "Punch_Jab", cross: "jabcross", launch: "tiger", sweep: "bodyblow", lunge: "slugger",
    armedJab: "elbow", armedCross: "Punch_Cross", armedLaunch: "tiger", armedSweep: "crouch", armedLunge: "dropkick",
    spin: "hurricane", hit: "Hit_Chest", dodge: "Roll", down: "fallflat", death: "Death01", pickup: "rise", throw: "suplex", grab: "defender", block: "block", cheer: "Dance_Loop",
  },
];

export function castMoveset(file: string) {
  const id = `cast:${file}`;
  if (MOVESETS[id]) return id;
  let n = 0;
  for (let i = 0; i < file.length; i++) n = (n * 33 + file.charCodeAt(i)) >>> 0;
  const clips = { ...CAST_STYLES[n % CAST_STYLES.length] };
  const throws = ["suplex", "german", "chokeslam", "ddt", "brainbuster", "backdrop", "takedown"];
  clips.throw = throws[n % throws.length];
  MOVESETS[id] = { id, show: [], clips };
  return id;
}

export function adoptRig(scene: THREE.Group, animations: THREE.AnimationClip[], movesetId: string) {
  const moveset = MOVESETS[movesetId] ?? MOVESETS.knight;
  const family = rigFamily(scene);
  if (family === "other") console.warn(`rig ${movesetId} is not a KayKit or Rigify skeleton`);
  if (family === "kaykit" || family === "other" || family === "rigify" || family === "quat" || family === "mixamo") {
    const show = new Set(moveset.show);
    scene.traverse((obj) => {
      if (PROP_MESH.test(obj.name) && !show.has(obj.name)) obj.visible = false;
    });
  }
  for (const clip of animations) {
    clip.tracks = clip.tracks.filter((track) => {
      const bone = track.name.split(".")[0];
      return bone !== "root" && bone !== "Bone" && bone !== "Armature";
    });
  }
  libraries.set(movesetId, animations.map((clip) => clip.name));
  return { scene, animations, moveset: moveset.id };
}

function rigFamily(root: THREE.Object3D) {
  const names = new Set<string>();
  root.traverse((obj) => {
    if (obj.name) names.add(obj.name);
  });
  if (JOINTS.every((joint) => names.has(joint))) return "kaykit";
  if (names.has("DEF-hips")) return "rigify";
  if (names.has("Hips") && names.has("LeftArm")) return "mixamo";
  if (names.has("UpperArmL") && names.has("FistL")) return "quat";
  if (names.has("mixamorig:Hips") || names.has("mixamorigHips")) return "mixamo";
  if (names.has("pelvis") && names.has("spine_01")) return "ue";
  return "other";
}

export function slotFor(body: { state: string; alive: boolean; kind: string; weapon: string; swing: number; throwT: number; pickupT: number; grounded: boolean; vy: number; vx: number; vz: number; yaw: number }): { slot: Slot; loop: boolean } {
  const armed = body.weapon !== "fist";
  if (!body.alive || body.state === "out") return { slot: "death", loop: false };
  if (body.pickupT > 0) return { slot: "pickup", loop: false };
  if (body.kind === "player" && body.throwT > 0) return { slot: "throw", loop: false };
  if (body.state === "down") return { slot: "down", loop: true };
  if (body.state === "hit" || body.state === "launch") return { slot: "hit", loop: false };
  if (body.state === "dash") return { slot: "dodge", loop: false };
  if (body.state === "spin") return { slot: "spin", loop: true };
  if (body.state === "throw") return { slot: "hit", loop: false };
  if (body.state === "grab") return { slot: "grab", loop: true };
  if (body.state === "atk" || body.state === "windup") {
    if (body.swing === 12) return { slot: armed ? "armedCross" : "cross", loop: false };
    if (body.swing === 11) return { slot: armed ? "armedJab" : "jab", loop: false };
    if (body.swing >= 9) return { slot: armed ? "armedLunge" : "lunge", loop: false };
    if (body.swing >= 8) return { slot: armed ? "armedLaunch" : "launch", loop: false };
    if (body.swing >= 7) return { slot: armed ? "armedSweep" : "sweep", loop: false };
    if (body.swing >= 6) return { slot: armed ? "armedLunge" : "lunge", loop: false };
    if (body.swing >= 5) return { slot: armed ? "armedSweep" : "sweep", loop: false };
    if (body.swing >= 4) return { slot: armed ? "armedLunge" : "lunge", loop: false };
    if (body.swing >= 3) return { slot: armed ? "armedLaunch" : "launch", loop: false };
    if (body.swing === 2) return { slot: armed ? "armedCross" : "cross", loop: false };
    return { slot: armed ? "armedJab" : "jab", loop: false };
  }
  if (!body.grounded) return { slot: body.vy > 1 ? "jump" : "fall", loop: body.vy <= 1 };
  const speed = Math.hypot(body.vx, body.vz);
  const fx = -Math.sin(body.yaw);
  const fz = -Math.cos(body.yaw);
  const forward = fx * body.vx + fz * body.vz;
  const rx = Math.cos(body.yaw);
  const rz = -Math.sin(body.yaw);
  const side = rx * body.vx + rz * body.vz;
  if (speed > 0.45 && Math.abs(side) > Math.abs(forward) + 0.2) return { slot: side > 0 ? "strafeR" : "strafeL", loop: true };
  if (speed > 3.2) return { slot: "run", loop: true };
  if (speed > 0.45) return { slot: forward < -0.35 ? "back" : "walk", loop: true };
  return { slot: "idle", loop: true };
}

export function clipForMoveset(movesetId: string, slot: Slot, has: (name: string) => boolean) {
  const row = MOVESETS[movesetId] ?? MOVESETS.knight;
  const name = row.clips[slot];
  if (has(name)) return name;
  const fallback = MOVESETS.knight.clips[slot];
  if (has(fallback)) return fallback;
  if (has("Idle_Loop")) return "Idle_Loop";
  if (has("Unarmed_Idle")) return "Unarmed_Idle";
  return "Idle";
}
