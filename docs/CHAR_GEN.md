# Procedural Character Generator — CHAR_GEN

`src/game3d/char-gen.ts` — the infinite grunt roster.

## Why

The owner doesn't want to hand-build every low-level fighter in Tripo.
Named characters (Ash, Sombra Negra, Onyx…) stay hand-made in `roster.ts`.
Everyone else — street thugs, Combine security, Hollows, mercs — comes from
here: `generateGrunt("combine")` returns a unique fighter every call.

## Design (open-source patterns, cited in the file header)

- **earth-online** (tsko71): FIXED CATALOG + DETERMINISTIC RECIPES.
  The generator never creates meshes at runtime; it picks a recipe from a
  reviewed finite catalog. Same seed → same grunt, always.
- **undercity** (rubentipparach/fps-game-demo): phenotype table → body/hair/
  clothes variants; rig + weights from the shared base; look from the table.
- **agentropolis-creator** (wiredchaos): hero mode vs NPC population mode.
  Same split here: `roster.ts` = heroes, `char-gen.ts` = population.
- **MakeHuman / MPFB2**: the offline parametric-body reference. Our runtime
  equivalent is the Quaternius CC0 base bodies + tinted materials
  (already in-repo, `assets/characters/quaternius/`).

## What varies per grunt

| Axis | Source |
|---|---|
| Body (male/female) | Quaternius base bodies, faction-weighted |
| Skin tone | 10-tone palette, faction-weighted |
| Height / bulk | Root scale + x/z scale, faction ranges |
| Hair, beard, brows | 8 Quaternius parts via `attachPart()` |
| Shirt / pants / accent | Material tint by name slot (shirt/pants/accent) |
| Clothing pattern | solid / camo / stripes / graffiti (see below) |
| Fighting style | street / boxing / kickboxing / wrestling / martial-arts / lucha |
| Level 1–5 | HP/damage scaling |

## Factions (docs/STORY_BIBLE.md §4)

| Faction | Look | Styles |
|---|---|---|
| **Ashes** | Earth tones, ember-orange accent | street, boxing, wrestling |
| **Combine** | Navy/slate corporate, Halcyon blue accent, buzzed hair bias, heavier builds | boxing, wrestling, martial-arts |
| **Hollows** | Char black/ash gray, dying-ember red, gaunt, long hair, beards | street, martial-arts |
| **Unaffiliated** | Tactical darks, mercenary gold accent | all six styles |

## API

```ts
import { generateGrunt, generateSquad, generateCrowd, missionWave,
         gruntToFighter, assembleGrunt } from "./char-gen";

// One random Combine thug
const grunt = generateGrunt("combine");

// 5 seeded Hollows (same seeds = same squad, every run)
const squad = generateSquad("hollows", 5, 1234);

// Mission wave with level bounds (swarm missions just ask for more)
const wave = missionWave("combine", 8, missionSeed, 2, 4);

// Roster/sim-compatible entry
const fighter = gruntToFighter(grunt);
// -> { id, name, martial, bio, faction, seed, bodyFile, hpMul, dmgMul, speedMul }

// Runtime: load body + parts with GLTFLoader, then:
const live = assembleGrunt(recipe, { body, parts });
```

## Animation mapping

Each `FightStyle` maps to UAL clip names on the Quaternius rig
(no retargeting needed — see `quaternius.ts`):
idle / jab / cross / hook / hit / knockdown / getup / special.
Style stat modifiers: wrestlers are tanky but slow, lucha is fast but
fragile, etc. (`FIGHT_STYLES`).

## Clothing patterns

`pattern` is an intent field (`solid | camo | stripes | graffiti`).
`view.ts` resolves it via `tools/generative/svg-textures.js` (bakes a
data-URI texture, applied as a map multiply on the shirt material).
`patternSeed` keeps it deterministic per grunt.

## Anti-slop notes

- Recipes are pure data — testable without a renderer
  (`generateGrunt` has 18 passing unit checks: determinism, distributions,
  ranges).
- No new meshes, no new textures, no new rigs. Two CC0 bodies + 8 CC0
  parts + tinting = effectively infinite roster.
- Named/story characters are NEVER generated — they stay hand-authored.
