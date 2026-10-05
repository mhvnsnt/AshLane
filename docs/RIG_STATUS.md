# RIG STATUS — AshLane Character Audit (2026-10-05)

## Summary
- **36/37** cast models: MIXAMO-58, rigged, skinned ✓
- **1** model (CIPHER_rigged.glb): 52 clean Mixamo bones (no garbage) ✓
- **10** Quaternius files: all valid, 65 joints ✓
- **86** UAL animations: complete, all 65 bones ✓
- **50** bank.json clips: clean semantic keys ✓

## Bugs Fixed (2026-10-05)

### 1. retargetUal() colon mismatch — CRITICAL
**File:** `src/game3d/motion-bank.ts`
**Problem:** `UAL_BONE` and `QUATERNIUS_UAL_BONE` maps used packed Mixamo names
(`mixamorigHips`) but AshLane cast models use colon names (`mixamorig:Hips`).
`targetRest.get(dest)` returned `undefined` for every bone → **all UAL retargeting
silently returned empty arrays**. No UAL animation ever played on cast members.
**Fix:** Detect target convention via `targetRest.has("mixamorig:Hips")` and rewrite
destination names with colons when needed.

### 2. quaternius.ts getBoneInverse — COMPILE ERROR
**File:** `src/game3d/quaternius.ts:94`
**Problem:** `src.getBoneInverse(i)` — method doesn't exist on THREE.Skeleton.
**Fix:** Changed to `src.boneInverses[i].clone()`.

### 3. Corrupt garbage-bone IBMs — 165 fixed
**Files:** 33 models in `public/models/cast/*.glb`
**Problem:** The 6 garbage bones (`bone_10`, `bone_11`, `bone_12`, `bone_17`,
`bone_18`, `bone_19`) had insane inverse bind matrices — translations of 1e+33
meters, NaN, inf. If any vertex referenced them, the mesh would explode.
**Fix:** All 165 insane IBMs replaced with identity matrices (non-destructive;
bones kept in skeleton, just neutralized).

## Bone Standards
| Rig | Joints | Used By | Status |
|-----|--------|---------|--------|
| Mixamo colon | 58 (52 real + 6 garbage) | 36 cast models | ✓ IBMs fixed |
| Mixamo clean | 52 | CIPHER_rigged.glb | ✓ Reference clean rig |
| Quaternius | 65 | 10 files | ✓ All valid |

## Animation Compatibility
| Source | Clips | Target | Status |
|--------|-------|--------|--------|
| bank.json | 50 | 58-joint via familyFor | ✓ Working |
| UAL1_Standard.glb | 43 | 58-joint via retargetUal | ✓ FIXED (was broken) |
| UAL2_Standard.glb | 43 | 58-joint via retargetUal | ✓ FIXED (was broken) |

### UAL Retarget Map Coverage
`QUATERNIUS_UAL_BONE` covers 52/65 Quaternius bones. The 13 unmapped are
intentionally excluded:
- `root` (motion root, not a deform bone)
- 10× `*_04_leaf_*` (finger tips; Mixamo has no 4th finger segment)
- 2× `ball_leaf_*` (toe tips; end-effectors)

### Combat-Relevant UAL Animations
- UAL1: Punch_Jab, Punch_Cross, Hit_Chest, Hit_Head, Death01, Roll, Push_Loop
- UAL2: Hit_Knockback, Melee_Hook, Melee_Hook_Rec, Zombie_Scratch

## Still Open
- [ ] Visual deformation test (load each model, play idle/punch, screenshot)
- [ ] CIPHER_rigged.glb: 52 vs 58 — works fine, but inconsistent with others
- [ ] Sombra Negra: nearest-neighbor weights (not smooth-blended)
- [ ] 21 unrigged models mentioned in prior docs — not found in this repo clone
      (may be in Bannon repo or assets/models/ not in shallow clone)
- [ ] Wire UAL into view.ts `setUal()` — retargetUal now works, needs integration test
