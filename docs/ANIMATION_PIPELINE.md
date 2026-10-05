# AshLane Animation Pipeline

One pipeline for all animations: Mixamo, open-source mocap, Bannon library, generative.

## Sources

### 1. bank.json (50 clips, in-repo)
Existing JSON-format clips. Categories:
- **Strikes** (9): bodyblow, boxing, boxing1-3, combo, elbow, jabcross, knee, rib, slugger
- **Capoeira** (6): capoeira, au, esquiva, ginga, gingaback, gingaside
- **Drunk** (2): drunkidle, drunkwalk
- **Grapples** (7): backdrop, brainbuster, chokeslam, ddt, german, suplex, takedown
- **Hit reactions** (5): hit, hitback, hitbody, hithead, hitside
- **Get-ups** (2): kip, rise
- **Knockdowns** (2): fallflat, flat
- **Jumps** (2): bigjump, crossjump
- **Guards** (5): block, guardhigh, guardlow, crouch, stancecrouch
- **Other** (10): corkscrew, crossjump, defender, dropkick, evade, feral, hurricane, tiger, combo

### 2. UAL1 + UAL2 (86 clips, GLB format)
Quaternius Universal Animation Library. 65-joint rig (native, no retarget needed).
Location: `public/motion/ual/UAL1_Standard.glb`, `UAL2_Standard.glb`

### 3. Bannon library (871 measured clips)
From `bannon-video-pipe/repo/assets/moves/motion_profile.json`.
- 14 punch clips (GEN_JAB, GEN_CROSS, GEN_UPPERCUT, GEN_HOOK, GEN_ELBOW + hit reactions)
- 19 getup clips
- 7 drop clips
- **11 complete two-person pairs** (attacker + `__RECV`)
- 314 gestures, 100 spins, 336 unclassified

### 4. CMU Mocap (public domain)
`una-dinosauria/cmu-mocap` — BVH format, public domain.
Relevant: 02_05 (punch/strike), jumps, walks, runs.
Convert BVH → FBX → GLB via pipeline.

### 5. Mixamo (Adobe free tier)
Download FBX from mixamo.com (free account). Convert via `fbx_to_glb.py`.
58-joint rig → retarget to Quaternius via `retarget.py` if needed.

## Pipeline Tools (`tools/animation/`)

```
tools/animation/
  convert/fbx_to_glb.py    # FBX → GLB (Blender headless or fbx2gltf)
  retarget/retarget.py     # 58-joint Mixamo ↔ 65-joint Quaternius bone map
  validate/validate.py     # Bone coverage check, missing bone flags
  twoperson/sync.py        # Two-person move sync point definitions
  NAMING.md                # {style}_{move}_{variant} convention
```

### Workflow
1. **Acquire**: Download FBX/BVH from source
2. **Convert**: `python3 convert/fbx_to_glb.py input.fbx output.glb`
3. **Retarget** (if needed): `python3 retarget/retarget.py --from mixamo --to quaternius in.glb out.glb`
4. **Validate**: `python3 validate/validate.py out.glb --rig quaternius`
5. **Name**: Rename to `{style}_{move}_{variant}` per NAMING.md
6. **Wire**: Add to motion bank, reference in `src/game3d/motion-bank.ts`

## Two-Person Moves

A grapple = 2 clips played in sync:
- Attacker: `{style}_{move}_{variant}` (e.g., `wrest_suplex_01`)
- Victim: `{style}_{move}_{variant}__RECV` (e.g., `wrest_suplex_01__RECV`)

Sync points (from `twoperson/sync.py`):
- `contact`: attacker grabs victim
- `lift`: victim leaves ground (if applicable)
- `impact`: both hit ground / damage applies
- `release`: attacker lets go

Runtime plays both clips from t=0, applies damage at `impact`.

### Available pairs
From Bannon (11): backdrop_360_face, cipher_feral_run, cipher_feral_run_2,
falcon_arrow_grounded, falcon_arrow_standing, flying_headbutt,
pumphandle_german_double, somersault_tornado_ddt, stalling_suplex_steps,
tag_powerbomb_german, tiger_feint_kick

From bank.json (7, need `__RECV` versions): backdrop, brainbuster, chokeslam,
ddt, german, suplex, takedown

## Fighting Styles

| Style | Strikes | Grapples | Movement | Status |
|-------|---------|----------|----------|--------|
| street | ✓ (9) | — | walk/run | bank.json |
| box | ✓ (6) | — | — | bank.json |
| capo | ✓ (6) | — | ginga | bank.json |
| drunk | — | — | idle/walk | bank.json |
| wrest | — | ✓ (7) | — | bank.json |
| kickbox | ✓ (2) | — | — | bank.json |
| mma | — | ✓ (1) | — | bank.json |
| lucha | ✓ (2) | ✓ (11) | — | Bannon |
| kungfu | — | — | — | UAL / TODO |
| tiger | stance | — | — | bank.json |
| feral | stance | — | — | bank.json |

## Gaps to Fill
- [ ] Kicks (only dropkick exists — need roundhouse, front kick, etc.)
- [ ] `__RECV` versions for bank.json grapples
- [ ] Kung fu style clips
- [ ] More walk/run variations per style
- [ ] Three-person moves (not yet designed)
