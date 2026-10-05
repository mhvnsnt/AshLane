# Fighting Styles Master Catalog

**Compiled:** 2026-10-05
**Sources:** Bannon, Urban Mayhem, AshLane (all mhvnsnt repos)
**Total unique styles found:** 100+

---

## The Big Picture

The owner has fighting styles across multiple repos. Here's what's where:

| Repo | Style Count | Format |
|------|-------------|--------|
| Bannon | 36 archetypes | Coded in `roster_movesets.json` + 183 clips in `fbx_move_map.json` |
| Urban Mayhem | 71+ vocabulary, 24 disciplines | Fully coded with stats in Godot + C++ |
| AshLane | 6 styles | In `char-gen.ts`, needs expansion |

**Urban Mayhem's 24 disciplines × 8 modifiers = 192 combinations** — this is the most complete system.

---

## Urban Mayhem: 24 Coded Disciplines

These are FULLY CODED with stats (range, pressure, counter, grapple, kicks, preferred moves).
Source: `URBAN-MAYHEM-/Godot/scripts/combat_style_system.gd`

### Striking
| Style | Range | Pressure | Counter | Kicks | Signature |
|-------|-------|----------|---------|-------|-----------|
| boxing | 1.0 | 0.78 | 0.76 | 0.10 | jab, cross, hook |
| kickboxing | 1.08 | 0.80 | 0.52 | 0.82 | jab, low_kick, hook |
| muay_thai | 1.0 | 0.90 | 0.46 | 0.94 | low_kick, hook, heavy (elbows/knees) |
| karate | 1.12 | 0.48 | 0.82 | 0.72 | jab, low_kick, counter |
| taekwondo | 1.18 | 0.55 | 0.70 | 1.0 | low_kick, heavy, counter (spinning kicks) |
| savate | 1.16 | 0.62 | 0.72 | 0.92 | low_kick, jab, counter (French kickboxing) |
| street_boxing | 0.94 | 0.92 | 0.36 | 0.18 | hook, heavy, jab (bare-knuckle) |
| dirty_boxing | 0.78 | 0.96 | 0.30 | 0.04 | hook, heavy, takedown (clinch fighting) |

### Grappling
| Style | Range | Pressure | Counter | Grapple | Signature |
|-------|-------|----------|---------|---------|-----------|
| judo | 0.82 | 0.64 | 0.72 | 1.0 | takedown, counter (throws) |
| wrestling | 0.82 | 0.88 | 0.45 | 1.0 | takedown, heavy (double-leg, slam) |
| bjj | 0.72 | 0.50 | 0.88 | 1.0 | takedown, submission, ground_strike |
| sambo | 0.82 | 0.76 | 0.70 | 0.92 | takedown, low_kick, submission |
| combat_sambo | 0.88 | 0.90 | 0.62 | 0.94 | takedown, heavy, submission (military) |
| catch_wrestling | 0.76 | 0.74 | 0.80 | 1.0 | takedown, submission (old-school) |
| sumo | 0.72 | 1.0 | 0.28 | 0.82 | heavy, takedown (pushing, bulk) |
| luta_livre | 0.76 | 0.68 | 0.82 | 0.98 | takedown, submission, ground_strike (Brazilian) |
| aikido | 0.82 | 0.22 | 0.96 | 0.86 | counter, takedown, submission (joint locks) |

### Hybrid / Exotic
| Style | Range | Pressure | Counter | Grapple | Kicks | Signature |
|-------|-------|----------|---------|---------|-------|-----------|
| mma | 0.94 | 0.82 | 0.66 | 0.88 | 0.72 | jab, takedown, ground_strike, low_kick |
| capoeira | 1.04 | 0.58 | 0.76 | 0.16 | 0.98 | low_kick, heavy, counter (ginga, acrobatic) |
| silat | 0.92 | 0.78 | 0.78 | 0.62 | 0.76 | low_kick, counter, takedown (SE Asian) |
| wing_chun | 0.76 | 0.86 | 0.82 | 0.26 | 0.20 | jab, cross, counter (close-range, chain punches) |
| krav_maga | 0.86 | 0.94 | 0.50 | 0.58 | 0.52 | heavy, low_kick, takedown (military, brutal) |
| jeet_kune_do | 1.02 | 0.74 | 0.86 | 0.34 | 0.62 | jab, counter, low_kick (Bruce Lee) |
| panantukan | 0.82 | 0.88 | 0.68 | 0.50 | 0.08 | hook, counter, takedown (Filipino boxing) |

### 8 Tactical Modifiers (combine with any discipline)
- **pressure** — aggressive, forward (+pressure, +risk, +speed)
- **counter_striker** — reactive, punishes mistakes (+counter, -risk)
- **grinder** — wears you down (+grapple, +pressure)
- **rangy** — fights at distance (+range, +counter, +speed)
- **brawler** — wild, heavy (+pressure, +risk)
- **defensive** — shell up, wait (-pressure, +counter, -risk)
- **submission_hunter** — always looking for the tap (+grapple)
- **tactical** — balanced, smart (+counter, -risk, +speed)

**Example:** `capoeira_brawler` = acrobatic kicks + wild aggression. `boxing_counter_striker` = clean jab + reactive.

---

## Bannon: 36 Character Archetypes

Source: `Bannon/assets/moves/roster_movesets.json` (styleDistribution)

These are WRESTLING archetypes (character flavors, not pure martial arts):

### Core Wrestling
- TECHNICIAN (7) — mat wrestling, submissions
- LUCHADOR (7) — lucha libre, high-flying Mexican style
- HIGH_FLYER (6) — aerial, dives
- SHOWMAN (6) — entertainment, crowd work
- RING_GENERAL (5) — ring psychology, veteran
- STRIKER (4) — strikes in wrestling context
- BRAWLER (3) — wild fighting
- STRONGMAN (3) — power moves
- GIANT (3) — size-based
- GRAPPLER (2) — throws, suplexes
- SUB_SPEC (2) — submission specialist
- POWERHOUSE (1) — pure power
- MAT_TECH (1) — technical mat work

### Street / Hardcore
- STREET (3) — street fighting
- HARDCORE (2) — weapons, extreme
- MMA (2) — mixed martial arts
- BOXER (2) — boxing
- CAPOEIRA (2) — Brazilian acrobatic style

### Character Flavors
- OCCULTIST (3) — supernatural gimmick
- TRICKSTER (3) — deception, cheating
- CHEATER (3) — rule-breaking
- CULT_LEADER (2) — charismatic villain
- DAREDEVIL (2) — risk-taking
- ACROBAT (2) — gymnastics
- ENFORCER (2) — bodyguard style
- FERAL (2) — animalistic
- UNDEAD (2) — zombie/supernatural
- ATHLETE (2) — pure athleticism
- PRODIGY (2) — young phenom
- ROOKIE (2) — inexperienced
- COMEDIAN (1) — comedy wrestling
- DANCER (1) — dance-based (capoeira-adjacent)
- COWARD (1) — heel coward
- JUNIOR (1) — cruiserweight
- SPECIALIST (1) — niche expert

### Bannon Clip Categories (9)
From `fbx_move_map.json` — these are move categories, not styles:
- brawler (13 clips), hardcore (1), highFlyer (12), lucha (15), mma (11), powerhouse (27), showman (24), striker (35), technical (31)

---

## Bannon Extended Vocabulary (71+ styles)

Source: `URBAN-MAYHEM-/Docs/COMBAT_STYLE_SOURCE_CATALOG.md`
Harvested from Bannon's move-generation code.

### Power / Size
POWERHOUSE, GIANT, STRONGMAN, BRUISER, MONSTER, BEAST, SUMO, BODYBUILDER, ENFORCER, LUMBERJACK, GRECO, KINGS_ROAD, STRONG_STYLE, UNDEAD, KYOKUSHIN

### Grappling / Technical
TECHNICIAN, GRAPPLER, MAT_TECH, CATCH, SHOOTER, AMATEUR, FREESTYLE, JUDO, SAMBO, BJJ, SUB_SPEC, LUTA_LIVRE, RING_GENERAL, VETERAN, MMA, JUNIOR

### Aerial / Movement
HIGH_FLYER, LUCHADOR, CRUISERWEIGHT, DAREDEVIL, ACROBAT, WUSHU, TAEKWONDO, CAPOEIRA, KUNG_FU, DANCER, PRODIGY

### Striking / Brawler
BRAWLER, STREET, BARROOM, PRISON, BIKER, HARDCORE, GARBAGE, DEATHMATCH, BOXER, MUAY_THAI, KICKBOXER, SAVATE, STRIKER, COWBOY, BOUNCER, SPECIALIST

### Hybrid
ATHLETE, ROOKIE, SHOWMAN, ENTERTAINER, KARATE

### Character / Gimmick
TRICKSTER, CHEATER, COWARD, OCCULTIST, CULT_LEADER, FERAL, COMEDIAN, ROCKSTAR

### Urban Mayhem Original
**Drunken Brawler** — fictional style based on compensating for impaired movement. Not a real martial art, designed as game progression.

---

## AshLane: Current 6 Styles (NEEDS EXPANSION)

Source: `AshLane/src/game3d/char-gen.ts`

1. **street** — Dirty brawling. Haymakers, headbutts.
2. **boxing** — Jab-cross-hook fundamentals.
3. **kickboxing** — Punches plus kicks.
4. **wrestling** — Grapples, throws, slams.
5. **martial-arts** — Fast technical strikes (generic — needs splitting).
6. **lucha** — Referenced in faction weights but not fully defined.

---

## Priority for AshLane Expansion

### Tier 1: Street-Relevant (add first)
These fit AshLane's urban brawler identity:
- [ ] **muay_thai** — elbows, knees, clinch (devastating in street fights)
- [ ] **street_boxing** — bare-knuckle boxing
- [ ] **dirty_boxing** — clinch fighting, headbutts
- [ ] **capoeira** — already in Bannon, acrobatic kicks (street culture)
- [ ] **krav_maga** — brutal, practical (military/law enforcement)
- [ ] **panantukan** — Filipino dirty boxing (street-relevant)
- [ ] **jeet_kune_do** — Bruce Lee's style (street philosophy)
- [ ] **savate** — French kickboxing (stylish, urban)

### Tier 2: Grappling (for variety)
- [ ] **bjj** — ground fighting
- [ ] **judo** — throws
- [ ] **catch_wrestling** — old-school submissions
- [ ] **luta_livre** — Brazilian no-gi grappling
- [ ] **combat_sambo** — military grappling + strikes

### Tier 3: Traditional Martial Arts
- [ ] **karate** — split from generic "martial-arts"
- [ ] **taekwondo** — kicking specialist
- [ ] **wing_chun** — close-range, chain punches
- [ ] **silat** — SE Asian, blades-adjacent
- [ ] **aikido** — joint locks, throws (defensive)

### Tier 4: Character / Fun
- [ ] **drunken_brawler** — Urban Mayhem original (fictional)
- [ ] **sumo** — bulk grappling (fun visual)

### Already Have (don't duplicate)
- boxing, kickboxing, wrestling, street, lucha (partial), mma (in Bannon)

---

## Implementation Notes

### Urban Mayhem's System is the Best Template
The 24 disciplines with numeric stats (range, pressure, counter, grapple, kicks) + 8 modifiers is the most complete, game-ready system. AshLane should port this.

### Bannon's System is Wrestling-Specific
The 36 archetypes are great for character flavor but most are wrestling gimmicks (OCCULTIST, COMEDIAN, COWARD). Useful for NPC personality, not core combat.

### AshLane Needs
1. Port Urban Mayhem's 24 disciplines + stats into `char-gen.ts`
2. Port the 8 modifiers
3. Map each discipline to UAL/Mixamo animation clips
4. Update faction style weights to use the expanded list

---

## Files Referenced

- `mhvnsnt/Bannon` → `assets/moves/roster_movesets.json` (36 archetypes)
- `mhvnsnt/Bannon` → `assets/moves/fbx_move_map.json` (183 clips, 9 categories)
- `mhvnsnt/URBAN-MAYHEM-` → `Godot/scripts/combat_style_system.gd` (24 disciplines, 8 modifiers, 192 combos)
- `mhvnsnt/URBAN-MAYHEM-` → `Docs/COMBAT_STYLE_SOURCE_CATALOG.md` (71+ style vocabulary)
- `mhvnsnt/AshLane` → `src/game3d/char-gen.ts` (6 styles, needs expansion)

---

**"Hundreds" assessment:** The owner said "hundreds of coded fighting styles." The actual count:
- 24 fully-coded disciplines (Urban Mayhem Godot)
- 8 modifiers → 192 combinations
- 36 Bannon archetypes
- 71+ vocabulary terms

The "hundreds" comes from the 192 combinations. They're real and coded, not exaggerated.
