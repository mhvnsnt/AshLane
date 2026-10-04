#!/usr/bin/env python3
"""video_to_clip.py — AI motion capture from ordinary video, straight into the BANNON clip format.

WHY: the owner asked for "something high level like Plask, Move AI, or Rokoko Video, but open source
or public repo". This is that, built on MediaPipe Pose Landmarker (BlazePose GHUM, Apache-2.0), which
is the same class of monocular 3D pose estimator those products wrap. It needs no GPU, no account and
no upload — the model is a 9 MB .task file and everything runs locally.

It also solves a problem the owner did not ask about but is hitting: 76 of the mocap FBX files in this
repo are Git LFS POINTERS with no data in them — 130 bytes of text each — including every locomotion
capture and core combat moves the tables map to (Suplex, NeckBreaker, GermanSuplex, HurricaneRana,
walking, idle, running). The game fetches those, gets text, FBXLoader throws, and the move plays
un-animated. Video capture is a way to regenerate a missing clip from a reference instead of waiting
on an LFS fetch that may never come.

WHAT COMES OUT is the engine's OWN clip format — {dur, keys:[{t, pose{joint:[x,y,z]}, bones{name:{rx,ry,rz}}}]}
— written straight to assets/moves/clips/<KEY>.json, the same place bake_clips.cjs writes. So a clip
captured from video is indistinguishable to the engine from one baked out of a mocap FBX, and every
existing consumer (studioApplyClipPose, clipBones, the move tables) picks it up with no new code.

TWO OUTPUTS PER FRAME, because the engine uses both:
  pose{}   the 28-joint IK target set — drives the procedural rig and the physics blend
  bones{}  per-bone LOCAL Euler offsets from rest, keyed by Mixamo bone name — drives the GLB
           skeleton directly through m.userData.clipBones

USAGE
  python3 tools/mocap/video_to_clip.py clip.mp4 --name "POWERBOMB_SITOUT"
  python3 tools/mocap/video_to_clip.py clip.mp4 --name X --start 1.2 --end 3.4   # trim to the move
  python3 tools/mocap/video_to_clip.py clip.mp4 --name X --keys 32 --preview out.png
  python3 tools/mocap/video_to_clip.py *.mp4 --auto                              # name from filename
  python3 tools/mocap/video_to_clip.py clip.mp4 --name X --dry                   # measure, write nothing

QUALITY GATE: a capture is rejected rather than banked if the estimator was not confident enough or the
subject barely moved — a clip that does not move is worse than no clip, because it silently replaces a
procedural animation that at least did something.
"""
import argparse
import json
import math
import os
import sys

import numpy as np

MODEL_CANDIDATES = [
    os.environ.get('MP_POSE_MODEL', ''),
    '/tmp/mpmodels/pose_landmarker_full.task',
    os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pose_landmarker_full.task'),
]
MODEL_URL = ('https://storage.googleapis.com/mediapipe-models/pose_landmarker/'
             'pose_landmarker_full/float16/latest/pose_landmarker_full.task')

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
OUT_DIR = os.path.join(REPO, 'public', 'motion', 'captured')

# ── MediaPipe's 33 landmarks, the ones we use ─────────────────────────────────────────────────────
L = dict(NOSE=0, L_EYE=2, R_EYE=5, L_EAR=7, R_EAR=8,
         L_SH=11, R_SH=12, L_EL=13, R_EL=14, L_WR=15, R_WR=16,
         L_HIP=23, R_HIP=24, L_KN=25, R_KN=26, L_ANK=27, R_ANK=28,
         L_HEEL=29, R_HEEL=30, L_TOE=31, R_TOE=32)


# ── the skeleton we emit ──────────────────────────────────────────────────────────────────────────
# Mixamo naming on purpose: MOCAP_BONE_MAP in the engine already normalises those names (and the fix
# that mapped LeftForeArm->elbow and LeftLeg->knee lives there), so a clip named this way lands on the
# right joints with zero new mapping code.
# name: (parent, rest_direction_in_world, child_landmark_resolver)
BONES = [
    ('mixamorig:Hips',          None,                      ( 0,  1,  0)),
    ('mixamorig:Spine',         'mixamorig:Hips',          ( 0,  1,  0)),
    ('mixamorig:Spine1',        'mixamorig:Spine',         ( 0,  1,  0)),
    ('mixamorig:Spine2',        'mixamorig:Spine1',        ( 0,  1,  0)),
    ('mixamorig:Neck',          'mixamorig:Spine2',        ( 0,  1,  0)),
    ('mixamorig:Head',          'mixamorig:Neck',          ( 0,  1,  0)),
    ('mixamorig:LeftShoulder',  'mixamorig:Spine2',        ( 1,  0,  0)),
    ('mixamorig:LeftArm',       'mixamorig:LeftShoulder',  ( 1,  0,  0)),
    ('mixamorig:LeftForeArm',   'mixamorig:LeftArm',       ( 1,  0,  0)),
    ('mixamorig:LeftHand',      'mixamorig:LeftForeArm',   ( 1,  0,  0)),
    ('mixamorig:RightShoulder', 'mixamorig:Spine2',        (-1,  0,  0)),
    ('mixamorig:RightArm',      'mixamorig:RightShoulder', (-1,  0,  0)),
    ('mixamorig:RightForeArm',  'mixamorig:RightArm',      (-1,  0,  0)),
    ('mixamorig:RightHand',     'mixamorig:RightForeArm',  (-1,  0,  0)),
    ('mixamorig:LeftUpLeg',     'mixamorig:Hips',          ( 0, -1,  0)),
    ('mixamorig:LeftLeg',       'mixamorig:LeftUpLeg',     ( 0, -1,  0)),
    ('mixamorig:LeftFoot',      'mixamorig:LeftLeg',       ( 0, -1,  0)),
    ('mixamorig:LeftToeBase',   'mixamorig:LeftFoot',      ( 0,  0,  1)),
    ('mixamorig:RightUpLeg',    'mixamorig:Hips',          ( 0, -1,  0)),
    ('mixamorig:RightLeg',      'mixamorig:RightUpLeg',    ( 0, -1,  0)),
    ('mixamorig:RightFoot',     'mixamorig:RightLeg',      ( 0, -1,  0)),
    ('mixamorig:RightToeBase',  'mixamorig:RightFoot',     ( 0,  0,  1)),
]

# where each bone POINTS: (from_point, to_point) resolved against the landmark set below
SEGMENTS = {
    'mixamorig:Hips':          ('pelvis', 'spine2'),
    'mixamorig:Spine':         ('pelvis', 'spine1'),
    'mixamorig:Spine1':        ('spine1', 'spine2'),
    'mixamorig:Spine2':        ('spine2', 'neck'),
    'mixamorig:Neck':          ('neck', 'head'),
    'mixamorig:Head':          ('neck', 'head'),
    'mixamorig:LeftShoulder':  ('neck', 'l_sh'),
    'mixamorig:LeftArm':       ('l_sh', 'l_el'),
    'mixamorig:LeftForeArm':   ('l_el', 'l_wr'),
    'mixamorig:LeftHand':      ('l_el', 'l_wr'),
    'mixamorig:RightShoulder': ('neck', 'r_sh'),
    'mixamorig:RightArm':      ('r_sh', 'r_el'),
    'mixamorig:RightForeArm':  ('r_el', 'r_wr'),
    'mixamorig:RightHand':     ('r_el', 'r_wr'),
    'mixamorig:LeftUpLeg':     ('l_hip', 'l_kn'),
    'mixamorig:LeftLeg':       ('l_kn', 'l_ank'),
    'mixamorig:LeftFoot':      ('l_ank', 'l_toe'),
    'mixamorig:LeftToeBase':   ('l_ank', 'l_toe'),
    'mixamorig:RightUpLeg':    ('r_hip', 'r_kn'),
    'mixamorig:RightLeg':      ('r_kn', 'r_ank'),
    'mixamorig:RightFoot':     ('r_ank', 'r_toe'),
    'mixamorig:RightToeBase':  ('r_ank', 'r_toe'),
}

# the engine's own joint names, and which derived point each one is
POSE_JOINTS = {
    'pelvis': 'pelvis', 'spineLow': 'spine1', 'spineMid': 'spine2', 'chest': 'chest',
    'neck': 'neck', 'head': 'head',
    'clavL': 'l_clav', 'clavR': 'r_clav', 'shL': 'l_sh', 'shR': 'r_sh',
    'elL': 'l_el', 'elR': 'r_el', 'haL': 'l_wr', 'haR': 'r_wr',
    'hipL': 'l_hip', 'hipR': 'r_hip', 'knL': 'l_kn', 'knR': 'r_kn',
    'ftL': 'l_ank', 'ftR': 'r_ank',
}


def derive_points(w):
    """The 33 landmarks -> the named points the skeleton is built from. `w` is (33,3) in metres."""
    g = lambda k: w[L[k]]
    pelvis = (g('L_HIP') + g('R_HIP')) * 0.5
    chest = (g('L_SH') + g('R_SH')) * 0.5
    neck = chest + (chest - pelvis) * 0.12
    head = g('NOSE')
    return {
        'pelvis': pelvis,
        'spine1': pelvis + (chest - pelvis) * 0.34,
        'spine2': pelvis + (chest - pelvis) * 0.70,
        'chest': chest,
        'neck': neck,
        'head': head,
        'l_clav': chest + (g('L_SH') - chest) * 0.5,
        'r_clav': chest + (g('R_SH') - chest) * 0.5,
        'l_sh': g('L_SH'), 'r_sh': g('R_SH'),
        'l_el': g('L_EL'), 'r_el': g('R_EL'),
        'l_wr': g('L_WR'), 'r_wr': g('R_WR'),
        'l_hip': g('L_HIP'), 'r_hip': g('R_HIP'),
        'l_kn': g('L_KN'), 'r_kn': g('R_KN'),
        'l_ank': g('L_ANK'), 'r_ank': g('R_ANK'),
        'l_toe': g('L_TOE'), 'r_toe': g('R_TOE'),
    }


# ── small quaternion helpers (no scipy dependency) ────────────────────────────────────────────────
def q_mul(a, b):
    ax, ay, az, aw = a
    bx, by, bz, bw = b
    return np.array([
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by - ax * bz + ay * bw + az * bx,
        aw * bz + ax * by - ay * bx + az * bw,
        aw * bw - ax * bx - ay * by - az * bz])


def q_conj(q):
    return np.array([-q[0], -q[1], -q[2], q[3]])


def q_from_to(a, b):
    """Shortest-arc quaternion taking unit vector a to unit vector b."""
    a = a / (np.linalg.norm(a) + 1e-9)
    b = b / (np.linalg.norm(b) + 1e-9)
    d = float(np.dot(a, b))
    if d > 0.999999:
        return np.array([0.0, 0.0, 0.0, 1.0])
    if d < -0.999999:
        axis = np.cross(a, np.array([1.0, 0, 0]))
        if np.linalg.norm(axis) < 1e-6:
            axis = np.cross(a, np.array([0, 1.0, 0]))
        axis /= np.linalg.norm(axis)
        return np.array([axis[0], axis[1], axis[2], 0.0])
    axis = np.cross(a, b)
    s = math.sqrt((1 + d) * 2)
    return np.array([axis[0] / s, axis[1] / s, axis[2] / s, s * 0.5])


def q_to_euler_xyz(q):
    """Match THREE.Euler.setFromQuaternion(q, 'XYZ'), which is what the engine's consumer expects."""
    x, y, z, w = q
    m11 = 1 - 2 * (y * y + z * z); m12 = 2 * (x * y - z * w);     m13 = 2 * (x * z + y * w)
    m22 = 1 - 2 * (x * x + z * z); m23 = 2 * (y * z - x * w)
    m32 = 2 * (y * z + x * w);     m33 = 1 - 2 * (x * x + y * y)
    ey = math.asin(max(-1.0, min(1.0, m13)))
    if abs(m13) < 0.9999999:
        ex = math.atan2(-m23, m33)
        ez = math.atan2(-m12, m11)
    else:
        ex = math.atan2(m32, m22)
        ez = 0.0
    return ex, ey, ez


def build_frame(pts, rest_dirs):
    """World bone directions -> LOCAL euler offsets from rest, walking the hierarchy parent-first.

    The engine consumes these as `restQuat * Euler(rx,ry,rz)`, i.e. a LOCAL offset from the bone's own
    rest orientation. So each bone's rotation must be expressed in its PARENT'S current frame, which is
    why the world rotation of every ancestor is accumulated on the way down.
    """
    world_q = {}
    out = {}
    for name, parent, _ in BONES:
        seg = SEGMENTS.get(name)
        if not seg:
            continue
        a, b = pts.get(seg[0]), pts.get(seg[1])
        if a is None or b is None:
            continue
        d = b - a
        n = np.linalg.norm(d)
        if n < 1e-6:
            continue
        d = d / n
        qw = q_from_to(np.array(rest_dirs[name], dtype=float), d)   # world rotation of this bone
        world_q[name] = qw
        qp = world_q.get(parent, np.array([0.0, 0, 0, 1.0])) if parent else np.array([0.0, 0, 0, 1.0])
        ql = q_mul(q_conj(qp), qw)                                   # into the parent's frame
        ex, ey, ez = q_to_euler_xyz(ql)
        if abs(ex) > 1e-4 or abs(ey) > 1e-4 or abs(ez) > 1e-4:
            out[name] = {'rx': round(ex, 4), 'ry': round(ey, 4), 'rz': round(ez, 4)}
    return out


def smooth(seq, win):
    """Centred moving average over a list of (N,3) arrays. Estimator jitter is the main quality cost
    in monocular capture, and an unsmoothed clip reads as exactly the twitching the owner is
    complaining about elsewhere."""
    if win < 2 or len(seq) < win:
        return seq
    arr = np.stack(seq)
    k = np.ones(win) / win
    out = np.empty_like(arr)
    pad = win // 2
    for i in range(arr.shape[1]):
        for j in range(arr.shape[2]):
            padded = np.pad(arr[:, i, j], (pad, pad), mode='edge')
            out[:, i, j] = np.convolve(padded, k, mode='same')[pad:pad + arr.shape[0]]
    return list(out)


def find_model():
    for c in MODEL_CANDIDATES:
        if c and os.path.exists(c):
            return c
    return None


def capture(path, args):
    import cv2
    import mediapipe as mp
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision

    model = find_model()
    if not model:
        print('POSE MODEL MISSING. One file, 9 MB, fetched once:', file=sys.stderr)
        print('  mkdir -p /tmp/mpmodels && curl -sSL -o /tmp/mpmodels/pose_landmarker_full.task \\',
              file=sys.stderr)
        print('    "%s"' % MODEL_URL, file=sys.stderr)
        print('  (or set MP_POSE_MODEL=/path/to/pose_landmarker_full.task)', file=sys.stderr)
        return None

    opts = vision.PoseLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=model),
        running_mode=vision.RunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
        output_segmentation_masks=False)
    landmarker = vision.PoseLandmarker.create_from_options(opts)

    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        print('cannot open video:', path, file=sys.stderr)
        return None
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    nframes = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    dur = nframes / fps if nframes else 0

    t0 = args.start or 0.0
    t1 = args.end if args.end else dur

    world_seq, conf_seq, times = [], [], []
    idx = 0
    detected = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        t = idx / fps
        idx += 1
        if t < t0:
            continue
        if t1 and t > t1:
            break
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        res = landmarker.detect_for_video(mp_img, int(t * 1000))
        if not res.pose_world_landmarks:
            continue
        lms = res.pose_world_landmarks[0]
        # pose_world_landmarks are METRES, origin at the hip midpoint — already the space we want
        w = np.array([[p.x, p.y, p.z] for p in lms], dtype=float)
        # MediaPipe is Y-DOWN; the engine is Y-UP. Flip Y (and Z, to keep the frame right-handed).
        w[:, 1] *= -1.0
        w[:, 2] *= -1.0
        vis = float(np.mean([getattr(p, 'visibility', 1.0) for p in lms]))
        world_seq.append(w)
        conf_seq.append(vis)
        times.append(t)
        detected += 1
    cap.release()
    landmarker.close()

    if detected < 6:
        print('  only %d frames had a detectable person — not a usable capture' % detected)
        return None

    return build_clip(world_seq, conf_seq, times, args, fps, detected)


def build_clip(world_seq, conf_seq, times, args, fps, detected):
    """Turn a sequence of world landmarks into the engine's clip format.

    Split out of capture() so a TWO-BODY capture can run it twice -- once for the attacker and once
    for the receiver -- without duplicating the retarget, the scaling or the quality gate."""
    world_seq = smooth(world_seq, args.smooth)

    # ── quality gate: a clip that does not MOVE is worse than no clip, because it silently replaces a
    # procedural animation that at least did something.
    span = float(np.max([np.linalg.norm(world_seq[i] - world_seq[0]) for i in range(len(world_seq))]))
    mean_conf = float(np.mean(conf_seq))

    # rest directions: taken from the FIRST frames of this capture, so the retarget is relative to how
    # THIS performer stands rather than to an assumed A-pose
    rest_pts = derive_points(np.mean(np.stack(world_seq[:max(1, min(5, len(world_seq)))]), axis=0))
    rest_dirs = {}
    for name, parent, fallback in BONES:
        seg = SEGMENTS.get(name)
        if not seg:
            rest_dirs[name] = fallback
            continue
        a, b = rest_pts.get(seg[0]), rest_pts.get(seg[1])
        if a is None or b is None:
            rest_dirs[name] = fallback
            continue
        d = b - a
        n = np.linalg.norm(d)
        rest_dirs[name] = (d / n) if n > 1e-6 else np.array(fallback, dtype=float)

    # ── resample to a fixed key count, which is what the engine's clip format wants
    nkeys = args.keys
    total = times[-1] - times[0] if len(times) > 1 else 1.0
    total = max(0.2, total)
    keys = []
    bone_names = set()
    for k in range(nkeys):
        u = k / (nkeys - 1) if nkeys > 1 else 0.0
        fi = u * (len(world_seq) - 1)
        i0 = int(math.floor(fi)); i1 = min(len(world_seq) - 1, i0 + 1); a = fi - i0
        w = world_seq[i0] * (1 - a) + world_seq[i1] * a
        pts = derive_points(w)

        # SCALE TO OUR RIG. MediaPipe returns real human metres; the engine's rig is ~1.8 units tall
        # with its own proportions. Normalise by the performer's own hip-to-head height so a tall
        # performer and a short one produce the same clip.
        h = np.linalg.norm(pts['head'] - pts['pelvis'])
        s = (0.80 / h) if h > 1e-6 else 1.0
        pose = {}
        for jname, pkey in POSE_JOINTS.items():
            p = pts.get(pkey)
            if p is None:
                continue
            q = (p - pts['pelvis']) * s
            pose[jname] = [round(float(q[0]), 4), round(float(q[1]), 4), round(float(q[2]), 4)]

        bones = build_frame(pts, rest_dirs)
        bone_names.update(bones.keys())
        keys.append({'t': round(u * total, 4), 'pose': pose, 'bones': bones})

    clip = {'dur': round(total, 4), 'keys': keys}
    return {'clip': clip, 'frames': detected, 'fps': fps, 'span': span, 'conf': mean_conf,
            'bones': len(bone_names), 'seconds': total}



def capture_two(path, args):
    """CAPTURE BOTH WRESTLERS. Owner: "some of those moves need to map the receiver tho".

    He is right, and a single-person capture cannot do it. A falcon arrow, a German suplex or a
    headbutt onto a prone man is two bodies, and the one being thrown carries half the move. The
    original path ran BlazePose with num_poses=1 and produced one skeleton with no idea whose it was.

    This uses the two-pass masked detection in verify_capture (measured 34-66% both-body coverage
    against 1-9% for num_poses=2), keeps each body's identity stable across frames by hip continuity,
    and decides which is the attacker by inversion -- the receiver is the one whose head goes below
    his hips, which covers suplexes, drivers, falcon arrows and a prone man taking a dive.

    Returns {'attacker': <clip result>, 'receiver': <clip result>, 'roleBy': str, 'coverage': {...}}.
    """
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import verify_capture as VC

    fps, raw, tracks, wtracks = VC.track(path, keep_frames=False,
                                        people=max(2, getattr(args, 'people', 2)))
    n = len(raw)
    if n < 6:
        return None
    if len(tracks) > 2:
        # THREE BODIES: two attackers and a receiver. role_of compares a pair, so hand it the two
        # best-covered tracks and bank the third separately as the partner.
        order = sorted(range(len(tracks)), key=lambda i: -len(tracks[i]))
        keep = order[:2]
        extra = order[2:]
        tracks_all, wtracks_all = tracks, wtracks
        tracks = [tracks_all[keep[0]], tracks_all[keep[1]]]
        wtracks = [wtracks_all[keep[0]], wtracks_all[keep[1]]]
    ai, ri, why = VC.role_of(tracks, n)
    # HUMAN OVERRIDE. The automatic rules cover suplexes and dives onto a grounded man, but a running
    # dive where BOTH men end up horizontal can still come out inverted -- measured on the feral run,
    # where the diver's head drops below his hips and the rule called him the receiver. Rather than
    # keep bolting cases onto a heuristic, --swap lets whoever has just LOOKED at the verify sheet
    # state the truth. Guessing harder is not better than reading the answer off the picture.
    if getattr(args, 'swap', False):
        ai, ri = ri, ai
        why += ' (swapped by hand)'

    # trim to where the move actually is, unless the caller stated a window
    lo, hi = 0, n - 1
    if args.start or args.end:
        # THE CALLER'S WINDOW WAS BEING THROWN AWAY. This branch only ever SKIPPED the auto-trim; it
        # never applied --start/--end, so lo/hi stayed at the full clip and every two-body capture
        # with an explicit window banked the WHOLE video. Measured: two different segments of one
        # 17s reel both came out 17.43s with identical coverage, and the Jungle Juice capture asked
        # for 1.5-3.3s and banked all 4.3s. The single-body path (t0/t1 above) always honoured it —
        # only this path did not.
        lo = max(0, int(round((args.start or 0.0) * fps)))
        hi = min(n - 1, int(round(args.end * fps)) if args.end else n - 1)
        if hi - lo < 5:                      # a window too small to be a move: fall back to the clip
            lo, hi = 0, n - 1
    else:
        info = VC.analyse(fps, VC.densify(tracks[ai], n))
        lo, hi = info['window']
        # a receiver-dominant capture (the attacker is behind him and occluded) should use the
        # receiver's window instead, or the trim is driven by the sparser of the two tracks
        if info['tracked'] < 0.5 * n:
            info2 = VC.analyse(fps, VC.densify(tracks[ri], n))
            if info2['tracked'] > info['tracked']:
                lo, hi = info2['window']

    out = {'roleBy': why, 'coverage': {}, 'window_s': (round(lo / fps, 2), round(hi / fps, 2))}
    for role, ti in (('attacker', ai), ('receiver', ri)):
        wd = VC.densify(wtracks[ti], n)
        ld = VC.densify(tracks[ti], n)
        seq, conf, times = [], [], []
        for fi in range(lo, hi + 1):
            w, l = wd[fi], ld[fi]
            if w is None:
                continue
            arr = np.array([[q.x, q.y, q.z] for q in w], dtype=float)
            arr[:, 1] *= -1.0
            arr[:, 2] *= -1.0
            seq.append(arr)
            conf.append(float(np.mean([getattr(q, 'visibility', 1.0) for q in (l or w)])))
            times.append(fi / fps)
        out['coverage'][role] = '%d/%d' % (len(seq), hi - lo + 1)
        if len(seq) < 6:
            out[role] = None
            continue
        out[role] = build_clip(seq, conf, times, args, fps, len(seq))
    return out


def main():
    ap = argparse.ArgumentParser(description='AI motion capture from video into the BANNON clip format.')
    ap.add_argument('videos', nargs='+')
    ap.add_argument('--name', help='clip key (one video only). Otherwise derived from the filename.')
    ap.add_argument('--keys', type=int, default=28, help='keyframes in the output clip (default 28)')
    ap.add_argument('--smooth', type=int, default=5, help='moving-average window over landmarks')
    ap.add_argument('--start', type=float, default=0.0)
    ap.add_argument('--end', type=float, default=0.0)
    ap.add_argument('--min-conf', type=float, default=0.55, help='reject below this mean visibility')
    ap.add_argument('--min-span', type=float, default=0.25, help='reject if the body barely moved')
    ap.add_argument('--min-cover', type=float, default=0.0,
                    help='two-body: OPT-IN filter. Skip a track found in fewer than this fraction '
                         'of frames. Default 0 = bank everything and flag it; generated content is '
                         'never discarded on the tool\'s own judgement.')
    ap.add_argument('--out', default=OUT_DIR)
    ap.add_argument('--dry', action='store_true')
    ap.add_argument('--auto', action='store_true', help='derive the key from each filename')
    ap.add_argument('--people', type=int, default=2,
                    help='how many bodies are in the move (3 for a tag double-team)')
    ap.add_argument('--swap', action='store_true',
                    help='two-body: the role detector got it backwards; flip attacker and receiver')
    ap.add_argument('--two', action='store_true',
                    help='capture BOTH wrestlers: writes <NAME> and <NAME>__RECV')
    args = ap.parse_args()

    if args.name and len(args.videos) > 1:
        print('--name takes one video; use --auto for a batch', file=sys.stderr)
        return 2

    os.makedirs(args.out, exist_ok=True)
    index_path = os.path.join(args.out, 'index.json')
    index = {}
    if os.path.exists(index_path):
        try:
            index = json.load(open(index_path))
        except Exception:
            index = {}

    ok = 0
    for v in args.videos:
        base = args.name or os.path.splitext(os.path.basename(v))[0]
        key = base.upper().replace(' ', '_')
        key = ''.join(c for c in key if c.isalnum() or c == '_')
        print('%s  <- %s' % (key, os.path.basename(v)))

        # TWO-BODY: attacker and receiver both get a clip, keyed <NAME> and <NAME>__RECV.
        if args.two:
            two = capture_two(v, args)
            if not two:
                print('  no usable bodies in this video')
                continue
            print('  roles by %s · move window %.2fs..%.2fs' % (two['roleBy'], two['window_s'][0], two['window_s'][1]))
            for role, suffix in (('attacker', ''), ('receiver', '__RECV')):
                r2 = two.get(role)
                k2 = key + suffix
                cov = two['coverage'].get(role, '?')
                if not r2:
                    print('  %-9s %-28s no usable frames (%s)' % (role, k2, cov))
                    continue
                # COVERAGE IS RECORDED, NOT USED TO DISCARD. I had this refusing anything under 45%
                # of frames, and that was wrong twice over.
                #
                # Owner: "the aftermath of a flying headbutt is important, that's noted in our game
                # for certain moves" -- and he is right, it is IN the engine: DIVING_HEADBUTT carries
                # sell:1, "angelic flight, violent crash - attacker PAYS", with a 0.45s sell reaction.
                # So on that reference the frames I was calling worthless (the crash and the two men
                # laid out) are the half of the move the engine actually models.
                #
                # And it breaks the standing law about generated content: harvest.py was already
                # changed to BANK AND FLAG low-divergence variants rather than delete them on my own
                # judgement. Same rule applies here. A low-coverage track is banked with its coverage
                # recorded so a human can judge it; --min-cover is opt-in for anyone who wants
                # filtering, and it is never the default.
                bad = []
                cn, cd = (cov.split('/') + ['1'])[:2]
                frac = int(cn) / max(1, int(cd))
                low = frac < 0.45
                if args.min_cover > 0 and frac < args.min_cover:
                    bad.append('only %.0f%% of frames tracked' % (100 * frac))
                if r2['conf'] < args.min_conf:
                    bad.append('visibility %.2f' % r2['conf'])
                if r2['span'] < args.min_span:
                    bad.append('span %.2f m' % r2['span'])
                if r2['bones'] < 12:
                    bad.append('%d bones' % r2['bones'])
                txt = json.dumps(r2['clip'])
                print('  %-9s %-28s %.2fs %2d keys %2d bones vis %.2f cover %-7s %s'
                      % (role, k2, r2['seconds'], len(r2['clip']['keys']), r2['bones'], r2['conf'],
                         cov, ('SKIPPED: ' + ', '.join(bad)) if bad
                              else ('banked · LOW COVERAGE, judge it' if low else 'banked')))
                if bad or args.dry:
                    continue
                with open(os.path.join(args.out, k2 + '.json'), 'w') as fh:
                    fh.write(txt)
                index[k2] = {'file': k2 + '.json', 'bytes': len(txt), 'dur': r2['clip']['dur'],
                             'keys': len(r2['clip']['keys']), 'bones': r2['bones'],
                             'src': os.path.basename(v), 'via': 'video_to_clip/mediapipe/two-body',
                             'role': role, 'coverage': cov, 'coverFrac': round(frac, 3),
                             'lowCoverage': bool(low), 'roleBy': two['roleBy']}
                ok += 1
            continue

        r = capture(v, args)
        if not r:
            continue
        why = []
        if r['conf'] < args.min_conf:
            why.append('mean visibility %.2f < %.2f' % (r['conf'], args.min_conf))
        if r['span'] < args.min_span:
            why.append('body barely moved (span %.2f m)' % r['span'])
        if r['bones'] < 12:
            why.append('only %d bones driven' % r['bones'])
        if why:
            print('  REJECTED: ' + '; '.join(why))
            print('  (a clip that does not move is worse than none — it would silently replace the '
                  'procedural animation)')
            continue
        text = json.dumps(r['clip'])
        print('  %d frames @ %.0ffps -> %.2fs, %d keys, %d bones, visibility %.2f, %.1f KB'
              % (r['frames'], r['fps'], r['seconds'], len(r['clip']['keys']), r['bones'],
                 r['conf'], len(text) / 1024))
        if args.dry:
            ok += 1
            continue
        with open(os.path.join(args.out, key + '.json'), 'w') as fh:
            fh.write(text)
        index[key] = {'file': key + '.json', 'bytes': len(text), 'dur': r['clip']['dur'],
                      'keys': len(r['clip']['keys']), 'bones': r['bones'],
                      'src': os.path.basename(v), 'via': 'video_to_clip/mediapipe'}
        ok += 1

    if not args.dry and ok:
        with open(index_path, 'w') as fh:
            json.dump(index, fh, indent=1)
        print('\n%d clip(s) written to %s' % (ok, args.out))
        print('index.json updated — the engine loads these by key with no FBX parse at all')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
