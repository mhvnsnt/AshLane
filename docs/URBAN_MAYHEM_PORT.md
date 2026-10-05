# Urban Mayhem → AshLane Port

**Source:** `mhvnsnt/URBAN-MAYHEM-` (Sleeping Dogs / GTA-style open-world brawler)
**Target:** `mhvnsnt/AshLane` (`src/game3d/urban-mayhem/`)
**Date:** 2026-10-05
**Owner directive:** Port everything that fits. No guns. No driving.

---

## Ported Systems

| Module | Source | Status | Notes |
|--------|--------|--------|-------|
| `disciplines.ts` | `Godot/scripts/combat_style_system.gd` | ✅ Ported | 24 disciplines × 8 modifiers = 192 styles. Full data + assign/get/preferred logic. |
| `movesets.ts` | `Game/src/combat.js` (MOVESETS) | ✅ Ported | 9 style move pools (street, boxer, muaythai, wrestler, mma, drunken + kickboxer, capoeira, lucha). Per-move dmg/dur/hitAt/poise/stam. |
| `frame-data.ts` | `Godot/scripts/combat_director.gd` (MOVES) | ✅ Ported | 22 moves: startup/active/recovery/damage/poise/range/stamina. |
| `melee-weapons.ts` | `Game/src/weapons.js` (WEAPONS) | ✅ Ported | 8 melee: knife, bat, pipe, chair, crowbar, machete, katana, unarmed. Mapped to sim.ts Weapon type. |
| `npc-ai.ts` | `Game/src/ai.js` (NPC, FACTIONS) | ✅ Ported | 6-state brain FSM (wander/flee/fight/pursue/investigate/idle). Factions adapted to AshLane's 4 + civilian + police. Gun fields stripped. |
| `street-events.ts` | `Game/src/street-events.js` | ✅ Ported | 3 dynamic encounters: ambush, rescue, police raid. Cooldowns, rewards, XP. |
| `heat.ts` | `Game/src/meta.js` (Heat, CRIME) | ✅ Ported | Wanted system. Gun/driving crimes removed. 6 brawler crimes. Star thresholds. Evade logic. |
| `circuit.ts` | `Game/src/careers.js` (CIRCUIT_TIERS) | ✅ Ported | 6-tier underground fight circuit. Purses, entry fees, HP/skill scaling. |
| `districts.ts` | `Game/src/world.js` (REGIONS) | ✅ Ported | AshLane's 6 districts with density/wealth/heatBias/gang fields (same schema as UM regions). |
| `combat-ai.ts` | `Godot/scripts/combat_ai_director.gd` | ✅ Ported | Utility-scoring AI. 5 archetypes. Style-aware bonuses (muay-thai → kicks, wrestler → takedowns). Threat memory. |

**Verification:** TypeScript strict compile clean. 10-system smoke test passed (192 styles, frame data, NPC hostility, heat stars, circuit progression, AI style-aware decisions).

---

## Skipped (per owner directive)

| System | Source | Reason |
|--------|--------|--------|
| Firearms (pistol, revolver, smg, shotgun, rifle, marksman) | `Game/src/weapons.js` | **No guns in AshLane.** Owner directive. |
| Thrown explosives (molotov, grenade) | `Game/src/weapons.js` | Not brawler weapons. Owner said "guns and some of the weapons." |
| Bullet time | `Game/src/weapons.js` (BulletTime) | Tied to gunplay. Could revisit for Flame powers. |
| Ballistics / raycast | `Game/src/weapons.js` | Gun-specific. Not needed. |
| Vehicles / driving | `Game/src/vehicles.js`, `Godot/scripts/vehicle_*.gd` (12 files) | AshLane is a brawler, not a driving game. |
| Garage system | `Godot/scripts/garage_system.gd` | Driving-adjacent. |
| The Blocks (drug economy) | `Game/src/careers.js` (GOODS) | Owner didn't ask. Could port later as a side activity. |
| The Wheel (street racing) | `Game/src/careers.js` | Driving. Skipped. |
| Hired Gun (gun contracts) | `Game/src/careers.js` | Guns. Skipped. |
| Police pursuit / chase AI | `Godot/scripts/pursuit_director.gd`, `police_director.gd` | Driving-adjacent. Heat system ported; pursuit not needed for brawler. |
| InstancedMesh actor renderer | `Game/src/actor.js` (ActorRenderer) | AshLane uses GLB models, not box-limb instancing. Ragdoll *concept* is valuable; renderer doesn't fit. |
| Verlet ragdoll skeleton | `Game/src/actor.js` (J, REST, BONES) | Different rig approach than AshLane's 58/65-joint GLBs. Logic could inform future ragdoll. |
| UE5 C++ source | `Source/UrbanMayhem/` | Unreal Engine. AshLane is Three.js/TypeScript. Not portable. |
| World chunk streaming | `Game/src/world.js` (partial) | Only REGIONS data ported. Full chunk-streaming is engine-specific; AshLane has its own world system. |

---

## Integration Points (for future work)

These ports are **standalone modules**. Wiring into AshLane's live systems:

1. **`disciplines.ts` → `char-gen.ts`**: Replace/augment the 11 `FightStyle` entries with the full 24-discipline system. Use `disciplineToFightStyle()` as the bridge.
2. **`movesets.ts` → `sim.ts`**: Feed per-style move pools into the attack resolver. `hitAt` fraction maps to animation timing.
3. **`frame-data.ts` → `sim.ts`**: Use startup/active/recovery for hit-stop and combo windows.
4. **`melee-weapons.ts` → `sim.ts`**: Already maps to `Weapon` type (`pipe`, `board`, `blade`, etc.). Wire `dmg`/`reach`/`rate` into damage calc.
5. **`npc-ai.ts` → world NPC spawner**: The brain FSM drives civilian/gang behavior. Needs position/movement integration.
6. **`street-events.ts` → mission system**: Hook `tickStreetEvents` into the game loop. Needs NPC spawner + `world.blocked()` equivalent.
7. **`heat.ts` → game state**: Wire `heat.add("assault")` etc. into combat resolution. `districtHeatBias()` provides per-district multipliers.
8. **`circuit.ts` → menu/mode system**: The Circuit is AshLane's tournament mode backbone.
9. **`combat-ai.ts` → `sim.ts` enemy AI**: Replace or augment existing enemy decision logic with utility scoring.

---

## File Map

```
src/game3d/urban-mayhem/
├── index.ts          # barrel export
├── disciplines.ts    # 24 × 8 style system
├── movesets.ts       # per-style move pools
├── frame-data.ts     # combat frame data
├── melee-weapons.ts  # 8 melee weapons (no guns)
├── npc-ai.ts         # NPC brain FSM + factions
├── street-events.ts  # dynamic encounters
├── heat.ts           # wanted system
├── circuit.ts        # underground fight circuit
├── districts.ts      # 6 AshLane districts
└── combat-ai.ts      # utility-scoring AI
```
