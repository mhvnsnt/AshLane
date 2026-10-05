import * as THREE from "three";

// Bone families the bank can bake onto. Likeness meshes were not imported.
// KayKit: hips, upperarm.l. Rigify: DEF-hips.
// Stripped Mixamo, measured from the generic mannequin: Hips, Spine2, LeftArm, LeftForeArm, LeftUpLeg.
// Colon Mixamo: mixamorig:Hips. Packed Mixamo: mixamorigHips.
// UE mannequin: pelvis, spine_01, upperarm_l. A body is picked by which of these names it actually has.
type Role = Record<string, number[][]>;
type BankClip = { dur: number; times: number[]; atk: Role; vic?: Role };
type Bank = { clips: Record<string, BankClip> };

const KAYKIT: Record<string, string> = {
  hips: "hips",
  spine: "spine",
  chest: "chest",
  head: "head",
  upperArmL: "upperarm.l",
  lowerArmL: "lowerarm.l",
  handL: "hand.l",
  upperArmR: "upperarm.r",
  lowerArmR: "lowerarm.r",
  handR: "hand.r",
  upperLegL: "upperleg.l",
  lowerLegL: "lowerleg.l",
  footL: "foot.l",
  upperLegR: "upperleg.r",
  lowerLegR: "lowerleg.r",
  footR: "foot.r",
};

const RIGIFY: Record<string, string> = {
  hips: "DEF-hips",
  spine: "DEF-spine001",
  chest: "DEF-spine003",
  head: "DEF-head",
  upperArmL: "DEF-upper_armL",
  lowerArmL: "DEF-forearmL",
  handL: "DEF-handL",
  upperArmR: "DEF-upper_armR",
  lowerArmR: "DEF-forearmR",
  handR: "DEF-handR",
  upperLegL: "DEF-thighL",
  lowerLegL: "DEF-shinL",
  footL: "DEF-footL",
  upperLegR: "DEF-thighR",
  lowerLegR: "DEF-shinR",
  footR: "DEF-footR",
};

const MIXAMO: Record<string, string> = {
  hips: "Hips",
  spine: "Spine",
  chest: "Spine2",
  head: "Head",
  upperArmL: "LeftArm",
  lowerArmL: "LeftForeArm",
  handL: "LeftHand",
  upperArmR: "RightArm",
  lowerArmR: "RightForeArm",
  handR: "RightHand",
  upperLegL: "LeftUpLeg",
  lowerLegL: "LeftLeg",
  footL: "LeftFoot",
  upperLegR: "RightUpLeg",
  lowerLegR: "RightLeg",
  footR: "RightFoot",
};

const MIXAMO_COLON: Record<string, string> = {
  hips: "mixamorig:Hips",
  spine: "mixamorig:Spine",
  chest: "mixamorig:Spine2",
  head: "mixamorig:Head",
  upperArmL: "mixamorig:LeftArm",
  lowerArmL: "mixamorig:LeftForeArm",
  handL: "mixamorig:LeftHand",
  upperArmR: "mixamorig:RightArm",
  lowerArmR: "mixamorig:RightForeArm",
  handR: "mixamorig:RightHand",
  upperLegL: "mixamorig:LeftUpLeg",
  lowerLegL: "mixamorig:LeftLeg",
  footL: "mixamorig:LeftFoot",
  upperLegR: "mixamorig:RightUpLeg",
  lowerLegR: "mixamorig:RightLeg",
  footR: "mixamorig:RightFoot",
};

const UE: Record<string, string> = {
  hips: "pelvis",
  spine: "spine_01",
  chest: "spine_03",
  head: "head",
  upperArmL: "upperarm_l",
  lowerArmL: "lowerarm_l",
  handL: "hand_l",
  upperArmR: "upperarm_r",
  lowerArmR: "lowerarm_r",
  handR: "hand_r",
  upperLegL: "thigh_l",
  lowerLegL: "calf_l",
  footL: "foot_l",
  upperLegR: "thigh_r",
  lowerLegR: "calf_r",
  footR: "foot_r",
};

const QUAT: Record<string, string> = {
  hips: "Hips",
  spine: "Abdomen",
  chest: "Torso",
  head: "Head",
  upperArmL: "UpperArmL",
  lowerArmL: "LowerArmL",
  handL: "FistL",
  upperArmR: "UpperArmR",
  lowerArmR: "LowerArmR",
  handR: "FistR",
  upperLegL: "UpperLegL",
  lowerLegL: "LowerLegL",
  footL: "FootL",
  upperLegR: "UpperLegR",
  lowerLegR: "LowerLegR",
  footR: "FootR",
};

function familyFor(rest: Map<string, THREE.Quaternion>) {
  if (rest.has("DEF-hips")) return RIGIFY;
  if (rest.has("hips") && rest.has("upperarm.l")) return KAYKIT;
  if (rest.has("mixamorig:Hips")) return MIXAMO_COLON;
  if (rest.has("mixamorigHips")) return { ...MIXAMO, hips: "mixamorigHips", spine: "mixamorigSpine", chest: "mixamorigSpine2", head: "mixamorigHead", upperArmL: "mixamorigLeftArm", lowerArmL: "mixamorigLeftForeArm", handL: "mixamorigLeftHand", upperArmR: "mixamorigRightArm", lowerArmR: "mixamorigRightForeArm", handR: "mixamorigRightHand", upperLegL: "mixamorigLeftUpLeg", lowerLegL: "mixamorigLeftLeg", footL: "mixamorigLeftFoot", upperLegR: "mixamorigRightUpLeg", lowerLegR: "mixamorigRightLeg", footR: "mixamorigRightFoot" };
  if (rest.has("Hips") && rest.has("LeftArm")) return MIXAMO;
  if (rest.has("UpperArmL") && rest.has("FistL")) return QUAT;
  if (rest.has("pelvis") && rest.has("spine_01")) return UE;
  return KAYKIT;
}

let bank: Bank | null = null;
const names = new Set<string>();

export function motionReady() {
  return bank !== null;
}

export function motionNames() {
  return names;
}

export function motionDur(id: string) {
  return bank?.clips[id]?.dur ?? 0;
}

export function loadMotionBank() {
  return fetch("/motion/bank.json")
    .then((res) => (res.ok ? res.json() : null))
    .then((data: Bank | null) => {
      bank = data;
      names.clear();
      if (!data) return;
      for (const id of Object.keys(data.clips)) {
        names.add(id);
        if (data.clips[id].vic) names.add(`${id}:vic`);
      }
    })
    .catch(() => {
      bank = null;
    });
}

export function bakeMotion(root: THREE.Object3D) {
  if (!bank) return [] as THREE.AnimationClip[];
  const rest = new Map<string, THREE.Quaternion>();
  root.traverse((obj) => {
    if (obj.name) rest.set(obj.name, obj.quaternion.clone());
  });
  const map = familyFor(rest);
  const clips: THREE.AnimationClip[] = [];
  for (const [id, clip] of Object.entries(bank.clips)) {
    const atk = bakeRole(id, clip.times, clip.atk, map, rest);
    if (atk) clips.push(atk);
    if (clip.vic) {
      const vic = bakeRole(`${id}:vic`, clip.times, clip.vic, map, rest);
      if (vic) clips.push(vic);
    }
  }
  return clips;
}

function bakeRole(name: string, times: number[], role: Role, map: Record<string, string>, rest: Map<string, THREE.Quaternion>) {
  const tracks: THREE.QuaternionKeyframeTrack[] = [];
  for (const [slot, keys] of Object.entries(role)) {
    const bone = map[slot];
    const q0 = bone ? rest.get(bone) : undefined;
    if (!bone || !q0 || keys.length !== times.length) continue;
    const values: number[] = [];
    const q = new THREE.Quaternion();
    const out = new THREE.Quaternion();
    for (const key of keys) {
      q.set(key[0], key[1], key[2], key[3]);
      out.copy(q0).multiply(q);
      values.push(out.x, out.y, out.z, out.w);
    }
    tracks.push(new THREE.QuaternionKeyframeTrack(`${bone}.quaternion`, times, values));
  }
  if (tracks.length === 0) return null;
  return new THREE.AnimationClip(name, times[times.length - 1] ?? 1, tracks);
}

const UAL_BONE: Record<string, string> = {
  "DEF-hips": "mixamorigHips",
  "DEF-spine001": "mixamorigSpine",
  "DEF-spine002": "mixamorigSpine1",
  "DEF-spine003": "mixamorigSpine2",
  "DEF-neck": "mixamorigNeck",
  "DEF-head": "mixamorigHead",
  "DEF-shoulderL": "mixamorigLeftShoulder",
  "DEF-upper_armL": "mixamorigLeftArm",
  "DEF-forearmL": "mixamorigLeftForeArm",
  "DEF-handL": "mixamorigLeftHand",
  "DEF-thighL": "mixamorigLeftUpLeg",
  "DEF-shinL": "mixamorigLeftLeg",
  "DEF-footL": "mixamorigLeftFoot",
  "DEF-toeL": "mixamorigLeftToeBase",
  "DEF-shoulderR": "mixamorigRightShoulder",
  "DEF-upper_armR": "mixamorigRightArm",
  "DEF-forearmR": "mixamorigRightForeArm",
  "DEF-handR": "mixamorigRightHand",
  "DEF-thighR": "mixamorigRightUpLeg",
  "DEF-shinR": "mixamorigRightLeg",
  "DEF-footR": "mixamorigRightFoot",
  "DEF-toeR": "mixamorigRightToeBase",
};


// Quaternius 65-joint rig (Unreal-style names) -> packed Mixamo (mixamorigHips).
// The UAL1_Standard / UAL2_Standard clips ship ON the Quaternius rig, so the UAL
// retarget below needs this map to land those clips on Mixamo-rigged cast.
// Full 65 -> 58 mapping (see docs/QUATERNIUS.md):
//   root -> DROP (Mixamo has no root joint)
//   pelvis -> Hips | spine_01 -> Spine | spine_02 -> Spine1 | spine_03 -> Spine2
//   neck_01 -> Neck | Head -> Head
//   clavicle_l/r -> LeftShoulder/RightShoulder
//   upperarm_l/r -> LeftArm/RightArm | lowerarm_l/r -> LeftForeArm/RightForeArm
//   hand_l/r -> LeftHand/RightHand
//   thumb/index/middle/ring/pinky _01/_02/_03 _l/_r -> LeftHand<Digit>1/2/3 etc.
//     (Mixamo's 4th finger segments have no Quaternius source — left unmapped)
//   *_04_leaf_* (10 finger-tip end-effectors) -> DROP (Mixamo ends at digit 3)
//   thigh_l/r -> LeftUpLeg/RightUpLeg | calf_l/r -> LeftLeg/RightLeg
//   foot_l/r -> LeftFoot/RightFoot | ball_l/r -> LeftToeBase/RightToeBase
//   ball_leaf_l/r -> DROP (end-effectors)
// NOTE: the bank-bake path (familyFor) already covers Quaternius bodies through
// the UE family — `pelvis`/`spine_01`/`upperarm_l` naming is identical.
const QUATERNIUS_UAL_BONE: Record<string, string> = {
  "pelvis": "mixamorigHips",
  "spine_01": "mixamorigSpine",
  "spine_02": "mixamorigSpine1",
  "spine_03": "mixamorigSpine2",
  "neck_01": "mixamorigNeck",
  "Head": "mixamorigHead",
  "clavicle_l": "mixamorigLeftShoulder",
  "clavicle_r": "mixamorigRightShoulder",
  "upperarm_l": "mixamorigLeftArm",
  "upperarm_r": "mixamorigRightArm",
  "lowerarm_l": "mixamorigLeftForeArm",
  "lowerarm_r": "mixamorigRightForeArm",
  "hand_l": "mixamorigLeftHand",
  "hand_r": "mixamorigRightHand",
  "thigh_l": "mixamorigLeftUpLeg",
  "thigh_r": "mixamorigRightUpLeg",
  "calf_l": "mixamorigLeftLeg",
  "calf_r": "mixamorigRightLeg",
  "foot_l": "mixamorigLeftFoot",
  "foot_r": "mixamorigRightFoot",
  "ball_l": "mixamorigLeftToeBase",
  "ball_r": "mixamorigRightToeBase",
  "thumb_01_l": "mixamorigLeftHandThumb1",
  "thumb_02_l": "mixamorigLeftHandThumb2",
  "thumb_03_l": "mixamorigLeftHandThumb3",
  "thumb_01_r": "mixamorigRightHandThumb1",
  "thumb_02_r": "mixamorigRightHandThumb2",
  "thumb_03_r": "mixamorigRightHandThumb3",
  "index_01_l": "mixamorigLeftHandIndex1",
  "index_02_l": "mixamorigLeftHandIndex2",
  "index_03_l": "mixamorigLeftHandIndex3",
  "index_01_r": "mixamorigRightHandIndex1",
  "index_02_r": "mixamorigRightHandIndex2",
  "index_03_r": "mixamorigRightHandIndex3",
  "middle_01_l": "mixamorigLeftHandMiddle1",
  "middle_02_l": "mixamorigLeftHandMiddle2",
  "middle_03_l": "mixamorigLeftHandMiddle3",
  "middle_01_r": "mixamorigRightHandMiddle1",
  "middle_02_r": "mixamorigRightHandMiddle2",
  "middle_03_r": "mixamorigRightHandMiddle3",
  "ring_01_l": "mixamorigLeftHandRing1",
  "ring_02_l": "mixamorigLeftHandRing2",
  "ring_03_l": "mixamorigLeftHandRing3",
  "ring_01_r": "mixamorigRightHandRing1",
  "ring_02_r": "mixamorigRightHandRing2",
  "ring_03_r": "mixamorigRightHandRing3",
  "pinky_01_l": "mixamorigLeftHandPinky1",
  "pinky_02_l": "mixamorigLeftHandPinky2",
  "pinky_03_l": "mixamorigLeftHandPinky3",
  "pinky_01_r": "mixamorigRightHandPinky1",
  "pinky_02_r": "mixamorigRightHandPinky2",
  "pinky_03_r": "mixamorigRightHandPinky3",
};

let ualRoot: THREE.Object3D | null = null;
let ualClips: THREE.AnimationClip[] = [];

export function setUal(root: THREE.Object3D, clips: THREE.AnimationClip[]) {
  ualRoot = root;
  ualClips = clips;
}

export function retargetUal(target: THREE.Object3D) {
  if (!ualRoot || ualClips.length === 0) return [] as THREE.AnimationClip[];
  const sourceRest = new Map<string, THREE.Quaternion>();
  ualRoot.traverse((obj) => {
    if (obj.name) sourceRest.set(obj.name, obj.quaternion.clone());
  });
  const targetRest = new Map<string, THREE.Quaternion>();
  target.traverse((obj) => {
    if (obj.name) targetRest.set(obj.name, obj.quaternion.clone());
  });
  const out: THREE.AnimationClip[] = [];
  for (const clip of ualClips) {
    if (clip.name === "A_TPose") continue;
    const tracks: THREE.QuaternionKeyframeTrack[] = [];
    for (const track of clip.tracks) {
      if (!track.name.endsWith(".quaternion")) continue;
      const bone = track.name.slice(0, -".quaternion".length);
      const dest = UAL_BONE[bone] ?? QUATERNIUS_UAL_BONE[bone];
      const qS = sourceRest.get(bone);
      const qT = dest ? targetRest.get(dest) : undefined;
      if (!dest || !qS || !qT) continue;
      const count = track.times.length;
      const next = new Float32Array(count * 4);
      const key = new THREE.Quaternion();
      const rel = new THREE.Quaternion();
      const inv = qS.clone().invert();
      const written = new THREE.Quaternion();
      for (let i = 0; i < count; i++) {
        key.fromArray(track.values, i * 4);
        rel.copy(inv).multiply(key);
        written.copy(qT).multiply(rel);
        written.toArray(next, i * 4);
      }
      tracks.push(new THREE.QuaternionKeyframeTrack(`${dest}.quaternion`, Array.from(track.times), Array.from(next)));
    }
    if (tracks.length) out.push(new THREE.AnimationClip(clip.name, clip.duration, tracks));
  }
  return out;
}
