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
  "DEF-hips": "mixamorig:Hips",
  "DEF-spine.001": "mixamorig:Spine",
  "DEF-spine.002": "mixamorig:Spine1",
  "DEF-spine.003": "mixamorig:Spine2",
  "DEF-neck": "mixamorig:Neck",
  "DEF-head": "mixamorig:Head",
  "DEF-shoulder.L": "mixamorig:LeftShoulder",
  "DEF-upper_arm.L": "mixamorig:LeftArm",
  "DEF-forearm.L": "mixamorig:LeftForeArm",
  "DEF-hand.L": "mixamorig:LeftHand",
  "DEF-thigh.L": "mixamorig:LeftUpLeg",
  "DEF-shin.L": "mixamorig:LeftLeg",
  "DEF-foot.L": "mixamorig:LeftFoot",
  "DEF-toe.L": "mixamorig:LeftToeBase",
  "DEF-shoulder.R": "mixamorig:RightShoulder",
  "DEF-upper_arm.R": "mixamorig:RightArm",
  "DEF-forearm.R": "mixamorig:RightForeArm",
  "DEF-hand.R": "mixamorig:RightHand",
  "DEF-thigh.R": "mixamorig:RightUpLeg",
  "DEF-shin.R": "mixamorig:RightLeg",
  "DEF-foot.R": "mixamorig:RightFoot",
  "DEF-toe.R": "mixamorig:RightToeBase",
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
      const dest = UAL_BONE[bone];
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
