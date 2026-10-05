# CROWD SYSTEM

Owner directive (2026-10-05): KayKit models are NOT the default. Real people on the street, not chibi knights.

## Crowd Modes

| Mode | Label | What you see |
|------|-------|--------------|
| `full` | **Realistic crowd** (DEFAULT) | Soldier Male/Female, Drifter, Mannequin — full-size realistic humans only. NO KayKit, NO skeletons, NO zombies. |
| `mix` | Mixed crowd | Variety: realistic humans + KayKit characters + skeletons + zombies. |
| `chibi` | KayKit crowd | All KayKit (Knight, Rogue, Barbarian, Hooded Rogue, Mage, Skeletons). The chibi option. |

## Implementation

- `src/game3d/view.ts`: `realistic()` pool, `rigFor()` crowd selection, all fallbacks → `soldier`
- `src/game3d/sim.ts`: default `crowd: "full"`
- `src/game3d/spec.ts`: default `crowd: "full"`
- Menu: `src/components/ashlane-app.tsx` (Realistic / Mixed / KayKit labels)

## KayKit Props

KayKit environmental props (walls, barrels, crates, tables) in `/models/kaykit/props/` are NOT characters — they're set dressing and stay as-is.

## Future: Generated Crowd Variety

The `char-gen.ts` pipeline (`generateCrowd()`, `generateGrunt()`) can provide per-instance variety (skin tone, clothing colors, height/bulk) on the realistic base models. Currently the PAL color palette provides tint variety. Full char-gen integration for crowd members is a future enhancement.
