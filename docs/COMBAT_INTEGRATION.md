# Combat Integration Design — Open-Source Pulls into AshLane
**Date:** 2026-10-05
**Status:** DESIGN ONLY — owner reviews before any code is wired in.

## Sources (all license-verified)

| # | Source | URL | License | What we're pulling |
|---|--------|-----|---------|-------------------|
| 1 | souls-like-controller | https://github.com/prashanna135/souls-like-controller | Public domain ("Do whatever you want") | Lock-on targeting, buffered combos, hit reactions, enemy strafe AI |
| 2 | Batman-Arkham-Combat (Mix and Jam) | https://github.com/mixandjam/Batman-Arkham-Combat | MIT | Freeflow targeting, counter system, group AI loop, final-blow slow-mo |
| 3 | deathblood-lazer | https://github.com/paulcodes/deathblood-lazer | MIT (code only; art/audio All Rights Reserved — NOT pulling those) | Max-3-attacker token system, input buffer, per-entity hitstop, hitbox/hurtbox components |

Local copies for reference: `~/workspace/os-pull/` (souls-like-controller, deathblood-lazer, batman-arkham-combat/*.cs)

---

## Part 1: What AshLane Already Has (sim.ts baseline)

AshLane's `src/game3d/sim.ts` already implements several of these concepts in its own way:

| Concept | AshLane today | Source equivalent |
|---------|--------------|-------------------|
| Combo queue | `Body.queued` + `comboWindow` (lines 38-39, 1460-1472) | Deathblood `_buffered_input` + `INPUT_BUFFER_TIME` |
| Input buffers | `bufAtk`, `bufGrab`, `bufBlast`, `bufJump` + `prev*` edge detection | Deathblood 150ms buffer window |
| Hitstop | `sim.hitstop` global timer (lines 1099, 1756, 2851) | Deathblood per-entity `HitStop.freeze()` |
| Hit reactions | `stun`, `poise`, `iframe`, hitstun multiplier on damaged head (line 1172) | Souls-like `player_reaction.gd` hurt → knockdown → getup chain |
| Body regions | `head`, `chest`, `legs` per-body damage (line 1172 uses `b.head < 35`) | — (AshLane is ahead here) |
| Lock-on (partial) | `sim.lockArm` timer (lines 2729, 2801, 2814) — arming/disarming only | Souls-like full lock-on with target cycling |

**Gaps (what AshLane does NOT have):**
1. No persistent lock-on target — no "soft lock" camera, no target cycling, no reticle.
2. No freeflow targeting — attacks don't auto-select the best enemy in the attack direction.
3. No counter system — no "enemy winding up → press counter → auto-dodge + punish."
4. No group attack coordination — nothing stops 8 grunts from all attacking the same frame.
5. Hitstop is global, not per-entity — freezing everything kills game feel on multi-hit.
6. Enemy AI has no strafe/retreat/reposition behavior — they either attack or stand.

---

## Part 2: System-by-System Port Plan

### 2.1 Lock-On Targeting (from souls-like-controller)

**Source logic** (`scripts/player/player_lock_on.gd`):
- One press: lock nearest enemy within `max_range` (15 units).
- Repeat press while locked: cycle to next candidate (sorted by distance).
- Cycle past the last → unlock.
- Auto-clear when target dies or is freed.
- Camera and reticle track the locked target.

**AshLane mapping:**
- Add to `Body` (player only): `lockTarget: number` (body id, -1 = none), `lockCands: number[]`, `lockIdx: number`.
- Add to `Sim`: `lockRange` (default 15, from souls-like `max_range`).
- Input: new `bufLock` buffer alongside existing `bufAtk`/`bufGrab` (touch button or key).
- `handleLock(sim)`: mirrors `_try_lock_on` / `_cycle_or_unlock` / `clear` exactly.
- Camera: `mount.ts`/`view.ts` — when `lockTarget >= 0`, bias `camYaw` toward the target each frame (soft lock, not hard snap — keep AshLane's free camera feel).
- HUD: reticle marker over locked body (reuse existing banner/sfx pipeline).
- Auto-clear: in the body-removal path where `alive` flips false, clear any `lockTarget` pointing at it.

**What NOT to port:** the Godot `AnimationTree` one-shot plumbing, the `cam_script` node references — AshLane's camera is custom.

### 2.2 Combo Input Buffering (from deathblood-lazer)

**Source logic** (`scripts/player/player.gd`):
- `INPUT_BUFFER_TIME = 0.15` (150ms window).
- Pressing attack during an attack animation stores `_buffered_input` + starts `_buffer_timer`.
- Timer counts down in `_physics_process`; expiry clears the buffer.
- On attack finish (`_on_attack_finished`): if buffer holds an input AND `_combo_timer > 0`, chain to the next combo state; otherwise end the chain.
- Dodge can cancel at ANY point during a ground attack (dodge-cancel).

**AshLane mapping:**
- AshLane already has `queued`/`comboWindow`/`bufAtk`. The port is a **tuning + rule change**, not new plumbing:
  - Set the buffer window to 150ms to match deathblood's proven feel (`comboWindow` duration audit).
  - Add the **dodge-cancel rule**: allow dash/dodge input to interrupt `atk` state at any point (currently gated — check lines 1424-1472).
  - Add the **chain-on-finish rule**: on attack animation end, if `queued` is set, advance `p.link` to the next combo stage instead of returning to free — this is already partially there (line 1460); verify the finish path honors it.
- No new fields needed. This is the cheapest port — mostly verification + tuning.

### 2.3 Hit Reactions (from souls-like-controller)

**Source logic** (`scripts/player/player_reaction.gd`):
- `take_damage(amount, source_position)`:
  - Ignores damage while already in a reaction (no stun-lock chaining), while climbing, or while dead.
  - Getting hit **interrupts** heals/door-opening (no free heals under pressure).
  - Face the hit source; compute knockback direction away from source.
  - Light hit → `hurt` (stagger, small push). Heavy hit (≥ threshold) → `knockback` (launch + lift) → `knocked_down` → `getting_up`.
  - Getting hit aborts your own attack (`weapon.abort_attack()`), cancels roll/jumpback.
- Reaction states are animation-driven with entry-confirmation gates (don't end the state before the animation actually started).

**AshLane mapping:**
- AshLane has `stun`, `hit`, `launch`, `down` phases already. The port adds **rules**:
  1. **No stun-lock:** while `state` is `hit`/`launch`/`down`, ignore new hit-stun (damage still applies). Prevents infinite juggle-lock.
  2. **Hit interrupts actions:** when a body takes a hit, cancel its `queued` attack and clear `comboWindow` (mirrors `abort_attack`).
  3. **Face-the-source:** on hit, set `yaw` toward the attacker (AshLane bodies have `yaw`).
  4. **Two-tier reactions:** light hit → `hit` phase (stagger); heavy hit (damage ≥ threshold, tune from `tune`) → `launch` phase with upward `vy` (AshLane already has `vy` and `launch`).
  5. **Interruptible recovery:** getting hit during `down`→wake (`wake` timer) extends `down` instead of stacking — matches "getting hit mid-recovery should interrupt."
- New constant: `HEAVY_HIT_THRESHOLD` in tune/spec (start at 25, matching deathblood's 3rd-hit 25 damage as the knockdown tier).

### 2.4 Per-Entity Hitstop (from deathblood-lazer)

**Source logic** (`scripts/combat/hitstop.gd`):
- `HitStop.freeze(duration, entities)` — freezes ONLY the attacker + victim, not the world.
- Freeze = `process_mode = DISABLED`; restore after timer; 0.5s safety timeout prevents permanent freezes.
- Extending an active freeze just re-runs it.

**AshLane mapping:**
- AshLane's `sim.hitstop` is **global** — everything freezes, which feels dead in multi-enemy fights.
- Port: add `Body.stopT: number` (per-body freeze timer). In the tick loop, bodies with `stopT > 0` decrement it and skip their update (but the world, particles, camera keep running).
- On hit: set `stopT` on attacker + victim (0.04s light, 0.06s heavy — matching AshLane's current global values at lines 1099/1756) instead of (or in addition to) `sim.hitstop`.
- Keep `sim.hitstop` for dramatic moments (final blow, counters) — global freeze becomes the exception, per-entity the rule.
- Safety: clamp `stopT` to ≤ 0.5s.

### 2.5 Freeflow Targeting (from Batman-Arkham-Combat)

**Source logic** (`Assets/Scripts/CombatScript.cs`):
- `AttackCheck()`: if the player is steering (input magnitude > 0.2), pick the enemy in the **steer direction** via `EnemyDetection.CurrentTarget()`; otherwise keep the locked target or pick a random enemy.
- `Attack(target, distance)`: if within range (15), auto-move to the target (`MoveTorwardsTarget` — tween to 0.95 units, auto-face via `DOLookAt`), play a varied attack animation (cycles through 4, random on final hit).
- Whiff: if no target or out of range, play a ground punch that hits nothing.
- Camera impulse scales with distance (`impulseSource.m_AmplitudeGain = max(3, distance)`).

**AshLane mapping:**
- This is the **single biggest feel upgrade** for crowd brawls.
- Add `freeflowTarget(sim, p): Body | null`:
  1. If player is steering (stick magnitude > 0.2, reuse `stickRoute`), find the nearest alive grunt within 15 units **in the steer direction** (angle check: dot(steerDir, toEnemy) > 0.5).
  2. Else if `lockTarget >= 0`, use it.
  3. Else nearest alive grunt within 15.
- On attack start: set `p.yaw` toward the target and add a small lunge (`vx`/`vz` toward target, capped) — AshLane's physics-based equivalent of the DOTween move. No teleport; the lunge must respect `cd` and not cross walls (check `boxes`).
- Attack animation variety: cycle `p.swing` through variants (AshLane has `swing` 4/5 already — extend the set).
- Whiff rule: if no target in range, the swing still plays (commits the player) but hits nothing — matches Arkham and prevents "vacuum punch" criticism.

### 2.6 Counter System (from Batman-Arkham-Combat)

**Source logic** (`CombatScript.CounterCheck` + `EnemyManager.AnEnemyIsPreparingAttack`):
- Enemies broadcast `IsPreparingAttack()` during their windup.
- Player presses counter: if any enemy is preparing, find the **closest** one, auto-dodge toward it (`Dodge` trigger + move), then immediately attack it.
- Can't counter while already attacking or countering.

**AshLane mapping:**
- Add to `Body` (grunts): `windup: number` — set > 0 during the telegraphed pre-attack frames. (AshLane has `windup` phase already — expose its timer on the body.)
- New input: `bufCounter` (or reuse `bufBlast` if that's the designated counter button — check `mount.ts` bindings first).
- `tryCounter(sim, p)`: if any alive grunt has `windup > 0` and `p.state` is `free`:
  1. Target = closest winding-up grunt.
  2. `p.state = "dash"`, dash toward the target (i-frames during dash — AshLane has `iframe`).
  3. On dash end adjacent to target: auto-start `atk` against it (set `queued = true`).
- HUD: flash a prompt when a counter is available (reuse `banner` pipeline — e.g. banner "Counter!" for 0.5s).
- This is the "Urban Reign deflection" equivalent and the #1 requested defensive mechanic.

### 2.7 Group Attack Coordination (from deathblood-lazer + Batman-Arkham)

**Source logic:**
- Deathblood (`enemy_group_manager.gd`): token bucket. `request_attack()` grants iff active attackers < `MAX_ATTACKERS` (3). `release_attack()` on leaving ATTACK state. Prunes freed enemies.
- Arkham (`EnemyManager.AI_Loop`): coroutine picks ONE random available enemy every 0.5–1.5s, waits until it's not retreating/locked/stunned, orders it to attack, then orders retreat. Everyone else circles.

**AshLane mapping:**
- Add to `Sim`: `attackTokens: number` (max 3, matching deathblood's `MAX_ATTACKERS`).
- Grunt AI attack entry: before transitioning to `windup`/`atk`, check `sim.attackTokens > 0`; if so, decrement and store `e.tokenHeld = true`. On leaving `atk` (hit, down, or finish), increment and clear.
- Non-token grunts: strafe/retreat behavior (from souls-like `enemy_ai.gd` — see 2.8) instead of standing still.
- Arkham's `enemyAvailability` maps to: a grunt targeted by the player's freeflow lock is "unavailable" for the token pool (prevents the game attacking you with the guy you're already punching — actually invert: the locked target is the one the TOKEN should prefer, so the fight stays 1v1-ish while others circle).
- Tune: `MAX_ATTACKERS = 3` for normal, 2 for early missions, 4 for boss-rush chaos.

### 2.8 Enemy Strafe / Reposition AI (from souls-like-controller)

**Source logic** (`scripts/enemy/enemy_ai.gd`):
- Combat states: IDLE → CHASE → COMBAT → ATTACK.
- In COMBAT (in range, no token): pick a timed action — STRAFE_LEFT / STRAFE_RIGHT / RETREAT — on a random decision interval.
- Never stand still while cooling down: "always reposition so the fight keeps moving."
- Weighted random: attack chance vs strafe chance vs retreat.

**AshLane mapping:**
- Grunt brain currently: chase → attack. Add the middle layer:
  - `COMBAT` state (new `Phase` or reuse via `e.route`): if within 2.5 units of player and no attack token, pick strafe/retreat for `decisionT` seconds.
  - Strafe = perpendicular velocity; retreat = away velocity; both keep `yaw` facing the player.
  - Decision interval: random 0.8–1.6s (from souls-like `decision_interval_min/max`).
- This kills the "conga line of guys walking into your fists" problem.

---

## Part 3: Port Order (recommended)

| Order | System | Risk | Why this order |
|-------|--------|------|----------------|
| 1 | Group attack tokens (2.7) | Low | Biggest fairness win; isolated to grunt AI entry/exit |
| 2 | Strafe/reposition AI (2.8) | Low | Pairs with 1; same code area |
| 3 | Combo buffer tuning (2.2) | Low | Verification + constants, no new fields |
| 4 | Hit reaction rules (2.3) | Medium | Touches damage path; needs playtesting |
| 5 | Per-entity hitstop (2.4) | Medium | Changes freeze semantics; keep global as fallback |
| 6 | Lock-on targeting (2.1) | Medium | New input + camera + HUD; needs `mount.ts`/`view.ts` work |
| 7 | Freeflow targeting (2.5) | Medium | Builds on 6; changes attack feel significantly |
| 8 | Counter system (2.6) | Higher | New input, new HUD prompt, new dash-cancel interaction |

## Part 4: License Compliance Notes

- **souls-like-controller**: public domain per author ("Do whatever you want with it. Credit's nice but not required."). Credit in `docs/` anyway.
- **Batman-Arkham-Combat**: MIT. Include MIT attribution in `docs/OPEN_SOURCE_CREDITS.md` (to be created at port time).
- **deathblood-lazer**: MIT covers **code only**. Art and audio are All Rights Reserved — we are pulling zero art/audio, logic only. Note this in the credits file.
- None of these ports copy assets, animations, or visual design — only mechanics and algorithms, which is the correct "parallel, not copy" approach per the owner's direction.

## Part 5: Open Questions for Owner

1. **Counter button**: dedicate a new touch button, or map counter to an existing button (double-tap dash? `bufBlast`)? Needs a feel decision.
2. **Lock-on camera**: soft bias (recommended) vs hard lock? Hard lock fights AshLane's arena-brawler camera.
3. **Max attackers**: 3 default? Should early missions use 2?
4. Per-entity hitstop: fully replace global `sim.hitstop`, or keep global for finishers?

---
*No integration code written — design only, per owner request. Next step: owner approves, then port in the order above.*
