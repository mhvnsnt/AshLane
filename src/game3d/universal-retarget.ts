/**
 * Universal skeleton retargeter for AshLane.
 *
 * Goal: drop ANY animation in, it plays on ANY model. No manual per-clip work.
 *
 * How it works:
 *  1. Every supported skeleton family maps to CANONICAL slots (Mixamo stripped
 *     names, e.g. "Hips", "LeftArm"). N families need 2N maps, not N^2.
 *  2. Source family is auto-detected from bone names (+ joint count as a hint).
 *  3. Target family is auto-detected from the live THREE.Object3D.
 *  4. Rotation transfer is rest-pose-relative:
 *        out = targetRest * inv(sourceRest) * key
 *     so clips authored on one rest pose land correctly on another.
 *  5. BVH text can be parsed straight to a THREE.AnimationClip, then retargeted.
 *
 * Families: mixamo-colon (AshLane cast, 58j), mixamo-packed, mixamo-stripped,
 *           quaternius (65j UE-style), rigify, kaykit, bannon-pos (positional).
 */
import * as THREE from "three";

export type SkeletonFamily =
  | "mixamo-colon"
  | "mixamo-packed"
  | "mixamo-stripped"
  | "quaternius"
  | "rigify"
  | "kaykit"
  | "bannon-pos"
  | "unknown";

/** Canonical slots — Mixamo stripped names. */
export const CANONICAL_SLOTS = [
  "Hips", "Spine", "Spine1", "Spine2", "Neck", "Head", "HeadTop_End",
  "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand",
  "LeftHandThumb1", "LeftHandThumb2", "LeftHandThumb3",
  "LeftHandIndex1", "LeftHandIndex2", "LeftHandIndex3",
  "LeftHandMiddle1", "LeftHandMiddle2", "LeftHandMiddle3",
  "LeftHandRing1", "LeftHandRing2", "LeftHandRing3",
  "LeftHandPinky1", "LeftHandPinky2", "LeftHandPinky3",
  "RightShoulder", "RightArm", "RightForeArm", "RightHand",
  "RightHandThumb1", "RightHandThumb2", "RightHandThumb3",
  "RightHandIndex1", "RightHandIndex2", "RightHandIndex3",
  "RightHandMiddle1", "RightHandMiddle2", "RightHandMiddle3",
  "RightHandRing1", "RightHandRing2", "RightHandRing3",
  "RightHandPinky1", "RightHandPinky2", "RightHandPinky3",
  "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase", "LeftToe_End",
  "RightUpLeg", "RightLeg", "RightFoot", "RightToeBase", "RightToe_End",
] as const;

/**
 * Family bone name -> canonical slot. Families handled by prefix-strip rules
 * (mixamo-colon / mixamo-packed / mixamo-stripped) need no table.
 */
const FAMILY_TO_CANONICAL: Partial<Record<SkeletonFamily, Record<string, string>>> = {
  // Quaternius 65-joint (Unreal-style). From tools/animation/retarget/retarget.py.
  quaternius: {
    pelvis: "Hips", spine_01: "Spine", spine_02: "Spine1", spine_03: "Spine2",
    neck_01: "Neck", Head: "Head",
    clavicle_l: "LeftShoulder", clavicle_r: "RightShoulder",
    upperarm_l: "LeftArm", upperarm_r: "RightArm",
    lowerarm_l: "LeftForeArm", lowerarm_r: "RightForeArm",
    hand_l: "LeftHand", hand_r: "RightHand",
    thumb_01_l: "LeftHandThumb1", thumb_02_l: "LeftHandThumb2", thumb_03_l: "LeftHandThumb3",
    thumb_01_r: "RightHandThumb1", thumb_02_r: "RightHandThumb2", thumb_03_r: "RightHandThumb3",
    index_01_l: "LeftHandIndex1", index_02_l: "LeftHandIndex2", index_03_l: "LeftHandIndex3",
    index_01_r: "RightHandIndex1", index_02_r: "RightHandIndex2", index_03_r: "RightHandIndex3",
    middle_01_l: "LeftHandMiddle1", middle_02_l: "LeftHandMiddle2", middle_03_l: "LeftHandMiddle3",
    middle_01_r: "RightHandMiddle1", middle_02_r: "RightHandMiddle2", middle_03_r: "RightHandMiddle3",
    ring_01_l: "LeftHandRing1", ring_02_l: "LeftHandRing2", ring_03_l: "LeftHandRing3",
    ring_01_r: "RightHandRing1", ring_02_r: "RightHandRing2", ring_03_r: "RightHandRing3",
    pinky_01_l: "LeftHandPinky1", pinky_02_l: "LeftHandPinky2", pinky_03_l: "LeftHandPinky3",
    pinky_01_r: "RightHandPinky1", pinky_02_r: "RightHandPinky2", pinky_03_r: "RightHandPinky3",
    thigh_l: "LeftUpLeg", thigh_r: "RightUpLeg",
    calf_l: "LeftLeg", calf_r: "RightLeg",
    foot_l: "LeftFoot", foot_r: "RightFoot",
    ball_l: "LeftToeBase", ball_r: "RightToeBase",
    // root, *_04_leaf_*, ball_leaf_* -> no canonical slot (dropped)
  },
  rigify: {
    "DEF-hips": "Hips", "DEF-spine": "Spine", "DEF-spine001": "Spine1",
    "DEF-spine002": "Spine2", "DEF-spine003": "Spine2", "DEF-neck": "Neck",
    "DEF-head": "Head",
    "DEF-shoulderL": "LeftShoulder", "DEF-shoulderR": "RightShoulder",
    "DEF-upper_armL": "LeftArm", "DEF-upper_armR": "RightArm",
    "DEF-forearmL": "LeftForeArm", "DEF-forearmR": "RightForeArm",
    "DEF-handL": "LeftHand", "DEF-handR": "RightHand",
    "DEF-thighL": "LeftUpLeg", "DEF-thighR": "RightUpLeg",
    "DEF-shinL": "LeftLeg", "DEF-shinR": "RightLeg",
    "DEF-footL": "LeftFoot", "DEF-footR": "RightFoot",
    "DEF-toeL": "LeftToeBase", "DEF-toeR": "RightToeBase",
  },
  kaykit: {
    hips: "Hips", spine: "Spine", chest: "Spine2", head: "Head",
    "upperarm.l": "LeftArm", "upperarm.r": "RightArm",
    "lowerarm.l": "LeftForeArm", "lowerarm.r": "RightForeArm",
    "hand.l": "LeftHand", "hand.r": "RightHand",
    "upperleg.l": "LeftUpLeg", "upperleg.r": "RightUpLeg",
    "lowerleg.l": "LeftLeg", "lowerleg.r": "RightLeg",
    "foot.l": "LeftFoot", "foot.r": "RightFoot",
  },
  // Bannon's procedural JSON clips: positional keyframes, abbreviated names.
  // NOTE: these carry positions, not rotations — the retargeter maps the bone
  // names; rotation synthesis from positions needs an IK pass (not here).
  "bannon-pos": {
    pelvis: "Hips", spineLow: "Spine", spineMid: "Spine1", chest: "Spine2",
    neck: "Neck", head: "Head",
    clavL: "LeftShoulder", clavR: "RightShoulder",
    shL: "LeftArm", shR: "RightArm",
    elL: "LeftForeArm", elR: "RightForeArm",
    haL: "LeftHand", haR: "RightHand",
    hipL: "LeftUpLeg", hipR: "RightUpLeg",
    knL: "LeftLeg", knR: "RightLeg",
    ftL: "LeftFoot", ftR: "RightFoot",
  },
};

/** Canonical slot -> family bone name, built lazily per family. */
const canonicalToFamilyCache = new Map<SkeletonFamily, Map<string, string>>();

function reverseMap(family: SkeletonFamily): Map<string, string> {
  let m = canonicalToFamilyCache.get(family);
  if (m) return m;
  m = new Map<string, string>();
  const fwd = FAMILY_TO_CANONICAL[family];
  if (fwd) for (const [bone, slot] of Object.entries(fwd)) {
    if (!m.has(slot)) m.set(slot, bone);
  }
  canonicalToFamilyCache.set(family, m);
  return m;
}

/** Auto-detect the skeleton family from a set of bone names. */
export function detectFamily(boneNames: Iterable<string>): SkeletonFamily {
  const names = new Set(boneNames);
  const has = (...ns: string[]) => ns.some((n) => names.has(n));
  if (has("mixamorig:Hips")) return "mixamo-colon";
  if (has("mixamorigHips")) return "mixamo-packed";
  // Bannon positional format has abbreviated limb names alongside pelvis.
  if (has("shL", "haL", "elL") && has("pelvis")) return "bannon-pos";
  if (has("DEF-hips")) return "rigify";
  if (has("hips") && has("upperarm.l")) return "kaykit";
  // Quaternius / UE-style: pelvis + spine_01 + limb names.
  if (has("pelvis", "spine_01") && has("upperarm_l", "thigh_l")) return "quaternius";
  if (has("Hips") && has("LeftArm", "RightUpLeg")) return "mixamo-stripped";
  // Sparse Mixamo exports (BVH conversions, mocap clips): Hips + Spine is enough.
  if (has("Hips") && has("Spine", "Spine1")) return "mixamo-stripped";
  return "unknown";
}

/** Map one bone name to its canonical slot (or undefined if unmapped). */
export function toCanonical(boneName: string, family: SkeletonFamily): string | undefined {
  switch (family) {
    case "mixamo-colon":
      return boneName.startsWith("mixamorig:") ? boneName.slice("mixamorig:".length) : undefined;
    case "mixamo-packed":
      return boneName.startsWith("mixamorig") ? boneName.slice("mixamorig".length) : undefined;
    case "mixamo-stripped":
      return (CANONICAL_SLOTS as readonly string[]).includes(boneName) ? boneName : undefined;
    default: {
      const table = FAMILY_TO_CANONICAL[family];
      return table?.[boneName];
    }
  }
}

/** Map a canonical slot to the target family's bone name (or undefined). */
export function fromCanonical(slot: string, family: SkeletonFamily): string | undefined {
  switch (family) {
    case "mixamo-colon":
      return `mixamorig:${slot}`;
    case "mixamo-packed":
      return `mixamorig${slot}`;
    case "mixamo-stripped":
      return slot;
    default:
      return reverseMap(family).get(slot);
  }
}

export interface RetargetOptions {
  /** Scale applied to root/hips position tracks (unit mismatch, e.g. cm->m). */
  positionScale?: number;
  /** Keep the source clip name (default true). */
  keepName?: boolean;
}

function collectRest(root: THREE.Object3D) {
  const quats = new Map<string, THREE.Quaternion>();
  const names: string[] = [];
  root.traverse((obj) => {
    if (obj.name) {
      names.push(obj.name);
      quats.set(obj.name, obj.quaternion.clone());
    }
  });
  return { quats, names, family: detectFamily(names) };
}

/**
 * Retarget any THREE.AnimationClip onto any THREE.Object3D skeleton.
 * Returns null when nothing could be mapped.
 */
export function retargetClip(
  clip: THREE.AnimationClip,
  sourceRest: Map<string, THREE.Quaternion>,
  sourceBoneNames: Iterable<string>,
  target: THREE.Object3D,
  opts: RetargetOptions = {},
): THREE.AnimationClip | null {
  const sourceFamily = detectFamily(sourceBoneNames);
  if (sourceFamily === "unknown") return null;
  const { quats: targetRest, names: targetNames } = collectRest(target);
  const targetSet = new Set(targetNames);
  const targetFamily = detectFamily(targetNames);
  if (targetFamily === "unknown") return null;

  const posScale = opts.positionScale ?? 1;
  const outTracks: THREE.KeyframeTrack[] = [];
  const tmpQ = new THREE.Quaternion();
  const tmpRel = new THREE.Quaternion();
  const tmpOut = new THREE.Quaternion();

  // Same family on both ends: prefer direct bone-name matches first. This
  // preserves bones with no canonical slot (root, finger/toe leaves) while
  // still applying rest-relative math for differing rest poses.
  const sameFamily = sourceFamily === targetFamily;

  for (const track of clip.tracks) {
    const dot = track.name.lastIndexOf(".");
    if (dot < 0) continue;
    const boneName = track.name.slice(0, dot);
    const prop = track.name.slice(dot + 1); // quaternion | position | scale

    let destBone: string | undefined;
    let slot: string | undefined;
    if (sameFamily && targetSet.has(boneName)) {
      destBone = boneName;
      slot = toCanonical(boneName, sourceFamily); // may be undefined for root/leaves
    } else {
      slot = toCanonical(boneName, sourceFamily);
      if (!slot) continue;
      destBone = fromCanonical(slot, targetFamily);
      if (!destBone || !targetSet.has(destBone)) continue;
    }

    if (prop === "quaternion" && track instanceof THREE.QuaternionKeyframeTrack) {
      const qS = sourceRest.get(boneName);
      const qT = targetRest.get(destBone);
      if (!qS || !qT) continue;
      const inv = qS.clone().invert();
      const count = track.times.length;
      const next = new Float32Array(count * 4);
      for (let i = 0; i < count; i++) {
        tmpQ.fromArray(track.values as ArrayLike<number>, i * 4);
        tmpRel.copy(inv).multiply(tmpQ); // source-local delta
        tmpOut.copy(qT).multiply(tmpRel); // onto target rest
        tmpOut.toArray(next, i * 4);
      }
      outTracks.push(
        new THREE.QuaternionKeyframeTrack(`${destBone}.quaternion`, Array.from(track.times), Array.from(next)),
      );
    } else if (prop === "position" && track instanceof THREE.VectorKeyframeTrack) {
      // Only the root/hips position is meaningful across skeletons; scale it.
      if (slot !== "Hips") continue;
      const count = track.times.length;
      const next = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        next[i * 3] = (track.values as ArrayLike<number>)[i * 3] * posScale;
        next[i * 3 + 1] = (track.values as ArrayLike<number>)[i * 3 + 1] * posScale;
        next[i * 3 + 2] = (track.values as ArrayLike<number>)[i * 3 + 2] * posScale;
      }
      outTracks.push(
        new THREE.VectorKeyframeTrack(`${destBone}.position`, Array.from(track.times), Array.from(next)),
      );
    }
    // scale tracks: skipped — not used by any AshLane source.
  }

  if (outTracks.length === 0) return null;
  return new THREE.AnimationClip(
    opts.keepName === false ? `${clip.name}@retarget` : clip.name,
    clip.duration,
    outTracks,
  );
}

/** Convenience: does this clip plausibly play on this target? (0..1 bone coverage) */
export function coverage(
  clipBoneNames: Iterable<string>,
  sourceFamily: SkeletonFamily,
  targetBoneNames: Iterable<string>,
): { mapped: number; total: number; ratio: number } {
  const targetSet = new Set(targetBoneNames);
  const targetFamily = detectFamily(targetBoneNames);
  let mapped = 0;
  let total = 0;
  for (const b of clipBoneNames) {
    total++;
    const slot = toCanonical(b, sourceFamily);
    const dest = slot && targetFamily !== "unknown" ? fromCanonical(slot, targetFamily) : undefined;
    if (dest && targetSet.has(dest)) mapped++;
  }
  return { mapped, total, ratio: total ? mapped / total : 0 };
}

// ---------------------------------------------------------------------------
// BVH parsing: BVH text -> THREE.AnimationClip (then feed to retargetClip).
// ---------------------------------------------------------------------------

interface BvhJoint {
  name: string;
  offset: [number, number, number];
  channels: string[];
  children: BvhJoint[];
}

/** Parse BVH text. Returns clip + the bone names as they appear in the file. */
export function parseBVH(text: string): { clip: THREE.AnimationClip; boneNames: string[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  let i = 0;
  if (!/^HIERARCHY/i.test(lines[i])) throw new Error("BVH: missing HIERARCHY");
  i++;

  function parseJoint(): BvhJoint {
    const head = lines[i++].split(/\s+/); // ROOT name | JOINT name | End Site
    let name: string;
    if (/^end/i.test(head[0])) {
      name = `${(parseJoint as unknown as { parent?: string }).parent ?? "joint"}_End`;
      // consume "{", OFFSET, "}"
      i++; // {
      const off = lines[i++].split(/\s+/).slice(1).map(Number);
      i++; // }
      return { name, offset: [off[0], off[1], off[2]], channels: [], children: [] };
    }
    name = head[1];
    (parseJoint as unknown as { parent?: string }).parent = name;
    i++; // {
    const off = lines[i++].split(/\s+/).slice(1).map(Number);
    const chTokens = lines[i++].split(/\s+/);
    const nCh = parseInt(chTokens[1], 10);
    const channels = chTokens.slice(2, 2 + nCh);
    const children: BvhJoint[] = [];
    while (!/^\}/.test(lines[i])) children.push(parseJoint());
    i++; // }
    return { name, offset: [off[0], off[1], off[2]], channels, children };
  }

  const roots: BvhJoint[] = [];
  while (i < lines.length && !/^MOTION/i.test(lines[i])) {
    if (/^(ROOT|JOINT)/i.test(lines[i])) roots.push(parseJoint());
    else i++;
  }
  if (!/^MOTION/i.test(lines[i])) throw new Error("BVH: missing MOTION");
  i++;
  const frames = parseInt(lines[i++].split(":")[1].trim(), 10);
  const frameTime = parseFloat(lines[i++].split(":")[2]?.trim() ?? lines[i - 1].split(/\s+/).pop()!);

  // Flatten joints in channel order.
  const ordered: { joint: BvhJoint; channelStart: number }[] = [];
  const boneNames: string[] = [];
  let cursor = 0;
  (function walk(j: BvhJoint) {
    ordered.push({ joint: j, channelStart: cursor });
    boneNames.push(j.name);
    cursor += j.channels.length;
    for (const c of j.children) walk(c);
  })(roots[0]);

  const dt = Number.isFinite(frameTime) && frameTime > 0 ? frameTime : 1 / 30;
  const times: number[] = [];
  const quatTracks = new Map<string, number[]>();
  const posTracks = new Map<string, number[]>();

  for (let f = 0; f < frames && i < lines.length; f++, i++) {
    const vals = lines[i].split(/\s+/).map(Number);
    times.push(f * dt);
    for (const { joint, channelStart } of ordered) {
      const ch = joint.channels;
      if (ch.length === 0) continue;
      let px = 0, py = 0, pz = 0;
      const eulers: { axis: string; v: number }[] = [];
      for (let c = 0; c < ch.length; c++) {
        const v = vals[channelStart + c];
        const t = ch[c].toLowerCase();
        if (t === "xposition") px = v;
        else if (t === "yposition") py = v;
        else if (t === "zposition") pz = v;
        else if (t === "xrotation") eulers.push({ axis: "X", v });
        else if (t === "yrotation") eulers.push({ axis: "Y", v });
        else if (t === "zrotation") eulers.push({ axis: "Z", v });
      }
      if (ch.some((c) => /position/i.test(c))) {
        if (!posTracks.has(joint.name)) posTracks.set(joint.name, []);
        const arr = posTracks.get(joint.name)!;
        arr.push(px, py, pz);
      }
      if (eulers.length > 0) {
        // BVH applies rotations in channel order; three.js Euler order string
        // composes q = q_first * q_second * q_third, which matches.
        const order = eulers.map((e) => e.axis).join("") as "XYZ";
        const e = new THREE.Euler(0, 0, 0, order);
        for (const { axis, v } of eulers) {
          const rad = (v * Math.PI) / 180;
          if (axis === "X") e.x = rad;
          else if (axis === "Y") e.y = rad;
          else e.z = rad;
        }
        const q = new THREE.Quaternion().setFromEuler(e);
        if (!quatTracks.has(joint.name)) quatTracks.set(joint.name, []);
        const arr = quatTracks.get(joint.name)!;
        arr.push(q.x, q.y, q.z, q.w);
      }
    }
  }

  const tracks: THREE.KeyframeTrack[] = [];
  for (const [name, vals] of quatTracks) {
    tracks.push(new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, times.slice(), vals));
  }
  for (const [name, vals] of posTracks) {
    tracks.push(new THREE.VectorKeyframeTrack(`${name}.position`, times.slice(), vals));
  }
  const clip = new THREE.AnimationClip("bvh_clip", frames * dt, tracks);
  return { clip, boneNames };
}
