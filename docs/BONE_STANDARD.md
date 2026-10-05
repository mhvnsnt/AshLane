# AshLane Bone Standard

**Version:** 1.0  
**Date:** 2026-10-05  
**Status:** ✅ Implemented — all fighter models standardized

## The Standard

**Format:** Mixamo colon (`mixamorig:Hips`)  
**Count:** 52 bones  
**Reference:** `public/models/cast/CIPHER_rigged.glb` (the clean model)

### Why This Standard

- 36/47 fighter models already used Mixamo colon format
- Mixamo is the industry standard for game character rigs
- All UAL animations now use these exact names
- With consistent names, animations play directly — no retargeting needed for 90% of cases

### The 52 Bones

```
mixamorig:Hips, mixamorig:Spine, mixamorig:Spine1, mixamorig:Spine2,
mixamorig:Neck, mixamorig:Head,
mixamorig:RightShoulder, mixamorig:RightArm, mixamorig:RightForeArm, mixamorig:RightHand,
mixamorig:LeftShoulder, mixamorig:LeftArm, mixamorig:LeftForeArm, mixamorig:LeftHand,
mixamorig:RightUpLeg, mixamorig:RightLeg, mixamorig:RightFoot, mixamorig:RightToeBase,
mixamorig:LeftUpLeg, mixamorig:LeftLeg, mixamorig:LeftFoot, mixamorig:LeftToeBase,
mixamorig:LeftHandThumb1, mixamorig:LeftHandThumb2, mixamorig:LeftHandThumb3,
mixamorig:LeftHandIndex1, mixamorig:LeftHandIndex2, mixamorig:LeftHandIndex3,
mixamorig:LeftHandMiddle1, mixamorig:LeftHandMiddle2, mixamorig:LeftHandMiddle3,
mixamorig:LeftHandRing1, mixamorig:LeftHandRing2, mixamorig:LeftHandRing3,
mixamorig:LeftHandPinky1, mixamorig:LeftHandPinky2, mixamorig:LeftHandPinky3,
mixamorig:RightHandThumb1, mixamorig:RightHandThumb2, mixamorig:RightHandThumb3,
mixamorig:RightHandIndex1, mixamorig:RightHandIndex2, mixamorig:RightHandIndex3,
mixamorig:RightHandMiddle1, mixamorig:RightHandMiddle2, mixamorig:RightHandMiddle3,
mixamorig:RightHandRing1, mixamorig:RightHandRing2, mixamorig:RightHandRing3,
mixamorig:RightHandPinky1, mixamorig:RightHandPinky2, mixamorig:RightHandPinky3,
```

**Bone order matters:** The joints array must list bones in exactly this order for
index-based systems. Name-based systems work regardless of order.

## What Was Done (2026-10-05)

### 1. Cast Models (36 files) — Garbage Bones Renamed
**Location:** `public/models/cast/*.glb` (excluding `quaternius/` and `CIPHER_rigged.glb`)

**Problem:** 6 garbage bones (`bone_10`, `bone_11`, `bone_12`, `bone_17`, `bone_19`)
with zero weights and neutralized (identity) inverse bind matrices.

**Solution:** Renamed to `mixamorig:Unused10` etc. (JSON-only, no binary changes).

**Why not removed:** The JOINTS_0 vertex attribute data in these files reads as
corrupt/garbage. Removing joints requires remapping JOINTS_0, which is unsafe
with corrupt data. The 6 bones are harmless — they have:
- Zero vertex weights (verified)
- Identity IBMs (neutralized by earlier fix)
- Clear UNUSED names (no code will mistake them for real bones)

**Result:** 58 joints (52 standard + 6 UNUSED). All 52 standard bones have
identical names and order.

### 2. Quaternius Models (20 files) — Full 65→52 Conversion
**Locations:** 
- `public/models/cast/quaternius/` (10 files)
- `assets/characters/quaternius/` (10 files)

**Problem:** 65 bones with Unreal Engine naming (`pelvis`, `spine_01`, etc.)

**Solution:** Full conversion via `tools/bone-standard/convert_quaternius.py`:
- Renamed 52 bones to Mixamo colon format (exact UE→Mixamo mapping)
- Dropped 13 bones: `root`, 10 finger leaves (`*_04_leaf_*`), 2 toe leaves (`ball_leaf_*`)
- Remapped JOINTS_0 vertex attributes (data was valid in these files)
- Rebuilt inverseBindMatrices in standard order
- Reordered joints array to match the 52-bone standard exactly

**Result:** 52/52 exact match. Skinning verified (weights sum to 1.0, indices valid).

### 3. UAL Animation Files (4 files) — 65→52 with Channel Updates
**Locations:**
- `assets/characters/quaternius/UAL1_Standard.glb`, `UAL2_Standard.glb`
- `public/motion/ual/UAL1_Standard.glb`, `UAL2_Standard.glb`

**Solution:** Same converter, plus animation channel cleanup:
- Renamed 52 bones to Mixamo format
- Removed 39 animation channels per clip (13 dropped bones × 3 channels: translation/rotation/scale)
- 43 animations preserved per file, all targeting valid Mixamo-named bones

**Result:** Animations now play directly on any 52-bone model without retargeting.

### 4. Background Models
- **`public/models/humanoid/drifter.glb`** (53 bones): Rigify `DEF-*` names → Mixamo.
  `root` → `mixamorig:UnusedRoot`. JSON-only.
- **`public/models/humanoid/mannequin.glb`** (49 bones): Added `mixamorig:` prefix
  to 19 stripped names. Missing `Spine1`, `LeftToeBase`, `RightToeBase` (documented,
  not added — background model).

## Verification

Run: `python3 tools/bone-standard/verify_standard.py`

**Results (2026-10-05):**
- ✅ **23 models:** Perfect 52/52 exact match (all Quaternius, UAL files, CIPHER)
- ⚠️ **37 models:** 52 standard + clearly-marked extras (36 cast + drifter)
- ❌ **14 models:** Different skeletons (out of scope, see below)

**Total: 60 models have all 52 standard bones with identical names.**

## Out of Scope

These models use fundamentally different skeletons and are NOT part of the
52-bone fighter standard:

| Models | Bones | Reason |
|--------|-------|--------|
| `public/models/kaykit/*.glb` (9 files) | 41 | Chibi-style crowd characters. Selectable crowd style option, not fighters. |
| `public/models/humanoid/Soldier_*.glb` (2 files) | 23 | Background military NPCs |
| `public/models/humanoid/Zombie_*.glb` (2 files) | 23 | Background zombie NPCs |
| `public/models/humanoid/mannequin.glb` | 49 | Missing 3 bones. Background/test model. |

If these need Mixamo animations in the future, they'll require full re-rigging
(new skeleton + skinning), not just renaming.

## Tools

All scripts in `tools/bone-standard/`:

| Script | Purpose |
|--------|---------|
| `standardize_all.py` | Master script — runs all conversions in-place |
| `convert_quaternius.py` | UE 65-bone → Mixamo 52-bone (full: rename + drop + remap + IBM rebuild) |
| `rename_garbage.py` | Cast models: rename 6 garbage bones (JSON-only, safe) |
| `rename_humanoid.py` | drifter (Rigify→Mixamo) and mannequin (add prefix) |
| `verify_standard.py` | Verify all models match the standard |

### Re-running

```bash
# From repo root
python3 tools/bone-standard/standardize_all.py   # Convert all
python3 tools/bone-standard/verify_standard.py   # Verify
```

**Warning:** `standardize_all.py` modifies files in-place. The repo is git-tracked;
revert with `git checkout -- public/models/ assets/` if needed.

## For Developers

### Loading a model
All fighter models now have identical bone names. To play an animation:
1. Load the model GLB
2. Load the animation (from UAL files or any Mixamo-format source)
3. Match by bone NAME — no retargeting needed

### Adding a new character
1. Rig to the 52-bone Mixamo standard (or use the character generator)
2. Verify with `verify_standard.py`
3. Bone names MUST match exactly (including `mixamorig:` prefix and capitalization)
4. Bone order SHOULD match the standard list above

### The universal retargeter
`src/game3d/universal-retarget.ts` still exists for:
- Importing animations from non-standard sources (e.g., new Mixamo downloads with different naming)
- The 14 out-of-scope models if they ever need fighter animations
- Third-party assets

For the 60 standardized models, direct name-based animation playback is preferred.
