#!/usr/bin/env python3
"""
Master bone standardization script for AshLane.
Converts ALL models to the 52-bone Mixamo colon standard.

Run from repo root: python3 tools/bone-standard/standardize_all.py

This modifies files IN PLACE. The repo is git-tracked, so changes can be
reverted with: git checkout -- public/models/ assets/
"""
import os, sys, shutil, tempfile

# Add tools dir to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
from convert_quaternius import convert_quaternius
from rename_garbage import process as rename_garbage_process
from rename_humanoid import process_drifter, process_mannequin

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

def main():
    print("=" * 60)
    print("AshLane Bone Standardization")
    print("Target: 52-bone Mixamo colon format (mixamorig:Hips, ...)")
    print("=" * 60)
    
    results = {'ok': 0, 'skip': 0, 'fail': 0}
    
    def run_batch(name, files, func):
        print(f"\n{name}:")
        for in_path in files:
            if not os.path.exists(in_path):
                print(f"  [SKIP] {in_path}: not found")
                results['skip'] += 1
                continue
            # Convert to temp file first, then replace
            with tempfile.NamedTemporaryFile(suffix='.glb', delete=False) as tmp:
                tmp_path = tmp.name
            try:
                ok, msg = func(in_path, tmp_path)
                if ok:
                    shutil.move(tmp_path, in_path)
                    print(f"  [OK] {os.path.basename(in_path)}: {msg}")
                    results['ok'] += 1
                else:
                    os.unlink(tmp_path)
                    print(f"  [SKIP] {os.path.basename(in_path)}: {msg}")
                    results['skip'] += 1
            except Exception as e:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                print(f"  [FAIL] {os.path.basename(in_path)}: {e}")
                results['fail'] += 1
    
    # 1. Cast models: rename 6 garbage bones (JSON-only)
    cast_dir = os.path.join(REPO_ROOT, 'public/models/cast')
    cast_files = [
        os.path.join(cast_dir, f) for f in sorted(os.listdir(cast_dir))
        if f.endswith('.glb') and os.path.isfile(os.path.join(cast_dir, f))
    ]
    # Exclude quaternius subdir and CIPHER (already clean)
    cast_files = [f for f in cast_files 
                  if 'quaternius' not in f and 'CIPHER_rigged' not in f]
    run_batch("1. Cast models (rename 6 garbage bones)", cast_files, rename_garbage_process)
    
    # 2. Quaternius models: 65 -> 52 (full conversion)
    quat_dirs = [
        os.path.join(REPO_ROOT, 'public/models/cast/quaternius'),
        os.path.join(REPO_ROOT, 'assets/characters/quaternius'),
    ]
    quat_files = []
    for d in quat_dirs:
        if os.path.exists(d):
            quat_files.extend([
                os.path.join(d, f) for f in sorted(os.listdir(d))
                if f.endswith('.glb') and 'UAL' not in f
            ])
    run_batch("2. Quaternius models (65 -> 52 bones)", quat_files, convert_quaternius)
    
    # 3. UAL animation files: 65 -> 52 (with channel updates)
    ual_files = [
        os.path.join(REPO_ROOT, 'assets/characters/quaternius/UAL1_Standard.glb'),
        os.path.join(REPO_ROOT, 'assets/characters/quaternius/UAL2_Standard.glb'),
        os.path.join(REPO_ROOT, 'public/motion/ual/UAL1_Standard.glb'),
        os.path.join(REPO_ROOT, 'public/motion/ual/UAL2_Standard.glb'),
    ]
    run_batch("3. UAL animation files (65 -> 52 bones)", ual_files, convert_quaternius)
    
    # 4. Humanoid background models
    humanoid_files = [
        (os.path.join(REPO_ROOT, 'public/models/humanoid/drifter.glb'), process_drifter),
        (os.path.join(REPO_ROOT, 'public/models/humanoid/mannequin.glb'), process_mannequin),
    ]
    print("\n4. Humanoid background models:")
    for in_path, func in humanoid_files:
        if not os.path.exists(in_path):
            print(f"  [SKIP] {in_path}: not found")
            results['skip'] += 1
            continue
        with tempfile.NamedTemporaryFile(suffix='.glb', delete=False) as tmp:
            tmp_path = tmp.name
        try:
            ok, msg = func(in_path, tmp_path)
            if ok:
                shutil.move(tmp_path, in_path)
                print(f"  [OK] {os.path.basename(in_path)}: {msg}")
                results['ok'] += 1
            else:
                os.unlink(tmp_path)
                print(f"  [SKIP] {os.path.basename(in_path)}: {msg}")
                results['skip'] += 1
        except Exception as e:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            print(f"  [FAIL] {os.path.basename(in_path)}: {e}")
            results['fail'] += 1
    
    print("\n" + "=" * 60)
    print(f"Results: {results['ok']} converted, {results['skip']} skipped, {results['fail']} failed")
    print("=" * 60)
    print("\nNext: Run verification with tools/bone-standard/verify_standard.py")

if __name__ == '__main__':
    main()
