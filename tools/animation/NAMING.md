# AshLane Animation Naming Convention

All animation clips follow: `{style}_{move}_{variant}`

## Styles
| Prefix | Style | Source |
|--------|-------|--------|
| `street` | Street brawling | bank.json, generative |
| `box` | Boxing | bank.json (boxidle, boxing*) |
| `mma` | MMA | bank.json (takedown, etc.) |
| `capo` | Capoeira | bank.json (capoeira, ginga, au, esquiva) |
| `drunk` | Drunken Master | bank.json (drunkidle, drunkwalk) |
| `wrest` | Wrestling | bank.json (suplex, german, etc.) |
| `kickbox` | Kickboxing/Muay Thai | bank.json (knee, elbow) |
| `kungfu` | Kung Fu | UAL, open-source |
| `lucha` | Lucha Libre | Bannon (flying_headbutt, etc.) |
| `feral` | Feral/brawler | bank.json (feral) |
| `tiger` | Tiger style | bank.json (tiger) |

## Move Types
| Suffix | Category | Examples |
|--------|----------|----------|
| (none) | Strike/attack | `box_jab_01`, `capo_kick_spin_01` |
| `_idle` | Idle stance | `drunk_idle_01`, `box_idle_01` |
| `_walk` | Walk cycle | `drunk_walk_01`, `street_walk_01` |
| `_run` | Run cycle | `street_run_01` |
| `_hit` | Hit reaction | `street_hit_head_01`, `street_hit_body_01` |
| `_ko` | Knockdown | `street_ko_flat_01`, `street_ko_spin_01` |
| `_getup` | Get-up | `street_getup_kip_01`, `street_getup_roll_01` |
| `_jump` | Jump | `street_jump_01`, `street_jump_cross_01` |
| `_block` | Block/guard | `street_block_high_01`, `street_block_low_01` |
| `_taunt` | Taunt | `street_taunt_01` |
| `_dodge` | Dodge/evade | `street_dodge_01`, `capo_esquiva_01` |

## Two-Person Moves
Grapples use paired clips:
- `{style}_{move}` → attacker (e.g., `wrest_suplex_01`)
- `{style}_{move}__RECV` → victim (e.g., `wrest_suplex_01__RECV`)

Both play in sync using timing data from `twoperson_sync.json`.

## Migration Map (bank.json → new convention)
| Old name | New name |
|----------|----------|
| boxing, boxing1-3 | box_combo_01-04 |
| jabcross | box_jabcross_01 |
| boxidle | box_idle_01 |
| capoeira | capo_combo_01 |
| ginga, gingaback, gingaside | capo_ginga_01, capo_ginga_back_01, capo_ginga_side_01 |
| au | capo_au_01 |
| esquiva | capo_esquiva_01 |
| drunkidle, drunkwalk | drunk_idle_01, drunk_walk_01 |
| suplex, german, brainbuster | wrest_suplex_01, wrest_german_01, wrest_brainbuster_01 |
| chokeslam, ddt, backdrop, takedown | wrest_chokeslam_01, wrest_ddt_01, wrest_backdrop_01, mma_takedown_01 |
| hit, hitback, hitbody, hithead, hitside | street_hit_01, street_hit_back_01, street_hit_body_01, street_hit_head_01, street_hit_side_01 |
| fallflat, flat | street_ko_flat_01, street_ko_flat_02 |
| kip, rise | street_getup_kip_01, street_getup_basic_01 |
| bigjump, crossjump | street_jump_01, street_jump_cross_01 |
| block, guardhigh, guardlow | street_block_01, street_block_high_01, street_block_low_01 |
| elbow, knee | kickbox_elbow_01, kickbox_knee_01 |
| bodyblow, rib | box_bodyblow_01, box_rib_01 |
| combo, slugger | street_combo_01, street_slugger_01 |
| dropkick | street_dropkick_01 |
| corkscrew | lucha_corkscrew_01 |
| hurricane | lucha_hurricane_01 |
| tiger | tiger_stance_01 |
| feral | feral_stance_01 |
| defender | street_guard_01 |
| evade | street_dodge_01 |
| crouch, stancecrouch | street_crouch_01, street_crouch_02 |
