# Face-paint system

Layered, paintable face regions composited **over** the character's face at runtime.
Not one-off textures: users layer patterns per region with per-region colors, and
the three canon looks ship as locked presets.

## Architecture

**Paint lives on a decal mesh** (`src/game3d/customization/facepaint/decal.ts`).

- `FacePaintDecal.build(skinnedMesh, profile)` builds a **raycast-conformed grid**:
  a subdivided plane (28×30) is placed in front of the face, and each grid vertex
  is projected along -faceDir onto the head surface (+2mm offset) via raycast
  against a head-region subset mesh (for performance). Grid topology = clean,
  no holes, no jagged edges. UVs are planar-remapped from hit positions to
  face space (fx 0 = viewer's left, fy 0 = forehead top). All verts are rigidly
  weighted to the head bone (1.0), so the decal follows the head as a
  `SkinnedMesh` bound to the character's skeleton. Material: transparent
  `MeshStandardMaterial` with `polygonOffset` (no z-fighting) and
  `depthWrite: false`.
- `FacePaintPainter` (`painter.ts`) renders a `FacePaintLayer[]` stack onto a
  2D canvas in decal-UV space: patterns (white-alpha PNGs, face-space authored)
  are tinted per layer, transformed, clipped to the layer's region, and stamped.
  `blend: 'erase'` punches transparency (reveals real skin beneath — used for
  Onyx's paint cracks).
- The character's base mesh, material, and texture are **never written**.
  The skin-tone likeness lock is structural: toggling paint off =
  `decal.setVisible(false)` / `painter.clear()`; base pixels are provably
  identical (see QC below).

### Why a decal mesh (technique decision)

Evaluated against three.js 0.186 for the repo's single-texture Tripo characters:

1. **Canvas-composited base textures** (paint drawn into the character's map in
   UV space) — REJECTED after verification. The face is fragmented across many
   small UV islands in the Tripo atlas (verified on CIPHER_rigged: the face
   spans 7+ islands); a single face-plate rect cannot address regions, and
   per-island surgery is unmaintainable.
2. **Shader region masks** (`onBeforeCompile` + mask textures) — REJECTED.
   Invasive to the shared character material, conflicts with other lanes'
   material work, and per-region color changes need uniform plumbing.
3. **Decal mesh with polygonOffset** — CHOSEN. Zero changes to base geometry /
   materials / textures; regions and patterns live in a clean planar face
   space independent of the atlas; layering = canvas draw order; per-region
   colors free via tinting; erase blend reveals true skin.
4. **Decal from character's own triangles** (subset by skin weights/normals or
   raycast) — REJECTED after QC. The triangle subset was fragile (skin-weight
   heuristics missed the face; raycast subset had holes and jagged edges).
   The raycast-conformed GRID is robust: clean topology, exact surface
   conformity, and UVs independent of the character's triangulation.

## Paintable regions

Defined once in `data/regions.json` (single source of truth — also read by the
Python QC compositor) and exposed via `regions.ts`:

| id | label | covers |
|---|---|---|
| `forehead` | Forehead | band across the forehead |
| `eyes` | Eyes | both eye areas |
| `cheeks` | Cheeks | both cheek areas |
| `nose` | Nose | nose bridge + tip |
| `mouthChin` | Mouth / Chin | mouth, smile lines, chin |
| `fullFace` | Full face | entire face plate |

Coordinates are 0..1 in face space (x 0 = viewer's left, y 0 = forehead top);
symmetric regions are mirror-safe. Shapes are ellipses/rects with feathered edges.

## Patterns & colors

12 patterns in `public/textures/facepaint/*.png` (white + alpha, face-space
authored, tinted at paint time): `base-soft`, `grin`, `eye-sockets`, `eye-band`,
`stitches`, `skull-nose`, `cracks`, `teardrop`, `stripes`, `brow-slash`,
`jaw-shade`, `dots`. Registry: `patterns.ts`.

Colors: `PAINT_COLORS` in `picker.ts` — canon colors first
(clown white `#f2ede2`, paint black `#161513`, bone `#e7ddc8`, blood `#a31621`),
then a working palette. Any `#rrggbb` validates.

## Canon presets (locked)

`presets.ts` — do not restyle; custom paint is built from the same layers via
the picker, never by editing these:

- **`cipher-grin`** (Cipher): white base, black eye sockets, black skull nose,
  wide black grin. Lio Rush 2026 Blackheart reference.
- **`onyx-clown`** (Onyx): FULL white clown base, black chola eye band +
  sockets, black grin, erase-blend cracks chipping to dark skin beneath.
  Skin-tone lock binding: base texture untouched.
- **`echo-stitched`** (Echo): bone base, black sockets, skull nose, sutured
  black mouth stitches + blood-red cheek stitches. Shotzi Blackheart reference.

## UI-lane integration contract

Import surface: `src/game3d/customization/facepaint/index.ts` (only this).

```ts
import {
  getPickerData,          // { regions, patterns, colors, presets } — render the menu from this
  validateLayers,         // (layers) => string[] — call before applying
  serializeLayers, parseLayers, clonePresetLayers,
  getPreset,              // canon preset by id (clone its layers before editing!)
  FACE_PATTERNS,          // pattern defs (id -> file) for the painter
  FacePaintPainter,       // game-side: paint layers -> canvas
  FacePaintDecal,         // game-side: build overlay mesh on the character
  getProfile, FACE_PAINT_PROFILES,
} from '@/game3d/customization/facepaint';
```

Menu flow (UI lane owns all of this; the game side owns the character):

1. `const data = getPickerData()` → build region tabs, pattern grid (thumbnails
   via `pattern.file` under `public/`), color swatches, preset buttons.
2. User picks preset → `clonePresetLayers(getPreset('onyx-clown'))`, or builds
   `FacePaintLayer[]` manually: `{ region, pattern, color, opacity, blend? }`.
3. `validateLayers(layers)` — show errors, don't apply.
4. Hand the stack to the game-side applier (lives with the character code):
   ```ts
   // once per character (menu / load):
   const decal = FacePaintDecal.build(skinnedMesh, getProfile('onyx')!);
   // on every paint change:
   await decal.painter.paint(layers, FACE_PATTERNS);
   decal.texture.needsUpdate = true;
   // paint off:
   decal.setVisible(false); // or decal.clearPaint()
   ```
5. Persist with `serializeLayers(layers)`; restore with `parseLayers(s)`.

Notes:
- `FacePaintDecal.build` must run after the character is in the scene (it reads
  skin weights; bind pose preferred — call before animations play).
- One decal per character; repainting is cheap (single canvas, one texture upload).
- `profile.faceDir` is verified per character in `profiles.ts`. New characters:
  verify visually; the decal builder throws if no face triangles are selected.

## Skin-tone likeness lock (binding)

From the Onyx hands incident: paint is an OVERLAY. The base skin texture/tone
must never be modified — never whitewashed, lightened, or darkened.

- Structural: the system never writes the base mesh, material, or texture.
  Paint exists only on the decal mesh + its own `CanvasTexture`.
- QC proof per character: render paint-ON vs paint-OFF (decal hidden);
  pixels outside the decal must be byte-identical (`maxDelta = 0`).
  `FacePaintDecal.proveSkinLock()` documents the guarantee; the pixel proof is
  produced by the QC script (`/tmp` scratch, see below) and attached to the PR.

## QC (2026-10-09, verified)

- `node --experimental-strip-types` exercises the SHIPPED `FacePaintDecal.build()`
  against all 3 GLBs (cipher: 1358 tris, onyx: 895 tris, echo: 1566 tris; ~1s each).
- Blender headless renders (lane scratch `~/workspace/agent-ops/lane-paint-qc/`):
  raycast-conformed grid decal built with the same algorithm, paint canvases from
  the TS presets applied, front head renders for all 3 canon looks.
- **Cipher** (grin): white base + black eye sockets/nose/grin on face. ✓
- **Onyx** (clown): white base + black eye markings on face. Facing corrected to
  -X via turntable (nose points -X). ✓
- **Echo** (stitched skull): bone base + stitches on face (partially occluded by
  canon green hair, paint verified on visible face). ✓
- **Skin-lock**: ON/OFF renders compared; background pixels byte-identical
  (maxDelta=0); changed pixels confined to decal region. Base mesh/material/texture
  never written (structural).
- Checklist (verification law): paint alignment on the face (all 3) ✓, no
  base-skin change (ON/OFF) ✓, region layering works (per-region colors in
  presets) ✓, canon likeness of all 3 presets ✓.

## Files

- `src/game3d/customization/facepaint/` — `index.ts` (export surface),
  `types.ts`, `regions.ts` + `data/regions.json`, `patterns.ts`, `presets.ts`,
  `picker.ts`, `painter.ts`, `decal.ts`, `profiles.ts`
- `public/textures/facepaint/` — 12 pattern PNGs
- `docs/customization/face-paint.md` — this file
