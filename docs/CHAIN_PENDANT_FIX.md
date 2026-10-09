# Chain Pendant Orientation Fix (2026-10-08)

Lane: chain-pendant orientation fix — branch `feature/chain-pendant-fix`.

## Defects found (world-space bbox analysis + Blender renders)

Character front = **-Z** (pendants were pushed to `z=-0.5` as "slightly forward"
in the earlier position fix). All bails already faced -Z correctly.

1. **chain_gold_ashlane_rigged.glb** — `gold_ashlane_Pendant` (1.20 x 0.08 x 1.20)
   and `gold_ashlane_Inner` (0.80 x 0.10 x 0.80) were **flat horizontal disks**
   (lying in the X-Z plane). A medallion must hang vertically.
   **Fix:** rotated both -90° about X through their centers (baked into mesh
   data, object transforms untouched) → now 1.20 x 1.20 x 0.08, face outward.
2. **chain_bannon_piece_rigged.glb** — two defects:
   - `bannon_piece_Mask` was **backwards**: eyes sat at z=-0.25, near the +Z
     (chest-side) face of the mask (mask z spans -0.80..-0.20).
     **Fix:** flipped Mask + both Eyes 180° about Y through the mask center →
     eyes now at z=-0.75, on the outward (-Z) face.
   - `bannon_piece_Dread0..5` were **horizontal Z-long tubes** (0.10 x 0.10 x 0.90),
     sticking front-to-back instead of dangling.
     **Fix:** rotated each +90° about X through its own center → now
     (0.10 x 0.90 x 0.10), hanging down from the mask chin (tops embedded in
     the mask, ~0.35 dangling below).
3. **chain_wizard_gang_rigged.glb** — Moon (1.04 x 1.04 x 0.24) and Star already
   vertical, facing -Z. **No orientation change.** (An early render made the moon
   look like a flat saucer, but that was a degenerate top-down camera angle —
   the bbox proved it was already correct.)
4. **chain_diamond_ice_rigged.glb** — Diamond/Setting/Bail already correct.
   **No orientation change.**

## Rig preservation

All fixes bake rotation into mesh vertex data only. Verified after re-export:
every mesh still has its `ARMATURE` modifier + 2 vertex groups, and the
`ChainRig` armature (bones `Neck`, `Spine2`) is intact in all 4 files.

## Importer artifact note (do NOT "fix" this again)

Blender's glTF importer creates a helper object named **`Icosphere`** at the
origin for every file with an armature (`armature_display()` in
`io_scene_gltf2/blender/imp/gltf2_blender_node.py` — it becomes the bone shape,
parked in the non-exported `glTF_not_exported` collection). **It is not part of
the GLB asset** — the exported files never contain it (verified by dumping the
GLB JSON node/mesh lists). It only appears in the Blender session on import and
can pollute test renders if you don't delete it first. The earlier
`fix_pendants.py` "Icosphere removal" was the same no-op.

## Proof renders (all opened and inspected)

- `closeup_gold_ashlane.png` — medallion hangs vertical below the bail, face
  outward, inset ring visible. ✓
- `proof_bannon_piece.png` — 6 dreads dangle vertically below the mask; mask
  hangs below chain via bail. Eyes-forward confirmed by bbox (z=-0.75). ✓
- `chain_wizard_gang_front3.png` — moon ring face-on, hanging below chain. ✓
- `chain_diamond_ice_front3.png` — gem hanging below chain. ✓
