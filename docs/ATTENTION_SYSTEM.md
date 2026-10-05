# Attention System — "Kennedy's people are looking for you."

**Owner-approved 2026-10-05.** This is NOT GTA wanted stars. There are no
generic cops, no star UI, no police chases. Attention is faction-based:
make noise on the street and Edwin Kennedy's Corporate Structure — the
Combine — starts looking for you. With NAMED enforcers.

## Who is the Corporate Structure? (owner asked)

Short answer: **it's Kennedy's operation.**

- **The Corporate Structure** (Bannon canon): Edwin Kennedy's AWE +
  Stan Combs's JPCW — corporate control vs. personal freedom, the central
  conflict of the books.
- **Kennedy Corporate Structure** (AshLane): the Earth-AL corporate entity
  that bought out and demolished the wrestling territories. Kennedy's
  operation wearing a clean corporate name.
- **The Combine** (AshLane faction): the Structure's street-level muscle —
  private security, enforcers, eviction crews. Corporate navy, buzz cuts,
  "order is just violence with paperwork."

So when attention rises, it's not "the police" — it's **Kennedy's people
in corporate badges** coming to find out who you are and shut you down.

## The three tiers

| Tier | Attention | What happens |
|------|-----------|--------------|
| **Quiet** | 0–30 | Random street thugs, Yakuza-style. Visible on the street, **avoidable** — walk around them. Faction matches the district (Ashes in the alleys, Hollows in the subway, etc.). |
| **Noticed** | 30–70 | Corporate scouts — Combine security (2–4 grunts) actively sweeping the district looking for someone matching your description. |
| **Hunted** | 70–100 | A **named enforcer** is dispatched to hunt YOU specifically. They come to your district. One hunt at a time. |

## What raises attention

| Action | Gain | Notes |
|--------|------|-------|
| Public brawl | +14 | Starting/winning a fight in public view |
| Property damage | +7 | Smashing props, breaking windows |
| Beating a Combine member | +18 | They take it personally |
| Defeating a named enforcer | −25 | A statement. They back off... for now |

Gains are multiplied by district bias (rough districts notice more:
alleys ×1.25, warehouses ×1.15, park ×0.7).

## What lowers attention

- **Laying low** — not fighting, not sprinting. Decay jumps to 1.5/s.
  (~40 seconds of laying low clears a mid-level notice.)
- **Changing districts** — other districts' attention ×0.6. They lose
  the trail. The new district applies its own meter.
- **Time passing** — slow passive decay (0.25/s) after 5 quiet seconds.
- Corporate-controlled districts have attention **floors**: warehouses
  never drop below 15, the strip never below 10 (cameras, witnesses).

## The enforcers (escalation ladder)

Dispatched in order as attention climbs. Each has a street bio, fighting
style, quirk, and behavior notes in `src/game3d/attention.ts`.

1. **Grixf — "The Analyst"** (70+) — Kennedy's true believer. Studies
   your fights, shows up knowing your favorite punch. Learns mid-fight.
   Rides with 1 backup.
2. **Cold Frost — "The Technician"** (78+) — Kennedy's surgeon. Cold,
   clinical, precise. Targets whichever body region you've been hit in
   most (regional damage synergy). 2 backup.
3. **Machine Tiger — "The Stiff"** (85+) — Dynasty asset on loan.
   Doesn't flinch. Counter-specialist bruiser, high poise. 2 backup.
4. **Cain — "Kennedy's Final Answer"** (92+) — Kennedy's most trusted
   enforcer. Comes **alone**. That's scarier. Defeating him drops
   attention hard.

Rules:
- One hunt at a time. A dispatched enforcer keeps hunting across
  district changes — you can't shake them by running.
- The hunt is called off if district attention drops below 40.
- A defeated enforcer won't come back for 5 minutes (licking wounds).
  The NEXT enforcer up the ladder takes their place if attention is
  still high.
- Enforcers are spawned through `char-gen.ts` (`generateSquad("combine")`
  for backup) and `lieutenants.ts` (Cain already exists there as a
  street-persona lieutenant — the director references the same person).

## Anti-GTA framing (design law)

- Never call it "wanted" or "heat" in-game. It's **attention**.
- No star icons. The HUD signal is narrative: NPCs warn you, Combine
  chatter on the street changes, scouts visibly sweep.
- Enforcers are **characters**, not spawn waves. They have names, bios,
  grudges. Defeating Cain should feel like a story beat, not clearing
  a wanted level.

## Integration checklist

- [ ] `sim.ts`: call `director.report("publicBrawl" | "propertyDamage" | "combineDown")` on the relevant combat events.
- [ ] Game loop: call `director.update(dt)` every frame; `setLayingLow()` from player state (not in combat, not sprinting).
- [ ] District travel: call `director.enterDistrict(key)` on zone change.
- [ ] Spawner: poll `director.pollEncounter(seed)` periodically; spawn results via `generateSquad` / lieutenant lookup.
- [ ] Enforcer defeat: call `director.reportEnforcerDefeated(id)`; persist via `toJSON()`/`fromJSON()` in saves.
- [ ] HUD: tier-change events drive narrative warnings (no star UI).

## Module

`src/game3d/attention.ts` — `AttentionDirector` class, `ENFORCERS`,
tier helpers, district floors/biases. Pure logic, no three.js.
Type-checks clean under the repo tsconfig (only pre-existing `three`
typing noise from char-gen/quaternius in a bare checkout).
Smoke-tested: tier transitions, enforcer escalation (Grixf → Cold Frost
→ Machine Tiger → Cain), cooldown after defeat, hunt call-off, district
trail-loss, save roundtrip, laying-low decay.
