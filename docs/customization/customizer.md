# Character Customizer — LANE-UI

The in-game character customization system. Lives **inside the game's own PWA
main menu** (`AshlaneApp` → "Customize a fighter" → `CustomizerPanel`), using
the **actual roster fighter GLBs** on a zoomable live 3D stage. A disconnected
tool is not acceptable and was not built.

## Player flow

1. Main menu → **Customize a fighter**.
2. Pick a fighter (roster grid). Their saved build loads automatically.
3. Drag to orbit, scroll/pinch (or the Zoom slider) to zoom. Double-click
   resets the camera.
4. Change eyes, body, attire, accessories, face paint — every control applies
   to the live model instantly.
5. **Save build** persists it (per fighter). **Reset** restores the authored look.

## Modules (`src/game3d/customization/customizer/`)

| File | Owns |
|---|---|
| `types.ts` | `CustomBuild` schema, morph/accessory/eye types, `FacePaintSpec` |
| `eye-colors.ts` | Iris palette + procedural iris textures + material application |
| `morphs.ts` | Procedural bone-scale morphs (muscle / height / build / jaw) |
| `accessories.ts` | Lane-manifest loading + normalization, per-character head fit, bone rebinding, slot registry |
| `facepaint-adapter.ts` | Bridge to the paint lane's module (real contract, `../facepaint/index.ts`) |
| `persistence.ts` | Versioned save/load of builds (`ashlane:customizer:builds`) |
| `preview.ts` | `CustomizerPreview` — standalone renderer, studio lighting, camera |

`src/components/customizer-panel.tsx` is the React UI; `ashlane-app.tsx`
renders it on the `"customizer"` menu screen.

## Eye colors (item 6)

**How eyes are built** (studied from `JUDAS_classic.glb`, 2026-10-08): two
sphere meshes (`Sphere`/`Sphere.001`) driven by a dedicated material
`JudasIris` (brown `baseColorFactor`, no texture). A 45-model cast survey found
**only Judas has a dedicated iris material** — every other model bakes eyes
into a shared face texture.

**Approach:** `findIrisMaterials()` locates materials named `*iris*` (falling
back to meshes/nodes named `*iris*`/`*pupil*`). On apply, each iris material is
**cloned once** (authored original kept pristine) and given a procedurally
generated 256px iris texture (limbal ring + radial striations + pupil) in the
chosen palette color. **Skin is never touched** — models without a dedicated
iris material get the palette disabled with an honest note, never a skin tint.

Palette: Natural (authored) + Brown, Dark Brown, Black, Hazel, Amber, Green,
Blue, Ice Blue, Gray, Violet, Blood Red.

## Morphs (item 7 — body/face)

The cast GLBs ship **zero morph targets**, so morphs are procedural bone
scaling. Bone names vary per rig (Judas `J_Hips`/`H_Upperarm_L…`, STICKUP
`mixamorig:Hips`/`mixamorig:LeftArm…`), so dials map to case-insensitive name
**patterns**:

- **Muscle** — upperarm/forearm/upleg/spine2/shoulder girth (×/z)
- **Height** — upleg/leg length (y); the preview re-grounds feet at y=0
- **Build** — hips/spine width (x/z)
- **Jaw** — jaw width (x/z)

Base scales are snapshotted per model; every apply resets to base first
(idempotent, never stacks). `supportedMorphs()` enables only dials that found
bones. Double-click a slider to snap back to 0.5 (authored).

## Accessories (item 7)

Slots: `hair`, `facialHair`, `mask`, `hood`, `chain`, `gloves`, `wristbands`, `shoes`.

The customizer reads lane manifests at runtime — **no code change when a lane
merges**. Scanned locations (`accessories.ts` `MANIFEST_SOURCES`):

- `public/models/accessories/manifest.json` ✅ (4 chains, shipped)
- `public/models/hair/manifest.json` ✅ (masks/hoods/hair lane, merged 2026-10-09)
- `public/models/masks/manifest.json` ✅ (masks/hoods/hair lane, merged 2026-10-09)
- `public/models/hoods/manifest.json` ✅ (masks/hoods/hair lane, merged 2026-10-09)
- `public/models/gloves/manifest.json` ✅ (limb lane, merged 2026-10-09)
- `public/models/wristbands/manifest.json` ✅ (limb lane, merged 2026-10-09)
- `public/models/footwear/manifest.json` ✅ (limb lane, merged 2026-10-09 → the `shoes` slot)

### Manifest contract (two lane-authored shapes, normalized by the loader)

**Shape A** — chains (`models/accessories`): a top-level
`{ accessories: [...] }` wrapper, entries already carry `id`, `label`,
`slot`, `file`, `attach: { bone, position, rotation, scale }`:

```json
{
  "accessories": [
    {
      "id": "chain_gold_ashlane",
      "label": "Gold AshLane Chain",
      "slot": "chain",
      "file": "models/accessories/chain_gold_ashlane_rigged.glb",
      "attach": { "bone": "Neck", "position": [0, 0, 0], "rotation": [0, 0, 0], "scale": 1 }
    }
  ]
}
```

**Shape B** — merged 2026-10-09 lanes (masks/hoods/hair,
gloves/wristbands/footwear): a top-level JSON **array** of
`{ asset, file, attachBone, offset, scale, canonNotes, category? }`. The
loader derives: `id` = `asset`, `label` = humanized asset name, `slot` from
the manifest's folder, `file` with the `public/` prefix stripped, rotation
`[0,0,0]`, and a **canon flag** from `canonNotes` (badged "★ canon" in the
UI — e.g. Hollow's Super Dragon mask, the 2026-10-06 owner correction).

**L/R pairs:** gloves, wristbands, footwear share one asset id across two
files (`boxing_L.glb` / `boxing_R.glb`). The loader groups them into a single
manifest with `pairFiles`; selecting "Boxing" attaches both gloves as one
slot selection.

`attach.bone` is the preferred bone; the loader falls back to
case-insensitive match, then slot heuristics (hair→head, chain→neck/spine2,
gloves→hand, wristbands→forearm, shoes→foot…).

**Rigged accessories rebind:** accessories that ship their own rig (chains on
`Neck`/`Spine2`; masks/hair on `Head`/`Neck`/`Spine2`; gloves on
`Hand`/`ForeArm`; boots on `Foot`/`ToeBase`/`Leg`) are **rebound onto the
fighter's matching bones** (exact name, then normalized-fuzzy:
`mixamorig:Neck`→`neck`, `J_Spine2`→`spine2` — same technique as
`quaternius.attachPart`), then bound in final position so they ride the body.
Non-skinned accessories hang from the manifest's attach bone with the authored
offset/rotation.

**DCC scale:** the chains are authored ~8x oversize for our fighters, so the
manifest `scale` is baked into the geometry and the bone-inverse translations
at attach time — scaling the holder instead would break the skinning math.
**Pendant orientation** is the chain lane's tuning knob
(`feature/chain-pendant-fix`): `attach.rotation` (degrees XYZ) applies as a
rigid rotation before binding. Measured: Judas's `J_Neck` maps chain-local
+z to world +x, so the pendant swings sideways at neutral rotation; X≈−103°
brings it forward-down on Judas rigs (Mixamo necks differ — tune per rig).

### Per-character head fit (FIT_NOTES.md, masks/hoods/hair lane)

Head-slot assets are authored in **ASTRID space** and verified on ASTRID. On
Tripo-rigged heads the customizer applies measured per-character transforms
(`HEAD_FIT` in `accessories.ts`, read from the fighter id the preview stores
on the model root):

| character | scale | extra |
|---|---|---|
| ASTRID (authoring ref; also the default for unknown fighters) | 1.0 | — |
| HOLLOW | 0.4458 | — |
| ECHO | 0.4494 | positional nudge [0, −0.1288, −0.0602] (face-forward outlier: her nose sits (y=−0.176, z=−0.026) rel. her head bone vs ASTRID's (y=−0.105, z=+0.076); the scaled-authored nose lands at (y=−0.0472, z=+0.0342), so the nudge closes the delta) |
| STATIC | 0.4494 | — |

The scale multiplies the DCC scale bake in the rebind path (and the node
scale in the hang path); the ECHO nudge is applied as a holder/node offset.
**Rest-pose orientation:** Tripo heads share a rotated head-bone rest
orientation vs ASTRID's axis-aligned one — full-head shells transfer
acceptably, hair fringes show it visibly. `rotFix` (degrees XYZ, applied like
the chain pendant rotation) is the per-character tuning knob, defaulting to
zero until measured — QC the fringe assets per character.

## Face paint

Wired to the real paint-lane module per `docs/customization/face-paint.md`
(merged 2026-10-09). `facepaint-adapter.ts` imports **only** from
`src/game3d/customization/facepaint/index.ts`
(`getPickerData`, `getPreset`, `clonePresetLayers`, `validateLayers`,
`serializeLayers`/`parseLayers`, `FacePaintDecal`, `FACE_PATTERNS`,
`getProfile`).

- **Availability is per fighter:** only fighters with a verified paint-lane
  profile (`cipher`, `onyx`, `echo`) get the section; others get an honest
  note, never fake paint.
- **3 canon presets** ship as locked buttons: `cipher-grin`, `onyx-clown`,
  `echo-stitched` (canon-locked badge 🔒).
- **Custom paint builder:** region tabs, pattern grid (thumbnails), color
  swatches + custom color, opacity slider, layer stack with remove; layers
  validate before apply.
- The build stores one string: a preset id **or** serialized
  `FacePaintLayer[]` (round-trips through saves).
- The decal is built once per fighter root, **before the idle animation
  starts** (bind-pose preferred per the paint contract —
  `preview.loadFighter` starts the clip after `applyBuild`); repaints reuse
  the decal. `clearFacePaint` hides it — **the base skin is never written**
  (structural likeness lock).

## Persistence

`persistence.ts` follows `saves.ts` conventions: versioned envelope
`{ schemaVersion, updatedAt, data }`, forward-only migrations, migrate-on-copy,
idb-keyval with localStorage fallback. Key: `ashlane:customizer:builds`
(backup: `...:backup`). One build per roster fighter id; corrupt/foreign saves
sanitize over `defaultBuild()` so they always produce a valid build.

## Fight-side application (follow-up)

Builds currently drive the customizer preview. To carry a player's build into
actual fights, `view.ts`'s `ensureCast` should call
`applyEyeColor` / `applyMorphs` / `attachAccessory` from this lane on the
adopted rig root using `loadBuild(fighterId)` — the hooks are public and the
build schema is stable. Left as the merge follow-up so the game loop stays
untouched on this branch.

## QC checklist (verification law)

Verified 2026-10-09 by the worker against the production build, via a
headless-Chromium harness driving the real modules (the full-app page can't
screenshot under SwiftShader in this environment — `Page.captureScreenshot`
hangs whenever WebGL is active; frames were pulled with `capturePNG()`):

- [x] `npm run typecheck` passes; `vite build` passes (EXIT:0).
- [x] Customizer panel renders from the PWA main menu ("Customize a fighter"
      button in `AshlaneApp`; `CustomizerPanel` on the `"customizer"` screen).
- [x] Preview renders the actual model (JUDAS_classic.glb, BANNON GLBs) with
      studio lighting; drag-orbit + wheel/pinch/slider zoom work.
- [x] Eye palette enables on the iris-material model (Judas): 12 colors apply
      via cloned materials + procedural iris textures; **skin untouched**
      (before/after frames compared). Baked-eye models (all 17 roster
      fighters surveyed) get the honest disabled note — never a skin tint.
- [x] Morph sliders offered only for detected bones (Judas: muscle/build/jaw);
      muscle=1 visibly thickens arms; double-click resets to authored.
- [x] Gold chain attaches at correct scale, rebinds to `J_Neck`/`J_Spine2`,
      detaches cleanly. Pendant orientation is the chain lane's knob (see above).
- [x] Save → mutate → reload round-trips: `{eye:"iceblue",
      chain:"chain_gold_ashlane", muscle:1}` persisted and restored from
      `ashlane:customizer:builds`.
- [x] Face paint wired to the real paint-lane module (merged 2026-10-09):
      3 canon presets (cipher-grin / onyx-clown / echo-stitched) + custom
      layer builder (regions/patterns/colors/opacity); preset-id and
      serialized-layer specs round-trip through saves; per-fighter profiles
      gate availability honestly.
- [x] Integration QC round (2026-10-09): well-lit face close-ups of all 3
      presets — `paint-cipher-grin.png` (Cipher), `paint-onyx-clown.png`
      (Onyx street), `paint-echo-stitched.png` (Echo) — all clearly visible,
      skin-lock holds (decal overlay only). **Integration finding:** the paint
      lane's decal material (`transparent + depthWrite:false`) does not
      composite under SwiftShader; the adapter forces `depthWrite:true` and
      the preview performs a deferred material retouch ~1.5s after paint
      applies (first-paint stabilization). Paint lane should review whether
      this is SwiftShader-specific or affects real GPUs (fix would belong in
      `decal.ts`). Proof frames in `~/workspace/agent-ops/customizer-qc/`.
- [x] Accessory manifests: 29 items across masks/hair/hoods/gloves/
      wristbands/footwear; Shape A (chains) + Shape B (merged lanes)
      normalized; L/R pairs grouped (gloves/boxing, boots, wristbands);
      canon flags correct (superdragon/opera_theory/theory_boot true;
      crimson/azul correctly false).
- [x] Hollow mask + hair attach with per-character HEAD_FIT (0.4458 scale);
      rebind via `mixamorigHead` (packed form) verified — mask sits on the
      face, not floating. **Flag for mask lane:** `mask_hollow_superdragon.glb`
      does not match the Super Dragon likeness (no white shark teeth, no blue
      trim; reads as a horned/tribal demon mask) — owner correction 2026-10-06
      requires the Super Dragon version.
- [ ] Glove attach QC: `boxing` gloves did not appear in QC frames (manifest
      correct, files exist; attach swallowed by `.catch(() => null)` — likely
      GLB texture errors, the 4 blob failures in the harness). Needs triage.
- [ ] Save/reload round-trip with accessories + paint: verified for
      `{eyeColor:"iceblue", facePaint:"cipher-grin", chain, gloves:"boxing",
      muscle:1}` (round-trips); full accessory coverage pending glove fix.

Frames inspected: h1 (Judas natural), h2 (ice-blue eyes), eye close-ups
natural vs ice-blue, m1 (muscle max), m2/chain-scaled (chain attached),
paint-cipher-grin / paint-onyx-clown / paint-echo-stitched (all 3 presets),
acc-hollow-mask (fit good, likeness flagged), acc-static-hood.
