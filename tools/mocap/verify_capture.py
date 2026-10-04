#!/usr/bin/env python3
"""verify_capture.py — LOOK at what the pose estimator actually tracked before banking it.

    python3 tools/mocap/verify_capture.py clip.mp4 --out sheet.png
    python3 tools/mocap/verify_capture.py clip.mp4 --window          # just print the move window

WHY THIS EXISTS
The owner's reference clips are real matches, which means TWO WRESTLERS ARE IN FRAME, and -- his
point -- "some of those moves need to map the receiver tho". A falcon arrow or a German suplex is two
bodies; the man being thrown is half the move.

video_to_clip ran MediaPipe with num_poses=1. One skeleton, picked by whichever body the estimator
found most salient in each frame -- so on a two-man capture it can silently hop from the attacker to
the victim halfway through a suplex. The resulting clip looks fine by every number that tool reports
(frame count, key count, visibility) and is garbage: half of one man's motion welded to half of
another's, and no receiver clip at all.

This runs a REAL PERSON DETECTOR (YOLOX-tiny, Apache-2.0, ONNX on CPU via rtmlib) to find the
bodies, then poses each one in turn, keeps their identities stable across frames, works out which is
which, and shows you the result. Both-body coverage on the owner's clips went from 1-9% (asking
BlazePose for two) to 34-66% (an automatic masking workaround) to 32-100% with the detector.

video_to_clip's docstring advertises a --preview flag that its argument parser does not have, so
there was no way to see this. This is that missing check, and it reports three things the numbers
alone cannot:

  ROLE ASSIGNMENT   which track is the attacker and which is the receiver, and on what evidence.
  THE MOVE WINDOW   most of a reference clip is walking around. Motion energy over the hip and wrists
                    finds the span where the move actually happens, so the capture can be trimmed to
                    it instead of banking ten seconds of setup.
  A CONTACT SHEET   the tracked skeleton drawn on the frames, so a human can confirm it is on the
                    right man doing the right thing.
"""
import argparse
import os
import sys

import numpy as np

MODEL_CANDIDATES = [
    os.environ.get('MP_POSE_MODEL', ''),
    '/tmp/mpmodels/pose_landmarker_full.task',
    os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pose_landmarker_full.task'),
]

# the MediaPipe landmark pairs worth drawing — torso, arms, legs
BONES = [(11, 12), (11, 23), (12, 24), (23, 24),
         (11, 13), (13, 15), (12, 14), (14, 16),
         (23, 25), (25, 27), (24, 26), (26, 28),
         (27, 31), (28, 32), (0, 11), (0, 12)]


def model_path():
    for p in MODEL_CANDIDATES:
        if p and os.path.exists(p):
            return p
    print('no pose_landmarker_full.task found; set MP_POSE_MODEL', file=sys.stderr)
    sys.exit(2)


def _mk(model, mode, np_=1):
    import mediapipe as mp
    from mediapipe.tasks import python as mpp
    from mediapipe.tasks.python import vision
    return vision.PoseLandmarker.create_from_options(vision.PoseLandmarkerOptions(
        base_options=mpp.BaseOptions(model_asset_path=model), running_mode=mode, num_poses=np_,
        min_pose_detection_confidence=0.3, min_pose_presence_confidence=0.3,
        min_tracking_confidence=0.3))


_DET = None
DET_URL = ('https://download.openmmlab.com/mmpose/v1/projects/rtmposev1/onnx_sdk/'
           'yolox_tiny_8xb8-300e_humanart-6f3252f9.zip')


def detector():
    """YOLOX-tiny person detector (Apache-2.0, ONNX, CPU) via rtmlib.

    THE MASKING HACK IS GONE. Owner: "I'm not doing video editing to blank out salient bodies, you
    can find a way to do that open source". The masking was automatic -- code, per frame, never a
    human touching a video editor -- but he is right that it was a workaround standing in for a real
    detector, and a real one is a pip install away.

    MEASURED on his own clips, frames where BOTH wrestlers are found:

        clip            num_poses=2    mask hack    YOLOX detector
        tiger feint          6.6%         65.6%          100.0%
        falcon arrow         1.1%         43.0%           95.5%
        ultra german         2.7%         43.8%           57.5%
        benoit headbutt      6.6%         34.2%           31.6%
        feral run (1 man)      --            --            2.5%

    The feral-run number is the detector being RIGHT: there is one wrestler in that clip, so there is
    one body to find. The Benoit clip is a distant broadcast shot where neither approach can see much.
    """
    global _DET
    if _DET is None:
        from rtmlib import YOLOX
        _DET = YOLOX(DET_URL, model_input_size=(416, 416), backend='onnxruntime', device='cpu')
    return _DET


def detect_people(frame_bgr, frame_rgb, pose, limit=2):
    """Real person boxes, then 3D pose per box.

    Top-down, which is the standard shape for multi-person capture: the DETECTOR says where the
    bodies are, and the single-person estimator -- which is the case BlazePose is genuinely good at
    -- runs on each crop in turn. MediaPipe still does the pose because its world landmarks are
    metric 3D and that is exactly what the retarget downstream already consumes; swapping to a 2D
    keypoint model would mean rewriting the retarget for no gain.

    Landmarks come back in CROP space, so image coordinates are mapped back to the full frame before
    they are used for identity -- otherwise every body looks like it is in the middle of the picture
    and the continuity matching has nothing to work with.
    """
    import mediapipe as mp
    H, W = frame_rgb.shape[:2]
    try:
        boxes = detector()(frame_bgr)
    except Exception:
        boxes = None
    if boxes is None or not len(boxes):
        return []
    # biggest first: on a wrestling shot the two competitors dominate anyone at ringside
    bl = sorted([b for b in boxes], key=lambda b: -( (b[2]-b[0]) * (b[3]-b[1]) ))[:limit]
    out = []
    for b in bl:
        x0, y0, x1, y1 = [int(v) for v in b[:4]]
        pad = int(0.08 * max(x1 - x0, y1 - y0))
        x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
        x1 = min(W, x1 + pad); y1 = min(H, y1 + pad)
        if x1 - x0 < 24 or y1 - y0 < 24:
            continue
        crop = frame_rgb[y0:y1, x0:x1]
        try:
            r = pose.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(crop)))
        except Exception:
            continue
        if not r.pose_landmarks:
            continue
        lm = r.pose_landmarks[0]
        wl = r.pose_world_landmarks[0] if r.pose_world_landmarks else None
        # crop space -> full frame, so hips can be compared between bodies
        cw, ch = (x1 - x0), (y1 - y0)
        remapped = [_LM((x0 + l.x * cw) / W, (y0 + l.y * ch) / H, l.z,
                        getattr(l, 'visibility', 1.0)) for l in lm]
        out.append((remapped, wl, torso_look(frame_bgr, remapped)))
    return out


def torso_look(frame_bgr, lm):
    """What this body LOOKS like, as a small colour signature over the torso.

    Owner, watching the falcon arrow capture: "deliver is a black guy wearing red shirt, receiver is
    white with no shirt, ur kind of swapping them out per frame". He was right. Position continuity
    alone cannot hold identity through a grapple -- the whole point of a suplex is that the two
    bodies occupy the same space, so "nearest hip to last frame's hip" picks the wrong man exactly
    when it matters most.

    MEASURED before the fix, redness (R - (G+B)/2) over the torso across the falcon arrow: track 0
    mean 35.1 spread -40..87, track 1 mean 41.9 spread -12..67. Two tracks with the SAME
    distribution, when a clean split would be one high (red shirt) and one low (bare skin). Both
    tracks were carrying both men.

    A mean BGR over the shoulder-to-hip box is enough here and costs nothing -- a red shirt and bare
    skin are far apart in colour. This is the appearance half of a standard appearance-plus-motion
    tracker; the learned-embedding version buys nothing when the two subjects are this distinct.
    """
    try:
        H, W = frame_bgr.shape[:2]
        xs = [lm[i].x * W for i in (11, 12, 23, 24)]
        ys = [lm[i].y * H for i in (11, 12, 23, 24)]
        x0, x1 = int(max(0, min(xs))), int(min(W, max(xs)))
        y0, y1 = int(max(0, min(ys))), int(min(H, max(ys)))
        if x1 - x0 < 4 or y1 - y0 < 4:
            return None
        import cv2 as _cv
        patch = frame_bgr[y0:y1, x0:x1]
        hsv = _cv.cvtColor(patch, _cv.COLOR_BGR2HSV)
        # hue x saturation histogram. A MEAN colour was not enough: measured on the falcon arrow it
        # separated the two men by 6.8 points of redness against a spread of 20, which is no
        # separation at all. A distribution survives motion blur and a torso box that catches some
        # background; a mean does not.
        h = _cv.calcHist([hsv], [0, 1], None, [12, 6], [0, 180, 0, 256])
        h = h.flatten()
        n = float(h.sum())
        return (h / n) if n > 0 else None
    except Exception:
        return None


class _LM(object):
    """A landmark in full-frame normalised coordinates. Cheaper than rebuilding a protobuf."""
    __slots__ = ('x', 'y', 'z', 'visibility')

    def __init__(self, x, y, z, v):
        self.x = x; self.y = y; self.z = z; self.visibility = v


def track(path, keep_frames=True, people=2):
    import cv2
    from mediapipe.tasks.python import vision

    pose = _mk(model_path(), vision.RunningMode.IMAGE)
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    raw, dets, worlds, looks = [], [], [], []
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        found = detect_people(fr, cv2.cvtColor(fr, cv2.COLOR_BGR2RGB), pose, limit=people)
        dets.append([p[0] for p in found])
        worlds.append([p[1] for p in found])
        looks.append([p[2] for p in found])
        raw.append(fr if keep_frames else None)
    cap.release()
    tracks, wtracks = assign(dets, worlds, slots=people, looks=looks)
    return fps, raw, tracks, wtracks


def assign(dets, worlds=None, slots=2, looks=None):
    """Give each detected body a STABLE identity across frames.

    MediaPipe returns the poses it found in each frame in no guaranteed order, so track 0 in frame 40
    is not necessarily the same wrestler as track 0 in frame 41. On a two-man capture that flips
    constantly, and welding the frames together in detection order produces a clip that is half one
    man and half the other. Identity comes from CONTINUITY instead: each new detection is matched to
    whichever existing track its hip is nearest to, greedily, and a hip that is nowhere near either
    track starts a new one rather than corrupting an old one.
    """
    tracks = [[] for _ in range(slots)]   # per slot: list of (frame_index, landmarks)
    wtracks = [[] for _ in range(slots)]
    last = [None] * slots
    # REFERENCE APPEARANCES, FIXED, taken from the first frame where every body is found and they are
    # cleanly apart. An exponential average drifts: the moment the tracker takes one wrong frame
    # during the entangled part of a throw, the average moves toward the other man and every later
    # frame is judged against a blend of both. A reference captured BEFORE contact does not move.
    ref = [None] * slots
    if looks:
        for fi0, lk0 in enumerate(looks):
            if len(lk0) < slots or any(x is None for x in lk0[:slots]):
                continue
            hp = [hip_xy(d) for d in dets[fi0][:slots]]
            if any(h is None for h in hp):
                continue
            if slots == 2 and float(np.linalg.norm(hp[0] - hp[1])) < 0.13:
                continue                      # too close together to be sure who is who
            ref = [lk0[i] for i in range(slots)]
            break
    for fi, ds in enumerate(dets):
        ws = worlds[fi] if worlds else [None] * len(ds)
        lks = looks[fi] if looks else [None] * len(ds)
        hips = [hip_xy(d) for d in ds]
        used = set()
        # existing tracks claim their nearest unclaimed detection first
        order = sorted(range(len(last)), key=lambda s: 0 if last[s] is not None else 1)
        for slot in order:
            if last[slot] is None:
                continue
            # COST = how far it moved + how different it looks. Position alone swaps the men
            # during a grapple; appearance alone drifts when the lighting changes mid-throw.
            # Together they hold through the entangled frames, which is where the mocap is decided.
            best, bd = None, 0.62
            for di, h in enumerate(hips):
                if di in used or h is None:
                    continue
                d = float(np.linalg.norm(h - last[slot]))
                if d > 0.34:
                    continue                       # nothing crosses that far in one frame
                cost = d
                if ref[slot] is not None and lks[di] is not None:
                    # Bhattacharyya-style distance between the two histograms: 0 identical, 1 apart
                    bc = float(np.sqrt(ref[slot] * lks[di]).sum())
                    cost += 1.25 * (1.0 - bc)
                if cost < bd:
                    bd, best = cost, di
            if best is not None:
                used.add(best)
                tracks[slot].append((fi, ds[best]))
                wtracks[slot].append((fi, ws[best] if best < len(ws) else None))
                last[slot] = hips[best]
                if ref[slot] is None and best < len(lks) and lks[best] is not None:
                    ref[slot] = lks[best]      # seed only; never updated, so it cannot drift
        # anything left over seeds an empty slot
        for di, h in enumerate(hips):
            if di in used or h is None:
                continue
            for slot in range(len(last)):
                if last[slot] is None:
                    used.add(di)
                    tracks[slot].append((fi, ds[di]))
                    wtracks[slot].append((fi, ws[di] if di < len(ws) else None))
                    last[slot] = h
                    if ref[slot] is None and di < len(lks) and lks[di] is not None:
                        ref[slot] = lks[di]
                    break
    return tracks, wtracks


def densify(track, n):
    """A track is sparse (the body is not found every frame). Expand to one slot per frame."""
    out = [None] * n
    for fi, p in track:
        if 0 <= fi < n:
            out[fi] = p
    return out


def role_of(tracks, n):
    """Which track is the ATTACKER and which is the RECEIVER.

    TWO SIGNALS, IN ORDER, because neither alone is right for every move:

      1. WHO IS ALREADY DOWN. Before a diving headbutt or a falcon arrow onto a grounded man, the
         receiver is flat on the mat and the attacker is on his feet. Comparing hip height over the
         opening fifth of the window settles those instantly.
      2. WHO GETS INVERTED. For a suplex or a driver both men start upright, so the receiver is the
         one whose head goes below his hips.

    Signal 2 alone gets DIVES WRONG, and that matters here: a man throwing himself horizontally at a
    prone opponent also puts his head below his hips, so inversion would label the diver the victim.
    Checking who was already down first removes that whole class of error.
    """
    stat = []
    for t in tracks:
        d = densify(t, n)
        inv, trav, prev, seen = -9.0, 0.0, None, 0
        early, late = [], []
        for i, p in enumerate(d):
            if not p:
                continue
            seen += 1
            hip = (p[23].y + p[24].y) / 2.0
            inv = max(inv, p[0].y - hip)
            if i < n * 0.2:
                early.append(hip)
            if i > n * 0.75:
                late.append(hip)
            h = hip_xy(p)
            if prev is not None:
                trav += float(np.linalg.norm(h - prev))
            prev = h
        stat.append(dict(inv=inv, trav=trav, seen=seen,
                         early=float(np.mean(early)) if early else None,
                         late=float(np.mean(late)) if late else None))
    if stat[0]['seen'] == 0 or stat[1]['seen'] == 0:
        return 0, 1, 'only one body tracked'
    # 1. already down at the start (image y grows downward, so a bigger hip y is lower in frame)
    e0, e1 = stat[0]['early'], stat[1]['early']
    if e0 is not None and e1 is not None and abs(e0 - e1) > 0.13:
        recv = 0 if e0 > e1 else 1
        return 1 - recv, recv, 'who was already down at the start'
    # 2. inversion
    if abs(stat[0]['inv'] - stat[1]['inv']) > 0.05:
        recv = 0 if stat[0]['inv'] > stat[1]['inv'] else 1
        return 1 - recv, recv, 'inversion (head below hip)'
    atk = 0 if stat[0]['trav'] > stat[1]['trav'] else 1
    return atk, 1 - atk, 'travel (who closed the distance)'


def hip_xy(p):
    if not p:
        return None
    return np.array([(p[23].x + p[24].x) / 2.0, (p[23].y + p[24].y) / 2.0])


def analyse(fps, poses):
    """Motion energy over one track, and the span the move actually lives in."""
    hips = [hip_xy(p) for p in poses]
    energy, prev = [], None
    for h in hips:
        if h is None or prev is None:
            energy.append(0.0)
            prev = h if h is not None else prev
            continue
        energy.append(float(np.linalg.norm(h - prev)))
        prev = h
    wr = []
    for p in poses:
        wr.append(0.0 if not p else abs(p[15].y - p[23].y) + abs(p[16].y - p[24].y))
    wr = np.array(wr)
    e = np.convolve(np.array(energy), np.ones(5) / 5.0, mode='same')
    g = np.abs(np.gradient(wr))
    score = e / (e.max() or 1) + 0.5 * (g / (g.max() or 1))
    thr = score.mean() + 0.55 * score.std()
    hot = np.where(score > thr)[0]
    if len(hot) < 3:
        lo, hi = 0, len(poses) - 1
    else:
        lo, hi = int(hot[0]), int(hot[-1])
    pad = int(fps * 0.35)
    lo = max(0, lo - pad); hi = min(len(poses) - 1, hi + pad)
    vis = float(np.mean([np.mean([l.visibility for l in p]) for p in poses if p] or [0]))
    return dict(window=(lo, hi), window_s=(round(lo / fps, 2), round(hi / fps, 2)),
                tracked=sum(1 for p in poses if p), total=len(poses), visibility=round(vis, 3))


def sheet(raw, atk, recv, info, out, n=8):
    """Both bodies drawn, in different colours, so the roles can be checked by eye."""
    import cv2
    lo, hi = info['window']
    picks = np.linspace(lo, hi, n).astype(int)
    tiles = []
    for idx in picks:
        fr = raw[idx].copy()
        h, w = fr.shape[:2]
        for p, col, tag in ((atk[idx], (0, 255, 120), 'ATK'), (recv[idx], (60, 120, 255), 'RECV')):
            if not p:
                continue
            for a, b in BONES:
                pa, pb = p[a], p[b]
                cv2.line(fr, (int(pa.x * w), int(pa.y * h)), (int(pb.x * w), int(pb.y * h)), col, 3)
            hp = hip_xy(p)
            cv2.putText(fr, tag, (int(hp[0] * w) - 20, int(hp[1] * h)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, col, 2)
        cv2.putText(fr, 'f%d' % idx, (10, 34), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)
        sc = 260.0 / fr.shape[1]
        tiles.append(cv2.resize(fr, (int(fr.shape[1] * sc), int(fr.shape[0] * sc))))
    hgt = max(t.shape[0] for t in tiles)
    tiles = [cv2.copyMakeBorder(t, 0, hgt - t.shape[0], 0, 0, cv2.BORDER_CONSTANT, value=(0, 0, 0))
             for t in tiles]
    rows = [np.hstack(tiles[i:i + 4]) for i in range(0, len(tiles), 4)]
    wmax = max(r.shape[1] for r in rows)
    rows = [cv2.copyMakeBorder(r, 0, 0, 0, wmax - r.shape[1], cv2.BORDER_CONSTANT, value=(0, 0, 0))
            for r in rows]
    cv2.imwrite(out, np.vstack(rows))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--out', default=None, help='contact sheet with BOTH skeletons drawn on')
    ap.add_argument('--window', action='store_true', help='print only the move window')
    a = ap.parse_args()

    fps, raw, tracks, _w = track(a.video)
    n = len(raw)
    ai, ri, why = role_of(tracks, n)
    atk, recv = densify(tracks[ai], n), densify(tracks[ri], n)
    info = analyse(fps, atk)
    rinfo = analyse(fps, recv)
    if a.window:
        print('%.2f %.2f' % info['window_s'])
        return
    print('%s' % os.path.basename(a.video))
    print('  bodies tracked   : attacker %d/%d frames (vis %.3f) · receiver %d/%d frames (vis %.3f)'
          % (info['tracked'], n, info['visibility'], rinfo['tracked'], n, rinfo['visibility']))
    print('  role assignment  : %s' % why)
    print('  move window      : %.2fs .. %.2fs  (frames %d..%d)'
          % (info['window_s'][0], info['window_s'][1], info['window'][0], info['window'][1]))
    if a.out:
        print('  sheet            : ' + sheet(raw, atk, recv, info, a.out))


if __name__ == '__main__':
    main()
