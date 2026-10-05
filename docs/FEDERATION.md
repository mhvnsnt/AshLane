# AshLane Asset Federation (2026-10-05)

Every open-source system pulled in, where it lives, license, and integration status.

## Combat Systems (code pulled, TypeScript ports written)

| System | Source | License | AshLane location | Status |
|--------|--------|---------|------------------|--------|
| Lock-on targeting | prashanna135/souls-like-controller | Public domain | `src/game3d/federated/lockon.ts` | Ported, needs wiring into sim.ts |
| Freeflow targeting | celojevic/batman-arkham-combat | MIT | `src/game3d/federated/freeflow.ts` | Ported, needs wiring into sim.ts |
| Group attack AI (max 3) | paulcodes/deathblood-lazer | MIT | `src/game3d/federated/groupai.ts` | Ported, needs wiring into sim.ts |
| Hitbox/hurtbox | paulcodes/deathblood-lazer | MIT | Reference in `federation/combat/` | Pattern documented, sim.ts already has hitstop |

Original source files preserved in `tools/federation/combat/` for reference.

## Characters (CC0 — download via setup script)

| Pack | Source | License | Contents |
|------|--------|---------|----------|
| Universal Base Characters | https://quaternius.itch.io/universal-base-characters | CC0 | 6 bases, 20 hairstyles, 62 outfit parts |
| MPFB wardrobe | makehumancommunity/mpfb2 | CC0 | 12 outfits, 10 hairstyles (crowd) |

Setup: `bash tools/federation/setup-assets.sh` (itch.io requires manual click-through)

## Animations (CC0 — download via setup script)

| Pack | Source | License | Contents |
|------|--------|---------|----------|
| Universal Animation Library 1 | https://quaternius.itch.io/universal-animation-library | CC0 | 120+ clips, Mixamo-compatible |
| Universal Animation Library 2 | https://quaternius.itch.io/universal-animation-library-2 | CC0 | 130+ clips, melee combos split for canceling |
| FreeMotionPack1 | https://github.com/J-Beardmore/FreeMotionPack1 | Author grant | 21 FBX on Mixamo armature |
| qtmesheditor clips | https://github.com/fernandotonon/qtmesheditor | CC0 | 14 procedural clips + glTF writer |

## Environments (CC0)

| Pack | Source | License | Contents |
|------|--------|---------|----------|
| Downtown City MegaKit | https://quaternius.itch.io/downtown-city-megakit | CC0 | Modular buildings, streets, sidewalks |
| Kenney | https://kenney.nl/assets | CC0 | Furniture, city roads, buildings |
| Poly Haven | https://polyhaven.com | CC0 | PBR materials, HDRIs |

## Props / Breakables / Weapons (CC0)

| Pack | Source | License | Contents |
|------|--------|---------|----------|
| Fantasy Props MegaKit | https://quaternius.itch.io/fantasy-props-megakit | CC0 | 200+ models, 4 shared texture sets |
| Medieval Weapons | https://quaternius.itch.io/lowpoly-medieval-weapons | CC0 | 22 weapons |

## Physics (reference)

| System | Source | License | Use |
|--------|--------|---------|-----|
| Sketchbook | https://github.com/swift502/Sketchbook | MIT | three.js + Rapier architecture reference |
| Cell Fracture | Blender built-in | GPL (tool only) | Pre-fracture breakables pipeline |

## Integration Checklist

- [x] Combat code pulled and ported to TypeScript
- [ ] Wire lockon.ts into sim.ts player update
- [ ] Wire freeflow.ts into sim.ts attack logic
- [ ] Wire groupai.ts into sim.ts enemy AI
- [ ] Download Quaternius packs (manual itch.io step)
- [ ] Retarget UAL animations to 58-joint skeleton
- [ ] Build first city level from Downtown City MegaKit
- [ ] Pre-fracture breakables with Cell Fracture

## License Hygiene

- All licenses verified 2026-10-05 at pull time.
- itch.io packs: CC0 stated on page + in LICENSE.txt inside zips.
- "Verify" repos (no LICENSE file) NOT pulled — only MIT/PD/CC0 sources used.
- Bandai Namco mocap (CC-BY-NC-ND) explicitly excluded from commercial pipeline.

## Wave 5 — Yakuza / Urban Reign / Def Jam Systems Hunt (2026-10-05)

Continuous open-source pull for brawler-specific systems. All licenses verified at pull time.

### Brawler Combat Engines

| System | Source | License | What it does | AshLane fit |
|--------|--------|---------|--------------|-------------|
| YokosukaJS | https://github.com/allenu/YokosukaJS | MIT | Functional-programming beat-em-up engine in pure JavaScript | **HIGH** — JS-native, study combat loop architecture |
| Bebeu | https://github.com/sakai-nako/Bebeu | Apache-2.0 | 2.5D beat-em-up engine (Rust/Bevy + Dioxus editor) | Design reference — editor patterns |
| OpenBOR PLUS | https://github.com/whitedragon0000/OpenBOR_PLUS | BSD-3-Clause | 2D side-scrolling beat-em-up engine (C) | Design reference — the classic brawler engine |

### Yakuza-Style Minigames

| System | Source | License | What it does | AshLane fit |
|--------|--------|---------|--------------|-------------|
| dart-room | https://github.com/crispierry/dart-room | MIT | 3D browser darts (Three.js): Count Up, 301, Cricket, 3 CPU difficulties | **HIGH** — Three.js native, drop-in minigame pattern |
| simple-billiards-engine | https://github.com/cheesehackerxyz/simple-billiards-engine | MIT | Vanilla JS pool physics (no deps), mobile-friendly | **HIGH** — zero-dep physics for pool minigame |
| rhythm-game | https://github.com/ChloeLiang/rhythm-game | MIT | Web-based rhythm game (HTML/CSS/JS) | Karaoke minigame base |
| DeskArcade | https://github.com/bokhodirurinboev/deskarcade | MIT | Darts (501/double-out), bowling, paper toss (C#) | Design reference — minigame rules |
| FighterCommander | https://github.com/HeartlessSeph/FighterCommander | **UNVERIFIED** | Yakuza heat-action file format docs/extractor | Research only — documents heat action conditions |

### Faction / Reputation / Turf

| System | Source | License | What it does | AshLane fit |
|--------|--------|---------|--------------|-------------|
| rpg-game-rest (faction module) | https://github.com/ai-village-agents/rpg-game-rest | MIT | JS faction reputation: 8 levels (hated→exalted), rival/ally cascading, rewards, shop discounts | **HIGH** — JS-native, maps to Ashes/Combine/Hollows/Unaffiliated |
| gangland_warfare (turf spec) | https://github.com/luckyluckiest/gangland_warfare | MIT | GTA-style gang territory control spec | Design reference — turf capture rules |
| circleback | https://github.com/aleksicmarija/circleback | MIT | Real-time turf war (Three.js + TypeScript) | Design reference — territory mechanics |

### Dialogue Systems (beyond Yarn Spinner)

| System | Source | License | What it does | AshLane fit |
|--------|--------|---------|--------------|-------------|
| DialogueGraph | https://github.com/TeodorVecerdi/DialogueGraph | MIT | Node-based branching conversation trees (C#) | Design reference — graph patterns |
| Parley | https://github.com/bisterix-studio/parley | MIT | Graph-based dialogue plugin (GDScript) | Design reference — writer-friendly patterns |
| dialogue-engine | https://github.com/Rubonnek/dialogue-engine | MIT | Minimalist dialogue engine (GDScript) | Design reference — minimal patterns |

### Gaps (no clean open-source find yet)

- **Partner AI** (Urban Reign-style follow/assist/double-team) — no clean JS/MIT find; build from groupai.ts patterns
- **Regional damage** (head/upper/lower) — no standalone system found; implement in sim.ts
- **Weapon durability** (melee breakables) — no brawler-specific find; implement from Def Jam research
- **Momentum meter** (Def Jam-style) — no standalone find; implement from MISSION_FLOW_DEEP.md spec
- **Crowd reaction** — no standalone find; extend combat-sfx.ts crowd system
- **Random encounter spawner** — D&D generators found, none brawler-specific; build from city-seed.js

## License Hygiene (Wave 5)

- All licenses verified 2026-10-05 via GitHub API at search time.
- GPL-3.0 excluded: henryzt/Rhythm-Plus-Music-Game (copyleft, incompatible with commercial).
- UNVERIFIED excluded from code pull: haveaguess/fighting-simulator (no license), monster0506/pool (null), HeartlessSeph/FighterCommander (null), gsaurus/evolution-engine (null).
- "Verify" repos NOT pulled — only MIT/Apache-2.0/BSD/CC0 sources used.
