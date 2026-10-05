#!/usr/bin/env python3
"""
Two-person move (grapple) sync system for AshLane.

A grapple = 2 separate animations played in sync:
  - {move}         → attacker animation
  - {move}__RECV   → victim/receiver animation

Naming convention (from Bannon):
    SUPLEX / SUPLEX__RECV
    CHOKESLAM / CHOKESLAM__RECV

Sync points ensure both characters hit key poses at the same time.

Usage:
    python3 sync.py --list-pairs /path/to/clips
    python3 sync.py --define suplex --contact 1.2 --impact 2.5 --release 4.0
"""
import argparse, os, json

# Sync point definitions for known two-person moves.
# Times are in seconds from clip start. Calibrate per-clip.
SYNC_POINTS = {
    "suplex": {
        "contact": 1.0,    # Attacker grabs victim
        "lift": 2.0,       # Victim leaves ground
        "impact": 3.5,     # Both hit ground
        "release": 5.0,    # Attacker lets go, victim stays down
        "dur": 6.0,
    },
    "chokeslam": {
        "contact": 0.8,
        "lift": 1.8,
        "impact": 3.0,
        "release": 4.5,
        "dur": 5.67,
    },
    "ddt": {
        "contact": 1.0,
        "impact": 2.8,
        "release": 4.0,
        "dur": 5.73,
    },
    "german": {
        "contact": 1.5,
        "lift": 3.0,
        "impact": 5.0,
        "release": 6.5,
        "dur": 7.83,
    },
    "takedown": {
        "contact": 1.2,
        "impact": 3.0,
        "release": 5.5,
        "dur": 7.23,
    },
    "backdrop": {
        "contact": 1.0,
        "lift": 2.5,
        "impact": 4.0,
        "release": 5.0,
        "dur": 6.1,
    },
    "brainbuster": {
        "contact": 0.8,
        "lift": 2.0,
        "impact": 3.0,
        "release": 3.5,
        "dur": 4.0,
    },
}

def find_pairs(clip_dir):
    """Find all attacker/receiver pairs in a directory."""
    files = [f for f in os.listdir(clip_dir) if f.endswith((".glb", ".json"))]
    pairs = []
    for f in files:
        base = f.rsplit(".", 1)[0]
        if "__RECV" in base:
            attacker = base.replace("__RECV", "") + "." + f.rsplit(".", 1)[1]
            if attacker in files:
                pairs.append((attacker, f))
    return sorted(pairs)

def define_sync(move, contact, impact, release, lift=None, dur=None):
    """Define or update sync points for a move."""
    SYNC_POINTS[move] = {
        "contact": contact,
        "impact": impact,
        "release": release,
    }
    if lift is not None:
        SYNC_POINTS[move]["lift"] = lift
    if dur is not None:
        SYNC_POINTS[move]["dur"] = dur
    return SYNC_POINTS[move]

def export_runtime_json(path="twoperson_sync.json"):
    """Export sync data for the game runtime."""
    with open(path, "w") as f:
        json.dump({"moves": SYNC_POINTS}, f, indent=2)
    print(f"Exported to {path}")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list-pairs", metavar="DIR",
                    help="Find attacker/receiver pairs in directory")
    ap.add_argument("--define", metavar="MOVE", help="Define sync for a move")
    ap.add_argument("--contact", type=float, default=1.0)
    ap.add_argument("--lift", type=float, default=None)
    ap.add_argument("--impact", type=float, default=2.5)
    ap.add_argument("--release", type=float, default=4.0)
    ap.add_argument("--dur", type=float, default=None)
    ap.add_argument("--export", action="store_true",
                    help="Export sync JSON for runtime")
    ap.add_argument("--show", metavar="MOVE", help="Show sync points for a move")
    args = ap.parse_args()

    if args.list_pairs:
        pairs = find_pairs(args.list_pairs)
        print(f"Found {len(pairs)} pairs:")
        for a, r in pairs:
            print(f"  {a} + {r}")
    elif args.define:
        sp = define_sync(args.define, args.contact, args.impact,
                         args.release, args.lift, args.dur)
        print(f"{args.define}: {json.dumps(sp, indent=2)}")
    elif args.show:
        print(json.dumps(SYNC_POINTS.get(args.show, {}), indent=2))
    elif args.export:
        export_runtime_json()
    else:
        print("Known moves:", ", ".join(sorted(SYNC_POINTS.keys())))
        ap.print_help()

if __name__ == "__main__":
    main()
