# Open-World Mission Structure Research (2026-10-05)
How Yakuza, The Witcher 3, and GTA V handle open-world missions — concrete mechanics for AshLane to adapt.

The owner's directive: AshLane should be Yakuza-style. Dense connected city. You travel to missions. You talk to NPCs. NOT isolated mission levels. Every area is connected — you can revisit anywhere no matter what mission you're on.

---

## YAKUZA (0 / Kiwami / 7)

### Kamurocho structure
- One dense district (fictional Kabukicho, Tokyo). Small on paper, packed wall-to-wall: restaurants, bars, shops, arcades, karaoke, batting cages, casinos — all within a few blocks.
- You learn it by walking. No loading between streets. The density IS the design.
- Later games add a second city (Sotenbori/Osaka, Ijincho/Yokohama) — traveled via taxi, unlocked by story progress.

**AshLane parallel:** One dense neighborhood ("The Blocks" / AshLane district), not a sprawling empty map. Alley, main strip, warehouse row, parking garage, subway entrance — all walkable, no loading. Density over size.

### Main missions
- Chapter-based story. A purple story marker appears on the map/minimap. Walk to it. Cutscene plays. Fight/location loads seamlessly (same city, just a new interior or blocked-off street).
- Between story beats: free roam. The game never teleports you to the next mission — you walk there.

**AshLane parallel:** Story missions appear as markers on the district map. Player walks/drives there. No "mission select → teleport" — travel is part of the game.

### Substories (side quests)
- Trigger: blue diamond icon or yellow speech bubble on the minimap. Walk up to the NPC, press the action button.
- Some only appear at specific story chapters or times of day.
- Types: odd jobs (deliver, collect), minigames (darts, karaoke, bowling), combat (protect someone, beat thugs), emotional stories, comedy.
- An in-game substory menu tracks active/completed.

**AshLane parallel:** "Street stories" — "?" markers for NPCs with problems. Walk up, talk, get a task. Some only available after certain story progress. Tracked in a menu.

### Taxi fast travel
- Must physically walk to a taxi and interact with it ONCE to register the location. Then you can warp there from any other taxi.
- Costs money per ride (~730 yen). Calling from the phone menu costs more.
- Doubles as an encounter reset — hop in a taxi to despawn nearby thugs.

**AshLane parallel:** "Corner rides" or "bus stops" — discover by walking to them, then fast-travel between discovered points. Small cash cost. This is better than Witcher's free signposts for a street game — money has to mean something.

### Random street encounters
- Thugs roam the streets. Walk too close and a fight triggers — the street becomes an arena (invisible walls go up).
- You get EXP/money from winning.

**AshLane parallel:** Rival crew members patrol. Bumping into them starts a brawl. This keeps the open world dangerous between missions.

### Heat Actions (contextual finishers)
- Heat gauge sits under the health bar. Fills by landing attacks and grabs.
- When a segment is full, contextual prompts appear: near a wall → "Wall Crush" (slam head into wall). Near a railing → "Essence of Back Breaking" (drop them on it). Holding an object → weapon-specific finisher. Enemy on ground → ground finisher.
- Short cinematic, big damage, QTE button press for bonus.

**AshLane parallel:** This is the single most important combat mechanic to adapt. Contextual finishers based on: proximity to wall, object in hand, enemy state (standing/staggered/down), number of nearby enemies. NOT random — the player sees the prompt and chooses.

### NPC interactions
- Talk (some give tips, some start substories)
- Shop (weapons, food, clothes)
- Eat at restaurants (heals + EXP buff)
- Minigames (karaoke, darts, mahjong, batting, arcade, casino)
- Drink at bars (bonding, buffs)

**AshLane parallel:** Corner stores (heal items), clothing shops (gear with stats), gym (train stats), bar/arcade (minigames TBD). Eating = heal. Keep it street-level.

---

## THE WITCHER 3

### Notice boards → contracts
- Walk to a notice board in any village. Interact. It adds map markers and journal entries for that region.
- Contract flow: (1) Read the notice → (2) Find and talk to the quest giver → (3) Haggle for reward (dialogue choice affects pay) → (4) Investigate with Witcher Senses (follow tracks, examine clues) → (5) Fight the monster → (6) Return for reward.
- Boards also reveal non-contract quests: fistfights, races, treasure hunts.

**AshLane parallel:** "Bulletin boards" at gyms, bars, community centers. Walk up, read. Adds "street jobs" to the journal: bounties (beat a specific fighter), protection (escort), collection (get money back). The haggle step becomes "negotiate the cut."

### Signpost fast travel
- Must physically walk to a signpost to discover it. Then fast-travel between any two discovered signposts via the world map.
- Signposts sit at village gates, crossroads, harbors (boats are separate, nautical-only).
- Free — no cost. The "cost" is the discovery walk.

**AshLane parallel:** Yakuza's taxi system fits AshLane better (money cost, street flavor). But Witcher's "must discover on foot first" rule is the keeper — no teleporting somewhere you've never been.

### Dialogue choices
- Branching dialogue with hidden consequence tracking. The game does NOT show you a meter.
- Key example: Ciri's fate is decided by 5 dialogue moments across the late game. Each adds a hidden positive/negative mark. 3+ positive = she lives. The player never sees the score.
- Some dialogue is timed — hesitate and the game picks for you.
- Minor choices: NPCs remember if you were rude. Sparing someone in an early quest makes them reappear later.

**AshLane parallel:** Dialogue with 2-4 options. Timed responses in heated moments (gang confrontations). Hidden "respect" tracking per crew — help them and they back you up later; disrespect them and they jump you. No visible meter. Sparing a defeated rival → they return as an ally or rematch later.

---

## GTA V

### Story mission triggers
- Letter markers on the map, color-coded by protagonist (green/Franklin, blue/Michael, orange/Trevor). Walk or drive into the marker.
- Phone calls and text messages also trigger missions — the phone rings, you answer, mission starts.
- Some missions chain: finish one, the next marker appears immediately.

**AshLane parallel:** Story markers as letters/initials on the map. Phone calls ("Yo, meet me at...") trigger missions dynamically — this is more alive than a static marker list. Text messages give side-job offers.

### Strangers & Freaks (side missions)
- "?" markers on the map. Walk up to an eccentric NPC. 58 total across three protagonists.
- Unlock progressively — new "?" appears after completing certain story missions.
- Some are multi-part chains (Dom's 4 parachute jumps, Beverly's 5 paparazzo missions).
- Two require collectibles first: 50 spaceship parts → Omega's alien finale. 50 letter scraps → murder mystery.
- Only 20 (Franklin's) count toward 100% completion.

**AshLane parallel:** "?" markers for weirdos with multi-part quest chains. Some gated behind collectibles (e.g., "find all 12 tagged walls → unlock the artist's finale"). Chains of 3-5 parts, not one-offs.

### Wanted system (→ "Heat" for a brawler)
- 1–5 stars. Shown on screen.
- 1 star: cops chase, try to arrest. Shoot only if threatened.
- 2 stars: shoot to kill. Backup called. Roadblocks.
- 3 stars: helicopter tracks you. Advanced tactics.
- 4 stars: SWAT-equivalent response.
- 5 stars: maximum response, streets flooded.
- Line of sight: radar flashes red/blue when cops see you. Break line of sight → stars flash → search cones appear on radar showing where they're looking. Stay out of the cones until they call off the search.
- Losing them: hide in alleys, go dark, use tunnels, switch vehicles while hidden, wait it out.
- Getting busted/wasted: lose cash + ammo/weapons, respawn at station/hospital.

**AshLane parallel — the "Heat" system:**
- 1–5 "heat" levels. Shown as a meter.
- 1 heat: rival lookouts follow you, might jump you 1v1.
- 2 heat: crew sends 2-3 fighters after you.
- 3 heat: crew enforcer + backup, they hunt in your last known area (search cones on minimap).
- 4 heat: the crew's heavy hitters, coordinated.
- 5 heat: the boss's personal squad — effectively a roaming boss fight.
- Gained by: beating crew members in the open world, trashing their businesses, completing anti-crew missions.
- Lost by: breaking line of sight and staying hidden until the search meter drains. Laying low (entering a shop, taking a taxi). Completing a mission (resets to 0).
- Getting beaten at high heat: lose cash, drop to 0 heat, wake up at the safehouse.

---

## AshLane open-world design (synthesis)

### The city
- One dense district. Named streets and landmarks: the main strip, the alley network, warehouse row, the garage, the subway station, the park, the projects.
- All connected, no loading. Interiors (gym, bar, shops) are small seamless loads.
- NPCs: pedestrians (ambient), shopkeepers (interact), crew members (hostile at heat), story NPCs ("?" markers).

### Mission flow (the Yakuza loop)
1. Free roam the district.
2. Story marker (letter) on map → walk there → cutscene → mission.
3. Mission complete → back to free roam. Walk to the next marker.
4. Between missions: substories ("?"), shops, training, random encounters, heat chases.

### Discovery systems
- Notice/bulletin boards at 3-4 fixed spots → street jobs (bounties, protection, collection).
- "?" NPCs → multi-part side chains.
- Taxis/bus stops → discover on foot, then fast-travel for cash.
- Phone calls/texts → dynamic mission offers.

### Dialogue
- 2-4 options, some timed. Hidden respect tracking per crew. Choices have delayed consequences (spared rival returns).

### Heat (not "wanted")
- 5-level crew aggression system with search cones, line-of-sight, and lay-low mechanics. Getting beaten at high heat costs cash.

### What NOT to copy
- Witcher's free fast travel (use Yakuza's paid taxi — money matters in a street game).
- GTA's vehicle focus (AshLane is on foot — the city is dense, not sprawling).
- Witcher's 136 km² scale (AshLane is one neighborhood, dense like Kamurocho).
- GTA's 3 protagonists (one protagonist, deeper).

### Anti-slop rules (owner directive, recorded in repo)
- Every system above is from an actual game, with the actual mechanic named.
- No invented systems. No "it would be cool if." If it's not in Yakuza/Witcher/GTA/Urban Reign/Def Jam, it needs its own research pass.
- Research continues in parallel with building. New mechanics get documented here before they're built.
