# GUN_SYSTEM.md — Yakuza-Style Rare Guns

> Design law: guns are **POWERFUL but SCARCE**. The game stays melee-focused.
> Finding a gun should feel exciting, like Yakuza — then it's gone.

## Overview

AshLane is a melee brawler. Guns exist as a rare spice, not a core loop.
They enter the game through one scripted moment — Finn "The Priest" Mac's
debut mission — and after that, they show up rarely: enemy drops, rare loot
spawns, expensive black-market purchases.

**Implementation:** `src/game3d/guns.ts`
**SFX:** `src/game3d/combat-sfx.ts` (`sfxGunshot`, `sfxReload`, `sfxDryFire`, `sfxDisarm`, `sfxPistolWhip`, `sfxGunPickup`)
**Source stats:** Ported from Urban Mayhem's `weapon_director.gd` (pistol/SMG/shotgun/rifle),
which were SKIPPED in the original melee-only port. Owner approved rare guns 2026-10-05.

## Gun Types

| Gun | Dmg | Range | Mag | Rate | Notes |
|-----|-----|-------|-----|------|-------|
| 9mm Pistol | 22 | 40m | 12 | 0.22s | Most common. Finn's gun. |
| .44 Revolver | 38 | 35m | 6 | 0.55s | Six shots, each one counts. |
| Pump Shotgun | 9×8 pellets | 18m | 6 | 0.9s | 72 dmg point-blank, useless at range. |
| Machine Pistol | 13 | 45m | 30 | 0.09s | Ammo hose. Eats money. |

All damage tuned against ~100 base HP. A pistol drops a grunt in 5 hits.
A shotgun at point-blank range drops almost anyone — once.

## First Encounter: Finn Mac

**Mission:** `authority_finn_debut`

Finn "The Priest" Mac carries a pistol in his gun belt (canon — see `lieutenants.ts`).
Mid-fight, he draws it. This is the player's first time seeing a gun.

**The unlock:** Disarm him (heavy attack, counter, or attack from behind while
he's aiming). The pistol clatters to the ground. Pick it up.

`unlockGuns(state)` fires → `gunsUnlocked = true` → guns are in the game from
that point forward.

Finn's dialogue sells the moment — the priest-with-a-gun contradiction:
> "This is my instrument. Let us see if you are worthy of absolution."

## Mechanics

### Disarm
`tryDisarm(target, disarmChance)` — knock the gun from someone's hand.
- **Chance sources:** counter (high), heavy attack (medium), attack from behind (medium), normal hit (low/zero).
- **Result:** gun drops as a world pickup with its remaining magazine ammo. **Anyone** can pick it up — including other enemies.
- Disarming is the primary way guns change hands. It's also the counter-play: an armed enemy is scary until you take their gun.

### Pickup
`pickupGun(state, gun, magAmmo)` — replaces your current gun (old one drops).
Brief 0.3s draw time. Dropped guns keep their magazine ammo — a half-empty
pistol is still worth grabbing.

### Ammo Economy (The Money Sink)
- **Ammo is expensive.** Pistol rounds: $25 each. Revolver: $60. Shotgun shells: $90.
- **Bulk discount:** 10% off per 12 rounds, max 30%. Still expensive.
- **Guns are expensive.** Pistol: $800. SMG: $4,500.
- **Found guns** come with 1 magazine (sometimes 2). Never a full reserve.
- **Run dry** → pistol-whip (14 dmg melee) or drop it and go back to fists.

The economy is designed so that sustained gun use **bankrupts you**. Guns are
for emergencies, boss fights, and showing off — not for clearing streets.

### Pistol-Whip
Empty gun? It's still a hunk of metal. `pistolWhipDamage()` = 14 — better than
fists, worse than a bat. Melee attack with the gun equipped and 0 ammo.

### World Spawns
`rollGunSpawn()` — **2% base chance** per loot roll. Weighted by rarity:
pistol (100) → revolver (45) → shotgun (25) → SMG (10). High-attention
districts slightly increase the chance (more heat = more guns around).

## Attention Integration

Gunfire is the **loudest** thing you can do. Firing a gun in public:
- **+25 attention** (outdoor) / **+15** (indoor/underground)
- Compare: starting a public brawl is +14. A gunshot nearly doubles that.

The Dynasty Authority **will** come looking. Use guns wisely.

## Balance Philosophy

1. **Scarcity > power.** Guns feel amazing because they're rare, not because they're balanced.
2. **Ammo is the real weapon.** The gun is free; feeding it costs a fortune.
3. **Disarm is the counter.** Every gunfight is also a disarm opportunity.
4. **Enforcement.** The attention system makes gunfire a strategic choice, not a default.
5. **Melee stays king.** 95% of combat is fists, feet, and found objects. Guns are the 5% that makes stories.

## Models

No CC0 gun models were found in the Quaternius packs (medieval/fantasy weapons only).
Gun models needed (pistol, revolver, shotgun, SMG) — low-poly, CC0/MIT licensed.
Until sourced, use simple procedural box-built placeholders attached to the hand bone.

## Future Work

- [ ] Source CC0 gun GLB models
- [ ] Muzzle flash + tracer VFX in view.ts
- [ ] Enemy AI: armed enemies take cover, aim, and reload (currently: they just shoot)
- [ ] Gun shop UI (black market vendor)
- [ ] Finn Mac rematch: he brings a shotgun
