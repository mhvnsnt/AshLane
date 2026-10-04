import { MOVESETS, equipStyle, retargetSlot, type Slot } from "./rig-pipeline";

export const MARTIAL: { id: string; label: string; note: string; clips: Partial<Record<Slot, string>> }[] = [
  {
    id: "kickboxing",
    label: "Kickboxing",
    note: "Hands, then a kick. Spin is still L.",
    clips: {
      jab: "Unarmed_Melee_Attack_Punch_A",
      cross: "Unarmed_Melee_Attack_Punch_B",
      launch: "Unarmed_Melee_Attack_Kick",
      sweep: "Unarmed_Melee_Attack_Kick",
      lunge: "Unarmed_Melee_Attack_Kick",
      spin: "2H_Melee_Attack_Spin",
    },
  },
  {
    id: "karate",
    label: "Karate",
    note: "Chop, stab, kick. Grab is still K.",
    clips: {
      jab: "1H_Melee_Attack_Chop",
      cross: "1H_Melee_Attack_Stab",
      launch: "Unarmed_Melee_Attack_Kick",
      sweep: "1H_Melee_Attack_Slice_Diagonal",
      lunge: "1H_Melee_Attack_Slice_Horizontal",
    },
  },
  {
    id: "capoeira",
    label: "Capoeira",
    note: "Kicks and spins. L is still the big spin.",
    clips: {
      jab: "Unarmed_Melee_Attack_Kick",
      cross: "2H_Melee_Attack_Spin",
      launch: "Unarmed_Melee_Attack_Kick",
      sweep: "1H_Melee_Attack_Slice_Diagonal",
      spin: "2H_Melee_Attack_Spinning",
      dodge: "Dodge_Left",
    },
  },
  {
    id: "drunken",
    label: "Drunken monkey",
    note: "Odd angles. A kick where they look for a hand.",
    clips: {
      jab: "Dualwield_Melee_Attack_Slice",
      cross: "Unarmed_Melee_Attack_Kick",
      launch: "2H_Melee_Attack_Spin",
      sweep: "Dodge_Backward",
      idle: "Walking_C",
      dodge: "Dodge_Right",
    },
  },
  {
    id: "mma",
    label: "MMA",
    note: "Punch, kick, clinch on grab.",
    clips: {
      jab: "Unarmed_Melee_Attack_Punch_A",
      cross: "Unarmed_Melee_Attack_Kick",
      launch: "Unarmed_Melee_Attack_Punch_B",
      sweep: "Unarmed_Melee_Attack_Kick",
      grab: "Interact",
    },
  },
  {
    id: "jiujitsu",
    label: "Jiu-jitsu",
    note: "Get the grab. Stick back is a neckbreaker. Stick forward is a brainbuster. Neutral is a suplex.",
    clips: {
      jab: "Interact",
      cross: "Throw",
      launch: "PickUp",
      sweep: "Unarmed_Melee_Attack_Kick",
      grab: "Throw",
    },
  },
  {
    id: "wrestling",
    label: "Wrestling",
    note: "Running hit is a clothesline. Grab, then K, is a powerbomb. Stick forward on the throw is a brainbuster. Stick back is a neckbreaker.",
    clips: {
      jab: "Throw",
      cross: "PickUp",
      launch: "2H_Melee_Attack_Stab",
      sweep: "Unarmed_Melee_Attack_Kick",
      grab: "Throw",
      spin: "2H_Melee_Attack_Spin",
    },
  },
  {
    id: "catch",
    label: "Catch wrestling",
    note: "Grab lifts them. K is a fireman's carry into the mat.",
    clips: {
      jab: "PickUp",
      cross: "Throw",
      launch: "2H_Melee_Attack_Chop",
      sweep: "Unarmed_Melee_Attack_Kick",
      grab: "PickUp",
    },
  },
  {
    id: "sambo",
    label: "Sambo",
    note: "Grab, then K, throws them back over you. That's the suplex.",
    clips: {
      jab: "Unarmed_Melee_Attack_Punch_A",
      cross: "Throw",
      launch: "Unarmed_Melee_Attack_Kick",
      sweep: "1H_Melee_Attack_Slice_Diagonal",
      grab: "Throw",
    },
  },
  {
    id: "muaythai",
    label: "Muay Thai",
    note: "Knees and kicks. A running hit still clotheslines.",
    clips: {
      jab: "Unarmed_Melee_Attack_Kick",
      cross: "Unarmed_Melee_Attack_Punch_A",
      launch: "Unarmed_Melee_Attack_Kick",
      sweep: "Unarmed_Melee_Attack_Kick",
      lunge: "Unarmed_Melee_Attack_Kick",
    },
  },
  {
    id: "savate",
    label: "Savate",
    note: "Kicks, and a running clothesline.",
    clips: {
      jab: "Unarmed_Melee_Attack_Kick",
      cross: "1H_Melee_Attack_Slice_Horizontal",
      launch: "Unarmed_Melee_Attack_Kick",
      sweep: "Dodge_Forward",
      lunge: "Unarmed_Melee_Attack_Kick",
    },
  },
  {
    id: "kenpo",
    label: "Kenpo",
    note: "Chops in a string. Grab is still there if you want the throw.",
    clips: {
      jab: "1H_Melee_Attack_Chop",
      cross: "1H_Melee_Attack_Slice_Diagonal",
      launch: "1H_Melee_Attack_Stab",
      sweep: "Unarmed_Melee_Attack_Kick",
    },
  },
  {
    id: "monkey",
    label: "Jumping monkey",
    note: "Get airborne. Hit on the way down and it dives.",
    clips: {
      jab: "Unarmed_Melee_Attack_Kick",
      cross: "Dodge_Forward",
      launch: "2H_Melee_Attack_Spin",
      sweep: "Unarmed_Melee_Attack_Kick",
      jump: "Jump_Full_Long",
      spin: "2H_Melee_Attack_Spinning",
    },
  },
  {
    id: "animals",
    label: "Five animals",
    note: "Crane chop, tiger claw, a kick. The spin is still L.",
    clips: {
      jab: "1H_Melee_Attack_Chop",
      cross: "Dualwield_Melee_Attack_Slice",
      launch: "Unarmed_Melee_Attack_Kick",
      sweep: "1H_Melee_Attack_Slice_Diagonal",
      spin: "2H_Melee_Attack_Spin",
    },
  },
];

export const STANCES: { id: string; label: string; note: string; idle: string }[] = [
  { id: "orthodox", label: "Orthodox", note: "Square. First hit is the jab.", idle: "Unarmed_Idle" },
  { id: "southpaw", label: "Southpaw", note: "Other lead. The first hit is the cross.", idle: "Idle" },
  { id: "ginga", label: "Ginga", note: "Capoeira sway. A dive with the stick neutral is a senton.", idle: "Unarmed_Idle" },
  { id: "drunken", label: "Drunken", note: "Loose. You can grab from farther away.", idle: "Idle" },
  { id: "crane", label: "Crane", note: "High guard. A low hit breaks poise harder.", idle: "Spellcasting" },
  { id: "collar", label: "Collar", note: "Wrestling posture. A neutral throw is a powerbomb.", idle: "2H_Melee_Idle" },
];

export function applyStance(id: string) {
  const row = STANCES.find((item) => item.id === id) ?? STANCES[0];
  retargetSlot("player", "idle", row.idle);
}

export function applyMartial(id: string) {
  const row = MARTIAL.find((item) => item.id === id);
  if (!row) return;
  for (const [slot, clip] of Object.entries(row.clips)) {
    if (clip) retargetSlot("player", slot as Slot, clip);
  }
}

const KEY = "ashlane-fighter-v1";

export function saveFighter(style: string, martial: string, stance: string) {
  localStorage.setItem(KEY, JSON.stringify({ style, martial, stance, slots: MOVESETS.player?.clips ?? {} }));
}

export function loadFighter(): { style: string; martial: string; stance: string; slots: Partial<Record<Slot, string>> } | null {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null") as { style?: string; martial?: string; stance?: string; slots?: Partial<Record<Slot, string>> } | null;
    if (!raw || typeof raw.style !== "string") return null;
    return { style: raw.style, martial: raw.martial || "", stance: raw.stance || "orthodox", slots: raw.slots ?? {} };
  } catch {
    return null;
  }
}

export function applyFighter(style: string, martial: string, _slots: Partial<Record<Slot, string>>) {
  equipStyle(style);
  if (martial) applyMartial(martial);
}
