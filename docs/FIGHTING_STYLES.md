# AshLane Fighting Styles — Complete Catalog

**Source:** Pulled from across the owner's repos (Bannon move library, animation clips, Def Jam research).
**Owner direction (2026-10-05):** Street-first. Wrestling is ONE style among many. Think Def Jam + Urban Reign + music culture.

---

## Bannon's 10 Wrestling Styles (from `bannon_move_library.json`)

These are the coded wrestling styles in Bannon. In AshLane, "wrestling" becomes ONE style, but the others inform sub-styles:

| Style | Philosophy | AshLane Use |
|-------|-----------|-------------|
| technical | Chain wrestling, submissions | Wrestling sub-style |
| powerhouse | Slams, throws, raw power | Wrestling sub-style |
| highFlyer | Aerial, springboards | → Lucha |
| brawler | Haymakers, dirty fighting | → Street |
| striker | Kicks, knees, elbows | → Kickboxing/Muay Thai |
| lucha | Masks, high-flying | → Lucha (expanded) |
| mma | Ground game, submissions | → MMA (new) |
| hardcore | Weapons, no rules | → Street (weapons) |
| oldSchool | Classic holds | Wrestling sub-style |
| showman | Taunts, crowd play | Personality layer |

---

## AshLane Street Styles (expanded from 6 → 14)

### Tier 1: Core (already in char-gen.ts)
1. **Street** — Dirty brawling. Haymakers, headbutts. (Bannon: brawler/hardcore)
2. **Boxing** — Jab-cross-hook. Clean hands. (6 Bannon clips: BOXING, BOXING__1_ through __4_)
3. **Kickboxing** — Punches + kicks, range control. (Bannon: striker)
4. **Wrestling** — Grapples, throws, slams. (Bannon: technical/powerhouse/oldSchool)
5. **Martial Arts** — Fast technical, evasive. (Generic kung fu/karate base)
6. **Lucha** — High-flying, agile. (Bannon: lucha/highFlyer)

### Tier 2: New (wiring now)
7. **Capoeira** — Ginga flow, esquivas, acrobatic kicks. **16 clips in Bannon** (CAPOEIRA, CAPOEIRA__1_, variants). **24 GINGA clips, 24 ESQUIVA clips.** This is the most animation-ready new style.
8. **Drunken** — Unpredictable swaying, off-balance strikes. **24 DRUNK clips in Bannon** (DRUNK_IDLE_VARIATION, DRUNK_RUN_FORWARD + variants). Drunken Monkey/Master style.
9. **Muay Thai** — Elbows, knees, clinch, teeps. (Bannon: striker subset. Needs clinch anims.)
10. **MMA** — Takedowns, ground-and-pound, submissions. (Bannon: mma style. Needs ground anims.)
11. **Breakdance** — B-boy footwork as fighting. **6 clips in Bannon** (BREAKDANCE_FOOTWORK_3, FREEZES, UPROCK). Street culture style — very AshLane.

### Tier 3: Planned (need animations)
12. **Taekwondo** — Spinning kicks, fast footwork. (No clips yet — Mixamo has these)
13. **Judo** — Throws, trips, using opponent's momentum. (No clips yet)
14. **Jeet Kune Do** — Bruce Lee style. Intercepting, no wasted motion. (No clips yet)

---

## Animation Status

| Style | Clips Available | Source | Status |
|-------|----------------|--------|--------|
| Street | UAL base | Quaternius | ✅ Ready |
| Boxing | 6 clips | Bannon JSON | ✅ Ready |
| Kickboxing | UAL base | Quaternius | ✅ Ready |
| Wrestling | Bannon library | Bannon | ✅ Ready |
| Martial Arts | UAL base | Quaternius | ✅ Ready |
| Lucha | UAL base | Quaternius | ✅ Ready |
| Capoeira | 16 + 48 | Bannon JSON | ✅ Ready (most complete) |
| Drunken | 24 | Bannon JSON | ✅ Ready |
| Muay Thai | Partial | Bannon/UAl | 🟡 Needs clinch |
| MMA | Partial | Bannon | 🟡 Needs ground |
| Breakdance | 6 | Bannon JSON | ✅ Ready |
| Taekwondo | 0 | Mixamo | 🔴 Need to pull |
| Judo | 0 | Mixamo | 🔴 Need to pull |
| Jeet Kune Do | 0 | — | 🔴 Need to source |

---

## Priority Order

1. **Capoeira** — Most clips ready (64 total). Very visual, very street.
2. **Drunken** — 24 clips ready. Unique, fun, memorable.
3. **Breakdance** — 6 clips ready. Pure AshLane street culture.
4. **Muay Thai** — Elbows/knees from existing, clinch needed.
5. **MMA** — Takedowns from wrestling, ground game needed.
6. **Taekwondo/Judo/JKD** — Pull from Mixamo.

---

## Open Source to Pull

- **Mixamo** — Taekwondo kicks, Judo throws, Karate katas (free, Adobe account)
- **UAL** — Already have 86, check for style-specific clips
- **CMU Mocap** — Public domain, has martial arts
