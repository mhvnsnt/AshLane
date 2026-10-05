# AshLane Movesets — Tekken / Soulcalibur / Urban Reign Style

Every named character in AshLane has their own unique movelist. Picking a
different character FEELS different — like Tekken, not like a palette swap.

## Input Legend (Tekken notation, adapted for a 3D brawler)

| Input | Meaning |
|-------|---------|
| `1` | Left punch |
| `2` | Right punch |
| `3` | Left kick |
| `4` | Right kick |
| `f` / `b` | Forward (toward opponent) / Back |
| `d` / `u` | Down / Up |
| `d/f` | Down-forward (crouch dash) |
| `1,2` | Press 1 then 2 in sequence (natural string) |
| `f+2` | Forward + right punch together |
| `1+2` | Both punches — grapple/throw attempt |
| `WR` | While running |
| `WS` | While rising (from crouch / knockdown) |
| `Rage` | Finisher — only usable at critical health |

## Move Properties

| Property | Meaning |
|----------|---------|
| `launcher` | Launches the opponent (juggle starter) |
| `knockdown` | Forces knockdown on hit |
| `wall-splat` | Splats against walls for extra damage |
| `unblockable` | Can't be blocked (all grapples) — must be evaded |
| `counter-hit` | Bonus damage/frames when interrupting an attack |
| `armor` | Absorbs hits during the move |
| `stance` | Enters a stance (follow-ups branch from it) |
| `evade` | Sidesteps / avoids attacks |
| `cinematic` | Finisher camera treatment |
| `submission` | Can end the fight by submission, not just KO |
| `low` / `high` / `mid` | Hit level — crouch beats high, stand beats low |

## Frame Data Convention

60 ticks/second (matches `sim.ts` and `federated/framedata.ts`).
Reference values from the federated frame-data system:

| Move class | Startup | Active | Recovery | Damage |
|------------|---------|--------|----------|--------|
| Fast jab | 5–7 | 3 | 9–11 | 5–8 |
| Mid strike | 9–13 | 3–4 | 14–20 | 9–15 |
| Heavy | 14–20 | 4–5 | 22–30 | 16–24 |
| Grapple | 14–20 | 4–5 | 24–32 | 16–28 (unblockable) |
| Finisher | 16–24 | 5–6 | 34–42 | 40–48 (unblockable) |

Combo damage scaling follows `federated/framedata.ts` (`comboScale`).

## Clip Bindings

`clip` references a real animation asset:
- **bank.json keys** (50 clips): `boxing`, `boxing1/2/3`, `jabcross`, `bodyblow`,
  `elbow`, `knee`, `slugger`, `rib`, `dropkick`, `chokeslam`, `german`,
  `suplex`, `ddt`, `backdrop`, `brainbuster`, `takedown`, `hurricane`,
  `capoeira`, `ginga`, `esquiva`, `au`, `drunkidle`, `drunkwalk`, `evade`,
  `corkscrew`, `bigjump`, `crossjump`, `tiger`, `feral`, `kip`, `rise`,
  `guardhigh`, `block`, `Roll`, …
- **UAL clips**: `Punch_Jab`, `Punch_Cross`, `Melee_Hook`, `Melee_Hook_Rec`,
  `Hit_Chest`, `Hit_Head`, …

`resolveClip()` in `movesets.ts` maps any `TODO_CLIP_*` placeholder to a
guaranteed-existing fallback so nothing ever T-poses at runtime.

## Roster Coverage

| Group | Characters | Moves each |
|-------|-----------|------------|
| Lieutenants | Cain, Cass, Zero, Griff, Shadow, Toro, Jaleel, Akon, Fuego, Finesse, Stick Up | 10–11 + 1 finisher |
| Dynasty Authority | Silas, Titus, Great White North, Finn Mac, Kiko Tanaka, Astrid | 10 + 1 finisher |
| Bosses | Ash Lane (2 finishers), Doc, Cole Vane, Sombra Negra, Onyx, Hollow, Rook, Edwin Kennedy, Stan Combs | 10–11 + 1–2 finishers |
| **Total** | **26 characters** | **262 moves, 28 finishers** |

Generated grunts share per-faction pools (`FACTION_MOVESETS` — 6 factions,
6 core moves + 1 finisher each), with per-grunt variation from
`char-gen.ts` archetype multipliers. Named characters always override with
their unique lists.

## Design Notes

- **Moves reflect style AND personality.** Cain (wrestling/tank) gets the
  chokeslam and Tombstone; Kiko (kung fu/speedster) gets Five Animals stance
  branches and the Shining Wizard; Zero (street/chaos) gets armored haymakers.
- **Canon finishers preserved.** The Final Verdict (Cain), La Trampa de Plata
  (Sombra Negra), The Vacancy (Onyx), The Unheard (Hollow), The Lion's Roar
  (Akon), El Beso del Sol (Fuego), Twisted Faith (Stick Up), The Confession
  (Finn Mac), Shining Wizard (Kiko), The Scandinavian Lock (Astrid),
  The Indefinite Suspension (Kennedy).
- **Kiko's stance system** (`d+1+2~1` … `~5`) mirrors Lei Wulong's Five Animals
  from Tekken — one stance entry, five branches.
- **The Flame is never named in-game.** Ash Lane's movelist describes the
  power without naming it, per owner direction.

## Move-Structure Reference

Frame-data fields (`startup`/`active`/`recovery`/`damage`/`hitstun`,
`launcher`, throw escapes, followups, counter windows) follow the
architecture of SchwarzerblitzEngine's `FK_Move`
(`mhvnsnt/SchwarzerblitzEngine`, Andrea Demetrio, BSD-style license) —
original implementation, no engine code copied.
