# AshLane Procedural World Generation

> "The environment tells you whose turf you're on before you see a single fighter."

## Overview

`src/game3d/worldgen*.ts` generates full playable districts procedurally at load.
Same seed = same district, every time. No hand-placed levels.

## Modules

| File | Purpose |
|------|---------|
| `worldgen.ts` | RNG, district definitions, main `generateDistrict()` API |
| `worldgen-textures.ts` | Procedural canvas textures (asphalt, brick, facades, graffiti, neon) |
| `worldgen-buildings.ts` | Building generator (facades, storefronts, fire escapes, signage) |
| `worldgen-streets.ts` | Street blocks, prop scattering, territory storytelling |

## Districts

| District | Faction | Identity |
|----------|---------|----------|
| **The Alleys** | Ashes | Narrow brick canyons, fire escapes, graffiti everywhere, barrel fires |
| **The Strip** | Unaffiliated | Wide boulevards, neon signs, storefronts with awnings |
| **The Yards** | Combine | Industrial sprawl, chain-link, corporate signage, security cameras |
| **The Tunnels** | Hollows | Underground, flickering fluorescents, purple graffiti, wrongness |
| **The High Line** | Unaffiliated | Rooftops, AC units, water towers, skyline views |
| **Ember Park** | Unaffiliated | Trees, benches, paths, lamps |

Each district has distinct: street width, building style, prop distribution,
graffiti density, neon density, lighting color, fog, and faction storytelling.

## API

```typescript
import { generateDistrict, DISTRICTS } from "./worldgen";

// Generate a district (deterministic)
const d = generateDistrict("alleys"); // uses default seed
const d2 = generateDistrict("strip", 12345); // custom seed

// Add to scene
scene.add(d.group);

// Per-frame (flicker lights, flame animation)
d.tick(t, dt);

// Collision
import { hitsCollider, clampToDistrict } from "./worldgen";
if (hitsCollider(d, playerX, playerZ)) { /* blocked */ }
const [cx, cz] = clampToDistrict(d, x, z);

// Cleanup
d.dispose();
```

## World Storytelling

The environment communicates faction territory without UI:

- **Ashes (Alleys):** Orange/red graffiti tags ("ASHES", "EMBER", "RISE"),
  barrel fires, warm sodium lighting
- **Combine (Yards):** Blue corporate signage ("KENNEDY CORP", "SECURED BY KCS"),
  security cameras with red eyes, chain-link fences, hazard stripes
- **Hollows (Tunnels):** Purple tags ("HOLLOW", "THE QUIET", "IT SEES"),
  flickering green fluorescents, oppressive darkness
- **Strip:** Neon blade signs, colorful storefronts, commercial energy

## Textures

All procedural canvas textures — no external image dependencies:
- Worn asphalt with cracks and patches
- Brick with mortar and color variation
- Building facades with lit/unlit windows
- Concrete with water stains
- Spray-paint graffiti with drips and overspray
- Glowing neon signs
- Corporate plate signs

## Integration

**Streaming:** Works with `federated/streaming.ts` chunk system.
Generate one district per chunk, or one large district with sub-chunks.

**Sim:** Use `hitsCollider()` for building/prop collision,
`spawnPoints` for player/enemy/NPC placement.

**View:** Call `d.tick(t, dt)` per frame for animated elements.
Set scene fog from `d.group.userData.fog`.

## Future

- [ ] CC0 GLB prop loading (`loadPropGLB` hook for street pieces)
- [ ] Interior lots for warehouses/park districts
- [ ] Subway tunnel geometry (currently surface-level)
- [ ] Rooftop interconnection (bridges between buildings)
- [ ] Day/night variants per district
