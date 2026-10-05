# AshLane Generative Tools

Procedural art + world generation. No image files, no downloads — everything
is generated from seeded code. Same seed = same output, every time.

## Why

The owner said menus "look like real bullshit" — plain boxes, no art, no theme.
Real games have custom borders, textures, graffiti, street flavor everywhere.
These tools generate all of that procedurally so every screen and every wall
can have custom art with zero asset downloads.

## Modules

| File | What it does |
|------|--------------|
| `rng.js` | Seeded RNG (mulberry32) + `svgDataUri()` helper |
| `svg-textures.js` | Tileable SVG textures: concrete, asphalt, brick, chain-link, corrugated metal, sidewalk |
| `graffiti.js` | Procedural graffiti: `tag()`, `throwup()`, `piece()`, `crewSet()` |
| `ui-frames.js` | Menu chrome: `sprayFrame()`, `cautionDivider()`, `chainDivider()`, `metalPanel()`, `tornBanner()`, `cornerBrackets()` |
| `city-seed.js` | Seeded city layout: blocks, buildings, alleys, graffiti spots, props, mission markers |

## Quick start

```js
import { concrete, asphalt } from './svg-textures.js';
import { tag } from './graffiti.js';
import { sprayFrame, cautionDivider } from './ui-frames.js';
import { generateCity, asciiMap } from './city-seed.js';
import { svgDataUri } from './rng.js';
import fs from 'fs';

// 1. Texture as CSS background (no file needed)
const css = `.wall { background-image: url("${svgDataUri(concrete({ seed: 7 }))}"); }`;

// 2. Graffiti tag SVG file for a wall decal
fs.writeFileSync('tag-ashlane.svg', tag('ASHLANE', { seed: 42 }));

// 3. Menu frame
fs.writeFileSync('menu-frame.svg', sprayFrame({ w: 480, h: 320, color: '#e33d2e' }));

// 4. City layout JSON for the engine
const city = generateCity({ seed: 'ashlane-01' });
console.log(asciiMap(city));
fs.writeFileSync('city.json', JSON.stringify(city, null, 2));
```

Run the demo:

```bash
node demo.js        # generates samples/ with SVGs + city.json
node demo.js --seed 99
```

## Textures

All textures are 512×512 (chain-link 256×256), tileable, SVG with
`feTurbulence` noise. Use `TEXTURES` registry to iterate:

```js
import { TEXTURES } from './svg-textures.js';
for (const [name, gen] of Object.entries(TEXTURES)) {
  fs.writeFileSync(`${name}.svg`, gen({ seed: 1 }));
}
```

| Generator | Looks like | Use for |
|-----------|-----------|---------|
| `concrete()` | gray + grain + stains + cracks | sidewalks, walls, warehouse floors |
| `asphalt()` | dark + aggregate + oil stains + lane fragment | streets, lots, rooftops |
| `brick()` | staggered courses, mortar, tonal variation | alley walls, exteriors |
| `chainlink()` | diamond wire, transparent bg | fences, cages, overlays |
| `corrugated()` | ribs + rust streaks | warehouse walls, shutters |
| `sidewalk()` | paver grid + gum spots | sidewalks |

## Graffiti

Seeded spray-paint tags. Three styles:

- `tag(text)` — quick one-word street tag, drips + overspray
- `throwup(text)` — bubblier two-tone with cloud outline
- `piece(main, sub)` — full mural with background wash

Palettes are in `PALETTE_LIST` (red, blue, gold, lime, purple, silver, orange).
Each graffiti spot in `city.json` has a `seed` + `style` — feed them straight in:

```js
import { tag, throwup, piece } from './graffiti.js';
const spot = city.blocks[0].graffiti[0];
const svg = { tag, throwup, piece }[spot.style]('CREW', { seed: spot.seed });
```

## UI frames

For menus that don't look like bullshit:

- `sprayFrame({w,h,color})` — rough spray-paint double border + overspray
- `cautionDivider({w,h,text})` — caution-tape bar with torn ends
- `chainDivider({w,h})` — horizontal chain links
- `metalPanel({w,h})` — riveted plate with scratches (menu backgrounds)
- `tornBanner({w,h,text})` — jagged title banner
- `cornerBrackets({w,h})` — HUD targeting corners

Embed directly in HTML or as data-URI CSS backgrounds.

## City seeding

`generateCity({ seed })` returns JSON:

- `blocks[]` — each with buildings (x/z/w/d/h/style/floors/rooftopAccess),
  alley paths, graffiti spots (x/z/wall/seed/style), props
  (dumpster/crate/barrel/pallet + `breakable` + `hp`)
- `streets[]` — grid roads between blocks
- `markers[]` — story (`!`), side (`?`, multi-part), shops
- `taxis[]` — fast travel, `discovered: false` until found on foot
- `boards[]` — Witcher-style job boards
- `stats` — building/prop/graffiti counts

Props flagged `breakable: true` have `hp` — smash through them Urban Reign style.

## License

All code here is original, written for AshLane. Fonts referenced are system
fallbacks (no webfont downloads). No third-party assets included.
