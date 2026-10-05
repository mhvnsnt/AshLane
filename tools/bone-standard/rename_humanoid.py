#!/usr/bin/env python3
"""
Rename bones in drifter.glb (Rigify) and mannequin.glb (stripped Mixamo)
to Mixamo colon standard. JSON-only, no binary changes.
"""
import struct, json, os, sys

# drifter: Rigify DEF- names -> Mixamo
DRIFTER_MAP = {
    'DEF-hips': 'mixamorig:Hips',
    'DEF-spine.001': 'mixamorig:Spine',
    'DEF-spine.002': 'mixamorig:Spine1',
    'DEF-spine.003': 'mixamorig:Spine2',
    'DEF-neck': 'mixamorig:Neck',
    'DEF-head': 'mixamorig:Head',
    'DEF-shoulder.L': 'mixamorig:LeftShoulder',
    'DEF-upper_arm.L': 'mixamorig:LeftArm',
    'DEF-forearm.L': 'mixamorig:LeftForeArm',
    'DEF-hand.L': 'mixamorig:LeftHand',
    'DEF-thumb.01.L': 'mixamorig:LeftHandThumb1',
    'DEF-thumb.02.L': 'mixamorig:LeftHandThumb2',
    'DEF-thumb.03.L': 'mixamorig:LeftHandThumb3',
    'DEF-f_index.01.L': 'mixamorig:LeftHandIndex1',
    'DEF-f_index.02.L': 'mixamorig:LeftHandIndex2',
    'DEF-f_index.03.L': 'mixamorig:LeftHandIndex3',
    'DEF-f_middle.01.L': 'mixamorig:LeftHandMiddle1',
    'DEF-f_middle.02.L': 'mixamorig:LeftHandMiddle2',
    'DEF-f_middle.03.L': 'mixamorig:LeftHandMiddle3',
    'DEF-f_ring.01.L': 'mixamorig:LeftHandRing1',
    'DEF-f_ring.02.L': 'mixamorig:LeftHandRing2',
    'DEF-f_ring.03.L': 'mixamorig:LeftHandRing3',
    'DEF-f_pinky.01.L': 'mixamorig:LeftHandPinky1',
    'DEF-f_pinky.02.L': 'mixamorig:LeftHandPinky2',
    'DEF-f_pinky.03.L': 'mixamorig:LeftHandPinky3',
    'DEF-shoulder.R': 'mixamorig:RightShoulder',
    'DEF-upper_arm.R': 'mixamorig:RightArm',
    'DEF-forearm.R': 'mixamorig:RightForeArm',
    'DEF-hand.R': 'mixamorig:RightHand',
    'DEF-thumb.01.R': 'mixamorig:RightHandThumb1',
    'DEF-thumb.02.R': 'mixamorig:RightHandThumb2',
    'DEF-thumb.03.R': 'mixamorig:RightHandThumb3',
    'DEF-f_index.01.R': 'mixamorig:RightHandIndex1',
    'DEF-f_index.02.R': 'mixamorig:RightHandIndex2',
    'DEF-f_index.03.R': 'mixamorig:RightHandIndex3',
    'DEF-f_middle.01.R': 'mixamorig:RightHandMiddle1',
    'DEF-f_middle.02.R': 'mixamorig:RightHandMiddle2',
    'DEF-f_middle.03.R': 'mixamorig:RightHandMiddle3',
    'DEF-f_ring.01.R': 'mixamorig:RightHandRing1',
    'DEF-f_ring.02.R': 'mixamorig:RightHandRing2',
    'DEF-f_ring.03.R': 'mixamorig:RightHandRing3',
    'DEF-f_pinky.01.R': 'mixamorig:RightHandPinky1',
    'DEF-f_pinky.02.R': 'mixamorig:RightHandPinky2',
    'DEF-f_pinky.03.R': 'mixamorig:RightHandPinky3',
    'DEF-thigh.L': 'mixamorig:LeftUpLeg',
    'DEF-shin.L': 'mixamorig:LeftLeg',
    'DEF-foot.L': 'mixamorig:LeftFoot',
    'DEF-toe.L': 'mixamorig:LeftToeBase',
    'DEF-thigh.R': 'mixamorig:RightUpLeg',
    'DEF-shin.R': 'mixamorig:RightLeg',
    'DEF-foot.R': 'mixamorig:RightFoot',
    'DEF-toe.R': 'mixamorig:RightToeBase',
    'root': 'mixamorig:UnusedRoot',
}

def read_glb(path):
    with open(path, 'rb') as f:
        assert f.read(4) == b'glTF'
        f.read(8)
        json_len = struct.unpack('<I', f.read(4))[0]
        f.read(4)
        js = json.loads(f.read(json_len))
        return js, f.read()

def write_glb(path, js, rest):
    json_bytes = json.dumps(js, separators=(',', ':')).encode('utf-8')
    json_bytes += b' ' * ((4 - len(json_bytes) % 4) % 4)
    total_len = 12 + 8 + len(json_bytes) + len(rest)
    with open(path, 'wb') as f:
        f.write(b'glTF')
        f.write(struct.pack('<I', 2))
        f.write(struct.pack('<I', total_len))
        f.write(struct.pack('<I', len(json_bytes)))
        f.write(b'JSON')
        f.write(json_bytes)
        f.write(rest)

def process_drifter(in_path, out_path):
    js, rest = read_glb(in_path)
    renamed = 0
    for node in js['nodes']:
        name = node.get('name', '')
        if name in DRIFTER_MAP:
            node['name'] = DRIFTER_MAP[name]
            renamed += 1
    write_glb(out_path, js, rest)
    return True, f"renamed {renamed} bones"

def process_mannequin(in_path, out_path):
    js, rest = read_glb(in_path)
    # Add mixamorig: prefix to stripped names, map Spine2 correctly
    STRIPPED_MAP = {
        'Hips': 'mixamorig:Hips',
        'Spine': 'mixamorig:Spine',
        'Spine2': 'mixamorig:Spine2',  # Note: mannequin skips Spine1
        'Neck': 'mixamorig:Neck',
        'Head': 'mixamorig:Head',
        'LeftShoulder': 'mixamorig:LeftShoulder',
        'LeftArm': 'mixamorig:LeftArm',
        'LeftForeArm': 'mixamorig:LeftForeArm',
        'LeftHand': 'mixamorig:LeftHand',
        'RightShoulder': 'mixamorig:RightShoulder',
        'RightArm': 'mixamorig:RightArm',
        'RightForeArm': 'mixamorig:RightForeArm',
        'RightHand': 'mixamorig:RightHand',
        'LeftUpLeg': 'mixamorig:LeftUpLeg',
        'LeftLeg': 'mixamorig:LeftLeg',
        'LeftFoot': 'mixamorig:LeftFoot',
        'RightUpLeg': 'mixamorig:RightUpLeg',
        'RightLeg': 'mixamorig:RightLeg',
        'RightFoot': 'mixamorig:RightFoot',
    }
    renamed = 0
    for node in js['nodes']:
        name = node.get('name', '')
        if name in STRIPPED_MAP:
            node['name'] = STRIPPED_MAP[name]
            renamed += 1
    write_glb(out_path, js, rest)
    return True, f"renamed {renamed} bones (missing Spine1, ToeBases - documented)"

def main():
    out_dir = sys.argv[2] if len(sys.argv) > 2 else '/tmp/humanoid_test'
    os.makedirs(out_dir, exist_ok=True)
    for fn, func in [('humanoid/drifter.glb', process_drifter),
                     ('humanoid/mannequin.glb', process_mannequin)]:
        in_path = os.path.join(sys.argv[1], fn)
        try:
            ok, msg = func(in_path, os.path.join(out_dir, os.path.basename(fn)))
            print(f"[{'OK ' if ok else 'SKIP'}] {fn}: {msg}")
        except Exception as e:
            print(f"[FAIL] {fn}: {e}")

if __name__ == '__main__':
    main()
