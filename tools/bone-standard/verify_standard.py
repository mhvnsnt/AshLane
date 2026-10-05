#!/usr/bin/env python3
"""
Verify all AshLane models match the 52-bone Mixamo colon standard.
Run from repo root: python3 tools/bone-standard/verify_standard.py
"""
import os, struct, json, sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

STANDARD_52 = [
    'mixamorig:Hips', 'mixamorig:Spine', 'mixamorig:Spine1', 'mixamorig:Spine2',
    'mixamorig:Neck', 'mixamorig:Head',
    'mixamorig:RightShoulder', 'mixamorig:RightArm', 'mixamorig:RightForeArm', 'mixamorig:RightHand',
    'mixamorig:LeftShoulder', 'mixamorig:LeftArm', 'mixamorig:LeftForeArm', 'mixamorig:LeftHand',
    'mixamorig:RightUpLeg', 'mixamorig:RightLeg', 'mixamorig:RightFoot', 'mixamorig:RightToeBase',
    'mixamorig:LeftUpLeg', 'mixamorig:LeftLeg', 'mixamorig:LeftFoot', 'mixamorig:LeftToeBase',
    'mixamorig:LeftHandThumb1', 'mixamorig:LeftHandThumb2', 'mixamorig:LeftHandThumb3',
    'mixamorig:LeftHandIndex1', 'mixamorig:LeftHandIndex2', 'mixamorig:LeftHandIndex3',
    'mixamorig:LeftHandMiddle1', 'mixamorig:LeftHandMiddle2', 'mixamorig:LeftHandMiddle3',
    'mixamorig:LeftHandRing1', 'mixamorig:LeftHandRing2', 'mixamorig:LeftHandRing3',
    'mixamorig:LeftHandPinky1', 'mixamorig:LeftHandPinky2', 'mixamorig:LeftHandPinky3',
    'mixamorig:RightHandThumb1', 'mixamorig:RightHandThumb2', 'mixamorig:RightHandThumb3',
    'mixamorig:RightHandIndex1', 'mixamorig:RightHandIndex2', 'mixamorig:RightHandIndex3',
    'mixamorig:RightHandMiddle1', 'mixamorig:RightHandMiddle2', 'mixamorig:RightHandMiddle3',
    'mixamorig:RightHandRing1', 'mixamorig:RightHandRing2', 'mixamorig:RightHandRing3',
    'mixamorig:RightHandPinky1', 'mixamorig:RightHandPinky2', 'mixamorig:RightHandPinky3',
]

def get_bones(path):
    with open(path, 'rb') as f:
        assert f.read(4) == b'glTF'
        f.read(8)
        json_len = struct.unpack('<I', f.read(4))[0]
        f.read(4)
        js = json.loads(f.read(json_len).rstrip(b'\x00 '))
    if not js.get('skins'):
        return None
    nodes = js['nodes']
    return [nodes[j].get('name', '') for j in js['skins'][0]['joints']]

def main():
    print("=" * 70)
    print("AshLane Bone Standard Verification")
    print("=" * 70)
    
    # Collect all model files
    model_files = []
    for root, dirs, files in os.walk(os.path.join(REPO_ROOT, 'public/models')):
        for f in sorted(files):
            if f.endswith('.glb'):
                model_files.append(os.path.join(root, f))
    for root, dirs, files in os.walk(os.path.join(REPO_ROOT, 'assets')):
        for f in sorted(files):
            if f.endswith('.glb'):
                model_files.append(os.path.join(root, f))
    
    perfect = []      # Exactly 52 bones, exact match
    superset = []     # Contains all 52 + extras (cast models with UNUSED)
    issues = []
    
    for fp in sorted(model_files):
        rel = os.path.relpath(fp, REPO_ROOT)
        try:
            bones = get_bones(fp)
        except Exception as e:
            issues.append((rel, f"read error: {e}"))
            continue
        if bones is None:
            continue  # No skin, skip
        
        if bones == STANDARD_52:
            perfect.append(rel)
        elif all(b in bones for b in STANDARD_52):
            extras = [b for b in bones if b not in STANDARD_52]
            superset.append((rel, len(bones), extras))
        else:
            missing = [b for b in STANDARD_52 if b not in bones]
            extra = [b for b in bones if b not in STANDARD_52]
            issues.append((rel, f"{len(bones)} bones, missing {len(missing)}, extra {len(extra)}"))
    
    print(f"\n✅ PERFECT (52/52 exact match): {len(perfect)}")
    for f in perfect:
        print(f"   {f}")
    
    print(f"\n⚠️  SUPERSET (52 standard + extras): {len(superset)}")
    for f, count, extras in superset:
        print(f"   {f}: {count} bones, extras: {extras}")
    
    print(f"\n❌ ISSUES: {len(issues)}")
    for f, msg in issues:
        print(f"   {f}: {msg}")
    
    print("\n" + "=" * 70)
    total_ok = len(perfect) + len(superset)
    print(f"Total: {total_ok} models have all 52 standard bones, {len(issues)} with issues")
    
    # Animation test: verify UAL files have Mixamo-named channels
    print("\n" + "=" * 70)
    print("Animation compatibility check:")
    ual_paths = [
        'assets/characters/quaternius/UAL1_Standard.glb',
        'public/motion/ual/UAL1_Standard.glb',
    ]
    for up in ual_paths:
        fp = os.path.join(REPO_ROOT, up)
        if os.path.exists(fp):
            bones = get_bones(fp)
            match = bones == STANDARD_52 if bones else False
            print(f"  {up}: {'✅ 52/52' if match else '❌ MISMATCH'}")

if __name__ == '__main__':
    main()
