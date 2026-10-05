export type Attire = { id: string; label: string; file: string };
export type LaneFighter = { id: string; name: string; martial: string; bio: string; attires: Attire[] };

const a = (id: string, label: string, file: string): Attire => ({ id, label, file });

// Meshes are the skinned Mixamo bodies from brutalfistgrokversionten.
// Bios are the ones written in the Bannon roster. Attire names are the file variants.
export const ROSTER: LaneFighter[] = [
  {
    id: "bannon",
    name: "Bannon",
    martial: "wrestling",
    bio: "The physical nucleus and absolute force of the Bannon Engine. Driven by raw physics and unmatched grit.",
    attires: [a("muscle", "Muscular", "BANNON_muscular_skinned.glb")],
  },
  {
    id: "maime",
    name: "Maime",
    martial: "drunken",
    bio: "Marquis's chaotic alter-ego. Raw, unchecked, self-destructive momentum.",
    attires: [a("base", "Base", "MAIME_skinned.glb"), a("tattered", "Tattered", "MAIME_tattered_skinned.glb")],
  },
  {
    id: "brutus",
    name: "Brutus",
    martial: "boxing",
    bio: "Gritty cruiserweight with heavy iron hands. He wants the fight in close.",
    attires: [a("base", "Base", "BRUTUS.glb")],
  },
  {
    id: "cain",
    name: "Cain Elias",
    martial: "catch",
    bio: "Cold corporate enforcer. The throw plants them.",
    attires: [a("gear", "Gear", "CAIN_ELIAS_gear.glb"), a("snakeskin", "Snakeskin", "CAIN_ELIAS_snakeskin.glb")],
  },
  {
    id: "viper",
    name: "Viper",
    martial: "kickboxing",
    bio: "Cold long-range southpaw. A shoulder roll, then a kick with reach.",
    attires: [a("base", "Base", "VIPER.glb")],
  },
  {
    id: "titan",
    name: "Titan",
    martial: "catch",
    bio: "Every step is a tremor. The colossal powerhouse.",
    attires: [a("mask", "Masked", "TITAN.glb"), a("open", "Unmasked", "TITAN_unmasked.glb")],
  },
  {
    id: "stickup",
    name: "Stick-Up",
    martial: "muaythai",
    bio: "The system's weapon turned rebel. Takes momentum and gives it back as a teep.",
    attires: [a("base", "Base", "STICKUP.glb")],
  },
  {
    id: "finxsse",
    name: "Finxsse",
    martial: "lucha",
    bio: "Gravity is a suggestion. High-flying vanguard.",
    attires: [a("base", "Base", "NPC_FINXSSE.glb")],
  },
  {
    id: "tyneshia",
    name: "Queen Tyneshia",
    martial: "wrestling",
    bio: "A regal powerhouse. Commands the ring.",
    attires: [a("ring", "Ring", "TYNESHIA.glb"), a("street", "Street", "TYNESHIA_street.glb")],
  },
  {
    id: "onyx",
    name: "Onyx",
    martial: "mma",
    bio: "Onyx. Attires from the Brutal Fist set: base, corset, street, straightjacket.",
    attires: [
      a("base", "Base", "ONYX_skinned.glb"),
      a("corset", "Corset", "ONYX_corset_skinned.glb"),
      a("street", "Street", "ONYX_street.glb"),
      a("jacket", "Straightjacket", "ONYX_straightjacket.glb"),
    ],
  },
  {
    id: "cody",
    name: "Cody",
    martial: "wrestling",
    bio: "Cody. Attires from the Brutal Fist set: gear, sober, stressed.",
    attires: [a("gear", "Gear", "CODY_gear_skinned.glb"), a("sober", "Sober", "CODY_sober.glb"), a("stressed", "Stressed", "CODY_stressed.glb")],
  },
  {
    id: "cipher",
    name: "Cipher",
    martial: "kenpo",
    bio: "Cipher. The rigged body from the Brutal Fist set.",
    attires: [a("base", "Rigged", "CIPHER_rigged.glb")],
  },
  {
    id: "echo",
    name: "Echo",
    martial: "savate",
    bio: "Echo. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "ECHO.glb")],
  },
  {
    id: "pablo",
    name: "Pablo",
    martial: "lucha",
    bio: "Pablo. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "PABLO.glb")],
  },
  {
    id: "kobra",
    name: "Kobra",
    martial: "karate",
    bio: "Kobra. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "KOBRA.glb")],
  },
  {
    id: "hollow",
    name: "Hollow",
    martial: "drunken",
    bio: "Hollow. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "HOLLOW.glb")],
  },
  {
    id: "hall",
    name: "Hall Nighter",
    martial: "boxing",
    bio: "Hall Nighter. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "HALL_NIGHTER.glb")],
  },
  {
    id: "edwin",
    name: "Edwin Kennedy",
    martial: "jeet",
    bio: "Edwin Kennedy. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "EDWIN_KENNEDY.glb")],
  },
  {
    id: "aaron",
    name: "Aaron Ruben",
    martial: "kickboxing",
    bio: "Aaron Ruben. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "AARON_RUBEN.glb")],
  },
  {
    id: "sensei",
    name: "Master Sensei",
    martial: "karate",
    bio: "Master Sensei. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "MASTER_SENSEI.glb")],
  },
  {
    id: "toro",
    name: "El Toro de Oro",
    martial: "wrestling",
    bio: "El Toro de Oro. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "EL_TORO_DE_ORO.glb")],
  },
  {
    id: "static",
    name: "Static",
    martial: "capoeira",
    bio: "Static. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "STATIC.glb")],
  },
  {
    id: "stan",
    name: "Stan Combs",
    martial: "sambo",
    bio: "Stan Combs. Gear from the Brutal Fist set.",
    attires: [a("gear", "Gear", "STAN_COMBS_gear.glb")],
  },
  {
    id: "triplex",
    name: "Triple X",
    martial: "mma",
    bio: "Triple X. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "TRIPLE_XXX.glb")],
  },
  {
    id: "wreck",
    name: "Wreck Patterson",
    martial: "catch",
    bio: "Wreck Patterson. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "WRECK_PATTERSON.glb")],
  },
  {
    id: "devil",
    name: "Tarzanian Devil",
    martial: "lucha",
    bio: "Tarzanian Devil. Skinned body from the Brutal Fist set.",
    attires: [a("base", "Skinned", "TARZANIAN_DEVIL_skinned.glb")],
  },
  {
    id: "jager",
    name: "Jager",
    martial: "muaythai",
    bio: "Jager. Body from the Brutal Fist set.",
    attires: [a("base", "Base", "JAGER.glb")],
  },
  {
    id: "sombra_negra",
    name: "Sombra Negra",
    martial: "lucha",
    bio: "The Finisher Thief. Steals your finisher mid-match and beats you with it — your best self, turned.",
    attires: [a("main", "Main Attire", "assets/models/SOMBRA_NEGRA_rigged.glb")],
  },
];

export function fighterById(id: string) {
  return ROSTER.find((f) => f.id === id) ?? ROSTER[0];
}

export function fighterByName(name: string) {
  return ROSTER.find((f) => f.name === name) ?? null;
}

export type CastPick = { id: string; name: string; label: string; file: string; bio: string };

export const CAST_PICKS: CastPick[] = ROSTER.flatMap((fighter) =>
  fighter.attires.map((attire) => ({
    id: fighter.id,
    name: fighter.name,
    label: attire.label,
    file: attire.file,
    bio: fighter.bio,
  })),
);
