# AshLane PWA Test Report

**Date:** 2026-10-05
**Tester:** Muse (automated)

## Build Status

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | ✅ Clean, 0 errors |
| Vite build | ✅ Succeeds |
| Bundle contains game code | ✅ Verified (SOMBRA_NEGRA, quaternius_male, mixamorig:Hips in bundle) |

## Bugs Found and Fixed

### 1. CSS Import Path (CRITICAL — broke build)
**File:** `src/styles.css`
**Problem:** `@import "../game3d/menu-theme.css"` resolved outside `src/`
**Fix:** Changed to `./game3d/menu-theme.css`
**Status:** ✅ Fixed (was already fixed upstream by time of push)

### 2. UAL1/UAL2 Not Loaded (CRITICAL — 86 animations missing)
**File:** `src/game3d/view.ts`
**Problem:** Only loaded `AnimationLibrary_Godot_Standard.gltf`. The 86 combat animations in `UAL1_Standard.glb` and `UAL2_Standard.glb` were on disk but never loaded.
**Fix:** Load all three libraries, combine clips, pass to `setUal()`
**Status:** ✅ Fixed and pushed

### 3. Music System Not Wired
**File:** `src/game3d/music.ts` (existed but unused)
**Problem:** Procedural music engine built but never imported by game code
**Fix:** Wired into `mount.ts`:
- `startBout()` → music.start() + setIntensity("hype") + startCrowd(0.6)
- `startStory()` → music.start() + setIntensity("tense") + startCrowd(0.4)
- `quit()` → music.stop() + stopCrowd()
**Status:** ✅ Fixed and pushed

### 4. Combat SFX Not Wired
**File:** `src/game3d/combat-sfx.ts` (existed but unused)
**Problem:** Procedural combat SFX built but never called
**Fix:** Updated `playSfx()` in `mount.ts` to route hit/kick/ko events through `sfxPunch()`, `sfxKick()`, `sfxKnockout()`. Falls back to legacy `blip()` for other sounds.
**Note:** sim.ts uses `sim.sfx` event queue (worker-safe, no direct Web Audio in simulation)
**Status:** ✅ Fixed and pushed

## Asset Verification

| Asset | Count | Status |
|-------|-------|--------|
| Roster models referenced | 39 | ✅ All exist in `public/models/cast/` |
| Sombra Negra | 1 | ✅ `SOMBRA_NEGRA_rigged.glb` present |
| Quaternius bodies | 2 | ✅ Male + Female present |
| Quaternius parts | 8 | ✅ Hair, beard, brows present |
| UAL1_Standard.glb | 43 clips | ✅ Present, now loaded |
| UAL2_Standard.glb | 43 clips | ✅ Present, now loaded |
| bank.json | 50 clips | ✅ Present |

## Module Wiring Status

| Module | Built | Wired into Game | Notes |
|--------|-------|-----------------|-------|
| sim.ts (combat) | ✅ | ✅ | Via mount.ts |
| view.ts (rendering) | ✅ | ✅ | Via mount.ts |
| motion-bank.ts | ✅ | ✅ | UAL1/UAL2 now loaded |
| char-gen.ts | ✅ | ✅ | Used by lieutenants.ts |
| groupai.ts | ✅ | ✅ | setMaxAttackers() in sim.ts |
| lockon.ts | ✅ | ✅ | Imported by sim.ts |
| freeflow.ts | ✅ | ✅ | Imported by sim.ts |
| music.ts | ✅ | ✅ | **Fixed this test** |
| combat-sfx.ts | ✅ | ✅ | **Fixed this test** |
| roster.ts | ✅ | ✅ | 39 models verified |

## Not Yet Tested (Requires Browser)

- [ ] Visual: characters actually render on screen
- [ ] Visual: animations play (idle, walk, punch)
- [ ] Visual: Sombra Negra deformation looks correct
- [ ] Audio: music actually plays (Web Audio)
- [ ] Audio: combat SFX actually play
- [ ] Interaction: touch controls work on mobile
- [ ] Interaction: lock-on reticle displays
- [ ] Performance: frame rate on target devices

## Recommendations

1. **Run the PWA in a real browser** — code is verified, but visual/audio confirmation needs a browser with WebGL and Web Audio.
2. **Test on Android** — owner reports Bannon PWA issues on Android; AshLane needs mobile verification.
3. **Screenshot key screens** — main menu, character select, combat, generated grunt.
