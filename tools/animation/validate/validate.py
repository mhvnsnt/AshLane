#!/usr/bin/env python3
"""
Animation validator for AshLane pipeline.
Checks bone coverage, flags missing bones, validates clip metadata.

Usage:
    python3 validate.py clip.glb --rig quaternius
    python3 validate.py --batch /path/to/glbs --rig mixamo
"""
import argparse, os, sys, json

# Minimum required bones for a usable fighting animation
REQUIRED_BONES = {
    "mixamo": ["Hips", "Spine", "Spine1", "Neck", "Head",
               "LeftArm", "RightArm", "LeftForeArm", "RightForeArm",
               "LeftUpLeg", "RightUpLeg", "LeftLeg", "RightLeg"],
    "quaternius": ["pelvis", "spine_01", "spine_02", "neck_01", "head",
                   "upperarm_l", "upperarm_r", "lowerarm_l", "lowerarm_r",
                   "thigh_l", "thigh_r", "calf_l", "calf_r"],
}

def get_bones(glb_path):
    try:
        from pygltflib import GLTF2
        g = GLTF2().load(glb_path)
        return sorted(set(n.name for n in g.nodes if n.name))
    except ImportError:
        print("pygltflib required: pip install pygltflib", file=sys.stderr)
        sys.exit(1)

def validate_one(glb_path, rig):
    bones = get_bones(glb_path)
    required = REQUIRED_BONES.get(rig, [])
    missing = [b for b in required if b not in bones]
    # Check for animation data
    has_anim = False
    try:
        from pygltflib import GLTF2
        g = GLTF2().load(glb_path)
        has_anim = len(g.animations) > 0
        anim_count = len(g.animations)
    except Exception:
        anim_count = 0

    result = {
        "file": os.path.basename(glb_path),
        "rig": rig,
        "bone_count": len(bones),
        "missing_required": missing,
        "has_animation": has_anim,
        "anim_count": anim_count,
        "valid": len(missing) == 0 and has_anim,
    }
    return result

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", help="GLB file or directory")
    ap.add_argument("--rig", default="quaternius", choices=["mixamo", "quaternius"])
    ap.add_argument("--batch", action="store_true")
    ap.add_argument("--json", action="store_true", help="JSON output")
    args = ap.parse_args()

    results = []
    if args.batch or os.path.isdir(args.input):
        for fn in sorted(os.listdir(args.input)):
            if fn.lower().endswith(".glb"):
                results.append(validate_one(os.path.join(args.input, fn), args.rig))
    else:
        results.append(validate_one(args.input, args.rig))

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        ok = sum(1 for r in results if r["valid"])
        for r in results:
            status = "✓" if r["valid"] else "✗"
            print(f"{status} {r['file']}: {r['bone_count']} bones, "
                  f"{r['anim_count']} anims", end="")
            if r["missing_required"]:
                print(f" MISSING: {','.join(r['missing_required'])}", end="")
            print()
        print(f"\n{ok}/{len(results)} valid")

if __name__ == "__main__":
    main()
