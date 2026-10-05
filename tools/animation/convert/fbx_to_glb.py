#!/usr/bin/env python3
"""
FBX → GLB converter for AshLane animation pipeline.
Uses Blender in headless mode (must be installed).
Falls back to fbx2gltf if available.

Usage:
    python3 fbx_to_glb.py input.fbx [output.glb]
    python3 fbx_to_glb.py --batch /path/to/fbx/dir /path/to/glb/out
"""
import subprocess, sys, os, argparse, shutil

def find_blender():
    for c in ["blender", "/usr/bin/blender", "/opt/blender/blender"]:
        if shutil.which(c) or os.path.exists(c):
            return c
    return None

BLENDER_SCRIPT = """
import bpy, sys
fbx_in = sys.argv[-2]
glb_out = sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=fbx_in)
# Keep only armatures and animations — drop meshes for motion-only GLBs
for obj in list(bpy.data.objects):
    if obj.type not in ('ARMATURE',):
        bpy.data.objects.remove(obj, do_unlink=True)
bpy.ops.export_scene.gltf(
    filepath=glb_out,
    export_format='GLB',
    export_animations=True,
    export_skins=False,
    export_morph=False,
)
print(f"CONVERTED: {fbx_in} -> {glb_out}")
"""

def convert_one(fbx_path, glb_path):
    blender = find_blender()
    if blender:
        # Write temp blender script
        import tempfile
        with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False) as f:
            f.write(BLENDER_SCRIPT)
            script = f.name
        r = subprocess.run(
            [blender, "--background", "--python", script, "--", fbx_path, glb_path],
            capture_output=True, text=True, timeout=120
        )
        os.unlink(script)
        if r.returncode == 0 and os.path.exists(glb_path):
            print(f"OK (blender): {glb_path}")
            return True
        print(f"Blender failed: {r.stderr[-500:]}")
    # Fallback: fbx2gltf
    fbx2gltf = shutil.which("fbx2gltf")
    if fbx2gltf:
        r = subprocess.run([fbx2gltf, "-i", fbx_path, "-o", glb_path],
                           capture_output=True, text=True, timeout=120)
        if r.returncode == 0:
            print(f"OK (fbx2gltf): {glb_path}")
            return True
    print(f"FAIL: {fbx_path} — no converter available")
    return False

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", help="FBX file or directory")
    ap.add_argument("output", nargs="?", help="GLB file or output directory")
    ap.add_argument("--batch", action="store_true", help="Batch convert directory")
    args = ap.parse_args()

    if args.batch or os.path.isdir(args.input):
        outdir = args.output or args.input + "_glb"
        os.makedirs(outdir, exist_ok=True)
        ok, fail = 0, 0
        for fn in sorted(os.listdir(args.input)):
            if fn.lower().endswith(".fbx"):
                out = os.path.join(outdir, fn[:-4] + ".glb")
                if convert_one(os.path.join(args.input, fn), out):
                    ok += 1
                else:
                    fail += 1
        print(f"\nBatch done: {ok} OK, {fail} failed")
    else:
        out = args.output or args.input[:-4] + ".glb"
        convert_one(args.input, out)

if __name__ == "__main__":
    main()
