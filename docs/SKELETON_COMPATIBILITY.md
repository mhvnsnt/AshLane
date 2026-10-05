# Skeleton Compatibility — AshLane Universal Retargeter

**Module:** `src/game3d/universal-retarget.ts`
**Rule:** drop ANY animation in, it plays on ANY model. No manual per-clip work.

## Skeletons in the repo (measured 2026-10-05)

| Skeleton | Joints | Models | Naming | Notes |
|----------|--------|--------|--------|-------|
| Mixamo 58 (colon) | 58 | 36 cast GLBs | `mixamorig:Hips` | 52 real joints + 6 neutralized garbage bones (`bone_10/11/12/17/18/19`) |
| Mixamo 52 (colon) | 52 | `CIPHER_rigged.glb` | `mixamorig:Hips` | Clean reference: no finger-4 segments, no toe ends |
| Quaternius 65 | 65 | 2 bodies + 8 parts | `pelvis`, `spine_01`… | Unreal-style; 13 bones have no Mixamo equivalent (`root`, 10 finger-tip leaves, 2 toe leaves) |

No cast model ships embedded animations — all clips are external.

## Animation sources (measured 2026-10-05)

| Source | Clips | Bone convention | Status |
|--------|-------|-----------------|--------|
| UAL1/UAL2 Standard | 86 | Quaternius 65, UE names | Native on Quaternius bodies; retargeted to Mixamo cast |
| `bank.json` | 50 (+7 victim) | Abstract slots (`hips`, `upperArmL`…) | Baked per-skeleton by `bakeMotion()` via `familyFor()` |
| Bannon `assets/moves/clips/` | 973 JSON | 19 abbreviated bones, **positional** keyframes | Name bridge mapped; rotation synthesis needs IK pass (future) |
| Mixamo downloads (owner) | — | Mixamo stripped/packed | Direct via canonical slots |
| CMU mocap / BVH | — | Varies | `parseBVH()` → clip → retarget |

## How it works

1. **Canonical slots.** Every family maps to ~55 canonical slots (Mixamo stripped
   names). N families need 2N maps, not N².
2. **Auto-detect.** `detectFamily()` reads bone names — colon vs packed vs
   stripped Mixamo, Quaternius/UE, Rigify, KayKit, Bannon positional.
3. **Rest-relative transfer.** `out = targetRest × inv(sourceRest) × key`, so
   clips authored on one rest pose land correctly on another.
4. **Same-family fast path.** Direct bone-name match preserves `root` and
   finger/toe leaves that have no canonical slot.
5. **BVH.** `parseBVH()` converts Euler channels (any order) to quaternions,
   root position scaled via `positionScale`.

## Test matrix (2026-10-05, Node + three.js)

### Coverage: clip bones → target bones

| Source → Target | mixamo-colon-58 | mixamo-colon-52 | quaternius-65 |
|---|---|---|---|
| UAL1 (quat-native) | 52/65 (80%) | 52/65 (80%) | 65/65 via same-family path |
| bank.json (slots) | via `bakeMotion` | via `bakeMotion` | via `bakeMotion` |
| Bannon JSON (positional) | 19/19 names | 19/19 names | 19/19 names |
| Mixamo DL (stripped) | 52/55 (95%) | 52/55 (95%) | 52/55 (95%) |

Dropped bones are always end-effectors (`root`, finger-4 leaves, toe leaves,
`HeadTop_End`) — they carry no meaningful animation. The 58-joint cast models
are missing `HeadTop_End`/`LeftToe_End`/`RightToe_End` (never animated anyway).

### Functional tests

- **Rotation transfer:** 90° source delta onto 45° target rest → 135° output,
  error 0.027° (float32 quantization). **PASS**
- **BVH parse:** 2-frame BVH → 3 tracks → retargeted to `mixamorig:Hips`
  (quaternion + scaled position). **PASS**
- **End-to-end (real data):** UAL `Punch_Jab` decoded from `UAL1_Standard.glb`
  binary (130 tracks) → retargeted onto Sombra's real 58-joint bone list →
  53 tracks, 53/53 on real bones, all unit quaternions. **PASS**

### Known limits

- Bannon's 973 JSON clips are **positional** — bone names bridge 100%, but
  turning positions into rotations needs an IK/pose-solver pass (not in this
  module).
- Position tracks only transfer for the root/hips bone; limb positions are
  skipped (rotations carry the pose).
- Scale tracks are ignored (no AshLane source uses them).
