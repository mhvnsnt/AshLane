#!/usr/bin/env python3
"""
Convert Quaternius 65-bone (UE naming) models to 52-bone Mixamo colon standard.
- Renames 52 bones to mixamorig: format
- Drops 13 bones (root, 10 finger leaves, 2 toe leaves) from skin joints
- Remaps JOINTS_0 vertex attributes (data is valid in Quaternius files)
- Rebuilds inverseBindMatrices
- Updates animation channels in UAL files (drops channels for removed bones)
"""
import struct, json, os, sys
import numpy as np

UE_TO_MIXAMO = {
    'pelvis': 'mixamorig:Hips',
    'spine_01': 'mixamorig:Spine',
    'spine_02': 'mixamorig:Spine1',
    'spine_03': 'mixamorig:Spine2',
    'neck_01': 'mixamorig:Neck',
    'Head': 'mixamorig:Head',
    'clavicle_l': 'mixamorig:LeftShoulder',
    'upperarm_l': 'mixamorig:LeftArm',
    'lowerarm_l': 'mixamorig:LeftForeArm',
    'hand_l': 'mixamorig:LeftHand',
    'thumb_01_l': 'mixamorig:LeftHandThumb1',
    'thumb_02_l': 'mixamorig:LeftHandThumb2',
    'thumb_03_l': 'mixamorig:LeftHandThumb3',
    'index_01_l': 'mixamorig:LeftHandIndex1',
    'index_02_l': 'mixamorig:LeftHandIndex2',
    'index_03_l': 'mixamorig:LeftHandIndex3',
    'middle_01_l': 'mixamorig:LeftHandMiddle1',
    'middle_02_l': 'mixamorig:LeftHandMiddle2',
    'middle_03_l': 'mixamorig:LeftHandMiddle3',
    'ring_01_l': 'mixamorig:LeftHandRing1',
    'ring_02_l': 'mixamorig:LeftHandRing2',
    'ring_03_l': 'mixamorig:LeftHandRing3',
    'pinky_01_l': 'mixamorig:LeftHandPinky1',
    'pinky_02_l': 'mixamorig:LeftHandPinky2',
    'pinky_03_l': 'mixamorig:LeftHandPinky3',
    'clavicle_r': 'mixamorig:RightShoulder',
    'upperarm_r': 'mixamorig:RightArm',
    'lowerarm_r': 'mixamorig:RightForeArm',
    'hand_r': 'mixamorig:RightHand',
    'thumb_01_r': 'mixamorig:RightHandThumb1',
    'thumb_02_r': 'mixamorig:RightHandThumb2',
    'thumb_03_r': 'mixamorig:RightHandThumb3',
    'index_01_r': 'mixamorig:RightHandIndex1',
    'index_02_r': 'mixamorig:RightHandIndex2',
    'index_03_r': 'mixamorig:RightHandIndex3',
    'middle_01_r': 'mixamorig:RightHandMiddle1',
    'middle_02_r': 'mixamorig:RightHandMiddle2',
    'middle_03_r': 'mixamorig:RightHandMiddle3',
    'ring_01_r': 'mixamorig:RightHandRing1',
    'ring_02_r': 'mixamorig:RightHandRing2',
    'ring_03_r': 'mixamorig:RightHandRing3',
    'pinky_01_r': 'mixamorig:RightHandPinky1',
    'pinky_02_r': 'mixamorig:RightHandPinky2',
    'pinky_03_r': 'mixamorig:RightHandPinky3',
    'thigh_l': 'mixamorig:LeftUpLeg',
    'calf_l': 'mixamorig:LeftLeg',
    'foot_l': 'mixamorig:LeftFoot',
    'ball_l': 'mixamorig:LeftToeBase',
    'thigh_r': 'mixamorig:RightUpLeg',
    'calf_r': 'mixamorig:RightLeg',
    'foot_r': 'mixamorig:RightFoot',
    'ball_r': 'mixamorig:RightToeBase',
}

DROP = {
    'root',
    'thumb_04_leaf_l', 'index_04_leaf_l', 'middle_04_leaf_l', 'ring_04_leaf_l', 'pinky_04_leaf_l',
    'thumb_04_leaf_r', 'index_04_leaf_r', 'middle_04_leaf_r', 'ring_04_leaf_r', 'pinky_04_leaf_r',
    'ball_leaf_l', 'ball_leaf_r',
}

def read_glb(path):
    with open(path, 'rb') as f:
        assert f.read(4) == b'glTF'
        f.read(8)
        json_len = struct.unpack('<I', f.read(4))[0]
        f.read(4)
        js = json.loads(f.read(json_len).rstrip(b'\x00 '))
        rest = f.read()
        binary = b''
        if len(rest) >= 8:
            bin_len = struct.unpack('<I', rest[:4])[0]
            binary = rest[8:8+bin_len]
        return js, bytearray(binary)

def write_glb(path, js, binary):
    json_bytes = json.dumps(js, separators=(',', ':')).encode('utf-8')
    json_bytes += b' ' * ((4 - len(json_bytes) % 4) % 4)
    binary = bytes(binary)
    binary += b'\x00' * ((4 - len(binary) % 4) % 4)
    total_len = 12 + 8 + len(json_bytes) + 8 + len(binary)
    with open(path, 'wb') as f:
        f.write(b'glTF')
        f.write(struct.pack('<I', 2))
        f.write(struct.pack('<I', total_len))
        f.write(struct.pack('<I', len(json_bytes)))
        f.write(b'JSON')
        f.write(json_bytes)
        f.write(struct.pack('<I', len(binary)))
        f.write(b'BIN\x00')
        f.write(binary)

# Standard 52-bone order (from CIPHER_rigged.glb)
STANDARD_ORDER = [
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

def convert_quaternius(in_path, out_path):
    js, binary = read_glb(in_path)
    nodes = js['nodes']
    skins = js.get('skins', [])
    if not skins:
        return False, "no skins"
    
    skin = skins[0]
    old_joints = skin['joints']
    old_names = [nodes[j].get('name', '') for j in old_joints]
    
    if len(old_joints) == 52 and old_names[0] == 'mixamorig:Hips':
        return False, "already converted"
    if len(old_joints) != 65:
        return False, f"unexpected joint count: {len(old_joints)}"
    
    # Build mapping: old joint index -> new joint index (or -1 if dropped)
    # First, rename nodes and identify kept bones
    node_to_new_name = {}  # node_idx -> new Mixamo name
    for old_jidx, node_idx in enumerate(old_joints):
        old_name = nodes[node_idx].get('name', '')
        if old_name in DROP:
            continue
        elif old_name in UE_TO_MIXAMO:
            new_name = UE_TO_MIXAMO[old_name]
            node_to_new_name[node_idx] = new_name
            nodes[node_idx]['name'] = new_name
        else:
            return False, f"unmapped bone: {old_name}"
    
    # Build new joints array in STANDARD_ORDER
    # Map: new Mixamo name -> node_idx
    name_to_node = {v: k for k, v in node_to_new_name.items()}
    new_joints = []
    for std_name in STANDARD_ORDER:
        if std_name not in name_to_node:
            return False, f"missing standard bone: {std_name}"
        new_joints.append(name_to_node[std_name])
    
    assert len(new_joints) == 52
    
    # Build old joint index -> new joint index LUT
    # old_joints[old_jidx] = node_idx; new_joints[new_jidx] = node_idx
    node_to_old_jidx = {node_idx: old_jidx for old_jidx, node_idx in enumerate(old_joints)}
    node_to_new_jidx = {node_idx: new_jidx for new_jidx, node_idx in enumerate(new_joints)}
    lut = np.full(65, -1, dtype=np.int32)
    for node_idx, old_jidx in node_to_old_jidx.items():
        if node_idx in node_to_new_jidx:
            lut[old_jidx] = node_to_new_jidx[node_idx]
    
    skin['joints'] = new_joints
    
    # Remap JOINTS_0
    for mesh in js.get('meshes', []):
        for prim in mesh['primitives']:
            if 'JOINTS_0' not in prim['attributes']:
                continue
            acc = js['accessors'][prim['attributes']['JOINTS_0']]
            bv = js['bufferViews'][acc['bufferView']]
            offset = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
            count = acc['count']
            comp = acc['componentType']
            dt = np.uint8 if comp == 5121 else np.uint16
            
            arr = np.frombuffer(binary, dtype=dt, count=count*4, offset=offset).reshape(count, 4)
            flat = arr.reshape(-1)
            # Check for dropped bone references
            for i in range(len(flat)):
                old = int(flat[i])
                new = int(lut[old]) if old < 65 else -1
                if new < 0:
                    # Vertex weighted to dropped bone - this shouldn't happen for leaves
                    # but if it does, map to parent (clamp to 0)
                    # Actually, let's check the weight - if weight is 0, just set to 0
                    flat[i] = 0
                else:
                    flat[i] = new
            del arr, flat
    
    # Rebuild IBM in new_joints order
    ibm_acc_idx = skin.get('inverseBindMatrices')
    if ibm_acc_idx is not None:
        ibm_acc = js['accessors'][ibm_acc_idx]
        ibm_bv = js['bufferViews'][ibm_acc['bufferView']]
        ibm_offset = ibm_bv.get('byteOffset', 0) + ibm_acc.get('byteOffset', 0)
        ibm_data = np.frombuffer(
            binary, dtype=np.float32,
            count=ibm_acc['count']*16, offset=ibm_offset
        ).reshape(-1, 16).copy()
        
        # Build IBM in new_joints order using node mapping
        ordered_old = [node_to_old_jidx[node_idx] for node_idx in new_joints]
        assert len(ordered_old) == 52
        new_ibm = ibm_data[ordered_old]
        new_ibm_bytes = new_ibm.tobytes()
        del ibm_data
        
        new_offset = (len(binary) + 3) & ~3
        binary.extend(b'\x00' * (new_offset - len(binary)))
        binary.extend(new_ibm_bytes)
        
        new_bv_idx = len(js['bufferViews'])
        js['bufferViews'].append({
            'buffer': 0, 'byteOffset': new_offset, 'byteLength': 52*16*4,
        })
        new_acc_idx = len(js['accessors'])
        js['accessors'].append({
            'bufferView': new_bv_idx, 'byteOffset': 0,
            'componentType': 5126, 'count': 52, 'type': 'MAT4',
        })
        skin['inverseBindMatrices'] = new_acc_idx
    
    # Update animation channels: remove channels targeting dropped nodes
    kept_node_indices = set(new_joints)
    for anim in js.get('animations', []):
        kept_channels = []
        kept_samplers = []
        sampler_remap = {}
        for ch in anim.get('channels', []):
            target_node = ch.get('target', {}).get('node')
            if target_node not in kept_node_indices:
                continue
            # Remap sampler index
            old_s = ch['sampler']
            if old_s not in sampler_remap:
                sampler_remap[old_s] = len(kept_samplers)
                kept_samplers.append(anim['samplers'][old_s])
            ch['sampler'] = sampler_remap[old_s]
            kept_channels.append(ch)
        anim['channels'] = kept_channels
        anim['samplers'] = kept_samplers
    
    write_glb(out_path, js, binary)
    return True, f"65 -> 52 bones"

def main():
    if len(sys.argv) < 3:
        print("Usage: convert_quaternius.py <input_glb_or_dir> <output_dir>")
        sys.exit(1)
    in_path, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    files = ([os.path.join(in_path, f) for f in sorted(os.listdir(in_path)) if f.endswith('.glb')]
             if os.path.isdir(in_path) else [in_path])
    for fp in files:
        try:
            ok, msg = convert_quaternius(fp, os.path.join(out_dir, os.path.basename(fp)))
            print(f"[{'OK ' if ok else 'SKIP'}] {os.path.basename(fp)}: {msg}")
        except Exception as e:
            print(f"[FAIL] {os.path.basename(fp)}: {e}")
            import traceback; traceback.print_exc()

if __name__ == '__main__':
    main()
