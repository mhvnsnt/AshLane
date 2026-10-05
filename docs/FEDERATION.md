# AshLane Asset Federation (2026-10-05)

Every open-source system pulled in, where it lives, license, and integration status.

## Combat Systems (code pulled, TypeScript ports written)

| System | Source | License | AshLane location | Status |
|--------|--------|---------|------------------|--------|
| Lock-on targeting | prashanna135/souls-like-controller | Public domain | `src/game3d/federated/lockon.ts` | ✅ WIRED (2026-10-05): `sim.lock`, `bufLock`/`prevLock`, `input.lock` edge → `lockOnPress`; per-frame `lockOnUpdate`; "Locked on" banner; auto-clear on spawn/warp; target priority in freeflow |
| Freeflow targeting | celojevic/batman-arkham-combat | MIT | `src/game3d/federated/freeflow.ts` | ✅ WIRED (2026-10-05): `beginSwing` picks lock target → steer-direction enemy → nearest; `freeflowLunge` magnetic lunge (0.14s, capped 10 u/s); falls back to `commitFacing` |
| Group attack AI (max 3) | paulcodes/deathblood-lazer | MIT | `src/game3d/federated/groupai.ts` | ✅ WIRED (2026-10-05): `requestAttack` gate on grunt windup entry; `releaseAttack` on atk→free; stale tokens self-prune; reset on spawn/warp. Smoke test: max 2 simultaneous attackers over 600 frames |
| Per-entity hitstop | paulcodes/deathblood-lazer | MIT | `src/game3d/sim.ts` (`Body.stopT`) | ✅ WIRED (2026-10-05): `hurt()` sets victim `stopT`; `hitGrunts` + grunt bite set attacker `stopT`; frozen bodies skip update/move/separation; global `sim.hitstop` kept for wall slams + specials. Smoke test: 0 movement during freeze, resumes after |
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
- [x] Wire lockon.ts into sim.ts player update (commit 8a25bf8 — `sim.lock`, `bufLock`, `input.lock`)
- [x] Wire freeflow.ts into sim.ts attack logic (commit 8a25bf8 — `beginSwing` magnetic lunge)
- [x] Wire groupai.ts into sim.ts enemy AI (commit 8a25bf8 — token gate + release)
- [x] Per-entity hitstop wired (`Body.stopT`, commit 8a25bf8)
- [ ] Lock-on camera bias in view.ts/mount.ts (sim side done; camera + HUD reticle pending)
- [ ] Lock-on touch button in mount.ts (wires `input.lock`; sim side ready)
- [ ] Counter system (skipped — owner questions pending per COMBAT_INTEGRATION.md Part 5)
- [ ] Combo buffer tuning to 150ms (design done, constants pending)
- [ ] Hit reaction rules: no-stun-lock, hit-interrupts-actions (design done, pending)
- [ ] Strafe/reposition AI for token-denied grunts (design done, pending)
- [ ] Download Quaternius packs (manual itch.io step)
- [ ] Retarget UAL animations to 58-joint skeleton
- [ ] Build first city level from Downtown City MegaKit
- [ ] Pre-fracture breakables with Cell Fracture

## License Hygiene

- All licenses verified 2026-10-05 at pull time.
- itch.io packs: CC0 stated on page + in LICENSE.txt inside zips.
- "Verify" repos (no LICENSE file) NOT pulled — only MIT/PD/CC0 sources used.
- Bandai Namco mocap (CC-BY-NC-ND) explicitly excluded from commercial pipeline.
