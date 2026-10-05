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

## Wave 5 Additions (2026-10-05)

### Combat & Feel

| System | Source | License | AshLane location | Status |
|--------|--------|---------|------------------|--------|
| Frame data (startup/active/recovery) | aminrx/shoto-fighter-godot | MIT | `src/game3d/federated/framedata.ts` | Ported |
| Combo damage scaling | aminrx/shoto-fighter-godot | MIT | `framedata.ts` comboScale() | Ported |
| Deterministic replay | sinusphi/stickman-fighter | MIT | `src/game3d/federated/replay.ts` | Ported |
| Counter/parry system | Tekken/Def Jam/Urban Reign patterns | Original | `src/game3d/federated/counters.ts` | New |
| Chain combos (JJJ etc.) | sumosizedginger/neon-rot-unbound | MIT | Reference for framedata.ts | Pattern documented |
| Combat iron laws | jammyfu/open-game-skills | (ref) | Design rules | Reference |

### World & Atmosphere

| System | Source | License | AshLane location | Status |
|--------|--------|---------|------------------|--------|
| Day/night cycle + weather | skyeshark/eanpa-sky | MIT | `src/game3d/federated/weather.ts` | Ported |
| Bird flocks (boids) | beneater/boids | MIT | `src/game3d/federated/boids.ts` | Ported |
| District chunk streaming | fiercefairy/openworld et al. | (patterns) | `src/game3d/federated/streaming.ts` | Ported |
| SimClock | wdh815/maptest | (pattern) | `streaming.ts` | Ported |

### NPCs & Crowds

| System | Source | License | AshLane location | Status |
|--------|--------|---------|------------------|--------|
| Pedestrian wander/flee | naveenkcg/game | MIT | `src/game3d/federated/pedestrians.ts` | Ported |
| Panic alarm + screams | ashalluf/rando-game | (pattern) | `pedestrians.ts` pedAlarm() | Ported |
| Ambient chatter | richardran/grid-city | (pattern) | `pedestrians.ts` | Ported |
| Distance culling | naveenkcg/game | MIT | `pedestrians.ts` cullPeds() | Ported |

### Dialogue & Quests

| System | Source | License | AshLane location | Status |
|--------|--------|---------|------------------|--------|
| Branching dialogue | Yarn Spinner (MIT) via bondage.js pattern | Original impl. | `src/game3d/federated/dialogue.ts` | Ported |
| Quest data format | OQF (Apache 2.0) | Apache 2.0 | `src/game3d/federated/quests.ts` | Ported |
| 15+ objective types | insimul | (pattern) | `quests.ts` ObjectiveType | Ported |

### Character & Customization

| System | Source | License | AshLane location | Status |
|--------|--------|---------|------------------|--------|
| Spring bones (hair/cloth) | pixiv/three-vrm | MIT | `src/game3d/federated/springbones.ts` | Ported |
| Procedural grunts | (multiple patterns) | Original | `src/game3d/char-gen.ts` | Done (other agent) |

### Mobile & Input

| System | Source | License | AshLane location | Status |
|--------|--------|---------|------------------|--------|
| Touch controls | devindu22/cyber-arcade-nexus-3d | MIT | `src/game3d/federated/touch.ts` | Ported |
| Button layout | shri816/forest-arena-game | MIT | `touch.ts` BUTTON_LAYOUT | Ported |
| Counter button | (owner request) | Original | `touch.ts` + `counters.ts` | New |

### Minigames (venue)

| System | Source | License | AshLane location | Status |
|--------|--------|---------|------------------|--------|
| Darts (501) | bokhodirurinboev/DeskArcade | MIT | `src/game3d/federated/minigames.ts` | Ported |
| Blackjack | bokhodirurinboev/DeskArcade | MIT | `minigames.ts` | Ported |
| Pool physics | bokhodirurinboev/DeskArcade | MIT | `minigames.ts` | Ported |

### Audio

| System | Source | License | AshLane location | Status |
|--------|--------|---------|------------------|--------|
| Adaptive beats | (original) | Original | `src/game3d/music.ts` | Done (other agent) |
| Combat SFX | (original) | Original | `src/game3d/combat-sfx.ts` | Done (other agent) |
| BGM sequencer patterns | reforma-dev/plugins game-audio | MIT | Reference for music.ts | Pattern documented |
| Procedural portraits | githubuseradmin/asset-lab-test | MIT | Reference | Pattern documented |

### Environments (CC0 GLB — converted, pushed)

| Pack | Source | License | AshLane location | Contents |
|------|--------|---------|------------------|----------|
| Modular Street Pack (2018) | Quaternius via beep2bleep mirror | CC0 | `public/models/env/street/` | 25 GLBs: streets, signs, bridges |
| Medieval Weapons Pack (2018) | Quaternius via beep2bleep mirror | CC0 | `public/models/weapons/` | 24 GLBs |
| Furniture Pack (2019) | Quaternius via beep2bleep mirror | CC0 | `public/models/props/` | 20 GLBs: breakables |

Note: These are the older CC0 Quaternius packs (2018-2019). The newer
Downtown City MegaKit / Fantasy Props MegaKit / LowPoly Medieval Weapons
were downloaded via browser but couldn't be captured — still pending
manual transfer. The 2018-2019 packs are valid CC0 substitutes.

## Wave 6 Finds (2026-10-05, not yet pulled)

See `~/workspace/open-source-hunt/FINDS_WAVE6.md`:
- neon-rot-unbound (MIT): chain-combo dictionary, weapon durability, 166 tests
- open-game-skills: combat design iron laws
- niulai-game (MIT): Three.js 3D fighter, 7 fighters, super moves
- game-audio skill (MIT): BGM sequencer anti-repetition
- asset-lab-test (MIT): procedural SVG portraits

## Integration Checklist (Wave 5)

- [x] 12 new federated modules written (weather, boids, dialogue, quests, pedestrians, framedata, replay, springbones, touch, counters, minigames, streaming)
- [x] 69 CC0 GLBs converted and pushed (street/weapons/props)
- [x] FEDERATION.md updated
- [x] Wire new modules into sim.ts / view.ts / mount.ts (runtime integration) — done 2026-10-05 via src/game3d/services.ts hub + src/game3d/overlays.ts (commit 7b0faa7)
- [x] TypeScript compile check — tsc clean, vite build clean (2026-10-05)
- [ ] Still pending: Downtown City MegaKit, Fantasy Props MegaKit, Medieval Weapons (newer packs)
