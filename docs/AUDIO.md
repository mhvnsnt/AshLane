# Generative Audio for AshLane

All music and SFX are synthesized live with the Web Audio API. Zero audio files,
zero downloads, zero dependencies.

## Open-source references (techniques adapted, not copied)

| Project | License | What we took |
|---------|---------|--------------|
| [gamedev-toolkit/loopsmith](https://github.com/gamedev-toolkit/loopsmith-procedural-game-music-generator) | Apache-2.0 | Seeded deterministic composition, look-ahead scheduler pattern, voice recipes (sine pitch-bend kick, noise hats), procedural SFX buttons |
| [theclosedloopcompany/codebeats](https://github.com/theclosedloopcompany/codebeats) | MIT (engine) | Parametric track structure — tracks as code, not audio |
| [elicazer/SongGenerator](https://github.com/elicazer/SongGenerator) | (unverified — not used) | Genre-specific patterns incl. hip-hop/trap (idea-level only) |

## Files

- `tools/generative/audio-gen.js` — Node/browser beat composer. `generateBeat(seed, intensity)` returns deterministic `BeatData`. CLI: `node audio-gen.js --seed ashlane --intensity hype [--json]`.
- `src/game3d/music.ts` — Adaptive in-game engine. `MusicEngine` with look-ahead scheduler, bar-quantized intensity switching (`setIntensity('calm'|'tense'|'hype')`), limiter, `duck()` for dialogue.
- `src/game3d/combat-sfx.ts` — Fight SFX: `sfxPunch`, `sfxKick`, `sfxBlock`, `sfxWhoosh`, `sfxBodyFall`, `sfxKnockout`, `sfxRoundCue`, plus `startCrowd` / `crowdSwell` / `stopCrowd` crowd ambience.
- `src/game3d/menu-sfx.ts` — (existing) UI sounds.

## Intensity map

| Intensity | BPM | Drums | Bass | Use |
|-----------|-----|-------|------|-----|
| calm | 82 | sparse (no snare) | soft long notes + pad | exploration, safehouse |
| tense | 90 | boom-bap backbeat | driving 808 | combat |
| hype | 96 | double-time hats + rolls | hard 808, octave pops | boss fights |

## Usage

```ts
import { getMusic } from './music';
import { sfxPunch, crowdSwell } from './combat-sfx';

const music = getMusic('ashlane');
music.start();                    // starts calm
music.setIntensity('tense');      // switches at next bar line

sfxPunch(true);                    // heavy punch on hit connect
crowdSwell(0.9);                   // crowd erupts on KO
```

## Anti-slop note

Every voice is built from first principles (oscillator pitch-bends, filtered
noise). No samples, no loops, no AI-generated audio files. Same seed always
produces the same beat — reproducible across sessions.
