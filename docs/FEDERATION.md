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
