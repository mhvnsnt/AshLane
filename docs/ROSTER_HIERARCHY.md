# ASHLANE ROSTER HIERARCHY

> Owner directive (2026-10-05): 100+ characters total. Urban Reign-style — every
> grunt is a PERSON, not a clone. Bannon canon characters appear with STREET NAMES,
> not wrestling gimmicks. Full bios for everyone.
>
> Persona mapping rule (owner, 2026-10-05) — three tiers:
> 1. **KEEP AS-IS** — if their Bannon persona already works on the street
>    (urban / music / industry / corporate), keep it. No rename needed.
> 2. **GIVE STREET PERSONA** — if the wrestling gimmick is too heavy
>    ("The Executioner", "The Golden Bull"), give them a street name that fits
>    their personality. A powerhouse wrestler becomes a street enforcer.
> 3. **CAN KEEP WRESTLING** — characters in wrestling-specific factions stay
>    wrestlers. There WILL be wrestling factions in the game.

---

## 1. The Hierarchy (4 tiers)

### Tier 0 — BOSSES (hand-made, unique)
The faces of the war. Hand-built in Tripo or hand-assembled from parts. Unique
models, unique movesets, story missions built around them. ~8 characters.

| Street Name | Faction | Canon Parallel | Notes |
|---|---|---|---|
| **Ash Lane** | Ashes | Marquis/Bannon (parallel, not port) | Protagonist. LP uncomputable. |
| **Doc** ("Anchor") | Ashes | Atlas Vance | Gym owner. Moral center. |
| **Director Cole Vane** | Combine | Edwin Kennedy (parallel) | Halcyon face. Corporate heel. (Kennedy himself can also appear as-is — see §1b.) |
| **Sombra Negra** | Unaffiliated | Same character | The Calculated Mercenary. Already on roster. |
| **Onyx** | None (crosser) | Same character | Only Earth-crosser. Unlit. |
| **Hollow** | Hollows | (faction boss — owner's call on canon) | Burned-out Flame victim. Swarm leader. |
| **Rook** | Ashes | (original) | Teen runner. "?" side-chain giver. |
| **Mara Lane** | Ashes (deceased) | (original) | Ash's sibling. Backstory, not playable. |

### Tier 0b — KEEP-AS-IS CANON FIGURES (corporate / urban, no rename)
These characters' Bannon personas already work on the street. They appear as
themselves — no street name, no gimmick change.

| Name | Canon | Role in AshLane | Notes |
|---|---|---|---|
| **Edwin Kennedy** | "The Boss" / Mr. Edwin John Kennedy | Combine (Halcyon boardroom) | Already corporate. Micromanaging mogul energy fits Halcyon perfectly. Can appear alongside or above Director Cole Vane. |
| **Stan Combs** | "The Overlord" | Combine (Halcyon shadow) | Already corporate. The true power behind Halcyon — government-tied predator. Rarely seen, always felt. |
| **Stick Up** | Andre Curtis / "Jackboy" | Ashes (ally) | Already urban/music. Real person in canon — handle with care per owner. Street fighter, high-flyer, the heart. NOT the cyborg variant (separate). |
| **Finesse** | Narvin Jackson ("Finxsse") | Unaffiliated | Already urban/industry. Biker-street charisma, speed + power. Moved from lieutenant table — no rename needed. |

### Tier 1 — LIEUTENANTS (street personas for heavy wrestling gimmicks)
Canon characters whose wrestling gimmicks don't work on the street get street
names that fit their personality. Generated from the grunt pipeline with
**fixed seeds** (same person every time), distinctive looks, and full bios.
They lead squads, give missions, and show up as mini-bosses.

> **Rule:** Only rename EXISTING canon characters. If canon doesn't name someone,
> the slot stays OPEN for the owner. No invented book characters.

### Narrative secrets (PLOT TWISTS — never shown in-game)

Some characters have hidden allegiances that are story reveals, not public
knowledge. The roster, menus, HUD, and character select must NEVER spoil these.
They exist for writers and story scripts only.

- **Cain is undercover for the Dynasty Authority (police).** Publicly he shows
  as Unaffiliated — a Yakuza-boss / pimp street operator. Nobody in the
  narrative knows he's feeding the police. This is a late-story reveal, not a
  character-select label. (`secretFaction: "authority"` in `lieutenants.ts`)

---

| Street Name | Canon Name | Why Street? | Faction | Personality | Fighting Style |
|---|---|---|---|---|---|
| **Cain** | Cain Elias ("The Executioner") — based on The Undertaker | White guy, red hair. Yakuza-boss / pimp street persona — snake skin pants as everyday attire, street gear. NOT a wrestler here. | Unaffiliated (public) | Cold. Vindictive. Never raises his voice — that's what makes him scary. Surgical precision. | Wrestling (technical power) |
| **Cass** | Cassian Thorne ("The Golden Ratio") | "Ultimate Lure" gimmick too wrestling — becomes a smooth operator | Combine | Beautiful, untouchable, offers you everything if you just walk away from your people. The temptation. Never gets his hands dirty if he can help it. | Martial Arts (evasive, precise) |
| **Zero** | Mr. Zero Point ("The Nihilist") | Nihilist gimmick too abstract — becomes a chaos agent | Hollows | Pure chaos. Doesn't fight to win — fights to hurt. Unpredictable, laughs at the wrong moments. The thing the other Hollows are afraid of. | Street (wild, unorthodox) |
| **Griff** | Grixf ("The Grief Architect") | "Grief Architect" too wrestling — becomes a quiet fixer | Unaffiliated | Quiet. Analytical. Watches fights like he's reading a book he's already finished. Knows things. Sells information, not loyalty. | Martial Arts (counter-striker) |
| **Shadow** | The Shaolin Shadow | No real name in canon — street handle fits the discipline | Combine | Disciplined. Silent. A scalpel, not a hammer. Targets limbs, ends fights fast, bows after. Halcyon's most expensive asset. | Martial Arts (limb targeting) |
| **Akon** | Akon ("The Warrior") | KEEP — "The Warrior" already works as a street name | Ashes | Principled to a fault. Fights only for what's right — which makes him the most dangerous man on the block. Teaches the kids. | Boxing (power striker) |
| **Toro** | El Toro de Oro ("The Golden Bull") | Shortened — "Golden Bull" too wrestling, "Toro" is street | Unaffiliated | Loyal powerhouse. Protective — if you're his people, nobody touches you. Speaks little, hits hard. | Wrestling (power lucha) |
| **Fuego** | Rey "La Pluma" Fuego | KEEP — lucha names are street culture, not wrestling gimmick | Unaffiliated | Joyful high-flyer. Fights like he's dancing. The only person who seems to be having fun. Runs with Toro. | Lucha (aerial) |
| **Jaleel** | Jaleel Friday / Trap Shinobi | KEEP — real name already, no gimmick to strip | Hollows | Code-switches between goofy and terrifying. You never know which one you're getting until the first punch. Tactical mind under the act. | Martial Arts (tricky, misdirection) |
| **Lin** | (Shaolin-adjacent — slot open) | — | — | *OPEN — owner's call* | — |
| **Thorne's Heir** | (Combine lieutenant — slot open) | — | — | *OPEN — owner's call* | — |

### Tier 1b — WRESTLING FACTIONS (keep wrestling personas)
There WILL be wrestling factions in AshLane — underground fight clubs, lucha
circuits, and ex-promotion talent who never left the life. Characters here keep
their wrestling names, gimmicks, and presentation. They're the bridge between
the street world and the Bannon canon.

| Faction | Concept | Who Lives Here |
|---|---|---|
| **The Circuit** | Underground lucha / indie wrestling scene. Masks, entrances, crowds. The closest thing to "wrestling" in AshLane — but it's gritty, not corporate. | Fuego, Toro, lucha grunts. Any canon luchador who fits. |
| **The Old Guard** | Ex-promotion talent. They used to wrestle for the territories Halcyon demolished. Still carry the names, still work the gimmicks — it's all they know. | Open slots for canon wrestlers whose gimmicks ARE their identity. Owner's call on who. |
| **The Pit** | No-rules fight club. Wrestling moves, street rules. Where wrestlers and street fighters meet in the middle. | Crossover talent. Tournament nights. |

> Owner decides which canon wrestlers land here vs. get street personas. Default:
> if the gimmick is the person's identity (not just a stage name), they belong
> in a wrestling faction.

### Tier 2 — GRUNTS (generated, 60+)
The backbone. Generated by `char-gen.ts` with full personalities. Each one gets:
- A street name (faction pool, no duplicates in a squad)
- A 2-3 sentence bio
- A stat archetype (strong / fast / tanky / balanced / tricky)
- A fighting style (faction-weighted)
- A quirk (see §3)

**Distribution target:**

| Faction | Grunts | Notes |
|---|---|---|
| The Ashes | 18 | Neighborhood crew. Heart of the story. (Stick Up ally, not counted.) |
| The Combine | 18 | Halcyon muscle. Disciplined, equipped. |
| The Hollows | 14 | Burned-out Flame victims. Swarm missions. |
| The Unaffiliated | 14 | Mercs, luchadores, wildcards. (Finesse ally, not counted.) |
| Wrestling factions | 10 | The Circuit, Old Guard, Pit — grunt wrestlers with gimmicks intact. |
| **Total** | **74** | + 24 bosses/lieutenants/keep-as-is = **98 hand-placed** |

Plus infinite on-demand generation for swarms, crowds, and side missions.
**Target: 100+ unique characters in the shipped roster.**

### Tier 3 — CIVILIANS (background)
Non-combat NPCs. Shopkeepers, bystanders, kids, elders. Generated with the same
pipeline but `level: 0`, no fighting style. They give the world life — they run
from fights, cheer from windows, and remember what you did.

---

## 2. Stat Archetypes

Every grunt rolls one archetype. This is what makes them feel different in a fight,
not just look different.

| Archetype | HP | DMG | SPD | Personality Tell |
|---|---|---|---|---|
| **Bruiser** | ★★★★★ | ★★★★ | ★★ | Big. Slow. Hits like a truck. Taunts before swinging. |
| **Striker** | ★★★ | ★★★★★ | ★★★ | Glass cannon. Fast hands, no chin. Showoff combos. |
| **Tank** | ★★★★★ | ★★★ | ★★ | Walks through punches. Grabs you. Doesn't let go. |
| **Speedster** | ★★ | ★★★ | ★★★★★ | Can't hit what you can't catch. Dances, weaves, pot-shots. |
| **Balanced** | ★★★ | ★★★ | ★★★ | Fundamentals. Boring to watch, hard to beat. |
| **Tricky** | ★★ | ★★★ | ★★★★ | Feints, misdirection, dirty tricks. Fights smart, not hard. |

Archetype modifies the base `FIGHT_STYLES` multipliers in `char-gen.ts`.
A Bruiser Boxer and a Speedster Boxer play completely differently.

---

## 3. Quirks (personality in one line)

Each grunt gets one quirk. It's flavor text AND it hints at AI behavior.

**Universal quirks:**
- `fights-dirty` — eye pokes, low blows, throws sand. No honor.
- `protects-crew` — targets whoever's hitting his allies first.
- `showoff` — taunts after every knockdown. Leaves himself open.
- `hothead` — charges the player immediately. No patience.
- `coward` — hangs back, attacks only when you're busy.
- `loyal` — won't flee, won't switch targets. Stays on you.
- `opportunist` — waits for openings, punishes whiffs.
- `brawler` — loves the clinch. Wants to trade.
- `counter` — baits attacks, punishes hard.
- `wild` — unpredictable. Might do anything.

**Faction-specific quirks:**

*Ashes:*
- `block-pride` — "This is MY street." Fights harder on home turf.
- `big-brother` — shields weaker allies with his body.
- `old-head` — patient, teaches mid-fight ("watch the hands, kid").

*Combine:*
- `by-the-book` — disciplined formations, calls out targets.
- `overtime` — "I'm getting paid for this." Methodical, no wasted motion.
- `true-believer` — actually believes Halcyon's pitch. Creepy about it.

*Hollows:*
- `burned` — Flame-damaged. Fights through pain that should drop him.
- `hollow-laugh` — laughs while getting hit. Unsettling.
- `swarm-mind` — coordinates with other Hollows instinctively.

*Unaffiliated:*
- `mercenary` — "Nothing personal." Efficient, emotionless.
- `collector` — wants YOUR moves. Studies you mid-fight.
- `drifter` — might just walk away mid-fight if it's boring.

---

## 4. Bio Templates

Bios are 2-3 sentences, generated from templates with faction flavor.
Format: `[Origin] [Why they fight] [Quirk hint]`

**Ashes examples:**
> "Grew up three doors down from the gym. Fights because somebody has to hold the
> block. Swings wide but means every word of it."
>
> "Used to run with the Combine until she saw what they did to the corner store.
> Now she's Ashes for life. Patient — waits for you to make the first mistake."

**Combine examples:**
> "Ex-military, dishonorably discharged. Halcyon pays better than the army and
> asks fewer questions. Fights like it's a job, because it is."
>
> "True believer. Thinks the demolitions are 'urban renewal.' Will lecture you
> about property values while breaking your ribs."

**Hollows examples:**
> "The Flame took his brother first. Then it took him. What's left fights because
> fighting is all that's left. Don't let him grab you."
>
> "She laughs when she gets hit. Nobody knows if it's the Flame or if she was
> always like this. Either way, put her down fast."

**Unaffiliated examples:**
> "Lucha circuit washout. Still wears the mask — says it's the only honest thing
> he owns. Fights for cash, stays for the crowd."
>
> "Nobody knows where she's from. Shows up, collects, disappears. The only thing
> anyone agrees on: don't let her study you too long."

---

## 5. Naming Rules

- **No duplicates** within a squad or mission.
- **Faction pools** in `char-gen.ts` — 16+ names each, expandable.
- **Lieutenants** have fixed names (the street-name table above).
- **Bosses** have full names (first + street + last where appropriate).
- **Grunts** get first-name or nickname only — they're not important enough for
  last names yet. (If a grunt survives 3 missions, promote them: give them a last
  name and a lieutenant slot. Urban Reign energy.)

---

## 6. What Needs Owner Input (do NOT invent)

- Tyneshia Hall parallel — slot open
- The Celtic Fury — no canon real name, slot open (wrestling faction or street persona?)
- Captain Unity, Agent Canuck, Lady Rhiannon — JPCW assets, slots open
- Which canon wrestlers go to wrestling factions vs. get street personas — owner's call
- The Old Guard roster — which ex-promotion talent survived the demolitions?
- The Core endgame — owner's call
- Any new book characters — NEVER invent these

---

## 7. Implementation

- Personality system: `src/game3d/char-gen.ts` — `QuirkId`, `ARCHETYPES`,
  `generateBio()`, `generatePersonality()` (added 2026-10-05)
- Street-name lieutenants: `src/game3d/lieutenants.ts` (to be created — fixed-seed
  named characters with full bios)
- Faction name pools: expanded in `FACTIONS` definitions
- Mission integration: squads pull grunts with personalities; lieutenants are
  placed as mini-bosses via `missionWave()` with fixed seeds
