# AshLane Full Game Production Plan (2026-10-05)
The master plan. Everything documented here, in the repo.

## Vision
Urban Reign / Def Jam-style urban brawler. NOT a wrestling clone. NOT Tekken.

## What's Being Pulled In (Open Source, License-Verified)

### Characters
- **Quaternius** (CC0): 6 bases, 20 hairstyles, 12 outfits/62 parts. Modular.
- **MakeHuman/MPFB** (CC0): Parametric crowd bodies.

### Combat
- **Souls-like Controller** (PD): Lock-on, target cycling, buffered combos, hit reactions.
- **Batman Arkham Freeflow** (MIT): Freeflow targeting logic.
- **Deathblood Lazer** (MIT): Enemy group coordination (max 3 attackers).
- **Shoto Fighter** (MIT): Frame data (startup/active/recovery, hitstun, hitstop).

### Animations
- **FreeMotionPack1**: 21 FBX on Mixamo armature.
- **CMU**: Boxing, karate, kicks (specific IDs documented).
- **RancidMilk** (CC0): Full CMU library, glTF.
- **mixamo-llm-mocap** (MIT): Video-to-animation pipeline.

### Environments/Weapons/Breakables
- Wave 3 hunt in progress.

## Mission System (from Urban Reign research)
9 types: Exterminate, Assassinate, Timed, Don't Provoke, Boss Duel, Region Break, Weapon Steal, Partner, Escort.

## Health System (from Def Jam research)
Two-bar: Guts (recovers) + Health (permanent). Heat meter from gear.

## Destruction System (to build)
- Wall types: breakable vs. solid.
- Doors, tables, crates breakable.
- Wall collision for juggling/knockback.
- Debris chunks.

## Character Pipeline
1. Unified 58-joint skeleton (audit complete, Sombra rigging in progress).
2. Clean 1,421 garbage bone names from clips.
3. Backfill 298 Mixamo-only clips.
4. Rig all 22 unrigged models.

## Customization
- Texture Studio (done, in AshLane).
- Quaternius modular parts (pulling in).
- GNM/hair/clothes/accessories tabs (pending).

## Docs in Repo
- docs/MISSION_VARIETY.md
- docs/URBAN_REIGN_ANALYSIS.md
- docs/URBAN_REIGN_DEFJAM_RESEARCH.md
- docs/PRODUCTION_PLAN.md (this file)
