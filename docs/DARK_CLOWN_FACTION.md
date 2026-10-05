# THE PAINTED — Dark Clown Faction Bible

> **Faction name is PROPOSED — owner approval needed.** Alternatives: "The Carnival", "Los Payasos", "The Masquerade", "The Freakshow".

## Concept

Dark emo clown gang. Juggalo face paint + emo + cholo/chola + wrestling masks. Dark, theatrical, dangerous. They wear the paint like a uniform and treat every fight like a show where the audience bleeds.

Unlike the other factions, The Painted are **not from the books** — they're game-only, running outside the numerology engine. In AshLane (Earth-AL), they've carved out territory in the abandoned carnival grounds and surrounding blocks.

## The Six

All bios sourced from `canon/godwithin/noncanon_roster.md` (Bannon repo). Street personas kept as-is — the paint IS the street persona.

### ONYX — "The Obsidian Hex" (Leader)

Black woman, white chola/vamp facepaint, spiked leather. Her Life Path isn't unknown — it's **uncomputable**. She exists outside whatever assigns numbers in this universe. Nobody can read her because there's nothing to read.

**In AshLane:** Runs The Painted. Recruits people the system failed — not with promises, with proof that you can exist without a number deciding you in advance. Genuinely gray, not a cartoon villain.

**Fighting style:** Denial Grappler. Doesn't out-power you — erases what you've built. Counters, momentum theft, near-zero startup repositioning. Lower raw damage. Wins on information denial.

**Finisher:** *The Vacancy* — no setup, ends the sequence mid-motion.

**AshLane style mapping:** `mma` (takedowns, submissions, counters)

---

### CIPHER — "The Undefined"

Anti-Pattern Brawler. His Life Path recalculates to a different digit every time it's read. His offense is genuinely non-deterministic move-to-move — real RNG in attack selection. You cannot gameplan for him because there is no pattern.

**In AshLane:** Onyx's wild card. The one she points at problems.

**Fighting style:** Unpredictable brawling. Swings from angles that don't make sense until they land.

**Finisher:** *The Undefined* — randomizes between three finishers, no tell.

**AshLane style mapping:** `drunken` (unpredictable sway, off-balance strikes) / `street`

---

### ECHO — "The Reflection"

Mimic. She has no Life Path of her own — hers is whatever the opponent runs. She reads you, mirrors you, then hits you with your own best move.

**In AshLane:** The scout. Watches fights from the crowd, learns your patterns, then steps in.

**Fighting style:** Technical counter-fighter. Whatever you do, she does back — harder.

**Finisher:** *The Reflection* — no signature of her own. She hits you with YOUR move.

**AshLane style mapping:** `martial-arts` (technical, reads, counters)

---

### HOLLOW — "The Unheard" (Recruiter)

Masked wrestler in the Super Dragon mold — stiff, silent, terrifying. His Life Path resolves to a flat **0**, which is impossible under the universe's rules. A system error in a body. Never does an entrance. Never touches a mic.

**In AshLane:** Onyx's recruiter. Targets people whose lives already failed them and offers exit — from the number, from the system, from everything. The paint is the invitation.

**Fighting style:** Silent Submission Specialist. Stiff strikes to soften you up, then the mat.

**Finisher:** *The Unheard* — sudden guillotine. You don't see it coming because he's been silent the whole match.

**AshLane style mapping:** `wrestling` (grapples, submissions, stiff strikes)

---

### STATIC — "The Corrupted Frame"

Two conflicting Life Paths superimposed on each other, interfering like bad reception. Visually flickers and glitches — but only near Onyx. Power and interference made flesh.

**In AshLane:** The enforcer. When The Painted need something broken — a person, a building, a situation — Static walks in and reality stutters.

**Fighting style:** Power brawler. Overwhelming force with unnatural timing.

**Finisher:** *The Corrupted Frame* — a powerbomb where the world glitches on impact.

**AshLane style mapping:** `wrestling` (power, slams)

---

### THEORY — "TBD" (New Blood)

> **BIO INCOMPLETE — owner input needed.** Owner has a model. Current info: dark emo clown aesthetic, part of the gang. No confirmed backstory, fighting style, or finisher yet.

**What's missing:**
1. Real name / street name (is "Theory" the street name or a placeholder?)
2. Backstory (how did they join The Painted?)
3. Fighting style (what's their in-ring identity?)
4. Finisher / signature
5. Relationship to the other five (who recruited them?)

**Placeholder role:** Newest member. Still earning the paint. The one the player might actually beat — a gatekeeper before the real monsters.

**Suggested AshLane style mapping:** TBD by owner. `lucha` (theatrical, aerial) would fit the clown aesthetic, or `street` for a raw newcomer.

---

## Territory

The abandoned carnival grounds on the edge of the Warehouse District. Rusted Ferris wheel, collapsed funhouse, ticket booths turned into lookouts. They've painted everything — the rides, the walls, their faces. At night you can hear the music from three blocks away.

## Colors & Aesthetic

- **Clothing:** Blacks, dark purples, blood reds, bone white. Torn fishnets, spiked leather, oversized jerseys with the paint-splatter logo.
- **Face paint:** Every member wears it. Juggalo-style white base with black/red detailing, chola teardrops, emo streaks. Never takes it off in public.
- **Accent color:** Blood red (`0xcc1122`)
- **Masks:** Hollow wears a full wrestling mask (Super Dragon style). Others use paint as their mask.

## Grunt Archetype: "The Painted Ones"

5–10 generated minions. Dark clown aesthetic — face paint implied through pale skin tones and dark clothing. They fight like the gang: theatrical, unpredictable, loyal to the paint.

**Stat bias:** Balanced-to-tricky. They're not the biggest — they're the ones who laugh while getting hit.

**Style distribution:** wrestling 25, street 25, martial-arts 15, drunken 10, lucha 10, mma 10, capoeira 5

**Quirks:** painted-face, carnival, wild, showoff, recruiter, fights-dirty, counter

### Generated Grunt Recipes (deterministic, seed-based)

```json
[
  {
    "seed": 9001, "faction": "painted", "name": "Riddle",
    "bodyId": "male", "skinTone": "0xf5d7b8", "heightScale": 1.02, "bulkScale": 0.95,
    "hairId": "hair_long", "beard": false, "browsId": "brows_thick",
    "shirtColor": "0x1a1a1a", "pantsColor": "0x2a2a2a", "accentColor": "0xcc1122",
    "pattern": "graffiti", "patternSeed": 4102,
    "style": "street", "level": 2, "hpMul": 1.0, "dmgMul": 1.1, "speedMul": 1.0,
    "quirk": "carnival", "archetype": "tricky",
    "bio": "Ran away to the carnival grounds at sixteen. Never left. Treats the fight like a show. You're the audience. Riddle laughs while they circle you, and it's not joy."
  },
  {
    "seed": 9002, "faction": "painted", "name": "Calavera",
    "bodyId": "female", "skinTone": "0xd19a6b", "heightScale": 0.97, "bulkScale": 0.9,
    "hairId": "hair_buns", "beard": false, "browsId": "brows_arched",
    "shirtColor": "0x2d1a3e", "pantsColor": "0x1a1a1a", "accentColor": "0xcc1122",
    "pattern": "solid", "patternSeed": 8821,
    "style": "lucha", "level": 3, "hpMul": 0.85, "dmgMul": 1.0, "speedMul": 1.4,
    "quirk": "painted-face", "archetype": "speedster",
    "bio": "Day of the Dead face paint, every day. Nobody's seen under it in years. Wears the paint. Never takes it off. Nobody's seen what's under. Calavera moves like smoke."
  },
  {
    "seed": 9003, "faction": "painted", "name": "Broma",
    "bodyId": "male", "skinTone": "0xc68642", "heightScale": 1.05, "bulkScale": 1.1,
    "hairId": null, "beard": true, "browsId": "brows_thick",
    "shirtColor": "0x4a0a0a", "pantsColor": "0x1a1a1a", "accentColor": "0xcc1122",
    "pattern": "stripes", "patternSeed": 1193,
    "style": "wrestling", "level": 3, "hpMul": 1.35, "dmgMul": 1.25, "speedMul": 0.8,
    "quirk": "showoff", "archetype": "bruiser",
    "bio": "Ex-lucha circuit. Still wears the mask under the paint. Taunts after knockdowns. Leaves openings. Broma wants you to know you're being beaten by a clown."
  },
  {
    "seed": 9004, "faction": "painted", "name": "Mimo",
    "bodyId": "male", "skinTone": "0xeec39e", "heightScale": 0.94, "bulkScale": 0.88,
    "hairId": "hair_buzzed", "beard": false, "browsId": "brows_thin",
    "shirtColor": "0xf5f5f5", "pantsColor": "0x1a1a1a", "accentColor": "0xcc1122",
    "pattern": "solid", "patternSeed": 5567,
    "style": "martial-arts", "level": 2, "hpMul": 0.85, "dmgMul": 1.1, "speedMul": 1.2,
    "quirk": "counter", "archetype": "tricky",
    "bio": "Doesn't talk. Just stares through the paint. Baits attacks, punishes hard. Mimo learned silence from Hollow. The paint does the talking."
  },
  {
    "seed": 9005, "faction": "painted", "name": "Payaso",
    "bodyId": "female", "skinTone": "0x9c6234", "heightScale": 1.0, "bulkScale": 1.05,
    "hairId": "hair_long", "beard": false, "browsId": "brows_thick",
    "shirtColor": "0x1a1a1a", "pantsColor": "0x3d1a3e", "accentColor": "0xcc1122",
    "pattern": "graffiti", "patternSeed": 9034,
    "style": "drunken", "level": 2, "hpMul": 1.0, "dmgMul": 1.0, "speedMul": 1.1,
    "quirk": "wild", "archetype": "balanced",
    "bio": "Chola from the east side. The teardrops are real. Unpredictable. Might do anything. Payaso fights like the ground is lying to her — because to her, it is."
  },
  {
    "seed": 9006, "faction": "painted", "name": "Truco",
    "bodyId": "male", "skinTone": "0x8d5524", "heightScale": 1.08, "bulkScale": 1.15,
    "hairId": "hair_parted", "beard": true, "browsId": "brows_thick",
    "shirtColor": "0x2a2a2a", "pantsColor": "0x1a1a1a", "accentColor": "0xcc1122",
    "pattern": "camo", "patternSeed": 2281,
    "style": "wrestling", "level": 4, "hpMul": 1.5, "dmgMul": 1.0, "speedMul": 0.75,
    "quirk": "recruiter", "archetype": "tank",
    "bio": "Hollow's right hand. Trying to recruit you. The paint is the invitation. Truco doesn't want to hurt you — he wants you to join. Refuse twice and he stops asking."
  },
  {
    "seed": 9007, "faction": "painted", "name": "Risa",
    "bodyId": "female", "skinTone": "0xe0ac82", "heightScale": 0.95, "bulkScale": 0.92,
    "hairId": "hair_buns", "beard": false, "browsId": "brows_arched",
    "shirtColor": "0x3e0a0a", "pantsColor": "0x2a2a2a", "accentColor": "0xcc1122",
    "pattern": "stripes", "patternSeed": 7745,
    "style": "capoeira", "level": 3, "hpMul": 0.9, "dmgMul": 1.15, "speedMul": 1.25,
    "quirk": "carnival", "archetype": "speedster",
    "bio": "Laughs while she fights. It's not joy. Treats the fight like a show. You're the audience. Risa learned capoeira from a street performer who vanished. She kept the moves and the laugh."
  },
  {
    "seed": 9008, "faction": "painted", "name": "Loco",
    "bodyId": "male", "skinTone": "0xb0713a", "heightScale": 0.99, "bulkScale": 1.0,
    "hairId": "hair_buzzed", "beard": false, "browsId": "brows_thin",
    "shirtColor": "0x1a1a1a", "pantsColor": "0x1a1a1a", "accentColor": "0xcc1122",
    "pattern": "solid", "patternSeed": 3319,
    "style": "street", "level": 1, "hpMul": 1.0, "dmgMul": 1.0, "speedMul": 1.0,
    "quirk": "fights-dirty", "archetype": "balanced",
    "bio": "Newest paint. Still learning what the laugh means. Eye pokes, low blows. No honor. Loco hasn't earned a real name yet. The gang calls him Loco because he showed up laughing."
  }
]
```

## Mission Integration

- **Introduction:** Player encounters Painted grunts in the Warehouse District (near the carnival grounds) from Chapter 2 onward.
- **Escalation:** Lieutenants (Cipher, Echo, Static) appear as mini-bosses. Hollow is a Chapter 3 boss. Onyx is endgame.
- **Theory:** Gatekeeper fight when their bio is finalized by the owner.
- **Swarm missions:** Painted swarm fights (carnival grounds ambush) use `setMaxAttackers(8)`.

## Sources

- `canon/godwithin/noncanon_roster.md` — Onyx, Cipher, Echo, Hollow, Static bios
- `canon/godwithin/GOD_WITHIN_mode.md` — faction context, render hooks
- `docs/MDICKIE_ATTIRE_MAP.md` — Hollow = Super Dragon-type (masked stiff)
- Owner voice notes 2026-10-05 — dark emo clown gang description (Juggalo + emo + cholo + wrestling)

## Open Items (Owner)

1. **Faction name approval:** "The Painted" is proposed. Alternatives listed at top.
2. **Theory bio:** 5 questions above need answers before Theory can be a real boss fight.
3. **Theory model:** Owner says a model exists — needs to be uploaded/imported to AshLane.
4. **Face paint system:** Current char-gen uses material tints only. True Juggalo face paint needs a procedural texture layer (future work — flagged, not blocking).
