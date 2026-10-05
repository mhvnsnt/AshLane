#!/usr/bin/env python3
"""
Skeleton retargeter: 58-joint Mixamo ↔ 65-joint Quaternius.
Maps bone names between the two rigs so animations transfer cleanly.

Usage:
    python3 retarget.py --list-bones input.glb
    python3 retarget.py --from mixamo --to quaternius input.glb output.glb
"""
import json, argparse, sys

# Mixamo 58-joint → Quaternius 65-joint bone name map.
# Quaternius uses Unreal-style names; Mixamo uses its own convention.
# This is the canonical map — extend as needed.
MIXAMO_TO_QUATERNIUS = {
    "Hips": "pelvis",
    "Spine": "spine_01",
    "Spine1": "spine_02",
    "Spine2": "spine_03",
    "Neck": "neck_01",
    "Head": "head",
    "HeadTop_End": None,  # no equivalent — drop
    "LeftShoulder": "clavicle_l",
    "LeftArm": "upperarm_l",
    "LeftForeArm": "lowerarm_l",
    "LeftHand": "hand_l",
    "LeftHandThumb1": "thumb_01_l",
    "LeftHandThumb2": "thumb_02_l",
    "LeftHandThumb3": "thumb_03_l",
    "LeftHandIndex1": "index_01_l",
    "LeftHandIndex2": "index_02_l",
    "LeftHandIndex3": "index_03_l",
    "LeftHandMiddle1": "middle_01_l",
    "LeftHandMiddle2": "middle_02_l",
    "LeftHandMiddle3": "middle_03_l",
    "LeftHandRing1": "ring_01_l",
    "LeftHandRing2": "ring_02_l",
    "LeftHandRing3": "ring_03_l",
    "LeftHandPinky1": "pinky_01_l",
    "LeftHandPinky2": "pinky_02_l",
    "LeftHandPinky3": "pinky_03_l",
    "RightShoulder": "clavicle_r",
    "RightArm": "upperarm_r",
    "RightForeArm": "lowerarm_r",
    "RightHand": "hand_r",
    "RightHandThumb1": "thumb_01_r",
    "RightHandThumb2": "thumb_02_r",
    "RightHandThumb3": "thumb_03_r",
    "RightHandIndex1": "index_01_r",
    "RightHandIndex2": "index_02_r",
    "RightHandIndex3": "index_03_r",
    "RightHandMiddle1": "middle_01_r",
    "RightHandMiddle2": "middle_02_r",
    "RightHandMiddle3": "middle_03_r",
    "RightHandRing1": "ring_01_r",
    "RightHandRing2": "ring_02_r",
    "RightHandRing3": "ring_03_r",
    "RightHandPinky1": "pinky_01_r",
    "RightHandPinky2": "pinky_02_r",
    "RightHandPinky3": "pinky_03_r",
    "LeftUpLeg": "thigh_l",
    "LeftLeg": "calf_l",
    "LeftFoot": "foot_l",
    "LeftToeBase": "ball_l",
    "LeftToe_End": None,  # drop
    "RightUpLeg": "thigh_r",
    "RightLeg": "calf_r",
    "RightFoot": "foot_r",
    "RightToeBase": "ball_r",
    "RightToe_End": None,  # drop
}

# Reverse map (auto-generated)
QUATERNIUS_TO_MIXAMO = {v: k for k, v in MIXAMO_TO_QUATERNIUS.items() if v}

# Quaternius-only bones with no Mixamo equivalent (keep as-is or use defaults)
QUATERNIUS_EXTRA = [
    "ik_foot_root", "ik_foot_l", "ik_foot_r",
    "ik_hand_root", "ik_hand_l", "ik_hand_r",
    "root",
]

def get_map(from_rig, to_rig):
    if from_rig == "mixamo" and to_rig == "quaternius":
        return MIXAMO_TO_QUATERNIUS
    elif from_rig == "quaternius" and to_rig == "mixamo":
        return QUATERNIUS_TO_MIXAMO
    else:
        raise ValueError(f"Unknown rig pair: {from_rig} → {to_rig}")

def list_bones(glb_path):
    """List bone/joint names in a GLB using pygltflib if available."""
    try:
        from pygltflib import GLTF2
        g = GLTF2().load(glb_path)
        names = []
        for node in g.nodes:
            if node.name:
                names.append(node.name)
        return sorted(set(names))
    except ImportError:
        print("pygltflib not installed: pip install pygltflib", file=sys.stderr)
        return []

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", nargs="?", help="Input GLB")
    ap.add_argument("output", nargs="?", help="Output GLB")
    ap.add_argument("--from", dest="from_rig", default="mixamo",
                    choices=["mixamo", "quaternius"])
    ap.add_argument("--to", dest="to_rig", default="quaternius",
                    choices=["mixamo", "quaternius"])
    ap.add_argument("--list-bones", action="store_true")
    ap.add_argument("--dump-map", action="store_true",
                    help="Print the bone map as JSON")
    args = ap.parse_args()

    if args.dump_map:
        print(json.dumps(get_map(args.from_rig, args.to_rig), indent=2))
        return

    if args.list_bones and args.input:
        for b in list_bones(args.input):
            print(b)
        return

    if args.input and args.output:
        print(f"Retarget {args.from_rig} → {args.to_rig}: {args.input} → {args.output}")
        print("NOTE: Full GLB node renaming requires Blender. Use --dump-map")
        print("      with the Blender retarget script for production use.")
        bone_map = get_map(args.from_rig, args.to_rig)
        mapped = sum(1 for v in bone_map.values() if v)
        dropped = sum(1 for v in bone_map.values() if not v)
        print(f"Map covers {mapped} bones, drops {dropped} end joints")
        return

    ap.print_help()

if __name__ == "__main__":
    main()
