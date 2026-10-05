# Menu Overhaul — "Concrete Jungle" (2026-10-05)

## Theme
Gritty urban street brawler. Grounded in:
- **Urban Reign**: gritty comic-book city, gang tags, slick presentation
- **Def Jam FFNY**: hip-hop bold, gold chains, graffiti walls, framed portraits
- **Yakuza**: neon signage, high contrast

## What changed

### Typography
- **Anton** (new): headlines — bold condensed street. Loaded via Google Fonts in `__root.tsx`.
- **Outfit**: body text (unchanged).
- **Silkscreen**: labels/accents (unchanged).

### Textures (pure CSS/SVG, zero image assets)
- Chain-link fence: `repeating-linear-gradient` crosshatch (`.al-chainlink`)
- Concrete: SVG `feTurbulence` noise data-URI (`.al-concrete`)
- Hazard stripes: 45° repeating gradient, ember + brass variants
- Spray splatter: radial-gradient blobs (`.al-spray`)
- Torn-paper divider: `clip-path` polygon rip (`.al-rip`)

### Components (`src/game3d/menu-theme.css`)
- `.al-title`: Anton, uppercase, ember drop-shadow + spray glow
- `.al-btn`: skewed tag-style button, ember left border, sheen sweep on hover, slide on hover
- `.al-btn-primary`: ember gradient fill, pulsing glow option
- `.al-btn-ghost`: dashed border back button
- `.al-chip`: small grid buttons with ember underline, active = neon
- `.al-card`: riveted metal card (corner dots), hover slide, active = brass glow
- `.al-portrait`: duotone initial monogram in clipped tag shape (no image assets needed)
- `.al-fighter`: portrait + name/bio/martial chip layout
- `.al-mission`: numbered mission rows, CLEARED stamp (rotated), ✕ for locked
- `.al-stamp`: rotated stencil label
- `.al-section`: header with ember gradient rule
- `.al-hpbar`: segmented hazard-stripe health bar (replaces rounded bars)
- `.al-banner`: fight banner with glow
- Animations: `al-flicker` (neon), `al-rise` (staggered slide-in), `al-pulse` (ember glow)

### Screens restyled
- Main menu: graffiti ASHLANE title, spray splatter, tag-style buttons
- Arenas: riveted cards, "locked in" state
- Story/Jobs: numbered mission list, CLEARED stamps, lock icons
- Style/Customize: fighter portrait cards, chip toggles, labeled sliders
- Library/Move lab: styled selects
- Pause: "Take five" header, chip toggles, section dividers
- Job done / Exhibition clear: result headers with rip divider
- Character select (Who walks in): portrait cards with martial chips
- In-game customize suite: same portrait card treatment
- Header: hazard stripe top bar, flickering kicker, segmented HP/KI bars

### Sound (`src/game3d/menu-sfx.ts`)
All synthesized with Web Audio — zero audio assets:
- Hover: short square blip
- Select: punch thud (triangle + noise)
- Back: tape whoosh
- Locked: dull buzz
- Fight start: metallic bell hit
- `wireMenuSfx()` auto-attaches to buttons on menu mount

## Files
- `src/game3d/menu-theme.css` (new)
- `src/game3d/menu-sfx.ts` (new)
- `src/styles.css` (theme tokens + import)
- `src/routes/__root.tsx` (Anton font)
- `src/components/ashlane-app.tsx` (all menus rewritten)
