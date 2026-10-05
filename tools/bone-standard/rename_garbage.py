#!/usr/bin/env python3
"""
Rename 6 garbage bones in AshLane cast models (JSON-only, no binary changes).
- bone_10/11/12/17/18/19 -> mixamorig:Unused10 etc.
- Safe: only changes node 'name' fields, doesn't touch skinning indices.
- The 52 real bones already have correct Mixamo colon names.
"""
import struct, json, os, sys

GARBAGE_RENAME = {
    'bone_10': 'mixamorig:Unused10',
    'bone_11': 'mixamorig:Unused11',
    'bone_12': 'mixamorig:Unused12',
    'bone_17': 'mixamorig:Unused17',
    'bone_18': 'mixamorig:Unused18',
    'bone_19': 'mixamorig:Unused19',
}

def read_glb(path):
    with open(path, 'rb') as f:
        assert f.read(4) == b'glTF'
        f.read(8)
        json_len = struct.unpack('<I', f.read(4))[0]
        f.read(4)
        js = json.loads(f.read(json_len))
        rest = f.read()
        return js, rest  # rest includes BIN chunk header+data, preserve as-is

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

def process(in_path, out_path):
    js, rest = read_glb(in_path)
    nodes = js['nodes']
    renamed = 0
    for node in nodes:
        name = node.get('name', '')
        if name in GARBAGE_RENAME:
            node['name'] = GARBAGE_RENAME[name]
            renamed += 1
    if renamed == 0:
        # Check if already renamed
        for node in nodes:
            if node.get('name', '').startswith('mixamorig:Unused'):
                return False, "already renamed"
        return False, "no garbage bones found"
    write_glb(out_path, js, rest)
    return True, f"renamed {renamed} garbage bones"

def main():
    in_path, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    files = ([os.path.join(in_path, f) for f in sorted(os.listdir(in_path)) if f.endswith('.glb')]
             if os.path.isdir(in_path) else [in_path])
    for fp in files:
        # Skip quaternius subdir, CIPHER (already clean)
        if 'quaternius' in fp or 'CIPHER_rigged' in fp:
            continue
        try:
            ok, msg = process(fp, os.path.join(out_dir, os.path.basename(fp)))
            print(f"[{'OK ' if ok else 'SKIP'}] {os.path.basename(fp)}: {msg}")
        except Exception as e:
            print(f"[FAIL] {os.path.basename(fp)}: {e}")

if __name__ == '__main__':
    main()
